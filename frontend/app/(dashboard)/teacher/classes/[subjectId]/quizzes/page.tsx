'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { Calendar, CheckCircle2, Clock, PlayCircle } from 'lucide-react';

// Type Definitions
interface Quiz {
    id: string;
    title: string;
    description: string;
    publishDate: string;
    startDate: string;
    dueDate: string;
    timeLimit: string;
    status: 'Draft' | 'Upcoming' | 'Available' | 'Completed';
    completedCount: number;
}

const initialQuizzes: Quiz[] = [
    { id: 'q1', title: 'Mid-Term Physics Assessment', description: 'Comprehensive test covering Chapter 1 to 4.', publishDate: '2025-05-20T08:00', startDate: '2025-05-21T09:00', dueDate: '2025-05-21T10:30', timeLimit: '90 mins', status: 'Available', completedCount: 28 },
    { id: 'q2', title: 'Kinematics Pop Quiz', description: 'Quick check on recent kinematics concepts.', publishDate: '2025-05-28T08:00', startDate: '2025-05-29T14:00', dueDate: '2025-05-29T14:45', timeLimit: '45 mins', status: 'Upcoming', completedCount: 0 },
    { id: 'q3', title: 'Newton\'s Laws Checkpoint', description: 'Standard evaluation for Chapter 3.', publishDate: '2025-06-05T08:00', startDate: '2025-06-06T10:00', dueDate: '2025-06-06T11:00', timeLimit: '60 mins', status: 'Draft', completedCount: 0 }
];

export default function TeacherQuizzesPage() {
    const params = useParams();
    const subjectId = (params?.subjectId as string) || 'class-1';

    const [quizzesData, setQuizzesData] = useState<Quiz[]>(initialQuizzes);

    useEffect(() => {
        if (typeof window !== 'undefined') {
            const storedQuizzes = localStorage.getItem(`quizzes-${subjectId}`);
            if (storedQuizzes) {
                // Migrate old status names to new ones
                const parsed: Quiz[] = JSON.parse(storedQuizzes).map((q: any) => ({
                    ...q,
                    status: q.status === 'Active' ? 'Available'
                        : q.status === 'Scheduled' ? 'Upcoming'
                            : q.status
                }));
                localStorage.setItem(`quizzes-${subjectId}`, JSON.stringify(parsed));
                setQuizzesData(parsed);
            } else {
                localStorage.setItem(`quizzes-${subjectId}`, JSON.stringify(initialQuizzes));
                setQuizzesData(initialQuizzes);
            }
        }
    }, [subjectId]);

    return (
        <div className="flex flex-col space-y-8">
            {/* Action Bar */}
            <div className="flex justify-between items-center bg-white p-4 rounded-2xl shadow-sm border border-slate-200">
                <span className="text-sm text-slate-500">
                    Manage class quizzes and assessments
                </span>
                <Link
                    href={`/teacher/classes/${subjectId}/quizzes/create`}
                    className="bg-purple-600 hover:bg-purple-700 text-white px-5 py-2 rounded-xl text-sm font-bold transition-colors shadow-sm flex items-center gap-2"
                >
                    + Create Quiz
                </Link>
            </div>

            {/* Quiz List */}
            <div className="flex flex-col gap-4">
                {quizzesData.map(quiz => (
                    <div key={quiz.id} className="bg-white border border-slate-200 rounded-xl p-5 hover:shadow-md transition-shadow flex flex-col justify-between gap-4">
                        {/* Header Row */}
                        <div className="flex justify-between items-start gap-3">
                            <div className="flex flex-col">
                                <span className="text-sm font-bold text-slate-800 line-clamp-2 leading-snug">{quiz.title}</span>
                                <p className="text-xs text-slate-500 mt-1 line-clamp-1">{quiz.description}</p>
                            </div>
                            <span className={`shrink-0 px-2.5 py-1 text-xs tracking-wide font-bold rounded-md ${quiz.status === 'Draft' ? 'bg-slate-100 text-slate-600' :
                                quiz.status === 'Available' ? 'bg-green-100 text-green-700' :
                                    quiz.status === 'Completed' ? 'bg-blue-100 text-blue-700 border border-blue-200' :
                                        'bg-yellow-100 text-yellow-700'
                                }`}>
                                {quiz.status}
                            </span>
                        </div>

                        {/* Timeline Column */}
                        <div className="flex flex-col gap-2 bg-slate-50 rounded-lg p-3 border border-slate-100">
                            <div className="flex items-center gap-2 text-xs text-slate-500">
                                <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                                <span className="truncate">Visible to students: <strong className="text-slate-700 font-medium">{new Date(quiz.publishDate).toLocaleString('en-GB', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}</strong></span>
                            </div>
                            <div className="flex items-center gap-2 text-xs text-slate-500">
                                <PlayCircle className="w-3.5 h-3.5 text-green-500 shrink-0" />
                                <span className="truncate">Opens for taking: <strong className="text-slate-700 font-medium">{new Date(quiz.startDate).toLocaleString('en-GB', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}</strong></span>
                            </div>
                            <div className="flex items-center gap-2 text-xs text-slate-500">
                                <CheckCircle2 className="w-3.5 h-3.5 text-red-400 shrink-0" />
                                <span className="truncate">Closes precisely: <strong className="text-slate-700 font-medium">{new Date(quiz.dueDate).toLocaleString('en-GB', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}</strong></span>
                            </div>
                        </div>

                        {/* Footer Row */}
                        <div className="pt-3 border-t border-slate-100 flex justify-between items-center mt-auto">
                            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-600 bg-slate-100 px-2.5 py-1 rounded-md">
                                <Clock className="w-3.5 h-3.5" />
                                Time Limit: {quiz.timeLimit}
                            </div>
                            <Link
                                href={`/teacher/classes/${subjectId}/quizzes/create?edit=${quiz.id}`}
                                className="text-sm font-bold text-slate-400 hover:text-purple-600 transition-colors flex items-center gap-1"
                            >
                                Edit ✎
                            </Link>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
