"use client";

import React, { useState } from "react";
import {
    Settings,
    User,
    Mail,
    Phone,
    Lock,
    Bell,
    Shield,
    Save,
    Edit2,
    Globe,
    Moon,
    Sun,
    Database,
    Key
} from "lucide-react";

const initialAdminProfile = {
    name: "Admin User",
    email: "[email protected]",
    phone: "+855 23 999 888",
    role: "System Administrator",
    avatar: "AD",
    joinDate: "January 2024",
};

const initialSettings = {
    emailNotifications: true,
    systemAlerts: true,
    weeklyReports: false,
    darkMode: false,
    language: "en",
    timezone: "Asia/Phnom_Penh",
    autoBackup: true,
    twoFactor: false,
};

export default function AdminSettingsPage() {
    const [profile, setProfile] = useState(initialAdminProfile);
    const [settings, setSettings] = useState(initialSettings);
    const [isEditingProfile, setIsEditingProfile] = useState(false);
    const [showPasswordModal, setShowPasswordModal] = useState(false);

    const handleProfileChange = (field: string, value: string) => {
        setProfile(prev => ({ ...prev, [field]: value }));
    };

    const handleSettingToggle = (field: string) => {
        setSettings(prev => ({ ...prev, [field]: !prev[field as keyof typeof prev] }));
    };

    const handleSaveProfile = () => {
        setIsEditingProfile(false);
        // Save logic
    };

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                    <Settings className="w-6 h-6 text-gray-600" />
                    Settings
                </h1>
                <p className="text-gray-500">Manage your profile and system preferences</p>
            </div>

            {/* Admin Profile Section */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                        <User className="w-5 h-5 text-blue-600" />
                        Admin Profile
                    </h2>
                    {isEditingProfile ? (
                        <button onClick={handleSaveProfile} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                            <Save className="w-4 h-4" />
                            Save
                        </button>
                    ) : (
                        <button onClick={() => setIsEditingProfile(true)} className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50">
                            <Edit2 className="w-4 h-4" />
                            Edit Profile
                        </button>
                    )}
                </div>

                <div className="flex flex-col md:flex-row gap-6">
                    {/* Avatar */}
                    <div className="flex flex-col items-center">
                        <div className="w-24 h-24 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-2xl border-4 border-blue-200">
                            {profile.avatar}
                        </div>
                        <p className="text-sm text-gray-500 mt-2">Administrator</p>
                        <p className="text-xs text-gray-400">Since {profile.joinDate}</p>
                    </div>

                    {/* Profile Fields */}
                    <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                            <input
                                type="text"
                                value={profile.name}
                                onChange={(e) => handleProfileChange("name", e.target.value)}
                                disabled={!isEditingProfile}
                                className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50 text-gray-900"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                            <input
                                type="text"
                                value={profile.role}
                                disabled
                                className="w-full px-4 py-2.5 rounded-lg border border-gray-200 bg-gray-50 text-gray-500"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <input
                                    type="email"
                                    value={profile.email}
                                    onChange={(e) => handleProfileChange("email", e.target.value)}
                                    disabled={!isEditingProfile}
                                    className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50 text-gray-900"
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                            <div className="relative">
                                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <input
                                    type="text"
                                    value={profile.phone}
                                    onChange={(e) => handleProfileChange("phone", e.target.value)}
                                    disabled={!isEditingProfile}
                                    className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50 text-gray-900"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Change Password Button */}
                <div className="mt-6 pt-4 border-t border-gray-100">
                    <button
                        onClick={() => setShowPasswordModal(true)}
                        className="flex items-center gap-2 px-4 py-2 text-gray-700 border border-gray-200 rounded-lg hover:bg-gray-50"
                    >
                        <Lock className="w-4 h-4" />
                        Change Password
                    </button>
                </div>
            </div>

            {/* Notification Settings */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2 mb-6">
                    <Bell className="w-5 h-5 text-orange-500" />
                    Notification Settings
                </h2>
                <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                        <div>
                            <h4 className="font-medium text-gray-900">Email Notifications</h4>
                            <p className="text-sm text-gray-500">Receive important updates via email</p>
                        </div>
                        <button
                            onClick={() => handleSettingToggle("emailNotifications")}
                            className={`w-12 h-6 rounded-full transition-colors ${settings.emailNotifications ? "bg-blue-600" : "bg-gray-300"}`}
                        >
                            <div className={`w-5 h-5 bg-white rounded-full shadow transform transition-transform ${settings.emailNotifications ? "translate-x-6" : "translate-x-0.5"}`}></div>
                        </button>
                    </div>
                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                        <div>
                            <h4 className="font-medium text-gray-900">System Alerts</h4>
                            <p className="text-sm text-gray-500">Get notified about system events</p>
                        </div>
                        <button
                            onClick={() => handleSettingToggle("systemAlerts")}
                            className={`w-12 h-6 rounded-full transition-colors ${settings.systemAlerts ? "bg-blue-600" : "bg-gray-300"}`}
                        >
                            <div className={`w-5 h-5 bg-white rounded-full shadow transform transition-transform ${settings.systemAlerts ? "translate-x-6" : "translate-x-0.5"}`}></div>
                        </button>
                    </div>
                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                        <div>
                            <h4 className="font-medium text-gray-900">Weekly Reports</h4>
                            <p className="text-sm text-gray-500">Receive weekly analytics summary</p>
                        </div>
                        <button
                            onClick={() => handleSettingToggle("weeklyReports")}
                            className={`w-12 h-6 rounded-full transition-colors ${settings.weeklyReports ? "bg-blue-600" : "bg-gray-300"}`}
                        >
                            <div className={`w-5 h-5 bg-white rounded-full shadow transform transition-transform ${settings.weeklyReports ? "translate-x-6" : "translate-x-0.5"}`}></div>
                        </button>
                    </div>
                </div>
            </div>

            {/* System Settings */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2 mb-6">
                    <Shield className="w-5 h-5 text-purple-500" />
                    System Settings
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Language</label>
                        <div className="relative">
                            <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <select
                                value={settings.language}
                                onChange={(e) => setSettings(prev => ({ ...prev, language: e.target.value }))}
                                className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-500 text-gray-900"
                            >
                                <option value="en">English</option>
                                <option value="km">Khmer</option>
                            </select>
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Timezone</label>
                        <select
                            value={settings.timezone}
                            onChange={(e) => setSettings(prev => ({ ...prev, timezone: e.target.value }))}
                            className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-500 text-gray-900"
                        >
                            <option value="Asia/Phnom_Penh">Asia/Phnom_Penh (UTC+7)</option>
                            <option value="Asia/Bangkok">Asia/Bangkok (UTC+7)</option>
                            <option value="UTC">UTC</option>
                        </select>
                    </div>
                </div>
                <div className="mt-6 space-y-4">
                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-3">
                            <Database className="w-5 h-5 text-gray-500" />
                            <div>
                                <h4 className="font-medium text-gray-900">Auto Backup</h4>
                                <p className="text-sm text-gray-500">Automatically backup data daily</p>
                            </div>
                        </div>
                        <button
                            onClick={() => handleSettingToggle("autoBackup")}
                            className={`w-12 h-6 rounded-full transition-colors ${settings.autoBackup ? "bg-blue-600" : "bg-gray-300"}`}
                        >
                            <div className={`w-5 h-5 bg-white rounded-full shadow transform transition-transform ${settings.autoBackup ? "translate-x-6" : "translate-x-0.5"}`}></div>
                        </button>
                    </div>
                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-3">
                            <Key className="w-5 h-5 text-gray-500" />
                            <div>
                                <h4 className="font-medium text-gray-900">Two-Factor Authentication</h4>
                                <p className="text-sm text-gray-500">Add extra security to your account</p>
                            </div>
                        </div>
                        <button
                            onClick={() => handleSettingToggle("twoFactor")}
                            className={`w-12 h-6 rounded-full transition-colors ${settings.twoFactor ? "bg-blue-600" : "bg-gray-300"}`}
                        >
                            <div className={`w-5 h-5 bg-white rounded-full shadow transform transition-transform ${settings.twoFactor ? "translate-x-6" : "translate-x-0.5"}`}></div>
                        </button>
                    </div>
                </div>
            </div>

            {/* Password Modal */}
            {showPasswordModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-xl p-6 w-full max-w-md">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Change Password</h3>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Current Password</label>
                                <input type="password" className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-500 text-gray-900" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
                                <input type="password" className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-500 text-gray-900" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Confirm New Password</label>
                                <input type="password" className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-500 text-gray-900" />
                            </div>
                        </div>
                        <div className="flex gap-3 mt-6">
                            <button onClick={() => setShowPasswordModal(false)} className="flex-1 px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50">
                                Cancel
                            </button>
                            <button onClick={() => setShowPasswordModal(false)} className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                                Update Password
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
