from app.models.user import User, UserRole
from app.core.security import hash_password
from sqlalchemy.orm import Session

# 13 teachers — one per subject, each teaches all 5 Grade 11 classes (max 5 classes)
# 5 of them are also home teachers (one per class)
SEED_TEACHERS = [
    {"email": "sovann.keo@srmk.edu.kh",     "full_name": "Sovann Keo"},
    {"email": "piseth.rath@srmk.edu.kh",    "full_name": "Piseth Rath"},
    {"email": "bopha.pich@srmk.edu.kh",     "full_name": "Bopha Pich"},
    {"email": "socheat.sok@srmk.edu.kh",    "full_name": "Socheat Sok"},
    {"email": "sreymom.mao@srmk.edu.kh",    "full_name": "Sreymom Mao"},
    {"email": "chanthy.noun@srmk.edu.kh",   "full_name": "Chanthy Noun"},
    {"email": "dara.heng@srmk.edu.kh",      "full_name": "Dara Heng"},
    {"email": "kunthea.lim@srmk.edu.kh",    "full_name": "Kunthea Lim"},
    {"email": "vibol.tep@srmk.edu.kh",      "full_name": "Vibol Tep"},
    {"email": "leakena.ros@srmk.edu.kh",    "full_name": "Leakena Ros"},
    {"email": "chantha.im@srmk.edu.kh",     "full_name": "Chantha Im"},
    {"email": "makara.chea@srmk.edu.kh",    "full_name": "Makara Chea"},
    {"email": "chenda.sen@srmk.edu.kh",     "full_name": "Chenda Sen"},
]

# Cambodian student name pools
STUDENT_FIRST_NAMES = [
    "Sophea",     "Piseth",   "Sreymom",  "Vanna",    "Ratana",
    "Bopha",      "Sokha",    "Chantha",  "Kunthea",  "Makara",
    "Leakena",    "Malisa",   "Samoan",   "Chenda",   "Phnom",
    "Samra",      "Methy",    "Sreynich", "Nakry",    "Chanlida",
    "Sovoan",     "Thida",    "Nuthida",  "Puthea",   "Sreang",
    "Chansophea", "Touchvina","Rasy",     "Sakada",   "Mony",
]
STUDENT_LAST_NAMES = [
    "Lim",   "Mao",    "Heng",  "Nget",  "Kong",
    "Chea",  "Tep",    "Ros",   "Im",    "Sen",
    "Chan",  "Om",     "Nen",   "Bun",   "Sreap",
    "Net",   "Pou",    "Khen",  "Narn",  "Thou",
    "Siem",  "Khouth", "Dara",  "Pich",  "Houy",
    "Srey",  "Khem",   "Peap",  "Metha", "Khant",
]


def seed(db: Session) -> dict:
    created = {}

    # Admin
    existing = db.query(User).filter(User.email == "admin@srmk.edu.kh").first()
    if existing:
        created["admin@srmk.edu.kh"] = existing
    else:
        admin = User(
            email="admin@srmk.edu.kh",
            full_name="System Admin",
            role=UserRole.admin,
            hashed_password=hash_password("password123"),
            is_home_teacher=False,
            is_class_monitor=False,
            must_change_password=False,
        )
        db.add(admin)
        db.flush()
        created["admin@srmk.edu.kh"] = admin

    # Teachers
    for t in SEED_TEACHERS:
        existing = db.query(User).filter(User.email == t["email"]).first()
        if existing:
            created[t["email"]] = existing
            continue
        user = User(
            email=t["email"],
            full_name=t["full_name"],
            role=UserRole.teacher,
            hashed_password=hash_password("password123"),
            is_home_teacher=False,
            is_class_monitor=False,
            must_change_password=False,
        )
        db.add(user)
        db.flush()
        created[t["email"]] = user

    # 150 students — 30 per class × 5 classes
    # student001–030 → Grade 11A
    # student031–060 → Grade 11B
    # student061–090 → Grade 11C
    # student091–120 → Grade 11D
    # student121–150 → Grade 11E
    for i in range(150):
        student_num = i + 1
        first = STUDENT_FIRST_NAMES[i % len(STUDENT_FIRST_NAMES)]
        # Offset last name by class index (0–4) × 13 so monitors in different
        # classes don't all land on index 0 and end up with identical names.
        class_idx = i // 30  # 0=11A, 1=11B, 2=11C, 3=11D, 4=11E
        last  = STUDENT_LAST_NAMES[(i + class_idx * 13) % len(STUDENT_LAST_NAMES)]
        email = f"2025{student_num:03d}{last.lower()}@srmk.edu.kh"

        existing = db.query(User).filter(User.email == email).first()
        if existing:
            created[email] = existing
            continue

        # First student in each class of 30 becomes class monitor
        is_monitor = (i % 30 == 0)

        user = User(
            email=email,
            full_name=f"{first} {last}",
            role=UserRole.student,
            hashed_password=hash_password("password123"),
            is_home_teacher=False,
            is_class_monitor=is_monitor,
            must_change_password=False,
        )
        db.add(user)
        db.flush()
        created[email] = user

    db.commit()
    return created
