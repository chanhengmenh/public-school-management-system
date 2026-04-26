'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import {
    Loader2, AlertCircle, ChevronLeft, CheckCircle2, Clock,
    Send, Lock, Upload, FileText, Image, File, X, Download,
} from 'lucide-react';
import { useAuth } from '@/components/auth/AuthProvider';
import { assignmentsApi, submissionsApi, gradesApi, filesApi, getFileUrl } from '@/lib/api';
import { Grade } from '@/lib/api/grades';
import { Assignment, Submission, SubmissionFile } from '@/types/school.types';

// ─── Allowed MIME types (mirrors backend ALLOWED_TYPES) ────────────────────
const ACCEPTED_MIME = [
    'application/pdf',
    'image/jpeg',
    'image/png',
    'image/gif',
    'text/plain',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
];
const ACCEPTED_EXTENSIONS = '.pdf,.jpg,.jpeg,.png,.gif,.txt,.doc,.docx,.xlsx';

type SubmissionMode = 'text' | 'file' | 'both';

function formatBytes(bytes: number) {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

// ─── Inline file viewer (fetches with auth token, renders blob URL) ─────────
function FileViewer({ file }: { file: SubmissionFile }) {
    const [blobUrl, setBlobUrl] = useState<string | null>(null);
    const [loadErr, setLoadErr] = useState(false);

    useEffect(() => {
        let url: string | null = null;
        let cancelled = false;
        (async () => {
            try {
                const signedOrBlob = await getFileUrl(file.file_url);
                const res = await fetch(signedOrBlob);
                if (!res.ok) throw new Error(`HTTP ${res.status}`);
                const buf = await res.arrayBuffer();
                if (cancelled) return;
                const blob = new Blob([buf], { type: file.file_type || "application/octet-stream" });
                url = URL.createObjectURL(blob);
                setBlobUrl(url);
            } catch {
                if (!cancelled) setLoadErr(true);
            }
        })();
        return () => { cancelled = true; if (url) URL.revokeObjectURL(url); };
    }, [file.file_url, file.file_type]);

    const isImage = file.file_type?.startsWith('image/');
    const isPdf = file.file_type === 'application/pdf';
    const name = file.original_filename ?? 'file';

    if (loadErr) {
        return (
            <div className="flex items-center gap-2 p-3 bg-red-50 rounded-xl text-red-600 text-sm">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>Could not load file preview.</span>
            </div>
        );
    }

    if (!blobUrl) {
        return (
            <div className="flex items-center gap-2 p-3 text-slate-400 text-sm">
                <Loader2 className="w-4 h-4 animate-spin" /> Loading preview…
            </div>
        );
    }

    if (isImage) {
        return (
            <div className="rounded-xl overflow-hidden border border-slate-100">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={blobUrl} alt={name} className="max-w-full max-h-[500px] object-contain" />
            </div>
        );
    }

    if (isPdf) {
        return (
            <div className="rounded-xl overflow-hidden border border-slate-100">
                <iframe src={blobUrl} title={name} className="w-full h-[520px]" />
            </div>
        );
    }

    return (
        <a
            href={blobUrl}
            download={name}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-sm font-medium transition-colors"
        >
            <Download className="w-4 h-4" />
            Download {name}
        </a>
    );
}

// ─── File icon by type ───────────────────────────────────────────────────────
function FileTypeIcon({ mime }: { mime?: string }) {
    if (mime?.startsWith('image/')) return <Image className="w-5 h-5 text-purple-500" />;
    if (mime === 'application/pdf') return <FileText className="w-5 h-5 text-red-500" />;
    return <File className="w-5 h-5 text-blue-500" />;
}

// ─── Status badge ────────────────────────────────────────────────────────────
function StatusBadge({ status }: { status: Assignment['status'] }) {
    const map: Record<Assignment['status'], { cls: string; label: string }> = {
        draft: { cls: 'bg-slate-100 text-slate-600', label: 'Draft' },
        published: { cls: 'bg-emerald-50 text-emerald-700', label: 'Open' },
        closed: { cls: 'bg-red-50 text-red-700', label: 'Closed' },
    };
    const { cls, label } = map[status];
    return (
        <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold ${cls}`}>
            {label}
        </span>
    );
}

// ─── Telemetry tracking hook ─────────────────────────────────────────────────
function useTelemetry() {
    const state = useRef({
        typed_chars: 0,
        paste_count: 0,
        pasted_chars: 0,
        keystroke_count: 0,
        active_typing_ms: 0,
        windowStart: null as number | null,
        isPasting: false,
        prevLength: 0,
    });
    const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const closeWindow = useCallback(() => {
        const t = state.current;
        if (t.windowStart !== null) {
            t.active_typing_ms += Date.now() - t.windowStart;
            t.windowStart = null;
        }
    }, []);

    const reset = useCallback(() => {
        if (timerRef.current) clearTimeout(timerRef.current);
        state.current = {
            typed_chars: 0,
            paste_count: 0,
            pasted_chars: 0,
            keystroke_count: 0,
            active_typing_ms: 0,
            windowStart: null,
            isPasting: false,
            prevLength: 0,
        };
    }, []);

    const onKeyDown = useCallback((e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (['Control', 'Alt', 'Shift', 'Meta', 'CapsLock'].includes(e.key)) return;
        const t = state.current;
        t.keystroke_count++;
        if (t.windowStart === null) t.windowStart = Date.now();
        if (timerRef.current) clearTimeout(timerRef.current);
        timerRef.current = setTimeout(closeWindow, 2000);
    }, [closeWindow]);

    const onPaste = useCallback((e: React.ClipboardEvent<HTMLTextAreaElement>) => {
        const t = state.current;
        t.paste_count++;
        t.isPasting = true;
        const pasted = e.clipboardData.getData('text') ?? '';
        t.pasted_chars += pasted.length;
    }, []);

    const onChange = useCallback((
        e: React.ChangeEvent<HTMLTextAreaElement>,
        setter: (v: string) => void,
    ) => {
        const t = state.current;
        const newLen = e.target.value.length;
        const delta = newLen - t.prevLength;
        if (!t.isPasting && delta > 0) t.typed_chars += delta;
        t.isPasting = false;
        t.prevLength = newLen;
        setter(e.target.value);
    }, []);

    const collect = useCallback(() => {
        closeWindow();
        const t = state.current;
        const active_typing_seconds = t.active_typing_ms / 1000;
        const avg_wpm = active_typing_seconds > 5
            ? Math.round((t.typed_chars / 5) / (active_typing_seconds / 60))
            : null;
        return {
            typed_chars: t.typed_chars,
            paste_count: t.paste_count,
            pasted_chars: t.pasted_chars,
            keystroke_count: t.keystroke_count,
            active_typing_seconds,
            avg_wpm,
        };
    }, [closeWindow]);

    return { onKeyDown, onPaste, onChange, collect, reset };
}

// ─── Main page ───────────────────────────────────────────────────────────────
export default function AssignmentDetailPage() {
    const params = useParams();
    const subjectId = params.subjectId as string;
    const assignmentId = parseInt(params.assignmentId as string, 10);
    const { user } = useAuth();

    const [assignment, setAssignment] = useState<Assignment | null>(null);
    const [submission, setSubmission] = useState<Submission | null>(null);
    const [attemptCount, setAttemptCount] = useState(0);
    const [grade, setGrade] = useState<Grade | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [mode, setMode] = useState<SubmissionMode>('text');
    const [textContent, setTextContent] = useState('');
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [dragOver, setDragOver] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [submitting, setSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState<string | null>(null);
    const [submitSuccess, setSubmitSuccess] = useState(false);
    const [resubmitting, setResubmitting] = useState(false);

    const telemetry = useTelemetry();

    const loadData = useCallback(async () => {
        if (!user) return;
        setLoading(true);
        setError(null);
        try {
            const [asgn, subs] = await Promise.all([
                assignmentsApi.getById(assignmentId),
                submissionsApi.list({ assignment_id: assignmentId }),
            ]);
            setAssignment(asgn);
            setMode(asgn.submission_type as SubmissionMode);

            const existing = subs.length > 0 ? subs[subs.length - 1] : null;
            setAttemptCount(subs.length);
            setSubmission(existing);

            if (existing) {
                try {
                    const grades = await gradesApi.list({ assignment_id: assignmentId });
                    const myGrade = grades.find(g => g.submission_id === existing.id) ?? null;
                    setGrade(myGrade);
                } catch {
                    // grades may not exist yet
                }
            }
        } catch {
            setError('Failed to load assignment. Please try again.');
        } finally {
            setLoading(false);
        }
    }, [assignmentId, user]);

    useEffect(() => { loadData(); }, [loadData]);

    const handleFileSelect = (file: File) => {
        if (!ACCEPTED_MIME.includes(file.type)) {
            setSubmitError('File type not allowed. Accepted: PDF, Word, Excel, images, plain text.');
            return;
        }
        setSubmitError(null);
        setSelectedFile(file);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setDragOver(false);
        const file = e.dataTransfer.files[0];
        if (file) handleFileSelect(file);
    };

    const handleSubmit = async () => {
        if (!assignment || !user) return;
        setSubmitError(null);

        // Derive the actual submission type from what the student provided
        let actualType: SubmissionMode = mode;
        if (assignment.submission_type === 'both') {
            const hasText = !!textContent.trim();
            const hasFile = !!selectedFile;
            if (!hasText && !hasFile) {
                setSubmitError('Please provide a text answer, upload a file, or both.');
                return;
            }
            actualType = hasText && hasFile ? 'both' : hasText ? 'text' : 'file';
        } else {
            if (mode === 'text' && !textContent.trim()) {
                setSubmitError('Please enter your answer text.');
                return;
            }
            if (mode === 'file' && !selectedFile) {
                setSubmitError('Please select a file to upload.');
                return;
            }
        }

        setSubmitting(true);
        try {
            const created = await submissionsApi.create({
                assignment_id: assignment.id,
                content: (actualType === 'text' || actualType === 'both') ? textContent.trim() : undefined,
                submission_type: actualType,
            });

            if ((actualType === 'file' || actualType === 'both') && selectedFile) {
                await filesApi.uploadSubmissionFile(created.id, selectedFile);
            }

            // Send telemetry only when text was typed (file-only submissions have nothing to track)
            if (actualType === 'text' || actualType === 'both') {
                try {
                    await submissionsApi.saveTelemetry(created.id, telemetry.collect());
                } catch {
                    // telemetry failure is non-blocking
                }
            }

            setSubmitSuccess(true);
            setResubmitting(false);
            setTextContent('');
            setSelectedFile(null);
            setGrade(null);
            telemetry.reset();
            await loadData();
        } catch (err: unknown) {
            const apiErr = err as { data?: { detail?: string } };
            setSubmitError(apiErr?.data?.detail ?? 'Failed to submit. Please try again.');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center py-16">
                <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
            </div>
        );
    }

    if (error || !assignment) {
        return (
            <div className="flex flex-col items-center justify-center py-16 gap-2 text-slate-500">
                <AlertCircle className="h-8 w-8 text-red-400" />
                <p>{error ?? 'Assignment not found.'}</p>
                <button
                    onClick={loadData}
                    className="mt-2 px-4 py-2 bg-orange-500 text-white rounded-lg text-sm hover:bg-orange-600 transition-colors"
                >
                    Retry
                </button>
            </div>
        );
    }

    const isClosed = assignment.status === 'closed';
    const isDraft = assignment.status === 'draft';
    const isPublished = assignment.status === 'published';
    const attemptsRemaining = assignment.max_attempts != null
        ? assignment.max_attempts - attemptCount
        : null;
    const hasAttemptsLeft = attemptsRemaining === null || attemptsRemaining > 0;
    const canSubmit = isPublished && (!submission || resubmitting);
    const canResubmit = isPublished && !!submission && !grade && !resubmitting && hasAttemptsLeft;

    return (
        <div className="max-w-3xl mx-auto space-y-6">
            <Link
                href={`/student/classes/${subjectId}/homework`}
                className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-slate-700 transition-colors"
            >
                <ChevronLeft className="h-4 w-4" />
                Back to Assignments
            </Link>

            {/* Assignment header */}
            <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6">
                <div className="flex flex-wrap items-start justify-between gap-3 mb-3">
                    <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-3 mb-1">
                            <h1 className="text-2xl font-bold text-slate-900">{assignment.title}</h1>
                            <StatusBadge status={assignment.status} />
                        </div>
                        {assignment.description && (
                            <p className="text-slate-600 text-sm mt-2 leading-relaxed whitespace-pre-wrap">
                                {assignment.description}
                            </p>
                        )}
                    </div>
                </div>
                <div className="flex flex-wrap items-center gap-5 text-sm text-slate-500 border-t border-slate-100 pt-4">
                    <span>
                        Max Score:{' '}
                        <span className="font-semibold text-slate-800">{assignment.max_score}</span>
                    </span>
                    {assignment.due_date && (
                        <span className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            Due:{' '}
                            <span className="font-semibold text-slate-800">
                                {new Date(assignment.due_date).toLocaleString()}
                            </span>
                        </span>
                    )}
                    {attemptCount > 0 && (
                        <span className={`flex items-center gap-1 ${attemptsRemaining === 0 ? 'text-red-500' : ''}`}>
                            Attempts:{' '}
                            <span className="font-semibold text-slate-800">
                                {attemptCount}{assignment.max_attempts != null ? ` / ${assignment.max_attempts}` : ''}
                            </span>
                            {attemptsRemaining === 0 && (
                                <span className="text-xs text-red-500 font-medium ml-1">(no attempts left)</span>
                            )}
                        </span>
                    )}
                    {(() => {
                        const typeInfo: Record<string, { label: string; cls: string }> = {
                            text: { label: 'Text submission', cls: 'bg-blue-50 text-blue-700 border-blue-200' },
                            file: { label: 'File upload', cls: 'bg-purple-50 text-purple-700 border-purple-200' },
                            both: { label: 'Text or file', cls: 'bg-teal-50 text-teal-700 border-teal-200' },
                        };
                        const info = typeInfo[assignment.submission_type] ?? typeInfo.text;
                        return (
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${info.cls}`}>
                                {info.label}
                            </span>
                        );
                    })()}
                </div>
            </div>

            {/* Status messages */}
            {isClosed && !submission && (
                <div className="bg-red-50 border border-red-200 rounded-2xl p-5 flex items-start gap-3">
                    <Lock className="h-5 w-5 text-red-500 shrink-0 mt-0.5" />
                    <div>
                        <p className="font-semibold text-red-700">This assignment is closed</p>
                        <p className="text-sm text-red-600 mt-0.5">Submissions are no longer accepted.</p>
                    </div>
                </div>
            )}
            {isDraft && (
                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 flex items-start gap-3">
                    <AlertCircle className="h-5 w-5 text-slate-400 shrink-0 mt-0.5" />
                    <p className="text-sm text-slate-500">This assignment has not been published yet.</p>
                </div>
            )}
            {submitSuccess && (
                <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 flex items-center gap-3">
                    <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" />
                    <p className="text-emerald-700 font-medium text-sm">Submitted successfully!</p>
                </div>
            )}

            {/* ── Already submitted: show content + grade ── */}
            {submission && !resubmitting ? (
                <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6 space-y-5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                        <h2 className="font-bold text-slate-900">Your Submission</h2>
                        {submission.is_late && (
                            <span className="px-2 py-0.5 bg-red-50 text-red-600 text-xs font-semibold rounded-full">
                                LATE
                            </span>
                        )}
                      </div>
                      {canResubmit && (
                        <button
                          onClick={() => {
                              setResubmitting(true);
                              setSubmitSuccess(false);
                              setTextContent(submission.content ?? '');
                              setSelectedFile(null);
                              telemetry.reset();
                          }}
                          className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-orange-600 border border-orange-200 bg-orange-50 hover:bg-orange-100 rounded-xl transition-colors"
                        >
                          <Send className="h-3.5 w-3.5" />
                          Resubmit
                        </button>
                      )}
                    </div>

                    <div>
                        <p className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-1">
                            Submitted
                        </p>
                        <p className="text-sm text-slate-700">
                            {new Date(submission.submitted_at).toLocaleString()}
                        </p>
                    </div>

                    {submission.content && (
                        <div>
                            <p className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-2">
                                Your Answer
                            </p>
                            <div className="bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-sm text-slate-700 whitespace-pre-wrap">
                                {submission.content}
                            </div>
                        </div>
                    )}

                    {submission.files && submission.files.length > 0 && (
                        <div>
                            <p className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-3">
                                Attached Files
                            </p>
                            <div className="space-y-4">
                                {submission.files.map((f: SubmissionFile) => (
                                    <div key={f.id} className="space-y-2">
                                        <div className="flex items-center gap-2 text-sm text-slate-700">
                                            <FileTypeIcon mime={f.file_type} />
                                            <span className="font-medium">{f.original_filename ?? 'Uploaded file'}</span>
                                        </div>
                                        <FileViewer file={f} />
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {grade ? (
                        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4">
                            <p className="text-xs font-medium text-emerald-700 uppercase tracking-wide mb-2">Grade</p>
                            <div className="flex items-baseline gap-2">
                                <span className="text-3xl font-bold text-emerald-700">{grade.score}</span>
                                <span className="text-sm text-emerald-600">/ {assignment.max_score}</span>
                                <span className={`ml-2 px-2.5 py-0.5 rounded-full text-xs font-bold ${
                                    (grade.score / assignment.max_score) * 100 >= 80
                                        ? 'bg-emerald-100 text-emerald-700'
                                        : 'bg-orange-100 text-orange-700'
                                }`}>
                                    {(grade.score / assignment.max_score) * 100 >= 90 ? 'A'
                                        : (grade.score / assignment.max_score) * 100 >= 80 ? 'B'
                                        : (grade.score / assignment.max_score) * 100 >= 70 ? 'C' : 'D'}
                                </span>
                            </div>
                            {grade.feedback && (
                                <div className="mt-3">
                                    <p className="text-xs font-medium text-emerald-700 uppercase tracking-wide mb-1">
                                        Feedback
                                    </p>
                                    <p className="text-sm text-slate-700 bg-white rounded-lg px-3 py-2 border border-emerald-100">
                                        {grade.feedback}
                                    </p>
                                </div>
                            )}
                            <p className="text-xs text-emerald-600 mt-2">
                                Graded on {new Date(grade.graded_at).toLocaleDateString()}
                            </p>
                        </div>
                    ) : (
                        <div className="bg-slate-50 border border-slate-100 rounded-xl p-4 text-center text-sm text-slate-400">
                            <Clock className="h-5 w-5 mx-auto mb-1" />
                            Awaiting grading
                        </div>
                    )}
                </div>
            ) : canSubmit ? (
                /* ── Submission form ── */
                <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6 space-y-5">
                    <div className="flex items-center justify-between">
                      <h2 className="font-bold text-slate-900">{resubmitting ? 'Resubmit Your Work' : 'Submit Your Work'}</h2>
                      {resubmitting && (
                        <button
                          onClick={() => { setResubmitting(false); setSubmitError(null); }}
                          className="text-sm text-slate-500 hover:text-slate-700 underline"
                        >
                          Cancel
                        </button>
                      )}
                    </div>

                    {assignment.submission_type !== 'file' && (
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">
                                Your Answer{' '}
                                {assignment.submission_type === 'text'
                                    ? <span className="text-red-500">*</span>
                                    : <span className="text-slate-400 font-normal text-xs">(optional)</span>
                                }
                            </label>
                            <textarea
                                value={textContent}
                                onKeyDown={telemetry.onKeyDown}
                                onPaste={telemetry.onPaste}
                                onChange={e => telemetry.onChange(e, setTextContent)}
                                rows={8}
                                placeholder="Write your answer here…"
                                className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-orange-400 resize-none"
                            />
                        </div>
                    )}

                    {assignment.submission_type !== 'text' && (
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">
                                File{' '}
                                {assignment.submission_type === 'file'
                                    ? <span className="text-red-500">*</span>
                                    : <span className="text-slate-400 font-normal text-xs">(optional)</span>
                                }
                                <span className="ml-2 font-normal text-slate-400 text-xs">
                                    PDF, Word, Excel, images, plain text
                                </span>
                            </label>

                            {selectedFile ? (
                                <div className="flex items-center justify-between px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl">
                                    <div className="flex items-center gap-3">
                                        <FileTypeIcon mime={selectedFile.type} />
                                        <div>
                                            <p className="text-sm font-medium text-slate-800">{selectedFile.name}</p>
                                            <p className="text-xs text-slate-400">{formatBytes(selectedFile.size)}</p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => setSelectedFile(null)}
                                        className="p-1 text-slate-400 hover:text-red-500 transition-colors"
                                    >
                                        <X className="w-4 h-4" />
                                    </button>
                                </div>
                            ) : (
                                <div
                                    onDrop={handleDrop}
                                    onDragOver={e => { e.preventDefault(); setDragOver(true); }}
                                    onDragLeave={() => setDragOver(false)}
                                    onClick={() => fileInputRef.current?.click()}
                                    className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors ${
                                        dragOver
                                            ? 'border-orange-400 bg-orange-50'
                                            : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                                    }`}
                                >
                                    <Upload className="w-8 h-8 mx-auto text-slate-300 mb-2" />
                                    <p className="text-sm font-medium text-slate-600">
                                        Drag & drop a file here, or{' '}
                                        <span className="text-orange-500 underline">browse</span>
                                    </p>
                                    <p className="text-xs text-slate-400 mt-1">
                                        PDF, Word, Excel, JPG, PNG, GIF, TXT
                                    </p>
                                </div>
                            )}

                            <input
                                ref={fileInputRef}
                                type="file"
                                accept={ACCEPTED_EXTENSIONS}
                                className="hidden"
                                onChange={e => {
                                    const f = e.target.files?.[0];
                                    if (f) handleFileSelect(f);
                                    e.target.value = '';
                                }}
                            />
                        </div>
                    )}

                    {submitError && (
                        <p className="text-sm text-red-600 flex items-center gap-1">
                            <AlertCircle className="h-4 w-4 shrink-0" />
                            {submitError}
                        </p>
                    )}

                    <div className="flex justify-end">
                        <button
                            onClick={handleSubmit}
                            disabled={submitting}
                            className="flex items-center gap-2 px-6 py-2.5 bg-orange-500 text-white font-semibold rounded-xl hover:bg-orange-600 disabled:opacity-60 transition-colors shadow-sm"
                        >
                            {submitting ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                                <Send className="h-4 w-4" />
                            )}
                            {submitting ? 'Submitting…' : 'Submit'}
                        </button>
                    </div>
                </div>
            ) : null}
        </div>
    );
}
