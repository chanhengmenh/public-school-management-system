'use client';

import React, { useState } from 'react';
import { Megaphone, BookOpen, AlertCircle, Award, Bell } from 'lucide-react';
import PageHeader from '@/components/layouts/PageHeader';

type IconType = 'announcement' | 'assignment' | 'alert' | 'grade' | 'general';

interface Notification {
    id: number;
    title: string;
    message: string;
    sender: string;
    timestamp: string;
    iconType: IconType;
    isRead: boolean;
}

const initialNotifications: Notification[] = [
    {
        id: 1,
        title: 'Mid-Term Exams Update',
        message: 'The schedule for the upcoming mid-term exams has been updated. Please review the new timetable in the Schedule tab.',
        sender: 'System',
        timestamp: '10 mins ago',
        iconType: 'announcement',
        isRead: false
    },
    {
        id: 2,
        title: 'New Assignment: Lab Report',
        message: 'Mr. Tan Wei has posted a new assignment for Physics: Refraction Lab Report. Due in 3 days.',
        sender: 'Mr. Tan Wei',
        timestamp: '2 hours ago',
        iconType: 'assignment',
        isRead: false
    },
    {
        id: 3,
        title: 'Location Changed',
        message: 'Advanced Math class on Wednesday has been moved to Room 201 at 10:00 AM.',
        sender: 'Ms. Nurul Huda',
        timestamp: 'Yesterday',
        iconType: 'alert',
        isRead: false
    },
    {
        id: 4,
        title: 'Grade Posted',
        message: 'Your grade for "Chapter 3 Quiz" has been posted. You scored 94/100.',
        sender: 'System',
        timestamp: 'Yesterday',
        iconType: 'grade',
        isRead: false
    },
    {
        id: 5,
        title: 'Welcome to the New Term',
        message: 'Welcome back to the new academic year! Make sure to set up your profile and check your enrolled classes.',
        sender: 'System',
        timestamp: 'Last Week',
        iconType: 'general',
        isRead: true
    },
    {
        id: 6,
        title: 'Library Books Due Reminder',
        message: 'Please return any overdue library books by Friday to avoid late fees.',
        sender: 'Librarian',
        timestamp: 'Last Week',
        iconType: 'alert',
        isRead: true
    }
];

export default function NotificationsPage() {
    const [notifications, setNotifications] = useState<Notification[]>(initialNotifications);

    // Derived unread count
    const unreadCount = notifications.filter(n => !n.isRead).length;

    // Single mark as read
    const markAsRead = (id: number) => {
        setNotifications(prev =>
            prev.map(n => n.id === id ? { ...n, isRead: true } : n)
        );
    };

    // Bulk mark as read
    const markAllAsRead = () => {
        setNotifications(prev =>
            prev.map(n => ({ ...n, isRead: true }))
        );
    };

    const getIcon = (type: IconType, isRead: boolean) => {
        const iconClasses = `w-5 h-5 ${isRead ? 'text-slate-400' : 'text-blue-600'}`;
        switch (type) {
            case 'announcement': return <Megaphone className={iconClasses} />;
            case 'assignment': return <BookOpen className={iconClasses} />;
            case 'alert': return <AlertCircle className={iconClasses} />;
            case 'grade': return <Award className={iconClasses} />;
            default: return <Bell className={iconClasses} />;
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 font-sans">
            <div className="max-w-7xl mx-auto w-full flex flex-col">
                {/* Sticky Header */}
                <PageHeader
                    title="Notifications"
                    subtitle={`You have ${unreadCount} unread message${unreadCount !== 1 ? 's' : ''}`}
                />

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
                                className={`w-full text-left p-4 rounded-xl transition-all duration-200 flex items-start gap-4 ${notif.isRead
                                    ? 'bg-transparent border border-slate-200/60 opacity-80 hover:bg-slate-100/50'
                                    : 'bg-white border border-slate-200 shadow-sm hover:border-slate-300 cursor-pointer'
                                    }`}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter' || e.key === ' ') {
                                        markAsRead(notif.id);
                                    }
                                }}
                            >
                                <div className={`p-3 rounded-full shrink-0 ${notif.isRead ? 'bg-slate-100' : 'bg-blue-50'
                                    }`}>
                                    {getIcon(notif.iconType, notif.isRead)}
                                </div>
                                <div className="flex-1 flex flex-col">
                                    <div className="w-full flex justify-between items-start gap-3">
                                        <h3 className={`text-base font-sans ${notif.isRead ? 'text-slate-600 font-medium' : 'text-slate-900 font-bold'
                                            } flex items-center gap-2`}
                                        >
                                            {notif.title}
                                            {!notif.isRead && (
                                                <span className="w-2 h-2 rounded-full bg-red-500 shrink-0"></span>
                                            )}
                                        </h3>
                                        <span className={`text-xs shrink-0 mt-1 ${notif.isRead ? 'text-slate-400' : 'text-slate-500 font-semibold'
                                            }`}>
                                            {notif.timestamp}
                                        </span>
                                    </div>
                                    <p className={`text-sm mt-1 mb-2 ${notif.isRead ? 'text-slate-500' : 'text-slate-600'
                                        }`}>
                                        {notif.message}
                                    </p>
                                    <span className={`text-xs ${notif.isRead ? 'text-slate-400' : 'text-slate-500'
                                        }`}>
                                        From: <span className="font-medium">{notif.sender}</span>
                                    </span>
                                </div>
                            </div>
                        ))}

                        {notifications.length === 0 && (
                            <div className="text-center py-12">
                                <p className="text-slate-500">No notifications to display.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}