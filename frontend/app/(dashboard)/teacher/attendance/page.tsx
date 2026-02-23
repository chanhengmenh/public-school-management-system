"use client";

import { mockClassAttendance } from "@/data/mockAttendance";
import { teacherClassesData } from "@/data/teacher-classes";

export default function TeacherAttendancePage() {
    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold text-gray-800">Attendance</h1>
            <p className="text-gray-500">Manage daily attendance for your classes.</p>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <table className="w-full text-left border-collapse">
                    <thead className="bg-gray-50 border-b border-gray-200">
                        <tr>
                            <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Student Name</th>
                            <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">ID</th>
                            <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Present</th>
                            <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Absent</th>
                            <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Late</th>
                            <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Last Status</th>
                            <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Rate</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {mockClassAttendance.map((record) => (
                            <tr key={record.id} className="hover:bg-gray-50">
                                <td className="px-6 py-4 font-medium text-gray-900">{record.name}</td>
                                <td className="px-6 py-4 text-sm text-gray-500">{record.id}</td>
                                <td className="px-6 py-4 text-sm text-green-600">{record.present}</td>
                                <td className="px-6 py-4 text-sm text-red-600">{record.absent}</td>
                                <td className="px-6 py-4 text-sm text-amber-600">{record.late}</td>
                                <td className="px-6 py-4 text-sm">
                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${record.lastStatus === 'Present' ? 'bg-green-100 text-green-800' :
                                            record.lastStatus === 'Absent' ? 'bg-red-100 text-red-800' :
                                                'bg-amber-100 text-amber-800'
                                        }`}>
                                        {record.lastStatus}
                                    </span>
                                </td>
                                <td className="px-6 py-4 font-medium text-blue-600">{record.rate}%</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
