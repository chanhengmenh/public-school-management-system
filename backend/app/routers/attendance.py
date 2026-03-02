from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.dependencies import get_db, get_current_user
from app.models.user import User, UserRole
from app.models.attendance import Attendance
from app.schemas.attendance import AttendanceBatchCreate, AttendanceRead
from app.core.permissions import require_class_monitor

router = APIRouter(prefix="/attendance", tags=["attendance"])


@router.post("/batch", response_model=dict,
             dependencies=[Depends(require_class_monitor())])
def batch_create_attendance(data: AttendanceBatchCreate, db: Session = Depends(get_db),
                              current_user: User = Depends(get_current_user)):
    records = []
    for entry in data.entries:
        existing = db.query(Attendance).filter(
            Attendance.class_id == data.class_id,
            Attendance.student_id == entry.student_id,
            Attendance.date == data.date,
        ).first()
        if existing:
            existing.status = entry.status
            existing.note = entry.note
            existing.marked_by_id = current_user.id
        else:
            records.append(Attendance(
                class_id=data.class_id,
                student_id=entry.student_id,
                date=data.date,
                status=entry.status,
                note=entry.note,
                marked_by_id=current_user.id,
            ))
    if records:
        db.bulk_save_objects(records)
    db.commit()
    return {"processed": len(data.entries)}


@router.get("/", response_model=list[AttendanceRead])
def list_attendance(class_id: int | None = None, student_id: int | None = None,
                     date: str | None = None, db: Session = Depends(get_db),
                     current_user: User = Depends(get_current_user)):
    q = db.query(Attendance)
    if current_user.role == UserRole.student:
        q = q.filter(Attendance.student_id == current_user.id)
    else:
        if student_id:
            q = q.filter(Attendance.student_id == student_id)
    if class_id:
        q = q.filter(Attendance.class_id == class_id)
    if date:
        from datetime import date as date_type
        q = q.filter(Attendance.date == date_type.fromisoformat(date))
    return q.all()
