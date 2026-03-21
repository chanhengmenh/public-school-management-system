from sqlalchemy import Column, Integer, ForeignKey, UniqueConstraint
from sqlalchemy.orm import relationship
from app.database import Base


class Enrollment(Base):
    __tablename__ = "enrollments"

    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    class_id = Column(Integer, ForeignKey("classes.id"), nullable=False)

    __table_args__ = (UniqueConstraint("student_id", "class_id", name="uq_enrollment"),)

    student = relationship("User", back_populates="enrollments", foreign_keys=[student_id])
    class_ = relationship("Class", back_populates="enrollments")
