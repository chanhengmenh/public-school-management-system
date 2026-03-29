'use client';

import React, { useState } from 'react';
import { useParams } from 'next/navigation';
import { Upload, X, Paperclip } from 'lucide-react';

// Type Definitions
interface Assignment {
    id: string;
    title: string;
    openDate: string;
    dueDate: string;
    status: 'Available' | 'Upcoming' | 'Closed';
    submittedCount: number;
    totalStudents: number;
    fileName?: string;
}

const initialAssignments: Assignment[] = [
    { id: '1', title: 'Chapter 4 Physics Problems', openDate: '2025-05-15T08:00', dueDate: '2025-05-20T23:59', status: 'Available', submittedCount: 12, totalStudents: 32 },
    { id: '2', title: 'Newton\'s Laws Lab Report', openDate: '2025-05-10T08:00', dueDate: '2025-05-17T23:59', status: 'Available', submittedCount: 28, totalStudents: 32 },
    { id: '3', title: 'Kinematics Quiz Preparation', openDate: '2025-05-25T08:00', dueDate: '2025-05-30T23:59', status: 'Upcoming', submittedCount: 0, totalStudents: 32 },
    { id: '4', title: 'Projectile Motion Worksheet', openDate: '2025-04-20T08:00', dueDate: '2025-04-27T23:59', status: 'Closed', submittedCount: 31, totalStudents: 32 },
];

export default function TeacherAssignmentsPage() {
    const params = useParams();
    const subjectId = (params?.subjectId as string) || 'class-1';

    // Assignments State
    const [assignmentsData, setAssignmentsData] = useState<Assignment[]>(initialAssignments);
    const [isAssignmentModalOpen, setIsAssignmentModalOpen] = useState(false);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [editingAssignment, setEditingAssignment] = useState<Assignment | null>(null);
    const [assignmentTitle, setAssignmentTitle] = useState('');
    const [assignmentInstructions, setAssignmentInstructions] = useState('');
    const [assignmentOpenDate, setAssignmentOpenDate] = useState('');
    const [assignmentDueDate, setAssignmentDueDate] = useState('');

    // Handlers
    const handleOpenCreateAssignment = () => {
        setEditingAssignment(null);
        setAssignmentTitle('');
        setAssignmentInstructions('');
        setAssignmentOpenDate('');
        setAssignmentDueDate('');
        setSelectedFile(null);
        setIsAssignmentModalOpen(true);
    };

    const handleOpenEditAssignment = (assignment: Assignment) => {
        setEditingAssignment(assignment);
        setAssignmentTitle(assignment.title);
        setAssignmentInstructions('');
        setAssignmentOpenDate(assignment.openDate);
        setAssignmentDueDate(assignment.dueDate);
        setSelectedFile(null);
        setIsAssignmentModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsAssignmentModalOpen(false);
        setEditingAssignment(null);
        setSelectedFile(null);
    };

    const handleAssignmentSave = () => {
        const status = new Date(assignmentOpenDate) > new Date() ? 'Upcoming' : 'Available';
        if (editingAssignment) {
            setAssignmentsData(prev => prev.map(a =>
                a.id === editingAssignment.id ? {
                    ...a,
                    title: assignmentTitle,
                    openDate: assignmentOpenDate,
                    dueDate: assignmentDueDate,
                    status,
                    fileName: selectedFile ? selectedFile.name : a.fileName
                } : a
            ));
        } else {
            const newAssignment: Assignment = {
                id: Math.random().toString(),
                title: assignmentTitle || 'Untitled Assignment',
                openDate: assignmentOpenDate || new Date().toISOString().slice(0, 16),
                dueDate: assignmentDueDate || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 16),
                status,
                submittedCount: 0,
                totalStudents: 32,
                fileName: selectedFile ? selectedFile.name : undefined
            };
            setAssignmentsData([newAssignment, ...assignmentsData]);
        }
        setIsAssignmentModalOpen(false);
    };

    return (
        <>
            <div className="flex flex-col space-y-8">
                {/* Action Bar */}
                <div className="flex justify-between items-center bg-white p-4 rounded-2xl shadow-sm border border-slate-200">
                    <span className="text-sm text-slate-500">
                        Showing {assignmentsData.filter(a => a.status === 'Available').length} available assignments
                    </span>
                    <button
                        onClick={handleOpenCreateAssignment}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-xl text-sm font-bold transition-colors shadow-sm flex items-center gap-2"
                    >
                        + Create Assignment
                    </button>
                </div>

                {/* Assignments List */}
                <div className="flex flex-col gap-4">
                    {assignmentsData.map(assignment => (
                        <div key={assignment.id} className="bg-white border border-slate-200 rounded-xl p-5 hover:shadow-md transition-shadow flex flex-col gap-4">
                            {/* Top Row: Title & Badge */}
                            <div className="flex justify-between items-start">
                                <h3 className="text-lg font-bold text-slate-900">{assignment.title}</h3>
                                <span className={`px-3 py-1 text-xs font-bold rounded-full ${assignment.status === 'Available' ? 'bg-green-100 text-green-700' :
                                    assignment.status === 'Upcoming' ? 'bg-yellow-100 text-yellow-700' :
                                        'bg-slate-100 text-slate-600'
                                    }`}>
                                    {assignment.status}
                                </span>
                            </div>

                            {/* Details Row */}
                            <div className="text-sm text-slate-500 flex gap-6 items-center">
                                <div className="flex items-center gap-2">
                                    <span className="font-medium">Opens:</span>
                                    {new Date(assignment.openDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="font-medium">Due:</span>
                                    {new Date(assignment.dueDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                                </div>
                            </div>

                            {/* Bottom Row */}
                            <div className="mt-2 pt-4 border-t border-slate-100 flex justify-between items-center">
                                <div className="flex flex-col gap-2 w-1/3 min-w-[150px]">
                                    <div className="flex justify-between text-xs font-bold text-slate-700">
                                        <span>Submissions: {assignment.submittedCount} / {assignment.totalStudents}</span>
                                        <span>{Math.round((assignment.submittedCount / assignment.totalStudents) * 100)}%</span>
                                    </div>
                                    <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                                        <div
                                            className="bg-blue-500 h-full rounded-full"
                                            style={{ width: `${(assignment.submittedCount / assignment.totalStudents) * 100}%` }}
                                        ></div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4">
                                    <button
                                        onClick={() => handleOpenEditAssignment(assignment)}
                                        className="text-sm font-bold text-slate-500 hover:text-slate-800 transition-colors"
                                    >
                                        Edit
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Create/Edit Assignment Modal */}
            {isAssignmentModalOpen && (
                <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto w-full h-full">
                    <div className="bg-white rounded-2xl max-w-lg w-full p-6 flex flex-col my-auto max-h-[90vh] overflow-y-auto hidden-scrollbar">
                        <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-100 shrink-0">
                            <h2 className="text-xl font-bold text-slate-900">{editingAssignment ? 'Edit Assignment' : 'Create New Assignment'}</h2>
                            <button onClick={handleCloseModal} className="p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700 rounded-full transition-colors">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="flex flex-col gap-5">
                            <div className="flex flex-col gap-2">
                                <label className="text-sm font-bold text-slate-700">Assignment Title</label>
                                <input
                                    type="text"
                                    value={assignmentTitle}
                                    onChange={(e) => setAssignmentTitle(e.target.value)}
                                    placeholder="e.g. Chapter 4 Motion Graphs"
                                    className="w-full border border-slate-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium text-slate-900 placeholder:font-normal"
                                />
                            </div>

                            <div className="flex flex-col gap-2">
                                <label className="text-sm font-bold text-slate-700">Instructions</label>
                                <textarea
                                    value={assignmentInstructions}
                                    onChange={(e) => setAssignmentInstructions(e.target.value)}
                                    placeholder="Provide detailed instructions for the assignment..."
                                    rows={4}
                                    className="w-full border border-slate-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium text-slate-900 placeholder:font-normal resize-none"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="flex flex-col gap-2">
                                    <label className="text-sm font-bold text-slate-700">Open Date</label>
                                    <input
                                        type="datetime-local"
                                        value={assignmentOpenDate}
                                        onChange={(e) => setAssignmentOpenDate(e.target.value)}
                                        className="w-full border border-slate-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium text-slate-900"
                                    />
                                </div>
                                <div className="flex flex-col gap-2">
                                    <label className="text-sm font-bold text-slate-700">Due Date</label>
                                    <input
                                        type="datetime-local"
                                        value={assignmentDueDate}
                                        onChange={(e) => setAssignmentDueDate(e.target.value)}
                                        className="w-full border border-slate-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium text-slate-900"
                                    />
                                </div>
                            </div>

                            <div className="flex flex-col gap-2">
                                <label className="text-sm font-bold text-slate-700">Attachment</label>
                                {(selectedFile || editingAssignment?.fileName) ? (
                                    <div className="border border-slate-200 rounded-xl bg-slate-50 p-4 flex items-center justify-between">
                                        <div className="flex items-center gap-3 overflow-hidden">
                                            <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center shrink-0 border border-slate-100 shadow-sm">
                                                <Paperclip className="w-4 h-4 text-slate-500" />
                                            </div>
                                            <span className="text-sm font-medium text-slate-700 truncate w-[200px]">
                                                {selectedFile ? selectedFile.name : editingAssignment?.fileName}
                                            </span>
                                        </div>
                                        <button
                                            onClick={() => {
                                                setSelectedFile(null);
                                                if (editingAssignment) {
                                                    setEditingAssignment({ ...editingAssignment, fileName: undefined });
                                                }
                                            }}
                                            className="w-8 h-8 flex items-center justify-center rounded-lg text-red-400 hover:bg-red-50 hover:text-red-600 transition-colors shrink-0"
                                        >
                                            <X className="w-4 h-4" />
                                        </button>
                                    </div>
                                ) : (
                                    <label className="border-2 border-dashed border-slate-200 rounded-xl bg-slate-50 p-6 flex flex-col items-center justify-center text-center hover:bg-slate-100 hover:border-slate-300 transition-colors cursor-pointer group">
                                        <Upload className="w-5 h-5 text-slate-400 mb-2 group-hover:text-blue-500 transition-colors" />
                                        <span className="text-sm font-medium text-slate-500">Drag & drop files here or click to browse</span>
                                        <input
                                            type="file"
                                            className="hidden"
                                            onChange={(e) => {
                                                if (e.target.files && e.target.files.length > 0) {
                                                    setSelectedFile(e.target.files[0]);
                                                }
                                            }}
                                        />
                                    </label>
                                )}
                            </div>
                        </div>

                        <div className="mt-6 pt-6 border-t border-slate-100 flex justify-end gap-3 shrink-0">
                            <button
                                onClick={handleCloseModal}
                                className="px-5 py-2.5 rounded-xl text-sm font-bold text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleAssignmentSave}
                                className="px-5 py-2.5 rounded-xl text-sm font-bold text-white bg-blue-900 hover:bg-blue-800 shadow-sm transition-all focus:ring-2 focus:ring-blue-500/20 outline-none"
                            >
                                {editingAssignment ? 'Save Changes' : 'Publish Assignment'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
