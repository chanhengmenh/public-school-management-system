"use client";

import React from "react";
import { adminData } from "@/data/admin-data";
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
    Legend,
    PieChart,
    Pie,
    Cell
} from "recharts";
import {
    Users,
    GraduationCap,
    BookOpen,
    FileText,
    Activity,
    Server,
    Clock,
    HardDrive,
    TrendingUp,
    UserPlus,
    CheckCircle
} from "lucide-react";

export default function AdminDashboard() {
    const { systemStats, userGrowth, dailyActivity, roleDistribution, recentActivity, systemHealth } = adminData;

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-gray-800">Admin Dashboard</h1>
                <p className="text-gray-500">System overview and analytics</p>
            </div>

            {/* System Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-sm font-medium text-gray-500">Total Users</p>
                            <h3 className="text-2xl font-bold text-gray-900 mt-1">{systemStats.totalUsers.toLocaleString()}</h3>
                        </div>
                        <div className="p-2 bg-blue-50 rounded-lg">
                            <Users className="w-5 h-5 text-blue-600" />
                        </div>
                    </div>
                    <div className="mt-3 flex items-center text-sm text-green-600">
                        <TrendingUp className="w-4 h-4 mr-1" />
                        <span>+{systemStats.activeUsers} active</span>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-sm font-medium text-gray-500">Teachers</p>
                            <h3 className="text-2xl font-bold text-gray-900 mt-1">{systemStats.totalTeachers}</h3>
                        </div>
                        <div className="p-2 bg-green-50 rounded-lg">
                            <GraduationCap className="w-5 h-5 text-green-600" />
                        </div>
                    </div>
                    <div className="mt-3 text-sm text-gray-500">
                        Across {systemStats.totalClasses} classes
                    </div>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-sm font-medium text-gray-500">Students</p>
                            <h3 className="text-2xl font-bold text-gray-900 mt-1">{systemStats.totalStudents.toLocaleString()}</h3>
                        </div>
                        <div className="p-2 bg-purple-50 rounded-lg">
                            <BookOpen className="w-5 h-5 text-purple-600" />
                        </div>
                    </div>
                    <div className="mt-3 text-sm text-gray-500">
                        {systemStats.totalClasses} classes enrolled
                    </div>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-sm font-medium text-gray-500">Total Quizzes</p>
                            <h3 className="text-2xl font-bold text-gray-900 mt-1">{systemStats.totalQuizzes}</h3>
                        </div>
                        <div className="p-2 bg-orange-50 rounded-lg">
                            <FileText className="w-5 h-5 text-orange-600" />
                        </div>
                    </div>
                    <div className="mt-3 text-sm text-gray-500">
                        Published assessments
                    </div>
                </div>
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* User Growth Chart */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                    <div className="mb-6">
                        <h3 className="text-lg font-semibold text-gray-900">User Growth</h3>
                        <p className="text-sm text-gray-500">Total vs active users over time</p>
                    </div>
                    <div className="h-72 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={userGrowth}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                <XAxis dataKey="month" />
                                <YAxis />
                                <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                                <Legend />
                                <Line type="monotone" dataKey="users" name="Total Users" stroke="#3b82f6" strokeWidth={2} dot={{ r: 4 }} />
                                <Line type="monotone" dataKey="active" name="Active Users" stroke="#10b981" strokeWidth={2} dot={{ r: 4 }} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Daily Activity Chart */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                    <div className="mb-6">
                        <h3 className="text-lg font-semibold text-gray-900">Daily Activity</h3>
                        <p className="text-sm text-gray-500">Logins, quizzes, and submissions this week</p>
                    </div>
                    <div className="h-72 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={dailyActivity}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                <XAxis dataKey="day" />
                                <YAxis />
                                <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                                <Legend />
                                <Bar dataKey="logins" name="Logins" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                                <Bar dataKey="submissions" name="Submissions" fill="#10b981" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* Bottom Row */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Role Distribution */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                    <div className="mb-4">
                        <h3 className="text-lg font-semibold text-gray-900">User Distribution</h3>
                        <p className="text-sm text-gray-500">Users by role</p>
                    </div>
                    <div className="h-48 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={roleDistribution}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={50}
                                    outerRadius={70}
                                    paddingAngle={2}
                                    dataKey="count"
                                >
                                    {roleDistribution.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Pie>
                                <Tooltip />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                    <div className="flex flex-wrap justify-center gap-4 mt-2">
                        {roleDistribution.map((item) => (
                            <div key={item.role} className="flex items-center gap-2 text-sm">
                                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></div>
                                <span className="text-gray-600">{item.role}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* System Health */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                    <div className="mb-4">
                        <h3 className="text-lg font-semibold text-gray-900">System Health</h3>
                        <p className="text-sm text-gray-500">Current system status</p>
                    </div>
                    <div className="space-y-4">
                        <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                            <div className="flex items-center gap-2">
                                <Server className="w-5 h-5 text-green-600" />
                                <span className="font-medium text-gray-900">Server Status</span>
                            </div>
                            <span className="text-green-600 font-semibold">{systemHealth.serverStatus}</span>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                            <div className="flex items-center gap-2">
                                <Activity className="w-5 h-5 text-blue-600" />
                                <span className="font-medium text-gray-900">Uptime</span>
                            </div>
                            <span className="text-gray-900 font-semibold">{systemHealth.uptime}</span>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                            <div className="flex items-center gap-2">
                                <Clock className="w-5 h-5 text-purple-600" />
                                <span className="font-medium text-gray-900">Response Time</span>
                            </div>
                            <span className="text-gray-900 font-semibold">{systemHealth.responseTime}</span>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                            <div className="flex items-center gap-2">
                                <HardDrive className="w-5 h-5 text-orange-600" />
                                <span className="font-medium text-gray-900">Storage</span>
                            </div>
                            <span className="text-gray-900 font-semibold">{systemStats.storageUsed} / {systemStats.storageLimit}</span>
                        </div>
                    </div>
                </div>

                {/* Recent Activity */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                    <div className="mb-4">
                        <h3 className="text-lg font-semibold text-gray-900">Recent Activity</h3>
                        <p className="text-sm text-gray-500">Latest system events</p>
                    </div>
                    <div className="space-y-3">
                        {recentActivity.map((activity) => (
                            <div key={activity.id} className="flex items-start gap-3 p-2 hover:bg-gray-50 rounded-lg">
                                <div className={`p-1.5 rounded-full mt-0.5 ${activity.type === 'user' ? 'bg-blue-100' :
                                        activity.type === 'quiz' ? 'bg-green-100' :
                                            activity.type === 'class' ? 'bg-purple-100' :
                                                activity.type === 'import' ? 'bg-orange-100' : 'bg-gray-100'
                                    }`}>
                                    {activity.type === 'user' ? <UserPlus className="w-3 h-3 text-blue-600" /> :
                                        activity.type === 'quiz' ? <FileText className="w-3 h-3 text-green-600" /> :
                                            activity.type === 'class' ? <BookOpen className="w-3 h-3 text-purple-600" /> :
                                                <CheckCircle className="w-3 h-3 text-gray-600" />}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-gray-900 truncate">{activity.action}</p>
                                    <p className="text-xs text-gray-500">{activity.user} • {activity.time}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
