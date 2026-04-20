"""
DB reset script — truncates all data tables in FK-safe order,
then creates a single Super Admin account.

Usage (from backend/):
    python reset_db.py
    python reset_db.py --email admin@srmk.edu.kh --password MySecret123
"""

import argparse
import sys
from sqlalchemy import text
from app.database import SessionLocal, engine, Base
from app.models import (  # noqa: F401 — ensure all models are imported so Base.metadata is populated
    user, class_, subject, class_subject, enrollment, assignment,
    submission, submission_file, grade, grade_category, attendance,
    behavior_log, schedule, notification, announcement, material,
    audit_log,
)
from app.models.user import User, UserRole
from app.core.security import hash_password

# Tables in delete order (children before parents)
DELETE_ORDER = [
    "submission_files",
    "assignment_submissions",
    "grades",
    "grade_categories",
    "materials",
    "assignments",
    "attendance",
    "behavior_logs",
    "class_schedules",
    "notifications",
    "announcements",
    "audit_logs",
    "enrollments",
    "class_subjects",
    "classes",
    "subjects",
    "users",
]


def reset(email: str, password: str) -> None:
    db = SessionLocal()
    try:
        print("Truncating tables...")
        with engine.begin() as conn:
            conn.execute(text("SET session_replication_role = replica;"))  # disable FK checks (Postgres)
            for table in DELETE_ORDER:
                conn.execute(text(f'TRUNCATE TABLE "{table}" RESTART IDENTITY CASCADE;'))
            conn.execute(text("SET session_replication_role = DEFAULT;"))
        print("  ✓ All tables cleared")

        admin = User(
            email=email,
            full_name="Super Admin",
            hashed_password=hash_password(password),
            role=UserRole.admin,
            is_active=True,
            is_home_teacher=False,
            is_class_monitor=False,
        )
        db.add(admin)
        db.commit()
        db.refresh(admin)
        print(f"  ✓ Super Admin created — id={admin.id}  email={admin.email}")
        print("\nDone. Login with:")
        print(f"  Email:    {email}")
        print(f"  Password: {password}")
    except Exception as e:
        db.rollback()
        print(f"ERROR: {e}", file=sys.stderr)
        sys.exit(1)
    finally:
        db.close()


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Reset DB and create Super Admin")
    parser.add_argument("--email", default="admin@srmk.edu.kh")
    parser.add_argument("--password", default="Admin@1234")
    args = parser.parse_args()

    confirm = input(
        f"⚠️  This will DELETE ALL DATA and create a fresh admin ({args.email}).\n"
        "Type 'yes' to continue: "
    )
    if confirm.strip().lower() != "yes":
        print("Aborted.")
        sys.exit(0)

    reset(args.email, args.password)
