import type { ScheduleEntry } from '@/types/school.types';

// ─── Schedule (Record keyed by classId) ──────────────────────────────
// Source: app/student/schedule/page.tsx

let _id = 0;
const entry = (
  classId: string,
  day: ScheduleEntry['day'],
  time: string,
  subject: string,
  teacher: string,
  room: string
): ScheduleEntry => ({ id: ++_id, classId, day, time, subject, teacher, room });

export const MOCK_SCHEDULES_DB: Record<string, ScheduleEntry[]> = {
  class_11A: [
    // ── 8:00 AM ──
    entry('class_11A', 'Monday',    '08:00 AM', 'Physics',       'Mr. Tan Wei',     'Room 304'),
    entry('class_11A', 'Wednesday', '08:00 AM', 'History',       'Mr. Brown',       'Room 102'),
    entry('class_11A', 'Thursday',  '08:00 AM', 'Advanced Math', 'Ms. Sarah Lee',   'Room 201'),
    entry('class_11A', 'Friday',    '08:00 AM', 'Physics',       'Mr. Tan Wei',     'Room 304'),
    // ── 9:00 AM ──
    entry('class_11A', 'Tuesday',   '09:00 AM', 'Chemistry',     'Dr. Alan Turing', 'Lab 2'),
    entry('class_11A', 'Friday',    '09:00 AM', 'English Lit',   'Mr. John Doe',    'Room 110'),
    // ── 10:00 AM ──
    entry('class_11A', 'Monday',    '10:00 AM', 'Advanced Math', 'Ms. Sarah Lee',   'Room 201'),
    entry('class_11A', 'Wednesday', '10:00 AM', 'English Lit',   'Mr. John Doe',    'Room 110'),
    entry('class_11A', 'Thursday',  '10:00 AM', 'Geography',     'Mrs. Smith',      'Room 205'),
    // ── 11:00 AM ──
    entry('class_11A', 'Monday',    '11:00 AM', 'Geography',     'Mrs. Smith',      'Room 205'),
    entry('class_11A', 'Tuesday',   '11:00 AM', 'Physics',       'Mr. Tan Wei',     'Room 304'),
    entry('class_11A', 'Thursday',  '11:00 AM', 'Chemistry',     'Dr. Alan Turing', 'Lab 2'),
    entry('class_11A', 'Friday',    '11:00 AM', 'History',       'Mr. Brown',       'Room 102'),
    // ── 1:00 PM ──
    entry('class_11A', 'Monday',    '01:00 PM', 'English Lit',   'Mr. John Doe',    'Room 110'),
    entry('class_11A', 'Wednesday', '01:00 PM', 'Geography',     'Mrs. Smith',      'Room 205'),
    entry('class_11A', 'Friday',    '01:00 PM', 'Advanced Math', 'Ms. Sarah Lee',   'Room 201'),
    // ── 2:00 PM ──
    entry('class_11A', 'Tuesday',   '02:00 PM', 'Advanced Math', 'Ms. Sarah Lee',   'Room 201'),
    entry('class_11A', 'Wednesday', '02:00 PM', 'Chemistry',     'Dr. Alan Turing', 'Lab 2'),
    entry('class_11A', 'Thursday',  '02:00 PM', 'Physics',       'Mr. Tan Wei',     'Room 304'),
    // ── 3:00 PM ──
    entry('class_11A', 'Wednesday', '03:00 PM', 'History',       'Mr. Brown',       'Room 102'),
    entry('class_11A', 'Friday',    '03:00 PM', 'Geography',     'Mrs. Smith',      'Room 205'),
  ],
  class_10B: [
    // ── 8:00 AM ──
    entry('class_10B', 'Monday',    '08:00 AM', 'English Lit',   'Ms. Rachel Wong', 'Room 110'),
    entry('class_10B', 'Wednesday', '08:00 AM', 'Art',           'Mr. Ross',        'Studio 2'),
    entry('class_10B', 'Friday',    '08:00 AM', 'History',       'Mrs. Davis',      'Room 101'),
    // ── 9:00 AM ──
    entry('class_10B', 'Tuesday',   '09:00 AM', 'History',       'Mrs. Davis',      'Room 101'),
    entry('class_10B', 'Thursday',  '09:00 AM', 'Art',           'Mr. Ross',        'Studio 2'),
    // ── 10:00 AM ──
    entry('class_10B', 'Monday',    '10:00 AM', 'Art',           'Mr. Ross',        'Studio 2'),
    entry('class_10B', 'Wednesday', '10:00 AM', 'Biology',       'Dr. Evans',       'Lab 3'),
    // ── 11:00 AM ──
    entry('class_10B', 'Tuesday',   '11:00 AM', 'English Lit',   'Ms. Rachel Wong', 'Room 110'),
    entry('class_10B', 'Thursday',  '11:00 AM', 'Biology',       'Dr. Evans',       'Lab 3'),
    entry('class_10B', 'Friday',    '11:00 AM', 'Art',           'Mr. Ross',        'Studio 2'),
    // ── 1:00 PM ──
    entry('class_10B', 'Monday',    '01:00 PM', 'Biology',       'Dr. Evans',       'Lab 3'),
    entry('class_10B', 'Wednesday', '01:00 PM', 'History',       'Mrs. Davis',      'Room 101'),
    // ── 2:00 PM ──
    entry('class_10B', 'Tuesday',   '02:00 PM', 'Art',           'Mr. Ross',        'Studio 2'),
    entry('class_10B', 'Thursday',  '02:00 PM', 'English Lit',   'Ms. Rachel Wong', 'Room 110'),
    // ── 3:00 PM ──
    entry('class_10B', 'Friday',    '03:00 PM', 'Biology',       'Dr. Evans',       'Lab 3'),
  ]
};

// Legacy Export for older screens that might not have transitioned yet
export const mockScheduleEntries = MOCK_SCHEDULES_DB['class_11A'];
