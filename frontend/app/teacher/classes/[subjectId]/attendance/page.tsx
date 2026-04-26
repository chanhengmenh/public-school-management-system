'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'next/navigation';
import { Calendar, ChevronLeft, ChevronRight, Clock, Loader2, AlertCircle } from 'lucide-react';
import { classSubjectsApi } from '@/lib/api/class-subjects';
import { attendanceApi, AttendanceRecord } from '@/lib/api/attendance';
import { client } from '@/lib/api/client';
import { User } from '@/types/user.types';

type AttendanceStatus = 'present' | 'absent' | 'late' | 'excused';

const statusConfig: Record<AttendanceStatus, { bg: string; text: string; label: string }> = {
    present: { bg: 'bg-green-100', text: 'text-green-700', label: 'Present' },
    absent: { bg: 'bg-red-100', text: 'text-red-700', label: 'Absent' },
    late: { bg: 'bg-amber-100', text: 'text-amber-700', label: 'Late' },
    excused: { bg: 'bg-purple-100', text: 'text-purple-700', label: 'Excused' },
};

const getToday = () => new Date().toISOString().split('T')[0];

const shiftDate = (dateStr: string, days: number): string => {
    const d = new Date(dateStr + 'T00:00:00');
    d.setDate(d.getDate() + days);
    return d.toISOString().split('T')[0];
};

const formatDisplayDate = (dateStr: string): string => {
    const date = new Date(dateStr + 'T00:00:00');
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const options: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'long', year: 'numeric' };
    const formatted = date.toLocaleDateString('en-GB', options);
    if (date.getTime() === today.getTime()) return `Today, ${formatted}`;
    if (date.getTime() === yesterday.getTime()) return `Yesterday, ${formatted}`;
    return formatted;
};

const isFutureDate = (dateStr: string): boolean => {
    const date = new Date(dateStr + 'T00:00:00');
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date.getTime() > today.getTime();
};

export default function TeacherAttendancePage() {
    const params = useParams();
    const subjectId = Number(params?.subjectId);

    const [selectedDate, setSelectedDate] = useState(getToday);
    const [students, setStudents] = useState<User[]>([]);
    const [records, setRecords] = useState<AttendanceRecord[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [classId, setClassId] = useState<number | null>(null);

    // Resolve class_id once from the class_subject
    useEffect(() => {
        classSubjectsApi.getById(subjectId).then(cs => {
            setClassId(cs.class_id);
            return client.get<User[]>(`/classes/${cs.class_id}/students`).then(s => setStudents(s));
        }).catch(() => setError('Failed to load class data.'));
    }, [subjectId]);

    const loadAttendance = useCallback(async () => {
        if (classId === null) return;
        setLoading(true);
        setError(null);
        try {
            const data = await attendanceApi.list({ class_id: classId, date: selectedDate });
            setRecords(data);
        } catch {
            setError('Failed to load attendance.');
        } finally {
            setLoading(false);
        }
    }, [classId, selectedDate]);

    useEffect(() => {
        if (classId !== null) loadAttendance();
    }, [loadAttendance, classId]);

    const statusMap = Object.fromEntries(records.map(r => [r.student_id, r.status as AttendanceStatus]));

    const counts = students.reduce(
        (acc, s) => {
            const status = statusMap[s.id] ?? null;
            if (status) acc[status] = (acc[status] ?? 0) + 1;
            return acc;
        },
        {} as Record<AttendanceStatus, number>
    );

    const isFuture = isFutureDate(selectedDate);
    const hasRecords = records.length > 0;

    return (
        <div className="flex flex-col space-y-6">
            {/* Date Navigator */}
            <div className="flex items-center gap-2">
                <button
                    onClick={() => setSelectedDate(prev => shiftDate(prev, -1))}
                    className="w-9 h-9 flex items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 hover:bg-slate-50 hover:text-slate-800 transition-colors shadow-sm"
                >
                    <ChevronLeft className="w-4 h-4" />
                </button>
                <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-xl px-4 py-2.5 shadow-sm">
                    <Calendar className="w-4 h-4 text-slate-400" />
                    <span className="text-sm font-bold text-slate-800">{formatDisplayDate(selectedDate)}</span>
                </div>
                <button
                    onClick={() => setSelectedDate(prev => shiftDate(prev, 1))}
                    className="w-9 h-9 flex items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 hover:bg-slate-50 hover:text-slate-800 transition-colors shadow-sm"
                >
                    <ChevronRight className="w-4 h-4" />
                </button>
            </div>

            {/* Content */}
            {loading ? (
                <div className="flex items-center justify-center py-16">
                    <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
                </div>
            ) : error ? (
                <div className="flex flex-col items-center justify-center py-16 gap-2 text-slate-500">
                    <AlertCircle className="h-8 w-8 text-red-400" />
                    <p>{error}</p>
                    <button onClick={loadAttendance} className="mt-2 px-4 py-2 bg-slate-900 text-white rounded-lg text-sm hover:bg-slate-700 transition-colors">Retry</button>
                </div>
            ) : isFuture ? (
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm py-16 flex flex-col items-center justify-center text-center">
                    <Clock className="w-12 h-12 text-slate-300 mb-4" />
                    <h3 className="text-lg font-bold text-slate-900 mb-1">No Attendance Data Yet</h3>
                    <p className="text-sm text-slate-500">Attendance for this date has not been recorded yet.</p>
                </div>
            ) : !hasRecords ? (
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm py-16 flex flex-col items-center justify-center text-center">
                    <Clock className="w-12 h-12 text-slate-300 mb-4" />
                    <h3 className="text-lg font-bold text-slate-900 mb-1">No Records</h3>
                    <p className="text-sm text-slate-500">The class monitor has not submitted attendance for this date.</p>
                </div>
            ) : (
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                    {/* Header */}
                    <div className="flex items-center justify-between px-6 py-3 bg-slate-50 border-b border-slate-200">
                        <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Student</span>
                        <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Status</span>
                    </div>

                    {/* Rows */}
                    <div className="divide-y divide-slate-100">
                        {students.map(student => {
                            const status = statusMap[student.id];
                            const cfg = status ? statusConfig[status] : null;
                            const initials = student.full_name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
                            return (
                                <div key={student.id} className="flex items-center justify-between px-6 py-3.5">
                                    <div className="flex items-center gap-3">
                                        <div className="w-9 h-9 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-xs font-bold shrink-0 border border-indigo-200">
                                            {initials}
                                        </div>
                                        <span className="text-sm font-bold text-slate-900">{student.full_name}</span>
                                    </div>
                                    {cfg ? (
                                        <span className={`px-3 py-1 rounded-lg text-xs font-bold ${cfg.bg} ${cfg.text}`}>
                                            {cfg.label}
                                        </span>
                                    ) : (
                                        <span className="px-3 py-1 rounded-lg text-xs font-bold bg-slate-100 text-slate-400">—</span>
                                    )}
                                </div>
                            );
                        })}
                    </div>

                    {/* Summary Footer */}
                    <div className="px-6 py-4 border-t border-slate-200 bg-slate-50 flex items-center gap-6 flex-wrap">
                        {(Object.entries(counts) as [AttendanceStatus, number][]).map(([status, count]) => {
                            const cfg = statusConfig[status];
                            return (
                                <div key={status} className="flex items-center gap-1.5">
                                    <span className={`px-2 py-0.5 rounded text-xs font-bold ${cfg.bg} ${cfg.text}`}>{cfg.label}</span>
                                    <span className="text-sm font-bold text-slate-700">{count}</span>
                                </div>
                            );
                        })}
                        <span className="ml-auto text-xs text-slate-400 italic">View only — marked by class monitor</span>
                    </div>
                </div>
            )}
        </div>
    );
}
