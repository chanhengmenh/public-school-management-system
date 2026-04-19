# PSMS — Production Readiness Progress

Last updated: 2026-04-18

---

## Tier 0 — Security Fixes (do first)

| # | Task | Status |
|---|------|--------|
| 6 | IDOR fix: ownership check on `GET /class-subjects/{id}` — only assigned teacher, admin, or enrolled student | ✅ Done |
| 7 | Scope `GET /analytics/class/{id}/averages` — teacher must be assigned to that class; students blocked | ✅ Done |
| 8 | Enforce home-teacher-only on `GET /analytics/home-teacher/{id}/ranking` — must be that teacher with `is_home_teacher=True` | ✅ Done |

---

## Tier 1 — Core Production Gaps

| # | Task | Status |
|---|------|--------|
| 9  | Admin password reset: `PUT /users/{id}/reset-password` + frontend modal with temp password | ✅ Done |
| 10 | Wire notifications to real backend — replace `NotificationContext` mock in teacher + student pages | ✅ Done |
| 11 | Announcements: backend model + router + admin CRUD UI + read-only feed in dashboards | ✅ Done |
| 12 | Admin settings page: wire to `GET/PUT /users/me` (currently hardcoded) | ✅ Done |
| 13 | Bulk CSV import: `POST /users/import` (admin only) — auto-generate emails, create users + enroll | ✅ Done |

---

## Tier 2 — Trust & Governance

| # | Task | Status |
|---|------|--------|
| 14 | Audit log: backend model + `GET /audit-logs` (admin only, paginated) + admin UI viewer | ✅ Done |

---

## Tier 3 — Completeness & Polish

| # | Task | Status |
|---|------|--------|
| 15 | Verify quiz feature end-to-end (teacher creates → student takes → teacher sees results) + fix broken wiring | ✅ Done |
| 16 | Academic year transition: admin UI workflow to create new cohort (new classes → assign subjects → enroll students) | ✅ Done |
| 17 | Behavior log viewer for home teachers — keypress/paste/focus per submission, engagement classification | ✅ Done |
| 18 | Form validation UX: duplicate email detection (409 → inline error), required field highlights, email format validation | ✅ Done |

---

## Tier 4 — Deployment

| # | Task | Status |
|---|------|--------|
| 19 | Deploy to Railway (backend) + Vercel (frontend) + Supabase (DB + storage) — verify live end-to-end flow | 🔲 Pending |

---

## Tier 5 — System Event Announcements (Future)

| # | Task | Status |
|---|------|--------|
| 20 | Auto-generated announcements for assignment events: assignment created, assignment graded, deadline delayed (Canvas-style) | 🔲 Pending |

---

## Tier 6 — Private File Storage + Class Materials (Future)

**Goal:** Replace flat public-URL storage with structured private Supabase bucket + signed URLs, then add class materials upload for teachers.

### Architecture

**StorageBackend refactor (`backend/app/storage/`):**
- Add `generate_path(resource_type, resource_id, filename) → str` to base class
  - Path format: `{resource_type}/{resource_id}/{uuid}_{sanitized_filename}`
  - Examples: `submissions/42/abc_report.pdf`, `materials/15/xyz_syllabus.docx`
- Replace `get_url()` with `get_signed_url(stored_path, expires_in=3600) → str`
  - `local.py`: returns `/files/{path}` (auth-gated, no change to serve flow)
  - `supabase.py`: calls `storage.from_(bucket).create_signed_url(path, expires_in)` (private bucket)
- `supabase.py` `save()`: use `generate_path()` instead of flat `{folder}/{uuid}_{filename}`

**Files router (`backend/app/routers/files.py`):**
- `POST /files/upload`: accept `resource_type` + `resource_id` params (replace hardcoded `folder="submissions"`)
- Add `GET /files/{path:path}/signed-url?expires=3600`: calls backend `get_signed_url()`, returns `{"url": "..."}` — frontend redirects user to this
- Keep `GET /files/{path:path}`: local dev only (still auth-gated, path traversal guard stays)

**Materials feature:**
- New model: `Material` — `id, class_subject_id, uploader_id, title, file_path, file_type, created_at`
- New migration: add `materials` table
- New router `/materials`: `POST` (teacher only), `GET /class-subjects/{id}/materials` (enrolled users), `DELETE` (teacher/admin)
- Upload flow: `POST /files/upload?resource_type=materials&resource_id={material_id}` → same backend path

**Frontend:**
- `lib/api/materials.ts`: typed client for materials endpoints
- `lib/api/files.ts`: add `getSignedUrl(path)` helper (calls `GET /files/{path}/signed-url`)
- Teacher class page: new "Materials" tab — upload modal (reuse submission drag-drop pattern) + file list with signed-URL download links
- Student class page: read-only "Materials" tab — list + signed-URL download

| # | Task | Status |
|---|------|--------|
| 21 | Refactor `StorageBackend`: structured path generation + `get_signed_url()` replacing `get_url()` | 🔲 Pending |
| 22 | Update `files.py` router: `resource_type`/`resource_id` upload params + `GET .../signed-url` endpoint | 🔲 Pending |
| 23 | Class materials: `Material` model + migration + CRUD router + teacher upload UI + student read-only tab | 🔲 Pending |

---

## Completed

| Task | Completed |
|------|-----------|
| Alembic migration for `audit_logs` table (was missing, broke all user CRUD) | ✅ 2026-04-19 |
| Add announcement feed to admin/teacher/student dashboards | ✅ 2026-04-19 |
| Wire `admin/timetable` to real schedules API (`GET /schedules`) | ✅ 2026-04-18 |
| Fix timetable missing from admin sidebar | ✅ 2026-04-18 |
| Fix Saturday PE block overflow (GRID_END_HOUR 17 → 18) | ✅ 2026-04-18 |
| Wire teacher/settings to real API (`GET/PUT /users/me`) | ✅ 2026-04-18 |
| Wire admin/settings Account tab to real API | ✅ 2026-04-18 |
| Fix logout "Failed to fetch" — make logout purely local (JWT is stateless) | ✅ 2026-04-18 |
| Restrict email changes — only admins can change emails | ✅ 2026-04-18 |
| Update email format to SRMK domain (`@srmk.edu.kh`) | ✅ 2026-04-18 |
| Rename project to Public School Management System (PSMS) | ✅ 2026-04-18 |
| Cambodian room convention: room name = class name (e.g. "Grade 11A") | ✅ 2026-04-18 |
| Academic tab: show home teacher name instead of ID + teacher dropdown | ✅ 2026-04-18 |
| Fix duplicate class monitor names (all showed "Sophea Lim") | ✅ 2026-04-18 |
| Update README with correct SRMK credentials and monitor names | ✅ 2026-04-18 |

---

## Future (out of scope for this release)

- Mobile app (iOS / Android)
- Parent portal
- Email-based forgot-password flow (needs SMTP / SendGrid / Resend)
- Supabase paid tier for production uptime (free tier pauses after 7 days of inactivity)

---

## Definition of Done

All 14 tasks (#6–#19) completed and verified on the live deployed URL = **production ready** for SRMK demo/defense scope.

---

## Legend

| Symbol | Meaning |
|--------|---------|
| 🔲 Pending | Not started |
| 🔄 In Progress | Currently being worked on |
| ✅ Done | Completed and verified |
