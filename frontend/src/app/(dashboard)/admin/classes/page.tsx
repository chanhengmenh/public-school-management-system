"use client";

import React, { useState } from "react";
import {
    BookOpen,
    Plus,
    Edit2,
    Trash2,
    Users,
    GraduationCap,
    Search
} from "lucide-react";

const initialClasses = [
    { id: "c1", name: "10-A", grade: "10", homeTeacher: "Keo Romjong", studentCount: 32, room: "A101" },
    { id: "c2", name: "10-B", grade: "10", homeTeacher: "Ms. Sokha Vong", studentCount: 30, room: "A102" },
    { id: "c3", name: "11-A", grade: "11", homeTeacher: "Mr. Dara Chea", studentCount: 28, room: "B101" },
    { id: "c4", name: "11-B", grade: "11", homeTeacher: "Ms. Nary Kim", studentCount: 31, room: "B102" },
    { id: "c5", name: "12-A", grade: "12", homeTeacher: "Mr. Visal Phan", studentCount: 25, room: "C101" },
    { id: "c6", name: "12-B", grade: "12", homeTeacher: "Ms. Leakhena Sok", studentCount: 27, room: "C102" },
];

export default function ClassManagementPage() {
    const [classes, setClasses] = useState(initialClasses);
    const [searchTerm, setSearchTerm] = useState("");
    const [filterGrade, setFilterGrade] = useState("all");

    const filteredClasses = classes.filter(c => {
        const matchesSearch = c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            c.homeTeacher.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesGrade = filterGrade === "all" || c.grade === filterGrade;
        return matchesSearch && matchesGrade;
    });

    const handleDelete = (id: string) => {
        if (confirm("Are you sure you want to delete this class?")) {
            setClasses(prev => prev.filter(c => c.id !== id));
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                        <BookOpen className="w-6 h-6 text-blue-600" />
                        Class Management
                    </h1>
                    <p className="text-gray-500">{classes.length} classes registered</p>
                </div>
                <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                    <Plus className="w-4 h-4" />
                    Add Class
                </button>
            </div>

            {/* Filters */}
            <div className="flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search classes..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-500 text-gray-900"
                    />
                </div>
                <select
                    value={filterGrade}
                    onChange={(e) => setFilterGrade(e.target.value)}
                    className="px-4 py-2.5 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-500 text-gray-900"
                >
                    <option value="all">All Grades</option>
                    <option value="10">Grade 10</option>
                    <option value="11">Grade 11</option>
                    <option value="12">Grade 12</option>
                </select>
            </div>

            {/* Class Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredClasses.map((cls) => (
                    <div key={cls.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 hover:shadow-md transition-shadow">
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <h3 className="text-lg font-bold text-gray-900">{cls.name}</h3>
                                <p className="text-sm text-gray-500">Grade {cls.grade} • Room {cls.room}</p>
                            </div>
                            <div className="flex gap-1">
                                <button className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                                    <Edit2 className="w-4 h-4" />
                                </button>
                                <button
                                    onClick={() => handleDelete(cls.id)}
                                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                                <GraduationCap className="w-4 h-4 text-gray-400" />
                                <span>{cls.homeTeacher}</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                                <Users className="w-4 h-4 text-gray-400" />
                                <span>{cls.studentCount} students</span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
