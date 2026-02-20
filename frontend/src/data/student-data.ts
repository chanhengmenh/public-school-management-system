export const studentData = {
    subjects: [
        {
            id: "math-101",
            name: "Mathematics 10",
            teacher: "Mr. Tep Rendaro",
            progress: 75,
            grade: "A-",
            color: "bg-blue-600",
            icon: "Calculator",
        },
        {
            id: "eng-101",
            name: "English Literature",
            teacher: "Ms. Davis",
            progress: 60,
            grade: "B+",
            color: "bg-green-600",
            icon: "BookOpen",
        },
        {
            id: "sci-101",
            name: "Physics 10",
            teacher: "Dr. Wilson",
            progress: 85,
            grade: "A",
            color: "bg-purple-600",
            icon: "Atom",
        },
        {
            id: "his-101",
            name: "World History",
            teacher: "Mrs. Thompson",
            progress: 45,
            grade: "B",
            color: "bg-orange-600",
            icon: "Globe",
        },
        {
            id: "cs-101",
            name: "Computer Science",
            teacher: "Mr. Roberts",
            progress: 90,
            grade: "A+",
            color: "bg-indigo-600",
            icon: "Code",
        },
    ],
    upcomingQuizzes: [
        {
            id: "q-1",
            subject: "Mathematics 10",
            title: "Algebra Mid-term",
            dueDate: "2026-02-15T10:00:00",
            duration: "60 min",
        },
        {
            id: "q-2",
            subject: "Physics 10",
            title: "Newton's Laws Quiz",
            dueDate: "2026-02-18T14:00:00",
            duration: "45 min",
        },
        {
            id: "q-3",
            subject: "Computer Science",
            title: "React Basics",
            dueDate: "2026-02-20T09:00:00",
            duration: "30 min",
        },
    ],
    allQuizzes: [
        {
            id: "q-1",
            subject: "Mathematics 10",
            title: "Algebra Mid-term",
            dueDate: "2026-02-15T10:00:00",
            duration: "60 min",
            status: "Open",
            score: null,
        },
        {
            id: "q-2",
            subject: "Physics 10",
            title: "Newton's Laws Quiz",
            dueDate: "2026-02-18T14:00:00",
            duration: "45 min",
            status: "Open",
            score: null,
        },
        {
            id: "q-3",
            subject: "Computer Science",
            title: "React Basics",
            dueDate: "2026-02-20T09:00:00",
            duration: "30 min",
            status: "Upcoming",
            score: null,
        },
        {
            id: "q-4",
            subject: "English Literature",
            title: "Shakespeare Essay",
            dueDate: "2026-02-01T23:59:00",
            duration: "90 min",
            status: "Submitted",
            score: 85,
        },
        {
            id: "q-5",
            subject: "World History",
            title: "WWII Timeline",
            dueDate: "2026-01-25T12:00:00",
            duration: "20 min",
            status: "Closed",
            score: null,
        },
    ],
    assignments: [
        {
            id: "a-1",
            subject: "English Literature",
            title: "Reading Reflection Journal",
            dueDate: "2026-02-14T23:59:00",
            status: "Pending",
            score: null,
            type: "Assignment"
        },
        {
            id: "a-2",
            subject: "Physics 10",
            title: "Lab Report: Motion",
            dueDate: "2026-02-16T15:00:00",
            status: "Submitted",
            score: 92,
            type: "Assignment"
        },
        {
            id: "a-3",
            subject: "World History",
            title: "Research Paper Draft",
            dueDate: "2026-02-22T10:00:00",
            status: "Upcoming",
            score: null,
            type: "Assignment"
        }
    ],
    announcements: [
        {
            id: "a-1",
            title: "School Science Fair Registration",
            date: "2026-02-08",
            content: "Registration for the annual Science Fair is now open. Please sign up by Friday.",
            author: "Principal Skinner",
        },
        {
            id: "a-2",
            title: "Library Hours Extended",
            date: "2026-02-07",
            content: "The library will remain open until 6:00 PM during exam week.",
            author: "Ms. Pince",
        },
    ],
    attendance: {
        summary: {
            present: 42,
            absent: 2,
            late: 1,
            total: 45,
            percentage: 93.3,
        },
        records: [
            { id: 1, date: "2026-02-10", subject: "Mathematics 10", status: "Present" },
            { id: 2, date: "2026-02-10", subject: "English Literature", status: "Present" },
            { id: 3, date: "2026-02-09", subject: "Physics 10", status: "Late" },
            { id: 4, date: "2026-02-08", subject: "World History", status: "Absent" },
            { id: 5, date: "2026-02-08", subject: "Computer Science", status: "Present" },
        ]
    },
    resources: [
        { id: 1, title: "Calculus Textbook - Chapter 1", subject: "Mathematics 10", type: "PDF", size: "2.4 MB", date: "2026-02-12" },
        { id: 2, title: "Hamlet Full Text", subject: "English Literature", type: "PDF", size: "1.8 MB", date: "2026-02-13" },
        { id: 3, title: "Physics Lab Guide", subject: "Physics 10", type: "PDF", size: "3.2 MB", date: "2026-02-14" },
        { id: 4, title: "Intro to React", subject: "Computer Science", type: "Video", size: "150 MB", date: "2026-02-10" },
    ],
    people: {
        teachers: [
            { id: 1, name: "Mr. Tep Rendaro", subject: "Mathematics 10", email: "tep@school.edu" },
            { id: 2, name: "Ms. Chan Sotheary", subject: "English Literature", email: "chan@school.edu" },
            { id: 3, name: "Dr. Keo Visal", subject: "Physics 10", email: "keo@school.edu" },
        ],
        classmates: [
            { id: 1, name: "Sokha Dara", email: "sokha@student.school.edu" },
            { id: 2, name: "Vannak Bopha", email: "vannak@student.school.edu" },
            { id: 3, name: "Chea Oudom", email: "chea@student.school.edu" },
            { id: 4, name: "Ly Nary", email: "ly@student.school.edu" },
        ]
    },
    discussions: [
        { id: 1, topic: "Help with Calculus Homework", subject: "Mathematics 10", author: "Vannak Bopha", replies: 5, lastReply: "2026-02-11T10:30:00" },
        { id: 2, topic: "Physics Lab Group Formation", subject: "Physics 10", author: "Sokha Dara", replies: 12, lastReply: "2026-02-10T15:45:00" },
        { id: 3, topic: "Book Club Meeting", subject: "English Literature", author: "Chea Oudom", replies: 3, lastReply: "2026-02-09T09:20:00" },
    ],
    syllabus: [
        {
            subject: "Mathematics 10",
            topics: [
                { title: "Algebra Review", week: 1, status: "Completed" },
                { title: "Linear Equations", week: 2, status: "Completed" },
                { title: "Calculus Basics", week: 3, status: "In Progress" },
            ]
        },
        {
            subject: "Physics 10",
            topics: [
                { title: "Kinematics", week: 1, status: "Completed" },
                { title: "Dynamics", week: 2, status: "In Progress" },
                { title: "Energy", week: 3, status: "Upcoming" },
            ]
        }
    ],
    grades: {
        "math-101": {
            overall: 88,
            breakdown: {
                assignments: [
                    { title: "Algebra Problem Set 1", score: 90, max: 100, date: "2026-01-15" },
                    { title: "Calculus Intro Worksheet", score: 85, max: 100, date: "2026-02-01" }
                ],
                quizzes: [
                    { title: "Algebra Mid-term", score: 88, max: 100, date: "2026-02-15" }
                ],
                attendance: { score: 95, max: 100, label: "Participation" },
                exams: [
                    { title: "Semester 1 Final", score: 89, max: 100, date: "2025-12-20" }
                ]
            }
        },
        "eng-101": {
            overall: 78,
            breakdown: {
                assignments: [
                    { title: "Shakespeare Essay", score: 85, max: 100, date: "2026-01-20" },
                    { title: "Poetry Analysis", score: 75, max: 100, date: "2026-02-05" }
                ],
                quizzes: [],
                attendance: { score: 80, max: 100, label: "Participation" },
                exams: [
                    { title: "Literature Review", score: 76, max: 100, date: "2025-12-18" }
                ]
            }
        },
        "sci-101": {
            overall: 92,
            breakdown: {
                assignments: [
                    { title: "Lab Report: Motion", score: 92, max: 100, date: "2026-02-16" }
                ],
                quizzes: [
                    { title: "Newton's Laws Quiz", score: 95, max: 100, date: "2026-02-18" }
                ],
                attendance: { score: 100, max: 100, label: "Participation" },
                exams: []
            }
        },
        "cs-101": {
            overall: 95,
            breakdown: {
                assignments: [
                    { title: "React Project", score: 98, max: 100, date: "2026-02-10" }
                ],
                quizzes: [
                    { title: "React Basics", score: 92, max: 100, date: "2026-02-20" }
                ],
                attendance: { score: 90, max: 100, label: "Participation" },
                exams: []
            }
        }
    }
};
