from pydantic import BaseModel, model_validator
from typing import Any


class EnrollmentCreate(BaseModel):
    student_id: int
    class_id: int


class EnrollmentRead(BaseModel):
    id: int
    student_id: int
    class_id: int
    class_name: str = ""
    academic_year: str = ""

    @model_validator(mode="before")
    @classmethod
    def extract_class_info(cls, data: Any) -> Any:
        if hasattr(data, "class_") and data.class_ is not None:
            return {
                "id": data.id,
                "student_id": data.student_id,
                "class_id": data.class_id,
                "class_name": data.class_.name,
                "academic_year": data.class_.academic_year,
            }
        return data

    model_config = {"from_attributes": True}
