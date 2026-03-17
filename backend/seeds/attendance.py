from app.models.attendance import Attendance, AttendanceStatus
from app.models.user import UserRole
from sqlalchemy.orm import Session
from datetime import date, timedelta


def _status_for(student_pos: int, day_idx: int) -> AttendanceStatus:
    """
    Deterministic attendance status for the student at position `student_pos`
    (0-indexed within their class) on school day `day_idx`.

    Distribution across 25 students per day:
      present  — 21 / 25  (84 %)
      late     —  2 / 25  ( 8 %)
      absent   —  1 / 25  ( 4 %)
      excused  —  1 / 25  ( 4 %)
    """
    val = (student_pos * 3 + day_idx * 7) % 25
    if val < 21:
        return AttendanceStatus.present
    elif val < 23:
        return AttendanceStatus.late
    elif val < 24:
        return AttendanceStatus.absent
    else:
        return AttendanceStatus.excused


def seed(db: Session, classes: dict, users: dict) -> None:
    """
    Seed 10 school days of attendance (the two most recent Mon–Fri weeks)
    for every student in every class.  Each day is marked by the class monitor
    (the first student in the class, who has is_class_monitor=True).
    """
    # Students sorted the same way as the enrollment seeder
    students = sorted(
        [u for u in users.values() if u.role == UserRole.student],
        key=lambda u: u.email,
    )
    all_classes = sorted(classes.values(), key=lambda c: c.name)

    # Build 10 school days: Mon–Fri of the two most recent complete weeks
    today = date.today()
    days_since_monday = today.weekday()          # 0 = Monday
    last_monday = today - timedelta(days=days_since_monday + 7)   # start of previous week
    school_days = [
        last_monday + timedelta(days=d)
        for d in range(14)
        if (last_monday + timedelta(days=d)).weekday() < 5   # Mon–Fri only
    ][:10]  # take exactly 10 days

    for class_idx, cls in enumerate(all_classes):
        if cls is None:
            continue

        # The 25 students belonging to this class (sequential assignment in enrollment seeder)
        start = class_idx * 25
        class_students = students[start: start + 25]
        if not class_students:
            continue

        # Class monitor is always the first student in the class
        monitor = class_students[0]

        for day_idx, school_day in enumerate(school_days):
            for student_pos, student in enumerate(class_students):
                existing = db.query(Attendance).filter(
                    Attendance.class_id == cls.id,
                    Attendance.student_id == student.id,
                    Attendance.date == school_day,
                ).first()
                if existing:
                    continue

                db.add(Attendance(
                    class_id=cls.id,
                    student_id=student.id,
                    date=school_day,
                    status=_status_for(student_pos, day_idx),
                    marked_by_id=monitor.id,
                    note=None,
                ))

        db.commit()  # commit per class to keep transactions manageable
