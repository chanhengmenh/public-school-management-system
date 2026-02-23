"use client";

import { studentData } from "@/data/student-data";
import { studentProfile } from "@/data/student-profile";
import { mockClassAttendance } from "@/data/mockAttendance";
import { CheckCircle, XCircle, Clock, Users } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { useRole } from "@/contexts/RoleContext";
import { DraftAttendanceModal } from "@/components/student/DraftAttendanceModal";

export default function StudentAttendancePage() {
    const { attendance } = studentData;
    const { summary, records } = attendance;
    const { isMonitor } = useRole();
    const [isDraftModalOpen, setIsDraftModalOpen] = useState(false);

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
        <div className="space-y-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <h1 className="text-2xl font-bold tracking-tight text-gray-900">
                    {isMonitor ? "Class & Personal Attendance" : "My Attendance"}
                </h1>
                {isMonitor && (
                    <div className="flex items-center gap-3">
                        <span className="inline-flex items-center rounded-md bg-amber-100 px-3 py-1.5 text-sm font-medium text-amber-800 ring-1 ring-inset ring-amber-600/20">
                            <Users className="mr-2 h-4 w-4" /> Monitor View Active
                        </span>
                        <button
                            onClick={() => setIsDraftModalOpen(true)}
                            className="inline-flex items-center justify-center rounded-lg bg-amber-500 px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-amber-600 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2"
                        >
                            Draft Today&apos;s Attendance
                        </button>
                    </div>
                )}
            </div>

            {/* Personal Attendance Summary */}
            <div className="space-y-4">
                <h2 className="text-lg font-semibold text-gray-900">Personal Summary</h2>

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
                        <h3 className="font-semibold text-gray-900">Recent History</h3>
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

            {/* Class Monitor View */}
            {isMonitor && (
                <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-700 mt-8 border-t border-gray-200 pt-8">
                    <div className="flex items-center gap-2 mb-2">
                        <h2 className="text-xl font-bold text-gray-900">Class Roster Overview</h2>
                        <span className="inline-flex items-center rounded-md bg-amber-100 px-2 py-1 text-xs font-medium text-amber-700 ring-1 ring-inset ring-amber-600/20">
                            Monitor Only
                        </span>
                    </div>

                    <div className="rounded-xl border border-amber-200 bg-white shadow-sm overflow-hidden ring-1 ring-amber-100">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm">
                                <thead className="bg-amber-50 text-amber-800">
                                    <tr>
                                        <th className="px-6 py-4 font-semibold">No.</th>
                                        <th className="px-6 py-4 font-semibold">Student Name</th>
                                        <th className="px-6 py-4 font-semibold">Present</th>
                                        <th className="px-6 py-4 font-semibold">Absent</th>
                                        <th className="px-6 py-4 font-semibold">Late</th>
                                        <th className="px-6 py-4 font-semibold">Last Status</th>
                                        <th className="px-6 py-4 font-semibold">Rate</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-amber-100 border-t border-amber-200">
                                    {mockClassAttendance.map((student, index) => (
                                        <tr key={student.id} className="hover:bg-amber-50/50 transition-colors">
                                            <td className="px-6 py-4 text-gray-500">{index + 1}</td>
                                            <td className="px-6 py-4 font-medium text-gray-900">{student.name}</td>
                                            <td className="px-6 py-4 text-green-600 font-medium">{student.present}</td>
                                            <td className="px-6 py-4 text-red-600 font-medium">{student.absent}</td>
                                            <td className="px-6 py-4 text-yellow-600 font-medium">{student.late}</td>
                                            <td className="px-6 py-4">
                                                <span className={cn(
                                                    "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium",
                                                    getStatusColor(student.lastStatus)
                                                )}>
                                                    {getStatusIcon(student.lastStatus)}
                                                    {student.lastStatus}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 min-w-[140px]">
                                                <div className="flex items-center gap-2">
                                                    <span className={cn(
                                                        "font-medium",
                                                        student.rate >= 90 ? "text-green-600" :
                                                            student.rate >= 75 ? "text-amber-600" : "text-red-600"
                                                    )}>
                                                        {student.rate}%
                                                    </span>
                                                    <div className="h-1.5 w-16 rounded-full bg-gray-100 overflow-hidden">
                                                        <div
                                                            className={cn(
                                                                "h-full rounded-full",
                                                                student.rate >= 90 ? "bg-green-500" :
                                                                    student.rate >= 75 ? "bg-amber-500" : "bg-red-500"
                                                            )}
                                                            style={{ width: `${student.rate}%` }}
                                                        />
                                                    </div>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}

            <DraftAttendanceModal
                isOpen={isDraftModalOpen}
                onClose={() => setIsDraftModalOpen(false)}
            />
        </div>
    );
}
