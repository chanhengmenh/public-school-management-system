'use client';

import React, { useState } from 'react';
import PageHeader from '@/components/layouts/PageHeader';
import { User, Shield, Bell, Save, ToggleLeft, ToggleRight, Pencil, X, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { useAuth } from '@/components/auth/AuthProvider';
import { usersApi } from '@/lib/api';

type TabId = 'Profile' | 'Security' | 'Notifications';

const tabs: { id: TabId; label: string; icon: typeof User }[] = [
    { id: 'Profile',       label: 'Profile',       icon: User   },
    { id: 'Security',      label: 'Security',      icon: Shield },
    { id: 'Notifications', label: 'Notifications', icon: Bell   },
];

export default function TeacherSettingsPage() {
    const { user, refreshUser } = useAuth();
    const [activeTab, setActiveTab] = useState<TabId>('Profile');

    // ── Profile ──────────────────────────────────────────────
    const [isEditing,    setIsEditing]    = useState(false);
    const [draftName,    setDraftName]    = useState('');
    const [saving,       setSaving]       = useState(false);
    const [saveSuccess,  setSaveSuccess]  = useState(false);
    const [saveError,    setSaveError]    = useState<string | null>(null);

    const startEditing = () => {
        setDraftName(user?.full_name ?? '');
        setSaveSuccess(false);
        setSaveError(null);
        setIsEditing(true);
    };

    const cancelEditing = () => {
        setIsEditing(false);
        setSaveError(null);
    };

    const handleSaveProfile = async () => {
        setSaving(true);
        setSaveError(null);
        setSaveSuccess(false);
        try {
            const updates: { full_name?: string } = {};
            if (draftName !== user?.full_name) updates.full_name = draftName;
            if (Object.keys(updates).length > 0) {
                await usersApi.updateMe(updates);
                await refreshUser();
            }
            setSaveSuccess(true);
            setIsEditing(false);
        } catch (err: unknown) {
            const e = err as { data?: { detail?: string } };
            setSaveError(e?.data?.detail ?? 'Failed to update profile.');
        } finally {
            setSaving(false);
        }
    };

    // ── Security ─────────────────────────────────────────────
    const [newPassword,     setNewPassword]     = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [pwSaving,        setPwSaving]        = useState(false);
    const [pwSuccess,       setPwSuccess]       = useState(false);
    const [pwError,         setPwError]         = useState<string | null>(null);

    const handleChangePassword = async () => {
        setPwError(null);
        setPwSuccess(false);
        if (newPassword.length < 6) { setPwError('Password must be at least 6 characters.'); return; }
        if (newPassword !== confirmPassword) { setPwError('Passwords do not match.'); return; }
        setPwSaving(true);
        try {
            await usersApi.updateMe({ password: newPassword });
            setPwSuccess(true);
            setNewPassword('');
            setConfirmPassword('');
        } catch (err: unknown) {
            const e = err as { data?: { detail?: string } };
            setPwError(e?.data?.detail ?? 'Failed to change password.');
        } finally {
            setPwSaving(false);
        }
    };

    // ── Notification toggles (local UI only) ─────────────────
    const [newMessages,     setNewMessages]     = useState(true);
    const [lateSubmissions, setLateSubmissions] = useState(true);
    const [systemAlerts,    setSystemAlerts]    = useState(false);
    const [weeklyDigest,    setWeeklyDigest]    = useState(true);

    const Toggle = ({ value, onChange }: { value: boolean; onChange: (v: boolean) => void }) => (
        <button onClick={() => onChange(!value)} className="transition-colors">
            {value
                ? <ToggleRight className="w-8 h-8 text-indigo-600" />
                : <ToggleLeft  className="w-8 h-8 text-slate-300"  />}
        </button>
    );

    const inputClass     = 'w-full border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-900 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 outline-none transition-all placeholder:text-slate-400';
    const readOnlyClass  = `${inputClass} bg-slate-50 cursor-default`;

    return (
        <div className="min-h-screen bg-slate-50">
            <PageHeader
                title="Settings"
                subtitle="Manage your account preferences and portal settings"
            />

            <div className="max-w-7xl mx-auto px-6 lg:px-8 py-8 flex flex-col md:flex-row gap-8">

                {/* Left Sidebar */}
                <div className="w-full md:w-64 shrink-0 flex flex-col gap-2">
                    {tabs.map(({ id, label, icon: Icon }) => (
                        <button
                            key={id}
                            onClick={() => setActiveTab(id)}
                            className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-colors w-full text-left ${
                                activeTab === id
                                    ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-500/20'
                                    : 'text-slate-600 hover:bg-slate-200 hover:text-slate-900'
                            }`}
                        >
                            <Icon className="w-4 h-4" />
                            {label}
                        </button>
                    ))}
                </div>

                {/* Right Content */}
                <div className="flex-1 bg-white rounded-2xl border border-slate-200 shadow-sm p-6 md:p-8">

                    {/* ── PROFILE ── */}
                    {activeTab === 'Profile' && (
                        <div className="flex flex-col">
                            <div className="flex items-center justify-between mb-1">
                                <h2 className="text-xl font-bold text-slate-900">Profile Information</h2>
                                {!isEditing && (
                                    <button
                                        onClick={startEditing}
                                        className="flex items-center gap-2 text-sm font-bold text-indigo-600 hover:text-indigo-800 transition-colors px-4 py-2 rounded-xl hover:bg-indigo-50"
                                    >
                                        <Pencil className="w-4 h-4" /> Edit Profile
                                    </button>
                                )}
                            </div>
                            <p className="text-sm text-slate-500 mt-1 mb-8">
                                {isEditing ? 'Edit your personal details below.' : 'Your personal details and public profile.'}
                            </p>

                            {/* Avatar */}
                            <div className="flex items-center gap-5 mb-8 pb-8 border-b border-slate-100">
                                <div className="w-20 h-20 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-2xl font-bold shrink-0 border-2 border-indigo-200">
                                    {(isEditing ? draftName : user?.full_name)?.charAt(0)?.toUpperCase() ?? 'T'}
                                </div>
                                <div>
                                    <h3 className="text-sm font-bold text-slate-900">{isEditing ? draftName : user?.full_name}</h3>
                                    <p className="text-xs text-slate-500 capitalize mt-0.5">{user?.role}</p>
                                    {user?.is_home_teacher && (
                                        <span className="inline-block mt-1 text-xs bg-amber-50 text-amber-700 px-2 py-0.5 rounded font-bold border border-amber-100">HOME TEACHER</span>
                                    )}
                                </div>
                            </div>

                            {/* Feedback */}
                            {saveSuccess && (
                                <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm rounded-xl px-4 py-3 mb-6">
                                    <CheckCircle2 className="h-4 w-4" /> Profile updated successfully.
                                </div>
                            )}
                            {saveError && (
                                <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3 mb-6">
                                    <AlertCircle className="h-4 w-4" /> {saveError}
                                </div>
                            )}

                            {/* Fields */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                                <div className="flex flex-col gap-2">
                                    <label className="text-sm font-bold text-slate-700">Full Name</label>
                                    <input
                                        type="text"
                                        value={isEditing ? draftName : (user?.full_name ?? '')}
                                        onChange={(e) => setDraftName(e.target.value)}
                                        readOnly={!isEditing}
                                        className={isEditing ? inputClass : readOnlyClass}
                                    />
                                </div>
                                <div className="flex flex-col gap-2">
                                    <label className="text-sm font-bold text-slate-700">
                                        Email Address
                                        <span className="ml-2 text-xs font-normal text-slate-400">(managed by admin)</span>
                                    </label>
                                    <div className={readOnlyClass + ' select-all'}>{user?.email ?? '—'}</div>
                                </div>
                                <div className="flex flex-col gap-2">
                                    <label className="text-sm font-bold text-slate-700">Role</label>
                                    <div className={readOnlyClass + ' capitalize'}>{user?.role ?? '—'}</div>
                                </div>
                                <div className="flex flex-col gap-2">
                                    <label className="text-sm font-bold text-slate-700">Account Status</label>
                                    <div className={`${readOnlyClass} font-semibold ${user?.is_active ? 'text-emerald-700' : 'text-red-600'}`}>
                                        {user?.is_active ? 'Active' : 'Inactive'}
                                    </div>
                                </div>
                            </div>

                            {isEditing && (
                                <div className="flex justify-end gap-3 pt-6 border-t border-slate-100">
                                    <button
                                        onClick={cancelEditing}
                                        className="bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 px-6 py-2.5 rounded-xl text-sm font-bold shadow-sm transition-all flex items-center gap-2"
                                    >
                                        <X className="w-4 h-4" /> Cancel
                                    </button>
                                    <button
                                        onClick={handleSaveProfile}
                                        disabled={saving}
                                        className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2.5 rounded-xl text-sm font-bold shadow-sm transition-all flex items-center gap-2 disabled:opacity-60"
                                    >
                                        {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                                        Save Changes
                                    </button>
                                </div>
                            )}
                        </div>
                    )}

                    {/* ── SECURITY ── */}
                    {activeTab === 'Security' && (
                        <div className="flex flex-col">
                            <h2 className="text-xl font-bold text-slate-900">Security Settings</h2>
                            <p className="text-sm text-slate-500 mt-1 mb-8">Change your account password.</p>

                            {pwSuccess && (
                                <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm rounded-xl px-4 py-3 mb-6">
                                    <CheckCircle2 className="h-4 w-4" /> Password changed successfully.
                                </div>
                            )}
                            {pwError && (
                                <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3 mb-6">
                                    <AlertCircle className="h-4 w-4" /> {pwError}
                                </div>
                            )}

                            <div className="max-w-md flex flex-col gap-6 mb-8">
                                <div className="flex flex-col gap-2">
                                    <label className="text-sm font-bold text-slate-700">New Password</label>
                                    <input
                                        type="password"
                                        value={newPassword}
                                        onChange={(e) => setNewPassword(e.target.value)}
                                        placeholder="At least 6 characters"
                                        className={inputClass}
                                    />
                                </div>
                                <div className="flex flex-col gap-2">
                                    <label className="text-sm font-bold text-slate-700">Confirm New Password</label>
                                    <input
                                        type="password"
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        placeholder="Re-enter your new password"
                                        className={inputClass}
                                    />
                                </div>
                            </div>

                            <div className="flex justify-end pt-6 border-t border-slate-100">
                                <button
                                    onClick={handleChangePassword}
                                    disabled={pwSaving || !newPassword}
                                    className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2.5 rounded-xl text-sm font-bold shadow-sm transition-all flex items-center gap-2 disabled:opacity-60"
                                >
                                    {pwSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Shield className="w-4 h-4" />}
                                    Change Password
                                </button>
                            </div>
                        </div>
                    )}

                    {/* ── NOTIFICATIONS ── */}
                    {activeTab === 'Notifications' && (
                        <div className="flex flex-col">
                            <h2 className="text-xl font-bold text-slate-900">Notification Preferences</h2>
                            <p className="text-sm text-slate-500 mt-1 mb-8">Choose which notifications you want to receive.</p>

                            <div className="flex flex-col divide-y divide-slate-100">
                                {[
                                    { title: 'New Messages',      desc: 'Get notified when a student or staff member sends you a message.', value: newMessages,     setter: setNewMessages     },
                                    { title: 'Late Submissions',   desc: 'Email me when a student submits work after the deadline.',           value: lateSubmissions, setter: setLateSubmissions },
                                    { title: 'System Alerts',      desc: 'Receive alerts about system maintenance and downtime.',               value: systemAlerts,    setter: setSystemAlerts    },
                                    { title: 'Weekly Digest',      desc: 'Get a weekly summary of class activity and student performance.',     value: weeklyDigest,    setter: setWeeklyDigest    },
                                ].map((item) => (
                                    <div key={item.title} className="flex items-center justify-between py-5">
                                        <div className="flex flex-col pr-6">
                                            <span className="text-sm font-bold text-slate-900">{item.title}</span>
                                            <span className="text-sm text-slate-500 mt-0.5">{item.desc}</span>
                                        </div>
                                        <Toggle value={item.value} onChange={item.setter} />
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
