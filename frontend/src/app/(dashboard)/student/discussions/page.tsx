"use client";

import { studentData } from "@/data/student-data";
import { MessageSquare, User, BookOpen, Plus, X } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { cn } from "@/lib/utils";

interface Discussion {
    id: number;
    topic: string;
    subject: string;
    author: string;
    replies: number;
    lastReply: string;
}

interface Subject {
    id: string;
    name: string;
}

export default function StudentDiscussionsPage() {
    // Cast to unknown first then to expected shape
    const initialDiscussions = ((studentData as unknown) as { discussions: Discussion[] }).discussions || [];
    const subjects = (studentData as unknown as { subjects: Subject[] }).subjects;

    const [discussions, setDiscussions] = useState<Discussion[]>(initialDiscussions);
    const [selectedSubject, setSelectedSubject] = useState("All");
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Form State
    const [newTopic, setNewTopic] = useState("");
    const [newTopicSubject, setNewTopicSubject] = useState("");
    const [newMessage, setNewMessage] = useState(""); // Not used in list but would be in real app

    const filteredDiscussions = selectedSubject === "All"
        ? discussions
        : discussions.filter((d) => d.subject === selectedSubject);

    const handleCreateDiscussion = (e: React.FormEvent) => {
        e.preventDefault();

        if (!newTopic || !newTopicSubject) return;

        const newDiscussion: Discussion = {
            id: Date.now(), // Simple ID generation
            topic: newTopic,
            subject: newTopicSubject,
            author: "Me", // Hardcoded current user
            replies: 0,
            lastReply: new Date().toISOString(),
        };

        setDiscussions([newDiscussion, ...discussions]);

        // Reset and close
        setNewTopic("");
        setNewTopicSubject("");
        setNewMessage("");
        setIsModalOpen(false);
    };

    return (
        <div className="space-y-6 relative">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-gray-900">Discussions</h1>
                    <p className="text-sm text-gray-500 mt-1">Join the conversation with your teachers and classmates.</p>
                </div>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="inline-flex items-center justify-center gap-2 rounded-lg text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background bg-blue-600 text-white hover:bg-blue-700 h-10 py-2 px-4 shadow-sm"
                >
                    <Plus className="h-4 w-4" />
                    New Topic
                </button>
            </div>

            {/* Subject Filter */}
            <div className="flex gap-2 overflow-x-auto pb-2">
                <button
                    onClick={() => setSelectedSubject("All")}
                    className={cn(
                        "px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors",
                        selectedSubject === "All" ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    )}
                >
                    All Subjects
                </button>
                {subjects.map((sub) => (
                    <button
                        key={sub.id}
                        onClick={() => setSelectedSubject(sub.name)}
                        className={cn(
                            "px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors",
                            selectedSubject === sub.name ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                        )}
                    >
                        {sub.name}
                    </button>
                ))}
            </div>

            <div className="space-y-4">
                {filteredDiscussions.map((discussion) => (
                    <div key={discussion.id} className="group flex flex-col sm:flex-row sm:items-center rounded-xl border border-gray-200 bg-white p-5 shadow-sm hover:shadow-md hover:border-blue-200 transition-all">
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-2">
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-blue-50 text-blue-700">
                                    <BookOpen className="h-3 w-3" />
                                    {discussion.subject}
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
                ))}
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
                                    placeholder="e.g., Help with Calculus Homework"
                                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700">Subject</label>
                                <select
                                    required
                                    value={newTopicSubject}
                                    onChange={(e) => setNewTopicSubject(e.target.value)}
                                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                                >
                                    <option value="" disabled>Select a subject</option>
                                    {subjects.map(sub => (
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
