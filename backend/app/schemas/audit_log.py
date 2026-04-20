from datetime import datetime
from typing import Optional, Any
from pydantic import BaseModel, model_validator


class AuditLogRead(BaseModel):
    id: int
    actor_id: int
    actor_name: Optional[str] = None
    action: str
    resource_type: str
    resource_id: Optional[int] = None
    detail: Optional[str] = None
    payload: Optional[dict] = None
    created_at: datetime

    model_config = {"from_attributes": True}

    @model_validator(mode="before")
    @classmethod
    def resolve_actor(cls, data: Any) -> Any:
        if hasattr(data, "id"):
            return {
                "id": data.id,
                "actor_id": data.actor_id,
                "actor_name": data.actor.full_name if data.actor else None,
                "action": data.action,
                "resource_type": data.resource_type,
                "resource_id": data.resource_id,
                "detail": data.detail,
                "payload": data.payload,
                "created_at": data.created_at,
            }
        return data
