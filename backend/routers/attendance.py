"""
Attendance router - track attendance per class session
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import text
from pydantic import BaseModel
from typing import List, Optional

from database import get_db
from utils.auth import get_current_user

router = APIRouter()


class AttendanceRecord(BaseModel):
    """Attendance record payload"""
    student_id: str
    status: str
    notes: Optional[str] = None


class AttendanceSessionCreate(BaseModel):
    """Create or update attendance session"""
    date: str
    records: List[AttendanceRecord]


@router.get("/class/{class_id}/session")
async def get_attendance_session(
    class_id: str,
    date: str,
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get attendance session and records for a class/date"""
    session_row = db.execute(
        text("""
        SELECT id, session_date
        FROM attendance_sessions
        WHERE class_id = :class_id AND session_date = :session_date
        """),
        {"class_id": class_id, "session_date": date}
    ).fetchone()

    if not session_row:
        return {"session_id": None, "session_date": date, "records": []}

    records = db.execute(
        text("""
        SELECT r.student_id, u.full_name, u.email, r.status, r.notes
        FROM attendance_records r
        JOIN users u ON r.student_id = u.id
        WHERE r.session_id = :session_id
        ORDER BY u.full_name
        """),
        {"session_id": session_row[0]}
    ).fetchall()

    return {
        "session_id": str(session_row[0]),
        "session_date": str(session_row[1]),
        "records": [
            {
                "student_id": str(row[0]),
                "student_name": row[1],
                "student_email": row[2],
                "status": row[3],
                "notes": row[4],
            }
            for row in records
        ]
    }


@router.post("/class/{class_id}/session")
async def upsert_attendance_session(
    class_id: str,
    payload: AttendanceSessionCreate,
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Create or update attendance session for a class/date"""
    session_row = db.execute(
        text("""
        SELECT id FROM attendance_sessions
        WHERE class_id = :class_id AND session_date = :session_date
        """),
        {"class_id": class_id, "session_date": payload.date}
    ).fetchone()

    if session_row:
        session_id = session_row[0]
    else:
        result = db.execute(
            text("""
            INSERT INTO attendance_sessions (class_id, session_date, taken_by)
            VALUES (:class_id, :session_date, :taken_by)
            RETURNING id
            """),
            {"class_id": class_id, "session_date": payload.date, "taken_by": current_user.user_id}
        )
        session_id = result.fetchone()[0]

    for record in payload.records:
        db.execute(
            text("""
            INSERT INTO attendance_records (session_id, student_id, status, notes)
            VALUES (:session_id, :student_id, :status, :notes)
            ON CONFLICT (session_id, student_id)
            DO UPDATE SET status = EXCLUDED.status, notes = EXCLUDED.notes
            """),
            {
                "session_id": session_id,
                "student_id": record.student_id,
                "status": record.status,
                "notes": record.notes
            }
        )

    db.commit()

    return {"session_id": str(session_id), "session_date": payload.date}
