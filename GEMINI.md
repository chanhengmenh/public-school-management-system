# Student Management System - GEMINI Mandates

This document contains foundational mandates and architectural standards for the Student Management System. These instructions take absolute precedence over general defaults.

## 🛠️ Core Tech Stack
- **Backend:** FastAPI (Python 3.10+), SQLAlchemy 2.0 (Sync), Alembic (Migrations), Pydantic v2.
- **Frontend:** Next.js 14+ (App Router), TypeScript, Tailwind CSS, React Context for Auth.
- **Database:** PostgreSQL.
- **Authentication:** JWT-based RBAC (Admin, Teacher, Student).

## 🏗️ Architectural Standards
### Backend (`/backend`)
- **Structure:** Modular layout (`app/models`, `app/routers`, `app/schemas`, `app/services`).
- **Models:** Use SQLAlchemy 2.0 `Mapped` and `mapped_column` syntax.
- **Schemas:** Use Pydantic v2 for request/response validation.
- **Migrations:** Always generate an Alembic migration for model changes: `alembic revision --autogenerate -m "description"`.
- **Naming:** `snake_case` for all Python code.

### Frontend (`/frontend`)
- **Structure:** Next.js App Router (`src/app`). Components in `src/components`.
- **State:** Use `AuthContext` for user session management.
- **Styling:** Tailwind CSS for all UI. Prefer Radix UI or Shadcn/UI patterns if present.
- **API:** Centralize API calls in `src/lib/api/`.
- **Naming:** `PascalCase` for components, `camelCase` for variables/functions.

## 🔐 Security & Permissions
- **RBAC:** Strictly enforce role-based access in both backend dependencies (`dependencies.py`) and frontend middleware/layout guards.
- **Secrets:** NEVER hardcode credentials. Use `.env` files and `backend/app/config.py`.

## 🧪 Testing & Validation
- **Backend:** Use `pytest` for unit and integration tests in `backend/tests/`.
- **Frontend:** Ensure all new components are typed and handle loading/error states.
- **Mandate:** Before finalizing a backend change, verify it doesn't break existing RBAC logic in `test_rbac.py`.
