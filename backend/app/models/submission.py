from sqlalchemy import Column, Integer, Text, ForeignKey, DateTime, Boolean, String
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database import Base


class AssignmentSubmission(Base):
    __tablename__ = "assignment_submissions"

    id = Column(Integer, primary_key=True, index=True)
    assignment_id = Column(Integer, ForeignKey("assignments.id"), nullable=False)
    student_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    content = Column(Text, nullable=True)
    submission_type = Column(String, default="text")  # text, file, both
    submitted_at = Column(DateTime(timezone=True), server_default=func.now())
    is_late = Column(Boolean, default=False)

    assignment = relationship("Assignment", back_populates="submissions")
    student = relationship("User", back_populates="submissions")
    files = relationship("SubmissionFile", back_populates="submission")
    behavior_logs = relationship("BehaviorLog", back_populates="submission")
    grade = relationship("Grade", back_populates="submission", uselist=False)
    telemetry = relationship("SubmissionTelemetry", back_populates="submission", uselist=False)
