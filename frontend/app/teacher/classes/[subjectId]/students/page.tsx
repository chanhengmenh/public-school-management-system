"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import { Loader2, AlertCircle, Users, TrendingUp } from "lucide-react";
import { client, classSubjectsApi } from "@/lib/api";
import { User } from "@/types/user.types";

export default function TeacherSubjectStudentsPage() {
  const params = useParams();
  const subjectId = parseInt(params.subjectId as string, 10);

  const [students, setStudents] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadStudents = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const classSubject = await classSubjectsApi.getById(subjectId);
      const classId = classSubject.class_id;
      const data = await client.get<User[]>("/classes/" + classId + "/students");
      setStudents(data);
    } catch {
      setError("Failed to load students. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [subjectId]);

  useEffect(() => {
    loadStudents();
  }, [loadStudents]);

  function getInitial(name: string): string {
    return name.trim().charAt(0).toUpperCase();
  }

  const avatarColors = [
    "bg-orange-100 text-orange-700",
    "bg-blue-100 text-blue-700",
    "bg-emerald-100 text-emerald-700",
    "bg-purple-100 text-purple-700",
    "bg-rose-100 text-rose-700",
    "bg-amber-100 text-amber-700",
  ];

  function getAvatarColor(index: number): string {
    return avatarColors[index % avatarColors.length];
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[300px]">
        <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-3 text-slate-500">
        <AlertCircle className="h-8 w-8 text-red-400" />
        <p className="text-sm">{error}</p>
        <button
          onClick={loadStudents}
          className="text-sm text-orange-600 hover:underline"
        >
          Try again
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Students</h1>
          <p className="text-slate-500 text-sm mt-0.5">
            Class roster and student overview
          </p>
        </div>
        <div className="inline-flex items-center gap-2 bg-white border border-slate-200 rounded-xl px-4 py-2 shadow-sm">
          <Users className="h-4 w-4 text-orange-500" />
          <span className="text-sm font-medium text-slate-700">
            {students.length} student{students.length !== 1 ? "s" : ""}
          </span>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        {students.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <Users className="h-10 w-10 text-slate-300 mb-3" />
            <p className="text-slate-900 font-medium">No students enrolled</p>
            <p className="text-slate-500 text-sm mt-1">
              Students will appear here once enrolled in this class.
            </p>
          </div>
        ) : (
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="px-6 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider w-12">
                  #
                </th>
                <th className="px-6 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Student
                </th>
                <th className="px-6 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-6 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Monitor
                </th>
                <th className="px-6 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">
                  Score Trend
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {students.map((student, index) => (
                <tr key={student.id} className="hover:bg-slate-50 transition-colors">
                  {/* # */}
                  <td className="px-6 py-4 text-sm text-slate-400">
                    {index + 1}
                  </td>

                  {/* Student */}
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div
                        className={`h-9 w-9 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 ${getAvatarColor(index)}`}
                      >
                        {getInitial(student.full_name)}
                      </div>
                      <div>
                        <p className="font-medium text-slate-900 text-sm">
                          {student.full_name}
                        </p>
                      </div>
                    </div>
                  </td>

                  {/* Email */}
                  <td className="px-6 py-4 text-sm text-slate-500">
                    {student.email}
                  </td>

                  {/* Monitor badge */}
                  <td className="px-6 py-4">
                    {student.is_class_monitor ? (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-50 text-orange-700 border border-orange-200">
                        Monitor
                      </span>
                    ) : (
                      <span className="text-slate-300 text-xs">—</span>
                    )}
                  </td>

                  {/* Score trend link */}
                  <td className="px-6 py-4 text-right">
                    <a
                      href={`/teacher/classes/${subjectId}/analysis`}
                      className="inline-flex items-center gap-1 text-xs text-orange-600 hover:text-orange-700 hover:underline font-medium"
                    >
                      <TrendingUp className="h-3 w-3" />
                      Class Analysis
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
