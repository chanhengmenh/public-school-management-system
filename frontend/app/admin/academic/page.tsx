'use client';

import { useState, useEffect } from 'react';
import { classesApi } from '@/lib/api/classes';
import { subjectsApi } from '@/lib/api/subjects';
import { client } from '@/lib/api/client';
import { Class, Subject } from '@/types/school.types';
import { ApiError } from '@/lib/api/client';

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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionMsg, setActionMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Form state
  const [showForm, setShowForm] = useState(false);
  const [formName, setFormName] = useState('');
  const [formYear, setFormYear] = useState('');
  const [formTeacherId, setFormTeacherId] = useState('');
  const [formSaving, setFormSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Delete confirm
  const [deleteTarget, setDeleteTarget] = useState<Class | null>(null);

  async function fetchClasses() {
    setLoading(true);
    setError(null);
    try {
      const data = await classesApi.list();
      setClasses(data);
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
      if (formTeacherId.trim() !== '') {
        const parsed = parseInt(formTeacherId, 10);
        if (isNaN(parsed)) {
          setFormError('Home Teacher ID must be a number.');
          setFormSaving(false);
          return;
        }
        payload.home_teacher_id = parsed;
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
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-1.5 bg-orange-500 hover:bg-orange-600 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors shadow-sm"
          >
            <span className="text-base leading-none">+</span> Add Class
          </button>
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
              <label className="block text-xs font-medium text-slate-600 mb-1">Home Teacher ID</label>
              <input
                type="number"
                value={formTeacherId}
                onChange={(e) => setFormTeacherId(e.target.value)}
                placeholder="Optional"
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent bg-white"
              />
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
                  <th className="text-left px-4 py-3 font-semibold text-slate-600">Home Teacher ID</th>
                  <th className="text-right px-4 py-3 font-semibold text-slate-600">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {classes.map((cls) => (
                  <tr key={cls.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3 text-slate-400">{cls.id}</td>
                    <td className="px-4 py-3 font-medium text-slate-800">{cls.name}</td>
                    <td className="px-4 py-3 text-slate-500">{cls.academic_year}</td>
                    <td className="px-4 py-3 text-slate-500">
                      {cls.home_teacher_id ?? <span className="text-slate-300">—</span>}
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
          <form onSubmit={handleCreate} className="grid grid-cols-1 sm:grid-cols-3 gap-3">
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
                  <th className="text-left px-4 py-3 font-semibold text-slate-600">Code</th>
                  <th className="text-left px-4 py-3 font-semibold text-slate-600">Name</th>
                  <th className="text-left px-4 py-3 font-semibold text-slate-600">Description</th>
                  <th className="text-right px-4 py-3 font-semibold text-slate-600">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {subjects.map((sub) => (
                  <tr key={sub.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3 text-slate-400">{sub.id}</td>
                    <td className="px-4 py-3">
                      <span className="bg-slate-100 text-slate-600 font-mono text-xs px-2 py-0.5 rounded">
                        {sub.code}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-medium text-slate-800">{sub.name}</td>
                    <td className="px-4 py-3 text-slate-500 max-w-xs truncate">
                      {sub.description || <span className="text-slate-300">—</span>}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => setDeleteTarget(sub)}
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

// ─── Main Page ────────────────────────────────────────────────────────────────

type Tab = 'classes' | 'subjects';

export default function AdminAcademicPage() {
  const [activeTab, setActiveTab] = useState<Tab>('classes');

  const tabs: { id: Tab; label: string }[] = [
    { id: 'classes', label: 'Classes' },
    { id: 'subjects', label: 'Subjects' },
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
    </div>
  );
}
