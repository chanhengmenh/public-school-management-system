'use client';

import React from 'react';
import {
    BookOpen,
    GraduationCap,
    ClipboardList,
    Zap,
    ChevronRight,
    AlertCircle,
    Megaphone,
    Trophy,
    CalendarCheck,
    BarChart,
    Users,
    type LucideIcon,
} from 'lucide-react';
import Link from 'next/link';
import PageHeader from '@/components/layouts/PageHeader';
import { Card, Button, Badge } from '@/components/ui';
import { getTeacherData } from '@/lib/mock-data/teacher';
import { useAuthStore } from '@/store/useAuthStore';
import type { TeacherTodayClass } from '@/types/school.types';

// ─── Icon Maps (UI concern, kept in the page) ───────────────────────

const statIconMap: Record<string, { icon: LucideIcon; bg: string; text: string; detail: string }> = {
    subjects: { icon: BookOpen, bg: 'bg-[#f0efff]', text: 'text-indigo-500', detail: 'text-indigo-600' },
    students: { icon: GraduationCap, bg: 'bg-[#e6f7ef]', text: 'text-emerald-500', detail: 'text-emerald-600' },
    grading: { icon: ClipboardList, bg: 'bg-[#fff0e5]', text: 'text-orange-500', detail: 'text-orange-500' },
    quizzes: { icon: Zap, bg: 'bg-[#faf5ff]', text: 'text-purple-600', detail: 'text-purple-600' },
};

const dotColorMap: Record<TeacherTodayClass['status'], string> = {
    now: 'bg-blue-500',
    next: 'bg-emerald-500',
    break: 'bg-slate-300',
    upcoming: 'bg-purple-500',
};

const statusBadgeVariant: Record<string, 'error' | 'warning'> = {
    now: 'error',
    next: 'warning',
};

const statusBadgeLabel: Record<string, string> = {
    now: 'NOW',
    next: 'NEXT',
};

// ─── Page ────────────────────────────────────────────────────────────

export default function TeacherDashboard() {
    const { user } = useAuthStore();
    const data = getTeacherData(user?.id ?? 'teacher_001');

    const today = new Date();
    const dateString = today.toLocaleDateString('en-US', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

    return (
        <div className="min-h-screen bg-[#f4f7f9]">
            <PageHeader
                title="Dashboard"
                subtitle={`${data.greeting} — ${dateString}`}
            />

            <div className="max-w-7xl mx-auto w-full flex flex-col px-6 lg:px-8 pb-12 space-y-6">

                {/* ── Welcome Banner ── */}
                <div className="bg-[#1b263b] rounded-[2rem] p-8 md:p-10 shadow-md flex flex-col md:flex-row gap-8 items-start md:items-center justify-between relative overflow-hidden">
                    <div className="relative z-10 flex-1">
                        <h2 className="text-4xl font-bold text-white mb-2 leading-tight">Hello, {data.name.split(' ').pop()}!</h2>
                        <p className="text-slate-300 text-lg mt-4 font-medium">
                            <span className="text-blue-400 font-bold">Check out what to do for today class!</span>
                        </p>
                    </div>
                    <div className="relative z-10 flex gap-8 md:gap-12 items-center text-right mt-4 md:mt-0">
                        {data.stats.slice(0, 3).map((s, idx) => (
                            <React.Fragment key={s.id}>
                                <div className="flex flex-col items-center md:items-end">
                                    <div className="text-3xl font-bold text-white leading-none">{s.value}</div>
                                    <div className="text-[9px] uppercase font-bold text-[#8a99af] mt-2 tracking-widest">
                                        {s.label.toUpperCase()} {s.sublabel ? s.sublabel.toUpperCase() : ''}
                                    </div>
                                </div>
                                {idx < 2 && <div className="w-px h-12 bg-slate-700/50 hidden md:block" />}
                            </React.Fragment>
                        ))}
                    </div>
                </div>

                {/* ── Stats Grid (4 Cards) ── */}
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
                    {data.stats.map((stat) => {
                        const cfg = statIconMap[stat.id] ?? statIconMap['subjects'];
                        const Icon = cfg.icon;
                        return (
                            <Card key={stat.id} className="p-6 !rounded-3xl flex flex-col items-center text-center" hoverable>
                                <h3 className="text-slate-900 font-bold text-2xl mb-2">{stat.value}</h3>
                                <div className="flex items-center gap-3">
                                    <div className={`w-10 h-10 rounded-xl ${cfg.bg} ${cfg.text} flex items-center justify-center shrink-0`}>
                                        <Icon className="w-5 h-5" />
                                    </div>
                                    <div className="text-left">
                                        <p className="text-[#8a99af] text-xs font-semibold leading-snug">{stat.label}<br />{stat.sublabel}</p>
                                    </div>
                                </div>
                                <p className={`${cfg.detail} text-[11px] font-bold mt-3`}>{stat.detail}</p>
                            </Card>
                        );
                    })}
                </div>

                {/* ── Quick Home-Class Overview ── */}
                {user?.homeClass && (
                    <Card className="p-6 bg-gradient-to-r from-amber-50 to-white border-amber-100 flex flex-col xl:flex-row xl:items-center justify-between gap-6 overflow-hidden relative">
                        {/* Decorative background element */}
                        <div className="absolute right-0 top-0 w-64 h-64 bg-amber-200/20 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />
                        
                        <div className="relative z-10 flex-1">
                            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2 mb-2">
                                <span>👑</span> Quick Home-Class Overview: {user.homeClass.name}
                            </h2>
                            <p className="text-sm text-slate-500 max-w-md">Overview of your home class performance and attendance for today.</p>
                        </div>
                        
                        <div className="relative z-10 flex flex-wrap sm:flex-nowrap gap-4 xl:w-1/2">
                            <div className="flex-1 bg-white p-4 rounded-xl border border-slate-100 shadow-sm flex items-center justify-between">
                                <span className="text-sm font-semibold text-slate-600">Today's Attendance</span>
                                <span className="text-lg font-bold text-emerald-600">98%</span>
                            </div>
                            <div className="flex-1 bg-white p-4 rounded-xl border border-slate-100 shadow-sm flex items-center justify-between">
                                <span className="text-sm font-semibold text-slate-600">Class Avg GPA</span>
                                <span className="text-lg font-bold text-blue-600">3.4</span>
                            </div>
                        </div>
                    </Card>
                )}

                {/* ── Main Content Grid (Split Layout) ── */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

                    {/* Left: Pending Grading */}
                    <div className="lg:col-span-7 flex flex-col">
                        <Card className="flex-1 overflow-hidden !p-0">
                            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
                                <h2 className="text-lg font-bold text-slate-900">Pending Grading</h2>
                                <Button variant="outline" size="sm" icon={ChevronRight} className="!flex-row-reverse">
                                    View all
                                </Button>
                            </div>
                            <div className="flex flex-col">
                                {data.pendingGrading.map((pg, idx) => (
                                    <div
                                        key={pg.id}
                                        className={`p-4 flex items-center hover:bg-slate-50 transition-colors group cursor-pointer ${idx < data.pendingGrading.length - 1 ? 'border-b border-slate-50' : ''}`}
                                    >
                                        <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${pg.isOverdue ? 'bg-red-50 text-red-500' : idx === data.pendingGrading.length - 1 ? 'bg-slate-100 text-slate-500' : 'bg-orange-50 text-orange-500'}`}>
                                            {pg.isOverdue ? <AlertCircle className="w-5 h-5" /> : <ClipboardList className="w-5 h-5" />}
                                        </div>
                                        <div className="ml-4 flex-1 min-w-0 flex flex-col justify-center">
                                            <h4 className="text-sm font-bold text-slate-900 truncate group-hover:text-blue-600 transition-colors">{pg.title}</h4>
                                            <div className="flex items-center text-xs text-slate-500 mt-0.5 gap-2">
                                                <span className="font-medium text-slate-700">{pg.subject} · {pg.className}</span>
                                                <span>•</span>
                                                {pg.isOverdue ? (
                                                    <Badge variant="error" className="!text-[10px] !px-1.5 !py-0">{pg.dueLabel}</Badge>
                                                ) : (
                                                    <span>{pg.dueLabel}</span>
                                                )}
                                            </div>
                                        </div>
                                        <div className="ml-4 text-right shrink-0">
                                            <div className={`text-sm font-bold ${pg.isOverdue ? 'text-red-600' : 'text-slate-700'}`}>{pg.submitted} / {pg.total}</div>
                                            <Badge variant="neutral" className="!text-[10px] uppercase tracking-wider mt-0.5">SUBMITTED</Badge>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </Card>
                    </div>

                    {/* Right: Today's Classes & Notice */}
                    <div className="lg:col-span-5 flex flex-col gap-6">

                        {/* Today's Classes Card */}
                        <Card className="overflow-hidden flex-1 !p-0">
                            <div className="p-5 border-b border-slate-100">
                                <h2 className="text-lg font-bold text-slate-900 flex items-center">
                                    <span className="w-1.5 h-5 bg-blue-500 rounded-full mr-2" />
                                    Today&apos;s Classes
                                </h2>
                            </div>
                            <div className="flex flex-col p-2 gap-1 content-start">
                                {data.todaysClasses.map((c) => {
                                    const badgeVariant = statusBadgeVariant[c.status];
                                    const badgeLabel = statusBadgeLabel[c.status];
                                    const isBreak = c.status === 'break';

                                    return (
                                        <div
                                            key={c.id}
                                            className={`flex items-center p-3 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer group ${isBreak ? 'opacity-60' : ''}`}
                                        >
                                            <div className={`w-2.5 h-2.5 rounded-full ${dotColorMap[c.status]} shrink-0 mx-2`} />
                                            <div className="ml-3 flex-1 min-w-0">
                                                {isBreak ? (
                                                    <>
                                                        <p className="text-sm font-medium text-slate-900 truncate">Siti submitted &apos;Lab Report 3&apos;</p>
                                                        <p className="text-xs text-slate-500 mt-0.5">{c.room}</p>
                                                    </>
                                                ) : (
                                                    <>
                                                        <h4 className="text-sm font-bold text-slate-900 truncate group-hover:text-blue-600 transition-colors">{c.subject} — {c.className}</h4>
                                                        <p className="text-xs text-slate-500 mt-0.5">{c.room} • {c.students} students</p>
                                                    </>
                                                )}
                                            </div>
                                            <div className="text-right flex flex-col items-end">
                                                <div className="text-sm font-bold text-slate-900 flex items-center gap-2">
                                                    {c.time}
                                                    {badgeVariant && badgeLabel && (
                                                        <Badge variant={badgeVariant} className="!text-[9px] font-bold uppercase tracking-wider">
                                                            {badgeLabel}
                                                        </Badge>
                                                    )}
                                                </div>
                                                <div className="text-xs text-slate-400 mt-0.5">{c.duration}</div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </Card>

                        {/* Staff Meeting Notice Card */}
                        {data.notices.map((notice) => (
                            <div key={notice.id} className="bg-slate-900 rounded-2xl shadow-sm p-5 border border-slate-800 relative overflow-hidden group hover:border-slate-700 transition-colors cursor-pointer shrink-0">
                                <Link href="#" className="absolute inset-0 z-20" />
                                <div className="absolute top-0 right-0 w-32 h-32 bg-pink-500/10 rounded-full blur-2xl -mr-10 -mt-10 transition-all group-hover:bg-pink-500/20" />
                                <div className="relative z-10 flex gap-4">
                                    <div className="w-10 h-10 rounded-xl bg-pink-500/20 text-pink-400 flex items-center justify-center shrink-0">
                                        <Megaphone className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <h3 className="text-white font-bold text-sm">{notice.title}</h3>
                                        <p className="text-slate-400 text-xs mt-1 leading-relaxed">{notice.message}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

            </div>
        </div>
    );
}