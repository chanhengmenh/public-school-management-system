"""
Seed script — creates an admin user (and optional demo users).
Run from backend/ with the venv active:
    python seed.py
"""
import sys, os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app.database import SessionLocal
from app.models.user import User, UserRole
from app.core.security import hash_password

SEED_USERS = [
    {
        "email": "admin@iams.edu",
        "full_name": "System Admin",
        "password": "admin123",
        "role": UserRole.admin,
    },
    {
        "email": "teacher@iams.edu",
        "full_name": "Demo Teacher",
        "password": "teacher123",
        "role": UserRole.teacher,
    },
    {
        "email": "student@iams.edu",
        "full_name": "Demo Student",
        "password": "student123",
        "role": UserRole.student,
    },
]


def seed():
    db = SessionLocal()
    try:
        created = 0
        for u in SEED_USERS:
            exists = db.query(User).filter(User.email == u["email"]).first()
            if exists:
                print(f"  skip  {u['email']} (already exists)")
                continue
            user = User(
                email=u["email"],
                full_name=u["full_name"],
                hashed_password=hash_password(u["password"]),
                role=u["role"],
                is_active=True,
            )
            db.add(user)
            created += 1
            print(f"  create {u['email']}  role={u['role'].value}  password={u['password']}")
        db.commit()
        print(f"\nDone — {created} user(s) created.")
    finally:
        db.close()


if __name__ == "__main__":
    seed()
