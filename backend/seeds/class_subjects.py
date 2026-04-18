from app.models.class_subject import ClassSubject
from sqlalchemy.orm import Session

# Each subject is taught by ONE specialist teacher across ALL 16 classes.
# One teacher → one subject, teaches it in every class section.
#
#   math.teacher    (Sovann Keo)    — MATH101
#   physics.teacher (Piseth Rath)   — PHYS101
#   chem.teacher    (Bopha Pich)    — CHEM101
#   bio.teacher     (Socheat Sok)   — BIO101
#   history.teacher (Kunthea Lim)   — HIST101
#   english.teacher (Sreymom Mao)   — ENG101
#   french.teacher  (Dara Heng)     — FREN101
#   cs.teacher      (Makara Chea)   — CS101
#   pe.teacher      (Vibol Tep)     — PE101
#   art.teacher     (Leakena Ros)   — ART101
#   music.teacher   (Chantha Im)    — MUS101
#
# Four of the teachers also serve as home-class teachers:
#   math.teacher    → Class 10A
#   english.teacher → Class 10B
#   physics.teacher → Class 10C
#   history.teacher → Class 10D

SUBJECT_TEACHER_MAP = {
    "MATH101": "math.teacher@iams.edu",
    "PHYS101": "physics.teacher@iams.edu",
    "CHEM101": "chem.teacher@iams.edu",
    "BIO101":  "bio.teacher@iams.edu",
    "HIST101": "history.teacher@iams.edu",
    "ENG101":  "english.teacher@iams.edu",
    "FREN101": "french.teacher@iams.edu",
    "CS101":   "cs.teacher@iams.edu",
    "PE101":   "pe.teacher@iams.edu",
    "ART101":  "art.teacher@iams.edu",
    "MUS101":  "music.teacher@iams.edu",
    "KH101":   "khmer.teacher@iams.edu",
    "GEO101":  "history.teacher@iams.edu",   # History teacher covers Geography
}

HOME_CLASS_MAP = {
    "math.teacher@iams.edu":    "Class 10A",
    "english.teacher@iams.edu": "Class 10B",
    "physics.teacher@iams.edu": "Class 10C",
    "history.teacher@iams.edu": "Class 10D",
}


def seed(db: Session, classes: dict, subjects: dict, users: dict) -> list:
    teachers = {
        email: users.get(email)
        for email in SUBJECT_TEACHER_MAP.values()
    }

    # Assign each teacher's home class
    for email, class_name in HOME_CLASS_MAP.items():
        teacher = teachers.get(email)
        cls = classes.get(class_name)
        if teacher and cls:
            cls.home_teacher_id = teacher.id

    all_classes = sorted(classes.values(), key=lambda c: c.name)
    subject_codes = list(SUBJECT_TEACHER_MAP.keys())

    created = []

    for cls in all_classes:
        if cls is None:
            continue

        for subject_code in subject_codes:
            subject = subjects.get(subject_code)
            if not subject:
                continue

            teacher_email = SUBJECT_TEACHER_MAP[subject_code]
            teacher = teachers.get(teacher_email)

            existing = db.query(ClassSubject).filter(
                ClassSubject.class_id == cls.id,
                ClassSubject.subject_id == subject.id,
            ).first()
            if existing:
                # Update teacher assignment if it changed
                if teacher and existing.teacher_id != teacher.id:
                    existing.teacher_id = teacher.id
                created.append(existing)
                continue

            obj = ClassSubject(
                class_id=cls.id,
                subject_id=subject.id,
                teacher_id=teacher.id if teacher else None,
            )
            db.add(obj)
            db.flush()
            created.append(obj)

    # Mark the home-class teachers
    for email in HOME_CLASS_MAP:
        teacher = users.get(email)
        if teacher:
            teacher.is_home_teacher = True
            db.merge(teacher)

    db.commit()
    return created
