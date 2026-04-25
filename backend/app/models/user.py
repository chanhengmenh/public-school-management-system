import enum
from sqlalchemy import Column, Integer, String, Enum, Boolean, DateTime
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database import Base


class UserRole(str, enum.Enum):
    admin = "admin"
    teacher = "teacher"
    student = "student"


class UserGender(str, enum.Enum):
    male = "male"
    female = "female"
    other = "other"


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    full_name = Column(String, nullable=False)
    hashed_password = Column(String, nullable=False)
    role = Column(Enum(UserRole), nullable=False)
    gender = Column(Enum(UserGender), nullable=True)
    is_active = Column(Boolean, default=True)
    is_home_teacher = Column(Boolean, nullable=False, default=False, server_default='false')
    is_class_monitor = Column(Boolean, nullable=False, default=False, server_default='false')
    must_change_password = Column(Boolean, nullable=False, default=True, server_default='true')
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    enrollments = relationship("Enrollment", back_populates="student", foreign_keys="Enrollment.student_id", passive_deletes=True)
    submissions = relationship("AssignmentSubmission", back_populates="student", passive_deletes=True)
    grades_given = relationship("Grade", back_populates="graded_by_user", foreign_keys="Grade.graded_by", passive_deletes=True)
    attendance_records = relationship("Attendance", back_populates="student", foreign_keys="Attendance.student_id", passive_deletes=True)
    attendance_marked = relationship("Attendance", back_populates="marked_by_user", foreign_keys="Attendance.marked_by_id", passive_deletes=True)
    home_class = relationship("Class", back_populates="home_teacher", uselist=False, passive_deletes=True)
    class_subjects = relationship("ClassSubject", back_populates="teacher", passive_deletes=True)
    notifications = relationship("Notification", back_populates="user", passive_deletes=True)
