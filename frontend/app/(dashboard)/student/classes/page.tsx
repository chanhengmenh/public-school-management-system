import Link from "next/link";
import PageHeader from '@/components/layouts/PageHeader';
import { Card, ProgressBar } from '@/components/ui';
import { mockCourseDirectory } from '@/lib/mock-data/student';
import { getSubjectTheme, getSubjectIcon } from '@/lib/utils';

export default function StudentClassesPage() {
    return (
        <div className="min-h-screen bg-slate-50">
            <PageHeader
                title="My Classes"
                subtitle={`Term 2 · ${mockCourseDirectory.length} Active Courses`}
            />

            <div className="px-6 lg:px-8 pb-8">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {mockCourseDirectory.map((cls) => {
                        const theme = getSubjectTheme(cls.name);
                        const Icon = getSubjectIcon(cls.name);

                        return (
                            <Link
                                key={cls.id}
                                href={`/student/classes/${cls.id}`}
                            >
                                <Card hoverable className="p-6 flex flex-col h-full">
                                    {/* Subject Icon */}
                                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${theme.bg} ${theme.text} mb-2`}>
                                        <Icon className="w-6 h-6" />
                                    </div>

                                    {/* Title & Meta */}
                                    <h2 className="font-bold text-lg text-slate-900 mt-2">
                                        {cls.name}
                                    </h2>
                                    <p className="text-sm text-slate-500 mt-1 mb-6">
                                        {cls.teacher} · {cls.schedule}
                                    </p>

                                    {/* Progress */}
                                    <div className="mt-auto">
                                        <ProgressBar
                                            value={cls.progress}
                                            color={theme.progressFill}
                                            label="Course Progress"
                                            showValue
                                        />
                                    </div>

                                    {/* Footer */}
                                    <div className="mt-6 border-t border-slate-100 pt-5 flex justify-between items-center">
                                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${theme.badgeBg} ${theme.badgeText}`}>
                                            Grade: {cls.grade}
                                        </span>
                                        <span className="text-xs text-slate-400 font-medium">
                                            Next: {cls.nextClass}
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