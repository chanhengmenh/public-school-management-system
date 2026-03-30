import React, { useMemo } from 'react';
import Link from 'next/link';
import { Clock, MapPin } from 'lucide-react';
import { getSubjectTheme } from '@/lib/utils';
import { Card } from '@/components/ui';

export interface ScheduleGridEvent {
    id: string | number;
    title: string;
    subtitle: string;
    location: string;
    day: string;
    startTime: string;
    endTime?: string;
    link?: string;
}

export interface ScheduleGridProps {
    events: ScheduleGridEvent[];
    viewMode: 'week' | 'day';
    selectedDay: string;
}

const generateTimeSlots = () => {
    const slots: string[] = [];
    for (let i = 7; i <= 17; i++) {
        const hour = i === 12 ? 12 : i % 12;
        const ampm = i < 12 ? 'AM' : 'PM';
        slots.push(`${hour.toString().padStart(2, '0')}:00 ${ampm}`);
    }
    return slots;
};

const TIME_SLOTS = generateTimeSlots();
const LUNCH_TIME = "12:00 PM";
const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export function ScheduleGrid({ events, viewMode, selectedDay }: ScheduleGridProps) {
    const displayedDays = viewMode === 'week' ? DAYS : [selectedDay];

    const scheduleMap = useMemo(() => {
        const map = new Map<string, ScheduleGridEvent>();
        for (const event of events) {
            // Using a simple composite key for mapping time slots
            map.set(`${event.day}-${event.startTime}`, event);
        }
        return map;
    }, [events]);

    const gridColsClass = viewMode === 'week'
        ? "grid-cols-[80px_repeat(6,1fr)] md:grid-cols-[100px_repeat(6,1fr)] min-w-[800px]"
        : "grid-cols-[80px_1fr] md:grid-cols-[100px_1fr] min-w-[400px]";

    const renderBlockContent = (event: ScheduleGridEvent) => {
        const theme = getSubjectTheme(event.title);

        return (
            <div className={`h-full w-full rounded-xl p-3 flex flex-col justify-center border-y border-r border-l-4 ${theme.bg} ${theme.border} ${theme.borderL} ${event.link ? 'hover:-translate-y-0.5 transition-transform cursor-pointer shadow-sm' : 'shadow-sm'}`}>
                <h4 className={`font-bold text-sm ${theme.headingText} line-clamp-1`}>{event.title}</h4>
                <p className="text-xs text-slate-500 mt-1 line-clamp-1">{event.subtitle}</p>
                <div className="mt-2 flex items-center gap-1 text-xs text-slate-400 font-medium whitespace-nowrap overflow-hidden text-ellipsis">
                    <MapPin className="w-3 h-3 shrink-0" />
                    <span>{event.location}</span>
                </div>
            </div>
        );
    };

    return (
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
                            className={`bg-slate-50 text-center text-xs font-bold text-slate-500 tracking-wider py-4 border-b border-slate-200 uppercase ${idx !== displayedDays.length - 1 ? 'border-r' : ''}`}
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
                                <div className={`${viewMode === 'week' ? 'col-span-6' : 'col-span-1'} border-b border-slate-100 bg-slate-50 flex items-center justify-center h-20 relative overflow-hidden`}>
                                    <div className="flex items-center gap-2 text-sm font-bold text-slate-500 bg-white/80 py-2 px-6 rounded-full border border-slate-200 shadow-sm z-10 backdrop-blur-sm">
                                        <Clock className="w-4 h-4" />
                                        Lunch Break
                                    </div>
                                    <div className="absolute inset-0 opacity-50" style={{ backgroundImage: "repeating-linear-gradient(45deg, transparent, transparent 10px, #f1f5f9 10px, #f1f5f9 20px)" }} />
                                </div>
                            ) : (
                                displayedDays.map((day, colIndex) => {
                                    const event = scheduleMap.get(`${day}-${time}`);

                                    return (
                                        <div
                                            key={`${day}-${time}`}
                                            className={`border-b border-slate-50 p-2 min-h-[120px] ${colIndex !== displayedDays.length - 1 ? 'border-r' : ''}`}
                                        >
                                            {event ? (
                                                event.link ? (
                                                    <Link href={event.link} className="block h-full">
                                                        {renderBlockContent(event)}
                                                    </Link>
                                                ) : (
                                                    renderBlockContent(event)
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
        </Card>
    );
}
