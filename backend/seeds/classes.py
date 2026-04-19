from app.models.class_ import Class
from sqlalchemy.orm import Session

# Grade 11 only — 5 sections, 30 students each (150 students total)
SECTIONS = ["A", "B", "C", "D", "E"]
GRADE = 11


def seed(db: Session) -> dict:
    created = {}
    for section in SECTIONS:
        class_name = f"Grade {GRADE}{section}"
        c = {"name": class_name, "academic_year": "2025-2026"}

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
