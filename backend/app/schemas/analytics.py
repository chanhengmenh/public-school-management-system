from pydantic import BaseModel
from datetime import datetime
from typing import Optional


class ScorePoint(BaseModel):
    assignment_id: int
    assignment_title: str
    score: float
    max_score: int
    submitted_at: datetime


class StudentScoreTrend(BaseModel):
    student_id: int
    student_name: str
    scores: list[ScorePoint]
    average_score: float
    total_assignments: int
    weighted_average: Optional[float] = None
    attendance_rate: float = 0.0   # (present + excused + late×0.5) / total × 100
    submission_rate: float = 0.0   # submitted / total published assignments × 100


class SubjectAverage(BaseModel):
    subject_id: int
    subject_name: str
    average_score: float
    min_score: float
    max_score: float
    pass_rate: float          # % of submissions with score/max_score ≥ 0.6
    submission_count: int


class ClassAnalytics(BaseModel):
    class_id: int
    class_name: str
    subject_averages: list[SubjectAverage]
    overall_average: float


class RankingEntry(BaseModel):
    rank: int
    student_id: int
    student_name: str
    total_score: float
    average_score: float
    assignment_count: int


class ClassRanking(BaseModel):
    class_id: int
    class_name: str
    academic_year: str
    rankings: list[RankingEntry]


class AdminOverview(BaseModel):
    total_users: int
    total_students: int
    total_teachers: int
    total_assignments: int
    total_submissions: int
    submissions_today: int
    average_system_score: Optional[float] = None
