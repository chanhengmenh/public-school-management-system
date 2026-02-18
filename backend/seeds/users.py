from app.models.user import User, UserRole
from app.core.security import hash_password
from sqlalchemy.orm import Session

SEED_USERS = [
    {"email": "admin@iams.edu", "full_name": "System Admin", "role": UserRole.admin, "password": "password123"},
    {"email": "socheata.teacher@iams.edu", "full_name": "Socheata Keo", "role": UserRole.teacher, "password": "password123"},
    {"email": "bunna.teacher@iams.edu", "full_name": "Bunna Rath", "role": UserRole.teacher, "password": "password123"},
    {"email": "dara.teacher@iams.edu", "full_name": "Dara Pich", "role": UserRole.teacher, "password": "password123"},
    {"email": "virak.home@iams.edu", "full_name": "Virak Sok", "role": UserRole.home_teacher, "password": "password123"},
    {"email": "monitor01@iams.edu", "full_name": "Leakena Chan", "role": UserRole.class_monitor, "password": "password123"},
    {"email": "student01@iams.edu", "full_name": "Sophea Lim", "role": UserRole.student, "password": "password123"},
    {"email": "student02@iams.edu", "full_name": "Piseth Mao", "role": UserRole.student, "password": "password123"},
    {"email": "student03@iams.edu", "full_name": "Sreymom Heng", "role": UserRole.student, "password": "password123"},
    {"email": "student04@iams.edu", "full_name": "Vanna Nget", "role": UserRole.student, "password": "password123"},
    {"email": "student05@iams.edu", "full_name": "Ratana Kong", "role": UserRole.student, "password": "password123"},
    {"email": "student06@iams.edu", "full_name": "Bopha Chea", "role": UserRole.student, "password": "password123"},
    {"email": "student07@iams.edu", "full_name": "Sokha Tep", "role": UserRole.student, "password": "password123"},
    {"email": "student08@iams.edu", "full_name": "Chantha Ros", "role": UserRole.student, "password": "password123"},
    {"email": "student09@iams.edu", "full_name": "Kunthea Im", "role": UserRole.student, "password": "password123"},
    {"email": "student10@iams.edu", "full_name": "Makara Sen", "role": UserRole.student, "password": "password123"},
]


def seed(db: Session) -> dict:
    created = {}
    for u in SEED_USERS:
        existing = db.query(User).filter(User.email == u["email"]).first()
        if existing:
            created[u["email"]] = existing
            continue
        user = User(
            email=u["email"],
            full_name=u["full_name"],
            role=u["role"],
            hashed_password=hash_password(u["password"]),
        )
        db.add(user)
        db.flush()
        created[u["email"]] = user
    db.commit()
    return created
