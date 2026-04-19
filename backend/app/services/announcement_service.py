from sqlalchemy.orm import Session
from app.models.announcement import Announcement, AnnouncementTarget


def create_system_announcement(
    db: Session,
    author_id: int,
    title: str,
    body: str,
    class_id: int,
) -> None:
    """Create a class-scoped system announcement targeting students."""
    obj = Announcement(
        title=title,
        body=body,
        target=AnnouncementTarget.students,
        class_id=class_id,
        author_id=author_id,
        is_pinned=False,
    )
    db.add(obj)
