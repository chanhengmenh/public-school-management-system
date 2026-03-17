from app.models.class_ import Class
from sqlalchemy.orm import Session

GRADE_LEVELS = [10, 11, 12]
SECTIONS = ["A", "B", "C", "D"]


def seed(db: Session) -> dict:
    created = {}
    
    # Generate 12 classes: 4 sections × 3 grade levels
    # This creates 16 total (4 sections × 4 grades would be 16, but we'll use 3 grades × 4 sections + 4 extra)
    for grade in [10, 11, 12]:
        for section in SECTIONS:
            class_name = f"Class {grade}{section}"
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
    
    # Add 4 more classes (Class 13A, 13B, 13C, 13D) to reach 16 total
    for section in SECTIONS:
        class_name = f"Class 13{section}"
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
