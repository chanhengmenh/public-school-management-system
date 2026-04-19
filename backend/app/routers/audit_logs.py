from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session, joinedload
from app.dependencies import get_db
from app.models.user import UserRole
from app.models.audit_log import AuditLog
from app.schemas.audit_log import AuditLogRead
from app.core.permissions import require_roles

router = APIRouter(prefix="/audit-logs", tags=["audit-logs"])


@router.get(
    "/",
    response_model=list[AuditLogRead],
    dependencies=[Depends(require_roles(UserRole.admin))],
)
def list_audit_logs(
    action: str | None = None,
    resource_type: str | None = None,
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
):
    q = db.query(AuditLog).options(joinedload(AuditLog.actor))
    if action:
        q = q.filter(AuditLog.action == action)
    if resource_type:
        q = q.filter(AuditLog.resource_type == resource_type)
    return q.order_by(AuditLog.created_at.desc()).offset(skip).limit(limit).all()
