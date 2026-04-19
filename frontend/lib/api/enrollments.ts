import { client } from "./client";
import { Enrollment } from "../../types/school.types";

export const enrollmentsApi = {
  list: (params?: { class_id?: number; student_id?: number }) =>
    client.get<Enrollment[]>("/enrollments", { params }),

  create: (data: { class_id: number; student_id: number }) =>
    client.post<Enrollment>("/enrollments", data),

  delete: (id: number) => client.delete(`/enrollments/${id}`),
};
