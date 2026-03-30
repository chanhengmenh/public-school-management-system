'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import PageHeader from '@/components/layouts/PageHeader';
import { Card, Button, Badge } from '@/components/ui';
import { Bell, FileText, UserCheck, MessageSquare, AlertCircle, CheckCircle2, Trash2, Clock } from 'lucide-react';
import { useNotifications } from '@/contexts/NotificationContext';

// --- Types ---
type NotificationType = 'attendance' | 'submission' | 'message' | 'alert';

// --- Icon Mapping ---
const notifIcon: Record<NotificationType, { bg: string; text: string; Icon: typeof Bell }> = {
    attendance: { bg: 'bg-emerald-100', text: 'text-emerald-600', Icon: UserCheck },
    submission: { bg: 'bg-indigo-100', text: 'text-indigo-600', Icon: FileText },
    message: { bg: 'bg-amber-100', text: 'text-amber-600', Icon: MessageSquare },
    alert: { bg: 'bg-red-100', text: 'text-red-600', Icon: AlertCircle },
};

export default function TeacherNotificationsPage() {
    const [activeFilter, setActiveFilter] = useState<'All' | 'Unread'>('All');
    const { notifications, unreadCount, markRead, markAllRead, deleteNotification } = useNotifications();

    const filteredNotifications = activeFilter === 'Unread'
        ? notifications.filter(n => !n.isRead)
        : notifications;

    return (
        <div className="min-h-screen bg-[#f4f7f9]">
            <PageHeader
                title="Notifications"
                subtitle="Stay updated on student submissions and class activities"
                badge={unreadCount > 0 ? `${unreadCount} new` : undefined}
            />

            <div className="max-w-7xl mx-auto w-full flex flex-col px-6 lg:px-8 pb-12">
                {/* Action Bar */}
                <Card className="p-4 mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    {/* Left: Filter Pills */}
                    <div className="flex items-center gap-2">
                        {(['All', 'Unread'] as const).map((filter) => (
                            <Button
                                key={filter}
                                variant={activeFilter === filter ? 'primary' : 'secondary'}
                                size="sm"
                                onClick={() => setActiveFilter(filter)}
                                className="!rounded-xl"
                            >
                                {filter}
                                {filter === 'Unread' && unreadCount > 0 && (
                                    <Badge variant="info" className="ml-1.5 !text-[10px] !px-1.5 !py-0 !bg-blue-600 !text-white !border-transparent">
                                        {unreadCount}
                                    </Badge>
                                )}
                            </Button>
                        ))}
                    </div>

                    {/* Right: Mark all as read */}
                    <Button
                        variant="ghost"
                        size="sm"
                        icon={CheckCircle2}
                        onClick={markAllRead}
                        className="!text-slate-500 hover:!text-indigo-600"
                    >
                        Mark all as read
                    </Button>
                </Card>

                {/* Notification List */}
                <div className="flex flex-col gap-3">
                    {filteredNotifications.length === 0 ? (
                        <Card className="py-16 flex flex-col items-center justify-center text-center">
                            <Bell className="w-12 h-12 text-slate-300 mb-4" />
                            <h3 className="text-lg font-bold text-slate-900 mb-1">
                                {activeFilter === 'Unread' ? 'All Caught Up!' : 'No Notifications'}
                            </h3>
                            <p className="text-sm text-slate-500">
                                {activeFilter === 'Unread'
                                    ? 'You have no unread notifications.'
                                    : 'You don\'t have any notifications yet.'}
                            </p>
                        </Card>
                    ) : (
                        filteredNotifications.map((notif) => {
                            const { bg, text, Icon } = notifIcon[notif.type];

                            return (
                                <Card
                                    key={notif.id}
                                    onClick={() => markRead(notif.id)}
                                    role="button"
                                    tabIndex={0}
                                    onKeyDown={(e: React.KeyboardEvent) => {
                                        if (e.key === 'Enter' || e.key === ' ') {
                                            markRead(notif.id);
                                        }
                                    }}
                                    className={`!p-5 flex items-start gap-4 cursor-pointer transition-all relative group ${!notif.isRead
                                        ? '!bg-blue-50/30 !border-blue-200 !shadow-sm'
                                        : 'hover:!border-slate-300'
                                        }`}
                                >
                                    {/* Unread Dot */}
                                    {!notif.isRead && (
                                        <div className="w-2.5 h-2.5 rounded-full bg-blue-600 absolute top-6 right-6" />
                                    )}

                                    {/* Icon */}
                                    <div className={`w-12 h-12 rounded-full ${bg} ${text} flex items-center justify-center shrink-0`}>
                                        <Icon className="w-5 h-5" />
                                    </div>

                                    {/* Text Content */}
                                    <div className="flex-1 min-w-0">
                                        <h3 className="text-base font-bold text-slate-900">{notif.title}</h3>
                                        <p className="text-sm text-slate-600 mt-1 pr-8 line-clamp-2">{notif.message}</p>
                                        <div className="flex items-center gap-1 text-xs font-bold text-slate-400 mt-3">
                                            <Clock className="w-3 h-3" />
                                            {notif.time}
                                        </div>
                                    </div>

                                    {/* Actions — always visible for mobile, enhanced on hover */}
                                    <div className="flex items-center gap-2 absolute bottom-5 right-6 sm:opacity-60 sm:group-hover:opacity-100 transition-opacity">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            icon={Trash2}
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                deleteNotification(notif.id);
                                            }}
                                            className="!text-slate-400 hover:!text-red-600 hover:!border-red-200"
                                        />
                                        {notif.link !== '#' && (
                                            <Link
                                                href={notif.link}
                                                onClick={(e) => e.stopPropagation()}
                                            >
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    className="hover:!text-indigo-600 hover:!border-indigo-200"
                                                >
                                                    View Details
                                                </Button>
                                            </Link>
                                        )}
                                    </div>
                                </Card>
                            );
                        })
                    )}
                </div>
            </div>
        </div>
    );
}
