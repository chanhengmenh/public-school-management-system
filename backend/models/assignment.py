"""
Pydantic models for Assignment-related operations
"""
from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime


class AssignmentBase(BaseModel):
    """Base assignment model"""
    title: str
    description: Optional[str] = None
    subject_id: str
    class_id: str
    due_date: Optional[datetime] = None
    max_score: float = Field(default=100.0, ge=0, le=1000)
    allowed_submission_types: List[str]  # ["text", "file", "mcq", "drag_drop"]


class AssignmentCreate(AssignmentBase):
    """Assignment creation model"""
    pass


class AssignmentUpdate(BaseModel):
    """Assignment update model"""
    title: Optional[str] = None
    description: Optional[str] = None
    due_date: Optional[datetime] = None
    max_score: Optional[float] = None
    allowed_submission_types: Optional[List[str]] = None


class AssignmentResponse(AssignmentBase):
    """Assignment response model"""
    id: str
    publisher_id: str
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True
