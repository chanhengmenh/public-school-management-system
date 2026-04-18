"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { Calendar, ChevronDown, Clock, MapPin, Loader2, AlertCircle } from "lucide-react";
import { useAuth } from "@/components/auth/AuthProvider";
import { enrollmentsApi, schedulesApi } from "@/lib/api";
import { Schedule } from "@/lib/api/schedules";

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
  { bg: "bg-blue-50", borderL: "border-l-blue-500", borderAll: "border-blue-100", text: "text-blue-800" },
  { bg: "bg-orange-50", borderL: "border-l-orange-500", borderAll: "border-orange-100", text: "text-orange-800" },
  { bg: "bg-green-50", borderL: "border-l-green-500", borderAll: "border-green-100", text: "text-green-800" },
  { bg: "bg-purple-50", borderL: "border-l-purple-500", borderAll: "border-purple-100", text: "text-purple-800" },
  { bg: "bg-teal-50", borderL: "border-l-teal-500", borderAll: "border-teal-100", text: "text-teal-800" },
  { bg: "bg-red-50", borderL: "border-l-red-500", borderAll: "border-red-100", text: "text-red-800" },
  { bg: "bg-amber-50", borderL: "border-l-amber-500", borderAll: "border-amber-100", text: "text-amber-800" },
  { bg: "bg-pink-50", borderL: "border-l-pink-500", borderAll: "border-pink-100", text: "text-pink-800" },
];

function formatTime(t: string): string {
  const [h, m] = t.split(":");
  const hour = parseInt(h, 10);
  const ampm = hour >= 12 ? "PM" : "AM";
  const h12 = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
  return `${h12}:${m} ${ampm}`;
}

function hourKey(t: string): string {
  // Round down to hour
  const [h] = t.split(":");
  return `${h}:00`;
}

export default function StudentSchedulePage() {
  const { user } = useAuth();
  const [viewMode, setViewMode] = useState<"week" | "day">("week");
  const [selectedDay, setSelectedDay] = useState<string>("monday");
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadSchedule = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    setError(null);
    try {
      const enrollments = await enrollmentsApi.list({ student_id: user.id });
      if (enrollments.length === 0) {
        setSchedules([]);
        return;
      }
      // Fetch schedules for all enrolled classes
      const results = await Promise.all(
        enrollments.map((e) => schedulesApi.list({ class_id: e.class_id }))
      );
      setSchedules(results.flat());
    } catch {
      setError("Failed to load schedule. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadSchedule();
  }, [loadSchedule]);

  // Build a subject → color map
  const subjectColors = useMemo(() => {
    const map = new Map<string, (typeof PALETTE)[0]>();
    let idx = 0;
    for (const s of schedules) {
      const key = s.subject_name ?? `cs-${s.class_subject_id}`;
      if (!map.has(key)) {
        map.set(key, PALETTE[idx % PALETTE.length]);
        idx++;
      }
    }
    return map;
  }, [schedules]);

  // Build time slots (unique hours, sorted)
  const timeSlots = useMemo(() => {
    const hours = new Set<string>();
    for (const s of schedules) {
      hours.add(hourKey(s.start_time));
    }
    return Array.from(hours).sort();
  }, [schedules]);

  // Build a grid lookup: day → hour → Schedule[]
  const grid = useMemo(() => {
    const map = new Map<string, Map<string, Schedule[]>>();
    for (const day of DAYS) {
      map.set(day, new Map());
    }
    for (const s of schedules) {
      const dayMap = map.get(s.day_of_week);
      if (!dayMap) continue;
      const hk = hourKey(s.start_time);
      if (!dayMap.has(hk)) dayMap.set(hk, []);
      dayMap.get(hk)!.push(s);
    }
    return map;
  }, [schedules]);

  const displayedDays = viewMode === "week" ? DAYS : [selectedDay];
  const gridColsClass =
    viewMode === "week"
      ? "grid-cols-[80px_repeat(5,1fr)] md:grid-cols-[100px_repeat(5,1fr)] min-w-[900px]"
      : "grid-cols-[80px_1fr] md:grid-cols-[100px_1fr] min-w-[400px]";

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
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
    <div className="min-h-screen bg-slate-50">
      <header className="sticky top-0 z-30 bg-slate-50/80 backdrop-blur-md border-b border-slate-200/50 px-6 lg:px-8 py-6 mb-2">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-serif font-bold text-[#0f172a] tracking-tight">Schedule</h1>
            <p className="text-sm text-slate-500 mt-1">Weekly Timetable</p>
          </div>
        </div>
      </header>

      <div className="px-6 lg:px-8 pb-8 pt-6">
        {/* Top Action Bar */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div className="inline-flex items-center gap-2 bg-white px-4 py-2 rounded-xl border border-slate-200 shadow-sm text-sm font-bold text-slate-700">
            <Calendar className="w-4 h-4 text-slate-500 shrink-0" />
            <span>{schedules.length} class{schedules.length !== 1 ? "es" : ""} scheduled</span>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center bg-slate-100 rounded-xl p-1 text-sm font-bold text-slate-600 border border-slate-200">
              <button
                onClick={() => setViewMode("week")}
                className={`px-4 py-1.5 rounded-lg transition-colors ${viewMode === "week" ? "bg-white shadow-sm text-slate-800" : "hover:bg-slate-200 text-slate-500"}`}
              >
                Week
              </button>
              <button
                onClick={() => setViewMode("day")}
                className={`px-4 py-1.5 rounded-lg transition-colors ${viewMode === "day" ? "bg-white shadow-sm text-slate-800" : "hover:bg-slate-200 text-slate-500"}`}
              >
                Day
              </button>
            </div>

            {viewMode === "day" && (
              <select
                value={selectedDay}
                onChange={(e) => setSelectedDay(e.target.value)}
                className="px-3 py-2 rounded-xl border border-slate-200 bg-white text-sm text-slate-700 shadow-sm"
              >
                {DAYS.map((d) => (
                  <option key={d} value={d}>
                    {DAY_LABELS[d]}
                  </option>
                ))}
              </select>
            )}
          </div>
        </div>

        {schedules.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="bg-white border border-slate-200 rounded-2xl p-10 shadow-sm max-w-sm">
              <Calendar className="h-12 w-12 text-slate-300 mx-auto mb-4" />
              <p className="text-slate-900 font-semibold mb-1">No schedule yet</p>
              <p className="text-slate-500 text-sm">
                Your class schedule has not been set up. Contact your administrator.
              </p>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <div className={`grid ${gridColsClass}`}>
                {/* Header Row */}
                <div className="border-b border-r border-slate-200 bg-slate-50 text-xs font-bold text-slate-400 text-right pr-4 pb-2 flex flex-col justify-end">
                  Time / Day
                </div>

                {displayedDays.map((day, idx) => (
                  <div
                    key={day}
                    onClick={() => {
                      if (viewMode === "week") {
                        setViewMode("day");
                        setSelectedDay(day);
                      }
                    }}
                    className={`bg-slate-50 text-center text-xs font-bold text-slate-500 tracking-wider py-4 border-b border-slate-200 uppercase ${viewMode === "week" ? "cursor-pointer hover:bg-slate-200 transition-colors" : ""} ${idx !== displayedDays.length - 1 ? "border-r" : ""}`}
                  >
                    {DAY_LABELS[day]}
                  </div>
                ))}

                {/* Time Slots */}
                {timeSlots.map((slot) => (
                  <React.Fragment key={slot}>
                    <div className="text-sm font-medium text-slate-400 text-right pr-4 py-6 border-b border-r border-slate-100 flex flex-col items-end">
                      <span className="-mt-3 bg-white px-1 leading-none">
                        {formatTime(slot + ":00")}
                      </span>
                    </div>

                    {displayedDays.map((day, colIndex) => {
                      const entries = grid.get(day)?.get(slot) ?? [];
                      return (
                        <div
                          key={`${day}-${slot}`}
                          className={`border-b border-slate-50 p-2 min-h-[120px] ${colIndex !== displayedDays.length - 1 ? "border-r" : ""}`}
                        >
                          {entries.map((entry) => {
                            const colorKey = entry.subject_name ?? `cs-${entry.class_subject_id}`;
                            const color = subjectColors.get(colorKey) ?? PALETTE[0];
                            return (
                              <div
                                key={entry.id}
                                className={`h-full w-full rounded-xl p-3 flex flex-col justify-center border-y border-r border-l-4 ${color.bg} ${color.borderAll} ${color.borderL} hover:-translate-y-0.5 transition-transform cursor-default shadow-sm`}
                              >
                                <h4 className={`font-bold text-sm ${color.text} line-clamp-1`}>
                                  {entry.subject_name ?? "Unknown Subject"}
                                </h4>
                                <p className="text-xs text-slate-500 mt-1 line-clamp-1">
                                  {entry.teacher_name ?? "TBA"}
                                </p>
                                <div className="mt-1 text-xs text-slate-400 line-clamp-1">
                                  {formatTime(entry.start_time)} - {formatTime(entry.end_time)}
                                </div>
                                {entry.room && (
                                  <div className="mt-1.5 flex items-center gap-1 text-xs text-slate-400 font-medium">
                                    <MapPin className="w-3 h-3 shrink-0" />
                                    <span>{entry.room}</span>
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      );
                    })}
                  </React.Fragment>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
