# Backend — CLAUDE.md

FastAPI + SQLAlchemy + PostgreSQL + Alembic backend for IAMS.
Root `CLAUDE.md` has the full project overview; this file is backend-specific.

---

## Commands

```bash
# From backend/
.venv\Scripts\activate          # Windows venv

pip install -r requirements.txt

uvicorn app.main:app --reload   # http://localhost:8000

alembic upgrade head            # run migrations
alembic revision --autogenerate -m "description"  # new migration

pytest                          # all tests (SQLite in-memory)
pytest tests/test_auth.py       # single file
```

---

## Layer Architecture: Router → Service → Model

| File/Dir | Role |
|---|---|
| `app/main.py` | FastAPI app, CORS, all routers mounted |
| `app/config.py` | `Settings` via pydantic-settings; reads `backend/.env` |
| `app/database.py` | SQLAlchemy engine + `SessionLocal` |
| `app/dependencies.py` | `get_db()` session generator; `get_current_user()` JWT auth |
| `app/core/security.py` | JWT encode/decode (python-jose) |
| `app/core/permissions.py` | `require_roles(*roles)` dependency factory for RBAC |
| `app/core/exceptions.py` | `UnauthorizedError`, `ForbiddenError`, etc. |
| `app/models/` | SQLAlchemy ORM models — one file per entity |
| `app/schemas/` | Pydantic request/response schemas — one file per entity |
| `app/routers/` | One router per resource |
| `app/services/` | Business logic (e.g., `auth_service.py`) |
| `app/storage/` | `StorageBackend` abstract + `local.py` / `supabase.py` |

---

## Auth Flow

- **Access token**: JWT, 15 min TTL; kept in-memory on frontend
- **Refresh token**: JWT, 7 days TTL; stored in `localStorage` on frontend
- `POST /auth/login` → returns both tokens
- `GET /auth/refresh` → accepts refresh token, returns new access token
- `get_current_user()` in `dependencies.py` decodes Bearer token on each request

---

## RBAC

`require_roles(*roles)` in `core/permissions.py` is a FastAPI dependency factory.

**Roles** (UserRole enum in `models/user.py`):
- `admin`, `teacher`, `student`
- `is_home_teacher=True` — flag on **teacher** users (not a separate role)
- `is_class_monitor=True` — flag on **student** users (not a separate role)

---

## Models (14)

`user`, `class_`, `subject`, `class_subject`, `enrollment`, `assignment`,
`submission`, `submission_file`, `grade`, `grade_category`, `attendance`,
`behavior_log`, `class_schedule`, `notification`

Key relationship:
```
User → Enrollment → Class
User → ClassSubject (Class × Subject × teacher)
     → Assignment → Submission → SubmissionFile
     → Grade (GradeCategory)
User → Attendance
User → BehaviorLog
User → ClassSchedule
User → Notification
```

---

## Routers (16, all mounted in `main.py`)

`auth`, `users`, `classes`, `subjects`, `enrollments`, `class_subjects`,
`assignments`, `submissions`, `grades`, `grade_categories`, `files`,
`attendance`, `behavior_logs`, `analytics`, `schedules`, `notifications`

---

## File Storage

- `STORAGE_BACKEND=local` → files saved to `./uploads/`; served via `GET /files/{path}` (requires auth)
- `STORAGE_BACKEND=supabase` → uses Supabase storage
- `POST /files/upload?submission_id={id}` — multipart, creates `SubmissionFile`

Security: `(Path(base) / user_path).resolve()` then assert `startswith(base)` (path traversal fix).
ALLOWED_TYPES allowlist in `routers/files.py`; reject with 400 if not in set.

---

## Grade Categories

`GradeCategory` model: per `class_subject`, has `name` + `weight` (float).
Total weight across categories for a class_subject must be ≤ 1.0 — enforced on create/update.

---

## Schedules

`ClassSchedule` model: `class_subject_id`, `day_of_week`, `start_time`, `end_time`, `room`.
Router: `GET /schedules` (filter by `class_id`, `teacher_id`, `class_subject_id`, `day_of_week`), full CRUD.
CRUD is admin-only; reading is any authenticated user.
Schema `ScheduleRead` uses `model_validator` to resolve subject/class/teacher names.

---

## Analytics Endpoints

- `GET /analytics/admin/overview`
- `GET /analytics/student/{id}/score-trend`
- `GET /analytics/class/{id}/averages`
- `GET /analytics/home-teacher/{id}/ranking`

---

## Test Setup

`tests/conftest.py` overrides `get_db` with SQLite in-memory; per-test transaction rollback.
Fixtures: `client` (FastAPI `TestClient`), `db` (SQLAlchemy session).
Test files: `test_auth.py`, `test_rbac.py`, `test_business.py`

**Known issues**:
- bcrypt 5.x breaks passlib — pin bcrypt to `<4` in requirements if tests fail on password hashing
- Naive datetime comparison in submissions — use timezone-aware datetimes when checking deadlines

---

## Environment Variables (`backend/.env`)

```
DATABASE_URL=postgresql://iams_user:iams_pass@localhost:5432/iams_db
JWT_SECRET_KEY=<256-bit secret>
STORAGE_BACKEND=local
ALLOWED_ORIGINS=http://localhost:3000
```
