from pydantic import BaseModel, field_validator
from typing import Optional


class GradeCategoryCreate(BaseModel):
    class_subject_id: int
    name: str
    weight: float  # 0.0–1.0

    @field_validator("weight")
    @classmethod
    def weight_range(cls, v: float) -> float:
        if not (0.0 < v <= 1.0):
            raise ValueError("weight must be between 0 and 1 (exclusive/inclusive)")
        return v


class GradeCategoryUpdate(BaseModel):
    name: Optional[str] = None
    weight: Optional[float] = None

    @field_validator("weight")
    @classmethod
    def weight_range(cls, v: Optional[float]) -> Optional[float]:
        if v is not None and not (0.0 < v <= 1.0):
            raise ValueError("weight must be between 0 and 1 (exclusive/inclusive)")
        return v


class GradeCategoryRead(BaseModel):
    id: int
    class_subject_id: int
    name: str
    weight: float

    model_config = {"from_attributes": True}
