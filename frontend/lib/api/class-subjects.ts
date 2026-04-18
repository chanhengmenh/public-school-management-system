import { client } from "./client";
import { ClassSubject } from "../../types/school.types";

export const classSubjectsApi = {
  list: (params?: { class_id?: number; teacher_id?: number }) =>
    client.get<ClassSubject[]>("/class-subjects", { params }),
  getById: (id: number) => client.get<ClassSubject>(`/class-subjects/${id}`),
};
