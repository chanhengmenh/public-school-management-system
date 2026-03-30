import { 
    Users, 
    GraduationCap, 
    BookOpen, 
    ShieldCheck, 
    AlertCircle, 
    UserPlus, 
    Settings, 
    FileText,
    UserCheck
} from 'lucide-react';

// ==========================================
// TYPES & INTERFACES
// ==========================================

// --- Users ---
export interface SystemUser {
    id: string;
    name: string;
    email: string;
    role: 'Student' | 'Teacher' | 'Admin';
    status: 'Active' | 'Suspended';
    departmentOrClass?: string;
    avatar?: string;
}

// --- Dashboard ---
export type ActivityType = 'enrollment' | 'security' | 'class' | 'system' | 'grade';

// --- Announcements ---
export type Severity = 'info' | 'warning' | 'urgent';
export type Status = 'active' | 'scheduled' | 'expired';

export interface Announcement {
    id: string;
    title: string;
    message: string;
    severity: Severity;
    audience: string;
    startDate: string;
    endDate: string;
    status: Status;
}

// --- Classes ---
export type ClassStatus = 'Active' | 'Draft';

export interface ClassFormData {
    courseCode: string;
    subject: string;
    section: string;
    teacher: string | null;
    students: string[] | number;
}

export const deriveClassStatus = (data: Partial<ClassFormData>): ClassStatus => {
    const isDetailsComplete = !!(data.courseCode?.trim() && data.subject?.trim() && data.section?.trim());
    const isTeacherComplete = !!data.teacher;
    const isPeopleComplete = Array.isArray(data.students) ? data.students.length > 0 : (data.students || 0) > 0;
    return (isDetailsComplete && isTeacherComplete && isPeopleComplete) ? 'Active' : 'Draft';
};

export interface ClassRecord {
    id: string;
    courseCode: string;
    subject: string;
    section: string;
    teacher: string | null;
    enrolled: number;
    capacity: number;
    room: string;
    schedule: string;
    status: ClassStatus;
}

export interface StudentRecord {
    id: string;
    name: string;
    grade: string;
}

// --- Settings ---
export interface Semester {
    id: string;
    name: string;
    startDate: string;
    endDate: string;
    isActive: boolean;
}

export interface Period {
    id: string;
    name: string;
    startTime: string;
    endTime: string;
    type: "Class" | "Break";
}

// --- Timetable ---
export type DayOfWeek = 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday';
export type ViewMode = 'Class' | 'Teacher' | 'Room';

export interface ScheduleBlock {
    id: string;
    day: DayOfWeek;
    startTime: string;
    endTime: string;
    subject: string;
    teacher: string;
    targetClass: string;
    room: string;
    status: 'draft' | 'published';
    semester: string;
}

// ==========================================
// MOCK DATA
// ==========================================

// --- Users Data ---
const MOCK_USERS: SystemUser[] = [
    { id: 'usr_1', name: 'Admin Principal', email: 'principal@school.edu', role: 'Admin', status: 'Active' },
    { id: 'usr_2', name: 'Mr. Tan Wei', email: 'tan.wei@school.edu', role: 'Teacher', status: 'Active', departmentOrClass: 'Physics Dept' },
    { id: 'usr_3', name: 'Ms. Sarah Lee', email: 'sarah.lee@school.edu', role: 'Teacher', status: 'Active', departmentOrClass: 'Math Dept' },
    { id: 'usr_4', name: 'Dr. Marcus Rivera', email: 'marcus.r@school.edu', role: 'Teacher', status: 'Suspended', departmentOrClass: 'History Dept' },
    { id: 'usr_5', name: 'Emily Chen', email: 'emily.c@student.edu', role: 'Student', status: 'Active', departmentOrClass: 'Grade 11A' },
    { id: 'usr_6', name: 'Alex Johnson', email: 'alex.j@student.edu', role: 'Student', status: 'Active', departmentOrClass: 'Grade 11B' },
    { id: 'usr_7', name: 'Michael Brown', email: 'michael.b@student.edu', role: 'Student', status: 'Active', departmentOrClass: 'Grade 10A' },
    { id: 'usr_8', name: 'Sarah Wilson', email: 'sarah.w@student.edu', role: 'Student', status: 'Suspended', departmentOrClass: 'Grade 12A' },
];

// --- Dashboard Data ---
const kpiData = [
    { title: 'Total Students', value: '1,245', trend: '+12 this month', trendColor: 'text-emerald-600', icon: Users, iconBg: 'bg-blue-50', iconColor: 'text-blue-600', borderAccent: 'border-t-blue-500' },
    { title: 'Total Teachers', value: '84', trend: '+3 this month', trendColor: 'text-emerald-600', icon: GraduationCap, iconBg: 'bg-violet-50', iconColor: 'text-violet-600', borderAccent: 'border-t-violet-500' },
    { title: 'Active Classes', value: '112', trend: '+8 this semester', trendColor: 'text-emerald-600', icon: BookOpen, iconBg: 'bg-amber-50', iconColor: 'text-amber-600', borderAccent: 'border-t-amber-500' },
    { title: 'System Health', value: '99.9%', trend: 'Uptime · All systems go', trendColor: 'text-emerald-600', icon: ShieldCheck, iconBg: 'bg-emerald-50', iconColor: 'text-emerald-600', borderAccent: 'border-t-emerald-500' },
];

const activityData: { id: number; type: ActivityType; text: string; timestamp: string; status: 'success' | 'warning' | 'info' }[] = [
    { id: 1, type: 'enrollment', text: 'New student enrolled: John Doe (Grade 10)', timestamp: '5 mins ago', status: 'success' },
    { id: 2, type: 'security', text: 'Teacher password reset requested: Ms. Sarah Lee', timestamp: '23 mins ago', status: 'warning' },
    { id: 3, type: 'class', text: 'New class created: Advanced Biology (Grade 12)', timestamp: '1 hour ago', status: 'info' },
    { id: 4, type: 'grade', text: 'Grade report published: Physics 11A Mid-Term', timestamp: '2 hours ago', status: 'success' },
    { id: 5, type: 'enrollment', text: 'Student transfer processed: Emily Chen → Grade 11B', timestamp: '3 hours ago', status: 'info' },
    { id: 6, type: 'system', text: 'System backup completed successfully', timestamp: '5 hours ago', status: 'success' },
];

const pendingRequests = [
    { id: 1, text: '3 Teachers awaiting account approval', icon: UserPlus, severity: 'text-amber-700' },
    { id: 2, text: '1 System update pending installation', icon: AlertCircle, severity: 'text-red-700' },
    { id: 3, text: '5 Student transfers need review', icon: Users, severity: 'text-amber-700' },
];

// --- Announcements Data ---
export const AUDIENCES = ['Global', 'All Teachers', 'All Students', 'Grade 10A', 'Grade 10B', 'Grade 11A', 'Grade 12A'];

const MOCK_ANNOUNCEMENTS: Announcement[] = [
    { id: 'ann_1', title: 'Water Main Break — Block B Closed', message: 'Due to an emergency pipe burst, Block B classrooms (Room 201–210) are closed until further notice. All affected classes will be relocated to the library and auditorium.', severity: 'urgent', audience: 'Global', startDate: '2026-03-17', endDate: '2026-03-20', status: 'active' },
    { id: 'ann_2', title: 'Mr. Sok Absent — Substitute Assigned', message: 'Mr. Sok will be absent on March 19. Ms. Chea will cover Grade 10A Mathematics and Grade 10B Physics.', severity: 'warning', audience: 'Grade 10A', startDate: '2026-03-19', endDate: '2026-03-19', status: 'scheduled' },
    { id: 'ann_3', title: 'Water Festival Holiday — School Closed', message: 'School will be closed from April 13–16 for the Khmer New Year / Water Festival. Classes resume on April 17.', severity: 'info', audience: 'Global', startDate: '2026-04-13', endDate: '2026-04-16', status: 'scheduled' },
    { id: 'ann_4', title: 'Last Day for Semester 2 Registration', message: 'All students must complete their Semester 2 elective registration by March 10. Late submissions will not be accepted.', severity: 'info', audience: 'All Students', startDate: '2026-03-01', endDate: '2026-03-10', status: 'expired' },
];

// --- Classes Data ---
const CLASSES_DATA: ClassRecord[] = [
    { id: 'c1', courseCode: 'PHY-101', subject: 'Physics', section: '11A', teacher: 'Mr. Tan Wei', enrolled: 28, capacity: 32, room: 'Room 304', schedule: 'Mon/Wed/Fri 08:00 AM', status: 'Active' },
    { id: 'c2', courseCode: 'MAT-201', subject: 'Advanced Math', section: '12B', teacher: 'Ms. Sarah Lee', enrolled: 30, capacity: 30, room: 'Room 210', schedule: 'Tue/Thu 10:00 AM', status: 'Active' },
    { id: 'c3', courseCode: 'ENG-105', subject: 'Literature', section: '10A', teacher: null, enrolled: 15, capacity: 25, room: 'Room 105', schedule: 'Mon/Wed 01:00 PM', status: 'Draft' },
    { id: 'c4', courseCode: 'HIS-102', subject: 'World History', section: '11B', teacher: 'Dr. Marcus Rivera', enrolled: 22, capacity: 28, room: 'Room 401', schedule: 'Tue/Fri 09:30 AM', status: 'Active' },
    { id: 'c5', courseCode: 'CHE-301', subject: 'Chemistry Lab', section: '12A', teacher: 'Ms. Priya Nair', enrolled: 24, capacity: 24, room: 'Lab 2', schedule: 'Thu 02:00 PM', status: 'Active' },
];

const AVAILABLE_STUDENTS: StudentRecord[] = [
    { id: 's1', name: 'Alex Johnson', grade: '11th Grade' },
    { id: 's2', name: 'Emily Chen', grade: '11th Grade' },
    { id: 's3', name: 'Michael Brown', grade: '10th Grade' },
    { id: 's4', name: 'Sarah Wilson', grade: '12th Grade' },
    { id: 's5', name: 'David Lee', grade: '11th Grade' },
    { id: 's6', name: 'Jessica Taylor', grade: '10th Grade' },
];

// --- Settings Data ---
const initialGeneralInfo = {
    schoolName: "Springfield High School",
    email: "admin@springfieldhigh.edu",
    phone: "+1 (555) 123-4567",
    address: "123 Education Lane, Springfield, IL 62701",
    language: "en-US",
};

const initialSemesters: Semester[] = [
    { id: "1", name: "Fall 2026", startDate: "2026-08-20", endDate: "2026-12-18", isActive: true },
    { id: "2", name: "Spring 2027", startDate: "2027-01-11", endDate: "2027-05-28", isActive: false },
];

const initialPeriods: Period[] = [
    { id: "1", name: "Homeroom", startTime: "08:00", endTime: "08:15", type: "Class" },
    { id: "2", name: "Period 1", startTime: "08:20", endTime: "09:10", type: "Class" },
    { id: "3", name: "Morning Break", startTime: "09:10", endTime: "09:25", type: "Break" },
];

const initialSystemAccess = {
    maintenanceMode: false,
    allowStudentLogins: true,
    emailNotifications: true
};

// --- Timetable Data ---
const TIMETABLE_CLASSES = ['Grade 10A', 'Grade 10B', 'Grade 11A', 'Grade 12A'];
const TIMETABLE_TEACHERS = ['Mr. Tan Wei', 'Ms. Sarah Lee', 'Dr. Marcus Rivera'];
const TIMETABLE_ROOMS = ['Room 304', 'Room 210', 'Room 105', 'Lab 2'];
const TIMETABLE_SUBJECTS = ['Physics (PHY-101)', 'Advanced Math (MAT-201)'];
const TIMETABLE_SEMESTERS = ['Semester 1', 'Semester 2'];
const TIMETABLE_BLOCKS: ScheduleBlock[] = [];


// ==========================================
// GETTER FUNCTIONS
// ==========================================

export const getSystemUsers = () => MOCK_USERS;

export const getAdminDashboardData = () => {
    return { kpiData, activityData, pendingRequests };
};

export const getAnnouncements = () => MOCK_ANNOUNCEMENTS;

export const getClassesData = () => {
    return { classes: CLASSES_DATA, availableStudents: AVAILABLE_STUDENTS };
};

export const getGlobalSettings = () => {
    return { 
        generalInfo: initialGeneralInfo, 
        semesters: initialSemesters, 
        periods: initialPeriods, 
        systemAccess: initialSystemAccess 
    };
};

export const getTimetableData = () => {
    return { 
        classes: TIMETABLE_CLASSES, 
        teachers: TIMETABLE_TEACHERS, 
        rooms: TIMETABLE_ROOMS, 
        subjects: TIMETABLE_SUBJECTS, 
        semesters: TIMETABLE_SEMESTERS, 
        blocks: TIMETABLE_BLOCKS 
    };
};
