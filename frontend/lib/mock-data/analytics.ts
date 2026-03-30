// ─── Analytics Mock Data ─────────────────────────────────────────────
// Deterministic data — no Math.random() so the UI is stable across refreshes.

export const SUBJECTS = ['Mathematics', 'Physics', 'Chemistry', 'Biology', 'English', 'History', 'Art'] as const;
export type SubjectName = (typeof SUBJECTS)[number];

export const MONTHS = ['Oct', 'Nov', 'Dec', 'Jan', 'Feb'] as const;
export type MonthName = (typeof MONTHS)[number];

// ─── KPIs ────────────────────────────────────────────────────────────

export interface AnalyticsKpis {
  classAverage: number;
  highestSubject: { name: string; avg: number };
  needsSupport: { name: string; avg: number };
  atRiskCount: number;
}

// ─── Student Matrix ──────────────────────────────────────────────────

export interface StudentMatrixRow {
  id: string;
  name: string;
  scores: Record<SubjectName, number>;
}

// 20 students × 7 subjects — fully deterministic
export const studentMatrixData: StudentMatrixRow[] = [
  { id: 's01', name: 'Alex Johnson',       scores: { Mathematics: 95, Physics: 88, Chemistry: 92, Biology: 85, English: 90, History: 89, Art: 94 } },
  { id: 's02', name: 'Sarah Williams',     scores: { Mathematics: 78, Physics: 65, Chemistry: 72, Biology: 80, English: 91, History: 85, Art: 88 } },
  { id: 's03', name: 'Michael Brown',      scores: { Mathematics: 62, Physics: 58, Chemistry: 64, Biology: 70, English: 75, History: 68, Art: 72 } },
  { id: 's04', name: 'Emily Davis',        scores: { Mathematics: 98, Physics: 95, Chemistry: 96, Biology: 97, English: 92, History: 94, Art: 99 } },
  { id: 's05', name: 'David Wilson',       scores: { Mathematics: 80, Physics: 74, Chemistry: 78, Biology: 82, English: 86, History: 79, Art: 83 } },
  { id: 's06', name: 'Jessica Garcia',     scores: { Mathematics: 92, Physics: 89, Chemistry: 91, Biology: 94, English: 95, History: 96, Art: 90 } },
  { id: 's07', name: 'James Martinez',     scores: { Mathematics: 55, Physics: 60, Chemistry: 58, Biology: 63, English: 67, History: 62, Art: 70 } },
  { id: 's08', name: 'Sophia Taylor',      scores: { Mathematics: 88, Physics: 85, Chemistry: 86, Biology: 90, English: 91, History: 89, Art: 92 } },
  { id: 's09', name: 'William Anderson',   scores: { Mathematics: 91, Physics: 93, Chemistry: 89, Biology: 88, English: 85, History: 87, Art: 82 } },
  { id: 's10', name: 'Olivia Thomas',      scores: { Mathematics: 96, Physics: 94, Chemistry: 98, Biology: 96, English: 93, History: 91, Art: 95 } },
  { id: 's11', name: 'Ethan Jackson',      scores: { Mathematics: 68, Physics: 64, Chemistry: 66, Biology: 71, English: 73, History: 69, Art: 75 } },
  { id: 's12', name: 'Ava White',          scores: { Mathematics: 89, Physics: 90, Chemistry: 88, Biology: 85, English: 91, History: 93, Art: 94 } },
  { id: 's13', name: 'Daniel Harris',      scores: { Mathematics: 74, Physics: 68, Chemistry: 71, Biology: 76, English: 79, History: 73, Art: 77 } },
  { id: 's14', name: 'Mia Martin',         scores: { Mathematics: 97, Physics: 95, Chemistry: 97, Biology: 93, English: 96, History: 95, Art: 98 } },
  { id: 's15', name: 'Matthew Thompson',   scores: { Mathematics: 60, Physics: 55, Chemistry: 62, Biology: 65, English: 70, History: 63, Art: 67 } },
  { id: 's16', name: 'Isabella Garcia',    scores: { Mathematics: 84, Physics: 82, Chemistry: 80, Biology: 86, English: 88, History: 85, Art: 87 } },
  { id: 's17', name: 'Joseph Robinson',    scores: { Mathematics: 71, Physics: 66, Chemistry: 69, Biology: 73, English: 76, History: 70, Art: 74 } },
  { id: 's18', name: 'Charlotte Clark',    scores: { Mathematics: 94, Physics: 92, Chemistry: 95, Biology: 96, English: 98, History: 97, Art: 95 } },
  { id: 's19', name: 'David Lewis',        scores: { Mathematics: 77, Physics: 72, Chemistry: 75, Biology: 79, English: 82, History: 76, Art: 80 } },
  { id: 's20', name: 'Amelia Lee',         scores: { Mathematics: 99, Physics: 97, Chemistry: 96, Biology: 94, English: 95, History: 92, Art: 98 } },
];

// ─── Derived KPIs ────────────────────────────────────────────────────

function computeKpis(): AnalyticsKpis {
  const subjectTotals: Record<string, number> = {};
  const subjectMax: Record<string, number> = {};
  SUBJECTS.forEach(s => { subjectTotals[s] = 0; subjectMax[s] = 0; });

  let grandTotal = 0;
  let grandCount = 0;
  let atRisk = 0;

  studentMatrixData.forEach(student => {
    let studentTotal = 0;
    SUBJECTS.forEach(sub => {
      const score = student.scores[sub];
      subjectTotals[sub] += score;
      if (score > subjectMax[sub]) subjectMax[sub] = score;
      studentTotal += score;
      grandTotal += score;
      grandCount++;
    });
    const studentAvg = studentTotal / SUBJECTS.length;
    if (studentAvg < 70) atRisk++;
  });

  const subjectAverages = SUBJECTS.map(s => ({
    name: s,
    avg: Number((subjectTotals[s] / studentMatrixData.length).toFixed(1)),
  }));

  const sorted = [...subjectAverages].sort((a, b) => b.avg - a.avg);
  const highest = sorted[0];
  const lowest = sorted[sorted.length - 1];

  return {
    classAverage: Number((grandTotal / grandCount).toFixed(1)),
    highestSubject: highest,
    needsSupport: lowest,
    atRiskCount: atRisk,
  };
}

export const analyticsKpis: AnalyticsKpis = computeKpis();

// ─── Subject View Helpers ────────────────────────────────────────────

export interface SubjectBarData {
  subject: string;
  classAvg: number;
  topScore: number;
}

export interface StudentBlockData {
  id: string;
  name: string;
  scores: { subject: string; score: number; color: string }[];
}

const SUBJECT_COLORS: Record<SubjectName, string> = {
  Mathematics: '#6366f1', // indigo
  Physics:     '#f59e0b', // amber
  Chemistry:   '#10b981', // emerald
  Biology:     '#ec4899', // pink
  English:     '#3b82f6', // blue
  History:     '#8b5cf6', // violet
  Art:         '#f97316', // orange
};

export function getSubjectBarData(): SubjectBarData[] {
  return SUBJECTS.map(sub => {
    let total = 0;
    let max = 0;
    studentMatrixData.forEach(s => {
      const sc = s.scores[sub];
      total += sc;
      if (sc > max) max = sc;
    });
    return { subject: sub, classAvg: Number((total / studentMatrixData.length).toFixed(1)), topScore: max };
  });
}

export function getStudentBlockData(): StudentBlockData[] {
  return studentMatrixData.map(s => ({
    id: s.id,
    name: s.name,
    scores: SUBJECTS.map(sub => ({
      subject: sub,
      score: s.scores[sub],
      color: SUBJECT_COLORS[sub],
    })),
  }));
}

export function getRadarData(): { subject: string; value: number }[] {
  return SUBJECTS.map(sub => {
    const total = studentMatrixData.reduce((acc, s) => acc + s.scores[sub], 0);
    return { subject: sub, value: Number((total / studentMatrixData.length).toFixed(1)) };
  });
}

// ─── Attendance Data ─────────────────────────────────────────────────

export type AttendanceStatus = 'present' | 'absent_excused' | 'absent_unexcused' | 'late';

export interface StudentMonthAttendance {
  studentId: string;
  studentName: string;
  month: MonthName;
  status: AttendanceStatus;
}

// deterministic attendance for 20 students × 5 months (simplified to 20 "school days" per month,
// we store a summary count rather than day-by-day for chart purposes)
export interface StudentAttendanceSummary {
  studentId: string;
  studentName: string;
  months: Record<MonthName, { present: number; absent_excused: number; absent_unexcused: number; late: number; total: number }>;
}

function buildAttendanceData(): StudentAttendanceSummary[] {
  // Deterministic — we use a seeded pattern per student/month
  const TOTAL_DAYS = 20;
  const patterns: Record<string, Record<MonthName, [number, number, number, number]>> = {};

  studentMatrixData.forEach((s, i) => {
    const base: Record<MonthName, [number, number, number, number]> = {
      Oct: [17, 1, 1, 1],
      Nov: [16, 1, 1, 2],
      Dec: [15, 2, 1, 2],
      Jan: [18, 0, 1, 1],
      Feb: [17, 1, 1, 1],
    };

    // Create variations per student
    if (i % 5 === 0) {
      // high achievers — great attendance
      base.Oct = [19, 0, 0, 1]; base.Nov = [20, 0, 0, 0]; base.Dec = [18, 1, 0, 1]; base.Jan = [19, 1, 0, 0]; base.Feb = [20, 0, 0, 0];
    } else if (i % 5 === 1) {
      // decent
      base.Oct = [17, 1, 1, 1]; base.Nov = [16, 2, 1, 1]; base.Dec = [15, 2, 1, 2]; base.Jan = [17, 1, 1, 1]; base.Feb = [18, 0, 1, 1];
    } else if (i % 5 === 2) {
      // struggling attendance
      base.Oct = [14, 2, 2, 2]; base.Nov = [13, 2, 3, 2]; base.Dec = [12, 3, 3, 2]; base.Jan = [14, 2, 2, 2]; base.Feb = [15, 2, 1, 2];
    } else if (i % 5 === 3) {
      // mostly present but late
      base.Oct = [15, 0, 0, 5]; base.Nov = [14, 1, 0, 5]; base.Dec = [15, 0, 1, 4]; base.Jan = [16, 0, 0, 4]; base.Feb = [15, 0, 0, 5];
    } else {
      // average
      base.Oct = [16, 1, 1, 2]; base.Nov = [17, 1, 1, 1]; base.Dec = [16, 2, 1, 1]; base.Jan = [18, 0, 1, 1]; base.Feb = [17, 1, 1, 1];
    }

    patterns[s.id] = base;
  });

  return studentMatrixData.map(s => ({
    studentId: s.id,
    studentName: s.name,
    months: Object.fromEntries(
      MONTHS.map(m => {
        const [present, absent_excused, absent_unexcused, late] = patterns[s.id][m];
        return [m, { present, absent_excused, absent_unexcused, late, total: TOTAL_DAYS }];
      })
    ) as StudentAttendanceSummary['months'],
  }));
}

export const attendanceData: StudentAttendanceSummary[] = buildAttendanceData();

// ─── Attendance Summary Per Month ────────────────────────────────────

export interface MonthSummary {
  month: MonthName;
  attendanceRate: number;
  totalAbsences: number;
  totalLate: number;
}

export function getMonthlyAttendanceSummary(): MonthSummary[] {
  return MONTHS.map(month => {
    let totalPresent = 0;
    let totalDays = 0;
    let totalAbsences = 0;
    let totalLate = 0;

    attendanceData.forEach(s => {
      const m = s.months[month];
      totalPresent += m.present;
      totalDays += m.total;
      totalAbsences += m.absent_excused + m.absent_unexcused;
      totalLate += m.late;
    });

    return {
      month,
      attendanceRate: Number(((totalPresent / totalDays) * 100).toFixed(1)),
      totalAbsences,
      totalLate,
    };
  });
}

// ─── Line chart data ─────────────────────────────────────────────────

export interface AttendanceLinePoint {
  month: MonthName;
  presentPct: number;
  absentPct: number;
  latePct: number;
}

export function getAttendanceLineData(): AttendanceLinePoint[] {
  return MONTHS.map(month => {
    let present = 0, absent = 0, late = 0, total = 0;
    attendanceData.forEach(s => {
      const m = s.months[month];
      present += m.present;
      absent += m.absent_excused + m.absent_unexcused;
      late += m.late;
      total += m.total;
    });
    return {
      month,
      presentPct: Number(((present / total) * 100).toFixed(1)),
      absentPct: Number(((absent / total) * 100).toFixed(1)),
      latePct: Number(((late / total) * 100).toFixed(1)),
    };
  });
}

// ─── Stacked bar data ────────────────────────────────────────────────

export interface StackedBarMonth {
  month: MonthName;
  presentPct: number;
  absentExcusedPct: number;
  absentUnexcusedPct: number;
  latePct: number;
}

export function getStackedBarData(): StackedBarMonth[] {
  return MONTHS.map(month => {
    let present = 0, absExc = 0, absUnexc = 0, late = 0, total = 0;
    attendanceData.forEach(s => {
      const m = s.months[month];
      present += m.present;
      absExc += m.absent_excused;
      absUnexc += m.absent_unexcused;
      late += m.late;
      total += m.total;
    });
    return {
      month,
      presentPct: Number(((present / total) * 100).toFixed(1)),
      absentExcusedPct: Number(((absExc / total) * 100).toFixed(1)),
      absentUnexcusedPct: Number(((absUnexc / total) * 100).toFixed(1)),
      latePct: Number(((late / total) * 100).toFixed(1)),
    };
  });
}

// ─── Per-student attendance bar data ─────────────────────────────────

export interface StudentAttendanceBar {
  studentId: string;
  studentName: string;
  months: { month: MonthName; attendancePct: number }[];
  hasWarning: boolean;
}

export function getStudentAttendanceBars(): StudentAttendanceBar[] {
  return attendanceData.map(s => {
    const months = MONTHS.map(m => {
      const d = s.months[m];
      return { month: m, attendancePct: Number(((d.present / d.total) * 100).toFixed(1)) };
    });
    const hasWarning = months.some(m => m.attendancePct < 75);
    return { studentId: s.studentId, studentName: s.studentName, months, hasWarning };
  });
}

// ─── API Simulation Helpers ──────────────────────────────────────────

export function fetchSubjectData(view: string): Promise<{ view: string }> {
  return new Promise(resolve => {
    setTimeout(() => resolve({ view }), 300);
  });
}

export function fetchAttendanceByMonth(month: string): Promise<{ month: string }> {
  return new Promise(resolve => {
    setTimeout(() => resolve({ month }), 300);
  });
}
