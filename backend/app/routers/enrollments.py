from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session, joinedload
from app.dependencies import get_db, get_current_user
from app.models.user import UserRole, User
from app.schemas.enrollment import EnrollmentCreate, EnrollmentRead
from app.core.permissions import require_roles
from app.core.exceptions import NotFoundError
from app.models.enrollment import Enrollment
from app.services.audit_service import log_action, capture_diff, format_detail_enrollment

router = APIRouter(prefix="/enrollments", tags=["enrollments"])


@router.get("/", response_model=list[EnrollmentRead])
def list_enrollments(class_id: int | None = None, student_id: int | None = None,
                      db: Session = Depends(get_db), _: User = Depends(get_current_user)):
    q = db.query(Enrollment).options(joinedload(Enrollment.class_))
    if class_id:
        q = q.filter(Enrollment.class_id == class_id)
    if student_id:
        q = q.filter(Enrollment.student_id == student_id)
    return q.all()


@router.post("/", response_model=EnrollmentRead,
             dependencies=[Depends(require_roles(UserRole.admin))])
def create_enrollment(data: EnrollmentCreate, db: Session = Depends(get_db),
                      current_user: User = Depends(get_current_user)):
    obj = Enrollment(**data.model_dump())
    db.add(obj)
    db.flush()

    student = db.query(User).filter(User.id == obj.student_id).first()
    from app.models.class_ import Class
    cls = db.query(Class).filter(Class.id == obj.class_id).first()
    log_action(
        db, current_user.id, "enrolled", "enrollment", obj.id,
        detail=format_detail_enrollment("enrolled",
            student.full_name if student else f"Student #{obj.student_id}",
            cls.name if cls else f"Class #{obj.class_id}"),
        payload=capture_diff(None, {"student_id": obj.student_id, "class_id": obj.class_id}),
    )

    db.commit()
    db.refresh(obj)
    return obj


@router.delete("/{enrollment_id}", dependencies=[Depends(require_roles(UserRole.admin))])
def delete_enrollment(enrollment_id: int, db: Session = Depends(get_db),
                      current_user: User = Depends(get_current_user)):
    obj = db.query(Enrollment).filter(Enrollment.id == enrollment_id).first()
    if not obj:
        raise NotFoundError(f"Enrollment {enrollment_id} not found")

    student = db.query(User).filter(User.id == obj.student_id).first()
    from app.models.class_ import Class
    cls = db.query(Class).filter(Class.id == obj.class_id).first()
    log_action(
        db, current_user.id, "unenrolled", "enrollment", enrollment_id,
        detail=format_detail_enrollment("unenrolled",
            student.full_name if student else f"Student #{obj.student_id}",
            cls.name if cls else f"Class #{obj.class_id}"),
        payload=capture_diff({"student_id": obj.student_id, "class_id": obj.class_id}, None),
    )

    db.delete(obj)
    db.commit()
    return {"message": "Enrollment removed"}
