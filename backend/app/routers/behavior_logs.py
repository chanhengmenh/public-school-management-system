from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.dependencies import get_db, get_current_user
from app.models.user import UserRole, User
from app.models.behavior_log import BehaviorLog
from app.schemas.behavior_log import BehaviorEventBatch, BehaviorLogRead
from app.core.permissions import require_roles

router = APIRouter(prefix="/behavior-logs", tags=["behavior-logs"])


@router.post("/batch", response_model=dict)
def batch_create_behavior_logs(
    data: BehaviorEventBatch,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    logs = [
        BehaviorLog(
            submission_id=data.submission_id,
            student_id=current_user.id,
            event_type=event.event_type,
            event_data=event.event_data,
            client_ts=event.client_ts,
        )
        for event in data.events
    ]
    db.bulk_save_objects(logs)
    db.commit()
    return {"created": len(logs)}


@router.get("/", response_model=list[BehaviorLogRead],
            dependencies=[Depends(require_roles(
                UserRole.teacher, UserRole.home_teacher, UserRole.admin))])
def list_behavior_logs(submission_id: int | None = None, student_id: int | None = None,
                        db: Session = Depends(get_db)):
    q = db.query(BehaviorLog)
    if submission_id:
        q = q.filter(BehaviorLog.submission_id == submission_id)
    if student_id:
        q = q.filter(BehaviorLog.student_id == student_id)
    return q.all()
