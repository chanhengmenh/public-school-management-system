import { TokenResponse, AccessTokenResponse } from "../../types/auth.types";
import { setCookie, deleteCookie } from "../utils";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export interface LoginRequest {
  email: string;
  password: string;
}

export const authApi = {
  login: async (data: LoginRequest): Promise<TokenResponse> => {
    const res = await fetch(`${BASE_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw Object.assign(new Error("Login failed"), { status: res.status, data: err });
    }
    const response: TokenResponse = await res.json();
    if (typeof window !== "undefined") {
      localStorage.setItem("access_token", response.access_token);
      setCookie("access_token", response.access_token, 1);
    }
    return response;
  },

  refresh: async (): Promise<AccessTokenResponse> => {
    const res = await fetch(`${BASE_URL}/auth/refresh`, {
      method: "POST",
      credentials: "include", // sends the HttpOnly refresh_token cookie automatically
    });
    if (!res.ok) throw Object.assign(new Error("Refresh failed"), { status: res.status });
    const response: AccessTokenResponse = await res.json();
    if (typeof window !== "undefined") {
      localStorage.setItem("access_token", response.access_token);
      setCookie("access_token", response.access_token, 1);
    }
    return response;
  },

  logout: async (): Promise<void> => {
    try {
      await fetch(`${BASE_URL}/auth/logout`, {
        method: "POST",
        credentials: "include", // clears the HttpOnly cookie server-side
      });
    } catch {
      // best-effort
    } finally {
      if (typeof window !== "undefined") {
        localStorage.removeItem("access_token");
        deleteCookie("access_token");
        deleteCookie("user_role");
      }
    }
  },
};
