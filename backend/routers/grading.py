"""
Grading router - manage scores and feedback
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import text
from pydantic import BaseModel
from typing import Optional
from datetime import datetime

from database import get_db
from utils.auth import require_teacher, get_current_user

router = APIRouter()


class GradeSubmission(BaseModel):
    """Grade submission model"""
    submission_id: str
    points_earned: float
    feedback: Optional[str] = None


class GradeResponse(BaseModel):
    """Grade response model"""
    id: str
    submission_id: str
    points_earned: float
    feedback: Optional[str]
    graded_by: str
    graded_at: datetime


@router.post("/", response_model=GradeResponse)
async def grade_submission(
    grade_data: GradeSubmission,
    current_user = Depends(require_teacher),
    db: Session = Depends(get_db)
):
    """
    Grade a submission (teacher only)
    """
    # Check if already graded
    existing = db.execute(
        text("SELECT id FROM scores WHERE submission_id = :submission_id"),
        {"submission_id": grade_data.submission_id}
    ).fetchone()
    
    if existing:
        # Update existing grade
        result = db.execute(
            text("""
            UPDATE scores
            SET points_earned = :points_earned,
                feedback = :feedback,
                graded_by = :graded_by,
                graded_at = NOW()
            WHERE submission_id = :submission_id
            RETURNING id, submission_id, points_earned, feedback, graded_by, graded_at
            """),
            {
                "submission_id": grade_data.submission_id,
                "points_earned": grade_data.points_earned,
                "feedback": grade_data.feedback,
                "graded_by": current_user.user_id
            }
        )
    else:
        # Create new grade
        result = db.execute(
            text("""
            INSERT INTO scores (submission_id, points_earned, feedback, graded_by)
            VALUES (:submission_id, :points_earned, :feedback, :graded_by)
            RETURNING id, submission_id, points_earned, feedback, graded_by, graded_at
            """),
            {
                "submission_id": grade_data.submission_id,
                "points_earned": grade_data.points_earned,
                "feedback": grade_data.feedback,
                "graded_by": current_user.user_id
            }
        )
    
    db.commit()
    
    grade = result.fetchone()
    
    return GradeResponse(
        id=str(grade[0]),
        submission_id=str(grade[1]),
        points_earned=grade[2],
        feedback=grade[3],
        graded_by=str(grade[4]),
        graded_at=grade[5]
    )


@router.get("/student/{student_id}/class/{class_id}")
async def get_student_grades(
    student_id: str,
    class_id: str,
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get all grades for a student in a class
    """
    # Check authorization (student can only view their own grades)
    if current_user.role == "student" and current_user.user_id != student_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to view these grades"
        )
    
    grades = db.execute(
        text("""
        SELECT a.title, a.total_points, s.points_earned, s.feedback,
               s.graded_at, ts.submitted_at, ts.is_late
        FROM scores s
        JOIN text_submissions ts ON s.submission_id = ts.id
        JOIN assignments a ON ts.assignment_id = a.id
        WHERE ts.student_id = :student_id AND a.class_id = :class_id
        ORDER BY s.graded_at DESC
        """),
        {"student_id": student_id, "class_id": class_id}
    ).fetchall()
    
    return [
        {
            "assignment_title": g[0],
            "total_points": g[1],
            "points_earned": g[2],
            "feedback": g[3],
            "graded_at": g[4],
            "submitted_at": g[5],
            "is_late": g[6],
            "percentage": round((g[2] / g[1]) * 100, 2) if g[1] > 0 else 0
        }
        for g in grades
    ]
