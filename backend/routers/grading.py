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
    score: float
    feedback: Optional[str] = None


class GradeResponse(BaseModel):
    """Grade response model"""
    submission_id: str
    score: float
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
        text("SELECT submission_id FROM scores WHERE submission_id = :submission_id"),
        {"submission_id": grade_data.submission_id}
    ).fetchone()
    
    if existing:
        # Update existing grade
        result = db.execute(
            text("""
            UPDATE scores
            SET score = :score,
                feedback = :feedback,
                graded_by = :graded_by,
                graded_at = NOW()
            WHERE submission_id = :submission_id
            RETURNING submission_id, score, feedback, graded_by, graded_at
            """),
            {
                "submission_id": grade_data.submission_id,
                "score": grade_data.score,
                "feedback": grade_data.feedback,
                "graded_by": current_user.user_id
            }
        )
    else:
        # Create new grade
        result = db.execute(
            text("""
            INSERT INTO scores (submission_id, score, feedback, graded_by)
            VALUES (:submission_id, :score, :feedback, :graded_by)
            RETURNING submission_id, score, feedback, graded_by, graded_at
            """),
            {
                "submission_id": grade_data.submission_id,
                "score": grade_data.score,
                "feedback": grade_data.feedback,
                "graded_by": current_user.user_id
            }
        )
    
    db.commit()
    
    grade = result.fetchone()
    
    return GradeResponse(
        submission_id=str(grade[0]),
        score=grade[1],
        feedback=grade[2],
        graded_by=str(grade[3]),
        graded_at=grade[4]
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
         SELECT a.title, a.max_score, s.score, s.feedback,
             s.graded_at, sub.submitted_at, sub.status
         FROM scores s
         JOIN assignment_submissions sub ON s.submission_id = sub.id
         JOIN assignments a ON sub.assignment_id = a.id
         WHERE sub.student_id = :student_id AND a.class_id = :class_id
         ORDER BY s.graded_at DESC
        """),
        {"student_id": student_id, "class_id": class_id}
    ).fetchall()
    
    return [
        {
            "assignment_title": g[0],
            "max_score": g[1],
            "score": g[2],
            "feedback": g[3],
            "graded_at": g[4],
            "submitted_at": g[5],
            "status": g[6],
            "percentage": round((g[2] / g[1]) * 100, 2) if g[1] > 0 else 0
        }
        for g in grades
    ]
