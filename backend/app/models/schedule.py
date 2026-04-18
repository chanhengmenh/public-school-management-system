import enum
from sqlalchemy import Column, Integer, String, Enum, ForeignKey, Time, UniqueConstraint
from sqlalchemy.orm import relationship
from app.database import Base


class DayOfWeek(str, enum.Enum):
    monday = "monday"
    tuesday = "tuesday"
    wednesday = "wednesday"
    thursday = "thursday"
    friday = "friday"
    saturday = "saturday"
    sunday = "sunday"


class ClassSchedule(Base):
    __tablename__ = "class_schedules"

    id = Column(Integer, primary_key=True, index=True)
    class_subject_id = Column(Integer, ForeignKey("class_subjects.id"), nullable=False, index=True)
    day_of_week = Column(Enum(DayOfWeek), nullable=False)
    start_time = Column(Time, nullable=False)
    end_time = Column(Time, nullable=False)
    room = Column(String, nullable=True)

    __table_args__ = (
        UniqueConstraint("class_subject_id", "day_of_week", "start_time", name="uq_schedule_slot"),
    )

    class_subject = relationship("ClassSubject", back_populates="schedules")
