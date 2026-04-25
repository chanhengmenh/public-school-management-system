from sqlalchemy import Column, Integer, Float, ForeignKey, DateTime, UniqueConstraint
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database import Base


class SubmissionTelemetry(Base):
    __tablename__ = "submission_telemetry"

    id = Column(Integer, primary_key=True, index=True)
    submission_id = Column(Integer, ForeignKey("assignment_submissions.id", ondelete="CASCADE"), unique=True, nullable=False)
    student_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    typed_chars = Column(Integer, default=0)
    paste_count = Column(Integer, default=0)
    pasted_chars = Column(Integer, default=0)
    keystroke_count = Column(Integer, default=0)
    active_typing_seconds = Column(Float, default=0.0)
    avg_wpm = Column(Float, nullable=True)
    recorded_at = Column(DateTime(timezone=True), server_default=func.now())

    submission = relationship("AssignmentSubmission", back_populates="telemetry")
