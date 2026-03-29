'use client';

import React, { createContext, useContext, useState, useMemo, useCallback, useEffect } from 'react';
import { mockNotifications } from '@/lib/mock-data/notifications';
import { useAuthStore } from '@/store/useAuthStore';
import type { Notification } from '@/types/school.types';

// ─── Context Shape ───────────────────────────────────────────────────

interface StudentNotificationContextType {
    notifications: Notification[];
    unreadCount: number;
    markAsRead: (id: number) => void;
    markAllAsRead: () => void;
}

const StudentNotificationContext = createContext<StudentNotificationContextType | undefined>(undefined);

// ─── Provider ────────────────────────────────────────────────────────

export function StudentNotificationProvider({ children }: { children: React.ReactNode }) {
    const { user } = useAuthStore();
    const [notifications, setNotifications] = useState<Notification[]>([]);

    useEffect(() => {
        if (!user?.id) return;
        const filtered = mockNotifications.filter(
            n => n.recipientId === 'PUBLIC' || n.recipientId === user.id
        );
        setNotifications(filtered);
    }, [user?.id]);

    const unreadCount = useMemo(
        () => notifications.filter(n => !n.isRead).length,
        [notifications]
    );

    const markAsRead = useCallback((id: number) => {
        setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
    }, []);

    const markAllAsRead = useCallback(() => {
        setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    }, []);

    const value = useMemo(() => ({
        notifications,
        unreadCount,
        markAsRead,
        markAllAsRead,
    }), [notifications, unreadCount, markAsRead, markAllAsRead]);

    return (
        <StudentNotificationContext.Provider value={value}>
            {children}
        </StudentNotificationContext.Provider>
    );
}

// ─── Hook ────────────────────────────────────────────────────────────

export function useStudentNotifications() {
    const context = useContext(StudentNotificationContext);
    if (!context) {
        throw new Error('useStudentNotifications must be used within a StudentNotificationProvider');
    }
    return context;
}
