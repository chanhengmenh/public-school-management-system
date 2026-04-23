import { client } from "./client";
import { Submission } from "../../types/school.types";

export interface TelemetryCreate {
  typed_chars: number;
  paste_count: number;
  pasted_chars: number;
  keystroke_count: number;
  active_typing_seconds: number;
  avg_wpm: number | null;
}

export interface TelemetryRead extends TelemetryCreate {
  id: number;
  submission_id: number;
  student_id: number;
  recorded_at: string;
}

export const submissionsApi = {
  list: (params?: { assignment_id?: number; student_id?: number }) =>
    client.get<Submission[]>("/submissions", { params }),

  getById: (id: number) => client.get<Submission>(`/submissions/${id}`),

  create: (data: { assignment_id: number; content?: string; submission_type?: string }) =>
    client.post<Submission>("/submissions", data),

  saveTelemetry: (submissionId: number, data: TelemetryCreate) =>
    client.post<TelemetryRead>(`/submissions/${submissionId}/telemetry`, data),

  getTelemetry: (submissionId: number) =>
    client.get<TelemetryRead>(`/submissions/${submissionId}/telemetry`),
};
