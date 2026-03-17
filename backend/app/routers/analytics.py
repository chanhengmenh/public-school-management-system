from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.dependencies import get_db, get_current_user
from app.models.user import UserRole, User
from app.models.submission import AssignmentSubmission
from app.models.assignment import Assignment
from app.models.grade import Grade
from app.models.class_subject import ClassSubject
from app.models.enrollment import Enrollment
from app.schemas.analytics import (
    StudentScoreTrend, ScorePoint, ClassAnalytics, SubjectAverage,
    ClassRanking, RankingEntry, AdminOverview
)
from app.core.permissions import require_roles, require_home_teacher
from app.core.exceptions import ForbiddenError

router = APIRouter(prefix="/analytics", tags=["analytics"])


@router.get("/student/{student_id}/score-trend", response_model=StudentScoreTrend)
def student_score_trend(student_id: int, db: Session = Depends(get_db),
                         current_user: User = Depends(get_current_user)):
    if current_user.role == UserRole.student and current_user.id != student_id:
        raise ForbiddenError("Students can only view their own data")
    rows = (
        db.query(Grade, AssignmentSubmission, Assignment)
        .join(AssignmentSubmission, Grade.submission_id == AssignmentSubmission.id)
        .join(Assignment, AssignmentSubmission.assignment_id == Assignment.id)
        .filter(AssignmentSubmission.student_id == student_id)
        .order_by(AssignmentSubmission.submitted_at)
        .all()
    )
    scores = [
        ScorePoint(
            assignment_id=a.id,
            assignment_title=a.title,
            score=float(g.score),
            max_score=a.max_score,
            submitted_at=s.submitted_at,
        )
        for g, s, a in rows
    ]
    avg = sum(sp.score for sp in scores) / len(scores) if scores else 0.0
    student = db.query(User).filter(User.id == student_id).first()
    return StudentScoreTrend(
        student_id=student_id,
        student_name=student.full_name if student else "Unknown",
        scores=scores,
        average_score=avg,
        total_assignments=len(scores),
    )


@router.get("/class/{class_id}/averages", response_model=ClassAnalytics,
            dependencies=[Depends(require_roles(UserRole.teacher, UserRole.admin))])
def class_averages(class_id: int, db: Session = Depends(get_db)):
    from app.models.class_ import Class
    from app.models.subject import Subject
    class_obj = db.query(Class).filter(Class.id == class_id).first()
    rows = (
        db.query(
            Subject.id,
            Subject.name,
            func.avg(Grade.score).label("avg_score"),
            func.count(Grade.id).label("count"),
        )
        .join(ClassSubject, ClassSubject.subject_id == Subject.id)
        .join(Assignment, Assignment.class_subject_id == ClassSubject.id)
        .join(AssignmentSubmission, AssignmentSubmission.assignment_id == Assignment.id)
        .join(Grade, Grade.submission_id == AssignmentSubmission.id)
        .filter(ClassSubject.class_id == class_id)
        .group_by(Subject.id, Subject.name)
        .all()
    )
    subject_avgs = [
        SubjectAverage(
            subject_id=row.id,
            subject_name=row.name,
            average_score=float(row.avg_score or 0),
            submission_count=row.count,
        )
        for row in rows
    ]
    overall = sum(s.average_score for s in subject_avgs) / len(subject_avgs) if subject_avgs else 0.0
    return ClassAnalytics(
        class_id=class_id,
        class_name=class_obj.name if class_obj else "Unknown",
        subject_averages=subject_avgs,
        overall_average=overall,
    )


@router.get("/home-teacher/{class_id}/ranking", response_model=ClassRanking,
            dependencies=[Depends(require_home_teacher())])
def class_ranking(class_id: int, db: Session = Depends(get_db)):
    from app.models.class_ import Class
    class_obj = db.query(Class).filter(Class.id == class_id).first()
    rows = (
        db.query(
            User.id,
            User.full_name,
            func.coalesce(func.sum(Grade.score), 0).label("total_score"),
            func.coalesce(func.avg(Grade.score), 0).label("average_score"),
            func.count(Grade.id).label("assignment_count"),
        )
        .join(Enrollment, Enrollment.student_id == User.id)
        .outerjoin(AssignmentSubmission, AssignmentSubmission.student_id == User.id)
        .outerjoin(Grade, Grade.submission_id == AssignmentSubmission.id)
        .filter(Enrollment.class_id == class_id)
        .group_by(User.id, User.full_name)
        .order_by(func.coalesce(func.sum(Grade.score), 0).desc())
        .all()
    )
    entries = [
        RankingEntry(
            rank=i + 1,
            student_id=row.id,
            student_name=row.full_name,
            total_score=float(row.total_score),
            average_score=float(row.average_score),
            assignment_count=row.assignment_count,
        )
        for i, row in enumerate(rows)
    ]
    return ClassRanking(
        class_id=class_id,
        class_name=class_obj.name if class_obj else "Unknown",
        academic_year=class_obj.academic_year if class_obj else "",
        rankings=entries,
    )


@router.get("/admin/overview", response_model=AdminOverview,
            dependencies=[Depends(require_roles(UserRole.admin))])
def admin_overview(db: Session = Depends(get_db)):
    from datetime import date
    from app.models.attendance import Attendance
    total_users = db.query(User).count()
    total_students = db.query(User).filter(User.role == UserRole.student).count()
    total_teachers = db.query(User).filter(User.role == UserRole.teacher).count()
    total_assignments = db.query(Assignment).count()
    total_submissions = db.query(AssignmentSubmission).count()
    submissions_today = (
        db.query(AssignmentSubmission)
        .filter(func.date(AssignmentSubmission.submitted_at) == date.today())
        .count()
    )
    avg_result = db.query(func.avg(Grade.score)).scalar()
    return AdminOverview(
        total_users=total_users,
        total_students=total_students,
        total_teachers=total_teachers,
        total_assignments=total_assignments,
        total_submissions=total_submissions,
        submissions_today=submissions_today,
        average_system_score=float(avg_result) if avg_result else None,
    )
