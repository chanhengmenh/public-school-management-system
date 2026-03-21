import { Calendar, CheckCircle, Clock, XCircle } from "lucide-react";

export default function AttendancePage() {
    const records = [
        { id: 1, date: "Oct 20, 2025", time: "09:00 AM - 10:30 AM", status: "Present" },
        { id: 2, date: "Oct 18, 2025", time: "09:00 AM - 10:30 AM", status: "Present" },
        { id: 3, date: "Oct 15, 2025", time: "09:00 AM - 10:30 AM", status: "Late" },
        { id: 4, date: "Oct 13, 2025", time: "09:00 AM - 10:30 AM", status: "Absent" },
        { id: 5, date: "Oct 11, 2025", time: "09:00 AM - 10:30 AM", status: "Present" },
    ];

    const getStatusBadge = (status: string) => {
        switch (status) {
            case "Present": return <span className="flex items-center space-x-1.5 px-3 py-1 bg-emerald-50 text-emerald-600 text-xs font-bold rounded-lg"><CheckCircle className="w-3.5 h-3.5" /><span>Present</span></span>;
            case "Late": return <span className="flex items-center space-x-1.5 px-3 py-1 bg-orange-50 text-orange-600 text-xs font-bold rounded-lg"><Clock className="w-3.5 h-3.5" /><span>Late</span></span>;
            case "Absent": return <span className="flex items-center space-x-1.5 px-3 py-1 bg-red-50 text-red-600 text-xs font-bold rounded-lg"><XCircle className="w-3.5 h-3.5" /><span>Absent</span></span>;
            default: return null;
        }
    };

    return (
        <div className="space-y-6 max-w-3xl">
            <div className="bg-white p-6 rounded-xl border border-slate-100 flex items-center justify-between shadow-sm">
                <div className="flex items-center space-x-4">
                    <div className="p-3 bg-blue-50 text-blue-600 rounded-xl"><Calendar className="w-8 h-8" /></div>
                    <div>
                        <h2 className="text-xl font-bold text-slate-900">Overall Attendance</h2>
                        <p className="text-sm text-slate-500 mt-1">Based on 32 classes this semester</p>
                    </div>
                </div>
                <div className="text-4xl font-black text-emerald-500">92%</div>
            </div>

            <div className="bg-white border border-slate-100 rounded-xl overflow-hidden shadow-sm">
                <div className="p-4 border-b border-slate-100 bg-slate-50/50">
                    <h3 className="font-bold text-slate-800">Recent Class Records</h3>
                </div>
                <ul className="divide-y divide-slate-100">
                    {records.map(record => (
                        <li key={record.id} className="p-4 flex items-center justify-between hover:bg-slate-50/50 transition-colors">
                            <div>
                                <p className="font-bold text-slate-900">{record.date}</p>
                                <p className="text-sm text-slate-500 mt-0.5">{record.time}</p>
                            </div>
                            <div>{getStatusBadge(record.status)}</div>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
}