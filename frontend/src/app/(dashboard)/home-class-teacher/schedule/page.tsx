"use client";

import React, { useState } from "react";
import { Calendar, Clock, MapPin, Users, ChevronLeft, ChevronRight } from "lucide-react";

const weekDays = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];

const scheduleData = {
    Monday: [
        { time: "07:30 - 08:20", subject: "Homeroom", room: "A101", type: "homeroom" },
        { time: "08:20 - 09:10", subject: "Mathematics 10", room: "A101", type: "class" },
        { time: "09:20 - 10:10", subject: "English Literature", room: "A101", type: "class" },
        { time: "10:10 - 11:00", subject: "Break", room: "-", type: "break" },
        { time: "11:00 - 11:50", subject: "Physics 10", room: "Lab B202", type: "class" },
        { time: "13:00 - 13:50", subject: "World History", room: "A101", type: "class" },
        { time: "14:00 - 14:50", subject: "Computer Science", room: "Lab C301", type: "class" },
    ],
    Tuesday: [
        { time: "07:30 - 08:20", subject: "Homeroom", room: "A101", type: "homeroom" },
        { time: "08:20 - 09:10", subject: "English Literature", room: "A101", type: "class" },
        { time: "09:20 - 10:10", subject: "Mathematics 10", room: "A101", type: "class" },
        { time: "10:10 - 11:00", subject: "Break", room: "-", type: "break" },
        { time: "11:00 - 11:50", subject: "World History", room: "A101", type: "class" },
        { time: "13:00 - 13:50", subject: "Physics 10", room: "Lab B202", type: "class" },
        { time: "14:00 - 14:50", subject: "Physical Education", room: "Gym", type: "class" },
    ],
    Wednesday: [
        { time: "07:30 - 08:20", subject: "Homeroom", room: "A101", type: "homeroom" },
        { time: "08:20 - 09:10", subject: "Computer Science", room: "Lab C301", type: "class" },
        { time: "09:20 - 10:10", subject: "Mathematics 10", room: "A101", type: "class" },
        { time: "10:10 - 11:00", subject: "Break", room: "-", type: "break" },
        { time: "11:00 - 11:50", subject: "English Literature", room: "A101", type: "class" },
        { time: "13:00 - 13:50", subject: "Physics 10", room: "Lab B202", type: "class" },
        { time: "14:00 - 14:50", subject: "Art", room: "D105", type: "class" },
    ],
    Thursday: [
        { time: "07:30 - 08:20", subject: "Homeroom", room: "A101", type: "homeroom" },
        { time: "08:20 - 09:10", subject: "World History", room: "A101", type: "class" },
        { time: "09:20 - 10:10", subject: "Physics 10", room: "Lab B202", type: "class" },
        { time: "10:10 - 11:00", subject: "Break", room: "-", type: "break" },
        { time: "11:00 - 11:50", subject: "Mathematics 10", room: "A101", type: "class" },
        { time: "13:00 - 13:50", subject: "English Literature", room: "A101", type: "class" },
        { time: "14:00 - 14:50", subject: "Computer Science", room: "Lab C301", type: "class" },
    ],
    Friday: [
        { time: "07:30 - 08:20", subject: "Homeroom", room: "A101", type: "homeroom" },
        { time: "08:20 - 09:10", subject: "Mathematics 10", room: "A101", type: "class" },
        { time: "09:20 - 10:10", subject: "World History", room: "A101", type: "class" },
        { time: "10:10 - 11:00", subject: "Break", room: "-", type: "break" },
        { time: "11:00 - 11:50", subject: "English Literature", room: "A101", type: "class" },
        { time: "13:00 - 13:50", subject: "Class Meeting", room: "A101", type: "meeting" },
        { time: "14:00 - 14:50", subject: "Free Period", room: "-", type: "free" },
    ],
};

export default function SchedulePage() {
    const [selectedDay, setSelectedDay] = useState("Monday");

    const getSlotStyle = (type: string) => {
        switch (type) {
            case "homeroom": return "bg-purple-50 border-purple-200";
            case "class": return "bg-blue-50 border-blue-200";
            case "break": return "bg-gray-50 border-gray-200";
            case "meeting": return "bg-green-50 border-green-200";
            case "free": return "bg-yellow-50 border-yellow-200";
            default: return "bg-white border-gray-200";
        }
    };

    const currentDayIndex = weekDays.indexOf(selectedDay);

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                        <Calendar className="w-6 h-6 text-indigo-600" />
                        Class Schedule
                    </h1>
                    <p className="text-gray-500">Class 10-A Weekly Timetable</p>
                </div>
            </div>

            {/* Day Selector */}
            <div className="flex items-center gap-2 overflow-x-auto pb-2">
                <button
                    onClick={() => setSelectedDay(weekDays[Math.max(0, currentDayIndex - 1)])}
                    disabled={currentDayIndex === 0}
                    className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-50"
                >
                    <ChevronLeft className="w-4 h-4" />
                </button>
                {weekDays.map((day) => (
                    <button
                        key={day}
                        onClick={() => setSelectedDay(day)}
                        className={`px-4 py-2 rounded-lg font-medium transition-colors whitespace-nowrap ${selectedDay === day
                                ? "bg-indigo-600 text-white"
                                : "bg-white border border-gray-200 text-gray-700 hover:bg-gray-50"
                            }`}
                    >
                        {day}
                    </button>
                ))}
                <button
                    onClick={() => setSelectedDay(weekDays[Math.min(4, currentDayIndex + 1)])}
                    disabled={currentDayIndex === 4}
                    className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-50"
                >
                    <ChevronRight className="w-4 h-4" />
                </button>
            </div>

            {/* Schedule Grid */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="p-4 border-b border-gray-100 bg-gray-50">
                    <h2 className="font-semibold text-gray-900">{selectedDay}</h2>
                </div>
                <div className="divide-y divide-gray-100">
                    {scheduleData[selectedDay as keyof typeof scheduleData].map((slot, idx) => (
                        <div key={idx} className={`p-4 ${getSlotStyle(slot.type)}`}>
                            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                                <div className="flex items-center gap-4">
                                    <div className="flex items-center gap-2 text-sm text-gray-500 min-w-[120px]">
                                        <Clock className="w-4 h-4" />
                                        {slot.time}
                                    </div>
                                    <div>
                                        <h3 className="font-medium text-gray-900">{slot.subject}</h3>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2 text-sm text-gray-500">
                                    <MapPin className="w-4 h-4" />
                                    {slot.room}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Legend */}
            <div className="flex flex-wrap gap-4 text-sm">
                <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded bg-purple-100 border border-purple-200"></div>
                    <span className="text-gray-600">Homeroom</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded bg-blue-100 border border-blue-200"></div>
                    <span className="text-gray-600">Class</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded bg-green-100 border border-green-200"></div>
                    <span className="text-gray-600">Meeting</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded bg-gray-100 border border-gray-200"></div>
                    <span className="text-gray-600">Break</span>
                </div>
            </div>
        </div>
    );
}
