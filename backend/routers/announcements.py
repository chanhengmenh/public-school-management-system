"""
Announcements router - manage announcements
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import text
from pydantic import BaseModel
from typing import Optional

from database import get_db
from utils.auth import require_teacher, get_current_user

router = APIRouter()


class AnnouncementCreate(BaseModel):
    """Announcement creation model"""
    title: str
    content: str
    target_audience: Optional[str] = "all"


class AnnouncementResponse(BaseModel):
    """Announcement response model"""
    id: str
    title: str
    content: str
    author_id: str
    target_audience: Optional[str]
    created_at: str


@router.get("/", response_model=list[AnnouncementResponse])
async def list_announcements(
    class_id: Optional[str] = None,
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """List announcements for the current user"""
    role_value = current_user.role.value if hasattr(current_user.role, "value") else str(current_user.role)
    conditions = []
    params: dict[str, object] = {}

    if role_value != "admin":
        conditions.append("(target_audience = 'all' OR target_audience = :role)")
        params["role"] = role_value
        if class_id:
            conditions.append("target_audience = :class_target")
            params["class_target"] = f"class:{class_id}"

    query = """
        SELECT id, title, content, author_id, target_audience, created_at
        FROM announcements
    """
    if conditions:
        query += " WHERE " + " OR ".join(conditions)
    query += " ORDER BY created_at DESC"

    rows = db.execute(text(query), params).fetchall()

    return [
        AnnouncementResponse(
            id=str(row[0]),
            title=row[1],
            content=row[2],
            author_id=str(row[3]) if row[3] else "",
            target_audience=row[4],
            created_at=str(row[5])
        )
        for row in rows
    ]


@router.post("/", response_model=AnnouncementResponse, status_code=status.HTTP_201_CREATED)
async def create_announcement(
    announcement: AnnouncementCreate,
    current_user = Depends(require_teacher),
    db: Session = Depends(get_db)
):
    """Create an announcement (teacher/admin)"""
    result = db.execute(
        text("""
        INSERT INTO announcements (title, content, author_id, target_audience)
        VALUES (:title, :content, :author_id, :target_audience)
        RETURNING id, title, content, author_id, target_audience, created_at
        """),
        {
            "title": announcement.title,
            "content": announcement.content,
            "author_id": current_user.user_id,
            "target_audience": announcement.target_audience
        }
    )
    db.commit()

    row = result.fetchone()

    return AnnouncementResponse(
        id=str(row[0]),
        title=row[1],
        content=row[2],
        author_id=str(row[3]) if row[3] else "",
        target_audience=row[4],
        created_at=str(row[5])
    )
