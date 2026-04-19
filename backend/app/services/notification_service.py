from sqlalchemy.orm import Session
from app.models.notification import Notification, NotificationType


def create_notification(
    db: Session,
    user_id: int,
    title: str,
    message: str,
    type: NotificationType = NotificationType.general,
    sender: str | None = None,
) -> None:
    """Create a personal notification for a user."""
    obj = Notification(
        user_id=user_id,
        title=title,
        message=message,
        type=type,
        sender=sender,
    )
    db.add(obj)


def notify_class_students(
    db: Session,
    class_id: int,
    title: str,
    message: str,
    type: NotificationType = NotificationType.general,
    sender: str | None = None,
) -> None:
    """Bulk-create notifications for every student enrolled in a class (2 queries total)."""
    from app.models.enrollment import Enrollment
    student_ids = [
        row.student_id
        for row in db.query(Enrollment.student_id)
        .filter(Enrollment.class_id == class_id)
        .all()
    ]
    if not student_ids:
        return
    db.bulk_insert_mappings(Notification, [
        {"user_id": sid, "title": title, "message": message,
         "type": type, "sender": sender, "is_read": False}
        for sid in student_ids
    ])
