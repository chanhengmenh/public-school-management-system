from sqlalchemy import Column, Integer, String, ForeignKey
from sqlalchemy.orm import relationship
from app.database import Base


class Class(Base):
    __tablename__ = "classes"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    academic_year = Column(String, nullable=False)
    home_teacher_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)

    home_teacher = relationship("User", back_populates="home_class")
    enrollments = relationship("Enrollment", back_populates="class_")
    class_subjects = relationship("ClassSubject", back_populates="class_")
    attendance = relationship("Attendance", back_populates="class_")
