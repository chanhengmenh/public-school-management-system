"""
Run all seeds to populate the database with sample data.
Usage: cd backend && python -m seeds.run_seeds

Pass --wipe to delete all existing data before seeding:
    python -m seeds.run_seeds --wipe
"""
import sys
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.database import SessionLocal
from seeds import (
    users, classes, subjects, class_subjects,
    enrollments, assignments, submissions, grades, attendance,
    schedules, notifications,
)


def wipe_all(db):
    """Truncate all tables in one shot using PostgreSQL CASCADE."""
    from sqlalchemy import text
    tables = [
        "class_schedules", "notifications", "behavior_logs", "attendance",
        "submission_files", "grades", "grade_categories", "assignment_submissions",
        "assignments", "class_subjects", "enrollments", "users", "classes", "subjects",
    ]
    table_list = ", ".join(tables)
    db.execute(text(f"TRUNCATE {table_list} RESTART IDENTITY CASCADE"))
    db.commit()
    print(f"  done: truncated {len(tables)} tables\n")


def run(wipe: bool = False):
    db = SessionLocal()
    try:
        if wipe:
            print("Wiping all existing data...")
            wipe_all(db)

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

        print("Seeding schedules (Grade 11A–11E, Mon–Sat)...")
        schedules.seed(db, seeded_classes, seeded_subjects, seeded_cs)

        print("Seeding notifications (student001–005)...")
        notifications.seed(db, seeded_users)

        print("\nAll seeds completed successfully!")
        print("\nSample credentials (password: password123)  — domain: @srmk.edu.kh")
        print("  Admin:                      admin@srmk.edu.kh")
        print("  Math teacher (home 11A):    sovann.keo@srmk.edu.kh")
        print("  English teacher (home 11B): sreymom.mao@srmk.edu.kh")
        print("  Physics teacher (home 11C): piseth.rath@srmk.edu.kh")
        print("  Khmer teacher (home 11D):   chanthy.noun@srmk.edu.kh")
        print("  History teacher (home 11E): kunthea.lim@srmk.edu.kh")
        print("  Other teachers: bopha.pich / socheat.sok / dara.heng / vibol.tep")
        print("                  leakena.ros / chantha.im / makara.chea / chenda.sen @srmk.edu.kh")
        print("  Students: 2025{num:03d}{lastname}@srmk.edu.kh  (e.g. 2025001lim@srmk.edu.kh)")
        print("    Grade 11A: 2025001lim – 2025030khant  (2025001lim = class monitor)")
        print("    Grade 11B: 2025031lim – 2025060khant  (2025031lim = class monitor)")
        print("    Grade 11C: 2025061lim – 2025090khant  (2025061lim = class monitor)")
        print("    Grade 11D: 2025091lim – 2025120khant  (2025091lim = class monitor)")
        print("    Grade 11E: 2025121lim – 2025150khant  (2025121lim = class monitor)")
    except Exception as e:
        db.rollback()
        print(f"\nSeed error: {e}")
        raise
    finally:
        db.close()


if __name__ == "__main__":
    wipe = "--wipe" in sys.argv
    run(wipe=wipe)
