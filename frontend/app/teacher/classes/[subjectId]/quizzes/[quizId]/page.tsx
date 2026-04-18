'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import {
  Loader2,
  AlertCircle,
  ChevronLeft,
  CheckCircle2,
  Clock,
  MessageSquare,
} from 'lucide-react';
import { assignmentsApi, submissionsApi, gradesApi } from '@/lib/api';
import { Grade } from '@/lib/api/grades';
import { Assignment, Submission } from '@/types/school.types';

interface GradeFormState {
  score: string;
  feedback: string;
}

function StatusBadge({ status }: { status: Assignment['status'] }) {
  const map: Record<Assignment['status'], string> = {
    draft: 'bg-slate-100 text-slate-600',
    published: 'bg-emerald-50 text-emerald-700',
    closed: 'bg-red-50 text-red-700',
  };
  return (
    <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold capitalize ${map[status]}`}>
      {status}
    </span>
  );
}

export default function TeacherQuizDetailPage() {
  const params = useParams();
  const subjectId = parseInt(params.subjectId as string, 10);
  const quizId = parseInt(params.quizId as string, 10);

  const [quiz, setQuiz] = useState<Assignment | null>(null);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [grades, setGrades] = useState<Grade[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // grading state: which submission is being graded
  const [gradingId, setGradingId] = useState<number | null>(null);
  const [gradeForm, setGradeForm] = useState<GradeFormState>({ score: '', feedback: '' });
  const [gradeFormError, setGradeFormError] = useState<string | null>(null);
  const [submittingGrade, setSubmittingGrade] = useState(false);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [quizData, subsData, gradesData] = await Promise.all([
        assignmentsApi.getById(quizId),
        submissionsApi.list({ assignment_id: quizId }),
        gradesApi.list({ assignment_id: quizId }),
      ]);
      setQuiz(quizData);
      setSubmissions(subsData);
      setGrades(gradesData);
    } catch {
      setError('Failed to load quiz details. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [quizId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const getGradeForSubmission = (submissionId: number): Grade | undefined =>
    grades.find(g => g.submission_id === submissionId);

  const openGradeForm = (submission: Submission) => {
    const existing = getGradeForSubmission(submission.id);
    setGradingId(submission.id);
    setGradeForm({
      score: existing ? String(existing.score) : '',
      feedback: existing?.feedback ?? '',
    });
    setGradeFormError(null);
  };

  const handleGradeSubmit = async (submission: Submission) => {
    setGradeFormError(null);
    const scoreNum = parseFloat(gradeForm.score);
    if (isNaN(scoreNum) || scoreNum < 0) {
      setGradeFormError('Score must be a non-negative number.');
      return;
    }
    if (quiz && scoreNum > quiz.max_score) {
      setGradeFormError(`Score cannot exceed max score (${quiz.max_score}).`);
      return;
    }

    setSubmittingGrade(true);
    try {
      const existing = getGradeForSubmission(submission.id);
      let result: Grade;
      if (existing) {
        result = await gradesApi.update(existing.id, {
          score: scoreNum,
          feedback: gradeForm.feedback.trim() || undefined,
        });
        setGrades(prev => prev.map(g => g.id === existing.id ? result : g));
      } else {
        result = await gradesApi.create({
          submission_id: submission.id,
          score: scoreNum,
          feedback: gradeForm.feedback.trim() || undefined,
        });
        setGrades(prev => [...prev, result]);
      }
      setGradingId(null);
    } catch {
      setGradeFormError('Failed to save grade. Please try again.');
    } finally {
      setSubmittingGrade(false);
    }
  };

  const totalSubmissions = submissions.length;
  const gradedCount = submissions.filter(s => getGradeForSubmission(s.id) !== undefined).length;
  const pendingCount = totalSubmissions - gradedCount;

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
      </div>
    );
  }

  if (error || !quiz) {
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-2 text-slate-500">
        <AlertCircle className="h-8 w-8 text-red-400" />
        <p>{error ?? 'Quiz not found.'}</p>
        <button
          onClick={loadData}
          className="mt-2 px-4 py-2 bg-orange-500 text-white rounded-lg text-sm hover:bg-orange-600 transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-6">
      {/* Back link */}
      <Link
        href={`/teacher/classes/${subjectId}/quizzes`}
        className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-slate-700 transition-colors"
      >
        <ChevronLeft className="h-4 w-4" />
        Back to Quizzes
      </Link>

      {/* Quiz Header */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h1 className="text-2xl font-bold text-slate-900">{quiz.title}</h1>
              <StatusBadge status={quiz.status} />
            </div>
            {quiz.description && (
              <p className="text-slate-500 text-sm mt-1">{quiz.description}</p>
            )}
            <div className="flex flex-wrap items-center gap-4 mt-3 text-sm text-slate-500">
              <span>
                Max Score:{' '}
                <span className="font-semibold text-slate-800">{quiz.max_score}</span>
              </span>
              {quiz.due_date && (
                <span className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  Due: <span className="font-semibold text-slate-800">{new Date(quiz.due_date).toLocaleString()}</span>
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Total Submissions', value: totalSubmissions, color: 'text-slate-700', bg: 'bg-white' },
          { label: 'Graded', value: gradedCount, color: 'text-emerald-700', bg: 'bg-emerald-50' },
          { label: 'Pending', value: pendingCount, color: 'text-orange-700', bg: 'bg-orange-50' },
        ].map(stat => (
          <div key={stat.label} className={`${stat.bg} border border-slate-200 rounded-2xl shadow-sm p-5 text-center`}>
            <p className={`text-3xl font-bold ${stat.color}`}>{stat.value}</p>
            <p className="text-sm text-slate-500 mt-1">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Submissions Table */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100">
          <h2 className="font-bold text-slate-900">Submissions</h2>
        </div>

        {submissions.length === 0 ? (
          <div className="px-6 py-10 text-center text-slate-400 text-sm">
            No submissions yet for this quiz.
          </div>
        ) : (
          <div className="divide-y divide-slate-50">
            {submissions.map(sub => {
              const grade = getGradeForSubmission(sub.id);
              const isGrading = gradingId === sub.id;

              return (
                <div key={sub.id} className="px-6 py-4">
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    {/* Left: student info + content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <span className="font-semibold text-slate-800 text-sm">
                          Student #{sub.student_id}
                        </span>
                        {sub.is_late && (
                          <span className="px-2 py-0.5 bg-red-50 text-red-600 text-xs font-semibold rounded-full">
                            LATE
                          </span>
                        )}
                        <span className="text-xs text-slate-400">
                          {new Date(sub.submitted_at).toLocaleString()}
                        </span>
                      </div>
                      {sub.content && (
                        <p className="text-sm text-slate-600 bg-slate-50 rounded-lg px-3 py-2 mt-1 line-clamp-3">
                          {sub.content}
                        </p>
                      )}
                    </div>

                    {/* Right: grade display or grade button */}
                    <div className="shrink-0">
                      {grade && !isGrading ? (
                        <div className="flex items-center gap-2">
                          <div className="text-right">
                            <div className="flex items-center gap-1.5 justify-end">
                              <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                              <span className="font-bold text-slate-800 text-lg">
                                {grade.score}
                                <span className="text-sm font-normal text-slate-400">/{quiz.max_score}</span>
                              </span>
                            </div>
                            {grade.feedback && (
                              <p className="text-xs text-slate-400 flex items-center gap-1 mt-0.5 justify-end">
                                <MessageSquare className="h-3 w-3" />
                                Has feedback
                              </p>
                            )}
                          </div>
                          <button
                            onClick={() => openGradeForm(sub)}
                            className="px-3 py-1.5 border border-slate-200 text-slate-600 text-xs font-medium rounded-lg hover:bg-slate-50 transition-colors"
                          >
                            Edit
                          </button>
                        </div>
                      ) : !isGrading ? (
                        <button
                          onClick={() => openGradeForm(sub)}
                          className="px-4 py-2 bg-orange-500 text-white text-sm font-semibold rounded-xl hover:bg-orange-600 transition-colors"
                        >
                          Grade
                        </button>
                      ) : null}
                    </div>
                  </div>

                  {/* Inline Grade Form */}
                  {isGrading && (
                    <div className="mt-3 bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3">
                      <p className="text-sm font-semibold text-slate-700">
                        {getGradeForSubmission(sub.id) ? 'Update Grade' : 'Grade Submission'}
                      </p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-medium text-slate-600 mb-1">
                            Score (0–{quiz.max_score}) <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="number"
                            min={0}
                            max={quiz.max_score}
                            value={gradeForm.score}
                            onChange={e => setGradeForm(prev => ({ ...prev, score: e.target.value }))}
                            className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
                            placeholder={`0–${quiz.max_score}`}
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-slate-600 mb-1">
                            Feedback (optional)
                          </label>
                          <textarea
                            value={gradeForm.feedback}
                            onChange={e => setGradeForm(prev => ({ ...prev, feedback: e.target.value }))}
                            rows={2}
                            className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 resize-none"
                            placeholder="Optional feedback for the student"
                          />
                        </div>
                      </div>
                      {gradeFormError && (
                        <p className="text-xs text-red-600 flex items-center gap-1">
                          <AlertCircle className="h-3.5 w-3.5" />
                          {gradeFormError}
                        </p>
                      )}
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleGradeSubmit(sub)}
                          disabled={submittingGrade}
                          className="flex items-center gap-1.5 px-4 py-2 bg-orange-500 text-white text-sm font-medium rounded-lg hover:bg-orange-600 disabled:opacity-60 transition-colors"
                        >
                          {submittingGrade ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <CheckCircle2 className="h-4 w-4" />
                          )}
                          Save Grade
                        </button>
                        <button
                          onClick={() => setGradingId(null)}
                          disabled={submittingGrade}
                          className="px-4 py-2 border border-slate-200 text-slate-600 text-sm font-medium rounded-lg hover:bg-slate-50 disabled:opacity-60 transition-colors"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
