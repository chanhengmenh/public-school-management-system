from pydantic import BaseModel
from datetime import datetime
from typing import Optional
from app.models.assignment import AssignmentStatus


class AssignmentCreate(BaseModel):
    class_subject_id: int
    title: str
    description: Optional[str] = None
    due_date: Optional[datetime] = None
    max_score: int = 100


class AssignmentUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    due_date: Optional[datetime] = None
    max_score: Optional[int] = None
    status: Optional[AssignmentStatus] = None


class AssignmentRead(BaseModel):
    id: int
    class_subject_id: int
    publisher_id: int
    title: str
    description: Optional[str] = None
    due_date: Optional[datetime] = None
    max_score: int
    status: AssignmentStatus
    created_at: datetime

    model_config = {"from_attributes": True}
