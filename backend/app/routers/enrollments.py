from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session, joinedload
from app.dependencies import get_db, get_current_user
from app.models.user import UserRole, User
from app.schemas.enrollment import EnrollmentCreate, EnrollmentRead
from app.core.permissions import require_roles
from app.core.exceptions import NotFoundError
from app.models.enrollment import Enrollment

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
def create_enrollment(data: EnrollmentCreate, db: Session = Depends(get_db)):
    obj = Enrollment(**data.model_dump())
    db.add(obj)
    db.commit()
    db.refresh(obj)
    return obj


@router.delete("/{enrollment_id}", dependencies=[Depends(require_roles(UserRole.admin))])
def delete_enrollment(enrollment_id: int, db: Session = Depends(get_db)):
    obj = db.query(Enrollment).filter(Enrollment.id == enrollment_id).first()
    if not obj:
        raise NotFoundError(f"Enrollment {enrollment_id} not found")
    db.delete(obj)
    db.commit()
    return {"message": "Enrollment removed"}
