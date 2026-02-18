import enum
from sqlalchemy import Column, Integer, String, Text, ForeignKey, DateTime, Enum
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database import Base


class AssignmentStatus(str, enum.Enum):
    draft = "draft"
    published = "published"
    closed = "closed"


class Assignment(Base):
    __tablename__ = "assignments"

    id = Column(Integer, primary_key=True, index=True)
    class_subject_id = Column(Integer, ForeignKey("class_subjects.id"), nullable=False)
    publisher_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    title = Column(String, nullable=False)
    description = Column(Text, nullable=True)
    due_date = Column(DateTime(timezone=True), nullable=True)
    max_score = Column(Integer, default=100)
    status = Column(Enum(AssignmentStatus), default=AssignmentStatus.draft)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    class_subject = relationship("ClassSubject", back_populates="assignments")
    publisher = relationship("User", foreign_keys=[publisher_id])
    submissions = relationship("AssignmentSubmission", back_populates="assignment")
