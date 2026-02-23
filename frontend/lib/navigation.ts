import {
    LayoutDashboard,
    Users,
    BookOpen,
    Calendar,
    Settings,
    GraduationCap,
    ClipboardList,
    FileText,
    BarChart3,
    UserCircle,
    ShieldAlert,
    School,
    Warehouse,
    Megaphone,
    MessageSquare,
    CalendarCheck,
    Book,
    Scale,
    CircleCheckBig,
    SquarePen,
    Calendar1,
    Puzzle,
    CheckSquare,
    Folder,
    Layers,
    BarChart2,
    LineChart
} from "lucide-react";

export const navigation = {
    admin: [
        { name: "Dashboard", href: "/admin", icon: LayoutDashboard },
        { name: "Users", href: "/admin/users", icon: Users },
        { name: "Teachers", href: "/admin/teachers", icon: Users },
        { name: "Students", href: "/admin/students", icon: GraduationCap },
        { name: "Classes", href: "/admin/classes", icon: Warehouse },
        { name: "Subjects", href: "/admin/subjects", icon: BookOpen },
        { name: "Oversight", href: "/admin/oversight", icon: BarChart3 },
        { name: "Analytics", href: "/admin/analytics", icon: BarChart3 },
        { name: "School", href: "/admin/school", icon: School },
        { name: "Schedule", href: "/admin/schedule", icon: Calendar },
        { name: "Settings", href: "/admin/settings", icon: Settings },
    ],
    teacher: [
        {
            group: "Main",
            items: [
                { name: "Dashboard", href: "/teacher", icon: LayoutDashboard, color: "text-emerald-500" }
            ]
        },
        {
            group: "Classes",
            items: [
                { name: "My Classes", href: "/teacher/classes", icon: Folder, color: "text-yellow-500" },
                { name: "People", href: "/teacher/people", icon: Users, color: "text-indigo-500" }
            ]
        },
        {
            group: "Content",
            items: [
                { name: "Lessons", href: "/teacher/lessons", icon: Layers, color: "text-pink-500" },
                { name: "Assignments", href: "/teacher/assignments", icon: ClipboardList, color: "text-blue-400" },
                { name: "Quizzes", href: "/teacher/quizzes", icon: Puzzle, color: "text-lime-500" }
            ]
        },
        {
            group: "Assessment",
            items: [
                { name: "Grading", href: "/teacher/grading", icon: BarChart2, color: "text-indigo-400" },
                { name: "Attendance", href: "/teacher/attendance", icon: CheckSquare, color: "text-emerald-400" },
                { name: "Behavior", href: "/teacher/behavior", icon: ShieldAlert, color: "text-red-500" }
            ]
        },
        {
            group: "Communication",
            items: [
                { name: "Analytics", href: "/teacher/analytics", icon: LineChart, color: "text-blue-500" },
                { name: "Announcements", href: "/teacher/announcements", icon: Megaphone, color: "text-orange-400" },
                { name: "Discussions", href: "/teacher/discussion", icon: MessageSquare, color: "text-purple-300" }
            ]
        },
        {
            group: "Reference",
            items: [
                { name: "Schedule", href: "/teacher/schedule", icon: Calendar, color: "text-blue-300" },
                { name: "School Policy", href: "/teacher/school-policy", icon: School, color: "text-orange-300" },
                { name: "Profile", href: "/teacher/profile", icon: UserCircle, color: "text-purple-500" }
            ]
        }
    ],
    "home-class-teacher": [
        { name: "Dashboard", href: "/home-class-teacher", icon: LayoutDashboard },
        { name: "People", href: "/home-class-teacher/people", icon: Users },
        { name: "Rankings", href: "/home-class-teacher/rankings", icon: ClipboardList },
        { name: "Behavior", href: "/home-class-teacher/behavior", icon: ShieldAlert },
        { name: "Analytics", href: "/home-class-teacher/analytics", icon: BarChart3 },
        { name: "Schedule", href: "/home-class-teacher/schedule", icon: Calendar },
        { name: "Announcements", href: "/home-class-teacher/announcements", icon: Megaphone },
        { name: "Discussions", href: "/home-class-teacher/discussions", icon: MessageSquare },
        { name: "School Policy", href: "/home-class-teacher/school-policy", icon: Scale },
        { name: "Profile", href: "/home-class-teacher/profile", icon: UserCircle },
    ],
    student: [
        {
            group: "Main",
            items: [{ name: "Dashboard", href: "/student", icon: LayoutDashboard, color: "text-blue-500" }],
        },
        {
            group: "Academic",
            items: [
                { name: "Lessons", href: "/student/lessons", icon: BookOpen, color: "text-green-500" },
                { name: "Assignments", href: "/student/assignments", icon: ClipboardList, color: "text-orange-500" },
                { name: "Quizzes", href: "/student/quizzes", icon: Puzzle, color: "text-lime-500" },
            ],
        },
        {
            group: "Performance",
            items: [
                { name: "Grades", href: "/student/grades", icon: GraduationCap, color: "text-purple-500" },
                { name: "Analytics", href: "/student/analytics", icon: BarChart3, color: "text-pink-500" },
                { name: "Attendance", href: "/student/attendance", icon: CalendarCheck, color: "text-emerald-500" },
                { name: "Class Attendance", href: "/student/attendance", icon: Users, badge: "Monitor", color: "text-amber-500", requiresMonitor: true },
            ],
        },
        {
            group: "Planning",
            items: [
                { name: "Schedule", href: "/student/schedule", icon: Calendar1, color: "text-blue-400" },
                { name: "To Do", href: "/student/todo", icon: CircleCheckBig, color: "text-purple-400" },
            ],
        },
        {
            group: "Community",
            items: [
                { name: "Discussions", href: "/student/discussions", icon: MessageSquare, color: "text-indigo-400" },
                { name: "People", href: "/student/people", icon: Users, color: "text-violet-500" },
            ],
        },
        {
            group: "Reference",
            items: [
                { name: "Syllabus", href: "/student/syllabus", icon: Book, color: "text-gray-500" },
                { name: "School Policy", href: "/student/school-policy", icon: School, color: "text-orange-300" },
                { name: "Profile", href: "/student/profile", icon: UserCircle, color: "text-purple-600" },
            ],
        },
    ],
};
