from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from app.dependencies import get_db, get_current_user
from app.models.user import User, UserRole
from app.models.class_subject import ClassSubject
from app.models.enrollment import Enrollment
from app.models.notification import Notification, NotificationType
from app.schemas.notification import NotificationCreate, NotificationRead
from app.core.permissions import require_roles
from app.core.exceptions import NotFoundError, ForbiddenError

router = APIRouter(prefix="/notifications", tags=["notifications"])


@router.get("/", response_model=list[NotificationRead])
def list_notifications(
    is_read: bool | None = None,
    skip: int = 0,
    limit: int = 50,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """List notifications for the current user, newest first."""
    q = db.query(Notification).filter(Notification.user_id == current_user.id)
    if is_read is not None:
        q = q.filter(Notification.is_read == is_read)
    return q.order_by(Notification.created_at.desc()).offset(skip).limit(limit).all()


@router.get("/unread-count")
def unread_count(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    count = (
        db.query(Notification)
        .filter(Notification.user_id == current_user.id, Notification.is_read == False)
        .count()
    )
    return {"count": count}


@router.post(
    "/",
    response_model=NotificationRead,
    dependencies=[Depends(require_roles(UserRole.admin, UserRole.teacher))],
)
def create_notification(data: NotificationCreate, db: Session = Depends(get_db)):
    obj = Notification(**data.model_dump())
    db.add(obj)
    db.commit()
    db.refresh(obj)
    return obj


@router.put("/{notification_id}/read", response_model=NotificationRead)
def mark_as_read(
    notification_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    obj = db.query(Notification).filter(Notification.id == notification_id).first()
    if not obj:
        raise NotFoundError(f"Notification {notification_id} not found")
    if obj.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not your notification")
    obj.is_read = True
    db.commit()
    db.refresh(obj)
    return obj


@router.put("/read-all")
def mark_all_as_read(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    db.query(Notification).filter(
        Notification.user_id == current_user.id,
        Notification.is_read == False,
    ).update({"is_read": True})
    db.commit()
    return {"message": "All notifications marked as read"}


class BroadcastRequest(BaseModel):
    class_subject_id: int
    title: str
    message: str


@router.post(
    "/broadcast",
    dependencies=[Depends(require_roles(UserRole.teacher))],
)
def broadcast_to_class(
    data: BroadcastRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Send a notification to all students enrolled in the teacher's class subject."""
    cs = db.query(ClassSubject).filter(ClassSubject.id == data.class_subject_id).first()
    if not cs:
        raise NotFoundError("Class subject not found")
    if cs.teacher_id != current_user.id:
        raise ForbiddenError("You do not teach this class subject")

    enrolled_ids = [
        e.student_id
        for e in db.query(Enrollment).filter(Enrollment.class_id == cs.class_id).all()
    ]
    if not enrolled_ids:
        return {"sent": 0}

    db.bulk_save_objects([
        Notification(
            user_id=sid,
            title=data.title,
            message=data.message,
            type=NotificationType.announcement,
            sender=current_user.full_name,
        )
        for sid in enrolled_ids
    ])
    db.commit()
    return {"sent": len(enrolled_ids)}


@router.delete("/{notification_id}")
def delete_notification(
    notification_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    obj = db.query(Notification).filter(Notification.id == notification_id).first()
    if not obj:
        raise NotFoundError(f"Notification {notification_id} not found")
    if obj.user_id != current_user.id and current_user.role != UserRole.admin:
        raise HTTPException(status_code=403, detail="Not your notification")
    db.delete(obj)
    db.commit()
    return {"message": "Notification deleted"}
