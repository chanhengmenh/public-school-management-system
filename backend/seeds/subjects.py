from app.models.subject import Subject
from sqlalchemy.orm import Session

SEED_SUBJECTS = [
    {"name": "Mathematics", "code": "MATH101", "description": "Algebra, calculus, and statistics"},
    {"name": "Physics", "code": "PHYS101", "description": "Mechanics, thermodynamics, and electromagnetism"},
    {"name": "Chemistry", "code": "CHEM101", "description": "Organic and inorganic chemistry"},
    {"name": "Biology", "code": "BIO101", "description": "Cell biology, genetics, and ecology"},
    {"name": "History", "code": "HIST101", "description": "World and Cambodian history"},
    {"name": "English", "code": "ENG101", "description": "Reading, writing, and communication"},
    {"name": "French", "code": "FREN101", "description": "French language and culture"},
    {"name": "Computer Science", "code": "CS101", "description": "Programming and algorithms"},
    {"name": "Physical Education", "code": "PE101", "description": "Sports and fitness"},
    {"name": "Art", "code": "ART101", "description": "Drawing, painting, and sculpture"},
    {"name": "Music", "code": "MUS101", "description": "Music theory and performance"},
]


def seed(db: Session) -> dict:
    created = {}
    for s in SEED_SUBJECTS:
        existing = db.query(Subject).filter(Subject.code == s["code"]).first()
        if existing:
            created[s["code"]] = existing
            continue
        obj = Subject(**s)
        db.add(obj)
        db.flush()
        created[s["code"]] = obj
    db.commit()
    return created
