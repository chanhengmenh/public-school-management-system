"""
Analytics router - student rankings and performance analytics
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from pydantic import BaseModel

from database import get_db
from utils.auth import require_teacher, get_current_user

router = APIRouter()


class StudentRanking(BaseModel):
    """Student ranking model"""
    student_id: str
    student_name: str
    total_points: float
    average_score: float
    rank: int
    total_assignments: int


class ClassAnalytics(BaseModel):
    """Class analytics model"""
    class_id: str
    class_name: str
    total_students: int
    average_score: float
    highest_score: float
    lowest_score: float
    completion_rate: float


@router.get("/class/{class_id}/rankings", response_model=List[StudentRanking])
async def get_class_rankings(
    class_id: str,
    subject_id: str = None,
    current_user = Depends(require_teacher),
    db: Session = Depends(get_db)
):
    """
    Get student rankings for a class (teacher only)
    """
    query = """
        WITH student_scores AS (
            SELECT 
                ts.student_id,
                u.full_name,
                SUM(s.points_earned) as total_points,
                AVG(s.points_earned / a.total_points * 100) as average_score,
                COUNT(DISTINCT ts.assignment_id) as total_assignments
            FROM text_submissions ts
            JOIN users u ON ts.student_id = u.id
            JOIN assignments a ON ts.assignment_id = a.id
            LEFT JOIN scores s ON ts.id = s.submission_id
            WHERE a.class_id = :class_id
    """
    
    params = {"class_id": class_id}
    
    if subject_id:
        query += " AND a.subject_id = :subject_id"
        params["subject_id"] = subject_id
    
    query += """
            GROUP BY ts.student_id, u.full_name
        )
        SELECT 
            student_id,
            full_name,
            total_points,
            average_score,
            total_assignments,
            RANK() OVER (ORDER BY average_score DESC) as rank
        FROM student_scores
        ORDER BY rank ASC
    """
    
    rankings = db.execute(query, params).fetchall()
    
    return [
        StudentRanking(
            student_id=str(r[0]),
            student_name=r[1],
            total_points=r[2] or 0,
            average_score=round(r[3] or 0, 2),
            total_assignments=r[4],
            rank=r[5]
        )
        for r in rankings
    ]


@router.get("/class/{class_id}/analytics", response_model=ClassAnalytics)
async def get_class_analytics(
    class_id: str,
    current_user = Depends(require_teacher),
    db: Session = Depends(get_db)
):
    """
    Get analytics for a class (teacher only)
    """
    # Get class info
    class_info = db.execute(
        "SELECT name FROM classes WHERE id = :class_id",
        {"class_id": class_id}
    ).fetchone()
    
    if not class_info:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Class not found"
        )
    
    # Get analytics
    analytics = db.execute(
        """
        SELECT 
            COUNT(DISTINCT e.student_id) as total_students,
            AVG(s.points_earned / a.total_points * 100) as average_score,
            MAX(s.points_earned / a.total_points * 100) as highest_score,
            MIN(s.points_earned / a.total_points * 100) as lowest_score,
            COUNT(DISTINCT ts.student_id)::float / NULLIF(COUNT(DISTINCT e.student_id), 0) * 100 as completion_rate
        FROM enrollments e
        LEFT JOIN text_submissions ts ON e.student_id = ts.student_id
        LEFT JOIN assignments a ON ts.assignment_id = a.id AND a.class_id = :class_id
        LEFT JOIN scores s ON ts.id = s.submission_id
        WHERE e.class_id = :class_id
        """,
        {"class_id": class_id}
    ).fetchone()
    
    return ClassAnalytics(
        class_id=class_id,
        class_name=class_info[0],
        total_students=analytics[0] or 0,
        average_score=round(analytics[1] or 0, 2),
        highest_score=round(analytics[2] or 0, 2),
        lowest_score=round(analytics[3] or 0, 2),
        completion_rate=round(analytics[4] or 0, 2)
    )


@router.get("/student/{student_id}/behavior-analysis")
async def get_student_behavior_analysis(
    student_id: str,
    class_id: str = None,
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get behavior analysis for a student
    """
    # Check authorization
    if current_user.role == "student" and current_user.user_id != student_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to view this data"
        )
    
    query = """
        SELECT 
            AVG(ts.typing_speed_wpm) as avg_typing_speed,
            AVG(ts.paste_ratio) as avg_paste_ratio,
            AVG(ts.active_time_seconds) as avg_active_time,
            COUNT(CASE WHEN ts.input_mode = 'typed' THEN 1 END) as typed_count,
            COUNT(CASE WHEN ts.input_mode = 'pasted' THEN 1 END) as pasted_count,
            COUNT(CASE WHEN ts.input_mode = 'mixed' THEN 1 END) as mixed_count
        FROM text_submissions ts
        JOIN assignments a ON ts.assignment_id = a.id
        WHERE ts.student_id = :student_id
    """
    
    params = {"student_id": student_id}
    
    if class_id:
        query += " AND a.class_id = :class_id"
        params["class_id"] = class_id
    
    analysis = db.execute(query, params).fetchone()
    
    return {
        "student_id": student_id,
        "avg_typing_speed_wpm": round(analysis[0] or 0, 2),
        "avg_paste_ratio": round(analysis[1] or 0, 2),
        "avg_active_time_seconds": round(analysis[2] or 0, 2),
        "input_mode_distribution": {
            "typed": analysis[3] or 0,
            "pasted": analysis[4] or 0,
            "mixed": analysis[5] or 0
        }
    }
