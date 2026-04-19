from sqlalchemy.orm import Session
from app.models.audit_log import AuditLog


def log_action(
    db: Session,
    actor_id: int,
    action: str,
    resource_type: str,
    resource_id: int | None = None,
    detail: str | None = None,
) -> None:
    """Record an audit log entry. Call this after mutations you want to track."""
    db.add(AuditLog(
        actor_id=actor_id,
        action=action,
        resource_type=resource_type,
        resource_id=resource_id,
        detail=detail,
    ))
    # Don't commit here — let the caller's transaction commit include it.
