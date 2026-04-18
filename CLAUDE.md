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

**User roles**: `admin`, `teacher`, `student` (enum in `models/user.py`). `is_home_teacher=True` is a flag on teacher users; `is_class_monitor=True` is a flag on student users — these are NOT separate role values.

### Frontend (`frontend/`)

- `app/` — Next.js App Router pages
  - `(auth)/login/` — Login page (no layout chrome)
  - Route segments per role: `/admin/...`, `/teacher/...`, `/student/...`
  - Root `page.tsx` redirects to the role-specific dashboard or `/login`
- `contexts/NotificationContext.tsx` — In-memory notification state (mock, no backend)
- `components/auth/AuthProvider.tsx` — Provides `user`, `isLoading`, `login`, `logout`, `refreshUser`; silently refreshes on mount using `localStorage.refresh_token`; access token kept **in memory only** via `setAccessToken()` in `lib/api/client.ts`
- `components/auth/PasswordGuard.tsx` — Guards routes that require a password change
- `lib/api/client.ts` — Axios instance; base URL from `NEXT_PUBLIC_API_URL` (default `http://localhost:8000`); request interceptor injects `Authorization: Bearer <access_token>`; 401 response interceptor auto-refreshes and retries
- `lib/api/*.ts` — Typed API wrappers per resource (`auth`, `users`, `classes`, `subjects`, `enrollments`, `class-subjects`, `assignments`, `submissions`, `grades`, `grade-categories`, `files`, `attendance`, `analytics`, `schedules`, `notifications`)
- `types/` — TypeScript interfaces mirroring backend schemas (`user.types.ts`, `school.types.ts`)
- `components/ui/` — shadcn/ui primitives (Button, Dialog, Toast, Table, etc.)
- `components/layouts/` — `MainSidebar` (role-based nav), `TeacherSidebar`, `PageHeader`, `SubjectTabs`

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

---

## Deployment (Railway + Vercel + Supabase)

Chosen stack: **Railway** (backend) + **Vercel** (frontend) + **Supabase** (PostgreSQL + file storage).

### Services

| Service | Purpose | Cost |
|---------|---------|------|
| Railway | FastAPI backend | Free tier / ~$5/mo |
| Vercel | Next.js frontend | Free |
| Supabase | PostgreSQL + file storage | Free tier (upgrade to $25/mo for production to prevent DB pause) |

### Config Files

| File | Purpose |
|------|---------|
| `backend/railway.toml` | Railway build + start command |
| `backend/Procfile` | Fallback process definition |
| `backend/.env.production` | Template for Railway env vars (do NOT commit real values) |
| `frontend/vercel.json` | Vercel build config (region: Singapore `sin1`) |

### Step-by-Step Deploy

#### 1. Supabase (Database + Storage)
1. Create project at [supabase.com](https://supabase.com)
2. Go to **Settings → Database → Connection string** (use **Transaction mode** URI) → set as `DATABASE_URL` in Railway
3. Go to **Settings → API** → copy `service_role` key → set as `SUPABASE_SERVICE_ROLE_KEY`
4. Go to **Storage** → create bucket named `iams-files` (set to private)

#### 2. Railway (Backend)
1. Create project at [railway.app](https://railway.app)
2. **New Service → GitHub Repo** → select this repo → set **Root Directory** to `backend/`
3. Go to **Variables** tab → add all vars from `backend/.env.production` with real values:
   ```
   DATABASE_URL=<supabase transaction uri>
   JWT_SECRET_KEY=<run: openssl rand -hex 32>
   STORAGE_BACKEND=supabase
   SUPABASE_URL=https://<project>.supabase.co
   SUPABASE_SERVICE_ROLE_KEY=<service role key>
   SUPABASE_STORAGE_BUCKET=iams-files
   ALLOWED_ORIGINS=https://<your-app>.vercel.app
   DEBUG=false
   ENVIRONMENT=production
   ```
4. Deploy — Railway auto-runs `alembic upgrade head` then starts uvicorn
5. Copy the generated Railway domain (e.g. `https://iams-backend.up.railway.app`)

#### 3. Vercel (Frontend)
1. Go to [vercel.com](https://vercel.com) → **New Project → Import GitHub Repo**
2. Set **Root Directory** to `frontend/`
3. Add environment variable:
   ```
   NEXT_PUBLIC_API_URL=https://<your-railway-domain>.up.railway.app
   ```
4. Deploy — Vercel auto-detects Next.js

#### 4. Final Wiring
- Go back to Railway → update `ALLOWED_ORIGINS` to your Vercel URL
- Redeploy Railway service

### Generate a Secure JWT Secret
```bash
openssl rand -hex 32
```

### Stability Notes
- Vercel: 99.99% uptime, no concerns
- Railway: stable for hundreds of concurrent users; free tier has $5/mo credit cap
- Supabase free tier: **pauses after 7 days of inactivity** — upgrade to paid for daily school use
