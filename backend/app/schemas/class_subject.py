from pydantic import BaseModel
from typing import Optional


class ClassSubjectCreate(BaseModel):
    class_id: int
    subject_id: int
    teacher_id: Optional[int] = None


class ClassSubjectUpdate(BaseModel):
    teacher_id: Optional[int] = None


class ClassSubjectRead(BaseModel):
    id: int
    class_id: int
    subject_id: int
    teacher_id: Optional[int] = None

    model_config = {"from_attributes": True}
