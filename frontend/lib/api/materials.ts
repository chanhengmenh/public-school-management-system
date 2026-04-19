import { client } from "./client";

export interface Material {
  id: number;
  class_subject_id: number;
  uploader_id: number;
  uploader_name: string | null;
  title: string;
  file_path: string | null;
  file_type: string | null;
  created_at: string;
}

export const materialsApi = {
  list: (classSubjectId: number) =>
    client.get<Material[]>(`/materials/class-subjects/${classSubjectId}`),

  create: (data: { class_subject_id: number; title: string }) =>
    client.post<Material>("/materials", data),

  update: (id: number, data: { title?: string; file_path?: string; file_type?: string }) =>
    client.put<Material>(`/materials/${id}`, data),

  delete: (id: number) =>
    client.delete(`/materials/${id}`),
};
