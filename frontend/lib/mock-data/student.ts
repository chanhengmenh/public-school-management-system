import type {
  DashboardStat,
  StudentClass,
  GradeOverviewItem,
  Assignment,
  StudentRoster,
  CourseDirectory,
  StudentData,
} from '@/types/school.types';

// ─── Student Database ────────────────────────────────────────────────

export const MOCK_STUDENTS_DB: Record<string, StudentData> = {
  alex_id: {
    name: 'Alex Student',
    initials: 'A',
    gradeLevel: 'Grade 11 · Science',
    gpa: '3.87',
    stats: [
      { id: 'gpa', value: '3.87', label: 'Overall GPA', trend: '↑ +0.12 this term', trendDirection: 'up' },
      { id: 'classes', value: '6', label: 'Active Classes', trend: 'All on track', trendDirection: 'up' },
      { id: 'attendance', value: '92%', label: 'Attendance', trend: '↓ 1 absence', trendDirection: 'down' },
      { id: 'tasks', value: '5', label: 'Pending Tasks', trend: '2 due this week', trendDirection: 'neutral' },
    ],
    todaysClasses: [
      { id: 'cls-physics-mon', subject: 'Physics', teacher: 'Mr. Tan Wei', room: 'Room 304', time: '8:00 AM', status: 'now' },
      { id: 'cls-math-mon', subject: 'Advanced Math', teacher: 'Ms. Nurul Huda', room: 'Room 201', time: '10:00 AM', status: 'next' },
      { id: 'cls-english-mon', subject: 'English Literature', teacher: 'Ms. Rachel Wong', room: 'Room 110', time: '1:00 PM', status: null },
      { id: 'cls-geo-mon', subject: 'Geography', teacher: 'Mr. Azman', room: 'Room 205', time: '3:00 PM', status: null },
    ],
    grades: [
      { subject: 'Physics', progress: 95, grade: 'A' },
      { subject: 'Math', progress: 90, grade: 'A-' },
      { subject: 'English', progress: 85, grade: 'B+' },
      { subject: 'Chemistry', progress: 96, grade: 'A' },
    ],
    assignments: [
      { id: 'asgn-1', subject: 'Physics', task: 'Lab Report — Refraction', done: false, due: 'Tomorrow', urgency: 'urgent' },
      { id: 'asgn-2', subject: 'Advanced Math', task: 'Chapter 7 Exercises', done: false, due: 'Wed', urgency: 'upcoming' },
      { id: 'asgn-3', subject: 'English Literature', task: 'Essay Draft — Hamlet', done: true, due: 'Done', urgency: 'done' },
      { id: 'asgn-4', subject: 'Geography', task: 'Climate Zones Poster', done: false, due: 'Fri', urgency: 'later' },
      { id: 'asgn-5', subject: 'Chemistry', task: 'Titration Lab Write-up', done: false, due: 'Next Mon', urgency: 'later' },
    ],
  },
  sarah_id: {
    name: 'Sarah Connor',
    initials: 'S',
    gradeLevel: 'Grade 10 · Arts',
    gpa: '3.95',
    stats: [
      { id: 'gpa', value: '3.95', label: 'Overall GPA', trend: '↑ +0.05 this term', trendDirection: 'up' },
      { id: 'classes', value: '5', label: 'Active Classes', trend: '1 High Priority', trendDirection: 'up' },
      { id: 'attendance', value: '98%', label: 'Attendance', trend: 'Perfect this month', trendDirection: 'up' },
      { id: 'tasks', value: '2', label: 'Pending Tasks', trend: '1 due tomorrow', trendDirection: 'neutral' },
    ],
    todaysClasses: [
      { id: 'cls-hist-mon', subject: 'History', teacher: 'Mrs. Davis', room: 'Room 101', time: '9:00 AM', status: 'now' },
      { id: 'cls-art-mon', subject: 'Art', teacher: 'Mr. Ross', room: 'Studio 2', time: '11:00 AM', status: 'next' },
      { id: 'cls-lit-mon', subject: 'English Literature', teacher: 'Ms. Rachel Wong', room: 'Room 110', time: '2:00 PM', status: null },
    ],
    grades: [
      { subject: 'History', progress: 98, grade: 'A+' },
      { subject: 'Art', progress: 100, grade: 'A+' },
      { subject: 'English', progress: 92, grade: 'A' },
    ],
    assignments: [
      { id: 'asgn-s1', subject: 'History', task: 'Research Paper', done: false, due: 'Tomorrow', urgency: 'urgent' },
      { id: 'asgn-s2', subject: 'Art', task: 'Portfolio Review', done: true, due: 'Done', urgency: 'done' },
    ],
  },
};

export function getStudentData(id: string): StudentData {
  return MOCK_STUDENTS_DB[id] ?? MOCK_STUDENTS_DB['alex_id'];
}

// ─── Legacy Exports for compatibility ────────────────────────────────

export const mockStudentDashboardStats = MOCK_STUDENTS_DB['alex_id'].stats;
export const mockStudentClasses = MOCK_STUDENTS_DB['alex_id'].todaysClasses;
export const mockStudentGrades = MOCK_STUDENTS_DB['alex_id'].grades;
export const mockStudentAssignments = MOCK_STUDENTS_DB['alex_id'].assignments;


// ─── Student Rosters (Attendance Draft) ──────────────────────────────

export const MOCK_ROSTERS_DB: Record<string, StudentRoster[]> = {
  class_11A: [
    { id: 1, classId: 'class_11A', name: 'Emma Wilson', avatar: 'E', status: 'Present' },
    { id: 2, classId: 'class_11A', name: 'Liam Chen', avatar: 'L', status: 'Present' },
    { id: 3, classId: 'class_11A', name: 'Olivia Garcia', avatar: 'O', status: 'Present' },
    { id: 4, classId: 'class_11A', name: 'Noah Patel', avatar: 'N', status: 'Present' },
    { id: 5, classId: 'class_11A', name: 'Ava Smith', avatar: 'A', status: 'Present' },
    { id: 6, classId: 'class_11A', name: 'William Jones', avatar: 'W', status: 'Present' },
  ],
  class_10B: [
    { id: 101, classId: 'class_10B', name: 'Sophia Lee', avatar: 'S', status: 'Present' },
    { id: 102, classId: 'class_10B', name: 'Jackson Moore', avatar: 'J', status: 'Present' },
    { id: 103, classId: 'class_10B', name: 'Isabella Taylor', avatar: 'I', status: 'Absent' },
    { id: 104, classId: 'class_10B', name: 'Lucas Martin', avatar: 'L', status: 'Late' },
  ],
};

export const mockStudentRoster: StudentRoster[] = MOCK_ROSTERS_DB['class_11A'];

// ─── Course Directory ────────────────────────────────────────────────
export const mockCourseDirectory: CourseDirectory[] = [
  { id: 'physics', name: 'Physics', teacher: 'Mr. Tan Wei', schedule: 'Mon/Wed/Fri', progress: 68, grade: 'A', nextClass: 'Mon 8:00 AM' },
  { id: 'advanced-math', name: 'Advanced Math', teacher: 'Ms. Sarah Lee', schedule: 'Tue/Thu', progress: 45, grade: 'B+', nextClass: 'Tue 10:00 AM' },
  { id: 'english-literature', name: 'English Literature', teacher: 'Mr. John Doe', schedule: 'Mon/Wed/Fri', progress: 82, grade: 'A-', nextClass: 'Wed 2:00 PM' },
  { id: 'chemistry', name: 'Chemistry', teacher: 'Dr. Alan Turing', schedule: 'Tue/Thu', progress: 50, grade: 'B', nextClass: 'Thu 11:30 AM' },
  { id: 'geography', name: 'Geography', teacher: 'Mrs. Smith', schedule: 'Mon/Wed', progress: 90, grade: 'A+', nextClass: 'Mon 1:00 PM' },
  { id: 'history', name: 'History', teacher: 'Mr. Brown', schedule: 'Tue/Thu/Fri', progress: 75, grade: 'A', nextClass: 'Tue 9:00 AM' },
];
