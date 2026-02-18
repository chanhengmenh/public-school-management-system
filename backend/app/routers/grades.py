from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.dependencies import get_db, get_current_user
from app.models.user import UserRole, User
from app.models.grade import Grade
from app.schemas.grade import GradeCreate, GradeRead, GradeUpdate
from app.core.permissions import require_roles
from app.core.exceptions import NotFoundError, ConflictError

router = APIRouter(prefix="/grades", tags=["grades"])


@router.post("/", response_model=GradeRead,
             dependencies=[Depends(require_roles(UserRole.teacher, UserRole.home_teacher, UserRole.admin))])
def create_grade(data: GradeCreate, db: Session = Depends(get_db),
                  current_user: User = Depends(get_current_user)):
    existing = db.query(Grade).filter(Grade.submission_id == data.submission_id).first()
    if existing:
        raise ConflictError("Submission already graded. Use PUT to update.")
    grade = Grade(**data.model_dump(), graded_by=current_user.id)
    db.add(grade)
    db.commit()
    db.refresh(grade)
    return grade


@router.put("/{grade_id}", response_model=GradeRead,
            dependencies=[Depends(require_roles(UserRole.teacher, UserRole.home_teacher, UserRole.admin))])
def update_grade(grade_id: int, data: GradeUpdate, db: Session = Depends(get_db)):
    grade = db.query(Grade).filter(Grade.id == grade_id).first()
    if not grade:
        raise NotFoundError()
    for field, value in data.model_dump(exclude_unset=True).items():
        setattr(grade, field, value)
    db.commit()
    db.refresh(grade)
    return grade


@router.get("/", response_model=list[GradeRead])
def list_grades(student_id: int | None = None, assignment_id: int | None = None,
                 db: Session = Depends(get_db), _: User = Depends(get_current_user)):
    q = db.query(Grade)
    if student_id:
        from app.models.submission import AssignmentSubmission
        q = q.join(AssignmentSubmission).filter(AssignmentSubmission.student_id == student_id)
    if assignment_id:
        from app.models.submission import AssignmentSubmission
        q = q.join(AssignmentSubmission).filter(AssignmentSubmission.assignment_id == assignment_id)
    return q.all()
