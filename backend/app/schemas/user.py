from pydantic import BaseModel, EmailStr
from datetime import datetime
from app.models.user import UserRole
from typing import Optional


class UserCreate(BaseModel):
    email: EmailStr
    full_name: str
    password: str
    role: UserRole


class UserUpdate(BaseModel):
    full_name: Optional[str] = None
    email: Optional[EmailStr] = None
    role: Optional[UserRole] = None
    is_active: Optional[bool] = None
    password: Optional[str] = None


class UserRead(BaseModel):
    id: int
    email: str
    full_name: str
    role: UserRole
    is_active: bool
    created_at: datetime

    model_config = {"from_attributes": True}
