# IAMS — System Architecture & Algorithms Documentation Guide
# (Production Deployment — Supabase)

This guide walks you through documenting the **production** system architecture
and the algorithms/models used in IAMS after deployment to Supabase.

---

## PART 1 — System Architecture

### Step 1 — High-Level Production Architecture

```mermaid
flowchart TD
    subgraph CLIENT["CLIENT LAYER — Vercel"]
        B["Browser"]
        NX["Next.js 14 (App Router)"]
        R["Roles: Admin | Teacher | Student\nPrivileges: is_home_teacher | is_class_monitor"]
        B --> NX
        NX --- R
    end

    subgraph API["API LAYER — Railway / Render / Fly.io"]
        JWT["JWT Middleware → RBAC (role + privilege flags)"]
        ROUTERS["Routers: auth | users | classes | subjects | enrollments\nassignments | submissions | grades | attendance\nbehavior_logs | analytics | files"]
        JWT --> ROUTERS
    end

    subgraph DB["Supabase PostgreSQL (hosted DB)"]
        PG["DATABASE_URL = postgresql://...supabase.co\nSQLAlchemy + psycopg2"]
    end

    subgraph STORE["Supabase Storage"]
        ST["Bucket: iams-files\nSTORAGE_BACKEND=supabase\nPublic URLs via CDN"]
    end

    CLIENT -->|"HTTPS / REST JSON"| API
    ROUTERS -->|"SQLAlchemy + psycopg2"| DB
    ROUTERS -->|"supabase-py SDK"| STORE
```

---

### Step 2 — Authentication & Token Flow

```mermaid
sequenceDiagram
    participant User as Browser
    participant NX as NextJS on Vercel
    participant API as FastAPI on Railway
    participant DB as Supabase DB

    User->>NX: Enter credentials
    NX->>API: POST /auth/login
    API->>DB: SELECT user WHERE email
    DB-->>API: User record
    API->>API: bcrypt.verify password
    API->>API: sign access_token 15 min
    API->>API: sign refresh_token 30 days
    API-->>NX: access_token and refresh_token
    NX->>NX: save refresh_token to localStorage
    NX->>NX: setAccessToken in memory
    NX-->>User: redirect to role dashboard

    Note over User,API: Every API request
    NX->>API: GET /resource with Bearer token
    API->>API: decode JWT to User object
    API->>API: check role and privilege flags
    API-->>NX: 200 JSON

    Note over User,API: Token expires 401
    NX->>API: POST /auth/refresh with refresh_token
    API->>API: issue new access_token
    API-->>NX: new access_token
    NX->>API: retry original request
    API-->>NX: 200 JSON
```

---

### Step 3 — Database ERD (Supabase PostgreSQL)

All tables live inside your Supabase project's PostgreSQL instance.

```mermaid
erDiagram
    users {
        int id PK
        string email
        string full_name
        string hashed_password
        string role "admin | teacher | student"
        boolean is_home_teacher
        boolean is_class_monitor
        boolean is_active
        timestamp created_at
        timestamp updated_at
    }

    classes {
        int id PK
        string name
        int year
        string section
        int home_teacher_id FK "users.id"
    }

    subjects {
        int id PK
        string name
        string code
        text description
    }

    class_subjects {
        int id PK
        int class_id FK "classes.id"
        int subject_id FK "subjects.id"
        int teacher_id FK "users.id"
    }

    enrollments {
        int id PK
        int student_id FK "users.id"
        int class_id FK "classes.id"
    }

    assignments {
        int id PK
        int class_subject_id FK "class_subjects.id"
        string title
        text description
        boolean is_published
        date due_date
        float max_score
        timestamp created_at
    }

    submissions {
        int id PK
        int assignment_id FK "assignments.id"
        int student_id FK "users.id"
        timestamp submitted_at
        boolean is_late
        int keypress_count
        int paste_count
        int focus_events
    }

    submission_files {
        int id PK
        int submission_id FK "submissions.id"
        string stored_path
        string original_name
        string content_type
        int file_size
    }

    grades {
        int id PK
        int class_subject_id FK "class_subjects.id"
        int student_id FK "users.id"
        int graded_by FK "users.id"
        string grade_type "midterm | final | quiz | homework"
        float score
        float max_score
        timestamp graded_at
    }

    attendance {
        int id PK
        int class_subject_id FK "class_subjects.id"
        int student_id FK "users.id"
        int marked_by_id FK "users.id"
        date record_date
        string status "present | absent | late"
        timestamp created_at
    }

    behavior_logs {
        int id PK
        int student_id FK "users.id"
        int logged_by FK "users.id"
        date record_date
        string category
        text description
        string severity "low | medium | high"
        timestamp created_at
    }

    users ||--o{ classes : "is home teacher of"
    users ||--o{ enrollments : "enrolled as student"
    classes ||--o{ enrollments : "has enrollment"

    users ||--o{ class_subjects : "teaches"
    classes ||--o{ class_subjects : "has subject"
    subjects ||--o{ class_subjects : "taught in"

    class_subjects ||--o{ assignments : "has"
    assignments ||--o{ submissions : "receives"
    users ||--o{ submissions : "submits"
    submissions ||--o{ submission_files : "has file"

    class_subjects ||--o{ grades : "has"
    users ||--o{ grades : "graded as student"
    users ||--o{ grades : "graded by teacher"

    class_subjects ||--o{ attendance : "tracks"
    users ||--o{ attendance : "attended by student"
    users ||--o{ attendance : "marked by monitor"

    users ||--o{ behavior_logs : "logged as student"
    users ||--o{ behavior_logs : "logged by home teacher"
```

---

### Step 4 — Supabase Storage Flow

```mermaid
flowchart TD
    A["Client\nPOST /files/upload (multipart/form-data)"]
    B{"content_type\nIN ALLOWED_TYPES?"}
    C{"file size\n≤ MAX_FILE_SIZE?"}
    D["Generate stored_path:\nuploads/{uuid4()}_{filename}"]
    E["SupabaseStorageBackend.save()\nsupabase.storage.from_('iams-files')\n.upload(stored_path, file_bytes)"]
    F["INSERT INTO submission_files\n(submission_id, stored_path,\noriginal_name, content_type)"]
    G["Return public URL\nhttps://project.supabase.co/storage/\nv1/object/public/iams-files/uploads/uuid_file.pdf"]
    ERR1["400 Bad Request\nUnsupported file type"]
    ERR2["400 Bad Request\nFile too large"]

    A --> B
    B -->|No| ERR1
    B -->|Yes| C
    C -->|No| ERR2
    C -->|Yes| D
    D --> E
    E --> F
    F --> G
```

---

### Step 5 — Request Lifecycle Flowchart

```mermaid
flowchart TD
    A["HTTPS Request from Vercel frontend"]
    B{"CORS Middleware\norigin in ALLOWED_ORIGINS?"}
    C{"JWT Auth\nget_current_user()"}
    D{"RBAC + Privilege Check\nrequire_roles(roles)"}
    E["Router + Pydantic Schema\nvalidate request body"]
    F["Service / Business Logic"]
    G["SQLAlchemy ORM\nSupabase PostgreSQL"]
    H["JSON Response 200"]
    E1["403 Forbidden\nWrong origin"]
    E2["401 Unauthorized\nMissing or invalid token"]
    E3["403 Forbidden\nWrong role or missing flag"]

    A --> B
    B -->|Wrong origin| E1
    B -->|OK| C
    C -->|Missing or invalid| E2
    C -->|Valid User object| D
    D -->|Wrong role or flag| E3
    D -->|Allowed| E
    E --> F
    F --> G
    G --> H
```

---

### Step 6 — Frontend Component Architecture (Vercel / Next.js)

```mermaid
flowchart TD
    ROOT["RootLayout\napp/layout.tsx\nInter font + globals.css (Tailwind)\nwraps children in AuthProvider"]

    subgraph PROVIDERS["Providers"]
        AUTH["AuthProvider\ncomponents/auth/AuthProvider.tsx\nstate: user, loading\nlogin() | logout() | refreshUser()\non mount: localStorage.access_token exists?\n→ usersApi.getMe() — if 401 → authApi.refresh()\nsyncs role to user_role cookie"]
    end

    subgraph STUDENT_SHELL["Student Shell — app/student/layout.tsx"]
        MS["MainSidebar\ncomponents/layouts/MainSidebar.tsx\nreads mock_role cookie"]
        SP["Student Pages\n/student\n/student/classes/[subjectId]\n/student/attendance\n/student/schedule\n/student/notifications\n/student/settings"]
        MS --> SP
    end

    subgraph ADMIN_SHELL["Admin Shell — app/admin/layout.tsx (passthrough)"]
        AP["Admin Pages\n/admin\n/admin/users\n/admin/academic"]
    end

    subgraph TEACHER_SHELL["Teacher Shell — app/teacher/layout.tsx (passthrough)"]
        TP["Teacher Pages\n/teacher\n/teacher/classes/[subjectId]"]
    end

    subgraph AUTH_PAGES["Auth Pages — app/(auth)/"]
        LP["/login\n/forgot-password"]
    end

    FETCH["API Client\nlib/api/client.ts\nnative fetch() → NEXT_PUBLIC_API_URL\nrequest: inject Authorization: Bearer\nfrom localStorage.access_token\n401: clear tokens + redirect /login"]

    ROOT --> PROVIDERS
    PROVIDERS --> STUDENT_SHELL
    PROVIDERS --> ADMIN_SHELL
    PROVIDERS --> TEACHER_SHELL
    PROVIDERS --> AUTH_PAGES
    ROOT --> FETCH
```

---

### Step 7 — Environment Variables (Production)

These are set in your hosting dashboards, not in `.env` files:

**FastAPI host (Railway / Render):**
```env
DATABASE_URL              = postgresql://postgres.<ref>:<pass>@aws-0-<region>.pooler.supabase.com:5432/postgres
JWT_SECRET_KEY            = <256-bit random secret>
STORAGE_BACKEND           = supabase
SUPABASE_URL              = https://<project-ref>.supabase.co
SUPABASE_SERVICE_ROLE_KEY = <service_role_key from Supabase dashboard>
SUPABASE_STORAGE_BUCKET   = iams-files
ALLOWED_ORIGINS           = https://your-app.vercel.app
DEBUG                     = false
ENVIRONMENT               = production
```

**Next.js (Vercel):**
```env
NEXT_PUBLIC_API_URL = https://your-fastapi.railway.app
```

---

## PART 2 — Algorithms & Models

### Step 8 — Authentication Algorithm (bcrypt + JWT)

**Password hashing:**
```
Registration:
  raw_password → passlib.bcrypt.hash(password) → stored in users.hashed_password

Login:
  passlib.bcrypt.verify(raw_password, hashed_password) → True / False
```

**JWT generation:**
```python
# Claims included in BOTH access and refresh tokens:
token_claims = {
  "sub": str(user.id),
  "role": user.role.value,          # "admin" | "teacher" | "student"
  "is_home_teacher": bool,          # privilege flag
  "is_class_monitor": bool,         # privilege flag
}

access_token payload  = token_claims + {"exp": now + timedelta(minutes=15), "type": "access"}
refresh_token payload = token_claims + {"exp": now + timedelta(days=30),    "type": "refresh"}

token = jose.jwt.encode(payload, JWT_SECRET_KEY, algorithm="HS256")
```

**Token validation (`get_current_user` dependency):**
```python
payload = jose.jwt.decode(token, JWT_SECRET_KEY, algorithms=["HS256"])
# Returns {} on JWTError — treated as invalid

user_id    = payload.get("sub")
token_type = payload.get("type")

if not user_id or token_type != "access":
    raise HTTP 401 Unauthorized

user = db.query(User).filter(User.id == user_id, User.is_active == True).first()
if not user:
    raise HTTP 401 Unauthorized

return user   # user.is_home_teacher / user.is_class_monitor available for RBAC
```

Source: `backend/app/core/security.py`, `backend/app/services/auth_service.py`

---

### Step 9 — RBAC + Privilege Algorithm

```mermaid
flowchart TD
    REQ["Incoming request\n+ current_user object"]

    RC{"user.role\nIN allowed_roles?"}
    PC{"Privilege flag\nrequired?"}
    HT{"user.is_home_teacher\n== True?"}
    CM{"user.is_class_monitor\n== True?"}
    IDOR{"user.role == student\nAND user.id != resource.student_id?"}

    OK["✅ Access Granted\nProceed to handler"]
    F403A["403 Forbidden\nWrong role"]
    F403B["403 Forbidden\nMissing privilege flag"]
    F403C["403 Forbidden\nIDOR — not your data"]

    REQ --> RC
    RC -->|No| F403A
    RC -->|Yes| PC
    PC -->|No flag needed| IDOR
    PC -->|is_home_teacher needed| HT
    PC -->|is_class_monitor needed| CM
    HT -->|No| F403B
    HT -->|Yes| IDOR
    CM -->|No| F403B
    CM -->|Yes| IDOR
    IDOR -->|Yes| F403C
    IDOR -->|No| OK
```

**Permissions table:**

| Endpoint            | admin | teacher | teacher + is_home_teacher | student | student + is_class_monitor |
| ------------------- | ----- | ------- | ------------------------- | ------- | -------------------------- |
| POST /classes       | ✅    | ❌      | ❌                        | ❌      | ❌                         |
| GET /classes        | ✅    | ✅      | ✅                        | ✅      | ✅                         |
| POST /attendance    | ❌    | ❌      | ❌                        | ❌      | ✅                         |
| POST /behavior_logs | ❌    | ❌      | ✅                        | ❌      | ❌                         |
| GET /analytics      | ✅    | ✅      | ✅                        | ❌      | ❌                         |

Source: `backend/app/core/permissions.py`

---

### Step 10 — Grade Calculation Algorithm

Grades are **submission-based**: a `Grade` record is linked to an `AssignmentSubmission`, not directly to a student + class_subject. Each `Assignment` may optionally belong to a `GradeCategory` (teacher-defined, dynamic weights).

```mermaid
flowchart TD
    CATS["Teacher defines GradeCategories\nfor a ClassSubject\ne.g. Midterm 30% | Final 40% | Quiz 20% | HW 10%\nconstraint: SUM(weights) ≤ 1.0"]

    ASSIGN["Assignments tagged with category_id\n(nullable — untagged = extra credit)"]

    SUBS["AssignmentSubmissions\n→ Grade.score (Numeric 5,2)"]

    GROUP["Group graded submissions\nby category_id"]

    CAT_AVG["Per-category average\n= SUM(score/max_score × 100) / COUNT"]

    WAVG["Weighted average\n= SUM(cat_avg × category.weight)\nonly for categories with ≥ 1 submission"]

    PLAIN["Plain average\n= SUM(score) / COUNT\n(always computed as fallback)"]

    PASS["Pass threshold\nscore / max_score ≥ 0.60"]

    CATS --> ASSIGN --> SUBS --> GROUP
    GROUP --> CAT_AVG --> WAVG
    SUBS --> PLAIN
    WAVG --> PASS
    PLAIN --> PASS
```

**Algorithm (Python):**
```python
# In GET /analytics/student/{id}/score-trend
by_cat = defaultdict(list)
for grade, submission, assignment in rows:
    if assignment.category_id and assignment.category_id in cat_map:
        pct = grade.score / assignment.max_score * 100
        by_cat[assignment.category_id].append(pct)

weighted_average = sum(
    (sum(scores) / len(scores)) * float(cat_map[cat_id].weight)
    for cat_id, scores in by_cat.items()
)   # None if no categorised submissions

plain_average = sum(grade.score for ...) / count
```

**Grade letter thresholds** (applied to the weighted or plain average as a percentage):
```
≥ 90 → A  |  ≥ 80 → B  |  ≥ 70 → C  |  ≥ 60 → D  |  < 60 → F
```

Source: `backend/app/routers/analytics.py`, `backend/app/routers/grade_categories.py`, `backend/app/models/grade_category.py`

---

### Step 11 — Attendance Rate Algorithm

The `AttendanceStatus` enum has four values: `present`, `late`, `absent`, `excused`.
`excused` absences count as fully present (student had a valid reason).

```mermaid
flowchart TD
    ATT["attendance records\n{ student_id, class_id, date, status }"]

    COUNT["Count per status:\nP = present\nL = late\nA = absent\nE = excused\ntotal = P + L + A + E"]

    RATE["Student rate =\n(P + E + L × 0.5) / total × 100"]

    CLASS["Class rate =\nAVG(rate) across\nall enrolled students"]

    ATT --> COUNT --> RATE --> CLASS
```

**Formula:**
```
attendance_rate = (present + excused + late × 0.5) / total_records × 100
```

Returned in `GET /analytics/student/{id}/score-trend` as the `attendance_rate` field.

Source: `backend/app/routers/analytics.py`, `backend/app/models/attendance.py`

---

### Step 12 — File Upload Algorithm (Supabase Storage)

```mermaid
flowchart TD
    C["Client\nPOST /files/upload\nmultipart/form-data"]

    V1{"content_type IN\nALLOWED_TYPES?"}
    V2{"file size\n≤ MAX_FILE_SIZE?"}

    PATH["stored_path =\nuploads/{uuid4()}_{original_filename}"]

    SUP["supabase.storage\n.from_('iams-files')\n.upload(stored_path, file_bytes)"]

    DB["INSERT INTO submission_files\n(submission_id, stored_path,\noriginal_name, content_type)"]

    URL["Return public URL\nhttps://project.supabase.co/storage/\nv1/object/public/iams-files/stored_path"]

    E1["400 Unsupported\nfile type"]
    E2["400 File\ntoo large"]

    C --> V1
    V1 -->|No| E1
    V1 -->|Yes| V2
    V2 -->|No| E2
    V2 -->|Yes| PATH
    PATH --> SUP
    SUP --> DB
    DB --> URL
```

**ALLOWED_TYPES** (`ALLOWED_TYPES` set in `files.py`):
```
image/jpeg
image/png
image/gif
text/plain
application/pdf
application/msword                                                      (.doc)
application/vnd.openxmlformats-officedocument.wordprocessingml.document (.docx)
application/vnd.openxmlformats-officedocument.spreadsheetml.sheet       (.xlsx)
```

**Storage backend selection** (`STORAGE_BACKEND` env var):
```
STORAGE_BACKEND=local    → LocalFilesystemBackend  (default, dev)
STORAGE_BACKEND=supabase → SupabaseStorageBackend  (production)
```

Source: `backend/app/routers/files.py`, `backend/app/storage/local.py`, `backend/app/storage/supabase.py`

---

### Step 13 — Analytics Aggregation

```mermaid
flowchart LR
    subgraph ENDPOINTS["Analytics Endpoints"]
        A1["GET /analytics/class/{class_id}/averages\nReturns per-subject:\n  avg_score, min_score, max_score\n  pass_rate (score/max≥60%), submission_count\nFROM grades JOIN assignments JOIN class_subjects\nGROUP BY subject"]
        A2["GET /analytics/student/{student_id}/score-trend\nReturns:\n  scores[] (assignment timeline)\n  average_score, weighted_average\n  attendance_rate, submission_rate"]
        A3["GET /analytics/home-teacher/{class_id}/ranking\nReturns ranked leaderboard:\n  rank, student_name\n  total_score, average_score\n  assignment_count\nGROUP BY student, SUM(grade.score)"]
        A4["GET /analytics/admin/overview\nReturns:\n  total_users, total_students\n  total_teachers, total_assignments\n  total_submissions, submissions_today\n  average_system_score"]
    end

    subgraph ROLES["Required Role"]
        R1["teacher / admin"]
        R2["student (own data only)\nteacher / admin"]
        R3["teacher with\nis_home_teacher=true\nor admin"]
        R4["admin only"]
    end

    A1 --- R1
    A2 --- R2
    A3 --- R3
    A4 --- R4
```

Source: `backend/app/routers/analytics.py`

---

## PART 3 — Putting It All Together

### Final Document Structure

```
1. System Architecture (Production)
   1.1 High-Level Production Architecture (Step 1)
   1.2 Authentication & Token Flow (Step 2)
   1.3 Database ERD — Supabase PostgreSQL (Step 3)
   1.4 Supabase Storage Flow (Step 4)
   1.5 Request Lifecycle Flowchart (Step 5)
   1.6 Frontend Component Architecture — Vercel (Step 6)
   1.7 Environment Variables (Step 7)

2. Algorithms & Models
   2.1 Authentication — bcrypt + JWT (Step 8)
   2.2 RBAC + Privilege Flags (Step 9 + table)
   2.3 Grade Calculation (Step 10)
   2.4 Attendance Rate (Step 11)
   2.5 File Upload — Supabase Storage (Step 12)
   2.6 Analytics Aggregation (Step 13)
```

---

## Checklist

- [ ] Step 1 — Production 4-layer architecture diagram (Vercel + Railway + Supabase DB + Supabase Storage)
- [ ] Step 2 — Auth token flow sequence diagram
- [ ] Step 3 — Database ERD (all 11 tables in Supabase PostgreSQL)
- [ ] Step 4 — Supabase Storage file upload flow
- [ ] Step 5 — Request lifecycle flowchart
- [ ] Step 6 — Frontend component architecture (Vercel / Next.js)
- [ ] Step 7 — Production environment variables listed
- [ ] Step 8 — bcrypt + JWT algorithm documented
- [ ] Step 9 — RBAC + privilege algorithm + permissions table
- [ ] Step 10 — Grade calculation formula
- [ ] Step 11 — Attendance rate formula
- [ ] Step 12 — File upload algorithm (Supabase Storage path)
- [ ] Step 13 — Analytics aggregation endpoints
