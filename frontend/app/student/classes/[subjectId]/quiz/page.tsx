'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Zap, Loader2, FileQuestion } from "lucide-react";
import { assignmentsApi, submissionsApi } from '@/lib/api';
import { Assignment, Submission } from '@/types/school.types';

export default function QuizPage() {
    const params = useParams();
    const subjectId = params.subjectId as string;
    
    const [loading, setLoading] = useState(true);
    const [quizzes, setQuizzes] = useState<Assignment[]>([]);
    const [submissions, setSubmissions] = useState<Record<number, Submission>>({});

    useEffect(() => {
        if (!subjectId) return;

        const fetchData = async () => {
            setLoading(true);
            try {
                // Fetch all assignments for this class_subject
                const allTasks = await assignmentsApi.list({ class_subject_id: parseInt(subjectId) });
                
                // Filter for those with "Quiz" in the title
                const quizTasks = allTasks.filter(t => t.title.toLowerCase().includes('quiz'));
                setQuizzes(quizTasks);

                const subs = await submissionsApi.list();
                const subMap: Record<number, Submission> = {};
                subs.forEach(s => { subMap[s.assignment_id] = s; });
                setSubmissions(subMap);
            } catch (error) {
                console.error("Error fetching quizzes", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [subjectId]);

    const getStatusBadge = (assignmentId: number, dueDate: string | undefined) => {
        const submission = submissions[assignmentId];
        if (submission) {
            return <span className="px-2.5 py-1 bg-emerald-50 text-emerald-600 text-xs font-bold rounded-md">COMPLETED</span>;
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
            {quizzes.length > 0 ? quizzes.map(quiz => (
                <div key={quiz.id} className="bg-white p-5 rounded-xl border border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:shadow-sm transition-shadow">
                    <div className="flex items-center space-x-4">
                        <div className="p-3 rounded-xl bg-purple-50 text-purple-600">
                            <Zap className="w-6 h-6" />
                        </div>
                        <div>
                            <h3 className="font-bold text-slate-900">{quiz.title}</h3>
                            <p className="text-sm text-slate-500 mt-0.5">Quiz • Max Score: {quiz.max_score}</p>
                        </div>
                    </div>
                    <div className="flex items-center space-x-4 md:space-x-6 md:justify-end">
                        <div className="text-right">
                            <p className="text-xs text-slate-400 font-medium uppercase">Due Date</p>
                            <p className="text-sm font-medium text-slate-700">{quiz.due_date ? new Date(quiz.due_date).toLocaleDateString() : 'No due date'}</p>
                        </div>
                        <div>
                            {getStatusBadge(quiz.id, quiz.due_date)}
                        </div>
                    </div>
                </div>
            )) : (
                <div className="text-center py-10 bg-white rounded-xl border border-slate-100">
                    <FileQuestion className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                    <p className="text-slate-500">No quizzes found for this subject.</p>
                </div>
            )}
        </div>
    );
}
