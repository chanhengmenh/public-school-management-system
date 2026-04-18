import { client } from "./client";

export interface Schedule {
  id: number;
  class_subject_id: number;
  day_of_week: string;
  start_time: string; // "HH:MM:SS"
  end_time: string;
  room: string | null;
  subject_name: string | null;
  class_name: string | null;
  teacher_name: string | null;
}

export const schedulesApi = {
  list: (params?: {
    class_subject_id?: number;
    class_id?: number;
    teacher_id?: number;
    day_of_week?: string;
  }) => client.get<Schedule[]>("/schedules", { params }),

  getById: (id: number) => client.get<Schedule>(`/schedules/${id}`),

  create: (data: {
    class_subject_id: number;
    day_of_week: string;
    start_time: string;
    end_time: string;
    room?: string;
  }) => client.post<Schedule>("/schedules", data),

  update: (
    id: number,
    data: {
      day_of_week?: string;
      start_time?: string;
      end_time?: string;
      room?: string;
    }
  ) => client.put<Schedule>(`/schedules/${id}`, data),

  delete: (id: number) => client.delete(`/schedules/${id}`),
};
