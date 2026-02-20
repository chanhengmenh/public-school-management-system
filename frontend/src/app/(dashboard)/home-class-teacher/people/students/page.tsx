"use client";

import React, { useState } from "react";
import {
    Users,
    Search,
    Mail,
    Phone,
    GraduationCap,
    AlertTriangle,
    CheckCircle,
    XCircle
} from "lucide-react";

const studentsData = [
    { id: "s1", name: "Bopha Chan", email: "[email protected]", phone: "012-345-678", status: "Present", average: 95.2, riskLevel: "low", avatar: "BC" },
    { id: "s2", name: "Preap Sovath", email: "[email protected]", phone: "012-345-679", status: "Present", average: 88.4, riskLevel: "low", avatar: "PS" },
    { id: "s3", name: "Kanya Oum", email: "[email protected]", phone: "012-345-680", status: "Present", average: 87.6, riskLevel: "low", avatar: "KO" },
    { id: "s4", name: "Srey Leak", email: "[email protected]", phone: "012-345-681", status: "Present", average: 85.0, riskLevel: "low", avatar: "SL" },
    { id: "s5", name: "Sophy Keo", email: "[email protected]", phone: "012-345-682", status: "Absent", average: 82.4, riskLevel: "low", avatar: "SK" },
    { id: "s6", name: "Rithy Heng", email: "[email protected]", phone: "012-345-683", status: "Present", average: 78.2, riskLevel: "medium", avatar: "RH" },
    { id: "s7", name: "Dara Sok", email: "[email protected]", phone: "012-345-684", status: "Present", average: 72.0, riskLevel: "medium", avatar: "DS" },
    { id: "s8", name: "Nary Thy", email: "[email protected]", phone: "012-345-685", status: "Present", average: 70.8, riskLevel: "medium", avatar: "NT" },
    { id: "s9", name: "Vibol Lim", email: "[email protected]", phone: "012-345-686", status: "Absent", average: 65.4, riskLevel: "high", avatar: "VL" },
    { id: "s10", name: "Visal Chea", email: "[email protected]", phone: "012-345-687", status: "Present", average: 60.2, riskLevel: "high", avatar: "VC" },
];

export default function StudentsPage() {
    const [searchTerm, setSearchTerm] = useState("");
    const [filterRisk, setFilterRisk] = useState("all");

    const filteredStudents = studentsData.filter(student => {
        const matchesSearch = student.name.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesRisk = filterRisk === "all" || student.riskLevel === filterRisk;
        return matchesSearch && matchesRisk;
    });

    const getRiskBadge = (risk: string) => {
        if (risk === "high") return <span className="px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-700">At Risk</span>;
        if (risk === "medium") return <span className="px-2 py-1 text-xs font-medium rounded-full bg-yellow-100 text-yellow-700">Watch</span>;
        return <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-700">Good</span>;
    };

    const getStatusIcon = (status: string) => {
        if (status === "Present") return <CheckCircle className="w-4 h-4 text-green-500" />;
        return <XCircle className="w-4 h-4 text-red-500" />;
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                        <Users className="w-6 h-6 text-blue-600" />
                        Student Roster
                    </h1>
                    <p className="text-gray-500">Class 10-A • {studentsData.length} students</p>
                </div>
            </div>

            {/* Filters */}
            <div className="flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search students..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                </div>
                <select
                    value={filterRisk}
                    onChange={(e) => setFilterRisk(e.target.value)}
                    className="px-4 py-2.5 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-500"
                >
                    <option value="all">All Students</option>
                    <option value="high">At Risk</option>
                    <option value="medium">Watch</option>
                    <option value="low">Good Standing</option>
                </select>
            </div>

            {/* Students Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredStudents.map((student) => (
                    <div key={student.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 hover:shadow-md transition-shadow">
                        <div className="flex items-start gap-4">
                            <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold">
                                {student.avatar}
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                    <h3 className="font-semibold text-gray-900 truncate">{student.name}</h3>
                                    {getStatusIcon(student.status)}
                                </div>
                                <div className="mt-2 space-y-1">
                                    <p className="text-sm text-gray-500 flex items-center gap-2">
                                        <Mail className="w-3.5 h-3.5" />
                                        <span className="truncate">{student.email}</span>
                                    </p>
                                    <p className="text-sm text-gray-500 flex items-center gap-2">
                                        <Phone className="w-3.5 h-3.5" />
                                        {student.phone}
                                    </p>
                                </div>
                                <div className="mt-3 flex items-center justify-between">
                                    <div className="flex items-center gap-1 text-sm">
                                        <GraduationCap className="w-4 h-4 text-gray-400" />
                                        <span className="font-medium text-gray-900">{student.average.toFixed(1)}</span>
                                    </div>
                                    {getRiskBadge(student.riskLevel)}
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {filteredStudents.length === 0 && (
                <div className="text-center py-12 text-gray-500">
                    <Users className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                    <p>No students found matching your criteria.</p>
                </div>
            )}
        </div>
    );
}
