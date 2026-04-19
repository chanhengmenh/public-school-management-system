# Public School Management System (PSMS) - GEMINI Mandates

This document contains foundational mandates, architectural standards, and deployment protocols for the Public School Management System (PSMS), built for Sereymongkul High School (SRMK). These instructions take absolute precedence over general defaults.

## 🛠️ Core Tech Stack
- **Backend:** FastAPI (Python 3.10+), SQLAlchemy 2.0 (Sync), Alembic (Migrations), Pydantic v2.
- **Frontend:** Next.js 14+ (App Router), TypeScript, Tailwind CSS, shadcn/ui (Radix UI).
- **Database:** PostgreSQL (Supabase in production, SQLite for tests).
- **Storage:** Pluggable Backend (Local or Supabase Storage).
- **Authentication:** JWT-based RBAC (Admin, Teacher, Student).

## 🏗️ Architectural Standards

### Backend (`/backend`)
- **Pattern:** Layered structure: **Router → Service → Model**.
- **Models:** Use SQLAlchemy 2.0 `Mapped` and `mapped_column` syntax.
- **Schemas:** Use Pydantic v2 for request/response validation.
- **Migrations:** Always generate an Alembic migration for model changes: `alembic revision --autogenerate -m "description"`.
- **Storage:** Abstract `StorageBackend` with `local.py` and `supabase.py` implementations.
- **Naming:** `snake_case` for all Python code.

### Frontend (`/frontend`)
- **Structure:** Next.js App Router (`app/`). Components in `components/`.
- **State:** `AuthProvider` manages session (`user`, `isLoading`, `login`, `logout`).
- **Auth Flow:** Short-lived JWT access token (memory only) + long-lived refresh token (`localStorage`).
- **Styling:** Tailwind CSS + shadcn/ui. Adhere to SRMK branding.
- **API:** Centralized Axios client in `lib/api/client.ts` with auto-refresh interceptors.
- **Naming:** `PascalCase` for components, `camelCase` for variables/functions.

## 📊 Key Data Model Relationships
```
User (roles: admin, teacher, student)
  ↕ Enrollment → Class
  ↕ ClassSubject (Class × Subject × teacher User)
    ↕ Assignment → AssignmentSubmission (by student User)
    ↕ Grade (scored by teacher User)
  ↕ Attendance (marked by class_monitor User)
  ↕ BehaviorLog (on student User, by home_teacher)
```
*Note: `is_home_teacher` and `is_class_monitor` are flags, not separate roles.*

## 🔐 Security & Permissions
- **RBAC:** Strictly enforce roles in backend `dependencies.py` and frontend route guards.
- **IDOR Protection:** Ownership checks mandatory for `/class-subjects/{id}`, `/analytics/`, etc.
- **Secrets:** NEVER hardcode credentials. Use `.env` and `app/config.py`.

## 🧪 Testing & Validation
- **Backend:** `pytest` in `backend/tests/`. Verify `test_rbac.py` before any PR.
- **Frontend:** Ensure all components handle loading/error states and are fully typed.

## 🚀 Deployment (Production Stack)
- **Backend:** Railway (FastAPI + Alembic).
- **Frontend:** Vercel (Next.js).
- **Database/Storage:** Supabase (PostgreSQL + S3-compatible Storage).
- **Domain:** SRMK Educational domain (`@srmk.edu.kh`).

## 📈 Current Project Status (Tiered Progress)
- **Completed:** Security IDOR fixes, Admin Password Resets, Announcements, Audit Logs, Bulk CSV Import, SRMK Rebranding, Timetable Wiring.
- **Immediate Priorities:** 
  1. Verify Quiz feature end-to-end.
  2. Implement Academic Year transition workflow.
  3. Deploy to Railway/Vercel/Supabase live.

## 💻 Essential Commands
### Backend
- `uvicorn app.main:app --reload` (Dev Server)
- `alembic upgrade head` (Migrations)
- `pytest` (Tests)

### Frontend
- `npm run dev` (Dev Server)
- `npm run build` (Production Build)
- `npm run lint` (Linting)
