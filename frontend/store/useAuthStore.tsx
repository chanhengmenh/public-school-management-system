'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';

// ─── Types ───────────────────────────────────────────────────────────

export interface AuthUser {
  id: string;
  role: 'student' | 'teacher' | 'admin';
  subRole: string;
  classId: string;
}

interface AuthStoreContextType {
  user: AuthUser | null;
  setUser: (user: AuthUser | null) => void;
}

const AuthStoreContext = createContext<AuthStoreContextType | undefined>(undefined);

// ─── Cookie helpers ──────────────────────────────────────────────────

function getCookie(name: string): string | null {
  if (typeof document === 'undefined') return null;
  const match = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : null;
}

// ─── Provider ────────────────────────────────────────────────────────

export function AuthStoreProvider({ children }: { children: React.ReactNode }) {
  const [user, setUserState] = useState<AuthUser | null>(null);

  // Hydrate from cookies on mount
  useEffect(() => {
    const role = getCookie('mock_role') as AuthUser['role'] | null;
    const subRole = getCookie('mock_sub_role') ?? 'normal';
    const studentId = getCookie('mock_student_id') ?? 'alex_id';
    
    // Infer classId
    let classId = 'class_11A'; // Default Alex
    if (studentId === 'sarah_id') {
      classId = 'class_10B';
    }

    if (role) {
      setUserState({
        id: role === 'student' ? studentId : `${role}_default`,
        role,
        subRole,
        classId,
      });
    }
  }, []);

  const setUser = useCallback((u: AuthUser | null) => {
    setUserState(u);
  }, []);

  const value = useMemo(() => ({ user, setUser }), [user, setUser]);

  return (
    <AuthStoreContext.Provider value={value}>
      {children}
    </AuthStoreContext.Provider>
  );
}

// ─── Hook ────────────────────────────────────────────────────────────

export function useAuthStore(): AuthStoreContextType {
  const context = useContext(AuthStoreContext);
  if (!context) {
    throw new Error('useAuthStore must be used within an AuthStoreProvider');
  }
  return context;
}