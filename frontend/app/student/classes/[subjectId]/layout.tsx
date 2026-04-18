'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, BookOpen, Loader2 } from 'lucide-react';
import SubjectTabs from '@/components/layouts/SubjectTabs';
import { classSubjectsApi, assignmentsApi, submissionsApi, attendanceApi } from '@/lib/api';
import { useAuth } from '@/components/auth/AuthProvider';
import { ClassSubject, Assignment } from '@/types/school.types';

export default function StudentSubjectLayout({ children }: { children: React.ReactNode }) {
    const params = useParams();
    const subjectId = params.subjectId as string;
    const { user } = useAuth();

    const [subject, setSubject] = useState<ClassSubject | null>(null);
    const [loading, setLoading] = useState(true);
    const [pendingCount, setPendingCount] = useState(0);
    const [attendanceRate, setAttendanceRate] = useState<number | null>(null);

    useEffect(() => {
        if (!user || !subjectId) return;
        const load = async () => {
            try {
                const [cs, assignments] = await Promise.all([
                    classSubjectsApi.getById(parseInt(subjectId, 10)),
                    assignmentsApi.list({ class_subject_id: parseInt(subjectId, 10) }),
                ]);
                setSubject(cs);

                const published = (assignments as Assignment[]).filter(a => a.status === 'published');
                const subs = await submissionsApi.list({ student_id: user.id });
                const submittedIds = new Set(subs.map((s: { assignment_id: number }) => s.assignment_id));
                setPendingCount(published.filter(a => !submittedIds.has(a.id)).length);

                const attendanceRecords = await attendanceApi.list({ student_id: user.id });
                if (attendanceRecords.length > 0) {
                    const classRecords = attendanceRecords.filter(
                        (r: { class_id: number; status: string }) => r.class_id === cs.class_id
                    );
                    if (classRecords.length > 0) {
                        const present = classRecords.filter(
                            (r: { status: string }) => r.status === 'present' || r.status === 'late'
                        ).length;
                        setAttendanceRate(Math.round((present / classRecords.length) * 100));
                    }
                }
            } catch {
                // silently fail — header just shows placeholders
            } finally {
                setLoading(false);
            }
        };
        load();
    }, [user, subjectId]);

    return (
        <div className="p-6 lg:p-8 bg-slate-50 min-h-screen">
            {/* Back navigation */}
            <div className="flex items-center gap-3 mb-6">
                <Link
                    href="/student/classes"
                    className="p-2 bg-white border border-slate-200 rounded-full hover:bg-slate-50 transition-colors"
                >
                    <ArrowLeft className="w-4 h-4 text-slate-600" />
                </Link>
                <div className="text-sm text-slate-500">
                    My Classes /
                    <span className="font-semibold text-slate-800 ml-1">
                        {subject?.subject_name ?? '...'}
                    </span>
                </div>
            </div>

            {/* Header banner */}
            <div className="bg-[#1e293b] text-white rounded-2xl p-6 mb-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-white/10 rounded-xl">
                        <BookOpen className="w-8 h-8 text-blue-300" />
                    </div>
                    {loading ? (
                        <div className="flex items-center gap-2">
                            <Loader2 className="h-5 w-5 animate-spin text-slate-400" />
                            <span className="text-slate-400">Loading…</span>
                        </div>
                    ) : (
                        <div>
                            <h1 className="text-2xl font-bold">{subject?.subject_name ?? 'Subject'}</h1>
                            <p className="text-slate-300 text-sm mt-1">
                                {subject?.class_name ?? ''}
                                {subject?.teacher_name ? ` · ${subject.teacher_name}` : ''}
                            </p>
                        </div>
                    )}
                </div>

                <div className="flex gap-6 bg-slate-800/50 p-4 rounded-xl border border-white/5">
                    <div className="text-center">
                        <p className="text-xs text-slate-400 font-medium uppercase tracking-wider mb-1">Attendance</p>
                        <p className="text-xl font-bold text-blue-400">
                            {attendanceRate !== null ? `${attendanceRate}%` : '—'}
                        </p>
                    </div>
                    <div className="w-px bg-white/10" />
                    <div className="text-center">
                        <p className="text-xs text-slate-400 font-medium uppercase tracking-wider mb-1">Pending HW</p>
                        <p className="text-xl font-bold text-orange-400">{loading ? '—' : pendingCount}</p>
                    </div>
                </div>
            </div>

            <SubjectTabs role="student" subjectId={subjectId} />

            <main>{children}</main>
        </div>
    );
}
