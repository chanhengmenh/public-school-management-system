'use client';

import React from 'react';
import PageHeader from '@/components/layouts/PageHeader';
import Link from 'next/link';
import Card from '@/components/ui/Card';

import {
    Users,
    GraduationCap,
    BookOpen,
    Activity,
    Plus,
    MoreVertical,
    ShieldCheck,
    AlertCircle,
    TrendingUp,
    ArrowUpRight,
    UserPlus,
    Megaphone,
    Clock,
    CheckCircle2,
    UserCheck,
    FileText,
    Settings,
} from 'lucide-react';

import { getAdminDashboardData, ActivityType } from '@/lib/mock-data/admin';

// --- Activity Icon Config ---
const activityConfig: Record<ActivityType, { icon: any; bg: string; text: string }> = {
    enrollment: { icon: UserCheck, bg: 'bg-blue-100', text: 'text-blue-600' },
    security: { icon: ShieldCheck, bg: 'bg-amber-100', text: 'text-amber-600' },
    class: { icon: BookOpen, bg: 'bg-violet-100', text: 'text-violet-600' },
    system: { icon: Settings, bg: 'bg-slate-100', text: 'text-slate-600' },
    grade: { icon: FileText, bg: 'bg-emerald-100', text: 'text-emerald-600' },
};

// --- Status Dot Color ---
const statusDot: Record<string, string> = {
    success: 'bg-emerald-500',
    warning: 'bg-amber-500',
    info: 'bg-blue-500',
};

export default function AdminDashboardPage() {
    const { kpiData, activityData, pendingRequests } = getAdminDashboardData();
    return (
        <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
            <PageHeader 
                title="Admin Overview"
                subtitle="System metrics and school management command center"
                badge="Super Admin"
            />

            <div className="flex-1 max-w-7xl mx-auto w-full px-6 lg:px-8 py-8 flex flex-col gap-8">

                {/* ====== KPI METRIC CARDS ====== */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {kpiData.map((kpi) => {
                        const Icon = kpi.icon;
                        return (
                            <Card
                                key={kpi.title}
                                hoverable
                                className={`p-6 border-t-4 ${kpi.borderAccent}`}
                            >
                                <div className="flex items-center justify-between mb-4">
                                    <div className={`w-11 h-11 rounded-xl ${kpi.iconBg} ${kpi.iconColor} flex items-center justify-center`}>
                                        <Icon className="w-5 h-5" />
                                    </div>
                                    <button className="text-slate-400 hover:text-slate-600 transition-colors p-1 rounded-lg hover:bg-slate-100">
                                        <MoreVertical className="w-4 h-4" />
                                    </button>
                                </div>
                                <p className="text-sm font-semibold text-slate-500 mb-1">{kpi.title}</p>
                                <p className="text-3xl font-bold text-slate-900 tracking-tight">{kpi.value}</p>
                                <div className="flex items-center gap-1.5 mt-3">
                                    <TrendingUp className={`w-3.5 h-3.5 ${kpi.trendColor}`} />
                                    <span className={`text-xs font-semibold ${kpi.trendColor}`}>{kpi.trend}</span>
                                </div>
                            </Card>
                        );
                    })}
                </div>

                {/* ====== MIDDLE SECTION: ACTIVITY + QUICK ACTIONS ====== */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                    {/* --- Left: Recent System Activity (2/3) --- */}
                    <Card className="lg:col-span-2 flex flex-col h-full overflow-hidden">
                        {/* Header */}
                        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100">
                            <div className="flex items-center gap-3">
                                <div className="w-9 h-9 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
                                    <Activity className="w-4.5 h-4.5" />
                                </div>
                                <div>
                                    <h2 className="text-base font-bold text-slate-900">Recent Activity Log</h2>
                                    <p className="text-xs text-slate-500 mt-0.5">Real-time system events</p>
                                </div>
                            </div>
                            <Link
                                href="#"
                                className="text-sm font-bold text-indigo-600 hover:text-indigo-800 transition-colors flex items-center gap-1"
                            >
                                View All
                                <ArrowUpRight className="w-3.5 h-3.5" />
                            </Link>
                        </div>

                        {/* Activity List */}
                        <div className="flex-1 divide-y divide-slate-100">
                            {activityData.map((item) => {
                                const config = activityConfig[item.type];
                                const Icon = config.icon;
                                return (
                                    <div
                                        key={item.id}
                                        className="flex items-center gap-4 px-6 py-4 hover:bg-slate-50/60 transition-colors group"
                                    >
                                        {/* Icon */}
                                        <div className={`w-10 h-10 rounded-full ${config.bg} ${config.text} flex items-center justify-center shrink-0`}>
                                            <Icon className="w-4.5 h-4.5" />
                                        </div>

                                        {/* Text + Timestamp */}
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2">
                                                <span className={`w-2 h-2 rounded-full ${statusDot[item.status]} shrink-0`} />
                                                <p className="text-sm font-semibold text-slate-800 truncate">{item.text}</p>
                                            </div>
                                            <div className="flex items-center gap-1 mt-1 ml-4">
                                                <Clock className="w-3 h-3 text-slate-400" />
                                                <span className="text-xs text-slate-400 font-medium">{item.timestamp}</span>
                                            </div>
                                        </div>

                                        {/* Review Link */}
                                        <Link
                                            href="#"
                                            className="text-sm font-bold text-indigo-600 hover:text-indigo-800 transition-colors opacity-0 group-hover:opacity-100 shrink-0"
                                        >
                                            Review
                                        </Link>
                                    </div>
                                );
                            })}
                        </div>
                    </Card>

                    {/* --- Right: Quick Actions + Alerts (1/3) --- */}
                    <div className="flex flex-col gap-6">

                        {/* Block 1: Quick Actions */}
                        <Card className="p-6">
                            <div className="flex items-center gap-2 mb-5">
                                <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
                                    <Plus className="w-4 h-4" />
                                </div>
                                <h3 className="text-base font-bold text-slate-900">Quick Actions</h3>
                            </div>
                            <div className="flex flex-col gap-3">
                                <Link
                                    href="/admin/users"
                                    className="flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-3 rounded-xl text-sm font-bold shadow-sm transition-all active:scale-[0.98]"
                                >
                                    <UserPlus className="w-4 h-4" />
                                    Add New User
                                </Link>
                                <Link
                                    href="/admin/classes"
                                    className="flex items-center justify-center gap-2 bg-white hover:bg-slate-50 border border-slate-200 hover:border-slate-300 text-slate-700 px-4 py-3 rounded-xl text-sm font-bold shadow-sm transition-all active:scale-[0.98]"
                                >
                                    <BookOpen className="w-4 h-4" />
                                    Create New Class
                                </Link>
                                <button className="flex items-center justify-center gap-2 bg-white hover:bg-slate-50 border border-slate-200 hover:border-slate-300 text-slate-700 px-4 py-3 rounded-xl text-sm font-bold shadow-sm transition-all active:scale-[0.98]">
                                    <Megaphone className="w-4 h-4" />
                                    Broadcast Announcement
                                </button>
                            </div>
                        </Card>

                        {/* Block 2: Pending Requests / System Alerts */}
                        <Card className="p-6 bg-amber-50/60 border-amber-200 shadow-sm">
                            <div className="flex items-center gap-2 mb-5">
                                <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-600 flex items-center justify-center">
                                    <AlertCircle className="w-4 h-4" />
                                </div>
                                <h3 className="text-base font-bold text-slate-900">Pending Requests</h3>
                            </div>
                            <div className="flex flex-col gap-3">
                                {pendingRequests.map((req) => {
                                    const Icon = req.icon;
                                    return (
                                        <div
                                            key={req.id}
                                            className="flex items-start gap-3 bg-white/70 backdrop-blur-sm rounded-xl border border-amber-200/60 p-4"
                                        >
                                            <div className="w-8 h-8 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center shrink-0 mt-0.5">
                                                <Icon className="w-4 h-4" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className={`text-sm font-semibold ${req.severity}`}>{req.text}</p>
                                                <Link
                                                    href="#"
                                                    className="text-xs font-bold text-indigo-600 hover:text-indigo-800 transition-colors mt-1 inline-block"
                                                >
                                                    Review →
                                                </Link>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </Card>
                    </div>
                </div>

                {/* ====== BOTTOM SECTION: SUMMARY BAR ====== */}
                <Card className="p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center">
                            <CheckCircle2 className="w-5 h-5" />
                        </div>
                        <div>
                            <p className="text-sm font-bold text-slate-900">All Core Systems Operational</p>
                            <p className="text-xs text-slate-500 mt-0.5">Last checked: 2 minutes ago · Next scheduled backup: Tonight 2:00 AM</p>
                        </div>
                    </div>
                    <Link
                        href="#"
                        className="text-sm font-bold text-indigo-600 hover:text-indigo-800 transition-colors flex items-center gap-1 shrink-0"
                    >
                        System Status
                        <ArrowUpRight className="w-3.5 h-3.5" />
                    </Link>
                </Card>
            </div>
        </div>
    );
}