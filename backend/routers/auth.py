"""
Authentication router - handles login, registration, and token management
"""
from fastapi import APIRouter, Depends, HTTPException, status, Response
from sqlalchemy.orm import Session
from sqlalchemy import text
from datetime import timedelta
from typing import List

from database import get_db
from models.user import UserCreate, UserLogin, UserResponse, Token, UserRole
from utils.auth import (
    get_password_hash,
    verify_password,
    create_access_token,
    get_current_user,
    require_admin
)
from config import get_settings

settings = get_settings()
router = APIRouter()


@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
async def register(user: UserCreate, db: Session = Depends(get_db)):
    """
    Register a new user (admin only in production, open for demo)
    """
    # Check if user already exists
    existing_user = db.execute(
        text("SELECT * FROM users WHERE email = :email"),
        {"email": user.email}
    ).fetchone()
    
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    # Hash password
    hashed_password = get_password_hash(user.password)
    
    # Insert user
    result = db.execute(
        text("""
        INSERT INTO users (email, password_hash, full_name, role)
        VALUES (:email, :password_hash, :full_name, :role)
        RETURNING id, email, full_name, role, is_active, created_at, updated_at
        """),
        {
            "email": user.email,
            "password_hash": hashed_password,
            "full_name": user.full_name,
            "role": user.role.value
        }
    )
    db.commit()
    
    new_user = result.fetchone()
    
    return UserResponse(
        id=str(new_user[0]),
        email=new_user[1],
        full_name=new_user[2],
        role=UserRole(new_user[3]),
        is_active=new_user[4],
        created_at=new_user[5],
        updated_at=new_user[6]
    )


@router.post("/login", response_model=Token)
async def login(credentials: UserLogin, response: Response, db: Session = Depends(get_db)):
    """
    Login and receive JWT token
    """
    # Find user
    user = db.execute(
        text("SELECT id, email, password_hash, role, is_active FROM users WHERE email = :email"),
        {"email": credentials.email}
    ).fetchone()
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password"
        )
    
    # Verify password
    if not verify_password(credentials.password, user[2]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password"
        )
    
    # Check if user is active
    if not user[4]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="User account is inactive"
        )
    
    # Create access token
    access_token = create_access_token(
        data={
            "sub": str(user[0]),
            "email": user[1],
            "role": user[3]
        },
        expires_delta=timedelta(minutes=settings.access_token_expire_minutes)
    )
    
    response.set_cookie(
        key="access_token",
        value=access_token,
        httponly=True,
        samesite="lax",
        max_age=settings.access_token_expire_minutes * 60
    )

    return Token(access_token=access_token)


@router.get("/me", response_model=UserResponse)
async def get_current_user_info(current_user = Depends(get_current_user), db: Session = Depends(get_db)):
    """
    Get current user information
    """
    user = db.execute(
        text("SELECT id, email, full_name, role, is_active, created_at, updated_at FROM users WHERE id = :user_id"),
        {"user_id": current_user.user_id}
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


@router.post("/logout")
async def logout(response: Response):
    """
    Logout (client should discard token)
    """
    response.delete_cookie("access_token")
    return {"message": "Successfully logged out"}
