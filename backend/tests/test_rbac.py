"""Tests for role-based access control enforcement."""
from app.models.user import User, UserRole
from app.models.class_subject import ClassSubject
from app.models.class_ import Class
from app.models.subject import Subject
from app.models.enrollment import Enrollment
from app.core.security import hash_password


def make_user(db, role, email=None, password="pass",
              is_home_teacher=False, is_class_monitor=False):
    email = email or f"test_{role.value}_{id(db)}@test.com"
    user = User(
        email=email,
        full_name="Test User",
        hashed_password=hash_password(password),
        role=role,
        is_active=True,
        is_home_teacher=is_home_teacher,
        is_class_monitor=is_class_monitor,
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


# ---------------------------------------------------------------------------
# Class Monitor privilege tests
# ---------------------------------------------------------------------------

class TestClassMonitorPrivilege:
    def _setup_class(self, db, monitor_user):
        cls = Class(name="Monitor Class", academic_year="2025-2026")
        db.add(cls)
        db.commit()
        db.refresh(cls)
        enroll = Enrollment(student_id=monitor_user.id, class_id=cls.id)
        db.add(enroll)
        db.commit()
        return cls

    def test_class_monitor_can_batch_attendance(self, client, db):
        monitor = make_user(db, UserRole.student, email="monitor@test.com",
                            is_class_monitor=True)
        cls = self._setup_class(db, monitor)
        student = make_user(db, UserRole.student, email="peer@test.com")
        enroll = Enrollment(student_id=student.id, class_id=cls.id)
        db.add(enroll)
        db.commit()

        token = login(client, monitor.email)
        r = client.post("/attendance/batch", json={
            "class_id": cls.id,
            "date": "2026-03-26",
            "entries": [{"student_id": student.id, "status": "present"}],
        }, headers=auth_header(token))
        assert r.status_code == 200
        assert r.json()["processed"] == 1

    def test_regular_student_cannot_batch_attendance(self, client, db):
        student = make_user(db, UserRole.student, email="nomonitor@test.com",
                            is_class_monitor=False)
        token = login(client, student.email)
        r = client.post("/attendance/batch", json={
            "class_id": 1,
            "date": "2026-03-26",
            "entries": [{"student_id": 999, "status": "present"}],
        }, headers=auth_header(token))
        assert r.status_code == 403

    def test_teacher_cannot_batch_attendance(self, client, db):
        teacher = make_user(db, UserRole.teacher, email="teach_att@test.com")
        token = login(client, teacher.email)
        r = client.post("/attendance/batch", json={
            "class_id": 1,
            "date": "2026-03-26",
            "entries": [{"student_id": 999, "status": "present"}],
        }, headers=auth_header(token))
        assert r.status_code == 403

    def test_admin_can_batch_attendance(self, client, db):
        admin = make_user(db, UserRole.admin, email="admin_att@test.com")
        token = login(client, admin.email)
        r = client.post("/attendance/batch", json={
            "class_id": 1,
            "date": "2026-03-26",
            "entries": [],
        }, headers=auth_header(token))
        assert r.status_code == 200


# ---------------------------------------------------------------------------
# Home Teacher privilege tests
# ---------------------------------------------------------------------------

class TestHomeTeacherPrivilege:
    def _setup_home_class(self, db, teacher):
        cls = Class(name="Home Class", academic_year="2025-2026",
                    home_teacher_id=teacher.id)
        db.add(cls)
        db.commit()
        db.refresh(cls)
        return cls

    def test_home_teacher_can_access_ranking(self, client, db):
        teacher = make_user(db, UserRole.teacher, email="ht_ok@test.com",
                            is_home_teacher=True)
        cls = self._setup_home_class(db, teacher)
        token = login(client, teacher.email)
        r = client.get(f"/analytics/home-teacher/{cls.id}/ranking",
                       headers=auth_header(token))
        assert r.status_code == 200

    def test_regular_teacher_cannot_access_ranking(self, client, db):
        teacher = make_user(db, UserRole.teacher, email="ht_no@test.com",
                            is_home_teacher=False)
        token = login(client, teacher.email)
        r = client.get("/analytics/home-teacher/1/ranking",
                       headers=auth_header(token))
        assert r.status_code == 403

    def test_student_cannot_access_ranking(self, client, db):
        student = make_user(db, UserRole.student, email="ht_student@test.com")
        token = login(client, student.email)
        r = client.get("/analytics/home-teacher/1/ranking",
                       headers=auth_header(token))
        assert r.status_code == 403

    def test_admin_can_access_ranking(self, client, db):
        admin = make_user(db, UserRole.admin, email="ht_admin@test.com")
        token = login(client, admin.email)
        r = client.get("/analytics/home-teacher/1/ranking",
                       headers=auth_header(token))
        assert r.status_code == 200


# ---------------------------------------------------------------------------
# Admin-only endpoint tests
# ---------------------------------------------------------------------------

class TestAdminOnlyEndpoints:
    def test_teacher_cannot_access_admin_overview(self, client, db):
        teacher = make_user(db, UserRole.teacher, email="teach_overview@test.com")
        token = login(client, teacher.email)
        r = client.get("/analytics/admin/overview", headers=auth_header(token))
        assert r.status_code == 403

    def test_student_cannot_access_admin_overview(self, client, db):
        student = make_user(db, UserRole.student, email="stud_overview@test.com")
        token = login(client, student.email)
        r = client.get("/analytics/admin/overview", headers=auth_header(token))
        assert r.status_code == 403

    def test_admin_can_access_admin_overview(self, client, db):
        admin = make_user(db, UserRole.admin, email="admin_overview@test.com")
        token = login(client, admin.email)
        r = client.get("/analytics/admin/overview", headers=auth_header(token))
        assert r.status_code == 200
