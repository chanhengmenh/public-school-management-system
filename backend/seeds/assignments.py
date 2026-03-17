from app.models.assignment import Assignment, AssignmentStatus
from app.models.user import UserRole
from sqlalchemy.orm import Session
from datetime import datetime, timezone, timedelta

# Subject-specific assignment templates keyed by subject code.
# days_offset < 0 → already past due (submissions will be seeded for these).
# days_offset > 0 → upcoming (open for submission but not yet due).
SUBJECT_ASSIGNMENTS = {
    "MATH101": [
        {
            "title": "Linear Equations — Chapter 1 Problem Set",
            "description": (
                "Solve problems 1–20 on linear equations. "
                "Show all working steps and verify each answer by substitution."
            ),
            "max_score": 100,
            "days_offset": -14,
            "status": AssignmentStatus.published,
        },
        {
            "title": "Quadratic Functions Quiz",
            "description": (
                "Answer all 10 questions on quadratic functions, factoring, "
                "and the quadratic formula. Show your working clearly."
            ),
            "max_score": 50,
            "days_offset": 10,
            "status": AssignmentStatus.published,
        },
    ],
    "ENG101": [
        {
            "title": "Descriptive Essay — My Hometown",
            "description": (
                "Write a 400–600 word descriptive essay about your hometown. "
                "Focus on vivid sensory details: sights, sounds, smells, and textures."
            ),
            "max_score": 100,
            "days_offset": -10,
            "status": AssignmentStatus.published,
        },
        {
            "title": "Book Summary — Chapter 1–3",
            "description": (
                "Write a concise summary (200–300 words) of the first three chapters "
                "of the assigned novel. Identify the main characters and central conflict."
            ),
            "max_score": 50,
            "days_offset": 7,
            "status": AssignmentStatus.published,
        },
    ],
    "PHYS101": [
        {
            "title": "Newton's Laws — Lab Write-up",
            "description": (
                "Complete the lab report for the force and motion experiment. "
                "Include hypothesis, procedure, data table, and conclusion."
            ),
            "max_score": 100,
            "days_offset": -7,
            "status": AssignmentStatus.published,
        },
        {
            "title": "Energy and Work — Problem Set",
            "description": (
                "Solve the 12 problems on kinetic energy, potential energy, and work. "
                "Include diagrams where appropriate."
            ),
            "max_score": 100,
            "days_offset": 14,
            "status": AssignmentStatus.published,
        },
    ],
    "CHEM101": [
        {
            "title": "Periodic Table Quiz",
            "description": (
                "Identify the atomic number, symbol, and group for each of the 20 given elements. "
                "Then describe one practical use for three elements of your choice."
            ),
            "max_score": 100,
            "days_offset": -5,
            "status": AssignmentStatus.published,
        },
        {
            "title": "Chemical Bonding Report",
            "description": (
                "Write a short report (250–350 words) explaining the difference between "
                "ionic, covalent, and metallic bonds. Provide one real-world example of each."
            ),
            "max_score": 50,
            "days_offset": 12,
            "status": AssignmentStatus.published,
        },
    ],
    "BIO101": [
        {
            "title": "Cell Structure Diagram",
            "description": (
                "Draw and label the organelles of both an animal cell and a plant cell. "
                "Below each diagram, describe the function of every labelled organelle."
            ),
            "max_score": 100,
            "days_offset": -12,
            "status": AssignmentStatus.published,
        },
        {
            "title": "Genetics Problem Set",
            "description": (
                "Complete the 8 Punnett square problems on dominant and recessive traits. "
                "State the genotypic and phenotypic ratios for each cross."
            ),
            "max_score": 80,
            "days_offset": 9,
            "status": AssignmentStatus.published,
        },
    ],
    "HIST101": [
        {
            "title": "Khmer Empire Research Paper",
            "description": (
                "Write a 500-word research paper on the Khmer Empire's cultural and "
                "architectural achievements, with a focus on Angkor Wat."
            ),
            "max_score": 100,
            "days_offset": -8,
            "status": AssignmentStatus.published,
        },
        {
            "title": "World War II Timeline",
            "description": (
                "Create a chronological timeline of 15 key events of World War II (1939–1945). "
                "For each event write one sentence explaining its significance."
            ),
            "max_score": 50,
            "days_offset": 11,
            "status": AssignmentStatus.published,
        },
    ],
    "CS101": [
        {
            "title": "Python Basics — Variables & Loops",
            "description": (
                "Write a Python program that reads 10 numbers from the user and outputs "
                "their sum, average, minimum, and maximum. Include comments in your code."
            ),
            "max_score": 100,
            "days_offset": -6,
            "status": AssignmentStatus.published,
        },
        {
            "title": "Functions and Lists Exercise",
            "description": (
                "Write three Python functions: one to find the second largest number in a list, "
                "one to reverse a string, and one to count vowels. Include test calls."
            ),
            "max_score": 100,
            "days_offset": 8,
            "status": AssignmentStatus.published,
        },
    ],
    "FREN101": [
        {
            "title": "French Vocabulary Test — Unit 3",
            "description": (
                "Translate the 30 vocabulary words from Unit 3 into Khmer and English. "
                "Then write one original French sentence using any 10 of the words."
            ),
            "max_score": 100,
            "days_offset": -4,
            "status": AssignmentStatus.published,
        },
        {
            "title": "French Dialogue Writing",
            "description": (
                "Write a short dialogue (10–15 lines) in French between two friends "
                "planning a weekend trip. Use at least five Unit 4 vocabulary words."
            ),
            "max_score": 50,
            "days_offset": 15,
            "status": AssignmentStatus.published,
        },
    ],
    "PE101": [
        {
            "title": "Personal Fitness Plan",
            "description": (
                "Design a 4-week personal fitness plan that includes cardio, strength, "
                "and flexibility training. Specify duration, sets, and reps for each session."
            ),
            "max_score": 100,
            "days_offset": 5,
            "status": AssignmentStatus.draft,
        },
    ],
    "ART101": [
        {
            "title": "Still Life Drawing",
            "description": (
                "Complete a pencil still life drawing of the objects arranged in class. "
                "Use shading to show depth. Submit a clear photo of your finished work."
            ),
            "max_score": 100,
            "days_offset": 3,
            "status": AssignmentStatus.draft,
        },
    ],
    "MUS101": [
        {
            "title": "Traditional Instrument Report",
            "description": (
                "Write a 300-word report on a Cambodian traditional instrument of your choice. "
                "Describe its history, construction, and role in Cambodian culture."
            ),
            "max_score": 100,
            "days_offset": 21,
            "status": AssignmentStatus.draft,
        },
    ],
}


def seed(db: Session, class_subjects: list, users: dict) -> list:
    if not class_subjects:
        return []

    # Build lookup by id for all teachers (dynamic — works with any number of teachers)
    teacher_by_id = {
        u.id: u for u in users.values() if u.role == UserRole.teacher
    }
    fallback_teacher = next(iter(teacher_by_id.values()), None)

    now = datetime.now(timezone.utc)
    created = []

    for cs in class_subjects:
        # Resolve subject code via lazy-load relationship
        subject_code = cs.subject.code
        templates = SUBJECT_ASSIGNMENTS.get(subject_code, [])

        # Use the teacher already assigned to this class_subject
        teacher = teacher_by_id.get(cs.teacher_id) if cs.teacher_id else fallback_teacher

        for tmpl in templates:
            due_date = now + timedelta(days=tmpl["days_offset"])
            existing = db.query(Assignment).filter(
                Assignment.class_subject_id == cs.id,
                Assignment.title == tmpl["title"],
            ).first()
            if existing:
                created.append(existing)
                continue
            if teacher:
                obj = Assignment(
                    class_subject_id=cs.id,
                    publisher_id=teacher.id,
                    title=tmpl["title"],
                    description=tmpl["description"],
                    max_score=tmpl["max_score"],
                    due_date=due_date,
                    status=tmpl["status"],
                )
                db.add(obj)
                db.flush()
                created.append(obj)

    db.commit()
    return created
