'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { CheckCircle, XCircle, Clock, Loader2, Calendar, AlertCircle } from 'lucide-react';
import { attendanceApi, classSubjectsApi } from '@/lib/api';
import { AttendanceRecord } from '@/lib/api/attendance';

export default function AttendancePage() {
    const params = useParams();
    const subjectId = params.subjectId as string;
    
    const [loading, setLoading] = useState(true);
    const [records, setRecords] = useState<AttendanceRecord[]>([]);

    useEffect(() => {
        if (!subjectId) return;

        const fetchData = async () => {
            setLoading(true);
            try {
                const cs = await classSubjectsApi.getById(parseInt(subjectId));
                const data = await attendanceApi.list({ class_id: cs.class_id });
                setRecords(data.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
            } catch (error) {
                console.error("Error fetching attendance", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [subjectId]);

    const getStatusIcon = (status: string) => {
        switch (status) {
            case "present": return <CheckCircle className="text-emerald-500 w-5 h-5" />;
            case "absent": return <XCircle className="text-red-500 w-5 h-5" />;
            case "late": return <Clock className="text-amber-500 w-5 h-5" />;
            case "excused": return <AlertCircle className="text-blue-500 w-5 h-5" />;
            default: return null;
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center py-10">
                <Loader2 className="h-8 w-8 animate-spin text-amber-500" />
            </div>
        );
    }

    const stats = {
        present: records.filter(r => r.status === 'present').length,
        absent: records.filter(r => r.status === 'absent').length,
        late: records.filter(r => r.status === 'late').length,
        excused: records.filter(r => r.status === 'excused').length,
    };

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm flex items-center justify-between">
                    <span className="text-slate-500 text-sm font-medium">Present</span>
                    <span className="text-2xl font-bold text-emerald-600">{stats.present}</span>
                </div>
                <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm flex items-center justify-between">
                    <span className="text-slate-500 text-sm font-medium">Late</span>
                    <span className="text-2xl font-bold text-amber-600">{stats.late}</span>
                </div>
                <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm flex items-center justify-between">
                    <span className="text-slate-500 text-sm font-medium">Absent</span>
                    <span className="text-2xl font-bold text-red-600">{stats.absent}</span>
                </div>
                <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm flex items-center justify-between">
                    <span className="text-slate-500 text-sm font-medium">Excused</span>
                    <span className="text-2xl font-bold text-blue-600">{stats.excused}</span>
                </div>
            </div>

            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-slate-50 border-b border-slate-100">
                            <th className="px-6 py-4 text-xs uppercase tracking-wider font-bold text-slate-500">Date</th>
                            <th className="px-6 py-4 text-xs uppercase tracking-wider font-bold text-slate-500">Status</th>
                            <th className="px-6 py-4 text-xs uppercase tracking-wider font-bold text-slate-500">Note</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                        {records.length > 0 ? records.map((record, i) => (
                            <tr key={i} className="hover:bg-slate-50 transition-colors">
                                <td className="px-6 py-4 text-sm text-slate-700 font-medium">
                                    <div className="flex items-center gap-2">
                                        <Calendar className="w-4 h-4 text-slate-400" />
                                        {new Date(record.date).toLocaleDateString(undefined, { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })}
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-2">
                                        {getStatusIcon(record.status)}
                                        <span className="text-sm font-bold capitalize text-slate-700">{record.status}</span>
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-sm text-slate-500">{record.note || "-"}</td>
                            </tr>
                        )) : (
                            <tr>
                                <td colSpan={3} className="px-6 py-10 text-center text-slate-400">
                                    No attendance records found for this class.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
