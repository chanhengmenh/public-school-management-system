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

export type WeekDay = 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday';

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

// ─── Teacher Portal ──────────────────────────────────────────────────

export interface TeacherStat {
  id: string;
  value: number;
  label: string;
  sublabel: string;
  detail: string;
}

export interface TeacherClass {
  id: string;
  subject: string;
  className: string;
  schedule: string;
  students: number;
  hw: number;
  quizzes: number;
  avg: string;
  room: string;
}

export interface TeacherTodayClass {
  id: string;
  subject: string;
  className: string;
  room: string;
  students: number;
  time: string;
  duration: string;
  status: 'now' | 'next' | 'upcoming' | 'break';
}

export interface TeacherPendingGrading {
  id: string;
  title: string;
  subject: string;
  className: string;
  dueLabel: string;
  isOverdue: boolean;
  submitted: number;
  total: number;
}

export type TeacherScheduleBlockType = 'Class' | 'Prep' | 'Meeting';

export type TeacherScheduleDay = 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday';

/** Flat relational schedule event — one object per class/meeting instance */
export interface TeacherScheduleEvent {
  id: string;
  type: TeacherScheduleBlockType;
  day: TeacherScheduleDay;
  time: string;        // e.g. '8:00 AM'
  subject: string;
  students?: number;
  room: string;
  link?: string;
}

export interface TeacherNotice {
  id: string;
  title: string;
  message: string;
}

export interface TeacherData {
  name: string;
  initials: string;
  greeting: string;
  stats: TeacherStat[];
  todaysClasses: TeacherTodayClass[];
  pendingGrading: TeacherPendingGrading[];
  classes: TeacherClass[];
  schedule: TeacherScheduleEvent[];
  lunchTime: string;
  notices: TeacherNotice[];
  homeClass?: {
    id: string;
    name: string;
  };
}