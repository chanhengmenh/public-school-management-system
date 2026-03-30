'use client';

import React, { useState, useMemo } from 'react';
import { useAuthStore } from '@/store/useAuthStore';
import { getTeacherData } from '@/lib/mock-data/teacher';
import { mockClass10A } from '@/lib/mock-data/home-class';
import PageHeader from '@/components/layouts/PageHeader';
import { Card, Button, Badge } from '@/components/ui';
import { Trophy, AlertCircle, Hash, GraduationCap, Users } from 'lucide-react';

type Term = 'sem1' | 'sem2' | 'yearly';

export default function HomeClassRankingPage() {
    const { user } = useAuthStore();
    const teacherData = getTeacherData(user?.id ?? 'teacher_001');
    const [activeTerm, setActiveTerm] = useState<Term>('sem1');

    const { sortedStudents, stats } = useMemo(() => {
        let sorted = null;
        if (activeTerm === 'sem2') {
            const hasData = mockClass10A.some(s => s.sem2 !== null);
            if (hasData) {
                sorted = [...mockClass10A].sort((a, b) => (b.sem2?.overall ?? 0) - (a.sem2?.overall ?? 0));
            }
        } else if (activeTerm === 'yearly') {
            const hasData = mockClass10A.some(s => s.yearly !== null);
            if (hasData) {
                sorted = [...mockClass10A].sort((a, b) => (b.yearly?.overall ?? 0) - (a.yearly?.overall ?? 0));
            }
        } else {
            sorted = [...mockClass10A].sort((a, b) => (b.sem1?.overall ?? 0) - (a.sem1?.overall ?? 0));
        }

        let tempStats = null;
        if (sorted) {
            const getTermData = (s: typeof sorted[0]) => {
                if (activeTerm === 'sem1') return s.sem1;
                if (activeTerm === 'sem2') return s.sem2;
                return s.yearly;
            };

            const allScores = sorted.map(s => getTermData(s)?.overall ?? 0);
            const avgScore = allScores.length > 0 ? allScores.reduce((acc, val) => acc + val, 0) / allScores.length : 0;
            const topScore = allScores.length > 0 ? Math.max(...allScores) : 0;
            const aCount = sorted.filter(s => getTermData(s)?.letterGrade === 'A').length;

            tempStats = {
                totalCount: sorted.length,
                avgScore: avgScore.toFixed(1),
                topScore: topScore.toFixed(1),
                aCount
            };
        }

        return { sortedStudents: sorted, stats: tempStats };
    }, [activeTerm]);

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

    const SUBJECTS = ['Mathematics', 'Physics', 'Chemistry', 'Biology', 'English', 'History', 'Art'];

    return (
        <div className="min-h-screen bg-slate-50 font-sans">
            <PageHeader
                title="Academic Ranking System"
                subtitle="Academic Year 2025-2026 • Grade 10 • All Subjects"
            />

            <div className="max-w-[1400px] mx-auto w-full px-6 lg:px-8 pb-12 pt-6">

                {/* ── Top Controls ── */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                    <div className="flex items-center gap-2">
                        <Button
                            variant={activeTerm === 'yearly' ? 'primary' : 'outline'}
                            size="sm"
                            onClick={() => setActiveTerm('yearly')}
                        >
                            Yearly
                        </Button>
                        <Button
                            variant={activeTerm === 'sem1' ? 'primary' : 'outline'}
                            size="sm"
                            onClick={() => setActiveTerm('sem1')}
                        >
                            Semester 1
                        </Button>
                        <Button
                            variant={activeTerm === 'sem2' ? 'primary' : 'outline'}
                            size="sm"
                            onClick={() => setActiveTerm('sem2')}
                        >
                            Semester 2
                        </Button>
                    </div>
                </div>

                {/* ── Empty State / Leaderboard ── */}
                {!sortedStudents || !stats ? (
                    <Card className="p-16 flex flex-col items-center justify-center text-center bg-white border-dashed border-2 border-slate-200 shadow-none mt-8">
                        <div className="w-20 h-20 bg-amber-50 rounded-full flex items-center justify-center mb-6">
                            <Hash className="w-10 h-10 text-amber-500" />
                        </div>
                        <h3 className="text-xl font-bold text-slate-900 mb-3">Grading Not Complete</h3>
                        <p className="text-slate-500 max-w-md">
                            Grades for this term are not yet finalized.
                        </p>
                    </Card>
                ) : (
                    <div className="space-y-6">
                        {/* ── Dynamic Stats Grid ── */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <Card className="p-4 flex flex-col justify-center border-slate-200 shadow-sm">
                                <span className="text-sm font-medium text-slate-500 mb-1 flex items-center gap-1.5"><Users className="w-4 h-4" /> Total Students</span>
                                <span className="text-xl font-bold text-slate-900">{stats.totalCount}</span>
                            </Card>
                            <Card className="p-4 flex flex-col justify-center border-slate-200 shadow-sm">
                                <span className="text-sm font-medium text-slate-500 mb-1 flex items-center gap-1.5"><Hash className="w-4 h-4" /> Class Average</span>
                                <span className="text-xl font-bold text-slate-900">{stats.avgScore}</span>
                            </Card>
                            <Card className="p-4 flex flex-col justify-center border-slate-200 shadow-sm">
                                <span className="text-sm font-medium text-slate-500 mb-1 flex items-center gap-1.5"><Trophy className="w-4 h-4" /> Highest Score</span>
                                <span className="text-xl font-bold text-slate-900">{stats.topScore}</span>
                            </Card>
                            <Card className="p-4 flex flex-col justify-center border-slate-200 shadow-sm">
                                <span className="text-sm font-medium text-slate-500 mb-1 flex items-center gap-1.5"><GraduationCap className="w-4 h-4" /> Grade "A" Count</span>
                                <span className="text-xl font-bold text-slate-900">{stats.aCount}</span>
                            </Card>
                        </div>

                        {/* ── Data Table ── */}
                        <Card className="p-0 overflow-hidden shadow-sm border border-slate-200">
                            <div className="w-full overflow-x-auto">
                                <table className="w-full text-left border-collapse min-w-[1000px]">
                                    <thead>
                                        <tr className="bg-slate-50 border-b border-slate-200 text-[11px] uppercase tracking-wider text-slate-500 font-bold">
                                            <th className="px-4 py-4 text-center w-16">Rank</th>
                                            <th className="px-5 py-4 min-w-[200px]">Student</th>
                                            <th className="px-4 py-4 text-center w-24">Overall</th>
                                            <th className="px-4 py-4 text-center w-20">Grade</th>
                                            {SUBJECTS.map(subj => (
                                                <th key={subj} className="px-4 py-4 text-right truncate" title={subj}>{subj}</th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100 bg-white">
                                        {sortedStudents.length === 0 ? (
                                            <tr>
                                                <td colSpan={11} className="py-12 text-center text-slate-500">
                                                    No students found matching your filtering criteria.
                                                </td>
                                            </tr>
                                        ) : (
                                            sortedStudents.map((student, index) => {
                                                const rank = index + 1;
                                                const termData = activeTerm === 'sem1' ? student.sem1 : (activeTerm === 'sem2' ? student.sem2 : student.yearly);

                                                return (
                                                    <tr key={student.id} className="hover:bg-slate-50/80 transition-colors group">
                                                        {/* Rank */}
                                                        <td className="px-4 py-3 align-middle text-center border-r border-slate-50">
                                                            {rank === 1 && <div className="w-7 h-7 mx-auto rounded-full bg-amber-100 text-amber-600 flex items-center justify-center font-bold text-xs ring-1 ring-amber-200/50 shadow-sm">1</div>}
                                                            {rank === 2 && <div className="w-7 h-7 mx-auto rounded-full bg-slate-200 text-slate-600 flex items-center justify-center font-bold text-xs ring-1 ring-slate-300/50 shadow-sm">2</div>}
                                                            {rank === 3 && <div className="w-7 h-7 mx-auto rounded-full bg-orange-100 text-orange-700 flex items-center justify-center font-bold text-xs ring-1 ring-orange-200/50 shadow-sm">3</div>}
                                                            {rank > 3 && <div className="w-7 h-7 mx-auto text-slate-400 flex items-center justify-center font-semibold text-xs">{rank}</div>}
                                                        </td>

                                                        {/* Student */}
                                                        <td className="px-5 py-3 align-middle border-r border-slate-50">
                                                            <div className="flex flex-col">
                                                                <span className="font-bold text-slate-900 text-sm group-hover:text-amber-600 transition-colors cursor-pointer">{student.name}</span>
                                                                <span className="text-[11px] text-slate-500 font-medium">{student.studentId}</span>
                                                            </div>
                                                        </td>

                                                        {/* Overall */}
                                                        <td className="px-4 py-3 align-middle text-center border-r border-slate-50">
                                                            <div className="inline-flex">
                                                                <Badge variant="neutral" className={`border-slate-200 text-base !font-bold text-slate-900 px-3 py-1 min-w-[50px] justify-center shadow-sm`}>
                                                                    {termData?.overall?.toFixed(1) ?? '--'}
                                                                </Badge>
                                                            </div>
                                                        </td>

                                                        {/* Grade */}
                                                        <td className="px-4 py-3 align-middle text-center border-r border-slate-50 bg-slate-50/30 group-hover:bg-transparent transition-colors">
                                                            <span className={`text-base font-bold ${termData ? 'text-blue-600' : 'text-slate-400'}`}>
                                                                {termData?.letterGrade ?? '-'}
                                                            </span>
                                                        </td>

                                                        {/* Subjects */}
                                                        {SUBJECTS.map(subj => {
                                                            const score = termData?.subjects[subj];
                                                            return (
                                                                <td key={subj} className="px-4 py-3 align-middle text-right border-r border-slate-50 last:border-r-0">
                                                                    <span className={`text-sm ${score !== undefined ? 'text-slate-900' : 'text-slate-400'}`}>
                                                                        {score ?? '-'}
                                                                    </span>
                                                                </td>
                                                            );
                                                        })}
                                                    </tr>
                                                );
                                            })
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </Card>
                    </div>
                )}
            </div>
        </div>
    );
}
