from app.models.enrollment import Enrollment
from app.models.user import UserRole
from sqlalchemy.orm import Session


def seed(db: Session, classes: dict, users: dict) -> None:
    # Get all students sorted by email for consistent assignment
    students = sorted(
        [u for u in users.values() if u.role == UserRole.student],
        key=lambda u: u.email
    )
    
    # Get all classes sorted by name
    all_classes = sorted(classes.values(), key=lambda c: c.name)
    
    # Enroll 25 students per class
    students_per_class = 25
    
    for class_idx, cls in enumerate(all_classes):
        if cls is None:
            continue
        
        # Assign students to this class
        start_idx = class_idx * students_per_class
        end_idx = start_idx + students_per_class
        
        for student in students[start_idx:end_idx]:
            if student is None:
                continue
            
            existing = db.query(Enrollment).filter(
                Enrollment.student_id == student.id,
                Enrollment.class_id == cls.id
            ).first()
            if not existing:
                db.add(Enrollment(student_id=student.id, class_id=cls.id))
    
    db.commit()
