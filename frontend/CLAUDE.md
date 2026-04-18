# Frontend — CLAUDE.md

Next.js 14 (App Router) + TypeScript + Tailwind CSS + shadcn/ui frontend for IAMS.
Root `CLAUDE.md` has the full project overview; this file is frontend-specific.

---

## Commands

```bash
# From frontend/
npm install
npm run dev     # http://localhost:3000
npm run build
npm run lint
```

---

## App Router Structure (`app/`)

```
app/
├── (auth)/login/         # Login page — no layout chrome
├── page.tsx              # Root redirect: role dashboard or /login
├── admin/
│   ├── page.tsx          # Dashboard (real API)
│   ├── users/            # User CRUD (real API)
│   ├── academic/         # Classes + Subjects CRUD (real API)
│   ├── analytics/        # Admin overview + class averages (real API)
│   ├── announcements/    # ⚠️ Mock — no backend endpoint
│   ├── timetable/        # ⚠️ Mock — schedule API exists but not wired
│   └── settings/         # ⚠️ Mock — no API calls
├── teacher/
│   ├── page.tsx          # Dashboard (real API)
│   ├── classes/[subjectId]/
│   │   ├── page.tsx      # Overview / assignments (real API)
│   │   ├── grading/      # Grade categories (real API)
│   │   ├── students/     # Roster (real API)
│   │   ├── quizzes/      # Quizzes (real API)
│   │   ├── analysis/     # Class averages chart (real API)
│   │   └── submissions/  # Per-assignment grading (real API)
│   ├── schedule/         # Teacher schedule (real API)
│   ├── students/         # Home-teacher student list (real API)
│   ├── notifications/    # ⚠️ Mock — uses NotificationContext (dummy data)
│   └── settings/         # ⚠️ Mock — hardcoded, needs PUT /users/me
└── student/
    ├── page.tsx           # Dashboard (real API)
    ├── classes/[subjectId]/
    │   ├── homework/[assignmentId]/  # Submit + view (real API)
    │   ├── quiz/[quizId]/            # Quiz submit (real API)
    │   ├── grade/                    # Grades (real API)
    │   ├── attendance/               # Attendance (real API)
    │   └── people/                   # Roster (real API)
    ├── schedule/          # Timetable grid (real API)
    ├── settings/          # Edit profile + password (real API)
    └── notifications/     # ⚠️ Mock — no backend endpoint
```

Protected routes redirect unauthenticated users to `/login` via layout guards.
Root `page.tsx` reads role and redirects to the correct dashboard.

---

## Auth

- `components/auth/AuthProvider.tsx` — provides `user`, `isLoading`, `login`, `logout`, `refreshUser`
  - On mount: silently refreshes access token using `localStorage.refresh_token`
  - Calls `GET /users/me` after login/refresh to hydrate full user profile
  - Access token kept **in memory only** via `setAccessToken()` in `lib/api/client.ts`
- `components/auth/PasswordGuard.tsx` — guards routes requiring a password change
- `app/layout.tsx` — wraps all pages in `<AuthProvider>`; has `suppressHydrationWarning`

---

## API Client

`lib/api/client.ts` — Axios instance:
- Base URL: `NEXT_PUBLIC_API_URL` (default `http://localhost:8000`)
- Request interceptor: injects `Authorization: Bearer <access_token>`
- 401 response interceptor: auto-refreshes token, retries original request

**API modules** (`lib/api/*.ts` — one file per resource):
`auth`, `users`, `classes`, `subjects`, `enrollments`, `class-subjects`,
`assignments`, `submissions`, `grades`, `grade-categories`, `files`,
`attendance`, `analytics`, `schedules`, `notifications`

---

## TypeScript Types

`types/` — interfaces mirroring backend schemas:
- `types/user.types.ts` — `User` (with `is_class_monitor`, `is_home_teacher` flags)
- `types/school.types.ts` — `Submission` (with `files: SubmissionFile[]`), `Assignment`, `Grade`, etc.

---

## Theme (Glassmorphism)

| Token | Value |
|---|---|
| Dark background | `#0a0f0d` |
| Emerald primary | `#059669` / `#34d399` |
| Gold accent | `#d4a574` |
| Font | Outfit via `next/font` → `font-outfit` Tailwind class |

- `glass-card` CSS class in `globals.css`: `backdrop-blur`, `rgba` bg/border, hover glow
- Animated orbs: `.orb .orb-1/2/3` — fixed position, `z-index: -1`, rendered in root `layout.tsx`

---

## Components

| Path | Description |
|---|---|
| `components/shared/GlassCard.tsx` | Wraps `.glass-card` CSS class |
| `components/ui/` | shadcn/ui primitives (Button, Dialog, Toast, Table, …) |
| `components/layouts/MainSidebar.tsx` | Sidebar; nav items keyed by role from `NAV_CONFIG` |
| `components/layouts/TeacherSidebar.tsx` | Teacher-specific sidebar (from 2026-04-09 pull) |
| `components/layouts/PageHeader.tsx` | Reusable page header (from 2026-04-09 pull) |
| `components/layouts/SubjectTabs.tsx` | Tab nav inside class subject pages |

---

## Contexts

| Path | Description |
|---|---|
| `contexts/NotificationContext.tsx` | In-memory notification state (mock — no backend API). Used by `teacher/notifications`. |

---

## File Display Pattern

Files served by backend require auth. Pattern:

```ts
// fetch with auth header → blob → object URL
const blob = await fetchFileAsBlob(storedPath)   // lib/api/files.ts
const url = URL.createObjectURL(blob)
// render as <img src={url} /> or <iframe src={url} />
// always call URL.revokeObjectURL(url) on unmount
```

`fetchFileAsBlob(storedPath)` helper is in `lib/api/files.ts`.

---

## Assignment Submission Page

`app/student/classes/[subjectId]/homework/[assignmentId]/page.tsx`
- Submission modes: text / file / both (radio selector)
- Drag-and-drop file zone + browse button; validates MIME client-side
- Flow: `POST /submissions/` → get `id` → `POST /files/upload?submission_id={id}` → refresh
- Post-submit: inline file viewer, grade block with score/feedback/"awaiting grading"

---

## Mock Pages (need integration)

| Page | What it needs |
|---|---|
| `teacher/settings` | Wire to `GET /users/me` on mount + `PUT /users/me` on save (same as `student/settings`) |
| `teacher/notifications` | Replace `NotificationContext` dummy data with real `GET /notifications` |
| `admin/timetable` | Replace mock data with `GET /schedules`; admin CRUD via schedules API |
| `admin/announcements` | Needs new backend `announcement` model + router |
| `admin/settings` | Wire to `GET /users/me` + `PUT /users/me` |

---

## Environment Variables (`frontend/.env.local`)

```
NEXT_PUBLIC_API_URL=http://localhost:8000
```
