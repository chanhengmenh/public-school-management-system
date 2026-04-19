'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { BookOpen, Loader2 } from 'lucide-react';
import { useAuth } from '@/components/auth/AuthProvider';
import { enrollmentsApi, classSubjectsApi } from '@/lib/api';
import { ClassSubject } from '@/types/school.types';

export default function StudentClassesPage() {
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [classes, setClasses] = useState<ClassSubject[]>([]);

    useEffect(() => {
        if (!user) return;

        const fetchClasses = async () => {
            setLoading(true);
            try {
                const enrolled = await enrollmentsApi.list({ student_id: user.id });
                if (enrolled.length > 0) {
                    const subjectArrays = await Promise.all(
                        enrolled.map(e => classSubjectsApi.list({ class_id: e.class_id }))
                    );
                    setClasses(subjectArrays.flat());
                }
            } catch (error) {
                console.error("Error fetching classes", error);
            } finally {
                setLoading(false);
            }
        };

        fetchClasses();
    }, [user]);

    if (loading) {
        return (
            <div className="flex h-screen items-center justify-center bg-slate-50">
                <Loader2 className="h-8 w-8 animate-spin text-amber-500" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50">
            <header className="sticky top-0 z-30 bg-white border-b border-slate-200 px-6 lg:px-8 py-6 mb-8">
                <div className="flex justify-between items-start">
                    <div>
                        <h1 className="text-3xl font-serif font-bold text-[#0f172a]">
                            My Classes
                        </h1>
                        <p className="text-sm text-slate-500 mt-1">
                            {classes.length} Active Courses
                        </p>
                    </div>
                </div>
            </header>

            <div className="px-6 lg:px-8 pb-8">
                {classes.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {classes.map((cls) => (
                            <Link
                                key={cls.id}
                                href={`/student/classes/${cls.id}`}
                                className="bg-white rounded-2xl border border-slate-100 p-6 flex flex-col shadow-sm hover:shadow-md transition-shadow"
                            >
                                <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-amber-50 text-amber-600 mb-2">
                                    <BookOpen className="w-6 h-6" />
                                </div>

                                <h2 className="font-bold text-lg text-slate-900 mt-2">
                                    {cls.subject_name}
                                </h2>
                                <p className="text-sm text-slate-500 mt-1 mb-6">
                                    {cls.teacher_name}
                                </p>

                                <div className="mt-auto border-t border-slate-100 pt-5 flex justify-between items-center">
                                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-700">
                                        Active
                                    </span>
                                    <span className="text-xs text-slate-400 font-medium">
                                        View Course →
                                    </span>
                                </div>
                            </Link>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-20 bg-white rounded-2xl border border-slate-200">
                        <BookOpen className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                        <h3 className="text-lg font-bold text-slate-900">No classes found</h3>
                        <p className="text-slate-500">You are not enrolled in any classes yet.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
