export const homeClassBehavior = {
    engagementBySubject: [
        { subject: "Mathematics", engagement: 85, classAvg: 78 },
        { subject: "English", engagement: 72, classAvg: 75 },
        { subject: "Physics", engagement: 68, classAvg: 70 },
        { subject: "History", engagement: 78, classAvg: 72 },
        { subject: "Computer Science", engagement: 92, classAvg: 85 },
    ],
    procrastinationIndicators: [
        { id: "p1", student: "Vibol Lim", lastMinuteSubmissions: 8, avgSubmitTime: "11:45 PM", riskLevel: "high", trend: "increasing" },
        { id: "p2", student: "Visal Chea", lastMinuteSubmissions: 6, avgSubmitTime: "10:30 PM", riskLevel: "high", trend: "stable" },
        { id: "p3", student: "Dara Sok", lastMinuteSubmissions: 5, avgSubmitTime: "9:15 PM", riskLevel: "medium", trend: "decreasing" },
        { id: "p4", student: "Nary Thy", lastMinuteSubmissions: 4, avgSubmitTime: "8:45 PM", riskLevel: "medium", trend: "stable" },
        { id: "p5", student: "Rithy Heng", lastMinuteSubmissions: 3, avgSubmitTime: "7:30 PM", riskLevel: "low", trend: "decreasing" },
    ],
    weeklyEngagement: [
        { week: "Week 1", attendance: 95, participation: 78, assignments: 88 },
        { week: "Week 2", attendance: 92, participation: 82, assignments: 85 },
        { week: "Week 3", attendance: 88, participation: 75, assignments: 90 },
        { week: "Week 4", attendance: 94, participation: 80, assignments: 87 },
    ],
    behaviorAlerts: [
        { id: "a1", student: "Vibol Lim", type: "Late Submissions", count: 5, severity: "warning" },
        { id: "a2", student: "Visal Chea", type: "Low Participation", count: 3, severity: "warning" },
        { id: "a3", student: "Dara Sok", type: "Absent Days", count: 4, severity: "danger" },
    ],
    overallStats: {
        avgEngagement: 79,
        avgAttendance: 92,
        procrastinators: 5,
        atRiskStudents: 3,
    }
};
