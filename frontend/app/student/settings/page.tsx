'use client';

import React, { useState } from 'react';
import { User as UserIcon, Shield, Bell, Loader2, CheckCircle2, AlertCircle, Pencil } from 'lucide-react';
import { useAuth } from '@/components/auth/AuthProvider';
import { usersApi } from '@/lib/api';

type Tab = 'profile' | 'security' | 'notifications';

export default function SettingsPage() {
    const { user, refreshUser } = useAuth();
    const [activeTab, setActiveTab] = useState<Tab>('profile');

    // Profile editing
    const [editing, setEditing] = useState(false);
    const [fullName, setFullName] = useState(user?.full_name ?? '');
    const [email, setEmail] = useState(user?.email ?? '');
    const [saving, setSaving] = useState(false);
    const [saveSuccess, setSaveSuccess] = useState(false);
    const [saveError, setSaveError] = useState<string | null>(null);

    // Password change
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [pwSaving, setPwSaving] = useState(false);
    const [pwSuccess, setPwSuccess] = useState(false);
    const [pwError, setPwError] = useState<string | null>(null);

    const startEditing = () => {
        setFullName(user?.full_name ?? '');
        setEmail(user?.email ?? '');
        setEditing(true);
        setSaveSuccess(false);
        setSaveError(null);
    };

    const cancelEditing = () => {
        setEditing(false);
        setSaveError(null);
    };

    const handleSaveProfile = async () => {
        setSaving(true);
        setSaveError(null);
        setSaveSuccess(false);
        try {
            const updates: { full_name?: string; email?: string } = {};
            if (fullName !== user?.full_name) updates.full_name = fullName;
            if (email !== user?.email) updates.email = email;
            if (Object.keys(updates).length === 0) {
                setEditing(false);
                return;
            }
            await usersApi.updateMe(updates);
            await refreshUser();
            setSaveSuccess(true);
            setEditing(false);
        } catch (err: unknown) {
            const apiErr = err as { data?: { detail?: string } };
            setSaveError(apiErr?.data?.detail ?? 'Failed to update profile.');
        } finally {
            setSaving(false);
        }
    };

    const handleChangePassword = async () => {
        setPwError(null);
        setPwSuccess(false);
        if (newPassword.length < 6) {
            setPwError('Password must be at least 6 characters.');
            return;
        }
        if (newPassword !== confirmPassword) {
            setPwError('Passwords do not match.');
            return;
        }
        setPwSaving(true);
        try {
            await usersApi.updateMe({ password: newPassword });
            setPwSuccess(true);
            setNewPassword('');
            setConfirmPassword('');
        } catch (err: unknown) {
            const apiErr = err as { data?: { detail?: string } };
            setPwError(apiErr?.data?.detail ?? 'Failed to change password.');
        } finally {
            setPwSaving(false);
        }
    };

    const renderTabContent = () => {
        switch (activeTab) {
            case 'profile':
                return (
                    <div className="space-y-8">
                        {/* Avatar Section */}
                        <div className="flex items-center gap-6">
                            <div className="relative">
                                <div className="h-24 w-24 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-4xl font-bold text-white shadow-md">
                                    {user?.full_name?.charAt(0)?.toUpperCase() ?? 'U'}
                                </div>
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-slate-900">{user?.full_name}</h3>
                                <p className="text-sm text-slate-500 capitalize">{user?.role}</p>
                                {user?.is_class_monitor && (
                                    <span className="inline-block mt-1 text-xs bg-amber-50 text-amber-700 px-2 py-0.5 rounded font-bold border border-amber-100">CLASS MONITOR</span>
                                )}
                            </div>
                        </div>

                        <hr className="border-slate-100" />

                        {/* Success / Error feedback */}
                        {saveSuccess && (
                            <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm rounded-xl px-4 py-3">
                                <CheckCircle2 className="h-4 w-4" />
                                Profile updated successfully.
                            </div>
                        )}
                        {saveError && (
                            <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3">
                                <AlertCircle className="h-4 w-4" />
                                {saveError}
                            </div>
                        )}

                        {/* Profile fields */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-700">Full Name</label>
                                {editing ? (
                                    <input
                                        type="text"
                                        value={fullName}
                                        onChange={e => setFullName(e.target.value)}
                                        className="w-full px-4 py-2.5 rounded-lg border border-slate-300 bg-white text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400"
                                    />
                                ) : (
                                    <div className="w-full px-4 py-2.5 rounded-lg border border-slate-200 bg-slate-50 text-slate-700 text-sm">
                                        {user?.full_name ?? '\u2014'}
                                    </div>
                                )}
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-700">Role</label>
                                <div className="w-full px-4 py-2.5 rounded-lg border border-slate-200 bg-slate-50 text-slate-700 text-sm capitalize">
                                    {user?.role ?? '\u2014'}
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-700">Email Address</label>
                                {editing ? (
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={e => setEmail(e.target.value)}
                                        className="w-full px-4 py-2.5 rounded-lg border border-slate-300 bg-white text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400"
                                    />
                                ) : (
                                    <div className="w-full px-4 py-2.5 rounded-lg border border-slate-200 bg-slate-50 text-slate-700 text-sm">
                                        {user?.email ?? '\u2014'}
                                    </div>
                                )}
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-700">Account Status</label>
                                <div className={`w-full px-4 py-2.5 rounded-lg border text-sm font-semibold ${user?.is_active ? 'border-emerald-200 bg-emerald-50 text-emerald-700' : 'border-red-200 bg-red-50 text-red-700'}`}>
                                    {user?.is_active ? 'Active' : 'Inactive'}
                                </div>
                            </div>
                        </div>

                        {/* Action buttons */}
                        <div className="flex items-center gap-3">
                            {editing ? (
                                <>
                                    <button
                                        onClick={handleSaveProfile}
                                        disabled={saving}
                                        className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 disabled:opacity-60 transition-colors text-sm"
                                    >
                                        {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
                                        Save Changes
                                    </button>
                                    <button
                                        onClick={cancelEditing}
                                        className="px-5 py-2.5 bg-slate-100 text-slate-700 font-semibold rounded-xl hover:bg-slate-200 transition-colors text-sm"
                                    >
                                        Cancel
                                    </button>
                                </>
                            ) : (
                                <button
                                    onClick={startEditing}
                                    className="flex items-center gap-2 px-5 py-2.5 bg-slate-100 text-slate-700 font-semibold rounded-xl hover:bg-slate-200 transition-colors text-sm"
                                >
                                    <Pencil className="h-4 w-4" />
                                    Edit Profile
                                </button>
                            )}
                        </div>
                    </div>
                );
            case 'security':
                return (
                    <div className="space-y-6 max-w-xl">
                        <p className="text-sm text-slate-500">Change your password below.</p>

                        {pwSuccess && (
                            <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm rounded-xl px-4 py-3">
                                <CheckCircle2 className="h-4 w-4" />
                                Password changed successfully.
                            </div>
                        )}
                        {pwError && (
                            <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3">
                                <AlertCircle className="h-4 w-4" />
                                {pwError}
                            </div>
                        )}

                        <div className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-700">New Password</label>
                                <input
                                    type="password"
                                    value={newPassword}
                                    onChange={e => setNewPassword(e.target.value)}
                                    placeholder="At least 6 characters"
                                    className="w-full px-4 py-2.5 rounded-lg border border-slate-300 bg-white text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-700">Confirm Password</label>
                                <input
                                    type="password"
                                    value={confirmPassword}
                                    onChange={e => setConfirmPassword(e.target.value)}
                                    placeholder="Re-enter your new password"
                                    className="w-full px-4 py-2.5 rounded-lg border border-slate-300 bg-white text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400"
                                />
                            </div>
                            <button
                                onClick={handleChangePassword}
                                disabled={pwSaving || !newPassword}
                                className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 disabled:opacity-60 transition-colors text-sm"
                            >
                                {pwSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Shield className="h-4 w-4" />}
                                Change Password
                            </button>
                        </div>
                    </div>
                );
            case 'notifications':
                return (
                    <div className="space-y-6">
                        <h3 className="text-lg font-bold text-slate-900 mb-4">Notification Preferences</h3>

                        <div className="space-y-4">
                            <div className="flex items-center justify-between py-3 border-b border-slate-100 last:border-0">
                                <div className="flex flex-col">
                                    <span className="font-medium text-slate-800 text-sm">Email Alerts for Assignments</span>
                                    <span className="text-sm text-slate-500">Receive an email when a new assignment is posted.</span>
                                </div>
                                <label className="relative inline-flex items-center cursor-pointer shrink-0">
                                    <input type="checkbox" className="sr-only peer" defaultChecked />
                                    <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                                </label>
                            </div>

                            <div className="flex items-center justify-between py-3 border-b border-slate-100 last:border-0">
                                <div className="flex flex-col">
                                    <span className="font-medium text-slate-800 text-sm">Grade Notifications</span>
                                    <span className="text-sm text-slate-500">Get notified when a new grade is published.</span>
                                </div>
                                <label className="relative inline-flex items-center cursor-pointer shrink-0">
                                    <input type="checkbox" className="sr-only peer" defaultChecked />
                                    <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                                </label>
                            </div>

                            <div className="flex items-center justify-between py-3 border-b border-slate-100 last:border-0">
                                <div className="flex flex-col">
                                    <span className="font-medium text-slate-800 text-sm">Announcement Alerts</span>
                                    <span className="text-sm text-slate-500">Enable browser notifications for urgent school announcements.</span>
                                </div>
                                <label className="relative inline-flex items-center cursor-pointer shrink-0">
                                    <input type="checkbox" className="sr-only peer" />
                                    <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                                </label>
                            </div>
                        </div>
                    </div>
                );
            default:
                return null;
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 font-sans">
            <div className="max-w-7xl mx-auto w-full flex flex-col">
                {/* Sticky Header */}
                <header className="sticky top-0 z-30 bg-slate-50/80 backdrop-blur-md border-b border-slate-200/50 px-6 lg:px-8 py-6 mb-2">
                    <div className="flex justify-between items-start">
                        <div>
                            <h1 className="text-3xl font-serif font-bold text-[#0f172a] tracking-tight">Settings</h1>
                            <p className="text-sm text-slate-500 mt-1">Manage your account and preferences</p>
                        </div>
                    </div>
                </header>

                {/* Content Wrapper */}
                <div className="px-6 lg:px-8 pb-12 w-full max-w-5xl mt-8">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-8">

                        {/* Left Column: Inner Sidebar tabs */}
                        <div className="col-span-1 flex flex-col gap-2">
                            <button
                                onClick={() => setActiveTab('profile')}
                                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 text-left w-full ${activeTab === 'profile'
                                    ? 'bg-white border border-slate-200 shadow-sm text-slate-900'
                                    : 'bg-transparent text-slate-500 hover:bg-slate-200/50 hover:text-slate-700'
                                    }`}
                            >
                                <UserIcon className={`w-5 h-5 ${activeTab === 'profile' ? 'text-blue-600' : 'text-slate-400'}`} />
                                Profile
                            </button>

                            <button
                                onClick={() => setActiveTab('security')}
                                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 text-left w-full ${activeTab === 'security'
                                    ? 'bg-white border border-slate-200 shadow-sm text-slate-900'
                                    : 'bg-transparent text-slate-500 hover:bg-slate-200/50 hover:text-slate-700'
                                    }`}
                            >
                                <Shield className={`w-5 h-5 ${activeTab === 'security' ? 'text-blue-600' : 'text-slate-400'}`} />
                                Security
                            </button>

                            <button
                                onClick={() => setActiveTab('notifications')}
                                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 text-left w-full ${activeTab === 'notifications'
                                    ? 'bg-white border border-slate-200 shadow-sm text-slate-900'
                                    : 'bg-transparent text-slate-500 hover:bg-slate-200/50 hover:text-slate-700'
                                    }`}
                            >
                                <Bell className={`w-5 h-5 ${activeTab === 'notifications' ? 'text-blue-600' : 'text-slate-400'}`} />
                                Notifications
                            </button>
                        </div>

                        {/* Right Column: Form Content */}
                        <div className="col-span-1 md:col-span-3">
                            <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6 sm:p-8">
                                <h2 className="text-xl font-bold text-slate-900 mb-6 font-serif">
                                    {activeTab === 'profile' && 'Personal Information'}
                                    {activeTab === 'security' && 'Account Security'}
                                    {activeTab === 'notifications' && 'Communication Preferences'}
                                </h2>

                                {renderTabContent()}
                            </div>
                        </div>

                    </div>
                </div>
            </div>
        </div>
    );
}
