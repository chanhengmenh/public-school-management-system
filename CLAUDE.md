# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

IAMS (Intelligent Academic Management System) — a role-based academic management platform. The repo has two independently runnable services:

- `backend/` — FastAPI + SQLAlchemy + PostgreSQL + Alembic
- `frontend/` — Next.js 14 (App Router) + TypeScript + Tailwind CSS + shadcn/ui (Radix UI primitives)

---

## Commands

### Backend

```bash
# From the backend/ directory
cd backend

# Activate virtual environment (Windows)
.venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Run development server (http://localhost:8000)
uvicorn app.main:app --reload

# Run database migrations
alembic upgrade head

# Create a new migration
alembic revision --autogenerate -m "description"

# Run tests (uses SQLite in-memory via conftest.py)
pytest

# Run a single test file
pytest tests/test_auth.py
```

### Frontend

```bash
# From the frontend/ directory
cd frontend

# Install dependencies
npm install

# Run development server (http://localhost:3000)
npm run dev

# Build for production
npm run build

# Lint
npm run lint
```

---

## Architecture

### Backend (`backend/app/`)

Layered structure: **Router → Service → Model**

- `main.py` — FastAPI app, CORS, all routers registered
- `config.py` — `Settings` via `pydantic-settings`; reads from `backend/.env`
- `database.py` — SQLAlchemy engine + `SessionLocal`
- `dependencies.py` — `get_db()` session generator; `get_current_user()` JWT auth dependency
- `core/security.py` — JWT encode/decode (python-jose)
- `core/permissions.py` — `require_roles(*roles)` FastAPI dependency factory for RBAC
- `core/exceptions.py` — `UnauthorizedError`, `ForbiddenError`, etc.
- `models/` — SQLAlchemy ORM models (one file per entity)
- `schemas/` — Pydantic request/response schemas (one file per entity)
- `routers/` — One router per resource, each mounted in `main.py`
- `services/` — Business logic separated from routers (e.g., `auth_service.py`)
- `storage/` — Pluggable file storage; abstract `StorageBackend` with `local.py` and `supabase.py` implementations; backend selected via `STORAGE_BACKEND` env var

**Auth flow**: Short-lived JWT access token (15 min) + long-lived refresh token (7 days). `GET /auth/refresh` accepts refresh token and returns a new access token.

**User roles**: `admin`, `teacher`, `home_teacher`, `student`, `class_monitor` (enum in `models/user.py`).

### Frontend (`frontend/src/`)

- `app/` — Next.js App Router pages
  - `(auth)/` — Login page (no layout chrome)
  - `(dashboard)/` — Protected routes; `layout.tsx` redirects unauthenticated users to `/login` and renders `<Sidebar>` + `<Topbar>`
  - Route segments per role: `/admin/...`, `/teacher/...`, `/home-teacher/...`, `/student/...`, `/class-monitor/...`
  - Root `page.tsx` redirects to the role-specific dashboard or `/login`
- `context/AuthContext.tsx` — Provides `user`, `isLoading`, `login`, `logout`; silently refreshes on mount using `localStorage.refresh_token`; access token kept **in memory only** via `setAccessToken()` in `lib/api/client.ts`
- `lib/hooks/useAuth.ts` — Consumes `AuthContext`
- `lib/api/client.ts` — Axios instance; base URL from `NEXT_PUBLIC_API_URL` (default `http://localhost:8000`); request interceptor injects `Authorization: Bearer <access_token>`; 401 response interceptor auto-refreshes and retries
- `lib/api/*.ts` — Typed API wrappers per resource (e.g., `assignmentsApi`, `gradesApi`)
- `lib/utils/roleHelpers.ts` — `ROLE_DASHBOARD` map used for post-login redirect; `getRoleDashboard(role)` returns the route
- `types/` — TypeScript interfaces mirroring backend schemas
- `components/ui/` — shadcn/ui primitives (Button, Dialog, Toast, Table, etc.)
- `components/shared/` — Reusable app-level components: `DataTable`, `PageHeader`, `StatCard`, `ConfirmDialog`
- `components/layout/` — `Sidebar` (renders nav items keyed by role from `NAV_CONFIG`), `Topbar`
- `components/analytics/` — Recharts-based chart components

### Key Data Model Relationships

```
User (roles: admin/teacher/home_teacher/student/class_monitor)
  ↕ Enrollment → Class
  ↕ ClassSubject (Class × Subject × teacher User)
    ↕ Assignment → AssignmentSubmission (by student User)
    ↕ Grade (scored by teacher User)
  ↕ Attendance (marked by class_monitor User)
  ↕ BehaviorLog (on student User, by home_teacher)
```

### Environment Variables

Backend (`backend/.env`):
```
DATABASE_URL=postgresql://iams_user:iams_pass@localhost:5432/iams_db
JWT_SECRET_KEY=<256-bit secret>
STORAGE_BACKEND=local   # or "supabase"
ALLOWED_ORIGINS=http://localhost:3000
```

Frontend (`frontend/.env.local`):
```
NEXT_PUBLIC_API_URL=http://localhost:8000
```

### Test Setup

`backend/tests/conftest.py` overrides `get_db` to use a SQLite test database with per-test transaction rollback. Fixtures: `client` (FastAPI `TestClient`) and `db` (SQLAlchemy session).
