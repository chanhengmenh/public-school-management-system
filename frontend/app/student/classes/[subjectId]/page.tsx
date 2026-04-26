"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import { FileText, Download, Eye, Loader2, AlertCircle } from "lucide-react";
import { materialsApi, getFileUrl, Material } from "@/lib/api";
import FilePreviewModal, { PreviewTarget } from "@/components/materials/FilePreviewModal";

function fileTypeLabel(mime: string | null): string {
  if (!mime) return "File";
  if (mime === "application/pdf") return "PDF";
  if (mime.startsWith("image/")) return "Image";
  if (mime.includes("wordprocessingml") || mime === "application/msword") return "Word";
  if (mime.includes("spreadsheetml")) return "Excel";
  if (mime === "text/plain") return "Text";
  return "File";
}

export default function StudentMaterialsPage() {
  const params = useParams();
  const subjectId = parseInt(params.subjectId as string, 10);

  const [materials, setMaterials] = useState<Material[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [preview, setPreview] = useState<PreviewTarget | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await materialsApi.list(subjectId);
      setMaterials(data);
    } catch {
      setError("Failed to load materials.");
    } finally {
      setLoading(false);
    }
  }, [subjectId]);

  useEffect(() => { load(); }, [load]);

  const handleDownload = async (filePath: string) => {
    try {
      const url = await getFileUrl(filePath);
      const a = document.createElement("a");
      a.href = url;
      a.download = filePath.split("/").pop() ?? "file";
      a.click();
      setTimeout(() => URL.revokeObjectURL(url), 10000);
    } catch {
      alert("Failed to download file.");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-3 text-slate-500">
        <AlertCircle className="h-8 w-8 text-red-400" />
        <p className="text-sm">{error}</p>
        <button onClick={load} className="text-sm text-orange-600 hover:underline">Retry</button>
      </div>
    );
  }

  if (materials.length === 0) {
    return (
      <div className="bg-white border border-dashed border-slate-300 rounded-2xl py-16 flex flex-col items-center justify-center text-center">
        <FileText className="h-10 w-10 text-slate-300 mb-3" />
        <p className="text-slate-900 font-medium">No materials yet</p>
        <p className="text-slate-500 text-sm mt-1">Your teacher hasn&apos;t uploaded any materials yet.</p>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-3">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold text-slate-900">Class Materials</h1>
          <span className="text-sm text-slate-500">{materials.length} file{materials.length !== 1 ? "s" : ""}</span>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="px-6 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Title</th>
                <th className="px-6 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Type</th>
                <th className="px-6 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Uploaded By</th>
                <th className="px-6 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Date</th>
                <th className="px-6 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {materials.map(m => (
                <tr key={m.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-orange-50 rounded-lg">
                        <FileText className="w-4 h-4 text-orange-500" />
                      </div>
                      <span className="font-medium text-slate-900 text-sm">{m.title}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-500">{fileTypeLabel(m.file_type)}</td>
                  <td className="px-6 py-4 text-sm text-slate-500">{m.uploader_name ?? "—"}</td>
                  <td className="px-6 py-4 text-sm text-slate-500">
                    {new Date(m.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 text-right">
                    {m.file_path ? (
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => setPreview({ filePath: m.file_path!, fileType: m.file_type, title: m.title })}
                          className="p-2 text-slate-400 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-colors"
                          title="Preview"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDownload(m.file_path!)}
                          className="p-2 text-slate-400 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-colors"
                          title="Download"
                        >
                          <Download className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <span className="text-slate-300 text-xs">—</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <FilePreviewModal target={preview} onClose={() => setPreview(null)} />
    </>
  );
}
