"use client";

import { Shield, Book, Clock, AlertTriangle } from "lucide-react";

export default function HomeClassSchoolPolicyPage() {
    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-2">
                <h1 className="text-2xl font-bold tracking-tight text-gray-900">School Policy</h1>
                <p className="text-sm text-gray-500">Rules and regulations for all students and staff.</p>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                {/* Code of Conduct */}
                <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 bg-blue-100 text-blue-600 rounded-lg">
                            <Shield className="h-6 w-6" />
                        </div>
                        <h2 className="text-lg font-semibold text-gray-900">Regulations</h2>
                    </div>
                    <div className="space-y-3 text-sm text-gray-600">
                        <p>All members of the school community are expected to uphold high standards of behavior.</p>
                        <ul className="list-disc pl-5 space-y-1">
                            <li>Respect others' rights and property.</li>
                            <li>Maintain a safe and inclusive environment.</li>
                            <li>Adhere to the dress code policy.</li>
                            <li>Report any incidents of bullying or harassment immediately.</li>
                        </ul>
                    </div>
                </div>

                {/* Academic Integrity */}
                <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 bg-green-100 text-green-600 rounded-lg">
                            <Book className="h-6 w-6" />
                        </div>
                        <h2 className="text-lg font-semibold text-gray-900">Academic Integrity</h2>
                    </div>
                    <div className="space-y-3 text-sm text-gray-600">
                        <p>Honesty in academic work is fundamental to learning.</p>
                        <ul className="list-disc pl-5 space-y-1">
                            <li>All submitted work must be the student's own.</li>
                            <li>Proper citation is required for all sources.</li>
                            <li>Cheating on exams or assignments has serious consequences.</li>
                        </ul>
                    </div>
                </div>

                {/* Attendance & Punctuality */}
                <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 bg-orange-100 text-orange-600 rounded-lg">
                            <Clock className="h-6 w-6" />
                        </div>
                        <h2 className="text-lg font-semibold text-gray-900">Attendance & Punctuality</h2>
                    </div>
                    <div className="space-y-3 text-sm text-gray-600">
                        <p>Regular attendance is essential for academic progress.</p>
                        <ul className="list-disc pl-5 space-y-1">
                            <li>School starts promptly at 7:30 AM.</li>
                            <li>Students must attend all scheduled classes.</li>
                            <li>Parents must notify the school of any absences.</li>
                            <li>Excessive tardiness may result in disciplinary action.</li>
                        </ul>
                    </div>
                </div>

                {/* Technology Use */}
                <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 bg-purple-100 text-purple-600 rounded-lg">
                            <AlertTriangle className="h-6 w-6" />
                        </div>
                        <h2 className="text-lg font-semibold text-gray-900">Technology Use</h2>
                    </div>
                    <div className="space-y-3 text-sm text-gray-600">
                        <p>Digital resources are provided for educational purposes.</p>
                        <ul className="list-disc pl-5 space-y-1">
                            <li>Use school devices responsibly and for learning only.</li>
                            <li>Do not access inappropriate or restricted content.</li>
                            <li>Respect the privacy and digital security of others.</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
}
