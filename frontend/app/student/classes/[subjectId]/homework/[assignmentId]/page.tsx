'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import {
    Loader2, AlertCircle, ChevronLeft, CheckCircle2, Clock,
    Send, Lock, Upload, FileText, Image, File, X, Download,
} from 'lucide-react';
import { useAuth } from '@/components/auth/AuthProvider';
import { assignmentsApi, submissionsApi, gradesApi, filesApi, fetchFileAsBlob } from '@/lib/api';
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
        let revoke: string | null = null;
        fetchFileAsBlob(file.file_url)
            .then(url => { revoke = url; setBlobUrl(url); })
            .catch(() => setLoadErr(true));
        return () => { if (revoke) URL.revokeObjectURL(revoke); };
    }, [file.file_url]);

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

    // Other types — download link
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

// ─── Main page ───────────────────────────────────────────────────────────────
export default function AssignmentDetailPage() {
    const params = useParams();
    const subjectId = params.subjectId as string;
    const assignmentId = parseInt(params.assignmentId as string, 10);
    const { user } = useAuth();

    const [assignment, setAssignment] = useState<Assignment | null>(null);
    const [submission, setSubmission] = useState<Submission | null>(null);
    const [grade, setGrade] = useState<Grade | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Submission form state
    const [mode, setMode] = useState<SubmissionMode>('text');
    const [textContent, setTextContent] = useState('');
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [dragOver, setDragOver] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [submitting, setSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState<string | null>(null);
    const [submitSuccess, setSubmitSuccess] = useState(false);

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
            // Lock submission mode to the assignment's required type
            setMode(asgn.submission_type as SubmissionMode);

            const existing = subs.length > 0 ? subs[0] : null;
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

    // ── File selection helpers ───────────────────────────────────────────────
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

    // ── Submit handler ───────────────────────────────────────────────────────
    const handleSubmit = async () => {
        if (!assignment || !user) return;
        setSubmitError(null);

        if ((mode === 'text' || mode === 'both') && !textContent.trim()) {
            setSubmitError('Please enter your answer text.');
            return;
        }
        if ((mode === 'file' || mode === 'both') && !selectedFile) {
            setSubmitError('Please select a file to upload.');
            return;
        }

        setSubmitting(true);
        try {
            // 1. Create the submission record
            const created = await submissionsApi.create({
                assignment_id: assignment.id,
                content: (mode === 'text' || mode === 'both') ? textContent.trim() : undefined,
                submission_type: mode,
            });

            // 2. Upload file if needed
            if ((mode === 'file' || mode === 'both') && selectedFile) {
                await filesApi.upload(created.id, selectedFile);
                // Re-fetch to get the files array populated
                const refreshed = await submissionsApi.getById(created.id);
                setSubmission(refreshed);
            } else {
                setSubmission(created);
            }

            setSubmitSuccess(true);
            setTextContent('');
            setSelectedFile(null);
        } catch (err: unknown) {
            const apiErr = err as { data?: { detail?: string } };
            setSubmitError(apiErr?.data?.detail ?? 'Failed to submit. Please try again.');
        } finally {
            setSubmitting(false);
        }
    };

    // ─── Loading / Error states ──────────────────────────────────────────────
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
    const canSubmit = assignment.status === 'published' && !submission;

    // ─── Render ──────────────────────────────────────────────────────────────
    return (
        <div className="max-w-3xl mx-auto space-y-6">
            {/* Back */}
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
            {submission ? (
                <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6 space-y-5">
                    <div className="flex items-center gap-2">
                        <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                        <h2 className="font-bold text-slate-900">Your Submission</h2>
                        {submission.is_late && (
                            <span className="px-2 py-0.5 bg-red-50 text-red-600 text-xs font-semibold rounded-full">
                                LATE
                            </span>
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

                    {/* Text content */}
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

                    {/* Attached files */}
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

                    {/* Grade */}
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
                    <h2 className="font-bold text-slate-900">Submit Your Work</h2>

                    {/* Mode selector — only shown when assignment allows choice */}
                    {assignment.submission_type === 'both' ? (
                        <div>
                            <p className="text-sm font-medium text-slate-700 mb-2">Submission type</p>
                            <div className="flex flex-wrap gap-3">
                                {(['text', 'file', 'both'] as SubmissionMode[]).map(m => (
                                    <label
                                        key={m}
                                        className={`flex items-center gap-2 px-4 py-2 rounded-xl border cursor-pointer text-sm font-medium transition-colors ${
                                            mode === m
                                                ? 'border-orange-400 bg-orange-50 text-orange-700'
                                                : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                                        }`}
                                    >
                                        <input
                                            type="radio"
                                            name="submission_mode"
                                            value={m}
                                            checked={mode === m}
                                            onChange={() => setMode(m)}
                                            className="sr-only"
                                        />
                                        {m === 'text' ? 'Text only' : m === 'file' ? 'File only' : 'Text + File'}
                                    </label>
                                ))}
                            </div>
                        </div>
                    ) : null}

                    {/* Text area */}
                    {(mode === 'text' || mode === 'both') && (
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">
                                Your Answer {mode === 'text' && <span className="text-red-500">*</span>}
                            </label>
                            <textarea
                                value={textContent}
                                onChange={e => setTextContent(e.target.value)}
                                rows={8}
                                placeholder="Write your answer here…"
                                className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-orange-400 resize-none"
                            />
                        </div>
                    )}

                    {/* File drop zone */}
                    {(mode === 'file' || mode === 'both') && (
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">
                                File {mode === 'file' && <span className="text-red-500">*</span>}
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

                    {/* Error */}
                    {submitError && (
                        <p className="text-sm text-red-600 flex items-center gap-1">
                            <AlertCircle className="h-4 w-4 shrink-0" />
                            {submitError}
                        </p>
                    )}

                    {/* Submit button */}
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
