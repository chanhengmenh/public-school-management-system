"""
Pydantic models for Submission and Behavior Tracking
"""
from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from datetime import datetime


class BehaviorEvent(BaseModel):
    """Individual behavior event"""
    event_type: str  # "keystroke", "paste", "focus", "blur"
    timestamp: datetime
    payload: Dict[str, Any]  # Flexible payload for different event types


class SubmissionBase(BaseModel):
    """Base submission model"""
    assignment_id: str
    submission_type: str  # "text", "file", "mcq", "mixed"


class TextSubmissionCreate(SubmissionBase):
    """Text submission with behavior tracking"""
    content: str
    behavior_events: List[BehaviorEvent] = []


class FileSubmissionCreate(SubmissionBase):
    """File submission metadata"""
    file_paths: List[str]  # Supabase Storage paths


class SubmissionResponse(BaseModel):
    """Submission response model"""
    id: str
    assignment_id: str
    student_id: str
    submission_type: str
    submitted_at: datetime
    status: str
    
    class Config:
        from_attributes = True


class SubmissionWithContent(SubmissionResponse):
    """Submission with text content"""
    content: Optional[str] = None
    files: Optional[List[Dict[str, Any]]] = None


class BehaviorAnalytics(BaseModel):
    """Computed behavior analytics"""
    submission_id: str
    total_keystrokes: int
    total_pastes: int
    typing_speed_wpm: float
    paste_ratio: float  # Percentage of content pasted
    active_time_seconds: float
    input_mode: str  # "typed", "pasted", "mixed"
