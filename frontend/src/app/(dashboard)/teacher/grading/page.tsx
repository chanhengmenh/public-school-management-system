"use client";

import { useState } from "react";
import { teacherSubmissions as initialSubmissions } from "@/data/teacher-submissions";
import { teacherData } from "@/data/teacher-data";
import { Check, RotateCcw, AlertTriangle, Clock, CheckCircle, MessageSquare, X } from "lucide-react";
import { cn } from "@/lib/utils";

type Submission = typeof initialSubmissions[0];

export default function TeacherGradingPage() {
    const { assignedClasses } = teacherData;
    const [submissions, setSubmissions] = useState(initialSubmissions);
    const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null);
    const [gradeInput, setGradeInput] = useState("");
    const [feedbackInput, setFeedbackInput] = useState("");
    const [filterStatus, setFilterStatus] = useState("all");
    const [selectedClassId, setSelectedClassId] = useState("all");

    const filteredSubmissions = submissions.filter((sub) => {
        const matchesStatus = filterStatus === "all" || sub.status === filterStatus;

        if (selectedClassId === "all") return matchesStatus;

        // Find the class name based on the selected ID
        const selectedClass = assignedClasses.find(c => c.id === selectedClassId);
        const matchesClass = selectedClass ? sub.class === selectedClass.name : false;

        return matchesStatus && matchesClass;
    });

    const handleOpenGrading = (submission: Submission) => {
        setSelectedSubmission(submission);
        setGradeInput(submission.score?.toString() || "");
        setFeedbackInput(submission.feedback || "");
    };

    const handleSaveGrade = () => {
        if (!selectedSubmission) return;

        const score = parseInt(gradeInput);
        if (isNaN(score) || score < 0 || score > 100) {
            alert("Please enter a valid score (0-100).");
            return;
        }

        setSubmissions((prev) =>
            prev.map((sub) =>
                sub.id === selectedSubmission.id
                    ? { ...sub, score, feedback: feedbackInput, status: "graded" }
                    : sub
            )
        );
        setSelectedSubmission(null);
    };

    const handleReopenSubmission = (submissionId: string) => {
        setSubmissions((prev) =>
            prev.map((sub) =>
                sub.id === submissionId
                    ? { ...sub, status: "pending", score: null, feedback: "" }
                    : sub
            )
        );
    };

    const pendingCount = submissions.filter((s) => s.status === "pending").length;
    const gradedCount = submissions.filter((s) => s.status === "graded").length;

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-gray-900">Submissions & Grading</h1>
                    <p className="text-gray-500 mt-1">
                        {pendingCount} pending • {gradedCount} graded
                    </p>
                </div>
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
                {/* Status Tabs */}
                <div className="flex gap-2">
                    {["all", "pending", "graded"].map((status) => (
                        <button
                            key={status}
                            onClick={() => setFilterStatus(status)}
                            className={cn(
                                "rounded-lg px-4 py-2 text-sm font-medium transition-colors capitalize",
                                filterStatus === status
                                    ? "bg-blue-100 text-blue-700"
                                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                            )}
                        >
                            {status}
                        </button>
                    ))}
                </div>

                {/* Class Filter */}
                <div className="w-full sm:w-auto">
                    <select
                        value={selectedClassId}
                        onChange={(e) => setSelectedClassId(e.target.value)}
                        className="w-full sm:w-64 px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent cursor-pointer shadow-sm"
                    >
                        <option value="all">All Classes</option>
                        {assignedClasses.map(c => (
                            <option key={c.id} value={c.id}>{c.name}</option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Submissions Table */}
            <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-gray-50 text-gray-500">
                            <tr>
                                <th className="px-6 py-4 font-medium">Student</th>
                                <th className="px-6 py-4 font-medium">Quiz / Subject</th>
                                <th className="px-6 py-4 font-medium">Submitted</th>
                                <th className="px-6 py-4 font-medium">Integrity</th>
                                <th className="px-6 py-4 font-medium">Status</th>
                                <th className="px-6 py-4 font-medium">Score</th>
                                <th className="px-6 py-4 font-medium">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {filteredSubmissions.length > 0 ? (
                                filteredSubmissions.map((sub) => (
                                    <tr key={sub.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4">
                                            <p className="font-medium text-gray-900">{sub.studentName}</p>
                                            <p className="text-xs text-gray-500">{sub.studentId}</p>
                                        </td>
                                        <td className="px-6 py-4">
                                            <p className="text-gray-900">{sub.quiz}</p>
                                            <p className="text-xs text-gray-500">{sub.class}</p>
                                        </td>
                                        <td className="px-6 py-4">
                                            <p className="text-gray-900">
                                                {new Date(sub.submittedAt).toLocaleDateString()}
                                            </p>
                                            <p className="text-xs text-gray-500">
                                                {new Date(sub.submittedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                                            </p>
                                        </td>
                                        <td className="px-6 py-4">
                                            {sub.integrityFlags > 0 ? (
                                                <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2.5 py-1 text-xs font-medium text-amber-700">
                                                    <AlertTriangle className="h-3 w-3" />
                                                    {sub.integrityFlags} flag(s)
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2.5 py-1 text-xs font-medium text-green-700">
                                                    <CheckCircle className="h-3 w-3" />
                                                    Clean
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={cn(
                                                "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium",
                                                sub.status === "graded"
                                                    ? "bg-green-100 text-green-700"
                                                    : "bg-amber-100 text-amber-700"
                                            )}>
                                                {sub.status === "graded" ? (
                                                    <><Check className="h-3 w-3" /> Graded</>
                                                ) : (
                                                    <><Clock className="h-3 w-3" /> Pending</>
                                                )}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            {sub.score !== null ? (
                                                <span className={cn(
                                                    "text-lg font-bold",
                                                    sub.score >= 90 ? "text-green-600" :
                                                        sub.score >= 70 ? "text-blue-600" : "text-amber-600"
                                                )}>
                                                    {sub.score}%
                                                </span>
                                            ) : (
                                                <span className="text-gray-400">—</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                {sub.status === "pending" ? (
                                                    <button
                                                        onClick={() => handleOpenGrading(sub)}
                                                        className="rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-blue-500 transition-colors"
                                                    >
                                                        Grade
                                                    </button>
                                                ) : (
                                                    <>
                                                        <button
                                                            onClick={() => handleOpenGrading(sub)}
                                                            className="rounded-lg bg-gray-100 px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-200 transition-colors"
                                                        >
                                                            Edit
                                                        </button>
                                                        <button
                                                            onClick={() => handleReopenSubmission(sub.id)}
                                                            className="rounded-lg bg-amber-100 px-3 py-1.5 text-xs font-medium text-amber-700 hover:bg-amber-200 transition-colors flex items-center gap-1"
                                                        >
                                                            <RotateCcw className="h-3 w-3" />
                                                            Reopen
                                                        </button>
                                                    </>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                                        No submissions found matching your filters.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Grading Modal */}
            {selectedSubmission && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
                    <div className="w-full max-w-lg rounded-xl bg-white p-6 shadow-xl">
                        <div className="flex items-center justify-between mb-6">
                            <div>
                                <h2 className="text-xl font-bold text-gray-900">Grade Submission</h2>
                                <p className="text-gray-500 text-sm">{selectedSubmission.studentName} • {selectedSubmission.quiz}</p>
                            </div>
                            <button
                                onClick={() => setSelectedSubmission(null)}
                                className="text-gray-400 hover:text-gray-600"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        {selectedSubmission.integrityFlags > 0 && (
                            <div className="mb-4 p-3 rounded-lg bg-amber-50 border border-amber-200">
                                <div className="flex items-center gap-2 text-amber-700">
                                    <AlertTriangle className="h-4 w-4" />
                                    <span className="text-sm font-medium">
                                        {selectedSubmission.integrityFlags} integrity flag(s) detected
                                    </span>
                                </div>
                            </div>
                        )}

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Score (0-100) *</label>
                                <input
                                    type="number"
                                    value={gradeInput}
                                    onChange={(e) => setGradeInput(e.target.value)}
                                    min="0"
                                    max="100"
                                    placeholder="Enter score"
                                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    <MessageSquare className="h-4 w-4 inline mr-1" />
                                    Feedback (optional)
                                </label>
                                <textarea
                                    value={feedbackInput}
                                    onChange={(e) => setFeedbackInput(e.target.value)}
                                    placeholder="Add feedback for the student..."
                                    rows={3}
                                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 resize-none"
                                />
                            </div>

                            <div className="flex justify-end gap-3 pt-4">
                                <button
                                    onClick={() => setSelectedSubmission(null)}
                                    className="rounded-lg px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleSaveGrade}
                                    className="rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-500 transition-colors flex items-center gap-2"
                                >
                                    <Check className="h-4 w-4" />
                                    Save Grade
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
