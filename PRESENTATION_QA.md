# PSMS — Presentation Q&A: User Experience

> **How to use this document**
> Judges will point at a part of the UI → you say who built it → you explain which code drives it.
> Every answer includes the exact file path and, where helpful, the line number.

---

## 1. LOGIN PAGE

**Q1. Why is the login page dark while the rest of the app is light?**
The login page is intentionally separated from the main layout. It has no sidebar or header — it uses a standalone route group `app/(auth)/login/` that is excluded from the main role-based layouts. The dark design (`bg-slate-900`) with a grid pattern overlay creates a distinct "entry point" impression.
→ `frontend/app/(auth)/login/page.tsx:30`

**Q2. What is that subtle grid pattern behind the login card?**
It is a CSS `background-image` linear gradient trick — two overlapping transparent lines at 32px intervals create the grid without any image file.
→ `frontend/app/(auth)/login/page.tsx:33` — `bg-[linear-gradient(to_right,...)]`

**Q3. Why does the login form card look "frosted" or blurred?**
The card uses Tailwind's `backdrop-blur-md` combined with a semi-transparent background (`bg-slate-800/80`) and a border (`border-slate-700`). This is the glassmorphism pattern.
→ `frontend/app/(auth)/login/page.tsx:36`

**Q4. Why does the input field border turn amber when the user clicks it?**
The input uses `focus:ring-1 focus:ring-amber-500 focus:border-amber-500` Tailwind classes. The amber color is the system-wide accent color for interactive elements.
→ `frontend/app/(auth)/login/page.tsx:64`

**Q5. What happens when you click the eye icon on the password field?**
A `showPassword` React state variable toggles between `type="password"` and `type="text"`. The icon switches between `Eye` and `EyeOff` from the Lucide icon library.
→ `frontend/app/(auth)/login/page.tsx:14,79,92`

**Q6. When login fails, how does the red error message appear?**
The `handleLogin` function catches the API error and extracts `err.data.detail` (the FastAPI error message). It sets it into a `error` state, which renders a red alert box above the form.
→ `frontend/app/(auth)/login/page.tsx:22-26, 43-47`

**Q7. What happens while the login request is loading?**
The submit button is `disabled` and shows a spinning `Loader2` icon (from Lucide) with `animate-spin`. The button color also dims to `bg-amber-800`.
→ `frontend/app/(auth)/login/page.tsx:110-117`

**Q8. Where does the system decide which dashboard to redirect the user to after login?**
`AuthProvider.tsx` calls `GET /users/me` after the token is received, reads `user.role`, and redirects to `/admin`, `/teacher`, or `/student`.
→ `frontend/components/auth/AuthProvider.tsx`

**Q9. What happens if a user's password is marked as "must change"?**
After login, `AuthProvider` checks `user.must_change_password`. If true, it redirects to `/change-password` before any other page can load. `PasswordGuard.tsx` enforces this on every protected route.
→ `frontend/components/auth/AuthProvider.tsx` + `frontend/components/auth/PasswordGuard.tsx`

**Q10. Where is the "Forgot password?" link pointing?**
It links to `/forgot-password` (a separate page under the `(auth)` route group). It is styled in amber to match the accent color.
→ `frontend/app/(auth)/login/page.tsx:100`

---

## 2. SIDEBAR NAVIGATION

**Q11. How does the sidebar know which menu items to show — it's different for admin, teacher, and student?**
The `getNavLinks()` function receives the user's role and flags (`is_class_monitor`, `is_home_teacher`) and returns two arrays: `main` menu links and `account` links. Each role gets a completely different set.
→ `frontend/components/layouts/MainSidebar.tsx:31-75`

**Q12. Why does the teacher sidebar show a "Students" link for some teachers but not others?**
Home teachers have `is_home_teacher: true` on their user record. `getNavLinks()` checks that flag and conditionally pushes the Students link into the array.
→ `frontend/components/layouts/MainSidebar.tsx:38-40`

**Q13. Why does the student sidebar show an "Attendance" link for some students but not others?**
Class monitors have `is_class_monitor: true`. The same `getNavLinks()` function checks that flag.
→ `frontend/components/layouts/MainSidebar.tsx:68-70`

**Q14. How does the sidebar know which menu item to highlight as "active"?**
It uses `usePathname()` from Next.js. For each link it checks if `pathname === item.href` or if the pathname starts with that href. The active item gets `bg-[#23252d] text-orange-500 border-l-4 border-orange-500`.
→ `frontend/components/layouts/MainSidebar.tsx:113,123-126`

**Q15. What is the orange left border on the active sidebar link?**
It is `border-l-4 border-orange-500` — a 4px left border in orange, applied only to the active nav item. Inactive items have `border-l-4 border-transparent` so the layout never shifts.
→ `frontend/components/layouts/MainSidebar.tsx:124-125`

**Q16. Can the sidebar collapse? How?**
Yes. Clicking the hamburger (`Menu`) icon toggles `isCollapsed` state. The sidebar transitions from `w-64` to `w-24` with `transition-all duration-300 ease-in-out`. When collapsed, only icons are shown; when expanded, icons + text labels appear.
→ `frontend/components/layouts/MainSidebar.tsx:80,158,174-176`

**Q17. What is the red dot/badge on the Notifications link?**
For student users, the sidebar calls `notificationsApi.unreadCount()` on mount and re-fetches when a `notification:refresh` window event fires. If `unreadCount > 0`, a red pill badge appears next to the label (or a pulsing red dot when collapsed).
→ `frontend/components/layouts/MainSidebar.tsx:85-97,133-138,144-148`

**Q18. What is the pulsing animation on the notification badge?**
It uses Tailwind's `animate-ping` class — an absolutely-positioned span that scales up and fades out repeatedly, creating a "sonar ping" effect. Behind it is the solid red dot.
→ `frontend/components/layouts/MainSidebar.tsx:134-137`

**Q19. What is the gradient circle at the bottom of the sidebar?**
It is the user avatar — a `div` with `bg-gradient-to-br from-indigo-500 to-purple-500` containing the first letter of the user's full name. The user's name and role are shown next to it.
→ `frontend/components/layouts/MainSidebar.tsx:212-224`

**Q20. What happens when you click the logout button in the sidebar?**
A `window.confirm()` dialog asks for confirmation. If confirmed, `logout()` from `AuthProvider` is called, which clears the access token from memory and the refresh token from `localStorage`, then redirects to `/login`.
→ `frontend/components/layouts/MainSidebar.tsx:99-103`

**Q21. Why does the sidebar have no scrollbar visible even when it overflows?**
The sidebar uses `[&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]` — these Tailwind arbitrary-property classes hide the scrollbar in all browsers while keeping scroll functionality.
→ `frontend/components/layouts/MainSidebar.tsx:158,184`

---

## 3. PAGE HEADER

**Q22. What is the consistent header bar at the top of every page?**
It is the `PageHeader` reusable component. It accepts `title`, `subtitle`, an optional badge, and optional action buttons. It renders with a white background and subtle shadow.
→ `frontend/components/layouts/PageHeader.tsx`

**Q23. Why does every page have the same visual header style?**
By extracting the header into a shared `PageHeader` component, all pages get consistent typography and spacing without duplicating code. Any style change to `PageHeader` instantly applies everywhere.

---

## 4. STUDENT — CLASSES PAGE

**Q24. What are those course cards with the book icon on the student classes page?**
Each card represents a class-subject the student is enrolled in. The `BookOpen` Lucide icon sits in an amber-50 rounded background. The card shows subject name, teacher name, and an "Active" badge.
→ `frontend/app/student/classes/page.tsx`

**Q25. How does the system know which classes to show a student?**
It first calls `enrollmentsApi.list()` to get all of the student's class enrollments, then calls `classSubjectsApi.list({ class_id })` for each class, and flattens the results into a single array.
→ `frontend/app/student/classes/page.tsx` — the `Promise.all().flat()` pattern

**Q26. What happens when a student has no classes?**
An empty state renders with a centered `BookOpen` icon and a "No classes found" message.
→ `frontend/app/student/classes/page.tsx` — empty state block

---

## 5. SUBJECT TABS (CLASS DETAIL NAVIGATION)

**Q27. What are those tabs at the top when you open a class — Overview, Homework, Quiz, etc.?**
It is the `SubjectTabs` component. It renders a horizontal tab bar. The active tab has an orange bottom border and orange text. The tabs differ between student and teacher roles.
→ `frontend/components/layouts/SubjectTabs.tsx`

**Q28. How does the tab bar know which tab is currently selected?**
It reads `usePathname()` and compares each tab's `href` to the current URL. The matching tab gets the active highlight style.

---

## 6. ASSIGNMENT SUBMISSION PAGE (STUDENT)

**Q29. How does a student submit an assignment?**
The submission page (`homework/[assignmentId]/page.tsx`) has three modes — text, file, or both — selectable via radio buttons. For text, there's a `<textarea>`. For files, there's a drag-and-drop zone. On submit: `POST /submissions/` is called first to create the submission record, then `POST /files/upload?submission_id={id}` uploads any files.
→ `frontend/app/student/classes/[subjectId]/homework/[assignmentId]/page.tsx`

**Q30. How does the drag-and-drop file upload zone work?**
The zone listens for `onDragOver`, `onDragLeave`, and `onDrop` events. When a file is dragged over, a state variable `isDragging` turns true and the border highlights in orange. On drop, the file is validated against an allowed MIME type list before being accepted.
→ `frontend/app/student/classes/[subjectId]/homework/[assignmentId]/page.tsx`

**Q31. Why can a student only upload certain file types?**
There is an `ACCEPTED_MIME` set on the frontend that mirrors the backend's `ALLOWED_TYPES`. Any file with a MIME type not in that set is rejected client-side with an error message before it even reaches the server.
→ `frontend/app/student/classes/[subjectId]/homework/[assignmentId]/page.tsx`

**Q32. After submitting, the student can see their file preview right in the browser. How?**
Files are stored on the backend and served with auth protection. The frontend calls `fetchFileAsBlob(storedPath)` which fetches the file with an `Authorization: Bearer` header, receives the raw binary, and creates a temporary `URL.createObjectURL(blob)`. Images render in `<img>`, PDFs in `<iframe>`, others as a download link.
→ `frontend/lib/api/files.ts` — `fetchFileAsBlob()`
→ `frontend/app/student/classes/[subjectId]/homework/[assignmentId]/page.tsx` — `FileViewer` component

**Q33. What is the "LATE" badge on a submission?**
If the submission's `is_late` field (set by the backend based on due date) is true, a red "LATE" badge renders next to the submission timestamp.
→ `frontend/app/student/classes/[subjectId]/homework/[assignmentId]/page.tsx`

**Q34. What does a student see after their assignment is graded?**
A grade block shows: numeric score (e.g., "85 / 100"), a letter grade computed on the frontend (A/B/C/D/F), and the teacher's written feedback. If not yet graded, a "Awaiting grading" message with a `Clock` icon appears instead.
→ `frontend/app/student/classes/[subjectId]/homework/[assignmentId]/page.tsx`

**Q35. How is the letter grade (A/B/C/D) calculated?**
The frontend computes it from the numeric score: ≥90 = A, ≥80 = B, ≥70 = C, ≥60 = D, below 60 = F. This is a display-only calculation; the actual score is stored on the backend.
→ `frontend/app/student/classes/[subjectId]/homework/[assignmentId]/page.tsx`

**Q36. What does "Draft" status on an assignment mean for the student?**
If the assignment's `status === 'draft'`, the submission form is hidden and an alert tells the student the assignment is not yet open. Only published assignments can be submitted.
→ `frontend/app/student/classes/[subjectId]/homework/[assignmentId]/page.tsx`

**Q37. What does "Closed" status mean?**
If `status === 'closed'`, an alert shows "This assignment is closed and no longer accepts submissions." Any existing submission is still visible with its grade.
→ `frontend/app/student/classes/[subjectId]/homework/[assignmentId]/page.tsx`

**Q38. What is "max attempts" on an assignment?**
The teacher can set `max_attempts` when creating an assignment. The student can resubmit up to that limit (as long as no grade has been assigned). The current attempt number and maximum are shown in the header.
→ Backend: `backend/app/models/assignment.py` — `max_attempts` column
→ Frontend: displayed in the assignment header block

**Q39. How does the system track if a student is typing vs. pasting in the text submission box?**
There is a `useTelemetry` hook built into the submission page. It listens to `keydown` events (counts typed characters) and `paste` events (counts paste actions). It tracks active typing windows with a 2-second idle timeout and calculates estimated words-per-minute. This data is sent to the backend with the submission.
→ `frontend/app/student/classes/[subjectId]/homework/[assignmentId]/page.tsx` — `useTelemetry` hook

**Q40. Does the typing tracking affect the submission if it fails to send?**
No. Telemetry is sent as a separate non-blocking call. If it fails, the submission still goes through; only a console error is logged.
→ `frontend/lib/api/submissions.ts` — `saveTelemetry()` called after main submission

---

## 7. TEACHER — CLASSES & GRADING

**Q41. What does the teacher see on their Classes page?**
A grid of class-subject cards, each showing the subject name, class name, and a "Teacher" badge. Hovering lifts the card shadow and highlights the subject name in orange. Clicking goes to the class management page.
→ `frontend/app/teacher/classes/page.tsx`

**Q42. How does the teacher submit a grade for a student?**
On the Submissions page for an assignment, each student row has a score input and a feedback text field. Clicking save calls `POST /grades` (new grade) or `PUT /grades/{id}` (update existing). The score is stored in the `grades` table linked to the submission.
→ `frontend/app/teacher/classes/[subjectId]/submissions/[assignmentId]/page.tsx`
→ `frontend/lib/api/grades.ts`

**Q43. What are "Grade Categories" in the grading tab?**
Teachers can define weighted categories (e.g., "Homework 30%, Quiz 40%, Exam 30%"). These are `GradeCategory` records per class-subject. The total weight must not exceed 1.0, enforced on both frontend and backend.
→ `frontend/app/teacher/classes/[subjectId]/grading/page.tsx`
→ `backend/app/routers/grade_categories.py`

**Q44. How does the teacher create a new assignment?**
On the Assignments tab of a class, there is a form with fields: title, description, submission type (text/file/both), max score, max attempts, and due date. On save it calls `POST /assignments`. The teacher can also set status to "published" or keep as "draft".
→ `frontend/app/teacher/classes/[subjectId]/assignments/page.tsx`

**Q45. How does the teacher publish or close an assignment?**
There are status action buttons per assignment. `POST /assignments/{id}/publish` changes status to published; there is a separate call to set it to closed.
→ `frontend/lib/api/assignments.ts`

**Q46. What is the "Analysis" tab in a teacher's class?**
It shows a performance chart using Recharts — a scatter or line chart of student scores for the class. Data comes from `analyticsApi.getClassAverages(classSubjectId)`.
→ `frontend/app/teacher/classes/[subjectId]/analysis/page.tsx`
→ `frontend/lib/api/analytics.ts`

**Q47. When a teacher opens a quiz, what does the quiz builder look like?**
The quiz create page has a form to add multiple-choice questions. Each question has a prompt, options, and a correct answer selector. Questions can be added/removed dynamically.
→ `frontend/app/teacher/classes/[subjectId]/quizzes/create/page.tsx`

---

## 8. ADMIN PAGES

**Q48. What are the four stat cards on the admin dashboard?**
Total Users, Total Students, Total Teachers, Total Assignments — each rendered as a card with a colored icon background. Data comes from `analyticsApi.getAdminOverview()`.
→ `frontend/app/admin/page.tsx`

**Q49. How does the admin create a new user?**
On the Users page, a form (modal or inline) accepts full name, email, role, and password. It calls `POST /users`. Admins can also edit or delete users.
→ `frontend/app/admin/users/page.tsx`

**Q50. How does the admin create classes and subjects?**
The Academic page has two sections — Classes (e.g., "Grade 10A") and Subjects (e.g., "Mathematics"). Both support CRUD via the backend `/classes` and `/subjects` routers.
→ `frontend/app/admin/academic/page.tsx`

**Q51. What is the Audit Logs page?**
It shows a timestamped log of every action (create, update, delete) performed in the system — who did it, what resource was affected, and when. This is a read-only view.
→ `frontend/app/admin/audit-logs/page.tsx`

**Q52. What does the admin Analytics page show?**
A system-wide overview with bar charts showing class averages across all classes. Uses `analyticsApi.getAdminOverview()` and Recharts for visualization.
→ `frontend/app/admin/analytics/page.tsx`

---

## 9. AUTHENTICATION & SECURITY ARCHITECTURE

**Q53. How does the system keep users logged in when they refresh the page?**
The access token is stored only in memory (never in `localStorage` or cookies). The refresh token is stored in `localStorage`. On every page load, `AuthProvider` silently calls `GET /auth/refresh` with the stored refresh token to get a new access token.
→ `frontend/components/auth/AuthProvider.tsx`

**Q54. If the access token expires mid-session, what happens?**
The Axios client (`client.ts`) has a 401 response interceptor. When any API call returns 401, it automatically calls `GET /auth/refresh`, stores the new access token, then retries the original failed request — transparent to the user.
→ `frontend/lib/api/client.ts` — response interceptor

**Q55. Why is the access token kept in memory and not localStorage?**
Storing JWT access tokens in `localStorage` exposes them to XSS attacks — any injected script can read them. Keeping the token in memory means it only lives for the current tab session, reducing the attack surface.

**Q56. How does the backend protect API endpoints from unauthorized access?**
Every protected endpoint uses a `get_current_user` dependency that decodes and validates the JWT. Role-specific endpoints use `require_roles(*roles)` — a dependency factory that raises `403 Forbidden` if the user's role is not in the allowed list.
→ `backend/app/dependencies.py` — `get_current_user()`
→ `backend/app/core/permissions.py` — `require_roles()`

**Q57. How does the system prevent a student from accessing a teacher's API endpoints?**
The `require_roles` dependency is applied at the router level. For example, `require_roles("teacher", "admin")` on an assignment-create endpoint means a student's JWT will cause a `403` response even if they manually call the API.
→ `backend/app/core/permissions.py`

**Q58. How are passwords stored in the database?**
Passwords are hashed using bcrypt via `passlib` before being stored. Plain-text passwords are never stored. On login, `passlib.verify()` compares the submitted password against the stored hash.
→ `backend/app/core/security.py`

---

## 10. API CLIENT & DATA FLOW

**Q59. How does the frontend talk to the backend?**
Through a centralized Axios instance in `lib/api/client.ts`. Every API call goes through this instance, which automatically attaches the `Authorization: Bearer` header and handles token refresh on 401 errors.
→ `frontend/lib/api/client.ts`

**Q60. What happens when an API call fails with a network error?**
Most pages catch errors in a `try/catch` block and either show an error message in the UI or log to the console. Critical flows (login, submission) show user-facing error messages.

**Q61. How is the base URL for the API configured?**
Via the `NEXT_PUBLIC_API_URL` environment variable in `.env.local`. In production (Vercel), this is set to the Railway backend URL. In development it defaults to `http://localhost:8000`.
→ `frontend/lib/api/client.ts:1` — `process.env.NEXT_PUBLIC_API_URL`

---

## 11. RESPONSIVE DESIGN & UI PATTERNS

**Q62. How does the class grid go from 3 columns to 1 column on mobile?**
Tailwind's responsive prefixes: the grid uses `grid-cols-1 md:grid-cols-2 lg:grid-cols-3`. On small screens it collapses to a single column automatically.

**Q63. What icon library is used throughout the app?**
Lucide React — every icon (BookOpen, Bell, LogOut, ChevronRight, etc.) is imported from `lucide-react`. It provides consistent, lightweight SVG icons.
→ `frontend/components/layouts/MainSidebar.tsx:6-21` (example import block)

**Q64. Why do all cards have the same rounded corners and shadow style?**
All cards use `rounded-xl` or `rounded-2xl` with `shadow-sm` or `shadow-md` from Tailwind. A consistent design token system means the same classes are reused across every page.

**Q65. What font does the app use?**
Open Sans, loaded via a `<link>` tag in the root layout (`app/layout.tsx`). It applies via `font-sans` in Tailwind's config, making it the default font for all text.
→ `frontend/app/layout.tsx`

**Q66. How do hover effects on cards work?**
Cards use `hover:shadow-md`, `hover:border-orange-200`, and `transition-colors`/`transition-shadow` classes. Tailwind generates the CSS; no JavaScript is needed.

**Q67. What are the colored status badges (Draft, Published, Closed, Active)?**
They are inline `<span>` elements with color-coded Tailwind classes — e.g., `bg-orange-50 text-orange-700 border border-orange-100 rounded-full px-2 py-0.5`. Each status has its own color pair.

---

## 12. SCHEDULES & TIMETABLE

**Q68. What does the student/teacher Schedule page look like?**
A timetable grid view showing class schedules. Data is fetched from `GET /schedules` filtered by user.
→ `frontend/app/student/schedule/page.tsx`
→ `frontend/lib/api/schedules.ts`

---

## 13. NOTIFICATIONS

**Q69. How do student notifications work?**
Student notifications are stored in the backend `notifications` table. The sidebar fetches `GET /notifications/unread-count` on mount and shows a red badge. The Notifications page lists all notifications.
→ `frontend/lib/api/notifications.ts`
→ `frontend/components/layouts/MainSidebar.tsx:85-97`

**Q70. How do teacher notifications work currently?**
Teacher notifications use an in-memory `NotificationContext` with hardcoded dummy data. This is a known limitation — the backend notifications API exists but is not yet wired to the teacher notification UI.
→ `frontend/contexts/NotificationContext.tsx`

---

## 14. SETTINGS PAGES

**Q71. How does a student change their password?**
The Settings page (`/student/settings`) has a password change form. It calls `PUT /users/me/password` with the current password and new password. The backend verifies the current password before updating.
→ `frontend/app/student/settings/page.tsx`

**Q72. How does a student update their profile information?**
The Settings page also has a profile form (name, email). It calls `PUT /users/me` to update the user record. `refreshUser()` is called after to update the in-memory user state.
→ `frontend/app/student/settings/page.tsx`

---

## 15. BACKEND ARCHITECTURE (when judge follows up on code)

**Q73. How is the backend organized?**
Layered: **Router → Service → Model**. Routers handle HTTP, call service functions for business logic, which interact with SQLAlchemy ORM models. There are 16 routers, each mounted in `main.py`.
→ `backend/app/main.py`
→ `backend/app/routers/`

**Q74. How does the backend connect to the database?**
SQLAlchemy with a `SessionLocal` factory in `database.py`. Each request gets a session via the `get_db()` dependency generator (yields, then closes). The `DATABASE_URL` env var points to PostgreSQL in production and can point to SQLite for tests.
→ `backend/app/database.py`

**Q75. How are database schema changes managed?**
Alembic migrations. Every model change requires `alembic revision --autogenerate -m "description"` to generate a migration file, then `alembic upgrade head` to apply it. Railway runs `alembic upgrade head` automatically on deploy.
→ `backend/alembic/versions/`

**Q76. How does file storage work?**
The storage layer is pluggable — an abstract `StorageBackend` class with two implementations: `LocalStorage` (saves to `./uploads/`) and `SupabaseStorage`. The `STORAGE_BACKEND` env var switches between them. Production uses Supabase Storage.
→ `backend/app/storage/`

**Q77. Where is the application deployed?**
- **Backend**: Railway (FastAPI + Alembic migrations auto-run on deploy)
- **Frontend**: Vercel (Next.js, Singapore region `sin1`)
- **Database**: Supabase PostgreSQL
- **File Storage**: Supabase Storage bucket `iams-files`

---

## 16. ADVANCED UX QUESTIONS

**Q78. How does the system handle a student who tries to submit after the deadline?**
The backend checks `due_date` on submission creation. If the current time is past the due date, `is_late` is set to `True` on the submission record. The frontend displays a red "LATE" badge. The submission is still accepted unless the assignment is `closed`.

**Q79. How does the app prevent IDOR (a student seeing another student's submission)?**
The backend checks ownership: for student-role requests on submission endpoints, it verifies `current_user.id == submission.student_id`. If not, it returns `403 Forbidden`. This pattern is applied throughout all student-owned resources.
→ `backend/app/core/permissions.py` + individual router ownership checks

**Q80. Why does the file upload use `multipart/form-data` instead of base64?**
`multipart/form-data` is the standard for binary file uploads — it streams the file efficiently without the ~33% size overhead of base64 encoding. The `POST /files/upload` endpoint reads the file with FastAPI's `UploadFile`.
→ `backend/app/routers/files.py`

**Q81. How does path traversal in file serving get prevented?**
The backend resolves the full path with `(Path(base) / user_path).resolve()` and asserts it starts with the base upload directory. This prevents `../` directory traversal attacks.
→ `backend/app/routers/files.py` — path resolution check

**Q82. What happens if two teachers try to grade the same submission simultaneously?**
The first `PUT /grades/{id}` wins. SQLAlchemy's session-based writes are sequential. There is no optimistic locking currently — a known limitation for concurrent grading.

**Q83. How does the system handle the JWT token refresh race condition (two parallel requests both fail with 401)?**
The Axios interceptor uses a queuing pattern — if a refresh is already in progress when a second 401 arrives, the second request waits for the refresh to complete before retrying.
→ `frontend/lib/api/client.ts`

**Q84. What is `suppressHydrationWarning` on the root layout?**
Next.js App Router renders on the server first, then hydrates on the client. Auth state (user, token) only exists client-side, so there is a mismatch between server-rendered HTML and client state. `suppressHydrationWarning` tells React to ignore that specific mismatch on the `<html>` tag.
→ `frontend/app/layout.tsx`

**Q85. How does the app know to show the "Attendance" nav item only to class monitors?**
After login, `GET /users/me` returns the full user profile including `is_class_monitor: boolean`. `AuthProvider` stores this in context. `MainSidebar` reads `user.is_class_monitor` and conditionally adds the Attendance link.
→ `frontend/components/layouts/MainSidebar.tsx:68-70`
→ `backend/app/routers/users.py` — `GET /users/me`

**Q86. How does the teacher know which submissions have been graded vs. not?**
The submissions list endpoint returns each submission with a `grade` field (nullable). The teacher UI shows a checkmark/green badge for graded submissions and a pending indicator for ungraded ones.
→ `frontend/app/teacher/classes/[subjectId]/submissions/[assignmentId]/page.tsx`

**Q87. How are announcements displayed on the admin dashboard?**
The admin dashboard calls `announcementsApi.list({ limit: 3 })` and renders the 3 most recent. Pinned announcements get a highlighted orange border `border-orange-200 bg-orange-50/30`.
→ `frontend/app/admin/page.tsx`

**Q88. How does the home teacher see their students' performance ranking?**
The "Students" page (only visible to home teachers) calls `analyticsApi.getHomeTeacherRanking(teacherId)` which aggregates grades for all students in the home teacher's class and returns a ranked list.
→ `frontend/app/teacher/students/page.tsx`
→ `frontend/lib/api/analytics.ts`
→ `backend/app/routers/analytics.py`

**Q89. What database is used in tests vs. production?**
Tests use SQLite in-memory via `backend/tests/conftest.py` which overrides the `get_db` dependency. Each test runs in a transaction that is rolled back at the end — fast and isolated. Production uses PostgreSQL via Supabase.
→ `backend/tests/conftest.py`

**Q90. How are CORS (Cross-Origin) requests from the frontend handled?**
`main.py` registers `CORSMiddleware` with `ALLOWED_ORIGINS` from the env var. In production, only the Vercel frontend URL is allowed. In development, `http://localhost:3000` is allowed.
→ `backend/app/main.py`

---

## 17. EDGE CASES & ERROR STATES

**Q91. What does the UI show while data is loading?**
Most pages show a centered `Loader2` spinner (Lucide, `animate-spin`) while the API call is in progress. The spinner disappears once data arrives or an error occurs.

**Q92. What does the UI show if a fetch fails?**
Pages typically render a red error box with the error message. Student and teacher pages degrade gracefully — the rest of the page renders even if one data section fails.

**Q93. What happens if a student navigates directly to a teacher's URL?**
The backend rejects the API calls with `403`. The frontend would show an error state. Route-level guards in each `layout.tsx` also check the user's role and redirect back to the correct dashboard.

**Q94. What if the Supabase database is paused (free tier)?**
Supabase free tier pauses after 7 days of inactivity. The backend would return 500 errors. The fix is either to upgrade Supabase to a paid plan or to send a daily "wake-up" request. Production uses the paid plan.
→ `CLAUDE.md` — Stability Notes

**Q95. What happens when a student submits a file that's too large?**
The backend's `UploadFile` handler has a size limit. If exceeded, FastAPI returns a `413 Request Entity Too Large` response. The frontend shows the API error message.

**Q96. Can the same student submit an assignment twice?**
Only if the assignment has `max_attempts > 1` and the submission has not been graded yet. The backend enforces this — if the student has reached `max_attempts`, the submission endpoint returns an error.

**Q97. What is the `must_change_password` flow?**
When an admin creates a user, `must_change_password` is set to `True`. On their first login, `AuthProvider` detects this flag and redirects to `/change-password` before they can access any other page. After changing, the flag is cleared server-side.
→ `frontend/components/auth/AuthProvider.tsx`
→ `backend/app/routers/users.py`

**Q98. How does the notification badge update in real time without websockets?**
It doesn't poll continuously — instead it refetches on mount and listens for a `notification:refresh` custom window event. Any code that creates a notification dispatches this event to trigger a badge refresh.
→ `frontend/components/layouts/MainSidebar.tsx:94-96`

**Q99. What prevents a teacher from grading a submission that belongs to a different class?**
The backend validates that the `assignment_id` on the submission belongs to a `class_subject` where `teacher_id === current_user.id`. If not, it returns `403`.

**Q100. How are access tokens kept secure if the JavaScript memory gets wiped on page refresh?**
The refresh token in `localStorage` is used to silently obtain a new access token. The new access token goes into memory again. This design means a stolen refresh token is more dangerous than a stolen access token — which is why refresh tokens are long-lived but access tokens expire in 15 minutes.
→ `frontend/components/auth/AuthProvider.tsx`
→ `backend/app/core/security.py` — token expiry settings

---

## 18. BONUS QUESTIONS (if the judge goes very deep)

**Q101. Why is the frontend and backend in the same git repository (monorepo)?**
It simplifies coordination — a single PR can change both the API schema and the frontend types simultaneously, preventing version drift. Each service (`frontend/`, `backend/`) still deploys independently.

**Q102. Why use Alembic instead of creating tables manually?**
Alembic tracks every schema change as a versioned migration file. This means the database can be upgraded or rolled back reproducibly. Railway auto-runs `alembic upgrade head` on every deploy.

**Q103. What is the difference between `ClassSubject` and `Class` in the data model?**
A `Class` is a homeroom group (e.g., "Grade 10A"). A `Subject` is a course (e.g., "Mathematics"). A `ClassSubject` is the intersection — "Grade 10A studying Mathematics, taught by Teacher X." Students enroll in a `Class`, which gives them access to all that class's `ClassSubject` records.

**Q104. Why does the frontend use `usePathname()` instead of `useRouter()` to detect the active page?**
`usePathname()` is a read-only hook that returns the current URL path. `useRouter()` is for navigation actions. Using `usePathname()` for active-state detection is the correct, performant approach — it only re-renders when the path changes.

**Q105. What is the role of `pydantic-settings` in the backend?**
`pydantic-settings` reads environment variables and validates them at startup. The `Settings` class in `config.py` defines all required env vars with their types. If a required var is missing, the app crashes immediately with a clear error instead of failing silently later.
→ `backend/app/config.py`

**Q106. How does the backend handle multiple file uploads for one submission?**
The `SubmissionFile` model has a foreign key `submission_id`. Each `POST /files/upload?submission_id={id}` call creates one `SubmissionFile` record. A submission can have many files; the frontend fetches them all as `submission.files[]`.
→ `backend/app/models/submission_file.py`

**Q107. Why is the admin's analytics page separate from individual class analytics?**
Admin analytics shows system-wide aggregates (all classes, all students). Teacher analytics is scoped to their specific class-subject. They call different backend endpoints: `/analytics/admin/overview` vs. `/analytics/class/{id}/averages`.
→ `frontend/lib/api/analytics.ts`

**Q108. How does the system calculate "average score" for a class?**
The backend queries all grades for all submissions for a given class-subject, computes the mean, and returns it in the analytics response. This is done server-side so the frontend only receives the computed value.
→ `backend/app/routers/analytics.py`

**Q109. What would break first if the Supabase Storage bucket were deleted?**
File uploads and downloads would fail with 500 errors. The rest of the app (authentication, grades, assignments, attendance) runs purely on PostgreSQL and would be unaffected.

**Q110. Why does the login page say "New to EduPeak? Contact your school admin" instead of a signup button?**
PSMS is a closed school management system. Students and teachers don't self-register — accounts are created by the admin. The message guides new users to the correct channel without offering a non-functional signup form.
→ `frontend/app/(auth)/login/page.tsx:121-128`
