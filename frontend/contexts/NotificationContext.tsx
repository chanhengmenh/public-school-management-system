'use client';

import React, { createContext, useContext, useState, useMemo, useCallback } from 'react';

// --- Types ---
type NotificationType = 'attendance' | 'submission' | 'message' | 'alert';

export interface Notification {
    id: number;
    type: NotificationType;
    title: string;
    message: string;
    time: string;
    isRead: boolean;
    link: string;
}

// --- Dummy Data ---
const initialNotifications: Notification[] = [
    {
        id: 1,
        type: 'attendance',
        title: 'Attendance Drafted',
        message: 'Class Monitor Alex Johnson has drafted attendance for Physics 11A.',
        time: '10 mins ago',
        isRead: false,
        link: '/teacher/classes/class-1/attendance',
    },
    {
        id: 2,
        type: 'submission',
        title: 'Late Submission',
        message: 'Linda Choo just submitted the Chapter 4 Homework.',
        time: '1 hour ago',
        isRead: false,
        link: '/teacher/classes/class-1/grading',
    },
    {
        id: 3,
        type: 'message',
        title: 'Question from Student',
        message: 'James Smith asked a question regarding the Mid-Term format.',
        time: 'Yesterday',
        isRead: true,
        link: '#',
    },
    {
        id: 4,
        type: 'alert',
        title: 'System Maintenance',
        message: 'The grading portal will be offline for 15 minutes tonight.',
        time: 'Yesterday',
        isRead: true,
        link: '#',
    },
    {
        id: 5,
        type: 'submission',
        title: 'New Quiz Results',
        message: '28 students have completed the Mid-Term Physics Assessment.',
        time: '2 days ago',
        isRead: true,
        link: '/teacher/classes/class-1/grading',
    },
];

// --- Context Shape ---
interface NotificationContextType {
    notifications: Notification[];
    unreadCount: number;
    markRead: (id: number) => void;
    markAllRead: () => void;
    deleteNotification: (id: number) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

// --- Provider ---
export function NotificationProvider({ children }: { children: React.ReactNode }) {
    const [notifications, setNotifications] = useState<Notification[]>(initialNotifications);

    const unreadCount = useMemo(
        () => notifications.filter(n => !n.isRead).length,
        [notifications]
    );

    const markRead = useCallback((id: number) => {
        setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
    }, []);

    const markAllRead = useCallback(() => {
        setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    }, []);

    const deleteNotification = useCallback((id: number) => {
        setNotifications(prev => prev.filter(n => n.id !== id));
    }, []);

    const value = useMemo(() => ({
        notifications,
        unreadCount,
        markRead,
        markAllRead,
        deleteNotification,
    }), [notifications, unreadCount, markRead, markAllRead, deleteNotification]);

    return (
        <NotificationContext.Provider value={value}>
            {children}
        </NotificationContext.Provider>
    );
}

// --- Hook ---
export function useNotifications() {
    const context = useContext(NotificationContext);
    if (!context) {
        throw new Error('useNotifications must be used within a NotificationProvider');
    }
    return context;
}
