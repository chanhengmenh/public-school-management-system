'use client';

import React, { useState } from 'react';
import { ClipboardCheck } from 'lucide-react';
import PageHeader from '@/components/layouts/PageHeader';

type AttendanceStatus = 'Present' | 'Absent' | 'Late';

interface Student {
    id: number;
    name: string;
    avatar: string;
    status: AttendanceStatus;
}

const initialStudents: Student[] = [
    { id: 1, name: 'Emma Wilson', avatar: 'E', status: 'Present' },
    { id: 2, name: 'Liam Chen', avatar: 'L', status: 'Present' },
    { id: 3, name: 'Olivia Garcia', avatar: 'O', status: 'Present' },
    { id: 4, name: 'Noah Patel', avatar: 'N', status: 'Present' },
    { id: 5, name: 'Ava Smith', avatar: 'A', status: 'Present' },
    { id: 6, name: 'William Jones', avatar: 'W', status: 'Present' },
];

export default function DraftAttendancePage() {
    const [students, setStudents] = useState<Student[]>(initialStudents);
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [subject, setSubject] = useState('Physics');
    const [session, setSession] = useState('8:00 AM');

    const handleStatusChange = (id: number, newStatus: AttendanceStatus) => {
        setStudents(current =>
            current.map(student =>
                student.id === id ? { ...student, status: newStatus } : student
            )
        );
    };

    const handleSubmit = () => {
        if (window.confirm("Are you sure you want to submit this attendance report to the teacher?")) {
            alert(`Attendance submitted for ${subject} (${session}) on ${date}`);
            // Reset after submission simulation
            setStudents(initialStudents);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 font-sans">
            <div className="max-w-7xl mx-auto w-full flex flex-col">
                {/* Sticky Header */}
                <PageHeader
                    title="Draft Attendance"
                    badge="Monitor Task"
                    subtitle="Submit daily attendance to your teachers."
                />

                {/* Content Wrapper */}
                <div className="px-6 lg:px-8 pb-12 w-full max-w-4xl mt-8">

                    {/* Top Section: Form Controls */}
                    <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6 sm:p-8 mb-8">
                        <h2 className="text-lg font-bold text-slate-900 mb-6 font-serif">Session Details</h2>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-700">Date</label>
                                <input
                                    type="date"
                                    value={date}
                                    onChange={(e) => setDate(e.target.value)}
                                    className="w-full px-4 py-2.5 rounded-lg border border-slate-200 bg-slate-50 text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-sans"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-700">Subject</label>
                                <select
                                    value={subject}
                                    onChange={(e) => setSubject(e.target.value)}
                                    className="w-full px-4 py-2.5 rounded-lg border border-slate-200 bg-slate-50 text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-sans appearance-none"
                                >
                                    <option value="Physics">Physics</option>
                                    <option value="Advanced Math">Advanced Math</option>
                                    <option value="English Literature">English Literature</option>
                                    <option value="Geography">Geography</option>
                                </select>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-700">Session Time</label>
                                <select
                                    value={session}
                                    onChange={(e) => setSession(e.target.value)}
                                    className="w-full px-4 py-2.5 rounded-lg border border-slate-200 bg-slate-50 text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-sans appearance-none"
                                >
                                    <option value="8:00 AM">8:00 AM</option>
                                    <option value="10:00 AM">10:00 AM</option>
                                    <option value="1:00 PM">1:00 PM</option>
                                    <option value="3:00 PM">3:00 PM</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Middle Section: Student Roster */}
                    <div className="mb-8">
                        <h2 className="text-lg font-bold text-slate-900 mb-4 font-serif px-2">Student Roster</h2>

                        <div className="flex flex-col gap-3">
                            {students.map((student) => (
                                <div key={student.id} className="bg-white border border-slate-200 rounded-xl shadow-sm p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all hover:border-slate-300">

                                    {/* Left: Avatar & Name */}
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-100 to-indigo-200 text-indigo-700 flex items-center justify-center font-bold text-sm shrink-0">
                                            {student.avatar}
                                        </div>
                                        <div>
                                            <span className="font-bold font-sans text-slate-800">{student.name}</span>
                                            <span className="block text-xs text-slate-500 mt-0.5">ID: 2025-{student.id.toString().padStart(4, '0')}</span>
                                        </div>
                                    </div>

                                    {/* Right: Status Toggles */}
                                    <div className="flex items-center gap-2 sm:ml-auto w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
                                        <button
                                            onClick={() => handleStatusChange(student.id, 'Present')}
                                            className={`flex-1 sm:flex-none px-4 py-2 rounded-lg text-sm font-medium transition-colors border ${student.status === 'Present'
                                                ? 'bg-emerald-50 border-emerald-200 text-emerald-700 shadow-sm'
                                                : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'
                                                }`}
                                        >
                                            Present
                                        </button>
                                        <button
                                            onClick={() => handleStatusChange(student.id, 'Absent')}
                                            className={`flex-1 sm:flex-none px-4 py-2 rounded-lg text-sm font-medium transition-colors border ${student.status === 'Absent'
                                                ? 'bg-red-50 border-red-200 text-red-700 shadow-sm'
                                                : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'
                                                }`}
                                        >
                                            Absent
                                        </button>
                                        <button
                                            onClick={() => handleStatusChange(student.id, 'Late')}
                                            className={`flex-1 sm:flex-none px-4 py-2 rounded-lg text-sm font-medium transition-colors border ${student.status === 'Late'
                                                ? 'bg-amber-50 border-amber-200 text-amber-700 shadow-sm'
                                                : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'
                                                }`}
                                        >
                                            Late
                                        </button>
                                    </div>

                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Bottom Section: Submit Action */}
                    <div className="flex justify-end pt-4 border-t border-slate-200">
                        <button
                            onClick={handleSubmit}
                            className="px-8 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl shadow-sm transition-colors flex items-center gap-2"
                        >
                            <ClipboardCheck className="w-5 h-5" />
                            Submit to Teacher
                        </button>
                    </div>

                </div>
            </div>
        </div>
    );
}
