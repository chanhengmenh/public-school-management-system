import MainSidebar from '../../components/layouts/MainSidebar';

export default function StudentLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="flex bg-gray-50 min-h-screen overflow-hidden">
            <MainSidebar />
            <main className="flex-1 bg-slate-50 overflow-y-auto h-screen">
                {children}
            </main>
        </div>
    );
}