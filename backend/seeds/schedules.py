"""
Seed class schedules — Cambodian school timetable format.

School hours:
  Morning:   7:00 – 11:00  (4 hours, fully packed, no gaps)
  Afternoon: 13:00 – 17:00 (4 hours available, but not fully packed — gaps are normal)

Session lengths:
  2 hours:  Khmer (KH101), Mathematics (MATH101), Physics (PHYS101), PE (PE101)
  1 hour:   All other subjects

Weekly distribution per class (Class 10A–10D):

  Monday
    Morning (full):   07:00–09:00 Khmer   |  09:00–11:00 Math
    Afternoon:        13:00–14:00 Chem    |  14:00–15:00 Biology
                      [15:00–17:00 free]

  Tuesday
    Morning (full):   07:00–09:00 Physics |  09:00–10:00 History  | 10:00–11:00 English
    Afternoon:        13:00–14:00 French
                      [14:00–17:00 free]

  Wednesday
    Morning (full):   07:00–09:00 Khmer   |  09:00–11:00 Math
    Afternoon:        13:00–14:00 CS      |  14:00–15:00 Art
                      [15:00–17:00 free]

  Thursday
    Morning (full):   07:00–09:00 Physics |  09:00–10:00 Geography | 10:00–11:00 History
    Afternoon:        13:00–14:00 Music
                      [14:00–17:00 free]

  Friday
    Morning (full):   07:00–09:00 Math    |  09:00–11:00 PE
    Afternoon:        13:00–15:00 Khmer   |  [15:00–17:00 free]
"""
from datetime import time
from sqlalchemy.orm import Session
from app.models.schedule import ClassSchedule, DayOfWeek
from app.models.class_subject import ClassSubject


# (day, start_time, end_time, room_base, subject_code)
CLASS_TIMETABLE = [
    # ── Monday ──────────────────────────────── morning fully packed
    (DayOfWeek.monday,    time(7,  0),  time(9,  0),  "Room 1",  "KH101"),    # 2h
    (DayOfWeek.monday,    time(9,  0),  time(11, 0),  "Room 2",  "MATH101"),  # 2h
    # afternoon — gaps after 15:00
    (DayOfWeek.monday,    time(13, 0),  time(14, 0),  "Lab 1",   "CHEM101"),  # 1h
    (DayOfWeek.monday,    time(14, 0),  time(15, 0),  "Lab 1",   "BIO101"),   # 1h

    # ── Tuesday ─────────────────────────────── morning fully packed
    (DayOfWeek.tuesday,   time(7,  0),  time(9,  0),  "Room 3",  "PHYS101"),  # 2h
    (DayOfWeek.tuesday,   time(9,  0),  time(10, 0),  "Room 4",  "HIST101"),  # 1h
    (DayOfWeek.tuesday,   time(10, 0),  time(11, 0),  "Room 4",  "ENG101"),   # 1h
    # afternoon — only 1 slot
    (DayOfWeek.tuesday,   time(13, 0),  time(14, 0),  "Room 5",  "FREN101"),  # 1h

    # ── Wednesday ───────────────────────────── morning fully packed
    (DayOfWeek.wednesday, time(7,  0),  time(9,  0),  "Room 1",  "KH101"),    # 2h
    (DayOfWeek.wednesday, time(9,  0),  time(11, 0),  "Room 2",  "MATH101"),  # 2h
    # afternoon — 2 slots then free
    (DayOfWeek.wednesday, time(13, 0),  time(14, 0),  "Room 6",  "CS101"),    # 1h
    (DayOfWeek.wednesday, time(14, 0),  time(15, 0),  "Studio",  "ART101"),   # 1h

    # ── Thursday ────────────────────────────── morning fully packed
    (DayOfWeek.thursday,  time(7,  0),  time(9,  0),  "Room 3",  "PHYS101"),  # 2h
    (DayOfWeek.thursday,  time(9,  0),  time(10, 0),  "Room 4",  "GEO101"),   # 1h
    (DayOfWeek.thursday,  time(10, 0),  time(11, 0),  "Room 4",  "HIST101"),  # 1h
    # afternoon — 1 slot then free
    (DayOfWeek.thursday,  time(13, 0),  time(14, 0),  "Hall",    "MUS101"),   # 1h

    # ── Friday ──────────────────────────────── morning fully packed
    (DayOfWeek.friday,    time(7,  0),  time(9,  0),  "Room 2",  "MATH101"),  # 2h
    (DayOfWeek.friday,    time(9,  0),  time(11, 0),  "Gym",     "PE101"),    # 2h
    # afternoon — Khmer block then free
    (DayOfWeek.friday,    time(13, 0),  time(15, 0),  "Room 1",  "KH101"),    # 2h
]

# Seed schedules for these 4 classes only (home classes — enough for demo)
TARGET_CLASSES = ["Class 10A", "Class 10B", "Class 10C", "Class 10D"]


def seed(db: Session, seeded_classes: dict, seeded_subjects: dict, seeded_cs: list) -> None:
    # Build lookup: (class_id, subject_id) → class_subject_id
    cs_lookup: dict[tuple[int, int], int] = {
        (cs.class_id, cs.subject_id): cs.id for cs in seeded_cs
    }

    # Class letter → room suffix so rooms are unique per class (e.g. "Room 1-A")
    count = 0
    for class_name in TARGET_CLASSES:
        cls = seeded_classes.get(class_name)
        if not cls:
            continue
        room_suffix = class_name[-1]  # "A", "B", "C", "D"

        for day, start, end, room_base, subject_code in CLASS_TIMETABLE:
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

            obj = ClassSchedule(
                class_subject_id=cs_id,
                day_of_week=day,
                start_time=start,
                end_time=end,
                room=f"{room_base}-{room_suffix}",
            )
            db.add(obj)
            count += 1

    db.commit()
    print(f"  → {count} schedule slots created")
