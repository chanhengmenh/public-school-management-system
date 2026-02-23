export const adminData = {
    systemStats: {
        totalUsers: 1247,
        activeUsers: 892,
        totalTeachers: 45,
        totalStudents: 1180,
        totalClasses: 32,
        totalQuizzes: 156,
        storageUsed: "45.2 GB",
        storageLimit: "100 GB",
    },
    userGrowth: [
        { month: "Sep", users: 980, active: 720 },
        { month: "Oct", users: 1050, active: 780 },
        { month: "Nov", users: 1120, active: 820 },
        { month: "Dec", users: 1180, active: 850 },
        { month: "Jan", users: 1220, active: 870 },
        { month: "Feb", users: 1247, active: 892 },
    ],
    dailyActivity: [
        { day: "Mon", logins: 420, quizzes: 35, submissions: 120 },
        { day: "Tue", logins: 480, quizzes: 42, submissions: 145 },
        { day: "Wed", logins: 510, quizzes: 38, submissions: 132 },
        { day: "Thu", logins: 490, quizzes: 45, submissions: 158 },
        { day: "Fri", logins: 450, quizzes: 28, submissions: 98 },
    ],
    roleDistribution: [
        { role: "Students", count: 1180, color: "#3b82f6" },
        { role: "Teachers", count: 45, color: "#10b981" },
        { role: "Admins", count: 5, color: "#8b5cf6" },
        { role: "Monitors", count: 17, color: "#f59e0b" },
    ],
    recentActivity: [
        { id: 1, action: "New teacher registered", user: "Ms. Sokha Vong", time: "10 minutes ago", type: "user" },
        { id: 2, action: "Quiz published", user: "Mr. Tep Rendaro", time: "25 minutes ago", type: "quiz" },
        { id: 3, action: "Class created", user: "Admin", time: "1 hour ago", type: "class" },
        { id: 4, action: "Bulk student import", user: "Admin", time: "2 hours ago", type: "import" },
        { id: 5, action: "System backup completed", user: "System", time: "3 hours ago", type: "system" },
    ],
    systemHealth: {
        serverStatus: "Healthy",
        uptime: "99.9%",
        responseTime: "45ms",
        lastBackup: "2 hours ago",
    }
};
