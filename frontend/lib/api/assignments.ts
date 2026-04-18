import { client } from "./client";
import { Assignment } from "../../types/school.types";

export const assignmentsApi = {
  list: (params?: { class_subject_id?: number; class_id?: number }) =>
    client.get<Assignment[]>("/assignments", { params }),
  
  getById: (id: number) => client.get<Assignment>(`/assignments/${id}`),
  
  create: (data: Partial<Assignment>) => client.post<Assignment>("/assignments", data),
  
  publish: (id: number) => client.post<Assignment>(`/assignments/${id}/publish`),
  
  update: (id: number, data: Partial<Assignment>) => client.put<Assignment>(`/assignments/${id}`, data),
  
  delete: (id: number) => client.delete(`/assignments/${id}`),
};
