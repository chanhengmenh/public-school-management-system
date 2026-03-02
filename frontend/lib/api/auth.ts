import { client } from "./client";
import { LoginRequest, TokenResponse, RefreshRequest, AccessTokenResponse } from "../../types/auth.types";

export const authApi = {
  login: async (data: LoginRequest) => {
    const response = await client.post<TokenResponse>("/auth/login", data);
    if (typeof window !== "undefined") {
      localStorage.setItem("access_token", response.access_token);
      localStorage.setItem("refresh_token", response.refresh_token);
    }
    return response;
  },

  refresh: async (data: RefreshRequest) => {
    const response = await client.post<AccessTokenResponse>("/auth/refresh", data);
    if (typeof window !== "undefined") {
      localStorage.setItem("access_token", response.access_token);
    }
    return response;
  },

  logout: async () => {
    await client.post("/auth/logout");
    if (typeof window !== "undefined") {
      localStorage.removeItem("access_token");
      localStorage.removeItem("refresh_token");
    }
  },
};
