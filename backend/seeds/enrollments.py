from app.models.enrollment import Enrollment
from app.models.user import UserRole
from sqlalchemy.orm import Session


def seed(db: Session, classes: dict, users: dict) -> None:
    class_10a = classes.get("Class 10A")
    class_10b = classes.get("Class 10B")
    class_11a = classes.get("Class 11A")

    students = [u for u in users.values() if u.role == UserRole.student]
    monitor = users.get("monitor01@iams.edu")

    # Enroll first 5 students in 10A, next 5 in 10B
    for i, student in enumerate(students):
        cls = class_10a if i < 5 else class_10b
        existing = db.query(Enrollment).filter(
            Enrollment.student_id == student.id,
            Enrollment.class_id == cls.id
        ).first()
        if not existing:
            db.add(Enrollment(student_id=student.id, class_id=cls.id))

    # Enroll monitor in 10A
    if monitor and class_10a:
        existing = db.query(Enrollment).filter(
            Enrollment.student_id == monitor.id,
            Enrollment.class_id == class_10a.id
        ).first()
        if not existing:
            db.add(Enrollment(student_id=monitor.id, class_id=class_10a.id))

    db.commit()
