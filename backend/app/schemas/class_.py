from pydantic import BaseModel, model_validator
from typing import Optional, Any


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
    home_teacher_name: Optional[str] = None

    model_config = {"from_attributes": True}

    @model_validator(mode="before")
    @classmethod
    def resolve_home_teacher(cls, data: Any) -> Any:
        if hasattr(data, "id"):
            return {
                "id": data.id,
                "name": data.name,
                "academic_year": data.academic_year,
                "home_teacher_id": data.home_teacher_id,
                "home_teacher_name": (
                    data.home_teacher.full_name
                    if data.home_teacher is not None
                    else None
                ),
            }
        return data
