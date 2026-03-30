'use client';

import React from 'react';
import { useAuthStore } from '@/store/useAuthStore';
import { Card, Button } from '@/components/ui';
import { AlertCircle, Loader2 } from 'lucide-react';
import Link from 'next/link';

export default function ClassMonitorLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const { user, isHydrated } = useAuthStore();

    if (!isHydrated) {
        return (
            <div className="flex items-center justify-center py-20 min-h-screen bg-slate-50">
                <Loader2 className="w-8 h-8 text-slate-300 animate-spin" />
            </div>
        );
    }

    if (user?.role !== 'student' || user?.subRole !== 'monitor') {
        return (
            <div className="min-h-screen bg-slate-50 p-6 lg:p-8 flex items-center justify-center">
                <Card className="p-10 flex flex-col items-center justify-center text-center max-w-md w-full border-red-100 shadow-sm">
                    <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mb-4">
                        <AlertCircle className="w-8 h-8" />
                    </div>
                    <h2 className="text-2xl font-bold text-slate-900 mb-2">Access Denied</h2>
                    <p className="text-slate-500 max-w-sm mb-6">This area is restricted to the Class Monitor.</p>
                    <Link href="/student">
                        <Button variant="primary">Return to Dashboard</Button>
                    </Link>
                </Card>
            </div>
        );
    }

    return <>{children}</>;
}
