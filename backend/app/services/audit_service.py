from sqlalchemy.orm import Session
from app.models.audit_log import AuditLog
import logging

logger = logging.getLogger(__name__)


def log_action(
    db: Session,
    actor_id: int,
    action: str,
    resource_type: str,
    resource_id: int | None = None,
    detail: str | None = None,
    payload: dict | None = None,
) -> None:
    """Record an audit log entry. Call this after mutations you want to track.

    payload: dict with optional 'before' and 'after' keys for state changes.
    Non-blocking: if audit log fails, it logs an error but doesn't crash the caller.
    """
    try:
        db.add(AuditLog(
            actor_id=actor_id,
            action=action,
            resource_type=resource_type,
            resource_id=resource_id,
            detail=detail,
            payload=payload,
        ))
        # Don't commit here — let the caller's transaction commit include it.
    except Exception as e:
        logger.error(f"Failed to log audit entry: {e}", exc_info=True)
        # Non-blocking: don't raise, just log the error


def capture_diff(before: dict | None, after: dict | None) -> dict:
    """Capture before/after state for a resource change."""
    return {
        "before": before or {},
        "after": after or {},
    }


def format_detail_grade(student_name: str, subject_name: str, old_score: float | None, new_score: float) -> str:
    """Format a human-readable detail for a grade change."""
    if old_score is None:
        return f"Graded {student_name} in {subject_name}: {new_score}"
    return f"Updated {student_name} grade in {subject_name}: {old_score} → {new_score}"


def format_detail_enrollment(action: str, student_name: str, class_name: str) -> str:
    """Format a human-readable detail for an enrollment change."""
    verb = "Enrolled" if action == "enrolled" else "Unenrolled"
    return f"{verb} {student_name} in {class_name}"


def format_detail_bulk(action: str, count: int, resource: str) -> str:
    """Format a human-readable detail for bulk operations."""
    return f"Bulk {action} {count} {resource}"
