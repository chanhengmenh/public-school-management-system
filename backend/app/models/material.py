from sqlalchemy import Column, Integer, String, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database import Base


class Material(Base):
    __tablename__ = "materials"

    id = Column(Integer, primary_key=True, index=True)
    class_subject_id = Column(Integer, ForeignKey("class_subjects.id"), nullable=False)
    uploader_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    title = Column(String, nullable=False)
    file_path = Column(String, nullable=True)
    file_type = Column(String, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    class_subject = relationship("ClassSubject")
    uploader = relationship("User")
