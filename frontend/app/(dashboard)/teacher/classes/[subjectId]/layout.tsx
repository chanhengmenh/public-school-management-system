'use client';

import React from 'react';
import Link from 'next/link';
import { useParams, usePathname } from 'next/navigation';
import { Microscope, ArrowLeft } from 'lucide-react';

const classInfoMap: Record<string, { subject: string; className: string; students: number; room: string; schedule: string }> = {
    'class-1': { subject: 'Physics', className: '11A', students: 32, room: 'Room 304', schedule: 'Mon / Wed / Fri' },
    'class-2': { subject: 'Advanced Physics', className: '12A', students: 28, room: 'Room 305', schedule: 'Tue / Thu' },
    'class-3': { subject: 'Physics', className: '11B', students: 30, room: 'Room 304', schedule: 'Mon / Wed' },
    'class-4': { subject: 'Intro to Physics', className: '10A', students: 35, room: 'Room 201', schedule: 'Tue / Fri' },
};

export default function TeacherSubjectLayout({ children }: { children: React.ReactNode }) {
    const params = useParams();
    const pathname = usePathname();
    const subjectId = (params?.subjectId as string) || 'class-1';
    const classInfo = classInfoMap[subjectId] || classInfoMap['class-1'];

    const basePath = `/teacher/classes/${subjectId}`;

    const tabs = [
        { label: 'Class Material', href: basePath },
        { label: 'Assignments', href: `${basePath}/assignments` },
        { label: 'Quiz', href: `${basePath}/quizzes` },
        { label: 'Grade', href: `${basePath}/grading` },
        { label: 'People', href: `${basePath}/people` },
        { label: 'Attendance', href: `${basePath}/attendance` },
    ];

    const getIsActive = (tab: { label: string; href: string }) => {
        if (tab.label === 'Class Material') {
            return pathname === basePath;
        }
        return pathname.endsWith('/assignments') && tab.label === 'Assignments'
            || pathname.endsWith('/quizzes') && tab.label === 'Quiz'
            || pathname.endsWith('/grading') && tab.label === 'Grade'
            || pathname.endsWith('/people') && tab.label === 'People'
            || pathname.endsWith('/attendance') && tab.label === 'Attendance';
    };

    return (
        <div className="min-h-screen bg-[#f4f7f9] relative">
            <div className="max-w-7xl mx-auto w-full flex flex-col px-6 lg:px-8 pt-8 pb-12">

                {/* Breadcrumbs */}
                <Link href="/teacher/classes" className="inline-flex items-center text-sm font-medium text-slate-500 hover:text-slate-800 transition-colors mb-6 w-fit">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    My Classes <span className="mx-2 text-slate-300">/</span> <span className="text-slate-700">{classInfo.subject} {classInfo.className}</span>
                </Link>

                {/* Hero Banner */}
                <div className="bg-slate-900 rounded-[2rem] p-8 md:p-10 shadow-md flex flex-col md:flex-row gap-8 items-start md:items-center justify-between relative overflow-hidden mb-6">
                    {/* Left Side: Icon & Title */}
                    <div className="relative z-10 flex gap-5 items-center">
                        <div className="w-16 h-16 rounded-2xl bg-indigo-500/20 flex items-center justify-center shrink-0">
                            <Microscope className="w-8 h-8 text-indigo-400" />
                        </div>
                        <div className="flex flex-col">
                            <h2 className="text-2xl font-bold text-white mb-1">{classInfo.subject} — Class {classInfo.className}</h2>
                            <p className="text-slate-400 text-xs">{classInfo.room} · {classInfo.schedule} · {classInfo.students} students</p>
                        </div>
                    </div>

                    {/* Right Side: Stats Layout */}
                    <div className="relative z-10 flex flex-row gap-8 md:gap-10 items-center justify-center w-full md:w-auto mt-6 md:mt-0 ml-auto">
                        <div className="flex flex-col items-center justify-center">
                            <div className="text-2xl font-bold text-white leading-tight">{classInfo.students}</div>
                            <div className="text-[10px] uppercase font-bold text-slate-400 mt-0.5 tracking-wider">STUDENTS</div>
                        </div>
                    </div>
                </div>

                {/* Navigation Tabs */}
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 px-2 flex overflow-x-auto mb-8 hide-scrollbar">
                    {tabs.map((tab) => {
                        const isActive = getIsActive(tab);
                        return (
                            <Link
                                key={tab.label}
                                href={tab.href}
                                className={`px-6 py-4 text-sm font-bold whitespace-nowrap border-b-2 transition-colors flex items-center gap-2 ${isActive
                                    ? 'border-blue-600 text-blue-600'
                                    : 'border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300'
                                    }`}
                            >
                                {tab.label}
                            </Link>
                        );
                    })}
                </div>

                {/* Page Content */}
                {children}

            </div>

            <style jsx global>{`
                .hide-scrollbar::-webkit-scrollbar {
                    display: none;
                }
                .hide-scrollbar {
                    -ms-overflow-style: none;
                    scrollbar-width: none;
                }
                .hidden-scrollbar::-webkit-scrollbar {
                    display: none;
                }
                .hidden-scrollbar {
                    -ms-overflow-style: none;
                    scrollbar-width: none;
                }
                .hide-arrows::-webkit-outer-spin-button,
                .hide-arrows::-webkit-inner-spin-button {
                    -webkit-appearance: none;
                    margin: 0;
                }
                .hide-arrows[type=number] {
                    -moz-appearance: textfield;
                    appearance: textfield;
                }
            `}</style>
        </div>
    );
}