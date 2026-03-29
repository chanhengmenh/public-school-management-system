import { CheckCircle, Clock, FileQuestion, Trophy } from "lucide-react";

export default function QuizPage() {
    const quizzes = [
        { id: 1, title: "Chapter 4 Quiz", details: "20 Questions", timeLimit: "30 mins", dueDate: "Oct 18", status: "PENDING", score: null },
        { id: 2, title: "Chapter 3 Quiz", details: "15 Questions", timeLimit: "20 mins", dueDate: "Oct 10", status: "SUBMITTED", score: "94/100", percentage: 94 },
        { id: 3, title: "Chapter 1 & 2 Quiz", details: "25 Questions", timeLimit: "45 mins", dueDate: "Sep 25", status: "SUBMITTED", score: "88/100", percentage: 88 },
    ];

    return (
        <div className="space-y-6">
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white p-5 rounded-xl border border-slate-100 flex items-center space-x-4">
                    <div className="p-3 bg-blue-50 text-blue-600 rounded-lg"><FileQuestion className="w-6 h-6" /></div>
                    <div><p className="text-sm text-slate-500 font-medium">Total Quizzes</p><p className="text-2xl font-bold text-slate-900">12</p></div>
                </div>
                <div className="bg-white p-5 rounded-xl border border-slate-100 flex items-center space-x-4">
                    <div className="p-3 bg-emerald-50 text-emerald-600 rounded-lg"><CheckCircle className="w-6 h-6" /></div>
                    <div><p className="text-sm text-slate-500 font-medium">Completed</p><p className="text-2xl font-bold text-slate-900">9</p></div>
                </div>
                <div className="bg-white p-5 rounded-xl border border-slate-100 flex items-center space-x-4">
                    <div className="p-3 bg-orange-50 text-orange-600 rounded-lg"><Trophy className="w-6 h-6" /></div>
                    <div><p className="text-sm text-slate-500 font-medium">Avg Score</p><p className="text-2xl font-bold text-slate-900">91%</p></div>
                </div>
            </div>

            <h2 className="text-lg font-bold text-slate-800 mt-6 mb-2">Quiz History</h2>

            <div className="space-y-4">
                {quizzes.map(quiz => (
                    <div key={quiz.id} className="bg-white p-5 rounded-xl border border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-6 hover:shadow-sm transition-shadow">
                        <div className="flex items-center space-x-4">
                            <div className={`p-3 rounded-xl ${quiz.status === 'SUBMITTED' ? "bg-emerald-50 text-emerald-600" : "bg-purple-50 text-purple-600"}`}>
                                {quiz.status === 'SUBMITTED' ? <CheckCircle className="w-6 h-6" /> : <Clock className="w-6 h-6" />}
                            </div>
                            <div>
                                <h3 className="font-bold text-slate-900">{quiz.title}</h3>
                                <p className="text-sm text-slate-500 mt-0.5">{quiz.details} • Time limit: {quiz.timeLimit}</p>
                            </div>
                        </div>

                        <div className="flex-1 max-w-xs md:ml-auto w-full">
                            {quiz.status === 'SUBMITTED' ? (
                                <div className="mt-4 md:mt-0">
                                    <div className="flex justify-between text-sm font-medium mb-1.5">
                                        <span className="text-slate-500">Score</span>
                                        <span className={quiz.percentage! >= 90 ? "text-emerald-600" : "text-blue-600"}>{quiz.score}</span>
                                    </div>
                                    <div className="w-full bg-slate-100 rounded-full h-2">
                                        <div className={`${quiz.percentage! >= 90 ? "bg-emerald-500" : "bg-blue-500"} h-2 rounded-full`} style={{ width: `${quiz.percentage}%` }}></div>
                                    </div>
                                </div>
                            ) : (
                                <div className="flex items-center justify-between md:justify-end space-x-4 mt-4 md:mt-0">
                                    <div className="text-right">
                                        <p className="text-xs text-slate-400 font-medium">Due Date</p>
                                        <p className="text-sm text-slate-700">{quiz.dueDate}</p>
                                    </div>
                                    <button className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white text-sm font-bold rounded-lg transition-colors shadow-sm">
                                        Start Quiz
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
