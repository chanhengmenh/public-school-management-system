from pydantic import BaseModel
from datetime import datetime
from typing import Optional


class GradeCreate(BaseModel):
    submission_id: int
    score: float
    feedback: Optional[str] = None


class GradeUpdate(BaseModel):
    score: Optional[float] = None
    feedback: Optional[str] = None


class GradeRead(BaseModel):
    id: int
    submission_id: int
    score: float
    feedback: Optional[str] = None
    graded_by: int
    graded_at: datetime

    model_config = {"from_attributes": True}
