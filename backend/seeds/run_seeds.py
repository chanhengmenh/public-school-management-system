"""
Run all seeds to populate the database with sample data.
Usage: cd backend && python -m seeds.run_seeds
"""
import sys
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.database import SessionLocal
from seeds import (
    users, classes, subjects, class_subjects,
    enrollments, assignments, submissions, grades, attendance,
)


def run():
    db = SessionLocal()
    try:
        print("Seeding users...")
        seeded_users = users.seed(db)

        print("Seeding classes...")
        seeded_classes = classes.seed(db)

        print("Seeding subjects...")
        seeded_subjects = subjects.seed(db)

        print("Seeding class-subjects (teacher assignments + home classes)...")
        seeded_cs = class_subjects.seed(db, seeded_classes, seeded_subjects, seeded_users)

        print("Seeding enrollments...")
        enrollments.seed(db, seeded_classes, seeded_users)

        print("Seeding assignments...")
        assignments.seed(db, seeded_cs, seeded_users)

        print("Seeding submissions...")
        submissions.seed(db)

        print("Seeding grades...")
        grades.seed(db, seeded_users)

        print("Seeding attendance (10 school days)...")
        attendance.seed(db, seeded_classes, seeded_users)

        print("\nAll seeds completed successfully!")
        print("\nSample credentials (password: password123)")
        print("  Admin:              admin@iams.edu")
        print("  Math teacher/Home:  math.teacher@iams.edu    (home class: Class 10A)")
        print("  English teacher:    english.teacher@iams.edu (home class: Class 10B)")
        print("  Physics teacher:    physics.teacher@iams.edu (home class: Class 10C)")
        print("  History teacher:    history.teacher@iams.edu (home class: Class 10D)")
        print("  CS teacher:         cs.teacher@iams.edu")
        print("  Student:            student001@iams.edu (Class 10A, class monitor)")
        print("  Student:            student002@iams.edu (Class 10A)")
    except Exception as e:
        db.rollback()
        print(f"\nSeed error: {e}")
        raise
    finally:
        db.close()


if __name__ == "__main__":
    run()
