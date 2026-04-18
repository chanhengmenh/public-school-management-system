"use client";

import React, { useEffect, useState, useCallback, useMemo } from "react";
import { Loader2, Calendar, MapPin, AlertCircle, Clock } from "lucide-react";
import { useAuth } from "@/components/auth/AuthProvider";
import { schedulesApi } from "@/lib/api";
import { Schedule } from "@/lib/api/schedules";
import Link from "next/link";

const DAYS = ["monday", "tuesday", "wednesday", "thursday", "friday"] as const;
const DAY_LABELS: Record<string, string> = {
  monday: "Monday",
  tuesday: "Tuesday",
  wednesday: "Wednesday",
  thursday: "Thursday",
  friday: "Friday",
  saturday: "Saturday",
  sunday: "Sunday",
};

const PALETTE = [
  "border-l-orange-400",
  "border-l-blue-400",
  "border-l-emerald-400",
  "border-l-purple-400",
  "border-l-rose-400",
  "border-l-amber-400",
  "border-l-teal-400",
  "border-l-pink-400",
];

function formatTime(t: string): string {
  const [h, m] = t.split(":");
  const hour = parseInt(h, 10);
  const ampm = hour >= 12 ? "PM" : "AM";
  const h12 = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
  return `${h12}:${m} ${ampm}`;
}

export default function TeacherSchedulePage() {
  const { user } = useAuth();
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadSchedule = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    setError(null);
    try {
      const data = await schedulesApi.list({ teacher_id: user.id });
      setSchedules(data);
    } catch {
      setError("Failed to load schedule. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadSchedule();
  }, [loadSchedule]);

  // Group by day
  const byDay = useMemo(() => {
    const map = new Map<string, Schedule[]>();
    for (const day of DAYS) {
      map.set(day, []);
    }
    for (const s of schedules) {
      const arr = map.get(s.day_of_week);
      if (arr) arr.push(s);
    }
    // Sort each day by start_time
    for (const arr of map.values()) {
      arr.sort((a, b) => a.start_time.localeCompare(b.start_time));
    }
    return map;
  }, [schedules]);

  // Subject → color index
  const subjectColorIdx = useMemo(() => {
    const map = new Map<number, number>();
    let idx = 0;
    for (const s of schedules) {
      if (!map.has(s.class_subject_id)) {
        map.set(s.class_subject_id, idx++);
      }
    }
    return map;
  }, [schedules]);

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
        <div className="flex flex-col items-center justify-center py-16 gap-2 text-slate-500">
          <AlertCircle className="h-8 w-8 text-red-400" />
          <p>{error}</p>
          <button
            onClick={loadSchedule}
            className="mt-2 px-4 py-2 bg-orange-500 text-white rounded-lg text-sm hover:bg-orange-600 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8 bg-slate-50 min-h-screen">
      {/* Page header */}
      <div className="mb-8 flex items-start gap-4">
        <div className="p-3 bg-orange-50 border border-orange-100 rounded-xl flex-shrink-0">
          <Calendar className="h-6 w-6 text-orange-500" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">My Schedule</h1>
          <p className="text-slate-500 mt-1 text-sm">
            Your teaching schedule for the current term
          </p>
        </div>
      </div>

      {/* Summary */}
      <div className="mb-6">
        <div className="inline-flex items-center gap-2 bg-white border border-slate-200 rounded-xl px-4 py-2 shadow-sm">
          <Clock className="h-4 w-4 text-orange-500" />
          <span className="text-sm font-medium text-slate-700">
            {schedules.length} session{schedules.length !== 1 ? "s" : ""} per week
          </span>
        </div>
      </div>

      {schedules.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="bg-white border border-slate-200 rounded-2xl p-10 shadow-sm max-w-sm">
            <Calendar className="h-12 w-12 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-900 font-semibold mb-1">No schedule yet</p>
            <p className="text-slate-500 text-sm">
              Contact your administrator to set up your teaching schedule.
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {DAYS.map((day) => {
            const entries = byDay.get(day) ?? [];
            if (entries.length === 0) return null;

            return (
              <div key={day}>
                <h2 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-3">
                  {DAY_LABELS[day]}
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {entries.map((entry) => {
                    const colorIdx = subjectColorIdx.get(entry.class_subject_id) ?? 0;
                    const colorClass = PALETTE[colorIdx % PALETTE.length];

                    return (
                      <Link
                        key={entry.id}
                        href={`/teacher/classes/${entry.class_subject_id}`}
                        className={`bg-white border border-slate-200 border-l-4 ${colorClass} rounded-2xl shadow-sm p-5 hover:shadow-md transition-shadow`}
                      >
                        <div className="mb-2">
                          <p className="font-semibold text-slate-900 text-base">
                            {entry.subject_name ?? "Unnamed Subject"}
                          </p>
                          <p className="text-slate-500 text-sm mt-0.5">
                            {entry.class_name ?? "Unknown Class"}
                          </p>
                        </div>

                        <div className="flex items-center gap-1.5 text-sm text-slate-600">
                          <Clock className="h-3.5 w-3.5 text-slate-400" />
                          <span>
                            {formatTime(entry.start_time)} - {formatTime(entry.end_time)}
                          </span>
                        </div>

                        {entry.room && (
                          <div className="flex items-center gap-1.5 text-sm text-slate-500 mt-1">
                            <MapPin className="h-3.5 w-3.5 text-slate-400" />
                            <span>{entry.room}</span>
                          </div>
                        )}
                      </Link>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
