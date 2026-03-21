from pydantic import BaseModel
from typing import Optional


class ClassCreate(BaseModel):
    name: str
    academic_year: str
    home_teacher_id: Optional[int] = None


class ClassUpdate(BaseModel):
    name: Optional[str] = None
    academic_year: Optional[str] = None
    home_teacher_id: Optional[int] = None


class ClassRead(BaseModel):
    id: int
    name: str
    academic_year: str
    home_teacher_id: Optional[int] = None

    model_config = {"from_attributes": True}
