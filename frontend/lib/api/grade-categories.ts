import { client } from "./client";
import { GradeCategory } from "../../types/school.types";

export const gradeCategoriesApi = {
  list: (params: { class_subject_id: number }) =>
    client.get<GradeCategory[]>("/grade-categories", { params }),

  create: (data: Omit<GradeCategory, "id">) =>
    client.post<GradeCategory>("/grade-categories", data),

  update: (id: number, data: Partial<Pick<GradeCategory, "name" | "weight">>) =>
    client.put<GradeCategory>(`/grade-categories/${id}`, data),

  delete: (id: number) => client.delete(`/grade-categories/${id}`),
};
