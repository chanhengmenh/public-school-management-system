"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

interface Tab {
  name: string;
  href: string;
}

interface SubjectTabsProps {
  role: "teacher" | "student";
  subjectId: string;
}

function getStudentTabs(subjectId: string): Tab[] {
  return [
    { name: "Class Material", href: `/student/classes/${subjectId}` },
    { name: "Assignment", href: `/student/classes/${subjectId}/homework` },
    { name: "Quiz", href: `/student/classes/${subjectId}/quiz` },
    { name: "Grade", href: `/student/classes/${subjectId}/grade` },
    { name: "Attendance", href: `/student/classes/${subjectId}/attendance` },
    { name: "People", href: `/student/classes/${subjectId}/people` },
  ];
}

function getTeacherTabs(subjectId: string): Tab[] {
  return [
    { name: "Overview", href: `/teacher/classes/${subjectId}` },
    { name: "Materials", href: `/teacher/classes/${subjectId}/materials` },
    { name: "Grading", href: `/teacher/classes/${subjectId}/grading` },
    { name: "Students", href: `/teacher/classes/${subjectId}/students` },
    { name: "Attendance", href: `/teacher/classes/${subjectId}/attendance` },
    { name: "Quizzes", href: `/teacher/classes/${subjectId}/quizzes` },
    { name: "Analysis", href: `/teacher/classes/${subjectId}/analysis` },
  ];
}

export default function SubjectTabs({ role, subjectId }: SubjectTabsProps) {
  const pathname = usePathname();

  const tabs = role === "teacher"
    ? getTeacherTabs(subjectId)
    : getStudentTabs(subjectId);

  // Determine the root (index) tab href — the first tab for each role
  const rootHref = tabs[0]?.href ?? "";

  function isTabActive(tab: Tab): boolean {
    if (tab.href === rootHref) {
      // Root tab: exact match OR starts-with but not captured by any other tab
      return (
        pathname === tab.href ||
        (pathname.startsWith(tab.href) &&
          !tabs.slice(1).some(t => pathname.startsWith(t.href)))
      );
    }
    // Non-root tabs: exact match or starts-with
    return pathname === tab.href || pathname.startsWith(tab.href);
  }

  return (
    <div className="flex overflow-x-auto border-b border-slate-200 mb-6 scrollbar-hide">
      {tabs.map((tab) => {
        const active = isTabActive(tab);
        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={`whitespace-nowrap px-6 py-3 text-sm font-medium transition-colors border-b-2 ${
              active
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
