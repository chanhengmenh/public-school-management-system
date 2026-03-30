'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';

// ─── Types ───────────────────────────────────────────────────────────

export interface AuthUser {
  id: string;
  role: 'student' | 'teacher' | 'admin';
  subRole: string;
  classId: string;
  homeClass?: {
    id: string;
    name: string;
  } | null;
}

interface AuthStoreContextType {
  user: AuthUser | null;
  setUser: (user: AuthUser | null) => void;
  isHydrated: boolean;
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
  const [isHydrated, setIsHydrated] = useState(false);

  // Hydrate from cookies on mount
  useEffect(() => {
    // ---- HARDCODED TEACHER LOGIN FOR TESTING ----
    // To test specific roles, you can uncomment these blocks:
    
    // Block 1: Home-Class Teacher (Ms. Jean)
    // setUserState({
    //   id: 'teacher_002',
    //   role: 'teacher',
    //   subRole: 'home_teacher',
    //   classId: '',
    //   homeClass: { id: 'class_10A', name: '10-A' },
    // });
    // return; // Bypass cookie logic below temporarily

    // Block 2: Subject Teacher (Mr. Tan)
    // setUserState({ 
    //   id: 'teacher_001', 
    //   role: 'teacher', 
    //   subRole: 'normal', 
    //   classId: '', 
    //   homeClass: null 
    // });
    // return; // Bypass cookie logic below temporarily
    // ---------------------------------------------

    const role = getCookie('mock_role') as AuthUser['role'] | null;
    const subRole = getCookie('mock_sub_role') ?? 'normal';
    const studentId = getCookie('mock_student_id') ?? 'alex_id';
    
    // Infer classId
    let classId = 'class_11A'; // Default Alex
    if (studentId === 'sarah_id') {
      classId = 'class_10B';
    }

    if (role) {
      let teacherId = `${role}_default`;
      let homeClass = null;

      if (role === 'teacher') {
        if (subRole === 'home_teacher') {
          teacherId = 'teacher_002';
          homeClass = { id: 'class_10A', name: '10-A' };
        } else {
          teacherId = 'teacher_001';
        }
      }

      setUserState({
        id: role === 'student' ? studentId : teacherId,
        role: role as AuthUser['role'],
        subRole,
        classId,
        homeClass,
      });
    }

    setIsHydrated(true);
  }, []);

  const setUser = useCallback((u: AuthUser | null) => {
    setUserState(u);
  }, []);

  const value = useMemo(() => ({ user, setUser, isHydrated }), [user, setUser, isHydrated]);

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