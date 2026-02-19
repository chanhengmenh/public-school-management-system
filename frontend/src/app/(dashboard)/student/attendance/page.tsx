"use client";

import { studentData } from "@/data/student-data";
import { CheckCircle, XCircle, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

export default function StudentAttendancePage() {
    const { attendance } = studentData;
    const { summary, records } = attendance;

    const getStatusIcon = (status: string) => {
        switch (status) {
            case "Present": return <CheckCircle className="h-5 w-5 text-green-600" />;
            case "Absent": return <XCircle className="h-5 w-5 text-red-600" />;
            case "Late": return <Clock className="h-5 w-5 text-yellow-600" />;
            default: return null;
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case "Present": return "bg-green-100 text-green-700";
            case "Absent": return "bg-red-100 text-red-700";
            case "Late": return "bg-yellow-100 text-yellow-700";
            default: return "bg-gray-100 text-gray-700";
        }
    };

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold tracking-tight text-gray-900">Attendance</h1>

            {/* Summary Cards */}
            <div className="grid gap-4 md:grid-cols-4">
                <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
                    <div className="text-sm font-medium text-gray-500">Present</div>
                    <div className="mt-2 text-3xl font-bold text-green-600">{summary.present}</div>
                    <div className="text-xs text-gray-400 mt-1">days</div>
                </div>
                <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
                    <div className="text-sm font-medium text-gray-500">Late</div>
                    <div className="mt-2 text-3xl font-bold text-yellow-600">{summary.late}</div>
                    <div className="text-xs text-gray-400 mt-1">days</div>
                </div>
                <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
                    <div className="text-sm font-medium text-gray-500">Absent</div>
                    <div className="mt-2 text-3xl font-bold text-red-600">{summary.absent}</div>
                    <div className="text-xs text-gray-400 mt-1">days</div>
                </div>
                <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
                    <div className="text-sm font-medium text-gray-500">Attendance Rate</div>
                    <div className="mt-2 text-3xl font-bold text-blue-600">{summary.percentage}%</div>
                    <div className="text-xs text-gray-400 mt-1">overall</div>
                </div>
            </div>

            {/* Attendance Records */}
            <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200">
                    <h2 className="text-lg font-semibold text-gray-900">Recent History</h2>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-gray-50 text-gray-500">
                            <tr>
                                <th className="px-6 py-4 font-medium">Date</th>
                                <th className="px-6 py-4 font-medium">Subject</th>
                                <th className="px-6 py-4 font-medium">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {records.map((record) => (
                                <tr key={record.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4 text-gray-900 font-medium">
                                        {new Date(record.date).toLocaleDateString()}
                                    </td>
                                    <td className="px-6 py-4 text-gray-500">{record.subject}</td>
                                    <td className="px-6 py-4">
                                        <span className={cn(
                                            "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium",
                                            getStatusColor(record.status)
                                        )}>
                                            {getStatusIcon(record.status)}
                                            {record.status}
                                        </span>
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
