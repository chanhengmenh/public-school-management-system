"use client";

import { behaviorData } from "@/data/behavior-data";
import { teacherData } from "@/data/teacher-data";
import { ShieldCheck, AlertTriangle, Clipboard, Keyboard, Users, Activity, ChevronDown, Filter } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";

export default function BehaviorMonitoringPage() {
    const { summary, students } = behaviorData;
    const { assignedClasses, assignedSubjects } = teacherData;

    const [selectedClass, setSelectedClass] = useState("All Classes");
    const [selectedSubject, setSelectedSubject] = useState("All Subjects");

    // Filtering logic
    const filteredStudents = students.filter(student => {
        const matchesClass = selectedClass === "All Classes" || student.class === assignedClasses.find(c => c.id === selectedClass)?.name;
        const matchesSubject = selectedSubject === "All Subjects" || student.subject === selectedSubject;
        return matchesClass && matchesSubject;
    });

    // Update available subjects based on selected class
    const availableSubjects = selectedClass === "All Classes"
        ? assignedSubjects
        : assignedSubjects.filter(sub => sub.classes.includes(assignedClasses.find(c => c.id === selectedClass)?.name || ""));

    const getRiskColor = (risk: string) => {
        switch (risk) {
            case "high": return "bg-red-100 text-red-700";
            case "medium": return "bg-amber-100 text-amber-700";
            default: return "bg-green-100 text-green-700";
        }
    };

    const getIntegrityColor = (score: number) => {
        if (score >= 90) return "text-green-600";
        if (score >= 70) return "text-amber-600";
        return "text-red-600";
    };

    const getPatternBadge = (pattern: string) => {
        switch (pattern) {
            case "burst": return "bg-red-100 text-red-700";
            case "irregular": return "bg-amber-100 text-amber-700";
            case "moderate": return "bg-blue-100 text-blue-700";
            default: return "bg-green-100 text-green-700";
        }
    };

    return (
        <div className="space-y-6 max-w-7xl mx-auto">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-gray-900">Behavior Monitoring</h1>
                    <p className="text-gray-500">Track student integrity and testing behavior</p>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                    {/* Class Filter */}
                    <div className="relative">
                        <select
                            className="appearance-none bg-white border border-gray-200 text-gray-700 py-2 pl-4 pr-10 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm font-medium cursor-pointer"
                            value={selectedClass}
                            onChange={(e) => {
                                setSelectedClass(e.target.value);
                                setSelectedSubject("All Subjects"); // Reset subject when class changes
                            }}
                        >
                            <option value="All Classes">All Classes</option>
                            {assignedClasses.map(c => (
                                <option key={c.id} value={c.id}>{c.name}</option>
                            ))}
                        </select>
                        <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4 pointer-events-none" />
                    </div>

                    {/* Subject Filter */}
                    <div className="relative">
                        <select
                            className="appearance-none bg-white border border-gray-200 text-gray-700 py-2 pl-4 pr-10 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm font-medium cursor-pointer"
                            value={selectedSubject}
                            onChange={(e) => setSelectedSubject(e.target.value)}
                        >
                            <option>All Subjects</option>
                            {availableSubjects.map(sub => (
                                <option key={sub.id} value={sub.name}>{sub.name}</option>
                            ))}
                        </select>
                        <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4 pointer-events-none" />
                    </div>
                </div>
            </div>

            {/* Summary Cards - Updated to use length of filtered list for basic stats, though mock summary is static */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <SummaryCard
                    title="Total Students"
                    value={filteredStudents.length}
                    icon={Users}
                    color="blue"
                />
                <SummaryCard
                    title="Avg. Integrity Score"
                    value={filteredStudents.length > 0
                        ? `${Math.round(filteredStudents.reduce((acc, s) => acc + s.integrityScore, 0) / filteredStudents.length)}%`
                        : "N/A"}
                    icon={ShieldCheck}
                    color="green"
                />
                <SummaryCard
                    title="Quizzes Monitored"
                    value={summary.totalQuizzes}
                    icon={Activity}
                    color="purple"
                />
                <SummaryCard
                    title="Flagged Students"
                    value={filteredStudents.filter(s => s.riskLevel === "high" || s.riskLevel === "medium").length}
                    icon={AlertTriangle}
                    color="red"
                />
            </div>

            {/* Typing Behavior Summary */}
            <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
                <div className="border-b border-gray-200 px-6 py-4">
                    <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                        <Keyboard className="h-5 w-5 text-gray-400" />
                        Typing Behavior Summary
                    </h2>
                </div>
                <div className="p-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
                    <div className="text-center p-4 rounded-lg bg-green-50">
                        <p className="text-3xl font-bold text-green-600">
                            {filteredStudents.filter((s) => s.typingPattern === "consistent").length}
                        </p>
                        <p className="text-sm text-gray-600 mt-1">Consistent Typing</p>
                        <p className="text-xs text-gray-400">Normal patterns detected</p>
                    </div>
                    <div className="text-center p-4 rounded-lg bg-amber-50">
                        <p className="text-3xl font-bold text-amber-600">
                            {filteredStudents.filter((s) => s.typingPattern === "moderate" || s.typingPattern === "irregular").length}
                        </p>
                        <p className="text-sm text-gray-600 mt-1">Irregular Typing</p>
                        <p className="text-xs text-gray-400">Needs review</p>
                    </div>
                    <div className="text-center p-4 rounded-lg bg-red-50">
                        <p className="text-3xl font-bold text-red-600">
                            {filteredStudents.filter((s) => s.typingPattern === "burst").length}
                        </p>
                        <p className="text-sm text-gray-600 mt-1">Burst Typing</p>
                        <p className="text-xs text-gray-400">Potential copy-paste</p>
                    </div>
                </div>
            </div>

            {/* Student Integrity Table */}
            <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
                <div className="border-b border-gray-200 px-6 py-4 flex items-center justify-between">
                    <h2 className="text-lg font-semibold text-gray-900">Student Integrity Scores</h2>
                    <span className="text-sm text-gray-500">Showing {filteredStudents.length} students</span>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-gray-50 text-gray-500">
                            <tr>
                                <th className="px-6 py-4 font-medium">Student</th>
                                <th className="px-6 py-4 font-medium">Class</th>
                                <th className="px-6 py-4 font-medium">Subject</th>
                                <th className="px-6 py-4 font-medium">
                                    <span className="flex items-center gap-1">
                                        <ShieldCheck className="h-4 w-4" />
                                        Integrity
                                    </span>
                                </th>
                                <th className="px-6 py-4 font-medium">
                                    <span className="flex items-center gap-1">
                                        <Clipboard className="h-4 w-4" />
                                        Copy/Paste
                                    </span>
                                </th>
                                <th className="px-6 py-4 font-medium">Tab Switches</th>
                                <th className="px-6 py-4 font-medium">
                                    <span className="flex items-center gap-1">
                                        <Keyboard className="h-4 w-4" />
                                        Typing
                                    </span>
                                </th>
                                <th className="px-6 py-4 font-medium">Risk Level</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {filteredStudents.length > 0 ? (
                                filteredStudents.map((student) => (
                                    <tr key={student.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4">
                                            <p className="font-medium text-gray-900">{student.name}</p>
                                            <p className="text-xs text-gray-500">{student.id}</p>
                                        </td>
                                        <td className="px-6 py-4 text-gray-600">{student.class}</td>
                                        <td className="px-6 py-4 text-gray-600">
                                            {/* @ts-ignore - we added subject to data but interface might not be updated in separate file (mock) */}
                                            {student.subject || "N/A"}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={cn("text-lg font-bold", getIntegrityColor(student.integrityScore))}>
                                                {student.integrityScore}%
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={cn(
                                                "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium",
                                                student.copyPasteEvents > 5 ? "bg-red-100 text-red-700" :
                                                    student.copyPasteEvents > 2 ? "bg-amber-100 text-amber-700" : "bg-gray-100 text-gray-600"
                                            )}>
                                                {student.copyPasteEvents} events
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={cn(
                                                "text-sm",
                                                student.tabSwitches > 10 ? "text-red-600 font-medium" :
                                                    student.tabSwitches > 5 ? "text-amber-600" : "text-gray-600"
                                            )}>
                                                {student.tabSwitches}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div>
                                                <span className={cn(
                                                    "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium capitalize",
                                                    getPatternBadge(student.typingPattern)
                                                )}>
                                                    {student.typingPattern}
                                                </span>
                                                <p className="text-xs text-gray-400 mt-1">{student.avgTypingSpeed} WPM</p>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={cn(
                                                "inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium capitalize",
                                                getRiskColor(student.riskLevel)
                                            )}>
                                                {student.riskLevel === "high" && <AlertTriangle className="h-3 w-3" />}
                                                {student.riskLevel}
                                            </span>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={8} className="px-6 py-12 text-center text-gray-500">
                                        No students found matching the selected filters.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

function SummaryCard({
    title,
    value,
    icon: Icon,
    color,
}: {
    title: string;
    value: number | string;
    icon: React.ElementType;
    color: "blue" | "green" | "purple" | "red";
}) {
    const colorClasses = {
        blue: "bg-blue-100 text-blue-600",
        green: "bg-green-100 text-green-600",
        purple: "bg-purple-100 text-purple-600",
        red: "bg-red-100 text-red-600",
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
                </div>
            </div>
        </div>
    );
}
