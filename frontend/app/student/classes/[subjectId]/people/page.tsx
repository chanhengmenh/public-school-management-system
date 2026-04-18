'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { User as UserIcon, Loader2, ShieldCheck, GraduationCap } from "lucide-react";
import { classSubjectsApi, client } from '@/lib/api';
import { User } from '@/types/user.types';

export default function PeoplePage() {
    const params = useParams();
    const subjectId = params.subjectId as string;

    const [loading, setLoading] = useState(true);
    const [teacherName, setTeacherName] = useState<string>('');
    const [classmates, setClassmates] = useState<User[]>([]);

    useEffect(() => {
        if (!subjectId) return;

        const fetchData = async () => {
            setLoading(true);
            try {
                const cs = await classSubjectsApi.getById(parseInt(subjectId));
                // teacher_name is now returned by backend directly
                setTeacherName(cs.teacher_name ?? '');
                // GET /classes/{class_id}/students is accessible to all authenticated users
                const students = await client.get<User[]>(`/classes/${cs.class_id}/students`);
                setClassmates(students);
            } catch (error) {
                console.error("Error fetching people", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [subjectId]);

    if (loading) {
        return (
            <div className="flex justify-center py-10">
                <Loader2 className="h-8 w-8 animate-spin text-amber-500" />
            </div>
        );
    }

    return (
        <div className="space-y-8 max-w-4xl">
            {/* Teacher Section */}
            <section>
                <div className="flex items-center justify-between border-b border-slate-200 pb-3 mb-6">
                    <h2 className="text-2xl font-serif font-bold text-slate-900">Teachers</h2>
                    <span className="text-sm text-slate-500 font-medium">1 person</span>
                </div>
                <div className="flex items-center space-x-4 p-4 hover:bg-slate-50 rounded-xl transition-colors">
                    <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                        <ShieldCheck className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="font-bold text-slate-900">{teacherName || 'Instructor'}</p>
                        <p className="text-xs text-slate-500 uppercase font-bold tracking-wider">Subject Teacher</p>
                    </div>
                </div>
            </section>

            {/* Students Section */}
            <section>
                <div className="flex items-center justify-between border-b border-slate-200 pb-3 mb-6">
                    <h2 className="text-2xl font-serif font-bold text-slate-900">Classmates</h2>
                    <span className="text-sm text-slate-500 font-medium">{classmates.length} students</span>
                </div>
                <div className="grid grid-cols-1 gap-2">
                    {classmates.map((student) => (
                        <div key={student.id} className="flex items-center space-x-4 p-4 hover:bg-slate-50 rounded-xl transition-colors border border-transparent hover:border-slate-100">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${student.is_class_monitor ? "bg-amber-100 text-amber-600" : "bg-slate-100 text-slate-500"}`}>
                                {student.is_class_monitor ? <ShieldCheck className="w-5 h-5" /> : <GraduationCap className="w-5 h-5" />}
                            </div>
                            <div className="flex-1">
                                <p className="font-bold text-slate-900">{student.full_name}</p>
                                {student.is_class_monitor && (
                                    <span className="text-[10px] bg-amber-50 text-amber-700 px-2 py-0.5 rounded font-bold border border-amber-100">CLASS MONITOR</span>
                                )}
                            </div>
                        </div>
                    ))}
                    {classmates.length === 0 && (
                        <div className="text-center py-8 text-slate-400 text-sm">
                            <UserIcon className="w-8 h-8 mx-auto mb-2 opacity-50" />
                            <p>No classmates found.</p>
                        </div>
                    )}
                </div>
            </section>
        </div>
    );
}
