"use client";

import { studentData } from "@/data/student-data";
import { studentProfile } from "@/data/student-profile";
import { Clock, Calendar, AlertCircle, Users, Activity, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";
import { useRole } from "@/contexts/RoleContext";

// Helper component for icons
import { Calculator, BookOpen, Atom, Globe, Code } from "lucide-react";
import type { ElementType } from "react";

const iconMap: Record<string, ElementType> = {
    Calculator,
    BookOpen,
    Atom,
    Globe,
    Code,
};

export default function StudentDashboard() {
    const { subjects, upcomingQuizzes, announcements } = studentData;
    const { isMonitor } = useRole();

    return (
        <div className="space-y-6">
            {/* Monitor Context Banner */}
            <div className={cn(
                "overflow-hidden transition-all duration-500 ease-in-out",
                isMonitor ? "max-h-40 opacity-100" : "max-h-0 opacity-0"
            )}>
                <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 shadow-sm mb-2 flex items-start gap-3">
                    <div className="rounded-full bg-amber-100 p-2 mt-0.5">
                        <Users className="h-5 w-5 text-amber-600" />
                    </div>
                    <div>
                        <h3 className="text-sm font-semibold text-amber-800">Class Monitor View Active</h3>
                        <p className="text-sm text-amber-700 mt-1">
                            You are currently viewing the dashboard with elevated class monitor privileges. You have access to overview statistics and detailed class attendance records.
                        </p>
                    </div>
                </div>
            </div>

            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-gray-900">
                        Student Dashboard
                    </h1>
                    <p className="text-gray-500">Welcome back, {studentProfile.personal.firstName}!</p>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-500">
                    <Calendar className="h-4 w-4" />
                    <span>{new Date().toLocaleDateString()}</span>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                {/* Main Content - Subjects */}
                <div className="lg:col-span-2 space-y-6">

                    {/* Monitor Overview Widget */}
                    {isMonitor && (
                        <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <div className="flex items-center gap-2">
                                <h2 className="text-lg font-semibold text-gray-900">Class Overview</h2>
                                <span className="inline-flex items-center rounded-md bg-amber-100 px-2 py-1 text-xs font-medium text-amber-700 ring-1 ring-inset ring-amber-600/20">
                                    Monitor Only
                                </span>
                            </div>
                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                                <div className="rounded-xl border border-amber-100 bg-white p-5 shadow-sm">
                                    <div className="flex items-center gap-3">
                                        <div className="rounded-lg bg-amber-50 p-2">
                                            <Users className="h-5 w-5 text-amber-600" />
                                        </div>
                                        <div className="text-sm font-medium text-gray-500">Total Students</div>
                                    </div>
                                    <div className="mt-3 text-2xl font-bold text-gray-900">32</div>
                                </div>
                                <div className="rounded-xl border border-amber-100 bg-white p-5 shadow-sm">
                                    <div className="flex items-center gap-3">
                                        <div className="rounded-lg bg-amber-50 p-2">
                                            <Activity className="h-5 w-5 text-amber-600" />
                                        </div>
                                        <div className="text-sm font-medium text-gray-500">Avg. Attendance</div>
                                    </div>
                                    <div className="mt-3 text-2xl font-bold text-gray-900">92%</div>
                                </div>
                                <div className="rounded-xl border border-amber-100 bg-white p-5 shadow-sm">
                                    <div className="flex items-center gap-3">
                                        <div className="rounded-lg bg-amber-50 p-2">
                                            <AlertTriangle className="h-5 w-5 text-red-600" />
                                        </div>
                                        <div className="text-sm font-medium text-gray-500">At Risk (&lt;75%)</div>
                                    </div>
                                    <div className="mt-3 text-2xl font-bold text-red-600">2</div>
                                </div>
                            </div>
                        </div>
                    )}

                    <h2 className="text-lg font-semibold text-gray-900">Enrolled Courses</h2>
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        {subjects.map((subject) => {
                            // Dynamic Icon
                            const IconComponent = iconMap[subject.icon] || BookOpen;

                            return (
                                <div
                                    key={subject.id}
                                    className="group relative overflow-hidden rounded-xl border border-gray-200 bg-white p-6 shadow-sm transition-all hover:shadow-md"
                                >
                                    <div className={cn("absolute right-0 top-0 h-24 w-24 translate-x-8 translate-y--8 rounded-full opacity-10", subject.color)} />

                                    <div className="mb-4 flex items-start justify-between">
                                        <div className={cn("rounded-lg p-2 text-white", subject.color)}>
                                            <IconComponent className="h-6 w-6" />
                                        </div>
                                        <span className={cn(
                                            "rounded-full px-2 py-1 text-xs font-medium bg-gray-100 text-gray-600",
                                            subject.grade.startsWith('A') && "bg-green-100 text-green-700",
                                            subject.grade.startsWith('B') && "bg-blue-100 text-blue-700",
                                            subject.grade.startsWith('C') && "bg-yellow-100 text-yellow-700",
                                        )}>
                                            Grade: {subject.grade}
                                        </span>
                                    </div>

                                    <h3 className="text-lg font-bold text-gray-900">{subject.name}</h3>
                                    <p className="text-sm text-gray-500 mb-4">{subject.teacher}</p>

                                    <div className="space-y-2">
                                        <div className="flex justify-between text-xs font-medium text-gray-500">
                                            <span>Progress</span>
                                            <span>{subject.progress}%</span>
                                        </div>
                                        <div className="h-2 w-full rounded-full bg-gray-100">
                                            <div
                                                className={cn("h-full rounded-full transition-all", subject.color)}
                                                style={{ width: `${subject.progress}%` }}
                                            />
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Sidebar - Up Next & Announcements */}
                <div className="space-y-6">


                    {/* Upcoming Quizzes */}
                    <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
                        <div className="border-b border-gray-200 px-6 py-4">
                            <h2 className="text-lg font-semibold text-gray-900">Upcoming Quizzes</h2>
                        </div>
                        <div className="divide-y divide-gray-100">
                            {upcomingQuizzes.map((quiz) => (
                                <div key={quiz.id} className="p-4 hover:bg-gray-50 transition-colors">
                                    <div className="mb-1 flex items-start justify-between">
                                        <span className="text-xs font-medium text-blue-600 px-2 py-0.5 rounded bg-blue-50">
                                            {quiz.subject}
                                        </span>
                                        <div className="flex items-center text-xs text-gray-500">
                                            <Clock className="mr-1 h-3 w-3" />
                                            {quiz.duration}
                                        </div>
                                    </div>
                                    <h3 className="font-medium text-gray-900">{quiz.title}</h3>
                                    <p className="mt-1 text-sm text-gray-500 flex items-center">
                                        <Calendar className="mr-1.5 h-3.5 w-3.5" />
                                        {new Date(quiz.dueDate).toLocaleDateString()} at {new Date(quiz.dueDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </p>
                                </div>
                            ))}
                        </div>
                        <div className="border-t border-gray-200 p-4">
                            <button className="w-full text-center text-sm font-medium text-blue-600 hover:text-blue-500">
                                View all quizzes
                            </button>
                        </div>
                    </div>

                    {/* Announcements */}
                    <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
                        <div className="border-b border-gray-200 px-6 py-4 flex items-center justify-between">
                            <h2 className="text-lg font-semibold text-gray-900">Announcements</h2>

                        </div>
                        <div className="divide-y divide-gray-100">
                            {announcements.map((announcement) => (
                                <div key={announcement.id} className="p-4 hover:bg-gray-50 transition-colors">
                                    <div className="flex gap-3">
                                        <div className="flex-shrink-0 mt-0.5">
                                            <AlertCircle className="h-5 w-5 text-amber-500" />
                                        </div>
                                        <div>
                                            <h3 className="text-sm font-medium text-gray-900">{announcement.title}</h3>
                                            <p className="mt-1 text-xs text-gray-500 line-clamp-2">{announcement.content}</p>
                                            <div className="mt-2 flex items-center justify-between">
                                                <span className="text-xs text-gray-400">{announcement.author}</span>
                                                <span className="text-xs text-gray-400">{new Date(announcement.date).toLocaleDateString()}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
