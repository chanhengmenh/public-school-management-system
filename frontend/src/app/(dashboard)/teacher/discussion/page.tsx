"use client";

import { useState } from "react";
import { teacherData } from "@/data/teacher-data";
import { MessageSquare, User, BookOpen, Plus, X, Users, ChevronDown } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface Discussion {
    id: number;
    topic: string;
    subject: string;
    class: string;
    author: string;
    replies: number;
    lastReply: string;
}

export default function TeacherDiscussionPage() {
    // Cast to unknown first then to expected shape if needed, or just use as is if types match
    // In a real app we would have proper types. for now we assume teacherData.discussions exists.
    const initialDiscussions = (teacherData as any).discussions || [];
    const { assignedClasses, assignedSubjects } = teacherData;

    const [discussions, setDiscussions] = useState<Discussion[]>(initialDiscussions);
    const [selectedClass, setSelectedClass] = useState("All Classes");
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Form State
    const [newTopic, setNewTopic] = useState("");
    const [newTopicSubject, setNewTopicSubject] = useState("");
    const [newTopicClass, setNewTopicClass] = useState("");
    const [newMessage, setNewMessage] = useState("");

    const filteredDiscussions = selectedClass === "All Classes"
        ? discussions
        : discussions.filter((d) => d.class === selectedClass);

    const handleCreateDiscussion = (e: React.FormEvent) => {
        e.preventDefault();

        if (!newTopic || !newTopicSubject || !newTopicClass) return;

        const newDiscussion: Discussion = {
            id: Date.now(),
            topic: newTopic,
            subject: newTopicSubject,
            class: newTopicClass,
            author: "Me", // Hardcoded current user
            replies: 0,
            lastReply: new Date().toISOString(),
        };

        setDiscussions([newDiscussion, ...discussions]);

        // Reset and close
        setNewTopic("");
        setNewTopicSubject("");
        setNewTopicClass("");
        setNewMessage("");
        setIsModalOpen(false);
    };

    // Filter subjects based on selected class in modal
    const getAvailableSubjectsForClass = (className: string) => {
        if (!className) return [];
        return assignedSubjects.filter(sub => sub.classes.includes(className));
    };

    return (
        <div className="space-y-6 relative max-w-7xl mx-auto">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-gray-900">Class Discussions</h1>
                    <p className="text-sm text-gray-500 mt-1">Manage and participate in discussions for your classes.</p>
                </div>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="inline-flex items-center justify-center gap-2 rounded-lg text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background bg-blue-600 text-white hover:bg-blue-700 h-10 py-2 px-4 shadow-sm"
                >
                    <Plus className="h-4 w-4" />
                    New Topic
                </button>
            </div>

            {/* Class Filter */}
            <div className="flex flex-wrap items-center gap-3">
                <span className="text-sm font-medium text-gray-700">Filter by Class:</span>
                <div className="relative">
                    <select
                        className="appearance-none bg-white border border-gray-200 text-gray-700 py-2 pl-4 pr-10 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm font-medium cursor-pointer"
                        value={selectedClass}
                        onChange={(e) => setSelectedClass(e.target.value)}
                    >
                        <option value="All Classes">All Classes</option>
                        {assignedClasses.map(c => (
                            <option key={c.id} value={c.name}>{c.name}</option>
                        ))}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4 pointer-events-none" />
                </div>
            </div>

            <div className="space-y-4">
                {filteredDiscussions.length > 0 ? (
                    filteredDiscussions.map((discussion) => (
                        <div key={discussion.id} className="group flex flex-col sm:flex-row sm:items-center rounded-xl border border-gray-200 bg-white p-5 shadow-sm hover:shadow-md hover:border-blue-200 transition-all">
                            <div className="flex-1 min-w-0">
                                <div className="flex flex-wrap items-center gap-2 mb-2">
                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-blue-50 text-blue-700">
                                        <BookOpen className="h-3 w-3" />
                                        {discussion.subject}
                                    </span>
                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-purple-50 text-purple-700">
                                        <Users className="h-3 w-3" />
                                        {discussion.class}
                                    </span>
                                </div>
                                <Link href="#" className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                                    {discussion.topic}
                                </Link>
                                <div className="mt-3 flex items-center gap-4 text-xs text-gray-500">
                                    <div className="flex items-center gap-2">
                                        <div className="h-5 w-5 rounded-full bg-gray-100 flex items-center justify-center">
                                            <User className="h-3 w-3 text-gray-500" />
                                        </div>
                                        <span>{discussion.author}</span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <MessageSquare className="h-3.5 w-3.5" />
                                        {discussion.replies} replies
                                    </div>
                                </div>
                            </div>
                            <div className="mt-4 sm:mt-0 flex items-center gap-2 text-xs text-gray-400 sm:text-right">
                                <span>Last activity</span>
                                <span>
                                    {new Date(discussion.lastReply).toLocaleDateString()}
                                </span>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="text-center py-12 bg-white rounded-xl border border-gray-100">
                        <MessageSquare className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                        <h3 className="text-lg font-medium text-gray-900">No discussions found</h3>
                        <p className="text-gray-500 text-sm mt-1">Select a different class or start a new discussion.</p>
                    </div>
                )}
            </div>

            {/* Create Discussion Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="w-full max-w-md bg-white text-black rounded-xl shadow-xl overflow-hidden animate-in zoom-in-95 duration-200">
                        <div className="flex items-center justify-between border-b px-6 py-4">
                            <h2 className="text-lg font-semibold">Start New Discussion</h2>
                            <button onClick={() => setIsModalOpen(false)} className="text-gray-500 hover:text-gray-700">
                                <X className="h-5 w-5" />
                            </button>
                        </div>
                        <form onSubmit={handleCreateDiscussion} className="p-6 space-y-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700">Topic Title</label>
                                <input
                                    type="text"
                                    required
                                    value={newTopic}
                                    onChange={(e) => setNewTopic(e.target.value)}
                                    placeholder="e.g., Week 5 Project Questions"
                                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                                    autoFocus
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700">Class</label>
                                <select
                                    required
                                    value={newTopicClass}
                                    onChange={(e) => {
                                        setNewTopicClass(e.target.value);
                                        setNewTopicSubject(""); // Reset subject when class changes
                                    }}
                                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                                >
                                    <option value="" disabled>Select a class</option>
                                    {assignedClasses.map(c => (
                                        <option key={c.id} value={c.name}>{c.name}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700">Subject</label>
                                <select
                                    required
                                    value={newTopicSubject}
                                    onChange={(e) => setNewTopicSubject(e.target.value)}
                                    disabled={!newTopicClass}
                                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:bg-gray-100 disabled:text-gray-400"
                                >
                                    <option value="" disabled>Select a subject</option>
                                    {getAvailableSubjectsForClass(newTopicClass).map(sub => (
                                        <option key={sub.id} value={sub.name}>{sub.name}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700">Initial Message</label>
                                <textarea
                                    required
                                    value={newMessage}
                                    onChange={(e) => setNewMessage(e.target.value)}
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
                                    Post Topic
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
