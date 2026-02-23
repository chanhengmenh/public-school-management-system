"use client";

import { useState, useMemo } from "react";
import {
    Trophy,
    ArrowUp,
    ArrowDown,
    Minus,
    Filter,
    Download
} from "lucide-react";
import { cn } from "@/lib/utils";

// Mock Data
type Subject = "Mathematics" | "Physics" | "Chemistry" | "Biology" | "Literature" | "English" | "History";

interface StudentScore {
    id: string;
    name: string;
    avatar: string;
    scores: Record<Subject, number>;
    prevRank: number;
}

const SUBJECTS: Subject[] = ["Mathematics", "Physics", "Chemistry", "Biology", "Literature", "English", "History"];

const MOCK_SCORES: StudentScore[] = [
    { id: "s1", name: "Bopha Chan", avatar: "BC", prevRank: 2, scores: { Mathematics: 95, Physics: 88, Chemistry: 92, Biology: 85, Literature: 90, English: 94, History: 82 } },
    { id: "s2", name: "Preap Sovath", avatar: "PS", prevRank: 1, scores: { Mathematics: 85, Physics: 92, Chemistry: 88, Biology: 90, Literature: 85, English: 88, History: 89 } },
    { id: "s3", name: "Kanya Oum", avatar: "KO", prevRank: 3, scores: { Mathematics: 92, Physics: 85, Chemistry: 90, Biology: 88, Literature: 92, English: 90, History: 85 } },
    { id: "s4", name: "Srey Leak", avatar: "SL", prevRank: 5, scores: { Mathematics: 78, Physics: 82, Chemistry: 80, Biology: 85, Literature: 88, English: 85, History: 82 } },
    { id: "s5", name: "Sophy Keo", avatar: "SK", prevRank: 4, scores: { Mathematics: 82, Physics: 78, Chemistry: 85, Biology: 82, Literature: 80, English: 82, History: 88 } },
    { id: "s6", name: "Rithy Heng", avatar: "RH", prevRank: 6, scores: { Mathematics: 75, Physics: 72, Chemistry: 78, Biology: 75, Literature: 78, English: 75, History: 80 } },
    { id: "s7", name: "Dara Sok", avatar: "DS", prevRank: 8, scores: { Mathematics: 70, Physics: 68, Chemistry: 72, Biology: 70, Literature: 75, English: 72, History: 78 } },
    { id: "s8", name: "Nary Thy", avatar: "NT", prevRank: 7, scores: { Mathematics: 68, Physics: 75, Chemistry: 70, Biology: 72, Literature: 70, English: 78, History: 75 } },
    { id: "s9", name: "Vibol Lim", avatar: "VL", prevRank: 10, scores: { Mathematics: 65, Physics: 62, Chemistry: 68, Biology: 65, Literature: 68, English: 65, History: 70 } },
    { id: "s10", name: "Visal Chea", avatar: "VC", prevRank: 9, scores: { Mathematics: 60, Physics: 58, Chemistry: 62, Biology: 60, Literature: 65, English: 62, History: 68 } },
];

export default function RankingsPage() {
    const [selectedTerm, setSelectedTerm] = useState("Term 1");
    const [selectedSubject, setSelectedSubject] = useState<Subject | "All">("All");

    // Calculate Averages and Sort
    const rankedStudents = useMemo(() => {
        const calculated = MOCK_SCORES.map(student => {
            let total = 0;
            let count = 0;

            if (selectedSubject === "All") {
                Object.values(student.scores).forEach(score => {
                    total += score;
                    count++;
                });
            } else {
                total = student.scores[selectedSubject];
                count = 1;
            }

            const average = total / count;
            return { ...student, average };
        });

        // Sort by average descending
        return calculated.sort((a, b) => b.average - a.average);
    }, [selectedSubject]);

    const getGrade = (score: number) => {
        if (score >= 90) return "A";
        if (score >= 85) return "B+";
        if (score >= 80) return "B";
        if (score >= 75) return "C+";
        if (score >= 70) return "C";
        if (score >= 65) return "D+";
        if (score >= 50) return "D";
        return "F";
    };

    const getRankChangeIcon = (currentRank: number, prevRank: number) => {
        if (currentRank < prevRank) return <ArrowUp className="w-4 h-4 text-green-500" />;
        if (currentRank > prevRank) return <ArrowDown className="w-4 h-4 text-red-500" />;
        return <Minus className="w-4 h-4 text-gray-300" />;
    };

    const handleDownloadReport = async () => {
        const jsPDF = (await import("jspdf")).default;
        const autoTable = (await import("jspdf-autotable")).default;
        const doc = new jsPDF();

        doc.setFontSize(18);
        doc.text(`Class Ranking Report - ${selectedTerm}`, 14, 22);
        doc.setFontSize(11);
        doc.text(`Subject: ${selectedSubject} | Generated: ${new Date().toLocaleDateString()}`, 14, 30);

        // Prepare File Columns
        let tableColumn = ["Rank", "Student", "Average", "Grade"];
        if (selectedSubject === "All") {
            tableColumn = ["Rank", "Student", "Average", "Grade", ...SUBJECTS];
        }

        const tableRows = rankedStudents.map((s, index) => {
            const row = [
                index + 1,
                s.name,
                s.average.toFixed(1),
                getGrade(s.average)
            ];

            if (selectedSubject === "All") {
                SUBJECTS.forEach(sub => {
                    row.push(s.scores[sub].toString());
                });
            }
            return row;
        });

        autoTable(doc, {
            head: [tableColumn],
            body: tableRows,
            startY: 40,
            headStyles: { fillColor: [66, 133, 244] },
            styles: { fontSize: 8 }
        });

        doc.save("class_rankings.pdf");
    };

    return (
        <div className="space-y-6 max-w-[1600px] mx-auto p-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                        <Trophy className="w-6 h-6 text-yellow-500" />
                        Class Rankings
                    </h1>
                    <p className="text-gray-500 text-sm">Analyze student performance and rankings</p>
                </div>

                <div className="flex items-center gap-3">
                    <button
                        onClick={handleDownloadReport}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm font-medium"
                    >
                        <Download className="w-4 h-4" />
                        Download Report
                    </button>
                </div>
            </div>

            {/* Filters */}
            <div className="flex gap-4 p-4 bg-white rounded-xl shadow-sm border border-gray-200">
                <div className="flex items-center gap-2">
                    <Filter className="w-5 h-5 text-gray-400" />
                    <span className="text-sm font-medium text-gray-700">Filters:</span>
                </div>

                <select
                    value={selectedTerm}
                    onChange={(e) => setSelectedTerm(e.target.value)}
                    className="px-3 py-1.5 rounded-lg border border-gray-300 text-sm focus:ring-2 focus:ring-blue-500 outline-none text-black font-medium"
                >
                    <option>Term 1</option>
                    <option>Term 2</option>
                </select>

                <select
                    value={selectedSubject}
                    onChange={(e) => setSelectedSubject(e.target.value as any)}
                    className="px-3 py-1.5 rounded-lg border border-gray-300 text-sm focus:ring-2 focus:ring-blue-500 outline-none text-black font-medium"
                >
                    <option value="All">All Subjects</option>
                    {SUBJECTS.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
            </div>

            {/* Rankings Table */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-x-auto">
                <table className="w-full text-left whitespace-nowrap">
                    <thead className="bg-gray-50 border-b border-gray-200">
                        <tr>
                            <th className="px-6 py-4 font-semibold text-gray-700 w-20 text-center sticky left-0 bg-gray-50 z-10">Rank</th>
                            <th className="px-6 py-4 font-semibold text-gray-700 sticky left-20 bg-gray-50 z-10">Student</th>
                            <th className="px-6 py-4 font-semibold text-gray-700 text-center">Score</th>
                            <th className="px-6 py-4 font-semibold text-gray-700 text-center">Grade</th>
                            <th className="px-6 py-4 font-semibold text-gray-700 text-center">Trend</th>
                            {selectedSubject === "All" && SUBJECTS.map(subject => (
                                <th key={subject} className="px-6 py-4 font-semibold text-gray-700 text-center">{subject}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {rankedStudents.map((student, index) => {
                            const currentRank = index + 1;

                            return (
                                <tr key={student.id} className="hover:bg-gray-50/50 transition-colors">
                                    <td className="px-6 py-4 text-center sticky left-0 bg-white hover:bg-gray-50/50 z-10">
                                        <div className={cn(
                                            "w-8 h-8 rounded-full flex items-center justify-center font-bold mx-auto text-sm",
                                            currentRank === 1 ? "bg-yellow-100 text-yellow-700" :
                                                currentRank === 2 ? "bg-gray-100 text-gray-700" :
                                                    currentRank === 3 ? "bg-orange-100 text-orange-700" :
                                                        "text-gray-500"
                                        )}>
                                            {currentRank}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 sticky left-20 bg-white hover:bg-gray-50/50 z-10">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-xs">
                                                {student.avatar}
                                            </div>
                                            <div>
                                                <p className="font-semibold text-gray-900">{student.name}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <span className="font-bold text-gray-900 text-lg">{student.average.toFixed(1)}</span>
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <span className={cn(
                                            "inline-block w-8 py-0.5 rounded text-sm font-bold",
                                            getGrade(student.average).startsWith("A") ? "bg-green-100 text-green-700" :
                                                getGrade(student.average).startsWith("B") ? "bg-blue-100 text-blue-700" :
                                                    "bg-yellow-100 text-yellow-700"
                                        )}>
                                            {getGrade(student.average)}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <div className="flex items-center justify-center gap-1">
                                            {getRankChangeIcon(currentRank, student.prevRank)}
                                            {currentRank !== student.prevRank && (
                                                <span className="text-xs text-gray-500 font-medium">
                                                    {Math.abs(currentRank - student.prevRank)}
                                                </span>
                                            )}
                                        </div>
                                    </td>
                                    {selectedSubject === "All" && SUBJECTS.map(subject => (
                                        <td key={subject} className="px-6 py-4 text-center text-gray-600 font-medium">
                                            {student.scores[subject]}
                                        </td>
                                    ))}
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
