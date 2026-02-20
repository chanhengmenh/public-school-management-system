"use client";

import { studentData } from "@/data/student-data";
import { BookOpen, CheckCircle, Circle, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

export default function StudentSyllabusPage() {
    const { syllabus } = studentData;

    const getStatusIcon = (status: string) => {
        switch (status) {
            case "Completed": return <CheckCircle className="h-5 w-5 text-green-600" />;
            case "In Progress": return <Clock className="h-5 w-5 text-blue-600" />;
            default: return <Circle className="h-5 w-5 text-gray-300" />;
        }
    };

    return (
        <div className="space-y-8">
            <h1 className="text-2xl font-bold tracking-tight text-gray-900">Syllabus</h1>

            <div className="grid gap-8 lg:grid-cols-2">
                {syllabus.map((subjectSyllabus, index) => (
                    <div key={index} className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
                        <div className="border-b border-gray-200 bg-gray-50 px-6 py-4">
                            <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                                <BookOpen className="h-5 w-5 text-blue-600" />
                                {subjectSyllabus.subject}
                            </h2>
                        </div>
                        <div className="p-6">
                            <div className="relative border-l-2 border-gray-100 ml-3 space-y-8">
                                {subjectSyllabus.topics.map((topic, topicIndex) => (
                                    <div key={topicIndex} className="relative pl-8">
                                        <div className="absolute -left-[9px] top-0 bg-white">
                                            {getStatusIcon(topic.status)}
                                        </div>
                                        <div>
                                            <h3 className={cn(
                                                "text-sm font-semibold",
                                                topic.status === "Completed" ? "text-gray-900" :
                                                    topic.status === "In Progress" ? "text-blue-600" : "text-gray-500"
                                            )}>
                                                {topic.title}
                                            </h3>
                                            <p className="text-xs text-gray-500 mt-1">Week {topic.week}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
