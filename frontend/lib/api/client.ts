const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

type HttpMethod = "GET" | "POST" | "PUT" | "DELETE" | "PATCH";

interface RequestOptions extends Omit<RequestInit, 'body'> {
  params?: Record<string, string | number | boolean>;
  body?: unknown;
}

export class ApiError extends Error {
  status: number;
  data: { detail?: string; message?: string } & Record<string, unknown>;

  constructor(status: number, data: { detail?: string; message?: string } & Record<string, unknown>) {
    super(`API Error: ${status}`);
    this.status = status;
    this.data = data;
  }
}

async function request<T>(
  method: HttpMethod,
  endpoint: string,
  options: RequestOptions = {}
): Promise<T> {
  const { params, headers, body, ...rest } = options;

  const url = new URL(`${BASE_URL}${endpoint.startsWith("/") ? endpoint : `/${endpoint}`}`);
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      url.searchParams.append(key, String(value));
    });
  }

  const token = typeof window !== "undefined" ? localStorage.getItem("access_token") : null;

  const defaultHeaders: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (token) {
    defaultHeaders["Authorization"] = `Bearer ${token}`;
  }

  const config: RequestInit = {
    method,
    headers: {
      ...defaultHeaders,
      ...headers,
    },
    ...rest,
  };

  if (body && !(body instanceof FormData)) {
    config.body = JSON.stringify(body);
  } else if (body instanceof FormData) {
    // Let the browser set the Content-Type with the boundary
    if (config.headers && (config.headers as Record<string, string>)["Content-Type"]) {
      delete (config.headers as Record<string, string>)["Content-Type"];
    }
    config.body = body;
  }

  const response = await fetch(url.toString(), config);

  if (response.status === 401) {
    // Handle unauthorized - potentially trigger refresh token logic or logout
    if (typeof window !== "undefined" && !endpoint.includes("/auth/login")) {
      // For now, just clear tokens and redirect to login
      localStorage.removeItem("access_token");
      localStorage.removeItem("refresh_token");
      window.location.href = "/login";
    }
  }

  if (!response.ok) {
    let data: { detail?: string; message?: string } & Record<string, unknown>;
    try {
      data = await response.json();
    } catch {
      data = { message: "An unknown error occurred" };
    }
    throw new ApiError(response.status, data);
  }

  if (response.status === 204) {
    return {} as T;
  }

  return response.json();
}

export const client = {
  get: <T>(url: string, options?: RequestOptions) => request<T>("GET", url, options),
  post: <T>(url: string, body?: unknown, options?: RequestOptions) =>
    request<T>("POST", url, { ...options, body }),
  put: <T>(url: string, body?: unknown, options?: RequestOptions) =>
    request<T>("PUT", url, { ...options, body }),
  patch: <T>(url: string, body?: unknown, options?: RequestOptions) =>
    request<T>("PATCH", url, { ...options, body }),
  delete: <T>(url: string, options?: RequestOptions) => request<T>("DELETE", url, options),
};
