'use client';

import React, { useState } from 'react';
import PageHeader from '@/components/layouts/PageHeader';
import {
    Search,
    Filter,
    Plus,
    MoreVertical,
    Shield,
    GraduationCap,
    BookOpen,
    Key,
    Edit,
    Trash2,
    X,
    CheckCircle2,
    UserPlus,
    RefreshCw,
    Home,
    Star,
} from 'lucide-react';

// --- Types ---
type UserRole = 'Student' | 'Class Monitor' | 'Teacher' | 'Home-Class Teacher';
type UserStatus = 'Active' | 'Pending' | 'Suspended';

interface UserRecord {
    id: string;
    name: string;
    email: string;
    role: UserRole;
    status: UserStatus;
    joinDate: string;
    className?: string;
}

// --- Initial Dummy Data ---
const INITIAL_USERS: UserRecord[] = [
    { id: 'TCH-005', name: 'Mr. David Kim', email: 'david.kim@school.edu', role: 'Home-Class Teacher', status: 'Active', joinDate: '2024-01-15' },
    { id: 'TCH-001', name: 'Mr. Tan Wei', email: 'tan.wei@school.edu', role: 'Teacher', status: 'Active', joinDate: '2024-03-10' },
    { id: 'TCH-002', name: 'Ms. Sarah Lee', email: 'sarah.lee@school.edu', role: 'Teacher', status: 'Active', joinDate: '2024-06-22' },
    { id: 'STU-001', name: 'Alex Johnson', email: 'alex.j@student.edu', role: 'Student', status: 'Active', joinDate: '2025-01-08', className: '11A' },
    { id: 'STU-004', name: 'Linda Choo', email: 'linda.c@student.edu', role: 'Class Monitor', status: 'Active', joinDate: '2025-01-10', className: '11A' },
    { id: 'STU-002', name: 'Emily Chen', email: 'emily.c@student.edu', role: 'Student', status: 'Active', joinDate: '2025-01-12', className: '11A' },
    { id: 'TCH-003', name: 'Dr. Marcus Rivera', email: 'marcus.r@school.edu', role: 'Teacher', status: 'Pending', joinDate: '2025-03-01' },
    { id: 'TCH-004', name: 'Ms. Priya Nair', email: 'priya.n@school.edu', role: 'Teacher', status: 'Pending', joinDate: '2025-03-05' },
    { id: 'STU-003', name: 'James Smith', email: 'james.s@student.edu', role: 'Student', status: 'Suspended', joinDate: '2025-02-18', className: '10B' },
];

// --- Config ---
const roleConfig: Record<UserRole, { icon: typeof Shield; colorClass: string }> = {
    'Student': { icon: GraduationCap, colorClass: 'text-slate-600' },
    'Class Monitor': { icon: Star, colorClass: 'text-amber-600' },
    'Teacher': { icon: BookOpen, colorClass: 'text-indigo-600' },
    'Home-Class Teacher': { icon: Home, colorClass: 'text-teal-600' },
};

const statusConfig: Record<UserStatus, string> = {
    Active: 'bg-green-50 text-green-700 border-green-200',
    Pending: 'bg-amber-50 text-amber-700 border-amber-200',
    Suspended: 'bg-red-50 text-red-700 border-red-200',
};

const CLASS_OPTIONS = ['None', '10A', '10B', '11A', '11B', '12A', '12B'];

// --- Helpers ---
const getInitials = (name: string) => {
    const parts = name.split(' ');
    if (parts.length >= 2) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    return name.substring(0, 2).toUpperCase();
};

const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
};

const getTodayISO = () => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

const generatePassword = (): string => {
    const upper = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const lower = 'abcdefghijklmnopqrstuvwxyz';
    const digits = '0123456789';
    const symbols = '!@#$%&*?';
    const all = upper + lower + digits + symbols;
    const required = [
        upper[Math.floor(Math.random() * upper.length)],
        lower[Math.floor(Math.random() * lower.length)],
        digits[Math.floor(Math.random() * digits.length)],
        symbols[Math.floor(Math.random() * symbols.length)],
    ];
    const rest = Array.from({ length: 12 }, () => all[Math.floor(Math.random() * all.length)]);
    const chars = [...required, ...rest];
    for (let i = chars.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [chars[i], chars[j]] = [chars[j], chars[i]];
    }
    return chars.join('');
};

// Shared input class
const inputClass = "w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 transition-all font-medium text-slate-900 placeholder:font-normal placeholder:text-slate-400";
const selectClass = `${inputClass} appearance-none cursor-pointer bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20width%3D%2224%22%20height%3D%2224%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cpath%20d%3D%22M7%2010L12%2015L17%2010%22%20stroke%3D%22%2364748B%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%2F%3E%3C%2Fsvg%3E')] bg-[length:20px] bg-[right_12px_center] bg-no-repeat pr-10`;

export default function AdminUsersPage() {
    // --- Core State ---
    const [users, setUsers] = useState<UserRecord[]>(INITIAL_USERS);
    const [searchQuery, setSearchQuery] = useState('');
    const [roleFilter, setRoleFilter] = useState('All');

    // --- Add Modal State ---
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [formId, setFormId] = useState('');
    const [formName, setFormName] = useState('');
    const [formEmail, setFormEmail] = useState('');
    const [formPassword, setFormPassword] = useState(generatePassword);
    const [formClass, setFormClass] = useState('None');
    const [formRole, setFormRole] = useState<UserRole>('Student');

    // --- Edit Modal State ---
    const [editingUser, setEditingUser] = useState<UserRecord | null>(null);
    const [editFormName, setEditFormName] = useState('');
    const [editFormEmail, setEditFormEmail] = useState('');
    const [editFormRole, setEditFormRole] = useState<UserRole>('Student');
    const [editFormStatus, setEditFormStatus] = useState<UserStatus>('Pending');
    const [editFormClass, setEditFormClass] = useState('None');

    // --- Delete State ---
    const [deleteTarget, setDeleteTarget] = useState<UserRecord | null>(null);

    // --- Duplicate ID Check ---
    const isDuplicateId = formId.trim() !== '' && users.some(u => u.id.toLowerCase() === formId.trim().toLowerCase());

    // --- Toast State ---
    const [toast, setToast] = useState<{ show: boolean; name: string; type: 'created' | 'updated' | 'deleted' }>({ show: false, name: '', type: 'created' });

    // --- Filtering ---
    const filteredUsers = users.filter(user => {
        const matchesSearch = searchQuery === '' ||
            user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
            user.id.toLowerCase().includes(searchQuery.toLowerCase());

        const matchesRole = roleFilter === 'All' ||
            (roleFilter === 'Students' && (user.role === 'Student' || user.role === 'Class Monitor')) ||
            (roleFilter === 'Teachers' && (user.role === 'Teacher' || user.role === 'Home-Class Teacher'));

        return matchesSearch && matchesRole;
    });

    const pendingCount = users.filter(u => u.status === 'Pending').length;

    // --- Handlers ---
    const handleOpenAddModal = () => {
        setFormId('');
        setFormName('');
        setFormEmail('');
        setFormPassword(generatePassword());
        setFormClass('None');
        setFormRole('Student');
        setIsAddModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsAddModalOpen(false);
    };

    const handleCreateUser = () => {
        if (!formId.trim() || !formName.trim() || !formEmail.trim() || isDuplicateId) return;

        const newUser: UserRecord = {
            id: formId.trim(),
            name: formName.trim(),
            email: formEmail.trim(),
            role: formRole,
            status: 'Pending',
            joinDate: getTodayISO(),
            className: (formRole === 'Student' || formRole === 'Class Monitor') && formClass !== 'None' ? formClass : undefined,
        };

        setUsers(prev => [newUser, ...prev]);
        setIsAddModalOpen(false);

        // Show toast
        setToast({ show: true, name: formName.trim(), type: 'created' });
        setTimeout(() => setToast({ show: false, name: '', type: 'created' }), 3500);
    };

    const handleStartEdit = (user: UserRecord) => {
        setEditingUser(user);
        setEditFormName(user.name);
        setEditFormEmail(user.email);
        setEditFormRole(user.role);
        setEditFormStatus(user.status);
        setEditFormClass(user.className || 'None');
    };

    const handleCancelEdit = () => {
        setEditingUser(null);
    };

    const handleSaveEdit = () => {
        if (!editingUser || !editFormName.trim() || !editFormEmail.trim()) return;

        // Confirmation before saving
        if (!window.confirm(`Are you sure you want to save changes to ${editFormName.trim()}?`)) return;

        const updatedUser: UserRecord = {
            ...editingUser,
            name: editFormName.trim(),
            email: editFormEmail.trim(),
            role: editFormRole,
            status: editFormStatus,
            className: (editFormRole === 'Student' || editFormRole === 'Class Monitor') && editFormClass !== 'None' ? editFormClass : undefined,
        };

        setUsers(prev => prev.map(u => u.id === editingUser.id ? updatedUser : u));
        setEditingUser(null);

        // Show toast
        setToast({ show: true, name: editFormName.trim(), type: 'updated' });
        setTimeout(() => setToast({ show: false, name: '', type: 'updated' }), 3500);
    };

    const handleConfirmDelete = () => {
        if (!deleteTarget) return;

        setUsers(prev => prev.filter(u => u.id !== deleteTarget.id));
        const deletedName = deleteTarget.name;
        setDeleteTarget(null);

        // Show toast
        setToast({ show: true, name: deletedName, type: 'deleted' });
        setTimeout(() => setToast({ show: false, name: '', type: 'deleted' }), 3500);
    };

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col">
            <PageHeader 
                title="User Management"
                subtitle="Manage students, teachers, and staff accounts"
                badge={pendingCount > 0 ? `${pendingCount} Pending` : undefined}
            />

            {/* Main Content */}
            <div className="max-w-7xl mx-auto w-full px-6 lg:px-8 py-8 flex flex-col gap-6">

                {/* Action & Filter Bar */}
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                    {/* Left: Search & Filter */}
                    <div className="flex items-center gap-3 flex-wrap">
                        {/* Search */}
                        <div className="relative">
                            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                            <input
                                type="text"
                                placeholder="Search users..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-64 bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 transition-all"
                            />
                        </div>

                        {/* Role Filter */}
                        <div className="relative">
                            <Filter className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                            <select
                                value={roleFilter}
                                onChange={(e) => setRoleFilter(e.target.value)}
                                className="bg-white border border-slate-200 rounded-xl pl-10 pr-8 py-2.5 text-sm text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 transition-all appearance-none cursor-pointer bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20width%3D%2224%22%20height%3D%2224%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cpath%20d%3D%22M7%2010L12%2015L17%2010%22%20stroke%3D%22%2364748B%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%2F%3E%3C%2Fsvg%3E')] bg-[length:20px] bg-[right_8px_center] bg-no-repeat"
                            >
                                <option value="All">All Roles</option>
                                <option value="Students">Students</option>
                                <option value="Teachers">Teachers</option>
                            </select>
                        </div>
                    </div>

                    {/* Right: Add User */}
                    <button
                        onClick={handleOpenAddModal}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl text-sm font-bold shadow-sm transition-all flex items-center gap-2 active:scale-95 shrink-0"
                    >
                        <Plus className="w-4 h-4" />
                        Add New User
                    </button>
                </div>

                {/* Results Info */}
                <div className="flex items-center justify-between">
                    <p className="text-sm text-slate-500">
                        Showing <span className="font-bold text-slate-700">{filteredUsers.length}</span> of <span className="font-bold text-slate-700">{users.length}</span> users
                    </p>
                </div>

                {/* User Data Table */}
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            {/* Table Header */}
                            <thead>
                                <tr className="bg-slate-50 border-b border-slate-200">
                                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">User</th>
                                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Role</th>
                                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
                                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Date Added</th>
                                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Actions</th>
                                </tr>
                            </thead>

                            {/* Table Body */}
                            <tbody>
                                {filteredUsers.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="px-6 py-16 text-center">
                                            <div className="flex flex-col items-center">
                                                <Search className="w-10 h-10 text-slate-300 mb-3" />
                                                <p className="text-sm font-bold text-slate-900 mb-1">No users found</p>
                                                <p className="text-xs text-slate-500">Try adjusting your search or filter criteria.</p>
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    filteredUsers.map((user) => {
                                        const role = roleConfig[user.role];

                                        return (
                                            <tr
                                                key={user.id}
                                                className="hover:bg-slate-50/50 border-b border-slate-100 transition-colors last:border-b-0"
                                            >
                                                {/* User Cell */}
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-10 h-10 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center text-sm font-bold shrink-0">
                                                            {getInitials(user.name)}
                                                        </div>
                                                        <div className="flex flex-col min-w-0">
                                                            <span className="text-sm font-bold text-slate-900 truncate">{user.name}</span>
                                                            <div className="flex items-center gap-2">
                                                                <span className="text-xs text-slate-500 truncate">{user.email}</span>
                                                                {user.className && (
                                                                    <span className="text-[10px] font-bold bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded">
                                                                        {user.className}
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </td>

                                                <td className="px-6 py-4">
                                                    <span className={`text-sm font-medium ${role.colorClass}`}>
                                                        {user.role}
                                                    </span>
                                                </td>

                                                {/* Status Cell */}
                                                <td className="px-6 py-4">
                                                    <span className={`inline-flex items-center px-2.5 py-1 text-xs font-bold rounded-full border ${statusConfig[user.status]}`}>
                                                        {user.status}
                                                    </span>
                                                </td>

                                                {/* Date Added Cell */}
                                                <td className="px-6 py-4">
                                                    <span className="text-sm text-slate-600">{formatDate(user.joinDate)}</span>
                                                </td>

                                                {/* Actions Cell */}
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center justify-end gap-1">
                                                        <button
                                                            title="Edit user"
                                                            onClick={() => handleStartEdit(user)}
                                                            className="p-2 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                                                        >
                                                            <Edit className="w-4 h-4" />
                                                        </button>
                                                        <button
                                                            title="Delete user"
                                                            onClick={() => setDeleteTarget(user)}
                                                            className="p-2 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Table Footer */}
                <div className="flex items-center justify-between text-sm text-slate-500 px-2">
                    <span>{filteredUsers.length} user(s) displayed</span>
                    <div className="flex items-center gap-2">
                        <button className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 font-medium text-xs transition-colors disabled:opacity-40" disabled>
                            Previous
                        </button>
                        <span className="px-3 py-1.5 rounded-lg bg-indigo-600 text-white font-bold text-xs">1</span>
                        <button className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 font-medium text-xs transition-colors disabled:opacity-40" disabled>
                            Next
                        </button>
                    </div>
                </div>

            </div>

            {/* ========== ADD NEW USER MODAL ========== */}
            {isAddModalOpen && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
                    <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl flex flex-col my-auto max-h-[90vh] overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">

                        {/* Modal Header */}
                        <div className="flex items-center justify-between p-6 border-b border-slate-100 sticky top-0 bg-white z-10 rounded-t-3xl">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                                    <UserPlus className="w-5 h-5" />
                                </div>
                                <div>
                                    <h2 className="text-lg font-bold text-slate-900">Add New User</h2>
                                    <p className="text-xs text-slate-500">Create a new student, teacher, or admin account</p>
                                </div>
                            </div>
                            <button onClick={handleCloseModal} className="p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700 rounded-full transition-colors">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Modal Body */}
                        <div className="p-6 flex flex-col gap-5">

                            {/* Row 1: User ID & Role */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="flex flex-col gap-2">
                                    <label className="text-sm font-bold text-slate-700">User ID <span className="text-red-500">*</span></label>
                                    <input
                                        type="text"
                                        value={formId}
                                        onChange={(e) => setFormId(e.target.value)}
                                        placeholder="e.g. STU-2025-049"
                                        className={`${inputClass} ${isDuplicateId ? '!border-red-400 !ring-2 !ring-red-500/20' : ''}`}
                                    />
                                    {isDuplicateId && (
                                        <p className="text-xs font-medium text-red-500">This ID is already in use</p>
                                    )}
                                </div>
                                <div className="flex flex-col gap-2">
                                    <label className="text-sm font-bold text-slate-700">Role <span className="text-red-500">*</span></label>
                                    <select
                                        value={formRole}
                                        onChange={(e) => {
                                            setFormRole(e.target.value as UserRole);
                                            if (e.target.value !== 'Student' && e.target.value !== 'Class Monitor') setFormClass('None');
                                        }}
                                        className={selectClass}
                                    >
                                        <option value="Student">Student</option>
                                        <option value="Class Monitor">Class Monitor</option>
                                        <option value="Teacher">Teacher</option>
                                        <option value="Home-Class Teacher">Home-Class Teacher</option>
                                    </select>
                                </div>
                            </div>

                            {/* Row 2: Full Name */}
                            <div className="flex flex-col gap-2">
                                <label className="text-sm font-bold text-slate-700">Full Name <span className="text-red-500">*</span></label>
                                <input
                                    type="text"
                                    value={formName}
                                    onChange={(e) => setFormName(e.target.value)}
                                    placeholder="e.g. John Doe"
                                    className={inputClass}
                                />
                            </div>

                            {/* Row 3: Email */}
                            <div className="flex flex-col gap-2">
                                <label className="text-sm font-bold text-slate-700">Email Address <span className="text-red-500">*</span></label>
                                <input
                                    type="email"
                                    value={formEmail}
                                    onChange={(e) => setFormEmail(e.target.value)}
                                    placeholder="e.g. john.doe@student.edu"
                                    className={inputClass}
                                />
                            </div>

                            {/* Row 4: Default Password */}
                            <div className="flex flex-col gap-2">
                                <div className="flex items-center justify-between">
                                    <label className="text-sm font-bold text-slate-700">Default Password</label>
                                    <button
                                        type="button"
                                        onClick={() => setFormPassword(generatePassword())}
                                        className="flex items-center gap-1.5 text-xs font-bold text-indigo-600 hover:text-indigo-800 transition-colors"
                                    >
                                        <RefreshCw className="w-3 h-3" />
                                        Generate
                                    </button>
                                </div>
                                <input
                                    type="text"
                                    value={formPassword}
                                    onChange={(e) => setFormPassword(e.target.value)}
                                    className={`${inputClass} font-mono tracking-wide`}
                                />
                            </div>

                            {/* Row 5: Class (Only for Students / Class Monitors) */}
                            {(formRole === 'Student' || formRole === 'Class Monitor') && (
                                <div className="flex flex-col gap-2">
                                    <label className="text-sm font-bold text-slate-700">Assign to Class</label>
                                    <select
                                        value={formClass}
                                        onChange={(e) => setFormClass(e.target.value)}
                                        className={selectClass}
                                    >
                                        {CLASS_OPTIONS.map(c => (
                                            <option key={c} value={c}>{c === 'None' ? 'No class assigned' : `Class ${c}`}</option>
                                        ))}
                                    </select>
                                </div>
                            )}

                            {/* Info Banner */}
                            <div className="flex items-center gap-3 bg-indigo-50/70 border border-indigo-100 rounded-xl px-4 py-3">
                                <div className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center shrink-0">
                                    <Shield className="w-4 h-4 text-indigo-600" />
                                </div>
                                <p className="text-xs font-medium text-indigo-700">
                                    New accounts are created with <strong>Pending</strong> status. The user must be approved before they can log in.
                                </p>
                            </div>
                        </div>

                        {/* Modal Footer */}
                        <div className="p-6 border-t border-slate-100 bg-slate-50/50 flex justify-end gap-3 sticky bottom-0 rounded-b-3xl">
                            <button
                                onClick={handleCloseModal}
                                className="px-5 py-2.5 rounded-xl text-sm font-bold text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleCreateUser}
                                disabled={!formId.trim() || !formName.trim() || !formEmail.trim() || isDuplicateId}
                                className="px-5 py-2.5 rounded-xl text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-sm shadow-indigo-500/20 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                            >
                                <UserPlus className="w-4 h-4" />
                                Create User
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ========== EDIT USER MODAL ========== */}
            {editingUser && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
                    <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl flex flex-col my-auto max-h-[90vh] overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                        {/* Modal Header */}
                        <div className="flex items-center justify-between p-6 border-b border-slate-100 sticky top-0 bg-white z-10 rounded-t-3xl">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                                    <Edit className="w-5 h-5" />
                                </div>
                                <div>
                                    <h2 className="text-lg font-bold text-slate-900">Edit User</h2>
                                    <p className="text-xs text-slate-500">Update details for {editingUser.id}</p>
                                </div>
                            </div>
                            <button onClick={handleCancelEdit} className="p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700 rounded-full transition-colors">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Modal Body */}
                        <div className="p-6 flex flex-col gap-5">
                            {/* Row 1: ID (Read Only) & Status */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="flex flex-col gap-2">
                                    <label className="text-sm font-bold text-slate-700">User ID</label>
                                    <input
                                        type="text"
                                        value={editingUser.id}
                                        disabled
                                        className={`${inputClass} !bg-slate-100 !text-slate-500 cursor-not-allowed`}
                                    />
                                </div>
                                <div className="flex flex-col gap-2">
                                    <label className="text-sm font-bold text-slate-700">Status <span className="text-red-500">*</span></label>
                                    <select
                                        value={editFormStatus}
                                        onChange={(e) => setEditFormStatus(e.target.value as UserStatus)}
                                        className={selectClass}
                                    >
                                        <option value="Active">Active</option>
                                        <option value="Pending">Pending</option>
                                        <option value="Suspended">Suspended</option>
                                    </select>
                                </div>
                            </div>

                            {/* Row 2: Full Name */}
                            <div className="flex flex-col gap-2">
                                <label className="text-sm font-bold text-slate-700">Full Name <span className="text-red-500">*</span></label>
                                <input
                                    type="text"
                                    value={editFormName}
                                    onChange={(e) => setEditFormName(e.target.value)}
                                    placeholder="e.g. John Doe"
                                    className={inputClass}
                                />
                            </div>

                            {/* Row 3: Email */}
                            <div className="flex flex-col gap-2">
                                <label className="text-sm font-bold text-slate-700">Email Address <span className="text-red-500">*</span></label>
                                <input
                                    type="email"
                                    value={editFormEmail}
                                    onChange={(e) => setEditFormEmail(e.target.value)}
                                    placeholder="e.g. john.doe@student.edu"
                                    className={inputClass}
                                />
                            </div>

                            {/* Row 4: Role */}
                            <div className="flex flex-col gap-2">
                                <label className="text-sm font-bold text-slate-700">Role <span className="text-red-500">*</span></label>
                                <select
                                    value={editFormRole}
                                    onChange={(e) => {
                                        setEditFormRole(e.target.value as UserRole);
                                        if (e.target.value !== 'Student' && e.target.value !== 'Class Monitor') setEditFormClass('None');
                                    }}
                                    className={selectClass}
                                >
                                    <option value="Student">Student</option>
                                    <option value="Class Monitor">Class Monitor</option>
                                    <option value="Teacher">Teacher</option>
                                    <option value="Home-Class Teacher">Home-Class Teacher</option>
                                </select>
                            </div>

                            {/* Row 5: Class (Only for Students / Class Monitors) */}
                            {(editFormRole === 'Student' || editFormRole === 'Class Monitor') && (
                                <div className="flex flex-col gap-2">
                                    <label className="text-sm font-bold text-slate-700">Assign to Class</label>
                                    <select
                                        value={editFormClass}
                                        onChange={(e) => setEditFormClass(e.target.value)}
                                        className={selectClass}
                                    >
                                        {CLASS_OPTIONS.map(c => (
                                            <option key={c} value={c}>{c === 'None' ? 'No class assigned' : `Class ${c}`}</option>
                                        ))}
                                    </select>
                                </div>
                            )}
                        </div>

                        {/* Modal Footer */}
                        <div className="p-6 border-t border-slate-100 bg-slate-50/50 flex justify-end gap-3 sticky bottom-0 rounded-b-3xl">
                            <button
                                onClick={handleCancelEdit}
                                className="px-5 py-2.5 rounded-xl text-sm font-bold text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSaveEdit}
                                disabled={!editFormName.trim() || !editFormEmail.trim()}
                                className="px-5 py-2.5 rounded-xl text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-sm shadow-indigo-500/20 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                            >
                                <CheckCircle2 className="w-4 h-4" />
                                Save Changes
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ========== DELETE CONFIRMATION DIALOG ========== */}
            {deleteTarget && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl flex flex-col overflow-hidden animate-[slideUp_0.2s_ease-out]">
                        <div className="p-6 sm:p-8 flex flex-col items-center text-center">
                            <div className="w-16 h-16 rounded-full bg-red-50 text-red-500 flex items-center justify-center mb-4">
                                <Trash2 className="w-8 h-8" />
                            </div>
                            <h2 className="text-xl font-bold text-slate-900 mb-2">Delete User?</h2>
                            <p className="text-sm text-slate-500 mb-6">
                                Are you sure you want to delete <span className="font-bold text-slate-700">{deleteTarget.name}</span>?
                                This action cannot be undone. The user account will be permanently removed.
                            </p>

                            <div className="flex items-center gap-3 w-full">
                                <button
                                    onClick={() => setDeleteTarget(null)}
                                    className="flex-1 py-3 rounded-xl text-sm font-bold text-slate-600 bg-slate-50 hover:bg-slate-100 border border-slate-200 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleConfirmDelete}
                                    className="flex-1 py-3 rounded-xl text-sm font-bold text-white bg-red-600 hover:bg-red-700 shadow-sm shadow-red-500/20 transition-colors"
                                >
                                    Delete User
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* ========== SUCCESS TOAST ========== */}
            {toast.show && (
                <div className={`fixed bottom-6 right-6 z-[60] animate-[slideUp_0.3s_ease-out] flex items-center gap-3 text-white px-5 py-3.5 rounded-xl shadow-lg 
                    ${toast.type === 'created' ? 'bg-emerald-600 shadow-emerald-500/30' : ''}
                    ${toast.type === 'updated' ? 'bg-indigo-600 shadow-indigo-500/30' : ''}
                    ${toast.type === 'deleted' ? 'bg-red-600 shadow-red-500/30' : ''}
                `}>
                    <CheckCircle2 className="w-5 h-5 shrink-0" />
                    <div>
                        <p className="text-sm font-bold">
                            {toast.type === 'created' && 'User Created Successfully'}
                            {toast.type === 'updated' && 'User Updated Successfully'}
                            {toast.type === 'deleted' && 'User Removed'}
                        </p>
                        <p className={`text-xs ${toast.type === 'created' ? 'text-emerald-100' : toast.type === 'updated' ? 'text-indigo-100' : 'text-red-100'}`}>
                            {toast.type === 'created' && `${toast.name} has been added with Pending status.`}
                            {toast.type === 'updated' && `${toast.name}'s details have been updated.`}
                            {toast.type === 'deleted' && `${toast.name} has been removed from the system.`}
                        </p>
                    </div>
                </div>
            )}

            <style jsx>{`
                @keyframes slideUp {
                    from { opacity: 0; transform: translateY(16px); }
                    to { opacity: 1; transform: translateY(0); }
                }
            `}</style>
        </div>
    );
}
