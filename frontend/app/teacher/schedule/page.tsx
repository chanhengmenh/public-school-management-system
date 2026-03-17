'use client';

import React, { useState, useRef } from 'react';
import Link from 'next/link';
import { Calendar, ChevronDown, Clock, MapPin, Users } from 'lucide-react';
import PageHeader from '@/components/layouts/PageHeader';

// --- Types ---
interface ScheduleBlock {
    type: 'Class' | 'Prep' | 'Meeting';
    subject: string;
    students?: number;
    room: string;
    bg: string;
    borderL: string;
    borderAll: string;
    text: string;
    link?: string;
}

interface TimeSlot {
    time: string;
    isLunch?: boolean;
    blocks?: (ScheduleBlock | null)[];
}

export default function TeacherSchedulePage() {
    const [viewMode, setViewMode] = useState<'week' | 'day'>('week');
    const [selectedDay, setSelectedDay] = useState<string>('Monday');
    const [currentDate, setCurrentDate] = useState<string>('');
    const dateInputRef = useRef<HTMLInputElement>(null);

    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

    // --- Teacher-Specific Dummy Data ---
    const scheduleData: TimeSlot[] = [
        {
            time: '8:00 AM',
            blocks: [
                { type: 'Class', subject: 'Physics 11A', students: 32, room: 'Room 304', bg: 'bg-blue-50', borderL: 'border-l-blue-500', borderAll: 'border-blue-100', text: 'text-blue-800', link: '/teacher/classes/class-1' },
                null,
                { type: 'Class', subject: 'Physics 11A', students: 32, room: 'Room 304', bg: 'bg-blue-50', borderL: 'border-l-blue-500', borderAll: 'border-blue-100', text: 'text-blue-800', link: '/teacher/classes/class-1' },
                null,
                { type: 'Class', subject: 'Physics 11A', students: 32, room: 'Room 304', bg: 'bg-blue-50', borderL: 'border-l-blue-500', borderAll: 'border-blue-100', text: 'text-blue-800', link: '/teacher/classes/class-1' },
            ]
        },
        {
            time: '9:00 AM',
            blocks: [
                null,
                { type: 'Class', subject: 'Physics 11B', students: 30, room: 'Room 304', bg: 'bg-teal-50', borderL: 'border-l-teal-500', borderAll: 'border-teal-100', text: 'text-teal-800', link: '/teacher/classes/class-3' },
                null,
                { type: 'Class', subject: 'Physics 11B', students: 30, room: 'Room 304', bg: 'bg-teal-50', borderL: 'border-l-teal-500', borderAll: 'border-teal-100', text: 'text-teal-800', link: '/teacher/classes/class-3' },
                null,
            ]
        },
        {
            time: '10:00 AM',
            blocks: [
                null,
                { type: 'Class', subject: 'Intro Physics 10A', students: 35, room: 'Room 201', bg: 'bg-orange-50', borderL: 'border-l-orange-500', borderAll: 'border-orange-100', text: 'text-orange-800', link: '/teacher/classes/class-4' },
                null,
                { type: 'Class', subject: 'Intro Physics 10A', students: 35, room: 'Room 201', bg: 'bg-orange-50', borderL: 'border-l-orange-500', borderAll: 'border-orange-100', text: 'text-orange-800', link: '/teacher/classes/class-4' },
                null,
            ]
        },
        {
            time: '11:00 AM',
            blocks: [
                { type: 'Class', subject: 'Adv. Physics 12A', students: 28, room: 'Room 305', bg: 'bg-purple-50', borderL: 'border-l-purple-500', borderAll: 'border-purple-100', text: 'text-purple-800', link: '/teacher/classes/class-2' },
                null,
                { type: 'Class', subject: 'Adv. Physics 12A', students: 28, room: 'Room 305', bg: 'bg-purple-50', borderL: 'border-l-purple-500', borderAll: 'border-purple-100', text: 'text-purple-800', link: '/teacher/classes/class-2' },
                null,
                { type: 'Class', subject: 'Adv. Physics 12A', students: 28, room: 'Room 305', bg: 'bg-purple-50', borderL: 'border-l-purple-500', borderAll: 'border-purple-100', text: 'text-purple-800', link: '/teacher/classes/class-2' },
            ]
        },
        {
            time: '12:00 PM',
            isLunch: true,
        },
        {
            time: '1:00 PM',
            blocks: [
                { type: 'Meeting', subject: 'Dept Meeting', room: 'Conf. Room B', bg: 'bg-emerald-50', borderL: 'border-l-emerald-500', borderAll: 'border-emerald-100', text: 'text-emerald-800' },
                null,
                null,
                null,
                null,
            ]
        },
        {
            time: '2:00 PM',
            blocks: [
                null,
                { type: 'Meeting', subject: 'Parent Conf.', room: 'Meeting Rm A', bg: 'bg-emerald-50', borderL: 'border-l-emerald-500', borderAll: 'border-emerald-100', text: 'text-emerald-800' },
                null,
                null,
                null,
            ]
        },
        {
            time: '3:00 PM',
            blocks: [
                null,
                null,
                null,
                null,
                { type: 'Meeting', subject: 'Staff Meeting', room: 'Auditorium', bg: 'bg-emerald-50', borderL: 'border-l-emerald-500', borderAll: 'border-emerald-100', text: 'text-emerald-800' },
            ]
        },
    ];

    const displayedDays = viewMode === 'week' ? days : [selectedDay];
    const gridColsClass = viewMode === 'week'
        ? "grid-cols-[80px_repeat(5,1fr)] md:grid-cols-[100px_repeat(5,1fr)] min-w-[900px]"
        : "grid-cols-[80px_1fr] md:grid-cols-[100px_1fr] min-w-[400px]";

    const renderBlockContent = (block: ScheduleBlock) => (
        <div className={`h-full w-full rounded-xl p-3 flex flex-col justify-center border-y border-r border-l-4 ${block.bg} ${block.borderAll} ${block.borderL} ${block.link ? 'hover:-translate-y-0.5 transition-transform cursor-pointer shadow-sm' : ''}`}>
            <h4 className={`font-bold text-sm ${block.text} line-clamp-1`}>{block.subject}</h4>
            {block.type === 'Class' && block.students && (
                <div className="mt-1.5 flex items-center gap-1 text-xs text-slate-500 font-medium">
                    <Users className="w-3 h-3 shrink-0" />
                    <span>{block.students} students</span>
                </div>
            )}
            <div className="mt-1 flex items-center gap-1 text-xs text-slate-400 font-medium whitespace-nowrap overflow-hidden text-ellipsis">
                <MapPin className="w-3 h-3 shrink-0" />
                <span>{block.room}</span>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-slate-50">
            <PageHeader
                title="My Schedule"
                subtitle="Manage your daily classes and weekly timetable"
            />

            <div className="px-6 lg:px-8 pb-8 pt-6">
                {/* Top Action Bar */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                    {/* Interactive Calendar Button */}
                    <button
                        onClick={() => dateInputRef.current?.showPicker?.()}
                        className="relative flex items-center gap-2 bg-white px-4 py-2 rounded-xl border border-slate-200 shadow-sm text-sm font-bold text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
                    >
                        <Calendar className="w-4 h-4 text-slate-500 shrink-0" />
                        <span className="whitespace-nowrap">{currentDate ? new Date(currentDate + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : "Mar 2 - Mar 6, 2026"}</span>
                        <ChevronDown className="w-4 h-4 text-slate-400 shrink-0 ml-1" />
                        <input
                            ref={dateInputRef}
                            type="date"
                            className="absolute inset-0 w-full h-full opacity-0 pointer-events-none"
                            value={currentDate}
                            onChange={(e) => setCurrentDate(e.target.value)}
                        />
                    </button>

                    <div className="flex flex-wrap items-center gap-3">
                        {/* View Toggles */}
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

                {/* Day Selector - Shown in Day View */}
                {viewMode === 'day' && (
                    <div className="flex items-center gap-2 mb-6">
                        {days.map((day) => (
                            <button
                                key={day}
                                onClick={() => setSelectedDay(day)}
                                className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${selectedDay === day
                                    ? 'bg-slate-900 text-white shadow-sm'
                                    : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                                    }`}
                            >
                                {day.slice(0, 3)}
                            </button>
                        ))}
                    </div>
                )}

                {/* Timetable Grid Container */}
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <div className={`grid ${gridColsClass}`}>
                            {/* Header Row */}
                            <div className="border-b border-r border-slate-200 bg-slate-50 text-xs font-bold text-slate-400 text-right pr-4 pb-2 flex flex-col justify-end">
                                Time / Day
                            </div>

                            {displayedDays.map((day, idx) => (
                                <div
                                    key={idx}
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
                            {scheduleData.map((slot, rowIndex) => (
                                <React.Fragment key={rowIndex}>
                                    {/* Time Column */}
                                    <div className="text-sm font-medium text-slate-400 text-right pr-4 py-6 border-b border-r border-slate-100 flex flex-col items-end">
                                        <span className="-mt-3 bg-white px-1 leading-none">{slot.time}</span>
                                    </div>

                                    {/* Day Columns */}
                                    {slot.isLunch ? (
                                        <div className={`${viewMode === 'week' ? 'col-span-5' : 'col-span-1'} border-b border-slate-100 bg-slate-50 flex items-center justify-center h-20 relative overflow-hidden`}>
                                            <div className="flex items-center gap-2 text-sm font-bold text-slate-500 bg-white/80 py-2 px-6 rounded-full border border-slate-200 shadow-sm z-10 backdrop-blur-sm">
                                                <Clock className="w-4 h-4" />
                                                Lunch Break
                                            </div>
                                            <div className="absolute inset-0 opacity-50" style={{ backgroundImage: "repeating-linear-gradient(45deg, transparent, transparent 10px, #f1f5f9 10px, #f1f5f9 20px)" }}></div>
                                        </div>
                                    ) : (
                                        displayedDays.map((targetDay, colIndex) => {
                                            const dayIndex = days.indexOf(targetDay);
                                            const block = slot.blocks ? slot.blocks[dayIndex] : null;

                                            return (
                                                <div
                                                    key={colIndex}
                                                    className={`border-b border-slate-50 p-2 min-h-[120px] ${colIndex !== displayedDays.length - 1 ? 'border-r' : ''}`}
                                                >
                                                    {block ? (
                                                        block.link ? (
                                                            <Link href={block.link} className="block h-full">
                                                                {renderBlockContent(block)}
                                                            </Link>
                                                        ) : (
                                                            renderBlockContent(block)
                                                        )
                                                    ) : null}
                                                </div>
                                            );
                                        })
                                    )}
                                </React.Fragment>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}