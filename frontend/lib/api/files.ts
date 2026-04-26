import { client } from "./client";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export interface SubmissionUploadResponse {
  file_id: number;
  stored_path: string;
}

export interface GenericUploadResponse {
  stored_path: string;
}

export type UploadResponse = SubmissionUploadResponse | GenericUploadResponse;

export const filesApi = {
  /** Upload a file attached to a submission. */
  uploadSubmissionFile: (submissionId: number, file: File) => {
    const form = new FormData();
    form.append("file", file);
    return client.post<SubmissionUploadResponse>("/files/upload", form, {
      params: { resource_type: "submissions", resource_id: submissionId },
    });
  },

  /** Upload a file for any resource type (e.g. materials). */
  upload: (resourceType: string, resourceId: number, file: File) => {
    const form = new FormData();
    form.append("file", file);
    return client.post<UploadResponse>("/files/upload", form, {
      params: { resource_type: resourceType, resource_id: resourceId },
    });
  },

  /** Get a signed (or auth-gated) URL for a stored file. */
  getSignedUrl: (storedPath: string, expiresIn = 3600) =>
    client.get<{ url: string }>(`/files/${storedPath}/signed-url`, {
      params: { expires: expiresIn },
    }),
};

/**
 * Returns the best URL to use for displaying or downloading a stored file.
 *
 * Production (Supabase): calls getSignedUrl → returns an absolute Supabase URL
 * that the browser can fetch directly. No file data enters JS memory, so large
 * PDFs don't freeze the page, and the browser uses Supabase's Content-Type header
 * so PDFs render as PDFs (not raw bytes).
 *
 * Local dev: the signed-url endpoint returns a relative /files/… path that
 * requires an auth header, so we fall back to a blob URL.
 *
 * URL.revokeObjectURL() is safe to call on any URL — it's a no-op for non-blob URLs,
 * so callers don't need to branch on the type.
 */
export async function getFileUrl(storedPath: string): Promise<string> {
  try {
    const { url } = await filesApi.getSignedUrl(storedPath);
    if (url.startsWith("http")) {
      return url; // Supabase signed URL — use directly
    }
    // Local dev: relative path needs auth header → fall back to blob
  } catch {
    // signed-url endpoint unavailable → fall back to blob
  }
  return fetchFileAsBlob(storedPath);
}

/**
 * Legacy helper — loads the file into memory as a blob URL.
 * Prefer getFileUrl() for rendering; only use this when you specifically
 * need a blob (e.g. reading text/plain content).
 */
export async function fetchFileAsBlob(storedPath: string): Promise<string> {
  const token =
    typeof window !== "undefined" ? localStorage.getItem("access_token") : null;
  const res = await fetch(`${BASE_URL}/files/${storedPath}`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  if (!res.ok) throw new Error(`Failed to fetch file: ${res.status}`);
  const blob = await res.blob();
  return URL.createObjectURL(blob);
}
