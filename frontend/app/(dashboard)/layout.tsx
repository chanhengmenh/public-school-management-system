'use client';

import { usePathname } from 'next/navigation';
import Sidebar from '@/components/layouts/Sidebar';
import { NotificationProvider } from '@/contexts/NotificationContext';
import { StudentNotificationProvider } from '@/contexts/StudentNotificationContext';
import { AuthStoreProvider } from '@/store/useAuthStore';
import type { DashboardRole } from '@/lib/navigation-config';

function detectRole(pathname: string): DashboardRole {
  if (pathname.startsWith('/admin')) return 'admin';
  if (pathname.startsWith('/teacher')) return 'teacher';
  return 'student';
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const role = detectRole(pathname);

  const content = (
    <div className="flex bg-slate-50 min-h-screen overflow-hidden text-slate-900">
      <Sidebar role={role} />
      <main className="flex-1 bg-slate-50 overflow-y-auto h-screen relative">
        {children}
      </main>
    </div>
  );

  // Wrap with role-specific providers
  let wrapped = content;

  if (role === 'teacher') {
    wrapped = <NotificationProvider>{wrapped}</NotificationProvider>;
  }

  if (role === 'student') {
    wrapped = <StudentNotificationProvider>{wrapped}</StudentNotificationProvider>;
  }

  // AuthStoreProvider wraps everything
  return <AuthStoreProvider>{wrapped}</AuthStoreProvider>;
}
