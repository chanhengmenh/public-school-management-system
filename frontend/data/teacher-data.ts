export const teacherData = {
    profile: {
        name: "Mr. Tep Rendaro",
        email: "[EMAIL_ADDRESS]",
        department: "Mathematics",
        experience: "12 years",
    },
    assignedClasses: [
        { id: "c1", name: "Class 10-A", students: 32, schedule: "Mon, Wed, Fri - 08:00", room: "Room A101" },
        { id: "c2", name: "Class 10-B", students: 30, schedule: "Mon, Wed, Fri - 10:00", room: "Room A102" },
        { id: "c3", name: "Class 9-A", students: 28, schedule: "Tue, Thu - 09:00", room: "Room A103" },
        { id: "c4", name: "Class 9-B", students: 31, schedule: "Tue, Thu - 11:00", room: "Room A104" },
    ],
    assignedSubjects: [
        { id: "s1", name: "Mathematics 10", classes: ["Class 10-A", "Class 10-B"], totalStudents: 62, color: "bg-blue-100 text-blue-700" },
        { id: "s2", name: "Mathematics 9", classes: ["Class 9-A", "Class 9-B"], totalStudents: 59, color: "bg-purple-100 text-purple-700" },
        { id: "s3", name: "Advanced Algebra", classes: ["Class 10-A"], totalStudents: 32, color: "bg-green-100 text-green-700" },
    ],
    upcomingClasses: [
        { subject: "Mathematics 10", class: "Class 10-A", time: "08:00", room: "Room A101" },
        { subject: "Mathematics 10", class: "Class 10-B", time: "10:00", room: "Room A102" },
        { subject: "Advanced Algebra", class: "Class 10-A", time: "14:00", room: "Room A101" },
    ],
    pendingTasks: [
        { task: "Grade Algebra Mid-term", class: "Class 10-A", due: "Feb 10, 2026", priority: "high" },
        { task: "Prepare Quiz Questions", class: "Class 9-B", due: "Feb 12, 2026", priority: "medium" },
        { task: "Submit Attendance Report", class: "All", due: "Feb 15, 2026", priority: "low" },
    ],
    stats: {
        totalStudents: 121,
        totalClasses: 4,
        totalSubjects: 3,
        pendingGrading: 45,
    },
    analytics: {
        averageScore: 78.5,
        totalSubmissions: 312,
        flaggedCount: 12,
        trend: [
            { month: "Sep", score: 72 },
            { month: "Oct", score: 75 },
            { month: "Nov", score: 74 },
            { month: "Dec", score: 79 },
            { month: "Jan", score: 77 },
            { month: "Feb", score: 82 },
        ],
        distribution: [
            { range: "0-59", count: 15, fill: "#ef4444" },
            { range: "60-69", count: 32, fill: "#f97316" },
            { range: "70-79", count: 85, fill: "#eab308" },
            { range: "80-89", count: 110, fill: "#3b82f6" },
            { range: "90-100", count: 70, fill: "#22c55e" },
        ],
        flaggedSubmissions: [
            { id: "fs1", student: "John Doe", subject: "Mathematics 10", issue: "Plagiarism Detected", severity: "high", date: "Feb 8, 2026" },
            { id: "fs2", student: "Jane Smith", subject: "Advanced Algebra", issue: "Tab Switching (25x)", severity: "medium", date: "Feb 7, 2026" },
            { id: "fs3", student: "Alice Johnson", subject: "Mathematics 9", issue: "Low Score Warning", severity: "low", date: "Feb 6, 2026" },
            { id: "fs4", student: "Bob Brown", subject: "Mathematics 10", issue: "Time Limit Exceeded", severity: "low", date: "Feb 5, 2026" },
            { id: "fs5", student: "Charlie Davis", subject: "Advanced Algebra", issue: "Copied Content", severity: "high", date: "Feb 4, 2026" },
        ]
    },
    discussions: [
        { id: 1, topic: "Mid-term Exam Review", subject: "Mathematics 10", class: "Class 10-A", author: "Mr. Tep Rendaro", replies: 15, lastReply: "2026-02-14T10:30:00" },
        { id: 2, topic: "Homework Help - Chapter 5", subject: "Mathematics 10", class: "Class 10-B", author: "John Doe", replies: 8, lastReply: "2026-02-13T15:45:00" },
        { id: 3, topic: "Upcoming Project Guidelines", subject: "Advanced Algebra", class: "Class 10-A", author: "Mr. Tep Rendaro", replies: 5, lastReply: "2026-02-12T09:20:00" },
        { id: 4, topic: "Question about Quadratic Equations", subject: "Mathematics 9", class: "Class 9-A", author: "Alice Johnson", replies: 3, lastReply: "2026-02-11T14:10:00" },
        { id: 5, topic: "Quiz Date Confirmation", subject: "Mathematics 9", class: "Class 9-B", author: "Bob Brown", replies: 12, lastReply: "2026-02-10T11:05:00" },
    ]
};
