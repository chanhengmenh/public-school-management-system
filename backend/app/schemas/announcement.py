from datetime import datetime
from typing import Optional, Any
from pydantic import BaseModel, model_validator
from app.models.announcement import AnnouncementTarget


class AnnouncementCreate(BaseModel):
    title: str
    body: str
    target: AnnouncementTarget = AnnouncementTarget.all
    class_id: Optional[int] = None
    is_pinned: bool = False


class AnnouncementUpdate(BaseModel):
    title: Optional[str] = None
    body: Optional[str] = None
    target: Optional[AnnouncementTarget] = None
    class_id: Optional[int] = None
    is_pinned: Optional[bool] = None


class AnnouncementRead(BaseModel):
    id: int
    title: str
    body: str
    target: AnnouncementTarget
    class_id: Optional[int] = None
    class_name: Optional[str] = None
    author_id: int
    author_name: Optional[str] = None
    is_pinned: bool
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}

    @model_validator(mode="before")
    @classmethod
    def resolve_relationships(cls, data: Any) -> Any:
        if hasattr(data, "id"):
            return {
                "id": data.id,
                "title": data.title,
                "body": data.body,
                "target": data.target,
                "class_id": data.class_id,
                "class_name": data.target_class.name if data.target_class else None,
                "author_id": data.author_id,
                "author_name": data.author.full_name if data.author else None,
                "is_pinned": data.is_pinned,
                "created_at": data.created_at,
                "updated_at": data.updated_at,
            }
        return data
