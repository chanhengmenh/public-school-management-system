'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Megaphone, BookOpen, AlertCircle, Award, Bell, Loader2 } from 'lucide-react';
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

function getIcon(type: NotificationType, isRead: boolean) {
    const iconClasses = `w-5 h-5 ${isRead ? 'text-slate-400' : 'text-blue-600'}`;
    switch (type) {
        case 'announcement': return <Megaphone className={iconClasses} />;
        case 'assignment': return <BookOpen className={iconClasses} />;
        case 'alert': return <AlertCircle className={iconClasses} />;
        case 'grade': return <Award className={iconClasses} />;
        default: return <Bell className={iconClasses} />;
    }
}

export default function NotificationsPage() {
    const { user } = useAuth();
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

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

    const dispatchRefresh = () => window.dispatchEvent(new Event('notification:refresh'));

    const markAsRead = async (id: number) => {
        const notif = notifications.find(n => n.id === id);
        if (!notif || notif.is_read) return;
        try {
            await notificationsApi.markAsRead(id);
            setNotifications(prev =>
                prev.map(n => n.id === id ? { ...n, is_read: true } : n)
            );
            dispatchRefresh();
        } catch {
            // Silently fail — user can retry
        }
    };

    const markAllAsRead = async () => {
        try {
            await notificationsApi.markAllAsRead();
            setNotifications(prev =>
                prev.map(n => ({ ...n, is_read: true }))
            );
            dispatchRefresh();
        } catch {
            // Silently fail
        }
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
            <div className="p-6 lg:p-8">
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
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 font-sans">
            <div className="max-w-7xl mx-auto w-full flex flex-col">
                {/* Sticky Header */}
                <header className="sticky top-0 z-30 bg-slate-50/80 backdrop-blur-md border-b border-slate-200/50 px-6 lg:px-8 py-6 mb-2">
                    <div className="flex justify-between items-start">
                        <div>
                            <h1 className="text-3xl font-serif font-bold text-[#0f172a] tracking-tight">Notifications</h1>
                            <p className="text-sm text-slate-500 mt-1">
                                You have {unreadCount} unread message{unreadCount !== 1 ? 's' : ''}
                            </p>
                        </div>
                    </div>
                </header>

                {/* Content Wrapper */}
                <div className="px-6 lg:px-8 pb-12 w-full max-w-4xl">
                    {/* Action Bar */}
                    <div className="flex justify-end mt-6 mb-4">
                        <button
                            onClick={markAllAsRead}
                            disabled={unreadCount === 0}
                            className={`text-sm font-medium transition-colors ${unreadCount > 0
                                ? 'text-blue-600 hover:text-blue-700'
                                : 'text-slate-400 cursor-not-allowed'
                                }`}
                        >
                            Mark all as read
                        </button>
                    </div>

                    {/* Notification List */}
                    <div className="flex flex-col gap-3">
                        {notifications.map(notif => (
                            <div
                                key={notif.id}
                                onClick={() => markAsRead(notif.id)}
                                role="button"
                                tabIndex={0}
                                className={`w-full text-left p-4 rounded-xl transition-all duration-200 flex items-start gap-4 ${notif.is_read
                                    ? 'bg-transparent border border-slate-200/60 opacity-80 hover:bg-slate-100/50'
                                    : 'bg-white border border-slate-200 shadow-sm hover:border-slate-300 cursor-pointer'
                                    }`}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter' || e.key === ' ') {
                                        markAsRead(notif.id);
                                    }
                                }}
                            >
                                <div className={`p-3 rounded-full shrink-0 ${notif.is_read ? 'bg-slate-100' : 'bg-blue-50'}`}>
                                    {getIcon(notif.type, notif.is_read)}
                                </div>
                                <div className="flex-1 flex flex-col">
                                    <div className="w-full flex justify-between items-start gap-3">
                                        <h3 className={`text-base font-sans ${notif.is_read ? 'text-slate-600 font-medium' : 'text-slate-900 font-bold'} flex items-center gap-2`}>
                                            {notif.title}
                                            {!notif.is_read && (
                                                <span className="w-2 h-2 rounded-full bg-red-500 shrink-0"></span>
                                            )}
                                        </h3>
                                        <span className={`text-xs shrink-0 mt-1 ${notif.is_read ? 'text-slate-400' : 'text-slate-500 font-semibold'}`}>
                                            {timeAgo(notif.created_at)}
                                        </span>
                                    </div>
                                    <p className={`text-sm mt-1 mb-2 ${notif.is_read ? 'text-slate-500' : 'text-slate-600'}`}>
                                        {notif.message}
                                    </p>
                                    {notif.sender && (
                                        <span className={`text-xs ${notif.is_read ? 'text-slate-400' : 'text-slate-500'}`}>
                                            From: <span className="font-medium">{notif.sender}</span>
                                        </span>
                                    )}
                                </div>
                            </div>
                        ))}

                        {notifications.length === 0 && (
                            <div className="text-center py-12">
                                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-slate-100 mb-4">
                                    <Bell className="h-8 w-8 text-slate-300" />
                                </div>
                                <p className="text-slate-500">No notifications yet.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
