"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

interface SubjectTabsProps {
    subjectId: string;
}

export default function SubjectTabs({ subjectId }: SubjectTabsProps) {
    const pathname = usePathname();

    const tabs = [
        { name: "Class Material", href: `/student/classes/${subjectId}` },
        { name: "Assignment", href: `/student/classes/${subjectId}/homework` },
        { name: "Quiz", href: `/student/classes/${subjectId}/quiz` },
        { name: "Grade", href: `/student/classes/${subjectId}/grade` },
        { name: "Attendance", href: `/student/classes/${subjectId}/attendance` },
        { name: "People", href: `/student/classes/${subjectId}/people` },
    ];

    return (
        <div className="flex overflow-x-auto border-b border-gray-200 mb-6 scrollbar-hide">
            {tabs.map((tab) => {
                const isActive = pathname === tab.href;
                return (
                    <Link
                        key={tab.href}
                        href={tab.href}
                        className={`whitespace-nowrap px-6 py-3 text-sm font-medium transition-colors border-b-2 ${isActive
                            ? "text-orange-600 border-orange-600"
                            : "text-slate-500 border-transparent hover:text-slate-800 hover:border-slate-300"
                            }`}
                    >
                        {tab.name}
                    </Link>
                );
            })}
        </div>
    );
}