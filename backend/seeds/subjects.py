from app.models.subject import Subject
from sqlalchemy.orm import Session

# Cambodian Grade 11 curriculum subjects
# Math & Khmer: 2h/session, 2 sessions/week
# All others:   1.5h/session, 2 sessions/week
SEED_SUBJECTS = [
    {"name": "Mathematics",             "code": "MATH101",  "description": "Algebra, calculus, and statistics"},
    {"name": "Physics",                 "code": "PHYS101",  "description": "Mechanics, thermodynamics, and electromagnetism"},
    {"name": "Chemistry",               "code": "CHEM101",  "description": "Organic and inorganic chemistry"},
    {"name": "Biology",                 "code": "BIO101",   "description": "Cell biology, genetics, and ecology"},
    {"name": "English",                 "code": "ENG101",   "description": "Reading, writing, and communication"},
    {"name": "Khmer",                   "code": "KH101",    "description": "Khmer language, literature, grammar, and writing"},
    {"name": "Morality & Civilization", "code": "MOR101",   "description": "Cambodian morality, ethics, and civilization"},
    {"name": "History",                 "code": "HIST101",  "description": "Cambodian and world history"},
    {"name": "Geography",               "code": "GEO101",   "description": "Physical and human geography of Cambodia and the world"},
    {"name": "Art",                     "code": "ART101",   "description": "Drawing, painting, and Cambodian traditional art"},
    {"name": "Economy",                 "code": "ECO101",   "description": "Basic economics, markets, and Cambodian economic development"},
    {"name": "Physical Education",      "code": "PE101",    "description": "Sports, fitness, and health education"},
    {"name": "Earth Science",           "code": "EARTH101", "description": "Geology, meteorology, and environmental science"},
]


def seed(db: Session) -> dict:
    created = {}
    for s in SEED_SUBJECTS:
        existing = db.query(Subject).filter(Subject.code == s["code"]).first()
        if existing:
            created[s["code"]] = existing
            continue
        obj = Subject(**s)
        db.add(obj)
        db.flush()
        created[s["code"]] = obj
    db.commit()
    return created
