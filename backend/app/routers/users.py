import csv
import io
import secrets
import string
from fastapi import APIRouter, Depends, UploadFile, File, Form, Query, HTTPException
from sqlalchemy.orm import Session
from app.dependencies import get_db, get_current_user
from app.models.user import User, UserRole, UserGender
from app.models.enrollment import Enrollment
from app.models.class_ import Class
from app.schemas.user import UserCreate, UserRead, UserUpdate, ProfileUpdate
from app.services import user_service
from app.core.security import hash_password
from app.core.permissions import require_roles
from app.core.exceptions import ForbiddenError
from app.services.audit_service import log_action, format_detail_bulk

router = APIRouter(prefix="/users", tags=["users"])

admin_only = Depends(require_roles(UserRole.admin))


@router.get("/", response_model=list[UserRead], dependencies=[admin_only])
def list_users(skip: int = 0, limit: int = 1000, db: Session = Depends(get_db)):
    return user_service.get_users(db, skip, limit)


@router.post("/", response_model=UserRead, dependencies=[admin_only])
def create_user(
    data: UserCreate,
    enrollment_class_id: int | None = Query(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    user = user_service.create_user(db, data)
    if data.role == UserRole.student and enrollment_class_id is not None:
        cls = db.query(Class).filter(Class.id == enrollment_class_id).first()
        if not cls:
            raise HTTPException(status_code=404, detail=f"Class {enrollment_class_id} not found")
        db.add(Enrollment(student_id=user.id, class_id=cls.id))
    log_action(db, current_user.id, "created", "user", user.id, f"Created {data.role.value}: {data.full_name}")
    db.commit()
    return user


@router.get("/me", response_model=UserRead)
def get_me(current_user: User = Depends(get_current_user)):
    return current_user


@router.put("/me", response_model=UserRead)
def update_me(
    data: ProfileUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Users can update their own name or password.
    Only admins may change their email address."""
    if data.email is not None and current_user.role != UserRole.admin:
        raise ForbiddenError("Email addresses are managed by the administrator.")
    user = user_service.update_user(db, current_user.id, data)
    if data.password and user.must_change_password:
        user.must_change_password = False
        db.commit()
        db.refresh(user)
    return user


@router.get("/{user_id}", response_model=UserRead, dependencies=[admin_only])
def get_user(user_id: int, db: Session = Depends(get_db)):
    return user_service.get_user(db, user_id)


@router.put("/{user_id}", response_model=UserRead, dependencies=[admin_only])
def update_user(user_id: int, data: UserUpdate, db: Session = Depends(get_db)):
    return user_service.update_user(db, user_id, data)


@router.post("/import", dependencies=[admin_only])
async def import_users_csv(
    file: UploadFile = File(...),
    role: UserRole = Form(UserRole.student),
    academic_year: str = Form("2025-2026"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Bulk import users from a CSV file.

    Expected CSV columns: ``full_name, class_name`` (required), ``gender`` (optional).
    For students, ``class_name`` is used to auto-enroll. Teachers ignore it.
    ``gender`` accepts: male, female, other (case-insensitive).

    Emails are auto-generated:
    - Student: ``{year}{seq:03d}{lastname}@srmk.edu.kh``
    - Teacher: ``firstname.lastname@srmk.edu.kh``

    Returns a summary with created/skipped rows and generated credentials.
    """
    content = await file.read()
    text = content.decode("utf-8-sig")
    reader = csv.DictReader(io.StringIO(text))

    # Normalise header names
    if reader.fieldnames is None:
        return {"created": 0, "skipped": 0, "errors": ["CSV file is empty or has no header row."]}
    reader.fieldnames = [h.strip().lower().replace(" ", "_") for h in reader.fieldnames]

    if "full_name" not in reader.fieldnames:
        return {"created": 0, "skipped": 0, "errors": ["CSV must have a 'full_name' column."]}

    # Pre-load class lookup
    classes_by_name: dict[str, Class] = {}
    if role == UserRole.student:
        for cls in db.query(Class).filter(Class.academic_year == academic_year).all():
            classes_by_name[cls.name.strip().lower()] = cls

    # Get current max student number for email generation
    existing_student_count = db.query(User).filter(User.role == UserRole.student).count()
    student_seq = existing_student_count

    created_rows: list[dict] = []
    skipped_rows: list[dict] = []
    error_rows: list[dict] = []

    year_prefix = academic_year.split("-")[0]  # "2025-2026" → "2025"

    for row_num, row in enumerate(reader, start=2):
        full_name = (row.get("full_name") or "").strip()
        class_name = (row.get("class_name") or "").strip()
        gender_str = (row.get("gender") or "").strip().lower()

        if not full_name:
            error_rows.append({"row": row_num, "reason": "Missing full_name"})
            continue

        # Parse gender (optional)
        gender = None
        if gender_str:
            try:
                gender = UserGender(gender_str)
            except ValueError:
                error_rows.append({"row": row_num, "reason": f"Invalid gender: {gender_str}"})
                continue

        parts = full_name.split()
        first = parts[0].lower() if parts else ""
        last = parts[-1].lower() if len(parts) > 1 else first

        # Generate email
        if role == UserRole.student:
            student_seq += 1
            email = f"{year_prefix}{student_seq:03d}{last}@srmk.edu.kh"
        else:
            email = f"{first}.{last}@srmk.edu.kh"

        # Check duplicate
        if db.query(User).filter(User.email == email).first():
            skipped_rows.append({"row": row_num, "full_name": full_name, "email": email, "reason": "Email already exists"})
            continue

        # Generate temp password
        alphabet = string.ascii_letters + string.digits
        temp_pw = "".join(secrets.choice(alphabet) for _ in range(10))

        user = User(
            email=email,
            full_name=full_name,
            role=role,
            gender=gender,
            hashed_password=hash_password(temp_pw),
            is_home_teacher=False,
            is_class_monitor=False,
            must_change_password=True,
        )
        db.add(user)
        db.flush()

        # Auto-enroll student
        enrolled_class = None
        if role == UserRole.student and class_name:
            cls = classes_by_name.get(class_name.strip().lower())
            if cls:
                existing_enrollment = db.query(Enrollment).filter(
                    Enrollment.student_id == user.id, Enrollment.class_id == cls.id
                ).first()
                if not existing_enrollment:
                    db.add(Enrollment(student_id=user.id, class_id=cls.id))
                enrolled_class = cls.name
            else:
                error_rows.append({"row": row_num, "reason": f"Class '{class_name}' not found (user created without enrollment)"})

        created_rows.append({
            "row": row_num,
            "full_name": full_name,
            "email": email,
            "temp_password": temp_pw,
            "class_name": enrolled_class,
        })

    if created_rows:
        log_action(db, current_user.id, "imported", "user", None,
                   detail=format_detail_bulk("imported", len(created_rows), f"{role.value}(s) via CSV"),
                   payload={"created": len(created_rows), "skipped": len(skipped_rows), "errors": len(error_rows), "role": role.value})
    db.commit()

    return {
        "created": len(created_rows),
        "skipped": len(skipped_rows),
        "errors": len(error_rows),
        "created_rows": created_rows,
        "skipped_rows": skipped_rows,
        "error_rows": error_rows,
    }


@router.post("/{user_id}/reset-password", dependencies=[admin_only])
def reset_user_password(user_id: int, db: Session = Depends(get_db),
                        current_user: User = Depends(get_current_user)):
    """Admin resets a user's password to a random temp password.
    The user will be forced to change it on next login."""
    user = user_service.get_user(db, user_id)
    alphabet = string.ascii_letters + string.digits
    temp_password = "".join(secrets.choice(alphabet) for _ in range(12))
    user.hashed_password = hash_password(temp_password)
    user.must_change_password = True
    log_action(db, current_user.id, "reset_password", "user", user_id,
               f"Reset password for {user.full_name} ({user.email})")
    db.commit()
    return {"message": "Password reset successfully", "temp_password": temp_password}


@router.delete("/{user_id}", dependencies=[admin_only])
def delete_user(user_id: int, db: Session = Depends(get_db),
                current_user: User = Depends(get_current_user)):
    if current_user.id == user_id:
        raise HTTPException(status_code=400, detail="Cannot delete your own account")
    target = user_service.get_user(db, user_id)
    detail = f"Deleted {target.role.value}: {target.full_name} ({target.email})"
    user_service.delete_user(db, user_id)
    log_action(db, current_user.id, "deleted", "user", user_id, detail)
    db.commit()
    return {"message": "User deleted"}
