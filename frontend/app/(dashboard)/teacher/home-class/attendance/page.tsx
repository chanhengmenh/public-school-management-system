'use client';

import React, { useState, useMemo } from 'react';
import { useAuthStore } from '@/store/useAuthStore';
import { getTeacherData } from '@/lib/mock-data/teacher';
import { mockAttendance10A, AttendanceStatus } from '@/lib/mock-data/attendance';
import PageHeader from '@/components/layouts/PageHeader';
import { Card } from '@/components/ui';
import { AlertCircle, CalendarCheck, CalendarX, Clock, ChevronLeft, ChevronRight, Users } from 'lucide-react';

function getDotColor(status: AttendanceStatus): string {
    switch (status) {
        case 'present': return 'bg-emerald-500';
        case 'absent': return 'bg-red-500';
        case 'late': return 'bg-amber-500';
        case 'excused': return 'bg-slate-400';
        default: return 'bg-transparent';
    }
}

export default function HomeClassAttendancePage() {
    const { user } = useAuthStore();
    const teacherData = getTeacherData(user?.id ?? 'teacher_001');
    const [currentViewDate, setCurrentViewDate] = useState(new Date(2026, 2, 1)); // Default to March 2026

    const yearMonthKey = `${currentViewDate.getFullYear()}-${(currentViewDate.getMonth() + 1).toString().padStart(2, '0')}`;
    const displayedMonthName = currentViewDate.toLocaleString('default', { month: 'long', year: 'numeric' });

    // Check if the viewed month is strictly in the future compared to now (assuming "now" is March 2026 for mock)
    const mockNow = new Date(2026, 2, 15);
    const isFutureMonth = currentViewDate.getFullYear() > mockNow.getFullYear() ||
        (currentViewDate.getFullYear() === mockNow.getFullYear() && currentViewDate.getMonth() > mockNow.getMonth());

    const daysInMonth = new Date(currentViewDate.getFullYear(), currentViewDate.getMonth() + 1, 0).getDate();
    const DAYS = Array.from({ length: daysInMonth }, (_, i) => (i + 1).toString());

    const stats = useMemo(() => {
        let presentCount = 0;
        let absentCount = 0;
        let atRiskCount = 0;
        const totalStudents = mockAttendance10A.length;
        let totalPossibleDays = 0;
        let totalLates = 0;

        mockAttendance10A.forEach(s => {
            const monthData = s.attendance[yearMonthKey] || {};

            let studentAbsences = 0;
            let studentPossible = 0;
            Object.values(monthData).forEach(st => {
                if (st !== 'none') {
                    studentPossible++;
                    totalPossibleDays++;
                    if (st === 'present' || st === 'late' || st === 'excused') {
                        presentCount++;
                    }
                    if (st === 'absent') {
                        studentAbsences++;
                        absentCount++;
                    }
                    if (st === 'late') {
                        totalLates++;
                    }
                }
            });

            if (studentPossible > 0 && (studentAbsences / studentPossible) > 0.15) {
                atRiskCount++;
            }
        });

        const avgAttendanceRate = totalPossibleDays > 0 ? (presentCount / totalPossibleDays) * 100 : 0;
        const onTimeRate = totalPossibleDays > 0 ? ((totalPossibleDays - totalLates) / totalPossibleDays) * 100 : 0;

        return {
            avgAttendanceRate: avgAttendanceRate.toFixed(1),
            absentCount,
            onTimeRate: onTimeRate.toFixed(1),
            atRiskCount,
            hasData: totalPossibleDays > 0
        };
    }, [yearMonthKey]);

    const handlePrevMonth = () => {
        setCurrentViewDate(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
    };

    const handleNextMonth = () => {
        setCurrentViewDate(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
    };


    return (
        <div className="min-h-screen bg-slate-50 font-sans">
            <PageHeader
                title="Attendance Monitoring"
                subtitle={`Attendance records for ${teacherData?.homeClass?.name || 'your class'}`}
            />

            <div className="max-w-[1400px] mx-auto w-full px-6 lg:px-8 pb-12 pt-6">

                {/* ── Dynamic Stats Grid ── */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                    <Card className="p-4 flex flex-col justify-center border-slate-200 shadow-sm">
                        <span className="text-sm font-medium text-slate-500 mb-1 flex items-center gap-1.5"><Users className="w-4 h-4" /> Total Students</span>
                        <span className="text-2xl font-bold text-slate-900">{mockAttendance10A.length}</span>
                    </Card>
                    <Card className="p-4 flex flex-col justify-center border-slate-200 shadow-sm">
                        <span className="text-sm font-medium text-slate-500 mb-1 flex items-center gap-1.5"><CalendarX className="w-4 h-4" /> Total Absences (Month)</span>
                        <span className="text-2xl font-bold text-slate-900">{stats.hasData ? stats.absentCount : '--'}</span>
                    </Card>
                    <Card className="p-4 flex flex-col justify-center border-slate-200 shadow-sm">
                        <span className="text-sm font-medium text-slate-500 mb-1 flex items-center gap-1.5"><Clock className="w-4 h-4" /> Avg. On-Time Rate</span>
                        <span className="text-2xl font-bold text-slate-900">{stats.hasData ? `${stats.onTimeRate}%` : '--'}</span>
                    </Card>
                    <Card className="p-4 flex flex-col justify-center border-slate-200 shadow-sm">
                        <span className="text-sm font-medium text-slate-500 mb-1 flex items-center gap-1.5"><AlertCircle className="w-4 h-4" /> Monthly At-Risk</span>
                        <span className="text-2xl font-bold text-slate-900">{stats.hasData ? stats.atRiskCount : '--'} <span className="text-sm font-normal text-slate-500">students</span></span>
                    </Card>
                </div>

                {/* ── Top Controls ── */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                        {/* Month Selector */}
                        <div className="flex items-center gap-3 bg-white border border-slate-200 rounded-md px-1 py-1 shadow-sm">
                            <button onClick={handlePrevMonth} className="p-1 hover:bg-slate-100 rounded text-slate-600 transition-colors">
                                <ChevronLeft className="w-4 h-4" />
                            </button>
                            <span className="text-sm font-bold text-slate-800 min-w-[120px] text-center">
                                {displayedMonthName}
                            </span>
                            <button onClick={handleNextMonth} className="p-1 hover:bg-slate-100 rounded text-slate-600 transition-colors">
                                <ChevronRight className="w-4 h-4" />
                            </button>
                        </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-3 text-xs bg-white py-1.5 px-3 border border-slate-200 rounded-md shadow-sm">
                        <span className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-emerald-500"></div> Present</span>
                        <span className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-red-500"></div> Absent</span>
                        <span className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-amber-500"></div> Late</span>
                        <span className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-slate-400"></div> Excused</span>
                    </div>
                </div>

                {/* ── View Container ── */}
                {isFutureMonth ? (
                    <Card className="p-12 text-center flex flex-col items-center justify-center bg-white shadow-sm border border-slate-200">
                        <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-6">
                            <CalendarX className="w-10 h-10 text-slate-300" />
                        </div>
                        <h3 className="text-xl font-bold text-slate-900 mb-3">No data records yet.</h3>
                        <p className="text-slate-500 max-w-md">
                            Attendance cannot be viewed for future dates. Please navigate to a past or current month.
                        </p>
                    </Card>
                ) : (
                    <Card className="p-0 overflow-hidden shadow-sm border border-slate-200 bg-white">
                        <div className="w-full overflow-x-auto">
                            <table className="w-full text-left border-collapse table-fixed">
                                <thead>
                                    <tr className="bg-slate-50 border-b border-slate-200 text-[10px] uppercase tracking-wider text-slate-500 font-bold">
                                        <th className="px-4 py-4 w-[200px] min-w-[200px] sticky left-0 bg-slate-50 z-20 border-r border-slate-200">
                                            Student
                                        </th>
                                        <th className="px-2 py-4 w-10 min-w-[40px] text-center sticky left-[200px] bg-slate-50 z-20 border-r border-slate-50 text-emerald-600">P</th>
                                        <th className="px-2 py-4 w-10 min-w-[40px] text-center sticky left-[240px] bg-slate-50 z-20 border-r border-slate-50 text-red-600">A</th>
                                        <th className="px-2 py-4 w-10 min-w-[40px] text-center sticky left-[280px] bg-slate-50 z-20 border-r border-slate-50 text-amber-500">L</th>
                                        <th className="px-2 py-4 w-10 min-w-[40px] text-center sticky left-[320px] bg-slate-50 z-20 border-r border-slate-200 text-slate-500 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.05)]">E</th>
                                        {DAYS.map(d => (
                                            <th key={d} className="px-1 py-4 text-center w-8 shrink-0">
                                                {d}
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 bg-white">
                                    {mockAttendance10A.map(student => {
                                        const monthData = student.attendance[yearMonthKey] || {};

                                        const counts = { P: 0, A: 0, L: 0, E: 0 };
                                        Object.values(monthData).forEach(stat => {
                                            if (stat === 'present') counts.P++;
                                            else if (stat === 'absent') counts.A++;
                                            else if (stat === 'late') counts.L++;
                                            else if (stat === 'excused') counts.E++;
                                        });

                                        return (
                                            <tr key={student.id} className="hover:bg-slate-50/80 transition-colors group">
                                                <td className="px-4 py-2 align-middle w-[200px] min-w-[200px] sticky left-0 bg-white group-hover:bg-slate-50/80 transition-colors z-10 border-r border-slate-200">
                                                    <div className="flex items-center gap-2">
                                                        <span className="font-bold text-slate-900 text-xs truncate w-full" title={student.name}>{student.name}</span>
                                                    </div>
                                                </td>
                                                <td className="px-2 py-2 text-center align-middle sticky left-[200px] bg-white group-hover:bg-slate-50/80 transition-colors z-10 border-r border-slate-50">
                                                    <span className={`text-xs ${counts.P > 0 ? 'text-xl' : 'text-slate-500'}`}>{counts.P}</span>
                                                </td>
                                                <td className="px-2 py-2 text-center align-middle sticky left-[240px] bg-white group-hover:bg-slate-50/80 transition-colors z-10 border-r border-slate-50">
                                                    <span className={`text-xs ${counts.A > 0 ? 'text-xl' : 'text-slate-500'}`}>{counts.A}</span>
                                                </td>
                                                <td className="px-2 py-2 text-center align-middle sticky left-[280px] bg-white group-hover:bg-slate-50/80 transition-colors z-10 border-r border-slate-50">
                                                    <span className={`text-xs ${counts.L > 0 ? 'text-xl' : 'text-slate-500'}`}>{counts.L}</span>
                                                </td>
                                                <td className="px-2 py-2 text-center align-middle sticky left-[320px] bg-white group-hover:bg-slate-50/80 transition-colors z-10 border-r border-slate-200 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.05)]">
                                                    <span className={`text-xs ${counts.E > 0 ? 'text-xl' : 'text-slate-500'}`}>{counts.E}</span>
                                                </td>
                                                {DAYS.map(d => {
                                                    const stat = monthData[d] || 'none';
                                                    const isWeekend = stat === 'none';

                                                    return (
                                                        <td key={d} className={`px-1 py-2 align-middle text-center border-r border-slate-50 ${isWeekend ? 'bg-slate-100/50' : ''}`} title={isWeekend ? 'Weekend / No Data' : `${student.name} \nDate: Day ${d}\nStatus: ${stat.toUpperCase()}`}>
                                                            {!isWeekend && (
                                                                <div className={`w-3 h-3 mx-auto rounded-full ring-1 ring-black/10 shadow-sm ${getDotColor(stat)}`}></div>
                                                            )}
                                                        </td>
                                                    );
                                                })}
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </Card>
                )}
            </div>
        </div>
    );
}
