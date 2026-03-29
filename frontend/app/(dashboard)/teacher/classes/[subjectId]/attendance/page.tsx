'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'next/navigation';
import { Calendar, UserCheck, AlertCircle, CheckCircle2, Clock, Save, Info, ChevronLeft, ChevronRight, ShieldCheck } from 'lucide-react';

// --- Types ---
type AttendanceStatus = 'Present' | 'Absent' | 'Late' | 'Excused';
type VerificationStatus = 'Not_Started' | 'Draft_Pending' | 'Verified';

interface StudentAttendance {
    id: string;
    name: string;
    avatar: string;
    status: AttendanceStatus;
}

// --- Dummy Data ---
const monitorName = 'Alex Johnson';

const generateDraftRoster = (): StudentAttendance[] => [
    { id: 's1', name: 'Alex Johnson', avatar: 'AJ', status: 'Present' },
    { id: 's2', name: 'Maria Garcia', avatar: 'MG', status: 'Present' },
    { id: 's3', name: 'James Smith', avatar: 'JS', status: 'Present' },
    { id: 's4', name: 'Linda Choo', avatar: 'LC', status: 'Absent' },
    { id: 's5', name: 'Robert Fox', avatar: 'RF', status: 'Present' },
    { id: 's6', name: 'Emily Davis', avatar: 'ED', status: 'Late' },
    { id: 's7', name: 'Michael Brown', avatar: 'MB', status: 'Present' },
    { id: 's8', name: 'Sarah Wilson', avatar: 'SW', status: 'Present' },
    { id: 's9', name: 'Daniel Lee', avatar: 'DL', status: 'Absent' },
    { id: 's10', name: 'Jessica Taylor', avatar: 'JT', status: 'Late' },
];

// Generate a slightly varied past roster (simulates different days having different attendance)
const generatePastRoster = (dateStr: string): StudentAttendance[] => {
    const seed = dateStr.split('-').reduce((a, b) => a + parseInt(b), 0);
    const statuses: AttendanceStatus[] = ['Present', 'Present', 'Present', 'Present', 'Present', 'Present', 'Absent', 'Late', 'Present', 'Excused'];
    return [
        { id: 's1', name: 'Alex Johnson', avatar: 'AJ', status: statuses[(seed + 0) % statuses.length] },
        { id: 's2', name: 'Maria Garcia', avatar: 'MG', status: statuses[(seed + 1) % statuses.length] },
        { id: 's3', name: 'James Smith', avatar: 'JS', status: statuses[(seed + 2) % statuses.length] },
        { id: 's4', name: 'Linda Choo', avatar: 'LC', status: statuses[(seed + 3) % statuses.length] },
        { id: 's5', name: 'Robert Fox', avatar: 'RF', status: statuses[(seed + 4) % statuses.length] },
        { id: 's6', name: 'Emily Davis', avatar: 'ED', status: statuses[(seed + 5) % statuses.length] },
        { id: 's7', name: 'Michael Brown', avatar: 'MB', status: statuses[(seed + 6) % statuses.length] },
        { id: 's8', name: 'Sarah Wilson', avatar: 'SW', status: statuses[(seed + 7) % statuses.length] },
        { id: 's9', name: 'Daniel Lee', avatar: 'DL', status: statuses[(seed + 8) % statuses.length] },
        { id: 's10', name: 'Jessica Taylor', avatar: 'JT', status: statuses[(seed + 9) % statuses.length] },
    ];
};

// --- Helper: Format Date ---
const formatDisplayDate = (dateStr: string): string => {
    const date = new Date(dateStr + 'T00:00:00');
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const options: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'long', year: 'numeric' };
    const formatted = date.toLocaleDateString('en-GB', options);

    if (date.getTime() === today.getTime()) return `Today, ${formatted}`;
    if (date.getTime() === yesterday.getTime()) return `Yesterday, ${formatted}`;
    if (date.getTime() === tomorrow.getTime()) return `Tomorrow, ${formatted}`;
    return formatted;
};

const shiftDate = (dateStr: string, days: number): string => {
    const date = new Date(dateStr + 'T00:00:00');
    date.setDate(date.getDate() + days);
    return date.toISOString().split('T')[0];
};

const getToday = (): string => new Date().toISOString().split('T')[0];

const isDateFuture = (dateStr: string): boolean => {
    const date = new Date(dateStr + 'T00:00:00');
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date.getTime() > today.getTime();
};

const isDateToday = (dateStr: string): boolean => {
    const date = new Date(dateStr + 'T00:00:00');
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date.getTime() === today.getTime();
};

// --- Status Button Styles ---
const statusConfig: Record<AttendanceStatus, { active: string; inactive: string; label: string }> = {
    Present: {
        active: 'bg-green-100 text-green-700 ring-2 ring-green-500 ring-offset-1',
        inactive: 'bg-slate-50 text-slate-500 hover:bg-green-50 hover:text-green-600 border border-slate-200',
        label: 'Present',
    },
    Absent: {
        active: 'bg-red-100 text-red-700 ring-2 ring-red-500 ring-offset-1',
        inactive: 'bg-slate-50 text-slate-500 hover:bg-red-50 hover:text-red-600 border border-slate-200',
        label: 'Absent',
    },
    Late: {
        active: 'bg-amber-100 text-amber-700 ring-2 ring-amber-500 ring-offset-1',
        inactive: 'bg-slate-50 text-slate-500 hover:bg-amber-50 hover:text-amber-600 border border-slate-200',
        label: 'Late',
    },
    Excused: {
        active: 'bg-purple-100 text-purple-700 ring-2 ring-purple-500 ring-offset-1',
        inactive: 'bg-slate-50 text-slate-500 hover:bg-purple-50 hover:text-purple-600 border border-slate-200',
        label: 'Excused',
    },
};

export default function TeacherAttendancePage() {
    const params = useParams();
    const subjectId = (params?.subjectId as string) || 'class-1';

    // --- State ---
    const [selectedDate, setSelectedDate] = useState(() => getToday());
    const [attendanceStatus, setAttendanceStatus] = useState<VerificationStatus>('Draft_Pending');
    const [roster, setRoster] = useState<StudentAttendance[]>(generateDraftRoster);
    const [showToast, setShowToast] = useState(false);

    // --- Update roster and status when date changes ---
    useEffect(() => {
        if (isDateFuture(selectedDate)) {
            // Future date: no data yet
            setAttendanceStatus('Not_Started');
            setRoster([]);
        } else if (isDateToday(selectedDate)) {
            // Today: draft pending with editable roster
            setAttendanceStatus('Draft_Pending');
            setRoster(generateDraftRoster());
        } else {
            // Past date: already verified with historical data
            setAttendanceStatus('Verified');
            setRoster(generatePastRoster(selectedDate));
        }
    }, [selectedDate]);

    // --- Derived Counts ---
    const presentCount = roster.filter(s => s.status === 'Present').length;
    const absentCount = roster.filter(s => s.status === 'Absent').length;
    const lateCount = roster.filter(s => s.status === 'Late').length;
    const excusedCount = roster.filter(s => s.status === 'Excused').length;

    // --- Handlers ---
    const handleStatusChange = (studentId: string, newStatus: AttendanceStatus) => {
        if (isDateFuture(selectedDate)) return; // Can't edit future dates
        setRoster(prev => prev.map(s =>
            s.id === studentId ? { ...s, status: newStatus } : s
        ));
    };

    const handleVerify = () => {
        setAttendanceStatus('Verified');
        setShowToast(true);
        setTimeout(() => setShowToast(false), 3000);
    };

    const handlePrevDay = () => setSelectedDate(prev => shiftDate(prev, -1));
    const handleNextDay = () => setSelectedDate(prev => shiftDate(prev, 1));

    const isFuture = isDateFuture(selectedDate);
    const isToday = isDateToday(selectedDate);

    return (
        <div className="flex flex-col space-y-6 relative">

            {/* 1. Top Control Bar */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                {/* Date Selector */}
                <div className="flex items-center gap-2">
                    <button
                        onClick={handlePrevDay}
                        className="w-9 h-9 flex items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 hover:bg-slate-50 hover:text-slate-800 transition-colors shadow-sm"
                    >
                        <ChevronLeft className="w-4 h-4" />
                    </button>
                    <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-xl px-4 py-2.5 shadow-sm">
                        <Calendar className="w-4 h-4 text-slate-400" />
                        <span className="text-sm font-bold text-slate-800">{formatDisplayDate(selectedDate)}</span>
                    </div>
                    <button
                        onClick={handleNextDay}
                        className="w-9 h-9 flex items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 hover:bg-slate-50 hover:text-slate-800 transition-colors shadow-sm"
                    >
                        <ChevronRight className="w-4 h-4" />
                    </button>
                </div>

                {/* Status Badge */}
                {attendanceStatus === 'Draft_Pending' && (
                    <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 text-amber-700 px-4 py-2 rounded-xl">
                        <AlertCircle className="w-4 h-4 shrink-0" />
                        <span className="text-sm font-bold">Pending Verification</span>
                    </div>
                )}
                {attendanceStatus === 'Verified' && (
                    <div className="flex items-center gap-2 bg-green-50 border border-green-200 text-green-700 px-4 py-2 rounded-xl">
                        <CheckCircle2 className="w-4 h-4 shrink-0" />
                        <span className="text-sm font-bold">Verified</span>
                    </div>
                )}
                {attendanceStatus === 'Not_Started' && (
                    <div className="flex items-center gap-2 bg-slate-100 border border-slate-200 text-slate-500 px-4 py-2 rounded-xl">
                        <Clock className="w-4 h-4 shrink-0" />
                        <span className="text-sm font-bold">Not Started</span>
                    </div>
                )}
            </div>

            {/* 2. Monitor Draft Alert Banner (only for today's pending) */}
            {attendanceStatus === 'Draft_Pending' && isToday && (
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-start gap-3">
                    <Info className="w-5 h-5 text-blue-500 mt-0.5 shrink-0" />
                    <div className="flex flex-col">
                        <span className="text-sm font-bold text-blue-800">
                            Class Monitor ({monitorName}) drafted this attendance at 08:15 AM.
                        </span>
                        <span className="text-sm text-blue-600 mt-0.5">
                            Please review the records below, make any necessary adjustments, and verify.
                        </span>
                    </div>
                </div>
            )}

            {/* Future Date: No Data Message */}
            {isFuture && (
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                    <div className="py-16 flex flex-col items-center justify-center text-center">
                        <Clock className="w-12 h-12 text-slate-300 mb-4" />
                        <h3 className="text-lg font-bold text-slate-900 mb-1">No Attendance Data Yet</h3>
                        <p className="text-sm text-slate-500">Attendance for this date has not been recorded yet.</p>
                    </div>
                </div>
            )}

            {/* 3. Attendance Roster (only shown when there's data) */}
            {!isFuture && roster.length > 0 && (
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                    {/* Table Header */}
                    <div className="flex items-center justify-between px-6 py-3 bg-slate-50 border-b border-slate-200">
                        <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Student</span>
                        <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Attendance Status</span>
                    </div>

                    {/* Student Rows */}
                    <div className="divide-y divide-slate-100">
                        {roster.map((student) => (
                            <div key={student.id} className="flex items-center justify-between px-6 py-3.5 hover:bg-slate-50/50 transition-colors">
                                {/* Left: Avatar & Name */}
                                <div className="flex items-center gap-3">
                                    <div className="w-9 h-9 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-xs font-bold shrink-0 border border-indigo-200">
                                        {student.avatar}
                                    </div>
                                    <span className="text-sm font-bold text-slate-900">{student.name}</span>
                                </div>

                                {/* Right: Segmented Status Buttons */}
                                <div className="flex items-center gap-1.5">
                                    {(Object.keys(statusConfig) as AttendanceStatus[]).map((statusKey) => {
                                        const config = statusConfig[statusKey];
                                        const isActive = student.status === statusKey;
                                        return (
                                            <button
                                                key={statusKey}
                                                onClick={() => handleStatusChange(student.id, statusKey)}
                                                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${isActive ? config.active : config.inactive
                                                    }`}
                                            >
                                                {config.label}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* 4. Sticky Footer */}
                    <div className="sticky bottom-0 bg-white border-t border-slate-200 px-6 py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                        {/* Summary */}
                        <div className="flex items-center gap-4 flex-wrap">
                            <div className="flex items-center gap-1.5">
                                <div className="w-2.5 h-2.5 rounded-full bg-green-500"></div>
                                <span className="text-sm font-bold text-slate-700">Present: <span className="text-green-600">{presentCount}</span></span>
                            </div>
                            <div className="flex items-center gap-1.5">
                                <div className="w-2.5 h-2.5 rounded-full bg-red-500"></div>
                                <span className="text-sm font-bold text-slate-700">Absent: <span className="text-red-600">{absentCount}</span></span>
                            </div>
                            <div className="flex items-center gap-1.5">
                                <div className="w-2.5 h-2.5 rounded-full bg-amber-500"></div>
                                <span className="text-sm font-bold text-slate-700">Late: <span className="text-amber-600">{lateCount}</span></span>
                            </div>
                            <div className="flex items-center gap-1.5">
                                <div className="w-2.5 h-2.5 rounded-full bg-purple-500"></div>
                                <span className="text-sm font-bold text-slate-700">Excused: <span className="text-purple-600">{excusedCount}</span></span>
                            </div>
                        </div>

                        {/* Action Button */}
                        <button
                            onClick={handleVerify}
                            className="bg-slate-900 hover:bg-slate-800 text-white px-6 py-2.5 rounded-xl text-sm font-bold shadow-md transition-all flex items-center gap-2 active:scale-95 shrink-0"
                        >
                            {attendanceStatus === 'Verified' ? (
                                <>
                                    <Save className="w-4 h-4" />
                                    Update Records
                                </>
                            ) : (
                                <>
                                    <ShieldCheck className="w-4 h-4" />
                                    Approve &amp; Verify Attendance
                                </>
                            )}
                        </button>
                    </div>
                </div>
            )}

            {/* 5. Success Toast */}
            {showToast && (
                <div className="fixed bottom-6 right-6 z-50 animate-in slide-in-from-bottom-4 fade-in duration-300">
                    <div className="bg-slate-900 text-white px-6 py-3.5 rounded-2xl shadow-2xl flex items-center gap-3">
                        <CheckCircle2 className="w-5 h-5 text-green-400 shrink-0" />
                        <span className="text-sm font-bold">Attendance verified and saved successfully!</span>
                    </div>
                </div>
            )}
        </div>
    );
}
