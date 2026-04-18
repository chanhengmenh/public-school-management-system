import { client } from "./client";
import { Submission } from "../../types/school.types";

export const submissionsApi = {
  list: (params?: { assignment_id?: number; student_id?: number }) =>
    client.get<Submission[]>("/submissions", { params }),
  
  getById: (id: number) => client.get<Submission>(`/submissions/${id}`),
  
  create: (data: { assignment_id: number; content?: string; submission_type?: string }) =>
    client.post<Submission>("/submissions", data),
};
