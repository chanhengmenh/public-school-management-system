from pydantic import BaseModel
from datetime import date
from typing import Optional
from app.models.attendance import AttendanceStatus


class AttendanceEntry(BaseModel):
    student_id: int
    status: AttendanceStatus
    note: Optional[str] = None


class AttendanceBatchCreate(BaseModel):
    class_id: int
    date: date
    entries: list[AttendanceEntry]


class AttendanceRead(BaseModel):
    id: int
    class_id: int
    student_id: int
    date: date
    status: AttendanceStatus
    marked_by_id: int
    note: Optional[str] = None

    model_config = {"from_attributes": True}
