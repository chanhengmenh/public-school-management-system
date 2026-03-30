'use client';

import React, { useState } from 'react';
import PageHeader from '@/components/layouts/PageHeader';
import { Search, Filter, Plus, Edit2, Trash2, ShieldAlert, UserCheck } from 'lucide-react';

import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Modal from '@/components/ui/Modal';
import ConfirmModal from '@/components/ui/ConfirmModal';
import { useToast, ToastContainer } from '@/components/ui/Toast';

import { getSystemUsers, SystemUser } from '@/lib/mock-data/admin';

export default function AdminUsersPage() {
    const { toasts, addToast, dismissToast } = useToast();

    // Data
    const [users, setUsers] = useState<SystemUser[]>(getSystemUsers());
    const [searchQuery, setSearchQuery] = useState('');
    const [roleFilter, setRoleFilter] = useState('All Roles');

    // Modals state
    const [isAddEditModalOpen, setIsAddEditModalOpen] = useState(false);
    const [editingUser, setEditingUser] = useState<SystemUser | null>(null);
    const [deleteTarget, setDeleteTarget] = useState<SystemUser | null>(null);

    // Form state
    const [formData, setFormData] = useState<Partial<SystemUser>>({
        name: '',
        email: '',
        role: 'Student',
        status: 'Active',
        departmentOrClass: ''
    });

    const filteredUsers = users.filter(user => {
        const matchesSearch = user.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                              user.email.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesRole = roleFilter === 'All Roles' || user.role === roleFilter;
        return matchesSearch && matchesRole;
    });

    const handleOpenCreate = () => {
        setEditingUser(null);
        setFormData({ name: '', email: '', role: 'Student', status: 'Active', departmentOrClass: '' });
        setIsAddEditModalOpen(true);
    };

    const handleOpenEdit = (user: SystemUser) => {
        setEditingUser(user);
        setFormData({ name: user.name, email: user.email, role: user.role, status: user.status, departmentOrClass: user.departmentOrClass || '' });
        setIsAddEditModalOpen(true);
    };

    const handleSaveUser = () => {
        if (!formData.name || !formData.email) return;

        if (editingUser) {
            setUsers(prev => prev.map(u => u.id === editingUser.id ? { ...u, ...formData } as SystemUser : u));
            addToast('success', 'User updated successfully');
        } else {
            const newUser: SystemUser = {
                id: `usr_${Date.now()}`,
                name: formData.name!,
                email: formData.email!,
                role: formData.role as 'Student' | 'Teacher' | 'Admin',
                status: formData.status as 'Active' | 'Suspended',
                departmentOrClass: formData.departmentOrClass
            };
            setUsers(prev => [newUser, ...prev]);
            addToast('success', 'New user created successfully');
        }
        setIsAddEditModalOpen(false);
    };

    const handleDelete = () => {
        if (!deleteTarget) return;
        setUsers(prev => prev.filter(u => u.id !== deleteTarget.id));
        setDeleteTarget(null);
        addToast('error', 'User deleted entirely');
    };

    const toggleStatus = (user: SystemUser) => {
        const newStatus = user.status === 'Active' ? 'Suspended' : 'Active';
        setUsers(prev => prev.map(u => u.id === user.id ? { ...u, status: newStatus } : u));
        addToast(newStatus === 'Active' ? 'success' : 'info', `User ${newStatus === 'Active' ? 'activated' : 'suspended'}`);
    };

    const getRoleBadgeVariant = (role: string): 'success' | 'warning' | 'error' | 'info' | 'neutral' => {
        switch(role) {
            case 'Student': return 'info';
            case 'Teacher': return 'neutral'; // We use neutral for Teacher since Badge config doesn't have violet
            case 'Admin': return 'warning';
            default: return 'neutral';
        }
    };

    const DEPARTMENTS = ['Physics Dept', 'Math Dept', 'History Dept', 'English Dept'];
    const HOMEROOMS = ['Grade 10A', 'Grade 10B', 'Grade 11A', 'Grade 11B', 'Grade 12A'];

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col relative font-sans">
            <PageHeader title="User Management" subtitle="Manage student, teacher, and administrator accounts." />

            <div className="max-w-7xl mx-auto w-full px-6 lg:px-8 py-8 flex flex-col gap-6">
                
                {/* Control Bar */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-3 w-full sm:w-auto">
                        <div className="relative w-full sm:w-64">
                            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none z-10" />
                            <Input 
                                placeholder="Search users..." 
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-10 !py-2"
                            />
                        </div>
                        <div className="relative w-full sm:w-48">
                            <Filter className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none z-10" />
                            <select
                                value={roleFilter}
                                onChange={(e) => setRoleFilter(e.target.value)}
                                className="w-full bg-white border border-slate-200 rounded-lg pl-10 pr-8 py-2 text-sm text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 appearance-none cursor-pointer h-[42px]"
                            >
                                <option>All Roles</option>
                                <option>Student</option>
                                <option>Teacher</option>
                                <option>Admin</option>
                            </select>
                        </div>
                    </div>

                    <Button variant="primary" icon={Plus} onClick={handleOpenCreate} className="w-full sm:w-auto">
                        Add New User
                    </Button>
                </div>

                {/* Data Table */}
                <Card className="overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-50 border-b border-slate-200">
                                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">User</th>
                                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Role</th>
                                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Dept / Class</th>
                                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
                                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredUsers.length === 0 ? (
                                    <tr><td colSpan={5} className="px-6 py-12 text-center text-sm text-slate-500">No users found</td></tr>
                                ) : (
                                    filteredUsers.map(user => (
                                        <tr key={user.id} className="border-b border-slate-100 last:border-b-0 group hover:bg-slate-50/50 transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-full bg-slate-200 text-slate-600 flex items-center justify-center font-bold text-sm shrink-0">
                                                        {user.name.charAt(0)}
                                                    </div>
                                                    <div className="flex flex-col min-w-0">
                                                        <span className="text-sm font-bold text-slate-900 truncate">{user.name}</span>
                                                        <span className="text-xs text-slate-500 truncate">{user.email}</span>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <Badge variant={getRoleBadgeVariant(user.role)}>
                                                    {user.role}
                                                </Badge>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-slate-700">
                                                {user.departmentOrClass || <span className="text-slate-400 italic">N/A</span>}
                                            </td>
                                            <td className="px-6 py-4">
                                                <Badge variant={user.status === 'Active' ? 'success' : 'error'}>
                                                    {user.status}
                                                </Badge>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <button onClick={() => toggleStatus(user)} className="p-2 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors" title={user.status === 'Active' ? 'Suspend User' : 'Activate User'}>
                                                        {user.status === 'Active' ? <ShieldAlert className="w-4 h-4" /> : <UserCheck className="w-4 h-4" />}
                                                    </button>
                                                    <button onClick={() => handleOpenEdit(user)} className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="Edit User">
                                                        <Edit2 className="w-4 h-4" />
                                                    </button>
                                                    <button onClick={() => setDeleteTarget(user)} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Delete User">
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </Card>
            </div>

            {/* Modal: Add/Edit */}
            <Modal isOpen={isAddEditModalOpen} onClose={() => setIsAddEditModalOpen(false)} title={editingUser ? 'Edit User' : 'Add New User'}>
                <div className="flex flex-col gap-4 py-2">
                    <Input label="Full Name" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="e.g. John Doe" />
                    <Input label="Email Address" type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} placeholder="e.g. john@school.edu" />
                    
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-700">Role</label>
                        <select
                            value={formData.role}
                            onChange={(e) => setFormData({...formData, role: e.target.value as any, departmentOrClass: ''})}
                            className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 appearance-none"
                        >
                            <option value="Student">Student</option>
                            <option value="Teacher">Teacher</option>
                            <option value="Admin">Admin</option>
                        </select>
                    </div>

                    {formData.role === 'Student' && (
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-700">Homeroom Class</label>
                            <select
                                value={formData.departmentOrClass}
                                onChange={(e) => setFormData({...formData, departmentOrClass: e.target.value})}
                                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 appearance-none"
                            >
                                <option value="" disabled>Select Homeroom</option>
                                {HOMEROOMS.map(h => <option key={h} value={h}>{h}</option>)}
                            </select>
                        </div>
                    )}

                    {formData.role === 'Teacher' && (
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-700">Department</label>
                            <select
                                value={formData.departmentOrClass}
                                onChange={(e) => setFormData({...formData, departmentOrClass: e.target.value})}
                                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 appearance-none"
                            >
                                <option value="" disabled>Select Department</option>
                                {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
                            </select>
                        </div>
                    )}
                </div>
                <div className="pt-6 mt-4 border-t border-slate-100 flex justify-end gap-3">
                    <Button variant="ghost" onClick={() => setIsAddEditModalOpen(false)}>Cancel</Button>
                    <Button variant="primary" onClick={handleSaveUser}>{editingUser ? 'Save Changes' : 'Create User'}</Button>
                </div>
            </Modal>

            {/* Confirm Delete */}
            <ConfirmModal 
                isOpen={!!deleteTarget}
                title="Delete User"
                description={`Are you sure you want to permanently delete ${deleteTarget?.name}? This action cannot be undone.`}
                confirmLabel="Delete User"
                cancelLabel="Cancel"
                onConfirm={handleDelete}
                onCancel={() => setDeleteTarget(null)}
            />

            <ToastContainer toasts={toasts} onDismiss={dismissToast} />
        </div>
    );
}
