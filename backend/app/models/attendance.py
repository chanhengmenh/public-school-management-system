import enum
from sqlalchemy import Column, Integer, String, ForeignKey, Date, UniqueConstraint, Enum
from sqlalchemy.orm import relationship
from app.database import Base


class AttendanceStatus(str, enum.Enum):
    present = "present"
    absent = "absent"
    late = "late"
    excused = "excused"


class Attendance(Base):
    __tablename__ = "attendance"

    id = Column(Integer, primary_key=True, index=True)
    class_id = Column(Integer, ForeignKey("classes.id"), nullable=False)
    student_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    date = Column(Date, nullable=False)
    status = Column(Enum(AttendanceStatus), nullable=False)
    marked_by_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    note = Column(String, nullable=True)

    __table_args__ = (UniqueConstraint("class_id", "student_id", "date", name="uq_attendance"),)

    class_ = relationship("Class", back_populates="attendance")
    student = relationship("User", back_populates="attendance_records", foreign_keys=[student_id])
    marked_by_user = relationship("User", back_populates="attendance_marked", foreign_keys=[marked_by_id])
