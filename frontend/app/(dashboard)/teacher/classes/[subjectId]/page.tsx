'use client';

import React, { useState, useRef } from 'react';
import { useParams } from 'next/navigation';
import {
    FileText, Upload, X, PlayCircle, MoreVertical, Bell, File as File2, XCircle
} from 'lucide-react';

// Helper: Format date to readable string
const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
};

// Type Definitions
type MaterialType = 'File' | 'Video';

interface Material {
    id: string;
    title: string;
    type: MaterialType;
    publishedDate: string;
    modifiedDate: string | null;
    weekGroup: string;
    fileUrl: string;
}

// Dummy Data
const initialMaterials: Material[] = [
    { id: '1', title: 'Chapter 4: Forces and Motion', type: 'File', publishedDate: '15 May 2025', modifiedDate: null, weekGroup: 'Week 9', fileUrl: '#' },
    { id: '2', title: 'Newton\'s Laws Overview', type: 'File', publishedDate: '13 May 2025', modifiedDate: '14 May 2025', weekGroup: 'Week 9', fileUrl: '#' },
    { id: '3', title: 'Friction Experiment Demo', type: 'Video', publishedDate: '12 May 2025', modifiedDate: null, weekGroup: 'Week 9', fileUrl: '#' },
    { id: '4', title: 'Chapter 3: Kinematics Recap', type: 'File', publishedDate: '08 May 2025', modifiedDate: null, weekGroup: 'Week 8', fileUrl: '#' },
    { id: '5', title: 'Projectile Motion Simulator', type: 'File', publishedDate: '05 May 2025', modifiedDate: '07 May 2025', weekGroup: 'Week 8', fileUrl: '#' },
];

export default function TeacherClassMaterialPage() {
    const params = useParams();
    const subjectId = (params?.subjectId as string) || 'class-1';

    // Filter State
    const [activeFilter, setActiveFilter] = useState('All');

    // Materials State
    const [materials, setMaterials] = useState<Material[]>(initialMaterials);

    // Modal States
    const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editingMaterial, setEditingMaterial] = useState<Material | null>(null);

    // Form State for Modals
    const [formTitle, setFormTitle] = useState('');
    const [formType, setFormType] = useState<MaterialType>('File');
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [isDragging, setIsDragging] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const filters = ['All', 'File', 'Video'];

    // Derived Data: Filtered Materials
    const filteredMaterials = materials.filter(m => activeFilter === 'All' || m.type === activeFilter);

    // Derived Data: Grouped by Week
    const groupedMaterials = filteredMaterials.reduce((acc, material) => {
        if (!acc[material.weekGroup]) {
            acc[material.weekGroup] = [];
        }
        acc[material.weekGroup].push(material);
        return acc;
    }, {} as Record<string, Material[]>);

    // Helper: Get Icon based on Material Type
    const getMaterialIcon = (type: MaterialType) => {
        switch (type) {
            case 'File': return <FileText className="w-5 h-5" />;
            case 'Video': return <PlayCircle className="w-5 h-5" />;
        }
    };

    const getMaterialColors = (type: MaterialType) => {
        switch (type) {
            case 'File': return 'bg-blue-50 text-blue-600';
            case 'Video': return 'bg-red-50 text-red-600';
        }
    };

    // Handlers
    const handleOpenEdit = (material: Material) => {
        setEditingMaterial(material);
        setFormTitle(material.title);
        setFormType(material.type);
        setIsEditModalOpen(true);
    };

    const handleCloseModals = () => {
        setIsUploadModalOpen(false);
        setIsEditModalOpen(false);
        setEditingMaterial(null);
        setFormTitle('');
        setFormType('File');
        setSelectedFile(null);
        setIsDragging(false);
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    // File Upload Handlers
    const handleFileSelect = (file: File) => {
        const maxSize = 50 * 1024 * 1024; // 50MB
        const allowedTypes = [
            'application/pdf',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'application/vnd.openxmlformats-officedocument.presentationml.presentation',
            'video/mp4'
        ];
        const allowedExtensions = ['.pdf', '.docx', '.pptx', '.mp4'];
        const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();

        if (!allowedTypes.includes(file.type) && !allowedExtensions.includes(fileExtension)) {
            alert('Invalid file type. Please upload PDF, DOCX, PPTX, or MP4 files.');
            return;
        }
        if (file.size > maxSize) {
            alert('File is too large. Maximum file size is 50MB.');
            return;
        }
        setSelectedFile(file);
    };

    const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) handleFileSelect(file);
    };

    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setIsDragging(false);
        const file = e.dataTransfer.files?.[0];
        if (file) handleFileSelect(file);
    };

    const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setIsDragging(false);
    };

    const formatFileSize = (bytes: number) => {
        if (bytes < 1024) return bytes + ' B';
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
        return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
    };

    const getFileIcon = (fileName: string) => {
        const ext = fileName.split('.').pop()?.toLowerCase();
        if (ext === 'mp4') return <PlayCircle className="w-5 h-5" />;
        return <File2 className="w-5 h-5" />;
    };

    const handleSave = () => {
        const now = formatDate(new Date());

        if (isEditModalOpen && editingMaterial) {
            setMaterials(prev => prev.map(m =>
                m.id === editingMaterial.id
                    ? { ...m, title: formTitle, type: formType, modifiedDate: now }
                    : m
            ));
            // Auto-notify students about update
            console.log(`📢 Notification sent to students: Material "${formTitle}" has been updated.`);
        } else if (isUploadModalOpen) {
            const newMaterial: Material = {
                id: Math.random().toString(),
                title: formTitle || 'Untitled Material',
                type: formType,
                publishedDate: now,
                modifiedDate: null,
                weekGroup: 'Week 9',
                fileUrl: '#'
            };
            setMaterials([newMaterial, ...materials]);
            // Auto-notify students about new material
            console.log(`📢 Notification sent to students: New material "${formTitle || 'Untitled Material'}" has been published.`);
        }
        handleCloseModals();
    };

    return (
        <>
            {/* Class Material Content Area */}
            <div className="flex flex-col space-y-8">

                {/* Filter Bar */}
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                    <select
                        value={activeFilter}
                        onChange={(e) => setActiveFilter(e.target.value)}
                        className="bg-white border border-slate-200 rounded-lg px-4 py-2 text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 cursor-pointer appearance-none bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20width%3D%2224%22%20height%3D%2224%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cpath%20d%3D%22M7%2010L12%2015L17%2010%22%20stroke%3D%22%2364748B%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%2F%3E%3C%2Fsvg%3E')] bg-[length:20px] bg-[right_8px_center] bg-no-repeat pr-10"
                    >
                        {filters.map(filter => (
                            <option key={filter} value={filter}>
                                {filter}
                            </option>
                        ))}
                    </select>
                    <button
                        onClick={() => setIsUploadModalOpen(true)}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-xl text-sm font-bold transition-colors shadow-sm flex items-center gap-2 shrink-0"
                    >
                        <Upload className="w-4 h-4" />
                        Upload Material
                    </button>
                </div>

                {/* Material List (Grouped by Week) */}
                <div className="flex flex-col gap-10">
                    {Object.keys(groupedMaterials).map(week => (
                        <div key={week} className="flex flex-col gap-4">
                            <h3 className="text-lg font-bold text-slate-800 border-b border-slate-200 pb-2">{week}</h3>

                            <div className="flex flex-col gap-4">
                                {groupedMaterials[week].map(material => (
                                    <div key={material.id} className="bg-white border border-slate-200 rounded-xl p-4 flex items-center gap-4 hover:shadow-md transition-shadow group">
                                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${getMaterialColors(material.type)}`}>
                                            {getMaterialIcon(material.type)}
                                        </div>
                                        <div className="flex-1 min-w-0 flex flex-col">
                                            <h4 className="text-sm font-bold text-slate-900 truncate" title={material.title}>{material.title}</h4>
                                            <div className="flex items-center gap-3 mt-1 flex-wrap">
                                                <span className="text-xs font-medium text-slate-500">
                                                    {material.type}
                                                </span>
                                                <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                                                    <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></span>
                                                    Published {material.publishedDate}
                                                </span>
                                                {material.modifiedDate && (
                                                    <span className="inline-flex items-center gap-1 text-xs font-medium text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">
                                                        <span className="w-1.5 h-1.5 bg-amber-500 rounded-full"></span>
                                                        Modified {material.modifiedDate}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => handleOpenEdit(material)}
                                            className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors shrink-0"
                                        >
                                            <MoreVertical className="w-4 h-4" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>

            </div>

            {/* Upload & Edit Modals */}
            {(isUploadModalOpen || isEditModalOpen) && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
                    <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl flex flex-col my-auto max-h-[90vh] overflow-y-auto hidden-scrollbar">

                        <div className="flex items-center justify-between p-6 border-b border-slate-100 sticky top-0 bg-white z-10">
                            <h2 className="text-xl font-bold text-slate-900">
                                {isEditModalOpen ? 'Edit Material' : 'Upload Class Material'}
                            </h2>
                            <button onClick={handleCloseModals} className="p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700 rounded-full transition-colors">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="p-6 flex flex-col gap-5">
                            {/* Title Input */}
                            <div className="flex flex-col gap-2">
                                <label className="text-sm font-bold text-slate-700">Material Title</label>
                                <input
                                    type="text"
                                    value={formTitle}
                                    onChange={(e) => setFormTitle(e.target.value)}
                                    placeholder="e.g. Chapter 4 Motion Graphs"
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium text-slate-900 placeholder:font-normal"
                                />
                            </div>

                            {/* Type Select (Full Width) */}
                            <div className="flex flex-col gap-2">
                                <label className="text-sm font-bold text-slate-700">Type</label>
                                <select
                                    value={formType}
                                    onChange={(e) => setFormType(e.target.value as MaterialType)}
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium text-slate-900 appearance-none bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20width%3D%2224%22%20height%3D%2224%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cpath%20d%3D%22M7%2010L12%2015L17%2010%22%20stroke%3D%22%2364748B%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%2F%3E%3C%2Fsvg%3E')] bg-[length:20px] bg-[right_12px_center] bg-no-repeat pr-10"
                                >
                                    <option value="File">File</option>
                                    <option value="Video">Video</option>
                                </select>
                            </div>

                            {/* File Upload Dropzone */}
                            <div className="flex flex-col gap-2 mt-2">
                                <label className="text-sm font-bold text-slate-700">Attached File</label>
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept=".pdf,.docx,.pptx,.mp4"
                                    onChange={handleFileInputChange}
                                    className="hidden"
                                />

                                {!selectedFile ? (
                                    <div
                                        onClick={() => fileInputRef.current?.click()}
                                        onDrop={handleDrop}
                                        onDragOver={handleDragOver}
                                        onDragLeave={handleDragLeave}
                                        className={`border-2 border-dashed rounded-2xl p-8 flex flex-col items-center justify-center text-center transition-colors cursor-pointer group ${isDragging
                                                ? 'border-blue-400 bg-blue-50'
                                                : 'border-slate-200 bg-slate-50 hover:bg-slate-100 hover:border-slate-300'
                                            }`}
                                    >
                                        <div className={`w-12 h-12 rounded-full shadow-sm flex items-center justify-center mb-3 transition-transform group-hover:scale-105 ${isDragging ? 'bg-blue-100' : 'bg-white'
                                            }`}>
                                            <Upload className={`w-5 h-5 ${isDragging ? 'text-blue-600' : 'text-blue-500'}`} />
                                        </div>
                                        <span className="text-sm font-bold text-slate-700">
                                            {isDragging ? 'Drop your file here' : 'Click to upload or drag & drop'}
                                        </span>
                                        <span className="text-xs font-medium text-slate-500 mt-1">PDF, DOCX, PPTX or MP4 (max. 50MB)</span>
                                    </div>
                                ) : (
                                    <div className="border border-slate-200 bg-white rounded-2xl p-4 flex items-center gap-4">
                                        <div className="w-11 h-11 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600 shrink-0">
                                            {getFileIcon(selectedFile.name)}
                                        </div>
                                        <div className="flex-1 min-w-0 flex flex-col">
                                            <span className="text-sm font-bold text-slate-900 truncate" title={selectedFile.name}>{selectedFile.name}</span>
                                            <span className="text-xs font-medium text-slate-500 mt-0.5">{formatFileSize(selectedFile.size)}</span>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setSelectedFile(null);
                                                if (fileInputRef.current) fileInputRef.current.value = '';
                                            }}
                                            className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors shrink-0"
                                            title="Remove file"
                                        >
                                            <XCircle className="w-5 h-5" />
                                        </button>
                                    </div>
                                )}
                            </div>

                            {/* Auto Notification Info */}
                            <div className="flex items-center gap-3 bg-blue-50/70 border border-blue-100 rounded-xl px-4 py-3">
                                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center shrink-0">
                                    <Bell className="w-4 h-4 text-blue-600" />
                                </div>
                                <p className="text-xs font-medium text-blue-700">
                                    Students will be automatically notified when this material is {isEditModalOpen ? 'updated' : 'published'}.
                                </p>
                            </div>

                            {/* Auto-tracked Date Info */}
                            {isEditModalOpen && editingMaterial && (
                                <div className="flex flex-col gap-2 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3">
                                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Tracking Info</span>
                                    <div className="flex items-center gap-3 flex-wrap">
                                        <span className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-600">
                                            <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></span>
                                            Published: {editingMaterial.publishedDate}
                                        </span>
                                        {editingMaterial.modifiedDate && (
                                            <span className="inline-flex items-center gap-1.5 text-xs font-medium text-amber-600">
                                                <span className="w-1.5 h-1.5 bg-amber-500 rounded-full"></span>
                                                Last Modified: {editingMaterial.modifiedDate}
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-xs text-slate-400 mt-0.5">Dates are automatically tracked when you save changes.</p>
                                </div>
                            )}
                        </div>

                        <div className="p-6 border-t border-slate-100 bg-slate-50/50 flex justify-end gap-3 sticky bottom-0">
                            <button
                                onClick={handleCloseModals}
                                className="px-5 py-2.5 rounded-xl text-sm font-bold text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSave}
                                className="px-5 py-2.5 rounded-xl text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 shadow-sm shadow-blue-500/20 transition-all active:scale-95"
                            >
                                {isEditModalOpen ? 'Save Changes' : 'Publish Material'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}