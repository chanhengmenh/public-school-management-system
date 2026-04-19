'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/components/auth/AuthProvider';
import { classesApi, analyticsApi, client } from '@/lib/api';
import { behaviorLogsApi, BehaviorLog } from '@/lib/api/behavior-logs';
import { ClassRanking, RankingEntry, Class } from '@/types/school.types';
import { User } from '@/types/user.types';
import {
  ShieldAlert,
  Users,
  Trophy,
  GraduationCap,
  Star,
  Loader2,
  Home,
  AlertCircle,
  Activity,
  X,
} from 'lucide-react';

const EVENT_LABELS: Record<string, { label: string; color: string }> = {
  keypress:    { label: 'Keypress',    color: 'bg-blue-50 text-blue-700 border-blue-200' },
  paste:       { label: 'Paste',       color: 'bg-amber-50 text-amber-700 border-amber-200' },
  focus_gain:  { label: 'Focus In',    color: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  focus_loss:  { label: 'Focus Out',   color: 'bg-red-50 text-red-700 border-red-200' },
  copy:        { label: 'Copy',        color: 'bg-purple-50 text-purple-700 border-purple-200' },
  cut:         { label: 'Cut',         color: 'bg-orange-50 text-orange-700 border-orange-200' },
};

function BehaviorLogModal({ student, onClose }: { student: User; onClose: () => void }) {
  const [logs, setLogs] = useState<BehaviorLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    behaviorLogsApi.list({ student_id: student.id })
      .then(setLogs)
      .catch(() => setLogs([]))
      .finally(() => setLoading(false));
  }, [student.id]);

  const counts = logs.reduce<Record<string, number>>((acc, l) => {
    acc[l.event_type] = (acc[l.event_type] ?? 0) + 1;
    return acc;
  }, {});

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-xl border border-slate-200 flex flex-col max-h-[80vh]">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-slate-800">Activity Logs — {student.full_name}</h3>
            <p className="text-xs text-slate-500 mt-0.5">{logs.length} total events</p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 p-1.5 rounded-full hover:bg-slate-100 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 overflow-y-auto flex-1">
          {loading ? (
            <div className="flex justify-center py-8"><Loader2 className="h-6 w-6 animate-spin text-orange-500" /></div>
          ) : logs.length === 0 ? (
            <p className="text-slate-400 text-sm text-center py-8">No behavior logs for this student.</p>
          ) : (
            <>
              {/* Summary */}
              <div className="flex flex-wrap gap-2 mb-4">
                {Object.entries(counts).map(([type, count]) => {
                  const style = EVENT_LABELS[type] ?? { label: type, color: 'bg-slate-100 text-slate-600 border-slate-200' };
                  return (
                    <span key={type} className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold border ${style.color}`}>
                      {style.label}: {count}
                    </span>
                  );
                })}
              </div>
              {/* Log table */}
              <div className="border border-slate-100 rounded-xl overflow-hidden">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-100">
                      <th className="text-left px-4 py-2 font-semibold text-slate-500">Event</th>
                      <th className="text-left px-4 py-2 font-semibold text-slate-500">Sub #</th>
                      <th className="text-left px-4 py-2 font-semibold text-slate-500">Time</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {logs.slice(0, 100).map(log => {
                      const style = EVENT_LABELS[log.event_type] ?? { label: log.event_type, color: 'bg-slate-100 text-slate-600 border-slate-200' };
                      return (
                        <tr key={log.id} className="hover:bg-slate-50">
                          <td className="px-4 py-2">
                            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold border ${style.color}`}>
                              {style.label}
                            </span>
                          </td>
                          <td className="px-4 py-2 text-slate-500">#{log.submission_id}</td>
                          <td className="px-4 py-2 text-slate-400">
                            {new Date(log.client_ts).toLocaleTimeString()}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              {logs.length > 100 && <p className="text-xs text-slate-400 mt-2 text-center">Showing first 100 of {logs.length} events</p>}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default function HomeTeacherStudentsPage() {
  const { user } = useAuth();

  const [homeClass, setHomeClass] = useState<Class | null>(null);
  const [students, setStudents] = useState<User[]>([]);
  const [ranking, setRanking] = useState<ClassRanking | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [noClassAssigned, setNoClassAssigned] = useState(false);
  const [logsStudent, setLogsStudent] = useState<User | null>(null);

  useEffect(() => {
    if (!user) return;
    if (!user.is_home_teacher) {
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        const classes = await classesApi.list();
        const myClass = classes.find((c) => c.home_teacher_id === user.id) ?? null;

        if (!myClass) {
          setNoClassAssigned(true);
          return;
        }

        setHomeClass(myClass);

        const [fetchedStudents, fetchedRanking] = await Promise.all([
          client.get<User[]>(`/classes/${myClass.id}/students`),
          analyticsApi.getHomeTeacherRanking(myClass.id),
        ]);

        setStudents(fetchedStudents);
        setRanking(fetchedRanking);
      } catch (err) {
        console.error('Failed to load students:', err);
        setError('Failed to load student data. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user]);

  if (!loading && user && !user.is_home_teacher) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-10 max-w-md w-full text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-orange-50 mb-5">
            <ShieldAlert className="w-8 h-8 text-orange-500" />
          </div>
          <h2 className="text-xl font-semibold text-slate-800 mb-2">Access Restricted</h2>
          <p className="text-slate-500 text-sm">
            This page is only available to teachers assigned as a home teacher.
          </p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3 text-slate-500">
          <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
          <span className="text-sm font-medium">Loading students…</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-10 max-w-md w-full text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-50 mb-5">
            <AlertCircle className="w-8 h-8 text-red-500" />
          </div>
          <h2 className="text-xl font-semibold text-slate-800 mb-2">Something went wrong</h2>
          <p className="text-slate-500 text-sm">{error}</p>
        </div>
      </div>
    );
  }

  if (noClassAssigned) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-10 max-w-md w-full text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-orange-50 mb-5">
            <Home className="w-8 h-8 text-orange-500" />
          </div>
          <h2 className="text-xl font-semibold text-slate-800 mb-2">No Home Class Assigned</h2>
          <p className="text-slate-500 text-sm">
            You have not been assigned as a home teacher for any class yet. Contact an administrator.
          </p>
        </div>
      </div>
    );
  }

  const rankingMap = new Map<number, RankingEntry>();
  ranking?.rankings.forEach((entry) => rankingMap.set(entry.student_id, entry));

  const sortedStudents = [...students].sort((a, b) => {
    const ra = rankingMap.get(a.id);
    const rb = rankingMap.get(b.id);
    if (ra && rb) return ra.rank - rb.rank;
    if (ra) return -1;
    if (rb) return 1;
    return a.full_name.localeCompare(b.full_name);
  });

  return (
    <div className="min-h-screen bg-slate-50 p-6 lg:p-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex flex-wrap items-center gap-3 mb-1">
          <h1 className="text-2xl font-bold text-slate-900">
            {homeClass?.name ?? 'My Home Class'}
          </h1>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-orange-100 text-orange-700 border border-orange-200">
            <Home className="w-3.5 h-3.5" />
            Home Teacher
          </span>
        </div>
        <p className="text-sm text-slate-500">
          Academic Year:{' '}
          <span className="font-medium text-slate-700">{homeClass?.academic_year ?? '—'}</span>
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-orange-50 flex items-center justify-center shrink-0">
            <Users className="w-6 h-6 text-orange-500" />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-400 uppercase tracking-wide">
              Total Students
            </p>
            <p className="text-3xl font-bold text-slate-900 leading-none mt-0.5">
              {students.length}
            </p>
          </div>
        </div>
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-orange-50 flex items-center justify-center shrink-0">
            <Trophy className="w-6 h-6 text-orange-500" />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-400 uppercase tracking-wide">
              Ranked Students
            </p>
            <p className="text-3xl font-bold text-slate-900 leading-none mt-0.5">
              {ranking?.rankings.length ?? 0}
              <span className="text-base font-normal text-slate-400 ml-1.5">
                / {students.length}
              </span>
            </p>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-2">
          <GraduationCap className="w-5 h-5 text-orange-500" />
          <h2 className="text-base font-semibold text-slate-800">Student Rankings</h2>
        </div>

        {sortedStudents.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-slate-400">
            <Users className="w-10 h-10 mb-3 opacity-40" />
            <p className="text-sm font-medium">No students enrolled yet</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide w-16">
                    Rank
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide hidden sm:table-cell">
                    Email
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-semibold text-slate-500 uppercase tracking-wide hidden md:table-cell">
                    Role
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-semibold text-slate-500 uppercase tracking-wide">
                    Total Score
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-semibold text-slate-500 uppercase tracking-wide hidden lg:table-cell">
                    Activity
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {sortedStudents.map((student) => {
                  const entry = rankingMap.get(student.id);
                  return (
                    <tr key={student.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        {entry ? (
                          <span
                            className={`inline-flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold ${
                              entry.rank === 1
                                ? 'bg-yellow-100 text-yellow-700'
                                : entry.rank === 2
                                ? 'bg-slate-100 text-slate-600'
                                : entry.rank === 3
                                ? 'bg-orange-100 text-orange-700'
                                : 'bg-slate-50 text-slate-500'
                            }`}
                          >
                            {entry.rank}
                          </span>
                        ) : (
                          <span className="text-slate-300 text-sm pl-2">—</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-orange-100 flex items-center justify-center text-orange-700 font-semibold text-sm shrink-0">
                            {student.full_name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-slate-800">
                              {student.full_name}
                            </p>
                            <p className="text-xs text-slate-400 sm:hidden">{student.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap hidden sm:table-cell">
                        <span className="text-sm text-slate-500">{student.email}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center hidden md:table-cell">
                        {student.is_class_monitor ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-orange-50 text-orange-700 border border-orange-200">
                            <Star className="w-3 h-3" />
                            Class Monitor
                          </span>
                        ) : (
                          <span className="text-xs text-slate-400">Student</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        {entry ? (
                          <div className="flex flex-col items-end">
                            <span className="text-sm font-bold text-slate-800">
                              {entry.total_score.toFixed(1)}
                            </span>
                            <span className="text-xs text-slate-400">
                              avg {entry.average_score.toFixed(1)}
                            </span>
                          </div>
                        ) : (
                          <span className="text-slate-300 text-sm">—</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right hidden lg:table-cell">
                        <button
                          onClick={() => setLogsStudent(student)}
                          className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium border border-slate-200 text-slate-500 rounded-lg hover:bg-slate-50 hover:text-orange-600 hover:border-orange-200 transition-colors"
                        >
                          <Activity className="w-3.5 h-3.5" /> Logs
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {logsStudent && (
        <BehaviorLogModal student={logsStudent} onClose={() => setLogsStudent(null)} />
      )}
    </div>
  );
}
