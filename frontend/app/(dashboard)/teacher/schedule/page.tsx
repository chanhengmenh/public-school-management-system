"use client";

import { teacherSchedule } from "@/data/teacher-schedule";
import { Clock, MapPin, Calendar, Users } from "lucide-react";
import { cn } from "@/lib/utils";

export default function TeacherSchedulePage() {
    const { weekdays, timeSlots, classes } = teacherSchedule;

    const getClassForSlot = (day: string, time: string) => {
        return classes.find((c) => c.day === day && c.time === time);
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Class Schedule</h1>
                    <p className="text-gray-500">Weekly teaching timetable</p>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-500 bg-white px-4 py-2 rounded-lg border border-gray-200">
                    <Calendar className="h-4 w-4" />
                    <span>Spring Semester 2026</span>
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden overflow-x-auto">
                <div className="min-w-[800px]">
                    {/* Header Row */}
                    <div className="grid grid-cols-6 border-b border-gray-200">
                        <div className="p-4 border-r border-gray-200 bg-gray-50 text-center font-semibold text-gray-500 text-sm">
                            Time
                        </div>
                        {weekdays.map((day) => (
                            <div key={day} className="p-4 border-r border-gray-200 bg-gray-50 text-center font-semibold text-gray-900 text-sm last:border-r-0">
                                {day}
                            </div>
                        ))}
                    </div>

                    {/* Schedule Grid */}
                    <div className="divide-y divide-gray-200">
                        {timeSlots.map((time) => (
                            <div key={time} className="grid grid-cols-6 group hover:bg-gray-50/50 transition-colors">
                                {/* Time Column */}
                                <div className="p-4 border-r border-gray-200 text-center text-sm font-medium text-gray-500 flex items-center justify-center">
                                    {time}
                                </div>

                                {/* Days Columns */}
                                {weekdays.map((day) => {
                                    const classInfo = getClassForSlot(day, time);

                                    return (
                                        <div key={`${day}-${time}`} className="p-2 border-r border-gray-200 last:border-r-0 min-h-[120px] relative">
                                            {classInfo ? (
                                                <div className={cn(
                                                    "h-full w-full rounded-lg p-3 border shadow-sm transition-all hover:shadow-md cursor-pointer",
                                                    classInfo.color
                                                )}>
                                                    <div className="flex flex-col h-full justify-between gap-2">
                                                        <div>
                                                            <p className="font-semibold text-sm line-clamp-2">{classInfo.subject}</p>
                                                            <div className="flex items-center gap-1.5 text-xs mt-1 opacity-90">
                                                                <Users className="h-3 w-3" />
                                                                <span>{classInfo.class}</span>
                                                            </div>
                                                        </div>

                                                        <div className="space-y-1">
                                                            <div className="flex items-center gap-1.5 text-xs opacity-90">
                                                                <MapPin className="h-3 w-3" />
                                                                <span>{classInfo.room}</span>
                                                            </div>
                                                            <div className="flex items-center gap-1.5 text-xs opacity-90">
                                                                <Clock className="h-3 w-3" />
                                                                <span>{classInfo.duration} min</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="h-full w-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <div className="text-xs text-gray-300 font-medium">Free Period</div>
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
