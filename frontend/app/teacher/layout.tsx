'use client';

import TeacherSidebar from '@/components/layouts/TeacherSidebar';
import { NotificationProvider } from '@/contexts/NotificationContext';

export default function TeacherLayout({ children }: { children: React.ReactNode }) {
    return (
        <NotificationProvider>
            <div className="flex bg-slate-50 min-h-screen overflow-hidden text-slate-900">
                <TeacherSidebar />

                <main className="flex-1 bg-slate-50 overflow-y-auto h-screen relative">
                    {children}
                </main>
            </div>
        </NotificationProvider>
    );
}