'use client';

import React from 'react';
import { Megaphone, BookOpen, AlertCircle, Award, Bell, CheckCheck } from 'lucide-react';
import PageHeader from '@/components/layouts/PageHeader';
import { Card, Button, Badge, ToastContainer, useToast } from '@/components/ui';
import { useStudentNotifications } from '@/contexts/StudentNotificationContext';
import { formatTimeAgo } from '@/lib/utils';
import type { NotificationIconType } from '@/types/school.types';

// ─── Icon helper ─────────────────────────────────────────────────────

function getNotificationIcon(type: NotificationIconType, isRead: boolean) {
    const iconClasses = `w-5 h-5 ${isRead ? 'text-slate-400' : 'text-blue-600'}`;
    switch (type) {
        case 'announcement': return <Megaphone className={iconClasses} />;
        case 'assignment':   return <BookOpen className={iconClasses} />;
        case 'alert':        return <AlertCircle className={iconClasses} />;
        case 'grade':        return <Award className={iconClasses} />;
        default:             return <Bell className={iconClasses} />;
    }
}

// ─── Page ────────────────────────────────────────────────────────────

export default function NotificationsPage() {
    const { notifications, unreadCount, markAsRead, markAllAsRead } = useStudentNotifications();
    const { toasts, addToast, dismissToast } = useToast();

    const handleMarkAllRead = () => {
        markAllAsRead();
        addToast('success', 'All notifications marked as read');
    };

    return (
        <div className="min-h-screen bg-slate-50 font-sans">
            <PageHeader
                title="Notifications"
                subtitle={`You have ${unreadCount} unread message${unreadCount !== 1 ? 's' : ''}`}
            />
            <div className="max-w-7xl mx-auto w-full flex flex-col">

                <div className="px-6 lg:px-8 pb-12 w-full max-w-4xl">
                    {/* Action Bar */}
                    <div className="flex justify-end mt-6 mb-4">
                        <Button
                            variant="ghost"
                            size="sm"
                            icon={CheckCheck}
                            onClick={handleMarkAllRead}
                            disabled={unreadCount === 0}
                            className={unreadCount > 0 ? 'text-blue-600 hover:text-blue-700' : ''}
                        >
                            Mark all as read
                        </Button>
                    </div>

                    {/* Notification List */}
                    <div className="flex flex-col gap-3">
                        {notifications.map(notif => (
                            <Card
                                key={notif.id}
                                className={`!p-4 flex items-start gap-4 cursor-pointer transition-all duration-200 ${
                                    notif.isRead
                                        ? '!bg-transparent !border-slate-200/60 opacity-80 hover:!bg-slate-100/50'
                                        : 'hover:!border-slate-300'
                                }`}
                                onClick={() => markAsRead(notif.id)}
                                role="button"
                                tabIndex={0}
                                onKeyDown={(e: React.KeyboardEvent) => {
                                    if (e.key === 'Enter' || e.key === ' ') {
                                        markAsRead(notif.id);
                                    }
                                }}
                            >
                                {/* Icon */}
                                <div className={`p-3 rounded-full shrink-0 ${notif.isRead ? 'bg-slate-100' : 'bg-blue-50'}`}>
                                    {getNotificationIcon(notif.iconType, notif.isRead)}
                                </div>

                                {/* Content */}
                                <div className="flex-1 flex flex-col">
                                    <div className="w-full flex justify-between items-start gap-3">
                                        <h3 className={`text-base font-sans flex items-center gap-2 ${
                                            notif.isRead ? 'text-slate-600 font-medium' : 'text-slate-900 font-bold'
                                        }`}>
                                            {notif.title}
                                            {!notif.isRead && (
                                                <span className="w-2 h-2 rounded-full bg-red-500 shrink-0"></span>
                                            )}
                                        </h3>
                                        <span className={`text-xs shrink-0 mt-1 ${
                                            notif.isRead ? 'text-slate-400' : 'text-slate-500 font-semibold'
                                        }`}>
                                            {formatTimeAgo(notif.timestamp)}
                                        </span>
                                    </div>
                                    <p className={`text-sm mt-1 mb-2 ${notif.isRead ? 'text-slate-500' : 'text-slate-600'}`}>
                                        {notif.message}
                                    </p>
                                    <div className="flex items-center gap-2">
                                        <Badge variant={notif.isRead ? 'neutral' : 'info'} className="!text-xs">
                                            {notif.sender}
                                        </Badge>
                                    </div>
                                </div>
                            </Card>
                        ))}

                        {notifications.length === 0 && (
                            <div className="text-center py-12">
                                <p className="text-slate-500">No notifications to display.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <ToastContainer toasts={toasts} onDismiss={dismissToast} />
        </div>
    );
}