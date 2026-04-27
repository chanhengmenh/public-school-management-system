import { client } from "./client";

export type NotificationType = "announcement" | "assignment" | "alert" | "grade" | "general";

export interface Notification {
  id: number;
  user_id: number;
  title: string;
  message: string;
  type: NotificationType;
  sender: string | null;
  is_read: boolean;
  created_at: string;
}

export const notificationsApi = {
  list: (params?: { is_read?: boolean; skip?: number; limit?: number }) =>
    client.get<Notification[]>("/notifications", { params }),

  unreadCount: () =>
    client.get<{ count: number }>("/notifications/unread-count"),

  create: (data: {
    user_id: number;
    title: string;
    message: string;
    type?: NotificationType;
    sender?: string;
  }) => client.post<Notification>("/notifications", data),

  markAsRead: (id: number) =>
    client.put<Notification>(`/notifications/${id}/read`),

  markAllAsRead: () =>
    client.put<{ message: string }>("/notifications/read-all"),

  delete: (id: number) =>
    client.delete(`/notifications/${id}`),

  broadcast: (data: { class_subject_id: number; title: string; message: string }) =>
    client.post<{ sent: number }>("/notifications/broadcast", data),
};
