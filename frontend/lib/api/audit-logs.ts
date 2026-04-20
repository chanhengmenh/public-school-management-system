import { client } from "./client";

export interface AuditLog {
  id: number;
  actor_id: number;
  actor_name: string | null;
  action: string;
  resource_type: string;
  resource_id: number | null;
  detail: string | null;
  payload: { before?: Record<string, unknown>; after?: Record<string, unknown> } | null;
  created_at: string;
}

export const auditLogsApi = {
  list: (params?: { action?: string; resource_type?: string; skip?: number; limit?: number }) =>
    client.get<AuditLog[]>("/audit-logs", { params }),
};
