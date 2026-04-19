from app.models.class_subject import ClassSubject
from sqlalchemy.orm import Session

# One teacher per subject — each teaches all 5 Grade 11 classes (exactly 5 classes, the max)
SUBJECT_TEACHER_MAP = {
    "MATH101":  "sovann.keo@srmk.edu.kh",
    "PHYS101":  "piseth.rath@srmk.edu.kh",
    "CHEM101":  "bopha.pich@srmk.edu.kh",
    "BIO101":   "socheat.sok@srmk.edu.kh",
    "ENG101":   "sreymom.mao@srmk.edu.kh",
    "KH101":    "chanthy.noun@srmk.edu.kh",
    "MOR101":   "dara.heng@srmk.edu.kh",
    "HIST101":  "kunthea.lim@srmk.edu.kh",
    "GEO101":   "vibol.tep@srmk.edu.kh",
    "ART101":   "leakena.ros@srmk.edu.kh",
    "ECO101":   "chantha.im@srmk.edu.kh",
    "PE101":    "makara.chea@srmk.edu.kh",
    "EARTH101": "chenda.sen@srmk.edu.kh",
}

# One home teacher per Grade 11 class
HOME_CLASS_MAP = {
    "sovann.keo@srmk.edu.kh":   "Grade 11A",
    "sreymom.mao@srmk.edu.kh":  "Grade 11B",
    "piseth.rath@srmk.edu.kh":  "Grade 11C",
    "chanthy.noun@srmk.edu.kh": "Grade 11D",
    "kunthea.lim@srmk.edu.kh":  "Grade 11E",
}


def seed(db: Session, classes: dict, subjects: dict, users: dict) -> list:
    teachers = {email: users.get(email) for email in SUBJECT_TEACHER_MAP.values()}

    # Assign home teachers to classes
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

    # Mark home teachers
    for email in HOME_CLASS_MAP:
        teacher = users.get(email)
        if teacher:
            teacher.is_home_teacher = True
            db.merge(teacher)

    db.commit()
    return created
