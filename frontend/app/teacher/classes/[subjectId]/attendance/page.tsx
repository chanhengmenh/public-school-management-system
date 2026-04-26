'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'next/navigation';
import { Calendar, ChevronLeft, ChevronRight, Clock, Loader2, AlertCircle, Save, CheckCircle2 } from 'lucide-react';
import { classSubjectsApi } from '@/lib/api/class-subjects';
import { attendanceApi, AttendanceRecord } from '@/lib/api/attendance';
import { client } from '@/lib/api/client';
import { User } from '@/types/user.types';

type AttendanceStatus = 'present' | 'absent' | 'late' | 'excused';

const statusConfig: Record<AttendanceStatus, { active: string; inactive: string; label: string }> = {
    present: {
        active: 'bg-green-100 text-green-700 ring-2 ring-green-500 ring-offset-1',
        inactive: 'bg-slate-50 text-slate-500 hover:bg-green-50 hover:text-green-600 border border-slate-200',
        label: 'Present',
    },
    absent: {
        active: 'bg-red-100 text-red-700 ring-2 ring-red-500 ring-offset-1',
        inactive: 'bg-slate-50 text-slate-500 hover:bg-red-50 hover:text-red-600 border border-slate-200',
        label: 'Absent',
    },
    late: {
        active: 'bg-amber-100 text-amber-700 ring-2 ring-amber-500 ring-offset-1',
        inactive: 'bg-slate-50 text-slate-500 hover:bg-amber-50 hover:text-amber-600 border border-slate-200',
        label: 'Late',
    },
    excused: {
        active: 'bg-purple-100 text-purple-700 ring-2 ring-purple-500 ring-offset-1',
        inactive: 'bg-slate-50 text-slate-500 hover:bg-purple-50 hover:text-purple-600 border border-slate-200',
        label: 'Excused',
    },
};

const STATUSES: AttendanceStatus[] = ['present', 'absent', 'late', 'excused'];

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

    const [selectedDate, setSelectedDate] = useState('');
    const [mounted, setMounted] = useState(false);
    const [students, setStudents] = useState<User[]>([]);
    const [records, setRecords] = useState<AttendanceRecord[]>([]);
    const [edits, setEdits] = useState<Record<number, AttendanceStatus>>({});
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [toast, setToast] = useState(false);
    const [classId, setClassId] = useState<number | null>(null);

    useEffect(() => {
        setSelectedDate(getToday());
        setMounted(true);
    }, []);

    // Resolve class_id + roster once
    useEffect(() => {
        let cancelled = false;
        (async () => {
            try {
                const cs = await classSubjectsApi.getById(subjectId);
                if (cancelled) return;
                setClassId(cs.class_id);
                const s = await client.get<User[]>(`/classes/${cs.class_id}/students`);
                if (!cancelled) setStudents(s);
            } catch {
                if (!cancelled) {
                    setError('Failed to load class data.');
                    setLoading(false);
                }
            }
        })();
        return () => { cancelled = true; };
    }, [subjectId]);

    const loadAttendance = useCallback(async (cid: number, date: string) => {
        setLoading(true);
        setError(null);
        setEdits({});
        try {
            const data = await attendanceApi.list({ class_id: cid, date });
            setRecords(data);
        } catch {
            setError('Failed to load attendance.');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        if (classId !== null && selectedDate) loadAttendance(classId, selectedDate);
    }, [classId, selectedDate, loadAttendance]);

    // Merge saved records with local edits for display
    const savedMap: Record<number, AttendanceStatus> = Object.fromEntries(
        records.map(r => [r.student_id, r.status as AttendanceStatus])
    );
    const statusMap: Record<number, AttendanceStatus> = { ...savedMap, ...edits };

    const handleStatusChange = (studentId: number, status: AttendanceStatus) => {
        setEdits(prev => ({ ...prev, [studentId]: status }));
    };

    const handleSave = async () => {
        if (classId === null || !selectedDate) return;
        setSaving(true);
        try {
            // All students must have a status; default unset ones to 'present'
            const entries = students.map(s => ({
                student_id: s.id,
                status: statusMap[s.id] ?? 'present',
            }));
            await attendanceApi.batchCreate({ class_id: classId, date: selectedDate, entries });
            await loadAttendance(classId, selectedDate);
            setToast(true);
            setTimeout(() => setToast(false), 3000);
        } catch {
            setError('Failed to save attendance.');
        } finally {
            setSaving(false);
        }
    };

    const counts = STATUSES.reduce((acc, status) => {
        acc[status] = students.filter(s => statusMap[s.id] === status).length;
        return acc;
    }, {} as Record<AttendanceStatus, number>);

    const hasChanges = Object.keys(edits).length > 0;
    const isFuture = selectedDate ? isFutureDate(selectedDate) : false;
    const hasRecords = records.length > 0;

    if (!mounted) return null;

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
                    <button
                        onClick={() => classId !== null && loadAttendance(classId, selectedDate)}
                        className="mt-2 px-4 py-2 bg-slate-900 text-white rounded-lg text-sm hover:bg-slate-700 transition-colors"
                    >
                        Retry
                    </button>
                </div>
            ) : isFuture ? (
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm py-16 flex flex-col items-center justify-center text-center">
                    <Clock className="w-12 h-12 text-slate-300 mb-4" />
                    <h3 className="text-lg font-bold text-slate-900 mb-1">Future Date</h3>
                    <p className="text-sm text-slate-500">Attendance cannot be marked for a future date.</p>
                </div>
            ) : (
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                    {/* Info banner when no records yet */}
                    {!hasRecords && (
                        <div className="bg-blue-50 border-b border-blue-200 px-6 py-3 flex items-center gap-2">
                            <AlertCircle className="w-4 h-4 text-blue-500 shrink-0" />
                            <span className="text-sm text-blue-700">No attendance submitted yet. Mark and save below.</span>
                        </div>
                    )}

                    {/* Table Header */}
                    <div className="flex items-center justify-between px-6 py-3 bg-slate-50 border-b border-slate-200">
                        <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Student</span>
                        <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Status</span>
                    </div>

                    {/* Student Rows */}
                    <div className="divide-y divide-slate-100">
                        {students.map(student => {
                            const current = statusMap[student.id];
                            const initials = student.full_name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
                            return (
                                <div key={student.id} className="flex items-center justify-between px-6 py-3.5 hover:bg-slate-50/50">
                                    <div className="flex items-center gap-3">
                                        <div className="w-9 h-9 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-xs font-bold shrink-0 border border-indigo-200">
                                            {initials}
                                        </div>
                                        <span className="text-sm font-bold text-slate-900">{student.full_name}</span>
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                        {STATUSES.map(status => (
                                            <button
                                                key={status}
                                                onClick={() => handleStatusChange(student.id, status)}
                                                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${current === status ? statusConfig[status].active : statusConfig[status].inactive}`}
                                            >
                                                {statusConfig[status].label}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* Footer */}
                    <div className="sticky bottom-0 bg-white border-t border-slate-200 px-6 py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                        <div className="flex items-center gap-4 flex-wrap">
                            {STATUSES.map(status => counts[status] > 0 && (
                                <div key={status} className="flex items-center gap-1.5">
                                    <span className={`px-2 py-0.5 rounded text-xs font-bold ${statusConfig[status].active.split(' ').slice(0, 2).join(' ')}`}>
                                        {statusConfig[status].label}
                                    </span>
                                    <span className="text-sm font-bold text-slate-700">{counts[status]}</span>
                                </div>
                            ))}
                        </div>
                        <button
                            onClick={handleSave}
                            disabled={saving || (!hasChanges && hasRecords)}
                            className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold shadow-sm transition-all active:scale-95 shrink-0 ${
                                saving || (!hasChanges && hasRecords)
                                    ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                                    : 'bg-slate-900 hover:bg-slate-800 text-white'
                            }`}
                        >
                            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                            {saving ? 'Saving…' : hasRecords ? 'Update Records' : 'Save Attendance'}
                        </button>
                    </div>
                </div>
            )}

            {/* Toast */}
            {toast && (
                <div className="fixed bottom-6 right-6 z-50">
                    <div className="bg-slate-900 text-white px-6 py-3.5 rounded-2xl shadow-2xl flex items-center gap-3">
                        <CheckCircle2 className="w-5 h-5 text-green-400 shrink-0" />
                        <span className="text-sm font-bold">Attendance saved successfully!</span>
                    </div>
                </div>
            )}
        </div>
    );
}
