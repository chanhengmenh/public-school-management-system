# Public School Management System (PSMS)

A full-stack, role-based academic management platform built for **Sereymongkul High School (SRMK)**, featuring a dark glassmorphism UI, Canvas-style class navigation, behavior analytics, and cross-subject student ranking.

---

## Tech Stack

| Layer      | Technology                                                              |
| ---------- | ----------------------------------------------------------------------- |
| Frontend   | Next.js 14 (App Router), TypeScript, Tailwind CSS, shadcn/ui (Radix UI) |
| Backend    | FastAPI (Python 3.11), SQLAlchemy, Alembic                              |
| Database   | PostgreSQL 16                                                           |
| Auth       | JWT (15-min access + 7-day refresh tokens), bcrypt                      |
| Storage    | Local filesystem or Supabase Storage (pluggable)                        |
| Charts     | Recharts                                                                |
| Containers | Docker + Docker Compose                                                 |

---

## User Roles

| Role                    | Key Capabilities                                                                |
| ----------------------- | ------------------------------------------------------------------------------- |
| **Admin**         | User management, class/subject setup, enrollments, system analytics, audit logs |
| **Teacher**       | Create/publish assignments, grade submissions, class analytics, modules         |
| **Home Teacher**  | Cross-subject rankings, behavior log review, class overview                     |
| **Student**       | Submit assignments, track grades, view attendance, class discussion             |
| **Class Monitor** | Mark daily attendance for their class                                           |

---

## UI Theme

The interface uses a **dark glassmorphism** design:

- Background: deep forest dark (`#0a0f0d`) with animated floating orbs
- Accent colors: emerald (`#059669` / `#34d399`) and gold (`#d4a574`)
- Glass cards: `backdrop-filter: blur(20px)` with translucent borders
- Font: [Outfit](https://fonts.google.com/specimen/Outfit)

---

## Project Structure

```
final-student-management/
├── docker-compose.yml              # PostgreSQL + PgAdmin services
├── backend/
│   ├── app/
│   │   ├── main.py                 # FastAPI app + router registration
│   │   ├── config.py               # Settings via pydantic-settings
│   │   ├── database.py             # SQLAlchemy engine & SessionLocal
│   │   ├── dependencies.py         # get_db(), get_current_user() (JWT)
│   │   ├── core/
│   │   │   ├── security.py         # JWT encode/decode, bcrypt
│   │   │   ├── permissions.py      # require_roles() RBAC factory
│   │   │   └── exceptions.py       # UnauthorizedError, ForbiddenError, ConflictError
│   │   ├── models/                 # SQLAlchemy ORM (11 tables)
│   │   ├── schemas/                # Pydantic request/response schemas
│   │   ├── routers/                # 13 API routers (one per resource)
│   │   ├── services/               # Business logic (auth_service, etc.)
│   │   └── storage/                # local.py + supabase.py backends
│   ├── alembic/versions/           # DB migrations
│   ├── seeds/                      # Full sample data seeders
│   ├── seed.py                     # Quick bootstrap (admin + teacher + student)
│   ├── tests/                      # pytest suite (SQLite in-memory)
│   │   ├── conftest.py             # DB fixtures, per-test rollback
│   │   ├── test_auth.py            # Login, refresh, token validation
│   │   ├── test_rbac.py            # Role-based access enforcement
│   │   └── test_business.py        # Submission rules, grading, IDOR, path traversal
│   ├── requirements.txt
│   └── .env.example
└── frontend/
    └── src/
        ├── app/
        │   ├── (auth)/login/           # Login page
        │   └── (dashboard)/
        │       ├── layout.tsx          # Sidebar + Topbar shell
        │       ├── calendar/           # Global calendar + to-do list
        │       ├── admin/              # Dashboard, Users, Classes, Subjects
        │       │   ├── enrollments/    # Student enrollments & class-subjects
        │       │   ├── announcements/  # System-wide announcements
        │       │   ├── analytics/      # Platform statistics
        │       │   ├── settings/       # System configuration
        │       │   └── logs/           # Audit log viewer
        │       ├── teacher/
        │       │   ├── classes/[classId]/  # 7-tab class view
        │       │   ├── assignments/        # All assignments
        │       │   ├── grades/             # Gradebook
        │       │   └── analytics/          # Class analytics
        │       ├── home-teacher/       # Rankings, behavior logs
        │       ├── student/
        │       │   └── classes/[classId]/  # 8-tab class view
        │       └── class-monitor/      # Attendance marking
        ├── components/
        │   ├── layout/             # Sidebar (glass, sectioned), Topbar
        │   ├── shared/             # GlassCard, DataTable, StatCard, PageHeader
        │   ├── class/              # ModulesTab, DiscussionTab, ResourcesTab,
        │   │                       #   AnnouncementsTab, ClassmatesTab, StudentsTab
        │   ├── analytics/          # ScoreTrendChart, ClassAverageBar, RankingTable
        │   └── ui/                 # shadcn/ui primitives
        ├── lib/
        │   ├── api/                # Typed Axios wrappers per resource
        │   ├── hooks/              # useAuth
        │   └── utils/              # formatDate, roleHelpers, cn
        ├── context/AuthContext.tsx # JWT + silent refresh + full profile fetch
        └── types/                  # TypeScript interfaces mirroring backend schemas
```

---

## Getting Started

### Prerequisites

- [Docker Desktop](https://www.docker.com/products/docker-desktop/)
- Python 3.11+
- Node.js 18+

---

### 1. Clone & configure

```bash
git clone git@github.com:chanhengmenh/public-school-management-system.git
cd final-student-management
cp backend/.env.example backend/.env
```

Edit `backend/.env`:

```env
DATABASE_URL=postgresql://iams_user:iams_pass@localhost:5432/iams_db
JWT_SECRET_KEY=replace-with-a-long-random-256-bit-secret
STORAGE_BACKEND=local
ALLOWED_ORIGINS=http://localhost:3000
```

---

### 2. Start the database

```bash
docker compose up -d
```

| Service    | URL                                                  |
| ---------- | ---------------------------------------------------- |
| PostgreSQL | `localhost:5432`                                   |
| PgAdmin    | `http://localhost:5050` (admin@srmk.edu.kh / admin) |

---

### 3. Backend

```bash
cd backend

# Windows
python -m venv .venv && .venv\Scripts\activate

# macOS / Linux
python -m venv .venv && source .venv/bin/activate

pip install -r requirements.txt
alembic upgrade head              # run migrations
python -m seeds.run_seeds        # seed full dataset (405 users, 16 classes, 176 class-subjects, ...)
uvicorn app.main:app --reload    # start API (port 8000)
```

- API: `http://localhost:8000`
- Swagger docs: `http://localhost:8000/docs`
- Health check: `http://localhost:8000/health`

---

### 4. Frontend

```bash
cd frontend
npm install
npm run dev   # http://localhost:3000
```

---

## Sample Credentials

> **Default Password for all accounts:** `password123`
>
> **Email domain:** `@srmk.edu.kh`
>
> **Student format:** `{year}{num:03d}{lastname}@srmk.edu.kh` — e.g. `2025001lim@srmk.edu.kh`
>
> **Teacher format:** `firstname.lastname@srmk.edu.kh` — e.g. `sovann.keo@srmk.edu.kh`

| Role | Email | Password | Notes |
| ---- | ----- | -------- | ----- |
| **Admin** | `admin@srmk.edu.kh` | `password123` | Full system access |
| **Math Teacher** | `sovann.keo@srmk.edu.kh` | `password123` | Home Teacher of Grade 11A |
| **English Teacher** | `sreymom.mao@srmk.edu.kh` | `password123` | Home Teacher of Grade 11B |
| **Physics Teacher** | `piseth.rath@srmk.edu.kh` | `password123` | Home Teacher of Grade 11C |
| **Khmer Teacher** | `chanthy.noun@srmk.edu.kh` | `password123` | Home Teacher of Grade 11D |
| **History Teacher** | `kunthea.lim@srmk.edu.kh` | `password123` | Home Teacher of Grade 11E |
| **Chemistry Teacher** | `bopha.pich@srmk.edu.kh` | `password123` | Standard Teacher |
| **Student (Monitor)** | `2025001lim@srmk.edu.kh` | `password123` | Grade 11A — Class Monitor (Sophea Lim) |
| **Student** | `2025002mao@srmk.edu.kh` | `password123` | Grade 11A — Standard Student (Piseth Mao) |
| **Student (Monitor)** | `2025031bun@srmk.edu.kh` | `password123` | Grade 11B — Class Monitor (Sophea Bun) |
| **Student (Monitor)** | `2025061khem@srmk.edu.kh` | `password123` | Grade 11C — Class Monitor (Sophea Khem) |
| **Student (Monitor)** | `2025091sen@srmk.edu.kh` | `password123` | Grade 11D — Class Monitor (Sophea Sen) |
| **Student (Monitor)** | `2025121dara@srmk.edu.kh` | `password123` | Grade 11E — Class Monitor (Sophea Dara) |

---

## Class Navigation

Both the teacher and student class detail pages use Canvas-style tabbed navigation.

**Teacher** — 7 tabs:

| Tab         | Content                               |
| ----------- | ------------------------------------- |
| Class       | Expandable module sections with items |
| Assignments | Create / publish / delete assignments |
| Gradebook   | Grade student submissions             |
| Students    | Enrolled students table               |
| Discussion  | Threaded discussion (stub UI)         |
| Resources   | Files and links (stub UI)             |
| Analysis    | Subject averages chart + table        |

**Student** — 8 tabs:

| Tab           | Content                                    |
| ------------- | ------------------------------------------ |
| Class         | Read-only module view                      |
| Assignments   | Submit published assignments               |
| Grades        | Score trend chart + grade table            |
| Classmates    | Student avatar grid                        |
| Discussion    | Thread list (stub UI)                      |
| Resources     | File/link cards (stub UI)                  |
| Announcements | Expandable announcements (stub UI)         |
| Attendance    | Personal attendance record + summary stats |

---

## API Overview

| Method                 | Endpoint                                 | Description                                           |
| ---------------------- | ---------------------------------------- | ----------------------------------------------------- |
| `POST`               | `/auth/login`                          | Obtain access + refresh tokens                        |
| `POST`               | `/auth/refresh`                        | Exchange refresh token for a new access token         |
| `GET`                | `/users/me`                            | Get the authenticated user's profile                  |
| `GET/POST`           | `/users`                               | User CRUD (admin only)                                |
| `GET/POST`           | `/classes`                             | Class management                                      |
| `GET/POST`           | `/subjects`                            | Subject management                                    |
| `GET/POST`           | `/class-subjects`                      | Assign subjects + teachers to classes                 |
| `GET/POST`           | `/enrollments`                         | Enroll students in classes                            |
| `GET/POST`           | `/assignments`                         | Assignment CRUD + publish                             |
| `POST /{id}/publish` | `/assignments`                         | Publish a draft assignment                            |
| `GET/POST`           | `/submissions`                         | Student submission handling                           |
| `GET/POST`           | `/grades`                              | Grade submissions (409 on duplicate)                  |
| `PUT`                | `/grades/{id}`                         | Update an existing grade                              |
| `POST`               | `/attendance/batch`                    | Batch attendance recording (class monitor)            |
| `GET`                | `/attendance`                          | List attendance records (students see only their own) |
| `POST`               | `/behavior-logs/batch`                 | Log keypress/paste/focus events                       |
| `GET`                | `/analytics/student/{id}/score-trend`  | Student score trend (own data only for students)      |
| `GET`                | `/analytics/class/{id}/averages`       | Subject averages for a class                          |
| `GET`                | `/analytics/home-teacher/{id}/ranking` | Cross-subject student ranking                         |
| `GET`                | `/analytics/admin/overview`            | Platform-wide statistics                              |
| `POST`               | `/files/upload`                        | File attachment upload                                |
| `GET`                | `/files/{path}`                        | Serve an uploaded file                                |
| `GET`                | `/health`                              | Service health check                                  |

---

## Key Features

### Behavior Tracking

Every submission captures:

- **Keypress count** — characters typed directly
- **Paste count** — content pasted from clipboard
- **Focus events** — active engagement time

Metrics per submission: paste ratio, engagement classification (`Typed` / `Mixed` / `Paste-heavy`).

### Cross-Subject Ranking

The home-class teacher views a ranked leaderboard of all students in their class, aggregated across every subject — showing total score, average percentage, and assignment count. Computed in a single SQL query with `GROUP BY` and `COALESCE` to include students with no grades yet.

### Role-Based Access

`src/middleware.ts` validates JWT server-side on every request and redirects to the correct role dashboard. The `require_roles()` dependency factory on each router endpoint enforces permissions at the API layer. Students are automatically scoped to their own data (submissions, attendance, grades, analytics).

### Calendar & To-Do

`/calendar` is accessible to all roles. It provides a monthly mini-calendar, a weekly schedule view, and a local-storage-persisted personal to-do list.

---

## Security

| Threat                          | Mitigation                                                                |
| ------------------------------- | ------------------------------------------------------------------------- |
| Path traversal on file download | Resolve both paths to absolute; assert result is within upload directory  |
| Unrestricted file upload        | Allowlist of MIME types (PDF, images, plain text, Word); 400 on rejection |
| IDOR — student score trends    | Students blocked from querying other students' analytics (403)            |
| IDOR — attendance records      | Student queries automatically scoped to `current_user.id`               |
| Duplicate grading               | `ConflictError` (409) raised if a submission already has a grade        |

---

## Database Schema

```
users
  ├─→ classes (home_teacher_id FK)
  ├─→ enrollments ←→ classes
  └─→ class_subjects ←→ subjects
        └─→ assignments
              ├─→ assignment_submissions
              │     ├─→ behavior_logs
              │     ├─→ grades
              │     └─→ submission_files
              └─(class + user)→ attendance
```

---

## Tests

Tests use SQLite in-memory via `conftest.py`, with per-test transaction rollback so each test is fully isolated.

```bash
cd backend
pytest                       # run all tests
pytest tests/test_auth.py    # auth flows only
pytest tests/test_rbac.py    # RBAC enforcement only
pytest tests/test_business.py  # business logic only
pytest -v                    # verbose output
```

| File                 | What it covers                                                                                  |
| -------------------- | ----------------------------------------------------------------------------------------------- |
| `test_auth.py`     | Login (valid/invalid creds), refresh token, expired/invalid token rejection                     |
| `test_rbac.py`     | Student blocked from admin/teacher routes; admin and teacher have correct access                |
| `test_business.py` | Draft submission blocked, late flag, duplicate grade → 409, IDOR → 403, path traversal → 404 |

---

## Deployment

**Recommended stack: Vercel (frontend) + Railway (backend + database)**

| Service      | Platform              | Notes                                      |
| ------------ | --------------------- | ------------------------------------------ |
| Frontend     | Vercel                | Free tier, native Next.js App Router support, global CDN |
| Backend API  | Railway               | No cold starts, auto-detects `requirements.txt` |
| Database     | Railway PostgreSQL    | Runs in the same region as the backend — minimal latency |
| File Storage | Supabase Storage      | Optional — set `STORAGE_BACKEND=supabase`  |

### Steps

1. **Push to GitHub**

2. **Railway** — create a new project, add:
   - PostgreSQL plugin (copy `DATABASE_URL` from the addon)
   - Python web service pointing to `backend/` root
   - Add a `Procfile` in `backend/`:
     ```
     web: uvicorn app.main:app --host 0.0.0.0 --port $PORT
     ```
   - Set env vars: `DATABASE_URL`, `JWT_SECRET_KEY`, `STORAGE_BACKEND=local`, `ALLOWED_ORIGINS=https://your-app.vercel.app`
   - Run migrations once deployed: `alembic upgrade head`

3. **Vercel** — import the GitHub repo, set root directory to `frontend/`, add env var:
   ```
   NEXT_PUBLIC_API_URL=https://your-backend.railway.app
   ```

### Supabase Storage (optional)

To store uploaded files on Supabase instead of the local filesystem, add to Railway env vars:

```env
STORAGE_BACKEND=supabase
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
SUPABASE_STORAGE_BUCKET=iams-files
```

---

## Development Commands

```bash
# Backend tests
cd backend && pytest

# New DB migration
cd backend && alembic revision --autogenerate -m "description"

# Apply migrations
cd backend && alembic upgrade head

# Frontend type-check + lint
cd frontend && npm run lint

# Frontend production build
cd frontend && npm run build
```
