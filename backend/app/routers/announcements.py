from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session, joinedload
from app.dependencies import get_db, get_current_user
from app.models.user import User, UserRole
from app.models.announcement import Announcement, AnnouncementTarget
from app.models.enrollment import Enrollment
from app.schemas.announcement import AnnouncementCreate, AnnouncementRead, AnnouncementUpdate
from app.core.permissions import require_roles
from app.core.exceptions import NotFoundError

router = APIRouter(prefix="/announcements", tags=["announcements"])


def _load_options():
    return [joinedload(Announcement.author), joinedload(Announcement.target_class)]


@router.get("/", response_model=list[AnnouncementRead])
def list_announcements(
    skip: int = 0,
    limit: int = 50,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Return announcements visible to the current user."""
    q = db.query(Announcement).options(*_load_options())

    if current_user.role == UserRole.admin:
        pass  # admin sees all
    elif current_user.role == UserRole.teacher:
        q = q.filter(
            Announcement.target.in_([AnnouncementTarget.all, AnnouncementTarget.teachers])
        )
    else:
        # Student: school-wide + their enrolled class announcements
        enrolled_class_ids = [
            e.class_id
            for e in db.query(Enrollment).filter(
                Enrollment.student_id == current_user.id
            ).all()
        ]
        q = q.filter(
            (Announcement.target == AnnouncementTarget.all)
            | (Announcement.target == AnnouncementTarget.students)
            | (Announcement.class_id.in_(enrolled_class_ids))
        )

    return (
        q.order_by(Announcement.is_pinned.desc(), Announcement.created_at.desc())
        .offset(skip)
        .limit(limit)
        .all()
    )


@router.get("/{announcement_id}", response_model=AnnouncementRead)
def get_announcement(
    announcement_id: int,
    db: Session = Depends(get_db),
    _: User = Depends(get_current_user),
):
    obj = (
        db.query(Announcement)
        .options(*_load_options())
        .filter(Announcement.id == announcement_id)
        .first()
    )
    if not obj:
        raise NotFoundError(f"Announcement {announcement_id} not found")
    return obj


@router.post(
    "/",
    response_model=AnnouncementRead,
    dependencies=[Depends(require_roles(UserRole.admin))],
)
def create_announcement(
    data: AnnouncementCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    obj = Announcement(**data.model_dump(), author_id=current_user.id)
    db.add(obj)
    db.commit()
    db.refresh(obj)
    # Re-query with joins for the response
    return (
        db.query(Announcement)
        .options(*_load_options())
        .filter(Announcement.id == obj.id)
        .first()
    )


@router.put(
    "/{announcement_id}",
    response_model=AnnouncementRead,
    dependencies=[Depends(require_roles(UserRole.admin))],
)
def update_announcement(
    announcement_id: int,
    data: AnnouncementUpdate,
    db: Session = Depends(get_db),
):
    obj = db.query(Announcement).filter(Announcement.id == announcement_id).first()
    if not obj:
        raise NotFoundError(f"Announcement {announcement_id} not found")
    for field, value in data.model_dump(exclude_unset=True).items():
        setattr(obj, field, value)
    db.commit()
    db.refresh(obj)
    return (
        db.query(Announcement)
        .options(*_load_options())
        .filter(Announcement.id == obj.id)
        .first()
    )


@router.delete(
    "/{announcement_id}",
    dependencies=[Depends(require_roles(UserRole.admin))],
)
def delete_announcement(announcement_id: int, db: Session = Depends(get_db)):
    obj = db.query(Announcement).filter(Announcement.id == announcement_id).first()
    if not obj:
        raise NotFoundError(f"Announcement {announcement_id} not found")
    db.delete(obj)
    db.commit()
    return {"message": "Announcement deleted"}
