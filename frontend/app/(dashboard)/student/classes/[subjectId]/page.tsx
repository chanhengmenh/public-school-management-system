"use client";

import React, { use } from "react";
import { FileText, FileSpreadsheet, Presentation, LayoutGrid, PackageOpen } from "lucide-react";
import { useAuthStore } from "@/store/useAuthStore";
import { getEnrollmentData } from "@/lib/mock-data/enrollments";

const iconMap: Record<string, React.ElementType> = {
    FileText,
    FileSpreadsheet,
    Presentation,
    LayoutGrid
};

export default function SubjectMaterialsPage({ params }: { params: Promise<{ subjectId: string }> }) {
    const { user } = useAuthStore();
    const { subjectId } = use(params);
    const studentId = user?.id ?? "alex_id";
    const enrollment = getEnrollmentData(studentId, subjectId);

    if (!enrollment) {
        return (
            <div className="flex flex-col items-center justify-center p-12 text-center bg-slate-50 min-h-[400px] rounded-2xl border border-slate-200 border-dashed mt-6">
                <div className="bg-slate-100 p-4 rounded-full mb-4 text-slate-400">
                    <PackageOpen className="w-8 h-8" />
                </div>
                <h2 className="text-xl font-bold text-slate-800 mb-2">Not Enrolled</h2>
                <p className="text-slate-500 max-w-sm">
                    You do not appear to be enrolled in `{subjectId}`, or no materials have been published yet.
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-8 mt-6">
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-slate-900">{enrollment.subjectName}</h1>
                <p className="text-sm text-slate-500 mt-1">Instructor: {enrollment.teacher}</p>
            </div>

            {enrollment.weeks.map((week, idx) => (
                <div key={idx}>
                    <h2 className="text-lg font-bold text-slate-800 mb-4">{week.title}</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {week.items.map(item => {
                            const Icon = iconMap[item.iconName] || FileText;
                            return (
                                <div key={item.id} className="bg-white p-4 rounded-xl border border-slate-100 flex items-center space-x-4 hover:shadow-sm transition-shadow">
                                    <div className={`p-3 rounded-xl ${item.bg} ${item.color}`}>
                                        <Icon className="w-6 h-6" />
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="font-semibold text-slate-900 text-sm">{item.title}</h3>
                                        <p className="text-xs text-slate-500 mt-0.5">{item.type} • {item.size}</p>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            ))}
        </div>
    );
}