from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session, joinedload
from app.dependencies import get_db, get_current_user
from app.models.user import User, UserRole
from app.models.schedule import ClassSchedule
from app.models.class_subject import ClassSubject
from app.schemas.schedule import ScheduleCreate, ScheduleRead, ScheduleUpdate
from app.core.permissions import require_roles
from app.core.exceptions import NotFoundError

router = APIRouter(prefix="/schedules", tags=["schedules"])


def _load_schedule(db: Session, schedule_id: int) -> ClassSchedule:
    obj = (
        db.query(ClassSchedule)
        .options(
            joinedload(ClassSchedule.class_subject)
            .joinedload(ClassSubject.subject),
            joinedload(ClassSchedule.class_subject)
            .joinedload(ClassSubject.class_),
            joinedload(ClassSchedule.class_subject)
            .joinedload(ClassSubject.teacher),
        )
        .filter(ClassSchedule.id == schedule_id)
        .first()
    )
    if not obj:
        raise NotFoundError(f"Schedule {schedule_id} not found")
    return obj


@router.get("/", response_model=list[ScheduleRead])
def list_schedules(
    class_subject_id: int | None = None,
    class_id: int | None = None,
    teacher_id: int | None = None,
    day_of_week: str | None = None,
    db: Session = Depends(get_db),
    _: User = Depends(get_current_user),
):
    """List schedules with optional filters."""
    q = (
        db.query(ClassSchedule)
        .join(ClassSubject)
        .options(
            joinedload(ClassSchedule.class_subject)
            .joinedload(ClassSubject.subject),
            joinedload(ClassSchedule.class_subject)
            .joinedload(ClassSubject.class_),
            joinedload(ClassSchedule.class_subject)
            .joinedload(ClassSubject.teacher),
        )
    )
    if class_subject_id is not None:
        q = q.filter(ClassSchedule.class_subject_id == class_subject_id)
    if class_id is not None:
        q = q.filter(ClassSubject.class_id == class_id)
    if teacher_id is not None:
        q = q.filter(ClassSubject.teacher_id == teacher_id)
    if day_of_week is not None:
        q = q.filter(ClassSchedule.day_of_week == day_of_week)

    return q.order_by(ClassSchedule.day_of_week, ClassSchedule.start_time).all()


@router.get("/{schedule_id}", response_model=ScheduleRead)
def get_schedule(
    schedule_id: int,
    db: Session = Depends(get_db),
    _: User = Depends(get_current_user),
):
    return _load_schedule(db, schedule_id)


@router.post(
    "/",
    response_model=ScheduleRead,
    dependencies=[Depends(require_roles(UserRole.admin))],
)
def create_schedule(data: ScheduleCreate, db: Session = Depends(get_db)):
    # Verify class_subject exists
    cs = db.query(ClassSubject).filter(ClassSubject.id == data.class_subject_id).first()
    if not cs:
        raise NotFoundError(f"ClassSubject {data.class_subject_id} not found")

    obj = ClassSchedule(**data.model_dump())
    db.add(obj)
    db.commit()
    db.refresh(obj)
    return _load_schedule(db, obj.id)


@router.put(
    "/{schedule_id}",
    response_model=ScheduleRead,
    dependencies=[Depends(require_roles(UserRole.admin))],
)
def update_schedule(
    schedule_id: int,
    data: ScheduleUpdate,
    db: Session = Depends(get_db),
):
    obj = db.query(ClassSchedule).filter(ClassSchedule.id == schedule_id).first()
    if not obj:
        raise NotFoundError(f"Schedule {schedule_id} not found")

    update_data = data.model_dump(exclude_unset=True)
    # Validate end > start if both or either are being changed
    new_start = update_data.get("start_time", obj.start_time)
    new_end = update_data.get("end_time", obj.end_time)
    if new_end <= new_start:
        raise HTTPException(status_code=400, detail="end_time must be after start_time")

    for field, value in update_data.items():
        setattr(obj, field, value)
    db.commit()
    return _load_schedule(db, obj.id)


@router.delete(
    "/{schedule_id}",
    dependencies=[Depends(require_roles(UserRole.admin))],
)
def delete_schedule(schedule_id: int, db: Session = Depends(get_db)):
    obj = db.query(ClassSchedule).filter(ClassSchedule.id == schedule_id).first()
    if not obj:
        raise NotFoundError(f"Schedule {schedule_id} not found")
    db.delete(obj)
    db.commit()
    return {"message": "Schedule deleted"}
