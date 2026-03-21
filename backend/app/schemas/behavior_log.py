from pydantic import BaseModel
from typing import Any, Optional
from app.models.behavior_log import EventType


class BehaviorEvent(BaseModel):
    event_type: EventType
    event_data: Optional[dict[str, Any]] = None
    client_ts: int  # milliseconds epoch


class BehaviorEventBatch(BaseModel):
    submission_id: int
    events: list[BehaviorEvent]


class BehaviorLogRead(BaseModel):
    id: int
    submission_id: int
    student_id: int
    event_type: EventType
    event_data: Optional[dict[str, Any]] = None
    client_ts: int

    model_config = {"from_attributes": True}


class BehaviorMetrics(BaseModel):
    total_keystrokes: int
    total_pastes: int
    paste_chars: int
    total_chars_typed: int
    paste_ratio: float
    typing_speed_cpm: float
    active_time_seconds: float
    engagement_score: float
    classification: str  # "typed", "paste-heavy", "mixed"
