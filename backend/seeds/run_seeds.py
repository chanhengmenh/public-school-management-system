"""
Run all seeds to populate the database with sample data.
Usage: cd backend && python -m seeds.run_seeds
"""
import sys
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.database import SessionLocal
from seeds import users, classes, subjects, class_subjects, enrollments, assignments


def run():
    db = SessionLocal()
    try:
        print("Seeding users...")
        seeded_users = users.seed(db)

        print("Seeding classes...")
        seeded_classes = classes.seed(db)

        print("Seeding subjects...")
        seeded_subjects = subjects.seed(db)

        print("Seeding class-subjects...")
        seeded_cs = class_subjects.seed(db, seeded_classes, seeded_subjects, seeded_users)

        print("Seeding enrollments...")
        enrollments.seed(db, seeded_classes, seeded_users)

        print("Seeding assignments...")
        assignments.seed(db, seeded_cs, seeded_users)

        print("All seeds completed successfully!")
    except Exception as e:
        db.rollback()
        print(f"Seed error: {e}")
        raise
    finally:
        db.close()


if __name__ == "__main__":
    run()
