from pydantic import BaseModel
from typing import Optional


class SubjectCreate(BaseModel):
    name: str
    code: Optional[str] = None
    description: Optional[str] = None


class SubjectUpdate(BaseModel):
    name: Optional[str] = None
    code: Optional[str] = None
    description: Optional[str] = None


class SubjectRead(BaseModel):
    id: int
    name: str
    code: str
    description: Optional[str] = None

    model_config = {"from_attributes": True}
