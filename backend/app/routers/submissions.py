from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from datetime import datetime, timezone
from app.dependencies import get_db, get_current_user
from app.models.user import UserRole, User
from app.models.assignment import Assignment, AssignmentStatus
from app.models.submission import AssignmentSubmission
from app.schemas.submission import SubmissionCreate, SubmissionRead
from app.core.permissions import require_roles
from app.core.exceptions import NotFoundError, ForbiddenError

router = APIRouter(prefix="/submissions", tags=["submissions"])


@router.post("/", response_model=SubmissionRead,
             dependencies=[Depends(require_roles(UserRole.student))])
def create_submission(data: SubmissionCreate, db: Session = Depends(get_db),
                       current_user: User = Depends(get_current_user)):
    assignment = db.query(Assignment).filter(Assignment.id == data.assignment_id).first()
    if not assignment:
        raise NotFoundError("Assignment not found")
    if assignment.status != AssignmentStatus.published:
        raise ForbiddenError("Assignment is not published")

    is_late = False
    if assignment.due_date and datetime.now(timezone.utc) > assignment.due_date:
        is_late = True

    obj = AssignmentSubmission(
        **data.model_dump(),
        student_id=current_user.id,
        is_late=is_late,
    )
    db.add(obj)
    db.commit()
    db.refresh(obj)
    return obj


@router.get("/", response_model=list[SubmissionRead])
def list_submissions(assignment_id: int | None = None, student_id: int | None = None,
                      db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    q = db.query(AssignmentSubmission)
    if assignment_id:
        q = q.filter(AssignmentSubmission.assignment_id == assignment_id)
    if student_id:
        q = q.filter(AssignmentSubmission.student_id == student_id)
    # Students can only see their own submissions
    if current_user.role == UserRole.student:
        q = q.filter(AssignmentSubmission.student_id == current_user.id)
    return q.all()


@router.get("/{submission_id}", response_model=SubmissionRead)
def get_submission(submission_id: int, db: Session = Depends(get_db),
                    current_user: User = Depends(get_current_user)):
    obj = db.query(AssignmentSubmission).filter(AssignmentSubmission.id == submission_id).first()
    if not obj:
        raise NotFoundError()
    if current_user.role == UserRole.student and obj.student_id != current_user.id:
        raise ForbiddenError()
    return obj
