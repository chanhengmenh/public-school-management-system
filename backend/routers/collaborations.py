"""
Collaborations router - shared spaces and posts
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import text
from pydantic import BaseModel
from typing import List, Optional

from database import get_db
from utils.auth import get_current_user

router = APIRouter()


class SpaceCreate(BaseModel):
    """Collaboration space creation model"""
    name: str
    description: Optional[str] = None
    member_ids: List[str]


class SpaceResponse(BaseModel):
    """Collaboration space response model"""
    id: str
    name: str
    description: Optional[str]
    owner_id: str
    created_at: str
    member_count: int


class PostCreate(BaseModel):
    """Collaboration post create model"""
    content: str


class PostResponse(BaseModel):
    """Collaboration post response model"""
    id: str
    space_id: str
    author_id: str
    content: str
    created_at: str


@router.get("/", response_model=list[SpaceResponse])
async def list_spaces(
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """List collaboration spaces for the current user"""
    rows = db.execute(
        text("""
        SELECT s.id, s.name, s.description, s.owner_id, s.created_at,
               COUNT(m.user_id) as member_count
        FROM collaboration_spaces s
        JOIN collaboration_members m ON s.id = m.space_id
        WHERE m.user_id = :user_id
        GROUP BY s.id
        ORDER BY s.created_at DESC
        """),
        {"user_id": current_user.user_id}
    ).fetchall()

    return [
        SpaceResponse(
            id=str(row[0]),
            name=row[1],
            description=row[2],
            owner_id=str(row[3]),
            created_at=str(row[4]),
            member_count=row[5]
        )
        for row in rows
    ]


@router.post("/", response_model=SpaceResponse, status_code=status.HTTP_201_CREATED)
async def create_space(
    space: SpaceCreate,
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Create a collaboration space"""
    result = db.execute(
        text("""
        INSERT INTO collaboration_spaces (name, description, owner_id)
        VALUES (:name, :description, :owner_id)
        RETURNING id, name, description, owner_id, created_at
        """),
        {"name": space.name, "description": space.description, "owner_id": current_user.user_id}
    )

    row = result.fetchone()

    member_ids = set(space.member_ids)
    member_ids.add(current_user.user_id)

    for member_id in member_ids:
        db.execute(
            text("""
            INSERT INTO collaboration_members (space_id, user_id)
            VALUES (:space_id, :user_id)
            """),
            {"space_id": row[0], "user_id": member_id}
        )

    db.commit()

    return SpaceResponse(
        id=str(row[0]),
        name=row[1],
        description=row[2],
        owner_id=str(row[3]),
        created_at=str(row[4]),
        member_count=len(member_ids)
    )


@router.get("/{space_id}/posts", response_model=list[PostResponse])
async def list_posts(
    space_id: str,
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """List collaboration posts for a space"""
    member = db.execute(
        text("""
        SELECT 1 FROM collaboration_members
        WHERE space_id = :space_id AND user_id = :user_id
        """),
        {"space_id": space_id, "user_id": current_user.user_id}
    ).fetchone()

    if not member:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not a space member")

    rows = db.execute(
        text("""
        SELECT id, space_id, author_id, content, created_at
        FROM collaboration_posts
        WHERE space_id = :space_id
        ORDER BY created_at ASC
        """),
        {"space_id": space_id}
    ).fetchall()

    return [
        PostResponse(
            id=str(row[0]),
            space_id=str(row[1]),
            author_id=str(row[2]),
            content=row[3],
            created_at=str(row[4])
        )
        for row in rows
    ]


@router.post("/{space_id}/posts", response_model=PostResponse, status_code=status.HTTP_201_CREATED)
async def create_post(
    space_id: str,
    post: PostCreate,
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Create a collaboration post"""
    member = db.execute(
        text("""
        SELECT 1 FROM collaboration_members
        WHERE space_id = :space_id AND user_id = :user_id
        """),
        {"space_id": space_id, "user_id": current_user.user_id}
    ).fetchone()

    if not member:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not a space member")

    result = db.execute(
        text("""
        INSERT INTO collaboration_posts (space_id, author_id, content)
        VALUES (:space_id, :author_id, :content)
        RETURNING id, space_id, author_id, content, created_at
        """),
        {"space_id": space_id, "author_id": current_user.user_id, "content": post.content}
    )

    db.commit()

    row = result.fetchone()

    return PostResponse(
        id=str(row[0]),
        space_id=str(row[1]),
        author_id=str(row[2]),
        content=row[3],
        created_at=str(row[4])
    )
