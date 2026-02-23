import { teacherData } from "@/data/teacher-data";
import { teacherSubmissions } from "@/data/teacher-submissions";
import { Users, BookOpen, Clock, ClipboardList, GraduationCap, AlertCircle, CheckCircle, TrendingUp, AlertTriangle, MapPin } from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";

export default function TeacherDashboard() {
    const { profile, assignedClasses, assignedSubjects, upcomingClasses, pendingTasks, stats, analytics } = teacherData;

    // Calculate dynamic stats
    const ungradedQuizzes = teacherSubmissions.filter(sub => sub.status === 'pending');
    const pendingGradingCount = ungradedQuizzes.length;

    // Recent Activity: Combine flagged submissions and upcoming tasks
    const recentActivity = [
        ...analytics.flaggedSubmissions.map(flag => ({
            type: 'alert',
            title: `Integrity Alert: ${flag.student}`,
            subtitle: `${flag.issue} in ${flag.subject}`,
            time: flag.date,
            severity: flag.severity,
            priority: null
        })),
        ...pendingTasks.map(task => ({
            type: 'task',
            title: task.task,
            subtitle: `Due: ${task.due} • ${task.class}`,
            time: 'Upcoming',
            priority: task.priority,
            severity: null
        }))
    ].slice(0, 5); // Show top 5 items

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-gray-900">Welcome, {profile.name}</h1>
                    <p className="text-gray-500">{profile.department} Department • {profile.experience} Experience</p>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-500 bg-white px-3 py-1.5 rounded-lg border border-gray-200 shadow-sm">
                    <Clock className="h-4 w-4" />
                    <span>{new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
                </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <StatCard
                    title="Total Students"
                    value={stats.totalStudents}
                    icon={Users}
                    color="blue"
                    description="In all assigned classes"
                />
                <StatCard
                    title="Pending Grading"
                    value={pendingGradingCount}
                    icon={ClipboardList}
                    color="orange"
                    description="Ungraded quiz submissions"
                />
                <StatCard
                    title="System Alerts"
                    value={analytics.flaggedCount}
                    icon={AlertTriangle}
                    color="red"
                    description="Recent integrity flags"
                />
            </div>

            {/* Main Content Area */}
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">

                {/* To-Do List: Ungraded Quizzes */}
                <div className="rounded-xl border border-gray-200 bg-white shadow-sm flex flex-col h-full">
                    <div className="border-b border-gray-200 px-6 py-4 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <ClipboardList className="h-5 w-5 text-gray-500" />
                            <h2 className="text-lg font-semibold text-gray-900">To-Do List</h2>
                        </div>
                        <span className="text-xs font-medium bg-orange-100 text-orange-700 px-2.5 py-0.5 rounded-full">
                            {pendingGradingCount} Pending
                        </span>
                    </div>
                    <div className="divide-y divide-gray-100 flex-1 overflow-y-auto max-h-[400px]">
                        {ungradedQuizzes.length > 0 ? (
                            ungradedQuizzes.map((sub) => (
                                <div key={sub.id} className="p-4 hover:bg-gray-50 transition-colors flex items-center justify-between gap-4">
                                    <div className="min-w-0">
                                        <p className="font-medium text-gray-900 truncate">{sub.quiz}</p>
                                        <p className="text-sm text-gray-500 truncate">{sub.studentName} • {sub.class}</p>
                                        <div className="flex items-center gap-2 mt-1">
                                            <span className="text-xs text-gray-400">
                                                Submitted: {new Date(sub.submittedAt).toLocaleDateString()}
                                            </span>
                                            {sub.integrityFlags > 0 && (
                                                <span className="text-xs bg-red-50 text-red-600 px-1.5 py-0.5 rounded border border-red-100 flex items-center gap-1">
                                                    <AlertCircle className="h-3 w-3" /> Flagged
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                    <button className="shrink-0 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors">
                                        Grade Now
                                    </button>
                                </div>
                            ))
                        ) : (
                            <div className="p-8 text-center text-gray-500">
                                <CheckCircle className="h-12 w-12 text-green-100 mx-auto mb-3" />
                                <p>All caught up! No pending grading.</p>
                            </div>
                        )}
                    </div>
                    {ungradedQuizzes.length > 0 && (
                        <div className="border-t border-gray-200 p-3 text-center">
                            <Link href="/teacher/grading" className="text-sm font-medium text-blue-600 hover:text-blue-700 hover:underline">
                                View all submissions
                            </Link>
                        </div>
                    )}
                </div>

                {/* Recent Activity Feed */}
                <div className="rounded-xl border border-gray-200 bg-white shadow-sm flex flex-col h-full">
                    <div className="border-b border-gray-200 px-6 py-4 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <TrendingUp className="h-5 w-5 text-gray-500" />
                            <h2 className="text-lg font-semibold text-gray-900">Recent Activity</h2>
                        </div>
                    </div>
                    <div className="p-6 space-y-6">
                        {recentActivity.map((item, idx) => (
                            <div key={idx} className="flex gap-4 relative">
                                {/* Timeline Line */}
                                {idx !== recentActivity.length - 1 && (
                                    <div className="absolute top-8 left-5 bottom-[-24px] w-0.5 bg-gray-100"></div>
                                )}

                                <div className={cn(
                                    "relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-4 border-white shadow-sm",
                                    item.type === 'alert' ? "bg-red-100 text-red-600" : "bg-blue-100 text-blue-600"
                                )}>
                                    {item.type === 'alert' ? <AlertTriangle className="h-5 w-5" /> : <ClipboardList className="h-5 w-5" />}
                                </div>
                                <div className="flex-1 pt-0.5">
                                    <div className="flex items-start justify-between gap-2">
                                        <h3 className="text-sm font-medium text-gray-900">{item.title}</h3>
                                        <span className="text-xs text-gray-400 whitespace-nowrap">{item.time}</span>
                                    </div>
                                    <p className="text-sm text-gray-500 mt-0.5">{item.subtitle}</p>
                                    {item.type === 'alert' && (
                                        <span className={cn(
                                            "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium mt-2",
                                            item.severity === "high" ? "bg-red-100 text-red-700" :
                                                item.severity === "medium" ? "bg-amber-100 text-amber-700" : "bg-yellow-100 text-yellow-700"
                                        )}>
                                            {item.severity} severity
                                        </span>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

            </div>

            {/* Assigned Classes Preview */}
            <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
                <div className="border-b border-gray-200 px-6 py-4">
                    <h2 className="text-lg font-semibold text-gray-900">My Classes</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 p-6">
                    {assignedClasses.map((cls) => (
                        <div key={cls.id} className="p-4 rounded-lg border border-gray-200 hover:border-blue-300 hover:shadow-md transition-all cursor-pointer group">
                            <div className="flex items-center justify-between mb-3">
                                <div className="h-10 w-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-colors">
                                    <GraduationCap className="h-5 w-5" />
                                </div>
                                <span className="text-xs font-medium bg-gray-100 text-gray-600 px-2 py-1 rounded">
                                    {cls.room}
                                </span>
                            </div>
                            <h3 className="font-semibold text-gray-900 mb-1">{cls.name}</h3>
                            <p className="text-sm text-gray-500 mb-3">{cls.students} Students</p>
                            <div className="text-xs text-gray-400 flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {cls.schedule}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

// Stat Card Component
function StatCard({
    title,
    value,
    icon: Icon,
    color,
    description,
}: {
    title: string;
    value: number;
    icon: React.ElementType;
    color: "blue" | "purple" | "green" | "orange" | "red";
    description?: string;
}) {
    const colorClasses = {
        blue: "bg-blue-100 text-blue-600",
        purple: "bg-purple-100 text-purple-600",
        green: "bg-green-100 text-green-600",
        orange: "bg-orange-100 text-orange-600",
        red: "bg-red-100 text-red-600",
    };

    return (
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            <div className="flex items-center gap-4">
                <div className={cn("rounded-lg p-3", colorClasses[color])}>
                    <Icon className="h-6 w-6" />
                </div>
                <div>
                    <p className="text-sm font-medium text-gray-500">{title}</p>
                    <p className="text-2xl font-bold text-gray-900">{value}</p>
                    {description && <p className="text-xs text-gray-400 mt-1">{description}</p>}
                </div>
            </div>
        </div>
    );
}
