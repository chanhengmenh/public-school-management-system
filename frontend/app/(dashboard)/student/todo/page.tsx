"use client";

import { studentData } from "@/data/student-data";
import { CheckCircle, Clock, AlertCircle, FileText, ClipboardList, Calendar } from "lucide-react";
import { cn } from "@/lib/utils";

export default function StudentTodoPage() {
    // Filter pending/upcoming assignments
    const pendingAssignments = studentData.grades;
    const allAssignments: any[] = [];

    // Extract assignments from grades structure since that's where they seem to be stored in detail
    // Actually, looking at student-data.ts, there is a top-level 'assignments' array and 'allQuizzes' array
    // Let's use those as they seem more direct for a "To Do" list

    const assignments = studentData.assignments.filter(
        a => a.status === "Pending" || a.status === "Upcoming"
    ).map(a => ({
        ...a,
        category: "Assignment",
        icon: ClipboardList
    }));

    const quizzes = studentData.allQuizzes.filter(
        q => q.status === "Open" || q.status === "Upcoming"
    ).map(q => ({
        ...q,
        category: "Quiz",
        icon: FileText
    }));

    // Define a type for the combined items
    type TodoItem = {
        id: string;
        title: string;
        subject: string;
        dueDate: string;
        status: string;
        category: string;
        icon: any;
        duration?: string;
        [key: string]: any;
    };

    // Combine and sort by due date
    const todoItems: TodoItem[] = [...assignments, ...quizzes].sort((a, b) =>
        new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
    );

    const getUrgencyColor = (dueDate: string) => {
        const now = new Date();
        const due = new Date(dueDate);
        const diffDays = Math.ceil((due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

        if (diffDays < 0) return "bg-red-100 text-red-700 border-red-200"; // Overdue
        if (diffDays <= 2) return "bg-amber-100 text-amber-700 border-amber-200"; // Due soon
        return "bg-white border-gray-200"; // Normal
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString("en-US", {
            weekday: 'short',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-gray-900">To Do List</h1>
                    <p className="text-sm text-gray-500">Keep track of your pending assignments and quizzes</p>
                </div>
                <div className="bg-blue-50 text-blue-700 px-4 py-2 rounded-lg text-sm font-medium">
                    {todoItems.length} Pending Tasks
                </div>
            </div>

            <div className="grid gap-4">
                {todoItems.length > 0 ? (
                    todoItems.map((item) => (
                        <div
                            key={`${item.category}-${item.id}`}
                            className={cn(
                                "flex flex-col sm:flex-row sm:items-center justify-between p-5 rounded-xl border shadow-sm transition-all hover:shadow-md",
                                getUrgencyColor(item.dueDate) === "bg-white border-gray-200" ? "bg-white border-gray-200 hover:border-blue-300" : getUrgencyColor(item.dueDate)
                            )}
                        >
                            <div className="flex items-start gap-4">
                                <div className={cn(
                                    "p-3 rounded-full shrink-0",
                                    item.category === "Quiz" ? "bg-purple-100 text-purple-600" : "bg-blue-100 text-blue-600"
                                )}>
                                    <item.icon className="h-6 w-6" />
                                </div>
                                <div>
                                    <div className="flex items-center gap-2 mb-1">
                                        <h3 className="font-semibold text-lg text-gray-900">{item.title}</h3>
                                        <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 font-medium border border-gray-200">
                                            {item.subject}
                                        </span>
                                        {item.status === "Upcoming" && (
                                            <span className="text-xs px-2 py-0.5 rounded-full bg-blue-50 text-blue-600 font-medium border border-blue-100">
                                                Upcoming
                                            </span>
                                        )}
                                    </div>
                                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-gray-600">
                                        <div className="flex items-center gap-1">
                                            <Clock className="h-4 w-4" />
                                            Due: {formatDate(item.dueDate)}
                                        </div>
                                        {item.duration && (
                                            <div className="flex items-center gap-1">
                                                <Clock className="h-4 w-4" />
                                                Duration: {item.duration}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="mt-4 sm:mt-0">
                                <button className="w-full sm:w-auto px-4 py-2 bg-white border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors shadow-sm">
                                    Mark as Done
                                </button>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="text-center py-12 bg-white rounded-xl border border-gray-200 border-dashed">
                        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 text-green-600 mb-4">
                            <CheckCircle className="h-8 w-8" />
                        </div>
                        <h3 className="text-lg font-medium text-gray-900">All caught up!</h3>
                        <p className="text-gray-500 mt-1">You have no pending assignments or quizzes.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
