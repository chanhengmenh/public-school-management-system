"use client";

import { useState } from "react";
import { X, CheckCircle, XCircle, Clock, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface DraftAttendanceModalProps {
    isOpen: boolean;
    onClose: () => void;
}

type AttendanceStatus = "Present" | "Absent" | "Late" | null;

interface StudentDraft {
    id: string;
    name: string;
    status: AttendanceStatus;
}

const mockClassmates = [
    { id: "s1", name: "Sokha Dara" },
    { id: "s2", name: "Vannak Bopha" },
    { id: "s3", name: "Chea Oudom" },
    { id: "s4", name: "Ly Nary" },
    { id: "s5", name: "Kheng Sopheak" },
];

export function DraftAttendanceModal({ isOpen, onClose }: DraftAttendanceModalProps) {
    const [draftState, setDraftState] = useState<StudentDraft[]>(
        mockClassmates.map(student => ({ ...student, status: null }))
    );
    const [date, setDate] = useState<string>(new Date().toISOString().split('T')[0]);
    const [subject, setSubject] = useState<string>("");
    const [section, setSection] = useState<string>("A");
    const [isSubmitting, setIsSubmitting] = useState(false);

    if (!isOpen) return null;

    const handleStatusChange = (id: string, newStatus: AttendanceStatus) => {
        setDraftState(prev =>
            prev.map(student =>
                student.id === id ? { ...student, status: newStatus } : student
            )
        );
    };

    const isValid = date !== "" && subject !== "" && section !== "" && draftState.every(s => s.status !== null);

    const handleSubmit = () => {
        if (!isValid) return;
        setIsSubmitting(true);
        // Simulate API call
        setTimeout(() => {
            setIsSubmitting(false);
            onClose();
        }, 1500);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="flex h-full max-h-[85vh] w-full max-w-2xl flex-col rounded-xl bg-white shadow-xl animate-in zoom-in-95 duration-200">
                {/* Header */}
                <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4 bg-gray-50 rounded-t-xl shrink-0">
                    <div>
                        <h2 className="text-xl font-bold text-gray-900">Draft Attendance</h2>
                        <p className="text-sm text-gray-500 mt-1">Set date, class details and record attendance</p>
                    </div>
                    <button
                        onClick={onClose}
                        disabled={isSubmitting}
                        className="rounded-full p-2 text-gray-400 hover:bg-gray-200 hover:text-gray-600 transition-colors disabled:opacity-50"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                {/* Settings Section */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 border-b border-gray-200 px-6 py-4 bg-white shrink-0">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                        <input
                            type="date"
                            value={date}
                            onChange={e => setDate(e.target.value)}
                            className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
                        <select
                            value={subject}
                            onChange={e => setSubject(e.target.value)}
                            className={cn(
                                "w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500",
                                subject === "" ? "text-gray-500" : "text-gray-900"
                            )}
                        >
                            <option value="" disabled>Select subject...</option>
                            <option value="Mathematics 10">Mathematics 10</option>
                            <option value="Physics 10">Physics 10</option>
                            <option value="English Literature">English Literature</option>
                            <option value="Computer Science">Computer Science</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Section</label>
                        <select
                            value={section}
                            onChange={e => setSection(e.target.value)}
                            className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500"
                        >
                            <option value="A">Section A</option>
                            <option value="B">Section B</option>
                            <option value="C">Section C</option>
                        </select>
                    </div>
                </div>

                {/* Body / Table List */}
                <div className="flex-1 overflow-y-auto p-6">
                    <div className="space-y-3">
                        {draftState.map((student) => (
                            <div key={student.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-lg border border-gray-100 bg-white p-4 shadow-sm hover:border-gray-200 transition-colors">
                                <span className="font-medium text-gray-900">{student.name}</span>
                                <div className="flex items-center gap-1.5 bg-gray-50 p-1 rounded-lg border border-gray-200">
                                    <button
                                        onClick={() => handleStatusChange(student.id, "Present")}
                                        className={cn(
                                            "flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-all",
                                            student.status === "Present"
                                                ? "bg-green-100 text-green-700 shadow-sm ring-1 ring-green-600/20"
                                                : "text-gray-500 hover:bg-gray-200 hover:text-gray-700"
                                        )}
                                    >
                                        <CheckCircle className="h-4 w-4" /> Present
                                    </button>
                                    <button
                                        onClick={() => handleStatusChange(student.id, "Absent")}
                                        className={cn(
                                            "flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-all",
                                            student.status === "Absent"
                                                ? "bg-red-100 text-red-700 shadow-sm ring-1 ring-red-600/20"
                                                : "text-gray-500 hover:bg-gray-200 hover:text-gray-700"
                                        )}
                                    >
                                        <XCircle className="h-4 w-4" /> Absent
                                    </button>
                                    <button
                                        onClick={() => handleStatusChange(student.id, "Late")}
                                        className={cn(
                                            "flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-all",
                                            student.status === "Late"
                                                ? "bg-yellow-100 text-yellow-700 shadow-sm ring-1 ring-yellow-600/20"
                                                : "text-gray-500 hover:bg-gray-200 hover:text-gray-700"
                                        )}
                                    >
                                        <Clock className="h-4 w-4" /> Late
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Sticky Footer */}
                <div className="border-t border-gray-200 bg-gray-50 px-6 py-4 rounded-b-xl flex justify-end gap-3 sticky bottom-0">
                    <button
                        onClick={onClose}
                        disabled={isSubmitting}
                        className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-200 disabled:opacity-50"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={isSubmitting || !isValid}
                        className="inline-flex items-center justify-center gap-2 px-5 py-2 text-sm font-medium text-amber-900 bg-amber-400 border border-transparent rounded-lg hover:bg-amber-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-400 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm"
                    >
                        {isSubmitting ? (
                            <>
                                <Loader2 className="h-4 w-4 animate-spin" />
                                Submitting...
                            </>
                        ) : (
                            "Submit Draft to Teacher"
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}
