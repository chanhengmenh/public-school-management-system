'use client';

import React, { useState, useEffect, useCallback } from 'react';
import PageHeader from '@/components/layouts/PageHeader';
import { Bell, FileText, UserCheck, MessageSquare, AlertCircle, CheckCircle2, Trash2, Clock, Loader2 } from 'lucide-react';
import { useAuth } from '@/components/auth/AuthProvider';
import { notificationsApi } from '@/lib/api';
import { Notification, NotificationType } from '@/lib/api/notifications';

function timeAgo(dateStr: string): string {
    const now = new Date();
    const date = new Date(dateStr);
    const diffMs = now.getTime() - date.getTime();
    const mins = Math.floor(diffMs / 60000);
    if (mins < 1) return 'Just now';
    if (mins < 60) return `${mins} min${mins !== 1 ? 's' : ''} ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours} hour${hours !== 1 ? 's' : ''} ago`;
    const days = Math.floor(hours / 24);
    if (days < 7) return days === 1 ? 'Yesterday' : `${days} days ago`;
    const weeks = Math.floor(days / 7);
    return weeks === 1 ? 'Last week' : `${weeks} weeks ago`;
}

const notifIcon: Record<string, { bg: string; text: string; Icon: typeof Bell }> = {
    announcement: { bg: 'bg-emerald-100', text: 'text-emerald-600', Icon: UserCheck },
    assignment: { bg: 'bg-indigo-100', text: 'text-indigo-600', Icon: FileText },
    alert: { bg: 'bg-red-100', text: 'text-red-600', Icon: AlertCircle },
    grade: { bg: 'bg-amber-100', text: 'text-amber-600', Icon: MessageSquare },
    general: { bg: 'bg-slate-100', text: 'text-slate-600', Icon: Bell },
};

export default function TeacherNotificationsPage() {
    const { user } = useAuth();
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [activeFilter, setActiveFilter] = useState<'All' | 'Unread'>('All');

    const loadNotifications = useCallback(async () => {
        if (!user) return;
        setLoading(true);
        setError(null);
        try {
            const data = await notificationsApi.list();
            setNotifications(data);
        } catch {
            setError('Failed to load notifications.');
        } finally {
            setLoading(false);
        }
    }, [user]);

    useEffect(() => {
        loadNotifications();
    }, [loadNotifications]);

    const unreadCount = notifications.filter(n => !n.is_read).length;

    const filteredNotifications = activeFilter === 'Unread'
        ? notifications.filter(n => !n.is_read)
        : notifications;

    const markAsRead = async (id: number) => {
        const notif = notifications.find(n => n.id === id);
        if (!notif || notif.is_read) return;
        try {
            await notificationsApi.markAsRead(id);
            setNotifications(prev =>
                prev.map(n => n.id === id ? { ...n, is_read: true } : n)
            );
        } catch { /* silently fail */ }
    };

    const markAllAsRead = async () => {
        try {
            await notificationsApi.markAllAsRead();
            setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
        } catch { /* silently fail */ }
    };

    const handleDelete = async (id: number) => {
        try {
            await notificationsApi.delete(id);
            setNotifications(prev => prev.filter(n => n.id !== id));
        } catch { /* silently fail */ }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-[#f4f7f9]">
                <PageHeader title="Notifications" subtitle="Stay updated on student submissions and class activities" />
                <div className="max-w-7xl mx-auto px-6 lg:px-8 pb-12">
                    <div className="flex flex-col items-center justify-center py-16 gap-2 text-slate-500">
                        <AlertCircle className="h-8 w-8 text-red-400" />
                        <p>{error}</p>
                        <button
                            onClick={loadNotifications}
                            className="mt-2 px-4 py-2 bg-orange-500 text-white rounded-lg text-sm hover:bg-orange-600 transition-colors"
                        >
                            Retry
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#f4f7f9]">
            <PageHeader
                title="Notifications"
                subtitle="Stay updated on student submissions and class activities"
                badge={unreadCount > 0 ? `${unreadCount} new` : undefined}
            />

            <div className="max-w-7xl mx-auto w-full flex flex-col px-6 lg:px-8 pb-12">
                {/* Action Bar */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-white p-4 rounded-2xl shadow-sm border border-slate-200 mb-6 gap-4">
                    <div className="flex items-center gap-2">
                        {(['All', 'Unread'] as const).map((filter) => (
                            <button
                                key={filter}
                                onClick={() => setActiveFilter(filter)}
                                className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${activeFilter === filter
                                    ? 'bg-slate-900 text-white shadow-sm'
                                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                    }`}
                            >
                                {filter}
                                {filter === 'Unread' && unreadCount > 0 && (
                                    <span className="ml-1.5 bg-blue-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                                        {unreadCount}
                                    </span>
                                )}
                            </button>
                        ))}
                    </div>

                    <button
                        onClick={markAllAsRead}
                        disabled={unreadCount === 0}
                        className={`text-sm font-bold transition-colors flex items-center gap-1.5 ${
                            unreadCount > 0 ? 'text-slate-500 hover:text-indigo-600' : 'text-slate-300 cursor-not-allowed'
                        }`}
                    >
                        <CheckCircle2 className="w-4 h-4" />
                        Mark all as read
                    </button>
                </div>

                {/* Notification List */}
                <div className="flex flex-col gap-3">
                    {filteredNotifications.length === 0 ? (
                        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm py-16 flex flex-col items-center justify-center text-center">
                            <Bell className="w-12 h-12 text-slate-300 mb-4" />
                            <h3 className="text-lg font-bold text-slate-900 mb-1">
                                {activeFilter === 'Unread' ? 'All Caught Up!' : 'No Notifications'}
                            </h3>
                            <p className="text-sm text-slate-500">
                                {activeFilter === 'Unread'
                                    ? 'You have no unread notifications.'
                                    : 'You don\'t have any notifications yet.'}
                            </p>
                        </div>
                    ) : (
                        filteredNotifications.map((notif) => {
                            const style = notifIcon[notif.type] ?? notifIcon.general;
                            const { bg, text, Icon } = style;

                            return (
                                <div
                                    key={notif.id}
                                    onClick={() => markAsRead(notif.id)}
                                    className={`flex items-start gap-4 p-5 rounded-2xl border transition-all relative group cursor-pointer ${!notif.is_read
                                        ? 'bg-blue-50/30 border-blue-200 shadow-sm'
                                        : 'bg-white border-slate-200 hover:border-slate-300'
                                        }`}
                                >
                                    {!notif.is_read && (
                                        <div className="w-2.5 h-2.5 rounded-full bg-blue-600 absolute top-6 right-6"></div>
                                    )}

                                    <div className={`w-12 h-12 rounded-full ${bg} ${text} flex items-center justify-center shrink-0`}>
                                        <Icon className="w-5 h-5" />
                                    </div>

                                    <div className="flex-1 min-w-0">
                                        <h3 className="text-base font-bold text-slate-900">{notif.title}</h3>
                                        <p className="text-sm text-slate-600 mt-1 pr-8 line-clamp-2">{notif.message}</p>
                                        {notif.sender && (
                                            <span className="text-xs text-slate-500 mt-1 block">
                                                From: <span className="font-medium">{notif.sender}</span>
                                            </span>
                                        )}
                                        <div className="flex items-center gap-1 text-xs font-bold text-slate-400 mt-3">
                                            <Clock className="w-3 h-3" />
                                            {timeAgo(notif.created_at)}
                                        </div>
                                    </div>

                                    <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-2 absolute bottom-5 right-6">
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleDelete(notif.id);
                                            }}
                                            className="bg-white border border-slate-200 p-2 rounded-lg text-slate-400 hover:text-red-600 hover:border-red-200 transition-colors shadow-sm"
                                            title="Delete"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>
            </div>
        </div>
    );
}
