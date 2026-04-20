export interface ScorePoint {
  assignment_id: number;
  assignment_title: string;
  score: number;
  max_score: number;
  submitted_at: string;
}

export interface StudentScoreTrend {
  student_id: number;
  student_name: string;
  scores: ScorePoint[];
  average_score: number;
  total_assignments: number;
  weighted_average?: number | null;
  attendance_rate?: number;
  submission_rate?: number;
}

export interface GradeCategory {
  id: number;
  class_subject_id: number;
  name: string;
  weight: number; // 0.0–1.0
}

export interface SubjectAverage {
  subject_id: number;
  subject_name: string;
  average_score: number;
  min_score?: number;
  max_score?: number;
  pass_rate?: number;
  submission_count: number;
}

export interface ClassAnalytics {
  class_id: number;
  class_name: string;
  subject_averages: SubjectAverage[];
  overall_average: number;
}

export interface RankingEntry {
  rank: number;
  student_id: number;
  student_name: string;
  total_score: number;
  average_score: number;
  assignment_count: number;
}

export interface ClassRanking {
  class_id: number;
  class_name: string;
  academic_year: string;
  rankings: RankingEntry[];
}

export interface AdminOverview {
  total_users: number;
  total_students: number;
  total_teachers: number;
  total_assignments: number;
  total_submissions: number;
  submissions_today: number;
  average_system_score: number | null;
}

export interface Class {
  id: number;
  name: string;
  academic_year: string;
  home_teacher_id: number | null;
  home_teacher_name: string | null;
}

export interface Subject {
  id: number;
  name: string;
  code: string;
  description: string;
}

export interface SubmissionFile {
  id: number;
  submission_id: number;
  file_url: string;
  file_type?: string;
  original_filename?: string;
  uploaded_at: string;
}

export interface Submission {
  id: number;
  assignment_id: number;
  student_id: number;
  content?: string;
  submission_type: string;
  submitted_at: string;
  is_late: boolean;
  files: SubmissionFile[];
}

export interface ClassSubject {
  id: number;
  class_id: number;
  subject_id: number;
  teacher_id: number;
  class_name?: string;
  subject_name?: string;
  subject_code?: string;
  teacher_name?: string;
}

export interface Enrollment {
  id: number;
  student_id: number;
  class_id: number;
  class_name: string;
  academic_year: string;
}

export interface Assignment {
  id: number;
  title: string;
  description?: string;
  due_date?: string;
  class_subject_id: number;
  publisher_id: number;
  max_score: number;
  status: 'draft' | 'published' | 'closed';
  submission_type: 'text' | 'file' | 'both';
  created_at: string;
  category_id?: number | null;
  max_attempts?: number | null;
}
