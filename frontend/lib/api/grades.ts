import { client } from "./client";

export interface Grade {
  id: number;
  submission_id: number;
  score: number;
  feedback?: string;
  graded_by: number;
  graded_at: string;
}

export const gradesApi = {
  list: (params?: { student_id?: number; assignment_id?: number; class_id?: number }) =>
    client.get<Grade[]>("/grades", { params }),
  create: (data: { submission_id: number; score: number; feedback?: string }) =>
    client.post<Grade>("/grades", data),
  update: (id: number, data: { score?: number; feedback?: string }) =>
    client.put<Grade>(`/grades/${id}`, data),
};
