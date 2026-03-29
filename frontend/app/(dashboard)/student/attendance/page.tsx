'use client';

import React, { useState } from 'react';
import { ClipboardCheck } from 'lucide-react';
import PageHeader from '@/components/layouts/PageHeader';
import { Card, Button, Badge, ConfirmModal, ToastContainer, useToast } from '@/components/ui';
import { MOCK_ROSTERS_DB } from '@/lib/mock-data/student';
import { useAuthStore } from '@/store/useAuthStore';
import type { AttendanceStatus, StudentRoster } from '@/types/school.types';

export default function DraftAttendancePage() {
    const { user } = useAuthStore();
    const isMonitor = user?.subRole === 'monitor';
    const activeRoster = MOCK_ROSTERS_DB[user?.classId ?? 'class_11A'] || MOCK_ROSTERS_DB['class_11A'];

    const [students, setStudents] = useState<StudentRoster[]>(activeRoster);
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [subject, setSubject] = useState('Physics');
    const [session, setSession] = useState('8:00 AM');
    const [showConfirm, setShowConfirm] = useState(false);
    const { toasts, addToast, dismissToast } = useToast();

    if (!isMonitor) {
        return (
            <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-center">
                <div className="bg-red-50 text-red-500 p-4 rounded-full mb-4">
                    <ClipboardCheck className="w-8 h-8" />
                </div>
                <h1 className="text-2xl font-bold text-slate-900 mb-2">Access Denied</h1>
                <p className="text-slate-500 max-w-sm">
                    Only Class Monitors are authorized to submit draft attendance. 
                    Please contact your teacher if you believe this is an error.
                </p>
            </div>
        );
    }

    const handleStatusChange = (id: number, newStatus: AttendanceStatus) => {
        setStudents(current =>
            current.map(student =>
                student.id === id ? { ...student, status: newStatus } : student
            )
        );
    };

    const handleSubmitClick = () => {
        setShowConfirm(true);
    };

    const handleConfirmSubmit = () => {
        setShowConfirm(false);
        addToast('success', `Attendance submitted for ${subject} (${session}) on ${date}`);
        setStudents(activeRoster);
    };

    const statusVariant = (status: AttendanceStatus): 'success' | 'error' | 'warning' => {
        if (status === 'Present') return 'success';
        if (status === 'Absent') return 'error';
        return 'warning';
    };

    return (
        <div className="min-h-screen bg-slate-50 font-sans">
            <div className="max-w-7xl mx-auto w-full flex flex-col">
                <PageHeader
                    title="Draft Attendance"
                    badge="Monitor Task"
                    subtitle="Submit daily attendance to your teachers."
                />

                <div className="px-6 lg:px-8 pb-12 w-full max-w-4xl mt-8">

                    {/* Session Details */}
                    <Card className="p-6 sm:p-8 mb-8">
                        <h2 className="text-lg font-bold text-slate-900 mb-6 font-serif">Session Details</h2>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-700">Date</label>
                                <input
                                    type="date"
                                    value={date}
                                    onChange={(e) => setDate(e.target.value)}
                                    className="w-full px-4 py-2.5 rounded-lg border border-slate-200 bg-slate-50 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-sans"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-700">Subject</label>
                                <select
                                    value={subject}
                                    onChange={(e) => setSubject(e.target.value)}
                                    className="w-full px-4 py-2.5 rounded-lg border border-slate-200 bg-slate-50 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-sans appearance-none"
                                >
                                    <option value="Physics">Physics</option>
                                    <option value="Advanced Math">Advanced Math</option>
                                    <option value="English Literature">English Literature</option>
                                    <option value="Geography">Geography</option>
                                </select>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-700">Session Time</label>
                                <select
                                    value={session}
                                    onChange={(e) => setSession(e.target.value)}
                                    className="w-full px-4 py-2.5 rounded-lg border border-slate-200 bg-slate-50 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-sans appearance-none"
                                >
                                    <option value="8:00 AM">8:00 AM</option>
                                    <option value="10:00 AM">10:00 AM</option>
                                    <option value="1:00 PM">1:00 PM</option>
                                    <option value="3:00 PM">3:00 PM</option>
                                </select>
                            </div>
                        </div>
                    </Card>

                    {/* Student Roster */}
                    <div className="mb-8">
                        <h2 className="text-lg font-bold text-slate-900 mb-4 font-serif px-2">Student Roster</h2>

                        <div className="flex flex-col gap-3">
                            {students.map((student) => (
                                <Card key={student.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 !rounded-xl hover:border-slate-300 transition-all">
                                    {/* Left: Avatar & Name */}
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-100 to-indigo-200 text-indigo-700 flex items-center justify-center font-bold text-sm shrink-0">
                                            {student.avatar}
                                        </div>
                                        <div>
                                            <span className="font-bold font-sans text-slate-800">{student.name}</span>
                                            <span className="block text-xs text-slate-500 mt-0.5">ID: 2025-{student.id.toString().padStart(4, '0')}</span>
                                        </div>
                                    </div>

                                    {/* Right: Status Toggles */}
                                    <div className="flex items-center gap-2 sm:ml-auto w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
                                        {(['Present', 'Absent', 'Late'] as AttendanceStatus[]).map((status) => (
                                            <Button
                                                key={status}
                                                variant={student.status === status ? 'primary' : 'outline'}
                                                size="sm"
                                                color={
                                                    student.status === status
                                                        ? status === 'Present'
                                                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                                            : status === 'Absent'
                                                                ? 'bg-red-50 text-red-700 border-red-200'
                                                                : 'bg-amber-50 text-amber-700 border-amber-200'
                                                        : undefined
                                                }
                                                onClick={() => handleStatusChange(student.id, status)}
                                                className={`flex-1 sm:flex-none ${
                                                    student.status === status ? '!text-current shadow-sm border' : ''
                                                }`}
                                            >
                                                {status}
                                            </Button>
                                        ))}
                                    </div>

                                    {/* Status Badge */}
                                    <Badge variant={statusVariant(student.status)} className="hidden sm:inline-flex">
                                        {student.status}
                                    </Badge>
                                </Card>
                            ))}
                        </div>
                    </div>

                    {/* Submit */}
                    <div className="flex justify-end pt-4 border-t border-slate-200">
                        <Button
                            variant="primary"
                            size="lg"
                            icon={ClipboardCheck}
                            color="bg-indigo-600"
                            onClick={handleSubmitClick}
                            className="hover:!bg-indigo-700"
                        >
                            Submit to Teacher
                        </Button>
                    </div>

                </div>
            </div>

            {/* Confirm Modal */}
            <ConfirmModal
                isOpen={showConfirm}
                title="Submit Attendance?"
                description={`You are about to submit the attendance report for ${subject} (${session}) on ${date}. This action cannot be undone.`}
                confirmLabel="Submit"
                cancelLabel="Go Back"
                onConfirm={handleConfirmSubmit}
                onCancel={() => setShowConfirm(false)}
            />

            {/* Toast Container */}
            <ToastContainer toasts={toasts} onDismiss={dismissToast} />
        </div>
    );
}
