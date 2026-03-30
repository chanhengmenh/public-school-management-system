/**
 * Centralized Time Utilities for Scheduling & Analytics
 */

// Grid Config: 7 AM to 5 PM
export const GRID_START_HOUR = 7;
export const GRID_END_HOUR = 17;
export const TOTAL_MINUTES = (GRID_END_HOUR - GRID_START_HOUR) * 60;

export const getMinutesFromStart = (time24: string) => {
    if (!time24) return 0;
    const [hours, minutes] = time24.split(':').map(Number);
    return ((hours - GRID_START_HOUR) * 60) + (minutes || 0);
};

export const formatTo12Hour = (time24: string) => {
    if (!time24) return '';
    const [hours, minutes] = time24.split(':').map(Number);
    const period = hours >= 12 ? 'PM' : 'AM';
    const h12 = hours % 12 || 12;
    return `${h12}:${(minutes || 0).toString().padStart(2, '0')} ${period}`;
};

export const getDurationLabel = (start: string, end: string) => {
    if (!start || !end) return '';
    const durationMins = getMinutesFromStart(end) - getMinutesFromStart(start);
    if (durationMins <= 0) return "0m";
    const h = Math.floor(durationMins / 60);
    const m = durationMins % 60;
    return `${h > 0 ? `${h}h ` : ''}${m > 0 ? `${m}m` : ''}`.trim();
};
