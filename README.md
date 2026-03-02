# IAMS — Intelligent Academic Management System

A full-stack, role-based academic management platform with a dark glassmorphism UI, Canvas-style class navigation, behavior analytics, and cross-subject student ranking.

---

## Tech Stack

| Layer      | Technology |
| ---------- | ---------- |
| Frontend   | Next.js 14 (App Router), TypeScript, Tailwind CSS, shadcn/ui (Radix UI) |
| Backend    | FastAPI (Python 3.11), SQLAlchemy, Alembic |
| Database   | PostgreSQL 16 |
| Auth       | JWT (15-min access + 7-day refresh tokens), bcrypt |
| Storage    | Local filesystem or Supabase Storage (pluggable) |
| Charts     | Recharts |
| Containers | Docker + Docker Compose |

---

## User Roles

| Role              | Key Capabilities |
| ----------------- | ---------------- |
| **Admin**         | User management, class/subject setup, enrollments, system analytics, audit logs |
| **Teacher**       | Create/publish assignments, grade submissions, class analytics, modules |
| **Home Teacher**  | Cross-subject rankings, behavior log review, class overview |
| **Student**       | Submit assignments, track grades, view attendance, class discussion |
| **Class Monitor** | Mark daily attendance for their class |

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

| Service    | URL |
| ---------- | --- |
| PostgreSQL | `localhost:5432` |
| PgAdmin    | `http://localhost:5050` (admin@iams.local / admin) |

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

> All created by `python -m seeds.run_seeds` (password for every account: **`password123`**)

| Role                   | Email                          | Notes |
| ---------------------- | ------------------------------ | ----- |
| Admin                  | `admin@iams.edu`               | Full system access |
| Math teacher / home    | `math.teacher@iams.edu`        | Teaches MATH101 across all classes; home teacher of Class 10A |
| English teacher / home | `english.teacher@iams.edu`     | Teaches ENG101; home teacher of Class 10B |
| Physics teacher / home | `physics.teacher@iams.edu`     | Teaches PHYS101; home teacher of Class 10C |
| History teacher / home | `history.teacher@iams.edu`     | Teaches HIST101; home teacher of Class 10D |
| Chemistry teacher      | `chem.teacher@iams.edu`        | Teaches CHEM101 |
| Biology teacher        | `bio.teacher@iams.edu`         | Teaches BIO101 |
| French teacher         | `french.teacher@iams.edu`      | Teaches FREN101 |
| CS teacher             | `cs.teacher@iams.edu`          | Teaches CS101 |
| PE teacher             | `pe.teacher@iams.edu`          | Teaches PE101 |
| Art teacher            | `art.teacher@iams.edu`         | Teaches ART101 |
| Music teacher          | `music.teacher@iams.edu`       | Teaches MUS101 |
| Student (class monitor)| `student001@iams.edu`          | Class 10A, marks attendance |
| Student                | `student002@iams.edu`          | Class 10A |

Each subject-specialist teacher teaches their one subject across all 16 class sections (176 class-subject records total).

---

## Class Navigation

Both the teacher and student class detail pages use Canvas-style tabbed navigation.

**Teacher** — 7 tabs:

| Tab         | Content |
| ----------- | ------- |
| Class       | Expandable module sections with items |
| Assignments | Create / publish / delete assignments |
| Gradebook   | Grade student submissions |
| Students    | Enrolled students table |
| Discussion  | Threaded discussion (stub UI) |
| Resources   | Files and links (stub UI) |
| Analysis    | Subject averages chart + table |

**Student** — 8 tabs:

| Tab           | Content |
| ------------- | ------- |
| Class         | Read-only module view |
| Assignments   | Submit published assignments |
| Grades        | Score trend chart + grade table |
| Classmates    | Student avatar grid |
| Discussion    | Thread list (stub UI) |
| Resources     | File/link cards (stub UI) |
| Announcements | Expandable announcements (stub UI) |
| Attendance    | Personal attendance record + summary stats |

---

## API Overview

| Method | Endpoint | Description |
| ------ | -------- | ----------- |
| `POST` | `/auth/login` | Obtain access + refresh tokens |
| `POST` | `/auth/refresh` | Exchange refresh token for a new access token |
| `GET`  | `/users/me` | Get the authenticated user's profile |
| `GET/POST` | `/users` | User CRUD (admin only) |
| `GET/POST` | `/classes` | Class management |
| `GET/POST` | `/subjects` | Subject management |
| `GET/POST` | `/class-subjects` | Assign subjects + teachers to classes |
| `GET/POST` | `/enrollments` | Enroll students in classes |
| `GET/POST` | `/assignments` | Assignment CRUD + publish |
| `POST /{id}/publish` | `/assignments` | Publish a draft assignment |
| `GET/POST` | `/submissions` | Student submission handling |
| `GET/POST` | `/grades` | Grade submissions (409 on duplicate) |
| `PUT` | `/grades/{id}` | Update an existing grade |
| `POST` | `/attendance/batch` | Batch attendance recording (class monitor) |
| `GET`  | `/attendance` | List attendance records (students see only their own) |
| `POST` | `/behavior-logs/batch` | Log keypress/paste/focus events |
| `GET`  | `/analytics/student/{id}/score-trend` | Student score trend (own data only for students) |
| `GET`  | `/analytics/class/{id}/averages` | Subject averages for a class |
| `GET`  | `/analytics/home-teacher/{id}/ranking` | Cross-subject student ranking |
| `GET`  | `/analytics/admin/overview` | Platform-wide statistics |
| `POST` | `/files/upload` | File attachment upload |
| `GET`  | `/files/{path}` | Serve an uploaded file |
| `GET`  | `/health` | Service health check |

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

| Threat | Mitigation |
| ------ | ---------- |
| Path traversal on file download | Resolve both paths to absolute; assert result is within upload directory |
| Unrestricted file upload | Allowlist of MIME types (PDF, images, plain text, Word); 400 on rejection |
| IDOR — student score trends | Students blocked from querying other students' analytics (403) |
| IDOR — attendance records | Student queries automatically scoped to `current_user.id` |
| Duplicate grading | `ConflictError` (409) raised if a submission already has a grade |

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

| File | What it covers |
| ---- | -------------- |
| `test_auth.py` | Login (valid/invalid creds), refresh token, expired/invalid token rejection |
| `test_rbac.py` | Student blocked from admin/teacher routes; admin and teacher have correct access |
| `test_business.py` | Draft submission blocked, late flag, duplicate grade → 409, IDOR → 403, path traversal → 404 |

---

## Deployment

| Service      | Recommended Platform |
| ------------ | -------------------- |
| Frontend     | Vercel |
| Backend API  | Railway or Fly.io |
| Database     | Supabase PostgreSQL |
| File Storage | Supabase Storage bucket |

To enable Supabase storage, add to `backend/.env`:

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
