"use client";

import { useState } from "react";
import {
    User,
    MapPin,
    Calendar,
    Mail,
    Phone,
    Download,
    ArrowLeft,
    GraduationCap,
    Clock,
    Users,
    Activity,
    FileText
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

// Mock Data for a single student (In a real app, fetch based on params.id)
const STUDENT_DATA = {
    id: "s1",
    name: "Bopha Chan",
    gender: "Female",
    avatar: "BC",
    class: "10-A",
    status: "Active",
    personal: {
        dob: "2008-05-15",
        address: "No. 123, Street 456, Phnom Penh",
        bloodType: "O+",
        nationality: "Cambodian",
        email: "[email protected]",
        phone: "012-345-678"
    },
    attendance: {
        overall: 96,
        present: 45,
        absent: 2,
        late: 1,
        history: [
            { date: "2026-02-18", status: "Present", time: "07:25 AM" },
            { date: "2026-02-17", status: "Present", time: "07:28 AM" },
            { date: "2026-02-16", status: "Late", time: "07:45 AM" },
            { date: "2026-02-15", status: "Present", time: "07:20 AM" },
            { date: "2026-02-14", status: "Absent", time: "-" },
        ]
    },
    grades: [
        { subject: "Mathematics", score: 95, grade: "A", teacher: "Mr. Tep Rendaro" },
        { subject: "Physics", score: 88, grade: "B+", teacher: "Ms. Sophea" },
        { subject: "Chemistry", score: 92, grade: "A", teacher: "Mr. Vibol" },
        { subject: "Biology", score: 85, grade: "B", teacher: "Ms. Neary" },
        { subject: "Literature", score: 90, grade: "A", teacher: "Mr. Sith" },
        { subject: "English", score: 94, grade: "A", teacher: "Ms. Dara" },
        { subject: "History", score: 82, grade: "B", teacher: "Mr. Vuthy" },
    ],
    parents: [
        { relation: "Father", name: "Chan Ty", phone: "012-999-888", email: "[email protected]", occupation: "Engineer" },
        { relation: "Mother", name: "Sok Mom", phone: "012-777-666", email: "[email protected]", occupation: "Teacher" }
    ]
};

export default function StudentProfilePage({ params }: { params: Promise<{ id: string }> }) {
    const [activeTab, setActiveTab] = useState<"overview" | "academic" | "family">("overview");

    const handleDownloadReport = async () => {
        const jsPDF = (await import("jspdf")).default;
        const autoTable = (await import("jspdf-autotable")).default;
        const doc = new jsPDF();
        const pageWidth = doc.internal.pageSize.getWidth();

        // --- Header ---
        doc.setFontSize(22);
        doc.setTextColor(41, 98, 255); // Blue
        doc.text("High School Management System", pageWidth / 2, 20, { align: "center" });

        doc.setFontSize(16);
        doc.setTextColor(0, 0, 0);
        doc.text("Official Student Report", pageWidth / 2, 30, { align: "center" });

        doc.setLineWidth(0.5);
        doc.line(20, 35, pageWidth - 20, 35);

        // --- Student Details ---
        doc.setFontSize(12);
        doc.text("Student Information", 20, 45);

        doc.setFontSize(10);
        doc.setTextColor(80);
        doc.text(`Name: ${STUDENT_DATA.name}`, 20, 52);
        doc.text(`ID: ${STUDENT_DATA.id}`, 20, 57);
        doc.text(`Class: ${STUDENT_DATA.class}`, 20, 62);
        doc.text(`DOB: ${STUDENT_DATA.personal.dob}`, 120, 52);
        doc.text(`Gender: ${STUDENT_DATA.gender}`, 120, 57);
        doc.text(`Status: ${STUDENT_DATA.status}`, 120, 62);

        // --- Academic Summary ---
        doc.setFontSize(12);
        doc.setTextColor(0);
        doc.text("Academic Summary", 20, 75);

        // Create small summary table (manual positioning or simple table)
        autoTable(doc, {
            startY: 80,
            head: [["GPA", "Rank", "Attendance"]],
            body: [["3.8", "2nd", "96%"]],
            theme: 'grid',
            headStyles: { fillColor: [240, 240, 240], textColor: 50 },
            styles: { halign: 'center' },
            tableWidth: pageWidth - 40,
            margin: { left: 20 }
        });

        // --- Grades Table ---
        doc.text("Transcript", 20, (doc as any).lastAutoTable.finalY + 15);

        const gradeRows = STUDENT_DATA.grades.map(g => [g.subject, g.teacher, g.score.toString(), g.grade]);

        autoTable(doc, {
            startY: (doc as any).lastAutoTable.finalY + 20,
            head: [["Subject", "Instructor", "Score", "Grade"]],
            body: gradeRows,
            theme: 'striped',
            headStyles: { fillColor: [66, 133, 244] },
            margin: { left: 20 }
        });

        // --- Attendance History ---
        doc.text("Recent Attendance", 20, (doc as any).lastAutoTable.finalY + 15);

        const attendanceRows = STUDENT_DATA.attendance.history.slice(0, 5).map(a => [a.date, a.time, a.status]);

        autoTable(doc, {
            startY: (doc as any).lastAutoTable.finalY + 20,
            head: [["Date", "Time", "Status"]],
            body: attendanceRows,
            theme: 'plain',
            headStyles: { fillColor: [200, 200, 200], textColor: 0 },
            margin: { left: 20 }
        });

        // Footer
        const date = new Date().toLocaleDateString();
        doc.setFontSize(8);
        doc.setTextColor(150);
        doc.text(`Report Generated on: ${date}`, 20, doc.internal.pageSize.getHeight() - 10);

        doc.save(`student_report_${STUDENT_DATA.id}.pdf`);
    };

    return (
        <div className="space-y-6 max-w-7xl mx-auto p-6">
            {/* Header with Navigation */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <Link
                        href="/home-class-teacher/people"
                        className="p-2 hover:bg-gray-100 rounded-lg text-gray-500 transition-colors"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">{STUDENT_DATA.name}</h1>
                        <p className="text-gray-500 text-sm flex items-center gap-2">
                            ID: {STUDENT_DATA.id} • Class {STUDENT_DATA.class} •
                            <span className={cn(
                                "inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium",
                                STUDENT_DATA.status === "Active" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                            )}>
                                {STUDENT_DATA.status}
                            </span>
                        </p>
                    </div>
                </div>
                <button
                    onClick={handleDownloadReport}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm font-medium"
                >
                    <Download className="w-4 h-4" />
                    Download Report
                </button>
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">

                {/* Left Sidebar: Profile Card */}
                <div className="lg:col-span-1 space-y-6">
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex flex-col items-center text-center">
                        <div className={cn(
                            "w-24 h-24 rounded-full flex items-center justify-center text-2xl font-bold text-white mb-4",
                            STUDENT_DATA.gender === "Male" ? "bg-blue-500" : "bg-pink-500"
                        )}>
                            {STUDENT_DATA.avatar}
                        </div>
                        <h2 className="text-lg font-bold text-gray-900">{STUDENT_DATA.name}</h2>
                        <p className="text-gray-500 text-sm mb-4">{STUDENT_DATA.gender}</p>

                        <div className="w-full flex justify-between px-4 py-3 bg-gray-50 rounded-lg mb-4">
                            <div className="text-center">
                                <span className="block text-xs text-gray-500 uppercase">GPA</span>
                                <span className="text-lg font-bold text-gray-900">3.8</span>
                            </div>
                            <div className="text-center">
                                <span className="block text-xs text-gray-500 uppercase">Rank</span>
                                <span className="text-lg font-bold text-gray-900">2nd</span>
                            </div>
                            <div className="text-center">
                                <span className="block text-xs text-gray-500 uppercase">Attendance</span>
                                <span className="text-lg font-bold text-green-600">96%</span>
                            </div>
                        </div>

                        <div className="w-full space-y-3 text-left">
                            <div className="flex items-center gap-3 text-sm text-gray-600">
                                <Mail className="w-4 h-4 text-gray-400" />
                                <span className="truncate">{STUDENT_DATA.personal.email}</span>
                            </div>
                            <div className="flex items-center gap-3 text-sm text-gray-600">
                                <Phone className="w-4 h-4 text-gray-400" />
                                <span>{STUDENT_DATA.personal.phone}</span>
                            </div>
                            <div className="flex items-center gap-3 text-sm text-gray-600">
                                <Calendar className="w-4 h-4 text-gray-400" />
                                <span>{new Date(STUDENT_DATA.personal.dob).toLocaleDateString()}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Content: Tabs */}
                <div className="lg:col-span-3 space-y-6">

                    {/* Tab Navigation */}
                    <div className="flex border-b border-gray-200">
                        {[
                            { id: "overview", label: "Overview", icon: User },
                            { id: "academic", label: "Academic & Grades", icon: GraduationCap },
                            { id: "family", label: "Family & Contact", icon: Users },
                        ].map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id as any)}
                                className={cn(
                                    "flex items-center gap-2 px-6 py-3 text-sm font-medium border-b-2 transition-colors",
                                    activeTab === tab.id
                                        ? "border-blue-600 text-blue-600"
                                        : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                                )}
                            >
                                <tab.icon className="w-4 h-4" />
                                {tab.label}
                            </button>
                        ))}
                    </div>

                    {/* Tab Content */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 min-h-[400px]">

                        {/* OVERVIEW TAB */}
                        {activeTab === "overview" && (
                            <div className="space-y-6">
                                <div>
                                    <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                                        <User className="w-5 h-5 text-gray-400" />
                                        Personal Information
                                    </h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
                                        <div className="space-y-1">
                                            <label className="text-xs text-gray-500 uppercase font-medium">Full Name</label>
                                            <p className="text-gray-900">{STUDENT_DATA.name}</p>
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-xs text-gray-500 uppercase font-medium">Date of Birth</label>
                                            <p className="text-gray-900">{STUDENT_DATA.personal.dob}</p>
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-xs text-gray-500 uppercase font-medium">Nationality</label>
                                            <p className="text-gray-900">{STUDENT_DATA.personal.nationality}</p>
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-xs text-gray-500 uppercase font-medium">Blood Type</label>
                                            <p className="text-gray-900">{STUDENT_DATA.personal.bloodType}</p>
                                        </div>
                                        <div className="space-y-1 md:col-span-2">
                                            <label className="text-xs text-gray-500 uppercase font-medium">Address</label>
                                            <p className="text-gray-900 flex items-start gap-2">
                                                <MapPin className="w-4 h-4 text-gray-400 mt-0.5" />
                                                {STUDENT_DATA.personal.address}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <div className="border-t border-gray-100 pt-6">
                                    <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                                        <Activity className="w-5 h-5 text-gray-400" />
                                        Recent Activity
                                    </h3>
                                    <div className="space-y-4">
                                        <div className="flex gap-4 items-start">
                                            <div className="w-2 h-2 mt-2 rounded-full bg-blue-500 flex-shrink-0" />
                                            <div>
                                                <p className="text-sm font-medium text-gray-900">Submitted Mathematics Assignment</p>
                                                <p className="text-xs text-gray-500">Yesterday at 4:30 PM</p>
                                            </div>
                                        </div>
                                        <div className="flex gap-4 items-start">
                                            <div className="w-2 h-2 mt-2 rounded-full bg-green-500 flex-shrink-0" />
                                            <div>
                                                <p className="text-sm font-medium text-gray-900">Arrived on time</p>
                                                <p className="text-xs text-gray-500">Today at 7:25 AM</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* ACADEMIC TAB */}
                        {activeTab === "academic" && (
                            <div className="space-y-8">
                                {/* Grades Summary (Transcript) */}
                                <div>
                                    <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                                        <FileText className="w-5 h-5 text-gray-400" />
                                        Grades Summary
                                    </h3>
                                    <div className="overflow-hidden rounded-lg border border-gray-200">
                                        <table className="w-full text-left bg-white text-sm">
                                            <thead className="bg-gray-50 border-b border-gray-200">
                                                <tr>
                                                    <th className="px-4 py-3 font-semibold text-gray-700">Subject</th>
                                                    <th className="px-4 py-3 font-semibold text-gray-700">Instructor</th>
                                                    <th className="px-4 py-3 font-semibold text-gray-700">Score</th>
                                                    <th className="px-4 py-3 font-semibold text-gray-700">Grade</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-100">
                                                {STUDENT_DATA.grades.map((item, index) => (
                                                    <tr key={index} className="hover:bg-gray-50/50">
                                                        <td className="px-4 py-3 font-medium text-gray-900">{item.subject}</td>
                                                        <td className="px-4 py-3 text-gray-600">{item.teacher}</td>
                                                        <td className="px-4 py-3 font-medium text-gray-900">{item.score}</td>
                                                        <td className="px-4 py-3">
                                                            <span className={cn(
                                                                "inline-block w-8 text-center py-0.5 rounded text-xs font-bold",
                                                                item.grade.startsWith("A") ? "bg-green-100 text-green-700" :
                                                                    item.grade.startsWith("B") ? "bg-blue-100 text-blue-700" :
                                                                        "bg-yellow-100 text-yellow-700"
                                                            )}>
                                                                {item.grade}
                                                            </span>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>

                                {/* Attendance Stats */}
                                <div>
                                    <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                                        <Clock className="w-5 h-5 text-gray-400" />
                                        Attendance History
                                    </h3>
                                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
                                        <div className="bg-gray-50 p-4 rounded-lg text-center">
                                            <div className="text-gray-500 text-xs uppercase mb-1">Present</div>
                                            <div className="text-xl font-bold text-green-600">{STUDENT_DATA.attendance.present}</div>
                                        </div>
                                        <div className="bg-gray-50 p-4 rounded-lg text-center">
                                            <div className="text-gray-500 text-xs uppercase mb-1">Absent</div>
                                            <div className="text-xl font-bold text-red-600">{STUDENT_DATA.attendance.absent}</div>
                                        </div>
                                        <div className="bg-gray-50 p-4 rounded-lg text-center">
                                            <div className="text-gray-500 text-xs uppercase mb-1">Late</div>
                                            <div className="text-xl font-bold text-yellow-600">{STUDENT_DATA.attendance.late}</div>
                                        </div>
                                        <div className="bg-gray-50 p-4 rounded-lg text-center">
                                            <div className="text-gray-500 text-xs uppercase mb-1">Overall</div>
                                            <div className="text-xl font-bold text-blue-600">{STUDENT_DATA.attendance.overall}%</div>
                                        </div>
                                    </div>
                                    <div className="border border-gray-200 rounded-lg overflow-hidden">
                                        {STUDENT_DATA.attendance.history.map((record, index) => (
                                            <div key={index} className="flex items-center justify-between px-4 py-3 border-b border-gray-100 last:border-0 hover:bg-gray-50">
                                                <div className="flex items-center gap-3">
                                                    <Calendar className="w-4 h-4 text-gray-400" />
                                                    <span className="text-sm text-gray-700 font-medium">{new Date(record.date).toLocaleDateString()}</span>
                                                </div>
                                                <div className="flex items-center gap-4">
                                                    <span className="text-sm text-gray-500 font-mono">{record.time}</span>
                                                    <span className={cn(
                                                        "text-xs font-semibold px-2 py-0.5 rounded-full w-20 text-center",
                                                        record.status === "Present" ? "bg-green-100 text-green-700" :
                                                            record.status === "Absent" ? "bg-red-100 text-red-700" :
                                                                "bg-yellow-100 text-yellow-700"
                                                    )}>
                                                        {record.status}
                                                    </span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* FAMILY TAB */}
                        {activeTab === "family" && (
                            <div className="space-y-6">
                                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                                    <Users className="w-5 h-5 text-gray-400" />
                                    Parent / Guardian Information
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {STUDENT_DATA.parents.map((parent, index) => (
                                        <div key={index} className="border border-gray-200 rounded-xl p-5 hover:border-blue-200 transition-colors">
                                            <div className="flex items-center gap-3 mb-4">
                                                <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
                                                    <User className="w-5 h-5 text-gray-500" />
                                                </div>
                                                <div>
                                                    <h4 className="font-bold text-gray-900">{parent.name}</h4>
                                                    <p className="text-xs text-gray-500 font-medium">{parent.relation}</p>
                                                </div>
                                            </div>
                                            <div className="space-y-3">
                                                <div className="flex items-center gap-3 text-sm">
                                                    <Phone className="w-4 h-4 text-gray-400" />
                                                    <span className="text-gray-700">{parent.phone}</span>
                                                </div>
                                                <div className="flex items-center gap-3 text-sm">
                                                    <Mail className="w-4 h-4 text-gray-400" />
                                                    <span className="text-gray-700">{parent.email}</span>
                                                </div>
                                                <div className="flex items-center gap-3 text-sm">
                                                    <Activity className="w-4 h-4 text-gray-400" />
                                                    <span className="text-gray-700">{parent.occupation}</span>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
