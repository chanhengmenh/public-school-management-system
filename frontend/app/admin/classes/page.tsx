'use client';

import React, { useState } from 'react';
import PageHeader from '@/components/layouts/PageHeader';
import { Search, Plus, X, Users, BookOpen, MapPin, Clock, ChevronRight, Trash2, CheckSquare, ChevronDown, Edit2 } from 'lucide-react';

// --- Types ---
type ClassStatus = 'Active' | 'Draft';

interface ClassRecord {
    id: string;
    courseCode: string;
    subject: string;
    section: string;
    teacher: string | null;
    enrolled: number;
    capacity: number;
    room: string;
    schedule: string;
    status: ClassStatus;
}

interface StudentRecord {
    id: string;
    name: string;
    grade: string;
}

// --- Dummy Data ---
const CLASSES_DATA: ClassRecord[] = [
    { id: 'c1', courseCode: 'PHY-101', subject: 'Physics', section: '11A', teacher: 'Mr. Tan Wei', enrolled: 28, capacity: 32, room: 'Room 304', schedule: 'Mon/Wed/Fri 08:00 AM', status: 'Active' },
    { id: 'c2', courseCode: 'MAT-201', subject: 'Advanced Math', section: '12B', teacher: 'Ms. Sarah Lee', enrolled: 30, capacity: 30, room: 'Room 210', schedule: 'Tue/Thu 10:00 AM', status: 'Active' },
    { id: 'c3', courseCode: 'ENG-105', subject: 'Literature', section: '10A', teacher: null, enrolled: 15, capacity: 25, room: 'Room 105', schedule: 'Mon/Wed 01:00 PM', status: 'Draft' },
    { id: 'c4', courseCode: 'HIS-102', subject: 'World History', section: '11B', teacher: 'Dr. Marcus Rivera', enrolled: 22, capacity: 28, room: 'Room 401', schedule: 'Tue/Fri 09:30 AM', status: 'Active' },
    { id: 'c5', courseCode: 'CHE-301', subject: 'Chemistry Lab', section: '12A', teacher: 'Ms. Priya Nair', enrolled: 24, capacity: 24, room: 'Lab 2', schedule: 'Thu 02:00 PM', status: 'Active' },
];

const AVAILABLE_STUDENTS: StudentRecord[] = [
    { id: 's1', name: 'Alex Johnson', grade: '11th Grade' },
    { id: 's2', name: 'Emily Chen', grade: '11th Grade' },
    { id: 's3', name: 'Michael Brown', grade: '10th Grade' },
    { id: 's4', name: 'Sarah Wilson', grade: '12th Grade' },
    { id: 's5', name: 'David Lee', grade: '11th Grade' },
    { id: 's6', name: 'Jessica Taylor', grade: '10th Grade' },
];

// --- Subcomponents ---

export default function AdminClassesPage() {
    // --- State ---
    const [classes, setClasses] = useState<ClassRecord[]>(CLASSES_DATA);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedClass, setSelectedClass] = useState<ClassRecord | null>(null);
    const [isCreating, setIsCreating] = useState(false);

    // --- Unified Modal State ---
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
    const [activeModalTab, setActiveModalTab] = useState<'Details' | 'Teacher' | 'People'>('Details');
    const [studentFilter, setStudentFilter] = useState('All Grades');
    
    const [formData, setFormData] = useState({
        courseCode: '',
        subject: '',
        section: '',
        room: '',
        capacity: 30, // Default to a number for edits
        schedule: '',
        teacher: '',
        students: [] as string[]
    });

    // --- Toast State ---
    const [toast, setToast] = useState<{ show: boolean; message: string; type?: 'success' | 'error' }>({ show: false, message: '', type: 'success' });

    // --- Handlers ---
    const handleOpenEditModal = (cls: ClassRecord) => {
        setSelectedClass(cls);
        setFormData({
            courseCode: cls.courseCode,
            subject: cls.subject,
            section: cls.section,
            room: cls.room,
            schedule: cls.schedule,
            capacity: cls.capacity,
            teacher: cls.teacher || '',
            students: [] // Mock: Assume no initially selected students for edit form demo
        });
        setModalMode('edit');
        setActiveModalTab('Details');
        setIsModalOpen(true);
    };

    const handleOpenCreateModal = () => {
        setSelectedClass(null);
        setFormData({
            courseCode: '',
            subject: '',
            section: '',
            room: '',
            capacity: 30, // Default for new
            schedule: '',
            teacher: '',
            students: []
        });
        setModalMode('create');
        setActiveModalTab('Details');
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setTimeout(() => setSelectedClass(null), 200);
    };

    const handleSaveClass = () => {
        if (!selectedClass) return;

        const isDetailsComplete = !!(formData.courseCode.trim() && formData.subject.trim() && formData.section.trim());
        const isTeacherComplete = !!formData.teacher;
        const isPeopleComplete = formData.students && formData.students.length > 0;
        const computedStatus = (isDetailsComplete && isTeacherComplete && isPeopleComplete) ? 'Active' : 'Draft';

        setClasses(prev => prev.map(c => 
            c.id === selectedClass.id ? { 
                ...c, 
                ...formData, // Apply all form edits (subject, courseCode, room, capacity, section, schedule)
                teacher: formData.teacher || null,
                enrolled: formData.students && formData.students.length > 0 ? formData.students.length : c.enrolled,
                status: computedStatus 
            } : c
        ));

        setToast({ show: true, message: 'Class Updated Successfully', type: 'success' });
        handleCloseModal();
        setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 3500);
    };

    const handleDeleteClass = (id: string) => {
        setClasses(prev => prev.filter(c => c.id !== id));
        setToast({ show: true, message: 'Class Removed Successfully', type: 'error' });
        setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 3500);
    };

    const handleCreateClassSubmit = () => {
        if (!formData.courseCode.trim() || !formData.subject.trim() || !formData.section.trim()) {
            return; // In a real app we'd show validation errors
        }

        const isDetailsComplete = !!(formData.courseCode.trim() && formData.subject.trim() && formData.section.trim());
        const isTeacherComplete = !!formData.teacher;
        const isPeopleComplete = formData.students.length > 0;
        const computedStatus = (isDetailsComplete && isTeacherComplete && isPeopleComplete) ? 'Active' : 'Draft';

        const newClass: ClassRecord = {
            id: `c${Date.now()}`,
            courseCode: formData.courseCode,
            subject: formData.subject,
            section: formData.section,
            teacher: formData.teacher || null,
            enrolled: formData.students.length,
            capacity: formData.capacity || 0,
            room: formData.room,
            schedule: formData.schedule,
            status: computedStatus
        };

        setClasses(prev => [newClass, ...prev]);
        setToast({ show: true, message: 'New Class Created Successfully', type: 'success' });
        
        handleCloseModal();
        setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 3500);
    };

    // --- Filtering ---
    const filteredClasses = classes.filter(cls =>
        cls.courseCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
        cls.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (cls.teacher && cls.teacher.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    // Common Input Styling
    const inputClass = "w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 transition-all text-slate-900";

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col relative">
            {/* Header */}
            <PageHeader
                title="Class Management"
                subtitle="Manage curriculum, assign teachers, and enroll students"
            />

            {/* Main Content (Master View) */}
            <div className="max-w-7xl mx-auto w-full px-6 lg:px-8 py-8 flex flex-col gap-6">

                {/* Action Bar */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="relative w-full sm:w-64 shrink-0">
                        <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                        <input
                            type="text"
                            placeholder="Search classes..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full bg-white border border-slate-200 rounded-xl pl-10 pr-4 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 transition-all shadow-sm"
                        />
                    </div>

                    <button
                        onClick={handleOpenCreateModal}
                        className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl text-sm font-bold shadow-sm transition-transform active:scale-95 flex items-center justify-center gap-2"
                    >
                        <Plus className="w-4 h-4" />
                        Create Class
                    </button>
                </div>

                {/* Data Table */}
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-50 border-b border-slate-200">
                                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Course Code</th>
                                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Class Info</th>
                                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Teacher</th>
                                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">People</th>
                                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Schedule</th>
                                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
                                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredClasses.length === 0 ? (
                                    <tr>
                                        <td colSpan={7} className="px-6 py-12 text-center text-slate-500 text-sm">
                                            No classes found matching your search.
                                        </td>
                                    </tr>
                                ) : (
                                    filteredClasses.map((cls) => (
                                        <tr
                                            key={cls.id}
                                            className="border-b border-slate-100 last:border-b-0 transition-colors group"
                                        >
                                            <td className="px-6 py-4">
                                                <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-bold bg-slate-100 text-slate-700">
                                                    {cls.courseCode}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex flex-col">
                                                    <span className="text-sm font-bold text-slate-900">{cls.subject}</span>
                                                    <span className="text-xs text-slate-500">Section {cls.section}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                {cls.teacher ? (
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-6 h-6 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center text-[10px] font-bold shrink-0">
                                                            {cls.teacher.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()}
                                                        </div>
                                                        <span className="text-sm font-medium text-slate-700">{cls.teacher}</span>
                                                    </div>
                                                ) : (
                                                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-50 text-red-600 border border-red-100">
                                                        Unassigned
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-1.5">
                                                    <Users className="w-4 h-4 text-slate-400" />
                                                    <span className="text-sm text-slate-600">
                                                        <span className={cls.enrolled >= cls.capacity ? "text-red-500 font-medium" : ""}>{cls.enrolled}</span>
                                                        <span className="text-slate-400">/{cls.capacity}</span>
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex flex-col gap-1">
                                                    <div className="flex items-center gap-1.5 text-xs text-slate-600">
                                                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                                                        {cls.schedule}
                                                    </div>
                                                    <div className="flex items-center gap-1.5 text-xs text-slate-600">
                                                        <MapPin className="w-3.5 h-3.5 text-slate-400" />
                                                        {cls.room}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`inline-flex items-center px-2.5 py-1 text-xs font-bold rounded-full border ${cls.status === 'Active' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-slate-100 text-slate-600 border-slate-200'
                                                    }`}>
                                                    {cls.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    <button 
                                                        onClick={(e) => { e.stopPropagation(); handleOpenEditModal(cls); }}
                                                        className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                                                        title="Edit Class"
                                                    >
                                                        <Edit2 className="w-4 h-4" />
                                                    </button>
                                                    <button 
                                                        onClick={(e) => { e.stopPropagation(); handleDeleteClass(cls.id); }}
                                                        className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                        title="Remove Class"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Unified Create/Edit Class Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={handleCloseModal}>
                    <div className="w-full max-w-3xl bg-white rounded-3xl shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-200 max-h-[90vh]" onClick={(e) => e.stopPropagation()}>
                        
                        {/* Header & Tabs Container */}
                        <div className="shrink-0 flex flex-col bg-white">
                            <div className="flex justify-between items-start p-8 pb-4">
                                {modalMode === 'edit' ? (
                                    <div className="flex items-center gap-4">
                                        <span className="inline-block px-3 py-1 rounded bg-slate-100 text-sm font-bold text-slate-600">
                                            {selectedClass?.courseCode || formData.courseCode}
                                        </span>
                                        <div>
                                            <h2 className="text-2xl font-bold text-slate-900 leading-tight">{selectedClass?.subject || formData.subject}</h2>
                                            <p className="text-sm text-slate-500">Section {selectedClass?.section || formData.section}</p>
                                        </div>
                                    </div>
                                ) : (
                                    <div>
                                        <h2 className="text-2xl font-bold text-slate-900 leading-tight">Create New Class</h2>
                                        <p className="text-sm text-slate-500 mt-1">Provide details to establish a new section</p>
                                    </div>
                                )}
                                <button 
                                    onClick={handleCloseModal}
                                    className="p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700 rounded-full transition-colors self-start"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            <div className="flex items-center gap-8 px-8 border-b border-slate-100 mt-2">
                                {(['Details', 'Teacher', 'People'] as const).map(tab => (
                                    <button
                                        key={tab}
                                        onClick={() => setActiveModalTab(tab)}
                                        className={`pb-4 text-sm font-bold transition-colors relative cursor-pointer ${
                                            activeModalTab === tab ? 'text-indigo-600' : 'text-slate-500 hover:text-slate-700'
                                        }`}
                                    >
                                        {tab}
                                        {activeModalTab === tab && (
                                            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600 rounded-t-full" />
                                        )}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Modal Content */}
                        <div className="flex-1 overflow-y-auto p-8 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:bg-slate-200 [&::-webkit-scrollbar-thumb]:rounded-full min-h-[400px]">
                            
                            {/* --- Details Tab --- */}
                            {activeModalTab === 'Details' && (
                                <div className="flex flex-col h-full">
                                    <div className="grid grid-cols-2 gap-x-6 gap-y-6">
                                        <div>
                                            <label className="text-xs font-bold text-slate-600 uppercase tracking-wider mb-2 block">
                                                Course Code {modalMode === 'create' && <span className="text-red-500">*</span>}
                                            </label>
                                            <input 
                                                type="text" 
                                                placeholder={modalMode === 'create' ? "e.g. PHY-101" : ""}
                                                value={formData.courseCode} 
                                                onChange={(e) => setFormData({...formData, courseCode: e.target.value})} 
                                                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 transition-all font-medium text-slate-900 placeholder:text-slate-400" 
                                            />
                                        </div>
                                        <div>
                                            <label className="text-xs font-bold text-slate-600 uppercase tracking-wider mb-2 block">
                                                Section {modalMode === 'create' && <span className="text-red-500">*</span>}
                                            </label>
                                            <input 
                                                type="text" 
                                                placeholder={modalMode === 'create' ? "e.g. 11A" : ""}
                                                value={formData.section} 
                                                onChange={(e) => setFormData({...formData, section: e.target.value})} 
                                                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 transition-all font-medium text-slate-900 placeholder:text-slate-400" 
                                            />
                                        </div>
                                        <div className="col-span-2">
                                            <label className="text-xs font-bold text-slate-600 uppercase tracking-wider mb-2 block">
                                                Subject Name {modalMode === 'create' && <span className="text-red-500">*</span>}
                                            </label>
                                            <input 
                                                type="text" 
                                                placeholder={modalMode === 'create' ? "e.g. Physics" : ""}
                                                value={formData.subject} 
                                                onChange={(e) => setFormData({...formData, subject: e.target.value})} 
                                                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 transition-all font-medium text-slate-900 placeholder:text-slate-400" 
                                            />
                                        </div>
                                        <div>
                                            <label className="text-xs font-bold text-slate-600 uppercase tracking-wider mb-2 block">Room</label>
                                            <input 
                                                type="text" 
                                                placeholder={modalMode === 'create' ? "e.g. Room 304" : ""}
                                                value={formData.room} 
                                                onChange={(e) => setFormData({...formData, room: e.target.value})} 
                                                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 transition-all font-medium text-slate-900 placeholder:text-slate-400" 
                                            />
                                        </div>
                                        <div>
                                            <label className="text-xs font-bold text-slate-600 uppercase tracking-wider mb-2 block">Max Capacity</label>
                                            <input 
                                                type="number" 
                                                placeholder={modalMode === 'create' ? "30" : ""}
                                                value={formData.capacity} 
                                                onChange={(e) => setFormData({...formData, capacity: parseInt(e.target.value) || 0})} 
                                                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 transition-all font-medium text-slate-900 placeholder:text-slate-400" 
                                            />
                                        </div>
                                        <div className="col-span-2">
                                            <label className="text-xs font-bold text-slate-600 uppercase tracking-wider mb-2 block">Schedule</label>
                                            <input 
                                                type="text" 
                                                placeholder={modalMode === 'create' ? "e.g. Mon/Wed/Fri 08:00 AM" : ""}
                                                value={formData.schedule} 
                                                onChange={(e) => setFormData({...formData, schedule: e.target.value})} 
                                                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 transition-all font-medium text-slate-900 placeholder:text-slate-400" 
                                            />
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* --- Teacher Tab --- */}
                            {activeModalTab === 'Teacher' && (
                                <div className="flex flex-col h-full">
                                    <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-4">Assign Primary Teacher</h3>
                                    <select
                                        value={formData.teacher}
                                        onChange={(e) => setFormData({...formData, teacher: e.target.value})}
                                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 transition-all font-medium text-slate-900 cursor-pointer appearance-none bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20width%3D%2224%22%20height%3D%2224%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cpath%20d%3D%22M7%2010L12%2015L17%2010%22%20stroke%3D%22%2364748B%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3C%2Fpath%3E%3C%2Fsvg%3E')] bg-[length:20px] bg-[right_16px_center] bg-no-repeat"
                                    >
                                        <option value="" disabled>Select a teacher...</option>
                                        <option value="Mr. Tan Wei">Mr. Tan Wei</option>
                                        <option value="Ms. Sarah Lee">Ms. Sarah Lee</option>
                                        <option value="Dr. Marcus Rivera">Dr. Marcus Rivera</option>
                                        <option value="Ms. Priya Nair">Ms. Priya Nair</option>
                                    </select>
                                </div>
                            )}

                            {/* --- People Tab --- */}
                            {activeModalTab === 'People' && (
                                <div className="flex flex-col h-full">
                                    <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-4">
                                        {modalMode === 'create' ? 'Enroll Initial Students' : 'Enroll Students'}
                                    </h3>
                                    <select 
                                        value={studentFilter}
                                        onChange={(e) => setStudentFilter(e.target.value)}
                                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm mb-4 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 transition-all font-medium text-slate-900 cursor-pointer appearance-none bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20width%3D%2224%22%20height%3D%2224%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cpath%20d%3D%22M7%2010L12%2015L17%2010%22%20stroke%3D%22%2364748B%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3C%2Fpath%3E%3C%2Fsvg%3E')] bg-[length:20px] bg-[right_16px_center] bg-no-repeat"
                                    >
                                        <option value="All Grades">All Grades</option>
                                        <option value="10th Grade">10th Grade</option>
                                        <option value="11th Grade">11th Grade</option>
                                        <option value="12th Grade">12th Grade</option>
                                    </select>
                                    
                                    <div className="border border-slate-200 rounded-xl overflow-y-auto max-h-64 flex flex-col [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:bg-slate-200 [&::-webkit-scrollbar-thumb]:rounded-full">
                                        {AVAILABLE_STUDENTS.filter(s => studentFilter === 'All Grades' || s.grade === studentFilter).map(student => (
                                            <label key={student.id} className="flex items-center gap-4 p-4 hover:bg-slate-50 transition-colors cursor-pointer border-b border-slate-100 last:border-b-0">
                                                <input 
                                                    type="checkbox" 
                                                    checked={formData.students.includes(student.id)} 
                                                    onChange={(e) => {
                                                        const checked = e.target.checked;
                                                        setFormData(prev => ({
                                                            ...prev,
                                                            students: checked 
                                                                ? [...prev.students!, student.id]
                                                                : prev.students!.filter(id => id !== student.id)
                                                        }));
                                                    }}
                                                    className="w-5 h-5 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500" 
                                                />
                                                <div className="w-8 h-8 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center text-xs font-bold shrink-0">
                                                    {student.name.split(' ').map(n => n[0]).join('')}
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="text-sm font-bold text-slate-900">{student.name}</span>
                                                    <span className="text-xs font-medium text-slate-500">{student.grade}</span>
                                                </div>
                                            </label>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Modal Footer */}
                        <div className="p-8 pt-4 border-t border-slate-100 flex justify-end items-center gap-4 bg-white shrink-0">
                            {activeModalTab !== 'Details' && (
                                <button onClick={() => setActiveModalTab(activeModalTab === 'Teacher' ? 'Details' : 'Teacher')} className="px-6 py-3 rounded-xl text-sm font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors flex items-center gap-1.5">
                                    {'<'} Previous
                                </button>
                            )}
                            
                            {activeModalTab === 'Details' && (
                                <button onClick={() => setActiveModalTab('Teacher')} className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-xl text-sm font-bold shadow-sm transition-colors flex items-center justify-center gap-2 sm:w-auto w-full">
                                    Next &gt;
                                </button>
                            )}

                            {activeModalTab === 'Teacher' && (
                                <button onClick={() => setActiveModalTab('People')} className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-xl text-sm font-bold shadow-sm transition-colors sm:w-auto w-full">
                                    Next &gt;
                                </button>
                            )}

                            {activeModalTab === 'People' && (
                                modalMode === 'edit' ? (
                                    <button onClick={handleSaveClass} className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-3 rounded-xl font-bold shadow-sm transition-colors sm:w-auto w-full">
                                        Save Changes
                                    </button>
                                ) : (
                                    <button
                                        onClick={handleCreateClassSubmit}
                                        className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-3 rounded-xl font-bold shadow-sm transition-colors sm:w-auto w-full"
                                    >
                                        Save & Create Class
                                    </button>
                                )
                            )}
                        </div>
                    </div>

                </div>
            )}

            {/* ========== SUCCESS TOAST ========== */}
            {toast.show && (
                <div className={`fixed bottom-6 right-6 z-[60] animate-[slideUp_0.3s_ease-out] flex items-center justify-center text-white px-6 py-3.5 rounded-xl shadow-lg ${toast.type === 'error' ? 'bg-red-500 shadow-red-500/30' : 'bg-emerald-600 shadow-emerald-500/30'}`}>
                    <p className="text-sm font-bold">{toast.message}</p>
                </div>
            )}

            {/* Animation Styles */}
            <style jsx>{`
                @keyframes slideInRight {
                    from { transform: translateX(100%); }
                    to { transform: translateX(0); }
                }
                @keyframes slideUp {
                    from { opacity: 0; transform: translateY(16px); }
                    to { opacity: 1; transform: translateY(0); }
                }
            `}</style>
        </div>
    );
}

