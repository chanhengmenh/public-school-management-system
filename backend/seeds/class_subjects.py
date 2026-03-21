from app.models.class_subject import ClassSubject
from sqlalchemy.orm import Session


def seed(db: Session, classes: dict, subjects: dict, users: dict) -> list:
    teacher1 = users.get("socheata.teacher@iams.edu")
    teacher2 = users.get("bunna.teacher@iams.edu")
    teacher3 = users.get("dara.teacher@iams.edu")
    class_10a = classes.get("Class 10A")
    class_10b = classes.get("Class 10B")
    class_11a = classes.get("Class 11A")

    mappings = [
        (class_10a, subjects.get("MATH101"), teacher1),
        (class_10a, subjects.get("PHYS101"), teacher2),
        (class_10a, subjects.get("ENG101"), teacher3),
        (class_10a, subjects.get("CS101"), teacher1),
        (class_10b, subjects.get("MATH101"), teacher1),
        (class_10b, subjects.get("HIST101"), teacher2),
        (class_10b, subjects.get("ENG101"), teacher3),
        (class_11a, subjects.get("MATH101"), teacher2),
        (class_11a, subjects.get("CS101"), teacher1),
        (class_11a, subjects.get("PHYS101"), teacher3),
    ]

    created = []
    for cls, subj, teacher in mappings:
        if not cls or not subj:
            continue
        existing = db.query(ClassSubject).filter(
            ClassSubject.class_id == cls.id,
            ClassSubject.subject_id == subj.id
        ).first()
        if existing:
            created.append(existing)
            continue
        obj = ClassSubject(
            class_id=cls.id,
            subject_id=subj.id,
            teacher_id=teacher.id if teacher else None,
        )
        db.add(obj)
        db.flush()
        created.append(obj)
    db.commit()
    return created
