"use client";

import React, { useState } from "react";
import { Calendar, ChevronDown, ChevronLeft, ChevronRight, Printer, MapPin, Clock } from "lucide-react";

export default function StudentSchedulePage() {
    const [viewMode, setViewMode] = useState<'week' | 'day'>('week');
    const [selectedDay, setSelectedDay] = useState<string>('Monday');
    const [currentDate, setCurrentDate] = useState<string>('');

    const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];

    const scheduleData = [
        {
            time: "8:00 AM",
            blocks: [
                { subject: "Physics", teacher: "Mr. Tan Wei", room: "Room 304", bg: "bg-blue-50", borderL: "border-l-blue-500", borderAll: "border-blue-100", text: "text-blue-800" },
                null,
                { subject: "History", teacher: "Mr. Brown", room: "Room 102", bg: "bg-teal-50", borderL: "border-l-teal-500", borderAll: "border-teal-100", text: "text-teal-800" },
                { subject: "Advanced Math", teacher: "Ms. Sarah Lee", room: "Room 201", bg: "bg-orange-50", borderL: "border-l-orange-500", borderAll: "border-orange-100", text: "text-orange-800" },
                { subject: "Physics", teacher: "Mr. Tan Wei", room: "Room 304", bg: "bg-blue-50", borderL: "border-l-blue-500", borderAll: "border-blue-100", text: "text-blue-800" },
            ]
        },
        {
            time: "9:00 AM",
            blocks: [
                null,
                { subject: "Chemistry", teacher: "Dr. Alan Turing", room: "Lab 2", bg: "bg-green-50", borderL: "border-l-green-500", borderAll: "border-green-100", text: "text-green-800" },
                null,
                null,
                { subject: "English Lit", teacher: "Mr. John Doe", room: "Room 110", bg: "bg-purple-50", borderL: "border-l-purple-500", borderAll: "border-purple-100", text: "text-purple-800" },
            ]
        },
        {
            time: "10:00 AM",
            blocks: [
                { subject: "Advanced Math", teacher: "Ms. Sarah Lee", room: "Room 201", bg: "bg-orange-50", borderL: "border-l-orange-500", borderAll: "border-orange-100", text: "text-orange-800" },
                null,
                { subject: "English Lit", teacher: "Mr. John Doe", room: "Room 110", bg: "bg-purple-50", borderL: "border-l-purple-500", borderAll: "border-purple-100", text: "text-purple-800" },
                { subject: "Geography", teacher: "Mrs. Smith", room: "Room 205", bg: "bg-red-50", borderL: "border-l-red-500", borderAll: "border-red-100", text: "text-red-800" },
                null,
            ]
        },
        {
            time: "11:00 AM",
            blocks: [
                { subject: "Geography", teacher: "Mrs. Smith", room: "Room 205", bg: "bg-red-50", borderL: "border-l-red-500", borderAll: "border-red-100", text: "text-red-800" },
                { subject: "Physics", teacher: "Mr. Tan Wei", room: "Room 304", bg: "bg-blue-50", borderL: "border-l-blue-500", borderAll: "border-blue-100", text: "text-blue-800" },
                null,
                { subject: "Chemistry", teacher: "Dr. Alan Turing", room: "Lab 2", bg: "bg-green-50", borderL: "border-l-green-500", borderAll: "border-green-100", text: "text-green-800" },
                { subject: "History", teacher: "Mr. Brown", room: "Room 102", bg: "bg-teal-50", borderL: "border-l-teal-500", borderAll: "border-teal-100", text: "text-teal-800" },
            ]
        },
        {
            time: "12:00 PM",
            isLunch: true,
        },
        {
            time: "1:00 PM",
            blocks: [
                { subject: "English Lit", teacher: "Mr. John Doe", room: "Room 110", bg: "bg-purple-50", borderL: "border-l-purple-500", borderAll: "border-purple-100", text: "text-purple-800" },
                null,
                { subject: "Geography", teacher: "Mrs. Smith", room: "Room 205", bg: "bg-red-50", borderL: "border-l-red-500", borderAll: "border-red-100", text: "text-red-800" },
                null,
                { subject: "Advanced Math", teacher: "Ms. Sarah Lee", room: "Room 201", bg: "bg-orange-50", borderL: "border-l-orange-500", borderAll: "border-orange-100", text: "text-orange-800" },
            ]
        },
        {
            time: "2:00 PM",
            blocks: [
                null,
                { subject: "Advanced Math", teacher: "Ms. Sarah Lee", room: "Room 201", bg: "bg-orange-50", borderL: "border-l-orange-500", borderAll: "border-orange-100", text: "text-orange-800" },
                { subject: "Chemistry", teacher: "Dr. Alan Turing", room: "Lab 2", bg: "bg-green-50", borderL: "border-l-green-500", borderAll: "border-green-100", text: "text-green-800" },
                { subject: "Physics", teacher: "Mr. Tan Wei", room: "Room 304", bg: "bg-blue-50", borderL: "border-l-blue-500", borderAll: "border-blue-100", text: "text-blue-800" },
                null,
            ]
        },
        {
            time: "3:00 PM",
            blocks: [
                null,
                null,
                { subject: "History", teacher: "Mr. Brown", room: "Room 102", bg: "bg-teal-50", borderL: "border-l-teal-500", borderAll: "border-teal-100", text: "text-teal-800" },
                null,
                { subject: "Geography", teacher: "Mrs. Smith", room: "Room 205", bg: "bg-red-50", borderL: "border-l-red-500", borderAll: "border-red-100", text: "text-red-800" },
            ]
        },
    ];

    const displayedDays = viewMode === 'week' ? days : [selectedDay];
    const gridColsClass = viewMode === 'week'
        ? "grid-cols-[80px_repeat(5,1fr)] md:grid-cols-[100px_repeat(5,1fr)] min-w-[900px]"
        : "grid-cols-[80px_1fr] md:grid-cols-[100px_1fr] min-w-[400px]";

    return (
        <div className="min-h-screen bg-slate-50">
            <header className="sticky top-0 z-30 bg-slate-50/80 backdrop-blur-md border-b border-slate-200/50 px-6 lg:px-8 py-6 mb-2">
                <div className="flex justify-between items-start">
                    <div>
                        <h1 className="text-3xl font-serif font-bold text-[#0f172a] tracking-tight">Schedule</h1>
                        <p className="text-sm text-slate-500 mt-1">Term 2 · Weekly Timetable</p>
                    </div>
                    <div></div>
                </div>
            </header>

            <div className="px-6 lg:px-8 pb-8 pt-6">
                {/* Top Action Bar */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                    {/* Interactive Calendar Button */}
                    <div className="relative inline-block">
                        <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-xl border border-slate-200 shadow-sm text-sm font-bold text-slate-700 hover:bg-slate-50 transition-colors pointer-events-none">
                            <Calendar className="w-4 h-4 text-slate-500 shrink-0" />
                            <span className="whitespace-nowrap">{currentDate ? new Date(currentDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : "June 2 - June 6, 2025"}</span>
                            <ChevronDown className="w-4 h-4 text-slate-400 shrink-0 ml-1" />
                        </div>
                        <input
                            type="date"
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                            value={currentDate}
                            onChange={(e) => setCurrentDate(e.target.value)}
                        />
                    </div>

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
                                            {/* Simple light gray box for Lunch */}
                                            <div className="flex items-center gap-2 text-sm font-bold text-slate-500 bg-white/80 py-2 px-6 rounded-full border border-slate-200 shadow-sm z-10 backdrop-blur-sm">
                                                <Clock className="w-4 h-4" />
                                                Lunch Break
                                            </div>
                                            {/* Repeating stripe pattern */}
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
                                                        <div className={`h-full w-full rounded-xl p-3 flex flex-col justify-center border-y border-r border-l-4 ${block.bg} ${block.borderAll} ${block.borderL} hover:-translate-y-0.5 transition-transform cursor-pointer shadow-sm`}>
                                                            <h4 className={`font-bold text-sm ${block.text} line-clamp-1`}>{block.subject}</h4>
                                                            <p className="text-xs text-slate-500 mt-1 line-clamp-1">{block.teacher}</p>
                                                            <div className="mt-2 flex items-center gap-1 text-xs text-slate-400 font-medium whitespace-nowrap overflow-hidden text-ellipsis">
                                                                <MapPin className="w-3 h-3 shrink-0" />
                                                                <span>{block.room}</span>
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
                </div>
            </div>
        </div>
    );
}