"use client";

import React, { useState, useRef, useMemo } from "react";
import { Calendar, ChevronDown } from 'lucide-react';
import PageHeader from '@/components/layouts/PageHeader';
import { MOCK_SCHEDULES_DB } from '@/lib/mock-data/schedule';
import { useAuthStore } from '@/store/useAuthStore';
import type { WeekDay } from '@/types/school.types';
import { ScheduleGrid, ScheduleGridEvent } from '@/components/ui/ScheduleGrid';

const DAYS: WeekDay[] = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

export default function StudentSchedulePage() {
    const { user } = useAuthStore();
    const [viewMode, setViewMode] = useState<'week' | 'day'>('week');
    const [selectedDay, setSelectedDay] = useState<WeekDay>('Monday');
    const [currentDate, setCurrentDate] = useState<string>('');
    const dateInputRef = useRef<HTMLInputElement>(null);

    const activeSchedule = MOCK_SCHEDULES_DB[user?.classId ?? 'class_11A'] || MOCK_SCHEDULES_DB['class_11A'];

    const mappedEvents: ScheduleGridEvent[] = useMemo(() => {
        return activeSchedule.map(entry => ({
            id: entry.id,
            title: entry.subject,
            subtitle: entry.teacher,
            location: entry.room,
            day: entry.day,
            startTime: entry.time,
        }));
    }, [activeSchedule]);

    return (
        <div className="min-h-screen bg-slate-50">
            <PageHeader
                title="Schedule"
                subtitle="Term 2 · Weekly Timetable"
            />

            <div className="px-6 lg:px-8 pb-8 pt-6">
                {/* Top Action Bar */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                    {/* Calendar Button */}
                    <button
                        onClick={() => dateInputRef.current?.showPicker?.()}
                        className="relative flex items-center gap-2 bg-white px-4 py-2 rounded-xl border border-slate-200 shadow-sm text-sm font-bold text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
                    >
                        <Calendar className="w-4 h-4 text-slate-500 shrink-0" />
                        <span className="whitespace-nowrap">
                            {currentDate
                                ? new Date(currentDate + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                                : "June 2 - June 6, 2025"}
                        </span>
                        <ChevronDown className="w-4 h-4 text-slate-400 shrink-0 ml-1" />
                        <input
                            ref={dateInputRef}
                            type="date"
                            className="absolute inset-0 w-full h-full opacity-0 pointer-events-none"
                            value={currentDate}
                            onChange={(e) => setCurrentDate(e.target.value)}
                        />
                    </button>

                    {/* View Toggles */}
                    <div className="flex flex-wrap items-center gap-3">
                        <div className="flex items-center bg-slate-100 rounded-xl p-1 text-sm font-bold text-slate-600 border border-slate-200">
                            <button
                                onClick={() => setViewMode('week')}
                                className={`px-4 py-1.5 rounded-lg transition-colors ${viewMode === 'week' ? 'bg-white shadow-sm text-slate-800' : 'hover:bg-slate-200 text-slate-500'}`}
                            >
                                Week
                            </button>
                            <button
                                onClick={() => setViewMode('day')}
                                className={`px-4 py-1.5 rounded-lg transition-colors ${viewMode === 'day' ? 'bg-white shadow-sm text-slate-800' : 'hover:bg-slate-200 text-slate-500'}`}
                            >
                                Day
                            </button>
                        </div>
                    </div>
                </div>

                {viewMode === 'day' && (
                    <div className="flex items-center gap-2 mb-6">
                        {DAYS.map((day) => (
                            <button
                                key={day}
                                onClick={() => setSelectedDay(day)}
                                className={`px-4 py-2 rounded-xl text-sm font-bold transition-colors ${selectedDay === day ? 'bg-indigo-600 text-white shadow-sm' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'}`}
                            >
                                {day.slice(0, 3)}
                            </button>
                        ))}
                    </div>
                )}

                {/* Timetable Grid */}
                <ScheduleGrid events={mappedEvents} viewMode={viewMode} selectedDay={selectedDay} />
            </div>
        </div>
    );
}