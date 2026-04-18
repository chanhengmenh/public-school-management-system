import { client } from "./client";
import { LoginRequest, TokenResponse, RefreshRequest, AccessTokenResponse } from "../../types/auth.types";
import { setCookie, deleteCookie } from "../utils";

export const authApi = {
  login: async (data: LoginRequest) => {
    const response = await client.post<TokenResponse>("/auth/login", data);
    if (typeof window !== "undefined") {
      localStorage.setItem("access_token", response.access_token);
      localStorage.setItem("refresh_token", response.refresh_token);
      
      // Set cookies for middleware/proxy access (30 days)
      setCookie("access_token", response.access_token, 30);
      setCookie("refresh_token", response.refresh_token, 30);
    }
    return response;
  },

  refresh: async (data: RefreshRequest) => {
    const response = await client.post<AccessTokenResponse>("/auth/refresh", data);
    if (typeof window !== "undefined") {
      localStorage.setItem("access_token", response.access_token);
      setCookie("access_token", response.access_token, 30);
    }
    return response;
  },

  logout: async () => {
    try {
      await client.post("/auth/logout");
    } catch (e) {
      console.error("Logout API call failed", e);
    } finally {
      if (typeof window !== "undefined") {
        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");
        deleteCookie("access_token");
        deleteCookie("refresh_token");
        deleteCookie("user_role");
      }
    }
  },
};
