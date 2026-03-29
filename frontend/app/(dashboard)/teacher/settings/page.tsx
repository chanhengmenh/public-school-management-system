'use client';

import React, { useState } from 'react';
import PageHeader from '@/components/layouts/PageHeader';
import { User, Shield, Bell, Save, Camera, ToggleLeft, ToggleRight, Pencil, X } from 'lucide-react';

// --- Types ---
type TabId = 'Profile' | 'Security' | 'Notifications';

const tabs: { id: TabId; label: string; icon: typeof User }[] = [
    { id: 'Profile', label: 'Profile', icon: User },
    { id: 'Security', label: 'Security', icon: Shield },
    { id: 'Notifications', label: 'Notifications', icon: Bell },
];

export default function TeacherSettingsPage() {
    const [activeTab, setActiveTab] = useState<TabId>('Profile');

    // --- Profile State ---
    const [name, setName] = useState('Mr. Tan Wei');
    const [email, setEmail] = useState('tan.wei@school.edu');
    const [department, setDepartment] = useState('Science');
    const [bio, setBio] = useState('Physics teacher with 8 years of experience specializing in mechanics and thermodynamics. Passionate about making complex concepts accessible to all students.');

    // --- Profile Edit Mode ---
    const [isEditing, setIsEditing] = useState(false);
    const [draftName, setDraftName] = useState(name);
    const [draftEmail, setDraftEmail] = useState(email);
    const [draftDepartment, setDraftDepartment] = useState(department);
    const [draftBio, setDraftBio] = useState(bio);

    const handleEditStart = () => {
        setDraftName(name);
        setDraftEmail(email);
        setDraftDepartment(department);
        setDraftBio(bio);
        setIsEditing(true);
    };

    const handleEditCancel = () => {
        setIsEditing(false);
    };

    const handleEditSave = () => {
        setName(draftName);
        setEmail(draftEmail);
        setDepartment(draftDepartment);
        setBio(draftBio);
        setIsEditing(false);
        setShowToast(true);
        setTimeout(() => setShowToast(false), 3000);
    };

    // --- Security State ---
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    // --- Notification Toggles ---
    const [newMessages, setNewMessages] = useState(true);
    const [lateSubmissions, setLateSubmissions] = useState(true);
    const [systemAlerts, setSystemAlerts] = useState(false);
    const [weeklyDigest, setWeeklyDigest] = useState(true);

    // --- Save Toast ---
    const [showToast, setShowToast] = useState(false);
    const handleSave = () => {
        setShowToast(true);
        setTimeout(() => setShowToast(false), 3000);
    };

    // --- Toggle Component ---
    const Toggle = ({ value, onChange }: { value: boolean; onChange: (v: boolean) => void }) => (
        <button onClick={() => onChange(!value)} className="transition-colors">
            {value
                ? <ToggleRight className="w-8 h-8 text-indigo-600" />
                : <ToggleLeft className="w-8 h-8 text-slate-300" />
            }
        </button>
    );

    const inputClass = 'w-full border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-900 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 outline-none transition-all placeholder:text-slate-400';
    const readOnlyClass = `${inputClass} bg-slate-50 cursor-default`;

    return (
        <div className="min-h-screen bg-slate-50">
            <PageHeader
                title="Settings"
                subtitle="Manage your account preferences and portal settings"
            />

            <div className="max-w-7xl mx-auto px-6 lg:px-8 py-8 flex flex-col md:flex-row gap-8">

                {/* Left Sidebar */}
                <div className="w-full md:w-64 shrink-0 flex flex-col gap-2">
                    {tabs.map((tab) => {
                        const Icon = tab.icon;
                        const isActive = activeTab === tab.id;
                        return (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-colors w-full text-left ${isActive
                                    ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-500/20'
                                    : 'text-slate-600 hover:bg-slate-200 hover:text-slate-900'
                                    }`}
                            >
                                <Icon className="w-4 h-4" />
                                {tab.label}
                            </button>
                        );
                    })}
                </div>

                {/* Right Content Area */}
                <div className="flex-1 bg-white rounded-2xl border border-slate-200 shadow-sm p-6 md:p-8">

                    {/* ====== PROFILE TAB ====== */}
                    {activeTab === 'Profile' && (
                        <div className="flex flex-col">
                            <div className="flex items-center justify-between mb-1">
                                <h2 className="text-xl font-bold text-slate-900">Profile Information</h2>
                                {!isEditing && (
                                    <button
                                        onClick={handleEditStart}
                                        className="flex items-center gap-2 text-sm font-bold text-indigo-600 hover:text-indigo-800 transition-colors px-4 py-2 rounded-xl hover:bg-indigo-50"
                                    >
                                        <Pencil className="w-4 h-4" />
                                        Edit Profile
                                    </button>
                                )}
                            </div>
                            <p className="text-sm text-slate-500 mt-1 mb-8">
                                {isEditing ? 'Edit your personal details below.' : 'Your personal details and public profile.'}
                            </p>

                            {/* Avatar Section */}
                            <div className="flex items-center gap-5 mb-8 pb-8 border-b border-slate-100">
                                <div className="w-20 h-20 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-2xl font-bold shrink-0 border-2 border-indigo-200">
                                    TW
                                </div>
                                <div className="flex flex-col gap-2">
                                    <h3 className="text-sm font-bold text-slate-900">{isEditing ? draftName : name}</h3>
                                    {isEditing && (
                                        <button className="flex items-center gap-2 text-sm font-bold text-indigo-600 hover:text-indigo-800 transition-colors">
                                            <Camera className="w-4 h-4" />
                                            Change Picture
                                        </button>
                                    )}
                                </div>
                            </div>

                            {/* Input Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                                <div className="flex flex-col gap-2">
                                    <label className="text-sm font-bold text-slate-700">Full Name</label>
                                    <input
                                        type="text"
                                        value={isEditing ? draftName : name}
                                        onChange={(e) => setDraftName(e.target.value)}
                                        readOnly={!isEditing}
                                        className={isEditing ? inputClass : readOnlyClass}
                                    />
                                </div>
                                <div className="flex flex-col gap-2">
                                    <label className="text-sm font-bold text-slate-700">Email Address</label>
                                    <input
                                        type="email"
                                        value={isEditing ? draftEmail : email}
                                        onChange={(e) => setDraftEmail(e.target.value)}
                                        readOnly={!isEditing}
                                        className={isEditing ? inputClass : readOnlyClass}
                                    />
                                </div>
                                <div className="flex flex-col gap-2">
                                    <label className="text-sm font-bold text-slate-700">Department</label>
                                    <input
                                        type="text"
                                        value={isEditing ? draftDepartment : department}
                                        onChange={(e) => setDraftDepartment(e.target.value)}
                                        readOnly={!isEditing}
                                        className={isEditing ? inputClass : readOnlyClass}
                                    />
                                </div>
                                <div className="flex flex-col gap-2">
                                    <label className="text-sm font-bold text-slate-700">Employee ID</label>
                                    <input
                                        type="text"
                                        value="TCH-2025-001"
                                        readOnly
                                        className={`${inputClass} bg-slate-50 text-slate-400 cursor-not-allowed`}
                                    />
                                </div>
                            </div>

                            <div className="flex flex-col gap-2 mb-8">
                                <label className="text-sm font-bold text-slate-700">Bio / Introduction</label>
                                <textarea
                                    value={isEditing ? draftBio : bio}
                                    onChange={(e) => setDraftBio(e.target.value)}
                                    readOnly={!isEditing}
                                    rows={4}
                                    className={`${isEditing ? inputClass : readOnlyClass} resize-none`}
                                />
                            </div>

                            {/* Footer — only shows when editing */}
                            {isEditing && (
                                <div className="flex justify-end gap-3 pt-6 border-t border-slate-100">
                                    <button
                                        onClick={handleEditCancel}
                                        className="bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-slate-300 px-6 py-2.5 rounded-xl text-sm font-bold shadow-sm transition-all flex items-center gap-2 active:scale-95"
                                    >
                                        <X className="w-4 h-4" />
                                        Cancel
                                    </button>
                                    <button
                                        onClick={handleEditSave}
                                        className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2.5 rounded-xl text-sm font-bold shadow-sm transition-all flex items-center gap-2 active:scale-95"
                                    >
                                        <Save className="w-4 h-4" />
                                        Save Changes
                                    </button>
                                </div>
                            )}
                        </div>
                    )}

                    {/* ====== SECURITY TAB ====== */}
                    {activeTab === 'Security' && (
                        <div className="flex flex-col">
                            <h2 className="text-xl font-bold text-slate-900">Security Settings</h2>
                            <p className="text-sm text-slate-500 mt-1 mb-8">Manage your password and account security.</p>

                            <div className="max-w-md flex flex-col gap-6 mb-8">
                                <div className="flex flex-col gap-2">
                                    <label className="text-sm font-bold text-slate-700">Current Password</label>
                                    <input
                                        type="password"
                                        value={currentPassword}
                                        onChange={(e) => setCurrentPassword(e.target.value)}
                                        placeholder="Enter current password"
                                        className={inputClass}
                                    />
                                </div>
                                <div className="flex flex-col gap-2">
                                    <label className="text-sm font-bold text-slate-700">New Password</label>
                                    <input
                                        type="password"
                                        value={newPassword}
                                        onChange={(e) => setNewPassword(e.target.value)}
                                        placeholder="Enter new password"
                                        className={inputClass}
                                    />
                                </div>
                                <div className="flex flex-col gap-2">
                                    <label className="text-sm font-bold text-slate-700">Confirm New Password</label>
                                    <input
                                        type="password"
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        placeholder="Confirm new password"
                                        className={inputClass}
                                    />
                                </div>
                            </div>

                            <div className="flex justify-end pt-6 border-t border-slate-100">
                                <button
                                    onClick={handleSave}
                                    className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2.5 rounded-xl text-sm font-bold shadow-sm transition-all flex items-center gap-2 active:scale-95"
                                >
                                    <Shield className="w-4 h-4" />
                                    Update Password
                                </button>
                            </div>
                        </div>
                    )}

                    {/* ====== NOTIFICATIONS TAB ====== */}
                    {activeTab === 'Notifications' && (
                        <div className="flex flex-col">
                            <h2 className="text-xl font-bold text-slate-900">Notification Preferences</h2>
                            <p className="text-sm text-slate-500 mt-1 mb-8">Choose which notifications you want to receive.</p>

                            <div className="flex flex-col divide-y divide-slate-100">
                                {[
                                    { title: 'New Messages', desc: 'Get notified when a student or staff member sends you a message.', value: newMessages, setter: setNewMessages },
                                    { title: 'Late Submissions', desc: 'Email me when a student submits work after the deadline.', value: lateSubmissions, setter: setLateSubmissions },
                                    { title: 'System Alerts', desc: 'Receive alerts about system maintenance and downtime.', value: systemAlerts, setter: setSystemAlerts },
                                    { title: 'Weekly Digest', desc: 'Get a weekly summary of class activity and student performance.', value: weeklyDigest, setter: setWeeklyDigest },
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

                            <div className="flex justify-end pt-6 mt-4 border-t border-slate-100">
                                <button
                                    onClick={handleSave}
                                    className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2.5 rounded-xl text-sm font-bold shadow-sm transition-all flex items-center gap-2 active:scale-95"
                                >
                                    <Save className="w-4 h-4" />
                                    Save Preferences
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Success Toast */}
            {showToast && (
                <div className="fixed bottom-6 right-6 z-50 animate-in slide-in-from-bottom-4 fade-in duration-300">
                    <div className="bg-slate-900 text-white px-6 py-3.5 rounded-2xl shadow-2xl flex items-center gap-3">
                        <Save className="w-5 h-5 text-green-400 shrink-0" />
                        <span className="text-sm font-bold">Settings saved successfully!</span>
                    </div>
                </div>
            )}
        </div>
    );
}
