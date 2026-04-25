import enum
from sqlalchemy import Column, Integer, String, Text, Enum, ForeignKey, DateTime, Boolean
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database import Base


class AnnouncementTarget(str, enum.Enum):
    all = "all"
    teachers = "teachers"
    students = "students"


class Announcement(Base):
    __tablename__ = "announcements"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    body = Column(Text, nullable=False)
    target = Column(Enum(AnnouncementTarget), nullable=False, default=AnnouncementTarget.all)
    class_id = Column(Integer, ForeignKey("classes.id"), nullable=True)
    author_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    is_pinned = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    author = relationship("User")
    target_class = relationship("Class")
