'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import {
  Loader2, AlertCircle, ChevronLeft, CheckCircle2,
  Clock, MessageSquare, FileText, Image, File, Download,
} from 'lucide-react';
import { assignmentsApi, submissionsApi, gradesApi, classSubjectsApi, client } from '@/lib/api';
import { fetchFileAsBlob } from '@/lib/api/files';
import { Grade } from '@/lib/api/grades';
import { Assignment, Submission, SubmissionFile } from '@/types/school.types';
import { User } from '@/types/user.types';

// ─── Inline file viewer (same pattern as student homework page) ─────────────
function FileTypeIcon({ mime }: { mime?: string }) {
  if (mime?.startsWith('image/')) return <Image className="w-4 h-4 text-purple-500" />;
  if (mime === 'application/pdf') return <FileText className="w-4 h-4 text-red-500" />;
  return <File className="w-4 h-4 text-blue-500" />;
}

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

  if (loadErr) return (
    <div className="flex items-center gap-2 p-3 bg-red-50 rounded-lg text-red-600 text-xs">
      <AlertCircle className="w-3.5 h-3.5 shrink-0" /> Could not load preview.
    </div>
  );
  if (!blobUrl) return (
    <div className="flex items-center gap-2 p-3 text-slate-400 text-xs">
      <Loader2 className="w-3.5 h-3.5 animate-spin" /> Loading…
    </div>
  );
  if (isImage) return (
    <div className="rounded-lg overflow-hidden border border-slate-100 max-w-sm">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={blobUrl} alt={name} className="max-w-full max-h-64 object-contain" />
    </div>
  );
  if (isPdf) return (
    <iframe src={blobUrl} title={name} className="w-full h-64 rounded-lg border border-slate-100" />
  );
  return (
    <a
      href={blobUrl}
      download={name}
      className="inline-flex items-center gap-2 px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-700 hover:bg-slate-100 transition-colors"
    >
      <Download className="w-4 h-4" /> Download {name}
    </a>
  );
}

// ─── Helpers ────────────────────────────────────────────────────────────────
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
  const cls = map[type] ?? map.text;
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${cls}`}>
      {labels[type] ?? type}
    </span>
  );
}

interface GradeFormState { score: string; feedback: string; }

// ─── Main page ───────────────────────────────────────────────────────────────
export default function TeacherSubmissionsPage() {
  const params = useParams();
  const subjectId = parseInt(params.subjectId as string, 10);
  const assignmentId = parseInt(params.assignmentId as string, 10);

  const [assignment, setAssignment] = useState<Assignment | null>(null);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [grades, setGrades] = useState<Grade[]>([]);
  const [studentMap, setStudentMap] = useState<Map<number, string>>(new Map());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Expanded text state: submission ids where content is fully shown
  const [expanded, setExpanded] = useState<Set<number>>(new Set());

  // Grading state
  const [gradingId, setGradingId] = useState<number | null>(null);
  const [gradeForm, setGradeForm] = useState<GradeFormState>({ score: '', feedback: '' });
  const [gradeFormError, setGradeFormError] = useState<string | null>(null);
  const [submittingGrade, setSubmittingGrade] = useState(false);

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
      const classId = cs.class_id;
      const students = await client.get<User[]>(`/classes/${classId}/students`);

      setAssignment(asgn);
      setSubmissions(subs);
      setGrades(gradesData);
      const map = new Map<number, string>();
      students.forEach((s: User) => map.set(s.id, s.full_name));
      setStudentMap(map);
    } catch {
      setError('Failed to load submissions. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [assignmentId, subjectId]);

  useEffect(() => { loadData(); }, [loadData]);

  const getGrade = (submissionId: number): Grade | undefined =>
    grades.find(g => g.submission_id === submissionId);

  const openGradeForm = (sub: Submission) => {
    const existing = getGrade(sub.id);
    setGradingId(sub.id);
    setGradeForm({
      score: existing ? String(existing.score) : '',
      feedback: existing?.feedback ?? '',
    });
    setGradeFormError(null);
  };

  const handleGradeSubmit = async (sub: Submission) => {
    setGradeFormError(null);
    const scoreNum = parseFloat(gradeForm.score);
    if (isNaN(scoreNum) || scoreNum < 0) {
      setGradeFormError('Score must be a non-negative number.');
      return;
    }
    if (assignment && scoreNum > assignment.max_score) {
      setGradeFormError(`Score cannot exceed max score (${assignment.max_score}).`);
      return;
    }
    setSubmittingGrade(true);
    try {
      const existing = getGrade(sub.id);
      let result: Grade;
      if (existing) {
        result = await gradesApi.update(existing.id, {
          score: scoreNum,
          feedback: gradeForm.feedback.trim() || undefined,
        });
        setGrades(prev => prev.map(g => g.id === existing.id ? result : g));
      } else {
        result = await gradesApi.create({
          submission_id: sub.id,
          score: scoreNum,
          feedback: gradeForm.feedback.trim() || undefined,
        });
        setGrades(prev => [...prev, result]);
      }
      setGradingId(null);
    } catch {
      setGradeFormError('Failed to save grade. Please try again.');
    } finally {
      setSubmittingGrade(false);
    }
  };

  const gradedCount = submissions.filter(s => getGrade(s.id) !== undefined).length;
  const pendingCount = submissions.length - gradedCount;

  // ─── Loading / error ────────────────────────────────────────────────────────
  if (loading) return (
    <div className="flex justify-center py-16">
      <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
    </div>
  );

  if (error || !assignment) return (
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

  // ─── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="max-w-5xl mx-auto p-6 space-y-6">

      {/* Back */}
      <Link
        href={`/teacher/classes/${subjectId}`}
        className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-slate-700 transition-colors"
      >
        <ChevronLeft className="h-4 w-4" />
        Back to Assignments
      </Link>

      {/* Assignment header */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-1 flex-wrap">
              <h1 className="text-2xl font-bold text-slate-900">{assignment.title}</h1>
              <StatusBadge status={assignment.status} />
              <SubmissionTypeBadge type={assignment.submission_type} />
            </div>
            {assignment.description && (
              <p className="text-slate-500 text-sm mt-1">{assignment.description}</p>
            )}
            <div className="flex flex-wrap items-center gap-4 mt-3 text-sm text-slate-500">
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
            </div>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Total Submissions', value: submissions.length, color: 'text-slate-700', bg: 'bg-white' },
          { label: 'Graded', value: gradedCount, color: 'text-emerald-700', bg: 'bg-emerald-50' },
          { label: 'Pending', value: pendingCount, color: 'text-orange-700', bg: 'bg-orange-50' },
        ].map(stat => (
          <div key={stat.label} className={`${stat.bg} border border-slate-200 rounded-2xl shadow-sm p-5 text-center`}>
            <p className={`text-3xl font-bold ${stat.color}`}>{stat.value}</p>
            <p className="text-sm text-slate-500 mt-1">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Submissions list */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100">
          <h2 className="font-bold text-slate-900">Student Submissions</h2>
        </div>

        {submissions.length === 0 ? (
          <div className="px-6 py-10 text-center text-slate-400 text-sm">
            No submissions yet for this assignment.
          </div>
        ) : (
          <div className="divide-y divide-slate-50">
            {submissions.map(sub => {
              const grade = getGrade(sub.id);
              const isGrading = gradingId === sub.id;
              const studentName = studentMap.get(sub.student_id) ?? `Student #${sub.student_id}`;
              const isExpanded = expanded.has(sub.id);
              const contentTruncated = sub.content && sub.content.length > 200;
              const displayContent = sub.content
                ? (isExpanded || !contentTruncated ? sub.content : sub.content.slice(0, 200) + '…')
                : null;

              return (
                <div key={sub.id} className="px-6 py-5 space-y-3">
                  {/* Row header */}
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <span className="font-semibold text-slate-800">{studentName}</span>
                        {sub.is_late && (
                          <span className="px-2 py-0.5 bg-red-50 text-red-600 text-xs font-semibold rounded-full">
                            LATE
                          </span>
                        )}
                        <SubmissionTypeBadge type={sub.submission_type} />
                        <span className="text-xs text-slate-400">
                          {new Date(sub.submitted_at).toLocaleString()}
                        </span>
                      </div>
                    </div>

                    {/* Grade display / button */}
                    <div className="shrink-0">
                      {grade && !isGrading ? (
                        <div className="flex items-center gap-2">
                          <div className="text-right">
                            <div className="flex items-center gap-1.5 justify-end">
                              <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                              <span className="font-bold text-slate-800 text-lg">
                                {grade.score}
                                <span className="text-sm font-normal text-slate-400">/{assignment.max_score}</span>
                              </span>
                            </div>
                            {grade.feedback && (
                              <p className="text-xs text-slate-400 flex items-center gap-1 mt-0.5 justify-end">
                                <MessageSquare className="h-3 w-3" /> Has feedback
                              </p>
                            )}
                          </div>
                          <button
                            onClick={() => openGradeForm(sub)}
                            className="px-3 py-1.5 border border-slate-200 text-slate-600 text-xs font-medium rounded-lg hover:bg-slate-50 transition-colors"
                          >
                            Edit
                          </button>
                        </div>
                      ) : !isGrading ? (
                        <button
                          onClick={() => openGradeForm(sub)}
                          className="px-4 py-2 bg-orange-500 text-white text-sm font-semibold rounded-xl hover:bg-orange-600 transition-colors"
                        >
                          Grade
                        </button>
                      ) : null}
                    </div>
                  </div>

                  {/* Text content */}
                  {displayContent && (
                    <div>
                      <p className="text-sm text-slate-600 bg-slate-50 rounded-xl px-3 py-2 whitespace-pre-wrap">
                        {displayContent}
                      </p>
                      {contentTruncated && (
                        <button
                          onClick={() => setExpanded(prev => {
                            const next = new Set(prev);
                            isExpanded ? next.delete(sub.id) : next.add(sub.id);
                            return next;
                          })}
                          className="mt-1 text-xs text-orange-600 hover:underline"
                        >
                          {isExpanded ? 'Show less' : 'Show more'}
                        </button>
                      )}
                    </div>
                  )}

                  {/* Attached files */}
                  {sub.files && sub.files.length > 0 && (
                    <div className="space-y-3">
                      {sub.files.map(f => (
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

                  {/* Feedback display (when graded, not editing) */}
                  {grade && !isGrading && grade.feedback && (
                    <div className="bg-emerald-50 border border-emerald-100 rounded-xl px-4 py-3">
                      <p className="text-xs font-medium text-emerald-700 uppercase tracking-wide mb-1">Feedback</p>
                      <p className="text-sm text-slate-700">{grade.feedback}</p>
                    </div>
                  )}

                  {/* Inline grade form */}
                  {isGrading && (
                    <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3">
                      <p className="text-sm font-semibold text-slate-700">
                        {getGrade(sub.id) ? 'Update Grade' : 'Grade Submission'}
                      </p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-medium text-slate-600 mb-1">
                            Score (0–{assignment.max_score}) <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="number"
                            min={0}
                            max={assignment.max_score}
                            value={gradeForm.score}
                            onChange={e => setGradeForm(prev => ({ ...prev, score: e.target.value }))}
                            className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
                            placeholder={`0–${assignment.max_score}`}
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-slate-600 mb-1">
                            Feedback (optional)
                          </label>
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
                        <button
                          onClick={() => handleGradeSubmit(sub)}
                          disabled={submittingGrade}
                          className="flex items-center gap-1.5 px-4 py-2 bg-orange-500 text-white text-sm font-medium rounded-lg hover:bg-orange-600 disabled:opacity-60 transition-colors"
                        >
                          {submittingGrade
                            ? <Loader2 className="h-4 w-4 animate-spin" />
                            : <CheckCircle2 className="h-4 w-4" />}
                          Save Grade
                        </button>
                        <button
                          onClick={() => setGradingId(null)}
                          disabled={submittingGrade}
                          className="px-4 py-2 border border-slate-200 text-slate-600 text-sm font-medium rounded-lg hover:bg-slate-50 disabled:opacity-60 transition-colors"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
