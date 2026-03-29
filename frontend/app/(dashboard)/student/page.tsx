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
    Megaphone,
    type LucideIcon,
} from 'lucide-react';
import PageHeader from '@/components/layouts/PageHeader';
import { Card, Badge, ProgressBar } from '@/components/ui';
import { getStudentData } from '@/lib/mock-data/student';
import { useAuthStore } from '@/store/useAuthStore';
import { getSubjectTheme } from '@/lib/utils';
import type { Assignment } from '@/types/school.types';

// ─── Icon Mappings (UI concern — kept in the page) ──────────────────

const statIconMap: Record<string, { icon: LucideIcon; bg: string }> = {
    gpa:        { icon: Medal,       bg: 'bg-orange-50 text-orange-500' },
    classes:    { icon: Layers,      bg: 'bg-blue-50 text-blue-500' },
    attendance: { icon: CheckSquare, bg: 'bg-green-50 text-green-500' },
    tasks:      { icon: FileText,    bg: 'bg-purple-50 text-purple-500' },
};

const subjectIconMap: Record<string, LucideIcon> = {
    'Physics': Microscope,
    'Advanced Math': Calculator,
    'English Literature': BookOpen,
    'Geography': Globe,
};

const trendColorMap: Record<string, string> = {
    up: 'text-green-500',
    down: 'text-red-500',
    neutral: 'text-orange-500',
};

const urgencyToBadgeVariant: Record<Assignment['urgency'], 'error' | 'warning' | 'success' | 'neutral'> = {
    urgent: 'error',
    upcoming: 'warning',
    done: 'success',
    later: 'neutral',
};

export default function StudentDashboardPage() {
    const { user } = useAuthStore();
    const isMonitor = user?.subRole === 'monitor';
    const data = getStudentData(user?.id ?? 'alex_id');

    return (
        <div className="min-h-screen bg-slate-50 font-sans">
            <PageHeader
                title="Dashboard"
                badge={isMonitor ? "Class Monitor" : undefined}
                subtitle="Monday, 2 June 2025"
            />

            <div className="max-w-7xl mx-auto w-full flex flex-col">
                <div className="px-6 lg:px-8 pb-12 pt-6">

                    {/* 2. Stats Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-8">
                        {data.stats.map((stat) => {
                            const iconConfig = statIconMap[stat.id];
                            const IconComponent = iconConfig?.icon ?? Layers;
                            const iconBg = iconConfig?.bg ?? 'bg-slate-100 text-slate-500';

                            return (
                                <Card key={stat.id} className="p-5 flex items-start gap-4">
                                    <div className={`p-3 rounded-xl flex items-center justify-center shrink-0 ${iconBg}`}>
                                        <IconComponent className="w-6 h-6 stroke-[2.5]" />
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-2xl font-bold font-sans text-slate-900">{stat.value}</span>
                                        <span className="text-sm text-slate-500 mt-1.5">{stat.label}</span>
                                        <span className={`text-xs font-medium mt-2 ${trendColorMap[stat.trendDirection]}`}>
                                            {stat.trend}
                                        </span>
                                    </div>
                                </Card>
                            );
                        })}
                    </div>

                    {/* 3. Today's Classes Card */}
                    <Card className="p-6 mt-6">
                        <h2 className="text-xl font-serif font-bold text-slate-900 flex items-baseline gap-2 mb-2">
                            Today&apos;s Classes <span className="text-sm font-sans font-normal text-slate-400">— Monday</span>
                        </h2>

                        <div className="flex flex-col">
                            {data.todaysClasses.map((c) => {
                                const theme = getSubjectTheme(c.subject);
                                const SubjectIcon = subjectIconMap[c.subject] ?? BookOpen;

                                return (
                                    <div key={c.id} className="flex items-center justify-between py-4 border-b border-slate-50 last:border-0 last:pb-0">
                                        <div className="flex items-center gap-4">
                                            <div className={`p-3 rounded-xl shrink-0 flex items-center justify-center ${theme.bg} ${theme.text}`}>
                                                <SubjectIcon className="w-5 h-5" />
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="font-bold font-sans text-slate-800">{c.subject}</span>
                                                <span className="text-sm text-slate-500 mt-0.5">{c.teacher} · {c.room}</span>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3 shrink-0">
                                            <span className="text-sm font-medium text-slate-600">{c.time}</span>
                                            {c.status === 'now' ? (
                                                <Badge variant="warning" className="text-[11px] uppercase font-bold w-12 justify-center">
                                                    Now
                                                </Badge>
                                            ) : c.status === 'next' ? (
                                                <Badge variant="info" className="text-[11px] uppercase font-bold w-12 justify-center">
                                                    Next
                                                </Badge>
                                            ) : (
                                                <span className="w-12"></span>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </Card>

                    {/* 4. Grade Overview Card */}
                    <Card className="p-6 mt-6">
                        <h2 className="text-xl font-serif font-bold text-slate-900">Grade Overview</h2>

                        <div className="mt-8 flex flex-col md:flex-row items-center gap-12 lg:gap-16 px-4">
                            {/* Left Circular Indicator */}
                            <div className="relative flex items-center justify-center shrink-0">
                                <svg className="w-28 h-28 transform -rotate-90">
                                    <circle cx="56" cy="56" r="48" className="text-slate-100" strokeWidth="10" stroke="currentColor" fill="none" />
                                    <circle cx="56" cy="56" r="48" className="text-orange-400" strokeWidth="10" stroke="currentColor" fill="none" strokeDasharray="301" strokeDashoffset="20" strokeLinecap="round" />
                                </svg>
                                <div className="absolute inset-0 flex flex-col items-center justify-center text-center mt-1">
                                    <span className="text-2xl font-bold font-sans text-slate-900 leading-none">{data.gpa}</span>
                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">GPA</span>
                                </div>
                            </div>

                            {/* Right bars */}
                            <div className="flex-1 w-full flex flex-col gap-6">
                                {data.grades.map((g, i) => {
                                    const theme = getSubjectTheme(g.subject);
                                    return (
                                        <div key={i} className="flex items-center gap-4">
                                            <span className="text-sm font-medium font-sans text-slate-800 w-24 shrink-0">{g.subject}</span>
                                            <ProgressBar
                                                value={g.progress}
                                                color={theme.progressFill}
                                                className="flex-1"
                                            />
                                            <span className="text-sm font-bold font-sans text-slate-900 w-8 text-right shrink-0">{g.grade}</span>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </Card>

                    {/* 5. Assignments Card */}
                    <Card className="p-6 mt-6">
                        <h2 className="text-xl font-serif font-bold text-slate-900 mb-2">Assignments</h2>

                        <div className="flex flex-col">
                            {data.assignments.map((a) => (
                                <div key={a.id} className="flex items-center py-4 border-b border-slate-50 last:border-0 last:pb-0">
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
                                    <Badge variant={urgencyToBadgeVariant[a.urgency]}>
                                        {a.due}
                                    </Badge>
                                </div>
                            ))}
                        </div>
                    </Card>

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