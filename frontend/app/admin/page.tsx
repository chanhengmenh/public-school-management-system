'use client';

import React, { useState, useEffect } from 'react';
import { 
    Users, 
    UserCheck, 
    BookOpen, 
    FileText, 
    Activity, 
    TrendingUp,
    Loader2
} from 'lucide-react';
import { analyticsApi } from '../../lib/api';
import { AdminOverview } from '../../types/school.types';

export default function AdminDashboardPage() {
    const [loading, setLoading] = useState(true);
    const [overview, setOverview] = useState<AdminOverview | null>(null);

    useEffect(() => {
        const fetchOverview = async () => {
            try {
                const data = await analyticsApi.getAdminOverview();
                setOverview(data);
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
            <h1 className="text-3xl font-serif font-bold text-slate-900 mb-8">System Overview</h1>
            
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
