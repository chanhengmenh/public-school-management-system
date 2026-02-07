"""
Messages router - direct message threads
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import text
from pydantic import BaseModel
from typing import List, Optional

from database import get_db
from utils.auth import get_current_user

router = APIRouter()


class ThreadCreate(BaseModel):
    """Message thread creation model"""
    subject: str
    member_ids: List[str]


class ThreadResponse(BaseModel):
    """Message thread response model"""
    id: str
    subject: str
    created_by: str
    created_at: str
    member_count: int


class MessageCreate(BaseModel):
    """Message create model"""
    body: str


class MessageResponse(BaseModel):
    """Message response model"""
    id: str
    thread_id: str
    sender_id: str
    body: str
    created_at: str


@router.get("/threads", response_model=list[ThreadResponse])
async def list_threads(
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """List message threads for the current user"""
    rows = db.execute(
        text("""
        SELECT t.id, t.subject, t.created_by, t.created_at,
               COUNT(m.user_id) as member_count
        FROM message_threads t
        JOIN message_thread_members m ON t.id = m.thread_id
        WHERE m.user_id = :user_id
        GROUP BY t.id
        ORDER BY t.created_at DESC
        """),
        {"user_id": current_user.user_id}
    ).fetchall()

    return [
        ThreadResponse(
            id=str(row[0]),
            subject=row[1],
            created_by=str(row[2]),
            created_at=str(row[3]),
            member_count=row[4]
        )
        for row in rows
    ]


@router.post("/threads", response_model=ThreadResponse, status_code=status.HTTP_201_CREATED)
async def create_thread(
    thread: ThreadCreate,
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Create a new message thread"""
    result = db.execute(
        text("""
        INSERT INTO message_threads (subject, created_by)
        VALUES (:subject, :created_by)
        RETURNING id, subject, created_by, created_at
        """),
        {"subject": thread.subject, "created_by": current_user.user_id}
    )

    row = result.fetchone()

    member_ids = set(thread.member_ids)
    member_ids.add(current_user.user_id)

    for member_id in member_ids:
        db.execute(
            text("""
            INSERT INTO message_thread_members (thread_id, user_id)
            VALUES (:thread_id, :user_id)
            """),
            {"thread_id": row[0], "user_id": member_id}
        )

    db.commit()

    return ThreadResponse(
        id=str(row[0]),
        subject=row[1],
        created_by=str(row[2]),
        created_at=str(row[3]),
        member_count=len(member_ids)
    )


@router.get("/threads/{thread_id}/messages", response_model=list[MessageResponse])
async def list_messages(
    thread_id: str,
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """List messages for a thread"""
    member = db.execute(
        text("""
        SELECT 1 FROM message_thread_members
        WHERE thread_id = :thread_id AND user_id = :user_id
        """),
        {"thread_id": thread_id, "user_id": current_user.user_id}
    ).fetchone()

    if not member:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not a thread member")

    rows = db.execute(
        text("""
        SELECT id, thread_id, sender_id, body, created_at
        FROM messages
        WHERE thread_id = :thread_id
        ORDER BY created_at ASC
        """),
        {"thread_id": thread_id}
    ).fetchall()

    return [
        MessageResponse(
            id=str(row[0]),
            thread_id=str(row[1]),
            sender_id=str(row[2]),
            body=row[3],
            created_at=str(row[4])
        )
        for row in rows
    ]


@router.post("/threads/{thread_id}/messages", response_model=MessageResponse, status_code=status.HTTP_201_CREATED)
async def send_message(
    thread_id: str,
    message: MessageCreate,
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Send a message in a thread"""
    member = db.execute(
        text("""
        SELECT 1 FROM message_thread_members
        WHERE thread_id = :thread_id AND user_id = :user_id
        """),
        {"thread_id": thread_id, "user_id": current_user.user_id}
    ).fetchone()

    if not member:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not a thread member")

    result = db.execute(
        text("""
        INSERT INTO messages (thread_id, sender_id, body)
        VALUES (:thread_id, :sender_id, :body)
        RETURNING id, thread_id, sender_id, body, created_at
        """),
        {"thread_id": thread_id, "sender_id": current_user.user_id, "body": message.body}
    )

    db.commit()

    row = result.fetchone()

    return MessageResponse(
        id=str(row[0]),
        thread_id=str(row[1]),
        sender_id=str(row[2]),
        body=row[3],
        created_at=str(row[4])
    )
