"use client";

import { studentSchedule } from "@/data/student-schedule";
import { studentProfile } from "@/data/student-profile";
import { Clock, MapPin, User, ChevronDown, ChevronUp, Calendar as CalendarIcon, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";

export default function StudentSchedulePage() {
    const { weekdays, classes } = studentSchedule;
    const today = new Date().toLocaleDateString("en-US", { weekday: "long" });
    const [isCalendarExpanded, setIsCalendarExpanded] = useState(false);

    // Calendar State
    const [displayedDate, setDisplayedDate] = useState(new Date());
    const todayDate = new Date();

    const handlePrevMonth = () => {
        setDisplayedDate(prev => {
            const newDate = new Date(prev);
            newDate.setMonth(prev.getMonth() - 1);
            return newDate;
        });
    };

    const handleNextMonth = () => {
        setDisplayedDate(prev => {
            const newDate = new Date(prev);
            newDate.setMonth(prev.getMonth() + 1);
            return newDate;
        });
    };

    // Calendar Display Logic
    const currentMonth = displayedDate.toLocaleString('default', { month: 'long' });
    const currentYear = displayedDate.getFullYear();
    const daysInMonth = new Date(currentYear, displayedDate.getMonth() + 1, 0).getDate();
    const firstDayOfMonth = new Date(currentYear, displayedDate.getMonth(), 1).getDay(); // 0 = Sunday

    const calendarDays = Array.from({ length: daysInMonth }, (_, i) => i + 1);
    const emptyDays = Array.from({ length: firstDayOfMonth }, (_, i) => i);

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold tracking-tight text-gray-900">My Schedule</h1>
                <p className="text-sm text-gray-500">Today: {today}</p>
            </div>

            {/* Collapsible Calendar Section */}
            <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden transition-all duration-300">
                <div
                    className="flex items-center justify-between px-6 py-4 cursor-pointer hover:bg-gray-50 text-gray-900"
                    onClick={() => setIsCalendarExpanded(!isCalendarExpanded)}
                >
                    <div className="flex items-center gap-2">
                        <CalendarIcon className="h-5 w-5 text-blue-600" />
                        <h2 className="text-lg font-semibold">Calendar</h2>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                        {isCalendarExpanded ? "Minimize" : "Expand"}
                        {isCalendarExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                    </div>
                </div>

                {isCalendarExpanded && (
                    <div className="border-t border-gray-100 p-6 animate-in slide-in-from-top-2 duration-200">
                        {/* Calendar Header */}
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-lg font-semibold text-gray-900">{currentMonth} {currentYear}</h3>
                            <div className="flex items-center gap-2">
                                <button onClick={handlePrevMonth} className="p-1 rounded-md hover:bg-gray-100 text-gray-500"><ChevronLeft className="h-5 w-5" /></button>
                                <button onClick={handleNextMonth} className="p-1 rounded-md hover:bg-gray-100 text-gray-500"><ChevronRight className="h-5 w-5" /></button>
                            </div>
                        </div>

                        {/* Calendar Grid */}
                        <div className="grid grid-cols-7 gap-px bg-gray-200 rounded-lg overflow-hidden border border-gray-200">
                            {/* Weekday Headers */}
                            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(day => (
                                <div key={day} className="bg-gray-50 p-2 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                    {day}
                                </div>
                            ))}

                            {/* Empty Cells */}
                            {emptyDays.map(i => (
                                <div key={`empty-${i}`} className="bg-white min-h-[100px]" />
                            ))}

                            {/* Days */}
                            {calendarDays.map(day => {
                                const isToday = day === todayDate.getDate() &&
                                    displayedDate.getMonth() === todayDate.getMonth() &&
                                    displayedDate.getFullYear() === todayDate.getFullYear();
                                return (
                                    <div key={day} className={cn("bg-white min-h-[100px] p-2 relative group hover:bg-gray-50 transition-colors", isToday && "bg-blue-50/50")}>
                                        <span className={cn(
                                            "inline-flex h-7 w-7 items-center justify-center rounded-full text-sm font-medium",
                                            isToday ? "bg-blue-600 text-white" : "text-gray-700"
                                        )}>
                                            {day}
                                        </span>
                                        {/* Mock event for demo */}
                                        {day === 15 && (
                                            <div className="mt-2 text-xs bg-purple-100 text-purple-700 p-1 rounded border border-purple-200 truncate">
                                                Mid-term Exam
                                            </div>
                                        )}
                                        {day === 18 && (
                                            <div className="mt-2 text-xs bg-yellow-100 text-yellow-700 p-1 rounded border border-yellow-200 truncate">
                                                Science Fair
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}
            </div>

            {/* Weekly Schedule Grid */}
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
                {weekdays.map((day) => {
                    const dayClasses = classes.filter((c) => c.day === day);
                    const isToday = day === today;

                    return (
                        <div
                            key={day}
                            className={cn(
                                "rounded-xl border bg-white shadow-sm overflow-hidden",
                                isToday ? "border-blue-300 ring-2 ring-blue-100" : "border-gray-200"
                            )}
                        >
                            <div className={cn(
                                "px-4 py-3 font-semibold text-center",
                                isToday ? "bg-blue-600 text-white" : "bg-gray-50 text-gray-900"
                            )}>
                                {day}
                            </div>
                            <div className="p-3 space-y-3 min-h-[300px]">
                                {dayClasses.length > 0 ? (
                                    dayClasses.map((cls, idx) => (
                                        <div
                                            key={idx}
                                            className={cn(
                                                "rounded-lg border p-3",
                                                cls.color
                                            )}
                                        >
                                            <p className="font-semibold text-sm mb-1">{cls.subject}</p>
                                            <div className="flex items-center gap-1 text-xs opacity-80 mb-1">
                                                <Clock className="h-3 w-3" />
                                                {cls.time} ({cls.duration} min)
                                            </div>
                                            <div className="flex items-center gap-1 text-xs opacity-80 mb-1">
                                                <User className="h-3 w-3" />
                                                {cls.teacher}
                                            </div>
                                            <div className="flex items-center gap-1 text-xs opacity-80">
                                                <MapPin className="h-3 w-3" />
                                                {cls.room}
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="flex items-center justify-center h-full text-gray-400 text-sm">
                                        No classes
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Today's Classes Summary */}
            <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
                <div className="border-b border-gray-200 px-6 py-4">
                    <h2 className="text-lg font-semibold text-gray-900">Today&apos;s Classes</h2>
                </div>
                <div className="divide-y divide-gray-100">
                    {classes.filter((c) => c.day === today).length > 0 ? (
                        classes
                            .filter((c) => c.day === today)
                            .sort((a, b) => a.time.localeCompare(b.time))
                            .map((cls, idx) => (
                                <div key={idx} className="flex items-center justify-between px-6 py-4 hover:bg-gray-50">
                                    <div className="flex items-center gap-4">
                                        <div className={cn("w-1 h-12 rounded-full", cls.color.split(" ")[0].replace("100", "500"))} />
                                        <div>
                                            <p className="font-medium text-gray-900">{cls.subject}</p>
                                            <p className="text-sm text-gray-500">{cls.teacher} • {cls.room}</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-medium text-gray-900">{cls.time}</p>
                                        <p className="text-sm text-gray-500">{cls.duration} min</p>
                                    </div>
                                </div>
                            ))
                    ) : (
                        <div className="px-6 py-8 text-center text-gray-500">
                            No classes scheduled for today!
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
