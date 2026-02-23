"use client";

import { useState } from "react";
import { teacherData } from "@/data/teacher-data";
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Cell,
    LineChart,
    Line,
    Legend
} from "recharts";
import {
    AlertTriangle,
    TrendingUp,
    Users,
    AlertCircle,
    Clock,
    ChevronDown,
    Filter,
    ArrowUpRight,
    ArrowDownRight,
    Calendar
} from "lucide-react";

export default function AnalyticsPage() {
    const { analytics, assignedSubjects, assignedClasses } = teacherData;
    const [selectedSubject, setSelectedSubject] = useState("All Subjects");
    const [selectedClass, setSelectedClass] = useState("All Classes");
    const [timeRange, setTimeRange] = useState("This Semester");

    // Filter available classes based on selected subject
    const availableClasses = selectedSubject === "All Subjects"
        ? assignedClasses
        : assignedClasses.filter(c => {
            const subject = assignedSubjects.find(s => s.name === selectedSubject);
            return subject?.classes.includes(c.name);
        });

    // Reset selected class if it's not valid for the new subject
    if (selectedSubject !== "All Subjects" && selectedClass !== "All Classes") {
        const subject = assignedSubjects.find(s => s.name === selectedSubject);
        if (subject && !subject.classes.includes(assignedClasses.find(c => c.id === selectedClass)?.name || "")) {
            setSelectedClass("All Classes");
        }
    }

    // Mock data update based on filters
    const getMultiplier = () => {
        let mult = 1;
        if (selectedSubject !== "All Subjects") mult *= 0.9 + (selectedSubject.length % 3) * 0.1;
        if (selectedClass !== "All Classes") mult *= 0.9 + (selectedClass.length % 3) * 0.1;
        return mult;
    };

    const multiplier = getMultiplier();

    const currentStats = {
        averageScore: Math.min(100, Math.round(analytics.averageScore * multiplier)),
        totalSubmissions: Math.round(analytics.totalSubmissions * multiplier * 0.5), // Fewer submissions when filtered
        flaggedCount: Math.round(analytics.flaggedCount * multiplier),
    };

    // Filter flagged submissions
    // Note: We are mocking the "Class" for these submissions since it wasn't in the original data
    const filteredFlaggedSubmissions = analytics.flaggedSubmissions
        .map((sub, index) => ({
            ...sub,
            // Assign a mock class deterministically based on index
            class: assignedClasses[index % assignedClasses.length].name
        }))
        .filter(sub => {
            const matchesSubject = selectedSubject === "All Subjects" || sub.subject === selectedSubject;
            const matchesClass = selectedClass === "All Classes" ||
                (selectedClass !== "All Classes" && sub.class === assignedClasses.find(c => c.id === selectedClass)?.name);
            return matchesSubject && matchesClass;
        });

    // Dynamic Chart Data
    const chartDistribution = analytics.distribution.map(item => ({
        ...item,
        count: Math.round(item.count * multiplier * (selectedSubject === "All Subjects" ? 1 : 0.4))
    }));

    const chartTrend = analytics.trend.map(item => ({
        ...item,
        score: Math.min(100, Math.round(item.score * multiplier))
    }));

    // Mock trend indicators updates
    const trends = {
        score: { value: selectedSubject === "All Subjects" ? "+2.4%" : "+1.8%", positive: true },
        submissions: { value: selectedSubject === "All Subjects" ? "+12%" : "+5%", positive: true },
        flagged: { value: selectedSubject === "All Subjects" ? "-5%" : "0%", positive: true },
    };

    return (
        <div className="space-y-6 max-w-7xl mx-auto">
            {/* Header with Filters */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Subject Analytics</h1>
                    <p className="text-gray-500 text-sm mt-1">
                        Performance insights for {selectedSubject === "All Subjects" ? "All Subjects" : selectedSubject}
                        {selectedClass !== "All Classes" && ` • ${assignedClasses.find(c => c.id === selectedClass)?.name}`}
                        {" "}• {timeRange}
                    </p>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                    {/* Subject Filter */}
                    <div className="relative">
                        <select
                            className="appearance-none bg-white border border-gray-200 text-gray-700 py-2 pl-4 pr-10 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm font-medium cursor-pointer"
                            value={selectedSubject}
                            onChange={(e) => setSelectedSubject(e.target.value)}
                        >
                            <option>All Subjects</option>
                            {assignedSubjects.map(sub => (
                                <option key={sub.id} value={sub.name}>{sub.name}</option>
                            ))}
                        </select>
                        <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4 pointer-events-none" />
                    </div>

                    {/* Class Filter */}
                    <div className="relative">
                        <select
                            className="appearance-none bg-white border border-gray-200 text-gray-700 py-2 pl-4 pr-10 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm font-medium cursor-pointer"
                            value={selectedClass}
                            onChange={(e) => setSelectedClass(e.target.value)}
                        >
                            <option value="All Classes">All Classes</option>
                            {availableClasses.map(c => (
                                <option key={c.id} value={c.id}>{c.name}</option>
                            ))}
                        </select>
                        <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4 pointer-events-none" />
                    </div>

                    {/* Time Range Filter */}
                    <div className="relative">
                        <select
                            className="appearance-none bg-white border border-gray-200 text-gray-700 py-2 pl-4 pr-10 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm font-medium cursor-pointer"
                            value={timeRange}
                            onChange={(e) => setTimeRange(e.target.value)}
                        >
                            <option>Last 30 Days</option>
                            <option>This Semester</option>
                            <option>Last Year</option>
                        </select>
                        <Calendar className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4 pointer-events-none" />
                    </div>
                </div>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <KpiCard
                    title="Average Score"
                    value={`${currentStats.averageScore}%`}
                    icon={TrendingUp}
                    trend={trends.score}
                    color="blue"
                />
                <KpiCard
                    title="Total Submissions"
                    value={currentStats.totalSubmissions}
                    icon={Users}
                    trend={trends.submissions}
                    color="green"
                />
                <KpiCard
                    title="Flagged Submissions"
                    value={currentStats.flaggedCount}
                    icon={AlertTriangle}
                    trend={trends.flagged}
                    color="red"
                    inverseTrend
                />
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Score Distribution Chart */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-lg font-semibold text-gray-800">Score Distribution</h3>
                        <div className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">histogram</div>
                    </div>
                    <div className="h-80 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={chartDistribution}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                                <XAxis
                                    dataKey="range"
                                    tick={{ fill: '#6b7280', fontSize: 12 }}
                                    axisLine={false}
                                    tickLine={false}
                                    dy={10}
                                />
                                <YAxis
                                    tick={{ fill: '#6b7280', fontSize: 12 }}
                                    axisLine={false}
                                    tickLine={false}
                                />
                                <Tooltip
                                    cursor={{ fill: '#f9fafb' }}
                                    contentStyle={{
                                        borderRadius: '8px',
                                        border: 'none',
                                        boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                                        fontSize: '12px'
                                    }}
                                />
                                <Bar dataKey="count" radius={[4, 4, 0, 0]} animationDuration={1000}>
                                    {chartDistribution.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.fill} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Trend Chart */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-lg font-semibold text-gray-800">Performance Trend</h3>
                        <div className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">monthly avg</div>
                    </div>
                    <div className="h-80 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={chartTrend}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                                <XAxis
                                    dataKey="month"
                                    tick={{ fill: '#6b7280', fontSize: 12 }}
                                    axisLine={false}
                                    tickLine={false}
                                    dy={10}
                                />
                                <YAxis
                                    tick={{ fill: '#6b7280', fontSize: 12 }}
                                    axisLine={false}
                                    tickLine={false}
                                    domain={[60, 100]}
                                />
                                <Tooltip
                                    contentStyle={{
                                        borderRadius: '8px',
                                        border: 'none',
                                        boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                                        fontSize: '12px'
                                    }}
                                />
                                <Line
                                    type="monotone"
                                    dataKey="score"
                                    stroke="#3b82f6"
                                    strokeWidth={3}
                                    dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4, stroke: '#fff' }}
                                    activeDot={{ r: 6, strokeWidth: 0 }}
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* Flagged Submissions List */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
                <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                    <div>
                        <h3 className="text-lg font-semibold text-gray-800">Flagged Submissions</h3>
                        <p className="text-sm text-gray-500">Recent integrity alerts and warnings</p>
                    </div>
                    <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">View All</button>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 text-xs uppercase text-gray-500 font-semibold">
                            <tr>
                                <th className="px-6 py-4">Student</th>
                                <th className="px-6 py-4">Subject</th>
                                <th className="px-6 py-4">Class</th>
                                <th className="px-6 py-4">Issue</th>
                                <th className="px-6 py-4">Severity</th>
                                <th className="px-6 py-4">Date</th>
                                <th className="px-6 py-4 text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {filteredFlaggedSubmissions.length > 0 ? (
                                filteredFlaggedSubmissions.map((item) => (
                                    <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4 font-medium text-gray-900">{item.student}</td>
                                        <td className="px-6 py-4 text-sm text-gray-600">{item.subject}</td>
                                        <td className="px-6 py-4 text-sm text-gray-600">{item.class}</td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2 text-sm text-gray-700">
                                                <AlertCircle size={16} className="text-gray-400" />
                                                {item.issue}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${item.severity === 'high' ? 'bg-red-100 text-red-700' :
                                                item.severity === 'medium' ? 'bg-orange-100 text-orange-700' :
                                                    'bg-yellow-100 text-yellow-700'
                                                }`}>
                                                {item.severity.toUpperCase()}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-500">{item.date}</td>
                                        <td className="px-6 py-4 text-right">
                                            <button className="text-sm text-gray-500 hover:text-blue-600 font-medium">Review</button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={7} className="px-6 py-8 text-center text-gray-500">
                                        No flagged submissions found for the selected filters.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

function KpiCard({ title, value, icon: Icon, trend, color, inverseTrend }: any) {
    const isPositive = trend.positive;
    // If inverseTrend is true (like for errors), a positive "value" change is actually bad (red), and negative is good (green).
    // Here we simplify: mock data says "positive: true" which usually means green arrow up.
    // Let's just trust the mock data `positive` boolean for color.

    // Color mapping
    const colorClasses = {
        blue: "bg-blue-50 text-blue-600",
        green: "bg-green-50 text-green-600",
        red: "bg-red-50 text-red-600",
        purple: "bg-purple-50 text-purple-600",
    };

    const activeColor = colorClasses[color as keyof typeof colorClasses] || colorClasses.blue;

    return (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-all">
            <div className="flex items-start justify-between">
                <div>
                    <p className="text-sm font-medium text-gray-500 mb-1">{title}</p>
                    <h3 className="text-3xl font-bold text-gray-900">{value}</h3>
                </div>
                <div className={`p-3 rounded-xl ${activeColor}`}>
                    <Icon size={24} />
                </div>
            </div>
            <div className="mt-4 flex items-center gap-2 text-sm">
                <span className={`flex items-center font-medium ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
                    {isPositive ? <ArrowUpRight size={16} /> : <ArrowDownRight size={16} />}
                    {trend.value}
                </span>
                <span className="text-gray-400">vs. last period</span>
            </div>
        </div>
    );
}
