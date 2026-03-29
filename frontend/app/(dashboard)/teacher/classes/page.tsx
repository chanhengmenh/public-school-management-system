'use client';

import { Microscope, Atom, Clock, FileText, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';
import PageHeader from '@/components/layouts/PageHeader';

export default function TeacherClassesPage() {

    const classes = [
        {
            id: 'class-1',
            subject: 'Physics',
            className: 'Class 11A',
            schedule: 'Mon / Wed / Fri',
            students: 32,
            hw: 2,
            quizzes: 1,
            avg: '88%',
            theme: 'blue',
            icon: Microscope
        },
        {
            id: 'class-2',
            subject: 'Advanced Physics',
            className: 'Class 12A',
            schedule: 'Tue / Thu',
            students: 28,
            hw: 1,
            quizzes: 0,
            avg: '92%',
            theme: 'teal',
            icon: Atom
        },
        {
            id: 'class-3',
            subject: 'Physics',
            className: 'Class 11B',
            schedule: 'Mon / Wed',
            students: 30,
            hw: 0,
            quizzes: 2,
            avg: '85%',
            theme: 'purple',
            icon: Microscope
        },
        {
            id: 'class-4',
            subject: 'Intro to Physics',
            className: 'Class 10A',
            schedule: 'Tue / Fri',
            students: 35,
            hw: 3,
            quizzes: 1,
            avg: '78%',
            theme: 'orange',
            icon: Microscope
        }
    ];

    const getThemeColors = (theme: string) => {
        switch (theme) {
            case 'blue':
                return {
                    bg: 'bg-blue-50',
                    text: 'text-blue-600',
                    track: 'bg-blue-100',
                    fill: 'bg-blue-500',
                    badgeBg: 'bg-blue-100',
                    badgeText: 'text-blue-700'
                };
            case 'teal':
                return {
                    bg: 'bg-teal-50',
                    text: 'text-teal-600',
                    track: 'bg-teal-100',
                    fill: 'bg-teal-500',
                    badgeBg: 'bg-teal-100',
                    badgeText: 'text-teal-700'
                };
            case 'purple':
                return {
                    bg: 'bg-purple-50',
                    text: 'text-purple-600',
                    track: 'bg-purple-100',
                    fill: 'bg-purple-500',
                    badgeBg: 'bg-purple-100',
                    badgeText: 'text-purple-700'
                };
            case 'orange':
                return {
                    bg: 'bg-orange-50',
                    text: 'text-orange-600',
                    track: 'bg-orange-100',
                    fill: 'bg-orange-500',
                    badgeBg: 'bg-orange-100',
                    badgeText: 'text-orange-700'
                };
            default:
                return {
                    bg: 'bg-slate-50',
                    text: 'text-slate-600',
                    track: 'bg-slate-100',
                    fill: 'bg-slate-500',
                    badgeBg: 'bg-slate-100',
                    badgeText: 'text-slate-700'
                };
        }
    };

    return (
        <div className="min-h-screen bg-[#f4f7f9]">
            {/* 1. Page Layout & Clean Sticky Header */}
            <PageHeader
                title="My Classes"
                subtitle={`Term 2 · ${classes.length} classes`}
            />

            {/* Main Content Wrapper */}
            <div className="max-w-7xl mx-auto w-full flex flex-col px-6 lg:px-8 pt-6 pb-32">
                {/* 3. Grid Container */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {/* 4. Card UI Design */}
                    {classes.map((c) => {
                        const colors = getThemeColors(c.theme);
                        const Icon = c.icon;

                        return (
                            <Link
                                key={c.id}
                                href={`/teacher/classes/${c.id}`}
                                className="block bg-white rounded-[20px] border border-slate-100 p-6 flex flex-col shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] hover:shadow-[0_8px_20px_-6px_rgba(0,0,0,0.1)] transition-all duration-300 group"
                            >
                                {/* Top Layout: Icon & Badge */}
                                <div className="flex items-start justify-between mb-4">
                                    <div className="w-12 h-12 rounded-xl flex items-center justify-center border border-slate-100 bg-slate-50 text-slate-700">
                                        <Icon className="w-5 h-5 stroke-[2]" />
                                    </div>
                                    <span className={`px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider ${colors.bg} ${colors.text}`}>
                                        {c.className}
                                    </span>
                                </div>

                                {/* Title & Subtitle */}
                                <h2 className="text-[22px] font-bold text-slate-900 group-hover:text-blue-700 transition-colors">
                                    {c.subject}
                                </h2>
                                <div className="flex items-center text-[13px] text-slate-500 mt-1.5 mb-8 gap-2">
                                    <span>{c.students} students</span>
                                    <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                                    <span className="flex items-center gap-1.5">
                                        <Clock className="w-3.5 h-3.5" />
                                        {c.schedule}
                                    </span>
                                </div>

                                {/* Metrics Section (HW, Quiz) */}
                                <div className="flex flex-wrap items-center gap-3 mt-auto">
                                    <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-red-50 text-red-600 border border-red-100/50 text-xs font-bold shadow-[0_1px_2px_rgba(0,0,0,0.02)]">
                                        <FileText className="w-3.5 h-3.5" />
                                        {c.hw} HW
                                    </div>
                                    <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-orange-50 text-orange-600 border border-orange-100/50 text-xs font-bold shadow-[0_1px_2px_rgba(0,0,0,0.02)]">
                                        <CheckCircle2 className="w-3.5 h-3.5" />
                                        {c.quizzes} Quiz
                                    </div>
                                </div>

                                {/* Card Footer */}
                                <div className="mt-6 border-t border-slate-100/80 pt-5 flex justify-between items-center">
                                    <span className="text-[13px] text-slate-500">
                                        {c.students} students enrolled
                                    </span>
                                    <span className="font-bold text-sm text-blue-600 flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                                        <span className="text-lg leading-none transform translate-y-[-1px]"></span>
                                    </span>
                                </div>
                            </Link>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}