from sqlalchemy import Column, Integer, String, Numeric, ForeignKey
from sqlalchemy.orm import relationship
from app.database import Base


class GradeCategory(Base):
    __tablename__ = "grade_categories"

    id = Column(Integer, primary_key=True)
    class_subject_id = Column(Integer, ForeignKey("class_subjects.id"), nullable=False, index=True)
    name = Column(String, nullable=False)
    weight = Column(Numeric(5, 4), nullable=False)  # e.g. 0.3000

    class_subject = relationship("ClassSubject", back_populates="grade_categories")
    assignments = relationship("Assignment", back_populates="category")
