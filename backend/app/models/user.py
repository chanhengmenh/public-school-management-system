import enum
from sqlalchemy import Column, Integer, String, Enum, Boolean, DateTime
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database import Base


class UserRole(str, enum.Enum):
    admin = "admin"
    teacher = "teacher"
    student = "student"


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    full_name = Column(String, nullable=False)
    hashed_password = Column(String, nullable=False)
    role = Column(Enum(UserRole), nullable=False)
    is_active = Column(Boolean, default=True)
    is_home_teacher = Column(Boolean, nullable=False, default=False, server_default='false')
    is_class_monitor = Column(Boolean, nullable=False, default=False, server_default='false')
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    enrollments = relationship("Enrollment", back_populates="student", foreign_keys="Enrollment.student_id")
    submissions = relationship("AssignmentSubmission", back_populates="student")
    grades_given = relationship("Grade", back_populates="graded_by_user", foreign_keys="Grade.graded_by")
    attendance_records = relationship("Attendance", back_populates="student", foreign_keys="Attendance.student_id")
    attendance_marked = relationship("Attendance", back_populates="marked_by_user", foreign_keys="Attendance.marked_by_id")
    home_class = relationship("Class", back_populates="home_teacher", uselist=False)
    class_subjects = relationship("ClassSubject", back_populates="teacher")
