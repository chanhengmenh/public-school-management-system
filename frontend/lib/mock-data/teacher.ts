import type {
  TeacherData,
  TeacherStat,
  TeacherTodayClass,
  TeacherPendingGrading,
  TeacherClass,
  TeacherScheduleEvent,
  TeacherNotice,
} from '@/types/school.types';

// ─── Teacher 001 — Mr. Tan Wei (Physics) ─────────────────────────────

const tanStats: TeacherStat[] = [
  { id: 'subjects',  value: 4,   label: 'Subjects',  sublabel: 'Teaching', detail: '3 classes each' },
  { id: 'students',  value: 128, label: 'Total',      sublabel: 'Students', detail: '↑ 4 this term' },
  { id: 'grading',   value: 3,   label: 'Pending',    sublabel: 'Grading',  detail: '2 overdue' },
  { id: 'quizzes',   value: 1,   label: 'Active',     sublabel: 'Quiz',     detail: 'Closes 4 Jun' },
];

const tanTodaysClasses: TeacherTodayClass[] = [
  { id: 'tc-1', subject: 'Physics',  className: '11A', room: 'Room 302', students: 32, time: '8:00 AM',  duration: '1 hr 30 min', status: 'now' },
  { id: 'tc-2', subject: 'Physics',  className: '11B', room: 'Room 304', students: 30, time: '10:30 AM', duration: '1 hr 30 min', status: 'next' },
  { id: 'tc-3', subject: 'Lunch',    className: '',    room: 'Staff Canteen', students: 0, time: '12:00 PM', duration: '1 hr', status: 'break' },
  { id: 'tc-4', subject: 'Physics',  className: '10A', room: 'Room 201', students: 32, time: '1:00 PM',  duration: '2 hr',       status: 'upcoming' },
];

const tanPendingGrading: TeacherPendingGrading[] = [
  { id: 'pg-1', title: 'Unit 3: Kinematics Quiz',      subject: 'Physics', className: '11A', dueLabel: 'Overdue since 28 May', isOverdue: true,  submitted: 28, total: 32 },
  { id: 'pg-2', title: 'Lab Report: Simple Pendulum',   subject: 'Physics', className: '11B', dueLabel: 'Due today',           isOverdue: false, submitted: 15, total: 30 },
  { id: 'pg-3', title: "Worksheet: Newton's Laws",      subject: 'Physics', className: '10A', dueLabel: 'Due tomorrow',        isOverdue: false, submitted: 32, total: 32 },
  { id: 'pg-4', title: 'Term 1 Final Project Draft',    subject: 'Physics', className: '12A', dueLabel: 'Due 5 Jun',           isOverdue: false, submitted: 0,  total: 25 },
];

const tanClasses: TeacherClass[] = [
  { id: 'class-1', subject: 'Physics',           className: 'Class 11A', schedule: 'Mon / Wed / Fri', students: 32, hw: 2, quizzes: 1, avg: '88%', room: 'Room 304' },
  { id: 'class-2', subject: 'Advanced Physics',  className: 'Class 12A', schedule: 'Tue / Thu',       students: 28, hw: 1, quizzes: 0, avg: '92%', room: 'Room 305' },
  { id: 'class-3', subject: 'Physics',           className: 'Class 11B', schedule: 'Mon / Wed',       students: 30, hw: 0, quizzes: 2, avg: '85%', room: 'Room 304' },
  { id: 'class-4', subject: 'Intro to Physics',  className: 'Class 10A', schedule: 'Tue / Fri',       students: 35, hw: 3, quizzes: 1, avg: '78%', room: 'Room 201' },
];

/** Flat relational schedule — each entry is one event instance */
const tanSchedule: TeacherScheduleEvent[] = [
  // Physics 11A — Mon / Wed / Fri @ 8:00 AM
  { id: 'se-01', type: 'Class', day: 'Monday',    time: '8:00 AM',  subject: 'Physics 11A',       students: 32, room: 'Room 304', link: '/teacher/classes/class-1' },
  { id: 'se-02', type: 'Class', day: 'Wednesday',  time: '8:00 AM',  subject: 'Physics 11A',       students: 32, room: 'Room 304', link: '/teacher/classes/class-1' },
  { id: 'se-03', type: 'Class', day: 'Friday',    time: '8:00 AM',  subject: 'Physics 11A',       students: 32, room: 'Room 304', link: '/teacher/classes/class-1' },
  // Physics 11B — Tue / Thu @ 9:00 AM
  { id: 'se-04', type: 'Class', day: 'Tuesday',   time: '9:00 AM',  subject: 'Physics 11B',       students: 30, room: 'Room 304', link: '/teacher/classes/class-3' },
  { id: 'se-05', type: 'Class', day: 'Thursday',  time: '9:00 AM',  subject: 'Physics 11B',       students: 30, room: 'Room 304', link: '/teacher/classes/class-3' },
  // Intro Physics 10A — Tue / Thu @ 10:00 AM
  { id: 'se-06', type: 'Class', day: 'Tuesday',   time: '10:00 AM', subject: 'Intro Physics 10A', students: 35, room: 'Room 201', link: '/teacher/classes/class-4' },
  { id: 'se-07', type: 'Class', day: 'Thursday',  time: '10:00 AM', subject: 'Intro Physics 10A', students: 35, room: 'Room 201', link: '/teacher/classes/class-4' },
  // Adv. Physics 12A — Mon / Wed / Fri @ 11:00 AM
  { id: 'se-08', type: 'Class', day: 'Monday',    time: '11:00 AM', subject: 'Adv. Physics 12A',  students: 28, room: 'Room 305', link: '/teacher/classes/class-2' },
  { id: 'se-09', type: 'Class', day: 'Wednesday',  time: '11:00 AM', subject: 'Adv. Physics 12A',  students: 28, room: 'Room 305', link: '/teacher/classes/class-2' },
  { id: 'se-10', type: 'Class', day: 'Friday',    time: '11:00 AM', subject: 'Adv. Physics 12A',  students: 28, room: 'Room 305', link: '/teacher/classes/class-2' },
  // Meetings
  { id: 'se-11', type: 'Meeting', day: 'Monday',  time: '1:00 PM',  subject: 'Dept Meeting',      room: 'Conf. Room B' },
  { id: 'se-12', type: 'Meeting', day: 'Tuesday', time: '2:00 PM',  subject: 'Parent Conf.',      room: 'Meeting Rm A' },
  { id: 'se-13', type: 'Meeting', day: 'Friday',  time: '3:00 PM',  subject: 'Staff Meeting',     room: 'Auditorium' },
];

const tanNotices: TeacherNotice[] = [
  { id: 'n-1', title: 'Staff Meeting', message: 'Departmental meeting on Thursday 5 Jun, 4:00 PM in the staff room. Attendance compulsory.' },
];

// ─── Teacher 002 — Ms. Jean (Mathematics) ───────────────────────────

const leeStats: TeacherStat[] = [
  { id: 'subjects',  value: 3,  label: 'Subjects',  sublabel: 'Teaching', detail: '2 classes each' },
  { id: 'students',  value: 96, label: 'Total',      sublabel: 'Students', detail: '↑ 2 this term' },
  { id: 'grading',   value: 1,  label: 'Pending',    sublabel: 'Grading',  detail: '0 overdue' },
  { id: 'quizzes',   value: 2,  label: 'Active',     sublabel: 'Quiz',     detail: 'Closes 6 Jun' },
];

const leeTodaysClasses: TeacherTodayClass[] = [
  { id: 'tc-1', subject: 'Advanced Math',  className: '11A', room: 'Room 201', students: 32, time: '8:00 AM',  duration: '1 hr 30 min', status: 'now' },
  { id: 'tc-2', subject: 'Math',           className: '10B', room: 'Room 102', students: 34, time: '10:00 AM', duration: '1 hr 30 min', status: 'next' },
  { id: 'tc-3', subject: 'Lunch',          className: '',    room: 'Staff Canteen', students: 0, time: '12:00 PM', duration: '1 hr', status: 'break' },
  { id: 'tc-4', subject: 'Math',           className: '10A', room: 'Room 102', students: 30, time: '1:30 PM',  duration: '1 hr 30 min', status: 'upcoming' },
];

const leePendingGrading: TeacherPendingGrading[] = [
  { id: 'pg-1', title: 'Calculus Chapter 5 Test', subject: 'Advanced Math', className: '11A', dueLabel: 'Due tomorrow', isOverdue: false, submitted: 28, total: 32 },
];

const leeClasses: TeacherClass[] = [
  { id: 'class-5', subject: 'Advanced Math',  className: 'Class 11A', schedule: 'Mon / Wed / Thu', students: 32, hw: 1, quizzes: 1, avg: '91%', room: 'Room 201' },
  { id: 'class-6', subject: 'Math',           className: 'Class 10B', schedule: 'Mon / Wed',       students: 34, hw: 2, quizzes: 0, avg: '83%', room: 'Room 102' },
  { id: 'class-7', subject: 'Math',           className: 'Class 10A', schedule: 'Tue / Fri',       students: 30, hw: 0, quizzes: 1, avg: '86%', room: 'Room 102' },
];

const leeSchedule: TeacherScheduleEvent[] = [
  // Adv Math 11A — Mon / Wed / Thu @ 8:00 AM
  { id: 'se-01', type: 'Class', day: 'Monday',    time: '8:00 AM',  subject: 'Adv Math 11A', students: 32, room: 'Room 201', link: '/teacher/classes/class-5' },
  { id: 'se-02', type: 'Class', day: 'Wednesday',  time: '8:00 AM',  subject: 'Adv Math 11A', students: 32, room: 'Room 201', link: '/teacher/classes/class-5' },
  { id: 'se-03', type: 'Class', day: 'Thursday',  time: '8:00 AM',  subject: 'Adv Math 11A', students: 32, room: 'Room 201', link: '/teacher/classes/class-5' },
  // Math 10B — Mon / Wed @ 10:00 AM
  { id: 'se-04', type: 'Class', day: 'Monday',    time: '10:00 AM', subject: 'Math 10B',     students: 34, room: 'Room 102', link: '/teacher/classes/class-6' },
  { id: 'se-05', type: 'Class', day: 'Wednesday',  time: '10:00 AM', subject: 'Math 10B',     students: 34, room: 'Room 102', link: '/teacher/classes/class-6' },
  // Math 10A — Tue / Fri @ 1:00 PM
  { id: 'se-06', type: 'Class', day: 'Tuesday',   time: '1:00 PM',  subject: 'Math 10A',     students: 30, room: 'Room 102', link: '/teacher/classes/class-7' },
  { id: 'se-07', type: 'Class', day: 'Friday',    time: '1:00 PM',  subject: 'Math 10A',     students: 30, room: 'Room 102', link: '/teacher/classes/class-7' },
  // Staff Meeting
  { id: 'se-08', type: 'Meeting', day: 'Friday',  time: '3:00 PM',  subject: 'Staff Meeting', room: 'Auditorium' },
];

const leeNotices: TeacherNotice[] = [
  { id: 'n-1', title: 'Parent–Teacher Day', message: 'Reminder: Parent–Teacher Day is on 7 Jun. Please prepare individual progress reports for all students.' },
];

// ─── Database ────────────────────────────────────────────────────────

export const MOCK_TEACHERS_DB: Record<string, TeacherData> = {
  teacher_001: {
    name: 'Mr. Tan Wei',
    initials: 'TW',
    greeting: 'Good morning, Mr. Tan',
    stats: tanStats,
    todaysClasses: tanTodaysClasses,
    pendingGrading: tanPendingGrading,
    classes: tanClasses,
    schedule: tanSchedule,
    lunchTime: '12:00 PM',
    notices: tanNotices,
  },
  teacher_002: {
    name: 'Ms. Jean',
    initials: 'MJ',
    greeting: 'Good morning, Ms. Jean',
    stats: leeStats,
    todaysClasses: leeTodaysClasses,
    pendingGrading: leePendingGrading,
    classes: leeClasses,
    schedule: leeSchedule,
    lunchTime: '12:00 PM',
    notices: leeNotices,
    homeClass: {
      id: 'class_10A',
      name: '10-A',
    },
  },
};

/** Returns teacher data for the given teacher ID. Falls back to teacher_001. */
export const getTeacherData = (id: string): TeacherData =>
  MOCK_TEACHERS_DB[id] ?? MOCK_TEACHERS_DB['teacher_001'];
