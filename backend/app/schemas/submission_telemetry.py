from pydantic import BaseModel
from datetime import datetime
from typing import Optional


class TelemetryCreate(BaseModel):
    typed_chars: int = 0
    paste_count: int = 0
    pasted_chars: int = 0
    keystroke_count: int = 0
    active_typing_seconds: float = 0.0
    avg_wpm: Optional[float] = None


class TelemetryRead(BaseModel):
    id: int
    submission_id: int
    student_id: int
    typed_chars: int
    paste_count: int
    pasted_chars: int
    keystroke_count: int
    active_typing_seconds: float
    avg_wpm: Optional[float]
    recorded_at: datetime

    model_config = {"from_attributes": True}
