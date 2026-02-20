"use client";

import Link from "next/link";
import { navigation } from "@/lib/navigation";
import { cn } from "@/lib/utils";
import { GraduationCap, LogOut, ChevronLeft, ChevronRight } from "lucide-react";
import { Role } from "@/types";
import type { ComponentType } from "react";

import { usePathname } from "next/navigation";

interface SidebarProps {
    isCollapsed: boolean;
    toggleSidebar: () => void;
}

export function Sidebar({ isCollapsed, toggleSidebar }: SidebarProps) {
    const pathname = usePathname();

    // Mock role detection based on URL
    let role: Role = "admin";
    if (pathname?.startsWith("/student")) {
        role = "student";
    } else if (pathname?.startsWith("/teacher")) {
        role = "teacher";
    } else if (pathname?.startsWith("/home-class-teacher")) {
        role = "home-class-teacher";
    }

    const links = navigation[role as keyof typeof navigation] || [];

    return (
        <aside
            className={cn(
                "hidden flex-col border-r border-gray-200 bg-white md:flex h-screen fixed left-0 top-0 bottom-0 z-50 transition-all duration-300",
                isCollapsed ? "w-20" : "w-64"
            )}
        >
            <div className={cn("flex h-16 items-center border-b border-gray-200", isCollapsed ? "justify-center px-0" : "px-6")}>
                <Link href="/" className="flex items-center gap-2 font-bold text-xl text-blue-600 overflow-hidden whitespace-nowrap">
                    <GraduationCap className="h-6 w-6 flex-shrink-0" />
                    {!isCollapsed && <span>School OS</span>}
                </Link>
            </div>

            <nav className="flex-1 overflow-y-auto p-4 space-y-1">
                {links.map((link: { name: string; href: string; icon: ComponentType<{ className?: string }> }) => {
                    const Icon = link.icon;
                    const isActive = pathname === link.href ||
                        (link.href !== "/" && link.href !== "/student" && link.href !== "/admin" && link.href !== "/teacher" && link.href !== "/home-class-teacher" && pathname?.startsWith(link.href));

                    return (
                        <Link
                            key={link.name}
                            href={link.href}
                            title={isCollapsed ? link.name : undefined}
                            className={cn(
                                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                                isActive
                                    ? "bg-blue-100 text-blue-700 font-semibold"
                                    : "text-gray-700 hover:bg-blue-50 hover:text-blue-600",
                                isCollapsed && "justify-center"
                            )}
                        >
                            <Icon className="h-5 w-5 flex-shrink-0" />
                            {!isCollapsed && <span className="truncate">{link.name}</span>}
                        </Link>
                    );
                })}
            </nav>

            <div className="border-t border-gray-200 p-4 space-y-2">
                <button
                    onClick={toggleSidebar}
                    className="flex w-full items-center justify-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-gray-500 hover:bg-gray-100 transition-colors"
                >
                    {isCollapsed ? <ChevronRight className="h-5 w-5" /> : (
                        <>
                            <ChevronLeft className="h-5 w-5" />
                            <span>Collapse</span>
                        </>
                    )}
                </button>
                <button
                    className={cn(
                        "flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 transition-colors",
                        isCollapsed && "justify-center"
                    )}
                >
                    <LogOut className="h-5 w-5 flex-shrink-0" />
                    {!isCollapsed && <span>Logout</span>}
                </button>
            </div>
        </aside>
    );
}
