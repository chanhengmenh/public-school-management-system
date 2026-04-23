'use client';

import React, { useState, useEffect } from 'react';
import {
    Users,
    UserCheck,
    BookOpen,
    FileText,
    Activity,
    TrendingUp,
    Loader2,
    Megaphone
} from 'lucide-react';
import { analyticsApi, announcementsApi } from '../../lib/api';
import { AdminOverview } from '../../types/school.types';
import type { Announcement } from '../../lib/api/announcements';
import Link from 'next/link';

export default function AdminDashboardPage() {
    const [loading, setLoading] = useState(true);
    const [overview, setOverview] = useState<AdminOverview | null>(null);
    const [announcements, setAnnouncements] = useState<Announcement[]>([]);

    useEffect(() => {
        const fetchOverview = async () => {
            try {
                const [data, anns] = await Promise.all([
                    analyticsApi.getAdminOverview(),
                    announcementsApi.list({ limit: 3 }),
                ]);
                setOverview(data);
                setAnnouncements(anns);
            } catch (error) {
                console.error("Error fetching admin overview", error);
            } finally {
                setLoading(false);
            }
        };
        fetchOverview();
    }, []);

    if (loading) {
        return (
            <div className="flex h-screen items-center justify-center bg-slate-50">
                <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
            </div>
        );
    }

    const stats = [
        { label: 'Total Users', value: overview?.total_users, icon: Users, color: 'text-blue-600', bg: 'bg-blue-50' },
        { label: 'Students', value: overview?.total_students, icon: UserCheck, color: 'text-emerald-600', bg: 'bg-emerald-50' },
        { label: 'Teachers', value: overview?.total_teachers, icon: BookOpen, color: 'text-purple-600', bg: 'bg-purple-50' },
        { label: 'Assignments', value: overview?.total_assignments, icon: FileText, color: 'text-amber-600', bg: 'bg-amber-50' },
    ];

    return (
        <div className="p-8 bg-slate-50 min-h-screen">
            <h1 className="text-3xl font-sans font-bold text-slate-900 mb-8">System Overview</h1>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat, i) => (
                    <div key={i} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-5">
                        <div className={`p-4 rounded-xl ${stat.bg} ${stat.color}`}>
                            <stat.icon size={24} />
                        </div>
                        <div>
                            <p className="text-sm text-slate-500 font-medium">{stat.label}</p>
                            <p className="text-2xl font-bold text-slate-900">{stat.value}</p>
                        </div>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
                <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm">
                    <div className="flex items-center gap-3 mb-6">
                        <Activity className="text-emerald-500" />
                        <h2 className="text-xl font-bold text-slate-900">Recent Activity</h2>
                    </div>
                    <div className="space-y-4">
                        <div className="flex justify-between items-center py-3 border-b border-slate-50">
                            <span className="text-slate-600">Total Submissions</span>
                            <span className="font-bold text-slate-900">{overview?.total_submissions}</span>
                        </div>
                        <div className="flex justify-between items-center py-3 border-b border-slate-50">
                            <span className="text-slate-600">Submissions Today</span>
                            <span className="font-bold text-emerald-600">+{overview?.submissions_today}</span>
                        </div>
                    </div>
                </div>

                <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm">
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-3">
                            <Megaphone className="text-orange-400" />
                            <h2 className="text-xl font-bold text-slate-900">Recent Announcements</h2>
                        </div>
                        <Link href="/admin/announcements" className="text-xs text-slate-400 hover:text-orange-500 font-medium transition-colors">
                            Manage →
                        </Link>
                    </div>
                    {announcements.length === 0 ? (
                        <p className="text-slate-400 text-sm text-center py-4">No announcements yet.</p>
                    ) : (
                        <div className="space-y-3">
                            {announcements.map(a => (
                                <div key={a.id} className={`p-4 rounded-xl border ${a.is_pinned ? 'border-orange-200 bg-orange-50/30' : 'border-slate-100'}`}>
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

                <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm">
                    <div className="flex items-center gap-3 mb-6">
                        <TrendingUp className="text-blue-500" />
                        <h2 className="text-xl font-bold text-slate-900">Performance Metrics</h2>
                    </div>
                    <div className="flex flex-col items-center justify-center h-32">
                        <p className="text-sm text-slate-500 mb-2">System-wide Average Score</p>
                        <p className="text-5xl font-bold text-slate-900">
                            {overview?.average_system_score != null ? overview.average_system_score.toFixed(1) : 'N/A'}
                        </p>
                        <p className="text-sm text-slate-400 mt-1">pts (raw score)</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
