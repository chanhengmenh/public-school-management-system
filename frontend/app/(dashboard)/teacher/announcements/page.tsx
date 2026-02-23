"use client";

import React, { useState } from "react";
import {
    Plus,
    Megaphone,
    X,
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

const CLASSES = ["10-A", "10-B", "11-A", "11-B", "12-A", "12-B"];

const MOCK_ANNOUNCEMENTS: Announcement[] = [
    {
        id: "1",
        title: "Mid-term Exam Schedule",
        content: "The mid-term exams will start from March 1st. Please review the attached schedule.",
        targetClasses: ["10-A", "10-B", "11-A", "11-B", "12-A", "12-B"],
        date: "2026-02-10",
        author: "Mr. Tep Rendaro",
    },
    {
        id: "2",
        title: "Science Fair Registration",
        content: "Registration for the annual Science Fair is now open. Interested students should sign up by Friday.",
        targetClasses: ["10-A", "11-A"],
        date: "2026-02-08",
        author: "Mr. Tep Rendaro",
    },
];

export default function TeacherAnnouncementsPage() {
    // Announcement State
    const [announcements, setAnnouncements] = useState<Announcement[]>(MOCK_ANNOUNCEMENTS);
    const [isAnnouncementModalOpen, setIsAnnouncementModalOpen] = useState(false);

    // Form State for new announcement
    const [announcementForm, setAnnouncementForm] = useState<Partial<Announcement>>({
        title: "",
        content: "",
        targetClasses: [],
    });

    // --- Announcement Handlers ---

    const handleSaveAnnouncement = () => {
        if (!announcementForm.title || !announcementForm.content || (announcementForm.targetClasses?.length || 0) === 0) {
            alert("Please fill in all required fields.");
            return;
        }

        const newAnnouncement: Announcement = {
            id: Math.random().toString(36).substr(2, 9),
            title: announcementForm.title!,
            content: announcementForm.content!,
            targetClasses: announcementForm.targetClasses!,
            date: new Date().toISOString().split('T')[0],
            author: "Mr. Tep Rendaro",
        };

        setAnnouncements([newAnnouncement, ...announcements]);
        setIsAnnouncementModalOpen(false);
        setAnnouncementForm({ title: "", content: "", targetClasses: [] });
    };

    const toggleClassSelection = (cls: string) => {
        const current = announcementForm.targetClasses || [];
        if (current.includes(cls)) {
            setAnnouncementForm({ ...announcementForm, targetClasses: current.filter(c => c !== cls) });
        } else {
            setAnnouncementForm({ ...announcementForm, targetClasses: [...current, cls] });
        }
    };

    return (
        <div className="space-y-6 max-w-7xl mx-auto p-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Announcements</h1>
                    <p className="text-gray-500">Communicate with your students and classes.</p>
                </div>
            </div>

            {/* Content */}
            <div className="space-y-6">
                <div className="flex justify-end">
                    <button
                        onClick={() => setIsAnnouncementModalOpen(true)}
                        className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors shadow-sm"
                    >
                        <Plus className="w-5 h-5" />
                        New Announcement
                    </button>
                </div>

                <div className="grid gap-4">
                    {announcements.map((announcement) => (
                        <div key={announcement.id} className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
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
                                <div className="flex gap-1">
                                    {announcement.targetClasses.map(c => (
                                        <span key={c} className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-xs">
                                            {c}
                                        </span>
                                    ))}
                                </div>
                            </div>
                            <p className="text-gray-600 whitespace-pre-line pl-12">{announcement.content}</p>
                        </div>
                    ))}
                    {announcements.length === 0 && (
                        <div className="text-center py-12 bg-white rounded-xl border border-gray-200 border-dashed">
                            <Megaphone className="w-12 h-12 bg-gray-50 text-gray-400 rounded-full flex items-center justify-center mx-auto mb-3" />
                            <h3 className="text-lg font-medium text-gray-900">No announcements yet</h3>
                            <p className="text-gray-500">Create an announcement to communicate with your classes.</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Announcement Modal */}
            {isAnnouncementModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                    <div className="bg-white rounded-xl shadow-xl w-full max-w-lg">
                        <div className="flex items-center justify-between p-6 border-b border-gray-100">
                            <h2 className="text-xl font-bold text-gray-900">New Announcement</h2>
                            <button onClick={() => setIsAnnouncementModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                                <X className="w-6 h-6" />
                            </button>
                        </div>
                        <div className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                                <input
                                    type="text"
                                    value={announcementForm.title}
                                    onChange={(e) => setAnnouncementForm({ ...announcementForm, title: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-gray-900"
                                    placeholder="Announcement Title"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Target Classes</label>
                                <div className="flex flex-wrap gap-2">
                                    {CLASSES.map(cls => (
                                        <button
                                            key={cls}
                                            onClick={() => toggleClassSelection(cls)}
                                            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors border ${announcementForm.targetClasses?.includes(cls)
                                                ? "bg-indigo-600 text-white border-indigo-600"
                                                : "bg-white text-gray-600 border-gray-200 hover:border-gray-300"
                                                }`}
                                        >
                                            {cls}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Content</label>
                                <textarea
                                    value={announcementForm.content}
                                    onChange={(e) => setAnnouncementForm({ ...announcementForm, content: e.target.value })}
                                    rows={4}
                                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none resize-none text-gray-900"
                                    placeholder="Type your announcement here..."
                                />
                            </div>
                        </div>
                        <div className="p-6 border-t border-gray-100 flex justify-end gap-3">
                            <button
                                onClick={() => setIsAnnouncementModalOpen(false)}
                                className="px-4 py-2 text-gray-600 font-medium hover:bg-gray-100 rounded-lg transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSaveAnnouncement}
                                className="px-4 py-2 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition-colors"
                            >
                                Post Announcement
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
