"use client";

import { useState } from "react";
import { teacherData } from "@/data/teacher-data";
import { teacherClassesData } from "@/data/teacher-classes";
import {
    Users,
    Search,
    Mail,
    Phone,
    User,
    Filter,
    Percent
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function TeacherPeoplePage() {
    const { assignedClasses, profile } = teacherData;
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedClassId, setSelectedClassId] = useState<string>("all");

    // Filter classes based on selection
    const filteredClasses = selectedClassId === "all"
        ? assignedClasses
        : assignedClasses.filter(c => c.id === selectedClassId);

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">People</h1>
                    <p className="text-gray-500">View and manage all students across your classes</p>
                </div>
                <div className="flex flex-col sm:flex-row gap-3">
                    {/* Class Filter */}
                    <div className="relative">
                        <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                        <select
                            value={selectedClassId}
                            onChange={(e) => setSelectedClassId(e.target.value)}
                            className="appearance-none pl-10 pr-8 py-2 bg-white border border-gray-200 rounded-lg text-gray-600 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm cursor-pointer hover:bg-gray-50 transition-colors w-full sm:w-auto"
                        >
                            <option value="all">All Classes</option>
                            {assignedClasses.map(c => (
                                <option key={c.id} value={c.id}>{c.name}</option>
                            ))}
                        </select>
                    </div>

                    {/* Global Search */}
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <input
                            type="text"
                            placeholder="Search students..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm text-gray-800 placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 w-full sm:w-64 shadow-sm"
                        />
                    </div>
                </div>
            </div>

            {/* Class Lists */}
            <div className="space-y-8">
                {filteredClasses.map((classroom) => {
                    const allStudents = (teacherClassesData as any)[classroom.id] || [];

                    // Filter students based on search term
                    const students = allStudents.filter((student: any) =>
                        student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        student.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        student.email.toLowerCase().includes(searchTerm.toLowerCase())
                    );

                    // Skip rendering class if no students match search (optional, but keeps UI clean)
                    if (searchTerm && students.length === 0) return null;

                    return (
                        <div key={classroom.id} id={`class-${classroom.id}`} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden scroll-mt-24">
                            {/* Class Header */}
                            <div className="px-6 py-4 border-b border-gray-200 bg-gray-50 flex flex-col md:flex-row md:items-center justify-between gap-4">
                                <div>
                                    <div className="flex items-center gap-3 mb-1">
                                        <h2 className="text-lg font-bold text-gray-900">{classroom.name}</h2>
                                        <span className="bg-blue-100 text-blue-700 text-xs px-2 py-0.5 rounded-full font-medium">
                                            {students.length} Students
                                        </span>
                                    </div>
                                    <p className="text-sm text-gray-600 font-medium">Subject Teacher: <span className="text-gray-900">{profile.name}</span></p>
                                </div>
                            </div>

                            {/* Student Table */}
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead className="bg-gray-50/50">
                                        <tr>
                                            <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Student Name</th>
                                            <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">ID</th>
                                            <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Contact Info</th>
                                            <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Guardian</th>
                                            <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Attendance</th>
                                            <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {students.map((student: any) => (
                                            <tr key={student.id} className="hover:bg-gray-50 transition-colors">
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="flex items-center gap-3">
                                                        <div className="h-8 w-8 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 font-bold text-xs">
                                                            {student.name.split(' ').map((n: string) => n[0]).join('').substring(0, 2)}
                                                        </div>
                                                        <span className="font-medium text-gray-900">{student.name}</span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-mono">
                                                    {student.id}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="flex flex-col gap-1">
                                                        <div className="flex items-center gap-1.5 text-sm text-gray-600">
                                                            <Mail size={12} className="text-gray-400" />
                                                            {student.email}
                                                        </div>
                                                        <div className="flex items-center gap-1.5 text-sm text-gray-600">
                                                            <Phone size={12} className="text-gray-400" />
                                                            {student.phone}
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                                    {student.guardian}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="flex items-center gap-2">
                                                        <Percent size={14} className="text-gray-400" />
                                                        <span className={cn(
                                                            "text-sm font-medium",
                                                            parseInt(student.attendance) >= 90 ? "text-green-600" :
                                                                parseInt(student.attendance) >= 75 ? "text-amber-600" : "text-red-600"
                                                        )}>
                                                            {student.attendance}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className={cn(
                                                        "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium",
                                                        student.status === 'Active' ? "bg-green-100 text-green-800" :
                                                            student.status === 'Suspended' ? "bg-red-100 text-red-800" :
                                                                "bg-yellow-100 text-yellow-800"
                                                    )}>
                                                        {student.status}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    );
                })}
                {/* Empty State if search returns nothing */}
                {filteredClasses.every(classroom => {
                    const allStudents = (teacherClassesData as any)[classroom.id] || [];
                    const matchingStudents = allStudents.filter((student: any) =>
                        student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        student.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        student.email.toLowerCase().includes(searchTerm.toLowerCase())
                    );
                    return matchingStudents.length === 0;
                }) && searchTerm && (
                        <div className="text-center py-12 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                            <Users size={48} className="mx-auto text-gray-300 mb-4" />
                            <h3 className="text-lg font-medium text-gray-900">No students found</h3>
                            <p className="text-gray-500">No students match your search term "{searchTerm}"</p>
                        </div>
                    )}
            </div>
        </div>
    );
}
