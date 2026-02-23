import { studentData } from "@/data/student-data";
import { Clock, Calendar, AlertTriangle } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

export default async function QuizDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const quiz = studentData.allQuizzes.find((q) => q.id === id);

    if (!quiz) {
        notFound();
    }

    return (
        <div className="max-w-3xl mx-auto space-y-8">
            <div className="flex items-center justify-between">
                <Link href="/student/quizzes" className="text-sm text-gray-500 hover:text-gray-900">
                    &larr; Back to Quizzes
                </Link>
            </div>

            <div className="rounded-xl border border-gray-200 bg-white p-8 shadow-sm text-center">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">{quiz.title}</h1>
                <p className="text-lg text-gray-600 mb-8">{quiz.subject}</p>

                <div className="flex justify-center gap-8 mb-8">
                    <div className="flex flex-col items-center gap-2">
                        <div className="p-3 rounded-full bg-blue-50 text-blue-600">
                            <Calendar className="h-6 w-6" />
                        </div>
                        <span className="text-sm text-gray-500">Due Date</span>
                        <span className="font-medium text-gray-900">{new Date(quiz.dueDate).toLocaleDateString()}</span>
                    </div>
                    <div className="flex flex-col items-center gap-2">
                        <div className="p-3 rounded-full bg-orange-50 text-orange-600">
                            <Clock className="h-6 w-6" />
                        </div>
                        <span className="text-sm text-gray-500">Duration</span>
                        <span className="font-medium text-gray-900">{quiz.duration}</span>
                    </div>
                    <div className="flex flex-col items-center gap-2">
                        <div className="p-3 rounded-full bg-purple-50 text-purple-600">
                            <AlertTriangle className="h-6 w-6" />
                        </div>
                        <span className="text-sm text-gray-500">Questions</span>
                        <span className="font-medium text-gray-900">20 Questions</span>
                    </div>
                </div>

                <div className="border-t border-gray-100 pt-8">
                    <h3 className="font-medium text-gray-900 mb-4">Instructions</h3>
                    <ul className="text-sm text-gray-600 space-y-2 mb-8 text-left max-w-md mx-auto list-disc pl-5">
                        <li>Once you start, the timer will not pause.</li>
                        <li>Do not refresh the page or you may lose progress.</li>
                        <li>Ensure you have a stable internet connection.</li>
                    </ul>

                    <Link
                        href={`/student/quizzes/${id}/take`}
                        className="rounded-full bg-blue-600 px-12 py-3 text-base font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 transition-all inline-block"
                    >
                        Start Quiz Now
                    </Link>
                </div>
            </div>
        </div>
    );
}
