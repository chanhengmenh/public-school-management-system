from pydantic import BaseModel


class EnrollmentCreate(BaseModel):
    student_id: int
    class_id: int


class EnrollmentRead(BaseModel):
    id: int
    student_id: int
    class_id: int

    model_config = {"from_attributes": True}
