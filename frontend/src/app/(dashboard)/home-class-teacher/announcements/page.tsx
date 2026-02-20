"use client";

import React, { useState } from "react";
import {
    Plus,
    Megaphone,
    X,
    Pencil,
    Trash2,
} from "lucide-react";

// --- Types ---

interface Announcement {
    id: string;
    title: string;
    content: string;
    targetClasses: string[];
    date: string;
    author: string;
}

// --- Mock Data ---

const MOCK_ANNOUNCEMENTS: Announcement[] = [
    {
        id: "1",
        title: "Parent-Teacher Meeting",
        content: "We will be holding a parent-teacher meeting next Friday at 2 PM in Room A101.",
        targetClasses: ["Class 10-A"],
        date: "2026-02-15",
        author: "Mr. Tep Rendaro",
    },
    {
        id: "2",
        title: "Clean-up Day",
        content: "This Saturday is our monthly campus clean-up day. Volunteers from Class 10-A are needed!",
        targetClasses: ["Class 10-A"],
        date: "2026-02-12",
        author: "Mr. Tep Rendaro",
    },
];

export default function HomeClassAnnouncementsPage() {
    // Announcement State
    const [announcements, setAnnouncements] = useState<Announcement[]>(MOCK_ANNOUNCEMENTS);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);

    // Form State
    const [formData, setFormData] = useState<Partial<Announcement>>({
        title: "",
        content: "",
        targetClasses: ["Class 10-A"],
    });

    // --- Handlers ---

    const handleOpenCreate = () => {
        setEditingId(null);
        setFormData({ title: "", content: "", targetClasses: ["Class 10-A"] });
        setIsModalOpen(true);
    };

    const handleOpenEdit = (announcement: Announcement) => {
        setEditingId(announcement.id);
        setFormData({
            title: announcement.title,
            content: announcement.content,
            targetClasses: announcement.targetClasses,
        });
        setIsModalOpen(true);
    };

    const handleDelete = (id: string) => {
        if (confirm("Are you sure you want to delete this announcement?")) {
            setAnnouncements(prev => prev.filter(a => a.id !== id));
        }
    };

    const handleSave = () => {
        if (!formData.title || !formData.content) {
            alert("Please fill in all required fields.");
            return;
        }

        if (editingId) {
            // Update existing
            setAnnouncements(prev => prev.map(a =>
                a.id === editingId
                    ? { ...a, title: formData.title!, content: formData.content! }
                    : a
            ));
        } else {
            // Create new
            const newAnnouncement: Announcement = {
                id: Math.random().toString(36).substr(2, 9),
                title: formData.title!,
                content: formData.content!,
                targetClasses: ["Class 10-A"],
                date: new Date().toISOString().split('T')[0],
                author: "Mr. Tep Rendaro",
            };
            setAnnouncements([newAnnouncement, ...announcements]);
        }

        setIsModalOpen(false);
        setEditingId(null);
        setFormData({ title: "", content: "", targetClasses: ["Class 10-A"] });
    };

    return (
        <div className="space-y-6 max-w-7xl mx-auto p-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Class Announcements</h1>
                    <p className="text-gray-500">Announcements for Class 10-A</p>
                </div>
            </div>

            {/* Content */}
            <div className="space-y-6">
                <div className="flex justify-end">
                    <button
                        onClick={handleOpenCreate}
                        className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors shadow-sm"
                    >
                        <Plus className="w-5 h-5" />
                        New Announcement
                    </button>
                </div>

                <div className="grid gap-4">
                    {announcements.map((announcement) => (
                        <div key={announcement.id} className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm group">
                            <div className="flex items-start justify-between gap-4 mb-3">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-orange-100 text-orange-600 rounded-lg">
                                        <Megaphone className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-gray-900">{announcement.title}</h3>
                                        <p className="text-xs text-gray-500">Posted on {new Date(announcement.date).toLocaleDateString()} by {announcement.author}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="flex gap-1">
                                        {announcement.targetClasses.map(c => (
                                            <span key={c} className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-xs">
                                                {c}
                                            </span>
                                        ))}
                                    </div>
                                    {/* Action Buttons */}
                                    <div className="flex gap-1 ml-2">
                                        <button
                                            onClick={() => handleOpenEdit(announcement)}
                                            className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                            title="Edit"
                                        >
                                            <Pencil className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(announcement.id)}
                                            className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                            title="Delete"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                            <p className="text-gray-600 whitespace-pre-line pl-12">{announcement.content}</p>
                        </div>
                    ))}
                    {announcements.length === 0 && (
                        <div className="text-center py-12 bg-white rounded-xl border border-gray-200 border-dashed">
                            <Megaphone className="w-12 h-12 bg-gray-50 text-gray-400 rounded-full flex items-center justify-center mx-auto mb-3" />
                            <h3 className="text-lg font-medium text-gray-900">No announcements yet</h3>
                            <p className="text-gray-500">Create an announcement to communicate with your class.</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Announcement Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                    <div className="bg-white rounded-xl shadow-xl w-full max-w-lg">
                        <div className="flex items-center justify-between p-6 border-b border-gray-100">
                            <h2 className="text-xl font-bold text-gray-900">
                                {editingId ? "Edit Announcement" : "New Announcement"}
                            </h2>
                            <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                                <X className="w-6 h-6" />
                            </button>
                        </div>
                        <div className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                                <input
                                    type="text"
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-gray-900"
                                    placeholder="Announcement Title"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Content</label>
                                <textarea
                                    value={formData.content}
                                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                                    rows={4}
                                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none resize-none text-gray-900"
                                    placeholder="Type your announcement here..."
                                />
                            </div>
                        </div>
                        <div className="p-6 border-t border-gray-100 flex justify-end gap-3">
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="px-4 py-2 text-gray-600 font-medium hover:bg-gray-100 rounded-lg transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSave}
                                className="px-4 py-2 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition-colors"
                            >
                                {editingId ? "Save Changes" : "Post Announcement"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
