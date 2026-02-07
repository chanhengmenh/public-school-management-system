-- ============================================
-- Intelligent Academic Management System
-- PostgreSQL Database Schema
-- ============================================

-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- 1. ENUMS (Roles, Statuses)
-- ============================================

DROP TYPE IF EXISTS user_role CASCADE;
CREATE TYPE user_role AS ENUM (
  'admin',
  'teacher',
  'home_teacher',
  'student',
  'class_monitor'
);

DROP TYPE IF EXISTS attendance_status CASCADE;
CREATE TYPE attendance_status AS ENUM (
  'present',
  'absent',
  'late',
  'permission'
);

DROP TYPE IF EXISTS visibility_scope CASCADE;
CREATE TYPE visibility_scope AS ENUM (
  'class',
  'school',
  'public'
);

-- ============================================
-- 2. USERS & IDENTITY
-- ============================================

CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  full_name TEXT NOT NULL,
  role user_role NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);

-- ============================================
-- 3. ACADEMIC STRUCTURE
-- ============================================

-- Classes
CREATE TABLE classes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  academic_year TEXT NOT NULL,
  home_teacher_id UUID REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_classes_academic_year ON classes(academic_year);
CREATE INDEX idx_classes_home_teacher ON classes(home_teacher_id);

-- Subjects
CREATE TABLE subjects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  code TEXT UNIQUE NOT NULL,
  description TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_subjects_code ON subjects(code);

-- Class-Subject-Teacher Mapping
CREATE TABLE class_subjects (
  class_id UUID REFERENCES classes(id) ON DELETE CASCADE,
  subject_id UUID REFERENCES subjects(id) ON DELETE CASCADE,
  teacher_id UUID REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW(),
  PRIMARY KEY (class_id, subject_id)
);

CREATE INDEX idx_class_subjects_teacher ON class_subjects(teacher_id);

-- Student Enrollments
CREATE TABLE enrollments (
  student_id UUID REFERENCES users(id) ON DELETE CASCADE,
  class_id UUID REFERENCES classes(id) ON DELETE CASCADE,
  enrolled_at TIMESTAMP DEFAULT NOW(),
  PRIMARY KEY (student_id, class_id)
);

CREATE INDEX idx_enrollments_student ON enrollments(student_id);
CREATE INDEX idx_enrollments_class ON enrollments(class_id);

-- ============================================
-- 4. ASSIGNMENT SYSTEM (Canvas-like)
-- ============================================

CREATE TABLE assignments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT,
  subject_id UUID REFERENCES subjects(id),
  class_id UUID REFERENCES classes(id),
  publisher_id UUID REFERENCES users(id),
  due_date TIMESTAMP,
  max_score NUMERIC(5,2) DEFAULT 100.00,
  allowed_submission_types JSONB NOT NULL, -- ["text", "file", "mcq", "drag_drop"]
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_assignments_subject ON assignments(subject_id);
CREATE INDEX idx_assignments_class ON assignments(class_id);
CREATE INDEX idx_assignments_due_date ON assignments(due_date);

-- ============================================
-- 5. ASSIGNMENT SUBMISSIONS
-- ============================================

-- Main Submission Table
CREATE TABLE assignment_submissions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  assignment_id UUID REFERENCES assignments(id) ON DELETE CASCADE,
  student_id UUID REFERENCES users(id) ON DELETE CASCADE,
  submission_type TEXT NOT NULL, -- "text", "file", "mcq", "mixed"
  submitted_at TIMESTAMP DEFAULT NOW(),
  status TEXT DEFAULT 'submitted', -- "submitted", "graded", "late"
  UNIQUE (assignment_id, student_id)
);

CREATE INDEX idx_submissions_assignment ON assignment_submissions(assignment_id);
CREATE INDEX idx_submissions_student ON assignment_submissions(student_id);
CREATE INDEX idx_submissions_status ON assignment_submissions(status);

-- Submission Text (Essay / Answer)
CREATE TABLE submission_text (
  submission_id UUID PRIMARY KEY REFERENCES assignment_submissions(id) ON DELETE CASCADE,
  content TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Submission Files (Any File Type)
CREATE TABLE submission_files (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  submission_id UUID REFERENCES assignment_submissions(id) ON DELETE CASCADE,
  file_path TEXT NOT NULL, -- Supabase Storage path
  file_type TEXT,
  file_size BIGINT,
  uploaded_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_submission_files_submission ON submission_files(submission_id);

-- ============================================
-- 6. SCORING, GRADES & RANKING
-- ============================================

-- Scores (Per Submission)
CREATE TABLE scores (
  submission_id UUID PRIMARY KEY REFERENCES assignment_submissions(id) ON DELETE CASCADE,
  score NUMERIC(5,2) NOT NULL,
  feedback TEXT,
  graded_by UUID REFERENCES users(id),
  graded_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_scores_graded_by ON scores(graded_by);

-- Final Grades (Per Subject)
CREATE TABLE grades (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id UUID REFERENCES users(id),
  class_id UUID REFERENCES classes(id),
  subject_id UUID REFERENCES subjects(id),
  final_score NUMERIC(5,2),
  grade_letter TEXT, -- A+, A, B+, etc.
  rank INTEGER,
  computed_at TIMESTAMP DEFAULT NOW(),
  UNIQUE (student_id, class_id, subject_id)
);

CREATE INDEX idx_grades_student ON grades(student_id);
CREATE INDEX idx_grades_class_subject ON grades(class_id, subject_id);

-- Ranking Snapshot (Analytics-Friendly)
CREATE TABLE ranking_snapshots (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  class_id UUID REFERENCES classes(id),
  subject_id UUID REFERENCES subjects(id),
  snapshot_date DATE DEFAULT CURRENT_DATE,
  ranking_data JSONB NOT NULL, -- [{"student_id": "...", "rank": 1, "score": 95.5}, ...]
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_ranking_snapshots_class ON ranking_snapshots(class_id);
CREATE INDEX idx_ranking_snapshots_date ON ranking_snapshots(snapshot_date);

-- ============================================
-- 7. ATTENDANCE SYSTEM
-- ============================================

-- Attendance Session
CREATE TABLE attendance_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  class_id UUID REFERENCES classes(id),
  session_date DATE NOT NULL,
  taken_by UUID REFERENCES users(id), -- Class monitor or teacher
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_attendance_sessions_class ON attendance_sessions(class_id);
CREATE INDEX idx_attendance_sessions_date ON attendance_sessions(session_date);

-- Attendance Records
CREATE TABLE attendance_records (
  session_id UUID REFERENCES attendance_sessions(id) ON DELETE CASCADE,
  student_id UUID REFERENCES users(id) ON DELETE CASCADE,
  status attendance_status NOT NULL,
  notes TEXT,
  PRIMARY KEY (session_id, student_id)
);

CREATE INDEX idx_attendance_records_student ON attendance_records(student_id);

-- ============================================
-- 8. LEARNING RESOURCES (Any File Type)
-- ============================================

-- Resource Metadata
CREATE TABLE learning_resources (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT,
  subject_id UUID REFERENCES subjects(id),
  uploaded_by UUID REFERENCES users(id),
  visibility visibility_scope DEFAULT 'class',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_learning_resources_subject ON learning_resources(subject_id);
CREATE INDEX idx_learning_resources_visibility ON learning_resources(visibility);

-- Resource Files
CREATE TABLE resource_files (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  resource_id UUID REFERENCES learning_resources(id) ON DELETE CASCADE,
  file_path TEXT NOT NULL, -- Supabase Storage path
  file_type TEXT,
  file_size BIGINT,
  uploaded_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_resource_files_resource ON resource_files(resource_id);

-- ============================================
-- 9. BEHAVIOR LOGS (Special Feature)
-- ============================================

CREATE TABLE behavior_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  submission_id UUID REFERENCES assignment_submissions(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL, -- "keystroke", "paste", "focus", "blur"
  payload JSONB NOT NULL, -- {"timestamp": "...", "char_count": 5, "position": 123, ...}
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_behavior_logs_submission ON behavior_logs(submission_id);
CREATE INDEX idx_behavior_logs_event_type ON behavior_logs(event_type);

-- ============================================
-- 10. ANNOUNCEMENTS
-- ============================================

CREATE TABLE announcements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  author_id UUID REFERENCES users(id),
  target_audience TEXT, -- "all", "students", "teachers", "class:{class_id}"
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_announcements_author ON announcements(author_id);
CREATE INDEX idx_announcements_created ON announcements(created_at DESC);

-- ============================================
-- 10A. MESSAGES
-- ============================================

CREATE TABLE message_threads (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  subject TEXT NOT NULL,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE message_thread_members (
  thread_id UUID REFERENCES message_threads(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  joined_at TIMESTAMP DEFAULT NOW(),
  PRIMARY KEY (thread_id, user_id)
);

CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  thread_id UUID REFERENCES message_threads(id) ON DELETE CASCADE,
  sender_id UUID REFERENCES users(id) ON DELETE CASCADE,
  body TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_message_threads_created_by ON message_threads(created_by);
CREATE INDEX idx_message_thread_members_user ON message_thread_members(user_id);
CREATE INDEX idx_messages_thread ON messages(thread_id);

-- ============================================
-- 10B. COLLABORATIONS
-- ============================================

CREATE TABLE collaboration_spaces (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  owner_id UUID REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE collaboration_members (
  space_id UUID REFERENCES collaboration_spaces(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  joined_at TIMESTAMP DEFAULT NOW(),
  PRIMARY KEY (space_id, user_id)
);

CREATE TABLE collaboration_posts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  space_id UUID REFERENCES collaboration_spaces(id) ON DELETE CASCADE,
  author_id UUID REFERENCES users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_collaboration_spaces_owner ON collaboration_spaces(owner_id);
CREATE INDEX idx_collaboration_members_user ON collaboration_members(user_id);
CREATE INDEX idx_collaboration_posts_space ON collaboration_posts(space_id);

-- ============================================
-- 11. ANALYTICS CACHE (Performance Optimization)
-- ============================================

CREATE TABLE analytics_cache (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  cache_key TEXT UNIQUE NOT NULL,
  cache_data JSONB NOT NULL,
  expires_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_analytics_cache_key ON analytics_cache(cache_key);
CREATE INDEX idx_analytics_cache_expires ON analytics_cache(expires_at);
