from app.models.user import User, UserRole
from app.core.security import hash_password
from sqlalchemy.orm import Session

SEED_USERS = [
    {"email": "admin@iams.edu",       "full_name": "System Admin",   "role": UserRole.admin,    "password": "password123"},
    # Subject-specialist teachers — one teacher per subject
    {"email": "math.teacher@iams.edu",    "full_name": "Sovann Keo",    "role": UserRole.teacher, "password": "password123"},
    {"email": "physics.teacher@iams.edu", "full_name": "Piseth Rath",   "role": UserRole.teacher, "password": "password123"},
    {"email": "chem.teacher@iams.edu",    "full_name": "Bopha Pich",    "role": UserRole.teacher, "password": "password123"},
    {"email": "bio.teacher@iams.edu",     "full_name": "Socheat Sok",   "role": UserRole.teacher, "password": "password123"},
    {"email": "history.teacher@iams.edu", "full_name": "Kunthea Lim",   "role": UserRole.teacher, "password": "password123"},
    {"email": "english.teacher@iams.edu", "full_name": "Sreymom Mao",   "role": UserRole.teacher, "password": "password123"},
    {"email": "french.teacher@iams.edu",  "full_name": "Dara Heng",     "role": UserRole.teacher, "password": "password123"},
    {"email": "cs.teacher@iams.edu",      "full_name": "Makara Chea",   "role": UserRole.teacher, "password": "password123"},
    {"email": "pe.teacher@iams.edu",      "full_name": "Vibol Tep",     "role": UserRole.teacher, "password": "password123"},
    {"email": "art.teacher@iams.edu",     "full_name": "Leakena Ros",   "role": UserRole.teacher, "password": "password123"},
    {"email": "music.teacher@iams.edu",   "full_name": "Chantha Im",    "role": UserRole.teacher, "password": "password123"},
]

# Generate student list dynamically
STUDENT_NAMES = [
    "Sophea", "Piseth", "Sreymom", "Vanna", "Ratana", "Bopha", "Sokha", "Chantha", "Kunthea", "Makara",
    "Leakena", "MalisA", "Samoan", "Chenda", "Phnom", "Samra", "Methy", "Srey", "Nak", "Khmer",
    "Sovoan", "Thida", "Nuth", "Puth", "Sre", "Chan", "Touch", "Rasy", "Saka", "Moneys",
]
STUDENT_SURNAMES = [
    "Lim", "Mao", "Heng", "Nget", "Kong", "Chea", "Tep", "Ros", "Im", "Sen",
    "Chan", "Om", "Nen", "Bun", "Sreap", "Net", "Pou", "Khen", "Narn", "Thou",
    "Siem", "Khouth", "Dara", "Pich", "Houy", "Srey", "Khem", "Peap", "Metha", "Khant",
]


def seed(db: Session) -> dict:
    created = {}
    
    # Seed teachers and admin
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
            is_home_teacher=False,
            is_class_monitor=False,
        )
        db.add(user)
        db.flush()
        created[u["email"]] = user
    
    # Generate 400 students (16 classes * 25 students per class)
    for i in range(400):
        student_num = i + 1
        student_name = STUDENT_NAMES[i % len(STUDENT_NAMES)]
        student_surname = STUDENT_SURNAMES[i % len(STUDENT_SURNAMES)]
        email = f"student{student_num:03d}@iams.edu"
        full_name = f"{student_name} {student_surname}"
        
        existing = db.query(User).filter(User.email == email).first()
        if existing:
            created[email] = existing
            continue
        
        # First student in each class becomes class monitor
        is_monitor = (i % 25 == 0)
        
        user = User(
            email=email,
            full_name=full_name,
            role=UserRole.student,
            hashed_password=hash_password("password123"),
            is_home_teacher=False,
            is_class_monitor=is_monitor,
        )
        db.add(user)
        db.flush()
        created[email] = user
    
    db.commit()
    return created
