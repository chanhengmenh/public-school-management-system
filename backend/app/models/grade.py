from sqlalchemy import Column, Integer, Numeric, Text, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database import Base


class Grade(Base):
    __tablename__ = "grades"

    id = Column(Integer, primary_key=True, index=True)
    submission_id = Column(Integer, ForeignKey("assignment_submissions.id"), nullable=False, unique=True)
    score = Column(Numeric(5, 2), nullable=False)
    feedback = Column(Text, nullable=True)
    graded_by = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    graded_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    submission = relationship("AssignmentSubmission", back_populates="grade")
    graded_by_user = relationship("User", back_populates="grades_given", foreign_keys=[graded_by])
