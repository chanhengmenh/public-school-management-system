import { Mail, GraduationCap } from "lucide-react";

export default function PeoplePage() {
    const classmates = [
        { id: 1, name: "Alice Chen", initials: "AC", role: "CLASS MONITOR", idNum: "S-1001", color: "bg-orange-100 text-orange-600" },
        { id: 2, name: "Bob Smith", initials: "BS", role: "STUDENT", idNum: "S-1002", color: "bg-blue-100 text-blue-600" },
        { id: 3, name: "Charlie Davis", initials: "CD", role: "STUDENT", idNum: "S-1003", color: "bg-emerald-100 text-emerald-600" },
        { id: 4, name: "Diana Prince", initials: "DP", role: "STUDENT", idNum: "S-1004", color: "bg-purple-100 text-purple-600" },
        { id: 5, name: "Evan Wright", initials: "EW", role: "STUDENT", idNum: "S-1005", color: "bg-pink-100 text-pink-600" },
        { id: 6, name: "Fiona Gallagher", initials: "FG", role: "STUDENT", idNum: "S-1006", color: "bg-indigo-100 text-indigo-600" },
    ];

    return (
        <div className="space-y-8">
            <div>
                <h2 className="text-lg font-bold text-slate-800 mb-4">Teacher</h2>
                <div className="bg-slate-900 text-white rounded-2xl p-6 w-full sm:w-72 flex flex-col items-center text-center shadow-lg relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-16 bg-gradient-to-br from-blue-600/30 to-transparent"></div>
                    <div className="w-20 h-20 rounded-full bg-blue-600 flex items-center justify-center text-2xl font-bold shadow-inner mb-4 relative z-10 border-4 border-slate-900">
                        TW
                    </div>
                    <h3 className="font-bold text-xl">Mr. Tan Wei</h3>
                    <span className="px-3 py-1 bg-white/10 text-blue-300 text-xs font-bold rounded-full mt-2 mb-4">
                        SUBJECT TEACHER
                    </span>
                    <div className="w-full pt-4 border-t border-white/10 flex items-center justify-center space-x-2 text-sm text-slate-400">
                        <Mail className="w-4 h-4" />
                        <span>tan.wei@school.edu</span>
                    </div>
                </div>
            </div>

            <div>
                <h2 className="text-lg font-bold text-slate-800 mb-4 whitespace-nowrap flex items-center gap-2">
                    <GraduationCap className="w-5 h-5 text-slate-400" />
                    <span>Classmates (32 students)</span>
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {classmates.map(student => (
                        <div key={student.id} className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm flex flex-col items-center text-center hover:shadow-md transition-shadow">
                            <div className={`w-16 h-16 rounded-full ${student.color} flex items-center justify-center text-xl font-bold mb-3`}>
                                {student.initials}
                            </div>
                            <h3 className="font-bold text-slate-900">{student.name}</h3>
                            <p className="text-xs text-slate-400 mt-1 font-mono">{student.idNum}</p>
                            <div className="mt-4 w-full">
                                <span className={`block w-full py-1.5 rounded-lg text-xs font-bold ${student.role === 'CLASS MONITOR'
                                        ? 'bg-orange-50 text-orange-600'
                                        : 'bg-slate-50 text-slate-500'
                                    }`}>
                                    {student.role}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}