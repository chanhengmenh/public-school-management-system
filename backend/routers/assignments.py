"""
Assignments router - manage assignments and submissions
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import text
from datetime import datetime

from database import get_db
from models.assignment import AssignmentCreate, AssignmentResponse
from models.submission import TextSubmissionCreate, FileSubmissionCreate, SubmissionResponse
from utils.auth import require_teacher, require_student, get_current_user

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
            title, description, subject_id, class_id, publisher_id,
            due_date, max_score, allowed_submission_types
        )
        VALUES (
            :title, :description, :subject_id, :class_id, :publisher_id,
            :due_date, :max_score, :allowed_submission_types
        )
        RETURNING id, title, description, subject_id, class_id, publisher_id,
                  due_date, max_score, allowed_submission_types, created_at, updated_at
        """),
        {
            "title": assignment_data.title,
            "description": assignment_data.description,
            "subject_id": assignment_data.subject_id,
            "class_id": assignment_data.class_id,
            "publisher_id": current_user.user_id,
            "due_date": assignment_data.due_date,
            "max_score": assignment_data.max_score,
            "allowed_submission_types": assignment_data.allowed_submission_types
        }
    )
    db.commit()

    assignment = result.fetchone()

    return AssignmentResponse(
        id=str(assignment[0]),
        title=assignment[1],
        description=assignment[2],
        subject_id=str(assignment[3]),
        class_id=str(assignment[4]),
        publisher_id=str(assignment[5]),
        due_date=assignment[6],
        max_score=assignment[7],
        allowed_submission_types=assignment[8],
        created_at=assignment[9],
        updated_at=assignment[10]
    )


@router.get("/class/{class_id}", response_model=list[AssignmentResponse])
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
        SELECT id, title, description, subject_id, class_id, publisher_id,
               due_date, max_score, allowed_submission_types, created_at, updated_at
        FROM assignments
        WHERE class_id = :class_id
    """
    params = {"class_id": class_id}

    if subject_id:
        query += " AND subject_id = :subject_id"
        params["subject_id"] = subject_id

    query += " ORDER BY due_date DESC NULLS LAST"

    assignments = db.execute(text(query), params).fetchall()

    return [
        AssignmentResponse(
            id=str(a[0]),
            title=a[1],
            description=a[2],
            subject_id=str(a[3]),
            class_id=str(a[4]),
            publisher_id=str(a[5]),
            due_date=a[6],
            max_score=a[7],
            allowed_submission_types=a[8],
            created_at=a[9],
            updated_at=a[10]
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
    Submit a text assignment (student only)
    """
    assignment = db.execute(
        text("SELECT id, due_date FROM assignments WHERE id = :id"),
        {"id": assignment_id}
    ).fetchone()

    if not assignment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Assignment not found"
        )

    existing = db.execute(
        text("""
        SELECT id FROM assignment_submissions
        WHERE assignment_id = :assignment_id AND student_id = :student_id
        """),
        {"assignment_id": assignment_id, "student_id": current_user.user_id}
    ).fetchone()

    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Submission already exists"
        )

    status_value = "submitted"
    if assignment[1] and datetime.utcnow() > assignment[1]:
        status_value = "late"

    result = db.execute(
        text("""
        INSERT INTO assignment_submissions (
            assignment_id, student_id, submission_type, status
        )
        VALUES (:assignment_id, :student_id, :submission_type, :status)
        RETURNING id, assignment_id, student_id, submission_type, submitted_at, status
        """),
        {
            "assignment_id": assignment_id,
            "student_id": current_user.user_id,
            "submission_type": "text",
            "status": status_value
        }
    )

    submission_row = result.fetchone()

    db.execute(
        text("""
        INSERT INTO submission_text (submission_id, content)
        VALUES (:submission_id, :content)
        """),
        {"submission_id": submission_row[0], "content": submission.content}
    )

    for event in submission.behavior_events:
        payload = dict(event.payload)
        payload["timestamp"] = event.timestamp.isoformat()
        db.execute(
            text("""
            INSERT INTO behavior_logs (submission_id, event_type, payload)
            VALUES (:submission_id, :event_type, :payload)
            """),
            {
                "submission_id": submission_row[0],
                "event_type": event.event_type,
                "payload": payload
            }
        )

    db.commit()

    return SubmissionResponse(
        id=str(submission_row[0]),
        assignment_id=str(submission_row[1]),
        student_id=str(submission_row[2]),
        submission_type=submission_row[3],
        submitted_at=submission_row[4],
        status=submission_row[5]
    )


@router.post("/{assignment_id}/submit/file", response_model=SubmissionResponse)
async def submit_file_assignment(
    assignment_id: str,
    submission: FileSubmissionCreate,
    current_user = Depends(require_student),
    db: Session = Depends(get_db)
):
    """
    Submit a file assignment (student only)
    """
    assignment = db.execute(
        text("SELECT id, due_date FROM assignments WHERE id = :id"),
        {"id": assignment_id}
    ).fetchone()

    if not assignment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Assignment not found"
        )

    existing = db.execute(
        text("""
        SELECT id FROM assignment_submissions
        WHERE assignment_id = :assignment_id AND student_id = :student_id
        """),
        {"assignment_id": assignment_id, "student_id": current_user.user_id}
    ).fetchone()

    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Submission already exists"
        )

    status_value = "submitted"
    if assignment[1] and datetime.utcnow() > assignment[1]:
        status_value = "late"

    result = db.execute(
        text("""
        INSERT INTO assignment_submissions (
            assignment_id, student_id, submission_type, status
        )
        VALUES (:assignment_id, :student_id, :submission_type, :status)
        RETURNING id, assignment_id, student_id, submission_type, submitted_at, status
        """),
        {
            "assignment_id": assignment_id,
            "student_id": current_user.user_id,
            "submission_type": "file",
            "status": status_value
        }
    )

    submission_row = result.fetchone()

    for file_path in submission.file_paths:
        db.execute(
            text("""
            INSERT INTO submission_files (submission_id, file_path)
            VALUES (:submission_id, :file_path)
            """),
            {"submission_id": submission_row[0], "file_path": file_path}
        )

    db.commit()

    return SubmissionResponse(
        id=str(submission_row[0]),
        assignment_id=str(submission_row[1]),
        student_id=str(submission_row[2]),
        submission_type=submission_row[3],
        submitted_at=submission_row[4],
        status=submission_row[5]
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
        SELECT s.id, s.student_id, u.full_name, st.content,
               s.submission_type, s.status, s.submitted_at,
               sc.score, sc.feedback, sc.graded_at
        FROM assignment_submissions s
        JOIN users u ON s.student_id = u.id
        LEFT JOIN submission_text st ON st.submission_id = s.id
        LEFT JOIN scores sc ON sc.submission_id = s.id
        WHERE s.assignment_id = :assignment_id
        ORDER BY s.submitted_at DESC
        """),
        {"assignment_id": assignment_id}
    ).fetchall()

    return [
        {
            "id": str(sub[0]),
            "student_id": str(sub[1]),
            "student_name": sub[2],
            "content": sub[3],
            "submission_type": sub[4],
            "status": sub[5],
            "submitted_at": sub[6],
            "score": sub[7],
            "feedback": sub[8],
            "graded_at": sub[9]
        }
        for sub in submissions
    ]
