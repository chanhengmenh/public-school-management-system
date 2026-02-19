"use client";

import { useState } from "react";
import { MessageSquare, User, Plus, X, Users, Pencil, ChevronDown, ChevronUp } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface Reply {
    id: number;
    author: string;
    content: string;
    date: string;
}

interface Discussion {
    id: number;
    topic: string;
    class: string;
    author: string;
    replies: number;
    lastReply: string;
    description?: string;
    repliesList: Reply[];
}

// Mock Data targeting Class 10-A
const INITIAL_DISCUSSIONS: Discussion[] = [
    {
        id: 1,
        topic: "Upcoming Science Fair Projects",
        class: "Class 10-A",
        author: "Dara Sok",
        replies: 2,
        lastReply: "2026-02-18T10:30:00Z",
        description: "Let's discuss ideas for the science fair. I'm thinking of a volcano model, but maybe something more complex?",
        repliesList: [
            { id: 101, author: "Bopha Chan", content: "That sounds cool! Maybe investigate renewable energy?", date: "2026-02-18T09:15:00Z" },
            { id: 102, author: "Vibol Lim", content: "I can help with the coding part if anyone needs it.", date: "2026-02-18T10:30:00Z" }
        ]
    },
    {
        id: 2,
        topic: "Math Homework Help - Chapter 5",
        class: "Class 10-A",
        author: "Bopha Chan",
        replies: 1,
        lastReply: "2026-02-17T15:45:00Z",
        description: "I'm stuck on problem 5, anyone else?",
        repliesList: [
            { id: 201, author: "Mr. Tep Rendaro", content: "Check the example on page 142, it uses the same formula.", date: "2026-02-17T15:45:00Z" }
        ]
    },
    {
        id: 3,
        topic: "Class Trip Suggestions",
        class: "Class 10-A",
        author: "Vibol Lim",
        replies: 0,
        lastReply: "2026-02-16T09:20:00Z",
        description: "Where should we go this year? I was thinking the museum.",
        repliesList: []
    }
];

export default function HomeClassDiscussionPage() {
    const [discussions, setDiscussions] = useState<Discussion[]>(INITIAL_DISCUSSIONS);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [expandedId, setExpandedId] = useState<number | null>(null);

    // Form State
    const [formData, setFormData] = useState({
        topic: "",
        message: ""
    });

    // --- Handlers ---

    const handleOpenCreate = () => {
        setEditingId(null);
        setFormData({ topic: "", message: "" });
        setIsModalOpen(true);
    };

    const handleOpenEdit = (discussion: Discussion, e: React.MouseEvent) => {
        e.stopPropagation(); // Prevent toggling expand when clicking edit
        setEditingId(discussion.id);
        setFormData({
            topic: discussion.topic,
            message: discussion.description || ""
        });
        setIsModalOpen(true);
    };

    const toggleExpand = (id: number) => {
        setExpandedId(expandedId === id ? null : id);
    };

    const handleSave = (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.topic) return;

        if (editingId) {
            // Update existing
            setDiscussions(prev => prev.map(d =>
                d.id === editingId
                    ? { ...d, topic: formData.topic, description: formData.message }
                    : d
            ));
        } else {
            // Create new
            const newDiscussion: Discussion = {
                id: Date.now(),
                topic: formData.topic,
                class: "Class 10-A",
                author: "Me", // Hardcoded current user
                replies: 0,
                lastReply: new Date().toISOString(),
                description: formData.message,
                repliesList: []
            };
            setDiscussions([newDiscussion, ...discussions]);
        }

        // Reset and close
        setFormData({ topic: "", message: "" });
        setEditingId(null);
        setIsModalOpen(false);
    };

    return (
        <div className="space-y-6 relative max-w-7xl mx-auto p-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-gray-900">Class Discussions</h1>
                    <p className="text-sm text-gray-500 mt-1">Discussions for Class 10-A</p>
                </div>
                <button
                    onClick={handleOpenCreate}
                    className="inline-flex items-center justify-center gap-2 rounded-lg text-sm font-medium transition-colors bg-blue-600 text-white hover:bg-blue-700 h-10 py-2 px-4 shadow-sm"
                >
                    <Plus className="h-4 w-4" />
                    New Topic
                </button>
            </div>

            <div className="space-y-4">
                {discussions.length > 0 ? (
                    discussions.map((discussion) => (
                        <div key={discussion.id} className="rounded-xl border border-gray-200 bg-white shadow-sm hover:shadow-md transition-all overflow-hidden">
                            {/* Header / Summary Row */}
                            <div
                                onClick={() => toggleExpand(discussion.id)}
                                className="p-5 cursor-pointer flex flex-col sm:flex-row sm:items-center gap-4 hover:bg-gray-50 transition-colors"
                            >
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-purple-50 text-purple-700">
                                            <Users className="h-3 w-3" />
                                            {discussion.class}
                                        </span>
                                        <span className="text-xs text-gray-400">•</span>
                                        <span className="text-xs text-gray-500">
                                            Posted by {discussion.author}
                                        </span>
                                    </div>

                                    <div className="flex items-center gap-3">
                                        <h3 className="text-lg font-semibold text-gray-900">
                                            {discussion.topic}
                                        </h3>
                                        {/* Edit Button */}
                                        <button
                                            onClick={(e) => handleOpenEdit(discussion, e)}
                                            className="p-1 text-gray-400 hover:text-blue-600 rounded transition-colors"
                                            title="Edit Topic"
                                        >
                                            <Pencil className="h-3.5 w-3.5" />
                                        </button>
                                    </div>

                                    {/* Preview description if not expanded */}
                                    {!expandedId && discussion.description && (
                                        <p className="text-sm text-gray-500 mt-1 line-clamp-1">
                                            {discussion.description}
                                        </p>
                                    )}
                                </div>

                                <div className="flex items-center gap-4 text-sm text-gray-500 min-w-fit">
                                    <div className="flex items-center gap-1">
                                        <MessageSquare className="h-4 w-4" />
                                        {discussion.replies} replies
                                    </div>
                                    <div className="text-xs text-gray-400 text-right">
                                        <div>Last activity</div>
                                        <div>{new Date(discussion.lastReply).toLocaleDateString()}</div>
                                    </div>
                                    {expandedId === discussion.id ? (
                                        <ChevronUp className="h-5 w-5 text-gray-400" />
                                    ) : (
                                        <ChevronDown className="h-5 w-5 text-gray-400" />
                                    )}
                                </div>
                            </div>

                            {/* Expanded Content: Description & Replies */}
                            {expandedId === discussion.id && (
                                <div className="border-t border-gray-100 bg-gray-50/50 p-5 animate-in slide-in-from-top-2 duration-200">
                                    {/* Full Description */}
                                    {discussion.description && (
                                        <div className="mb-6 bg-white p-4 rounded-lg border border-gray-100 shadow-sm">
                                            <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Description</h4>
                                            <p className="text-gray-800 text-sm whitespace-pre-wrap">{discussion.description}</p>
                                        </div>
                                    )}

                                    {/* Replies Section */}
                                    <div>
                                        <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Replies ({discussion.replies})</h4>
                                        <div className="space-y-3">
                                            {discussion.repliesList.length > 0 ? (
                                                discussion.repliesList.map((reply) => (
                                                    <div key={reply.id} className="flex gap-3">
                                                        <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                                                            <User className="h-4 w-4 text-blue-600" />
                                                        </div>
                                                        <div className="bg-white p-3 rounded-lg border border-gray-200 shadow-sm flex-1">
                                                            <div className="flex justify-between items-start mb-1">
                                                                <span className="font-medium text-sm text-gray-900">{reply.author}</span>
                                                                <span className="text-xs text-gray-400">{new Date(reply.date).toLocaleDateString()} {new Date(reply.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                                            </div>
                                                            <p className="text-sm text-gray-700">{reply.content}</p>
                                                        </div>
                                                    </div>
                                                ))
                                            ) : (
                                                <p className="text-sm text-gray-500 italic px-2">No replies yet.</p>
                                            )}
                                        </div>

                                        {/* Placeholder for Reply Input */}
                                        <div className="mt-4 pt-4 border-t border-gray-200 flex gap-3">
                                            <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0">
                                                <User className="h-4 w-4 text-gray-500" />
                                            </div>
                                            <div className="flex-1">
                                                <input
                                                    type="text"
                                                    placeholder="Write a reply..."
                                                    className="w-full px-4 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                />
                                                <p className="text-xs text-gray-400 mt-1">Press Enter to reply (Simulation only)</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    ))
                ) : (
                    <div className="text-center py-12 bg-white rounded-xl border border-gray-100">
                        <MessageSquare className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                        <h3 className="text-lg font-medium text-gray-900">No discussions found</h3>
                        <p className="text-gray-500 text-sm mt-1">Start a new discussion to get things rolling.</p>
                    </div>
                )}
            </div>

            {/* Create/Edit Discussion Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="w-full max-w-md bg-white text-black rounded-xl shadow-xl overflow-hidden animate-in zoom-in-95 duration-200">
                        <div className="flex items-center justify-between border-b px-6 py-4">
                            <h2 className="text-lg font-semibold">
                                {editingId ? "Edit Discussion" : "Start New Discussion"}
                            </h2>
                            <button onClick={() => setIsModalOpen(false)} className="text-gray-500 hover:text-gray-700">
                                <X className="h-5 w-5" />
                            </button>
                        </div>
                        <form onSubmit={handleSave} className="p-6 space-y-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700">Topic Title</label>
                                <input
                                    type="text"
                                    required
                                    value={formData.topic}
                                    onChange={(e) => setFormData({ ...formData, topic: e.target.value })}
                                    placeholder="e.g., Week 5 Project Questions"
                                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                                    autoFocus
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700">
                                    {editingId ? "Update Message" : "Initial Message"}
                                </label>
                                <textarea
                                    required
                                    value={formData.message}
                                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                                    placeholder="What would you like to discuss?"
                                    rows={4}
                                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 resize-none"
                                />
                            </div>

                            <div className="flex gap-3 pt-2">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="flex-1 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
                                >
                                    {editingId ? "Save Changes" : "Post Topic"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
