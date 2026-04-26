"use client";

import { useEffect, useRef, useState } from "react";
import { X, Download, Loader2, AlertCircle } from "lucide-react";
import { getFileUrl } from "@/lib/api";

export interface PreviewTarget {
  filePath: string;
  fileType: string | null;
  title: string;
}

interface Props {
  target: PreviewTarget | null;
  onClose: () => void;
}

function isPreviewable(mime: string | null): boolean {
  if (!mime) return false;
  return (
    mime === "application/pdf" ||
    mime.startsWith("image/") ||
    mime === "text/plain"
  );
}

export default function FilePreviewModal({ target, onClose }: Props) {
  const [blobUrl, setBlobUrl] = useState<string | null>(null);
  const [textContent, setTextContent] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const prevUrlRef = useRef<string | null>(null);

  useEffect(() => {
    if (!target) {
      setBlobUrl(null);
      setTextContent(null);
      setError(null);
      return;
    }

    let cancelled = false;
    setLoading(true);
    setError(null);
    setBlobUrl(null);
    setTextContent(null);

    (async () => {
      try {
        const url = await getFileUrl(target.filePath);
        if (cancelled) { URL.revokeObjectURL(url); return; }

        if (target.fileType === "text/plain") {
          const res = await fetch(url);
          const text = await res.text();
          if (!cancelled) setTextContent(text);
          URL.revokeObjectURL(url);
        } else {
          prevUrlRef.current = url;
          if (!cancelled) setBlobUrl(url);
        }
      } catch {
        if (!cancelled) setError("Failed to load file. Please try downloading instead.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
      if (prevUrlRef.current) {
        URL.revokeObjectURL(prevUrlRef.current);
        prevUrlRef.current = null;
      }
    };
  }, [target]);

  const handleDownload = async () => {
    if (!target) return;
    try {
      const url = await getFileUrl(target.filePath);
      const a = document.createElement("a");
      a.href = url;
      const filename = target.filePath.split("/").pop() ?? target.title;
      a.download = filename;
      a.click();
      setTimeout(() => URL.revokeObjectURL(url), 10000);
    } catch {
      alert("Download failed.");
    }
  };

  if (!target) return null;

  const previewable = isPreviewable(target.fileType);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="bg-white rounded-2xl shadow-2xl flex flex-col w-full max-w-4xl max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200 shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <span className="font-semibold text-slate-900 text-sm truncate">{target.title}</span>
            {target.fileType && (
              <span className="text-xs text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full shrink-0">
                {target.fileType.split("/").pop()?.toUpperCase()}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2 shrink-0 ml-4">
            <button
              onClick={handleDownload}
              className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-600 hover:text-orange-600 bg-slate-100 hover:bg-orange-50 px-3 py-1.5 rounded-lg transition-colors"
            >
              <Download className="w-3.5 h-3.5" /> Download
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-hidden flex items-center justify-center bg-slate-50 rounded-b-2xl min-h-[400px]">
          {loading && (
            <div className="flex flex-col items-center gap-3 text-slate-400">
              <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
              <p className="text-sm">Loading preview…</p>
            </div>
          )}

          {error && (
            <div className="flex flex-col items-center gap-3 text-slate-500 p-8 text-center">
              <AlertCircle className="w-8 h-8 text-red-400" />
              <p className="text-sm">{error}</p>
              <button
                onClick={handleDownload}
                className="mt-2 inline-flex items-center gap-1.5 text-sm font-medium text-orange-600 hover:underline"
              >
                <Download className="w-4 h-4" /> Download instead
              </button>
            </div>
          )}

          {!loading && !error && !previewable && (
            <div className="flex flex-col items-center gap-3 text-slate-500 p-8 text-center">
              <p className="text-sm font-medium text-slate-700">Preview not available for this file type.</p>
              <p className="text-xs text-slate-400">Download the file to view it in its native application.</p>
              <button
                onClick={handleDownload}
                className="mt-2 inline-flex items-center gap-1.5 text-sm font-medium text-orange-600 hover:underline"
              >
                <Download className="w-4 h-4" /> Download
              </button>
            </div>
          )}

          {!loading && !error && previewable && blobUrl && target.fileType === "application/pdf" && (
            <iframe
              src={blobUrl}
              className="w-full h-full rounded-b-2xl"
              style={{ minHeight: "500px" }}
              title={target.title}
            />
          )}

          {!loading && !error && previewable && blobUrl && target.fileType?.startsWith("image/") && (
            <div className="p-6 flex items-center justify-center w-full h-full overflow-auto">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={blobUrl}
                alt={target.title}
                className="max-w-full max-h-full object-contain rounded-lg shadow"
              />
            </div>
          )}

          {!loading && !error && textContent !== null && (
            <div className="w-full h-full overflow-auto p-6">
              <pre className="text-xs text-slate-700 font-mono whitespace-pre-wrap break-words leading-relaxed">
                {textContent}
              </pre>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
