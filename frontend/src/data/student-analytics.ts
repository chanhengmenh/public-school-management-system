export const studentAnalytics = {
    scoreTrend: [
        { month: "Sep", score: 72 },
        { month: "Oct", score: 78 },
        { month: "Nov", score: 85 },
        { month: "Dec", score: 80 },
        { month: "Jan", score: 88 },
        { month: "Feb", score: 92 },
    ],
    integrityScore: 95, // Percentage
    integrityEvents: {
        copyPaste: 2,
        tabSwitches: 5,
        totalQuizzes: 12,
    },
    engagement: {
        quizzesCompleted: 12,
        assignmentsSubmitted: 18,
        averageTimePerQuiz: "42 min",
        onTimeSubmissionRate: 85, // Percentage
        attendanceRate: 92, // Percentage
    },
    recentActivity: [
        { type: "Quiz", name: "Algebra Mid-term", date: "2026-02-08", score: 92 },
        { type: "Assignment", name: "Physics Lab Report", date: "2026-02-07", score: 88 },
        { type: "Quiz", name: "History Pop Quiz", date: "2026-02-05", score: 78 },
    ],
    subjectPerformance: [
        { subject: "Mathematics", score: 88, classAvg: 75, fullMark: 100 },
        { subject: "Physics", score: 92, classAvg: 70, fullMark: 100 },
        { subject: "Chemistry", score: 78, classAvg: 65, fullMark: 100 },
        { subject: "Biology", score: 85, classAvg: 72, fullMark: 100 },
        { subject: "English", score: 90, classAvg: 80, fullMark: 100 },
        { subject: "History", score: 76, classAvg: 68, fullMark: 100 },
    ],
    learningInsights: [
        {
            type: "strength",
            title: "Strong Performance in STEM",
            description: "You are consistently scoring above 85% in Math and Physics. Keep up the good work!",
        },
        {
            type: "improvement",
            title: "History Scores Dipping",
            description: "Your recent History quiz scores have been lower than average. Consider reviewing the material from Chapter 4.",
        },
        {
            type: "habit",
            title: "Consistent Attendance",
            description: "Great job! Your attendance is 92%, which positively impacts your participation grade.",
        },
    ]
};
