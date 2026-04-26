'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import {
  Loader2, AlertCircle, ChevronLeft, CheckCircle2,
  Clock, MessageSquare, FileText, Image, File, Download,
  ChevronRight, User as UserIcon, Keyboard, ClipboardPaste,
  ShieldAlert, ShieldCheck,
} from 'lucide-react';
import { assignmentsApi, submissionsApi, gradesApi, classSubjectsApi, client } from '@/lib/api';
import { getFileUrl } from '@/lib/api/files';
import { TelemetryRead } from '@/lib/api/submissions';
import { Grade } from '@/lib/api/grades';
import { Assignment, Submission, SubmissionFile } from '@/types/school.types';
import { User } from '@/types/user.types';

// ─── File viewer ─────────────────────────────────────────────────────────────
function FileTypeIcon({ mime }: { mime?: string }) {
  if (mime?.startsWith('image/')) return <Image className="w-4 h-4 text-purple-500" />;
  if (mime === 'application/pdf') return <FileText className="w-4 h-4 text-red-500" />;
  return <File className="w-4 h-4 text-blue-500" />;
}

function FileViewer({ file }: { file: SubmissionFile }) {
  const [blobUrl, setBlobUrl] = useState<string | null>(null);
  const [officeViewerUrl, setOfficeViewerUrl] = useState<string | null>(null);
  const [textContent, setTextContent] = useState<string | null>(null);
  const [loadErr, setLoadErr] = useState(false);

  useEffect(() => {
    let url: string | null = null;
    let cancelled = false;
    (async () => {
      try {
        const signedOrBlob = await getFileUrl(file.file_url);
        if (cancelled) return;

        const isOffice = file.file_type?.includes('wordprocessingml') ||
          file.file_type === 'application/msword' ||
          file.file_type?.includes('spreadsheetml');

        if (isOffice && signedOrBlob.startsWith('http')) {
          if (!cancelled) setOfficeViewerUrl(
            `https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(signedOrBlob)}`
          );
          return;
        }

        if (file.file_type === 'text/plain') {
          const res = await fetch(signedOrBlob);
          const text = await res.text();
          if (!cancelled) setTextContent(text);
          URL.revokeObjectURL(signedOrBlob);
          return;
        }

        const res = await fetch(signedOrBlob);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const buf = await res.arrayBuffer();
        if (cancelled) return;
        const blob = new Blob([buf], { type: file.file_type || 'application/octet-stream' });
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

  if (loadErr) return (
    <div className="flex items-center gap-2 p-3 bg-red-50 rounded-lg text-red-600 text-xs">
      <AlertCircle className="w-3.5 h-3.5 shrink-0" /> Could not load preview.
    </div>
  );
  if (!blobUrl && !officeViewerUrl && textContent === null) return (
    <div className="flex items-center gap-2 p-3 text-slate-400 text-xs">
      <Loader2 className="w-3.5 h-3.5 animate-spin" /> Loading…
    </div>
  );
  if (officeViewerUrl) return (
    <iframe src={officeViewerUrl} title={name} className="w-full h-64 rounded-lg border border-slate-100" />
  );
  if (textContent !== null) return (
    <div className="rounded-lg border border-slate-100 bg-slate-50 p-3 max-h-48 overflow-auto">
      <pre className="text-xs text-slate-700 font-mono whitespace-pre-wrap break-words leading-relaxed">{textContent}</pre>
    </div>
  );
  if (isImage) return (
    <div className="rounded-lg overflow-hidden border border-slate-100 max-w-sm">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={blobUrl!} alt={name} className="max-w-full max-h-64 object-contain" />
    </div>
  );
  if (isPdf) return (
    <iframe src={blobUrl!} title={name} className="w-full h-64 rounded-lg border border-slate-100" />
  );
  return (
    <a href={blobUrl!} download={name}
      className="inline-flex items-center gap-2 px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-700 hover:bg-slate-100 transition-colors">
      <Download className="w-4 h-4" /> Download {name}
    </a>
  );
}

// ─── Telemetry panel ─────────────────────────────────────────────────────────
function TelemetryPanel({ submissionId }: { submissionId: number }) {
  const [telemetry, setTelemetry] = useState<TelemetryRead | null>(null);
  const [loading, setLoading] = useState(true);
  const [missing, setMissing] = useState(false);

  useEffect(() => {
    setLoading(true);
    setMissing(false);
    setTelemetry(null);
    submissionsApi.getTelemetry(submissionId)
      .then(setTelemetry)
      .catch(() => setMissing(true))
      .finally(() => setLoading(false));
  }, [submissionId]);

  if (loading) return (
    <div className="flex items-center gap-2 text-slate-400 text-xs py-2">
      <Loader2 className="w-3.5 h-3.5 animate-spin" /> Loading telemetry…
    </div>
  );

  if (missing || !telemetry) return (
    <p className="text-xs text-slate-400 italic">No typing data recorded for this submission.</p>
  );

  const total = telemetry.typed_chars + telemetry.pasted_chars;
  const pasteRatio = total > 0 ? telemetry.pasted_chars / total : 0;
  const suspicious = telemetry.paste_count > 0 && pasteRatio > 0.5;

  return (
    <div className="space-y-3">
      {/* Suspicion flag */}
      <div className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold ${
        suspicious
          ? 'bg-red-50 text-red-700 border border-red-200'
          : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
      }`}>
        {suspicious
          ? <><ShieldAlert className="w-4 h-4 shrink-0" /> High paste ratio — possible copy-paste</>
          : <><ShieldCheck className="w-4 h-4 shrink-0" /> Mostly typed manually</>
        }
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 gap-2 text-xs">
        <div className="bg-slate-50 rounded-lg px-3 py-2">
          <div className="flex items-center gap-1.5 text-slate-500 mb-0.5">
            <Keyboard className="w-3.5 h-3.5" /> Avg speed
          </div>
          <p className="font-bold text-slate-800 text-base">
            {telemetry.avg_wpm != null ? `${telemetry.avg_wpm} WPM` : '—'}
          </p>
        </div>

        <div className="bg-slate-50 rounded-lg px-3 py-2">
          <div className="flex items-center gap-1.5 text-slate-500 mb-0.5">
            <Clock className="w-3.5 h-3.5" /> Active typing
          </div>
          <p className="font-bold text-slate-800 text-base">
            {telemetry.active_typing_seconds >= 60
              ? `${Math.floor(telemetry.active_typing_seconds / 60)}m ${Math.round(telemetry.active_typing_seconds % 60)}s`
              : `${Math.round(telemetry.active_typing_seconds)}s`}
          </p>
        </div>

        <div className="bg-slate-50 rounded-lg px-3 py-2">
          <div className="flex items-center gap-1.5 text-slate-500 mb-0.5">
            <Keyboard className="w-3.5 h-3.5" /> Typed chars
          </div>
          <p className="font-bold text-slate-800 text-base">{telemetry.typed_chars}</p>
        </div>

        <div className={`rounded-lg px-3 py-2 ${telemetry.paste_count > 0 ? 'bg-orange-50' : 'bg-slate-50'}`}>
          <div className={`flex items-center gap-1.5 mb-0.5 ${telemetry.paste_count > 0 ? 'text-orange-600' : 'text-slate-500'}`}>
            <ClipboardPaste className="w-3.5 h-3.5" /> Paste events
          </div>
          <p className={`font-bold text-base ${telemetry.paste_count > 0 ? 'text-orange-700' : 'text-slate-800'}`}>
            {telemetry.paste_count}
            {telemetry.paste_count > 0 && (
              <span className="text-xs font-normal ml-1 text-orange-500">
                ({telemetry.pasted_chars} chars, {Math.round(pasteRatio * 100)}%)
              </span>
            )}
          </p>
        </div>
      </div>
    </div>
  );
}

// ─── Helpers ─────────────────────────────────────────────────────────────────
function StatusBadge({ status }: { status: Assignment['status'] }) {
  const map: Record<Assignment['status'], string> = {
    draft: 'bg-slate-100 text-slate-600',
    published: 'bg-emerald-50 text-emerald-700',
    closed: 'bg-red-50 text-red-700',
  };
  return (
    <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold capitalize ${map[status]}`}>
      {status}
    </span>
  );
}

function SubmissionTypeBadge({ type }: { type: string }) {
  const map: Record<string, string> = {
    text: 'bg-blue-50 text-blue-700 border-blue-200',
    file: 'bg-purple-50 text-purple-700 border-purple-200',
    both: 'bg-teal-50 text-teal-700 border-teal-200',
  };
  const labels: Record<string, string> = { text: 'Text', file: 'File', both: 'Text + File' };
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${map[type] ?? map.text}`}>
      {labels[type] ?? type}
    </span>
  );
}

type StudentStatus = 'graded' | 'pending' | 'no_submission';

function studentStatus(studentId: number, subsMap: Record<number, Submission>, gradesMap: Record<number, Grade>): StudentStatus {
  const sub = subsMap[studentId];
  if (!sub) return 'no_submission';
  if (gradesMap[sub.id]) return 'graded';
  return 'pending';
}

function StatusChip({ status }: { status: StudentStatus }) {
  if (status === 'graded') return (
    <span className="flex items-center gap-1 text-xs font-medium text-emerald-600">
      <CheckCircle2 className="w-3.5 h-3.5" /> Graded
    </span>
  );
  if (status === 'pending') return (
    <span className="flex items-center gap-1 text-xs font-medium text-orange-500">
      <FileText className="w-3.5 h-3.5" /> Pending
    </span>
  );
  return (
    <span className="text-xs font-medium text-slate-400">No submission</span>
  );
}

function initials(name: string) {
  return name.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase();
}

// ─── Main page ───────────────────────────────────────────────────────────────
export default function TeacherSubmissionsPage() {
  const params = useParams();
  const subjectId = parseInt(params.subjectId as string, 10);
  const assignmentId = parseInt(params.assignmentId as string, 10);

  const [assignment, setAssignment] = useState<Assignment | null>(null);
  const [students, setStudents] = useState<User[]>([]);
  const [subsMap, setSubsMap] = useState<Record<number, Submission>>({});
  const [gradesMap, setGradesMap] = useState<Record<number, Grade>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [selectedStudentId, setSelectedStudentId] = useState<number | null>(null);
  const [gradeForm, setGradeForm] = useState({ score: '', feedback: '' });
  const [gradeFormError, setGradeFormError] = useState<string | null>(null);
  const [submittingGrade, setSubmittingGrade] = useState(false);
  const [expanded, setExpanded] = useState<Set<number>>(new Set());
  const [showTelemetry, setShowTelemetry] = useState(false);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [asgn, subs, gradesData, cs] = await Promise.all([
        assignmentsApi.getById(assignmentId),
        submissionsApi.list({ assignment_id: assignmentId }),
        gradesApi.list({ assignment_id: assignmentId }),
        classSubjectsApi.getById(subjectId),
      ]);
      const allStudents = await client.get<User[]>(`/classes/${cs.class_id}/students`);

      setAssignment(asgn);
      setStudents(allStudents);

      const sm: Record<number, Submission> = {};
      subs.forEach((s: Submission) => { sm[s.student_id] = s; });
      setSubsMap(sm);

      const gm: Record<number, Grade> = {};
      gradesData.forEach((g: Grade) => { gm[g.submission_id] = g; });
      setGradesMap(gm);

      if (allStudents.length > 0) setSelectedStudentId(allStudents[0].id);
    } catch {
      setError('Failed to load submissions. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [assignmentId, subjectId]);

  useEffect(() => { loadData(); }, [loadData]);

  useEffect(() => {
    if (selectedStudentId === null) return;
    const sub = subsMap[selectedStudentId];
    if (!sub) { setGradeForm({ score: '', feedback: '' }); return; }
    const grade = gradesMap[sub.id];
    setGradeForm({
      score: grade ? String(grade.score) : '',
      feedback: grade?.feedback ?? '',
    });
    setGradeFormError(null);
    setShowTelemetry(false);
  }, [selectedStudentId, subsMap, gradesMap]);

  const handleSave = async (andNext: boolean) => {
    setGradeFormError(null);
    if (!assignment || selectedStudentId === null) return;
    const sub = subsMap[selectedStudentId];
    if (!sub) return;

    const scoreNum = parseFloat(gradeForm.score);
    if (isNaN(scoreNum) || scoreNum < 0) {
      setGradeFormError('Score must be a non-negative number.');
      return;
    }
    if (scoreNum > assignment.max_score) {
      setGradeFormError(`Score cannot exceed max score (${assignment.max_score}).`);
      return;
    }
    setSubmittingGrade(true);
    try {
      const existing = gradesMap[sub.id];
      let result: Grade;
      if (existing) {
        result = await gradesApi.update(existing.id, {
          score: scoreNum,
          feedback: gradeForm.feedback.trim() || undefined,
        });
      } else {
        result = await gradesApi.create({
          submission_id: sub.id,
          score: scoreNum,
          feedback: gradeForm.feedback.trim() || undefined,
        });
      }
      setGradesMap(prev => ({ ...prev, [sub.id]: result }));

      if (andNext) {
        const nextStudent = students.find(s => {
          if (s.id === selectedStudentId) return false;
          const nextSub = subsMap[s.id];
          return nextSub && !gradesMap[nextSub.id] && nextSub.id !== sub.id;
        });
        if (nextStudent) setSelectedStudentId(nextStudent.id);
      }
    } catch {
      setGradeFormError('Failed to save grade. Please try again.');
    } finally {
      setSubmittingGrade(false);
    }
  };

  const gradedCount = students.filter(s => {
    const sub = subsMap[s.id];
    return sub && gradesMap[sub.id];
  }).length;
  const submittedCount = Object.keys(subsMap).length;

  if (loading) return (
    <div className="flex justify-center py-16">
      <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
    </div>
  );
  if (error || !assignment) return (
    <div className="flex flex-col items-center justify-center py-16 gap-2 text-slate-500">
      <AlertCircle className="h-8 w-8 text-red-400" />
      <p>{error ?? 'Assignment not found.'}</p>
      <button onClick={loadData}
        className="mt-2 px-4 py-2 bg-orange-500 text-white rounded-lg text-sm hover:bg-orange-600 transition-colors">
        Retry
      </button>
    </div>
  );

  const selectedStudent = students.find(s => s.id === selectedStudentId) ?? null;
  const selectedSub = selectedStudentId ? subsMap[selectedStudentId] ?? null : null;
  const selectedGrade = selectedSub ? gradesMap[selectedSub.id] ?? null : null;

  return (
    <div className="flex flex-col h-full">
      {/* Top bar */}
      <div className="px-4 pt-4 pb-2 border-b border-slate-100 bg-white">
        <Link href={`/teacher/classes/${subjectId}`}
          className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-slate-700 transition-colors mb-2">
          <ChevronLeft className="h-4 w-4" /> Back to Assignments
        </Link>
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-lg font-bold text-slate-900">{assignment.title}</h1>
          <StatusBadge status={assignment.status} />
          <SubmissionTypeBadge type={assignment.submission_type} />
          <span className="text-sm text-slate-400">Max: <span className="font-semibold text-slate-700">{assignment.max_score}</span></span>
          {assignment.due_date && (
            <span className="flex items-center gap-1 text-sm text-slate-400">
              <Clock className="h-3.5 w-3.5" />
              {new Date(assignment.due_date).toLocaleString()}
            </span>
          )}
          <span className="ml-auto text-sm text-slate-500">
            <span className="font-semibold text-emerald-600">{gradedCount}</span>
            <span className="text-slate-400">/{submittedCount} graded</span>
          </span>
        </div>
      </div>

      {/* Mobile student strip */}
      <div className="lg:hidden flex overflow-x-auto gap-2 px-3 py-2 border-b border-slate-100 bg-white">
        {students.map(s => {
          const status = studentStatus(s.id, subsMap, gradesMap);
          const isActive = s.id === selectedStudentId;
          return (
            <button key={s.id} onClick={() => setSelectedStudentId(s.id)}
              className={`flex-shrink-0 flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-colors
                ${isActive ? 'bg-orange-500 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>
              <span>{initials(s.full_name)}</span>
              {status === 'graded' && <span className={isActive ? 'text-orange-100' : 'text-emerald-500'}>✓</span>}
              {status === 'pending' && <span className={isActive ? 'text-orange-100' : 'text-orange-400'}>●</span>}
              {status === 'no_submission' && <span className={isActive ? 'text-orange-200' : 'text-slate-300'}>○</span>}
            </button>
          );
        })}
      </div>

      {/* Split pane */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <aside className="hidden lg:flex flex-col w-60 border-r border-slate-100 bg-white overflow-y-auto">
          <div className="px-4 py-3 border-b border-slate-50">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
              Students ({students.length})
            </p>
          </div>
          {students.map(s => {
            const status = studentStatus(s.id, subsMap, gradesMap);
            const isActive = s.id === selectedStudentId;
            return (
              <button key={s.id} onClick={() => setSelectedStudentId(s.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors border-l-2
                  ${isActive
                    ? 'bg-orange-50 border-l-orange-500'
                    : 'border-l-transparent hover:bg-slate-50'}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0
                  ${isActive ? 'bg-orange-500 text-white' : 'bg-slate-200 text-slate-600'}`}>
                  {initials(s.full_name)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-medium truncate ${isActive ? 'text-orange-700' : 'text-slate-800'}`}>
                    {s.full_name}
                  </p>
                  <StatusChip status={status} />
                </div>
                {isActive && <ChevronRight className="w-3.5 h-3.5 text-orange-400 shrink-0" />}
              </button>
            );
          })}
        </aside>

        {/* Main workspace */}
        <main className="flex-1 overflow-y-auto p-6 space-y-5">
          {!selectedStudent ? (
            <div className="flex flex-col items-center justify-center py-20 text-slate-400">
              <UserIcon className="h-10 w-10 mb-2" />
              <p className="text-sm">Select a student to begin grading.</p>
            </div>
          ) : (
            <>
              {/* Student header */}
              <div className="flex flex-wrap items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-orange-500 text-white flex items-center justify-center font-bold text-sm">
                  {initials(selectedStudent.full_name)}
                </div>
                <div>
                  <h2 className="text-lg font-bold text-slate-900">{selectedStudent.full_name}</h2>
                  <StatusChip status={studentStatus(selectedStudent.id, subsMap, gradesMap)} />
                </div>
              </div>

              {/* Submission content */}
              {!selectedSub ? (
                <div className="bg-slate-50 border border-slate-200 rounded-2xl px-6 py-10 text-center text-slate-400 text-sm">
                  This student has not submitted yet.
                </div>
              ) : (
                <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-5 space-y-4">
                  <div className="flex flex-wrap items-center gap-2 text-sm text-slate-500">
                    <SubmissionTypeBadge type={selectedSub.submission_type} />
                    {selectedSub.is_late && (
                      <span className="px-2 py-0.5 bg-red-50 text-red-600 text-xs font-semibold rounded-full">LATE</span>
                    )}
                    <span>{new Date(selectedSub.submitted_at).toLocaleString()}</span>
                  </div>

                  {/* Text content */}
                  {selectedSub.content && (() => {
                    const isExp = expanded.has(selectedSub.id);
                    const long = selectedSub.content.length > 300;
                    const text = long && !isExp ? selectedSub.content.slice(0, 300) + '…' : selectedSub.content;
                    return (
                      <div>
                        <p className="text-sm text-slate-700 bg-slate-50 rounded-xl px-4 py-3 whitespace-pre-wrap">{text}</p>
                        {long && (
                          <button onClick={() => setExpanded(prev => {
                            const n = new Set(prev);
                            isExp ? n.delete(selectedSub.id) : n.add(selectedSub.id);
                            return n;
                          })} className="mt-1 text-xs text-orange-600 hover:underline">
                            {isExp ? 'Show less' : 'Show more'}
                          </button>
                        )}
                      </div>
                    );
                  })()}

                  {/* Files */}
                  {selectedSub.files && selectedSub.files.length > 0 && (
                    <div className="space-y-3">
                      {selectedSub.files.map(f => (
                        <div key={f.id} className="space-y-1.5">
                          <div className="flex items-center gap-2 text-sm text-slate-700">
                            <FileTypeIcon mime={f.file_type} />
                            <span className="font-medium">{f.original_filename ?? 'Uploaded file'}</span>
                          </div>
                          <FileViewer file={f} />
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Telemetry toggle */}
                  {(selectedSub.submission_type === 'text' || selectedSub.submission_type === 'both') && (
                    <div className="border-t border-slate-100 pt-3">
                      <button
                        onClick={() => setShowTelemetry(v => !v)}
                        className="flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-slate-700 transition-colors"
                      >
                        <Keyboard className="w-3.5 h-3.5" />
                        {showTelemetry ? 'Hide' : 'Show'} typing analysis
                      </button>
                      {showTelemetry && (
                        <div className="mt-3">
                          <TelemetryPanel submissionId={selectedSub.id} />
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Grading panel */}
              {selectedSub && (
                <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-5 space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-slate-800">
                      {selectedGrade ? 'Update Grade' : 'Grade Submission'}
                    </h3>
                    {selectedGrade && (
                      <div className="flex items-center gap-1.5 text-emerald-600">
                        <CheckCircle2 className="w-4 h-4" />
                        <span className="text-sm font-semibold">
                          {selectedGrade.score}/{assignment.max_score}
                        </span>
                      </div>
                    )}
                  </div>

                  {selectedGrade?.feedback && (
                    <div className="bg-emerald-50 border border-emerald-100 rounded-xl px-4 py-3">
                      <p className="text-xs font-medium text-emerald-700 uppercase tracking-wide mb-1 flex items-center gap-1">
                        <MessageSquare className="w-3.5 h-3.5" /> Feedback
                      </p>
                      <p className="text-sm text-slate-700">{selectedGrade.feedback}</p>
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-slate-600 mb-1">
                        Score (0–{assignment.max_score}) <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="number" min={0} max={assignment.max_score}
                        value={gradeForm.score}
                        onChange={e => setGradeForm(prev => ({ ...prev, score: e.target.value }))}
                        className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
                        placeholder={`0–${assignment.max_score}`}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-600 mb-1">Feedback (optional)</label>
                      <textarea
                        value={gradeForm.feedback}
                        onChange={e => setGradeForm(prev => ({ ...prev, feedback: e.target.value }))}
                        rows={2}
                        className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 resize-none"
                        placeholder="Optional feedback for the student"
                      />
                    </div>
                  </div>

                  {gradeFormError && (
                    <p className="text-xs text-red-600 flex items-center gap-1">
                      <AlertCircle className="h-3.5 w-3.5" /> {gradeFormError}
                    </p>
                  )}

                  <div className="flex gap-2">
                    <button onClick={() => handleSave(false)} disabled={submittingGrade}
                      className="flex items-center gap-1.5 px-4 py-2 bg-orange-500 text-white text-sm font-medium rounded-lg hover:bg-orange-600 disabled:opacity-60 transition-colors">
                      {submittingGrade ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
                      Save
                    </button>
                    <button onClick={() => handleSave(true)} disabled={submittingGrade}
                      className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 text-white text-sm font-medium rounded-lg hover:bg-emerald-700 disabled:opacity-60 transition-colors">
                      {submittingGrade ? <Loader2 className="h-4 w-4 animate-spin" /> : <ChevronRight className="h-4 w-4" />}
                      Save &amp; Next
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </main>
      </div>
    </div>
  );
}
