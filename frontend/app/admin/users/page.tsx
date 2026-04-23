'use client';

import { useState, useEffect, useMemo } from 'react';
import PageHeader from '@/components/layouts/PageHeader';
import { usersApi } from '@/lib/api/users';
import { classesApi } from '@/lib/api/classes';
import { User, UserCreate, UserUpdate, UserRole, UserGender } from '@/types/user.types';
import { Class } from '@/types/school.types';
import { ApiError } from '@/lib/api/client';

// ─── Helpers ────────────────────────────────────────────────────────────────

function roleBadge(role: UserRole) {
  const map: Record<UserRole, string> = {
    [UserRole.admin]: 'bg-purple-100 text-purple-700 border border-purple-200',
    [UserRole.teacher]: 'bg-blue-100 text-blue-700 border border-blue-200',
    [UserRole.student]: 'bg-emerald-100 text-emerald-700 border border-emerald-200',
  };
  return map[role] ?? 'bg-slate-100 text-slate-600';
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

// ─── Modal ───────────────────────────────────────────────────────────────────

interface ModalProps {
  user: User | null; // null = create mode
  classes: Class[];
  onClose: () => void;
  onSaved: () => void;
}

function UserModal({ user, classes, onClose, onSaved }: ModalProps) {
  const isCreate = user === null;

  const [fullName, setFullName] = useState(user?.full_name ?? '');
  const [email, setEmail] = useState(user?.email ?? '');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<UserRole>(user?.role ?? UserRole.student);
  const [gender, setGender] = useState<UserGender | ''>(user?.gender ?? '');
  const [classId, setClassId] = useState<number | ''>('');
  const [isHomeTeacher, setIsHomeTeacher] = useState(user?.is_home_teacher ?? false);
  const [isClassMonitor, setIsClassMonitor] = useState(user?.is_class_monitor ?? false);
  const [isActive, setIsActive] = useState(user?.is_active ?? true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSaving(true);

    try {
      if (isCreate) {
        const payload: UserCreate = {
          email,
          full_name: fullName,
          password: password || undefined,
          role,
          gender: gender || null,
          is_home_teacher: role === UserRole.teacher ? isHomeTeacher : false,
          is_class_monitor: role === UserRole.student ? isClassMonitor : false,
        };
        await usersApi.create(payload, role === UserRole.student && classId ? classId : undefined);
      } else {
        const payload: UserUpdate = {
          email,
          full_name: fullName,
          role,
          gender: gender || null,
          is_active: isActive,
          is_home_teacher: role === UserRole.teacher ? isHomeTeacher : false,
          is_class_monitor: role === UserRole.student ? isClassMonitor : false,
        };
        if (password) payload.password = password;
        await usersApi.update(user.id, payload);
      }
      onSaved();
      onClose();
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.data.detail ?? err.data.message ?? 'An error occurred.');
      } else {
        setError('An unexpected error occurred.');
      }
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg mx-4 border border-slate-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <h2 className="text-lg font-semibold text-slate-800">
            {isCreate ? 'Add New User' : 'Edit User'}
          </h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 transition-colors text-xl leading-none"
          >
            &times;
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm">
              {error}
            </div>
          )}

          {/* Full Name */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Full Name</label>
            <input
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent"
              placeholder="Jane Doe"
            />
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
            <input
              required
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent"
              placeholder="jane@example.com"
            />
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Password {!isCreate && <span className="text-slate-400 font-normal">(leave blank to keep)</span>}
            </label>
            <input
              type="password"
              required={isCreate}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent"
              placeholder={isCreate ? 'Enter password' : 'New password (optional)'}
            />
          </div>

          {/* Role */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Role</label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value as UserRole)}
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent bg-white"
            >
              <option value={UserRole.admin}>Admin</option>
              <option value={UserRole.teacher}>Teacher</option>
              <option value={UserRole.student}>Student</option>
            </select>
          </div>

          {/* Gender */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Gender <span className="text-slate-400 font-normal">(optional)</span></label>
            <select
              value={gender}
              onChange={(e) => setGender(e.target.value as UserGender | '')}
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent bg-white"
            >
              <option value="">— Not specified —</option>
              <option value={UserGender.male}>Male</option>
              <option value={UserGender.female}>Female</option>
              <option value={UserGender.other}>Other</option>
            </select>
          </div>

          {/* Class enrollment (students only, create mode only) */}
          {isCreate && role === UserRole.student && (
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Class <span className="text-slate-400 font-normal">(optional)</span>
              </label>
              <select
                value={classId}
                onChange={(e) => setClassId(e.target.value ? Number(e.target.value) : '')}
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent bg-white"
              >
                <option value="">— Enroll later —</option>
                {classes.map((c) => (
                  <option key={c.id} value={c.id}>{c.name} ({c.academic_year})</option>
                ))}
              </select>
              <p className="text-xs text-slate-400 mt-1">Teacher assignments are managed in Cohort Setup.</p>
            </div>
          )}

          {/* Conditional flags */}
          {role === UserRole.teacher && (
            <label className="flex items-center gap-2 text-sm text-slate-700 cursor-pointer">
              <input
                type="checkbox"
                checked={isHomeTeacher}
                onChange={(e) => setIsHomeTeacher(e.target.checked)}
                className="accent-orange-500"
              />
              Home Teacher
            </label>
          )}
          {role === UserRole.student && (
            <label className="flex items-center gap-2 text-sm text-slate-700 cursor-pointer">
              <input
                type="checkbox"
                checked={isClassMonitor}
                onChange={(e) => setIsClassMonitor(e.target.checked)}
                className="accent-orange-500"
              />
              Class Monitor
            </label>
          )}

          {/* Active (edit only) */}
          {!isCreate && (
            <label className="flex items-center gap-2 text-sm text-slate-700 cursor-pointer">
              <input
                type="checkbox"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
                className="accent-orange-500"
              />
              Active
            </label>
          )}

          {/* Footer buttons */}
          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-4 py-2 text-sm font-medium text-white bg-orange-500 rounded-lg hover:bg-orange-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? 'Saving...' : isCreate ? 'Create User' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Main Page ───────────────────────────────────────────────────────────────

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [classes, setClasses] = useState<Class[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<UserRole | 'all'>('all');
  const [page, setPage] = useState(0);
  const pageSize = 50;
  const [modalUser, setModalUser] = useState<User | null | undefined>(undefined); // undefined=closed, null=create
  const [deleteTarget, setDeleteTarget] = useState<User | null>(null);
  const [resetResult, setResetResult] = useState<{ user: User; tempPassword: string } | null>(null);
  const [importResult, setImportResult] = useState<{
    created: number; skipped: number; errors: number;
    created_rows: Array<{ full_name: string; email: string; temp_password: string; class_name: string | null }>;
  } | null>(null);
  const [actionMsg, setActionMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  async function fetchUsers() {
    setLoading(true);
    setError(null);
    try {
      const data = await usersApi.list();
      setUsers(data);
    } catch {
      setError('Failed to load users. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchUsers();
    classesApi.list().then(setClasses).catch(() => {});
  }, []);

  // Stats
  const stats = useMemo(() => ({
    total: users.length,
    students: users.filter((u) => u.role === UserRole.student).length,
    teachers: users.filter((u) => u.role === UserRole.teacher).length,
    admins: users.filter((u) => u.role === UserRole.admin).length,
  }), [users]);

  // Filtered list
  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return users.filter((u) => {
      const matchesSearch =
        u.full_name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q);
      const matchesRole = roleFilter === 'all' || u.role === roleFilter;
      return matchesSearch && matchesRole;
    });
  }, [users, search, roleFilter]);

  // Reset to first page when filters change
  useEffect(() => {
    setPage(0);
  }, [search, roleFilter]);

  // Pagination
  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const paginatedUsers = filtered.slice(page * pageSize, (page + 1) * pageSize);

  async function handleDelete(user: User) {
    try {
      await usersApi.delete(user.id);
      setUsers((prev) => prev.filter((u) => u.id !== user.id));
      setActionMsg({ type: 'success', text: `User "${user.full_name}" deleted.` });
    } catch {
      setActionMsg({ type: 'error', text: 'Failed to delete user.' });
    } finally {
      setDeleteTarget(null);
      setTimeout(() => setActionMsg(null), 4000);
    }
  }

  async function handleResetPassword(user: User) {
    try {
      const result = await usersApi.resetPassword(user.id);
      setResetResult({ user, tempPassword: result.temp_password });
    } catch {
      setActionMsg({ type: 'error', text: 'Failed to reset password.' });
      setTimeout(() => setActionMsg(null), 4000);
    }
  }

  async function handleImport(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const result = await usersApi.importCsv(file);
      setImportResult(result);
      fetchUsers();
    } catch {
      setActionMsg({ type: 'error', text: 'Failed to import CSV.' });
      setTimeout(() => setActionMsg(null), 4000);
    }
    // Reset file input
    e.target.value = '';
  }

  function handleSaved() {
    fetchUsers();
    setActionMsg({ type: 'success', text: 'User saved successfully.' });
    setTimeout(() => setActionMsg(null), 4000);
  }

  const statCards = [
    { label: 'Total Users', value: stats.total, color: 'text-slate-700', bg: 'bg-slate-100' },
    { label: 'Students', value: stats.students, color: 'text-emerald-700', bg: 'bg-emerald-50' },
    { label: 'Teachers', value: stats.teachers, color: 'text-blue-700', bg: 'bg-blue-50' },
    { label: 'Admins', value: stats.admins, color: 'text-purple-700', bg: 'bg-purple-50' },
  ];

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      <PageHeader
        title="User Management"
        subtitle="Manage all system accounts and roles."
        actions={<>
          <label className="flex items-center gap-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-sm font-medium px-4 py-2 rounded-lg transition-colors shadow-sm cursor-pointer">
            <span className="text-base leading-none">&#8593;</span>
            Import CSV
            <input type="file" accept=".csv" onChange={handleImport} className="hidden" />
          </label>
          <button
            onClick={() => setModalUser(null)}
            className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors shadow-sm"
          >
            <span className="text-base leading-none">+</span>
            Add User
          </button>
        </>}
      />

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

      {/* Stats row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {statCards.map((s) => (
          <div
            key={s.label}
            className="border border-slate-200 rounded-2xl shadow-sm bg-white px-5 py-4"
          >
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">{s.label}</p>
            <p className={`text-3xl font-bold mt-1 ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Search + filter */}
      <div className="flex flex-col sm:flex-row gap-3">
        <input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name or email..."
          className="flex-1 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent"
        />
        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value as UserRole | 'all')}
          className="border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent bg-white"
        >
          <option value="all">All Roles</option>
          <option value={UserRole.admin}>Admin</option>
          <option value={UserRole.teacher}>Teacher</option>
          <option value={UserRole.student}>Student</option>
        </select>
      </div>

      {/* Table */}
      <div className="border border-slate-200 rounded-2xl shadow-sm bg-white overflow-hidden">
        {loading ? (
          <div className="py-16 text-center text-slate-400 text-sm">Loading users...</div>
        ) : error ? (
          <div className="py-16 text-center text-red-500 text-sm">{error}</div>
        ) : filtered.length === 0 ? (
          <div className="py-16 text-center text-slate-400 text-sm">No users found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50">
                  <th className="text-left px-4 py-3 font-semibold text-slate-600 w-10">#</th>
                  <th className="text-left px-4 py-3 font-semibold text-slate-600">Name</th>
                  <th className="text-left px-4 py-3 font-semibold text-slate-600">Email</th>
                  <th className="text-left px-4 py-3 font-semibold text-slate-600">Role</th>
                  <th className="text-left px-4 py-3 font-semibold text-slate-600">Gender</th>
                  <th className="text-left px-4 py-3 font-semibold text-slate-600">Status</th>
                  <th className="text-left px-4 py-3 font-semibold text-slate-600">Flags</th>
                  <th className="text-left px-4 py-3 font-semibold text-slate-600">Created</th>
                  <th className="text-right px-4 py-3 font-semibold text-slate-600">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {paginatedUsers.map((u, idx) => (
                  <tr key={u.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3 text-slate-400">{page * pageSize + idx + 1}</td>
                    <td className="px-4 py-3 font-medium text-slate-800">{u.full_name}</td>
                    <td className="px-4 py-3 text-slate-500">{u.email}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${roleBadge(u.role)}`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-500 text-sm capitalize">
                      {u.gender ?? <span className="text-slate-300">—</span>}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                          u.is_active
                            ? 'bg-green-50 text-green-700 border border-green-200'
                            : 'bg-red-50 text-red-600 border border-red-200'
                        }`}
                      >
                        {u.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-500 text-xs space-x-1">
                      {u.is_home_teacher && (
                        <span className="bg-amber-50 text-amber-700 border border-amber-200 rounded px-1.5 py-0.5 font-medium">
                          HT
                        </span>
                      )}
                      {u.is_class_monitor && (
                        <span className="bg-sky-50 text-sky-700 border border-sky-200 rounded px-1.5 py-0.5 font-medium">
                          CM
                        </span>
                      )}
                      {!u.is_home_teacher && !u.is_class_monitor && (
                        <span className="text-slate-300">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-slate-400 whitespace-nowrap">
                      {formatDate(u.created_at)}
                    </td>
                    <td className="px-4 py-3 text-right space-x-2 whitespace-nowrap">
                      <button
                        onClick={() => setModalUser(u)}
                        className="text-blue-600 hover:text-blue-800 font-medium text-xs border border-blue-200 rounded px-2.5 py-1 hover:bg-blue-50 transition-colors"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleResetPassword(u)}
                        className="text-amber-600 hover:text-amber-800 font-medium text-xs border border-amber-200 rounded px-2.5 py-1 hover:bg-amber-50 transition-colors"
                      >
                        Reset PW
                      </button>
                      <button
                        onClick={() => setDeleteTarget(u)}
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

      {/* Pagination */}
      {filtered.length > pageSize && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-sm text-slate-500">
            Showing {page * pageSize + 1}–{Math.min((page + 1) * pageSize, filtered.length)} of{' '}
            {filtered.length} user{filtered.length !== 1 ? 's' : ''}
          </p>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setPage(0)}
              disabled={page === 0}
              className="px-2.5 py-1.5 text-xs font-medium border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              First
            </button>
            <button
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              disabled={page === 0}
              className="px-3 py-1.5 text-xs font-medium border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              Prev
            </button>

            {Array.from({ length: totalPages }, (_, i) => i)
              .filter((i) => i === 0 || i === totalPages - 1 || Math.abs(i - page) <= 1)
              .reduce<(number | 'ellipsis')[]>((acc, i, idx, arr) => {
                if (idx > 0 && i - (arr[idx - 1] as number) > 1) acc.push('ellipsis');
                acc.push(i);
                return acc;
              }, [])
              .map((item, idx) =>
                item === 'ellipsis' ? (
                  <span key={`e-${idx}`} className="px-1.5 text-slate-400 text-xs">...</span>
                ) : (
                  <button
                    key={item}
                    onClick={() => setPage(item)}
                    className={`min-w-[32px] py-1.5 text-xs font-medium rounded-lg border transition-colors ${
                      page === item
                        ? 'bg-orange-500 text-white border-orange-500'
                        : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    {item + 1}
                  </button>
                )
              )}

            <button
              onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
              disabled={page >= totalPages - 1}
              className="px-3 py-1.5 text-xs font-medium border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              Next
            </button>
            <button
              onClick={() => setPage(totalPages - 1)}
              disabled={page >= totalPages - 1}
              className="px-2.5 py-1.5 text-xs font-medium border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              Last
            </button>
          </div>
        </div>
      )}

      {/* Create/Edit modal */}
      {modalUser !== undefined && (
        <UserModal
          user={modalUser}
          classes={classes}
          onClose={() => setModalUser(undefined)}
          onSaved={handleSaved}
        />
      )}

      {/* Import result modal */}
      {importResult && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl mx-4 border border-slate-200 max-h-[80vh] flex flex-col">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-slate-800">Import Results</h3>
              <button onClick={() => setImportResult(null)} className="text-slate-400 hover:text-slate-600 text-xl">&times;</button>
            </div>
            <div className="px-6 py-4 space-y-4 overflow-y-auto">
              <div className="flex gap-4">
                <div className="bg-emerald-50 border border-emerald-200 rounded-lg px-4 py-2 flex-1 text-center">
                  <p className="text-2xl font-bold text-emerald-700">{importResult.created}</p>
                  <p className="text-xs text-emerald-600">Created</p>
                </div>
                <div className="bg-amber-50 border border-amber-200 rounded-lg px-4 py-2 flex-1 text-center">
                  <p className="text-2xl font-bold text-amber-700">{importResult.skipped}</p>
                  <p className="text-xs text-amber-600">Skipped</p>
                </div>
                <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-2 flex-1 text-center">
                  <p className="text-2xl font-bold text-red-700">{importResult.errors}</p>
                  <p className="text-xs text-red-600">Errors</p>
                </div>
              </div>

              {importResult.created_rows.length > 0 && (
                <div>
                  <p className="text-sm font-semibold text-slate-700 mb-2">Created Accounts (save these credentials):</p>
                  <div className="border border-slate-200 rounded-lg overflow-hidden">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="bg-slate-50 border-b border-slate-200">
                          <th className="text-left px-3 py-2 font-medium text-slate-600">Name</th>
                          <th className="text-left px-3 py-2 font-medium text-slate-600">Email</th>
                          <th className="text-left px-3 py-2 font-medium text-slate-600">Temp Password</th>
                          <th className="text-left px-3 py-2 font-medium text-slate-600">Class</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {importResult.created_rows.map((r, i) => (
                          <tr key={i} className="hover:bg-slate-50">
                            <td className="px-3 py-2 text-slate-800">{r.full_name}</td>
                            <td className="px-3 py-2 text-slate-500 font-mono text-xs">{r.email}</td>
                            <td className="px-3 py-2 font-mono text-xs select-all text-amber-700">{r.temp_password}</td>
                            <td className="px-3 py-2 text-slate-500">{r.class_name ?? '—'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
            <div className="px-6 py-4 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => setImportResult(null)}
                className="px-4 py-2 text-sm font-medium text-white bg-orange-500 rounded-lg hover:bg-orange-600"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Password reset result modal */}
      {resetResult && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm mx-4 border border-slate-200 p-6 space-y-4">
            <h3 className="text-lg font-semibold text-slate-800">Password Reset</h3>
            <p className="text-sm text-slate-600">
              Password for <span className="font-semibold text-slate-800">{resetResult.user.full_name}</span> has been reset.
            </p>
            <div className="bg-amber-50 border border-amber-200 rounded-lg px-4 py-3">
              <p className="text-xs font-medium text-amber-700 mb-1">Temporary Password</p>
              <p className="text-lg font-mono font-bold text-amber-900 select-all">{resetResult.tempPassword}</p>
              <p className="text-xs text-amber-600 mt-1">The user will be required to change this on next login.</p>
            </div>
            <div className="flex justify-end">
              <button
                onClick={() => setResetResult(null)}
                className="px-4 py-2 text-sm font-medium text-white bg-orange-500 rounded-lg hover:bg-orange-600 transition-colors"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete confirm modal */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm mx-4 border border-slate-200 p-6 space-y-4">
            <h3 className="text-lg font-semibold text-slate-800">Delete User</h3>
            <p className="text-sm text-slate-600">
              Are you sure you want to delete{' '}
              <span className="font-semibold text-slate-800">{deleteTarget.full_name}</span>? This
              action cannot be undone.
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
