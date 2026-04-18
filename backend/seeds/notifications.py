"""
Seed notifications for the first few students (student001–student005)
and the class monitor (student001) with a realistic set of messages.
"""
from sqlalchemy.orm import Session
from app.models.notification import Notification, NotificationType

NOTIFICATIONS = [
    # Announcements (for all 5 students)
    {
        "title": "Welcome to the New Term",
        "message": "Welcome back! The new academic term has started. Check your enrolled classes and upcoming assignments.",
        "type": NotificationType.announcement,
        "sender": "System",
        "target": "all",
    },
    {
        "title": "Mid-Term Exam Schedule Updated",
        "message": "The mid-term exam timetable has been revised. Please review the new schedule in your class portal.",
        "type": NotificationType.announcement,
        "sender": "System Admin",
        "target": "all",
    },
    # Assignment notifications
    {
        "title": "New Assignment: Lab Report",
        "message": "A new assignment 'Refraction Lab Report' has been posted in Physics. Due in 3 days.",
        "type": NotificationType.assignment,
        "sender": "Piseth Rath",
        "target": "all",
    },
    {
        "title": "Assignment Due Tomorrow",
        "message": "Reminder: 'Chapter 3 Exercises' in Mathematics is due tomorrow at 11:59 PM.",
        "type": NotificationType.alert,
        "sender": "Sovann Keo",
        "target": "all",
    },
    # Grade notifications
    {
        "title": "Grade Posted: Quiz 1",
        "message": "Your grade for 'Chapter 1 Quiz' in Mathematics has been posted.",
        "type": NotificationType.grade,
        "sender": "System",
        "target": "all",
    },
    {
        "title": "Grade Posted: Essay Submission",
        "message": "Your English essay has been graded. Check the Grades tab for your score and feedback.",
        "type": NotificationType.grade,
        "sender": "Sreymom Mao",
        "target": "all",
    },
    # Alert — only for student001 (class monitor)
    {
        "title": "Attendance Sheet Pending",
        "message": "You have not submitted today's attendance. Please mark attendance for your class before 9:00 AM.",
        "type": NotificationType.alert,
        "sender": "System",
        "target": "monitor_only",
    },
    # General
    {
        "title": "Library Books Due Reminder",
        "message": "Please return any overdue library books by Friday to avoid late fees.",
        "type": NotificationType.general,
        "sender": "Librarian",
        "target": "all",
    },
]

# Email prefixes for target students
ALL_STUDENTS = [f"student{i:03d}@iams.edu" for i in range(1, 6)]   # student001–005
MONITOR_EMAIL = "student001@iams.edu"


def seed(db: Session, seeded_users: dict) -> None:
    count = 0
    for notif in NOTIFICATIONS:
        targets = ALL_STUDENTS if notif["target"] == "all" else [MONITOR_EMAIL]
        for email in targets:
            user = seeded_users.get(email)
            if not user:
                continue

            existing = db.query(Notification).filter(
                Notification.user_id == user.id,
                Notification.title == notif["title"],
            ).first()
            if existing:
                continue

            obj = Notification(
                user_id=user.id,
                title=notif["title"],
                message=notif["message"],
                type=notif["type"],
                sender=notif["sender"],
                is_read=False,
            )
            db.add(obj)
            count += 1

    # Mark the first 2 notifications as already read for student001 (realistic state)
    db.flush()
    student001 = seeded_users.get(MONITOR_EMAIL)
    if student001:
        old_notifs = (
            db.query(Notification)
            .filter(Notification.user_id == student001.id)
            .order_by(Notification.id)
            .limit(2)
            .all()
        )
        for n in old_notifs:
            n.is_read = True

    db.commit()
    print(f"  → {count} notifications created")
