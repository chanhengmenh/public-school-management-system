"use client";

import React, { useState } from "react";
import {
    BookOpen,
    Plus,
    Edit2,
    Trash2,
    Search,
    Clock
} from "lucide-react";

const initialSubjects = [
    { id: "s1", name: "Mathematics", code: "MATH", credits: 4, teacherCount: 3, classCount: 6, color: "#3b82f6" },
    { id: "s2", name: "English Literature", code: "ENG", credits: 3, teacherCount: 4, classCount: 6, color: "#10b981" },
    { id: "s3", name: "Physics", code: "PHY", credits: 4, teacherCount: 2, classCount: 6, color: "#8b5cf6" },
    { id: "s4", name: "Chemistry", code: "CHEM", credits: 4, teacherCount: 2, classCount: 4, color: "#f59e0b" },
    { id: "s5", name: "Biology", code: "BIO", credits: 3, teacherCount: 2, classCount: 4, color: "#ec4899" },
    { id: "s6", name: "World History", code: "HIST", credits: 3, teacherCount: 2, classCount: 6, color: "#06b6d4" },
    { id: "s7", name: "Computer Science", code: "CS", credits: 3, teacherCount: 1, classCount: 6, color: "#6366f1" },
    { id: "s8", name: "Physical Education", code: "PE", credits: 2, teacherCount: 2, classCount: 6, color: "#ef4444" },
];

export default function SubjectManagementPage() {
    const [subjects, setSubjects] = useState(initialSubjects);
    const [searchTerm, setSearchTerm] = useState("");

    const filteredSubjects = subjects.filter(s =>
        s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.code.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleDelete = (id: string) => {
        if (confirm("Are you sure you want to delete this subject?")) {
            setSubjects(prev => prev.filter(s => s.id !== id));
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                        <BookOpen className="w-6 h-6 text-purple-600" />
                        Subject Management
                    </h1>
                    <p className="text-gray-500">{subjects.length} subjects registered</p>
                </div>
                <button className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">
                    <Plus className="w-4 h-4" />
                    Add Subject
                </button>
            </div>

            {/* Search */}
            <div className="relative max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                    type="text"
                    placeholder="Search subjects..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-200 focus:ring-2 focus:ring-purple-500 text-gray-900"
                />
            </div>

            {/* Subject Table */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50 border-b border-gray-200">
                            <tr>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Subject</th>
                                <th className="px-6 py-4 text-center text-xs font-semibold text-gray-600 uppercase">Code</th>
                                <th className="px-6 py-4 text-center text-xs font-semibold text-gray-600 uppercase">Credits</th>
                                <th className="px-6 py-4 text-center text-xs font-semibold text-gray-600 uppercase">Teachers</th>
                                <th className="px-6 py-4 text-center text-xs font-semibold text-gray-600 uppercase">Classes</th>
                                <th className="px-6 py-4 text-center text-xs font-semibold text-gray-600 uppercase">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {filteredSubjects.map((subject) => (
                                <tr key={subject.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center gap-3">
                                            <div
                                                className="w-3 h-8 rounded-full"
                                                style={{ backgroundColor: subject.color }}
                                            ></div>
                                            <span className="font-medium text-gray-900">{subject.name}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-center">
                                        <span className="px-2.5 py-1 rounded-lg bg-gray-100 text-gray-700 text-sm font-medium">
                                            {subject.code}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-center">
                                        <div className="flex items-center justify-center gap-1 text-gray-600">
                                            <Clock className="w-4 h-4" />
                                            {subject.credits}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-center text-gray-600">
                                        {subject.teacherCount}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-center text-gray-600">
                                        {subject.classCount}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-center">
                                        <div className="flex justify-center gap-1">
                                            <button className="p-2 text-gray-400 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors">
                                                <Edit2 className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(subject.id)}
                                                className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
