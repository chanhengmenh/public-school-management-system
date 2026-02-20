"use client";

import React from "react";
import {
    BarChart3,
    Users,
    TrendingUp,
    Activity
} from "lucide-react";
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Legend,
    LineChart,
    Line,
    PieChart,
    Pie,
    Cell
} from "recharts";

const studentsPerClass = [
    { class: "10-A", students: 32 },
    { class: "10-B", students: 30 },
    { class: "11-A", students: 28 },
    { class: "11-B", students: 31 },
    { class: "12-A", students: 25 },
    { class: "12-B", students: 27 },
];

const passFailBySubject = [
    { subject: "Math", pass: 145, fail: 23 },
    { subject: "English", pass: 158, fail: 10 },
    { subject: "Physics", pass: 132, fail: 36 },
    { subject: "Chemistry", pass: 128, fail: 40 },
    { subject: "History", pass: 162, fail: 6 },
    { subject: "CS", pass: 155, fail: 13 },
];

const systemUsage = [
    { time: "8AM", logins: 120, quizzes: 5, submissions: 0 },
    { time: "9AM", logins: 340, quizzes: 12, submissions: 45 },
    { time: "10AM", logins: 280, quizzes: 18, submissions: 120 },
    { time: "11AM", logins: 210, quizzes: 15, submissions: 95 },
    { time: "12PM", logins: 85, quizzes: 3, submissions: 30 },
    { time: "1PM", logins: 150, quizzes: 8, submissions: 55 },
    { time: "2PM", logins: 320, quizzes: 22, submissions: 140 },
    { time: "3PM", logins: 280, quizzes: 16, submissions: 110 },
    { time: "4PM", logins: 120, quizzes: 5, submissions: 35 },
];

const overallStats = {
    totalStudents: 173,
    avgPassRate: 89.2,
    dailyActiveUsers: 892,
    quizzesToday: 104,
};

export default function AdminAnalyticsPage() {
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                    <BarChart3 className="w-6 h-6 text-indigo-600" />
                    Analytics Dashboard
                </h1>
                <p className="text-gray-500">System-wide performance and usage metrics</p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-200">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-sm font-medium text-gray-500">Total Students</p>
                            <h3 className="text-2xl font-bold text-gray-900 mt-1">{overallStats.totalStudents}</h3>
                        </div>
                        <div className="p-2 bg-blue-50 rounded-lg">
                            <Users className="w-5 h-5 text-blue-600" />
                        </div>
                    </div>
                </div>
                <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-200">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-sm font-medium text-gray-500">Avg Pass Rate</p>
                            <h3 className="text-2xl font-bold text-green-600 mt-1">{overallStats.avgPassRate}%</h3>
                        </div>
                        <div className="p-2 bg-green-50 rounded-lg">
                            <TrendingUp className="w-5 h-5 text-green-600" />
                        </div>
                    </div>
                </div>
                <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-200">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-sm font-medium text-gray-500">Daily Active Users</p>
                            <h3 className="text-2xl font-bold text-gray-900 mt-1">{overallStats.dailyActiveUsers}</h3>
                        </div>
                        <div className="p-2 bg-purple-50 rounded-lg">
                            <Activity className="w-5 h-5 text-purple-600" />
                        </div>
                    </div>
                </div>
                <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-200">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-sm font-medium text-gray-500">Quizzes Today</p>
                            <h3 className="text-2xl font-bold text-gray-900 mt-1">{overallStats.quizzesToday}</h3>
                        </div>
                        <div className="p-2 bg-orange-50 rounded-lg">
                            <BarChart3 className="w-5 h-5 text-orange-600" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Charts Row 1 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Students Per Class */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Students Per Class</h3>
                    <div className="h-72 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={studentsPerClass}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                <XAxis dataKey="class" />
                                <YAxis />
                                <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                                <Bar dataKey="students" name="Students" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Pass/Fail by Subject */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Pass/Fail by Subject</h3>
                    <div className="h-72 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={passFailBySubject}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                <XAxis dataKey="subject" />
                                <YAxis />
                                <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                                <Legend />
                                <Bar dataKey="pass" name="Pass" fill="#10b981" radius={[4, 4, 0, 0]} />
                                <Bar dataKey="fail" name="Fail" fill="#ef4444" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* System Usage Chart */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">System Usage (Today)</h3>
                <div className="h-80 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={systemUsage}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} />
                            <XAxis dataKey="time" />
                            <YAxis />
                            <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                            <Legend />
                            <Line type="monotone" dataKey="logins" name="Logins" stroke="#3b82f6" strokeWidth={2} dot={{ r: 4 }} />
                            <Line type="monotone" dataKey="submissions" name="Submissions" stroke="#10b981" strokeWidth={2} dot={{ r: 4 }} />
                            <Line type="monotone" dataKey="quizzes" name="Quizzes" stroke="#f59e0b" strokeWidth={2} dot={{ r: 4 }} />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
}
