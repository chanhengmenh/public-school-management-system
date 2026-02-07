"""
Analytics router - student rankings and performance analytics
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import text
from typing import List
from pydantic import BaseModel
from datetime import datetime

from database import get_db
from utils.auth import require_teacher, get_current_user
from services.behavior_service import BehaviorAnalyticsService

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
                sub.student_id,
                u.full_name,
                SUM(s.score) as total_points,
                AVG(s.score / a.max_score * 100) as average_score,
                COUNT(DISTINCT sub.assignment_id) as total_assignments
            FROM assignment_submissions sub
            JOIN users u ON sub.student_id = u.id
            JOIN assignments a ON sub.assignment_id = a.id
            LEFT JOIN scores s ON sub.id = s.submission_id
            WHERE a.class_id = :class_id
    """
    
    params = {"class_id": class_id}
    
    if subject_id:
        query += " AND a.subject_id = :subject_id"
        params["subject_id"] = subject_id
    
    query += """
            GROUP BY sub.student_id, u.full_name
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
            AVG(s.score / a.max_score * 100) as average_score,
            MAX(s.score / a.max_score * 100) as highest_score,
            MIN(s.score / a.max_score * 100) as lowest_score,
            COUNT(DISTINCT sub.student_id)::float / NULLIF(COUNT(DISTINCT e.student_id), 0) * 100 as completion_rate
        FROM enrollments e
        LEFT JOIN assignment_submissions sub ON e.student_id = sub.student_id
        LEFT JOIN assignments a ON sub.assignment_id = a.id AND a.class_id = :class_id
        LEFT JOIN scores s ON sub.id = s.submission_id
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
        SELECT bl.event_type, bl.payload
        FROM behavior_logs bl
        JOIN assignment_submissions sub ON bl.submission_id = sub.id
        JOIN assignments a ON sub.assignment_id = a.id
        WHERE sub.student_id = :student_id
    """

    params = {"student_id": student_id}

    if class_id:
        query += " AND a.class_id = :class_id"
        params["class_id"] = class_id

    rows = db.execute(text(query), params).fetchall()

    behavior_events = []
    for event_type, payload in rows:
        payload_data = payload or {}
        timestamp_value = payload_data.get("timestamp")
        if isinstance(timestamp_value, str):
            try:
                timestamp = datetime.fromisoformat(timestamp_value)
            except ValueError:
                timestamp = datetime.utcnow()
        elif isinstance(timestamp_value, datetime):
            timestamp = timestamp_value
        else:
            timestamp = datetime.utcnow()

        behavior_events.append(
            {
                "event_type": event_type,
                "timestamp": timestamp,
                "payload": payload_data
            }
        )

    analytics = BehaviorAnalyticsService.analyze_submission_behavior(behavior_events)

    return {
        "student_id": student_id,
        "avg_typing_speed_wpm": analytics["typing_speed_wpm"],
        "avg_paste_ratio": analytics["paste_ratio"],
        "avg_active_time_seconds": analytics["active_time_seconds"],
        "input_mode_distribution": {
            "typed": 1 if analytics["input_mode"] == "typed" else 0,
            "pasted": 1 if analytics["input_mode"] == "pasted" else 0,
            "mixed": 1 if analytics["input_mode"] == "mixed" else 0
        }
    }
