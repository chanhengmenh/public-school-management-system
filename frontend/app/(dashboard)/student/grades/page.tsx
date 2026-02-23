"use client";

import { studentData } from "@/data/student-data";
import { cn } from "@/lib/utils";
import { BookOpen, Award, ClipboardList, FileText, CalendarCheck, GraduationCap, GripVertical } from "lucide-react";

interface GradeItem {
    title: string;
    score: number;
    max: number;
    date: string;
}

interface SubjectGrade {
    overall: number; // This will be recalculated
    breakdown: {
        assignments: GradeItem[];
        quizzes: GradeItem[];
        attendance: { score: number; max: number; label: string };
        exams: GradeItem[];
    };
}

// Weights for grade calculation
const WEIGHTS = {
    assignments: 0.3,
    quizzes: 0.2,
    attendance: 0.1,
    exams: 0.4,
};

export default function StudentGradesPage() {
    const { subjects } = studentData;
    const grades = (studentData as unknown as { grades: Record<string, SubjectGrade> }).grades;

    const getGradeLabel = (score: number) => {
        if (score >= 90) return "A";
        if (score >= 80) return "B+";
        if (score >= 70) return "B";
        if (score >= 60) return "C";
        return "D";
    };

    const getGradeColor = (score: number) => {
        if (score >= 90) return "text-green-600 bg-green-50 border-green-200";
        if (score >= 80) return "text-blue-600 bg-blue-50 border-blue-200";
        if (score >= 70) return "text-yellow-600 bg-yellow-50 border-yellow-200";
        return "text-red-600 bg-red-50 border-red-200";
    };

    const getScoreBarColor = (score: number) => {
        if (score >= 90) return "bg-green-500";
        if (score >= 80) return "bg-blue-500";
        if (score >= 70) return "bg-yellow-500";
        return "bg-red-500";
    };

    // Helper to calculate average percentage for a list of items
    const calculateCategoryAverage = (items: GradeItem[]) => {
        if (items.length === 0) return 0;
        const total = items.reduce((acc, item) => acc + (item.score / item.max), 0);
        return (total / items.length) * 100;
    };

    // Calculate overall grade based on weights
    const calculateOverallGrade = (grade: SubjectGrade) => {
        const assignmentsAvg = calculateCategoryAverage(grade.breakdown.assignments);
        const quizzesAvg = calculateCategoryAverage(grade.breakdown.quizzes);
        const examsAvg = calculateCategoryAverage(grade.breakdown.exams);

        // Attendance is single item
        const attendanceScore = (grade.breakdown.attendance.score / grade.breakdown.attendance.max) * 100;

        const weightedScore =
            (assignmentsAvg * WEIGHTS.assignments) +
            (quizzesAvg * WEIGHTS.quizzes) +
            (attendanceScore * WEIGHTS.attendance) +
            (examsAvg * WEIGHTS.exams);

        // Adjust for missing categories if needed (simple version: just sum)
        // A more complex version would re-distribute weights if a category has no items.
        // For now, we assume if no exams, that part is 0. 
        // Better approach for UI: If no exams yet, maybe re-distribute or just show current standing?
        // Let's stick to simple weighted sum for now, but maybe normalize if categories are completely empty?
        // Actually, usually in schools, if you haven't taken exams, your grade is lower until you do.
        // But for "Subject Progress", often it's "Current Grade" based on what's been graded.

        // Let's implement "Current Grade" logic: Only count categories that have at least one graded item (or are attendance)
        let totalWeight = WEIGHTS.attendance; // Attendance is always present
        let currentWeightedSum = attendanceScore * WEIGHTS.attendance;

        if (grade.breakdown.assignments.length > 0) {
            totalWeight += WEIGHTS.assignments;
            currentWeightedSum += assignmentsAvg * WEIGHTS.assignments;
        }
        if (grade.breakdown.quizzes.length > 0) {
            totalWeight += WEIGHTS.quizzes;
            currentWeightedSum += quizzesAvg * WEIGHTS.quizzes;
        }
        if (grade.breakdown.exams.length > 0) {
            totalWeight += WEIGHTS.exams;
            currentWeightedSum += examsAvg * WEIGHTS.exams;
        }

        return totalWeight > 0 ? Math.round(currentWeightedSum / totalWeight) : 0;
    };

    // Recalculate all grades for display
    const calculatedGrades: Record<string, number> = {};
    subjects.forEach(sub => {
        if (grades[sub.id]) {
            calculatedGrades[sub.id] = calculateOverallGrade(grades[sub.id]);
        }
    });

    // Calculate overall GPA from the new calculated grades
    const allOveralls = Object.values(calculatedGrades);
    const overallAverage = allOveralls.length > 0
        ? Math.round(allOveralls.reduce((a, b) => a + b, 0) / allOveralls.length)
        : 0;

    return (
        <div className="space-y-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-gray-900">Grades</h1>
                    <p className="text-sm text-gray-500 mt-1">Detailed weighted overview of your academic performance.</p>
                </div>
                {/* Overall Average Badge */}
                <div className={cn("flex items-center gap-3 rounded-xl border px-5 py-3", getGradeColor(overallAverage))}>
                    <GraduationCap className="h-6 w-6" />
                    <div>
                        <p className="text-xs font-medium opacity-75">Overall Average</p>
                        <p className="text-2xl font-bold">{overallAverage}% <span className="text-base">({getGradeLabel(overallAverage)})</span></p>
                    </div>
                </div>
            </div>

            {/* Weights Legend */}
            <div className="flex flex-wrap gap-4 text-xs text-gray-500 bg-gray-50 p-4 rounded-lg border border-gray-100">
                <span className="font-semibold text-gray-700">Grading Weights:</span>
                <span className="flex items-center gap-1"><ClipboardList className="h-3 w-3" /> Assignments {WEIGHTS.assignments * 100}%</span>
                <span className="flex items-center gap-1"><FileText className="h-3 w-3" /> Quizzes {WEIGHTS.quizzes * 100}%</span>
                <span className="flex items-center gap-1"><CalendarCheck className="h-3 w-3" /> Attendance {WEIGHTS.attendance * 100}%</span>
                <span className="flex items-center gap-1"><GraduationCap className="h-3 w-3" /> Exams {WEIGHTS.exams * 100}%</span>
            </div>

            {/* Per-Subject Grades */}
            {subjects.map((subject) => {
                const subjectGrade = grades[subject.id];
                if (!subjectGrade) return null;

                const overallScore = calculatedGrades[subject.id];

                return (
                    <div key={subject.id} className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
                        {/* Subject Header */}
                        <div className="flex items-center justify-between border-b border-gray-200 bg-gray-50 px-6 py-4">
                            <div className="flex items-center gap-3">
                                <div className={cn("rounded-lg p-2 text-white", subject.color)}>
                                    <BookOpen className="h-5 w-5" />
                                </div>
                                <div>
                                    <h2 className="text-lg font-semibold text-gray-900">{subject.name}</h2>
                                    <p className="text-xs text-gray-500">{subject.teacher}</p>
                                </div>
                            </div>
                            <div className={cn("flex items-center gap-2 rounded-lg border px-4 py-2 font-bold", getGradeColor(overallScore))}>
                                <Award className="h-5 w-5" />
                                {overallScore}% ({getGradeLabel(overallScore)})
                            </div>
                        </div>

                        {/* Breakdown */}
                        <div className="p-6 grid gap-6 md:grid-cols-2">
                            {/* Assignments */}
                            <GradeSection
                                title="Assignments"
                                weightLabel={`${WEIGHTS.assignments * 100}%`}
                                icon={<ClipboardList className="h-4 w-4 text-purple-600" />}
                                items={subjectGrade.breakdown.assignments}
                                getScoreBarColor={getScoreBarColor}
                            />

                            {/* Quizzes */}
                            <GradeSection
                                title="Quizzes"
                                weightLabel={`${WEIGHTS.quizzes * 100}%`}
                                icon={<FileText className="h-4 w-4 text-blue-600" />}
                                items={subjectGrade.breakdown.quizzes}
                                getScoreBarColor={getScoreBarColor}
                            />

                            {/* Exams */}
                            <GradeSection
                                title="Exams"
                                weightLabel={`${WEIGHTS.exams * 100}%`}
                                icon={<GraduationCap className="h-4 w-4 text-orange-600" />}
                                items={subjectGrade.breakdown.exams}
                                getScoreBarColor={getScoreBarColor}
                            />

                            {/* Attendance */}
                            <div>
                                <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center justify-between">
                                    <span className="flex items-center gap-2">
                                        <CalendarCheck className="h-4 w-4 text-green-600" />
                                        {subjectGrade.breakdown.attendance.label}
                                    </span>
                                    <span className="text-xs font-normal text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
                                        {WEIGHTS.attendance * 100}%
                                    </span>
                                </h3>
                                <div className="rounded-lg border border-gray-100 p-4">
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-sm text-gray-600">Score</span>
                                        <span className="text-sm font-bold text-gray-900">
                                            {subjectGrade.breakdown.attendance.score}/{subjectGrade.breakdown.attendance.max}
                                        </span>
                                    </div>
                                    <div className="h-2 w-full rounded-full bg-gray-100">
                                        <div
                                            className={cn("h-full rounded-full transition-all", getScoreBarColor(subjectGrade.breakdown.attendance.score))}
                                            style={{ width: `${(subjectGrade.breakdown.attendance.score / subjectGrade.breakdown.attendance.max) * 100}%` }}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}

// Reusable Grade Section Component
function GradeSection({
    title,
    weightLabel,
    icon,
    items,
    getScoreBarColor,
}: {
    title: string;
    weightLabel: string;
    icon: React.ReactNode;
    items: GradeItem[];
    getScoreBarColor: (score: number) => string;
}) {
    if (items.length === 0) {
        return (
            <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center justify-between">
                    <span className="flex items-center gap-2">
                        {icon} {title}
                    </span>
                    <span className="text-xs font-normal text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
                        {weightLabel}
                    </span>
                </h3>
                <p className="text-xs text-gray-400 italic">No {title.toLowerCase()} graded yet.</p>
            </div>
        );
    }

    return (
        <div>
            <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center justify-between">
                <span className="flex items-center gap-2">
                    {icon} {title}
                </span>
                <span className="text-xs font-normal text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
                    {weightLabel}
                </span>
            </h3>
            <div className="space-y-3">
                {items.map((item, index) => (
                    <div key={index} className="rounded-lg border border-gray-100 p-3">
                        <div className="flex items-center justify-between mb-1.5">
                            <span className="text-sm font-medium text-gray-900">{item.title}</span>
                            <span className="text-sm font-bold text-gray-900">{item.score}/{item.max}</span>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="flex-1 h-1.5 rounded-full bg-gray-100">
                                <div
                                    className={cn("h-full rounded-full transition-all", getScoreBarColor(item.score))}
                                    style={{ width: `${(item.score / item.max) * 100}%` }}
                                />
                            </div>
                            <span className="text-xs text-gray-400 whitespace-nowrap">
                                {new Date(item.date).toLocaleDateString()}
                            </span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
