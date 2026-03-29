"use client";

import React, { useState, useRef, useMemo } from "react";
import { Calendar, ChevronDown, Clock, MapPin } from 'lucide-react';
import PageHeader from '@/components/layouts/PageHeader';
import { Card } from '@/components/ui';
import { MOCK_SCHEDULES_DB } from '@/lib/mock-data/schedule';
import { useAuthStore } from '@/store/useAuthStore';
import { getSubjectTheme } from '@/lib/utils';
import type { WeekDay } from '@/types/school.types';

const DAYS: WeekDay[] = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
const TIME_SLOTS = [
    "08:00 AM", "09:00 AM", "10:00 AM", "11:00 AM",
    "12:00 PM",
    "01:00 PM", "02:00 PM", "03:00 PM",
];

const LUNCH_TIME = "12:00 PM";

export default function StudentSchedulePage() {
    const { user } = useAuthStore();
    const [viewMode, setViewMode] = useState<'week' | 'day'>('week');
    const [selectedDay, setSelectedDay] = useState<WeekDay>('Monday');
    const [currentDate, setCurrentDate] = useState<string>('');
    const dateInputRef = useRef<HTMLInputElement>(null);

    const displayedDays = viewMode === 'week' ? DAYS : [selectedDay];

    const activeSchedule = MOCK_SCHEDULES_DB[user?.classId ?? 'class_11A'] || MOCK_SCHEDULES_DB['class_11A'];

    // Build a lookup: `${day}-${time}` → ScheduleEntry
    const scheduleMap = useMemo(() => {
        const map = new Map<string, typeof activeSchedule[0]>();
        for (const entry of activeSchedule) {
            map.set(`${entry.day}-${entry.time}`, entry);
        }
        return map;
    }, [activeSchedule]);

    const gridColsClass = viewMode === 'week'
        ? "grid-cols-[80px_repeat(5,1fr)] md:grid-cols-[100px_repeat(5,1fr)] min-w-[900px]"
        : "grid-cols-[80px_1fr] md:grid-cols-[100px_1fr] min-w-[400px]";

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

                {/* Timetable Grid */}
                <Card className="overflow-hidden !p-0">
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
                                        if (viewMode === 'week') {
                                            setViewMode('day');
                                            setSelectedDay(day);
                                        }
                                    }}
                                    className={`bg-slate-50 text-center text-xs font-bold text-slate-500 tracking-wider py-4 border-b border-slate-200 uppercase ${viewMode === 'week' ? 'cursor-pointer hover:bg-slate-200 transition-colors' : ''} ${idx !== displayedDays.length - 1 ? 'border-r' : ''}`}
                                >
                                    {day}
                                </div>
                            ))}

                            {/* Time Slots */}
                            {TIME_SLOTS.map((time) => (
                                <React.Fragment key={time}>
                                    {/* Time Column */}
                                    <div className="text-sm font-medium text-slate-400 text-right pr-4 py-6 border-b border-r border-slate-100 flex flex-col items-end">
                                        <span className="-mt-3 bg-white px-1 leading-none">{time}</span>
                                    </div>

                                    {/* Day Columns */}
                                    {time === LUNCH_TIME ? (
                                        <div className={`${viewMode === 'week' ? 'col-span-5' : 'col-span-1'} border-b border-slate-100 bg-slate-50 flex items-center justify-center h-20 relative overflow-hidden`}>
                                            <div className="flex items-center gap-2 text-sm font-bold text-slate-500 bg-white/80 py-2 px-6 rounded-full border border-slate-200 shadow-sm z-10 backdrop-blur-sm">
                                                <Clock className="w-4 h-4" />
                                                Lunch Break
                                            </div>
                                            <div className="absolute inset-0 opacity-50" style={{ backgroundImage: "repeating-linear-gradient(45deg, transparent, transparent 10px, #f1f5f9 10px, #f1f5f9 20px)" }}></div>
                                        </div>
                                    ) : (
                                        displayedDays.map((day, colIndex) => {
                                            const entry = scheduleMap.get(`${day}-${time}`);
                                            const theme = entry ? getSubjectTheme(entry.subject) : null;

                                            return (
                                                <div
                                                    key={`${day}-${time}`}
                                                    className={`border-b border-slate-50 p-2 min-h-[120px] ${colIndex !== displayedDays.length - 1 ? 'border-r' : ''}`}
                                                >
                                                    {entry && theme ? (
                                                        <div className={`h-full w-full rounded-xl p-3 flex flex-col justify-center border-y border-r border-l-4 ${theme.bg} ${theme.border} ${theme.borderL} hover:-translate-y-0.5 transition-transform cursor-pointer shadow-sm`}>
                                                            <h4 className={`font-bold text-sm ${theme.headingText} line-clamp-1`}>{entry.subject}</h4>
                                                            <p className="text-xs text-slate-500 mt-1 line-clamp-1">{entry.teacher}</p>
                                                            <div className="mt-2 flex items-center gap-1 text-xs text-slate-400 font-medium whitespace-nowrap overflow-hidden text-ellipsis">
                                                                <MapPin className="w-3 h-3 shrink-0" />
                                                                <span>{entry.room}</span>
                                                            </div>
                                                        </div>
                                                    ) : null}
                                                </div>
                                            );
                                        })
                                    )}
                                </React.Fragment>
                            ))}
                        </div>
                    </div>
                </Card>
            </div>
        </div>
    );
}