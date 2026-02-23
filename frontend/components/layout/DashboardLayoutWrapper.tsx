"use client";

import { Sidebar } from "@/components/layout/Sidebar";
import { Topbar } from "@/components/layout/Topbar";
import { DemoRoleProvider } from "@/contexts/RoleContext";
import { useState } from "react";
import { cn } from "@/lib/utils";

export default function DashboardLayoutWrapper({
    children,
}: {
    children: React.ReactNode;
}) {
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

    return (
        <DemoRoleProvider>
            <div className="min-h-screen bg-gray-50">
                <Sidebar
                    isCollapsed={isSidebarCollapsed}
                    toggleSidebar={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
                />
                <div
                    className={cn(
                        "flex flex-col min-h-screen transition-all duration-300",
                        isSidebarCollapsed ? "md:pl-20" : "md:pl-64"
                    )}
                >
                    <Topbar />
                    <main className="flex-1 p-6 md:p-8 overflow-x-hidden">
                        {children}
                    </main>
                </div>
            </div>
        </DemoRoleProvider>
    );
}
