import enum
from sqlalchemy import Column, Integer, String, ForeignKey, DateTime, BigInteger, JSON, Enum
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database import Base


class EventType(str, enum.Enum):
    keypress = "keypress"
    paste = "paste"
    focus_gain = "focus_gain"
    focus_loss = "focus_loss"
    copy = "copy"
    cut = "cut"


class BehaviorLog(Base):
    __tablename__ = "behavior_logs"

    id = Column(Integer, primary_key=True, index=True)
    submission_id = Column(Integer, ForeignKey("assignment_submissions.id"), nullable=False)
    student_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    event_type = Column(Enum(EventType), nullable=False)
    event_data = Column(JSON, nullable=True)
    client_ts = Column(BigInteger, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    submission = relationship("AssignmentSubmission", back_populates="behavior_logs")
    student = relationship("User")
