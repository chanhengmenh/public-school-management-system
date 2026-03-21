from app.models.class_ import Class
from sqlalchemy.orm import Session

SEED_CLASSES = [
    {"name": "Class 10A", "academic_year": "2025-2026"},
    {"name": "Class 10B", "academic_year": "2025-2026"},
    {"name": "Class 11A", "academic_year": "2025-2026"},
]


def seed(db: Session) -> dict:
    created = {}
    for c in SEED_CLASSES:
        existing = db.query(Class).filter(
            Class.name == c["name"], Class.academic_year == c["academic_year"]
        ).first()
        if existing:
            created[c["name"]] = existing
            continue
        obj = Class(**c)
        db.add(obj)
        db.flush()
        created[c["name"]] = obj
    db.commit()
    return created
