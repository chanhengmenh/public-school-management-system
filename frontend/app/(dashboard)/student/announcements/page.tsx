"use client";

import { studentData } from "@/data/student-data";
import { Megaphone, Calendar, User } from "lucide-react";

export default function StudentAnnouncementsPage() {
    const { announcements } = studentData;

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold tracking-tight text-gray-900">Announcements</h1>

            <div className="space-y-4">
                {announcements.map((announcement) => (
                    <div key={announcement.id} className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm hover:shadow-md transition-shadow">
                        <div className="flex items-start justify-between">
                            <div className="flex-1">
                                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                    {announcement.title}
                                </h3>
                                <div className="flex items-center gap-4 text-xs text-gray-500 mb-4">
                                    <div className="flex items-center gap-1">
                                        <Calendar className="h-3 w-3" />
                                        {new Date(announcement.date).toLocaleDateString()}
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <User className="h-3 w-3" />
                                        {announcement.author}
                                    </div>
                                </div>
                                <p className="text-gray-600 text-sm leading-relaxed">
                                    {announcement.content}
                                </p>
                            </div>
                            <div className="h-10 w-10 flex-shrink-0 rounded-full bg-blue-50 flex items-center justify-center">
                                <Megaphone className="h-5 w-5 text-blue-600" />
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
