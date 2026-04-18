from pydantic import BaseModel
from datetime import datetime
from typing import Optional
from app.models.assignment import AssignmentStatus, SubmissionType


class AssignmentCreate(BaseModel):
    class_subject_id: int
    title: str
    description: Optional[str] = None
    due_date: Optional[datetime] = None
    max_score: int = 100
    category_id: Optional[int] = None
    submission_type: SubmissionType = SubmissionType.text


class AssignmentUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    due_date: Optional[datetime] = None
    max_score: Optional[int] = None
    status: Optional[AssignmentStatus] = None
    category_id: Optional[int] = None
    submission_type: Optional[SubmissionType] = None


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
    category_id: Optional[int] = None
    submission_type: SubmissionType = SubmissionType.text

    model_config = {"from_attributes": True}
