"use client";

import { studentData } from "@/data/student-data";
import { FileText, Download, PlayCircle, File } from "lucide-react";
import { cn } from "@/lib/utils";


interface Resource {
    id: number;
    title: string;
    subject: string;
    type: string;
    size: string;
    date: string;
}

export default function StudentLessonsPage() {
    // Cast to unknown first to avoid TS errors when casting to a type that doesn't overlap
    const resources = ((studentData as unknown) as { resources: Resource[] }).resources || [];

    const getFileIcon = (type: string) => {
        switch (type) {
            case "PDF": return <FileText className="h-10 w-10 text-red-500" />;
            case "Video": return <PlayCircle className="h-10 w-10 text-blue-500" />;
            default: return <File className="h-10 w-10 text-gray-500" />;
        }
    };

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold tracking-tight text-gray-900">Resources</h1>
                <p className="text-sm text-gray-500 mt-1">Access course materials, textbooks, and lecture recordings.</p>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {resources.map((resource) => (
                    <div key={resource.id} className="group relative flex items-start gap-4 rounded-xl border border-gray-200 bg-white p-5 shadow-sm hover:shadow-md hover:border-blue-200 transition-all">
                        <div className="flex-shrink-0">
                            {getFileIcon(resource.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                            <h3 className="text-base font-semibold text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-1" title={resource.title}>
                                {resource.title}
                            </h3>
                            <p className="text-xs text-gray-500 mt-1">{resource.subject}</p>
                            <div className="mt-3 flex items-center justify-between text-xs text-gray-400">
                                <span>{new Date(resource.date).toLocaleDateString()}</span>
                                <span className={cn(
                                    "px-1.5 py-0.5 rounded",
                                    resource.type === "PDF" ? "bg-red-50 text-red-600" :
                                        resource.type === "Video" ? "bg-blue-50 text-blue-600" : "bg-gray-100 text-gray-600"
                                )}>
                                    {resource.type} • {resource.size}
                                </span>
                            </div>
                        </div>
                        <button className="absolute right-4 top-4 opacity-0 group-hover:opacity-100 transition-opacity p-2 rounded-full hover:bg-gray-100 text-gray-500">
                            <Download className="h-4 w-4" />
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
}
