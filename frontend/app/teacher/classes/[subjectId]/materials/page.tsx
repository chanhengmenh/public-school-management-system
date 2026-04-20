"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useParams } from "next/navigation";
import { Upload, FileText, Trash2, Download, Loader2, AlertCircle, X, CheckCircle2, Eye } from "lucide-react";
import { materialsApi, filesApi, fetchFileAsBlob, Material } from "@/lib/api";
import FilePreviewModal, { PreviewTarget } from "@/components/materials/FilePreviewModal";

const ACCEPTED_MIME = [
  "application/pdf",
  "image/jpeg", "image/png", "image/gif",
  "text/plain",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
];

function fileTypeLabel(mime: string | null): string {
  if (!mime) return "File";
  if (mime === "application/pdf") return "PDF";
  if (mime.startsWith("image/")) return "Image";
  if (mime.includes("wordprocessingml") || mime === "application/msword") return "Word";
  if (mime.includes("spreadsheetml")) return "Excel";
  if (mime === "text/plain") return "Text";
  return "File";
}

interface FileEntry {
  file: File;
  title: string;
  status: "pending" | "uploading" | "done" | "error";
}

export default function TeacherMaterialsPage() {
  const params = useParams();
  const subjectId = parseInt(params.subjectId as string, 10);

  const [materials, setMaterials] = useState<Material[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [preview, setPreview] = useState<PreviewTarget | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [entries, setEntries] = useState<FileEntry[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  const openModal = () => {
    setEntries([]);
    setUploadError(null);
    setShowModal(true);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    const invalid = files.find(f => !ACCEPTED_MIME.includes(f.type));
    if (invalid) {
      setUploadError(`"${invalid.name}" is not an allowed file type.`);
      e.target.value = "";
      return;
    }
    setUploadError(null);
    setEntries(prev => [
      ...prev,
      ...files.map(f => ({ file: f, title: f.name.replace(/\.[^/.]+$/, ""), status: "pending" as const })),
    ]);
    e.target.value = "";
  };

  const removeEntry = (idx: number) => {
    setEntries(prev => prev.filter((_, i) => i !== idx));
  };

  const updateTitle = (idx: number, value: string) => {
    setEntries(prev => prev.map((e, i) => i === idx ? { ...e, title: value } : e));
  };

  const handleSubmit = async () => {
    if (entries.length === 0) { setUploadError("Please select at least one file."); return; }
    const emptyTitle = entries.find(e => !e.title.trim());
    if (emptyTitle) { setUploadError("All files must have a title."); return; }

    setUploading(true);
    setUploadError(null);
    let anyError = false;

    for (let i = 0; i < entries.length; i++) {
      setEntries(prev => prev.map((e, idx) => idx === i ? { ...e, status: "uploading" } : e));
      try {
        const material = await materialsApi.create({ class_subject_id: subjectId, title: entries[i].title.trim() });
        const uploadRes = await filesApi.upload("materials", material.id, entries[i].file);
        await materialsApi.update(material.id, { file_path: uploadRes.stored_path, file_type: entries[i].file.type });
        setEntries(prev => prev.map((e, idx) => idx === i ? { ...e, status: "done" } : e));
      } catch {
        setEntries(prev => prev.map((e, idx) => idx === i ? { ...e, status: "error" } : e));
        anyError = true;
      }
    }

    setUploading(false);
    if (anyError) {
      setUploadError("Some files failed to upload. Successful ones were saved.");
    } else {
      setShowModal(false);
    }
    load();
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Delete this material?")) return;
    try {
      await materialsApi.delete(id);
      setMaterials(prev => prev.filter(m => m.id !== id));
    } catch {
      alert("Failed to delete material.");
    }
  };

  const handleDownload = async (filePath: string) => {
    try {
      const url = await fetchFileAsBlob(filePath);
      const a = document.createElement("a");
      a.href = url;
      a.download = filePath.split("/").pop() ?? "file";
      a.click();
      setTimeout(() => URL.revokeObjectURL(url), 10000);
    } catch {
      alert("Failed to download file.");
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Class Materials</h1>
          <p className="text-slate-500 text-sm mt-0.5">Upload lecture notes, slides, and resources</p>
        </div>
        <button
          onClick={openModal}
          className="inline-flex items-center gap-2 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white text-sm font-medium rounded-xl transition-colors"
        >
          <Upload className="w-4 h-4" /> Upload Material
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
        </div>
      ) : error ? (
        <div className="flex flex-col items-center justify-center py-16 gap-3 text-slate-500">
          <AlertCircle className="h-8 w-8 text-red-400" />
          <p className="text-sm">{error}</p>
          <button onClick={load} className="text-sm text-orange-600 hover:underline">Retry</button>
        </div>
      ) : materials.length === 0 ? (
        <div className="bg-white border border-dashed border-slate-300 rounded-2xl py-16 flex flex-col items-center justify-center text-center">
          <FileText className="h-10 w-10 text-slate-300 mb-3" />
          <p className="text-slate-900 font-medium">No materials yet</p>
          <p className="text-slate-500 text-sm mt-1">Upload your first file using the button above.</p>
        </div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="px-6 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Title</th>
                <th className="px-6 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Type</th>
                <th className="px-6 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Uploaded</th>
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
                  <td className="px-6 py-4 text-sm text-slate-500">
                    {new Date(m.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      {m.file_path && (
                        <>
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
                        </>
                      )}
                      <button
                        onClick={() => handleDelete(m.id)}
                        className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <FilePreviewModal target={preview} onClose={() => setPreview(null)} />

      {/* Upload Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg mx-4 p-6 max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-slate-900">Upload Materials</h2>
              <button onClick={() => !uploading && setShowModal(false)} className="text-slate-400 hover:text-slate-600 disabled:opacity-40" disabled={uploading}>
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Drop zone */}
            <div
              onClick={() => !uploading && fileInputRef.current?.click()}
              className="border-2 border-dashed border-slate-200 rounded-xl p-6 text-center cursor-pointer hover:border-orange-400 hover:bg-orange-50/30 transition-colors mb-4 shrink-0"
            >
              <Upload className="w-6 h-6 text-slate-400 mx-auto mb-2" />
              <p className="text-sm text-slate-500">Click to browse — select multiple files</p>
              <p className="text-xs text-slate-400 mt-1">PDF, Word, Excel, Image, Text (max 20 MB each)</p>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept={ACCEPTED_MIME.join(",")}
              onChange={handleFileChange}
              className="hidden"
            />

            {/* File list with editable titles */}
            {entries.length > 0 && (
              <div className="overflow-y-auto flex-1 space-y-2 mb-4 pr-1">
                {entries.map((entry, idx) => (
                  <div key={idx} className="flex items-center gap-2 bg-slate-50 rounded-lg px-3 py-2">
                    <div className="shrink-0">
                      {entry.status === "uploading" && <Loader2 className="w-4 h-4 animate-spin text-orange-500" />}
                      {entry.status === "done" && <CheckCircle2 className="w-4 h-4 text-green-500" />}
                      {entry.status === "error" && <AlertCircle className="w-4 h-4 text-red-500" />}
                      {entry.status === "pending" && <FileText className="w-4 h-4 text-slate-400" />}
                    </div>
                    <input
                      type="text"
                      value={entry.title}
                      onChange={e => updateTitle(idx, e.target.value)}
                      disabled={uploading}
                      className="flex-1 text-sm bg-transparent border-b border-slate-200 focus:border-orange-400 focus:outline-none py-0.5 text-slate-800 placeholder:text-slate-400"
                      placeholder="Material title"
                    />
                    <span className="text-xs text-slate-400 shrink-0">{fileTypeLabel(entry.file.type)}</span>
                    {!uploading && (
                      <button onClick={() => removeEntry(idx)} className="shrink-0 text-slate-300 hover:text-red-400">
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}

            {uploadError && (
              <p className="text-sm text-red-600 flex items-center gap-1 mb-3 shrink-0">
                <AlertCircle className="w-4 h-4 shrink-0" /> {uploadError}
              </p>
            )}

            <div className="flex justify-end gap-3 shrink-0">
              <button
                onClick={() => setShowModal(false)}
                disabled={uploading}
                className="px-4 py-2 text-sm text-slate-600 hover:text-slate-800 font-medium disabled:opacity-40"
              >
                {uploading ? "Close when done" : "Cancel"}
              </button>
              <button
                onClick={handleSubmit}
                disabled={uploading || entries.length === 0}
                className="inline-flex items-center gap-2 px-4 py-2 bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white text-sm font-medium rounded-xl transition-colors"
              >
                {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                {uploading
                  ? `Uploading ${entries.filter(e => e.status === "done").length}/${entries.length}…`
                  : `Upload ${entries.length > 0 ? `${entries.length} ` : ""}File${entries.length !== 1 ? "s" : ""}`}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
