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
from app.models.grade_category import GradeCategory
from app.models.schedule import ClassSchedule, DayOfWeek
from app.models.notification import Notification, NotificationType
from app.models.announcement import Announcement, AnnouncementTarget
from app.models.audit_log import AuditLog
from app.models.material import Material
from app.models.submission_telemetry import SubmissionTelemetry

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
    "GradeCategory",
    "ClassSchedule", "DayOfWeek",
    "Notification", "NotificationType",
    "Announcement", "AnnouncementTarget",
    "AuditLog",
    "Material",
    "SubmissionTelemetry",
]
