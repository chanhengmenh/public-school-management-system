from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.dependencies import get_db, get_current_user
from app.models.user import UserRole, User
from app.models.assignment import Assignment, AssignmentStatus
from app.schemas.assignment import AssignmentCreate, AssignmentRead, AssignmentUpdate
from app.core.permissions import require_roles
from app.core.exceptions import NotFoundError, ForbiddenError
from app.services.announcement_service import create_system_announcement
from app.services.notification_service import notify_class_students
from app.models.notification import NotificationType

router = APIRouter(prefix="/assignments", tags=["assignments"])


def _get_class_context(db: Session, class_subject_id: int):
    """Returns (class_id, subject_name, class_name) or (None, None, None)."""
    from app.models.class_subject import ClassSubject
    from app.models.subject import Subject
    from app.models.class_ import Class
    cs = db.query(ClassSubject).filter(ClassSubject.id == class_subject_id).first()
    if not cs:
        return None, None, None
    subject = db.query(Subject).filter(Subject.id == cs.subject_id).first()
    cls = db.query(Class).filter(Class.id == cs.class_id).first()
    return cs.class_id, (subject.name if subject else "Unknown"), (cls.name if cls else "Unknown")


def _get_class_id(db: Session, class_subject_id: int) -> int | None:
    class_id, _, _ = _get_class_context(db, class_subject_id)
    return class_id


def _fmt_date(dt) -> str:
    if not dt:
        return "no deadline"
    return dt.strftime("%b %d, %Y")


@router.get("/", response_model=list[AssignmentRead])
def list_assignments(class_subject_id: int | None = None, class_id: int | None = None,
                      db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    from app.models.class_subject import ClassSubject
    q = db.query(Assignment)
    if class_subject_id:
        q = q.filter(Assignment.class_subject_id == class_subject_id)
    if class_id:
        q = q.join(ClassSubject).filter(ClassSubject.class_id == class_id)
    if current_user.role == UserRole.student:
        q = q.filter(Assignment.status == AssignmentStatus.published)
    return q.all()


@router.post("/", response_model=AssignmentRead,
             dependencies=[Depends(require_roles(UserRole.teacher, UserRole.admin))])
def create_assignment(data: AssignmentCreate, db: Session = Depends(get_db),
                       current_user: User = Depends(get_current_user)):
    obj = Assignment(**data.model_dump(), publisher_id=current_user.id)
    db.add(obj)
    db.flush()
    if obj.status == AssignmentStatus.published:
        class_id, subject_name, class_name = _get_class_context(db, obj.class_subject_id)
        if class_id:
            title = f"New Assignment: {obj.title}"
            body = f"New Assignment: {obj.title} | {subject_name} - {class_name}. Due: {_fmt_date(obj.due_date)}."
            create_system_announcement(db, current_user.id, title, body, class_id)
            notify_class_students(
                db, class_id, title, body,
                type=NotificationType.assignment,
                sender=current_user.full_name,
            )
    db.commit()
    db.refresh(obj)
    return obj


@router.get("/{assignment_id}", response_model=AssignmentRead)
def get_assignment(assignment_id: int, db: Session = Depends(get_db),
                    _: User = Depends(get_current_user)):
    obj = db.query(Assignment).filter(Assignment.id == assignment_id).first()
    if not obj:
        raise NotFoundError(f"Assignment {assignment_id} not found")
    return obj


@router.put("/{assignment_id}", response_model=AssignmentRead,
            dependencies=[Depends(require_roles(UserRole.teacher, UserRole.admin))])
def update_assignment(assignment_id: int, data: AssignmentUpdate, db: Session = Depends(get_db),
                      current_user: User = Depends(get_current_user)):
    obj = db.query(Assignment).filter(Assignment.id == assignment_id).first()
    if not obj:
        raise NotFoundError()
    update_dict = data.model_dump(exclude_unset=True)
    def _aware(dt):
        if dt is None:
            return None
        from datetime import timezone as _tz
        return dt if dt.tzinfo else dt.replace(tzinfo=_tz.utc)

    deadline_changed = (
        "due_date" in update_dict
        and obj.status == AssignmentStatus.published
        and _aware(update_dict["due_date"]) != _aware(obj.due_date)
    )
    for field, value in update_dict.items():
        setattr(obj, field, value)
    if deadline_changed:
        class_id = _get_class_id(db, obj.class_subject_id)
        if class_id:
            title = f"Deadline Updated: {obj.title}"
            body = f'The deadline for "{obj.title}" has been moved to {_fmt_date(obj.due_date)}.'
            create_system_announcement(db, current_user.id, title, body, class_id)
            notify_class_students(
                db, class_id, title, body,
                type=NotificationType.alert,
                sender=current_user.full_name,
            )
    db.commit()
    db.refresh(obj)
    return obj


@router.post("/{assignment_id}/publish", response_model=AssignmentRead,
             dependencies=[Depends(require_roles(UserRole.teacher, UserRole.admin))])
def publish_assignment(assignment_id: int, db: Session = Depends(get_db),
                       current_user: User = Depends(get_current_user)):
    obj = db.query(Assignment).filter(Assignment.id == assignment_id).first()
    if not obj:
        raise NotFoundError()
    obj.status = AssignmentStatus.published
    class_id, subject_name, class_name = _get_class_context(db, obj.class_subject_id)
    if class_id:
        title = f"New Assignment: {obj.title}"
        body = f"New Assignment: {obj.title} | {subject_name} - {class_name}. Due: {_fmt_date(obj.due_date)}."
        create_system_announcement(db, current_user.id, title, body, class_id)
        notify_class_students(
            db, class_id, title, body,
            type=NotificationType.assignment,
            sender=current_user.full_name,
        )
    db.commit()
    db.refresh(obj)
    return obj


@router.delete("/{assignment_id}",
               dependencies=[Depends(require_roles(UserRole.teacher, UserRole.admin))])
def delete_assignment(assignment_id: int, db: Session = Depends(get_db)):
    obj = db.query(Assignment).filter(Assignment.id == assignment_id).first()
    if not obj:
        raise NotFoundError()
    db.delete(obj)
    db.commit()
    return {"message": "Assignment deleted"}
