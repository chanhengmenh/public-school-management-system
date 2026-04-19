from datetime import datetime
from typing import Optional, Any
from pydantic import BaseModel, model_validator


class MaterialCreate(BaseModel):
    class_subject_id: int
    title: str


class MaterialUpdate(BaseModel):
    title: Optional[str] = None
    file_path: Optional[str] = None
    file_type: Optional[str] = None


class MaterialRead(BaseModel):
    id: int
    class_subject_id: int
    uploader_id: int
    uploader_name: Optional[str] = None
    title: str
    file_path: Optional[str] = None
    file_type: Optional[str] = None
    created_at: datetime

    model_config = {"from_attributes": True}

    @model_validator(mode="before")
    @classmethod
    def resolve_relationships(cls, data: Any) -> Any:
        if hasattr(data, "id"):
            return {
                "id": data.id,
                "class_subject_id": data.class_subject_id,
                "uploader_id": data.uploader_id,
                "uploader_name": data.uploader.full_name if data.uploader else None,
                "title": data.title,
                "file_path": data.file_path,
                "file_type": data.file_type,
                "created_at": data.created_at,
            }
        return data
