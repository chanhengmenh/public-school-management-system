from pydantic import BaseModel, field_validator, model_validator
from typing import Optional
from datetime import time
from app.models.schedule import DayOfWeek


class ScheduleCreate(BaseModel):
    class_subject_id: int
    day_of_week: DayOfWeek
    start_time: time
    end_time: time
    room: Optional[str] = None

    @model_validator(mode="after")
    def end_after_start(self):
        if self.end_time <= self.start_time:
            raise ValueError("end_time must be after start_time")
        return self


class ScheduleUpdate(BaseModel):
    day_of_week: Optional[DayOfWeek] = None
    start_time: Optional[time] = None
    end_time: Optional[time] = None
    room: Optional[str] = None


class ScheduleRead(BaseModel):
    id: int
    class_subject_id: int
    day_of_week: DayOfWeek
    start_time: time
    end_time: time
    room: Optional[str]
    # Joined fields
    subject_name: Optional[str] = None
    class_name: Optional[str] = None
    teacher_name: Optional[str] = None

    model_config = {"from_attributes": True}

    @model_validator(mode="before")
    @classmethod
    def resolve_names(cls, data):
        """Pull names from the related ClassSubject if available."""
        if hasattr(data, "class_subject") and data.class_subject:
            cs = data.class_subject
            if hasattr(cs, "subject") and cs.subject:
                data.subject_name = cs.subject.name
            if hasattr(cs, "class_") and cs.class_:
                data.class_name = cs.class_.name
            if hasattr(cs, "teacher") and cs.teacher:
                data.teacher_name = cs.teacher.full_name
        return data
