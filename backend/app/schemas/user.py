from pydantic import BaseModel, EmailStr
from datetime import datetime
from app.models.user import UserRole
from typing import Optional


class UserCreate(BaseModel):
    email: EmailStr
    full_name: str
    password: str
    role: UserRole
    is_home_teacher: bool = False
    is_class_monitor: bool = False


class UserUpdate(BaseModel):
    full_name: Optional[str] = None
    email: Optional[EmailStr] = None
    role: Optional[UserRole] = None
    is_active: Optional[bool] = None
    is_home_teacher: Optional[bool] = None
    is_class_monitor: Optional[bool] = None
    password: Optional[str] = None


class ProfileUpdate(BaseModel):
    """Fields a user can update on their own profile (no role/privilege changes)."""
    full_name: Optional[str] = None
    email: Optional[EmailStr] = None
    password: Optional[str] = None


class UserRead(BaseModel):
    id: int
    email: str
    full_name: str
    role: UserRole
    is_active: bool
    is_home_teacher: bool
    is_class_monitor: bool
    must_change_password: bool
    created_at: datetime

    model_config = {"from_attributes": True}
