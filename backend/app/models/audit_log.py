from sqlalchemy import Column, Integer, String, Text, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database import Base


class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(Integer, primary_key=True, index=True)
    actor_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    action = Column(String(50), nullable=False, index=True)  # created, updated, deleted, reset_password, imported, etc.
    resource_type = Column(String(50), nullable=False, index=True)  # user, class, enrollment, assignment, announcement, etc.
    resource_id = Column(Integer, nullable=True)
    detail = Column(Text, nullable=True)  # Human-readable description
    created_at = Column(DateTime(timezone=True), server_default=func.now(), index=True)

    actor = relationship("User")
