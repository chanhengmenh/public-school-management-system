"""
Seed class schedules — Cambodian Grade 11 timetable.

School hours:
  Morning:   07:00 – 11:00
  Afternoon: 13:00 – 17:00

Session lengths (per user spec):
  2.0 h → Mathematics (MATH101), Khmer (KH101)
  1.5 h → all other 11 subjects

Weekly distribution — 2 sessions per subject (26 sessions total, Mon–Sat):

  Monday
    07:00–09:00  Khmer         (2h) — session 1
    09:00–11:00  Mathematics   (2h) — session 1
    13:00–14:30  Physics       (1.5h) — session 1
    14:30–16:00  Chemistry     (1.5h) — session 1

  Tuesday
    07:00–08:30  Biology       (1.5h) — session 1
    08:30–10:00  English       (1.5h) — session 1
    13:00–14:30  History       (1.5h) — session 1
    14:30–16:00  Art           (1.5h) — session 1

  Wednesday
    07:00–09:00  Mathematics   (2h)   — session 2 ✓
    09:00–11:00  Khmer         (2h)   — session 2 ✓
    13:00–14:30  Geography     (1.5h) — session 1
    14:30–16:00  Morality      (1.5h) — session 1

  Thursday
    07:00–08:30  Economy       (1.5h) — session 1
    08:30–10:00  Earth Science (1.5h) — session 1
    13:00–14:30  PE            (1.5h) — session 1
    14:30–16:00  Biology       (1.5h) — session 2 ✓

  Friday
    07:00–08:30  Physics       (1.5h) — session 2 ✓
    08:30–10:00  Chemistry     (1.5h) — session 2 ✓
    13:00–14:30  English       (1.5h) — session 2 ✓
    14:30–16:00  History       (1.5h) — session 2 ✓

  Saturday
    07:00–08:30  Geography     (1.5h) — session 2 ✓
    08:30–10:00  Morality      (1.5h) — session 2 ✓
    10:00–11:30  Art           (1.5h) — session 2 ✓
    13:00–14:30  Economy       (1.5h) — session 2 ✓
    14:30–16:00  Earth Science (1.5h) — session 2 ✓
    16:00–17:30  PE            (1.5h) — session 2 ✓
"""
from datetime import time
from sqlalchemy.orm import Session
from app.models.schedule import ClassSchedule, DayOfWeek
from app.models.class_subject import ClassSubject

# (day, start, end, room_base, subject_code)
CLASS_TIMETABLE = [
    # ── Monday ──────────────────────────────────────────────────
    (DayOfWeek.monday,    time(7,  0),  time(9,  0),  "Room 1",  "KH101"),
    (DayOfWeek.monday,    time(9,  0),  time(11, 0),  "Room 2",  "MATH101"),
    (DayOfWeek.monday,    time(13, 0),  time(14, 30), "Lab",     "PHYS101"),
    (DayOfWeek.monday,    time(14, 30), time(16, 0),  "Lab",     "CHEM101"),

    # ── Tuesday ─────────────────────────────────────────────────
    (DayOfWeek.tuesday,   time(7,  0),  time(8,  30), "Lab",     "BIO101"),
    (DayOfWeek.tuesday,   time(8,  30), time(10, 0),  "Room 3",  "ENG101"),
    (DayOfWeek.tuesday,   time(13, 0),  time(14, 30), "Room 4",  "HIST101"),
    (DayOfWeek.tuesday,   time(14, 30), time(16, 0),  "Studio",  "ART101"),

    # ── Wednesday ───────────────────────────────────────────────
    (DayOfWeek.wednesday, time(7,  0),  time(9,  0),  "Room 2",  "MATH101"),
    (DayOfWeek.wednesday, time(9,  0),  time(11, 0),  "Room 1",  "KH101"),
    (DayOfWeek.wednesday, time(13, 0),  time(14, 30), "Room 4",  "GEO101"),
    (DayOfWeek.wednesday, time(14, 30), time(16, 0),  "Room 5",  "MOR101"),

    # ── Thursday ────────────────────────────────────────────────
    (DayOfWeek.thursday,  time(7,  0),  time(8,  30), "Room 5",  "ECO101"),
    (DayOfWeek.thursday,  time(8,  30), time(10, 0),  "Lab",     "EARTH101"),
    (DayOfWeek.thursday,  time(13, 0),  time(14, 30), "Gym",     "PE101"),
    (DayOfWeek.thursday,  time(14, 30), time(16, 0),  "Lab",     "BIO101"),

    # ── Friday ──────────────────────────────────────────────────
    (DayOfWeek.friday,    time(7,  0),  time(8,  30), "Lab",     "PHYS101"),
    (DayOfWeek.friday,    time(8,  30), time(10, 0),  "Lab",     "CHEM101"),
    (DayOfWeek.friday,    time(13, 0),  time(14, 30), "Room 3",  "ENG101"),
    (DayOfWeek.friday,    time(14, 30), time(16, 0),  "Room 4",  "HIST101"),

    # ── Saturday ────────────────────────────────────────────────
    (DayOfWeek.saturday,  time(7,  0),  time(8,  30), "Room 4",  "GEO101"),
    (DayOfWeek.saturday,  time(8,  30), time(10, 0),  "Room 5",  "MOR101"),
    (DayOfWeek.saturday,  time(10, 0),  time(11, 30), "Studio",  "ART101"),
    (DayOfWeek.saturday,  time(13, 0),  time(14, 30), "Room 5",  "ECO101"),
    (DayOfWeek.saturday,  time(14, 30), time(16, 0),  "Lab",     "EARTH101"),
    (DayOfWeek.saturday,  time(16, 0),  time(17, 30), "Gym",     "PE101"),
]

# Seed all 5 Grade 11 classes
TARGET_CLASSES = ["Grade 11A", "Grade 11B", "Grade 11C", "Grade 11D", "Grade 11E"]


def seed(db: Session, seeded_classes: dict, seeded_subjects: dict, seeded_cs: list) -> None:
    # Build lookup: (class_id, subject_id) → class_subject_id
    cs_lookup: dict[tuple[int, int], int] = {
        (cs.class_id, cs.subject_id): cs.id for cs in seeded_cs
    }

    count = 0
    for class_name in TARGET_CLASSES:
        cls = seeded_classes.get(class_name)
        if not cls:
            continue

        for day, start, end, _room_base, subject_code in CLASS_TIMETABLE:
            subject = seeded_subjects.get(subject_code)
            if not subject:
                continue

            cs_id = cs_lookup.get((cls.id, subject.id))
            if not cs_id:
                continue

            existing = db.query(ClassSchedule).filter(
                ClassSchedule.class_subject_id == cs_id,
                ClassSchedule.day_of_week == day,
                ClassSchedule.start_time == start,
            ).first()
            if existing:
                continue

            # In Cambodia the class IS the room — Grade 11A studies in room "Grade 11A"
            db.add(ClassSchedule(
                class_subject_id=cs_id,
                day_of_week=day,
                start_time=start,
                end_time=end,
                room=class_name,
            ))
            count += 1

    db.commit()
    print(f"  done: {count} schedule slots created")
