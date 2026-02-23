"use client";

import { studentAnalytics } from "@/data/student-analytics";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Legend } from "recharts";
import { ShieldCheck, Clock, CheckCircle, TrendingUp, AlertTriangle, Lightbulb } from "lucide-react";
import { cn } from "@/lib/utils";

export default function StudentAnalyticsPage() {
    const { scoreTrend, integrityScore, integrityEvents, engagement, recentActivity, subjectPerformance, learningInsights } = studentAnalytics;

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-gray-900">My Analytics</h1>
                    <p className="text-sm text-gray-500">Track your performance and growth</p>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <StatCard
                    title="Integrity Score"
                    value={`${integrityScore}%`}
                    description={`${integrityEvents.copyPaste} copy/paste events`}
                    icon={ShieldCheck}
                    color="green"
                />
                <StatCard
                    title="Quizzes Completed"
                    value={engagement.quizzesCompleted.toString()}
                    description={`Avg. time: ${engagement.averageTimePerQuiz}`}
                    icon={CheckCircle}
                    color="blue"
                />
                <StatCard
                    title="On-Time Submissions"
                    value={`${engagement.onTimeSubmissionRate}%`}
                    description={`${engagement.assignmentsSubmitted} assignments`}
                    icon={Clock}
                    color="purple"
                />
                <StatCard
                    title="Attendance Rate"
                    value={`${engagement.attendanceRate}%`}
                    description="This semester"
                    icon={TrendingUp}
                    color="orange"
                />
            </div>

            {/* Main Charts Grid */}
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                {/* Score Trend Chart */}
                <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
                    <div className="mb-4">
                        <h2 className="text-lg font-semibold text-gray-900">Performance Trend</h2>
                        <p className="text-xs text-gray-500">Average score over the last 6 months</p>
                    </div>
                    <div className="h-72">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={scoreTrend} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                                <XAxis dataKey="month" stroke="#9ca3af" fontSize={12} tickLine={false} axisLine={false} />
                                <YAxis stroke="#9ca3af" fontSize={12} domain={[0, 100]} tickLine={false} axisLine={false} />
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: "white",
                                        border: "1px solid #e5e7eb",
                                        borderRadius: "8px",
                                        boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                                    }}
                                />
                                <Line
                                    type="monotone"
                                    dataKey="score"
                                    stroke="#3b82f6"
                                    strokeWidth={3}
                                    dot={{ fill: "#3b82f6", strokeWidth: 2, r: 4 }}
                                    activeDot={{ r: 6, stroke: "#3b82f6", strokeWidth: 2 }}
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Subject Performance Chart */}
                <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
                    <div className="mb-4">
                        <h2 className="text-lg font-semibold text-gray-900">Subject Performance</h2>
                        <p className="text-xs text-gray-500">Your score vs Class average</p>
                    </div>
                    <div className="h-72">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={subjectPerformance} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f0f0f0" />
                                <XAxis type="number" domain={[0, 100]} stroke="#9ca3af" fontSize={12} hide />
                                <YAxis dataKey="subject" type="category" stroke="#6b7280" fontSize={12} width={80} tickLine={false} axisLine={false} />
                                <Tooltip
                                    cursor={{ fill: 'transparent' }}
                                    contentStyle={{
                                        backgroundColor: "white",
                                        border: "1px solid #e5e7eb",
                                        borderRadius: "8px",
                                        boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                                    }}
                                    itemStyle={{ color: '#000000' }}
                                />
                                <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} formatter={(value) => <span className="text-black">{value}</span>} />
                                <Bar dataKey="score" name="My Score" fill="#3b82f6" radius={[0, 4, 4, 0]} barSize={12} />
                                <Bar dataKey="classAvg" name="Class Average" fill="#e5e7eb" radius={[0, 4, 4, 0]} barSize={12} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* Insights & Recent Activity Grid */}
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                {/* AI Insights - NEW SECTION */}
                <div className="lg:col-span-1 rounded-xl border border-gray-200 bg-white shadow-sm flex flex-col">
                    <div className="border-b border-gray-200 px-6 py-4 flex items-center justify-between">
                        <div>
                            <h2 className="text-lg font-semibold text-gray-900">Insights</h2>
                            <p className="text-xs text-gray-500">AI-powered recommendations</p>
                        </div>
                        <Lightbulb className="h-5 w-5 text-yellow-500" />
                    </div>
                    <div className="p-6 space-y-4 flex-1 overflow-y-auto">
                        {learningInsights?.map((insight, index) => (
                            <div key={index} className="flex gap-3 items-start">
                                <div className={cn(
                                    "mt-0.5 p-1.5 rounded-full shrink-0",
                                    insight.type === 'strength' ? "bg-green-100 text-green-600" :
                                        insight.type === 'improvement' ? "bg-amber-100 text-amber-600" :
                                            "bg-blue-100 text-blue-600"
                                )}>
                                    {insight.type === 'strength' && <TrendingUp className="h-3.5 w-3.5" />}
                                    {insight.type === 'improvement' && <AlertTriangle className="h-3.5 w-3.5" />}
                                    {insight.type === 'habit' && <CheckCircle className="h-3.5 w-3.5" />}
                                </div>
                                <div>
                                    <h3 className="text-sm font-medium text-gray-900">{insight.title}</h3>
                                    <p className="text-xs text-gray-500 mt-1 leading-relaxed">{insight.description}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Recent Activity - Modified to take 2 cols */}
                <div className="lg:col-span-2 rounded-xl border border-gray-200 bg-white shadow-sm">
                    <div className="border-b border-gray-200 px-6 py-4">
                        <h2 className="text-lg font-semibold text-gray-900">Recent Activity</h2>
                    </div>
                    <div className="divide-y divide-gray-100">
                        {recentActivity.map((activity, index) => (
                            <div key={index} className="flex items-center justify-between px-6 py-4">
                                <div className="flex items-center gap-4">
                                    <div className={cn(
                                        "flex h-10 w-10 items-center justify-center rounded-lg",
                                        activity.type === "Quiz" ? "bg-blue-100 text-blue-600" : "bg-purple-100 text-purple-600"
                                    )}>
                                        {activity.type === "Quiz" ? <CheckCircle className="h-5 w-5" /> : <Clock className="h-5 w-5" />}
                                    </div>
                                    <div>
                                        <p className="font-medium text-gray-900">{activity.name}</p>
                                        <p className="text-sm text-gray-500">{activity.type} • {activity.date}</p>
                                    </div>
                                </div>
                                <div className={cn(
                                    "text-lg font-bold",
                                    activity.score >= 90 ? "text-green-600" :
                                        activity.score >= 70 ? "text-blue-600" : "text-amber-600"
                                )}>
                                    {activity.score}%
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Integrity Summary (Optional/Secondary now) */}
            <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h2 className="text-lg font-semibold text-gray-900">Integrity Health</h2>
                        <p className="text-xs text-gray-500">Monitoring academic honesty</p>
                    </div>
                </div>

                <div className="flex flex-col md:flex-row items-center justify-around gap-8">
                    <div className="flex flex-col items-center text-center">
                        <div className={cn(
                            "h-24 w-24 rounded-full flex items-center justify-center text-3xl font-bold mb-3",
                            integrityScore >= 90 ? "bg-green-100 text-green-600" :
                                integrityScore >= 70 ? "bg-yellow-100 text-yellow-600" : "bg-red-100 text-red-600"
                        )}>
                            {integrityScore}%
                        </div>
                        <p className="text-sm font-medium text-gray-900">Overall Score</p>
                    </div>

                    <div className="w-full max-w-md grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div className="p-4 rounded-lg bg-gray-50 border border-gray-100 text-center">
                            <p className="text-2xl font-bold text-gray-900 mb-1">{integrityEvents.copyPaste}</p>
                            <p className="text-xs text-gray-500">Copy/Paste Events</p>
                        </div>
                        <div className="p-4 rounded-lg bg-gray-50 border border-gray-100 text-center">
                            <p className="text-2xl font-bold text-gray-900 mb-1">{integrityEvents.tabSwitches}</p>
                            <p className="text-xs text-gray-500">Tab Switches</p>
                        </div>
                        <div className="p-4 rounded-lg bg-gray-50 border border-gray-100 text-center">
                            <p className="text-2xl font-bold text-gray-900 mb-1">{integrityEvents.totalQuizzes}</p>
                            <p className="text-xs text-gray-500">Quizzes Monitored</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

// Stat Card Component
function StatCard({
    title,
    value,
    description,
    icon: Icon,
    color,
}: {
    title: string;
    value: string;
    description: string;
    icon: React.ElementType;
    color: "green" | "blue" | "purple" | "orange";
}) {
    const colorClasses = {
        green: "bg-green-100 text-green-600",
        blue: "bg-blue-100 text-blue-600",
        purple: "bg-purple-100 text-purple-600",
        orange: "bg-orange-100 text-orange-600",
    };

    return (
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            <div className="flex items-center gap-4">
                <div className={cn("rounded-lg p-3", colorClasses[color])}>
                    <Icon className="h-6 w-6" />
                </div>
                <div>
                    <p className="text-sm font-medium text-gray-500">{title}</p>
                    <p className="text-2xl font-bold text-gray-900">{value}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{description}</p>
                </div>
            </div>
        </div>
    );
}
