import SubjectTabs from "@/components/layouts/SubjectTabs";
import { BookOpen, ArrowLeft } from "lucide-react";
import Link from "next/link";

interface SubjectLayoutProps {
    children: React.ReactNode;
    params: Promise<{ subjectId: string }>;
}

export default async function SubjectLayout({
    children,
    params,
}: SubjectLayoutProps) {
    const { subjectId } = await params;

    const subjectName = subjectId
        .split("-")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ");

    return (
        <div className="p-6">
            {/* Navigation */}
            <div className="flex items-center gap-4 mb-6">
                <Link
                    href="/student/classes"
                    className="p-2 bg-white border border-gray-200 rounded-full hover:bg-gray-50 transition-colors"
                >
                    <ArrowLeft className="w-4 h-4 text-slate-600" />
                </Link>
                <div className="text-sm">
                    <span className="text-slate-400">My Classes / </span>
                    <span className="font-semibold text-slate-800">{subjectName}</span>
                </div>
            </div>


            {/* Top Banner */}
            <div className="bg-[#1e293b] text-white rounded-2xl p-6 mb-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="flex items-center space-x-4">
                    <div className="p-3 bg-white/10 rounded-xl">
                        <BookOpen className="w-8 h-8 text-blue-300" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold">{subjectName}</h1>
                        <p className="text-slate-300 text-sm mt-1">Mr. Tan Wei • Room 304 • Mon/Wed/Fri</p>
                    </div>
                </div>
                <div className="flex space-x-6 bg-slate-800/50 p-4 rounded-xl border border-white/5">
                    <div className="text-center">
                        <p className="text-xs text-slate-400 font-medium uppercase tracking-wider mb-1">Current Grade</p>
                        <p className="text-xl font-bold text-emerald-400">A</p>
                    </div>
                    <div className="w-px bg-white/10"></div>
                    <div className="text-center">
                        <p className="text-xs text-slate-400 font-medium uppercase tracking-wider mb-1">Attendance</p>
                        <p className="text-xl font-bold text-blue-400">92%</p>
                    </div>
                    <div className="w-px bg-white/10"></div>
                    <div className="text-center">
                        <p className="text-xs text-slate-400 font-medium uppercase tracking-wider mb-1">Pending HW</p>
                        <p className="text-xl font-bold text-orange-400">3</p>
                    </div>
                </div>
            </div>

            <SubjectTabs subjectId={subjectId} />

            <main>{children}</main>
        </div>
    );
}