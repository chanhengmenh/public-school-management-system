# Import all models so Alembic discovers them for autogenerate
from app.models.user import User, UserRole
from app.models.class_ import Class
from app.models.subject import Subject
from app.models.class_subject import ClassSubject
from app.models.enrollment import Enrollment
from app.models.assignment import Assignment, AssignmentStatus
from app.models.submission import AssignmentSubmission
from app.models.submission_file import SubmissionFile
from app.models.behavior_log import BehaviorLog, EventType
from app.models.grade import Grade
from app.models.attendance import Attendance, AttendanceStatus

__all__ = [
    "User", "UserRole",
    "Class",
    "Subject",
    "ClassSubject",
    "Enrollment",
    "Assignment", "AssignmentStatus",
    "AssignmentSubmission",
    "SubmissionFile",
    "BehaviorLog", "EventType",
    "Grade",
    "Attendance", "AttendanceStatus",
]
