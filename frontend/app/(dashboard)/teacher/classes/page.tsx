'use client';

import { Clock, FileText, CheckCircle2, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import PageHeader from '@/components/layouts/PageHeader';
import { Card, Badge } from '@/components/ui';
import { getTeacherData } from '@/lib/mock-data/teacher';
import { useAuthStore } from '@/store/useAuthStore';
import { getSubjectTheme, getSubjectIcon } from '@/lib/utils';

export default function TeacherClassesPage() {
    const { user } = useAuthStore();
    const data = getTeacherData(user?.id ?? 'teacher_001');
    const classes = data.classes;

    const sortedClasses = [...classes].sort((a, b) => {
        const homeName = user?.homeClass?.name?.replace('-', '') ?? '';
        if (homeName && a.className.includes(homeName)) return -1;
        if (homeName && b.className.includes(homeName)) return 1;
        return 0;
    });

    return (
        <div className="min-h-screen bg-[#f4f7f9]">
            <PageHeader
                title="My Classes"
                subtitle={`Term 2 · ${classes.length} classes`}
            />

            <div className="max-w-7xl mx-auto w-full flex flex-col px-6 lg:px-8 pt-6 pb-32">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {sortedClasses.map((c) => {
                        const theme = getSubjectTheme(c.subject);
                        const Icon = getSubjectIcon(c.subject);

                        const isHomeClass = user?.homeClass && c.className.includes(user.homeClass.name.replace('-', ''));
                        const cardClasses = isHomeClass
                            ? 'bg-amber-50/50 border-amber-200 hover:border-amber-300'
                            : 'bg-white border-transparent';

                        return (
                            <Link
                                key={c.id}
                                href={`/teacher/classes/${c.id}`}
                                className="block"
                            >
                                <Card className={`p-6 !rounded-[20px] flex flex-col hover:shadow-[0_8px_20px_-6px_rgba(0,0,0,0.1)] transition-all duration-300 group ${cardClasses}`}>
                                    {/* Top: Icon & Badge */}
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="w-12 h-12 rounded-xl flex items-center justify-center border border-slate-100 bg-white text-slate-700 shadow-sm">
                                            <Icon className="w-5 h-5 stroke-[2]" />
                                        </div>
                                        <div className="flex items-center gap-2">
                                            {isHomeClass && (
                                                <Badge variant="warning" className="!text-[11px] !font-bold tracking-wider !bg-amber-100 !text-amber-700 shadow-sm border border-amber-200">
                                                    👑 HOME CLASS
                                                </Badge>
                                            )}
                                            <Badge variant="info" className={`!text-[11px] !font-bold uppercase tracking-wider ${theme.bg} ${theme.text} !border-transparent`}>
                                                {c.className}
                                            </Badge>
                                        </div>
                                    </div>

                                    {/* Title & Subtitle */}
                                    <h2 className="text-[22px] font-bold text-slate-900 group-hover:text-blue-700 transition-colors">
                                        {c.subject}
                                    </h2>
                                    <div className="flex items-center text-[13px] text-slate-500 mt-1.5 mb-8 gap-2">
                                        <span>{c.students} students</span>
                                        <span className="w-1 h-1 rounded-full bg-slate-300" />
                                        <span className="flex items-center gap-1.5">
                                            <Clock className="w-3.5 h-3.5" />
                                            {c.schedule}
                                        </span>
                                    </div>

                                    {/* Metrics */}
                                    <div className="flex flex-wrap items-center gap-3 mt-auto">
                                        <Badge variant="error" className="!text-xs !font-bold !shadow-[0_1px_2px_rgba(0,0,0,0.02)]">
                                            <FileText className="w-3.5 h-3.5 mr-1" />
                                            {c.hw} HW
                                        </Badge>
                                        <Badge variant="warning" className="!text-xs !font-bold !shadow-[0_1px_2px_rgba(0,0,0,0.02)]">
                                            <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
                                            {c.quizzes} Quiz
                                        </Badge>
                                    </div>

                                    {/* Footer */}
                                    <div className="mt-6 border-t border-slate-100/80 pt-5 flex justify-between items-center">
                                        <span className="text-[13px] text-slate-500">{c.students} students enrolled</span>
                                        <span className="font-bold text-sm text-blue-600 flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                                            View Class
                                            <ChevronRight className="w-4 h-4" />
                                        </span>
                                    </div>
                                </Card>
                            </Link>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}