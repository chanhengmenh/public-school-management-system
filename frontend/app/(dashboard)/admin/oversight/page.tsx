"use client";

import React, { useState } from "react";
import {
    Shield,
    Activity,
    AlertTriangle,
    CheckCircle,
    XCircle,
    Clock,
    User,
    FileText,
    Search,
    Filter,
    TrendingUp,
    TrendingDown
} from "lucide-react";
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell
} from "recharts";

const usageLogs = [
    { id: 1, user: "Preap Sovath", action: "Quiz Submission", resource: "Math Quiz #5", time: "2 minutes ago", status: "success", ip: "192.168.1.45" },
    { id: 2, user: "Bopha Chan", action: "Login", resource: "Student Portal", time: "5 minutes ago", status: "success", ip: "192.168.1.102" },
    { id: 3, user: "Dara Sok", action: "Quiz Submission", resource: "Physics Quiz #3", time: "8 minutes ago", status: "flagged", ip: "192.168.1.78" },
    { id: 4, user: "Mr. Tep Rendaro", action: "Quiz Published", resource: "English Essay #2", time: "15 minutes ago", status: "success", ip: "192.168.1.10" },
    { id: 5, user: "Vibol Lim", action: "Failed Login", resource: "Student Portal", time: "20 minutes ago", status: "failed", ip: "192.168.1.55" },
    { id: 6, user: "Nary Thy", action: "Quiz Submission", resource: "Chemistry Quiz #4", time: "25 minutes ago", status: "success", ip: "192.168.1.88" },
    { id: 7, user: "Admin User", action: "User Deactivated", resource: "Dara Sok", time: "30 minutes ago", status: "success", ip: "192.168.1.1" },
    { id: 8, user: "Keo Romjong", action: "Grade Updated", resource: "10-A Class", time: "45 minutes ago", status: "success", ip: "192.168.1.15" },
];

const integrityData = {
    stats: {
        totalSubmissions: 1247,
        flaggedSubmissions: 23,
        averageIntegrity: 94.2,
        atRiskStudents: 5,
    },
    weeklyFlags: [
        { day: "Mon", flags: 3 },
        { day: "Tue", flags: 5 },
        { day: "Wed", flags: 2 },
        { day: "Thu", flags: 8 },
        { day: "Fri", flags: 5 },
    ],
    flagTypes: [
        { name: "Tab Switch", value: 12, color: "#f59e0b" },
        { name: "Copy/Paste", value: 6, color: "#ef4444" },
        { name: "Time Anomaly", value: 3, color: "#8b5cf6" },
        { name: "Browser Tools", value: 2, color: "#3b82f6" },
    ],
};

export default function SystemOversightPage() {
    const [searchTerm, setSearchTerm] = useState("");
    const [filterStatus, setFilterStatus] = useState("all");

    const filteredLogs = usageLogs.filter(log => {
        const matchesSearch = log.user.toLowerCase().includes(searchTerm.toLowerCase()) ||
            log.action.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = filterStatus === "all" || log.status === filterStatus;
        return matchesSearch && matchesStatus;
    });

    const getStatusBadge = (status: string) => {
        if (status === "success") return <span className="flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-700"><CheckCircle className="w-3 h-3" />Success</span>;
        if (status === "failed") return <span className="flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-700"><XCircle className="w-3 h-3" />Failed</span>;
        return <span className="flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full bg-yellow-100 text-yellow-700"><AlertTriangle className="w-3 h-3" />Flagged</span>;
    };

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                    <Shield className="w-6 h-6 text-indigo-600" />
                    System Oversight
                </h1>
                <p className="text-gray-500">Monitor usage logs and integrity metrics</p>
            </div>

            {/* Integrity Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-200">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-sm font-medium text-gray-500">Total Submissions</p>
                            <h3 className="text-2xl font-bold text-gray-900 mt-1">{integrityData.stats.totalSubmissions.toLocaleString()}</h3>
                        </div>
                        <div className="p-2 bg-blue-50 rounded-lg">
                            <FileText className="w-5 h-5 text-blue-600" />
                        </div>
                    </div>
                </div>
                <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-200">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-sm font-medium text-gray-500">Flagged Submissions</p>
                            <h3 className="text-2xl font-bold text-yellow-600 mt-1">{integrityData.stats.flaggedSubmissions}</h3>
                        </div>
                        <div className="p-2 bg-yellow-50 rounded-lg">
                            <AlertTriangle className="w-5 h-5 text-yellow-600" />
                        </div>
                    </div>
                    <div className="mt-2 flex items-center text-sm text-yellow-600">
                        <TrendingUp className="w-4 h-4 mr-1" />
                        <span>+3 from last week</span>
                    </div>
                </div>
                <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-200">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-sm font-medium text-gray-500">Avg Integrity Score</p>
                            <h3 className="text-2xl font-bold text-green-600 mt-1">{integrityData.stats.averageIntegrity}%</h3>
                        </div>
                        <div className="p-2 bg-green-50 rounded-lg">
                            <Shield className="w-5 h-5 text-green-600" />
                        </div>
                    </div>
                    <div className="mt-2 flex items-center text-sm text-green-600">
                        <TrendingUp className="w-4 h-4 mr-1" />
                        <span>+1.2% from last week</span>
                    </div>
                </div>
                <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-200">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-sm font-medium text-gray-500">At-Risk Students</p>
                            <h3 className="text-2xl font-bold text-red-600 mt-1">{integrityData.stats.atRiskStudents}</h3>
                        </div>
                        <div className="p-2 bg-red-50 rounded-lg">
                            <User className="w-5 h-5 text-red-600" />
                        </div>
                    </div>
                    <div className="mt-2 flex items-center text-sm text-red-600">
                        <TrendingDown className="w-4 h-4 mr-1" />
                        <span>-2 from last week</span>
                    </div>
                </div>
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Weekly Flags Chart */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Weekly Integrity Flags</h3>
                    <div className="h-56 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={integrityData.weeklyFlags}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                <XAxis dataKey="day" />
                                <YAxis />
                                <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                                <Bar dataKey="flags" name="Flags" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Flag Types Distribution */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Flag Types Distribution</h3>
                    <div className="flex items-center">
                        <div className="h-48 w-48">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={integrityData.flagTypes}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={40}
                                        outerRadius={70}
                                        paddingAngle={2}
                                        dataKey="value"
                                    >
                                        {integrityData.flagTypes.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                        <div className="flex-1 space-y-2 ml-4">
                            {integrityData.flagTypes.map((item) => (
                                <div key={item.name} className="flex items-center justify-between text-sm">
                                    <div className="flex items-center gap-2">
                                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></div>
                                        <span className="text-gray-600">{item.name}</span>
                                    </div>
                                    <span className="font-medium text-gray-900">{item.value}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Usage Logs */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="p-4 border-b border-gray-100">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                            <Activity className="w-5 h-5 text-indigo-600" />
                            Usage Logs
                        </h3>
                        <div className="flex gap-3">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Search logs..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="pl-10 pr-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-indigo-500 text-gray-900 text-sm"
                                />
                            </div>
                            <select
                                value={filterStatus}
                                onChange={(e) => setFilterStatus(e.target.value)}
                                className="px-3 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-indigo-500 text-gray-900 text-sm"
                            >
                                <option value="all">All Status</option>
                                <option value="success">Success</option>
                                <option value="failed">Failed</option>
                                <option value="flagged">Flagged</option>
                            </select>
                        </div>
                    </div>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50 border-b border-gray-200">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">User</th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Action</th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Resource</th>
                                <th className="px-6 py-3 text-center text-xs font-semibold text-gray-600 uppercase">Status</th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">IP Address</th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Time</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {filteredLogs.map((log) => (
                                <tr key={log.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-3 whitespace-nowrap">
                                        <div className="flex items-center gap-2">
                                            <div className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 font-medium text-xs">
                                                {log.user.split(" ").map(n => n[0]).join("").slice(0, 2)}
                                            </div>
                                            <span className="font-medium text-gray-900 text-sm">{log.user}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-3 whitespace-nowrap text-sm text-gray-700">{log.action}</td>
                                    <td className="px-6 py-3 whitespace-nowrap text-sm text-gray-500">{log.resource}</td>
                                    <td className="px-6 py-3 whitespace-nowrap text-center">{getStatusBadge(log.status)}</td>
                                    <td className="px-6 py-3 whitespace-nowrap text-sm text-gray-500 font-mono">{log.ip}</td>
                                    <td className="px-6 py-3 whitespace-nowrap text-sm text-gray-500">
                                        <div className="flex items-center gap-1">
                                            <Clock className="w-3.5 h-3.5" />
                                            {log.time}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
