from app.models.assignment import Assignment, AssignmentStatus
from sqlalchemy.orm import Session
from datetime import datetime, timezone, timedelta


def seed(db: Session, class_subjects: list, users: dict) -> None:
    publisher = users.get("socheata.teacher@iams.edu")
    if not publisher or not class_subjects:
        return

    sample_assignments = [
        {
            "title": "Introduction to Algebra",
            "description": "Solve 10 linear equations and show all working steps.",
            "max_score": 100,
            "due_date": datetime.now(timezone.utc) + timedelta(days=7),
            "status": AssignmentStatus.published,
        },
        {
            "title": "Newton's Laws Essay",
            "description": "Write a 500-word essay explaining Newton's three laws with examples.",
            "max_score": 100,
            "due_date": datetime.now(timezone.utc) + timedelta(days=5),
            "status": AssignmentStatus.published,
        },
        {
            "title": "Draft: Advanced Calculus",
            "description": "Upcoming calculus assignment (draft).",
            "max_score": 100,
            "due_date": datetime.now(timezone.utc) + timedelta(days=14),
            "status": AssignmentStatus.draft,
        },
    ]

    for i, cs in enumerate(class_subjects[:3]):
        data = sample_assignments[i % len(sample_assignments)]
        existing = db.query(Assignment).filter(
            Assignment.class_subject_id == cs.id,
            Assignment.title == data["title"]
        ).first()
        if not existing:
            db.add(Assignment(
                class_subject_id=cs.id,
                publisher_id=publisher.id,
                **data,
            ))
    db.commit()
