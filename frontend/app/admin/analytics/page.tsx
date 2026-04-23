'use client';

import { useEffect, useState } from 'react';
import PageHeader from '@/components/layouts/PageHeader';
import { analyticsApi, classesApi } from '@/lib/api';
import type { AdminOverview, ClassAnalytics, Class } from '@/types/school.types';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';

const BAR_COLORS = [
  '#0ea5e9',
  '#6366f1',
  '#10b981',
  '#f59e0b',
  '#ef4444',
  '#8b5cf6',
  '#ec4899',
  '#14b8a6',
];

export default function AdminAnalyticsPage() {
  const [overview, setOverview] = useState<AdminOverview | null>(null);
  const [classes, setClasses] = useState<Class[]>([]);
  const [selectedClassId, setSelectedClassId] = useState<number | null>(null);
  const [classAnalytics, setClassAnalytics] = useState<ClassAnalytics | null>(null);
  const [loadingOverview, setLoadingOverview] = useState(true);
  const [loadingClasses, setLoadingClasses] = useState(true);
  const [loadingAnalytics, setLoadingAnalytics] = useState(false);
  const [analyticsError, setAnalyticsError] = useState<string | null>(null);

  useEffect(() => {
    const fetchOverview = async () => {
      try {
        const data = await analyticsApi.getAdminOverview();
        setOverview(data);
      } catch (err) {
        console.error('Failed to fetch admin overview:', err);
      } finally {
        setLoadingOverview(false);
      }
    };

    const fetchClasses = async () => {
      try {
        const data = await classesApi.list();
        setClasses(data);
      } catch (err) {
        console.error('Failed to fetch classes:', err);
      } finally {
        setLoadingClasses(false);
      }
    };

    fetchOverview();
    fetchClasses();
  }, []);

  useEffect(() => {
    if (selectedClassId === null) {
      setClassAnalytics(null);
      return;
    }

    const fetchClassAnalytics = async () => {
      setLoadingAnalytics(true);
      setAnalyticsError(null);
      setClassAnalytics(null);
      try {
        const data = await analyticsApi.getClassAverages(selectedClassId);
        setClassAnalytics(data);
      } catch (err) {
        console.error('Failed to fetch class analytics:', err);
        setAnalyticsError('No analytics data available for this class.');
      } finally {
        setLoadingAnalytics(false);
      }
    };

    fetchClassAnalytics();
  }, [selectedClassId]);

  if (loadingOverview || loadingClasses) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-slate-200 border-t-slate-600 rounded-full animate-spin" />
          <p className="text-slate-500 text-sm">Loading analytics…</p>
        </div>
      </div>
    );
  }

  const overviewStats = overview
    ? [
        { label: 'Total Users', value: overview.total_users, text: 'text-sky-700' },
        { label: 'Students', value: overview.total_students, text: 'text-indigo-700' },
        { label: 'Teachers', value: overview.total_teachers, text: 'text-emerald-700' },
        { label: 'Assignments', value: overview.total_assignments, text: 'text-amber-700' },
        { label: 'Submissions', value: overview.total_submissions, text: 'text-violet-700' },
        { label: 'Submissions Today', value: overview.submissions_today, text: 'text-pink-700' },
        {
          label: 'System Avg Score',
          value:
            overview.average_system_score != null
              ? overview.average_system_score.toFixed(1)
              : 'N/A',
          text: 'text-teal-700',
        },
      ]
    : [];

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-6xl mx-auto space-y-8">
        <PageHeader
          title="System Analytics"
          subtitle="Platform-wide overview and per-class performance data"
        />

        {/* Overview Stats Grid */}
        <section>
          <h2 className="text-lg font-semibold text-slate-700 mb-4">System Overview</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {overviewStats.map((stat) => (
              <div
                key={stat.label}
                className="rounded-2xl border border-slate-200 bg-white p-5 flex flex-col gap-1 shadow-sm"
              >
                <span className="text-xs font-medium text-slate-500 uppercase tracking-wide">
                  {stat.label}
                </span>
                <span className={`text-2xl font-bold ${stat.text}`}>{stat.value}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Class Selector */}
        <section>
          <h2 className="text-lg font-semibold text-slate-700 mb-4">Class Analytics</h2>
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center gap-3">
              <label
                htmlFor="class-select"
                className="text-sm font-medium text-slate-600 whitespace-nowrap"
              >
                Select a class:
              </label>
              <select
                id="class-select"
                className="w-full sm:w-72 rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-400"
                value={selectedClassId ?? ''}
                onChange={(e) => {
                  const val = e.target.value;
                  setSelectedClassId(val === '' ? null : Number(val));
                }}
              >
                <option value="">-- Choose a class --</option>
                {classes.map((cls) => (
                  <option key={cls.id} value={cls.id}>
                    {cls.name} ({cls.academic_year})
                  </option>
                ))}
              </select>
              {classes.length === 0 && (
                <span className="text-slate-400 text-sm">No classes found.</span>
              )}
            </div>

            {loadingAnalytics && (
              <div className="flex items-center gap-3 py-8 justify-center">
                <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-500 rounded-full animate-spin" />
                <span className="text-slate-500 text-sm">Fetching class data…</span>
              </div>
            )}

            {!loadingAnalytics && analyticsError && (
              <div className="rounded-xl bg-rose-50 border border-rose-200 p-4 text-rose-600 text-sm">
                {analyticsError}
              </div>
            )}

            {!loadingAnalytics && selectedClassId === null && (
              <div className="text-center py-10 text-slate-400 text-sm">
                Select a class above to view its analytics.
              </div>
            )}

            {!loadingAnalytics && classAnalytics && !analyticsError && (
              <div className="space-y-6">
                {/* Summary row */}
                <div className="flex flex-wrap gap-4">
                  <div className="rounded-xl bg-slate-50 border border-slate-200 px-5 py-4">
                    <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">
                      Class
                    </p>
                    <p className="text-lg font-bold text-slate-800 mt-1">
                      {classAnalytics.class_name}
                    </p>
                  </div>
                  <div className="rounded-xl bg-sky-50 border border-sky-200 px-5 py-4">
                    <p className="text-xs font-medium text-sky-500 uppercase tracking-wide">
                      Overall Average
                    </p>
                    <p className="text-2xl font-bold text-sky-700 mt-1">
                      {classAnalytics.overall_average.toFixed(1)}
                      <span className="text-sm font-normal text-sky-400 ml-1">pts</span>
                    </p>
                  </div>
                  <div className="rounded-xl bg-indigo-50 border border-indigo-200 px-5 py-4">
                    <p className="text-xs font-medium text-indigo-500 uppercase tracking-wide">
                      Subjects
                    </p>
                    <p className="text-2xl font-bold text-indigo-700 mt-1">
                      {classAnalytics.subject_averages.length}
                    </p>
                  </div>
                </div>

                {classAnalytics.subject_averages.length > 0 ? (
                  <>
                    <div>
                      <h3 className="text-sm font-semibold text-slate-600 mb-3">
                        Average Score by Subject
                      </h3>
                      <div className="w-full h-64">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart
                            data={classAnalytics.subject_averages}
                            margin={{ top: 5, right: 20, left: 0, bottom: 40 }}
                          >
                            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                            <XAxis
                              dataKey="subject_name"
                              tick={{ fontSize: 11, fill: '#64748b' }}
                              angle={-30}
                              textAnchor="end"
                              interval={0}
                            />
                            <YAxis tick={{ fontSize: 11, fill: '#64748b' }} />
                            <Tooltip
                              // eslint-disable-next-line @typescript-eslint/no-explicit-any
                              formatter={(value: any) => {
                                const num = typeof value === 'number' ? value : undefined;
                                return num !== undefined
                                  ? [`${num.toFixed(1)} pts`, 'Avg Score']
                                  : ['N/A', 'Avg Score'];
                              }}
                              contentStyle={{
                                borderRadius: '0.75rem',
                                border: '1px solid #e2e8f0',
                                fontSize: '12px',
                              }}
                            />
                            <Bar dataKey="average_score" radius={[6, 6, 0, 0]}>
                              {classAnalytics.subject_averages.map((entry, index) => (
                                <Cell
                                  key={`cell-${entry.subject_id}`}
                                  fill={BAR_COLORS[index % BAR_COLORS.length]}
                                />
                              ))}
                            </Bar>
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-sm font-semibold text-slate-600 mb-3">
                        Subject Details
                      </h3>
                      <div className="overflow-x-auto rounded-xl border border-slate-200">
                        <table className="min-w-full text-sm">
                          <thead className="bg-slate-50">
                            <tr>
                              <th className="px-4 py-3 text-left font-medium text-slate-500">
                                Subject
                              </th>
                              <th className="px-4 py-3 text-right font-medium text-slate-500">
                                Avg Score
                              </th>
                              <th className="px-4 py-3 text-right font-medium text-slate-500">
                                Pass Rate
                              </th>
                              <th className="px-4 py-3 text-right font-medium text-slate-500">
                                Submissions
                              </th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100 bg-white">
                            {classAnalytics.subject_averages.map((subj) => (
                              <tr
                                key={subj.subject_id}
                                className="hover:bg-slate-50 transition-colors"
                              >
                                <td className="px-4 py-3 font-medium text-slate-700">
                                  {subj.subject_name}
                                </td>
                                <td className="px-4 py-3 text-right text-slate-600">
                                  {subj.average_score.toFixed(1)} pts
                                </td>
                                <td className="px-4 py-3 text-right">
                                  {subj.pass_rate != null ? (
                                    <span
                                      className={`inline-block px-2 py-0.5 rounded-full text-xs font-semibold ${
                                        subj.pass_rate >= 70
                                          ? 'bg-emerald-100 text-emerald-700'
                                          : subj.pass_rate >= 50
                                          ? 'bg-amber-100 text-amber-700'
                                          : 'bg-rose-100 text-rose-700'
                                      }`}
                                    >
                                      {subj.pass_rate.toFixed(1)}%
                                    </span>
                                  ) : (
                                    <span className="text-slate-400">N/A</span>
                                  )}
                                </td>
                                <td className="px-4 py-3 text-right text-slate-600">
                                  {subj.submission_count}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="text-center py-8 text-slate-400 text-sm">
                    No subject data available for this class yet.
                  </div>
                )}
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
