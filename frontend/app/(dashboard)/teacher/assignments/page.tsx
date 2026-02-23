"use client";

import React, { useState } from "react";
import {
    Plus,
    Search,
    Filter,
    Calendar,
    FileText,
    Edit,
    Trash2,
    X,
    ChevronDown,
    BookOpen,
    Paperclip
} from "lucide-react";

// --- Types ---

type Session = "Morning" | "Afternoon" | "Evening";

interface Assignment {
    id: string;
    title: string;
    subject: string;
    classes: string[];
    session: Session;
    dueDate: string;
    description: string;
    status: "Active" | "Draft" | "Closed";
    attachment?: string; // Mocking file attachment as a string (filename)
}

// --- Mock Data ---

const SUBJECTS = ["Mathematics", "Physics", "Chemistry", "English", "History", "Computer Science"];
const SESSIONS: Session[] = ["Morning", "Afternoon", "Evening"];
const CLASSES = ["10-A", "10-B", "11-A", "11-B", "12-A", "12-B"];

const MOCK_ASSIGNMENTS: Assignment[] = [
    {
        id: "1",
        title: "Algebra Problem Set 1",
        subject: "Mathematics",
        classes: ["10-A", "10-B"],
        session: "Morning",
        dueDate: "2026-02-15",
        description: "Complete exercises 1-20 from Chapter 3.",
        status: "Active",
        attachment: "algebra_ch3.pdf"
    },
    {
        id: "2",
        title: "Physics Lab Report",
        subject: "Physics",
        classes: ["11-A"],
        session: "Afternoon",
        dueDate: "2026-02-18",
        description: "Submit the lab report for the pendulum experiment.",
        status: "Active",
    },
    {
        id: "3",
        title: "Essay: Industrial Revolution",
        subject: "History",
        classes: ["12-A", "12-B"],
        session: "Morning",
        dueDate: "2026-02-20",
        description: "Write a 1000-word essay on the impact of the Industrial Revolution.",
        status: "Draft",
    },
];

export default function TeacherAssignmentsPage() {
    // Assignment State
    const [assignments, setAssignments] = useState<Assignment[]>(MOCK_ASSIGNMENTS);
    const [searchQuery, setSearchQuery] = useState("");
    const [filterSession, setFilterSession] = useState<Session | "All">("All");
    const [filterSubject, setFilterSubject] = useState<string>("All");
    const [isAssignmentModalOpen, setIsAssignmentModalOpen] = useState(false);
    const [currentAssignment, setCurrentAssignment] = useState<Assignment | null>(null);

    // Form Stats for new/edit assignment
    const [formData, setFormData] = useState<Partial<Assignment>>({
        title: "",
        subject: SUBJECTS[0],
        classes: [],
        session: "Morning",
        dueDate: "",
        description: "",
        status: "Active",
        attachment: ""
    });

    // --- Assignment Handlers ---

    const filteredAssignments = assignments.filter((assignment) => {
        const matchesSearch = assignment.title.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesSession = filterSession === "All" || assignment.session === filterSession;
        const matchesSubject = filterSubject === "All" || assignment.subject === filterSubject;
        return matchesSearch && matchesSession && matchesSubject;
    });

    const handleOpenAssignmentModal = (assignment?: Assignment) => {
        if (assignment) {
            setCurrentAssignment(assignment);
            setFormData(assignment);
        } else {
            setCurrentAssignment(null);
            setFormData({
                title: "",
                subject: SUBJECTS[0],
                classes: [],
                session: "Morning",
                dueDate: "",
                description: "",
                status: "Active",
                attachment: ""
            });
        }
        setIsAssignmentModalOpen(true);
    };

    const handleSaveAssignment = () => {
        if (!formData.title || !formData.dueDate || (formData.classes?.length || 0) === 0) {
            alert("Please fill in all required fields.");
            return;
        }

        if (currentAssignment) {
            // Edit
            setAssignments(assignments.map(a => a.id === currentAssignment.id ? { ...currentAssignment, ...formData } as Assignment : a));
        } else {
            // Create
            const newAssignment: Assignment = {
                ...formData as Assignment,
                id: Math.random().toString(36).substr(2, 9),
            };
            setAssignments([newAssignment, ...assignments]);
        }
        setIsAssignmentModalOpen(false);
    };

    const handleDeleteAssignment = (id: string) => {
        if (confirm("Are you sure you want to delete this assignment?")) {
            setAssignments(assignments.filter(a => a.id !== id));
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            // In a real app, we would upload the file here.
            // For now, we just store the filename.
            setFormData({ ...formData, attachment: e.target.files[0].name });
        }
    };

    // --- Render Helpers ---

    const toggleClassSelection = (cls: string) => {
        const current = formData.classes || [];
        if (current.includes(cls)) {
            setFormData({ ...formData, classes: current.filter(c => c !== cls) });
        } else {
            setFormData({ ...formData, classes: [...current, cls] });
        }
    };

    return (
        <div className="space-y-6 max-w-7xl mx-auto p-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Assignments</h1>
                    <p className="text-gray-500">Manage your class assignments.</p>
                </div>
            </div>

            <div className="space-y-6">
                {/* Controls */}
                <div className="flex flex-col lg:flex-row gap-4">
                    <div className="flex-1 relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search assignments..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none text-gray-900"
                        />
                    </div>
                    <div className="flex gap-4">
                        <div className="relative">
                            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <select
                                value={filterSession}
                                onChange={(e) => setFilterSession(e.target.value as Session | "All")}
                                className="pl-9 pr-8 py-2.5 rounded-lg border border-gray-200 focus:ring-2 focus:ring-indigo-500 outline-none appearance-none bg-white min-w-[140px] text-gray-900"
                            >
                                <option value="All">All Sessions</option>
                                {SESSIONS.map(s => <option key={s} value={s}>{s}</option>)}
                            </select>
                            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                        </div>
                        <div className="relative">
                            <BookOpen className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <select
                                value={filterSubject}
                                onChange={(e) => setFilterSubject(e.target.value)}
                                className="pl-9 pr-8 py-2.5 rounded-lg border border-gray-200 focus:ring-2 focus:ring-indigo-500 outline-none appearance-none bg-white min-w-[140px] text-gray-900"
                            >
                                <option value="All">All Subjects</option>
                                {SUBJECTS.map(s => <option key={s} value={s}>{s}</option>)}
                            </select>
                            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                        </div>
                        <button
                            onClick={() => handleOpenAssignmentModal()}
                            className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors shadow-sm whitespace-nowrap"
                        >
                            <Plus className="w-5 h-5" />
                            Create Assignment
                        </button>
                    </div>
                </div>

                {/* Assignments List */}
                <div className="grid gap-4">
                    {filteredAssignments.map((assignment) => (
                        <div key={assignment.id} className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow flex flex-col md:flex-row justify-between gap-4">
                            <div className="space-y-2 flex-1">
                                <div className="flex items-start justify-between md:justify-start gap-3">
                                    <div className="p-2 bg-indigo-50 rounded-lg text-indigo-600">
                                        <FileText className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-gray-900 text-lg">{assignment.title}</h3>
                                        <p className="text-sm text-gray-500">{assignment.subject} • {assignment.session} Session</p>
                                    </div>
                                </div>
                                <p className="text-gray-600 line-clamp-2">{assignment.description}</p>
                                {assignment.attachment && (
                                    <div className="flex items-center gap-2 text-sm text-indigo-600">
                                        <Paperclip className="w-4 h-4" />
                                        <span>{assignment.attachment}</span>
                                    </div>
                                )}
                                <div className="flex flex-wrap gap-2 pt-2">
                                    {assignment.classes.map(c => (
                                        <span key={c} className="px-2.5 py-0.5 bg-gray-100 text-gray-700 rounded-md text-xs font-medium">
                                            {c}
                                        </span>
                                    ))}
                                </div>
                            </div>
                            <div className="flex flex-row md:flex-col items-center md:items-end justify-between gap-4 border-t md:border-t-0 p-4 md:p-0 mt-2 md:mt-0">
                                <div className="flex flex-col items-end gap-1">
                                    <div className="flex items-center gap-1.5 text-sm text-gray-500">
                                        <Calendar className="w-4 h-4" />
                                        <span>Due: {new Date(assignment.dueDate).toLocaleDateString()}</span>
                                    </div>
                                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${assignment.status === 'Active' ? 'bg-green-100 text-green-700' :
                                        assignment.status === 'Draft' ? 'bg-yellow-100 text-yellow-700' :
                                            'bg-red-100 text-red-700'
                                        }`}>
                                        {assignment.status}
                                    </span>
                                </div>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => handleOpenAssignmentModal(assignment)}
                                        className="p-2 text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                                        title="Edit"
                                    >
                                        <Edit className="w-5 h-5" />
                                    </button>
                                    <button
                                        onClick={() => handleDeleteAssignment(assignment.id)}
                                        className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                        title="Delete"
                                    >
                                        <Trash2 className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                    {filteredAssignments.length === 0 && (
                        <div className="text-center py-12 bg-white rounded-xl border border-gray-200 border-dashed">
                            <div className="w-12 h-12 bg-gray-50 text-gray-400 rounded-full flex items-center justify-center mx-auto mb-3">
                                <Search className="w-6 h-6" />
                            </div>
                            <h3 className="text-lg font-medium text-gray-900">No assignments found</h3>
                            <p className="text-gray-500">Try adjusting your filters or search query.</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Assignment Modal */}
            {isAssignmentModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                    <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between p-6 border-b border-gray-100">
                            <h2 className="text-xl font-bold text-gray-900">
                                {currentAssignment ? "Edit Assignment" : "New Assignment"}
                            </h2>
                            <button onClick={() => setIsAssignmentModalOpen(false)} className="text-gray-400 hover:text-gray-600">
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
                                    placeholder="e.g., Algebra Homework 3"
                                />
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
                                    <select
                                        value={formData.subject}
                                        onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none bg-white text-gray-900"
                                    >
                                        {SUBJECTS.map(s => <option key={s} value={s}>{s}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Session</label>
                                    <select
                                        value={formData.session}
                                        onChange={(e) => setFormData({ ...formData, session: e.target.value as Session })}
                                        className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none bg-white text-gray-900"
                                    >
                                        {SESSIONS.map(s => <option key={s} value={s}>{s}</option>)}
                                    </select>
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Target Classes</label>
                                <div className="flex flex-wrap gap-2">
                                    {CLASSES.map(cls => (
                                        <button
                                            key={cls}
                                            onClick={() => toggleClassSelection(cls)}
                                            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors border ${formData.classes?.includes(cls)
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
                                <label className="block text-sm font-medium text-gray-700 mb-1">Due Date</label>
                                <input
                                    type="date"
                                    value={formData.dueDate}
                                    onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-gray-900"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                                <textarea
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    rows={4}
                                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none resize-none text-gray-900"
                                    placeholder="Enter assignment details..."
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Attachment</label>
                                <div className="flex items-center gap-2">
                                    <input
                                        type="file"
                                        onChange={handleFileChange}
                                        className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                                    />
                                    {formData.attachment && (
                                        <span className="text-sm text-gray-600">{formData.attachment}</span>
                                    )}
                                </div>
                            </div>
                        </div>
                        <div className="p-6 border-t border-gray-100 flex justify-end gap-3">
                            <button
                                onClick={() => setIsAssignmentModalOpen(false)}
                                className="px-4 py-2 text-gray-600 font-medium hover:bg-gray-100 rounded-lg transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSaveAssignment}
                                className="px-4 py-2 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition-colors"
                            >
                                {currentAssignment ? "Save Changes" : "Create Assignment"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
