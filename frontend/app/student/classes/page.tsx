import Link from "next/link";
import { Microscope, Calculator, BookOpen, FlaskConical, Globe, Library } from "lucide-react";

export default function StudentClassesPage() {
    const classes = [
        {
            id: "physics",
            name: "Physics",
            teacher: "Mr. Tan Wei",
            schedule: "Mon/Wed/Fri",
            progress: 68,
            grade: "A",
            nextClass: "Mon 8:00 AM",
            icon: Microscope,
            theme: {
                bg: "bg-blue-50",
                text: "text-blue-600",
                progressTrack: "bg-blue-100",
                progressFill: "bg-blue-500",
                badgeBg: "bg-blue-100",
                badgeText: "text-blue-700",
            },
        },
        {
            id: "advanced-math",
            name: "Advanced Math",
            teacher: "Ms. Sarah Lee",
            schedule: "Tue/Thu",
            progress: 45,
            grade: "B+",
            nextClass: "Tue 10:00 AM",
            icon: Calculator,
            theme: {
                bg: "bg-orange-50",
                text: "text-orange-600",
                progressTrack: "bg-orange-100",
                progressFill: "bg-orange-500",
                badgeBg: "bg-orange-100",
                badgeText: "text-orange-700",
            },
        },
        {
            id: "english-literature",
            name: "English Literature",
            teacher: "Mr. John Doe",
            schedule: "Mon/Wed/Fri",
            progress: 82,
            grade: "A-",
            nextClass: "Wed 2:00 PM",
            icon: BookOpen,
            theme: {
                bg: "bg-purple-50",
                text: "text-purple-600",
                progressTrack: "bg-purple-100",
                progressFill: "bg-purple-500",
                badgeBg: "bg-purple-100",
                badgeText: "text-purple-700",
            },
        },
        {
            id: "chemistry",
            name: "Chemistry",
            teacher: "Dr. Alan Turing",
            schedule: "Tue/Thu",
            progress: 50,
            grade: "B",
            nextClass: "Thu 11:30 AM",
            icon: FlaskConical,
            theme: {
                bg: "bg-green-50",
                text: "text-green-600",
                progressTrack: "bg-green-100",
                progressFill: "bg-green-500",
                badgeBg: "bg-green-100",
                badgeText: "text-green-700",
            },
        },
        {
            id: "geography",
            name: "Geography",
            teacher: "Mrs. Smith",
            schedule: "Mon/Wed",
            progress: 90,
            grade: "A+",
            nextClass: "Mon 1:00 PM",
            icon: Globe,
            theme: {
                bg: "bg-red-50",
                text: "text-red-600",
                progressTrack: "bg-red-100",
                progressFill: "bg-red-500",
                badgeBg: "bg-red-100",
                badgeText: "text-red-700",
            },
        },
        {
            id: "history",
            name: "History",
            teacher: "Mr. Brown",
            schedule: "Tue/Thu/Fri",
            progress: 75,
            grade: "A",
            nextClass: "Tue 9:00 AM",
            icon: Library,
            theme: {
                bg: "bg-teal-50",
                text: "text-teal-600",
                progressTrack: "bg-teal-100",
                progressFill: "bg-teal-500",
                badgeBg: "bg-teal-100",
                badgeText: "text-teal-700",
            },
        },
    ];

    return (
        <div className="min-h-screen bg-slate-50">
            {/* Header Section */}
            <header className="sticky top-0 z-30 bg-white border-b border-slate-200 px-6 lg:px-8 py-6 mb-8">
                <div className="flex justify-between items-start">
                    <div>
                        <h1 className="text-3xl font-serif font-bold text-[#0f172a]">
                            My Classes
                        </h1>
                        <p className="text-sm text-slate-500 mt-1">
                            Term 2 · 6 Active Courses
                        </p>
                    </div>
                    {/* Right side strictly empty */}
                    <div></div>
                </div>
            </header>

            <div className="px-6 lg:px-8 pb-8">
                {/* Grid Layout */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {classes.map((cls) => {
                        const Icon = cls.icon;
                        return (
                            <Link
                                key={cls.id}
                                href={`/student/classes/${cls.id}`}
                                className="bg-white rounded-2xl border border-slate-100 p-6 flex flex-col shadow-sm hover:shadow-md transition-shadow"
                            >
                                {/* Top Icon */}
                                <div
                                    className={`w-12 h-12 rounded-xl flex items-center justify-center ${cls.theme.bg} ${cls.theme.text} mb-2`}
                                >
                                    <Icon className="w-6 h-6" />
                                </div>

                                {/* Titles */}
                                <h2 className="font-bold text-lg text-slate-900 mt-2">
                                    {cls.name}
                                </h2>
                                <p className="text-sm text-slate-500 mt-1 mb-6">
                                    {cls.teacher} · {cls.schedule}
                                </p>

                                {/* Progress Section */}
                                <div className="mt-auto">
                                    <div className="flex justify-between items-center mb-2">
                                        <span className="text-sm font-medium text-slate-700">
                                            Course Progress
                                        </span>
                                        <span className="text-sm font-medium text-slate-900">
                                            {cls.progress}%
                                        </span>
                                    </div>
                                    <div
                                        className={`w-full h-2 rounded-full overflow-hidden ${cls.theme.progressTrack}`}
                                    >
                                        <div
                                            className={`h-full rounded-full ${cls.theme.progressFill}`}
                                            style={{ width: `${cls.progress}%` }}
                                        />
                                    </div>
                                </div>

                                {/* Footer */}
                                <div className="mt-6 border-t border-slate-100 pt-5 flex justify-between items-center">
                                    <span
                                        className={`px-3 py-1 rounded-full text-xs font-bold ${cls.theme.badgeBg} ${cls.theme.badgeText}`}
                                    >
                                        Grade: {cls.grade}
                                    </span>
                                    <span className="text-xs text-slate-400 font-medium">
                                        Next: {cls.nextClass}
                                    </span>
                                </div>
                            </Link>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}