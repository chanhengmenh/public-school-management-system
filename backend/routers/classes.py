"""
Classes router - manage academic classes
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import text
from typing import List

from database import get_db
from models.academic import ClassCreate, ClassUpdate, ClassResponse, EnrollmentCreate, EnrollmentResponse
from utils.auth import require_admin, require_teacher, get_current_user

router = APIRouter()


@router.post("/", response_model=ClassResponse, status_code=status.HTTP_201_CREATED)
async def create_class(
    class_data: ClassCreate,
    current_user = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """
    Create a new class (admin only)
    """
    result = db.execute(
        text("""
        INSERT INTO classes (name, academic_year, home_teacher_id)
        VALUES (:name, :academic_year, :home_teacher_id)
        RETURNING id, name, academic_year, home_teacher_id, created_at, updated_at
        """),
        {
            "name": class_data.name,
            "academic_year": class_data.academic_year,
            "home_teacher_id": class_data.home_teacher_id
        }
    )
    db.commit()
    
    new_class = result.fetchone()
    
    return ClassResponse(
        id=str(new_class[0]),
        name=new_class[1],
        academic_year=new_class[2],
        home_teacher_id=str(new_class[3]) if new_class[3] else None,
        created_at=new_class[4],
        updated_at=new_class[5]
    )


@router.get("/", response_model=List[ClassResponse])
async def list_classes(
    academic_year: str = None,
    skip: int = 0,
    limit: int = 100,
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    List all classes
    """
    query = "SELECT id, name, academic_year, home_teacher_id, created_at, updated_at FROM classes"
    params = {}
    
    if academic_year:
        query += " WHERE academic_year = :academic_year"
        params["academic_year"] = academic_year
    
    query += " ORDER BY academic_year DESC, name ASC LIMIT :limit OFFSET :skip"
    params["limit"] = limit
    params["skip"] = skip
    
    classes = db.execute(text(query), params).fetchall()
    
    return [
        ClassResponse(
            id=str(c[0]),
            name=c[1],
            academic_year=c[2],
            home_teacher_id=str(c[3]) if c[3] else None,
            created_at=c[4],
            updated_at=c[5]
        )
        for c in classes
    ]


@router.get("/{class_id}", response_model=ClassResponse)
async def get_class(
    class_id: str,
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get class by ID
    """
    class_data = db.execute(
        text("SELECT id, name, academic_year, home_teacher_id, created_at, updated_at FROM classes WHERE id = :class_id"),
        {"class_id": class_id}
    ).fetchone()
    
    if not class_data:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Class not found"
        )
    
    return ClassResponse(
        id=str(class_data[0]),
        name=class_data[1],
        academic_year=class_data[2],
        home_teacher_id=str(class_data[3]) if class_data[3] else None,
        created_at=class_data[4],
        updated_at=class_data[5]
    )


@router.post("/{class_id}/enroll", response_model=EnrollmentResponse)
async def enroll_student(
    class_id: str,
    enrollment: EnrollmentCreate,
    current_user = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """
    Enroll a student in a class (admin only)
    """
    # Check if already enrolled
    existing = db.execute(
        text("SELECT * FROM enrollments WHERE student_id = :student_id AND class_id = :class_id"),
        {"student_id": enrollment.student_id, "class_id": class_id}
    ).fetchone()
    
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Student already enrolled in this class"
        )
    
    result = db.execute(
        text("""
        INSERT INTO enrollments (student_id, class_id)
        VALUES (:student_id, :class_id)
        RETURNING student_id, class_id, enrolled_at
        """),
        {"student_id": enrollment.student_id, "class_id": class_id}
    )
    db.commit()
    
    enrollment_data = result.fetchone()
    
    return EnrollmentResponse(
        student_id=str(enrollment_data[0]),
        class_id=str(enrollment_data[1]),
        enrolled_at=enrollment_data[2]
    )


@router.get("/{class_id}/students")
async def get_class_students(
    class_id: str,
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get all students enrolled in a class
    """
    students = db.execute(
        text("""
        SELECT u.id, u.email, u.full_name, e.enrolled_at
        FROM users u
        JOIN enrollments e ON u.id = e.student_id
        WHERE e.class_id = :class_id AND u.role IN ('student', 'class_monitor')
        ORDER BY u.full_name
        """),
        {"class_id": class_id}
    ).fetchall()
    
    return [
        {
            "id": str(s[0]),
            "email": s[1],
            "full_name": s[2],
            "enrolled_at": s[3]
        }
        for s in students
    ]
