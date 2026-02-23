"use client";

import React from "react";
import { homeClassData } from "@/data/home-class-data";
import {
    Users,
    BookOpen,
    GraduationCap,
    Clock,
    AlertCircle,
    CheckCircle,
    XCircle,
    User,
    MoreVertical
} from "lucide-react";

export default function HomeClassPage() {
    const { classInfo, students, subjectSummaries, recentActivities } = homeClassData;

    return (
        <div className="space-y-6">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                        <Users className="w-6 h-6 text-blue-600" />
                        {classInfo.name} Overview
                    </h1>
                    <p className="text-gray-500">
                        {classInfo.academicYear} • Room {classInfo.room} • {classInfo.totalStudents} Students
                    </p>
                </div>
                <div className="flex gap-3">
                    <div className="bg-white px-4 py-2 rounded-lg border border-gray-200 shadow-sm flex items-center gap-2">
                        <span className="text-sm text-gray-500">Attendance:</span>
                        <span className="font-semibold text-green-600">{classInfo.attendanceToday}</span>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Column: Student List */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                        <div className="p-4 border-b border-gray-100 flex items-center justify-between">
                            <h2 className="font-semibold text-gray-800 flex items-center gap-2">
                                <GraduationCap className="w-5 h-5 text-gray-500" />
                                Student Roster
                            </h2>
                            <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">
                                View All
                            </button>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Student</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Avg. Grade</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Risk Level</th>
                                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {students.map((student) => (
                                        <tr key={student.id} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-xs">
                                                        {student.avatar}
                                                    </div>
                                                    <div>
                                                        <div className="font-medium text-gray-900">{student.name}</div>
                                                        <div className="text-xs text-gray-500">ID: {student.id}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full 
                                                    ${student.status === 'Present' ? 'bg-green-100 text-green-800' :
                                                        student.status === 'Absent' ? 'bg-red-100 text-red-800' :
                                                            'bg-yellow-100 text-yellow-800'}`}>
                                                    {student.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                                                {student.averageGrade}%
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`flex items-center gap-1 text-xs font-medium
                                                    ${student.riskLevel === 'low' ? 'text-green-600' :
                                                        student.riskLevel === 'medium' ? 'text-yellow-600' :
                                                            'text-red-600'}`}>
                                                    <div className={`w-2 h-2 rounded-full 
                                                        ${student.riskLevel === 'low' ? 'bg-green-500' :
                                                            student.riskLevel === 'medium' ? 'bg-yellow-500' :
                                                                'bg-red-500'}`} />
                                                    {student.riskLevel.charAt(0).toUpperCase() + student.riskLevel.slice(1)}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                <button className="text-gray-400 hover:text-gray-600">
                                                    <MoreVertical className="w-4 h-4" />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                {/* Right Column: Subject & Activities */}
                <div className="space-y-6">
                    {/* Subject Summaries */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200">
                        <div className="p-4 border-b border-gray-100 flex items-center justify-between">
                            <h2 className="font-semibold text-gray-800 flex items-center gap-2">
                                <BookOpen className="w-5 h-5 text-gray-500" />
                                Subject Performance
                            </h2>
                        </div>
                        <div className="p-4 space-y-4">
                            {subjectSummaries.map((subject) => (
                                <div key={subject.id} className="p-3 bg-gray-50 rounded-lg border border-gray-100 hover:border-blue-200 transition-colors">
                                    <div className="flex justify-between items-start mb-2">
                                        <div>
                                            <h3 className="font-medium text-gray-900">{subject.name}</h3>
                                            <p className="text-xs text-gray-500">{subject.teacher}</p>
                                        </div>
                                        <span className={`text-sm font-bold ${subject.classAverage >= 80 ? 'text-green-600' : subject.classAverage >= 70 ? 'text-yellow-600' : 'text-red-600'}`}>
                                            {subject.classAverage}%
                                        </span>
                                    </div>
                                    <div className="w-full bg-gray-200 rounded-full h-1.5 mb-2">
                                        <div
                                            className="bg-blue-600 h-1.5 rounded-full"
                                            style={{ width: `${subject.progress}%` }}
                                        ></div>
                                    </div>
                                    {subject.alerts.length > 0 && (
                                        <div className="flex items-center gap-1.5 text-xs text-red-600 mt-2">
                                            <AlertCircle className="w-3 h-3" />
                                            {subject.alerts[0]}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Recent Activities */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200">
                        <div className="p-4 border-b border-gray-100 flex items-center justify-between">
                            <h2 className="font-semibold text-gray-800 flex items-center gap-2">
                                <Clock className="w-5 h-5 text-gray-500" />
                                Recent Activity
                            </h2>
                        </div>
                        <div className="p-4 space-y-4">
                            {recentActivities.map((activity) => (
                                <div key={activity.id} className="flex gap-3">
                                    <div className={`mt-1 min-w-2 w-2 h-2 rounded-full 
                                        ${activity.type === 'success' ? 'bg-green-500' :
                                            activity.type === 'warning' ? 'bg-yellow-500' :
                                                'bg-red-500'}`}></div>
                                    <div>
                                        <p className="text-sm text-gray-800">
                                            <span className="font-medium">{activity.student}</span> {activity.action}
                                        </p>
                                        <p className="text-xs text-gray-500">{activity.time}</p>
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
