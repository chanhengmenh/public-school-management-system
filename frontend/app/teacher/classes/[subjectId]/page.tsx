"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Loader2, Plus, Trash2, Send, AlertCircle, X, Users } from "lucide-react";
import { assignmentsApi, gradeCategoriesApi } from "@/lib/api";
import { Assignment, GradeCategory } from "@/types/school.types";

interface NewAssignmentForm {
  title: string;
  description: string;
  due_date: string;
  max_score: number;
  category_id: string;
  submission_type: 'text' | 'file' | 'both';
}

const EMPTY_FORM: NewAssignmentForm = {
  title: "",
  description: "",
  due_date: "",
  max_score: 100,
  category_id: "",
  submission_type: "text",
};

function StatusBadge({ status }: { status: Assignment["status"] }) {
  const styles: Record<Assignment["status"], string> = {
    draft: "bg-slate-100 text-slate-600 border-slate-200",
    published: "bg-emerald-50 text-emerald-700 border-emerald-200",
    closed: "bg-red-50 text-red-700 border-red-200",
  };
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border capitalize ${styles[status]}`}
    >
      {status}
    </span>
  );
}

function formatDueDate(dateStr?: string): string {
  if (!dateStr) return "—";
  const d = new Date(dateStr);
  return d.toLocaleString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function TeacherSubjectPage() {
  const params = useParams();
  const subjectId = parseInt(params.subjectId as string, 10);

  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [categories, setCategories] = useState<GradeCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<NewAssignmentForm>(EMPTY_FORM);
  const [formError, setFormError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const [publishingId, setPublishingId] = useState<number | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [asns, cats] = await Promise.all([
        assignmentsApi.list({ class_subject_id: subjectId }),
        gradeCategoriesApi.list({ class_subject_id: subjectId }),
      ]);
      setAssignments(asns);
      setCategories(cats);
    } catch {
      setError("Failed to load assignments.");
    } finally {
      setLoading(false);
    }
  }, [subjectId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  function handleFormChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setFormError(null);

    if (!form.title.trim()) {
      setFormError("Title is required.");
      return;
    }

    setSaving(true);
    try {
      const payload: Partial<Assignment> = {
        class_subject_id: subjectId,
        title: form.title.trim(),
        description: form.description.trim() || undefined,
        due_date: form.due_date || undefined,
        max_score: Number(form.max_score),
        category_id: form.category_id ? parseInt(form.category_id, 10) : null,
        submission_type: form.submission_type,
      };
      const created = await assignmentsApi.create(payload);
      setAssignments((prev) => [created, ...prev]);
      setForm(EMPTY_FORM);
      setShowForm(false);
    } catch {
      setFormError("Failed to create assignment. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  async function handlePublish(id: number) {
    setPublishingId(id);
    try {
      const updated = await assignmentsApi.publish(id);
      setAssignments((prev) => prev.map((a) => (a.id === id ? updated : a)));
    } catch {
      alert("Failed to publish assignment.");
    } finally {
      setPublishingId(null);
    }
  }

  async function handleDelete(id: number) {
    if (!confirm("Delete this assignment? This action cannot be undone.")) return;
    setDeletingId(id);
    try {
      await assignmentsApi.delete(id);
      setAssignments((prev) => prev.filter((a) => a.id !== id));
    } catch {
      alert("Failed to delete assignment.");
    } finally {
      setDeletingId(null);
    }
  }

  function getCategoryName(categoryId?: number | null): string {
    if (!categoryId) return "—";
    const cat = categories.find((c) => c.id === categoryId);
    return cat ? cat.name : "—";
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[300px]">
        <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-3 text-slate-500">
        <AlertCircle className="h-8 w-8 text-red-400" />
        <p className="text-sm">{error}</p>
        <button
          onClick={loadData}
          className="text-sm text-orange-600 hover:underline"
        >
          Try again
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Assignments</h1>
          <p className="text-slate-500 text-sm mt-0.5">
            {assignments.length} assignment{assignments.length !== 1 ? "s" : ""} total
          </p>
        </div>
        {!showForm && (
          <button
            onClick={() => {
              setShowForm(true);
              setFormError(null);
            }}
            className="flex items-center gap-2 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white text-sm font-medium rounded-xl transition-colors shadow-sm"
          >
            <Plus className="h-4 w-4" />
            New Assignment
          </button>
        )}
      </div>

      {/* Create form */}
      {showForm && (
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-semibold text-slate-900">New Assignment</h2>
            <button
              onClick={() => {
                setShowForm(false);
                setForm(EMPTY_FORM);
                setFormError(null);
              }}
              className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <form onSubmit={handleCreate} className="space-y-4">
            {/* Title */}
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="title"
                value={form.title}
                onChange={handleFormChange}
                placeholder="e.g. Midterm Exam"
                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent"
                required
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Description
              </label>
              <textarea
                name="description"
                value={form.description}
                onChange={handleFormChange}
                placeholder="Assignment instructions (optional)"
                rows={3}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent resize-none"
              />
            </div>

            {/* Due date + Max score */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Due Date
                </label>
                <input
                  type="datetime-local"
                  name="due_date"
                  value={form.due_date}
                  onChange={handleFormChange}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Max Score
                </label>
                <input
                  type="number"
                  name="max_score"
                  value={form.max_score}
                  onChange={handleFormChange}
                  min={1}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent"
                />
              </div>
            </div>

            {/* Submission type */}
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-2">
                Submission Type <span className="text-red-500">*</span>
              </label>
              <div className="flex gap-3">
                {(["text", "file", "both"] as const).map((t) => {
                  const labels = { text: "Text only", file: "File upload only", both: "Text + File" };
                  return (
                    <label
                      key={t}
                      className={`flex items-center gap-2 px-3 py-2 rounded-xl border text-sm cursor-pointer transition-colors ${
                        form.submission_type === t
                          ? "border-orange-400 bg-orange-50 text-orange-700 font-medium"
                          : "border-slate-200 text-slate-600 hover:bg-slate-50"
                      }`}
                    >
                      <input
                        type="radio"
                        name="submission_type"
                        value={t}
                        checked={form.submission_type === t}
                        onChange={handleFormChange}
                        className="sr-only"
                      />
                      {labels[t]}
                    </label>
                  );
                })}
              </div>
            </div>

            {/* Category */}
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Category
              </label>
              <select
                name="category_id"
                value={form.category_id}
                onChange={handleFormChange}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent bg-white"
              >
                <option value="">— No category —</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name} ({(cat.weight * 100).toFixed(0)}%)
                  </option>
                ))}
              </select>
            </div>

            {formError && (
              <p className="text-xs text-red-600 flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                {formError}
              </p>
            )}

            <div className="flex items-center gap-3 pt-1">
              <button
                type="submit"
                disabled={saving}
                className="flex items-center gap-2 px-4 py-2 bg-orange-500 hover:bg-orange-600 disabled:opacity-60 text-white text-sm font-medium rounded-xl transition-colors"
              >
                {saving ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Plus className="h-4 w-4" />
                )}
                Save Assignment
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowForm(false);
                  setForm(EMPTY_FORM);
                  setFormError(null);
                }}
                className="px-4 py-2 text-sm font-medium text-slate-600 border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Assignments table */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        {assignments.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <AlertCircle className="h-10 w-10 text-slate-300 mb-3" />
            <p className="text-slate-900 font-medium">No assignments yet</p>
            <p className="text-slate-500 text-sm mt-1">
              Click "New Assignment" to create your first one.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  <th className="px-6 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Title
                  </th>
                  <th className="px-6 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Category
                  </th>
                  <th className="px-6 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Due Date
                  </th>
                  <th className="px-6 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">
                    Max Score
                  </th>
                  <th className="px-6 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {assignments.map((asn) => (
                  <tr key={asn.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4">
                      <p className="font-medium text-slate-900 text-sm">{asn.title}</p>
                      {asn.description && (
                        <p className="text-slate-400 text-xs mt-0.5 truncate max-w-xs">
                          {asn.description}
                        </p>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600">
                      {getCategoryName(asn.category_id)}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600">
                      {formatDueDate(asn.due_date)}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-700 text-right font-medium">
                      {asn.max_score}
                    </td>
                    <td className="px-6 py-4">
                      {(() => {
                        const typeStyles: Record<string, string> = {
                          text: "bg-blue-50 text-blue-700 border-blue-200",
                          file: "bg-purple-50 text-purple-700 border-purple-200",
                          both: "bg-teal-50 text-teal-700 border-teal-200",
                        };
                        const typeLabels: Record<string, string> = {
                          text: "Text",
                          file: "File",
                          both: "Both",
                        };
                        const t = asn.submission_type ?? "text";
                        return (
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${typeStyles[t] ?? typeStyles.text}`}>
                            {typeLabels[t] ?? t}
                          </span>
                        );
                      })()}
                    </td>
                    <td className="px-6 py-4">
                      <StatusBadge status={asn.status} />
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        {asn.status !== "draft" && (
                          <Link
                            href={`/teacher/classes/${subjectId}/submissions/${asn.id}`}
                            title="View Submissions"
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 hover:bg-slate-100 text-slate-600 text-xs font-medium rounded-lg border border-slate-200 transition-colors"
                          >
                            <Users className="h-3 w-3" />
                            Submissions
                          </Link>
                        )}
                        {asn.status === "draft" && (
                          <button
                            onClick={() => handlePublish(asn.id)}
                            disabled={publishingId === asn.id}
                            title="Publish"
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-xs font-medium rounded-lg border border-emerald-200 disabled:opacity-60 transition-colors"
                          >
                            {publishingId === asn.id ? (
                              <Loader2 className="h-3 w-3 animate-spin" />
                            ) : (
                              <Send className="h-3 w-3" />
                            )}
                            Publish
                          </button>
                        )}
                        <button
                          onClick={() => handleDelete(asn.id)}
                          disabled={deletingId === asn.id}
                          title="Delete"
                          className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-60"
                        >
                          {deletingId === asn.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Trash2 className="h-4 w-4" />
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
