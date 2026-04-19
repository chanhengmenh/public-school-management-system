from pydantic import BaseModel, model_validator
from typing import Optional, Any


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
    subject_name: str = ""
    class_name: str = ""
    class_academic_year: str = ""
    teacher_name: str = ""

    @model_validator(mode="before")
    @classmethod
    def extract_related_info(cls, data: Any) -> Any:
        if hasattr(data, "subject") and data.subject is not None:
            return {
                "id": data.id,
                "class_id": data.class_id,
                "subject_id": data.subject_id,
                "teacher_id": data.teacher_id,
                "subject_name": data.subject.name,
                "class_name": data.class_.name if data.class_ is not None else "",
                "class_academic_year": data.class_.academic_year if data.class_ is not None else "",
                "teacher_name": data.teacher.full_name if data.teacher is not None else "",
            }
        return data

    model_config = {"from_attributes": True}
