export const homeClassAnalytics = {
    overallStats: {
        averageScore: 78.4,
        medianScore: 81.0,
        modeScore: 85.0,
        standardDeviation: 12.5,
        highestScore: 99.0,
        lowestScore: 45.0,
        totalStudents: 32,
        passingRate: 94.5,
    },
    subjectPerformance: [
        { subject: "Mathematics 10", average: 75.2, median: 78, passRate: 88, color: "#3b82f6" },
        { subject: "English Lit", average: 82.5, median: 85, passRate: 97, color: "#10b981" },
        { subject: "Physics 10", average: 71.8, median: 74, passRate: 82, color: "#8b5cf6" },
        { subject: "World History", average: 79.0, median: 81, passRate: 94, color: "#f59e0b" },
        { subject: "Computer Science", average: 88.4, median: 92, passRate: 100, color: "#6366f1" },
    ],
    gradeDistribution: [
        { range: "0-59", count: 2, label: "F" },
        { range: "60-69", count: 4, label: "D" },
        { range: "70-79", count: 8, label: "C" },
        { range: "80-89", count: 12, label: "B" },
        { range: "90-100", count: 6, label: "A" },
    ],
    quantiles: {
        top10Percent: [
            { name: "Bopha Chan", average: 98.5 },
            { name: "Sokha Vong", average: 97.2 },
            { name: "Dara Ly", average: 96.0 },
        ],
        bottom10Percent: [
            { name: "Visal Chea", average: 52.0 },
            { name: "Vibol Lim", average: 58.5 },
            { name: "Srey Nun", average: 61.0 },
        ],
    },
    monthlyTrend: [
        { month: "Sep", average: 74 },
        { month: "Oct", average: 76 },
        { month: "Nov", average: 75 },
        { month: "Dec", average: 79 },
        { month: "Jan", average: 78 },
        { month: "Feb", average: 81 },
    ],
};
