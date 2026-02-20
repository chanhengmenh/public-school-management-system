"use client";

import { useState } from "react";
import { teacherData } from "@/data/teacher-data";
import { teacherLessonsData } from "@/data/teacher-lessons-data";
import {
    FileText,
    PlayCircle,
    File,
    Download,
    Trash2,
    Plus,
    Search,
    Filter,
    MoreVertical,
    FolderOpen
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function TeacherLessonsPage() {
    const { assignedClasses } = teacherData;
    const [selectedClassId, setSelectedClassId] = useState<string>("all");
    const [searchTerm, setSearchTerm] = useState("");
    const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);

    // Initial resources state
    const [resources, setResources] = useState(teacherLessonsData);

    // Upload Form State
    const [newResource, setNewResource] = useState({
        title: "",
        classId: "",
        type: "PDF",
        file: null as File | null
    });

    // Filter resources
    const filteredResources = resources.filter(resource => {
        const matchesClass = selectedClassId === "all" || resource.classId === selectedClassId;
        const matchesSearch = resource.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            resource.subject.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesClass && matchesSearch;
    });

    const getFileIcon = (type: string) => {
        switch (type) {
            case "PDF": return <FileText className="h-10 w-10 text-red-500" />;
            case "Video": return <PlayCircle className="h-10 w-10 text-blue-500" />;
            case "Image": return <File className="h-10 w-10 text-purple-500" />;
            default: return <File className="h-10 w-10 text-gray-400" />;
        }
    };

    const handleDelete = (id: string) => {
        if (confirm("Are you sure you want to delete this resource?")) {
            setResources(resources.filter(r => r.id !== id));
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setNewResource({ ...newResource, file: e.target.files[0] });
        }
    };

    const handleUpload = () => {
        if (!newResource.title || !newResource.classId || !newResource.file) {
            alert("Please fill in all fields and select a file.");
            return;
        }

        const selectedClass = assignedClasses.find(c => c.id === newResource.classId);

        // Mock add resource
        const newRes = {
            id: `RES-${Math.floor(Math.random() * 10000)}`,
            title: newResource.title,
            subject: "General", // simplified for now, ideally tied to class subject
            classId: newResource.classId,
            className: selectedClass ? selectedClass.name : "Unknown Class",
            type: newResource.type as "PDF" | "Video" | "Image" | "Document" | "Other",
            size: `${(newResource.file.size / (1024 * 1024)).toFixed(2)} MB`,
            uploadDate: new Date().toISOString(),
            downloads: 0
        };

        setResources([newRes, ...resources]);
        setIsUploadModalOpen(false);
        setNewResource({ title: "", classId: "", type: "PDF", file: null });
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Lessons & Resources</h1>
                    <p className="text-sm text-gray-500 mt-1">Upload and manage study materials for your classes.</p>
                </div>
                <button
                    onClick={() => setIsUploadModalOpen(true)}
                    className="inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-sm"
                >
                    <Plus size={18} />
                    Upload Resource
                </button>
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-3 bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                <div className="relative min-w-[200px]">
                    <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <select
                        value={selectedClassId}
                        onChange={(e) => setSelectedClassId(e.target.value)}
                        className="w-full pl-10 pr-8 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none cursor-pointer"
                    >
                        <option value="all">All Classes</option>
                        {assignedClasses.map(c => (
                            <option key={c.id} value={c.id}>{c.name}</option>
                        ))}
                    </select>
                </div>
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input
                        type="text"
                        placeholder="Search resources..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder:text-gray-400"
                    />
                </div>
            </div>

            {/* Content */}
            {filteredResources.length > 0 ? (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {filteredResources.map((resource) => (
                        <div key={resource.id} className="group relative bg-white rounded-xl border border-gray-200 p-4 shadow-sm hover:shadow-md transition-all hover:border-blue-200">
                            <div className="flex items-start justify-between mb-3">
                                <div className="p-2 bg-gray-50 rounded-lg group-hover:bg-white transition-colors">
                                    {getFileIcon(resource.type)}
                                </div>
                                <div className="flex gap-1">
                                    <button className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors" title="Download">
                                        <Download size={16} />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(resource.id)}
                                        className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                                        title="Delete"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </div>

                            <h3 className="font-semibold text-gray-900 line-clamp-2 mb-1 group-hover:text-blue-600 transition-colors" title={resource.title}>
                                {resource.title}
                            </h3>

                            <div className="flex items-center gap-2 mb-3">
                                <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 border border-gray-200">
                                    {resource.className}
                                </span>
                                <span className="text-xs text-gray-500">
                                    {resource.subject}
                                </span>
                            </div>

                            <div className="flex items-center justify-between text-xs text-gray-400 pt-3 border-t border-gray-100">
                                <span>{new Date(resource.uploadDate).toLocaleDateString()}</span>
                                <span>{resource.size}</span>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="text-center py-16 bg-white rounded-xl border border-dashed border-gray-300">
                    <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                        <FolderOpen className="text-gray-300" size={32} />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">No resources found</h3>
                    <p className="text-gray-500 max-w-sm mx-auto mb-6">
                        {searchTerm || selectedClassId !== "all"
                            ? "Try adjusting your filters or search terms."
                            : "Get started by uploading your first lesson resource."}
                    </p>
                    <button
                        onClick={() => setIsUploadModalOpen(true)}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
                    >
                        <Plus size={16} />
                        Upload Resource
                    </button>
                </div>
            )}

            {/* Upload Modal */}
            {isUploadModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <div className="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in duration-200">
                        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
                            <h2 className="text-lg font-bold text-gray-900">Upload Request</h2>
                            <button
                                onClick={() => setIsUploadModalOpen(false)}
                                className="text-gray-400 hover:text-gray-600 transition-colors"
                            >
                                <Plus className="rotate-45" size={24} />
                                <span className="sr-only">Close</span>
                            </button>
                        </div>
                        <div className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-semibold text-gray-900 mb-1">Resource Title</label>
                                <input
                                    type="text"
                                    value={newResource.title}
                                    onChange={(e) => setNewResource({ ...newResource, title: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-gray-900 placeholder:text-gray-400"
                                    placeholder="e.g. Chapter 1 Notes"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-900 mb-1">Class</label>
                                    <select
                                        value={newResource.classId}
                                        onChange={(e) => setNewResource({ ...newResource, classId: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white text-gray-900"
                                    >
                                        <option value="">Select Class...</option>
                                        {assignedClasses.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-900 mb-1">Type</label>
                                    <select
                                        value={newResource.type}
                                        onChange={(e) => setNewResource({ ...newResource, type: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white text-gray-900"
                                    >
                                        <option value="PDF">PDF</option>
                                        <option value="Video">Video</option>
                                        <option value="Image">Image</option>
                                        <option value="Document">Document</option>
                                    </select>
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-900 mb-1">File</label>
                                <div className="relative">
                                    <input
                                        type="file"
                                        id="file-upload"
                                        className="hidden"
                                        onChange={handleFileChange}
                                    />
                                    <label
                                        htmlFor="file-upload"
                                        className={cn(
                                            "flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer transition-colors",
                                            newResource.file ? "border-green-300 bg-green-50" : "border-gray-300 hover:bg-gray-50 hover:border-blue-400"
                                        )}
                                    >
                                        {newResource.file ? (
                                            <div className="text-center">
                                                <div className="mx-auto w-10 h-10 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-2">
                                                    <FileText size={20} />
                                                </div>
                                                <p className="text-sm font-medium text-green-800">{newResource.file.name}</p>
                                                <p className="text-xs text-green-600">{(newResource.file.size / (1024 * 1024)).toFixed(2)} MB</p>
                                            </div>
                                        ) : (
                                            <div className="text-center">
                                                <div className="mx-auto w-10 h-10 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mb-2">
                                                    <Download className="rotate-180" size={20} />
                                                </div>
                                                <p className="text-sm text-gray-900 font-medium">Click to upload or drag and drop</p>
                                                <p className="text-xs text-gray-500 mt-1">PDF, DOC, MP4 up to 50MB</p>
                                            </div>
                                        )}
                                    </label>
                                </div>
                            </div>
                        </div>
                        <div className="px-6 py-4 bg-gray-50 flex justify-end gap-3">
                            <button
                                onClick={() => setIsUploadModalOpen(false)}
                                className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleUpload}
                                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm transition-colors"
                            >
                                Upload Resource
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
