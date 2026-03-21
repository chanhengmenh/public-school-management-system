import { cookies } from 'next/headers';
import MainSidebar from '../../components/layouts/MainSidebar';

export default async function StudentLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const cookieStore = await cookies();
    const role = cookieStore.get('mock_role')?.value;

    return (
        <div className="flex bg-gray-50 min-h-screen overflow-hidden">
            <MainSidebar role={role} />
            <main className="flex-1 bg-slate-50 overflow-y-auto h-screen">
                {children}
            </main>
        </div>
    );
}