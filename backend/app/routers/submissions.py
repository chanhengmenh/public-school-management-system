from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session, joinedload
from datetime import datetime, timezone
from app.dependencies import get_db, get_current_user
from app.models.user import UserRole, User
from app.models.assignment import Assignment, AssignmentStatus
from app.models.submission import AssignmentSubmission
from app.models.submission_telemetry import SubmissionTelemetry
from app.schemas.submission import SubmissionCreate, SubmissionRead
from app.schemas.submission_telemetry import TelemetryCreate, TelemetryRead
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

    allowed_type = assignment.submission_type  # "text", "file", or "both"
    if allowed_type != "both" and data.submission_type != allowed_type:
        raise ForbiddenError(f"This assignment only accepts {allowed_type} submissions")

    if assignment.max_attempts is not None:
        attempt_count = db.query(AssignmentSubmission).filter(
            AssignmentSubmission.assignment_id == data.assignment_id,
            AssignmentSubmission.student_id == current_user.id,
        ).count()
        if attempt_count >= assignment.max_attempts:
            raise ForbiddenError(f"Maximum attempts ({assignment.max_attempts}) reached")

    is_late = False
    if assignment.due_date:
        now = datetime.now(timezone.utc)
        due = assignment.due_date
        # Handle naive datetimes (e.g. from SQLite) by assuming UTC
        if due.tzinfo is None:
            due = due.replace(tzinfo=timezone.utc)
        if now > due:
            is_late = True

    obj = AssignmentSubmission(
        **data.model_dump(),
        student_id=current_user.id,
        is_late=is_late,
    )
    db.add(obj)
    db.commit()
    db.refresh(obj)
    # Reload with files (empty at creation time, but keeps response consistent)
    obj = db.query(AssignmentSubmission).options(
        joinedload(AssignmentSubmission.files)
    ).filter(AssignmentSubmission.id == obj.id).first()
    return obj


@router.get("/", response_model=list[SubmissionRead])
def list_submissions(assignment_id: int | None = None, student_id: int | None = None,
                      db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    q = db.query(AssignmentSubmission).options(joinedload(AssignmentSubmission.files))
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
    obj = db.query(AssignmentSubmission).options(
        joinedload(AssignmentSubmission.files)
    ).filter(AssignmentSubmission.id == submission_id).first()
    if not obj:
        raise NotFoundError()
    if current_user.role == UserRole.student and obj.student_id != current_user.id:
        raise ForbiddenError()
    return obj


@router.post("/{submission_id}/telemetry", response_model=TelemetryRead,
             dependencies=[Depends(require_roles(UserRole.student))])
def save_telemetry(submission_id: int, data: TelemetryCreate,
                   db: Session = Depends(get_db),
                   current_user: User = Depends(get_current_user)):
    sub = db.query(AssignmentSubmission).filter(AssignmentSubmission.id == submission_id).first()
    if not sub:
        raise NotFoundError("Submission not found")
    if sub.student_id != current_user.id:
        raise ForbiddenError()

    existing = db.query(SubmissionTelemetry).filter(
        SubmissionTelemetry.submission_id == submission_id
    ).first()
    if existing:
        for k, v in data.model_dump().items():
            setattr(existing, k, v)
        db.commit()
        db.refresh(existing)
        return existing

    obj = SubmissionTelemetry(
        submission_id=submission_id,
        student_id=current_user.id,
        **data.model_dump(),
    )
    db.add(obj)
    db.commit()
    db.refresh(obj)
    return obj


@router.get("/{submission_id}/telemetry", response_model=TelemetryRead)
def get_telemetry(submission_id: int, db: Session = Depends(get_db),
                  current_user: User = Depends(get_current_user)):
    sub = db.query(AssignmentSubmission).filter(AssignmentSubmission.id == submission_id).first()
    if not sub:
        raise NotFoundError("Submission not found")
    if current_user.role == UserRole.student and sub.student_id != current_user.id:
        raise ForbiddenError()

    telemetry = db.query(SubmissionTelemetry).filter(
        SubmissionTelemetry.submission_id == submission_id
    ).first()
    if not telemetry:
        raise NotFoundError("No telemetry recorded for this submission")
    return telemetry
