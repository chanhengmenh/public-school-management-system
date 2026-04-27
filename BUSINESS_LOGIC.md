# Business Logic — PSMS (Public School Management System)

> Sereymongkul High School (SRMK) — Role-based academic management platform.
> Stack: FastAPI + PostgreSQL (backend) · Next.js 14 App Router (frontend)

---

## 1. Authentication & Session Management

- `POST /auth/login` issues two tokens:
  - **Access token** — JWT, 15-min TTL, kept in-memory on the frontend (never in `localStorage`).
  - **Refresh token** — JWT, 7-day TTL, stored in `localStorage`.
- `GET /auth/refresh` accepts a valid refresh token and returns a new access token.
- Every protected endpoint validates the `Authorization: Bearer <token>` header via `get_current_user()`.
- A `must_change_password` flag on the `User` model triggers a frontend guard (`PasswordGuard.tsx`) that blocks all routes until the password is updated.

---

## 2. Role-Based Access Control (RBAC)

Three roles in the `UserRole` enum: `admin`, `teacher`, `student`.

Two **privilege flags** (not separate roles):
- `is_home_teacher=True` — on a teacher; grants access to the class ranking and behavior logs for their homeroom class.
- `is_class_monitor=True` — on a student; allows marking attendance on behalf of the class.

### Access Matrix

| Action | Admin | Teacher | Student | Class Monitor | Home Teacher |
|---|:---:|:---:|:---:|:---:|:---:|
| Manage users | ✅ | ❌ | ❌ | ❌ | ❌ |
| Enroll / unenroll students | ✅ | ❌ | ❌ | ❌ | ❌ |
| Create / publish assignments | ✅ | ✅ | ❌ | ❌ | ❌ |
| Submit assignments | ❌ | ❌ | ✅ | ✅ | ❌ |
| Grade submissions | ✅ | ✅ | ❌ | ❌ | ❌ |
| Mark attendance | ✅ | ✅ | ❌ | ✅ | ❌ |
| View class ranking | ✅ | ❌ | ❌ | ❌ | ✅ (own class only) |
| Broadcast notification | ✅ | ✅ (own class-subject) | ❌ | ❌ | ❌ |
| Create announcements | ✅ | ❌ | ❌ | ❌ | ❌ |
| Manage schedules (CRUD) | ✅ | ❌ | ❌ | ❌ | ❌ |
| View behavior logs | ✅ | ✅ | ❌ | ❌ | ❌ |

---

## 3. Enrollment

- Only **admins** can enroll or unenroll a student from a class.
- Every enrollment/unenrollment action is written to the **audit log**.
- Uniqueness (one enrollment per student per class) is enforced by a database constraint.

---

## 4. Assignments

### Lifecycle: `draft` → `published`

- Assignments are created in `draft` status by teachers or admins.
- A separate `POST /assignments/{id}/publish` endpoint (or setting `status=published` on create) transitions to published.
- **Students see only published assignments.** Teachers/admins see all statuses.

### On Publish

When an assignment is published (either via create or explicit publish action):
1. A **system announcement** is posted to the class.
2. A **notification** (`type: assignment`) is sent to every enrolled student.

### On Deadline Change

If the `due_date` is updated on an already-published assignment:
1. An **alert announcement** is posted to the class.
2. An **alert notification** is sent to every enrolled student.

### Submission Constraints (configured per assignment)

| Field | Rule |
|---|---|
| `submission_type` | `"text"`, `"file"`, or `"both"` — mismatch raises `403` |
| `max_attempts` | If set, submission is rejected once the limit is reached |

---

## 5. Submissions

- Only **students** can submit. Only to **published** assignments.
- `submission_type` mismatch with the assignment's allowed type → `403 ForbiddenError`.
- **Late detection**: if `now (UTC) > due_date`, `is_late=True` is stored automatically. Late submissions are accepted but flagged.
- After a successful submission, the **subject teacher is notified** (`type: assignment`) with a `(late)` tag if applicable.
- Students can only read **their own** submissions (enforced on list and detail endpoints).
- File attachments are uploaded separately via `POST /files/upload?submission_id={id}` after the submission row is created.

---

## 6. Grading

- **One grade per submission** — a second `POST` raises `409 ConflictError` ("Use PUT to update").
- Grades are created/updated by **teachers or admins** only.
- On every grade create or update:
  - The student receives a `type: grade` notification showing the score.
  - An **audit log entry** is written with old vs new score diff.

---

## 7. Grade Categories

- Per `ClassSubject`, teachers define named categories (e.g., "Homework", "Midterm", "Final") each with a `weight` (0.0–1.0).
- **Invariant**: total weight of all categories for a class-subject must not exceed **1.0** (enforced on both create and update with a 0.0001 float tolerance). Violation raises `400`.
- Assignments can be linked to a category via `category_id`.
- **Weighted average formula** used in analytics:
  ```
  weighted_avg = Σ (mean_score_pct_in_category × category_weight)
  ```
  where `mean_score_pct_in_category = (avg raw score / max_score) × 100`.

---

## 8. Attendance

- Attendance is recorded **per class, per student, per date**.
- **Who can mark**: admin · any teacher · student with `is_class_monitor=True`.
- **Upsert behavior**: if a record already exists for that (class, student, date), it is updated in-place — no duplicates created.
- **Statuses**: `present`, `absent`, `late`, `excused`.
- Students can only query their **own** attendance records.

### Attendance Rate Formula

```
rate = (present + excused + (late × 0.5)) / total × 100
```

---

## 9. Announcements

- Only **admins** can create, edit, or delete announcements.
- **Targeting** (`AnnouncementTarget`):

  | Target | Visible to | Notification sent to |
  |---|---|---|
  | `all` | Everyone | All non-admin users |
  | `teachers` | Teachers | All teachers |
  | `students` | Students | All students |
  | `class` (+ `class_id`) | Enrolled students | Enrolled students of that class |

- **Pinning**: `is_pinned=True` floats the announcement to the top (ordered by `is_pinned DESC, created_at DESC`).
- **System announcements** are auto-generated on assignment publish / deadline change via `announcement_service.create_system_announcement()`.

---

## 10. Notifications

- Notifications are **personal** — each row targets one `user_id`.
- **Types**: `assignment`, `grade`, `announcement`, `alert`.
- `GET /notifications/unread-count` — unread badge count for the sidebar.
- `PUT /notifications/{id}/read` — marks one read; only the owner may call this.
- `PUT /notifications/read-all` — bulk marks all as read.
- `POST /notifications/broadcast` — teacher-only; sends to all students in the teacher's **own** class subject (ownership enforced: `cs.teacher_id != current_user.id` → `403`).

---

## 11. Analytics

### Student Score Trend (`GET /analytics/student/{id}/score-trend`)

Returns:
- Chronological score history.
- **Simple average** across all graded submissions.
- **Weighted average** by grade category (see §7 formula).
- **Attendance rate** (see §8 formula).
- **Submission rate**: `total submitted / total published assignments in enrolled classes × 100`.

Access: students may only view their own data.

### Class Averages (`GET /analytics/class/{id}/averages`)

Per subject: average score, min score, max score, and **pass rate**.

**Pass threshold**: score ≥ 60% of `max_score`.

Access control:
- Admin → any class.
- Teacher → must teach at least one subject in the class.
- Student → must be enrolled in the class.

### Class Ranking (`GET /analytics/home-teacher/{id}/ranking`)

- Ranks all enrolled students by **total score** (descending).
- **Tied students share the same rank** (standard competition ranking, not dense ranking).
- Accessible only by the **home teacher of that specific class** or an admin.

### Admin Overview (`GET /analytics/admin/overview`)

System-wide counters: total users, students, teachers, assignments, submissions, submissions today, average system score.

---

## 12. File Storage

- **Allowed MIME types** enforced server-side via `ALLOWED_TYPES` allowlist — rejected with `400` otherwise.
- **Path traversal prevention**: `(Path(base) / user_path).resolve()` is asserted to start with the base directory before serving.
- File access requires a valid JWT (`GET /files/{path}` is authenticated).
- Storage backend is pluggable via `STORAGE_BACKEND` env var: `local` (dev) or `supabase` (production).

---

## 13. Audit Logging

Significant admin/teacher actions (grade create/update, enrollment, unenrollment) write a row with:
- `actor_id`, `action` (e.g., `"created"`, `"updated"`, `"enrolled"`), `resource_type`, `resource_id`
- `detail` — human-readable description (e.g., "Graded Sophea Keo in Math: 85")
- `payload` — JSON diff of old vs new field values

---

## 14. Behavior Logs (Academic Integrity Telemetry)

- During a submission session, the frontend fires browser behavior events (tab switch, copy-paste, focus loss, etc.) to `POST /submissions/{id}/telemetry`.
- One `SubmissionTelemetry` row per submission — upserted on subsequent saves.
- Raw `BehaviorLog` events (per submission or student) are accessible to **teachers and admins** via `GET /behavior-logs/`.
