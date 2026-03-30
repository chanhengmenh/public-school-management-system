'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useAuthStore } from '@/store/useAuthStore';
import { getTeacherData } from '@/lib/mock-data/teacher';
import {
    SUBJECTS,
    MONTHS,
    studentMatrixData,
    analyticsKpis,
    getSubjectBarData,
    getRadarData,
    getAttendanceLineData,
    getStudentAttendanceBars,
    getMonthlyAttendanceSummary,
    fetchSubjectData,
    fetchAttendanceByMonth,
} from '@/lib/mock-data/analytics';
import type { SubjectName } from '@/lib/mock-data/analytics';
import PageHeader from '@/components/layouts/PageHeader';
import { Card, Badge, Modal } from '@/components/ui';
import {
    Target,
    TrendingUp,
    TrendingDown,
    AlertCircle,
    Users,
    BarChart3,
    CalendarDays,
    Loader2,
} from 'lucide-react';

// ─── Grade color helpers ─────────────────────────────────────────────

function gradeColor(score: number) {
    if (score >= 90) return { bg: 'bg-emerald-100', text: 'text-emerald-800', label: 'A' };
    if (score >= 80) return { bg: 'bg-blue-100', text: 'text-blue-800', label: 'B' };
    if (score >= 70) return { bg: 'bg-amber-100', text: 'text-amber-800', label: 'C' };
    return { bg: 'bg-red-100', text: 'text-red-800', label: 'D' };
}

// ─── Loading skeleton ────────────────────────────────────────────────

function ChartSkeleton() {
    return (
        <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 text-slate-300 animate-spin" />
        </div>
    );
}

// ─── Subject view types ──────────────────────────────────────────────

type SubjectView = 'grouped-subject' | 'radar';
type AttendanceView = 'line' | 'student-bar';

// ═════════════════════════════════════════════════════════════════════
// MAIN PAGE COMPONENT
// ═════════════════════════════════════════════════════════════════════

export default function HomeClassAnalyticsPage() {
    const { user } = useAuthStore();
    const teacherData = getTeacherData(user?.id ?? 'teacher_001');

    // ── View toggles ────────────────────────────────────────────────
    const [subjectView, setSubjectView] = useState<SubjectView>('grouped-subject');
    const [attendanceView, setAttendanceView] = useState<AttendanceView>('line');

    // ── Loading states (simulate API) ───────────────────────────────
    const [isLoadingSubject, setIsLoadingSubject] = useState(false);
    const [isLoadingAttendance, setIsLoadingAttendance] = useState(false);

    // ── Modal state ─────────────────────────────────────────────────
    const [modalOpen, setModalOpen] = useState(false);
    const [modalTitle, setModalTitle] = useState('');

    const openGradeModal = useCallback((studentName: string, subject: string) => {
        setModalTitle(`Full Grade History: ${studentName} — ${subject}`);
        setModalOpen(true);
    }, []);

    // ── Subject view switching with simulated loading ───────────────
    useEffect(() => {
        let cancelled = false;
        setIsLoadingSubject(true);
        fetchSubjectData(subjectView).then(() => {
            if (!cancelled) setIsLoadingSubject(false);
        });
        return () => { cancelled = true; };
    }, [subjectView]);

    // ── Attendance view switching with simulated loading ────────────
    useEffect(() => {
        let cancelled = false;
        setIsLoadingAttendance(true);
        fetchAttendanceByMonth(attendanceView).then(() => {
            if (!cancelled) setIsLoadingAttendance(false);
        });
        return () => { cancelled = true; };
    }, [attendanceView]);

    // ── Memoized data ───────────────────────────────────────────────
    const subjectBarData = useMemo(() => getSubjectBarData(), []);
    const radarData = useMemo(() => getRadarData(), []);
    const lineData = useMemo(() => getAttendanceLineData(), []);
    const studentBars = useMemo(() => getStudentAttendanceBars(), []);
    const monthlySummary = useMemo(() => getMonthlyAttendanceSummary(), []);

    // ── Guard ───────────────────────────────────────────────────────
    if (!teacherData?.homeClass) {
        return (
            <div className="min-h-screen bg-slate-50 p-6 lg:p-8 flex items-center justify-center">
                <Card className="p-10 flex flex-col items-center justify-center text-center max-w-md w-full border-red-100 shadow-sm">
                    <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mb-4">
                        <AlertCircle className="w-8 h-8" />
                    </div>
                    <h2 className="text-2xl font-bold text-slate-900 mb-2">Access Denied</h2>
                    <p className="text-slate-500 max-w-sm">You are not assigned as a Home-Class Teacher.</p>
                </Card>
            </div>
        );
    }

    const kpis = analyticsKpis;

    return (
        <div className="min-h-screen bg-slate-50 font-sans">
            <PageHeader
                title="Class Analytics"
                subtitle={`Performance insights for ${teacherData.homeClass.name}`}
            />

            <div className="max-w-[1400px] mx-auto w-full px-6 lg:px-8 pb-12 pt-6 flex flex-col gap-6">

                {/* ═══════════════════════════════════════════════════════════
            SECTION 1 — TOP KPI HEADER
        ═══════════════════════════════════════════════════════════ */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {/* Class Average */}
                    <Card className="p-5 flex flex-col border-slate-200 shadow-sm">
                        <div className="flex items-center justify-between mb-3">
                            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Class Average</span>
                            <div className="w-9 h-9 rounded-full bg-blue-50 text-blue-500 flex items-center justify-center shrink-0">
                                <Target className="w-4 h-4" />
                            </div>
                        </div>
                        <span className="text-4xl font-extrabold text-slate-900 tracking-tight">{kpis.classAverage}</span>
                        <span className="text-xs text-slate-400 mt-1">across all subjects</span>
                    </Card>

                    {/* Highest Subject */}
                    <Card className="p-5 flex flex-col border-slate-200 shadow-sm">
                        <div className="flex items-center justify-between mb-3">
                            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Highest Subject</span>
                            <div className="w-9 h-9 rounded-full bg-emerald-50 text-emerald-500 flex items-center justify-center shrink-0">
                                <TrendingUp className="w-4 h-4" />
                            </div>
                        </div>
                        <span className="text-2xl font-extrabold text-slate-900 truncate" title={kpis.highestSubject.name}>{kpis.highestSubject.name}</span>
                        <span className="text-xs text-emerald-600 font-semibold mt-1">avg {kpis.highestSubject.avg}</span>
                    </Card>

                    {/* Needs Support */}
                    <Card className="p-5 flex flex-col border-slate-200 shadow-sm">
                        <div className="flex items-center justify-between mb-3">
                            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Needs Support</span>
                            <div className="w-9 h-9 rounded-full bg-red-50 text-red-500 flex items-center justify-center shrink-0">
                                <TrendingDown className="w-4 h-4" />
                            </div>
                        </div>
                        <span className="text-2xl font-extrabold text-red-600 truncate" title={kpis.needsSupport.name}>{kpis.needsSupport.name}</span>
                        <span className="text-xs text-red-500 font-semibold mt-1">avg {kpis.needsSupport.avg}</span>
                    </Card>

                    {/* At-Risk Students */}
                    <Card className="p-5 flex flex-col border-slate-200 shadow-sm">
                        <div className="flex items-center justify-between mb-3">
                            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">At-Risk Students</span>
                            <div className="w-9 h-9 rounded-full bg-amber-50 text-amber-500 flex items-center justify-center shrink-0">
                                <Users className="w-4 h-4" />
                            </div>
                        </div>
                        <span className="text-4xl font-extrabold text-slate-900 tracking-tight">{kpis.atRiskCount}</span>
                        <span className="text-xs text-slate-400 mt-1">scored below 70</span>
                    </Card>
                </div>

                {/* ═══════════════════════════════════════════════════════════
            SECTION 2 — SUBJECT PERFORMANCE (3 Switchable Views)
        ═══════════════════════════════════════════════════════════ */}
                <Card className="p-0 border-slate-200 shadow-sm overflow-hidden bg-white">
                    <div className="p-5 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between flex-wrap gap-3">
                        <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                            <BarChart3 className="w-5 h-5 text-slate-400" />
                            Subject Performance
                        </h3>
                        <select
                            id="subject-view-select"
                            value={subjectView}
                            onChange={e => setSubjectView(e.target.value as SubjectView)}
                            className="text-sm border border-slate-200 rounded-lg px-3 py-1.5 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-colors"
                        >
                            <option value="grouped-subject">Grouped by Subject</option>
                            <option value="radar">Radar Chart</option>
                        </select>
                    </div>

                    <div className="p-5 min-h-[320px]">
                        {isLoadingSubject ? <ChartSkeleton /> : (
                            <>
                                {subjectView === 'grouped-subject' && <GroupedSubjectView data={subjectBarData} />}
                                {subjectView === 'radar' && <RadarChartView data={radarData} />}
                            </>
                        )}
                    </div>
                </Card>

                {/* ═══════════════════════════════════════════════════════════
            SECTION 3 — SCORE HEAT MAP MATRIX
        ═══════════════════════════════════════════════════════════ */}
                <Card className="p-0 border-slate-200 shadow-sm overflow-hidden bg-white">
                    <div className="p-5 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between flex-wrap gap-4">
                        <h3 className="text-lg font-bold text-slate-900">Score heat map — all students × all subjects</h3>
                        <div className="flex items-center gap-4 flex-wrap">
                            {[
                                { label: 'A (90-100)', bg: 'bg-emerald-100', border: 'border-emerald-200' },
                                { label: 'B (80-89)', bg: 'bg-blue-100', border: 'border-blue-200' },
                                { label: 'C (70-79)', bg: 'bg-amber-100', border: 'border-amber-200' },
                                { label: 'D (<70)', bg: 'bg-red-100', border: 'border-red-200' },
                            ].map(item => (
                                <div key={item.label} className="flex items-center gap-1.5">
                                    <div className={`w-3 h-3 rounded ${item.bg} border ${item.border}`} />
                                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-tighter">{item.label}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className="p-5">
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left whitespace-nowrap">
                                <thead className="text-xs text-slate-500 uppercase bg-slate-50/50 border-b border-slate-200">
                                    <tr>
                                        <th className="px-4 py-3 sticky left-0 bg-slate-50/80 z-10 font-bold border-r border-slate-200">Student Name</th>
                                        {SUBJECTS.map(sub => (
                                            <th key={sub} className="px-4 py-3 font-semibold text-center">{sub}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {studentMatrixData.map(student => (
                                        <tr key={student.id} className="hover:bg-slate-50/60 transition-colors">
                                            <td className="px-4 py-2.5 sticky left-0 bg-white z-10 font-medium text-slate-800 border-r border-slate-200">
                                                {student.name}
                                            </td>
                                            {SUBJECTS.map(sub => {
                                                const score = student.scores[sub as SubjectName];
                                                const colors = gradeColor(score);
                                                return (
                                                    <td key={sub} className="px-2 py-2 text-center">
                                                        <button
                                                            onClick={() => openGradeModal(student.name, sub)}
                                                            className={`w-14 h-8 mx-auto flex items-center justify-center rounded-full text-xs font-bold ${colors.bg} ${colors.text} hover:ring-2 hover:ring-offset-1 hover:ring-slate-300 transition-all cursor-pointer`}
                                                            title={`${student.name} — ${sub}: ${score}`}
                                                        >
                                                            {score}
                                                        </button>
                                                    </td>
                                                );
                                            })}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </Card>

                {/* ═══════════════════════════════════════════════════════════
            SECTION 4 — ATTENDANCE (3 Switchable Views)
        ═══════════════════════════════════════════════════════════ */}
                <Card className="p-0 border-slate-200 shadow-sm overflow-hidden bg-white">
                    <div className="p-5 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between flex-wrap gap-3">
                        <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                            <CalendarDays className="w-5 h-5 text-slate-400" />
                            Attendance Overview
                        </h3>
                        <select
                            id="attendance-view-select"
                            value={attendanceView}
                            onChange={e => setAttendanceView(e.target.value as AttendanceView)}
                            className="text-sm border border-slate-200 rounded-lg px-3 py-1.5 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-colors"
                        >
                            <option value="line">Monthly Trend (Line)</option>
                            <option value="student-bar">Per-Student Bar</option>
                        </select>
                    </div>

                    <div className="p-5 min-h-[320px]">
                        {isLoadingAttendance ? <ChartSkeleton /> : (
                            <>
                                {attendanceView === 'line' && <AttendanceLineView data={lineData} />}
                                {attendanceView === 'student-bar' && <AttendanceStudentBarView data={studentBars} />}
                            </>
                        )}
                    </div>
                </Card>

                {/* ═══════════════════════════════════════════════════════════
            SECTION 5 — MONTHLY ATTENDANCE SUMMARY (Bottom)
        ═══════════════════════════════════════════════════════════ */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
                    {monthlySummary.map(m => (
                        <Card key={m.month} className="p-4 border-slate-200 shadow-sm">
                            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">{m.month}</div>
                            <div className="text-2xl font-extrabold text-slate-900">{m.attendanceRate}%</div>
                            <div className="text-xs text-slate-400 mt-1">
                                {m.totalAbsences} absences · {m.totalLate} late
                            </div>
                        </Card>
                    ))}
                </div>

            </div>

            {/* ── Grade History Modal ──────────────────────────────────── */}
            <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={modalTitle}>
                <div className="flex flex-col gap-4">
                    <p className="text-slate-500">
                        Detailed grade history and trend analysis will be displayed here when connected to the backend API.
                    </p>
                    <div className="grid grid-cols-2 gap-3">
                        {['Semester 1', 'Semester 2', 'Mid-Term', 'Final'].map(period => (
                            <div key={period} className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-center">
                                <div className="text-xs font-semibold text-slate-400 uppercase">{period}</div>
                                <div className="text-lg font-bold text-slate-700 mt-1">—</div>
                            </div>
                        ))}
                    </div>
                </div>
            </Modal>
        </div>
    );
}

// ═════════════════════════════════════════════════════════════════════
// SUB-COMPONENTS — Subject Views
// ═════════════════════════════════════════════════════════════════════

/** View A: Grouped Bar by Subject — Class Avg vs Top Score */
function GroupedSubjectView({ data }: { data: ReturnType<typeof getSubjectBarData> }) {
    const maxScore = 100;
    return (
        <div className="flex flex-col gap-4">
            {/* Legend */}
            <div className="flex items-center gap-5 mb-2">
                <div className="flex items-center gap-1.5">
                    <div className="w-3 h-3 rounded bg-blue-400" />
                    <span className="text-xs font-semibold text-slate-500">Class Avg</span>
                </div>
                <div className="flex items-center gap-1.5">
                    <div className="w-3 h-3 rounded bg-emerald-400" />
                    <span className="text-xs font-semibold text-slate-500">Top Score</span>
                </div>
            </div>

            {data.map(item => (
                <div key={item.subject} className="flex items-center gap-3">
                    <div className="w-24 shrink-0 text-sm font-medium text-slate-600 truncate" title={item.subject}>
                        {item.subject}
                    </div>
                    <div className="flex-1 flex flex-col gap-1">
                        {/* Class Avg bar */}
                        <div className="flex items-center gap-2">
                            <div className="flex-1 h-4 bg-slate-100 rounded-full overflow-hidden border border-black/5">
                                <div
                                    className="h-full bg-blue-400 rounded-full transition-all duration-700 ease-out"
                                    style={{ width: `${(item.classAvg / maxScore) * 100}%` }}
                                />
                            </div>
                            <span className="text-xs font-bold text-blue-600 w-10 text-right">{item.classAvg}</span>
                        </div>
                        {/* Top Score bar */}
                        <div className="flex items-center gap-2">
                            <div className="flex-1 h-4 bg-slate-100 rounded-full overflow-hidden border border-black/5">
                                <div
                                    className="h-full bg-emerald-400 rounded-full transition-all duration-700 ease-out"
                                    style={{ width: `${(item.topScore / maxScore) * 100}%` }}
                                />
                            </div>
                            <span className="text-xs font-bold text-emerald-600 w-10 text-right">{item.topScore}</span>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}

/** View B: Radar Chart — SVG heptagon of class averages */
function RadarChartView({ data }: { data: ReturnType<typeof getRadarData> }) {
    const cx = 100, cy = 100, maxR = 75;
    const n = data.length;

    // Calculate polygon coordinates for a given radius
    const polygon = (radius: number) =>
        data.map((_, i) => {
            const angle = (Math.PI * 2 * i) / n - Math.PI / 2;
            return `${cx + radius * Math.cos(angle)},${cy + radius * Math.sin(angle)}`;
        }).join(' ');

    // Data polygon
    const dataPolygon = data.map((d, i) => {
        const r = (d.value / 100) * maxR;
        const angle = (Math.PI * 2 * i) / n - Math.PI / 2;
        return `${cx + r * Math.cos(angle)},${cy + r * Math.sin(angle)}`;
    }).join(' ');

    // Axis endpoints
    const axes = data.map((d, i) => {
        const angle = (Math.PI * 2 * i) / n - Math.PI / 2;
        return {
            x: cx + maxR * Math.cos(angle),
            y: cy + maxR * Math.sin(angle),
            labelX: cx + (maxR + 18) * Math.cos(angle),
            labelY: cy + (maxR + 18) * Math.sin(angle),
            subject: d.subject,
            value: d.value,
        };
    });

    return (
        <div className="flex items-center justify-center">
            <svg viewBox="-20 -15 240 230" className="w-full max-w-[420px]">
                {/* Web background rings */}
                {[0.2, 0.4, 0.6, 0.8, 1.0].map(scale => (
                    <polygon
                        key={scale}
                        points={polygon(maxR * scale)}
                        fill="none"
                        stroke="#e2e8f0"
                        strokeWidth="0.5"
                    />
                ))}

                {/* Axis lines */}
                {axes.map((a, i) => (
                    <line key={i} x1={cx} y1={cy} x2={a.x} y2={a.y} stroke="#cbd5e1" strokeWidth="0.5" />
                ))}

                {/* Data polygon */}
                <polygon
                    points={dataPolygon}
                    fill="rgba(59,130,246,0.15)"
                    stroke="#3b82f6"
                    strokeWidth="1.5"
                />

                {/* Data dots */}
                {data.map((d, i) => {
                    const r = (d.value / 100) * maxR;
                    const angle = (Math.PI * 2 * i) / n - Math.PI / 2;
                    return (
                        <circle
                            key={i}
                            cx={cx + r * Math.cos(angle)}
                            cy={cy + r * Math.sin(angle)}
                            r="2.5"
                            fill="#3b82f6"
                        />
                    );
                })}

                {/* Labels */}
                {axes.map((a, i) => (
                    <text
                        key={i}
                        x={a.labelX}
                        y={a.labelY}
                        textAnchor="middle"
                        dominantBaseline="central"
                        className="text-[6px] font-semibold fill-slate-500"
                    >
                        {a.subject === 'English' ? 'Eng' : a.subject === 'Biology' ? 'Bio' : a.subject.substring(0, 4)} ({a.value})
                    </text>
                ))}
            </svg>
        </div>
    );
}

// ═════════════════════════════════════════════════════════════════════
// SUB-COMPONENTS — Attendance Views
// ═════════════════════════════════════════════════════════════════════

/** View A: Monthly Trend Line Chart */
function AttendanceLineView({ data }: { data: ReturnType<typeof getAttendanceLineData> }) {
    const svgW = 800, svgH = 200;
    const padL = 80, padR = 40, padT = 20, padB = 40;
    const chartW = svgW - padL - padR;
    const chartH = svgH - padT - padB;
    const n = data.length;

    const toX = (i: number) => padL + (i / (n - 1)) * chartW;
    const toY = (val: number) => padT + chartH - (val / 100) * chartH;

    const lines: { key: string; color: string; values: number[] }[] = [
        { key: 'Present', color: '#10b981', values: data.map(d => d.presentPct) },
        { key: 'Absent', color: '#ef4444', values: data.map(d => d.absentPct) },
        { key: 'Late', color: '#f59e0b', values: data.map(d => d.latePct) },
    ];

    return (
        <div className="flex flex-col gap-4">
            {/* Legend */}
            <div className="flex items-center gap-5 justify-start">
                {lines.map(l => (
                    <div key={l.key} className="flex items-center gap-1.5">
                        <div className="w-2 h-1 rounded-full" style={{ backgroundColor: l.color }} />
                        <span className="text-[7px] font-semibold text-slate-500">{l.key}</span>
                    </div>
                ))}
            </div>

            <svg viewBox={`0 0 ${svgW} ${svgH}`} className="w-full">
                {/* Horizontal grid lines */}
                {[0, 25, 50, 75, 100].map(v => (
                    <g key={v}>
                        <line x1={padL} y1={toY(v)} x2={svgW - padR} y2={toY(v)} stroke="#e2e8f0" strokeWidth="0.75" />
                        <text x={padL - 16} y={toY(v)} textAnchor="end" dominantBaseline="central" className="text-[7px] fill-slate-400 font-medium">
                            {v}%
                        </text>
                    </g>
                ))}

                {/* Lines + dots */}
                {lines.map(l => (
                    <g key={l.key}>
                        <polyline
                            fill="none"
                            stroke={l.color}
                            strokeWidth="2"
                            strokeLinejoin="round"
                            strokeLinecap="round"
                            points={l.values.map((v, i) => `${toX(i)},${toY(v)}`).join(' ')}
                        />
                        {l.values.map((v, i) => (
                            <circle key={i} cx={toX(i)} cy={toY(v)} r="3.5" fill={l.color} />
                        ))}
                    </g>
                ))}

                {/* X-axis labels */}
                {data.map((d, i) => (
                    <text key={d.month} x={toX(i)} y={svgH - 20} textAnchor="middle" className="text-[8px] font-bold fill-slate-600">
                        {d.month}
                    </text>
                ))}
            </svg>
        </div>
    );
}

/** View B: Per-Student Horizontal Bar with Warning logic */
function AttendanceStudentBarView({ data }: { data: ReturnType<typeof getStudentAttendanceBars> }) {
    // Color intensity based on attendance %
    const barColor = (pct: number) => {
        if (pct >= 90) return '#10b981';
        if (pct >= 80) return '#3b82f6';
        if (pct >= 75) return '#f59e0b';
        return '#ef4444';
    };

    return (
        <div className="flex flex-col gap-2 max-h-[500px] overflow-y-auto pr-2">
            {/* Month headers */}
            <div className="flex items-center gap-3 sticky top-0 bg-white py-2 z-10 border-b border-slate-100">
                <div className="w-40 shrink-0" />
                {MONTHS.map(m => (
                    <div key={m} className="flex-1 text-center text-[10px] font-bold text-slate-500 uppercase">{m}</div>
                ))}
            </div>

            {data.map(student => (
                <div key={student.studentId} className="flex items-center gap-3 group">
                    <div className="w-40 shrink-0 flex items-center gap-2">
                        <span className="text-xs font-medium text-slate-600 truncate" title={student.studentName}>
                            {student.studentName}
                        </span>
                        {student.hasWarning && <Badge variant="error" className="text-[9px] px-1.5 py-0">Warning</Badge>}
                    </div>
                    {student.months.map(m => (
                        <div key={m.month} className="flex-1 flex items-center gap-1">
                            <div
                                className="h-5 rounded-sm flex items-center justify-center text-[9px] font-bold text-white transition-opacity opacity-80 group-hover:opacity-100"
                                style={{
                                    width: `${m.attendancePct}%`,
                                    minWidth: '24px',
                                    backgroundColor: barColor(m.attendancePct),
                                }}
                                title={`${m.month}: ${m.attendancePct}%`}
                            >
                                {m.attendancePct}%
                            </div>
                        </div>
                    ))}
                </div>
            ))}
        </div>
    );
}
