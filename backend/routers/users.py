"""
User management router - admin operations for managing users
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import text
from typing import List

from database import get_db
from models.user import UserCreate, UserUpdate, UserResponse, UserRole
from utils.auth import get_password_hash, require_admin, get_current_user

router = APIRouter()


@router.get("/", response_model=List[UserResponse])
async def list_users(
    role: UserRole = None,
    skip: int = 0,
    limit: int = 100,
    current_user = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """
    List all users (admin only)
    """
    query = "SELECT id, email, full_name, role, is_active, created_at, updated_at FROM users"
    params = {}
    
    if role:
        query += " WHERE role = :role"
        params["role"] = role.value
    
    query += " ORDER BY created_at DESC LIMIT :limit OFFSET :skip"
    params["limit"] = limit
    params["skip"] = skip
    
    users = db.execute(text(query), params).fetchall()
    
    return [
        UserResponse(
            id=str(user[0]),
            email=user[1],
            full_name=user[2],
            role=UserRole(user[3]),
            is_active=user[4],
            created_at=user[5],
            updated_at=user[6]
        )
        for user in users
    ]


@router.get("/{user_id}", response_model=UserResponse)
async def get_user(
    user_id: str,
    current_user = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """
    Get user by ID (admin only)
    """
    user = db.execute(
        text("SELECT id, email, full_name, role, is_active, created_at, updated_at FROM users WHERE id = :user_id"),
        {"user_id": user_id}
    ).fetchone()
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    return UserResponse(
        id=str(user[0]),
        email=user[1],
        full_name=user[2],
        role=UserRole(user[3]),
        is_active=user[4],
        created_at=user[5],
        updated_at=user[6]
    )


@router.put("/{user_id}", response_model=UserResponse)
async def update_user(
    user_id: str,
    user_update: UserUpdate,
    current_user = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """
    Update user (admin only)
    """
    # Build update query dynamically
    updates = []
    params = {"user_id": user_id}
    
    if user_update.email is not None:
        updates.append("email = :email")
        params["email"] = user_update.email
    
    if user_update.full_name is not None:
        updates.append("full_name = :full_name")
        params["full_name"] = user_update.full_name
    
    if user_update.role is not None:
        updates.append("role = :role")
        params["role"] = user_update.role.value
    
    if user_update.is_active is not None:
        updates.append("is_active = :is_active")
        params["is_active"] = user_update.is_active
    
    if not updates:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No fields to update"
        )
    
    updates.append("updated_at = NOW()")
    
    query = f"""
        UPDATE users
        SET {', '.join(updates)}
        WHERE id = :user_id
        RETURNING id, email, full_name, role, is_active, created_at, updated_at
    """
    
    result = db.execute(text(query), params)
    db.commit()
    
    updated_user = result.fetchone()
    
    if not updated_user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    return UserResponse(
        id=str(updated_user[0]),
        email=updated_user[1],
        full_name=updated_user[2],
        role=UserRole(updated_user[3]),
        is_active=updated_user[4],
        created_at=updated_user[5],
        updated_at=updated_user[6]
    )


@router.delete("/{user_id}")
async def delete_user(
    user_id: str,
    current_user = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """
    Delete user (admin only)
    """
    result = db.execute(
        text("DELETE FROM users WHERE id = :user_id RETURNING id"),
        {"user_id": user_id}
    )
    db.commit()
    
    if not result.fetchone():
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    return {"message": "User deleted successfully"}
