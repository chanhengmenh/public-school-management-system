from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.dependencies import get_db, get_current_user
from app.models.user import UserRole, User
from app.models.grade import Grade
from app.schemas.grade import GradeCreate, GradeRead, GradeUpdate
from app.core.permissions import require_roles
from app.core.exceptions import NotFoundError, ConflictError
from app.services.notification_service import create_notification
from app.services.audit_service import log_action, capture_diff, format_detail_grade
from app.models.notification import NotificationType

router = APIRouter(prefix="/grades", tags=["grades"])


def _fire_grade_notification(db: Session, grade: Grade, grader_name: str) -> None:
    from app.models.submission import AssignmentSubmission
    from app.models.assignment import Assignment
    sub = db.query(AssignmentSubmission).filter(AssignmentSubmission.id == grade.submission_id).first()
    if not sub:
        return
    assignment = db.query(Assignment).filter(Assignment.id == sub.assignment_id).first()
    title = assignment.title if assignment else "an assignment"
    create_notification(
        db,
        user_id=sub.student_id,
        title="Assignment Graded",
        message=f'Your submission for "{title}" has been graded: {grade.score}.',
        type=NotificationType.grade,
        sender=grader_name,
    )


@router.post("/", response_model=GradeRead,
             dependencies=[Depends(require_roles(UserRole.teacher, UserRole.admin))])
def create_grade(data: GradeCreate, db: Session = Depends(get_db),
                  current_user: User = Depends(get_current_user)):
    existing = db.query(Grade).filter(Grade.submission_id == data.submission_id).first()
    if existing:
        raise ConflictError("Submission already graded. Use PUT to update.")
    grade = Grade(**data.model_dump(), graded_by=current_user.id)
    db.add(grade)
    db.flush()

    # Audit log
    from app.models.submission import AssignmentSubmission
    from app.models.assignment import Assignment
    sub = db.query(AssignmentSubmission).filter(AssignmentSubmission.id == grade.submission_id).first()
    student = db.query(User).filter(User.id == sub.student_id).first() if sub else None
    assignment = db.query(Assignment).filter(Assignment.id == sub.assignment_id).first() if sub else None
    from app.models.class_subject import ClassSubject
    from app.models.subject import Subject
    class_subject = db.query(ClassSubject).filter(ClassSubject.id == assignment.class_subject_id).first() if assignment else None
    subject = db.query(Subject).filter(Subject.id == class_subject.subject_id).first() if class_subject else None
    detail = format_detail_grade(
        student.full_name if student else f"Student #{sub.student_id}" if sub else "Unknown",
        subject.name if subject else "Unknown",
        None,
        grade.score
    )
    log_action(
        db, current_user.id, "created", "grade", grade.id,
        detail=detail,
        payload=capture_diff(None, {"score": grade.score, "submission_id": grade.submission_id})
    )

    _fire_grade_notification(db, grade, current_user.full_name)
    db.commit()
    db.refresh(grade)
    return grade


@router.put("/{grade_id}", response_model=GradeRead,
            dependencies=[Depends(require_roles(UserRole.teacher, UserRole.admin))])
def update_grade(grade_id: int, data: GradeUpdate, db: Session = Depends(get_db),
                 current_user: User = Depends(get_current_user)):
    from app.models.submission import AssignmentSubmission
    from app.models.assignment import Assignment
    grade = db.query(Grade).filter(Grade.id == grade_id).first()
    if not grade:
        raise NotFoundError()

    old_score = grade.score  # capture before mutation

    for field, value in data.model_dump(exclude_unset=True).items():
        setattr(grade, field, value)

    sub = db.query(AssignmentSubmission).filter(AssignmentSubmission.id == grade.submission_id).first()
    student = db.query(User).filter(User.id == sub.student_id).first() if sub else None
    assignment = db.query(Assignment).filter(Assignment.id == sub.assignment_id).first() if sub else None
    from app.models.class_subject import ClassSubject
    from app.models.subject import Subject
    class_subject = db.query(ClassSubject).filter(ClassSubject.id == assignment.class_subject_id).first() if assignment else None
    subject = db.query(Subject).filter(Subject.id == class_subject.subject_id).first() if class_subject else None
    log_action(
        db, current_user.id, "updated", "grade", grade.id,
        detail=format_detail_grade(
            student.full_name if student else f"Student #{sub.student_id if sub else '?'}",
            subject.name if subject else "Unknown",
            old_score, grade.score,
        ),
        payload=capture_diff({"score": old_score}, {"score": grade.score}),
    )

    _fire_grade_notification(db, grade, current_user.full_name)
    db.commit()
    db.refresh(grade)
    return grade


@router.get("/", response_model=list[GradeRead])
def list_grades(student_id: int | None = None, assignment_id: int | None = None,
                 class_id: int | None = None,
                 db: Session = Depends(get_db), _: User = Depends(get_current_user)):
    from app.models.submission import AssignmentSubmission
    from app.models.assignment import Assignment
    from app.models.class_subject import ClassSubject
    q = db.query(Grade)
    if student_id or assignment_id or class_id:
        q = q.join(AssignmentSubmission)
    if student_id:
        q = q.filter(AssignmentSubmission.student_id == student_id)
    if assignment_id:
        q = q.filter(AssignmentSubmission.assignment_id == assignment_id)
    if class_id:
        q = q.join(Assignment, AssignmentSubmission.assignment_id == Assignment.id)
        q = q.join(ClassSubject, Assignment.class_subject_id == ClassSubject.id)
        q = q.filter(ClassSubject.class_id == class_id)
    return q.all()
