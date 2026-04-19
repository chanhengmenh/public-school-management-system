'use client';

import React, { useState, useEffect } from 'react';
import {
    BookOpen,
    ClipboardList,
    BarChart3,
    Loader2,
    Plus,
    Trophy,
    Megaphone
} from 'lucide-react';
import { useAuth } from '@/components/auth/AuthProvider';
import { classSubjectsApi, assignmentsApi, classesApi, analyticsApi, announcementsApi } from '@/lib/api';
import { ClassSubject, Assignment, ClassRanking } from '@/types/school.types';
import type { Announcement } from '@/lib/api/announcements';
import Link from 'next/link';

export default function TeacherDashboardPage() {
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [classes, setClasses] = useState<ClassSubject[]>([]);
    const [assignments, setAssignments] = useState<Assignment[]>([]);
    const [ranking, setRanking] = useState<ClassRanking | null>(null);
    const [announcements, setAnnouncements] = useState<Announcement[]>([]);

    useEffect(() => {
        if (!user) return;
        const fetchData = async () => {
            try {
                const [myClasses, anns] = await Promise.all([
                    classSubjectsApi.list({ teacher_id: user.id }),
                    announcementsApi.list({ limit: 3 }),
                ]);
                setAnnouncements(anns);
                setClasses(myClasses);
                const assignmentArrays = await Promise.all(
                    myClasses.map(cs => assignmentsApi.list({ class_subject_id: cs.id }))
                );
                setAssignments(assignmentArrays.flat());

                if (user.is_home_teacher) {
                    const allClasses = await classesApi.list();
                    const homeClass = allClasses.find(c => c.home_teacher_id === user.id);
                    if (homeClass) {
                        const rankData = await analyticsApi.getHomeTeacherRanking(homeClass.id);
                        setRanking(rankData);
                    }
                }
            } catch (error) {
                console.error("Error fetching teacher data", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [user]);

    if (loading) {
        return (
            <div className="flex h-screen items-center justify-center bg-slate-50">
                <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
            </div>
        );
    }

    return (
        <div className="p-8 bg-slate-50 min-h-screen">
            <header className="flex justify-between items-center mb-10">
                <div>
                    <h1 className="text-3xl font-serif font-bold text-slate-900">Teacher Dashboard</h1>
                    <p className="text-slate-500 mt-1">Hello, {user?.full_name}</p>
                </div>
                {user?.is_home_teacher && (
                    <span className="bg-amber-100 text-amber-700 px-4 py-2 rounded-full text-sm font-bold border border-amber-200">
                        Home Teacher Privilege
                    </span>
                )}
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Classes Section */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                                <BookOpen className="text-blue-500" /> My Classes
                            </h2>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {classes.map((cs) => (
                                <div key={cs.id} className="p-4 border border-slate-100 rounded-xl hover:border-blue-200 transition-colors bg-slate-50/50">
                                    <h3 className="font-bold text-slate-800">{cs.subject_name}</h3>
                                    <p className="text-sm text-slate-500">{cs.class_name}</p>
                                    <div className="mt-4 flex gap-2">
                                        <Link href={`/teacher/classes/${cs.id}`} className="text-xs font-bold text-blue-600 hover:underline">
                                            View Class →
                                        </Link>
                                        <Link href={`/teacher/classes/${cs.id}/analysis`} className="text-xs font-bold text-purple-600 hover:underline">
                                            Analysis →
                                        </Link>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                        <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2 mb-6">
                            <ClipboardList className="text-purple-500" /> Recent Assignments
                        </h2>
                        <div className="space-y-3">
                            {assignments.slice(0, 5).map((a) => (
                                <div key={a.id} className="flex justify-between items-center p-3 hover:bg-slate-50 rounded-lg transition-colors">
                                    <div>
                                        <p className="font-bold text-slate-800">{a.title}</p>
                                        <p className="text-xs text-slate-500">
                                            Due: {a.due_date ? new Date(a.due_date).toLocaleDateString() : 'No due date'}
                                        </p>
                                    </div>
                                    <span className={`text-[10px] font-bold px-2 py-1 rounded-md ${a.status === 'published' ? 'bg-emerald-100 text-emerald-700' : a.status === 'closed' ? 'bg-red-100 text-red-600' : 'bg-slate-100 text-slate-600'}`}>
                                        {a.status.toUpperCase()}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Home Teacher Ranking — only shown when user has home teacher privilege */}
                    {user?.is_home_teacher && ranking && (
                        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2 mb-2">
                                <Trophy className="text-amber-500" /> Class Ranking
                            </h2>
                            <p className="text-sm text-slate-500 mb-6">{ranking.class_name} — {ranking.academic_year}</p>
                            <div className="overflow-hidden rounded-xl border border-slate-100">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="bg-slate-50 border-b border-slate-100">
                                            <th className="px-4 py-3 text-xs uppercase tracking-wider font-bold text-slate-500">Rank</th>
                                            <th className="px-4 py-3 text-xs uppercase tracking-wider font-bold text-slate-500">Student</th>
                                            <th className="px-4 py-3 text-xs uppercase tracking-wider font-bold text-slate-500 text-right">Total</th>
                                            <th className="px-4 py-3 text-xs uppercase tracking-wider font-bold text-slate-500 text-right">Average</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-50">
                                        {ranking.rankings.map((entry) => (
                                            <tr key={entry.student_id} className="hover:bg-slate-50 transition-colors">
                                                <td className="px-4 py-3">
                                                    <span className={`inline-flex items-center justify-center w-7 h-7 rounded-full text-xs font-bold ${entry.rank === 1 ? 'bg-amber-100 text-amber-700' : entry.rank === 2 ? 'bg-slate-200 text-slate-700' : entry.rank === 3 ? 'bg-orange-100 text-orange-700' : 'bg-slate-50 text-slate-500'}`}>
                                                        {entry.rank}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3 font-bold text-slate-800">{entry.student_name}</td>
                                                <td className="px-4 py-3 text-right text-slate-700">{entry.total_score.toFixed(1)} pts</td>
                                                <td className="px-4 py-3 text-right text-slate-500">{entry.average_score.toFixed(1)} pts</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </div>

                {/* Quick Actions / Summary */}
                <div className="space-y-6">
                    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="font-bold text-slate-900 flex items-center gap-2">
                                <Megaphone size={18} className="text-orange-400" /> Announcements
                            </h3>
                            <Link href="/teacher/notifications" className="text-xs text-slate-400 hover:text-orange-500 font-medium transition-colors">
                                View all →
                            </Link>
                        </div>
                        {announcements.length === 0 ? (
                            <p className="text-slate-400 text-sm text-center py-2">No announcements.</p>
                        ) : (
                            <div className="space-y-3">
                                {announcements.map(a => (
                                    <div key={a.id} className={`p-3 rounded-xl border text-sm ${a.is_pinned ? 'border-orange-200 bg-orange-50/50' : 'border-slate-100 bg-slate-50/50'}`}>
                                        <p className="font-bold text-slate-800">{a.title}</p>
                                        <p className="text-xs text-slate-500 mt-0.5 line-clamp-2">{a.body}</p>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="bg-slate-900 p-6 rounded-2xl text-white shadow-lg">
                        <h3 className="font-bold mb-4 flex items-center gap-2">
                            <BarChart3 size={20} className="text-amber-400" /> Quick Summary
                        </h3>
                        <div className="space-y-4">
                            <div className="flex justify-between">
                                <span className="text-slate-400 text-sm">Total Classes</span>
                                <span className="font-bold">{classes.length}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-slate-400 text-sm">Active Assignments</span>
                                <span className="font-bold">{assignments.filter(a => a.status === 'published').length}</span>
                            </div>
                        </div>
                        <Link href="/teacher/classes" className="w-full mt-6 py-3 bg-amber-500 hover:bg-amber-400 text-slate-900 font-bold rounded-xl transition-colors flex items-center justify-center gap-2">
                            <Plus size={18} /> New Assignment
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
