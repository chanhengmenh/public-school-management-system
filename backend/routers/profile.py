"""
Profile router - current user profile
"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import text
from pydantic import BaseModel
from typing import Optional

from database import get_db
from utils.auth import get_current_user
from models.user import UserResponse, UserRole

router = APIRouter()


class ProfileUpdate(BaseModel):
    """Profile update model"""
    full_name: Optional[str] = None
    email: Optional[str] = None


@router.get("/", response_model=UserResponse)
async def get_profile(
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get current user profile"""
    user = db.execute(
        text("""
        SELECT id, email, full_name, role, is_active, created_at, updated_at
        FROM users WHERE id = :user_id
        """),
        {"user_id": current_user.user_id}
    ).fetchone()

    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    return UserResponse(
        id=str(user[0]),
        email=user[1],
        full_name=user[2],
        role=UserRole(user[3]),
        is_active=user[4],
        created_at=user[5],
        updated_at=user[6]
    )


@router.put("/", response_model=UserResponse)
async def update_profile(
    update: ProfileUpdate,
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update current user profile"""
    updates = []
    params: dict[str, object] = {"user_id": current_user.user_id}

    if update.full_name is not None:
        updates.append("full_name = :full_name")
        params["full_name"] = update.full_name

    if update.email is not None:
        updates.append("email = :email")
        params["email"] = update.email

    if not updates:
        raise HTTPException(status_code=400, detail="No fields to update")

    updates.append("updated_at = NOW()")

    query = f"""
        UPDATE users
        SET {', '.join(updates)}
        WHERE id = :user_id
        RETURNING id, email, full_name, role, is_active, created_at, updated_at
    """

    result = db.execute(text(query), params)
    db.commit()

    user = result.fetchone()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    return UserResponse(
        id=str(user[0]),
        email=user[1],
        full_name=user[2],
        role=UserRole(user[3]),
        is_active=user[4],
        created_at=user[5],
        updated_at=user[6]
    )
