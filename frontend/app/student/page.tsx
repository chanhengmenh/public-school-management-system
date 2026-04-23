'use client';

import React, { useState, useEffect } from 'react';
import {
    Medal,
    Layers,
    CheckSquare,
    FileText,
    Microscope,
    Check,
    Megaphone,
    Loader2
} from 'lucide-react';
import { useAuth } from '@/components/auth/AuthProvider';
import { analyticsApi, enrollmentsApi, assignmentsApi, classSubjectsApi, announcementsApi } from '@/lib/api';
import { StudentScoreTrend, Enrollment, Assignment, ClassSubject } from '@/types/school.types';
import type { Announcement } from '@/lib/api/announcements';
import Link from 'next/link';

export default function StudentDashboardPage() {
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [scoreTrend, setScoreTrend] = useState<StudentScoreTrend | null>(null);
    const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
    const [assignments, setAssignments] = useState<Assignment[]>([]);
    const [classSubjects, setClassSubjects] = useState<ClassSubject[]>([]);
    const [announcements, setAnnouncements] = useState<Announcement[]>([]);

    useEffect(() => {
        if (!user) return;

        const fetchData = async () => {
            setLoading(true);
            try {
                const [trend, enrolled, anns] = await Promise.all([
                    analyticsApi.getStudentScoreTrend(user.id),
                    enrollmentsApi.list({ student_id: user.id }),
                    announcementsApi.list({ limit: 3 }),
                ]);
                setAnnouncements(anns);

                setScoreTrend(trend);
                setEnrollments(enrolled);

                if (enrolled.length > 0) {
                    const classIds = enrolled.map(e => e.class_id);
                    const [subjectArrays, taskArrays] = await Promise.all([
                        Promise.all(classIds.map(id => classSubjectsApi.list({ class_id: id }))),
                        Promise.all(classIds.map(id => assignmentsApi.list({ class_id: id }))),
                    ]);
                    setClassSubjects(subjectArrays.flat());
                    setAssignments(taskArrays.flat());
                }
            } catch (error) {
                console.error("Error fetching dashboard data", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [user]);

    if (loading) {
        return (
            <div className="flex h-screen items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-amber-500" />
            </div>
        );
    }

    const stats = [
        {
            icon: Medal,
            iconBg: 'bg-orange-50 text-orange-500',
            value: scoreTrend?.average_score !== undefined ? scoreTrend.average_score.toFixed(2) : '0.00',
            label: 'Avg Score',
            trend: 'This Term',
            trendColor: 'text-green-500'
        },
        {
            icon: Layers,
            iconBg: 'bg-blue-50 text-blue-500',
            value: enrollments.length.toString(),
            label: 'Active Classes',
            trend: 'Enrolled',
            trendColor: 'text-green-500'
        },
        {
            icon: CheckSquare,
            iconBg: 'bg-green-50 text-green-500',
            value: 'N/A',
            label: 'Attendance',
            trend: 'Tracked Daily',
            trendColor: 'text-slate-500'
        },
        {
            icon: FileText,
            iconBg: 'bg-purple-50 text-purple-500',
            value: assignments.length.toString(),
            label: 'Published Tasks',
            trend: 'In all subjects',
            trendColor: 'text-orange-500'
        }
    ];

    return (
        <div className="min-h-screen bg-slate-50 font-sans">
            <div className="max-w-7xl mx-auto w-full flex flex-col">
                <header className="sticky top-0 z-30 bg-slate-50/80 backdrop-blur-md border-b border-slate-200/50 px-6 lg:px-8 py-6 mb-2">
                    <div className="flex justify-between items-start">
                        <div>
                            <div className="flex items-center gap-3">
                                <h1 className="text-3xl font-sans font-bold text-[#0f172a] tracking-tight">Welcome, {user?.full_name}</h1>
                                {user?.is_class_monitor && (
                                    <span className="bg-blue-100/50 text-blue-700 text-xs font-semibold px-2.5 py-1 rounded-full border border-blue-200/50">
                                        Class Monitor
                                    </span>
                                )}
                            </div>
                            <p className="text-sm text-slate-500 mt-1">{new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                        </div>
                    </div>
                </header>

                <div className="px-6 lg:px-8 pb-12">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-8">
                        {stats.map((stat, idx) => (
                            <div key={idx} className="bg-white border border-slate-100 shadow-sm rounded-2xl p-5 flex items-start gap-4">
                                <div className={`p-3 rounded-xl flex items-center justify-center shrink-0 ${stat.iconBg}`}>
                                    <stat.icon className="w-6 h-6 stroke-[2.5]" />
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-2xl font-bold font-sans text-slate-900 leading-none">{stat.value}</span>
                                    <span className="text-sm text-slate-500 mt-1.5">{stat.label}</span>
                                    <span className={`text-xs font-medium mt-2 ${stat.trendColor}`}>{stat.trend}</span>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="bg-white border border-slate-100 shadow-sm rounded-2xl p-6 mt-6">
                        <h2 className="text-xl font-sans font-bold text-slate-900 flex items-baseline gap-2 mb-2">
                            My Subjects
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
                            {classSubjects.length > 0 ? classSubjects.map((cs, i) => (
                                <div key={i} className="p-4 border border-slate-100 rounded-xl hover:bg-slate-50 transition-colors">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-slate-100 rounded-lg">
                                            <Microscope className="w-5 h-5 text-slate-600" />
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-slate-800">{cs.subject_name}</h3>
                                            <p className="text-xs text-slate-500">{cs.teacher_name}</p>
                                        </div>
                                    </div>
                                </div>
                            )) : (
                                <p className="text-slate-500 text-sm col-span-full py-4 text-center border border-dashed rounded-xl">
                                    No subjects found for your class enrollment.
                                </p>
                            )}
                        </div>
                    </div>

                    <div className="bg-white border border-slate-100 shadow-sm rounded-2xl p-6 mt-6">
                        <h2 className="text-xl font-sans font-bold text-slate-900 mb-2">Active Assignments</h2>
                        <div className="flex flex-col">
                            {assignments.length > 0 ? assignments.map((a, i) => (
                                <div key={i} className="flex items-center py-4 border-b border-slate-50 last:border-0 last:pb-0">
                                    <div className="shrink-0 mr-4">
                                        <div className="w-5 h-5 rounded-md border-2 border-slate-200"></div>
                                    </div>
                                    <div className="flex-1 flex flex-col">
                                        <span className="text-sm font-bold font-sans text-slate-800">
                                            {a.title}
                                        </span>
                                        <span className="text-xs font-sans mt-0.5 text-slate-500">
                                            Max Score: {a.max_score}
                                        </span>
                                    </div>
                                    <div className="text-[11px] font-medium px-2.5 py-1 rounded-full shrink-0 border border-amber-200 bg-amber-50 text-amber-600">
                                        Due: {a.due_date ? new Date(a.due_date).toLocaleDateString() : 'No due date'}
                                    </div>
                                </div>
                            )) : (
                                <p className="text-slate-500 text-sm py-4">No published assignments found.</p>
                            )}
                        </div>
                    </div>

                    <div className="bg-white border border-slate-100 shadow-sm rounded-2xl p-6 mt-6">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-xl font-sans font-bold text-slate-900 flex items-center gap-2">
                                <Megaphone className="w-5 h-5 text-orange-400" /> Announcements
                            </h2>
                            <Link href="/student/notifications" className="text-xs text-slate-400 hover:text-orange-500 font-medium transition-colors">
                                View all →
                            </Link>
                        </div>
                        {announcements.length === 0 ? (
                            <p className="text-slate-400 text-sm py-4 text-center">No announcements yet.</p>
                        ) : (
                            <div className="flex flex-col gap-3">
                                {announcements.map(a => (
                                    <div key={a.id} className={`p-4 rounded-xl border ${a.is_pinned ? 'border-orange-200 bg-orange-50/50' : 'border-slate-100 bg-slate-50/50'}`}>
                                        <div className="flex items-start justify-between gap-2">
                                            <p className="font-bold text-slate-800 text-sm">{a.title}</p>
                                            {a.is_pinned && <span className="text-[10px] font-bold text-orange-600 bg-orange-100 px-1.5 py-0.5 rounded-full shrink-0">Pinned</span>}
                                        </div>
                                        <p className="text-xs text-slate-500 mt-1 line-clamp-2">{a.body}</p>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
