import { cookies } from 'next/headers';
import MainSidebar from '../../components/layouts/MainSidebar';
import { PasswordGuard } from '../../components/auth/PasswordGuard';

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
    const cookieStore = await cookies();
    const role = cookieStore.get('user_role')?.value;

    return (
        <div className="flex bg-gray-50 min-h-screen overflow-hidden">
            <MainSidebar role={role} />
            <main className="flex-1 bg-slate-50 overflow-y-auto h-screen">
                <PasswordGuard>{children}</PasswordGuard>
            </main>
        </div>
    );
}
