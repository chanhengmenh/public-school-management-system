'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Loader2, Plus, AlertCircle, Zap, X, Check } from 'lucide-react';
import { gradeCategoriesApi, assignmentsApi } from '@/lib/api';
import { GradeCategory, Assignment } from '@/types/school.types';

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

interface CreateQuizForm {
  title: string;
  description: string;
  due_date: string;
  max_score: string;
}

export default function TeacherQuizzesPage() {
  const params = useParams();
  const subjectId = parseInt(params.subjectId as string, 10);

  const [categories, setCategories] = useState<GradeCategory[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [showCreateForm, setShowCreateForm] = useState(false);
  const [form, setForm] = useState<CreateQuizForm>({
    title: '',
    description: '',
    due_date: '',
    max_score: '100',
  });
  const [formError, setFormError] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [cats, asns] = await Promise.all([
        gradeCategoriesApi.list({ class_subject_id: subjectId }),
        assignmentsApi.list({ class_subject_id: subjectId }),
      ]);
      setCategories(cats);
      setAssignments(asns);
    } catch {
      setError('Failed to load quizzes. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [subjectId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const quizCategories = categories.filter(c => c.name.toLowerCase().includes('quiz'));
  const quizAssignments = assignments.filter(a => a.is_quiz);

  const handleFormChange = (field: keyof CreateQuizForm, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const handleCreate = async () => {
    setFormError(null);
    if (!form.title.trim()) {
      setFormError('Title is required.');
      return;
    }
    const maxScore = parseFloat(form.max_score);
    if (isNaN(maxScore) || maxScore <= 0) {
      setFormError('Max score must be a positive number.');
      return;
    }

    setCreating(true);
    try {
      const created = await assignmentsApi.create({
        title: form.title.trim(),
        description: form.description.trim() || undefined,
        due_date: form.due_date || undefined,
        max_score: maxScore,
        class_subject_id: subjectId,
        category_id: quizCategories[0]?.id ?? null,
        is_quiz: true,
      });
      setAssignments(prev => [...prev, created]);
      setForm({ title: '', description: '', due_date: '', max_score: '100' });
      setShowCreateForm(false);
    } catch {
      setFormError('Failed to create quiz. Please try again.');
    } finally {
      setCreating(false);
    }
  };

  const handleCancelCreate = () => {
    setShowCreateForm(false);
    setForm({ title: '', description: '', due_date: '', max_score: '100' });
    setFormError(null);
  };

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-2 text-slate-500">
        <AlertCircle className="h-8 w-8 text-red-400" />
        <p>{error}</p>
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
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Quizzes</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            {quizAssignments.length} quiz{quizAssignments.length !== 1 ? 'zes' : ''}
            {quizCategories.length > 0 && ` in ${quizCategories.map(c => c.name).join(', ')}`}
          </p>
        </div>
        {!showCreateForm && (
          <button
            onClick={() => setShowCreateForm(true)}
            className="flex items-center gap-2 px-4 py-2 bg-orange-500 text-white font-semibold rounded-xl hover:bg-orange-600 transition-colors text-sm"
          >
            <Plus className="h-4 w-4" />
            New Quiz
          </button>
        )}
      </div>

      {/* Create Form */}
      {showCreateForm && (
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6">
          <h2 className="text-base font-bold text-slate-900 mb-4">New Quiz</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={form.title}
                onChange={e => handleFormChange('title', e.target.value)}
                placeholder="e.g. Quiz 1 – Chapter 3"
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
              <textarea
                value={form.description}
                onChange={e => handleFormChange('description', e.target.value)}
                placeholder="Optional description or instructions"
                rows={3}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 resize-none"
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Due Date</label>
                <input
                  type="datetime-local"
                  value={form.due_date}
                  onChange={e => handleFormChange('due_date', e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Max Score</label>
                <input
                  type="number"
                  min={1}
                  value={form.max_score}
                  onChange={e => handleFormChange('max_score', e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
                />
              </div>
            </div>
            {quizCategories.length > 0 && (
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <span>Category:</span>
                <span className="font-semibold text-slate-700">{quizCategories[0].name}</span>
                <span className="text-slate-400">({(quizCategories[0].weight * 100).toFixed(0)}%)</span>
              </div>
            )}
            {formError && (
              <p className="text-sm text-red-600 flex items-center gap-1">
                <AlertCircle className="h-4 w-4" />
                {formError}
              </p>
            )}
            <div className="flex gap-2 pt-1">
              <button
                onClick={handleCreate}
                disabled={creating}
                className="flex items-center gap-1.5 px-4 py-2 bg-orange-500 text-white text-sm font-medium rounded-lg hover:bg-orange-600 disabled:opacity-60 transition-colors"
              >
                {creating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                Create Quiz
              </button>
              <button
                onClick={handleCancelCreate}
                className="flex items-center gap-1.5 px-4 py-2 border border-slate-200 text-slate-600 text-sm font-medium rounded-lg hover:bg-slate-50 transition-colors"
              >
                <X className="h-4 w-4" />
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Quiz List */}
      {quizAssignments.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-10 text-center">
          <Zap className="h-10 w-10 text-slate-300 mx-auto mb-3" />
          <p className="text-slate-500">No quizzes yet. Click &ldquo;New Quiz&rdquo; to create one.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {quizAssignments.map(quiz => (
            <Link
              key={quiz.id}
              href={`/teacher/classes/${subjectId}/quizzes/${quiz.id}`}
              className="block bg-white border border-slate-200 rounded-2xl shadow-sm p-5 hover:border-orange-200 hover:shadow-md transition-all"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-4 min-w-0">
                  <div className="p-2.5 bg-orange-50 rounded-xl shrink-0">
                    <Zap className="h-5 w-5 text-orange-500" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-bold text-slate-900 truncate">{quiz.title}</h3>
                    {quiz.description && (
                      <p className="text-sm text-slate-500 mt-0.5 line-clamp-2">{quiz.description}</p>
                    )}
                    <div className="flex flex-wrap items-center gap-3 mt-2 text-xs text-slate-500">
                      <span>Max Score: <span className="font-semibold text-slate-700">{quiz.max_score}</span></span>
                      {quiz.due_date && (
                        <span>
                          Due:{' '}
                          <span className="font-semibold text-slate-700">
                            {new Date(quiz.due_date).toLocaleString()}
                          </span>
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="shrink-0">
                  <StatusBadge status={quiz.status} />
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
