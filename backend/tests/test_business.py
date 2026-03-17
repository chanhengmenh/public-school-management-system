"""Tests for business logic rules."""
from datetime import datetime, timedelta, timezone
from app.models.user import User, UserRole
from app.models.class_ import Class
from app.models.subject import Subject
from app.models.class_subject import ClassSubject
from app.models.assignment import Assignment, AssignmentStatus
from app.models.submission import AssignmentSubmission
from app.models.grade import Grade
from app.core.security import hash_password


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def make_user(db, role, email=None, password="pass"):
    email = email or f"{role.value}_{id(db)}@test.com"
    user = User(
        email=email,
        full_name="Test",
        hashed_password=hash_password(password),
        role=role,
        is_active=True,
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


def login(client, email, password="pass"):
    r = client.post("/auth/login", json={"email": email, "password": password})
    assert r.status_code == 200, f"Login failed: {r.json()}"
    return r.json()["access_token"]


def auth_header(token):
    return {"Authorization": f"Bearer {token}"}


def make_class_subject(db, teacher):
    cls = Class(name="Biz Class", academic_year="2025-2026")
    db.add(cls)
    db.commit()
    db.refresh(cls)

    subj = Subject(name="Biz Subject", code=f"BIZ{id(db)}")
    db.add(subj)
    db.commit()
    db.refresh(subj)

    cs = ClassSubject(class_id=cls.id, subject_id=subj.id, teacher_id=teacher.id)
    db.add(cs)
    db.commit()
    db.refresh(cs)
    return cs


def make_assignment(db, cs, status=AssignmentStatus.draft, due_date=None, teacher_id=None):
    a = Assignment(
        class_subject_id=cs.id,
        publisher_id=teacher_id or cs.teacher_id,
        title="Test Assign",
        status=status,
        due_date=due_date,
        max_score=100,
    )
    db.add(a)
    db.commit()
    db.refresh(a)
    return a


# ---------------------------------------------------------------------------
# Submission business rules
# ---------------------------------------------------------------------------

class TestSubmissionRules:
    def test_student_cannot_submit_to_draft_assignment(self, client, db):
        teacher = make_user(db, UserRole.teacher, email="t_draft@test.com")
        student = make_user(db, UserRole.student, email="s_draft@test.com")
        cs = make_class_subject(db, teacher)
        assignment = make_assignment(db, cs, status=AssignmentStatus.draft)

        token = login(client, student.email)
        r = client.post(
            "/submissions/",
            json={"assignment_id": assignment.id, "content": "My answer"},
            headers=auth_header(token),
        )
        assert r.status_code == 403

    def test_student_can_submit_to_published_assignment(self, client, db):
        teacher = make_user(db, UserRole.teacher, email="t_pub@test.com")
        student = make_user(db, UserRole.student, email="s_pub@test.com")
        cs = make_class_subject(db, teacher)
        assignment = make_assignment(db, cs, status=AssignmentStatus.published)

        token = login(client, student.email)
        r = client.post(
            "/submissions/",
            json={"assignment_id": assignment.id, "content": "My answer"},
            headers=auth_header(token),
        )
        assert r.status_code == 200
        assert r.json()["assignment_id"] == assignment.id

    def test_is_late_true_when_past_due_date(self, client, db):
        teacher = make_user(db, UserRole.teacher, email="t_late@test.com")
        student = make_user(db, UserRole.student, email="s_late@test.com")
        cs = make_class_subject(db, teacher)
        past = datetime.now(timezone.utc) - timedelta(days=1)
        assignment = make_assignment(db, cs, status=AssignmentStatus.published, due_date=past)

        token = login(client, student.email)
        r = client.post(
            "/submissions/",
            json={"assignment_id": assignment.id, "content": "Late answer"},
            headers=auth_header(token),
        )
        assert r.status_code == 200
        assert r.json()["is_late"] is True

    def test_is_late_false_when_before_due_date(self, client, db):
        teacher = make_user(db, UserRole.teacher, email="t_ontime@test.com")
        student = make_user(db, UserRole.student, email="s_ontime@test.com")
        cs = make_class_subject(db, teacher)
        future = datetime.now(timezone.utc) + timedelta(days=7)
        assignment = make_assignment(db, cs, status=AssignmentStatus.published, due_date=future)

        token = login(client, student.email)
        r = client.post(
            "/submissions/",
            json={"assignment_id": assignment.id, "content": "Early answer"},
            headers=auth_header(token),
        )
        assert r.status_code == 200
        assert r.json()["is_late"] is False


# ---------------------------------------------------------------------------
# Grading business rules
# ---------------------------------------------------------------------------

class TestGradingRules:
    def _setup(self, db):
        teacher = make_user(db, UserRole.teacher, email=f"t_grade_{id(db)}@test.com")
        student = make_user(db, UserRole.student, email=f"s_grade_{id(db)}@test.com")
        cs = make_class_subject(db, teacher)
        assignment = make_assignment(db, cs, status=AssignmentStatus.published)
        sub = AssignmentSubmission(
            assignment_id=assignment.id,
            student_id=student.id,
            content="answer",
        )
        db.add(sub)
        db.commit()
        db.refresh(sub)
        return teacher, student, sub

    def test_grading_submission_succeeds(self, client, db):
        teacher, _, sub = self._setup(db)
        token = login(client, teacher.email)
        r = client.post(
            "/grades/",
            json={"submission_id": sub.id, "score": 88},
            headers=auth_header(token),
        )
        assert r.status_code == 200
        assert float(r.json()["score"]) == 88.0

    def test_grading_same_submission_twice_returns_409(self, client, db):
        teacher, _, sub = self._setup(db)
        token = login(client, teacher.email)
        client.post("/grades/", json={"submission_id": sub.id, "score": 75}, headers=auth_header(token))
        r = client.post("/grades/", json={"submission_id": sub.id, "score": 80}, headers=auth_header(token))
        assert r.status_code == 409


# ---------------------------------------------------------------------------
# IDOR: student score trend
# ---------------------------------------------------------------------------

class TestIDOR:
    def test_student_cannot_view_other_students_score_trend(self, client, db):
        student_a = make_user(db, UserRole.student, email="idor_a@test.com")
        student_b = make_user(db, UserRole.student, email="idor_b@test.com")
        token_a = login(client, student_a.email)
        r = client.get(
            f"/analytics/student/{student_b.id}/score-trend",
            headers=auth_header(token_a),
        )
        assert r.status_code == 403

    def test_student_can_view_own_score_trend(self, client, db):
        student = make_user(db, UserRole.student, email="idor_self@test.com")
        token = login(client, student.email)
        r = client.get(
            f"/analytics/student/{student.id}/score-trend",
            headers=auth_header(token),
        )
        assert r.status_code == 200


# ---------------------------------------------------------------------------
# Path traversal
# ---------------------------------------------------------------------------

class TestPathTraversal:
    def test_path_traversal_returns_404_not_file_contents(self, client, db):
        user = make_user(db, UserRole.student, email="traversal@test.com")
        token = login(client, user.email)
        r = client.get("/files/../config.py", headers=auth_header(token))
        assert r.status_code in (404, 400, 422)
        body = r.text
        assert "DATABASE_URL" not in body
        assert "JWT_SECRET_KEY" not in body
