"use client";

import React, { createContext, useContext, useState, ReactNode } from 'react';

type Role = "student" | "class_monitor";

interface User {
    id: string;
    name: string;
    role: Role;
}

interface RoleContextType {
    user: User;
    role: Role;
    isMonitor: boolean;
    setRole: (role: Role) => void;
}

const RoleContext = createContext<RoleContextType | undefined>(undefined);

export function DemoRoleProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User>({
        id: "S001",
        name: "Preap Sovath",
        role: "student",
    });

    const setRole = (newRole: Role) => {
        setUser(prev => ({ ...prev, role: newRole }));
    };

    return (
        <RoleContext.Provider value={{
            user,
            role: user.role,
            isMonitor: user.role === "class_monitor",
            setRole
        }}>
            {children}
        </RoleContext.Provider>
    );
}

export function useRole() {
    const context = useContext(RoleContext);
    if (context === undefined) {
        throw new Error("useRole must be used within a DemoRoleProvider");
    }
    return context;
}
