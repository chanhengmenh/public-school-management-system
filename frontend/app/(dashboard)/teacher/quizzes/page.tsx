"use client";

import { useState } from "react";
import { teacherQuizzes as initialQuizzes } from "@/data/teacher-quizzes";
import { Plus, Calendar, Clock, Users, FileText, X, Eye, EyeOff } from "lucide-react";
import { cn } from "@/lib/utils";

export default function TeacherQuizManagement() {
    const [quizzes, setQuizzes] = useState(initialQuizzes);
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [newQuiz, setNewQuiz] = useState({
        title: "",
        subject: "Mathematics 10",
        class: "Class 10-A",
        questions: 10,
        duration: "30 min",
        deadline: "",
    });

    const handleTogglePublish = (quizId: string) => {
        setQuizzes((prev) =>
            prev.map((q) =>
                q.id === quizId ? { ...q, published: !q.published } : q
            )
        );
    };

    const handleCreateQuiz = () => {
        if (!newQuiz.title || !newQuiz.deadline) {
            alert("Please fill in all required fields.");
            return;
        }

        const quiz = {
            id: `tq-${Date.now()}`,
            ...newQuiz,
            published: false,
            submissions: 0,
            totalStudents: 32,
        };

        setQuizzes((prev) => [quiz, ...prev]);
        setShowCreateForm(false);
        setNewQuiz({
            title: "",
            subject: "Mathematics 10",
            class: "Class 10-A",
            questions: 10,
            duration: "30 min",
            deadline: "",
        });
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold tracking-tight text-gray-900">Quiz Management</h1>
                <button
                    onClick={() => setShowCreateForm(true)}
                    className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-500 transition-colors"
                >
                    <Plus className="h-4 w-4" />
                    Create Quiz
                </button>
            </div>

            {/* Create Quiz Modal */}
            {showCreateForm && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
                    <div className="w-full max-w-lg rounded-xl bg-white p-6 shadow-xl">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-bold text-gray-900">Create New Quiz</h2>
                            <button
                                onClick={() => setShowCreateForm(false)}
                                className="text-gray-400 hover:text-gray-600"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Quiz Title *</label>
                                <input
                                    type="text"
                                    value={newQuiz.title}
                                    onChange={(e) => setNewQuiz({ ...newQuiz, title: e.target.value })}
                                    placeholder="Enter quiz title"
                                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
                                    <select
                                        value={newQuiz.subject}
                                        onChange={(e) => setNewQuiz({ ...newQuiz, subject: e.target.value })}
                                        className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                                    >
                                        <option>Mathematics 10</option>
                                        <option>Mathematics 9</option>
                                        <option>Advanced Algebra</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Class</label>
                                    <select
                                        value={newQuiz.class}
                                        onChange={(e) => setNewQuiz({ ...newQuiz, class: e.target.value })}
                                        className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                                    >
                                        <option>Class 10-A</option>
                                        <option>Class 10-B</option>
                                        <option>Class 9-A</option>
                                        <option>Class 9-B</option>
                                    </select>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Number of Questions</label>
                                    <input
                                        type="number"
                                        value={newQuiz.questions}
                                        onChange={(e) => setNewQuiz({ ...newQuiz, questions: parseInt(e.target.value) })}
                                        min="1"
                                        className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Duration</label>
                                    <select
                                        value={newQuiz.duration}
                                        onChange={(e) => setNewQuiz({ ...newQuiz, duration: e.target.value })}
                                        className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                                    >
                                        <option>15 min</option>
                                        <option>30 min</option>
                                        <option>45 min</option>
                                        <option>60 min</option>
                                        <option>90 min</option>
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Deadline *</label>
                                <input
                                    type="datetime-local"
                                    value={newQuiz.deadline}
                                    onChange={(e) => setNewQuiz({ ...newQuiz, deadline: e.target.value })}
                                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                                />
                            </div>

                            <div className="flex justify-end gap-3 pt-4">
                                <button
                                    onClick={() => setShowCreateForm(false)}
                                    className="rounded-lg px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleCreateQuiz}
                                    className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-500 transition-colors"
                                >
                                    Create Quiz
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Quiz List */}
            <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-gray-50 text-gray-500">
                            <tr>
                                <th className="px-6 py-4 font-medium">Quiz Title</th>
                                <th className="px-6 py-4 font-medium">Subject / Class</th>
                                <th className="px-6 py-4 font-medium">Details</th>
                                <th className="px-6 py-4 font-medium">Deadline</th>
                                <th className="px-6 py-4 font-medium">Submissions</th>
                                <th className="px-6 py-4 font-medium">Status</th>
                                <th className="px-6 py-4 font-medium">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {quizzes.map((quiz) => {
                                const deadlineDate = new Date(quiz.deadline);
                                const isExpired = deadlineDate < new Date();

                                return (
                                    <tr key={quiz.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4">
                                            <p className="font-medium text-gray-900">{quiz.title}</p>
                                        </td>
                                        <td className="px-6 py-4">
                                            <p className="text-gray-900">{quiz.subject}</p>
                                            <p className="text-xs text-gray-500">{quiz.class}</p>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-4 text-gray-500">
                                                <span className="flex items-center gap-1">
                                                    <FileText className="h-4 w-4" />
                                                    {quiz.questions} Q
                                                </span>
                                                <span className="flex items-center gap-1">
                                                    <Clock className="h-4 w-4" />
                                                    {quiz.duration}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <Calendar className="h-4 w-4 text-gray-400" />
                                                <div>
                                                    <p className={cn("text-sm", isExpired ? "text-red-600" : "text-gray-900")}>
                                                        {deadlineDate.toLocaleDateString()}
                                                    </p>
                                                    <p className="text-xs text-gray-500">
                                                        {deadlineDate.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                                                    </p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <Users className="h-4 w-4 text-gray-400" />
                                                <span className="text-gray-900">
                                                    {quiz.submissions} / {quiz.totalStudents}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={cn(
                                                "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium",
                                                quiz.published
                                                    ? "bg-green-100 text-green-700"
                                                    : "bg-gray-100 text-gray-600"
                                            )}>
                                                {quiz.published ? (
                                                    <><Eye className="h-3 w-3" /> Published</>
                                                ) : (
                                                    <><EyeOff className="h-3 w-3" /> Draft</>
                                                )}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <button
                                                onClick={() => handleTogglePublish(quiz.id)}
                                                className={cn(
                                                    "rounded-lg px-3 py-1.5 text-xs font-medium transition-colors",
                                                    quiz.published
                                                        ? "bg-amber-100 text-amber-700 hover:bg-amber-200"
                                                        : "bg-blue-100 text-blue-700 hover:bg-blue-200"
                                                )}
                                            >
                                                {quiz.published ? "Unpublish" : "Publish"}
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
