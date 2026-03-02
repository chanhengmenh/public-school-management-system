"""Tests for role-based access control enforcement."""
from app.models.user import User, UserRole
from app.models.class_subject import ClassSubject
from app.models.class_ import Class
from app.models.subject import Subject
from app.core.security import hash_password


def make_user(db, role, email=None, password="pass"):
    email = email or f"test_{role.value}_{id(db)}@test.com"
    user = User(
        email=email,
        full_name="Test User",
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


class TestStudentRestrictions:
    def test_student_cannot_list_users(self, client, db):
        user = make_user(db, UserRole.student, email="student_list@test.com")
        token = login(client, user.email)
        r = client.get("/users/", headers=auth_header(token))
        assert r.status_code == 403

    def test_student_cannot_create_assignment(self, client, db):
        user = make_user(db, UserRole.student, email="student_assign@test.com")
        token = login(client, user.email)
        r = client.post(
            "/assignments/",
            json={"title": "Hack", "class_subject_id": 1},
            headers=auth_header(token),
        )
        assert r.status_code == 403

    def test_student_cannot_list_behavior_logs(self, client, db):
        user = make_user(db, UserRole.student, email="student_logs@test.com")
        token = login(client, user.email)
        r = client.get("/behavior-logs/", headers=auth_header(token))
        assert r.status_code == 403


class TestAdminAccess:
    def test_admin_can_list_users(self, client, db):
        admin = make_user(db, UserRole.admin, email="admin_list@test.com")
        token = login(client, admin.email)
        r = client.get("/users/", headers=auth_header(token))
        assert r.status_code == 200
        assert isinstance(r.json(), list)


class TestTeacherAccess:
    def test_teacher_can_create_assignment(self, client, db):
        teacher = make_user(db, UserRole.teacher, email="teacher_assign@test.com")
        token = login(client, teacher.email)

        # Create required class_subject
        cls = Class(name="Test Class", academic_year="2025-2026", home_teacher_id=teacher.id)
        db.add(cls)
        db.commit()
        db.refresh(cls)

        subj = Subject(name="Test Subject", code="TST101")
        db.add(subj)
        db.commit()
        db.refresh(subj)

        cs = ClassSubject(class_id=cls.id, subject_id=subj.id, teacher_id=teacher.id)
        db.add(cs)
        db.commit()
        db.refresh(cs)

        r = client.post(
            "/assignments/",
            json={"title": "Test Assignment", "class_subject_id": cs.id},
            headers=auth_header(token),
        )
        assert r.status_code == 200
