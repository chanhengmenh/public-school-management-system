"use client";

import Link from "next/link";
import { navigation } from "@/lib/navigation";
import { cn } from "@/lib/utils";
import { GraduationCap, LogOut, ChevronLeft, ChevronRight } from "lucide-react";
import { Role } from "@/types";
import type { ComponentType } from "react";

import { usePathname } from "next/navigation";
import { useRole } from "@/contexts/RoleContext";

interface SidebarProps {
    isCollapsed: boolean;
    toggleSidebar: () => void;
}

export function Sidebar({ isCollapsed, toggleSidebar }: SidebarProps) {
    const pathname = usePathname();
    const { isMonitor } = useRole();

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
                {/* Check if links have groups (Student role) or flat list (Others) */}
                {(links.length > 0 && "group" in links[0]) ? (
                    // Grouped Navigation
                    (links as any[]).map((group) => (
                        <div key={group.group} className="mb-6">
                            {!isCollapsed && (
                                <h3 className="px-3 mb-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                    {group.group}
                                </h3>
                            )}
                            <div className="space-y-1">
                                {group.items
                                    .filter((link: any) => !link.requiresMonitor || isMonitor)
                                    .map((link: { name: string; href: string; icon: ComponentType<{ className?: string }>; color?: string; badge?: string }) => {
                                        const Icon = link.icon;
                                        const isActive = pathname === link.href ||
                                            (link.href !== "/" && link.href !== "/student" && link.href !== "/admin" && link.href !== "/teacher" && link.href !== "/home-class-teacher" && pathname?.startsWith(link.href));

                                        return (
                                            <Link
                                                key={link.name}
                                                href={link.href}
                                                title={isCollapsed ? link.name : undefined}
                                                className={cn(
                                                    "flex items-center rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                                                    isActive
                                                        ? "bg-blue-100 text-blue-700 font-semibold"
                                                        : "text-gray-700 hover:bg-blue-50 hover:text-blue-600",
                                                    isCollapsed ? "justify-center" : "justify-between"
                                                )}
                                            >
                                                <div className={cn("flex items-center gap-3", isCollapsed ? "justify-center" : "truncate")}>
                                                    <Icon className={cn("h-5 w-5 flex-shrink-0", !isActive && link.color)} />
                                                    {!isCollapsed && <span className="truncate">{link.name}</span>}
                                                </div>
                                                {!isCollapsed && link.badge && (
                                                    <span className="inline-flex items-center rounded-md bg-amber-100 px-2 py-1 text-xs font-medium text-amber-700 ring-1 ring-inset ring-amber-600/20">
                                                        {link.badge}
                                                    </span>
                                                )}
                                            </Link>
                                        );
                                    })}
                            </div>
                        </div>
                    ))
                ) : (
                    // Flat Navigation (Legacy for other roles)
                    (links as any[]).map((link: { name: string; href: string; icon: ComponentType<{ className?: string }> }) => {
                        const Icon = link.icon;
                        const isActive = pathname === link.href ||
                            (link.href !== "/" && link.href !== "/student" && link.href !== "/admin" && link.href !== "/teacher" && link.href !== "/home-class-teacher" && pathname?.startsWith(link.href));

                        return (
                            <Link
                                key={link.name}
                                href={link.href}
                                title={isCollapsed ? link.name : undefined}
                                className={cn(
                                    "flex items-center rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                                    isActive
                                        ? "bg-blue-100 text-blue-700 font-semibold"
                                        : "text-gray-700 hover:bg-blue-50 hover:text-blue-600",
                                    isCollapsed ? "justify-center" : "gap-3"
                                )}
                            >
                                <Icon className="h-5 w-5 flex-shrink-0" />
                                {!isCollapsed && <span className="truncate">{link.name}</span>}
                            </Link>
                        );
                    })
                )}
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
