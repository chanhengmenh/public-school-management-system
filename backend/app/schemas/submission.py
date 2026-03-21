from pydantic import BaseModel
from datetime import datetime
from typing import Optional


class SubmissionCreate(BaseModel):
    assignment_id: int
    content: Optional[str] = None
    submission_type: str = "text"


class SubmissionRead(BaseModel):
    id: int
    assignment_id: int
    student_id: int
    content: Optional[str] = None
    submission_type: str
    submitted_at: datetime
    is_late: bool

    model_config = {"from_attributes": True}
