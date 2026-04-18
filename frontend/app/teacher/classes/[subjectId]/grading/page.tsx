'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'next/navigation';
import { Loader2, Plus, Pencil, Trash2, Check, X, AlertCircle } from 'lucide-react';
import { gradeCategoriesApi, assignmentsApi } from '@/lib/api';
import { GradeCategory, Assignment } from '@/types/school.types';

// ─── helpers ─────────────────────────────────────────────────────────────────

function totalWeight(cats: GradeCategory[]) {
  return cats.reduce((s, c) => s + c.weight, 0);
}

function weightLabel(w: number) {
  return `${(w * 100).toFixed(0)}%`;
}

function TotalWeightBadge({ cats }: { cats: GradeCategory[] }) {
  const total = totalWeight(cats);
  const pct = (total * 100).toFixed(0);
  const color =
    total > 1.001 ? 'text-red-600 bg-red-50 border-red-200'
    : total >= 0.999 ? 'text-emerald-700 bg-emerald-50 border-emerald-200'
    : 'text-amber-700 bg-amber-50 border-amber-200';
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full border text-xs font-semibold ${color}`}>
      Total: {pct}%
      {total > 1.001 && <AlertCircle size={12} />}
    </span>
  );
}

// ─── main component ──────────────────────────────────────────────────────────

export default function TeacherGradingPage() {
  const params = useParams();
  const subjectId = parseInt(params.subjectId as string, 10);

  const [categories, setCategories] = useState<GradeCategory[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // form state — add new category
  const [showAddForm, setShowAddForm] = useState(false);
  const [newName, setNewName] = useState('');
  const [newWeight, setNewWeight] = useState('');
  const [addError, setAddError] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);

  // edit state — inline edit
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editName, setEditName] = useState('');
  const [editWeight, setEditWeight] = useState('');
  const [editError, setEditError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  // assignment category assignment
  const [assigningSaving, setAssigningSaving] = useState<number | null>(null);

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
      setError('Failed to load data.');
    } finally {
      setLoading(false);
    }
  }, [subjectId]);

  useEffect(() => { loadData(); }, [loadData]);

  // ── add category ──────────────────────────────────────────────────────────

  const handleAdd = async () => {
    setAddError(null);
    const w = parseFloat(newWeight) / 100;
    if (!newName.trim()) { setAddError('Name is required.'); return; }
    if (isNaN(w) || w <= 0 || w > 1) { setAddError('Weight must be between 1 and 100.'); return; }
    const projected = totalWeight(categories) + w;
    if (projected > 1.0001) {
      setAddError(`Adding ${weightLabel(w)} would exceed 100% (currently ${weightLabel(totalWeight(categories))}).`);
      return;
    }
    setAdding(true);
    try {
      const res = await gradeCategoriesApi.create({ class_subject_id: subjectId, name: newName.trim(), weight: w });
      setCategories(prev => [...prev, res]);
      setNewName('');
      setNewWeight('');
      setShowAddForm(false);
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail;
      setAddError(msg ?? 'Failed to create category.');
    } finally {
      setAdding(false);
    }
  };

  // ── edit category ─────────────────────────────────────────────────────────

  const startEdit = (cat: GradeCategory) => {
    setEditingId(cat.id);
    setEditName(cat.name);
    setEditWeight(String((cat.weight * 100).toFixed(0)));
    setEditError(null);
  };

  const handleSaveEdit = async (cat: GradeCategory) => {
    setEditError(null);
    const w = parseFloat(editWeight) / 100;
    if (!editName.trim()) { setEditError('Name is required.'); return; }
    if (isNaN(w) || w <= 0 || w > 1) { setEditError('Weight must be between 1 and 100.'); return; }
    setSaving(true);
    try {
      const res = await gradeCategoriesApi.update(cat.id, { name: editName.trim(), weight: w });
      setCategories(prev => prev.map(c => c.id === cat.id ? res : c));
      setEditingId(null);
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail;
      setEditError(msg ?? 'Failed to update category.');
    } finally {
      setSaving(false);
    }
  };

  // ── delete category ───────────────────────────────────────────────────────

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this category? Assignments will be uncategorised.')) return;
    try {
      await gradeCategoriesApi.delete(id);
      setCategories(prev => prev.filter(c => c.id !== id));
      setAssignments(prev => prev.map(a => a.category_id === id ? { ...a, category_id: null } : a));
    } catch {
      alert('Failed to delete category.');
    }
  };

  // ── assign category to assignment ─────────────────────────────────────────

  const handleAssignCategory = async (assignment: Assignment, categoryId: number | null) => {
    setAssigningSaving(assignment.id);
    try {
      const res = await assignmentsApi.update(assignment.id, { category_id: categoryId });
      setAssignments(prev => prev.map(a => a.id === assignment.id ? res : a));
    } catch {
      alert('Failed to update assignment category.');
    } finally {
      setAssigningSaving(null);
    }
  };

  // ── render ────────────────────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-slate-400 gap-2">
        <AlertCircle size={32} />
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-10 p-6 max-w-4xl mx-auto">

      {/* ── Section A: Grade Weight Setup ──────────────────────────────────── */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <h2 className="text-xl font-bold text-slate-900">Grade Weight Setup</h2>
            {categories.length > 0 && <TotalWeightBadge cats={categories} />}
          </div>
          {!showAddForm && (
            <button
              onClick={() => { setShowAddForm(true); setAddError(null); }}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus size={15} /> Add Category
            </button>
          )}
        </div>

        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          {/* Weight bar */}
          {categories.length > 0 && (
            <div className="px-6 pt-5 pb-2">
              <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden flex">
                {categories.map((cat, i) => {
                  const hues = ['#3b82f6','#10b981','#f59e0b','#8b5cf6','#ef4444','#06b6d4','#ec4899'];
                  return (
                    <div
                      key={cat.id}
                      style={{ width: `${cat.weight * 100}%`, backgroundColor: hues[i % hues.length] }}
                      title={`${cat.name}: ${weightLabel(cat.weight)}`}
                    />
                  );
                })}
              </div>
            </div>
          )}

          {/* Add form */}
          {showAddForm && (
            <div className="px-6 py-4 border-b border-slate-100 bg-blue-50/40">
              <p className="text-sm font-semibold text-slate-700 mb-3">New Category</p>
              <div className="flex flex-wrap gap-3 items-start">
                <div className="flex-1 min-w-40">
                  <input
                    type="text"
                    placeholder="Category name (e.g. Midterm)"
                    value={newName}
                    onChange={e => setNewName(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                  />
                </div>
                <div className="w-28">
                  <div className="relative">
                    <input
                      type="number"
                      placeholder="Weight"
                      min={1}
                      max={100}
                      value={newWeight}
                      onChange={e => setNewWeight(e.target.value)}
                      className="w-full pl-3 pr-8 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                    />
                    <span className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 text-sm">%</span>
                  </div>
                </div>
                <button
                  onClick={handleAdd}
                  disabled={adding}
                  className="flex items-center gap-1 px-3 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 disabled:opacity-60"
                >
                  {adding ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
                  Save
                </button>
                <button
                  onClick={() => { setShowAddForm(false); setNewName(''); setNewWeight(''); setAddError(null); }}
                  className="flex items-center gap-1 px-3 py-2 border border-slate-200 text-slate-600 text-sm rounded-lg hover:bg-slate-50"
                >
                  <X size={14} /> Cancel
                </button>
              </div>
              {addError && <p className="mt-2 text-xs text-red-600">{addError}</p>}
            </div>
          )}

          {/* Category list */}
          {categories.length === 0 && !showAddForm ? (
            <div className="px-6 py-10 text-center text-slate-400 text-sm">
              No categories yet. Add one to enable weighted grading.
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100">
                  <th className="px-6 py-3 text-xs uppercase tracking-wider font-bold text-slate-500">Category</th>
                  <th className="px-6 py-3 text-xs uppercase tracking-wider font-bold text-slate-500">Weight</th>
                  <th className="px-6 py-3 text-xs uppercase tracking-wider font-bold text-slate-500 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {categories.map(cat => (
                  <tr key={cat.id} className="hover:bg-slate-50 transition-colors">
                    {editingId === cat.id ? (
                      <>
                        <td className="px-6 py-3">
                          <input
                            type="text"
                            value={editName}
                            onChange={e => setEditName(e.target.value)}
                            className="w-full px-2 py-1 border border-slate-200 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                          />
                        </td>
                        <td className="px-6 py-3">
                          <div className="relative w-24">
                            <input
                              type="number"
                              min={1}
                              max={100}
                              value={editWeight}
                              onChange={e => setEditWeight(e.target.value)}
                              className="w-full pl-2 pr-6 py-1 border border-slate-200 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                            />
                            <span className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 text-xs">%</span>
                          </div>
                          {editError && <p className="text-xs text-red-600 mt-1">{editError}</p>}
                        </td>
                        <td className="px-6 py-3">
                          <div className="flex justify-end gap-2">
                            <button
                              onClick={() => handleSaveEdit(cat)}
                              disabled={saving}
                              className="flex items-center gap-1 px-2 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700 disabled:opacity-60"
                            >
                              {saving ? <Loader2 size={12} className="animate-spin" /> : <Check size={12} />}
                              Save
                            </button>
                            <button
                              onClick={() => setEditingId(null)}
                              className="flex items-center gap-1 px-2 py-1 border border-slate-200 text-slate-600 text-xs rounded hover:bg-slate-50"
                            >
                              <X size={12} /> Cancel
                            </button>
                          </div>
                        </td>
                      </>
                    ) : (
                      <>
                        <td className="px-6 py-4 font-medium text-slate-900">{cat.name}</td>
                        <td className="px-6 py-4 text-slate-700">
                          <span className="inline-block bg-slate-100 rounded px-2 py-0.5 text-sm font-semibold">
                            {weightLabel(cat.weight)}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex justify-end gap-2">
                            <button
                              onClick={() => startEdit(cat)}
                              className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                              title="Edit"
                            >
                              <Pencil size={15} />
                            </button>
                            <button
                              onClick={() => handleDelete(cat.id)}
                              className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                              title="Delete"
                            >
                              <Trash2 size={15} />
                            </button>
                          </div>
                        </td>
                      </>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Total weight warning */}
        {categories.length > 0 && totalWeight(categories) < 0.999 && (
          <p className="mt-2 text-xs text-amber-700">
            Total weight is {weightLabel(totalWeight(categories))} — add more categories to reach 100%.
          </p>
        )}
        {categories.length > 0 && totalWeight(categories) > 1.001 && (
          <p className="mt-2 text-xs text-red-600">
            Total weight exceeds 100%. Please reduce some category weights.
          </p>
        )}
      </section>

      {/* ── Section B: Assignments → Categories ────────────────────────────── */}
      <section>
        <h2 className="text-xl font-bold text-slate-900 mb-4">Assignment Categories</h2>
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          {assignments.length === 0 ? (
            <div className="px-6 py-10 text-center text-slate-400 text-sm">
              No assignments yet for this class-subject.
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100">
                  <th className="px-6 py-3 text-xs uppercase tracking-wider font-bold text-slate-500">Assignment</th>
                  <th className="px-6 py-3 text-xs uppercase tracking-wider font-bold text-slate-500">Max Score</th>
                  <th className="px-6 py-3 text-xs uppercase tracking-wider font-bold text-slate-500">Category</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {assignments.map(asn => (
                  <tr key={asn.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4">
                      <p className="font-medium text-slate-900">{asn.title}</p>
                      <p className="text-xs text-slate-400 capitalize">{asn.status}</p>
                    </td>
                    <td className="px-6 py-4 text-slate-700">{asn.max_score}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <select
                          value={asn.category_id ?? ''}
                          onChange={e => handleAssignCategory(asn, e.target.value ? parseInt(e.target.value, 10) : null)}
                          disabled={assigningSaving === asn.id || categories.length === 0}
                          className="px-2 py-1.5 border border-slate-200 rounded-lg text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-400 disabled:opacity-60"
                        >
                          <option value="">— unassigned —</option>
                          {categories.map(cat => (
                            <option key={cat.id} value={cat.id}>
                              {cat.name} ({weightLabel(cat.weight)})
                            </option>
                          ))}
                        </select>
                        {assigningSaving === asn.id && (
                          <Loader2 size={14} className="animate-spin text-blue-500" />
                        )}
                      </div>
                      {categories.length === 0 && (
                        <p className="text-xs text-slate-400 mt-1">Create categories above first.</p>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </section>

    </div>
  );
}
