import { client } from "./client";

export interface UploadResponse {
  file_id: number;
  stored_path: string;
}

export const filesApi = {
  upload: (submissionId: number, file: File) => {
    const form = new FormData();
    form.append("file", file);
    return client.post<UploadResponse>("/files/upload", form, {
      params: { submission_id: submissionId },
    });
  },
};

/**
 * Fetches a backend-served file with the auth token and returns a temporary
 * blob URL suitable for use in <img src> or <iframe src>.
 * Call URL.revokeObjectURL(url) when the component unmounts.
 */
export async function fetchFileAsBlob(storedPath: string): Promise<string> {
  const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
  const token =
    typeof window !== "undefined" ? localStorage.getItem("access_token") : null;
  const res = await fetch(`${BASE_URL}/files/${storedPath}`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  if (!res.ok) throw new Error(`Failed to fetch file: ${res.status}`);
  const blob = await res.blob();
  return URL.createObjectURL(blob);
}
