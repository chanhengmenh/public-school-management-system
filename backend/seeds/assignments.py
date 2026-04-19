from app.models.assignment import Assignment, AssignmentStatus
from app.models.user import UserRole
from sqlalchemy.orm import Session
from datetime import datetime, timezone, timedelta

# Assignment templates keyed by subject code.
# days_offset < 0 → already past due.
# days_offset > 0 → upcoming (open for submission).
SUBJECT_ASSIGNMENTS = {
    "MATH101": [
        {
            "title": "Linear Equations — Chapter 1 Problem Set",
            "description": (
                "Solve problems 1–20 on linear equations. "
                "Show all working steps and verify each answer by substitution."
            ),
            "max_score": 100, "days_offset": -14, "status": AssignmentStatus.published,
        },
        {
            "title": "Quadratic Functions Quiz",
            "description": (
                "Answer all 10 questions on quadratic functions, factoring, "
                "and the quadratic formula. Show your working clearly."
            ),
            "max_score": 50, "days_offset": 10, "status": AssignmentStatus.published,
        },
    ],
    "PHYS101": [
        {
            "title": "Newton's Laws — Lab Write-up",
            "description": (
                "Complete the lab report for the force and motion experiment. "
                "Include hypothesis, procedure, data table, and conclusion."
            ),
            "max_score": 100, "days_offset": -7, "status": AssignmentStatus.published,
        },
        {
            "title": "Energy and Work — Problem Set",
            "description": (
                "Solve the 12 problems on kinetic energy, potential energy, and work. "
                "Include diagrams where appropriate."
            ),
            "max_score": 100, "days_offset": 14, "status": AssignmentStatus.published,
        },
    ],
    "CHEM101": [
        {
            "title": "Periodic Table Quiz",
            "description": (
                "Identify the atomic number, symbol, and group for each of the 20 given elements. "
                "Then describe one practical use for three elements of your choice."
            ),
            "max_score": 100, "days_offset": -5, "status": AssignmentStatus.published,
        },
        {
            "title": "Chemical Bonding Report",
            "description": (
                "Write a short report (250–350 words) explaining the difference between "
                "ionic, covalent, and metallic bonds. Provide one real-world example of each."
            ),
            "max_score": 50, "days_offset": 12, "status": AssignmentStatus.published,
        },
    ],
    "BIO101": [
        {
            "title": "Cell Structure Diagram",
            "description": (
                "Draw and label the organelles of both an animal cell and a plant cell. "
                "Below each diagram, describe the function of every labelled organelle."
            ),
            "max_score": 100, "days_offset": -12, "status": AssignmentStatus.published,
        },
        {
            "title": "Genetics Problem Set",
            "description": (
                "Complete the 8 Punnett square problems on dominant and recessive traits. "
                "State the genotypic and phenotypic ratios for each cross."
            ),
            "max_score": 80, "days_offset": 9, "status": AssignmentStatus.published,
        },
    ],
    "ENG101": [
        {
            "title": "Descriptive Essay — My Hometown",
            "description": (
                "Write a 400–600 word descriptive essay about your hometown. "
                "Focus on vivid sensory details: sights, sounds, smells, and textures."
            ),
            "max_score": 100, "days_offset": -10, "status": AssignmentStatus.published,
        },
        {
            "title": "Book Summary — Chapters 1–3",
            "description": (
                "Write a concise summary (200–300 words) of the first three chapters "
                "of the assigned novel. Identify the main characters and central conflict."
            ),
            "max_score": 50, "days_offset": 7, "status": AssignmentStatus.published,
        },
    ],
    "KH101": [
        {
            "title": "ការតែងសេចក្ដីពណ៌នា — ផ្ទះខ្ញុំ",
            "description": (
                "តែងសេចក្ដីពណ៌នាអំពីផ្ទះរបស់អ្នក ចំនួន ៣០០–៤០០ ពាក្យ។ "
                "ប្រើទម្រង់អក្សរបរិច្ឆេទ ហើយរៀបអត្ថន័យឱ្យបានច្បាស់លាស់។"
            ),
            "max_score": 100, "days_offset": -8, "status": AssignmentStatus.published,
        },
        {
            "title": "វេយ្យាករណ៍ — ប្រើប្រាស់ព្រេចព្រាត",
            "description": (
                "ធ្វើលំហាត់វេយ្យាករណ៍ ១៥ ចំណុច ស្ដីពីការប្រើប្រាស់ "
                "ព្រេចព្រាតក្នុងប្រយោគ។ ជ្រើសរើសចម្លើយត្រូវ ហើយពន្យល់ហេតុផល។"
            ),
            "max_score": 50, "days_offset": 11, "status": AssignmentStatus.published,
        },
    ],
    "MOR101": [
        {
            "title": "Essay: Cambodian Values and Modern Society",
            "description": (
                "Write a 350-word essay discussing how traditional Cambodian values "
                "(respect, family, solidarity) apply to modern student life."
            ),
            "max_score": 100, "days_offset": -6, "status": AssignmentStatus.published,
        },
        {
            "title": "Case Study: Community Service Project",
            "description": (
                "Describe a community service activity you have done or would like to do. "
                "Explain its benefit to society using concepts from the Morality curriculum."
            ),
            "max_score": 50, "days_offset": 13, "status": AssignmentStatus.published,
        },
    ],
    "HIST101": [
        {
            "title": "Khmer Empire Research Paper",
            "description": (
                "Write a 500-word research paper on the Khmer Empire's cultural and "
                "architectural achievements, with a focus on Angkor Wat."
            ),
            "max_score": 100, "days_offset": -8, "status": AssignmentStatus.published,
        },
        {
            "title": "Cambodia in the 20th Century — Timeline",
            "description": (
                "Create a chronological timeline of 15 key events in Cambodian history "
                "from 1953 independence to 1993 elections. Write one sentence per event."
            ),
            "max_score": 50, "days_offset": 11, "status": AssignmentStatus.published,
        },
    ],
    "GEO101": [
        {
            "title": "Map Work — Cambodia's Provinces",
            "description": (
                "On a blank map of Cambodia, label all 25 provinces and their capitals. "
                "Colour-code by region: plains, highlands, coastal, and Tonle Sap basin."
            ),
            "max_score": 100, "days_offset": -9, "status": AssignmentStatus.published,
        },
        {
            "title": "Climate Zones of Southeast Asia",
            "description": (
                "Describe the three climate zones found in Southeast Asia. "
                "For each zone, name two countries and explain how the climate affects agriculture."
            ),
            "max_score": 60, "days_offset": 8, "status": AssignmentStatus.published,
        },
    ],
    "ART101": [
        {
            "title": "Still Life Drawing",
            "description": (
                "Complete a pencil still life drawing of the objects arranged in class. "
                "Use shading to show depth. Submit a clear photo of your finished work."
            ),
            "max_score": 100, "days_offset": 3, "status": AssignmentStatus.draft,
        },
    ],
    "ECO101": [
        {
            "title": "Supply and Demand — Market Analysis",
            "description": (
                "Choose a local Cambodian product (e.g. rice, fish, garments). "
                "Draw its supply and demand curves and explain what shifts them."
            ),
            "max_score": 100, "days_offset": -4, "status": AssignmentStatus.published,
        },
        {
            "title": "Cambodia's GDP Growth Report",
            "description": (
                "Using data from 2015–2023, write a 300-word analysis of Cambodia's GDP growth. "
                "Identify the main contributing sectors and one major risk factor."
            ),
            "max_score": 80, "days_offset": 15, "status": AssignmentStatus.published,
        },
    ],
    "PE101": [
        {
            "title": "Personal Fitness Plan",
            "description": (
                "Design a 4-week personal fitness plan including cardio, strength, "
                "and flexibility training. Specify duration, sets, and reps per session."
            ),
            "max_score": 100, "days_offset": 5, "status": AssignmentStatus.draft,
        },
    ],
    "EARTH101": [
        {
            "title": "Rock Cycle Diagram",
            "description": (
                "Draw and label the complete rock cycle showing igneous, sedimentary, "
                "and metamorphic rocks. Describe each transformation process."
            ),
            "max_score": 100, "days_offset": -11, "status": AssignmentStatus.published,
        },
        {
            "title": "Cambodia's Natural Disaster Risk Report",
            "description": (
                "Write a 350-word report on the natural disasters most likely to affect Cambodia "
                "(floods, droughts, storms). Include causes, affected regions, and prevention measures."
            ),
            "max_score": 80, "days_offset": 10, "status": AssignmentStatus.published,
        },
    ],
}


def seed(db: Session, class_subjects: list, users: dict) -> list:
    if not class_subjects:
        return []

    teacher_by_id = {u.id: u for u in users.values() if u.role == UserRole.teacher}
    fallback_teacher = next(iter(teacher_by_id.values()), None)

    now = datetime.now(timezone.utc)
    created = []

    for cs in class_subjects:
        subject_code = cs.subject.code
        templates = SUBJECT_ASSIGNMENTS.get(subject_code, [])
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
