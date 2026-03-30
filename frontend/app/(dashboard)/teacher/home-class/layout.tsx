'use client';

import React from 'react';
import { useAuthStore } from '@/store/useAuthStore';
import { getTeacherData } from '@/lib/mock-data/teacher';
import { Card } from '@/components/ui';
import { AlertCircle, Loader2 } from 'lucide-react';

export default function HomeClassLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const { user, isHydrated } = useAuthStore();
    const teacherData = getTeacherData(user?.id ?? '');

    if (!isHydrated) {
        return (
            <div className="flex items-center justify-center py-20 min-h-screen bg-slate-50">
                <Loader2 className="w-8 h-8 text-slate-300 animate-spin" />
            </div>
        );
    }

    if (!teacherData?.homeClass) {
        return (
            <div className="min-h-screen bg-slate-50 p-6 lg:p-8 flex items-center justify-center">
                <Card className="p-10 flex flex-col items-center justify-center text-center max-w-md w-full border-red-100 shadow-sm">
                    <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mb-4">
                        <AlertCircle className="w-8 h-8" />
                    </div>
                    <h2 className="text-2xl font-bold text-slate-900 mb-2">Access Denied</h2>
                    <p className="text-slate-500 max-w-sm">You are not assigned as a Home-Class Teacher. This page is restricted to home-class administration only.</p>
                </Card>
            </div>
        );
    }

    return <>{children}</>;
}
