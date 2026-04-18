import { client } from "./client";
import { Subject } from "../../types/school.types";

export const subjectsApi = {
  list: () => client.get<Subject[]>("/subjects"),
  getById: (id: number) => client.get<Subject>(`/subjects/${id}`),
  create: (data: Omit<Subject, "id">) => client.post<Subject>("/subjects", data),
  update: (id: number, data: Partial<Omit<Subject, "id">>) => client.put<Subject>(`/subjects/${id}`, data),
  delete: (id: number) => client.delete(`/subjects/${id}`),
};
