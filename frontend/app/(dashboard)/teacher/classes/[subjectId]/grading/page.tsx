'use client';

import React, { useState } from 'react';
import {
    FileText, FileCheck, CheckCircle2, AlertCircle,
    ArrowLeft, Save, Eye
} from 'lucide-react';
import { useParams } from 'next/navigation';

// --- Type Definitions ---
type AssessmentType = 'Assignment' | 'Quiz';

interface Assessment {
    id: string;
    title: string;
    type: AssessmentType;
    dueDate: string;
    maxScore: number;
    totalStudents: number;
    submittedCount: number;
    gradedCount: number;
}

interface StudentSubmission {
    id: string;
    name: string;
    avatar: string;
    status: 'Submitted' | 'Missing' | 'Graded';
    score: number | null;
    feedback: string;
    submittedAt?: string;
}

// --- Dummy Data ---
const ASSESSMENTS_DATA: Assessment[] = [
    {
        id: 'a1',
        title: 'Chapter 4 Physics Problems',
        type: 'Assignment',
        dueDate: '2025-05-20T23:59',
        maxScore: 100,
        totalStudents: 32,
        submittedCount: 28,
        gradedCount: 10
    },
    {
        id: 'q1',
        title: 'Mid-Term Physics Assessment',
        type: 'Quiz',
        dueDate: '2025-05-21T10:30',
        maxScore: 50,
        totalStudents: 32,
        submittedCount: 30,
        gradedCount: 30
    },
    {
        id: 'a2',
        title: 'Newton\'s Laws Lab Report',
        type: 'Assignment',
        dueDate: '2025-05-17T23:59',
        maxScore: 80,
        totalStudents: 32,
        submittedCount: 32,
        gradedCount: 0
    }
];

const INITIAL_SUBMISSIONS: StudentSubmission[] = [
    { id: 's1', name: 'Alex Johnson', avatar: 'AJ', status: 'Graded', score: 95, feedback: 'Excellent work on the derivations.', submittedAt: '2025-05-19T14:30' },
    { id: 's2', name: 'Maria Garcia', avatar: 'MG', status: 'Submitted', score: null, feedback: '', submittedAt: '2025-05-20T09:15' },
    { id: 's3', name: 'James Smith', avatar: 'JS', status: 'Submitted', score: null, feedback: '', submittedAt: '2025-05-20T16:45' },
    { id: 's4', name: 'Linda Choo', avatar: 'LC', status: 'Missing', score: null, feedback: '' },
    { id: 's5', name: 'Robert Fox', avatar: 'RF', status: 'Submitted', score: null, feedback: '', submittedAt: '2025-05-20T21:10' },
];

export default function GradingWorkspace() {
    const params = useParams();
    const subjectId = params?.subjectId as string;

    // --- State Management ---
    const [selectedAssessment, setSelectedAssessment] = useState<Assessment | null>(null);
    const [filterType, setFilterType] = useState<'All' | 'Assignments' | 'Quizzes'>('All');
    const [submissions, setSubmissions] = useState<StudentSubmission[]>(INITIAL_SUBMISSIONS);

    // --- Derived Data ---
    const filteredAssessments = ASSESSMENTS_DATA.filter(assessment => {
        if (filterType === 'Assignments' && assessment.type !== 'Assignment') return false;
        if (filterType === 'Quizzes' && assessment.type !== 'Quiz') return false;
        return true;
    });

    // --- Handlers ---
    const handleScoreChange = (id: string, newScore: string, maxScore: number) => {
        let parsedScore = parseInt(newScore);
        if (isNaN(parsedScore)) parsedScore = 0;
        if (parsedScore > maxScore) parsedScore = maxScore;
        if (parsedScore < 0) parsedScore = 0;

        setSubmissions(prev => prev.map(sub =>
            sub.id === id ? { ...sub, score: newScore === '' ? null : parsedScore, status: 'Graded' } : sub
        ));
    };

    const handleFeedbackChange = (id: string, feedback: string) => {
        setSubmissions(prev => prev.map(sub =>
            sub.id === id ? { ...sub, feedback } : sub
        ));
    };

    const handleSaveAllGrades = () => {
        alert('All grades saved successfully!');
        setSelectedAssessment(null);
    };

    // --- Views ---

    // View 1: Grading Inbox
    const renderInbox = () => (
        <div className="flex flex-col space-y-8 animate-in fade-in duration-300">
            {/* Top Bar */}
            <div className="flex items-center gap-4 bg-white p-4 rounded-2xl shadow-sm border border-slate-200">
                <span className="text-sm font-bold text-slate-500">Filter by:</span>
                <select
                    value={filterType}
                    onChange={(e) => setFilterType(e.target.value as 'All' | 'Assignments' | 'Quizzes')}
                    className="bg-white border border-slate-200 rounded-xl px-4 py-2 text-sm font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 cursor-pointer appearance-none bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20width%3D%2224%22%20height%3D%2224%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cpath%20d%3D%22M7%2010L12%2015L17%2010%22%20stroke%3D%22%2364748B%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%2F%3E%3C%2Fsvg%3E')] bg-[length:20px] bg-[right_8px_center] bg-no-repeat pr-10"
                >
                    <option value="All">All</option>
                    <option value="Assignments">Assignments</option>
                    <option value="Quizzes">Quizzes</option>
                </select>
            </div>

            {/* List Layout */}
            <div className="flex flex-col gap-4">
                {filteredAssessments.map(assessment => (
                    <div key={assessment.id} className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm flex items-center gap-5 hover:shadow-md transition-shadow">
                        {/* Icon */}
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${assessment.type === 'Assignment' ? 'bg-blue-100 text-blue-600' : 'bg-purple-100 text-purple-600'}`}>
                            {assessment.type === 'Assignment' ? <FileText className="w-5 h-5" /> : <FileCheck className="w-5 h-5" />}
                        </div>

                        {/* Info */}
                        <div className="flex-1 min-w-0 flex flex-col">
                            <div className="flex items-center gap-2">
                                <h3 className="text-sm font-bold text-slate-900 truncate">{assessment.title}</h3>
                                <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] uppercase font-bold tracking-wider border shrink-0 ${assessment.type === 'Assignment' ? 'bg-blue-50 text-blue-700 border-blue-200' : 'bg-purple-50 text-purple-700 border-purple-200'}`}>
                                    {assessment.type}
                                </span>
                            </div>
                            <div className="flex items-center gap-4 mt-1.5 text-xs text-slate-500">
                                <span>Due: <strong className="text-slate-700">{new Date(assessment.dueDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}</strong></span>
                                <span>Submitted: <strong className="text-slate-700">{assessment.submittedCount}/{assessment.totalStudents}</strong></span>
                                <span>Needs Grading: <strong className="text-orange-500">{assessment.submittedCount - assessment.gradedCount}</strong></span>
                            </div>
                        </div>

                        {/* Action */}
                        <button
                            onClick={() => setSelectedAssessment(assessment)}
                            className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl text-sm font-bold shadow-sm shadow-indigo-500/20 transition-all flex items-center gap-2 active:scale-95 shrink-0"
                        >
                            Grade Submissions
                        </button>
                    </div>
                ))}

                {filteredAssessments.length === 0 && (
                    <div className="py-12 flex flex-col items-center justify-center text-center bg-white border border-slate-200 border-dashed rounded-2xl">
                        <CheckCircle2 className="w-12 h-12 text-slate-300 mb-3" />
                        <h3 className="text-lg font-bold text-slate-900 mb-1">All Caught Up!</h3>
                        <p className="text-sm text-slate-500">No assessments match your current filter.</p>
                    </div>
                )}
            </div>
        </div>
    );

    // View 2: Grading Table
    const renderGradingTable = () => {
        if (!selectedAssessment) return null;

        return (
            <div className="flex flex-col space-y-6 animate-in slide-in-from-right-4 duration-300">
                {/* Header Bar */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-4 lg:px-6 rounded-2xl shadow-sm border border-slate-200">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => setSelectedAssessment(null)}
                            className="p-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors flex items-center justify-center shrink-0"
                        >
                            <ArrowLeft className="w-5 h-5" />
                        </button>
                        <div className="flex flex-col">
                            <div className="flex items-center gap-2">
                                <h1 className="text-xl font-bold text-slate-900">Grading: {selectedAssessment.title}</h1>
                                <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded text-xs font-bold border border-slate-200">
                                    Out of {selectedAssessment.maxScore} pts
                                </span>
                            </div>
                            <span className="text-sm text-slate-500">
                                {submissions.filter(s => s.status === 'Graded').length} of {submissions.filter(s => s.status !== 'Missing').length} submissions graded
                            </span>
                        </div>
                    </div>

                    <button
                        onClick={handleSaveAllGrades}
                        className="bg-slate-900 hover:bg-slate-800 text-white px-6 py-2.5 rounded-xl text-sm font-bold shadow-md transition-all flex items-center gap-2 active:scale-95 w-full md:w-auto justify-center"
                    >
                        <Save className="w-4 h-4" /> Save All Grades
                    </button>
                </div>

                {/* The Table UI */}
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse min-w-[800px]">
                            <thead>
                                <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 text-xs uppercase tracking-wider font-bold">
                                    <th className="p-4 pl-6">Student Name</th>
                                    <th className="p-4">Status</th>
                                    <th className="p-4">View Work</th>
                                    <th className="p-4 text-center">Score</th>
                                    <th className="p-4 pr-6">Feedback</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {submissions.map((student) => (
                                    <tr key={student.id} className="hover:bg-slate-50/50 transition-colors group">
                                        {/* Student */}
                                        <td className="p-4 pl-6">
                                            <div className="flex items-center gap-3">
                                                <div className="w-9 h-9 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-sm font-bold shrink-0 border border-indigo-200">
                                                    {student.avatar}
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="text-sm font-bold text-slate-900">{student.name}</span>
                                                    {student.submittedAt && (
                                                        <span className="text-xs text-slate-500">
                                                            {new Date(student.submittedAt).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </td>

                                        {/* Status */}
                                        <td className="p-4">
                                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold border ${student.status === 'Graded' ? 'bg-slate-100 text-slate-600 border-slate-200' :
                                                student.status === 'Submitted' ? 'bg-green-50 text-green-700 border-green-200' :
                                                    'bg-red-50 text-red-700 border-red-200'
                                                }`}>
                                                {student.status === 'Graded' && <CheckCircle2 className="w-3.5 h-3.5" />}
                                                {student.status === 'Missing' && <AlertCircle className="w-3.5 h-3.5" />}
                                                {student.status}
                                            </span>
                                        </td>

                                        {/* View Work */}
                                        <td className="p-4">
                                            {student.status !== 'Missing' ? (
                                                <button className="text-xs font-bold text-indigo-600 hover:text-indigo-800 transition-colors flex items-center gap-1.5 bg-indigo-50 hover:bg-indigo-100 px-3 py-1.5 rounded-lg">
                                                    <Eye className="w-3.5 h-3.5" />
                                                    {selectedAssessment.type === 'Assignment' ? 'View File' : 'View Answers'}
                                                </button>
                                            ) : (
                                                <span className="text-xs font-medium text-slate-400 italic">No submission</span>
                                            )}
                                        </td>

                                        {/* Score */}
                                        <td className="p-4">
                                            <div className="flex items-center justify-center gap-2">
                                                <input
                                                    type="number"
                                                    value={student.score !== null ? student.score : ''}
                                                    onChange={(e) => handleScoreChange(student.id, e.target.value, selectedAssessment.maxScore)}
                                                    disabled={student.status === 'Missing'}
                                                    max={selectedAssessment.maxScore}
                                                    min="0"
                                                    className={`w-20 px-2 py-2 border rounded-lg text-center font-bold text-sm transition-all focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 hide-arrows ${student.status === 'Missing'
                                                        ? 'bg-slate-100 border-slate-200 text-slate-400 cursor-not-allowed'
                                                        : 'bg-white border-slate-300 text-slate-900 shadow-sm'
                                                        }`}
                                                />
                                                <span className="text-sm font-bold text-slate-400">/ {selectedAssessment.maxScore}</span>
                                            </div>
                                        </td>

                                        {/* Feedback */}
                                        <td className="p-4 pr-6">
                                            <input
                                                type="text"
                                                placeholder={student.status === 'Missing' ? "Cannot add feedback for missing work" : "Add private comment..."}
                                                value={student.feedback}
                                                onChange={(e) => handleFeedbackChange(student.id, e.target.value)}
                                                disabled={student.status === 'Missing'}
                                                className={`w-full px-4 py-2 border rounded-lg text-sm transition-all focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 ${student.status === 'Missing'
                                                    ? 'bg-slate-50 border-slate-200 text-slate-400 cursor-not-allowed placeholder:text-slate-300'
                                                    : 'bg-white border-slate-200 text-slate-800 shadow-sm placeholder:text-slate-400 focus:bg-white'
                                                    }`}
                                            />
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="flex flex-col w-full">
            {selectedAssessment === null ? renderInbox() : renderGradingTable()}
        </div>
    );
}