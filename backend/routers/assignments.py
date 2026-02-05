"""
Assignments router - manage assignments and submissions
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import text
from typing import List
from datetime import datetime

from database import get_db
from models.assignment import AssignmentCreate, AssignmentUpdate, AssignmentResponse
from models.submission import TextSubmissionCreate, FileSubmissionCreate, SubmissionResponse
from utils.auth import require_teacher, require_student, get_current_user
from services.behavior_service import BehaviorAnalyticsService

router = APIRouter()


@router.post("/", response_model=AssignmentResponse, status_code=status.HTTP_201_CREATED)
async def create_assignment(
    assignment_data: AssignmentCreate,
    current_user = Depends(require_teacher),
    db: Session = Depends(get_db)
):
    """
    Create a new assignment (teacher only)
    """
    result = db.execute(
        text("""
        INSERT INTO assignments (
            class_id, subject_id, teacher_id, title, description,
            assignment_type, due_date, total_points, allow_late_submission
        )
        VALUES (
            :class_id, :subject_id, :teacher_id, :title, :description,
            :assignment_type, :due_date, :total_points, :allow_late_submission
        )
        RETURNING id, class_id, subject_id, teacher_id, title, description,
                  assignment_type, due_date, total_points, allow_late_submission,
                  created_at, updated_at
        """),
        {
            "class_id": assignment_data.class_id,
            "subject_id": assignment_data.subject_id,
            "teacher_id": current_user.user_id,
            "title": assignment_data.title,
            "description": assignment_data.description,
            "assignment_type": assignment_data.assignment_type,
            "due_date": assignment_data.due_date,
            "total_points": assignment_data.total_points,
            "allow_late_submission": assignment_data.allow_late_submission
        }
    )
    db.commit()
    
    assignment = result.fetchone()
    
    return AssignmentResponse(
        id=str(assignment[0]),
        class_id=str(assignment[1]),
        subject_id=str(assignment[2]),
        teacher_id=str(assignment[3]),
        title=assignment[4],
        description=assignment[5],
        assignment_type=assignment[6],
        due_date=assignment[7],
        total_points=assignment[8],
        allow_late_submission=assignment[9],
        created_at=assignment[10],
        updated_at=assignment[11]
    )


@router.get("/class/{class_id}", response_model=List[AssignmentResponse])
async def get_class_assignments(
    class_id: str,
    subject_id: str = None,
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get all assignments for a class
    """
    query = """
        SELECT id, class_id, subject_id, teacher_id, title, description,
               assignment_type, due_date, total_points, allow_late_submission,
               created_at, updated_at
        FROM assignments
        WHERE class_id = :class_id
    """
    params = {"class_id": class_id}
    
    if subject_id:
        query += " AND subject_id = :subject_id"
        params["subject_id"] = subject_id
    
    query += " ORDER BY due_date DESC"
    
    assignments = db.execute(text(query), params).fetchall()
    
    return [
        AssignmentResponse(
            id=str(a[0]),
            class_id=str(a[1]),
            subject_id=str(a[2]),
            teacher_id=str(a[3]),
            title=a[4],
            description=a[5],
            assignment_type=a[6],
            due_date=a[7],
            total_points=a[8],
            allow_late_submission=a[9],
            created_at=a[10],
            updated_at=a[11]
        )
        for a in assignments
    ]


@router.post("/{assignment_id}/submit/text", response_model=SubmissionResponse)
async def submit_text_assignment(
    assignment_id: str,
    submission: TextSubmissionCreate,
    current_user = Depends(require_student),
    db: Session = Depends(get_db)
):
    """
    Submit a text assignment with behavior tracking (student only)
    """
    # Check if assignment exists
    assignment = db.execute(
        text("SELECT id, due_date, allow_late_submission FROM assignments WHERE id = :id"),
        {"id": assignment_id}
    ).fetchone()
    
    if not assignment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Assignment not found"
        )
    
    # Check if late
    is_late = datetime.now() > assignment[1]
    if is_late and not assignment[2]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Late submissions not allowed for this assignment"
        )
    
    # Analyze behavior
    behavior_analysis = BehaviorAnalyticsService.analyze_submission_behavior(
        submission.behavior_events
    )
    
    # Create submission
    result = db.execute(
        text("""
        INSERT INTO text_submissions (
            assignment_id, student_id, content, is_late,
            typed_chars, pasted_chars, typing_speed_wpm,
            paste_ratio, active_time_seconds, input_mode
        )
        VALUES (
            :assignment_id, :student_id, :content, :is_late,
            :typed_chars, :pasted_chars, :typing_speed_wpm,
            :paste_ratio, :active_time_seconds, :input_mode
        )
        RETURNING id, assignment_id, student_id, content, is_late,
                  typed_chars, pasted_chars, typing_speed_wpm,
                  paste_ratio, active_time_seconds, input_mode,
                  submitted_at
        """),
        {
            "assignment_id": assignment_id,
            "student_id": current_user.user_id,
            "content": submission.content,
            "is_late": is_late,
            "typed_chars": behavior_analysis["typed_chars"],
            "pasted_chars": behavior_analysis["pasted_chars"],
            "typing_speed_wpm": behavior_analysis["typing_speed_wpm"],
            "paste_ratio": behavior_analysis["paste_ratio"],
            "active_time_seconds": behavior_analysis["active_time_seconds"],
            "input_mode": behavior_analysis["input_mode"]
        }
    )
    
    # Log behavior events
    submission_id = result.fetchone()[0]
    for event in submission.behavior_events:
        db.execute(
            text("""
            INSERT INTO behavior_logs (submission_id, event_type, event_data)
            VALUES (:submission_id, :event_type, :event_data)
            """),
            {
                "submission_id": submission_id,
                "event_type": event.event_type,
                "event_data": event.payload
            }
        )
    
    db.commit()
    
    submission_data = result.fetchone()
    
    return SubmissionResponse(
        id=str(submission_data[0]),
        assignment_id=str(submission_data[1]),
        student_id=str(submission_data[2]),
        content=submission_data[3],
        is_late=submission_data[4],
        typed_chars=submission_data[5],
        pasted_chars=submission_data[6],
        typing_speed_wpm=submission_data[7],
        paste_ratio=submission_data[8],
        active_time_seconds=submission_data[9],
        input_mode=submission_data[10],
        submitted_at=submission_data[11]
    )


@router.get("/{assignment_id}/submissions")
async def get_assignment_submissions(
    assignment_id: str,
    current_user = Depends(require_teacher),
    db: Session = Depends(get_db)
):
    """
    Get all submissions for an assignment (teacher only)
    """
    submissions = db.execute(
        text("""
        SELECT ts.id, ts.student_id, u.full_name, ts.content,
               ts.typed_chars, ts.pasted_chars, ts.typing_speed_wpm,
               ts.paste_ratio, ts.input_mode, ts.is_late, ts.submitted_at,
               s.points_earned, s.graded_at
        FROM text_submissions ts
        JOIN users u ON ts.student_id = u.id
        LEFT JOIN scores s ON ts.id = s.submission_id
        WHERE ts.assignment_id = :assignment_id
        ORDER BY ts.submitted_at DESC
        """),
        {"assignment_id": assignment_id}
    ).fetchall()
    
    return [
        {
            "id": str(sub[0]),
            "student_id": str(sub[1]),
            "student_name": sub[2],
            "content": sub[3],
            "typed_chars": sub[4],
            "pasted_chars": sub[5],
            "typing_speed_wpm": sub[6],
            "paste_ratio": sub[7],
            "input_mode": sub[8],
            "is_late": sub[9],
            "submitted_at": sub[10],
            "points_earned": sub[11],
            "graded_at": sub[12]
        }
        for sub in submissions
    ]
