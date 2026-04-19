from app.models.enrollment import Enrollment
from app.models.user import UserRole
from sqlalchemy.orm import Session

STUDENTS_PER_CLASS = 30


def seed(db: Session, classes: dict, users: dict) -> None:
    students = sorted(
        [u for u in users.values() if u.role == UserRole.student],
        key=lambda u: u.email,
    )

    all_classes = sorted(classes.values(), key=lambda c: c.name)

    for class_idx, cls in enumerate(all_classes):
        if cls is None:
            continue

        start = class_idx * STUDENTS_PER_CLASS
        end = start + STUDENTS_PER_CLASS

        for student in students[start:end]:
            if student is None:
                continue
            existing = db.query(Enrollment).filter(
                Enrollment.student_id == student.id,
                Enrollment.class_id == cls.id,
            ).first()
            if not existing:
                db.add(Enrollment(student_id=student.id, class_id=cls.id))

    db.commit()
