'use client';

import React, { useState, useEffect } from 'react';
import {
    Medal,
    Layers,
    CheckSquare,
    FileText,
    Microscope,
    Calculator,
    BookOpen,
    Globe,
    Check,
    Megaphone
} from 'lucide-react';
import PageHeader from '@/components/layouts/PageHeader';

export default function StudentDashboardPage() {
    const [isMonitor, setIsMonitor] = useState(false);

    useEffect(() => {
        // Safe check for document to avoid SSR issues
        if (typeof document !== 'undefined') {
            setIsMonitor(document.cookie.includes('mock_sub_role=monitor'));
        }
    }, []);

    const stats = [
        {
            icon: Medal,
            iconBg: 'bg-orange-50 text-orange-500',
            value: '3.87',
            label: 'Overall GPA',
            trend: '↑ +0.12 this term',
            trendColor: 'text-green-500'
        },
        {
            icon: Layers,
            iconBg: 'bg-blue-50 text-blue-500',
            value: '6',
            label: 'Active Classes',
            trend: 'All on track',
            trendColor: 'text-green-500'
        },
        {
            icon: CheckSquare,
            iconBg: 'bg-green-50 text-green-500',
            value: '92%',
            label: 'Attendance',
            trend: '↓ 1 absence',
            trendColor: 'text-red-500'
        },
        {
            icon: FileText,
            iconBg: 'bg-purple-50 text-purple-500',
            value: '5',
            label: 'Pending Tasks',
            trend: '2 due this week',
            trendColor: 'text-orange-500'
        }
    ];

    const classes = [
        {
            icon: Microscope,
            iconBg: 'bg-slate-100 text-slate-500',
            subject: 'Physics',
            teacher: 'Mr. Tan Wei',
            room: 'Room 304',
            time: '8:00 AM',
            status: 'Now',
            statusColor: 'bg-orange-100 text-orange-700'
        },
        {
            icon: Calculator,
            iconBg: 'bg-emerald-50 text-emerald-500',
            subject: 'Advanced Math',
            teacher: 'Ms. Nurul Huda',
            room: 'Room 201',
            time: '10:00 AM',
            status: 'Next',
            statusColor: 'bg-blue-100 text-blue-700'
        },
        {
            icon: BookOpen,
            iconBg: 'bg-rose-50 text-rose-500',
            subject: 'English Literature',
            teacher: 'Ms. Rachel Wong',
            room: 'Room 110',
            time: '1:00 PM',
            status: null,
            statusColor: null
        },
        {
            icon: Globe,
            iconBg: 'bg-cyan-50 text-cyan-500',
            subject: 'Geography',
            teacher: 'Mr. Azman',
            room: 'Room 205',
            time: '3:00 PM',
            status: null,
            statusColor: null
        }
    ];

    const grades = [
        { subject: 'Physics', progress: 95, grade: 'A', color: 'bg-blue-500' },
        { subject: 'Math', progress: 90, grade: 'A-', color: 'bg-orange-400' },
        { subject: 'English', progress: 85, grade: 'B+', color: 'bg-purple-500' },
        { subject: 'Chemistry', progress: 96, grade: 'A', color: 'bg-green-500' },
    ];

    const assignments = [
        { subject: 'Physics', task: 'Lab Report — Refraction', done: false, due: 'Tomorrow', badgeColor: 'bg-red-50 text-red-600' },
        { subject: 'Advanced Math', task: 'Chapter 7 Exercises', done: false, due: 'Wed', badgeColor: 'bg-orange-50 text-orange-600' },
        { subject: 'English Literature', task: 'Essay Draft — Hamlet', done: true, due: 'Done', badgeColor: 'bg-green-50 text-green-600' },
        { subject: 'Geography', task: 'Climate Zones Poster', done: false, due: 'Fri', badgeColor: 'bg-slate-100 text-slate-600' },
        { subject: 'Chemistry', task: 'Titration Lab Write-up', done: false, due: 'Next Mon', badgeColor: 'bg-slate-100 text-slate-600' },
    ];

    return (
        <div className="min-h-screen bg-slate-50 font-sans">
            <div className="max-w-7xl mx-auto w-full flex flex-col">

                {/* 1. Page Header */}
                <PageHeader
                    title="Dashboard"
                    badge={isMonitor ? "Class Monitor" : undefined}
                    subtitle="Monday, 2 June 2025"
                />

                <div className="px-6 lg:px-8 pb-12">


                    {/* 2. Stats Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-8">
                        {stats.map((stat, idx) => (
                            <div key={idx} className="bg-white border border-slate-100 shadow-sm rounded-2xl p-5 flex items-start gap-4">
                                <div className={`p-3 rounded-xl flex items-center justify-center shrink-0 ${stat.iconBg}`}>
                                    <stat.icon className="w-6 h-6 stroke-[2.5]" />
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-xl font-bold font-serif text-slate-900 mt-2 block break-words">&apos;Macbeth&apos; Character Analysis Essay</span>
                                    <span className="text-sm text-slate-500 mt-1.5">{stat.label}</span>
                                    <span className={`text-xs font-medium mt-2 ${stat.trendColor}`}>{stat.trend}</span>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* 3. Today's Classes Card */}
                    <div className="bg-white border border-slate-100 shadow-sm rounded-2xl p-6 mt-6">
                        <h2 className="text-xl font-serif font-bold text-slate-900 flex items-baseline gap-2 mb-2">
                            Today's Classes <span className="text-sm font-sans font-normal text-slate-400">— Monday</span>
                        </h2>

                        <div className="flex flex-col">
                            {classes.map((c, i) => (
                                <div key={i} className="flex items-center justify-between py-4 border-b border-slate-50 last:border-0 last:pb-0">
                                    <div className="flex items-center gap-4">
                                        <div className={`p-3 rounded-xl shrink-0 flex items-center justify-center ${c.iconBg}`}>
                                            <c.icon className="w-5 h-5" />
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="font-bold font-sans text-slate-800">{c.subject}</span>
                                            <span className="text-sm text-slate-500 mt-0.5">{c.teacher} · {c.room}</span>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3 shrink-0">
                                        <span className="text-sm font-medium text-slate-600">{c.time}</span>
                                        {c.status ? (
                                            <span className={`text-[11px] uppercase font-bold px-2 py-0.5 rounded-md w-12 text-center border ${c.statusColor.replace('bg-', 'border-').replace('text-', 'border-').replace('100', '200')} ${c.statusColor}`}>
                                                {c.status}
                                            </span>
                                        ) : (
                                            <span className="w-12"></span> /* spacer for alignment */
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* 4. Grade Overview Card */}
                    <div className="bg-white border border-slate-100 shadow-sm rounded-2xl p-6 mt-6">
                        <h2 className="text-xl font-serif font-bold text-slate-900">Grade Overview</h2>

                        <div className="mt-8 flex flex-col md:flex-row items-center gap-12 lg:gap-16 px-4">
                            {/* Left Circular Indicator */}
                            <div className="relative flex items-center justify-center shrink-0">
                                <svg className="w-28 h-28 transform -rotate-90">
                                    <circle cx="56" cy="56" r="48" className="text-slate-100" strokeWidth="10" stroke="currentColor" fill="none" />
                                    <circle cx="56" cy="56" r="48" className="text-orange-400" strokeWidth="10" stroke="currentColor" fill="none" strokeDasharray="301" strokeDashoffset="20" strokeLinecap="round" />
                                </svg>
                                <div className="absolute inset-0 flex flex-col items-center justify-center text-center mt-1">
                                    <span className="text-2xl font-bold font-sans text-slate-900 leading-none">3.87</span>
                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">GPA</span>
                                </div>
                            </div>

                            {/* Right bars */}
                            <div className="flex-1 w-full flex flex-col gap-6">
                                {grades.map((g, i) => (
                                    <div key={i} className="flex items-center gap-4">
                                        <span className="text-sm font-medium font-sans text-slate-800 w-24 shrink-0">{g.subject}</span>
                                        <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                                            <div className={`h-full rounded-full ${g.color}`} style={{ width: `${g.progress}%` }}></div>
                                        </div>
                                        <span className="text-sm font-bold font-sans text-slate-900 w-8 text-right shrink-0">{g.grade}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* 5. Assignments Card */}
                    <div className="bg-white border border-slate-100 shadow-sm rounded-2xl p-6 mt-6">
                        <h2 className="text-xl font-serif font-bold text-slate-900 mb-2">Assignments</h2>

                        <div className="flex flex-col">
                            {assignments.map((a, i) => (
                                <div key={i} className="flex items-center py-4 border-b border-slate-50 last:border-0 last:pb-0">
                                    <div className="shrink-0 mr-4">
                                        {a.done ? (
                                            <div className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center">
                                                <Check className="w-3 h-3 text-white stroke-[3]" />
                                            </div>
                                        ) : (
                                            <div className="w-5 h-5 rounded-md border-2 border-slate-200"></div>
                                        )}
                                    </div>
                                    <div className="flex-1 flex flex-col">
                                        <span className={`text-sm font-bold font-sans ${a.done ? 'text-slate-400 line-through' : 'text-slate-800'}`}>
                                            {a.task}
                                        </span>
                                        <span className={`text-xs font-sans mt-0.5 ${a.done ? 'text-slate-300' : 'text-slate-400'}`}>
                                            {a.subject}
                                        </span>
                                    </div>
                                    <div className={`text-[11px] font-medium px-2.5 py-1 rounded-full shrink-0 border ${a.badgeColor.replace('bg-', 'border-').replace('text-', 'border-').replace('50', '200').replace('100', '200')} ${a.badgeColor}`}>
                                        {a.due}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* 6. Announcement Banner */}
                    <div className="bg-slate-900 rounded-2xl p-6 mt-6 flex gap-4 items-start shadow-md">
                        <div className="shrink-0 mt-0.5">
                            <Megaphone className="w-5 h-5 text-orange-400" />
                        </div>
                        <div className="flex flex-col">
                            <h3 className="text-base font-serif font-bold text-white leading-tight mb-1.5">Mid-Term Exams</h3>
                            <p className="text-sm text-slate-300">
                                Physics &amp; Math papers on <span className="font-semibold text-orange-400">June 9–10</span>. Check your exam timetable in Schedule.
                            </p>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}