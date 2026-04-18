# IAMS — Session Progress Log
_Last updated: 2026-04-09_

---

## What Was Done This Session (2026-04-09)

### 1. Git Pull + Merge from `origin/main`

Pulled 2 new commits from the remote (`46edd65`, `b031a78`) that added new teacher and admin UI pages.

**Conflict resolution strategy**: took our (integration) versions of all conflicted page files; took new files from remote cleanly.

**New pages/components from remote (UI/mock — need integration):**

| File | Status |
|---|---|
| `frontend/app/teacher/notifications/page.tsx` | Mock — uses `NotificationContext` (in-memory dummy data) |
| `frontend/app/teacher/settings/page.tsx` | Mock — hardcoded "Mr. Tan Wei", no API calls |
| `frontend/app/admin/announcements/page.tsx` | Mock — no backend endpoint |
| `frontend/app/admin/timetable/page.tsx` | Mock — no real schedule API wired |
| `frontend/app/admin/settings/page.tsx` | Mock — no API calls |
| `frontend/contexts/NotificationContext.tsx` | In-memory notification state (no backend) |
| `frontend/components/layouts/TeacherSidebar.tsx` | New sidebar component for teacher layout |
| `frontend/components/layouts/PageHeader.tsx` | New reusable page header component |

**`frontend/app/layout.tsx` conflict resolved**: merged `AuthProvider` wrapper (ours) + `suppressHydrationWarning` (remote's).

---

### 2. Deployment Planning

Decided on **Digital Ocean App Platform** using $200 student credit (~4–5 months runway).

```
App Platform (~$44/mo total):
  Backend service    FastAPI (Python)      ~$12/mo
  Frontend service   Next.js (Node.js)     ~$12/mo
  Managed PostgreSQL DB cluster            ~$15/mo
  Spaces             File storage          ~$5/mo
```

**Pre-deployment checklist:**
- [ ] Switch `STORAGE_BACKEND` from `local` to `spaces` (add `spaces.py` storage backend) or use existing `supabase.py`
- [ ] Update `ALLOWED_ORIGINS` to production frontend URL
- [ ] Update `NEXT_PUBLIC_API_URL` to production backend URL
- [ ] Run `alembic upgrade head` via DO console after DB provisioned
- [ ] Run `python seed.py` once to seed initial data

---

## What Was Done This Session (2026-03-26)

### 1. Schedule Backend + Frontend (was mock, now real API)

**Backend:**
- New model: `ClassSchedule` (`class_subject_id`, `day_of_week`, `start_time`, `end_time`, `room`) — `backend/app/models/schedule.py`
- New schema: `ScheduleCreate`, `ScheduleUpdate`, `ScheduleRead` (with `model_validator` to resolve subject/class/teacher names) — `backend/app/schemas/schedule.py`
- New router: `GET /schedules` (filterable by class_id, teacher_id, class_subject_id, day_of_week), `GET/POST/PUT/DELETE /schedules/{id}` — `backend/app/routers/schedules.py`
- CRUD is admin-only; reading is any authenticated user
- Registered in `main.py` and `models/__init__.py`; added `schedules` relationship on `ClassSubject`

**Frontend:**
- New API client: `frontend/lib/api/schedules.ts` — `schedulesApi.list()`, `create()`, `update()`, `delete()`
- Rewrote `student/schedule/page.tsx` — fetches from `GET /schedules?class_id=…` based on enrollments; timetable grid with color-coded subjects, week/day view toggle
- Rewrote `teacher/schedule/page.tsx` — fetches from `GET /schedules?teacher_id=…`; grouped by day, card layout linking to class detail pages

### 2. Profile Update (Settings page was read-only, now editable)

**Backend:**
- New schema: `ProfileUpdate` (name, email, password only) — `backend/app/schemas/user.py`
- New endpoint: `PUT /users/me` — any authenticated user can update their own name/email/password — `backend/app/routers/users.py`

**Frontend:**
- Added `usersApi.updateMe()` in `frontend/lib/api/users.ts`
- Rewrote `student/settings/page.tsx`:
  - Profile tab: edit mode toggle, save name/email changes, calls `PUT /users/me` then `refreshUser()`
  - Security tab: change password form with validation (min 6 chars, confirm match)
  - Notifications tab: unchanged (still UI-only toggles)

### 3. Build Verification

- `npm run build` passes cleanly (0 TypeScript errors, all 32 routes compile)

---

## What Was Done This Session (2026-03-24)

### Deployment Planning

- Decided on **Vercel + Railway** as the deployment stack (updated 2026-04-09 to Digital Ocean App Platform)

---

## What Was Done This Session (2026-03-23)

### 1. Student API Integration Audit & Fixes

#### Fixed: `grade/page.tsx` — critical data model mismatch
- **Problem**: Page read `submission.is_graded`, `submission.score`, `submission.feedback` — fields the backend `SubmissionRead` schema never returns. Grades are a separate model.
- **Fix**: Rewrote to fetch `gradesApi.list({ student_id: user.id })`, build a `submission_id → grade` map, and join with submissions per assignment.
- **File**: `frontend/app/student/classes/[subjectId]/grade/page.tsx`

#### Fixed: `Submission` type — removed phantom fields
- **Problem**: `Submission` interface had `is_graded: boolean`, `score?: number`, `feedback?: string` that backend never sends.
- **Fix**: Removed those; added `submission_type: string` and `files: SubmissionFile[]`.
- **File**: `frontend/types/school.types.ts`

#### Fixed: Attendance tab — "excused" status not handled
- **Problem**: `getStatusIcon()` returned `null` for "excused"; stats only counted present/absent/late.
- **Fix**: Added blue `AlertCircle` icon for excused; added 4th stat card (grid 3→4 cols).
- **File**: `frontend/app/student/classes/[subjectId]/attendance/page.tsx`

---

### 2. Canvas-Style Assignment Submission (Text + File Upload)

#### Backend changes

| File | Change |
|------|--------|
| `backend/app/schemas/submission.py` | Added `SubmissionFileRead` schema; added `files: list[SubmissionFileRead] = []` to `SubmissionRead` |
| `backend/app/routers/submissions.py` | Added `joinedload(AssignmentSubmission.files)` to all 3 GET endpoints |

#### Frontend changes

| File | Change |
|------|--------|
| `frontend/lib/api/files.ts` | **NEW** — `filesApi.upload(submissionId, file)`, `fetchFileAsBlob(storedPath)` |
| `frontend/app/student/classes/[subjectId]/homework/[assignmentId]/page.tsx` | **NEW** — full assignment detail + submission page |

#### New page: `homework/[assignmentId]/page.tsx`
- Submission type radio: Text only / File only / Text + File
- Drag-and-drop file zone — validates MIME client-side
- Submit flow: `POST /submissions/` → get `id` → `POST /files/upload?submission_id={id}` → refresh
- Post-submit: inline file viewer (image → `<img>`, PDF → `<iframe>`, other → download), grade block

---

## Current State by Role & Page

### Student (`/student/...`)

| Page | Status | Notes |
|------|--------|-------|
| Dashboard | ✅ Real API | analytics + enrollments + class-subjects + assignments |
| Classes list | ✅ Real API | enrollments → class-subjects per class |
| Subject layout header | ✅ Real API | attendance rate + pending HW count |
| Assignment list tab | ✅ Real API | links to detail page |
| Assignment detail/submit | ✅ Real API | text/file/both, inline viewer |
| Quiz list tab | ✅ Real API | filters "quiz" in title |
| Quiz detail/submit | ✅ Real API | text-only submission |
| Grade tab | ✅ Real API | uses gradesApi.list() |
| Attendance tab | ✅ Real API | excused icon handled |
| People tab | ✅ Real API | teacher from class-subject, students from /classes/{id}/students |
| Schedule | ✅ Real API | timetable grid from `GET /schedules?class_id=…`; week/day view |
| Settings | ✅ Real API | editable name/email + password change via `PUT /users/me` |
| Notifications | ⚠️ Mock | no backend notifications endpoint |

---

### Teacher (`/teacher/...`)

| Page | Status | Notes |
|------|--------|-------|
| Dashboard | ✅ Real API | class-subjects + assignments + home-teacher ranking |
| Classes list | ✅ Real API | `GET /class-subjects?teacher_id={id}` |
| Subject — Overview tab | ✅ Real API | Assignment CRUD (create, publish, delete) |
| Subject — Grading tab | ✅ Real API | Grade categories CRUD + assign categories to assignments |
| Subject — Students tab | ✅ Real API | Roster from `/classes/{id}/students` |
| Subject — Quizzes tab | ✅ Real API | Grade categories + assignments filtered by quiz category |
| Subject — Quiz detail | ✅ Real API | Full grading UI — view submissions, inline grade form |
| Subject — Analysis tab | ✅ Real API | `GET /analytics/class-averages/{classId}` with charts |
| Subject — Submissions | ✅ Real API | `/teacher/classes/[subjectId]/submissions/[assignmentId]` — inline grading |
| Schedule | ✅ Real API | `GET /schedules?teacher_id=…`; grouped by day |
| Students (home teacher) | ✅ Real API | Roster + ranking; guarded by `is_home_teacher` |
| Notifications | ⚠️ Mock | Uses `NotificationContext` (in-memory dummy data, no backend) |
| Settings | ⚠️ Mock | Hardcoded data, no `PUT /users/me` wired yet |

---

### Admin (`/admin/...`)

| Page | Status | Notes |
|------|--------|-------|
| Dashboard | ✅ Real API | `GET /analytics/admin-overview` |
| Users management | ✅ Real API | Full CRUD — GET/POST/PUT/DELETE /users |
| Academic management | ✅ Real API | Classes + Subjects CRUD (two-tab layout) |
| Analytics | ✅ Real API | Admin overview + class selector + class averages chart |
| Announcements | ⚠️ Mock | New page from remote, no backend endpoint |
| Timetable | ⚠️ Mock | New page from remote, uses mock data (schedule API exists but not wired) |
| Settings | ⚠️ Mock | New page from remote, no API calls |

---

## To Do — Next Session

### JWT Refresh Token Rotation (Security Improvement)

Store refresh tokens in DB so logout actually invalidates them (currently a stolen refresh token stays valid for 7 days).

**What to build:**
```python
# New DB table
class RefreshToken(Base):
    token = Column(String, unique=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    expires_at = Column(DateTime)

# On login:  store refresh token in DB
# On refresh: verify token exists in DB → delete old → issue new (rotation)
# On logout: delete refresh token from DB
```

**Why JWT + this pattern:**
- Stateless access tokens (no DB hit on every request)
- Revocable refresh tokens (secure logout, stolen token window closed)
- No Redis dependency (works on DO App Platform multi-instance)
- No CORS cookie headaches (frontend/backend on different origins)

**Files to touch:** `backend/app/models/` (new `RefreshToken` model), `backend/app/routers/auth.py`, `backend/app/services/auth_service.py`, new Alembic migration.

---

## Known Gaps — Priority Order

### 🔴 Needs integration (new mock pages from 2026-04-09 pull)

1. **Teacher settings** — `teacher/settings/page.tsx` has hardcoded name; wire to `GET /users/me` + `PUT /users/me`
2. **Teacher notifications** — uses `NotificationContext` (dummy data); need backend `GET /notifications` or same mock as student
3. **Admin timetable** — UI exists, schedule API exists (`GET /schedules`); needs wiring
4. **Admin announcements** — no backend model/router; would need new `announcement` model

### 🟡 Important (missing functionality)

5. **Quiz tab fragile** — filtered by grade category named "quiz"; requires teacher to create that category first
6. **Student notifications** — no `GET /notifications` backend endpoint

### 🟢 Nice to have

7. **DO Spaces storage backend** — add `spaces.py` to `backend/app/storage/` for production file storage
8. **Admin schedule management UI** — admin can CRUD via API; no dedicated UI page yet (timetable page is mock)
9. **File upload on quiz submissions** — quiz detail page is text-only

---

## Key Backend API Reference

### Endpoints used (confirmed working)

| Endpoint | Purpose |
|----------|---------|
| `POST /auth/login` | Login, returns access_token + refresh_token |
| `GET /auth/refresh` | Refresh access token |
| `GET /users/me` | Get current user profile |
| `PUT /users/me` | Update own name/email/password |
| `GET /enrollments?student_id={id}` | Student's class enrollments |
| `GET /class-subjects?class_id={id}` | Subjects per class |
| `GET /class-subjects?teacher_id={id}` | Subjects taught by a teacher |
| `GET /class-subjects/{id}` | Single class-subject with teacher_name, subject_code |
| `GET /classes/{id}/students` | Student roster for a class |
| `GET /assignments?class_subject_id={id}` | Assignments |
| `GET /assignments/{id}` | Single assignment |
| `POST /assignments/` | Create assignment (teacher/admin) |
| `PUT /assignments/{id}` | Update assignment |
| `POST /assignments/{id}/publish` | Publish assignment |
| `DELETE /assignments/{id}` | Delete assignment |
| `GET /submissions?assignment_id={id}` | Submissions (includes `files[]`) |
| `POST /submissions/` | Create submission (student only) |
| `POST /files/upload?submission_id={id}` | Upload file (multipart) |
| `GET /files/{stored_path}` | Serve file (auth required) |
| `GET /grades?student_id={id}` | Grades for a student |
| `GET /grades?assignment_id={id}` | All grades for an assignment |
| `POST /grades/` | Create grade |
| `PUT /grades/{id}` | Update grade |
| `GET /attendance?class_id={id}&student_id={id}` | Attendance records |
| `POST /attendance/batch` | Batch mark attendance (class monitor/admin) |
| `GET /analytics/student/{id}/score-trend` | Student score trend |
| `GET /analytics/admin/overview` | Admin overview stats |
| `GET /analytics/class-averages/{classId}` | Per-subject averages |
| `GET /analytics/home-teacher-ranking/{classId}` | Student ranking |
| `GET /grade-categories?class_subject_id={id}` | Grade categories |
| `POST /grade-categories/` | Create category |
| `PUT /grade-categories/{id}` | Update category |
| `DELETE /grade-categories/{id}` | Delete category |
| `GET /schedules?teacher_id={id}` | Teacher's schedule |
| `GET /schedules?class_id={id}` | Class schedule |
| `GET /users` | All users (admin only) |
| `POST /users` | Create user (admin only) |
| `PUT /users/{id}` | Update user (admin only) |
| `DELETE /users/{id}` | Delete user (admin only) |
| `GET /classes` | All classes |
| `POST /classes` | Create class (admin only) |
| `DELETE /classes/{id}` | Delete class |
| `GET /subjects` | All subjects |
| `POST /subjects` | Create subject (admin only) |
| `DELETE /subjects/{id}` | Delete subject |

### Endpoints that DON'T exist yet

- `GET /notifications` — student/teacher notifications
- `POST /announcements` / `GET /announcements` — admin announcements

---

## File Upload Architecture

```
Frontend:
  filesApi.upload(submissionId, file)
    → POST /files/upload?submission_id={id}
    → FormData with "file" field
    → Returns { file_id, stored_path }

  fetchFileAsBlob(storedPath)
    → fetch(`${BACKEND_URL}/files/${storedPath}`, { Authorization: Bearer })
    → URL.createObjectURL(blob)  ← use in <img src> or <iframe src>
    → call URL.revokeObjectURL() on unmount

Backend:
  POST /files/upload → saves to ./uploads/submissions/uuid_filename.ext
  GET /files/{path} → FileResponse (path traversal protected)
  Storage: local (default) or Supabase (set STORAGE_BACKEND=supabase in .env)
  Allowed types: PDF, JPEG, PNG, GIF, TXT, DOC, DOCX, XLSX
```

---

## Architecture Quick Reference

```
backend/           FastAPI, port 8000
  app/
    routers/       One router per resource (16 total)
    models/        SQLAlchemy ORM (14 models)
    schemas/       Pydantic request/response
    storage/       local.py + supabase.py (pluggable)
    core/
      permissions.py   require_roles(), require_class_monitor(), require_home_teacher()

frontend/          Next.js 14 App Router, port 3000
  app/
    (auth)/login/       Login page
    student/            Student pages
    teacher/            Teacher pages (notifications/settings are mock)
    admin/              Admin pages (announcements/timetable/settings are mock)
  contexts/
    NotificationContext.tsx  In-memory notification state (mock)
  components/
    auth/AuthProvider.tsx    useAuth() — user, login, logout, refreshUser
    auth/PasswordGuard.tsx   Guards routes requiring password change
    layouts/MainSidebar.tsx  Role-based sidebar navigation
    layouts/TeacherSidebar.tsx  Teacher-specific sidebar
    layouts/PageHeader.tsx   Reusable page header
    layouts/SubjectTabs.tsx  Tab nav inside class subject pages
  lib/api/
    client.ts        Axios instance; Bearer token injected; 401 auto-refresh
    auth.ts          authApi (login, refresh)
    users.ts         usersApi (me, updateMe, list, create, update, delete)
    files.ts         filesApi.upload(), fetchFileAsBlob()
    submissions.ts   submissionsApi (list, getById, create)
    grades.ts        gradesApi (list, create, update)
    attendance.ts    attendanceApi.list()
    assignments.ts   assignmentsApi (list, getById, create, publish, update, delete)
    class-subjects.ts
    enrollments.ts
    analytics.ts
    grade-categories.ts
    schedules.ts
    notifications.ts
  types/
    school.types.ts  Submission (with files[]), SubmissionFile, Assignment, etc.
    user.types.ts    User (with is_class_monitor, is_home_teacher flags)
```

---

## Next Session — Recommended Starting Points

1. **Wire teacher/settings** — copy student settings pattern: `GET /users/me` on mount, `PUT /users/me` on save.
2. **Wire admin/timetable** — the schedule API (`GET /schedules`) exists; replace mock data with real API calls.
3. **Seed schedule data** — `seed.py` needs `class_schedules` rows for demo.
4. **DO deployment** — create App Platform app, connect GitHub, add env vars, run `alembic upgrade head`.
5. Run `npm run build` from `frontend/` after any changes to verify TypeScript.
