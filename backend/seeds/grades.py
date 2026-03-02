from app.models.grade import Grade
from app.models.submission import AssignmentSubmission
from app.models.class_subject import ClassSubject
from app.models.assignment import Assignment
from app.models.user import UserRole
from sqlalchemy.orm import Session

FEEDBACK_TEMPLATES = [
    "Good work! Your solution is clear and well-organised.",
    "Well done. You demonstrated a solid understanding of the material.",
    "Excellent effort — keep it up!",
    "Good attempt. Review sections 3 and 4 for a deeper understanding.",
    "Satisfactory work. Some steps need a bit more detail.",
    "Good progress. Practise more problems to build confidence.",
    "Very good! Your explanation is clear and your calculations are accurate.",
    "Decent effort. Pay more attention to showing all working steps.",
    "Nice work. A few minor errors, but overall a strong submission.",
    "Good job. Your grasp of the core concepts is evident.",
    "Excellent! Full marks — every step is shown and every answer is correct.",
    "Nearly perfect. Double-check your final answers before submitting next time.",
    "Good understanding shown. Work on the presentation of your solutions.",
    "Solid submission. The reasoning is sound even where the arithmetic slipped.",
    "Impressive work. You clearly put in real effort on this assignment.",
    "Competent submission. Focus on explaining your reasoning, not just the answer.",
    "Well structured. A couple of calculation errors cost you a few marks.",
    "Good job overall. Keep reviewing the topics where you lost marks.",
    "Strong performance. You are on the right track — keep it up!",
    "Satisfactory. Revisit the lecture notes and try the practice problems again.",
]


def seed(db: Session, users: dict) -> None:
    """
    Create one Grade for every ungraded AssignmentSubmission.
    Scores follow a realistic distribution (55–100) derived deterministically
    from the student and assignment IDs so re-runs produce the same grades.
    The grading teacher is taken from the ClassSubject that owns the assignment.
    """
    # Dynamic lookup — works with any number of teachers
    teacher_by_id = {u.id: u for u in users.values() if u.role == UserRole.teacher}
    teachers = list(teacher_by_id.values())

    # Fetch all submissions that do not yet have a grade
    ungraded = (
        db.query(AssignmentSubmission)
        .outerjoin(Grade, Grade.submission_id == AssignmentSubmission.id)
        .filter(Grade.id.is_(None))
        .all()
    )

    for i, sub in enumerate(ungraded):
        # Resolve the grading teacher from the class_subject
        teacher = teachers[i % len(teachers)]  # fallback
        if sub.assignment and sub.assignment.class_subject:
            cs_teacher_id = sub.assignment.class_subject.teacher_id
            if cs_teacher_id and cs_teacher_id in teacher_by_id:
                teacher = teacher_by_id[cs_teacher_id]

        # Deterministic score in range 55–100:
        # base 65–94 from student×assignment hash, ±5 band from loop index
        base = 65 + ((sub.student_id * 7 + sub.assignment_id * 11) % 30)
        variation = (i % 11) - 5        # −5 … +5
        score = min(100, max(55, base + variation))

        feedback = FEEDBACK_TEMPLATES[i % len(FEEDBACK_TEMPLATES)]

        db.add(Grade(
            submission_id=sub.id,
            score=score,
            feedback=feedback,
            graded_by=teacher.id,
        ))

    db.commit()
