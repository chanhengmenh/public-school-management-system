"use client";

import Link from "next/link";
import { studentData } from "@/data/student-data";
import { Calendar, ChevronRight, CheckCircle, XCircle, AlertCircle, FileText, ClipboardList } from "lucide-react";
import { cn } from "@/lib/utils";

export default function StudentAssignmentsPage() {
    // Combine assignments and quizzes
    const assignments = studentData.assignments || [];
    const quizzes = studentData.allQuizzes.map(q => ({ ...q, type: "Quiz" })) || [];

    // Merge and sort by due date (nearest first)
    const allItems = [...assignments, ...quizzes].sort((a, b) => {
        return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
    });

    const getStatusColor = (status: string) => {
        switch (status) {
            case "Open":
            case "Pending":
                return "bg-yellow-100 text-yellow-700";
            case "Upcoming": return "bg-blue-100 text-blue-700";
            case "Submitted": return "bg-green-100 text-green-700";
            case "Closed": return "bg-red-100 text-red-700";
            default: return "bg-gray-100 text-gray-700";
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case "Open":
            case "Pending":
                return <AlertCircle className="h-3 w-3" />;
            case "Upcoming": return <Calendar className="h-3 w-3" />;
            case "Submitted": return <CheckCircle className="h-3 w-3" />;
            case "Closed": return <XCircle className="h-3 w-3" />;
            default: return null;
        }
    };

    const getTypeIcon = (type: string) => {
        return type === "Quiz" ? <FileText className="h-4 w-4 text-purple-500" /> : <ClipboardList className="h-4 w-4 text-blue-500" />;
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-gray-900">Assignments</h1>
                    <p className="text-sm text-gray-500 mt-1">View all your upcoming assignments and quizzes</p>
                </div>
            </div>

            <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-gray-50 text-gray-500">
                            <tr>
                                <th className="px-6 py-4 font-medium">Type</th>
                                <th className="px-6 py-4 font-medium">Title</th>
                                <th className="px-6 py-4 font-medium">Subject</th>
                                <th className="px-6 py-4 font-medium">Deadline</th>
                                <th className="px-6 py-4 font-medium">Status</th>
                                <th className="px-6 py-4 font-medium">Score</th>
                                <th className="px-6 py-4 font-medium">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {allItems.map((item) => (
                                <tr key={`${item.type}-${item.id}`} className="group hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2" title={item.type}>
                                            {getTypeIcon(item.type)}
                                            <span className="text-gray-600 hidden sm:inline">{item.type}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 font-medium text-gray-900">{item.title}</td>
                                    <td className="px-6 py-4 text-gray-500">{item.subject}</td>
                                    <td className="px-6 py-4 text-gray-500">
                                        <div className="flex items-center gap-2">
                                            <Calendar className="h-4 w-4 text-gray-400" />
                                            {new Date(item.dueDate).toLocaleDateString()}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={cn(
                                            "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium",
                                            getStatusColor(item.status)
                                        )}>
                                            {getStatusIcon(item.status)}
                                            {item.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 font-medium text-gray-900">
                                        {item.score !== null ? `${item.score}%` : "-"}
                                    </td>
                                    <td className="px-6 py-4">
                                        {item.status === "Open" || item.status === "Pending" ? (
                                            <Link
                                                href={item.type === "Quiz" ? `/student/quizzes/${item.id}` : `/student/assignments/${item.id}`}
                                                className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-500 font-medium"
                                            >
                                                {item.type === "Quiz" ? "Start Quiz" : "View Details"} <ChevronRight className="h-4 w-4" />
                                            </Link>
                                        ) : (
                                            <span className="text-gray-400 cursor-not-allowed">View Details</span>
                                        )}
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
