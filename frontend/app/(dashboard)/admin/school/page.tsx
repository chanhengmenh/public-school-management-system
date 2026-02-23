"use client";

import React, { useState } from "react";
import {
    Building2,
    Save,
    Plus,
    Trash2,
    Edit2,
    Megaphone,
    Trophy,
    MapPin,
    Phone,
    Mail,
    Globe,
    Calendar
} from "lucide-react";

const initialSchoolInfo = {
    name: "BUPP High School",
    established: "1985",
    address: "123 Norodom Blvd, Phnom Penh, Cambodia",
    phone: "+855 23 123 456",
    email: "[EMAIL_ADDRESS]",
    website: "www.bupphighschool.edu.kh",
    principal: "Dr. Sokha Pheakdey",
    motto: "Excellence Through Knowledge",
};

const initialAnnouncements = [
    { id: 1, title: "Mid-Term Exams Schedule", content: "Mid-term examinations will be held from February 20-25, 2026.", date: "2026-02-08", priority: "high" },
    { id: 2, title: "Parent-Teacher Meeting", content: "Annual parent-teacher conference scheduled for March 5, 2026.", date: "2026-02-05", priority: "medium" },
    { id: 3, title: "Sports Day Announcement", content: "Inter-class sports competition on March 15, 2026.", date: "2026-02-01", priority: "low" },
];

const initialAchievements = [
    { id: 1, title: "National Science Olympiad - Gold Medal", year: "2025", category: "Academic" },
    { id: 2, title: "Best School in Mathematics Award", year: "2025", category: "Academic" },
    { id: 3, title: "National Football Championship - 2nd Place", year: "2024", category: "Sports" },
    { id: 4, title: "Regional Debate Competition Winner", year: "2024", category: "Extracurricular" },
    { id: 5, title: "Green School Certification", year: "2024", category: "Environment" },
];

export default function SchoolProfilePage() {
    const [schoolInfo, setSchoolInfo] = useState(initialSchoolInfo);
    const [announcements, setAnnouncements] = useState(initialAnnouncements);
    const [achievements, setAchievements] = useState(initialAchievements);
    const [isEditing, setIsEditing] = useState(false);
    const [newAnnouncement, setNewAnnouncement] = useState({ title: "", content: "", priority: "medium" });
    const [showAnnouncementForm, setShowAnnouncementForm] = useState(false);

    const handleInfoChange = (field: string, value: string) => {
        setSchoolInfo(prev => ({ ...prev, [field]: value }));
    };

    const handleSaveInfo = () => {
        setIsEditing(false);
        // Save logic here
    };

    const handleAddAnnouncement = () => {
        if (newAnnouncement.title && newAnnouncement.content) {
            setAnnouncements(prev => [
                { id: Date.now(), ...newAnnouncement, date: new Date().toISOString().split('T')[0] },
                ...prev
            ]);
            setNewAnnouncement({ title: "", content: "", priority: "medium" });
            setShowAnnouncementForm(false);
        }
    };

    const handleDeleteAnnouncement = (id: number) => {
        setAnnouncements(prev => prev.filter(a => a.id !== id));
    };

    const handleDeleteAchievement = (id: number) => {
        setAchievements(prev => prev.filter(a => a.id !== id));
    };

    const getPriorityBadge = (priority: string) => {
        const colors: Record<string, string> = {
            high: "bg-red-100 text-red-700",
            medium: "bg-yellow-100 text-yellow-700",
            low: "bg-green-100 text-green-700",
        };
        return colors[priority] || "bg-gray-100 text-gray-700";
    };

    const getCategoryColor = (category: string) => {
        const colors: Record<string, string> = {
            Academic: "bg-blue-100 text-blue-700",
            Sports: "bg-green-100 text-green-700",
            Extracurricular: "bg-purple-100 text-purple-700",
            Environment: "bg-emerald-100 text-emerald-700",
        };
        return colors[category] || "bg-gray-100 text-gray-700";
    };

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                    <Building2 className="w-6 h-6 text-blue-600" />
                    School Profile Management
                </h1>
                <p className="text-gray-500">Manage school information, announcements, and achievements</p>
            </div>

            {/* School Info Form */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-lg font-semibold text-gray-900">School Information</h2>
                    {isEditing ? (
                        <button onClick={handleSaveInfo} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                            <Save className="w-4 h-4" />
                            Save Changes
                        </button>
                    ) : (
                        <button onClick={() => setIsEditing(true)} className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50">
                            <Edit2 className="w-4 h-4" />
                            Edit
                        </button>
                    )}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">School Name</label>
                        <input
                            type="text"
                            value={schoolInfo.name}
                            onChange={(e) => handleInfoChange("name", e.target.value)}
                            disabled={!isEditing}
                            className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50 text-gray-900"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Established</label>
                        <input
                            type="text"
                            value={schoolInfo.established}
                            onChange={(e) => handleInfoChange("established", e.target.value)}
                            disabled={!isEditing}
                            className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50 text-gray-900"
                        />
                    </div>
                    <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                        <div className="relative">
                            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input
                                type="text"
                                value={schoolInfo.address}
                                onChange={(e) => handleInfoChange("address", e.target.value)}
                                disabled={!isEditing}
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
                                value={schoolInfo.phone}
                                onChange={(e) => handleInfoChange("phone", e.target.value)}
                                disabled={!isEditing}
                                className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50 text-gray-900"
                            />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                        <div className="relative">
                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input
                                type="email"
                                value={schoolInfo.email}
                                onChange={(e) => handleInfoChange("email", e.target.value)}
                                disabled={!isEditing}
                                className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50 text-gray-900"
                            />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Website</label>
                        <div className="relative">
                            <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input
                                type="text"
                                value={schoolInfo.website}
                                onChange={(e) => handleInfoChange("website", e.target.value)}
                                disabled={!isEditing}
                                className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50 text-gray-900"
                            />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Principal</label>
                        <input
                            type="text"
                            value={schoolInfo.principal}
                            onChange={(e) => handleInfoChange("principal", e.target.value)}
                            disabled={!isEditing}
                            className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50 text-gray-900"
                        />
                    </div>
                    <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">School Motto</label>
                        <input
                            type="text"
                            value={schoolInfo.motto}
                            onChange={(e) => handleInfoChange("motto", e.target.value)}
                            disabled={!isEditing}
                            className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50 text-gray-900 italic"
                        />
                    </div>
                </div>
            </div>

            {/* Announcements */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                        <Megaphone className="w-5 h-5 text-orange-500" />
                        Announcements
                    </h2>
                    <button
                        onClick={() => setShowAnnouncementForm(!showAnnouncementForm)}
                        className="flex items-center gap-2 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600"
                    >
                        <Plus className="w-4 h-4" />
                        Add Announcement
                    </button>
                </div>

                {showAnnouncementForm && (
                    <div className="mb-6 p-4 bg-gray-50 rounded-lg space-y-4">
                        <input
                            type="text"
                            placeholder="Announcement Title"
                            value={newAnnouncement.title}
                            onChange={(e) => setNewAnnouncement(prev => ({ ...prev, title: e.target.value }))}
                            className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:ring-2 focus:ring-orange-500 text-gray-900"
                        />
                        <textarea
                            placeholder="Announcement Content"
                            value={newAnnouncement.content}
                            onChange={(e) => setNewAnnouncement(prev => ({ ...prev, content: e.target.value }))}
                            rows={3}
                            className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:ring-2 focus:ring-orange-500 text-gray-900"
                        />
                        <div className="flex gap-4">
                            <select
                                value={newAnnouncement.priority}
                                onChange={(e) => setNewAnnouncement(prev => ({ ...prev, priority: e.target.value }))}
                                className="px-4 py-2.5 rounded-lg border border-gray-200 focus:ring-2 focus:ring-orange-500 text-gray-900"
                            >
                                <option value="high">High Priority</option>
                                <option value="medium">Medium Priority</option>
                                <option value="low">Low Priority</option>
                            </select>
                            <button onClick={handleAddAnnouncement} className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600">
                                Publish
                            </button>
                        </div>
                    </div>
                )}

                <div className="space-y-3">
                    {announcements.map((a) => (
                        <div key={a.id} className="flex items-start justify-between p-4 border border-gray-100 rounded-lg hover:bg-gray-50">
                            <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                    <h4 className="font-medium text-gray-900">{a.title}</h4>
                                    <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${getPriorityBadge(a.priority)}`}>
                                        {a.priority}
                                    </span>
                                </div>
                                <p className="text-sm text-gray-600">{a.content}</p>
                                <p className="text-xs text-gray-400 mt-1 flex items-center gap-1">
                                    <Calendar className="w-3 h-3" /> {a.date}
                                </p>
                            </div>
                            <button
                                onClick={() => handleDeleteAnnouncement(a.id)}
                                className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg"
                            >
                                <Trash2 className="w-4 h-4" />
                            </button>
                        </div>
                    ))}
                </div>
            </div>

            {/* Achievements */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                        <Trophy className="w-5 h-5 text-yellow-500" />
                        School Achievements
                    </h2>
                    <button className="flex items-center gap-2 px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600">
                        <Plus className="w-4 h-4" />
                        Add Achievement
                    </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {achievements.map((a) => (
                        <div key={a.id} className="flex items-center justify-between p-4 border border-gray-100 rounded-lg hover:bg-gray-50">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-yellow-50 rounded-lg">
                                    <Trophy className="w-5 h-5 text-yellow-500" />
                                </div>
                                <div>
                                    <h4 className="font-medium text-gray-900 text-sm">{a.title}</h4>
                                    <div className="flex items-center gap-2 mt-1">
                                        <span className="text-xs text-gray-500">{a.year}</span>
                                        <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${getCategoryColor(a.category)}`}>
                                            {a.category}
                                        </span>
                                    </div>
                                </div>
                            </div>
                            <button
                                onClick={() => handleDeleteAchievement(a.id)}
                                className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg"
                            >
                                <Trash2 className="w-4 h-4" />
                            </button>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
