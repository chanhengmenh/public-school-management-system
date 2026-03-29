export interface School { id: string }

// ─── Student Dashboard ───────────────────────────────────────────────

export interface DashboardStat {
  id: string;
  value: string;
  label: string;
  trend: string;
  trendDirection: 'up' | 'down' | 'neutral';
}

export interface StudentClass {
  id: string;
  subject: string;
  teacher: string;
  room: string;
  time: string;
  status: 'now' | 'next' | null;
}

export interface GradeOverviewItem {
  subject: string;
  progress: number; // 0–100
  grade: string;
}

export interface Assignment {
  id: string;
  subject: string;
  task: string;
  done: boolean;
  due: string;
  urgency: 'urgent' | 'upcoming' | 'done' | 'later';
}

// ─── Student Attendance ──────────────────────────────────────────────

export type AttendanceStatus = 'Present' | 'Absent' | 'Late';

export interface StudentRoster {
  id: number;
  name: string;
  avatar: string;
  status: AttendanceStatus;
  classId: string;
}

// ─── Student Classes (Course Directory) ──────────────────────────────

export interface CourseDirectory {
  id: string;
  name: string;
  teacher: string;
  schedule: string;
  progress: number;
  grade: string;
  nextClass: string;
}

// ─── Student Schedule ────────────────────────────────────────────────

export type WeekDay = 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday';

export interface ScheduleEntry {
  id: number;
  classId: string;
  day: WeekDay;
  time: string;
  subject: string;
  teacher: string;
  room: string;
}

// ─── Notifications ───────────────────────────────────────────────────

export type NotificationIconType = 'announcement' | 'assignment' | 'alert' | 'grade' | 'general';

export interface Notification {
  id: number;
  recipientId: string | 'PUBLIC';
  title: string;
  message: string;
  sender: string;
  timestamp: string; // ISO 8601
  iconType: NotificationIconType;
  isRead: boolean;
}

// ─── Student Data Aggregate ──────────────────────────────────────────

export interface StudentData {
  name: string;
  initials: string;
  gradeLevel: string;
  gpa: string;
  stats: DashboardStat[];
  todaysClasses: StudentClass[];
  grades: GradeOverviewItem[];
  assignments: Assignment[];
}

// ─── Enrollment Data (Per Subject / Per User) ────────────────────────

export interface EnrollmentMaterial {
  id: number;
  title: string;
  type: string;
  size: string;
  iconName: string; // Map to lucide-react in the UI
  color: string;
  bg: string;
}

export interface EnrollmentWeek {
  title: string;
  items: EnrollmentMaterial[];
}

export interface EnrollmentData {
  userId: string;
  subjectId: string;
  subjectName: string;
  teacher: string;
  weeks: EnrollmentWeek[];
}