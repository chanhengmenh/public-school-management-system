'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/components/auth/AuthProvider';
import { classesApi, analyticsApi, client } from '@/lib/api';
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
} from 'lucide-react';

export default function HomeTeacherStudentsPage() {
  const { user } = useAuth();

  const [homeClass, setHomeClass] = useState<Class | null>(null);
  const [students, setStudents] = useState<User[]>([]);
  const [ranking, setRanking] = useState<ClassRanking | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [noClassAssigned, setNoClassAssigned] = useState(false);

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
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
