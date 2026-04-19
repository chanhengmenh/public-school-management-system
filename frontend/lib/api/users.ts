import { client } from "./client";
import { User, UserCreate, UserUpdate } from "../../types/user.types";

export const usersApi = {
  list: (params?: { skip?: number; limit?: number }) =>
    client.get<User[]>("/users", { params }),

  create: (data: UserCreate) => client.post<User>("/users", data),

  getMe: () => client.get<User>("/users/me"),

  updateMe: (data: { full_name?: string; email?: string; password?: string }) =>
    client.put<User>("/users/me", data),

  getById: (id: number) => client.get<User>(`/users/${id}`),

  update: (id: number, data: UserUpdate) => client.put<User>(`/users/${id}`, data),

  delete: (id: number) => client.delete(`/users/${id}`),

  resetPassword: (id: number) =>
    client.post<{ message: string; temp_password: string }>(
      `/users/${id}/reset-password`
    ),

  importCsv: (file: File, role: string = "student", academicYear: string = "2025-2026") => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("role", role);
    formData.append("academic_year", academicYear);
    return client.post<{
      created: number;
      skipped: number;
      errors: number;
      created_rows: Array<{ row: number; full_name: string; email: string; temp_password: string; class_name: string | null }>;
      skipped_rows: Array<{ row: number; full_name: string; email: string; reason: string }>;
      error_rows: Array<{ row: number; reason: string }>;
    }>("/users/import", formData);
  },
};
