"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { User } from "../../types/user.types";
import { usersApi } from "../../lib/api";
import { authApi, LoginRequest } from "../../lib/api/auth";
import { useRouter } from "next/navigation";
import { setCookie, deleteCookie } from "../../lib/utils";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (data: LoginRequest) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const refreshUser = async () => {
    try {
      const userData = await usersApi.getMe();
      setUser(userData);
      // Sync role to cookie for proxy/middleware
      setCookie("user_role", userData.role, 30);
    } catch (error: unknown) {
      const apiError = error as { status?: number };
      if (apiError.status === 401) {
        try {
          await authApi.refresh();
          const userData = await usersApi.getMe();
          setUser(userData);
          setCookie("user_role", userData.role, 30);
          return;
        } catch {
          // refresh cookie missing or expired — fall through to logout
        }
      }
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (token) {
      refreshUser();
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (data: LoginRequest) => {
    setLoading(true);
    try {
      await authApi.login(data);
      await refreshUser();
      router.refresh();
      // Check if password change is required before accessing the dashboard
      const me = await usersApi.getMe();
      if (me.must_change_password) {
        router.push("/change-password");
      } else {
        router.push("/");
      }
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    authApi.logout();
    setUser(null);
    router.push("/login");
    router.refresh();
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
