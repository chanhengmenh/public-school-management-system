import { client } from "./client";
import { User, UserCreate, UserUpdate } from "../../types/user.types";

export const usersApi = {
  list: (params?: { skip?: number; limit?: number }) =>
    client.get<User[]>("/users", { params }),

  create: (data: UserCreate) => client.post<User>("/users", data),

  getMe: () => client.get<User>("/users/me"),

  getById: (id: number) => client.get<User>(`/users/${id}`),

  update: (id: number, data: UserUpdate) => client.put<User>(`/users/${id}`, data),

  delete: (id: number) => client.delete(`/users/${id}`),
};
