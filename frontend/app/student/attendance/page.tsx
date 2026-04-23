'use client';

import React, { useState, useEffect, useCallback } from 'react';
import PageHeader from '@/components/layouts/PageHeader';
import {
  Loader2,
  AlertCircle,
  ClipboardCheck,
  ShieldAlert,
  CheckCircle2,
} from 'lucide-react';
import { useAuth } from '@/components/auth/AuthProvider';
import { enrollmentsApi, classSubjectsApi, client } from '@/lib/api';
import { Enrollment, ClassSubject } from '@/types/school.types';
import { User } from '@/types/user.types';

type AttendanceStatus = 'present' | 'absent' | 'late' | 'excused';

interface AttendanceEntry {
  student_id: number;
  status: AttendanceStatus;
}

const STATUS_CONFIG: Record<AttendanceStatus, { label: string; active: string; inactive: string }> = {
  present:  { label: 'Present',  active: 'bg-emerald-50 border-emerald-300 text-emerald-700 shadow-sm', inactive: 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50' },
  absent:   { label: 'Absent',   active: 'bg-red-50 border-red-300 text-red-700 shadow-sm',             inactive: 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50' },
  late:     { label: 'Late',     active: 'bg-amber-50 border-amber-300 text-amber-700 shadow-sm',       inactive: 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50' },
  excused:  { label: 'Excused',  active: 'bg-blue-50 border-blue-300 text-blue-700 shadow-sm',          inactive: 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50' },
};

const ALL_STATUSES: AttendanceStatus[] = ['present', 'absent', 'late', 'excused'];

function getInitials(name: string): string {
  return name
    .split(' ')
    .map(p => p[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
}

export default function AttendancePage() {
  const { user } = useAuth();

  const [enrollment, setEnrollment] = useState<Enrollment | null>(null);
  const [students, setStudents] = useState<User[]>([]);
  const [classSubjects, setClassSubjects] = useState<ClassSubject[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [date, setDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [selectedSubjectId, setSelectedSubjectId] = useState<number | ''>('');
  const [attendance, setAttendance] = useState<Record<number, AttendanceStatus>>({});

  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const loadData = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    setError(null);
    try {
      const enrollments = await enrollmentsApi.list({ student_id: user.id });
      if (enrollments.length === 0) {
        setError('You are not enrolled in any class.');
        setLoading(false);
        return;
      }
      const myEnrollment = enrollments[0];
      setEnrollment(myEnrollment);

      const [studentsData, subjectsData] = await Promise.all([
        client.get<User[]>(`/classes/${myEnrollment.class_id}/students`),
        classSubjectsApi.list({ class_id: myEnrollment.class_id }),
      ]);

      setStudents(studentsData);
      setClassSubjects(subjectsData);

      if (subjectsData.length > 0) {
        setSelectedSubjectId(subjectsData[0].id);
      }

      // Default all students to 'present'
      const defaultAttendance: Record<number, AttendanceStatus> = {};
      studentsData.forEach(s => { defaultAttendance[s.id] = 'present'; });
      setAttendance(defaultAttendance);
    } catch {
      setError('Failed to load class data. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleStatusChange = (studentId: number, status: AttendanceStatus) => {
    setAttendance(prev => ({ ...prev, [studentId]: status }));
    setSubmitSuccess(false);
  };

  const handleSubmit = async () => {
    if (!enrollment) return;
    setSubmitError(null);
    setSubmitting(true);
    try {
      const entries: AttendanceEntry[] = students.map(s => ({
        student_id: s.id,
        status: attendance[s.id] ?? 'present',
      }));
      await client.post('/attendance/batch', {
        class_id: enrollment.class_id,
        date,
        entries,
      });
      setSubmitSuccess(true);
    } catch {
      setSubmitError('Failed to submit attendance. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const summaryCounts = ALL_STATUSES.reduce<Record<AttendanceStatus, number>>(
    (acc, s) => {
      acc[s] = Object.values(attendance).filter(v => v === s).length;
      return acc;
    },
    { present: 0, absent: 0, late: 0, excused: 0 }
  );

  // Guard: not a class monitor
  if (user && !user.is_class_monitor) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-10 max-w-md w-full text-center">
          <div className="w-14 h-14 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <ShieldAlert className="h-7 w-7 text-red-500" />
          </div>
          <h1 className="text-xl font-bold text-slate-900 mb-2">Access Denied</h1>
          <p className="text-slate-500 text-sm">
            This page is for class monitors only. If you believe this is an error,
            please contact your teacher.
          </p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-2 text-slate-500">
        <AlertCircle className="h-8 w-8 text-red-400" />
        <p>{error}</p>
        <button
          onClick={loadData}
          className="mt-2 px-4 py-2 bg-orange-500 text-white rounded-lg text-sm hover:bg-orange-600 transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-4xl mx-auto px-6 lg:px-8 py-8 space-y-6">

        <PageHeader
          title="Mark Attendance"
          badge={
            <span className="flex items-center gap-1.5 px-2.5 py-1 bg-orange-50 text-orange-600 text-xs font-semibold rounded-full border border-orange-200">
              <ClipboardCheck className="h-3.5 w-3.5" />
              Class Monitor
            </span>
          }
        />

        {enrollment && (
          <p className="text-sm text-slate-500 -mt-2">
            Class: <span className="font-semibold text-slate-700">{enrollment.class_name}</span>
          </p>
        )}

        {/* Success Toast */}
        {submitSuccess && (
          <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 flex items-center gap-3">
            <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" />
            <p className="text-emerald-700 font-medium text-sm">
              Attendance submitted successfully!
            </p>
          </div>
        )}

        {/* Session Details */}
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6">
          <h2 className="text-base font-bold text-slate-900 mb-4">Session Details</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-slate-700">Date</label>
              <input
                type="date"
                value={date}
                onChange={e => setDate(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-orange-400 transition-all"
              />
            </div>
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-slate-700">Subject</label>
              <select
                value={selectedSubjectId}
                onChange={e => setSelectedSubjectId(e.target.value ? parseInt(e.target.value, 10) : '')}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-orange-400 transition-all appearance-none"
              >
                <option value="">— Select subject —</option>
                {classSubjects.map(cs => (
                  <option key={cs.id} value={cs.id}>
                    {cs.subject_name ?? `Subject ${cs.subject_id}`}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Summary Row */}
        <div className="grid grid-cols-4 gap-3">
          {ALL_STATUSES.map(s => (
            <div key={s} className="bg-white border border-slate-200 rounded-xl p-3 text-center shadow-sm">
              <p className="text-2xl font-bold text-slate-800">{summaryCounts[s]}</p>
              <p className="text-xs text-slate-500 capitalize mt-0.5">{STATUS_CONFIG[s].label}</p>
            </div>
          ))}
        </div>

        {/* Student Roster */}
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100">
            <h2 className="font-bold text-slate-900">
              Student Roster
              <span className="ml-2 text-sm font-normal text-slate-400">
                ({students.length} students)
              </span>
            </h2>
          </div>

          {students.length === 0 ? (
            <div className="px-6 py-10 text-center text-slate-400 text-sm">
              No students found in your class.
            </div>
          ) : (
            <div className="divide-y divide-slate-50">
              {students.map(student => {
                const currentStatus = attendance[student.id] ?? 'present';
                return (
                  <div
                    key={student.id}
                    className="px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50/50 transition-colors"
                  >
                    {/* Student Info */}
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-100 to-orange-200 text-orange-700 flex items-center justify-center font-bold text-sm shrink-0">
                        {getInitials(student.full_name)}
                      </div>
                      <div>
                        <p className="font-semibold text-slate-800 text-sm">{student.full_name}</p>
                        <p className="text-xs text-slate-400">{student.email}</p>
                      </div>
                    </div>

                    {/* Status Buttons */}
                    <div className="flex flex-wrap items-center gap-2 sm:ml-auto">
                      {ALL_STATUSES.map(status => (
                        <button
                          key={status}
                          onClick={() => handleStatusChange(student.id, status)}
                          className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold border transition-colors ${
                            currentStatus === status
                              ? STATUS_CONFIG[status].active
                              : STATUS_CONFIG[status].inactive
                          }`}
                        >
                          {STATUS_CONFIG[status].label}
                        </button>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Submit */}
        <div className="border-t border-slate-200 pt-4">
          {submitError && (
            <p className="text-sm text-red-600 flex items-center gap-1 mb-3">
              <AlertCircle className="h-4 w-4" />
              {submitError}
            </p>
          )}
          <div className="flex justify-end">
            <button
              onClick={handleSubmit}
              disabled={submitting || students.length === 0}
              className="flex items-center gap-2 px-6 py-2.5 bg-orange-500 text-white font-semibold rounded-xl hover:bg-orange-600 disabled:opacity-60 transition-colors shadow-sm"
            >
              {submitting ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <ClipboardCheck className="h-5 w-5" />
              )}
              Submit Attendance
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
