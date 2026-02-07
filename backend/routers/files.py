"""
Files router - manage learning resources
"""
from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from sqlalchemy import text
from pydantic import BaseModel
from typing import Optional, List

from database import get_db
from utils.auth import require_teacher, get_current_user

router = APIRouter()


class FileItem(BaseModel):
    """Resource file metadata"""
    file_path: str
    file_type: Optional[str] = None
    file_size: Optional[int] = None


class ResourceCreate(BaseModel):
    """Resource creation model"""
    title: str
    description: Optional[str] = None
    subject_id: Optional[str] = None
    visibility: Optional[str] = "class"
    files: List[FileItem] = []


class ResourceResponse(BaseModel):
    """Resource response model"""
    id: str
    title: str
    description: Optional[str]
    subject_id: Optional[str]
    uploaded_by: Optional[str]
    visibility: Optional[str]
    created_at: str
    updated_at: str
    files: List[FileItem]


@router.get("/", response_model=list[ResourceResponse])
async def list_resources(
    subject_id: Optional[str] = None,
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """List learning resources"""
    query = """
        SELECT id, title, description, subject_id, uploaded_by, visibility, created_at, updated_at
        FROM learning_resources
    """
    params: dict[str, object] = {}
    if subject_id:
        query += " WHERE subject_id = :subject_id"
        params["subject_id"] = subject_id
    query += " ORDER BY created_at DESC"

    rows = db.execute(text(query), params).fetchall()
    resources = []

    for row in rows:
        files = db.execute(
            text("""
            SELECT file_path, file_type, file_size
            FROM resource_files
            WHERE resource_id = :resource_id
            """),
            {"resource_id": row[0]}
        ).fetchall()

        resources.append(
            ResourceResponse(
                id=str(row[0]),
                title=row[1],
                description=row[2],
                subject_id=str(row[3]) if row[3] else None,
                uploaded_by=str(row[4]) if row[4] else None,
                visibility=row[5],
                created_at=str(row[6]),
                updated_at=str(row[7]),
                files=[
                    FileItem(file_path=f[0], file_type=f[1], file_size=f[2])
                    for f in files
                ]
            )
        )

    return resources


@router.post("/", response_model=ResourceResponse, status_code=status.HTTP_201_CREATED)
async def create_resource(
    resource: ResourceCreate,
    current_user = Depends(require_teacher),
    db: Session = Depends(get_db)
):
    """Create a learning resource (teacher/admin)"""
    result = db.execute(
        text("""
        INSERT INTO learning_resources (title, description, subject_id, uploaded_by, visibility)
        VALUES (:title, :description, :subject_id, :uploaded_by, :visibility)
        RETURNING id, title, description, subject_id, uploaded_by, visibility, created_at, updated_at
        """),
        {
            "title": resource.title,
            "description": resource.description,
            "subject_id": resource.subject_id,
            "uploaded_by": current_user.user_id,
            "visibility": resource.visibility
        }
    )

    row = result.fetchone()

    for file_item in resource.files:
        db.execute(
            text("""
            INSERT INTO resource_files (resource_id, file_path, file_type, file_size)
            VALUES (:resource_id, :file_path, :file_type, :file_size)
            """),
            {
                "resource_id": row[0],
                "file_path": file_item.file_path,
                "file_type": file_item.file_type,
                "file_size": file_item.file_size
            }
        )

    db.commit()

    return ResourceResponse(
        id=str(row[0]),
        title=row[1],
        description=row[2],
        subject_id=str(row[3]) if row[3] else None,
        uploaded_by=str(row[4]) if row[4] else None,
        visibility=row[5],
        created_at=str(row[6]),
        updated_at=str(row[7]),
        files=resource.files
    )
