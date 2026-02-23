"use client";

import { Shield, Book, Clock, AlertTriangle } from "lucide-react";

export default function StudentSchoolPolicyPage() {
    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-2">
                <h1 className="text-2xl font-bold tracking-tight text-gray-900">School Policy</h1>
                <p className="text-sm text-gray-500">Please review the school&apos;s rules and regulations carefully.</p>
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
                        <p>All students are expected to demonstrate respect for themselves, others, and school property.</p>
                        <ul className="list-disc pl-5 space-y-1">
                            <li>Respectful language and behavior are required at all times.</li>
                            <li>Bullying and harassment will not be tolerated.</li>
                            <li>School property must be treated with care.</li>
                            <li>Dress code must be followed during school hours.</li>
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
                        <p>We value honesty and original work.</p>
                        <ul className="list-disc pl-5 space-y-1">
                            <li>Plagiarism is strictly prohibited.</li>
                            <li>Cheating on exams or assignments allows for immediate disciplinary action.</li>
                            <li>Collaboration is encouraged only when explicitly permitted by the teacher.</li>
                        </ul>
                    </div>
                </div>

                {/* Attendance Policy */}
                <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 bg-orange-100 text-orange-600 rounded-lg">
                            <Clock className="h-6 w-6" />
                        </div>
                        <h2 className="text-lg font-semibold text-gray-900">Attendance Policy</h2>
                    </div>
                    <div className="space-y-3 text-sm text-gray-600">
                        <p>Regular attendance is crucial for academic success.</p>
                        <ul className="list-disc pl-5 space-y-1">
                            <li>Students must arrive on time for all classes.</li>
                            <li>Absences must be reported by a guardian by 8:30 AM.</li>
                            <li>More than 3 unexcused absences per semester will result in a parent meeting.</li>
                            <li>Late arrivals must check in at the front office.</li>
                        </ul>
                    </div>
                </div>

                {/* Technology Usage */}
                <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 bg-purple-100 text-purple-600 rounded-lg">
                            <AlertTriangle className="h-6 w-6" />
                        </div>
                        <h2 className="text-lg font-semibold text-gray-900">Technology Usage</h2>
                    </div>
                    <div className="space-y-3 text-sm text-gray-600">
                        <p>Responsible use of technology is expected.</p>
                        <ul className="list-disc pl-5 space-y-1">
                            <li>School devices are for educational purposes only.</li>
                            <li>Personal devices must be silenced during class.</li>
                            <li>Cyberbullying or accessing inappropriate content is a serious offense.</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
}
