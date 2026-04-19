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
 * Fetches a backend-served file with the auth token and returns a temporary
 * blob URL suitable for use in <img src> or <iframe src>.
 * Call URL.revokeObjectURL(url) when the component unmounts.
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
