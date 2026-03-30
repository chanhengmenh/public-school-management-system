'use client';

import React, { useState, useRef, useMemo } from 'react';
import { Calendar, ChevronDown } from 'lucide-react';
import PageHeader from '@/components/layouts/PageHeader';
import { Button } from '@/components/ui';
import { getTeacherData } from '@/lib/mock-data/teacher';
import { useAuthStore } from '@/store/useAuthStore';
import type { TeacherScheduleDay } from '@/types/school.types';
import { ScheduleGrid, ScheduleGridEvent } from '@/components/ui/ScheduleGrid';

const DAYS: TeacherScheduleDay[] = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export default function TeacherSchedulePage() {
    const { user } = useAuthStore();
    const data = getTeacherData(user?.id ?? 'teacher_001');

    const [viewMode, setViewMode] = useState<'week' | 'day'>('week');
    const [selectedDay, setSelectedDay] = useState<TeacherScheduleDay>('Monday');
    const [currentDate, setCurrentDate] = useState<string>('');
    const dateInputRef = useRef<HTMLInputElement>(null);

    const mappedEvents: ScheduleGridEvent[] = useMemo(() => {
        return data.schedule.map((event, idx) => {
            const subtitle = event.type === 'Class' && event.students 
                ? `${event.students} students` 
                : event.type;
            
            return {
                id: `${event.day}-${event.time}-${idx}`,
                title: event.subject,
                subtitle: subtitle as string,
                location: event.room,
                day: event.day,
                startTime: event.time,
                link: event.link
            };
        });
    }, [data.schedule]);

    return (
        <div className="min-h-screen bg-slate-50">
            <PageHeader
                title="My Schedule"
                subtitle="Manage your daily classes and weekly timetable"
            />

            <div className="px-6 lg:px-8 pb-8 pt-6">
                {/* Top Action Bar */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                    <Button
                        variant="outline"
                        size="md"
                        icon={Calendar}
                        onClick={() => dateInputRef.current?.showPicker?.()}
                        className="relative !rounded-xl !shadow-sm"
                    >
                        <span className="whitespace-nowrap">{currentDate ? new Date(currentDate + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : "Mar 2 - Mar 6, 2026"}</span>
                        <ChevronDown className="w-4 h-4 text-slate-400 shrink-0 ml-1" />
                        <input
                            ref={dateInputRef}
                            type="date"
                            className="absolute inset-0 w-full h-full opacity-0 pointer-events-none"
                            value={currentDate}
                            onChange={(e) => setCurrentDate(e.target.value)}
                        />
                    </Button>

                    <div className="flex flex-wrap items-center gap-3">
                        <div className="flex items-center bg-slate-100 rounded-xl p-1 text-sm font-bold text-slate-600 border border-slate-200">
                            <Button
                                variant={viewMode === 'week' ? 'secondary' : 'ghost'}
                                size="sm"
                                onClick={() => setViewMode('week')}
                                className={`!rounded-lg ${viewMode === 'week' ? '!bg-white !shadow-sm !text-slate-800' : '!text-slate-500'}`}
                            >
                                Week
                            </Button>
                            <Button
                                variant={viewMode === 'day' ? 'secondary' : 'ghost'}
                                size="sm"
                                onClick={() => setViewMode('day')}
                                className={`!rounded-lg ${viewMode === 'day' ? '!bg-white !shadow-sm !text-slate-800' : '!text-slate-500'}`}
                            >
                                Day
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Day Selector - Shown in Day View */}
                {viewMode === 'day' && (
                    <div className="flex items-center gap-2 mb-6">
                        {DAYS.map((day) => (
                            <Button
                                key={day}
                                variant={selectedDay === day ? 'primary' : 'outline'}
                                size="sm"
                                onClick={() => setSelectedDay(day)}
                                className="!rounded-xl"
                            >
                                {day.slice(0, 3)}
                            </Button>
                        ))}
                    </div>
                )}

                {/* Timetable Grid Container */}
                <ScheduleGrid events={mappedEvents} viewMode={viewMode} selectedDay={selectedDay} />
            </div>
        </div>
    );
}