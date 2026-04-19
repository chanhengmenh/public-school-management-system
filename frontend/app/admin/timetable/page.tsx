'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import PageHeader from '@/components/layouts/PageHeader';
import { Plus, X, Clock, MapPin, Filter, Layers, Users, ChevronDown, Send, Calendar, AlertTriangle, Loader2 } from 'lucide-react';
import { schedulesApi, Schedule } from '@/lib/api/schedules';

// --- Types ---
type DayOfWeek = 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday';
type ViewMode = 'Class' | 'Teacher' | 'Room';

interface ScheduleBlock {
    id: string;
    day: DayOfWeek;
    startTime: string;
    endTime: string;
    subject: string;
    teacher: string;
    targetClass: string;
    room: string;
    status: 'draft' | 'published';
    semester: string;
}

// --- Constants ---
const DAYS: DayOfWeek[] = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const GRID_START_HOUR = 7;
const GRID_END_HOUR = 18; // Saturday PE runs to 17:30, so extend grid to 18:00
const TOTAL_MINUTES = (GRID_END_HOUR - GRID_START_HOUR) * 60;
const DEFAULT_SEMESTER = '2025-2026';

// --- Helpers ---
const getMinutesFromStart = (time24: string) => {
    const [hours, minutes] = time24.split(':').map(Number);
    return ((hours - GRID_START_HOUR) * 60) + minutes;
};

const formatTo12Hour = (time24: string) => {
    const [hours, minutes] = time24.split(':').map(Number);
    const period = hours >= 12 ? 'PM' : 'AM';
    const h12 = hours % 12 || 12;
    return `${h12}:${minutes.toString().padStart(2, '0')} ${period}`;
};

const getDurationLabel = (start: string, end: string) => {
    const durationMins = getMinutesFromStart(end) - getMinutesFromStart(start);
    if (durationMins <= 0) return "0m";
    const h = Math.floor(durationMins / 60);
    const m = durationMins % 60;
    return `${h > 0 ? `${h}h ` : ''}${m > 0 ? `${m}m` : ''}`.trim();
};

const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);
const stripSeconds = (t: string) => t.slice(0, 5); // "07:00:00" → "07:00"

function scheduleToBlock(s: Schedule): ScheduleBlock {
    return {
        id: String(s.id),
        day: capitalize(s.day_of_week) as DayOfWeek,
        startTime: stripSeconds(s.start_time),
        endTime: stripSeconds(s.end_time),
        subject: s.subject_name ?? '—',
        teacher: s.teacher_name ?? '—',
        targetClass: s.class_name ?? '—',
        room: s.room ?? '—',
        status: 'published',
        semester: DEFAULT_SEMESTER,
    };
}

// --- Custom Combobox ---
function CustomCombobox({
    label, value, onChange, options, placeholder, onAddCustom
}: {
    label: string, value: string, onChange: (val: string) => void, options: string[], placeholder: string, onAddCustom?: (val: string) => void
}) {
    const [isOpen, setIsOpen] = useState(false);
    const wrapperRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) setIsOpen(false);
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            const trimmed = value.trim();
            if (trimmed !== '') {
                if (onAddCustom && !options.includes(trimmed)) onAddCustom(trimmed);
                onChange(trimmed);
                setIsOpen(false);
                inputRef.current?.blur();
            }
        }
    };

    const filteredOptions = options.filter(opt => opt.toLowerCase().includes(value.toLowerCase()));

    return (
        <div className="relative w-full" ref={wrapperRef}>
            {label && <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 block">{label}</label>}
            <div className="relative flex items-center">
                <input
                    ref={inputRef}
                    type="text" value={value}
                    onChange={(e) => { onChange(e.target.value); setIsOpen(true); }}
                    onFocus={() => setIsOpen(true)}
                    onKeyDown={handleKeyDown}
                    placeholder={placeholder}
                    className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 font-medium text-slate-900 shadow-sm"
                />
                <ChevronDown className={`absolute right-3 text-slate-400 w-4 h-4 pointer-events-none transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </div>
            {isOpen && (
                <ul className="absolute z-50 w-full mt-1 bg-white border border-slate-200 rounded-xl shadow-lg max-h-48 overflow-y-auto py-1">
                    {filteredOptions.length > 0 ? filteredOptions.map((opt, i) => (
                        <li key={i} onClick={() => { onChange(opt); setIsOpen(false); }} className="px-3.5 py-2 text-sm text-slate-700 hover:bg-indigo-50 hover:text-indigo-700 cursor-pointer font-medium">{opt}</li>
                    )) : (
                        <li className="px-3.5 py-2 text-sm text-slate-400 italic flex items-center justify-between">
                            <span>{value}</span>
                            <span className="text-[10px] bg-slate-100 px-1.5 py-0.5 rounded text-slate-500">Press Enter to add</span>
                        </li>
                    )}
                </ul>
            )}
        </div>
    );
}

// --- Main Page ---
export default function AdminTimetablePage() {
    const [loading, setLoading] = useState(true);

    // Dynamic lists derived from API
    const [classes, setClasses] = useState<string[]>([]);
    const [teachers, setTeachers] = useState<string[]>([]);
    const [rooms, setRooms] = useState<string[]>([]);
    const [subjects, setSubjects] = useState<string[]>([]);

    const [blocks, setBlocks] = useState<ScheduleBlock[]>([]);

    // View Filters
    const [filters, setFilters] = useState({
        viewMode: 'Class' as ViewMode,
        target: '',
        semester: DEFAULT_SEMESTER,
    });

    // Modal States
    const [isAddEditModalOpen, setIsAddEditModalOpen] = useState(false);
    const [isPublishModalOpen, setIsPublishModalOpen] = useState(false);
    const [editingBlockId, setEditingBlockId] = useState<string | null>(null);
    const [conflictErrors, setConflictErrors] = useState<string[]>([]);

    // Form Data
    const [formData, setFormData] = useState({
        day: 'Monday' as DayOfWeek,
        startTime: '08:00',
        endTime: '09:30',
        subject: '',
        teacher: '',
        room: '',
        targetClass: '',
    });

    // Fetch schedules from API on mount
    const loadSchedules = useCallback(async () => {
        setLoading(true);
        try {
            const schedules: Schedule[] = await schedulesApi.list();

            const apiBlocks = schedules.map(scheduleToBlock);
            setBlocks(apiBlocks);

            const unique = <T,>(arr: (T | null | undefined)[]): T[] =>
                [...new Set(arr.filter((x): x is T => x != null))].sort() as T[];

            const uniqueClasses  = unique(schedules.map(s => s.class_name));
            const uniqueTeachers = unique(schedules.map(s => s.teacher_name));
            const uniqueRooms    = unique(schedules.map(s => s.room));
            const uniqueSubjects = unique(schedules.map(s => s.subject_name));

            setClasses(uniqueClasses);
            setTeachers(uniqueTeachers);
            setRooms(uniqueRooms);
            setSubjects(uniqueSubjects);

            if (uniqueClasses.length > 0) {
                setFilters(f => ({ ...f, target: f.target || uniqueClasses[0] }));
            }
        } catch (err) {
            console.error('Failed to load schedules:', err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { loadSchedules(); }, [loadSchedules]);

    // --- Action Handlers ---
    const handleViewModeChange = (mode: ViewMode) => {
        const defaultTarget = mode === 'Class' ? classes[0] : mode === 'Teacher' ? teachers[0] : rooms[0];
        setFilters({ ...filters, viewMode: mode, target: defaultTarget ?? '' });
    };

    const openCreateModal = () => {
        setEditingBlockId(null);
        setFormData({
            day: 'Monday', startTime: '08:00', endTime: '09:30', subject: '', teacher: '', room: '',
            targetClass: filters.viewMode === 'Class' ? filters.target : '',
        });
        setConflictErrors([]);
        setIsAddEditModalOpen(true);
    };

    const openEditModal = (blockId: string) => {
        const block = blocks.find(b => b.id === blockId);
        if (!block) return;
        setEditingBlockId(blockId);
        setFormData({
            day: block.day, startTime: block.startTime, endTime: block.endTime,
            subject: block.subject, teacher: block.teacher, room: block.room, targetClass: block.targetClass,
        });
        setConflictErrors([]);
        setIsAddEditModalOpen(true);
    };

    const checkConflicts = () => {
        const errors: string[] = [];
        const startMins = getMinutesFromStart(formData.startTime);
        const endMins   = getMinutesFromStart(formData.endTime);

        if (startMins >= endMins) { errors.push("End time must be after start time."); return errors; }
        if (!formData.targetClass) errors.push("Class Section is required.");
        if (!formData.teacher)     errors.push("Teacher is required.");
        if (!formData.room)        errors.push("Room is required.");
        if (errors.length > 0) return errors;

        // Only check conflicts against draft blocks (API blocks are already live & assumed conflict-free)
        blocks.filter(b => b.status === 'draft').forEach(b => {
            if (b.day !== formData.day || b.id === editingBlockId) return;
            const bStart = getMinutesFromStart(b.startTime);
            const bEnd   = getMinutesFromStart(b.endTime);
            const overlaps = startMins < bEnd && endMins > bStart;
            if (overlaps) {
                if (b.teacher === formData.teacher)         errors.push(`${b.teacher} is already teaching ${b.targetClass} at this time.`);
                if (b.room === formData.room)               errors.push(`${b.room} is occupied by ${b.targetClass} at this time.`);
                if (b.targetClass === formData.targetClass) errors.push(`${formData.targetClass} already has ${b.subject} scheduled here.`);
            }
        });
        return errors;
    };

    const handleSaveBlock = () => {
        if (!formData.subject || !formData.teacher || !formData.room || !formData.targetClass) return;
        const errors = checkConflicts();
        if (errors.length > 0) { setConflictErrors(errors); return; }

        if (editingBlockId) {
            setBlocks(blocks.map(b => b.id === editingBlockId ? { ...b, ...formData, status: 'draft' as const } : b));
        } else {
            const newBlock: ScheduleBlock = {
                id: `draft_${Date.now()}`,
                ...formData,
                semester: filters.semester,
                status: 'draft',
            };
            setBlocks([...blocks, newBlock]);
        }
        setIsAddEditModalOpen(false);
    };

    const handleDeleteBlock = () => {
        if (editingBlockId) {
            setBlocks(blocks.filter(b => b.id !== editingBlockId));
            setIsAddEditModalOpen(false);
        }
    };

    const handlePublish = () => {
        setBlocks(blocks.map(b =>
            (b.targetClass === filters.target && b.semester === filters.semester && b.status === 'draft')
                ? { ...b, status: 'published' as const }
                : b
        ));
        setIsPublishModalOpen(false);
    };

    // --- Grid Rendering ---
    const visibleBlocks = blocks.filter(b => {
        if (b.semester !== filters.semester) return false;
        if (filters.viewMode === 'Class')   return b.targetClass === filters.target;
        if (filters.viewMode === 'Teacher') return b.teacher === filters.target;
        if (filters.viewMode === 'Room')    return b.room === filters.target;
        return false;
    });

    const draftCount = blocks.filter(b =>
        b.targetClass === filters.target && b.semester === filters.semester && b.status === 'draft'
    ).length;

    const targetOptions = filters.viewMode === 'Class' ? classes
        : filters.viewMode === 'Teacher' ? teachers
        : rooms;

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
            <PageHeader
                title="Timetable"
                subtitle="Master schedules for all Grade 11 classes"
            />

            <div className="flex-1 p-8 max-w-7xl mx-auto w-full flex flex-col gap-6">

                {/* Control Bar */}
                <div className="bg-white rounded-2xl border border-slate-200 p-4 flex flex-wrap items-center justify-between gap-4 shadow-sm">
                    <div className="flex flex-wrap items-center gap-3">

                        {/* View Mode */}
                        <div className="relative">
                            <Filter className="absolute left-3.5 top-3 w-4 h-4 text-slate-400 pointer-events-none" />
                            <select
                                value={filters.viewMode}
                                onChange={(e) => handleViewModeChange(e.target.value as ViewMode)}
                                className="pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-700 appearance-none cursor-pointer focus:outline-none hover:bg-slate-100 transition-colors"
                            >
                                <option value="Class">View by Class</option>
                                <option value="Teacher">View by Teacher</option>
                                <option value="Room">View by Room</option>
                            </select>
                            <ChevronDown className="absolute right-3 top-3 w-4 h-4 text-slate-400 pointer-events-none" />
                        </div>

                        {/* Target */}
                        <div className="relative min-w-[160px]">
                            {filters.viewMode === 'Class'   && <Layers className="absolute left-3.5 top-3 w-4 h-4 text-slate-400 pointer-events-none" />}
                            {filters.viewMode === 'Teacher' && <Users  className="absolute left-3.5 top-3 w-4 h-4 text-slate-400 pointer-events-none" />}
                            {filters.viewMode === 'Room'    && <MapPin className="absolute left-3.5 top-3 w-4 h-4 text-slate-400 pointer-events-none" />}
                            <select
                                value={filters.target}
                                onChange={(e) => setFilters({ ...filters, target: e.target.value })}
                                disabled={targetOptions.length === 0}
                                className="pl-10 pr-10 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-900 appearance-none cursor-pointer focus:outline-none w-full hover:bg-slate-50 transition-colors shadow-sm disabled:opacity-50"
                            >
                                {targetOptions.map(o => <option key={o} value={o}>{o}</option>)}
                            </select>
                            <ChevronDown className="absolute right-3 top-3 w-4 h-4 text-slate-400 pointer-events-none" />
                        </div>

                        {/* Semester (label only — data is always current academic year) */}
                        <div className="flex items-center gap-2 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl">
                            <Calendar className="w-4 h-4 text-slate-400" />
                            <span className="text-sm font-medium text-slate-700">{DEFAULT_SEMESTER}</span>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-3">
                        <button
                            onClick={openCreateModal}
                            className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-sm font-medium flex items-center gap-2 transition-colors"
                        >
                            <Plus className="w-4 h-4" /> Add Draft Block
                        </button>
                        <button
                            onClick={() => setIsPublishModalOpen(true)}
                            disabled={draftCount === 0}
                            className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl text-sm font-bold flex items-center gap-2 transition-colors shadow-sm"
                        >
                            <Send className="w-4 h-4" /> Publish ({draftCount})
                        </button>
                    </div>
                </div>

                {/* Timetable Grid */}
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-x-auto">
                    {loading ? (
                        <div className="flex items-center justify-center py-32 gap-3 text-slate-500">
                            <Loader2 className="w-5 h-5 animate-spin" />
                            <span className="text-sm font-medium">Loading schedule…</span>
                        </div>
                    ) : (
                        <div className="min-w-[900px]">
                            {/* Header Row */}
                            <div className="grid grid-cols-[80px_repeat(6,1fr)] border-b border-slate-200 bg-slate-50">
                                <div className="p-3 border-r border-slate-200 flex justify-center items-center">
                                    <Clock className="w-4 h-4 text-slate-400" />
                                </div>
                                {DAYS.map(day => (
                                    <div key={day} className="p-3 text-center border-r border-slate-200">
                                        <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">{day}</span>
                                    </div>
                                ))}
                            </div>

                            {/* Body */}
                            <div
                                className="grid grid-cols-[80px_repeat(6,1fr)] relative border-b border-slate-200"
                                style={{ height: `${(TOTAL_MINUTES * 1.5) + 90}px` }}
                            >
                                {/* Time Labels */}
                                <div className="border-r border-slate-200 bg-slate-50/50 flex flex-col relative z-10">
                                    {Array.from({ length: GRID_END_HOUR - GRID_START_HOUR + 1 }).map((_, i) => (
                                        <div
                                            key={i}
                                            className="absolute w-full flex justify-end pr-3 border-t border-slate-200/50"
                                            style={{ top: `${i * 60 * 1.5}px`, height: '90px' }}
                                        >
                                            <span className="text-[12px] font-bold text-slate-400 mt-1">
                                                {formatTo12Hour(`${GRID_START_HOUR + i}:00`)}
                                            </span>
                                        </div>
                                    ))}
                                </div>

                                {/* Day Columns */}
                                {DAYS.map((day) => (
                                    <div key={day} className="border-r border-slate-200 relative">
                                        {Array.from({ length: GRID_END_HOUR - GRID_START_HOUR + 1 }).map((_, i) => (
                                            <div
                                                key={i}
                                                className="absolute w-full border-t border-slate-100"
                                                style={{ top: `${i * 60 * 1.5}px`, height: '90px' }}
                                            />
                                        ))}

                                        {visibleBlocks.filter(b => b.day === day).map(block => {
                                            const topPx    = getMinutesFromStart(block.startTime) * 1.5;
                                            const heightPx = (getMinutesFromStart(block.endTime) - getMinutesFromStart(block.startTime)) * 1.5;
                                            const isDraft  = block.status === 'draft';

                                            return (
                                                <div
                                                    key={block.id}
                                                    onClick={() => openEditModal(block.id)}
                                                    className={`absolute left-1 right-1 rounded-lg border-l-[3px] p-2.5 shadow-sm flex flex-col overflow-hidden transition-all cursor-pointer hover:shadow-md hover:scale-[1.01] ${
                                                        isDraft
                                                            ? 'bg-orange-50/90 border-orange-400 border-dashed'
                                                            : 'bg-indigo-50 border-indigo-500'
                                                    }`}
                                                    style={{ top: `${topPx}px`, height: `${heightPx - 4}px` }}
                                                >
                                                    <div className="flex justify-between items-start">
                                                        <span className={`text-sm font-bold truncate ${isDraft ? 'text-orange-950' : 'text-indigo-950'}`}>
                                                            {block.subject}
                                                        </span>
                                                        {isDraft ? (
                                                            <span className="text-[9px] font-bold bg-orange-200 text-orange-900 px-1.5 py-0.5 rounded uppercase tracking-wider shrink-0">Draft</span>
                                                        ) : (
                                                            <span className="inline-flex items-center gap-1 text-[9px] font-bold bg-emerald-100 text-emerald-700 border border-emerald-200 px-1.5 py-0.5 rounded uppercase tracking-wider shrink-0">
                                                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>Live
                                                            </span>
                                                        )}
                                                    </div>
                                                    <div className={`flex items-center gap-1 text-[11px] mt-1 font-medium ${isDraft ? 'text-orange-800' : 'text-indigo-800/80'}`}>
                                                        <Clock className="w-3 h-3" /> {getDurationLabel(block.startTime, block.endTime)}
                                                    </div>
                                                    <div className="mt-auto flex flex-col gap-0.5">
                                                        <span className={`text-xs font-medium truncate flex items-center gap-1.5 ${isDraft ? 'text-orange-900' : 'text-indigo-900'}`}>
                                                            <Users className="w-3 h-3" />
                                                            {filters.viewMode === 'Teacher' ? block.targetClass : block.teacher}
                                                        </span>
                                                        {block.room !== '—' && (
                                                            <span className={`text-xs font-medium truncate flex items-center gap-1.5 ${isDraft ? 'text-orange-900' : 'text-indigo-900'}`}>
                                                                <MapPin className="w-3 h-3" /> {block.room}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                ))}
                            </div>

                            {/* Empty state */}
                            {!loading && visibleBlocks.length === 0 && filters.target && (
                                <div className="flex flex-col items-center justify-center py-16 text-slate-400 gap-2">
                                    <Calendar className="w-8 h-8" />
                                    <p className="text-sm font-medium">No schedule found for {filters.target}</p>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* ADD/EDIT MODAL */}
            {isAddEditModalOpen && (
                <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
                        <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center">
                            <h2 className="text-lg font-bold text-slate-900">
                                {editingBlockId ? 'Edit Block' : 'Add Draft Block'}
                            </h2>
                            <button onClick={() => setIsAddEditModalOpen(false)} className="text-slate-400 hover:bg-slate-100 p-1.5 rounded-full">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="p-6 flex flex-col gap-5 bg-slate-50/50 max-h-[70vh] overflow-y-auto">
                            {conflictErrors.length > 0 && (
                                <div className="bg-red-50 border border-red-200 p-3 rounded-xl flex items-start gap-2">
                                    <AlertTriangle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                                    <div className="flex flex-col gap-1">
                                        {conflictErrors.map((err, i) => <span key={i} className="text-xs text-red-700 font-medium">• {err}</span>)}
                                    </div>
                                </div>
                            )}

                            <div className="relative">
                                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 block">Day</label>
                                <select
                                    value={formData.day}
                                    onChange={e => setFormData({ ...formData, day: e.target.value as DayOfWeek })}
                                    className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm font-medium appearance-none focus:ring-2 focus:ring-indigo-200"
                                >
                                    {DAYS.map(d => <option key={d} value={d}>{d}</option>)}
                                </select>
                                <ChevronDown className="absolute right-3 bottom-3 text-slate-400 w-4 h-4 pointer-events-none" />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 block">Start Time</label>
                                    <input type="time" value={formData.startTime} min="07:00" max="17:00" onChange={e => setFormData({ ...formData, startTime: e.target.value })} className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm font-medium focus:ring-2 focus:ring-indigo-200" />
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 block">End Time</label>
                                    <input type="time" value={formData.endTime} min="07:00" max="17:00" onChange={e => setFormData({ ...formData, endTime: e.target.value })} className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm font-medium focus:ring-2 focus:ring-indigo-200" />
                                </div>
                            </div>

                            <CustomCombobox label="Class Section" value={formData.targetClass} onChange={val => setFormData({ ...formData, targetClass: val })} options={classes} placeholder="Select class…" onAddCustom={(v) => setClasses([...classes, v])} />
                            <CustomCombobox label="Subject"       value={formData.subject}      onChange={val => setFormData({ ...formData, subject: val })}      options={subjects} placeholder="Select subject…" onAddCustom={(v) => setSubjects([...subjects, v])} />
                            <CustomCombobox label="Teacher"       value={formData.teacher}      onChange={val => setFormData({ ...formData, teacher: val })}      options={teachers} placeholder="Select teacher…" onAddCustom={(v) => setTeachers([...teachers, v])} />
                            <CustomCombobox label="Room"          value={formData.room}         onChange={val => setFormData({ ...formData, room: val })}         options={rooms}    placeholder="e.g. Room 101"    onAddCustom={(v) => setRooms([...rooms, v])} />
                        </div>

                        <div className="p-6 border-t border-slate-100 bg-white flex justify-between items-center">
                            {editingBlockId ? (
                                <button onClick={handleDeleteBlock} className="text-red-600 hover:bg-red-50 px-4 py-2 rounded-xl text-sm font-bold transition-colors">Delete</button>
                            ) : <div />}
                            <button
                                onClick={handleSaveBlock}
                                className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2 shadow-sm"
                            >
                                {editingBlockId ? 'Save Changes' : <><Plus className="w-4 h-4" /> Add to Draft</>}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* PUBLISH MODAL */}
            {isPublishModalOpen && (
                <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-[24px] shadow-xl w-full max-w-[480px] overflow-hidden">
                        <div className="px-6 py-5 flex justify-between items-center">
                            <h2 className="text-[22px] font-bold text-slate-900">Publish Draft Blocks</h2>
                            <button onClick={() => setIsPublishModalOpen(false)} className="text-slate-400 hover:bg-slate-100 p-2 rounded-full transition-colors">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="px-6 pb-6 flex flex-col gap-4">
                            <div className="bg-[#effcf2] border border-[#a7f3d0] rounded-xl p-5">
                                <h3 className="font-bold text-[#065f46] text-base flex items-center gap-2 mb-1.5">
                                    <Send className="w-4 h-4" /> Ready to go live
                                </h3>
                                <p className="text-sm text-[#065f46] leading-relaxed">
                                    Mark all draft blocks for <strong>{filters.target}</strong> as published.
                                </p>
                            </div>

                            <div className="bg-white border border-slate-200 rounded-xl p-5 flex justify-between items-center shadow-sm">
                                <span className="text-[15px] font-bold text-[#1e293b]">Unpublished Drafts:</span>
                                <span className="bg-[#fef3c7] text-[#92400e] font-bold px-3 py-1.5 rounded-lg text-sm">{draftCount} blocks</span>
                            </div>
                        </div>

                        <div className="px-6 py-5 border-t border-slate-100 flex justify-end gap-3 bg-white">
                            <button onClick={() => setIsPublishModalOpen(false)} className="px-5 py-2.5 rounded-xl text-[15px] font-bold text-[#334155] hover:bg-slate-100 transition-colors">Cancel</button>
                            <button
                                onClick={handlePublish}
                                disabled={draftCount === 0}
                                className="bg-[#059669] hover:bg-[#047857] disabled:opacity-50 disabled:cursor-not-allowed text-white px-6 py-2.5 rounded-xl text-[15px] font-bold shadow-sm transition-colors"
                            >
                                Confirm & Publish
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
