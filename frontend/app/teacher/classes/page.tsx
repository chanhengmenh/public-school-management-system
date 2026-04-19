"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Loader2, BookOpen, ChevronRight } from "lucide-react";
import { classSubjectsApi } from "@/lib/api";
import { ClassSubject } from "@/types/school.types";
import { useAuth } from "@/components/auth/AuthProvider";

export default function TeacherClassesPage() {
  const { user } = useAuth();
  const [classSubjects, setClassSubjects] = useState<ClassSubject[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;

    async function fetchClasses() {
      setLoading(true);
      setError(null);
      try {
        const data = await classSubjectsApi.list({ teacher_id: user!.id });
        setClassSubjects(data);
      } catch {
        setError("Failed to load your classes. Please try again.");
      } finally {
        setLoading(false);
      }
    }

    fetchClasses();
  }, [user]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[300px]">
        <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 lg:p-8">
        <div className="bg-red-50 border border-red-200 rounded-2xl p-6 text-red-700 text-sm">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8 bg-slate-50 min-h-screen">
      {/* Page header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">My Classes</h1>
        <p className="text-slate-500 mt-1 text-sm">Manage your assigned class subjects</p>
      </div>

      {/* Summary bar */}
      <div className="mb-6">
        <div className="inline-flex items-center gap-2 bg-white border border-slate-200 rounded-xl px-4 py-2 shadow-sm">
          <BookOpen className="h-4 w-4 text-orange-500" />
          <span className="text-sm font-medium text-slate-700">
            {classSubjects.length} class{classSubjects.length !== 1 ? "es" : ""} assigned
          </span>
        </div>
      </div>

      {/* Empty state */}
      {classSubjects.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="bg-white border border-slate-200 rounded-2xl p-10 shadow-sm max-w-sm">
            <BookOpen className="h-12 w-12 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-900 font-semibold mb-1">No classes assigned yet.</p>
            <p className="text-slate-500 text-sm">
              Contact your administrator to get classes assigned to you.
            </p>
          </div>
        </div>
      ) : (
        /* Class subject grid */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {classSubjects.map((cs) => (
            <Link
              key={cs.id}
              href={`/teacher/classes/${cs.id}`}
              className="group bg-white border border-slate-200 rounded-2xl shadow-sm p-6 hover:shadow-md hover:border-orange-300 transition-all duration-200"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-slate-900 text-base truncate group-hover:text-orange-600 transition-colors">
                    {cs.subject_name ?? "Unnamed Subject"}
                  </p>
                  <p className="text-slate-500 text-sm mt-1 truncate">
                    {cs.class_name ?? "Unknown Class"}
                  </p>
                </div>
                <ChevronRight className="h-5 w-5 text-slate-300 group-hover:text-orange-500 transition-colors flex-shrink-0 mt-0.5 ml-2" />
              </div>

              <div className="mt-4 pt-4 border-t border-slate-100 flex items-center gap-2">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-50 text-orange-700 border border-orange-100">
                  Teacher
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
