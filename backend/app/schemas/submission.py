from pydantic import BaseModel
from datetime import datetime
from typing import Optional


class SubmissionCreate(BaseModel):
    assignment_id: int
    content: Optional[str] = None
    submission_type: str = "text"


class SubmissionFileRead(BaseModel):
    id: int
    submission_id: int
    file_url: str
    file_type: Optional[str] = None
    original_filename: Optional[str] = None
    uploaded_at: datetime

    model_config = {"from_attributes": True}


class SubmissionRead(BaseModel):
    id: int
    assignment_id: int
    student_id: int
    content: Optional[str] = None
    submission_type: str
    submitted_at: datetime
    is_late: bool
    files: list[SubmissionFileRead] = []

    model_config = {"from_attributes": True}
