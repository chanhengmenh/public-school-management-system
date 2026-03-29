'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import { Users, Mail, MoreVertical } from 'lucide-react';

// Dummy Student Data
interface Student {
    id: string;
    name: string;
    avatar: string;
    email: string;
    studentId: string;
    status: 'Active' | 'Inactive';
}

// TODO: Replace with API call — e.g. const students = await fetchStudentsByClass(subjectId);
const STUDENTS_DATA: Student[] = [
    { id: 's1', name: 'Alex Johnson', avatar: 'AJ', email: 'alex.j@school.edu', studentId: 'STU-2025-001', status: 'Active' },
    { id: 's2', name: 'Maria Garcia', avatar: 'MG', email: 'maria.g@school.edu', studentId: 'STU-2025-002', status: 'Active' },
    { id: 's3', name: 'James Smith', avatar: 'JS', email: 'james.s@school.edu', studentId: 'STU-2025-003', status: 'Active' },
    { id: 's4', name: 'Linda Choo', avatar: 'LC', email: 'linda.c@school.edu', studentId: 'STU-2025-004', status: 'Active' },
    { id: 's5', name: 'Robert Fox', avatar: 'RF', email: 'robert.f@school.edu', studentId: 'STU-2025-005', status: 'Active' },
    { id: 's6', name: 'Emily Davis', avatar: 'ED', email: 'emily.d@school.edu', studentId: 'STU-2025-006', status: 'Active' },
    { id: 's7', name: 'Michael Brown', avatar: 'MB', email: 'michael.b@school.edu', studentId: 'STU-2025-007', status: 'Active' },
    { id: 's8', name: 'Sarah Wilson', avatar: 'SW', email: 'sarah.w@school.edu', studentId: 'STU-2025-008', status: 'Active' },
    { id: 's9', name: 'Daniel Lee', avatar: 'DL', email: 'daniel.l@school.edu', studentId: 'STU-2025-009', status: 'Inactive' },
    { id: 's10', name: 'Jessica Taylor', avatar: 'JT', email: 'jessica.t@school.edu', studentId: 'STU-2025-010', status: 'Active' },
];

export default function TeacherStudentsPage() {
    const params = useParams();
    const subjectId = (params?.subjectId as string) || 'class-1';

    // TODO: Replace STUDENTS_DATA with data fetched from API using subjectId
    const students = STUDENTS_DATA;

    return (
        <div className="flex flex-col space-y-6">
            {/* Top Bar */}
            <div className="flex items-center bg-white p-4 rounded-2xl shadow-sm border border-slate-200">
                <div className="flex items-center gap-2">
                    <Users className="w-5 h-5 text-slate-500" />
                    <span className="text-sm font-bold text-slate-700">{students.length} Students Enrolled</span>
                </div>
            </div>

            {/* Students Table */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 text-xs uppercase tracking-wider font-bold">
                                <th className="p-4 pl-6">Student</th>
                                <th className="p-4">Student ID</th>
                                <th className="p-4">Email</th>
                                <th className="p-4">Status</th>
                                <th className="p-4 pr-6 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {students.map((student) => (
                                <tr key={student.id} className="hover:bg-slate-50/50 transition-colors">
                                    <td className="p-4 pl-6">
                                        <div className="flex items-center gap-3">
                                            <div className="w-9 h-9 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-sm font-bold shrink-0 border border-indigo-200">
                                                {student.avatar}
                                            </div>
                                            <span className="text-sm font-bold text-slate-900">{student.name}</span>
                                        </div>
                                    </td>
                                    <td className="p-4">
                                        <span className="text-sm text-slate-600 font-mono">{student.studentId}</span>
                                    </td>
                                    <td className="p-4">
                                        <div className="flex items-center gap-1.5 text-sm text-slate-500">
                                            <Mail className="w-3.5 h-3.5" />
                                            {student.email}
                                        </div>
                                    </td>
                                    <td className="p-4">
                                        <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-bold border ${student.status === 'Active'
                                            ? 'bg-green-50 text-green-700 border-green-200'
                                            : 'bg-slate-100 text-slate-500 border-slate-200'
                                            }`}>
                                            {student.status}
                                        </span>
                                    </td>
                                    <td className="p-4 pr-6 text-right">
                                        <button className="w-8 h-8 inline-flex items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors">
                                            <MoreVertical className="w-4 h-4" />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {students.length === 0 && (
                    <div className="py-12 flex flex-col items-center justify-center text-center">
                        <Users className="w-12 h-12 text-slate-300 mb-3" />
                        <h3 className="text-lg font-bold text-slate-900 mb-1">No Students Found</h3>
                        <p className="text-sm text-slate-500">No students enrolled in this class.</p>
                    </div>
                )}
            </div>
        </div>
    );
}