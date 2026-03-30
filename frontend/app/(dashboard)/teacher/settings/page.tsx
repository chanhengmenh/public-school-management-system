'use client';

import React, { useState } from 'react';
import PageHeader from '@/components/layouts/PageHeader';
import { Card, Button, Input, Toggle, ConfirmModal, ToastContainer, useToast } from '@/components/ui';
import { User, Shield, Bell, Save, Camera, Pencil, X } from 'lucide-react';
import { getTeacherData } from '@/lib/mock-data/teacher';
import { useAuthStore } from '@/store/useAuthStore';

// --- Types ---
type TabId = 'Profile' | 'Security' | 'Notifications';

const tabs: { id: TabId; label: string; icon: typeof User }[] = [
    { id: 'Profile', label: 'Profile', icon: User },
    { id: 'Security', label: 'Security', icon: Shield },
    { id: 'Notifications', label: 'Notifications', icon: Bell },
];

export default function TeacherSettingsPage() {
    const { user } = useAuthStore();
    const teacherData = getTeacherData(user?.id ?? 'teacher_001');

    const [activeTab, setActiveTab] = useState<TabId>('Profile');
    const { toasts, addToast, dismissToast } = useToast();

    // --- Profile State ---
    const [name, setName] = useState(teacherData.name);
    const [email, setEmail] = useState(`${teacherData.name.toLowerCase().replace(/\s+/g, '.')}@school.edu`);
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
        setConfirmAction({
            title: 'Discard Changes?',
            description: 'All unsaved profile changes will be lost.',
            onConfirm: () => {
                setConfirmAction(null);
                setIsEditing(false);
                addToast('info', 'Changes discarded.');
            },
        });
    };

    // --- Confirm modal state ---
    const [confirmAction, setConfirmAction] = useState<{
        title: string;
        description: string;
        onConfirm: () => void;
    } | null>(null);

    const handleEditSave = () => {
        setName(draftName);
        setEmail(draftEmail);
        setDepartment(draftDepartment);
        setBio(draftBio);
        setIsEditing(false);
        addToast('success', 'Profile updated successfully!');
    };

    // --- Security State ---
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    const isPasswordValid = newPassword.length >= 8 && newPassword === confirmPassword;

    const handlePasswordUpdate = () => {
        addToast('success', 'Password updated successfully!');
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
    };

    // --- Notification Toggles ---
    const [notifPrefs, setNotifPrefs] = useState({
        newMessages: true,
        lateSubmissions: true,
        systemAlerts: false,
        weeklyDigest: true,
    });

    const handleSaveNotifications = () => {
        addToast('success', 'Notification preferences saved!');
    };

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
                            <Button
                                key={tab.id}
                                variant={isActive ? 'primary' : 'ghost'}
                                color={isActive ? 'bg-indigo-600' : undefined}
                                icon={Icon}
                                onClick={() => setActiveTab(tab.id)}
                                className={`!justify-start !w-full !rounded-xl ${isActive ? 'shadow-sm shadow-indigo-500/20' : '!text-slate-600 hover:!text-slate-900'}`}
                            >
                                {tab.label}
                            </Button>
                        );
                    })}
                </div>

                {/* Right Content Area */}
                <Card className="flex-1 p-6 md:p-8">

                    {/* ====== PROFILE TAB ====== */}
                    {activeTab === 'Profile' && (
                        <div className="flex flex-col">
                            <div className="flex items-center justify-between mb-1">
                                <h2 className="text-xl font-bold text-slate-900">Profile Information</h2>
                                {!isEditing && (
                                    <Button
                                        variant="ghost"
                                        icon={Pencil}
                                        onClick={handleEditStart}
                                        className="!text-indigo-600 hover:!text-indigo-800 hover:!bg-indigo-50"
                                    >
                                        Edit Profile
                                    </Button>
                                )}
                            </div>
                            <p className="text-sm text-slate-500 mt-1 mb-8">
                                {isEditing ? 'Edit your personal details below.' : 'Your personal details and public profile.'}
                            </p>

                            {/* Avatar Section */}
                            <div className="flex items-center gap-5 mb-8 pb-8 border-b border-slate-100">
                                <div className="w-20 h-20 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-2xl font-bold shrink-0 border-2 border-indigo-200 uppercase">
                                    {teacherData.initials}
                                </div>
                                <div className="flex flex-col gap-2">
                                    <h3 className="text-sm font-bold text-slate-900">{isEditing ? draftName : name}</h3>
                                    {isEditing && (
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            icon={Camera}
                                            className="!text-indigo-600 hover:!text-indigo-800 !p-0"
                                        >
                                            Change Picture
                                        </Button>
                                    )}
                                </div>
                            </div>

                            {/* Input Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                                <Input
                                    label="Full Name"
                                    value={isEditing ? draftName : name}
                                    onChange={(e) => setDraftName(e.target.value)}
                                    readOnly={!isEditing}
                                    className={!isEditing ? '!bg-slate-50 !cursor-default' : ''}
                                />
                                <Input
                                    label="Email Address"
                                    type="email"
                                    value={isEditing ? draftEmail : email}
                                    onChange={(e) => setDraftEmail(e.target.value)}
                                    readOnly={!isEditing}
                                    className={!isEditing ? '!bg-slate-50 !cursor-default' : ''}
                                />
                                <Input
                                    label="Department"
                                    value={isEditing ? draftDepartment : department}
                                    onChange={(e) => setDraftDepartment(e.target.value)}
                                    readOnly={!isEditing}
                                    className={!isEditing ? '!bg-slate-50 !cursor-default' : ''}
                                />
                                <Input
                                    label="Employee ID"
                                    value="TCH-2025-001"
                                    readOnly
                                    disabled
                                    className="!bg-slate-50 !text-slate-400 !cursor-not-allowed"
                                />
                            </div>

                            <div className="flex flex-col gap-2 mb-8">
                                <label className="text-sm font-medium text-slate-700">Bio / Introduction</label>
                                <textarea
                                    value={isEditing ? draftBio : bio}
                                    onChange={(e) => setDraftBio(e.target.value)}
                                    readOnly={!isEditing}
                                    rows={4}
                                    className={`w-full px-4 py-2.5 rounded-lg border bg-slate-50 text-slate-900 font-sans transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 placeholder:text-slate-400 border-slate-200 resize-none ${!isEditing ? '!cursor-default' : ''}`}
                                />
                            </div>

                            {/* Footer — only shows when editing */}
                            {isEditing && (
                                <div className="flex justify-end gap-3 pt-6 border-t border-slate-100">
                                    <Button variant="outline" icon={X} onClick={handleEditCancel}>
                                        Cancel
                                    </Button>
                                    <Button variant="primary" color="bg-indigo-600" icon={Save} onClick={handleEditSave}>
                                        Save Changes
                                    </Button>
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
                                <Input
                                    label="Current Password"
                                    type="password"
                                    value={currentPassword}
                                    onChange={(e) => setCurrentPassword(e.target.value)}
                                    placeholder="Enter current password"
                                />
                                <Input
                                    label="New Password"
                                    type="password"
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    placeholder="Enter new password (min. 8 characters)"
                                />
                                <Input
                                    label="Confirm New Password"
                                    type="password"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    placeholder="Confirm new password"
                                />
                            </div>

                            <div className="flex justify-end pt-6 border-t border-slate-100">
                                <Button
                                    variant="primary"
                                    color="bg-indigo-600"
                                    icon={Shield}
                                    disabled={!isPasswordValid || !currentPassword}
                                    onClick={handlePasswordUpdate}
                                >
                                    Update Password
                                </Button>
                            </div>
                        </div>
                    )}

                    {/* ====== NOTIFICATIONS TAB ====== */}
                    {activeTab === 'Notifications' && (
                        <div className="flex flex-col">
                            <h2 className="text-xl font-bold text-slate-900">Notification Preferences</h2>
                            <p className="text-sm text-slate-500 mt-1 mb-8">Choose which notifications you want to receive.</p>

                            <div className="space-y-1">
                                <Toggle
                                    label="New Messages"
                                    description="Get notified when a student or staff member sends you a message."
                                    checked={notifPrefs.newMessages}
                                    onChange={(v) => setNotifPrefs(p => ({ ...p, newMessages: v }))}
                                />
                                <Toggle
                                    label="Late Submissions"
                                    description="Email me when a student submits work after the deadline."
                                    checked={notifPrefs.lateSubmissions}
                                    onChange={(v) => setNotifPrefs(p => ({ ...p, lateSubmissions: v }))}
                                />
                                <Toggle
                                    label="System Alerts"
                                    description="Receive alerts about system maintenance and downtime."
                                    checked={notifPrefs.systemAlerts}
                                    onChange={(v) => setNotifPrefs(p => ({ ...p, systemAlerts: v }))}
                                />
                                <Toggle
                                    label="Weekly Digest"
                                    description="Get a weekly summary of class activity and student performance."
                                    checked={notifPrefs.weeklyDigest}
                                    onChange={(v) => setNotifPrefs(p => ({ ...p, weeklyDigest: v }))}
                                />
                            </div>

                            <div className="flex justify-end pt-6 mt-4 border-t border-slate-100">
                                <Button
                                    variant="primary"
                                    color="bg-indigo-600"
                                    icon={Save}
                                    onClick={handleSaveNotifications}
                                >
                                    Save Preferences
                                </Button>
                            </div>
                        </div>
                    )}
                </Card>
            </div>

            {/* Confirm Modal */}
            <ConfirmModal
                isOpen={!!confirmAction}
                title={confirmAction?.title ?? ''}
                description={confirmAction?.description}
                onConfirm={() => confirmAction?.onConfirm()}
                onCancel={() => setConfirmAction(null)}
            />

            {/* Toast */}
            <ToastContainer toasts={toasts} onDismiss={dismissToast} />
        </div>
    );
}
