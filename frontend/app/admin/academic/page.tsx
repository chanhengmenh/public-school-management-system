'use client';

import { useState, useEffect, useCallback } from 'react';
import { classesApi } from '@/lib/api/classes';
import { subjectsApi } from '@/lib/api/subjects';
import { usersApi } from '@/lib/api/users';
import { classSubjectsApi } from '@/lib/api/class-subjects';
import { enrollmentsApi } from '@/lib/api/enrollments';
import { client } from '@/lib/api/client';
import { Class, Subject, ClassSubject, Enrollment } from '@/types/school.types';
import { ApiError } from '@/lib/api/client';
import { User } from '@/types/user.types';
import { Loader2, Trash2, Plus, UserPlus, Pencil, X, CheckCircle2, AlertCircle, Copy } from 'lucide-react';

// ─── Types ───────────────────────────────────────────────────────────────────

interface ClassCreatePayload {
  name: string;
  academic_year: string;
  home_teacher_id?: number;
}

interface SubjectCreatePayload {
  name: string;
  code: string;
  description?: string;
}

// ─── Classes Tab ─────────────────────────────────────────────────────────────

function ClassesTab() {
  const [classes, setClasses] = useState<Class[]>([]);
  const [teachers, setTeachers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionMsg, setActionMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Form state
  const [showForm, setShowForm] = useState(false);
  const [formName, setFormName] = useState('');
  const [formYear, setFormYear] = useState('');
  const [formTeacherId, setFormTeacherId] = useState('');   // stores teacher id as string or ''
  const [formSaving, setFormSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Delete confirm
  const [deleteTarget, setDeleteTarget] = useState<Class | null>(null);

  // Bulk create modal
  const [showBulk, setShowBulk] = useState(false);
  const [bulkGrade, setBulkGrade] = useState('');
  const [bulkSections, setBulkSections] = useState('');
  const [bulkYear, setBulkYear] = useState('');
  type BulkRowStatus = 'pending' | 'creating' | 'done' | 'error' | 'duplicate';
  const [bulkRows, setBulkRows] = useState<{ name: string; status: BulkRowStatus }[]>([]);
  const [bulkRunning, setBulkRunning] = useState(false);
  const [bulkDone, setBulkDone] = useState(false);

  function parseSections(raw: string): string[] {
    return raw.split(/[,\s]+/).map(s => s.trim().toUpperCase()).filter(Boolean);
  }

  function buildNames(grade: string, sections: string[]): string[] {
    if (!grade.trim() || sections.length === 0) return [];
    return sections.map(s => `Grade ${grade.trim()}${s}`);
  }

  function openBulk() {
    setBulkGrade('');
    setBulkSections('');
    setBulkYear('');
    setBulkRows([]);
    setBulkRunning(false);
    setBulkDone(false);
    setShowBulk(true);
  }

  const previewNames = buildNames(bulkGrade, parseSections(bulkSections));
  const existingNames = new Set(classes.map(c => c.name));

  async function handleBulkCreate() {
    if (previewNames.length === 0 || !bulkYear.trim()) return;
    const rows = previewNames.map(name => ({
      name,
      status: existingNames.has(name) ? 'duplicate' as BulkRowStatus : 'pending' as BulkRowStatus,
    }));
    setBulkRows(rows);
    setBulkRunning(true);
    setBulkDone(false);

    const created: Class[] = [];
    for (let i = 0; i < rows.length; i++) {
      if (rows[i].status === 'duplicate') continue;
      setBulkRows(prev => prev.map((r, idx) => idx === i ? { ...r, status: 'creating' } : r));
      try {
        const cls = await client.post<Class>('/classes', { name: rows[i].name, academic_year: bulkYear.trim() });
        created.push(cls);
        setBulkRows(prev => prev.map((r, idx) => idx === i ? { ...r, status: 'done' } : r));
      } catch {
        setBulkRows(prev => prev.map((r, idx) => idx === i ? { ...r, status: 'error' } : r));
      }
    }

    if (created.length > 0) setClasses(prev => [...prev, ...created]);
    setBulkRunning(false);
    setBulkDone(true);
  }

  async function fetchClasses() {
    setLoading(true);
    setError(null);
    try {
      const [classData, userData] = await Promise.all([
        classesApi.list(),
        usersApi.list(),
      ]);
      setClasses(classData);
      setTeachers(userData.filter((u) => u.role === 'teacher'));
    } catch {
      setError('Failed to load classes.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchClasses();
  }, []);

  function flash(type: 'success' | 'error', text: string) {
    setActionMsg({ type, text });
    setTimeout(() => setActionMsg(null), 4000);
  }

  function resetForm() {
    setFormName('');
    setFormYear('');
    setFormTeacherId('');
    setFormError(null);
    setShowForm(false);
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setFormError(null);
    setFormSaving(true);
    try {
      const payload: ClassCreatePayload = {
        name: formName,
        academic_year: formYear,
      };
      if (formTeacherId !== '') {
        payload.home_teacher_id = parseInt(formTeacherId, 10);
      }
      const created = await client.post<Class>('/classes', payload);
      setClasses((prev) => [...prev, created]);
      flash('success', `Class "${created.name}" created.`);
      resetForm();
    } catch (err) {
      if (err instanceof ApiError) {
        setFormError(err.data.detail ?? err.data.message ?? 'Failed to create class.');
      } else {
        setFormError('Failed to create class.');
      }
    } finally {
      setFormSaving(false);
    }
  }

  async function handleDelete(cls: Class) {
    try {
      await client.delete('/classes/' + cls.id);
      setClasses((prev) => prev.filter((c) => c.id !== cls.id));
      flash('success', `Class "${cls.name}" deleted.`);
    } catch {
      flash('error', 'Failed to delete class.');
    } finally {
      setDeleteTarget(null);
    }
  }

  return (
    <div className="space-y-5">
      {/* Action message */}
      {actionMsg && (
        <div
          className={`rounded-lg px-4 py-3 text-sm border ${
            actionMsg.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
              : 'bg-red-50 border-red-200 text-red-700'
          }`}
        >
          {actionMsg.text}
        </div>
      )}

      {/* Header row */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-500">{classes.length} class{classes.length !== 1 ? 'es' : ''} total</p>
        {!showForm && (
          <div className="flex items-center gap-2">
            <button
              onClick={openBulk}
              className="flex items-center gap-1.5 bg-white hover:bg-slate-50 text-slate-700 text-sm font-medium px-4 py-2 rounded-lg border border-slate-200 transition-colors shadow-sm"
            >
              <Copy className="w-4 h-4" /> Bulk Create
            </button>
            <button
              onClick={() => setShowForm(true)}
              className="flex items-center gap-1.5 bg-orange-500 hover:bg-orange-600 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors shadow-sm"
            >
              <span className="text-base leading-none">+</span> Add Class
            </button>
          </div>
        )}
      </div>

      {/* Inline form */}
      {showForm && (
        <div className="border border-orange-200 bg-orange-50/50 rounded-xl p-4 space-y-3">
          <h3 className="text-sm font-semibold text-slate-700">New Class</h3>
          {formError && (
            <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded px-3 py-2">
              {formError}
            </p>
          )}
          <form onSubmit={handleCreate} className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Class Name *</label>
              <input
                required
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                placeholder="e.g. 10A"
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent bg-white"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Academic Year *</label>
              <input
                required
                value={formYear}
                onChange={(e) => setFormYear(e.target.value)}
                placeholder="e.g. 2025-2026"
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent bg-white"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Home Teacher</label>
              <select
                value={formTeacherId}
                onChange={(e) => setFormTeacherId(e.target.value)}
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent bg-white"
              >
                <option value="">— None —</option>
                {teachers.map((t) => (
                  <option key={t.id} value={String(t.id)}>{t.full_name}</option>
                ))}
              </select>
            </div>
            <div className="sm:col-span-3 flex gap-2 justify-end">
              <button
                type="button"
                onClick={resetForm}
                className="px-4 py-2 text-sm font-medium text-slate-600 border border-slate-200 rounded-lg hover:bg-white transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={formSaving}
                className="px-4 py-2 text-sm font-medium text-white bg-orange-500 rounded-lg hover:bg-orange-600 transition-colors disabled:opacity-50"
              >
                {formSaving ? 'Creating...' : 'Create Class'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Table */}
      <div className="border border-slate-200 rounded-2xl shadow-sm bg-white overflow-hidden">
        {loading ? (
          <div className="py-14 text-center text-slate-400 text-sm">Loading classes...</div>
        ) : error ? (
          <div className="py-14 text-center text-red-500 text-sm">{error}</div>
        ) : classes.length === 0 ? (
          <div className="py-14 text-center text-slate-400 text-sm">No classes found. Add one above.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50">
                  <th className="text-left px-4 py-3 font-semibold text-slate-600 w-16">ID</th>
                  <th className="text-left px-4 py-3 font-semibold text-slate-600">Name</th>
                  <th className="text-left px-4 py-3 font-semibold text-slate-600">Academic Year</th>
                  <th className="text-left px-4 py-3 font-semibold text-slate-600">Home Teacher</th>
                  <th className="text-right px-4 py-3 font-semibold text-slate-600">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {classes.map((cls) => (
                  <tr key={cls.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3 text-slate-400">{cls.id}</td>
                    <td className="px-4 py-3 font-medium text-slate-800">{cls.name}</td>
                    <td className="px-4 py-3 text-slate-500">{cls.academic_year}</td>
                    <td className="px-4 py-3 text-slate-600">
                      {cls.home_teacher_name ?? <span className="text-slate-300">—</span>}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => setDeleteTarget(cls)}
                        className="text-red-500 hover:text-red-700 font-medium text-xs border border-red-200 rounded px-2.5 py-1 hover:bg-red-50 transition-colors"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Bulk create modal */}
      {showBulk && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg mx-4 border border-slate-200 p-6 flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between mb-4 shrink-0">
              <h3 className="text-lg font-semibold text-slate-800">Bulk Create Classes</h3>
              <button onClick={() => !bulkRunning && setShowBulk(false)} disabled={bulkRunning} className="text-slate-400 hover:text-slate-600 disabled:opacity-40">
                <X className="w-5 h-5" />
              </button>
            </div>

            {!bulkDone ? (
              <>
                <div className="grid grid-cols-2 gap-3 mb-3 shrink-0">
                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1">Grade *</label>
                    <input
                      type="number"
                      min={1}
                      max={12}
                      value={bulkGrade}
                      onChange={e => setBulkGrade(e.target.value)}
                      placeholder="e.g. 7"
                      disabled={bulkRunning}
                      className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 bg-white disabled:opacity-50"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1">Academic Year *</label>
                    <input
                      value={bulkYear}
                      onChange={e => setBulkYear(e.target.value)}
                      placeholder="e.g. 2025-2026"
                      disabled={bulkRunning}
                      className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 bg-white disabled:opacity-50"
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-xs font-medium text-slate-600 mb-1">Sections * <span className="text-slate-400 font-normal">(comma or space separated)</span></label>
                    <input
                      value={bulkSections}
                      onChange={e => setBulkSections(e.target.value)}
                      placeholder="e.g. A, B, C, D"
                      disabled={bulkRunning}
                      className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 bg-white disabled:opacity-50"
                    />
                  </div>
                </div>

                {/* Preview */}
                {previewNames.length > 0 && (
                  <div className="mb-4 overflow-y-auto flex-1 shrink-0">
                    <p className="text-xs font-medium text-slate-500 mb-2">Preview — {previewNames.length} class{previewNames.length !== 1 ? 'es' : ''} will be created:</p>
                    <div className="flex flex-wrap gap-2">
                      {previewNames.map(name => (
                        <span
                          key={name}
                          className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                            existingNames.has(name)
                              ? 'bg-amber-100 text-amber-700 line-through'
                              : 'bg-orange-50 text-orange-700'
                          }`}
                        >
                          {name}{existingNames.has(name) ? ' (exists)' : ''}
                        </span>
                      ))}
                    </div>
                    {previewNames.some(n => existingNames.has(n)) && (
                      <p className="text-xs text-amber-600 mt-2">Strikethrough classes already exist and will be skipped.</p>
                    )}
                  </div>
                )}

                <div className="flex justify-end gap-3 shrink-0 mt-2">
                  <button onClick={() => setShowBulk(false)} disabled={bulkRunning} className="px-4 py-2 text-sm font-medium text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-40 transition-colors">
                    Cancel
                  </button>
                  <button
                    onClick={handleBulkCreate}
                    disabled={bulkRunning || previewNames.length === 0 || !bulkYear.trim()}
                    className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-orange-500 rounded-lg hover:bg-orange-600 disabled:opacity-50 transition-colors"
                  >
                    {bulkRunning ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                    {bulkRunning ? 'Creating…' : `Create ${previewNames.filter(n => !existingNames.has(n)).length} Class${previewNames.filter(n => !existingNames.has(n)).length !== 1 ? 'es' : ''}`}
                  </button>
                </div>
              </>
            ) : (
              /* Results */
              <div className="flex-1 overflow-y-auto space-y-2 mb-4">
                {bulkRows.map((row, i) => (
                  <div key={i} className="flex items-center gap-3 px-3 py-2 bg-slate-50 rounded-lg">
                    {row.status === 'done' && <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0" />}
                    {row.status === 'error' && <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />}
                    {row.status === 'duplicate' && <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />}
                    {row.status === 'creating' && <Loader2 className="w-4 h-4 animate-spin text-orange-500 shrink-0" />}
                    <span className="text-sm text-slate-800 flex-1">{row.name}</span>
                    <span className={`text-xs font-medium ${
                      row.status === 'done' ? 'text-green-600' :
                      row.status === 'error' ? 'text-red-500' :
                      row.status === 'duplicate' ? 'text-amber-600' : 'text-orange-500'
                    }`}>
                      {row.status === 'done' ? 'Created' : row.status === 'error' ? 'Failed' : row.status === 'duplicate' ? 'Already exists' : 'Creating…'}
                    </span>
                  </div>
                ))}
                <div className="flex justify-end mt-3">
                  <button onClick={() => setShowBulk(false)} className="px-4 py-2 text-sm font-medium text-white bg-orange-500 rounded-lg hover:bg-orange-600 transition-colors">
                    Done
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Delete confirm */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm mx-4 border border-slate-200 p-6 space-y-4">
            <h3 className="text-lg font-semibold text-slate-800">Delete Class</h3>
            <p className="text-sm text-slate-600">
              Delete class <span className="font-semibold text-slate-800">{deleteTarget.name}</span>? This
              cannot be undone.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setDeleteTarget(null)}
                className="px-4 py-2 text-sm font-medium text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteTarget)}
                className="px-4 py-2 text-sm font-medium text-white bg-red-500 rounded-lg hover:bg-red-600 transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Subjects Tab ─────────────────────────────────────────────────────────────

function SubjectsTab() {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionMsg, setActionMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Form state
  const [showForm, setShowForm] = useState(false);
  const [formName, setFormName] = useState('');
  const [formCode, setFormCode] = useState('');
  const [formDesc, setFormDesc] = useState('');
  const [formSaving, setFormSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Delete confirm
  const [deleteTarget, setDeleteTarget] = useState<Subject | null>(null);

  // Edit modal
  const [editTarget, setEditTarget] = useState<Subject | null>(null);
  const [editName, setEditName] = useState('');
  const [editDesc, setEditDesc] = useState('');
  const [editSaving, setEditSaving] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);

  async function fetchSubjects() {
    setLoading(true);
    setError(null);
    try {
      const data = await subjectsApi.list();
      setSubjects(data);
    } catch {
      setError('Failed to load subjects.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchSubjects();
  }, []);

  function flash(type: 'success' | 'error', text: string) {
    setActionMsg({ type, text });
    setTimeout(() => setActionMsg(null), 4000);
  }

  function resetForm() {
    setFormName('');
    setFormCode('');
    setFormDesc('');
    setFormError(null);
    setShowForm(false);
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setFormError(null);
    setFormSaving(true);
    try {
      const payload: SubjectCreatePayload = {
        name: formName,
        code: formCode,
        description: formDesc || undefined,
      };
      const created = await subjectsApi.create({ ...payload, description: payload.description ?? '' });
      setSubjects((prev) => [...prev, created]);
      flash('success', `Subject "${created.name}" created.`);
      resetForm();
    } catch (err) {
      if (err instanceof ApiError) {
        setFormError(err.data.detail ?? err.data.message ?? 'Failed to create subject.');
      } else {
        setFormError('Failed to create subject.');
      }
    } finally {
      setFormSaving(false);
    }
  }

  async function handleDelete(sub: Subject) {
    try {
      await subjectsApi.delete(sub.id);
      setSubjects((prev) => prev.filter((s) => s.id !== sub.id));
      flash('success', `Subject "${sub.name}" deleted.`);
    } catch {
      flash('error', 'Failed to delete subject.');
    } finally {
      setDeleteTarget(null);
    }
  }

  function openEdit(sub: Subject) {
    setEditTarget(sub);
    setEditName(sub.name);
    setEditDesc(sub.description ?? '');
    setEditError(null);
  }

  async function handleEdit(e: React.FormEvent) {
    e.preventDefault();
    if (!editTarget) return;
    setEditError(null);
    setEditSaving(true);
    try {
      const updated = await subjectsApi.update(editTarget.id, { name: editName, description: editDesc || undefined });
      setSubjects((prev) => prev.map((s) => s.id === updated.id ? updated : s));
      flash('success', `Subject "${updated.name}" updated.`);
      setEditTarget(null);
    } catch (err) {
      setEditError(err instanceof ApiError ? (err.data.detail ?? 'Failed to update subject.') : 'Failed to update subject.');
    } finally {
      setEditSaving(false);
    }
  }

  return (
    <div className="space-y-5">
      {/* Action message */}
      {actionMsg && (
        <div
          className={`rounded-lg px-4 py-3 text-sm border ${
            actionMsg.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
              : 'bg-red-50 border-red-200 text-red-700'
          }`}
        >
          {actionMsg.text}
        </div>
      )}

      {/* Header row */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-500">{subjects.length} subject{subjects.length !== 1 ? 's' : ''} total</p>
        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-1.5 bg-orange-500 hover:bg-orange-600 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors shadow-sm"
          >
            <span className="text-base leading-none">+</span> Add Subject
          </button>
        )}
      </div>

      {/* Inline form */}
      {showForm && (
        <div className="border border-orange-200 bg-orange-50/50 rounded-xl p-4 space-y-3">
          <h3 className="text-sm font-semibold text-slate-700">New Subject</h3>
          {formError && (
            <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded px-3 py-2">
              {formError}
            </p>
          )}
          <form onSubmit={handleCreate} className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Name *</label>
              <input
                required
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                placeholder="e.g. Mathematics"
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent bg-white"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Code *</label>
              <input
                required
                value={formCode}
                onChange={(e) => setFormCode(e.target.value)}
                placeholder="e.g. MATH101"
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent bg-white"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Description</label>
              <input
                value={formDesc}
                onChange={(e) => setFormDesc(e.target.value)}
                placeholder="Optional"
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent bg-white"
              />
            </div>
            <div className="sm:col-span-2 flex gap-2 justify-end">
              <button
                type="button"
                onClick={resetForm}
                className="px-4 py-2 text-sm font-medium text-slate-600 border border-slate-200 rounded-lg hover:bg-white transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={formSaving}
                className="px-4 py-2 text-sm font-medium text-white bg-orange-500 rounded-lg hover:bg-orange-600 transition-colors disabled:opacity-50"
              >
                {formSaving ? 'Creating...' : 'Create Subject'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Table */}
      <div className="border border-slate-200 rounded-2xl shadow-sm bg-white overflow-hidden">
        {loading ? (
          <div className="py-14 text-center text-slate-400 text-sm">Loading subjects...</div>
        ) : error ? (
          <div className="py-14 text-center text-red-500 text-sm">{error}</div>
        ) : subjects.length === 0 ? (
          <div className="py-14 text-center text-slate-400 text-sm">No subjects found. Add one above.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50">
                  <th className="text-left px-4 py-3 font-semibold text-slate-600 w-16">ID</th>
                  <th className="text-left px-4 py-3 font-semibold text-slate-600">Name</th>
                  <th className="text-left px-4 py-3 font-semibold text-slate-600">Description</th>
                  <th className="text-right px-4 py-3 font-semibold text-slate-600">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {subjects.map((sub) => (
                  <tr key={sub.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3 text-slate-400">{sub.id}</td>
                    <td className="px-4 py-3 font-medium text-slate-800">{sub.name}</td>
                    <td className="px-4 py-3 text-slate-500 max-w-xs truncate">
                      {sub.description || <span className="text-slate-300">—</span>}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => openEdit(sub)}
                          className="text-slate-500 hover:text-orange-600 font-medium text-xs border border-slate-200 rounded px-2.5 py-1 hover:bg-orange-50 transition-colors flex items-center gap-1"
                        >
                          <Pencil className="w-3 h-3" /> Edit
                        </button>
                        <button
                          onClick={() => setDeleteTarget(sub)}
                          className="text-red-500 hover:text-red-700 font-medium text-xs border border-red-200 rounded px-2.5 py-1 hover:bg-red-50 transition-colors"
                        >
                          Delete
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

      {/* Edit modal */}
      {editTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md mx-4 border border-slate-200 p-6 space-y-4">
            <h3 className="text-lg font-semibold text-slate-800">Edit Subject</h3>
            {editError && (
              <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded px-3 py-2">{editError}</p>
            )}
            <form onSubmit={handleEdit} className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Name *</label>
                <input
                  required
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 bg-white"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Description</label>
                <input
                  value={editDesc}
                  onChange={(e) => setEditDesc(e.target.value)}
                  placeholder="Optional"
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 bg-white"
                />
              </div>
              <div className="flex justify-end gap-3 pt-1">
                <button
                  type="button"
                  onClick={() => setEditTarget(null)}
                  className="px-4 py-2 text-sm font-medium text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={editSaving}
                  className="px-4 py-2 text-sm font-medium text-white bg-orange-500 rounded-lg hover:bg-orange-600 transition-colors disabled:opacity-50"
                >
                  {editSaving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete confirm */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm mx-4 border border-slate-200 p-6 space-y-4">
            <h3 className="text-lg font-semibold text-slate-800">Delete Subject</h3>
            <p className="text-sm text-slate-600">
              Delete subject{' '}
              <span className="font-semibold text-slate-800">{deleteTarget.name}</span>? This cannot be
              undone.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setDeleteTarget(null)}
                className="px-4 py-2 text-sm font-medium text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteTarget)}
                className="px-4 py-2 text-sm font-medium text-white bg-red-500 rounded-lg hover:bg-red-600 transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Cohort Setup Tab ─────────────────────────────────────────────────────────

function CohortSetupTab() {
  const [classes, setClasses] = useState<Class[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [teachers, setTeachers] = useState<User[]>([]);
  const [students, setStudents] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedClassId, setSelectedClassId] = useState<number | ''>('');

  const [classSubjects, setClassSubjects] = useState<ClassSubject[]>([]);
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [detailLoading, setDetailLoading] = useState(false);
  const [actionMsg, setActionMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Add subject form
  const [subjectFormSubjectId, setSubjectFormSubjectId] = useState('');
  const [subjectFormTeacherId, setSubjectFormTeacherId] = useState('');
  const [subjectFormSaving, setSubjectFormSaving] = useState(false);

  // Enroll student form
  const [enrollStudentId, setEnrollStudentId] = useState('');
  const [enrollSaving, setEnrollSaving] = useState(false);
  const [studentSearch, setStudentSearch] = useState('');
  const [enrollSearch, setEnrollSearch] = useState('');
  const [enrollDropdownOpen, setEnrollDropdownOpen] = useState(false);

  function flash(type: 'success' | 'error', text: string) {
    setActionMsg({ type, text });
    setTimeout(() => setActionMsg(null), 4000);
  }

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      try {
        const [cls, subs, users] = await Promise.all([
          classesApi.list(),
          subjectsApi.list(),
          usersApi.list(),
        ]);
        setClasses(cls);
        setSubjects(subs);
        setTeachers(users.filter(u => u.role === 'teacher'));
        setStudents(users.filter(u => u.role === 'student'));
      } catch {
        flash('error', 'Failed to load data.');
      } finally {
        setLoading(false);
      }
    };
    init();
  }, []);

  const loadClassDetail = useCallback(async (classId: number) => {
    setDetailLoading(true);
    try {
      const [cs, enr] = await Promise.all([
        classSubjectsApi.list({ class_id: classId }),
        enrollmentsApi.list({ class_id: classId }),
      ]);
      setClassSubjects(cs);
      setEnrollments(enr);
    } catch {
      flash('error', 'Failed to load class details.');
    } finally {
      setDetailLoading(false);
    }
  }, []);

  useEffect(() => {
    setStudentSearch('');
    setEnrollSearch('');
    setEnrollDropdownOpen(false);
    setEnrollStudentId('');
    if (selectedClassId !== '') loadClassDetail(selectedClassId);
    else { setClassSubjects([]); setEnrollments([]); }
  }, [selectedClassId, loadClassDetail]);

  const handleAddSubject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedClassId || !subjectFormSubjectId || !subjectFormTeacherId) return;
    setSubjectFormSaving(true);
    try {
      const created = await classSubjectsApi.create({
        class_id: selectedClassId as number,
        subject_id: parseInt(subjectFormSubjectId),
        teacher_id: parseInt(subjectFormTeacherId),
      });
      setClassSubjects(prev => [...prev, created]);
      setSubjectFormSubjectId('');
      setSubjectFormTeacherId('');
      flash('success', 'Subject assigned.');
    } catch (err) {
      flash('error', err instanceof ApiError ? (err.data.detail ?? 'Failed to assign subject.') : 'Failed to assign subject.');
    } finally {
      setSubjectFormSaving(false);
    }
  };

  const handleRemoveSubject = async (csId: number) => {
    try {
      await classSubjectsApi.delete(csId);
      setClassSubjects(prev => prev.filter(cs => cs.id !== csId));
      flash('success', 'Subject removed.');
    } catch {
      flash('error', 'Failed to remove subject.');
    }
  };

  const handleEnroll = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedClassId || !enrollStudentId) return;
    setEnrollSaving(true);
    try {
      const created = await enrollmentsApi.create({
        class_id: selectedClassId as number,
        student_id: parseInt(enrollStudentId),
      });
      setEnrollments(prev => [...prev, created]);
      setEnrollStudentId('');
      setEnrollSearch('');
      setEnrollDropdownOpen(false);
      flash('success', 'Student enrolled.');
    } catch (err) {
      flash('error', err instanceof ApiError ? (err.data.detail ?? 'Failed to enroll student.') : 'Failed to enroll student.');
    } finally {
      setEnrollSaving(false);
    }
  };

  const handleUnenroll = async (enrollmentId: number) => {
    try {
      await enrollmentsApi.delete(enrollmentId);
      setEnrollments(prev => prev.filter(e => e.id !== enrollmentId));
      flash('success', 'Student unenrolled.');
    } catch {
      flash('error', 'Failed to unenroll student.');
    }
  };

  const enrolledStudentIds = new Set(enrollments.map(e => e.student_id));
  const unenrolledStudents = students.filter(s => !enrolledStudentIds.has(s.id));
  const assignedSubjectIds = new Set(classSubjects.map(cs => cs.subject_id));
  const availableSubjects = subjects.filter(s => !assignedSubjectIds.has(s.id));
  const enrollSearchLower = enrollSearch.toLowerCase();
  const filteredUnenrolled = enrollSearch.trim()
    ? unenrolledStudents.filter(s =>
        s.full_name.toLowerCase().includes(enrollSearchLower) ||
        s.email.toLowerCase().includes(enrollSearchLower)
      )
    : unenrolledStudents;
  const searchLower = studentSearch.toLowerCase();
  const filteredEnrollments = studentSearch.trim()
    ? enrollments.filter(enr => {
        const s = students.find(s => s.id === enr.student_id);
        return s && (s.full_name.toLowerCase().includes(searchLower) || s.email.toLowerCase().includes(searchLower));
      })
    : enrollments;

  if (loading) {
    return <div className="flex justify-center py-16"><Loader2 className="h-7 w-7 animate-spin text-orange-500" /></div>;
  }

  return (
    <div className="space-y-6">
      {actionMsg && (
        <div className={`rounded-lg px-4 py-3 text-sm border ${actionMsg.type === 'success' ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : 'bg-red-50 border-red-200 text-red-700'}`}>
          {actionMsg.text}
        </div>
      )}

      {/* Class selector */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-5">
        <label className="block text-sm font-semibold text-slate-700 mb-2">Select Class to Set Up</label>
        <select
          value={selectedClassId}
          onChange={e => setSelectedClassId(e.target.value === '' ? '' : parseInt(e.target.value))}
          className="w-full max-w-xs border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 bg-white"
        >
          <option value="">— Choose a class —</option>
          {classes.map(c => (
            <option key={c.id} value={c.id}>{c.name} ({c.academic_year})</option>
          ))}
        </select>
      </div>

      {selectedClassId !== '' && (
        detailLoading ? (
          <div className="flex justify-center py-10"><Loader2 className="h-6 w-6 animate-spin text-orange-500" /></div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* ── Subjects ── */}
            <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
              <div className="px-5 py-4 border-b border-slate-100 flex items-center gap-2">
                <Plus className="w-4 h-4 text-orange-500" />
                <h3 className="font-semibold text-slate-800 text-sm">Assigned Subjects ({classSubjects.length})</h3>
              </div>

              {classSubjects.length === 0 ? (
                <p className="px-5 py-4 text-sm text-slate-400">No subjects assigned yet.</p>
              ) : (
                <div className="divide-y divide-slate-50">
                  {classSubjects.map(cs => (
                    <div key={cs.id} className="px-5 py-3 flex items-center justify-between gap-2">
                      <div>
                        <p className="text-sm font-medium text-slate-800">{cs.subject_name}</p>
                        <p className="text-xs text-slate-500">{cs.teacher_name}</p>
                      </div>
                      <button onClick={() => handleRemoveSubject(cs.id)} className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {availableSubjects.length > 0 && (
                <form onSubmit={handleAddSubject} className="px-5 py-4 border-t border-slate-100 flex flex-wrap gap-2">
                  <select
                    value={subjectFormSubjectId}
                    onChange={e => setSubjectFormSubjectId(e.target.value)}
                    required
                    className="flex-1 min-w-0 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 bg-white"
                  >
                    <option value="">Subject…</option>
                    {availableSubjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                  </select>
                  <select
                    value={subjectFormTeacherId}
                    onChange={e => setSubjectFormTeacherId(e.target.value)}
                    required
                    className="flex-1 min-w-0 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 bg-white"
                  >
                    <option value="">Teacher…</option>
                    {teachers.map(t => <option key={t.id} value={t.id}>{t.full_name}</option>)}
                  </select>
                  <button type="submit" disabled={subjectFormSaving} className="px-3 py-2 bg-orange-500 text-white rounded-lg text-sm font-medium hover:bg-orange-600 disabled:opacity-50 flex items-center gap-1">
                    {subjectFormSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />} Assign
                  </button>
                </form>
              )}
            </div>

            {/* ── Students ── */}
            <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
              <div className="px-5 py-4 border-b border-slate-100 flex items-center gap-2">
                <UserPlus className="w-4 h-4 text-orange-500" />
                <h3 className="font-semibold text-slate-800 text-sm">Enrolled Students ({enrollments.length})</h3>
              </div>

              {enrollments.length === 0 ? (
                <p className="px-5 py-4 text-sm text-slate-400">No students enrolled yet.</p>
              ) : (
                <>
                  <div className="px-4 py-2 border-b border-slate-100">
                    <input
                      type="text"
                      value={studentSearch}
                      onChange={e => setStudentSearch(e.target.value)}
                      placeholder="Search by name or email…"
                      className="w-full border border-slate-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 bg-white"
                    />
                  </div>
                  <div className="divide-y divide-slate-50 max-h-64 overflow-y-auto">
                    {filteredEnrollments.length === 0 ? (
                      <p className="px-5 py-4 text-sm text-slate-400">No students match &ldquo;{studentSearch}&rdquo;.</p>
                    ) : filteredEnrollments.map(enr => {
                      const student = students.find(s => s.id === enr.student_id);
                      return (
                        <div key={enr.id} className="px-5 py-3 flex items-center justify-between gap-2">
                          <div>
                            <p className="text-sm font-medium text-slate-800">{student?.full_name ?? `#${enr.student_id}`}</p>
                            <p className="text-xs text-slate-500">{student?.email}</p>
                          </div>
                          <button onClick={() => handleUnenroll(enr.id)} className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </>
              )}

              {unenrolledStudents.length > 0 && (
                <form onSubmit={handleEnroll} className="px-5 py-4 border-t border-slate-100 flex gap-2 items-start">
                  <div className="flex-1 relative">
                    <input
                      type="text"
                      value={enrollSearch}
                      onChange={e => { setEnrollSearch(e.target.value); setEnrollStudentId(''); setEnrollDropdownOpen(true); }}
                      onFocus={() => setEnrollDropdownOpen(true)}
                      onBlur={() => setTimeout(() => setEnrollDropdownOpen(false), 150)}
                      placeholder={enrollStudentId ? (unenrolledStudents.find(s => String(s.id) === enrollStudentId)?.full_name ?? 'Search student…') : 'Search student…'}
                      className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 bg-white"
                    />
                    {enrollDropdownOpen && filteredUnenrolled.length > 0 && (
                      <div className="absolute z-20 bottom-full mb-1 left-0 right-0 bg-white border border-slate-200 rounded-xl shadow-lg max-h-52 overflow-y-auto">
                        {filteredUnenrolled.map(s => (
                          <button
                            key={s.id}
                            type="button"
                            onMouseDown={() => { setEnrollStudentId(String(s.id)); setEnrollSearch(s.full_name); setEnrollDropdownOpen(false); }}
                            className="w-full text-left px-4 py-2.5 hover:bg-orange-50 transition-colors"
                          >
                            <p className="text-sm font-medium text-slate-800">{s.full_name}</p>
                            <p className="text-xs text-slate-400">{s.email}</p>
                          </button>
                        ))}
                      </div>
                    )}
                    {enrollDropdownOpen && enrollSearch.trim() && filteredUnenrolled.length === 0 && (
                      <div className="absolute z-20 bottom-full mb-1 left-0 right-0 bg-white border border-slate-200 rounded-xl shadow-lg px-4 py-3">
                        <p className="text-sm text-slate-400">No students match &ldquo;{enrollSearch}&rdquo;</p>
                      </div>
                    )}
                  </div>
                  <button type="submit" disabled={enrollSaving || !enrollStudentId} className="px-3 py-2 bg-orange-500 text-white rounded-lg text-sm font-medium hover:bg-orange-600 disabled:opacity-50 flex items-center gap-1 shrink-0">
                    {enrollSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <UserPlus className="w-4 h-4" />} Enroll
                  </button>
                </form>
              )}
            </div>
          </div>
        )
      )}
    </div>
  );
}

// ─── Subject Sets Tab ─────────────────────────────────────────────────────────

const LS_KEY = 'psms_subject_sets';

interface SubjectSet {
  id: string;
  name: string;
  subjectIds: number[];
}

type ApplyRowStatus = 'pending' | 'creating' | 'done' | 'skipped' | 'error';

function SubjectSetsTab() {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [classes, setClasses] = useState<Class[]>([]);
  const [teachers, setTeachers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  const [sets, setSets] = useState<SubjectSet[]>(() => {
    try { return JSON.parse(localStorage.getItem(LS_KEY) ?? '[]'); } catch { return []; }
  });

  // Create set modal
  const [showCreate, setShowCreate] = useState(false);
  const [createName, setCreateName] = useState('');
  const [createSelected, setCreateSelected] = useState<Set<number>>(new Set());
  const [createError, setCreateError] = useState<string | null>(null);

  // Apply set modal
  const [applySet, setApplySet] = useState<SubjectSet | null>(null);
  const [applyClasses, setApplyClasses] = useState<Set<number>>(new Set());
  const [applyTeachers, setApplyTeachers] = useState<Record<number, string>>({});
  const [applyRunning, setApplyRunning] = useState(false);
  const [applyRows, setApplyRows] = useState<{ label: string; status: ApplyRowStatus }[]>([]);
  const [applyDone, setApplyDone] = useState(false);

  const [actionMsg, setActionMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  function flash(type: 'success' | 'error', text: string) {
    setActionMsg({ type, text });
    setTimeout(() => setActionMsg(null), 4000);
  }

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      try {
        const [cls, subs, users] = await Promise.all([classesApi.list(), subjectsApi.list(), usersApi.list()]);
        setClasses(cls);
        setSubjects(subs);
        setTeachers(users.filter(u => u.role === 'teacher'));
      } catch {
        flash('error', 'Failed to load data.');
      } finally {
        setLoading(false);
      }
    };
    init();
  }, []);

  function saveSets(next: SubjectSet[]) {
    setSets(next);
    localStorage.setItem(LS_KEY, JSON.stringify(next));
  }

  function handleCreateSet() {
    setCreateError(null);
    if (!createName.trim()) { setCreateError('Name is required.'); return; }
    if (createSelected.size === 0) { setCreateError('Select at least one subject.'); return; }
    if (sets.some(s => s.name.toLowerCase() === createName.trim().toLowerCase())) {
      setCreateError('A set with this name already exists.');
      return;
    }
    const newSet: SubjectSet = { id: crypto.randomUUID(), name: createName.trim(), subjectIds: [...createSelected] };
    saveSets([...sets, newSet]);
    flash('success', `Set "${newSet.name}" created.`);
    setShowCreate(false);
    setCreateName('');
    setCreateSelected(new Set());
  }

  function handleDeleteSet(id: string) {
    saveSets(sets.filter(s => s.id !== id));
  }

  function openApply(set: SubjectSet) {
    setApplySet(set);
    setApplyClasses(new Set());
    setApplyTeachers({});
    setApplyRows([]);
    setApplyRunning(false);
    setApplyDone(false);
  }

  async function handleApply() {
    if (!applySet || applyClasses.size === 0) return;
    const classArr = [...applyClasses];
    const rows: { label: string; classId: number; subjectId: number; teacherId?: number; status: ApplyRowStatus }[] = [];
    for (const classId of classArr) {
      const cls = classes.find(c => c.id === classId);
      for (const subjectId of applySet.subjectIds) {
        const sub = subjects.find(s => s.id === subjectId);
        const teacherId = applyTeachers[subjectId] ? parseInt(applyTeachers[subjectId]) : undefined;
        rows.push({ label: `${cls?.name} — ${sub?.name}`, classId, subjectId, teacherId, status: 'pending' });
      }
    }
    setApplyRows(rows.map(r => ({ label: r.label, status: r.status })));
    setApplyRunning(true);
    setApplyDone(false);

    // Fetch existing class_subjects to detect duplicates
    let existingPairs = new Set<string>();
    try {
      const existing = await classSubjectsApi.list({});
      existingPairs = new Set(existing.map((cs: ClassSubject) => `${cs.class_id}:${cs.subject_id}`));
    } catch { /* proceed without duplicate check */ }

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      const key = `${row.classId}:${row.subjectId}`;
      if (existingPairs.has(key)) {
        rows[i] = { ...row, status: 'skipped' };
        setApplyRows(prev => prev.map((r, idx) => idx === i ? { ...r, status: 'skipped' } : r));
        continue;
      }
      setApplyRows(prev => prev.map((r, idx) => idx === i ? { ...r, status: 'creating' } : r));
      try {
        const payload: { class_id: number; subject_id: number; teacher_id?: number } = { class_id: row.classId, subject_id: row.subjectId };
        if (row.teacherId !== undefined) payload.teacher_id = row.teacherId;
        await classSubjectsApi.create(payload as { class_id: number; subject_id: number; teacher_id: number });
        rows[i] = { ...row, status: 'done' };
        setApplyRows(prev => prev.map((r, idx) => idx === i ? { ...r, status: 'done' } : r));
        existingPairs.add(key);
      } catch {
        rows[i] = { ...row, status: 'error' };
        setApplyRows(prev => prev.map((r, idx) => idx === i ? { ...r, status: 'error' } : r));
      }
    }
    setApplyRunning(false);
    setApplyDone(true);
  }

  const applySubjects = applySet ? subjects.filter(s => applySet.subjectIds.includes(s.id)) : [];

  if (loading) return <div className="flex justify-center py-16"><Loader2 className="h-7 w-7 animate-spin text-orange-500" /></div>;

  return (
    <div className="space-y-6">
      {actionMsg && (
        <div className={`rounded-lg px-4 py-3 text-sm border ${actionMsg.type === 'success' ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : 'bg-red-50 border-red-200 text-red-700'}`}>
          {actionMsg.text}
        </div>
      )}

      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-500">{sets.length} set{sets.length !== 1 ? 's' : ''} saved locally</p>
        <button
          onClick={() => { setShowCreate(true); setCreateName(''); setCreateSelected(new Set()); setCreateError(null); }}
          className="flex items-center gap-1.5 bg-orange-500 hover:bg-orange-600 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4" /> New Set
        </button>
      </div>

      {sets.length === 0 ? (
        <div className="bg-white border border-dashed border-slate-300 rounded-2xl py-16 flex flex-col items-center justify-center text-center">
          <Copy className="h-10 w-10 text-slate-300 mb-3" />
          <p className="text-slate-900 font-medium">No subject sets yet</p>
          <p className="text-slate-500 text-sm mt-1">Create a reusable set of subjects, then apply it to multiple classes at once.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {sets.map(set => {
            const setSubjects = subjects.filter(s => set.subjectIds.includes(s.id));
            return (
              <div key={set.id} className="bg-white border border-slate-200 rounded-2xl shadow-sm p-4 flex flex-col gap-3">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-semibold text-slate-800 text-sm">{set.name}</h3>
                  <button onClick={() => handleDeleteSet(set.id)} className="text-slate-300 hover:text-red-400 shrink-0">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                <div className="flex flex-wrap gap-1.5 flex-1">
                  {setSubjects.map(s => (
                    <span key={s.id} className="text-xs bg-orange-50 text-orange-700 px-2 py-0.5 rounded-full">{s.name}</span>
                  ))}
                  {setSubjects.length === 0 && <span className="text-xs text-slate-400">No subjects</span>}
                </div>
                <button
                  onClick={() => openApply(set)}
                  className="w-full text-sm font-medium text-orange-600 border border-orange-200 rounded-lg py-1.5 hover:bg-orange-50 transition-colors"
                >
                  Apply to Classes →
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* Create Set Modal */}
      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md mx-4 border border-slate-200 p-6 flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between mb-4 shrink-0">
              <h3 className="text-lg font-semibold text-slate-800">New Subject Set</h3>
              <button onClick={() => setShowCreate(false)} className="text-slate-400 hover:text-slate-600"><X className="w-5 h-5" /></button>
            </div>
            {createError && <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded px-3 py-2 mb-3 shrink-0">{createError}</p>}
            <div className="mb-3 shrink-0">
              <label className="block text-xs font-medium text-slate-600 mb-1">Set Name *</label>
              <input
                value={createName}
                onChange={e => setCreateName(e.target.value)}
                placeholder="e.g. Grade 7 Core Subjects"
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 bg-white"
              />
            </div>
            <div className="mb-4 flex-1 overflow-y-auto">
              <label className="block text-xs font-medium text-slate-600 mb-2">Select Subjects *</label>
              <div className="space-y-1.5">
                {subjects.map(s => (
                  <label key={s.id} className="flex items-center gap-2.5 px-3 py-2 rounded-lg hover:bg-slate-50 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={createSelected.has(s.id)}
                      onChange={e => {
                        const next = new Set(createSelected);
                        e.target.checked ? next.add(s.id) : next.delete(s.id);
                        setCreateSelected(next);
                      }}
                      className="accent-orange-500"
                    />
                    <span className="text-sm text-slate-700">{s.name}</span>
                    {s.code && <span className="text-xs text-slate-400 ml-auto">{s.code}</span>}
                  </label>
                ))}
              </div>
            </div>
            <div className="flex justify-end gap-3 shrink-0">
              <button onClick={() => setShowCreate(false)} className="px-4 py-2 text-sm font-medium text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">Cancel</button>
              <button onClick={handleCreateSet} className="px-4 py-2 text-sm font-medium text-white bg-orange-500 rounded-lg hover:bg-orange-600 transition-colors">
                Save Set ({createSelected.size} subject{createSelected.size !== 1 ? 's' : ''})
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Apply Set Modal */}
      {applySet && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl mx-4 border border-slate-200 p-6 flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between mb-4 shrink-0">
              <div>
                <h3 className="text-lg font-semibold text-slate-800">Apply — {applySet.name}</h3>
                <p className="text-xs text-slate-500 mt-0.5">{applySubjects.length} subject{applySubjects.length !== 1 ? 's' : ''} will be assigned to each selected class</p>
              </div>
              <button onClick={() => !applyRunning && setApplySet(null)} disabled={applyRunning} className="text-slate-400 hover:text-slate-600 disabled:opacity-40"><X className="w-5 h-5" /></button>
            </div>

            {!applyDone ? (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 flex-1 overflow-y-auto mb-4">
                  {/* Class picker */}
                  <div>
                    <p className="text-xs font-medium text-slate-600 mb-2">Target Classes *</p>
                    <div className="space-y-1 max-h-64 overflow-y-auto border border-slate-100 rounded-xl p-2">
                      {classes.map(c => (
                        <label key={c.id} className="flex items-center gap-2.5 px-2 py-1.5 rounded-lg hover:bg-slate-50 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={applyClasses.has(c.id)}
                            onChange={e => {
                              const next = new Set(applyClasses);
                              e.target.checked ? next.add(c.id) : next.delete(c.id);
                              setApplyClasses(next);
                            }}
                            disabled={applyRunning}
                            className="accent-orange-500"
                          />
                          <span className="text-sm text-slate-700">{c.name}</span>
                          <span className="text-xs text-slate-400 ml-auto">{c.academic_year}</span>
                        </label>
                      ))}
                    </div>
                    <p className="text-xs text-slate-400 mt-1">{applyClasses.size} class{applyClasses.size !== 1 ? 'es' : ''} selected</p>
                  </div>

                  {/* Teacher assignment per subject */}
                  <div>
                    <p className="text-xs font-medium text-slate-600 mb-2">Assign Teachers <span className="text-slate-400 font-normal">(optional)</span></p>
                    <div className="space-y-2">
                      {applySubjects.map(s => (
                        <div key={s.id}>
                          <label className="block text-xs text-slate-500 mb-0.5">{s.name}</label>
                          <select
                            value={applyTeachers[s.id] ?? ''}
                            onChange={e => setApplyTeachers(prev => ({ ...prev, [s.id]: e.target.value }))}
                            disabled={applyRunning}
                            className="w-full border border-slate-200 rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 bg-white disabled:opacity-50"
                          >
                            <option value="">— No teacher —</option>
                            {teachers.map(t => <option key={t.id} value={t.id}>{t.full_name}</option>)}
                          </select>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex justify-end gap-3 shrink-0">
                  <button onClick={() => setApplySet(null)} disabled={applyRunning} className="px-4 py-2 text-sm font-medium text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-40 transition-colors">Cancel</button>
                  <button
                    onClick={handleApply}
                    disabled={applyRunning || applyClasses.size === 0}
                    className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-orange-500 rounded-lg hover:bg-orange-600 disabled:opacity-50 transition-colors"
                  >
                    {applyRunning ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                    {applyRunning ? 'Assigning…' : `Assign to ${applyClasses.size} Class${applyClasses.size !== 1 ? 'es' : ''}`}
                  </button>
                </div>
              </>
            ) : (
              <div className="flex-1 overflow-y-auto space-y-2 mb-4">
                {applyRows.map((row, i) => (
                  <div key={i} className="flex items-center gap-3 px-3 py-2 bg-slate-50 rounded-lg">
                    {row.status === 'done' && <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0" />}
                    {row.status === 'error' && <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />}
                    {row.status === 'skipped' && <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />}
                    {row.status === 'creating' && <Loader2 className="w-4 h-4 animate-spin text-orange-500 shrink-0" />}
                    {row.status === 'pending' && <div className="w-4 h-4 shrink-0" />}
                    <span className="text-sm text-slate-800 flex-1">{row.label}</span>
                    <span className={`text-xs font-medium shrink-0 ${row.status === 'done' ? 'text-green-600' : row.status === 'error' ? 'text-red-500' : row.status === 'skipped' ? 'text-amber-600' : 'text-orange-500'}`}>
                      {row.status === 'done' ? 'Assigned' : row.status === 'error' ? 'Failed' : row.status === 'skipped' ? 'Already exists' : row.status === 'creating' ? 'Assigning…' : 'Pending'}
                    </span>
                  </div>
                ))}
                <div className="flex justify-end mt-3">
                  <button onClick={() => setApplySet(null)} className="px-4 py-2 text-sm font-medium text-white bg-orange-500 rounded-lg hover:bg-orange-600 transition-colors">Done</button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

type Tab = 'classes' | 'subjects' | 'sets' | 'cohort';

export default function AdminAcademicPage() {
  const [activeTab, setActiveTab] = useState<Tab>('classes');

  const tabs: { id: Tab; label: string }[] = [
    { id: 'classes', label: 'Classes' },
    { id: 'subjects', label: 'Subjects' },
    { id: 'sets', label: 'Subject Sets' },
    { id: 'cohort', label: 'Cohort Setup' },
  ];

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Academic Management</h1>
        <p className="text-sm text-slate-500 mt-0.5">Manage classes and subjects offered in the system.</p>
      </div>

      {/* Tab bar */}
      <div className="border-b border-slate-200">
        <nav className="flex gap-6">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`pb-3 text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? 'border-b-2 border-orange-500 text-orange-600'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab content */}
      {activeTab === 'classes' && <ClassesTab />}
      {activeTab === 'subjects' && <SubjectsTab />}
      {activeTab === 'sets' && <SubjectSetsTab />}
      {activeTab === 'cohort' && <CohortSetupTab />}
    </div>
  );
}
