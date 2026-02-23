"use client";

import { studentData } from "@/data/student-data";
import { studentProfile } from "@/data/student-profile";
import { Mail, UserCircle } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

export default function StudentPeoplePage() {
    const { people } = studentData;
    const { teachers, classmates } = people;

    const [activeTab, setActiveTab] = useState<"teachers" | "classmates">("teachers");

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold tracking-tight text-gray-900">People</h1>
            </div>

            {/* Navigation Tabs */}
            <div className="flex gap-2 border-b border-gray-200 pb-1">
                <button
                    onClick={() => setActiveTab("teachers")}
                    className={cn(
                        "px-4 py-2 text-sm font-medium border-b-2 transition-colors",
                        activeTab === "teachers" ? "border-blue-600 text-blue-600" : "border-transparent text-gray-500 hover:text-gray-700"
                    )}
                >
                    Teachers
                </button>
                <button
                    onClick={() => setActiveTab("classmates")}
                    className={cn(
                        "px-4 py-2 text-sm font-medium border-b-2 transition-colors",
                        activeTab === "classmates" ? "border-green-600 text-green-600" : "border-transparent text-gray-500 hover:text-gray-700"
                    )}
                >
                    Classmates
                </button>
            </div>

            {/* Content Areas */}
            <div className="min-h-[300px]">
                {/* Teachers Section */}
                {activeTab === "teachers" && (
                    <section className="animate-in fade-in duration-300">
                        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                            <UserCircle className="h-5 w-5 text-blue-600" />
                            Teachers
                        </h2>
                        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                            {teachers.map((teacher) => (
                                <div key={teacher.id} className="flex items-center gap-4 rounded-xl border border-gray-200 bg-white p-4 shadow-sm hover:shadow-md transition-shadow">
                                    <div className="h-12 w-12 flex-shrink-0 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-lg">
                                        {teacher.name.charAt(0)}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium text-gray-900 truncate">{teacher.name}</p>
                                        <p className="text-xs text-gray-500 truncate">{teacher.subject}</p>
                                        <a href={`mailto:${teacher.email}`} className="text-xs text-blue-600 hover:underline mt-1 flex items-center gap-1">
                                            <Mail className="h-3 w-3" />
                                            Email
                                        </a>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>
                )}

                {/* Classmates Section */}
                {activeTab === "classmates" && (
                    <section className="animate-in fade-in duration-300">
                        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                            <UserCircle className="h-5 w-5 text-green-600" />
                            Classmates
                        </h2>
                        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                            {classmates.map((student) => (
                                <div key={student.id} className="flex items-center gap-4 rounded-xl border border-gray-200 bg-white p-4 shadow-sm hover:shadow-md transition-shadow">
                                    <div className="h-12 w-12 flex-shrink-0 rounded-full bg-green-100 flex items-center justify-center text-green-600 font-bold text-lg">
                                        {student.name.charAt(0)}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium text-gray-900 truncate">{student.name}</p>
                                        <a href={`mailto:${student.email}`} className="text-xs text-blue-600 hover:underline mt-1 flex items-center gap-1">
                                            <Mail className="h-3 w-3" />
                                            Email
                                        </a>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>
                )}
            </div>
        </div>
    );
}
