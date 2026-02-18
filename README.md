# Intelligent Academic Management System (IAMS)

A full-stack, role-based academic management platform inspired by Canvas LMS, extended with behavior analytics and cross-subject student ranking.

---

## Tech Stack

| Layer      | Technology                                               |
| ---------- | -------------------------------------------------------- |
| Frontend   | Next.js 14, React 18, TypeScript, Tailwind CSS, Radix UI |
| Backend    | FastAPI (Python), SQLAlchemy, Alembic                    |
| Database   | PostgreSQL 16                                            |
| Auth       | JWT (access + refresh tokens), bcrypt                    |
| Storage    | Local filesystem or Supabase Storage                     |
| Charts     | Recharts                                                 |
| Containers | Docker + Docker Compose                                  |

---

## User Roles

| Role                         | Key Capabilities                                                    |
| ---------------------------- | ------------------------------------------------------------------- |
| **Admin**              | User management, class/subject setup, system analytics              |
| **Teacher**            | Create/publish assignments, grade submissions, view class analytics |
| **Home-Class Teacher** | Cross-subject student ranking, behavior log review, class overview  |
| **Student**            | Submit assignments, view grades, view attendance                    |
| **Class Monitor**      | Mark daily attendance for a class                                   |

---

## Project Structure

```
final-student-management/
├── docker-compose.yml          # PostgreSQL + PgAdmin services
├── backend/
│   ├── app/
│   │   ├── main.py             # FastAPI app + routers
│   │   ├── config.py           # Settings (env vars)
│   │   ├── database.py         # SQLAlchemy engine & session
│   │   ├── dependencies.py     # Auth & DB injection
│   │   ├── core/
│   │   │   ├── security.py     # JWT & password hashing
│   │   │   ├── permissions.py  # Role-based guards
│   │   │   └── exceptions.py   # HTTP error helpers
│   │   ├── models/             # SQLAlchemy ORM models (11 tables)
│   │   ├── schemas/            # Pydantic request/response schemas
│   │   ├── routers/            # API endpoint handlers (13 routers)
│   │   ├── services/           # Business logic layer
│   │   └── storage/            # Local & Supabase file storage
│   ├── alembic/
│   │   └── versions/
│   │       └── 0001_initial_schema.py   # Full DB migration
│   ├── seeds/                  # Sample data seeders
│   ├── requirements.txt
│   └── .env.example
└── frontend/
    └── src/
        ├── app/
        │   ├── (auth)/login/   # Login page
        │   └── (dashboard)/    # Role-specific pages
        │       ├── admin/      # Dashboard, Users, Classes, Subjects, Analytics
        │       ├── teacher/    # Dashboard, Assignments, Gradebook, Analytics
        │       ├── home-teacher/ # Dashboard, Students, Rankings, Behavior
        │       ├── student/    # Dashboard, Assignments, Grades, Attendance
        │       └── class-monitor/ # Dashboard, Attendance marking
        ├── components/
        │   ├── layout/         # Sidebar, Topbar
        │   ├── shared/         # DataTable, StatCard, PageHeader, ConfirmDialog
        │   └── analytics/      # ScoreTrendChart, ClassAverageBar, RankingTable
        ├── lib/
        │   ├── api/            # Axios API clients per resource
        │   ├── hooks/          # useAuth, useBehaviorTracker
        │   └── utils/          # formatDate, roleHelpers, cn
        ├── context/            # AuthContext (JWT + refresh)
        ├── types/              # TypeScript interfaces
        └── middleware.ts       # Route protection & role-based redirects
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
```

Copy the backend environment file and fill in your values:

```bash
cp backend/.env.example backend/.env
```

Key variables to set in `backend/.env`:

```env
DATABASE_URL=postgresql://iams_user:iams_pass@localhost:5432/iams_db
JWT_SECRET_KEY=replace-with-a-long-random-secret
```

---

### 2. Start the database

```bash
docker compose up -d
```

This starts:

- **PostgreSQL** on port `5432`
- **PgAdmin** on port `5050` (login: `admin@iams.local` / `admin`)

---

### 3. Set up the backend

```bash
cd backend
python -m venv .venv #only when we create the venv

# Windows
.venv\Scripts\activate

# macOS / Linux
source .venv/bin/activate

pip install -r requirements.txt

# Run database migrations
alembic upgrade head

# Load sample data
python -m seeds.run_seeds

# Start the API server
uvicorn app.main:app --reload
```

API is available at: `http://localhost:8000`
Interactive docs: `http://localhost:8000/docs`

---

### 4. Set up the frontend

```bash
cd frontend
npm install
npm run dev
```

App is available at: `http://localhost:3000`

---

## Sample Login Credentials

After running seeds, these accounts are available:

| Role          | Email                  | Password    |
| ------------- | ---------------------- | ----------- |
| Admin         | admin@iams.local       | password123 |
| Teacher       | teacher@iams.local     | password123 |
| Home Teacher  | hometeacher@iams.local | password123 |
| Student       | student@iams.local     | password123 |
| Class Monitor | monitor@iams.local     | password123 |

> Credentials are defined in `backend/seeds/users.py`.

---

## API Overview

| Prefix                        | Description                              |
| ----------------------------- | ---------------------------------------- |
| `POST /auth/login`          | Obtain access + refresh tokens           |
| `POST /auth/refresh`        | Refresh access token                     |
| `GET/POST /users`           | User management (admin)                  |
| `GET/POST /classes`         | Class management                         |
| `GET/POST /subjects`        | Subject management                       |
| `GET/POST /class-subjects`  | Assign subjects to classes with teachers |
| `GET/POST /enrollments`     | Enroll students in classes               |
| `GET/POST /assignments`     | Assignment CRUD + publish                |
| `GET/POST /submissions`     | Student submission handling              |
| `GET/POST /grades`          | Grade submissions                        |
| `POST /attendance/batch`    | Batch attendance recording               |
| `POST /behavior-logs/batch` | Log keystroke/paste events               |
| `GET /analytics/...`        | Score trends, rankings, admin overview   |
| `POST /files/upload`        | File attachment upload                   |

---

## Key Features

### Behavior Tracking

Every student submission is monitored for:

- **Keypress events** — characters typed directly
- **Paste events** — content pasted from clipboard
- **Focus gain/loss** — tracks active engagement time

Metrics computed per submission:

- Paste ratio (`paste_chars / total_chars`)
- Engagement classification: `Typed`, `Mixed`, or `Paste-heavy`

### Cross-Subject Ranking (Home Teacher)

The home-class teacher can view a ranked leaderboard of all students in their class, aggregated across all subjects, showing total score, average percentage, and assignment count.

### Role-Based Route Protection

The Next.js middleware (`src/middleware.ts`) validates JWT tokens server-side and redirects users to their role-specific dashboard. No role can access another role's routes.

---

## Database Schema (Summary)

```
users → classes (home_teacher_id)
users → enrollments → classes
users → class_subjects ← subjects
class_subjects → assignments → assignment_submissions
assignment_submissions → behavior_logs
assignment_submissions → grades
assignment_submissions → submission_files
classes + users → attendance
```

---

## Deployment

| Service      | Platform                |
| ------------ | ----------------------- |
| Frontend     | Vercel                  |
| Backend      | Railway or Fly.io       |
| Database     | Supabase PostgreSQL     |
| File Storage | Supabase Storage bucket |

To switch to Supabase storage, set in `.env`:

```env
STORAGE_BACKEND=supabase
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
SUPABASE_STORAGE_BUCKET=iams-files
```
