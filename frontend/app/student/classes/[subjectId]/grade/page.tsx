'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Loader2, TrendingUp, BookOpen, AlertCircle } from 'lucide-react';
import { assignmentsApi, submissionsApi, gradesApi } from '@/lib/api';
import { Grade } from '@/lib/api/grades';
import { Submission } from '@/types/school.types';
import { useAuth } from '@/components/auth/AuthProvider';

interface GradeDataEntry {
    name: string;
    score: number;
    max: number;
    percentage: number;
    feedback?: string;
    date: string;
}

export default function GradePage() {
    const params = useParams();
    const subjectId = params.subjectId as string;
    const { user } = useAuth();

    const [loading, setLoading] = useState(true);
    const [gradesData, setGradesData] = useState<GradeDataEntry[]>([]);
    const [average, setAverage] = useState(0);

    useEffect(() => {
        if (!subjectId || !user) return;

        const fetchData = async () => {
            setLoading(true);
            try {
                const [tasks, subs, grades] = await Promise.all([
                    assignmentsApi.list({ class_subject_id: parseInt(subjectId) }),
                    submissionsApi.list(),
                    gradesApi.list({ student_id: user.id }),
                ]);

                // submission_id → grade
                const gradeBySubId: Record<number, Grade> = {};
                grades.forEach((g: Grade) => { gradeBySubId[g.submission_id] = g; });

                // assignment_id → submission
                const subByAssId: Record<number, Submission> = {};
                subs.forEach((s: Submission) => { subByAssId[s.assignment_id] = s; });

                const processedGrades = tasks
                    .filter(t => {
                        const sub = subByAssId[t.id];
                        return sub !== undefined && gradeBySubId[sub.id] !== undefined;
                    })
                    .map(t => {
                        const sub = subByAssId[t.id];
                        const grade = gradeBySubId[sub.id];
                        return {
                            name: t.title,
                            score: grade.score,
                            max: t.max_score,
                            percentage: (grade.score / t.max_score) * 100,
                            feedback: grade.feedback,
                            date: new Date(grade.graded_at).toLocaleDateString(),
                        };
                    });

                setGradesData(processedGrades);

                if (processedGrades.length > 0) {
                    const totalPercent = processedGrades.reduce((acc, curr) => acc + curr.percentage, 0);
                    setAverage(totalPercent / processedGrades.length);
                }
            } catch (error) {
                console.error("Error fetching grades", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [subjectId, user]);

    if (loading) {
        return (
            <div className="flex justify-center py-10">
                <Loader2 className="h-8 w-8 animate-spin text-amber-500" />
            </div>
        );
    }

    return (
        <div className="space-y-8">
            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
                    <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
                        <TrendingUp size={24} />
                    </div>
                    <div>
                        <p className="text-sm text-slate-500 font-medium">Average Grade</p>
                        <p className="text-2xl font-bold text-slate-900">{average.toFixed(1)}%</p>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
                    <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
                        <BookOpen size={24} />
                    </div>
                    <div>
                        <p className="text-sm text-slate-500 font-medium">Graded Tasks</p>
                        <p className="text-2xl font-bold text-slate-900">{gradesData.length}</p>
                    </div>
                </div>
            </div>

            {/* Performance Chart */}
            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                <h3 className="text-lg font-bold text-slate-900 mb-6">Performance Trend</h3>
                <div className="h-64 w-full">
                    {gradesData.length > 0 ? (
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={gradesData}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                <XAxis dataKey="name" hide />
                                <YAxis domain={[0, 100]} />
                                <Tooltip
                                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                                    formatter={(value: number | undefined) => [value != null ? `${value.toFixed(1)}%` : '', 'Score']}
                                />
                                <Bar dataKey="percentage" radius={[4, 4, 0, 0]} barSize={40}>
                                    {gradesData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.percentage >= 80 ? '#10b981' : '#f59e0b'} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="h-full flex flex-col items-center justify-center text-slate-400">
                            <AlertCircle size={32} className="mb-2" />
                            <p>No graded data available yet.</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Grades Table */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-slate-50 border-b border-slate-100">
                            <th className="px-6 py-4 text-xs uppercase tracking-wider font-bold text-slate-500">Assignment</th>
                            <th className="px-6 py-4 text-xs uppercase tracking-wider font-bold text-slate-500">Date</th>
                            <th className="px-6 py-4 text-xs uppercase tracking-wider font-bold text-slate-500">Score</th>
                            <th className="px-6 py-4 text-xs uppercase tracking-wider font-bold text-slate-500 text-right">Grade</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                        {gradesData.length > 0 ? gradesData.map((grade, i) => (
                            <tr key={i} className="hover:bg-slate-50 transition-colors group">
                                <td className="px-6 py-4">
                                    <p className="font-bold text-slate-900">{grade.name}</p>
                                    <p className="text-xs text-slate-500 mt-0.5 line-clamp-1 italic">{grade.feedback || "No feedback provided."}</p>
                                </td>
                                <td className="px-6 py-4 text-sm text-slate-500">{grade.date}</td>
                                <td className="px-6 py-4 text-sm font-medium text-slate-700">{grade.score}/{grade.max}</td>
                                <td className="px-6 py-4 text-right">
                                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${grade.percentage >= 80 ? 'bg-emerald-50 text-emerald-600' : 'bg-orange-50 text-orange-600'}`}>
                                        {grade.percentage >= 90 ? 'A' : grade.percentage >= 80 ? 'B' : grade.percentage >= 70 ? 'C' : 'D'}
                                    </span>
                                </td>
                            </tr>
                        )) : (
                            <tr>
                                <td colSpan={4} className="px-6 py-10 text-center text-slate-400">
                                    No grades available yet.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
