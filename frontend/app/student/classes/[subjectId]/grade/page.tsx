import { Target, Trophy, Award } from "lucide-react";

export default function GradePage() {
    const grades = [
        { id: 1, assessment: "Midterm Examination", type: "Exam", date: "Oct 12, 2025", score: "92/100", percentage: 92 },
        { id: 2, title: "Lab Report 3", type: "Homework", date: "Oct 10, 2025", score: "Pending", percentage: null },
        { id: 3, assessment: "Chapter 3 Quiz", type: "Quiz", date: "Oct 05, 2025", score: "94/100", percentage: 94 },
        { id: 4, assessment: "Group Project Phase 1", type: "Homework", date: "Sep 28, 2025", score: "88/100", percentage: 88 },
    ];

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-gradient-to-br from-blue-600 to-indigo-700 text-white p-5 rounded-xl shadow-sm flex items-center space-x-4">
                    <div className="p-3 bg-white/20 rounded-lg"><Trophy className="w-6 h-6" /></div>
                    <div><p className="text-sm text-blue-100 font-medium">Current Grade</p><p className="text-3xl font-bold">A</p></div>
                </div>
                <div className="bg-white p-5 rounded-xl border border-slate-100 flex items-center space-x-4 shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)]">
                    <div className="p-3 bg-emerald-50 text-emerald-600 rounded-lg"><Target className="w-6 h-6" /></div>
                    <div><p className="text-sm text-slate-500 font-medium">Average Score</p><p className="text-2xl font-bold text-slate-900">91.5%</p></div>
                </div>
                <div className="bg-white p-5 rounded-xl border border-slate-100 flex items-center space-x-4 shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)]">
                    <div className="p-3 bg-orange-50 text-orange-600 rounded-lg"><Award className="w-6 h-6" /></div>
                    <div><p className="text-sm text-slate-500 font-medium">Attendance Score</p><p className="text-2xl font-bold text-slate-900">100%</p></div>
                </div>
            </div>

            <div className="bg-white border border-slate-100 rounded-xl overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-slate-600">
                        <thead className="bg-slate-50 text-xs text-slate-400 font-medium uppercase tracking-wider">
                            <tr>
                                <th className="px-6 py-4">Assessment</th>
                                <th className="px-6 py-4 hidden sm:table-cell">Type</th>
                                <th className="px-6 py-4 hidden md:table-cell">Date</th>
                                <th className="px-6 py-4 text-right">Score</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {grades.map(grade => (
                                <tr key={grade.id} className="hover:bg-slate-50/50 transition-colors">
                                    <td className="px-6 py-4 font-bold text-slate-900">{grade.assessment || grade.title}</td>
                                    <td className="px-6 py-4 hidden sm:table-cell">
                                        <span className={`px-2 py-1 rounded-md text-xs font-medium ${grade.type === 'Exam' ? 'bg-purple-50 text-purple-600' :
                                                grade.type === 'Quiz' ? 'bg-blue-50 text-blue-600' :
                                                    'bg-slate-100 text-slate-600'
                                            }`}>{grade.type}</span>
                                    </td>
                                    <td className="px-6 py-4 hidden md:table-cell">{grade.date}</td>
                                    <td className="px-6 py-4 text-right">
                                        {grade.percentage ? (
                                            <span className="font-bold text-slate-900">{grade.score}</span>
                                        ) : (
                                            <span className="text-orange-500 font-medium italic">{grade.score}</span>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
