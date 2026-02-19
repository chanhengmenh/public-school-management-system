"use client";

import { teacherData } from "@/data/teacher-data";
import {
    Users,
    Calendar,
    MapPin,
    MoreVertical,
    ClipboardList,
    UserCheck,
    BookOpen
} from "lucide-react";
import Link from "next/link";

export default function TeacherClassesPage() {
    const { assignedClasses } = teacherData;

    return (
        <div className="space-y-8 h-[calc(100vh-8rem)] flex flex-col">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">My Classes</h1>
                    <p className="text-gray-500">Manage your assigned classes and students</p>
                </div>
                <Link href="/teacher/schedule" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors shadow-sm inline-block text-center">
                    View Comprehensive Schedule
                </Link>
            </div>

            {/* Subject Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 shrink-0">
                {assignedClasses.map((classroom) => (
                    <div
                        key={classroom.id}
                        className="bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-all overflow-hidden flex flex-col"
                    >
                        <div className="p-6 flex-1">
                            <div className="flex items-start justify-between mb-4">
                                <div className="h-10 w-10 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600">
                                    <BookOpen size={20} />
                                </div>
                                <button className="text-gray-400 hover:text-gray-600">
                                    <MoreVertical size={18} />
                                </button>
                            </div>

                            <Link href={`/teacher/people?class=${classroom.id}`} className="block group">
                                <h3 className="text-lg font-bold text-gray-900 mb-1 group-hover:text-blue-600 transition-colors">{classroom.name}</h3>
                            </Link>
                            <p className="text-sm text-gray-500 mb-4">{classroom.students} Students Enrolled</p>

                            <div className="space-y-2">
                                <div className="flex items-center gap-2 text-xs text-gray-400">
                                    <Calendar size={14} />
                                    <span>{classroom.schedule}</span>
                                </div>
                                <div className="flex items-center gap-2 text-xs text-gray-400">
                                    <MapPin size={14} />
                                    <span>{classroom.room}</span>
                                </div>
                            </div>
                        </div>

                        <div className="bg-gray-50 border-t border-gray-100 p-2 grid grid-cols-3 gap-1">
                            <Link
                                href={`/teacher/people?class=${classroom.id}`}
                                className="flex flex-col items-center justify-center gap-1 p-2 rounded-lg hover:bg-white hover:shadow-sm transition-all text-gray-600 hover:text-blue-600"
                            >
                                <UserCheck size={16} />
                                <span className="text-[10px] font-medium">Attendance</span>
                            </Link>
                            <button className="flex flex-col items-center justify-center gap-1 p-2 rounded-lg hover:bg-white hover:shadow-sm transition-all text-gray-600 hover:text-blue-600">
                                <ClipboardList size={16} />
                                <span className="text-[10px] font-medium">Grades</span>
                            </button>
                            <Link
                                href={`/teacher/people?class=${classroom.id}`}
                                className="flex flex-col items-center justify-center gap-1 p-2 rounded-lg hover:bg-white hover:shadow-sm transition-all text-gray-600 hover:text-blue-600"
                            >
                                <Users size={16} />
                                <span className="text-[10px] font-medium">Students</span>
                            </Link>
                        </div>
                    </div>
                ))}
            </div>

        </div>
    );
}
