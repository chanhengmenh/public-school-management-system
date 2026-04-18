import { client } from "./client";

export interface AttendanceRecord {
  id: number;
  student_id: number;
  class_id: number;
  date: string;
  status: "present" | "absent" | "late" | "excused";
  note?: string;
}

export const attendanceApi = {
  list: (params?: { class_id?: number; student_id?: number; date?: string }) =>
    client.get<AttendanceRecord[]>("/attendance", { params }),
};
