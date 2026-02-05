"""
Subjects router - manage academic subjects
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import text
from typing import List

from database import get_db
from models.academic import SubjectCreate, SubjectUpdate, SubjectResponse, ClassSubjectAssignment, ClassSubjectResponse
from utils.auth import require_admin, require_teacher, get_current_user

router = APIRouter()


@router.post("/", response_model=SubjectResponse, status_code=status.HTTP_201_CREATED)
async def create_subject(
    subject_data: SubjectCreate,
    current_user = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """
    Create a new subject (admin only)
    """
    # Check if code already exists
    existing = db.execute(
        text("SELECT id FROM subjects WHERE code = :code"),
        {"code": subject_data.code}
    ).fetchone()
    
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Subject code already exists"
        )
    
    result = db.execute(
        text("""
        INSERT INTO subjects (name, code, description)
        VALUES (:name, :code, :description)
        RETURNING id, name, code, description, created_at
        """),
        {
            "name": subject_data.name,
            "code": subject_data.code,
            "description": subject_data.description
        }
    )
    db.commit()
    
    new_subject = result.fetchone()
    
    return SubjectResponse(
        id=str(new_subject[0]),
        name=new_subject[1],
        code=new_subject[2],
        description=new_subject[3],
        created_at=new_subject[4]
    )


@router.get("/", response_model=List[SubjectResponse])
async def list_subjects(
    skip: int = 0,
    limit: int = 100,
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    List all subjects
    """
    subjects = db.execute(
        text("""
        SELECT id, name, code, description, created_at
        FROM subjects
        ORDER BY name ASC
        LIMIT :limit OFFSET :skip
        """),
        {"limit": limit, "skip": skip}
    ).fetchall()
    
    return [
        SubjectResponse(
            id=str(s[0]),
            name=s[1],
            code=s[2],
            description=s[3],
            created_at=s[4]
        )
        for s in subjects
    ]


@router.post("/assign", response_model=ClassSubjectResponse)
async def assign_subject_to_class(
    assignment: ClassSubjectAssignment,
    current_user = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """
    Assign a subject to a class with a teacher (admin only)
    """
    # Check if already assigned
    existing = db.execute(
        text("""
        SELECT * FROM class_subjects
        WHERE class_id = :class_id AND subject_id = :subject_id
        """),
        {"class_id": assignment.class_id, "subject_id": assignment.subject_id}
    ).fetchone()
    
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Subject already assigned to this class"
        )
    
    result = db.execute(
        text("""
        INSERT INTO class_subjects (class_id, subject_id, teacher_id)
        VALUES (:class_id, :subject_id, :teacher_id)
        RETURNING class_id, subject_id, teacher_id, created_at
        """),
        {
            "class_id": assignment.class_id,
            "subject_id": assignment.subject_id,
            "teacher_id": assignment.teacher_id
        }
    )
    db.commit()
    
    assignment_data = result.fetchone()
    
    return ClassSubjectResponse(
        class_id=str(assignment_data[0]),
        subject_id=str(assignment_data[1]),
        teacher_id=str(assignment_data[2]),
        created_at=assignment_data[3]
    )


@router.get("/class/{class_id}")
async def get_class_subjects(
    class_id: str,
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get all subjects for a class
    """
    subjects = db.execute(
        text("""
        SELECT s.id, s.name, s.code, u.full_name as teacher_name, cs.teacher_id
        FROM subjects s
        JOIN class_subjects cs ON s.id = cs.subject_id
        JOIN users u ON cs.teacher_id = u.id
        WHERE cs.class_id = :class_id
        ORDER BY s.name
        """),
        {"class_id": class_id}
    ).fetchall()
    
    return [
        {
            "id": str(s[0]),
            "name": s[1],
            "code": s[2],
            "teacher_name": s[3],
            "teacher_id": str(s[4])
        }
        for s in subjects
    ]
