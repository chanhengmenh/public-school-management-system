from app.models.submission import AssignmentSubmission
from app.models.assignment import Assignment, AssignmentStatus
from app.models.class_subject import ClassSubject
from app.models.enrollment import Enrollment
from sqlalchemy.orm import Session
from datetime import datetime, timezone, timedelta

# Varied submission content per subject feel.
SUBMISSION_TEXTS = [
    (
        "I have completed this assignment carefully. "
        "Below are my answers with all working steps shown."
    ),
    (
        "After reviewing the course material, I approached each problem step by step. "
        "Please see my full solutions below."
    ),
    (
        "Here is my completed work. I checked each answer before submitting "
        "and I am confident in my solutions."
    ),
    (
        "I worked through every question methodically. "
        "My reasoning and calculations are laid out below."
    ),
    (
        "This assignment helped me solidify my understanding of the topic. "
        "All answers and explanations are included below."
    ),
    (
        "I referenced the textbook and my class notes while completing this. "
        "My full submission is below."
    ),
    (
        "I have answered all required questions. "
        "Each solution includes reasoning and, where applicable, supporting calculations."
    ),
    (
        "Please find my completed work below. "
        "I made sure to show every step clearly so the marking process is straightforward."
    ),
    (
        "I spent extra time on the harder questions to make sure I understood the concepts. "
        "My solutions are presented below."
    ),
    (
        "I enjoyed working through this assignment. "
        "My answers and brief explanations are provided below."
    ),
]


def seed(db: Session) -> list:
    """
    For every published, past-due assignment create submissions for 80 % of enrolled students
    (the first 20 out of 25 in each class, ordered by student_id).
    Students 1–4 submit 4–5 days early; students 5–8 submit 2–3 days early;
    the rest submit 1 day before the deadline.
    """
    now = datetime.now(timezone.utc)
    created = []

    past_assignments = (
        db.query(Assignment)
        .join(ClassSubject, Assignment.class_subject_id == ClassSubject.id)
        .filter(
            Assignment.status == AssignmentStatus.published,
            Assignment.due_date < now,
        )
        .all()
    )

    for assignment in past_assignments:
        class_id = assignment.class_subject.class_id

        enrollments = (
            db.query(Enrollment)
            .filter(Enrollment.class_id == class_id)
            .order_by(Enrollment.student_id)
            .limit(20)  # 80 % of a 25-student class
            .all()
        )

        for i, enrollment in enumerate(enrollments):
            existing = db.query(AssignmentSubmission).filter(
                AssignmentSubmission.assignment_id == assignment.id,
                AssignmentSubmission.student_id == enrollment.student_id,
            ).first()
            if existing:
                created.append(existing)
                continue

            # Stagger submission times: earlier students submit earlier
            if i < 4:
                days_before = 4 + (i % 2)   # 4–5 days early
            elif i < 8:
                days_before = 2 + (i % 2)   # 2–3 days early
            else:
                days_before = 1              # 1 day before deadline

            submitted_at = assignment.due_date - timedelta(days=days_before)
            content = SUBMISSION_TEXTS[i % len(SUBMISSION_TEXTS)]

            obj = AssignmentSubmission(
                assignment_id=assignment.id,
                student_id=enrollment.student_id,
                content=content,
                submitted_at=submitted_at,
                is_late=False,
            )
            db.add(obj)
            db.flush()
            created.append(obj)

        db.commit()  # commit per assignment to keep transactions small

    return created
