'use client';

import React, { useState, useRef, useEffect } from 'react';
import PageHeader from '@/components/layouts/PageHeader';
import { Plus, X, Clock, MapPin, Filter, Layers, Users, ChevronDown, Send, Calendar, AlertTriangle } from 'lucide-react';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import Combobox from '@/components/ui/Combobox';

import { getTimetableData, DayOfWeek, ViewMode, ScheduleBlock } from '@/lib/mock-data/admin';
import { GRID_START_HOUR, GRID_END_HOUR, TOTAL_MINUTES, getMinutesFromStart, formatTo12Hour, getDurationLabel } from '@/lib/utils/time';

// --- Constants & Initial Data ---
const DAYS: DayOfWeek[] = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

// --- Main Page ---
export default function AdminTimetablePage() {
    const mockData = getTimetableData();

    // Dynamic Lists (In real app, fetched from DB)
    const [classes, setClasses] = useState(mockData.classes);
    const [teachers, setTeachers] = useState(mockData.teachers);
    const [rooms, setRooms] = useState(mockData.rooms);
    const [subjects, setSubjects] = useState(mockData.subjects);
    const [semesters, setSemesters] = useState(mockData.semesters);

    const [blocks, setBlocks] = useState<ScheduleBlock[]>(mockData.blocks);

    // View Filters
    const [filters, setFilters] = useState({
        viewMode: 'Class' as ViewMode,
        target: classes[0],
        semester: semesters[0]
    });

    // Modal States
    const [isAddEditModalOpen, setIsAddEditModalOpen] = useState(false);
    const [isPublishModalOpen, setIsPublishModalOpen] = useState(false);
    const [isAddSemesterModalOpen, setIsAddSemesterModalOpen] = useState(false);
    const [newSemesterName, setNewSemesterName] = useState('');
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
        targetClass: '' // Added to form so Admin can assign class if viewing by Teacher/Room
    });

    // --- Action Handlers ---
    const handleViewModeChange = (mode: ViewMode) => {
        const defaultTarget = mode === 'Class' ? classes[0] : mode === 'Teacher' ? teachers[0] : rooms[0];
        setFilters({ ...filters, viewMode: mode, target: defaultTarget });
    };

    const handleAddSemester = () => {
        const name = newSemesterName.trim();
        if (name && !semesters.includes(name)) {
            setSemesters([...semesters, name]);
            setFilters({ ...filters, semester: name });
        }
        setNewSemesterName('');
        setIsAddSemesterModalOpen(false);
    };

    const openCreateModal = () => {
        setEditingBlockId(null);
        setFormData({
            day: 'Monday', startTime: '08:00', endTime: '09:30', subject: '', teacher: '', room: '',
            targetClass: filters.viewMode === 'Class' ? filters.target : ''
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
            subject: block.subject, teacher: block.teacher, room: block.room, targetClass: block.targetClass
        });
        setConflictErrors([]);
        setIsAddEditModalOpen(true);
    };

    const checkConflicts = () => {
        const errors: string[] = [];
        const startMins = getMinutesFromStart(formData.startTime);
        const endMins = getMinutesFromStart(formData.endTime);

        if (startMins >= endMins) {
            errors.push("End time must be after start time.");
            return errors;
        }
        if (!formData.targetClass) errors.push("Class Section is required.");
        if (!formData.teacher) errors.push("Teacher is required.");
        if (!formData.room) errors.push("Room is required.");
        if (errors.length > 0) return errors; // Bail early before overlap check

        blocks.forEach(b => {
            if (b.day !== formData.day || b.semester !== filters.semester || b.id === editingBlockId) return;

            const bStart = getMinutesFromStart(b.startTime);
            const bEnd = getMinutesFromStart(b.endTime);
            const overlaps = (startMins < bEnd && endMins > bStart);

            if (overlaps) {
                if (b.teacher === formData.teacher) errors.push(`${b.teacher} is already teaching ${b.targetClass} at this time.`);
                if (b.room === formData.room) errors.push(`${b.room} is occupied by ${b.targetClass} at this time.`);
                if (b.targetClass === formData.targetClass) errors.push(`${formData.targetClass} already has ${b.subject} scheduled here.`);
            }
        });
        return errors;
    };

    const handleSaveBlock = () => {
        if (!formData.subject || !formData.teacher || !formData.room || !formData.targetClass) return;

        const errors = checkConflicts();
        if (errors.length > 0) {
            setConflictErrors(errors);
            return;
        }

        if (editingBlockId) {
            // Editing a block always resets it to 'draft' — it re-enters the sandbox
            setBlocks(blocks.map(b => b.id === editingBlockId ? { ...b, ...formData, status: 'draft' as const } : b));
        } else {
            const newBlock: ScheduleBlock = {
                id: `blk_${Date.now()}`,
                ...formData,
                semester: filters.semester,
                status: 'draft'
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
        // Scoped Publish: strictly targets class + semester, regardless of viewMode
        setBlocks(blocks.map(b =>
            (b.targetClass === filters.target && b.semester === filters.semester && b.status === 'draft')
                ? { ...b, status: 'published' as const }
                : b
        ));
        setIsPublishModalOpen(false);
    };

    // --- Grid Rendering Data ---
    const visibleBlocks = blocks.filter(b => {
        if (b.semester !== filters.semester) return false;
        if (filters.viewMode === 'Class') return b.targetClass === filters.target;
        if (filters.viewMode === 'Teacher') return b.teacher === filters.target;
        if (filters.viewMode === 'Room') return b.room === filters.target;
        return false;
    });

    // Draft count always scoped to class+semester for the Publish modal
    const draftCount = blocks.filter(b =>
        b.targetClass === filters.target && b.semester === filters.semester && b.status === 'draft'
    ).length;

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
            <PageHeader 
                title="Timetable"
                subtitle="Manage master schedules and room assignments per semester"
            />

            <div className="flex-1 p-8 max-w-7xl mx-auto w-full flex flex-col gap-6">

                {/* Control Bar */}
                <div className="bg-white rounded-2xl border border-slate-200 p-4 flex flex-wrap items-center justify-between gap-4 shadow-sm">
                    <div className="flex flex-wrap items-center gap-3">

                        {/* View Filter */}
                        <div className="relative">
                            <Filter className="absolute left-3.5 top-3 w-4 h-4 text-slate-400 pointer-events-none" />
                            <select value={filters.viewMode} onChange={(e) => handleViewModeChange(e.target.value as ViewMode)} className="pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-700 appearance-none cursor-pointer focus:outline-none hover:bg-slate-100 transition-colors">
                                <option value="Class">View by Class</option>
                                <option value="Teacher">View by Teacher</option>
                                <option value="Room">View by Room</option>
                            </select>
                            <ChevronDown className="absolute right-3 top-3 w-4 h-4 text-slate-400 pointer-events-none" />
                        </div>

                        {/* Target Filter */}
                        <div className="relative min-w-[160px]">
                            {filters.viewMode === 'Class' && <Layers className="absolute left-3.5 top-3 w-4 h-4 text-slate-400 pointer-events-none" />}
                            {filters.viewMode === 'Teacher' && <Users className="absolute left-3.5 top-3 w-4 h-4 text-slate-400 pointer-events-none" />}
                            {filters.viewMode === 'Room' && <MapPin className="absolute left-3.5 top-3 w-4 h-4 text-slate-400 pointer-events-none" />}
                            <select value={filters.target} onChange={(e) => setFilters({ ...filters, target: e.target.value })} className="pl-10 pr-10 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-900 appearance-none cursor-pointer focus:outline-none w-full hover:bg-slate-50 transition-colors shadow-sm">
                                {filters.viewMode === 'Class' && classes.map(c => <option key={c} value={c}>{c}</option>)}
                                {filters.viewMode === 'Teacher' && teachers.map(t => <option key={t} value={t}>{t}</option>)}
                                {filters.viewMode === 'Room' && rooms.map(r => <option key={r} value={r}>{r}</option>)}
                            </select>
                            <ChevronDown className="absolute right-3 top-3 w-4 h-4 text-slate-400 pointer-events-none" />
                        </div>

                        {/* Semester Filter (Dynamic) */}
                        <div className="flex items-center gap-1.5">
                            <div className="relative">
                                <Calendar className="absolute left-3.5 top-3 w-4 h-4 text-slate-400 pointer-events-none" />
                                <select value={filters.semester} onChange={(e) => setFilters({ ...filters, semester: e.target.value })} className="pl-10 pr-10 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-700 appearance-none cursor-pointer focus:outline-none hover:bg-slate-50 transition-colors shadow-sm">
                                    {semesters.map(s => <option key={s} value={s}>{s}</option>)}
                                </select>
                                <ChevronDown className="absolute right-3 top-3 w-4 h-4 text-slate-400 pointer-events-none" />
                            </div>
                            <button onClick={() => setIsAddSemesterModalOpen(true)} className="p-2.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl text-slate-500 hover:text-slate-700 transition-colors" title="Add new semester">
                                <Plus className="w-4 h-4" />
                            </button>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-3">
                        <Button onClick={openCreateModal} variant="outline" icon={Plus}>
                            Add Block
                        </Button>
                        <Button onClick={() => setIsPublishModalOpen(true)} variant="primary" color="bg-emerald-600 hover:bg-emerald-700" icon={Send} className="hidden sm:flex">
                            Publish Schedule
                        </Button>
                    </div>
                </div>

                {/* Timetable Grid */}
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-x-auto">
                    <div className="min-w-[900px]">
                        {/* Header Row */}
                        <div className="grid grid-cols-[80px_repeat(6,1fr)] border-b border-slate-200 bg-slate-50">
                            <div className="p-3 border-r border-slate-200 flex justify-center items-center"><Clock className="w-4 h-4 text-slate-400" /></div>
                            {DAYS.map(day => (
                                <div key={day} className="p-3 text-center border-r border-slate-200">
                                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">{day}</span>
                                </div>
                            ))}
                        </div>

                        {/* Body Matrix (Absolute Positioning) */}
                        <div className="grid grid-cols-[80px_repeat(6,1fr)] relative border-b border-slate-200" style={{ height: `${(TOTAL_MINUTES * 1.5) + 90}px` }}>

                            {/* Time Labels */}
                            <div className="border-r border-slate-200 bg-slate-50/50 flex flex-col relative z-10">
                                {Array.from({ length: GRID_END_HOUR - GRID_START_HOUR + 1 }).map((_, i) => (
                                    <div key={i} className="absolute w-full flex justify-end pr-3 border-t border-slate-200/50" style={{ top: `${i * 60 * 1.5}px`, height: '90px' }}>
                                        <span className="text-[12px] font-bold text-slate-400 mt-1">{formatTo12Hour(`${GRID_START_HOUR + i}:00`)}</span>
                                    </div>
                                ))}
                            </div>

                            {/* Day Columns */}
                            {DAYS.map((day) => (
                                <div key={day} className="border-r border-slate-200 relative group">
                                    {Array.from({ length: GRID_END_HOUR - GRID_START_HOUR + 1 }).map((_, i) => (
                                        <div key={i} className="absolute w-full border-t border-slate-100" style={{ top: `${i * 60 * 1.5}px`, height: '90px' }} />
                                    ))}

                                    {/* Render Blocks */}
                                    {visibleBlocks.filter(b => b.day === day).map(block => {
                                        const topPx = getMinutesFromStart(block.startTime) * 1.5;
                                        const heightPx = (getMinutesFromStart(block.endTime) - getMinutesFromStart(block.startTime)) * 1.5;
                                        const isDraft = block.status === 'draft';

                                        return (
                                            <div
                                                key={block.id}
                                                onClick={() => openEditModal(block.id)}
                                                className={`absolute left-1 right-1 rounded-lg border-l-[3px] p-2.5 shadow-sm flex flex-col overflow-hidden transition-all cursor-pointer hover:shadow-md hover:scale-[1.01] ${isDraft ? 'bg-orange-50/90 border-orange-400 border-dashed' : 'bg-indigo-50 border-indigo-500'}`}
                                                style={{ top: `${topPx}px`, height: `${heightPx - 4}px` }}
                                            >
                                                <div className="flex justify-between items-start">
                                                    <span className={`text-sm font-bold truncate ${isDraft ? 'text-orange-950' : 'text-indigo-950'}`}>{block.subject}</span>
                                                    {isDraft ? (
                                                        <span className="text-[9px] font-bold bg-orange-200 text-orange-900 px-1.5 py-0.5 rounded uppercase tracking-wider shrink-0">Draft</span>
                                                    ) : (
                                                        <span className="inline-flex items-center gap-1 text-[9px] font-bold bg-emerald-100 text-emerald-700 border border-emerald-200 px-1.5 py-0.5 rounded uppercase tracking-wider shrink-0">
                                                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>Live
                                                        </span>
                                                    )}
                                                </div>
                                                <div className={`flex items-center gap-1 text-[11px] mt-1 font-medium ${isDraft ? 'text-orange-800' : 'text-indigo-800/80'}`}>
                                                    <Clock className="w-3 h-3" /> {getDurationLabel(block.startTime, block.endTime)} block
                                                </div>
                                                <div className="mt-auto flex flex-col gap-0.5">
                                                    <span className={`text-xs font-medium truncate flex items-center gap-1.5 ${isDraft ? 'text-orange-900' : 'text-indigo-900'}`}><Users className="w-3 h-3" /> {filters.viewMode === 'Teacher' ? block.targetClass : block.teacher}</span>
                                                    <span className={`text-xs font-medium truncate flex items-center gap-1.5 ${isDraft ? 'text-orange-900' : 'text-indigo-900'}`}><MapPin className="w-3 h-3" /> {block.room}</span>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* ========== ADD/EDIT MODAL ========== */}
            <Modal isOpen={isAddEditModalOpen} onClose={() => setIsAddEditModalOpen(false)} title={editingBlockId ? 'Edit Schedule Block' : 'Add Schedule Block'}>
                <div className="flex flex-col gap-5 py-2 max-h-[60vh] overflow-y-auto pr-2">
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
                        <select value={formData.day} onChange={e => setFormData({ ...formData, day: e.target.value as DayOfWeek })} className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm font-medium appearance-none focus:ring-2 focus:ring-indigo-200">
                            {DAYS.map(d => <option key={d} value={d}>{d}</option>)}
                        </select>
                        <ChevronDown className="absolute right-3 bottom-3 text-slate-400 w-4 h-4 pointer-events-none" />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 block">Time Slot</label>
                            <input type="time" value={formData.startTime} min="07:00" max="17:00" onChange={e => setFormData({ ...formData, startTime: e.target.value })} className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm font-medium focus:ring-2 focus:ring-indigo-200" />
                        </div>
                        <div>
                            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 block">End Time</label>
                            <input type="time" value={formData.endTime} min="07:00" max="17:00" onChange={e => setFormData({ ...formData, endTime: e.target.value })} className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm font-medium focus:ring-2 focus:ring-indigo-200" />
                        </div>
                    </div>

                    {/* Class Section (Required if creating from Teacher/Room view) */}
                    <Combobox label="Class Section" value={formData.targetClass} onChange={val => setFormData({ ...formData, targetClass: val })} options={classes} placeholder="Select Class..." onAddCustom={(v) => setClasses([...classes, v])} />
                    <Combobox label="Subject" value={formData.subject} onChange={val => setFormData({ ...formData, subject: val })} options={subjects} placeholder="Select subject..." onAddCustom={(v) => setSubjects([...subjects, v])} />
                    <Combobox label="Teacher" value={formData.teacher} onChange={val => setFormData({ ...formData, teacher: val })} options={teachers} placeholder="Select teacher..." onAddCustom={(v) => setTeachers([...teachers, v])} />
                    <Combobox label="Room" value={formData.room} onChange={val => setFormData({ ...formData, room: val })} options={rooms} placeholder="Select room..." onAddCustom={(v) => setRooms([...rooms, v])} />
                </div>

                <div className="pt-6 mt-6 border-t border-slate-100 flex justify-between items-center">
                    {editingBlockId ? (
                        <button onClick={handleDeleteBlock} className="text-red-600 hover:bg-red-50 px-4 py-2 rounded-xl text-sm font-bold transition-colors">Delete</button>
                    ) : <div></div>}
                    <Button onClick={handleSaveBlock} variant="primary" color="bg-indigo-600" icon={editingBlockId ? undefined : Plus}>
                        {editingBlockId ? 'Save Changes' : 'Add to Draft'}
                    </Button>
                </div>
            </Modal>

            {/* ========== CLEAN PUBLISH MODAL ========== */}
            <Modal isOpen={isPublishModalOpen} onClose={() => setIsPublishModalOpen(false)} title="Publish Timetable">
                <div className="flex flex-col gap-4 py-2">
                    {/* Green Ready Box */}
                    <div className="bg-[#effcf2] border border-[#a7f3d0] rounded-xl p-5">
                        <h3 className="font-bold text-[#065f46] text-base flex items-center gap-2 mb-1.5">
                            <Send className="w-4 h-4" /> Ready to go live
                        </h3>
                        <p className="text-sm text-[#065f46] leading-relaxed">
                            You are about to publish the master schedule for <strong>{filters.target}</strong> ({filters.semester}).
                        </p>
                    </div>

                    {/* Yellow Drafts Box */}
                    <div className="bg-white border border-slate-200 rounded-xl p-5 flex justify-between items-center shadow-sm">
                        <span className="text-[15px] font-bold text-[#1e293b]">Unpublished Drafts:</span>
                        <span className="bg-[#fef3c7] text-[#92400e] font-bold px-3 py-1.5 rounded-lg text-sm">{draftCount} blocks</span>
                    </div>

                    <p className="text-sm text-slate-500 text-center mt-2">
                        Once published, this timetable will immediately appear on the students' portals.
                    </p>
                </div>

                {/* Footer */}
                <div className="pt-6 mt-6 border-t border-slate-100 flex justify-end gap-3">
                    <Button variant="ghost" onClick={() => setIsPublishModalOpen(false)}>Cancel</Button>
                    <Button onClick={handlePublish} disabled={draftCount === 0} variant="primary" color="bg-[#059669] hover:bg-[#047857]">
                        Confirm & Publish
                    </Button>
                </div>
            </Modal>
            {/* ========== ADD SEMESTER MODAL ========== */}
            <Modal isOpen={isAddSemesterModalOpen} onClose={() => { setIsAddSemesterModalOpen(false); setNewSemesterName(''); }} title="Add New Semester">
                <div className="flex flex-col gap-4 py-2">
                    <div>
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 block">Semester Name</label>
                        <input type="text" value={newSemesterName} onChange={e => setNewSemesterName(e.target.value)} placeholder="e.g. Summer 2026" className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm font-medium focus:ring-2 focus:ring-indigo-200" onKeyDown={(e) => { if (e.key === 'Enter') handleAddSemester(); }} />
                    </div>
                </div>
                <div className="pt-6 mt-4 border-t border-slate-100 flex justify-end gap-3">
                    <Button variant="ghost" onClick={() => { setIsAddSemesterModalOpen(false); setNewSemesterName(''); }}>Cancel</Button>
                    <Button onClick={handleAddSemester} variant="primary" color="bg-indigo-600">Add Semester</Button>
                </div>
            </Modal>
        </div>
    );
}