import { client } from "./client";

export type AnnouncementTarget = "all" | "teachers" | "students";

export interface Announcement {
  id: number;
  title: string;
  body: string;
  target: AnnouncementTarget;
  class_id: number | null;
  class_name: string | null;
  author_id: number;
  author_name: string | null;
  is_pinned: boolean;
  created_at: string;
  updated_at: string;
}

export interface AnnouncementCreate {
  title: string;
  body: string;
  target?: AnnouncementTarget;
  class_id?: number | null;
  is_pinned?: boolean;
}

export interface AnnouncementUpdate {
  title?: string;
  body?: string;
  target?: AnnouncementTarget;
  class_id?: number | null;
  is_pinned?: boolean;
}

export const announcementsApi = {
  list: (params?: { skip?: number; limit?: number }) =>
    client.get<Announcement[]>("/announcements", { params }),

  getById: (id: number) =>
    client.get<Announcement>(`/announcements/${id}`),

  create: (data: AnnouncementCreate) =>
    client.post<Announcement>("/announcements", data),

  update: (id: number, data: AnnouncementUpdate) =>
    client.put<Announcement>(`/announcements/${id}`, data),

  delete: (id: number) =>
    client.delete(`/announcements/${id}`),
};
