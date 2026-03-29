import { FileText, Zap } from "lucide-react";

export default function HomeworkPage() {
    const Assignments = [
        { id: 1, title: "Weekly Assignment 4", type: "Assignment", details: "Covers Chapters 7-8", dueDate: "Tomorrow, 11:59 PM", status: "PENDING", isQuiz: false },
        { id: 2, title: "Midterm Prep Quiz", type: "Quiz", details: "30 Questions", dueDate: "Oct 15, 11:59 PM", status: "OVERDUE", isQuiz: true },
        { id: 3, title: "Lab Report 3", type: "Assignment", details: "Group submission", dueDate: "Oct 10, 11:59 PM", status: "SUBMITTED", isQuiz: false },
    ];

    const getStatusBadge = (status: string) => {
        switch (status) {
            case "OVERDUE": return <span className="px-2.5 py-1 bg-red-50 text-red-600 text-xs font-bold rounded-md">OVERDUE</span>;
            case "PENDING": return <span className="px-2.5 py-1 bg-orange-50 text-orange-600 text-xs font-bold rounded-md">PENDING</span>;
            case "SUBMITTED": return <span className="px-2.5 py-1 bg-emerald-50 text-emerald-600 text-xs font-bold rounded-md">SUBMITTED</span>;
            default: return null;
        }
    };

    return (
        <div className="space-y-4">
            {Assignments.map(hw => (
                <div key={hw.id} className="bg-white p-5 rounded-xl border border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:shadow-sm transition-shadow">
                    <div className="flex items-center space-x-4">
                        <div className={`p-3 rounded-xl ${hw.isQuiz ? "bg-purple-50 text-purple-600" : "bg-blue-50 text-blue-600"}`}>
                            {hw.isQuiz ? <Zap className="w-6 h-6" /> : <FileText className="w-6 h-6" />}
                        </div>
                        <div>
                            <h3 className="font-bold text-slate-900">{hw.title}</h3>
                            <p className="text-sm text-slate-500 mt-0.5">{hw.type} • {hw.details}</p>
                        </div>
                    </div>
                    <div className="flex items-center space-x-4 md:space-x-6 md:justify-end">
                        <div className="text-right">
                            <p className="text-xs text-slate-400 font-medium uppercase">Due Date</p>
                            <p className="text-sm font-medium text-slate-700">{hw.dueDate}</p>
                        </div>
                        <div>
                            {getStatusBadge(hw.status)}
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}