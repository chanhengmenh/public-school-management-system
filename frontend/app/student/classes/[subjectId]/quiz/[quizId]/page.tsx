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
  Send,
  Lock,
} from 'lucide-react';
import { useAuth } from '@/components/auth/AuthProvider';
import { assignmentsApi, submissionsApi, gradesApi } from '@/lib/api';
import { Grade } from '@/lib/api/grades';
import { Assignment, Submission } from '@/types/school.types';

function StatusBadge({ status }: { status: Assignment['status'] }) {
  const map: Record<Assignment['status'], { cls: string; label: string }> = {
    draft: { cls: 'bg-slate-100 text-slate-600', label: 'Draft' },
    published: { cls: 'bg-emerald-50 text-emerald-700', label: 'Open' },
    closed: { cls: 'bg-red-50 text-red-700', label: 'Closed' },
  };
  const { cls, label } = map[status];
  return (
    <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold ${cls}`}>
      {label}
    </span>
  );
}

export default function StudentQuizDetailPage() {
  const params = useParams();
  const subjectId = params.subjectId as string;
  const quizId = parseInt(params.quizId as string, 10);

  const { user } = useAuth();

  const [quiz, setQuiz] = useState<Assignment | null>(null);
  const [submission, setSubmission] = useState<Submission | null>(null);
  const [grade, setGrade] = useState<Grade | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [answer, setAnswer] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const loadData = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    setError(null);
    try {
      const [quizData, subsData] = await Promise.all([
        assignmentsApi.getById(quizId),
        submissionsApi.list({ assignment_id: quizId, student_id: user.id }),
      ]);
      setQuiz(quizData);

      const existingSub = subsData.length > 0 ? subsData[0] : null;
      setSubmission(existingSub);

      if (existingSub) {
        try {
          const gradesData = await gradesApi.list({ assignment_id: quizId });
          const myGrade = gradesData.find(g => g.submission_id === existingSub.id) ?? null;
          setGrade(myGrade);
        } catch {
          // grades may not be available yet; non-fatal
        }
      }
    } catch {
      setError('Failed to load quiz. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [quizId, user]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleSubmit = async () => {
    if (!quiz || !user) return;
    setSubmitError(null);
    if (!answer.trim()) {
      setSubmitError('Please write an answer before submitting.');
      return;
    }
    setSubmitting(true);
    try {
      const created = await submissionsApi.create({
        assignment_id: quiz.id,
        content: answer.trim(),
      });
      setSubmission(created);
      setSubmitSuccess(true);
      setAnswer('');
    } catch {
      setSubmitError('Failed to submit. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

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

  const isClosed = quiz.status === 'closed';
  const isDraft = quiz.status === 'draft';

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-6">
      {/* Back */}
      <Link
        href={`/student/classes/${subjectId}/quiz`}
        className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-slate-700 transition-colors"
      >
        <ChevronLeft className="h-4 w-4" />
        Back to Quizzes
      </Link>

      {/* Quiz Header */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-3 mb-1">
              <h1 className="text-2xl font-bold text-slate-900">{quiz.title}</h1>
              <StatusBadge status={quiz.status} />
            </div>
            {quiz.description && (
              <p className="text-slate-600 text-sm mt-2 leading-relaxed">{quiz.description}</p>
            )}
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-5 mt-4 text-sm text-slate-500 border-t border-slate-100 pt-4">
          <span>
            Max Score:{' '}
            <span className="font-semibold text-slate-800">{quiz.max_score}</span>
          </span>
          {quiz.due_date && (
            <span className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              Due:{' '}
              <span className="font-semibold text-slate-800">
                {new Date(quiz.due_date).toLocaleString()}
              </span>
            </span>
          )}
        </div>
      </div>

      {/* Closed message */}
      {isClosed && !submission && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-5 flex items-start gap-3">
          <Lock className="h-5 w-5 text-red-500 shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-red-700">This quiz is closed</p>
            <p className="text-sm text-red-600 mt-0.5">
              Submissions are no longer accepted for this quiz.
            </p>
          </div>
        </div>
      )}

      {/* Draft message */}
      {isDraft && !submission && (
        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-slate-400 shrink-0 mt-0.5" />
          <p className="text-sm text-slate-500">
            This quiz has not been published yet. Check back later.
          </p>
        </div>
      )}

      {/* Success toast */}
      {submitSuccess && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 flex items-center gap-3">
          <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" />
          <p className="text-emerald-700 font-medium text-sm">
            Your answer was submitted successfully!
          </p>
        </div>
      )}

      {/* Submitted: show submission details */}
      {submission ? (
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6 space-y-4">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-emerald-500" />
            <h2 className="font-bold text-slate-900">Your Submission</h2>
            {submission.is_late && (
              <span className="px-2 py-0.5 bg-red-50 text-red-600 text-xs font-semibold rounded-full">
                LATE
              </span>
            )}
          </div>

          <div>
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-1">
              Submitted At
            </p>
            <p className="text-sm text-slate-700">
              {new Date(submission.submitted_at).toLocaleString()}
            </p>
          </div>

          {submission.content && (
            <div>
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-1">
                Your Answer
              </p>
              <div className="bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-sm text-slate-700 whitespace-pre-wrap">
                {submission.content}
              </div>
            </div>
          )}

          {/* Grade result */}
          {grade ? (
            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4">
              <p className="text-xs font-medium text-emerald-700 uppercase tracking-wide mb-2">
                Grade
              </p>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold text-emerald-700">{grade.score}</span>
                <span className="text-sm text-emerald-600">/ {quiz.max_score}</span>
              </div>
              {grade.feedback && (
                <div className="mt-3">
                  <p className="text-xs font-medium text-emerald-700 uppercase tracking-wide mb-1">
                    Feedback
                  </p>
                  <p className="text-sm text-slate-700 bg-white rounded-lg px-3 py-2 border border-emerald-100">
                    {grade.feedback}
                  </p>
                </div>
              )}
              <p className="text-xs text-emerald-600 mt-2">
                Graded on {new Date(grade.graded_at).toLocaleDateString()}
              </p>
            </div>
          ) : (
            <div className="bg-slate-50 border border-slate-100 rounded-xl p-4 text-center text-sm text-slate-400">
              <Clock className="h-5 w-5 mx-auto mb-1" />
              Awaiting grading
            </div>
          )}
        </div>
      ) : quiz.status === 'published' ? (
        /* Submission Form */
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6 space-y-4">
          <h2 className="font-bold text-slate-900">Submit Your Answer</h2>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Your Answer <span className="text-red-500">*</span>
            </label>
            <textarea
              value={answer}
              onChange={e => setAnswer(e.target.value)}
              rows={8}
              placeholder="Write your answer here..."
              className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-orange-400 resize-none"
            />
          </div>
          {submitError && (
            <p className="text-sm text-red-600 flex items-center gap-1">
              <AlertCircle className="h-4 w-4" />
              {submitError}
            </p>
          )}
          <div className="flex justify-end">
            <button
              onClick={handleSubmit}
              disabled={submitting || !answer.trim()}
              className="flex items-center gap-2 px-6 py-2.5 bg-orange-500 text-white font-semibold rounded-xl hover:bg-orange-600 disabled:opacity-60 transition-colors"
            >
              {submitting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
              Submit Answer
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
