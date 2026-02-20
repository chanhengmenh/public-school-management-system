"use client";

import React from "react";
import { homeClassBehavior } from "@/data/home-class-behavior";
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    LineChart,
    Line,
    Legend
} from "recharts";
import {
    Activity,
    Clock,
    TrendingUp,
    TrendingDown,
    Minus,
    AlertTriangle,
    Users,
    CheckCircle
} from "lucide-react";

export default function BehaviorPage() {
    const { engagementBySubject, procrastinationIndicators, weeklyEngagement, behaviorAlerts, overallStats } = homeClassBehavior;

    const getTrendIcon = (trend: string) => {
        if (trend === "increasing") return <TrendingUp className="w-4 h-4 text-red-500" />;
        if (trend === "decreasing") return <TrendingDown className="w-4 h-4 text-green-500" />;
        return <Minus className="w-4 h-4 text-gray-400" />;
    };

    const getRiskColor = (risk: string) => {
        if (risk === "high") return "bg-red-100 text-red-700";
        if (risk === "medium") return "bg-yellow-100 text-yellow-700";
        return "bg-green-100 text-green-700";
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                        <Activity className="w-6 h-6 text-purple-600" />
                        Behavior Summary
                    </h1>
                    <p className="text-gray-500">Class 10-A engagement and behavior analysis</p>
                </div>
            </div>

            {/* Overview Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-200">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-purple-50 rounded-lg">
                            <Activity className="w-5 h-5 text-purple-600" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Avg Engagement</p>
                            <p className="text-xl font-bold text-gray-900">{overallStats.avgEngagement}%</p>
                        </div>
                    </div>
                </div>
                <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-200">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-green-50 rounded-lg">
                            <CheckCircle className="w-5 h-5 text-green-600" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Attendance Rate</p>
                            <p className="text-xl font-bold text-gray-900">{overallStats.avgAttendance}%</p>
                        </div>
                    </div>
                </div>
                <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-200">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-orange-50 rounded-lg">
                            <Clock className="w-5 h-5 text-orange-600" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Procrastinators</p>
                            <p className="text-xl font-bold text-gray-900">{overallStats.procrastinators}</p>
                        </div>
                    </div>
                </div>
                <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-200">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-red-50 rounded-lg">
                            <AlertTriangle className="w-5 h-5 text-red-600" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">At-Risk Students</p>
                            <p className="text-xl font-bold text-gray-900">{overallStats.atRiskStudents}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Engagement Comparison */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                    <div className="mb-6">
                        <h3 className="text-lg font-semibold text-gray-900">Engagement by Subject</h3>
                        <p className="text-sm text-gray-500">Class engagement vs class average</p>
                    </div>
                    <div className="h-72 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={engagementBySubject}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                <XAxis dataKey="subject" tick={{ fontSize: 11 }} />
                                <YAxis domain={[0, 100]} />
                                <Tooltip
                                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                />
                                <Legend />
                                <Bar dataKey="engagement" name="This Class" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                                <Bar dataKey="classAvg" name="School Avg" fill="#d1d5db" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Weekly Trend */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                    <div className="mb-6">
                        <h3 className="text-lg font-semibold text-gray-900">Weekly Engagement Trend</h3>
                        <p className="text-sm text-gray-500">Attendance, participation, and assignment completion</p>
                    </div>
                    <div className="h-72 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={weeklyEngagement}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                <XAxis dataKey="week" />
                                <YAxis domain={[60, 100]} />
                                <Tooltip
                                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                />
                                <Legend />
                                <Line type="monotone" dataKey="attendance" name="Attendance" stroke="#22c55e" strokeWidth={2} dot={{ r: 4 }} />
                                <Line type="monotone" dataKey="participation" name="Participation" stroke="#3b82f6" strokeWidth={2} dot={{ r: 4 }} />
                                <Line type="monotone" dataKey="assignments" name="Assignments" stroke="#f59e0b" strokeWidth={2} dot={{ r: 4 }} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* Procrastination Indicators */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="p-4 border-b border-gray-100">
                    <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                        <Clock className="w-5 h-5 text-orange-500" />
                        Procrastination Indicators
                    </h3>
                    <p className="text-sm text-gray-500">Students with consistent last-minute submissions</p>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Student</th>
                                <th className="px-6 py-3 text-center text-xs font-semibold text-gray-600 uppercase">Late Submissions</th>
                                <th className="px-6 py-3 text-center text-xs font-semibold text-gray-600 uppercase">Avg Submit Time</th>
                                <th className="px-6 py-3 text-center text-xs font-semibold text-gray-600 uppercase">Risk Level</th>
                                <th className="px-6 py-3 text-center text-xs font-semibold text-gray-600 uppercase">Trend</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {procrastinationIndicators.map((item) => (
                                <tr key={item.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">{item.student}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-center text-gray-600">{item.lastMinuteSubmissions}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-center text-gray-600">{item.avgSubmitTime}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-center">
                                        <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${getRiskColor(item.riskLevel)}`}>
                                            {item.riskLevel}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-center">
                                        <div className="flex items-center justify-center gap-1">
                                            {getTrendIcon(item.trend)}
                                            <span className="text-xs text-gray-500 capitalize">{item.trend}</span>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Behavior Alerts */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5 text-yellow-500" />
                    Recent Behavior Alerts
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {behaviorAlerts.map((alert) => (
                        <div
                            key={alert.id}
                            className={`p-4 rounded-lg border ${alert.severity === 'danger' ? 'border-red-200 bg-red-50' : 'border-yellow-200 bg-yellow-50'}`}
                        >
                            <p className="font-medium text-gray-900">{alert.student}</p>
                            <p className="text-sm text-gray-600">{alert.type}: {alert.count} times</p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
