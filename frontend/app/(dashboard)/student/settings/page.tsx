'use client';

import React, { useState } from 'react';
import { User, Shield, Bell, Camera } from 'lucide-react';
import PageHeader from '@/components/layouts/PageHeader';
import { Card, Button, Input, Toggle, ConfirmModal, ToastContainer, useToast } from '@/components/ui';
import { useAuthStore } from '@/store/useAuthStore';
import { getStudentData } from '@/lib/mock-data/student';
import { STUDENT_SETTINGS_TABS, type SettingsTab } from '@/lib/navigation-config';

export default function SettingsPage() {
    const { user } = useAuthStore();
    const studentData = getStudentData(user?.id ?? 'alex_id');

    // Split name to prepopulate form
    const [firstName, ...lastNames] = studentData.name.split(' ');
    const lastName = lastNames.join(' ');
    const defaultProfile = {
        firstName,
        lastName,
        email: `${firstName.toLowerCase()}.${lastName.toLowerCase().replace(/ /g, '')}@school.edu`,
        phone: '+1 (555) 123-4567'
    };

    const [activeTab, setActiveTab] = useState<SettingsTab>('profile');
    const [formData, setFormData] = useState(defaultProfile);
    const { toasts, addToast, dismissToast } = useToast();

    // Security Form
    const [passwordForm, setPasswordForm] = useState({
        current: '',
        newPass: '',
        confirmPass: ''
    });
    const isPasswordValid = passwordForm.newPass.length >= 8 && passwordForm.newPass === passwordForm.confirmPass;

    // Confirm modal state
    const [confirmAction, setConfirmAction] = useState<{
        title: string;
        description: string;
        onConfirm: () => void;
    } | null>(null);

    // Notification toggle states
    const [notifPrefs, setNotifPrefs] = useState({
        emailAssignments: true,
        smsGrades: true,
        pushAnnouncements: false,
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSave = () => {
        setConfirmAction({
            title: 'Save Changes?',
            description: 'Your profile information will be updated.',
            onConfirm: () => {
                setConfirmAction(null);
                addToast('success', 'Changes saved successfully!');
            },
        });
    };

    const handleCancel = () => {
        setConfirmAction({
            title: 'Discard Changes?',
            description: 'All unsaved changes will be lost.',
            onConfirm: () => {
                setConfirmAction(null);
                setFormData(defaultProfile);
                addToast('info', 'Changes discarded.');
            },
        });
    };


    const renderTabContent = () => {
        switch (activeTab) {
            case 'profile':
                return (
                    <div className="space-y-8">
                        {/* Avatar */}
                        <div className="flex items-center gap-6">
                            <div className="relative">
                                <div className="h-24 w-24 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-4xl font-bold text-white shadow-md uppercase">
                                    {studentData.name.charAt(0)}
                                </div>
                                <button className="absolute bottom-0 right-0 p-2 bg-white rounded-full border border-slate-200 shadow-sm text-slate-600 hover:text-blue-600 transition-colors">
                                    <Camera className="w-4 h-4" />
                                </button>
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-slate-900">Profile Picture</h3>
                                <p className="text-sm text-slate-500">JPG, GIF or PNG. Max size of 800K</p>
                            </div>
                        </div>

                        <hr className="border-slate-100" />

                        {/* Form */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <Input
                                label="First Name"
                                name="firstName"
                                value={formData.firstName}
                                onChange={handleChange}
                            />
                            <Input
                                label="Last Name"
                                name="lastName"
                                value={formData.lastName}
                                onChange={handleChange}
                            />
                            <Input
                                label="Email Address"
                                name="email"
                                type="email"
                                value={formData.email}
                                onChange={handleChange}
                            />
                            <Input
                                label="Phone Number"
                                name="phone"
                                type="tel"
                                value={formData.phone}
                                onChange={handleChange}
                            />
                        </div>

                        <div className="pt-4 flex justify-end gap-3">
                            <Button variant="outline" onClick={handleCancel}>
                                Cancel
                            </Button>
                            <Button variant="primary" onClick={handleSave}>
                                Save Changes
                            </Button>
                        </div>
                    </div>
                );

            case 'security':
                return (
                    <div className="space-y-6 max-w-xl">
                        <Input
                            label="Current Password"
                            type="password"
                            placeholder="Enter current password"
                            value={passwordForm.current}
                            onChange={(e) => setPasswordForm(p => ({ ...p, current: e.target.value }))}
                        />
                        <Input
                            label="New Password"
                            type="password"
                            placeholder="Enter new password (min. 8 characters)"
                            value={passwordForm.newPass}
                            onChange={(e) => setPasswordForm(p => ({ ...p, newPass: e.target.value }))}
                        />
                        <Input
                            label="Confirm New Password"
                            type="password"
                            placeholder="Confirm new password"
                            value={passwordForm.confirmPass}
                            onChange={(e) => setPasswordForm(p => ({ ...p, confirmPass: e.target.value }))}
                        />
                        <div className="pt-4">
                            <Button
                                variant="primary"
                                disabled={!isPasswordValid || !passwordForm.current}
                                onClick={() => {
                                    addToast('success', 'Password updated successfully!');
                                    setPasswordForm({ current: '', newPass: '', confirmPass: '' });
                                }}
                            >
                                Update Password
                            </Button>
                        </div>
                    </div>
                );

            case 'notifications':
                return (
                    <div className="space-y-6">
                        <h3 className="text-lg font-bold text-slate-900 mb-4">Notification Preferences</h3>

                        <div className="space-y-1">
                            <Toggle
                                label="Email Alerts for Assignments"
                                description="Receive an email when a new assignment is posted."
                                checked={notifPrefs.emailAssignments}
                                onChange={(v) => setNotifPrefs(p => ({ ...p, emailAssignments: v }))}
                            />
                            <Toggle
                                label="SMS Alerts for Grades"
                                description="Get a text message when a new grade is published."
                                checked={notifPrefs.smsGrades}
                                onChange={(v) => setNotifPrefs(p => ({ ...p, smsGrades: v }))}
                            />
                            <Toggle
                                label="Push Notifications for Announcements"
                                description="Enable browser notifications for urgent school announcements."
                                checked={notifPrefs.pushAnnouncements}
                                onChange={(v) => setNotifPrefs(p => ({ ...p, pushAnnouncements: v }))}
                            />
                        </div>
                    </div>
                );

            default:
                return null;
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 font-sans">
            <PageHeader
                title="Settings"
                subtitle="Manage your account and preferences"
            />
            <div className="max-w-7xl mx-auto w-full flex flex-col">
                <div className="px-6 lg:px-8 pb-12 w-full max-w-5xl mt-8">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-8">

                        {/* Left: Tab Navigation */}
                        <div className="col-span-1 flex flex-col gap-2">
                            {STUDENT_SETTINGS_TABS.map((tab) => {
                                const Icon = tab.icon;
                                return (
                                    <button
                                        key={tab.key}
                                        onClick={() => setActiveTab(tab.key)}
                                        className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 text-left w-full ${
                                            activeTab === tab.key
                                                ? 'bg-white border border-slate-200 shadow-sm text-slate-900'
                                                : 'bg-transparent text-slate-500 hover:bg-slate-200/50 hover:text-slate-700'
                                        }`}
                                    >
                                        <Icon className={`w-5 h-5 ${activeTab === tab.key ? 'text-blue-600' : 'text-slate-400'}`} />
                                        {tab.label}
                                    </button>
                                );
                            })}
                        </div>

                        {/* Right: Content */}
                        <div className="col-span-1 md:col-span-3">
                            <Card className="p-6 sm:p-8">
                                <h2 className="text-xl font-bold text-slate-900 mb-6 font-serif">
                                    {activeTab === 'profile' && 'Personal Information'}
                                    {activeTab === 'security' && 'Change Password'}
                                    {activeTab === 'notifications' && 'Communication Preferences'}
                                </h2>
                                {renderTabContent()}
                            </Card>
                        </div>

                    </div>
                </div>
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