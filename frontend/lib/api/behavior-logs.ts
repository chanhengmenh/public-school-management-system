import { client } from "./client";

export type EventType = "keypress" | "paste" | "focus_gain" | "focus_loss" | "copy" | "cut";

export interface BehaviorLog {
  id: number;
  submission_id: number;
  student_id: number;
  event_type: EventType;
  event_data: Record<string, unknown> | null;
  client_ts: number;
}

export const behaviorLogsApi = {
  list: (params?: { submission_id?: number; student_id?: number }) =>
    client.get<BehaviorLog[]>("/behavior-logs", { params }),
};
