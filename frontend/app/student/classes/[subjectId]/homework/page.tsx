'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { FileText, Loader2, ChevronRight } from "lucide-react";
import { assignmentsApi, submissionsApi } from '@/lib/api';
import { Assignment, Submission } from '@/types/school.types';

export default function HomeworkPage() {
    const params = useParams();
    const subjectId = params.subjectId as string;

    const [loading, setLoading] = useState(true);
    const [assignments, setAssignments] = useState<Assignment[]>([]);
    const [submissions, setSubmissions] = useState<Record<number, Submission>>({});

    useEffect(() => {
        if (!subjectId) return;

        const fetchData = async () => {
            setLoading(true);
            try {
                const tasks = await assignmentsApi.list({ class_subject_id: parseInt(subjectId) });
                setAssignments(tasks);

                const subs = await submissionsApi.list();
                const subMap: Record<number, Submission> = {};
                subs.forEach(s => { subMap[s.assignment_id] = s; });
                setSubmissions(subMap);
            } catch (error) {
                console.error("Error fetching homework", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [subjectId]);

    const getStatusBadge = (assignmentId: number, dueDate: string | undefined) => {
        const submission = submissions[assignmentId];
        if (submission) {
            return <span className="px-2.5 py-1 bg-emerald-50 text-emerald-600 text-xs font-bold rounded-md">SUBMITTED</span>;
        }
        if (dueDate && new Date() > new Date(dueDate)) {
            return <span className="px-2.5 py-1 bg-red-50 text-red-600 text-xs font-bold rounded-md">OVERDUE</span>;
        }
        return <span className="px-2.5 py-1 bg-orange-50 text-orange-600 text-xs font-bold rounded-md">PENDING</span>;
    };

    if (loading) {
        return (
            <div className="flex justify-center py-10">
                <Loader2 className="h-8 w-8 animate-spin text-amber-500" />
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {assignments.length > 0 ? assignments.map(hw => (
                <Link
                    key={hw.id}
                    href={`/student/classes/${subjectId}/homework/${hw.id}`}
                    className="bg-white p-5 rounded-xl border border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:shadow-sm hover:border-slate-200 transition-all group block"
                >
                    <div className="flex items-center space-x-4">
                        <div className="p-3 rounded-xl bg-blue-50 text-blue-600 group-hover:bg-blue-100 transition-colors">
                            <FileText className="w-6 h-6" />
                        </div>
                        <div>
                            <h3 className="font-bold text-slate-900 group-hover:text-blue-700 transition-colors">{hw.title}</h3>
                            <p className="text-sm text-slate-500 mt-0.5">Assignment · Max Score: {hw.max_score}</p>
                        </div>
                    </div>
                    <div className="flex items-center space-x-4 md:space-x-6 md:justify-end">
                        <div className="text-right">
                            <p className="text-xs text-slate-400 font-medium uppercase">Due Date</p>
                            <p className="text-sm font-medium text-slate-700">
                                {hw.due_date ? new Date(hw.due_date).toLocaleDateString() : 'No due date'}
                            </p>
                        </div>
                        {getStatusBadge(hw.id, hw.due_date)}
                        <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-slate-500 transition-colors shrink-0" />
                    </div>
                </Link>
            )) : (
                <div className="text-center py-10 bg-white rounded-xl border border-slate-100">
                    <p className="text-slate-500">No assignments found for this subject.</p>
                </div>
            )}
        </div>
    );
}
