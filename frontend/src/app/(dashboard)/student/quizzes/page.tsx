import Link from "next/link";
import { studentData } from "@/data/student-data";
import { Calendar, Clock, ChevronRight, CheckCircle, XCircle, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

export default function StudentQuizzesPage() {
    const { allQuizzes } = studentData;

    const getStatusColor = (status: string) => {
        switch (status) {
            case "Open": return "bg-green-100 text-green-700";
            case "Upcoming": return "bg-blue-100 text-blue-700";
            case "Submitted": return "bg-gray-100 text-gray-700";
            case "Closed": return "bg-red-100 text-red-700";
            default: return "bg-gray-100 text-gray-700";
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case "Open": return <AlertCircle className="h-4 w-4" />;
            case "Upcoming": return <Calendar className="h-4 w-4" />;
            case "Submitted": return <CheckCircle className="h-4 w-4" />;
            case "Closed": return <XCircle className="h-4 w-4" />;
            default: return null;
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold tracking-tight text-gray-900">Quizzes</h1>
            </div>

            <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-gray-50 text-gray-500">
                            <tr>
                                <th className="px-6 py-4 font-medium">Quiz Title</th>
                                <th className="px-6 py-4 font-medium">Subject</th>
                                <th className="px-6 py-4 font-medium">Deadline</th>
                                <th className="px-6 py-4 font-medium">Duration</th>
                                <th className="px-6 py-4 font-medium">Status</th>
                                <th className="px-6 py-4 font-medium">Score</th>
                                <th className="px-6 py-4 font-medium">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {allQuizzes.map((quiz) => (
                                <tr key={quiz.id} className="group hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4 font-medium text-gray-900">{quiz.title}</td>
                                    <td className="px-6 py-4 text-gray-500">{quiz.subject}</td>
                                    <td className="px-6 py-4 text-gray-500">
                                        <div className="flex items-center gap-2">
                                            <Calendar className="h-4 w-4 text-gray-400" />
                                            {new Date(quiz.dueDate).toLocaleDateString()}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-gray-500">
                                        <div className="flex items-center gap-2">
                                            <Clock className="h-4 w-4 text-gray-400" />
                                            {quiz.duration}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={cn(
                                            "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium",
                                            getStatusColor(quiz.status)
                                        )}>
                                            {getStatusIcon(quiz.status)}
                                            {quiz.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 font-medium text-gray-900">
                                        {quiz.score !== null ? `${quiz.score}%` : "-"}
                                    </td>
                                    <td className="px-6 py-4">
                                        {quiz.status === "Open" ? (
                                            <Link
                                                href={`/student/quizzes/${quiz.id}`}
                                                className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-500 font-medium"
                                            >
                                                Start Quiz <ChevronRight className="h-4 w-4" />
                                            </Link>
                                        ) : (
                                            <span className="text-gray-400 cursor-not-allowed">View Details</span>
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
