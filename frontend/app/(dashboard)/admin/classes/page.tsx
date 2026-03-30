'use client';

import React, { useState } from 'react';
import PageHeader from '@/components/layouts/PageHeader';
import { Search, Plus, X, Users, BookOpen, MapPin, Clock, ChevronRight, Trash2, CheckSquare, ChevronDown, Edit2 } from 'lucide-react';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import { useToast, ToastContainer } from '@/components/ui/Toast';

import { getClassesData, ClassRecord, StudentRecord, ClassStatus, deriveClassStatus } from '@/lib/mock-data/admin';

// --- Subcomponents ---

export default function AdminClassesPage() {
    const mockData = getClassesData();

    // --- State ---
    const [classes, setClasses] = useState<ClassRecord[]>(mockData.classes);
    const availableStudents = mockData.availableStudents;
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
    const { toasts, addToast, dismissToast } = useToast();

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

        const enrolledCount = formData.students && formData.students.length > 0 ? formData.students.length : selectedClass.enrolled;
        const computedStatus = deriveClassStatus({ ...formData, students: enrolledCount });

        setClasses(prev => prev.map(c => 
            c.id === selectedClass.id ? { 
                ...c, 
                ...formData, // Apply all form edits (subject, courseCode, room, capacity, section, schedule)
                teacher: formData.teacher || null,
                enrolled: enrolledCount,
                status: computedStatus 
            } : c
        ));

        addToast('success', 'Class Updated Successfully');
        handleCloseModal();
    };

    const handleDeleteClass = (id: string) => {
        setClasses(prev => prev.filter(c => c.id !== id));
        addToast('error', 'Class Removed Successfully');
    };

    const handleCreateClassSubmit = () => {
        if (!formData.courseCode.trim() || !formData.subject.trim() || !formData.section.trim()) {
            return; // In a real app we'd show validation errors
        }

        const computedStatus = deriveClassStatus(formData);

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
        addToast('success', 'New Class Created Successfully');
        
        handleCloseModal();
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

                    <Button
                        onClick={handleOpenCreateModal}
                        variant="primary"
                        color="bg-indigo-600"
                        icon={Plus}
                        className="w-full sm:w-auto"
                    >
                        Create Class
                    </Button>
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
            <Modal 
                isOpen={isModalOpen} 
                onClose={handleCloseModal} 
                title={modalMode === 'edit' ? `Edit ${selectedClass?.subject || formData.subject}` : 'Create New Class'}
            >
                <div className="flex flex-col">
                    <div className="flex items-center gap-8 border-b border-slate-100 mb-4 rounded-xl">
                        {(['Details', 'Teacher', 'People'] as const).map(tab => (
                            <button
                                key={tab}
                                onClick={() => setActiveModalTab(tab)}
                                className={`pb-2 text-sm font-bold transition-colors relative cursor-pointer ${
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

                    <div className="max-h-[50vh] overflow-y-auto pr-2">
                        {activeModalTab === 'Details' && (
                            <div className="flex flex-col h-full">
                                <div className="grid grid-cols-2 gap-x-6 gap-y-6">
                                    {/* courseCode, section, subject, room, capacity, schedule */}
                                    <div>
                                        <label className="text-xs font-bold text-slate-600 uppercase tracking-wider mb-2 block">
                                            Course Code {modalMode === 'create' && <span className="text-red-500">*</span>}
                                        </label>
                                        <input 
                                            type="text" 
                                            value={formData.courseCode} 
                                            onChange={(e) => setFormData({...formData, courseCode: e.target.value})} 
                                            className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400" 
                                        />
                                    </div>
                                    <div>
                                        <label className="text-xs font-bold text-slate-600 uppercase tracking-wider mb-2 block">
                                            Section {modalMode === 'create' && <span className="text-red-500">*</span>}
                                        </label>
                                        <input 
                                            type="text" 
                                            value={formData.section} 
                                            onChange={(e) => setFormData({...formData, section: e.target.value})} 
                                            className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400" 
                                        />
                                    </div>
                                    <div className="col-span-2">
                                        <label className="text-xs font-bold text-slate-600 uppercase tracking-wider mb-2 block">
                                            Subject Name {modalMode === 'create' && <span className="text-red-500">*</span>}
                                        </label>
                                        <input 
                                            type="text" 
                                            value={formData.subject} 
                                            onChange={(e) => setFormData({...formData, subject: e.target.value})} 
                                            className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400" 
                                        />
                                    </div>
                                    <div>
                                        <label className="text-xs font-bold text-slate-600 uppercase tracking-wider mb-2 block">Room</label>
                                        <input 
                                            type="text" 
                                            value={formData.room} 
                                            onChange={(e) => setFormData({...formData, room: e.target.value})} 
                                            className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400" 
                                        />
                                    </div>
                                    <div>
                                        <label className="text-xs font-bold text-slate-600 uppercase tracking-wider mb-2 block">Max Capacity</label>
                                        <input 
                                            type="number" 
                                            value={formData.capacity} 
                                            onChange={(e) => setFormData({...formData, capacity: parseInt(e.target.value) || 0})} 
                                            className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400" 
                                        />
                                    </div>
                                    <div className="col-span-2">
                                        <label className="text-xs font-bold text-slate-600 uppercase tracking-wider mb-2 block">Schedule</label>
                                        <input 
                                            type="text" 
                                            value={formData.schedule} 
                                            onChange={(e) => setFormData({...formData, schedule: e.target.value})} 
                                            className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400" 
                                        />
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeModalTab === 'Teacher' && (
                            <div className="flex flex-col h-full">
                                <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-4">Assign Primary Teacher</h3>
                                <div className="relative">
                                    <select
                                        value={formData.teacher}
                                        onChange={(e) => setFormData({...formData, teacher: e.target.value})}
                                        className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 appearance-none"
                                    >
                                        <option value="" disabled>Select a teacher...</option>
                                        <option value="Mr. Tan Wei">Mr. Tan Wei</option>
                                        <option value="Ms. Sarah Lee">Ms. Sarah Lee</option>
                                        <option value="Dr. Marcus Rivera">Dr. Marcus Rivera</option>
                                        <option value="Ms. Priya Nair">Ms. Priya Nair</option>
                                    </select>
                                    <ChevronDown className="absolute right-4 top-3 w-4 h-4 text-slate-400 pointer-events-none" />
                                </div>
                            </div>
                        )}

                        {activeModalTab === 'People' && (
                            <div className="flex flex-col h-full">
                                <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-4">
                                    {modalMode === 'create' ? 'Enroll Initial Students' : 'Enroll Students'}
                                </h3>
                                <div className="relative mb-4">
                                    <select 
                                        value={studentFilter}
                                        onChange={(e) => setStudentFilter(e.target.value)}
                                        className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 appearance-none"
                                    >
                                        <option value="All Grades">All Grades</option>
                                        <option value="10th Grade">10th Grade</option>
                                        <option value="11th Grade">11th Grade</option>
                                        <option value="12th Grade">12th Grade</option>
                                    </select>
                                    <ChevronDown className="absolute right-4 top-3 w-4 h-4 text-slate-400 pointer-events-none" />
                                </div>
                                
                                <div className="border border-slate-200 rounded-xl flex flex-col">
                                    {availableStudents.filter(s => studentFilter === 'All Grades' || s.grade === studentFilter).map(student => (
                                        <label key={student.id} className="flex items-center gap-4 p-3 hover:bg-slate-50 transition-colors cursor-pointer border-b border-slate-100 last:border-b-0">
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
                                            <div className="flex flex-col">
                                                <span className="text-sm font-bold text-slate-900">{student.name}</span>
                                            </div>
                                        </label>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="mt-6 pt-4 border-t border-slate-100 flex justify-end gap-3">
                        {activeModalTab !== 'Details' && (
                            <Button 
                                variant="secondary" 
                                onClick={() => setActiveModalTab(activeModalTab === 'Teacher' ? 'Details' : 'Teacher')} 
                            >
                                Previous
                            </Button>
                        )}
                        
                        {activeModalTab === 'Details' && (
                            <Button variant="primary" color="bg-indigo-600" onClick={() => setActiveModalTab('Teacher')}>
                                Next
                            </Button>
                        )}

                        {activeModalTab === 'Teacher' && (
                            <Button variant="primary" color="bg-indigo-600" onClick={() => setActiveModalTab('People')}>
                                Next
                            </Button>
                        )}

                        {activeModalTab === 'People' && (
                            <Button variant="primary" color="bg-indigo-600" onClick={modalMode === 'edit' ? handleSaveClass : handleCreateClassSubmit}>
                                {modalMode === 'edit' ? 'Save Changes' : 'Create Class'}
                            </Button>
                        )}
                    </div>
                </div>
            </Modal>

            <ToastContainer toasts={toasts} onDismiss={dismissToast} />
        </div>
    );
}

