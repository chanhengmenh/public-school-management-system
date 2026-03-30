import { mockClass10A } from './home-class';

export type AttendanceStatus = 'present' | 'absent' | 'late' | 'excused' | 'none';

export type MonthlyAttendance = Record<string, AttendanceStatus>; // day -> status
export type StudentAttendance = Record<string, MonthlyAttendance>; // yearMonth -> MonthlyAttendance

export interface StudentAttendanceProfile {
  id: string;
  studentId: string;
  name: string;
  avatar?: string;
  attendance: StudentAttendance;
}

export const generateMockAttendance = (): StudentAttendanceProfile[] => {
  return mockClass10A.map((student) => {
    const attendance: StudentAttendance = {};
    
    // Generate data for February and March 2026
    const months = ['2026-02', '2026-03'];
    
    months.forEach(month => {
        attendance[month] = {};
        const [yearStr, monthStr] = month.split('-');
        const year = parseInt(yearStr);
        const m = parseInt(monthStr);
        const daysInMonth = new Date(year, m, 0).getDate();

        for (let i = 1; i <= daysInMonth; i++) {
            const dayString = i.toString();
            const dateObj = new Date(year, m - 1, i);
            const dayOfWeek = dateObj.getDay();

            // Weekends
            if (dayOfWeek === 0 || dayOfWeek === 6) {
                attendance[month][dayString] = 'none';
                continue;
            }

            let status: AttendanceStatus = 'present';
            
            // Patterns
            if (student.studentId === 'STU-005' && dayOfWeek === 1) { 
                status = 'late';
            } else if (student.studentId === 'STU-012' && Math.random() > 0.6) {
                status = 'absent';
            } else if (student.studentId === 'STU-019' && Math.random() > 0.8) {
                status = 'excused';
            } else {
                const rand = Math.random();
                if (rand > 0.96) status = 'absent';
                else if (rand > 0.92) status = 'late';
                else if (rand > 0.89) status = 'excused';
            }
            attendance[month][dayString] = status;
        }
    });

    return {
      id: student.id,
      studentId: student.studentId,
      name: student.name,
      avatar: student.avatar,
      attendance: attendance
    };
  });
};

export const mockAttendance10A = generateMockAttendance();
