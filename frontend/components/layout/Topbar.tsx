"use client";

import { useState } from "react";
import { Bell, Search, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useRole } from "@/contexts/RoleContext";
import { cn } from "@/lib/utils";

const mockNotifications = [
    { id: 1, title: "Quiz Reminder", message: "Algebra Mid-term is due tomorrow!", time: "2 hours ago", unread: true },
    { id: 2, title: "Grade Posted", message: "Your Physics quiz score is now available.", time: "5 hours ago", unread: true },
    { id: 3, title: "Schedule Change", message: "Computer Science class moved to Lab C302.", time: "1 day ago", unread: false },
    { id: 4, title: "New Assignment", message: "English Literature essay has been posted.", time: "2 days ago", unread: false },
];

export function Topbar() {
    const [showNotifications, setShowNotifications] = useState(false);
    const pathname = usePathname();
    const { role, isMonitor, setRole } = useRole();

    // Determine profile link based on role
    let profileLink = "/student/profile";
    if (pathname?.startsWith("/admin")) {
        profileLink = "/admin/profile";
    } else if (pathname?.startsWith("/teacher")) {
        profileLink = "/teacher/profile";
    } else if (pathname?.startsWith("/home-class-teacher")) {
        profileLink = "/home-class-teacher/profile";
    }

    const unreadCount = mockNotifications.filter((n) => n.unread).length;
    const isStudent = pathname?.startsWith("/student");
    const isTeacher = pathname?.startsWith("/teacher");

    return (
        <header className="flex h-16 items-center justify-between border-b border-gray-200 bg-white px-6">
            <div className="flex items-center gap-4">
                <h1 className="text-lg font-semibold text-gray-800">
                    {isStudent ? "My Academic" : isTeacher ? "Academic Control" : "Dashboard"}
                </h1>

                {/* Dynamically styled Status Badge for Students */}
                {isStudent && (
                    <div className={cn(
                        "flex items-center gap-2 rounded-full px-3 py-1 text-sm font-medium transition-colors",
                        isMonitor
                            ? "bg-amber-50 text-amber-700 ring-1 ring-inset ring-amber-600/20"
                            : "bg-blue-50 text-blue-700 ring-1 ring-inset ring-blue-600/20"
                    )}>
                        <div className={cn(
                            "h-2 w-2 rounded-full",
                            isMonitor ? "bg-amber-500" : "bg-blue-500"
                        )} />
                        {isMonitor ? "Class Monitor" : "Student"}
                    </div>
                )}
            </div>

            <div className="flex items-center gap-6">

                {/* Demo Mockup Toggle */}
                {isStudent && (
                    <div className="flex items-center gap-3">
                        <span className="text-[11px] font-bold tracking-wider text-gray-400 uppercase">
                            Preview As:
                        </span>
                        <div className="flex items-center rounded-full border border-gray-200 bg-gray-50/50 p-1">
                            <button
                                onClick={() => setRole("student")}
                                className={cn(
                                    "flex items-center justify-center rounded-full px-4 py-1.5 text-sm font-medium transition-all duration-300",
                                    !isMonitor
                                        ? "bg-gray-200 text-gray-700 shadow-sm"
                                        : "text-gray-400 hover:text-gray-700"
                                )}
                            >
                                Student
                            </button>
                            <button
                                onClick={() => setRole("class_monitor")}
                                className={cn(
                                    "flex items-center justify-center rounded-full px-4 py-1.5 text-sm font-medium transition-all duration-300",
                                    isMonitor
                                        ? "bg-amber-500 text-white shadow-sm"
                                        : "text-gray-400 hover:text-gray-700"
                                )}
                            >
                                Monitor
                            </button>
                        </div>
                    </div>
                )}

                <div className="flex items-center gap-4 border-l border-gray-200 pl-6">
                    {!isStudent && !isTeacher && (
                        <div className="relative hidden sm:block">
                            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                            <input
                                type="search"
                                placeholder="Search..."
                                className="h-9 w-64 rounded-md border border-gray-200 bg-gray-50 pl-9 pr-4 text-sm text-gray-900 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 placeholder-gray-400"
                            />
                        </div>
                    )}

                    {/* Notification Bell */}
                    <div className="relative">
                        <button
                            onClick={() => setShowNotifications(!showNotifications)}
                            className="relative rounded-full p-2 text-gray-500 hover:bg-gray-100 transition-colors"
                        >
                            <Bell className="h-5 w-5" />
                            {unreadCount > 0 && (
                                <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-red-500 ring-2 ring-white" />
                            )}
                        </button>

                        {/* Notification Dropdown */}
                        {showNotifications && (
                            <div className="absolute right-0 top-12 w-80 rounded-xl border border-gray-200 bg-white shadow-lg z-50">
                                <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3">
                                    <h3 className="font-semibold text-gray-900">Notifications</h3>
                                    <button
                                        onClick={() => setShowNotifications(false)}
                                        className="text-gray-400 hover:text-gray-600"
                                    >
                                        <X className="h-4 w-4" />
                                    </button>
                                </div>
                                <div className="max-h-80 overflow-y-auto divide-y divide-gray-100">
                                    {mockNotifications.map((notif) => (
                                        <div
                                            key={notif.id}
                                            className={`px-4 py-3 hover:bg-gray-50 cursor-pointer ${notif.unread ? "bg-blue-50" : ""}`}
                                        >
                                            <div className="flex items-start gap-2">
                                                {notif.unread && (
                                                    <span className="mt-1.5 h-2 w-2 rounded-full bg-blue-500 flex-shrink-0" />
                                                )}
                                                <div className={notif.unread ? "" : "ml-4"}>
                                                    <p className="text-sm font-medium text-gray-900">{notif.title}</p>
                                                    <p className="text-xs text-gray-500 mt-0.5">{notif.message}</p>
                                                    <p className="text-xs text-gray-400 mt-1">{notif.time}</p>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                <div className="border-t border-gray-100 px-4 py-2">
                                    <button className="w-full text-center text-sm text-blue-600 hover:text-blue-700 font-medium">
                                        View all notifications
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Profile Link */}
                    {/* Profile Link */}
                    <Link href={profileLink} className="flex items-center gap-3 border-l border-gray-200 pl-4 hover:opacity-80 transition-opacity">
                        <div className="text-right hidden sm:block">
                            <p className="text-sm font-medium text-gray-900">
                                {pathname?.startsWith("/teacher") ? "Mr. Tep Rendaro" :
                                    pathname?.startsWith("/admin") ? "Admin User" :
                                        pathname?.startsWith("/home-class-teacher") ? "Keo Romjong" :
                                            "Preap Sovath"}
                            </p>
                            <p className="text-xs text-gray-500 capitalize">
                                {pathname?.startsWith("/teacher") ? "Teacher" :
                                    pathname?.startsWith("/admin") ? "Administrator" :
                                        pathname?.startsWith("/home-class-teacher") ? "Home-class Teacher" :
                                            "Student"}
                            </p>
                        </div>
                        <div className="h-9 w-9 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold border border-blue-200">
                            {pathname?.startsWith("/teacher") ? "MA" :
                                pathname?.startsWith("/admin") ? "AD" :
                                    pathname?.startsWith("/home-class-teacher") ? "KR" :
                                        "JD"}
                        </div>
                    </Link>
                </div>
            </div>
        </header>
    );
}
