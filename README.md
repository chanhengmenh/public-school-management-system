# Public School Management System

Full-stack academic management platform with Canvas-like workflows, attendance, and analytics.

## Overview

Features include:

- LMS-style subjects, assignments, grades, and resources
- Role-aware navigation (admin, teacher, home teacher, student, class monitor)
- Attendance tracking (present, late, absent, permission)
- Messaging and collaborations
- Analytics dashboards

## Tech Stack

Frontend:

- Next.js (App Router), TypeScript, Tailwind CSS

Backend:

- FastAPI, PostgreSQL, JWT auth

## Project Structure

```
final_year_project/
├── frontend/              # Next.js app
│   ├── app/               # App router pages
│   ├── components/        # UI + app shell
│   └── lib/               # API helpers
├── backend/               # FastAPI app
│   ├── models/            # Pydantic models
│   ├── routers/           # API routes
│   ├── services/          # Business logic
│   ├── utils/             # Auth utilities
│   └── main.py            # FastAPI entry
├── database/              # SQL schema
│   └── schema.sql
└── docs/
```

## Getting Started

Prerequisites:

- Node.js 18+
- Python 3.11+
- PostgreSQL (local or Supabase)

Frontend:

```bash
cd frontend
npm install
npm run dev
```

Backend:

```bash
cd backend
pip install -r requirements.txt
cp .env.example .env
python main.py
```

Database (local example):

```bash
createdb -U postgres public-school-management
psql -U postgres -d public-school-management -f database/schema.sql
```

## App Pages

All roles share the same tabs while the APIs enforce access control:

- Dashboard, Subjects, Assignments, Grades
- Messages, Collaborations, Files, Analytics
- Profile, Classmates, Teachers, Attendance
- Admin: Users, Classes, Announcements, Reports, System Analytics

## API Surface (selected)

Authentication:

- POST /api/auth/login
- GET /api/auth/me
- POST /api/auth/logout

Core data:

- GET /api/subjects
- GET /api/classes
- GET /api/classes/{class_id}/students
- GET /api/subjects/class/{class_id}
- GET /api/assignments/class/{class_id}

Attendance:

- GET /api/attendance/class/{class_id}/session?date=YYYY-MM-DD
- POST /api/attendance/class/{class_id}/session

## Notes

- File uploads store metadata; storage integration can be added later.
- For existing databases, apply schema changes manually if tables/enums are missing.

## API Docs

Once the backend is running:

- http://localhost:8000/docs

## License
