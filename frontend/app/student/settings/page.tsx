'use client';

import React, { useState } from 'react';
import { User, Shield, Bell, Camera } from 'lucide-react';

type Tab = 'profile' | 'security' | 'notifications';

const initialProfile = {
    firstName: 'Alex',
    lastName: 'Student',
    email: 'alex.student@school.edu',
    phone: '+1 (555) 123-4567'
};

export default function SettingsPage() {
    const [activeTab, setActiveTab] = useState<Tab>('profile');
    const [formData, setFormData] = useState(initialProfile);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSave = () => {
        if (window.confirm("Do you want to save these changes?")) {
            alert("Changes saved successfully!");
            // In a real app, you would make an API call here and update initialProfile
        }
    };

    const handleCancel = () => {
        if (window.confirm("Are you sure you want to cancel and discard your changes?")) {
            setFormData(initialProfile);
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
                                    A
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

                        {/* Form Section */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-700">First Name</label>
                                <input
                                    type="text"
                                    name="firstName"
                                    value={formData.firstName}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2.5 rounded-lg border border-slate-200 bg-slate-50 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-sans"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-700">Last Name</label>
                                <input
                                    type="text"
                                    name="lastName"
                                    value={formData.lastName}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2.5 rounded-lg border border-slate-200 bg-slate-50 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-sans"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-700">Email Address</label>
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2.5 rounded-lg border border-slate-200 bg-slate-50 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-sans"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-700">Phone Number</label>
                                <input
                                    type="tel"
                                    name="phone"
                                    value={formData.phone}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2.5 rounded-lg border border-slate-200 bg-slate-50 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-sans"
                                />
                            </div>
                        </div>

                        <div className="pt-4 flex justify-end gap-3">
                            <button
                                onClick={handleCancel}
                                className="px-6 py-2.5 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 font-medium rounded-lg shadow-sm transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSave}
                                className="px-6 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-medium rounded-lg shadow-sm transition-colors"
                            >
                                Save Changes
                            </button>
                        </div>
                    </div>
                );
            case 'security':
                return (
                    <div className="space-y-6 max-w-xl">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-700">Current Password</label>
                            <input
                                type="password"
                                placeholder="Enter current password"
                                className="w-full px-4 py-2.5 rounded-lg border border-slate-200 bg-slate-50 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-sans"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-700">New Password</label>
                            <input
                                type="password"
                                placeholder="Enter new password"
                                className="w-full px-4 py-2.5 rounded-lg border border-slate-200 bg-slate-50 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-sans"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-700">Confirm New Password</label>
                            <input
                                type="password"
                                placeholder="Confirm new password"
                                className="w-full px-4 py-2.5 rounded-lg border border-slate-200 bg-slate-50 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-sans"
                            />
                        </div>

                        <div className="pt-4">
                            <button className="px-6 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-medium rounded-lg shadow-sm transition-colors">
                                Update Password
                            </button>
                        </div>
                    </div>
                );
            case 'notifications':
                return (
                    <div className="space-y-6">
                        <h3 className="text-lg font-bold text-slate-900 mb-4">Notification Preferences</h3>

                        <div className="space-y-4">
                            {/* Toggle Row 1 */}
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

                            {/* Toggle Row 2 */}
                            <div className="flex items-center justify-between py-3 border-b border-slate-100 last:border-0">
                                <div className="flex flex-col">
                                    <span className="font-medium text-slate-800 text-sm">SMS Alerts for Grades</span>
                                    <span className="text-sm text-slate-500">Get a text message when a new grade is published.</span>
                                </div>
                                <label className="relative inline-flex items-center cursor-pointer shrink-0">
                                    <input type="checkbox" className="sr-only peer" defaultChecked />
                                    <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                                </label>
                            </div>

                            {/* Toggle Row 3 */}
                            <div className="flex items-center justify-between py-3 border-b border-slate-100 last:border-0">
                                <div className="flex flex-col">
                                    <span className="font-medium text-slate-800 text-sm">Push Notifications for Announcements</span>
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
                        <div></div> {/* Strictly empty right side */}
                    </div>
                </header>

                {/* Content Wrapper */}
                <div className="px-6 lg:px-8 pb-12 w-full max-w-5xl mt-8">
                    {/* Grid Layout (4 columns on desktop, 1 on mobile) */}
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
                                <User className={`w-5 h-5 ${activeTab === 'profile' ? 'text-blue-600' : 'text-slate-400'}`} />
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
                                    {activeTab === 'security' && 'Change Password'}
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