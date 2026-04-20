'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Loader2, BarChart3, AlertCircle } from 'lucide-react';
import { analyticsApi, classSubjectsApi } from '@/lib/api';
import { ClassAnalytics } from '@/types/school.types';

const BAR_COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ef4444', '#06b6d4'];

export default function TeacherAnalysisPage() {
    const params = useParams();
    const subjectId = params.subjectId as string;

    const [loading, setLoading] = useState(true);
    const [analytics, setAnalytics] = useState<ClassAnalytics | null>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!subjectId) return;
        const fetchData = async () => {
            setLoading(true);
            setError(null);
            try {
                const cs = await classSubjectsApi.getById(parseInt(subjectId));
                const data = await analyticsApi.getClassAverages(cs.class_id);
                setAnalytics(data);
            } catch (err) {
                console.error('Error fetching analytics', err);
                setError('Failed to load analytics data.');
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [subjectId]);

    if (loading) {
        return (
            <div className="flex justify-center py-10">
                <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center py-10 text-slate-400 gap-2">
                <AlertCircle size={32} />
                <p>{error}</p>
            </div>
        );
    }

    return (
        <div className="space-y-8 p-6">
            {/* Summary cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                    <p className="text-sm text-slate-500 font-medium">Class Overall Average</p>
                    <p className="text-3xl font-bold text-slate-900 mt-1">
                        {analytics?.overall_average.toFixed(1) ?? 'N/A'}
                        <span className="text-base font-normal text-slate-400 ml-1">pts</span>
                    </p>
                </div>
                <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                    <p className="text-sm text-slate-500 font-medium">Subjects Tracked</p>
                    <p className="text-3xl font-bold text-slate-900 mt-1">
                        {analytics?.subject_averages.length ?? 0}
                    </p>
                </div>
            </div>

            {/* Bar chart */}
            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
                    <BarChart3 className="text-blue-500" size={20} />
                    Average Score by Subject
                </h3>
                <div className="h-64">
                    {analytics && analytics.subject_averages.length > 0 ? (
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={analytics.subject_averages} margin={{ bottom: 20 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                <XAxis dataKey="subject_name" tick={{ fontSize: 12 }} />
                                <YAxis />
                                <Tooltip
                                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                                    formatter={(value: any) => [value != null ? `${(value as number).toFixed(1)} pts` : 'N/A', 'Avg Score']}
                                />
                                <Bar dataKey="average_score" radius={[4, 4, 0, 0]} barSize={48}>
                                    {analytics.subject_averages.map((_, i) => (
                                        <Cell key={i} fill={BAR_COLORS[i % BAR_COLORS.length]} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="h-full flex flex-col items-center justify-center text-slate-400 gap-2">
                            <AlertCircle size={32} />
                            <p>No graded data available yet.</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-slate-50 border-b border-slate-100">
                            <th className="px-6 py-4 text-xs uppercase tracking-wider font-bold text-slate-500">Subject</th>
                            <th className="px-6 py-4 text-xs uppercase tracking-wider font-bold text-slate-500">Avg Score</th>
                            <th className="px-6 py-4 text-xs uppercase tracking-wider font-bold text-slate-500 text-right">Submissions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                        {analytics?.subject_averages.map((s, i) => (
                            <tr key={i} className="hover:bg-slate-50 transition-colors">
                                <td className="px-6 py-4 font-bold text-slate-900">{s.subject_name}</td>
                                <td className="px-6 py-4 text-slate-700">{s.average_score.toFixed(1)} pts</td>
                                <td className="px-6 py-4 text-right text-slate-500">{s.submission_count}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
