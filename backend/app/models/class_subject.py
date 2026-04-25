from sqlalchemy import Column, Integer, ForeignKey, UniqueConstraint
from sqlalchemy.orm import relationship
from app.database import Base


class ClassSubject(Base):
    __tablename__ = "class_subjects"

    id = Column(Integer, primary_key=True, index=True)
    class_id = Column(Integer, ForeignKey("classes.id"), nullable=False)
    subject_id = Column(Integer, ForeignKey("subjects.id"), nullable=False)
    teacher_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)

    __table_args__ = (UniqueConstraint("class_id", "subject_id", name="uq_class_subject"),)

    class_ = relationship("Class", back_populates="class_subjects")
    subject = relationship("Subject", back_populates="class_subjects")
    teacher = relationship("User", back_populates="class_subjects")
    assignments = relationship("Assignment", back_populates="class_subject")
    grade_categories = relationship("GradeCategory", back_populates="class_subject")
    schedules = relationship("ClassSchedule", back_populates="class_subject")
