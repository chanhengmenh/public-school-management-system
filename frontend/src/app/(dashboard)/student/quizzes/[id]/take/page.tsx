"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { quizQuestions } from "@/data/quiz-questions";
import { Clock, AlertTriangle, CheckCircle, Copy, ClipboardPaste } from "lucide-react";
import { cn } from "@/lib/utils";

export default function QuizTakingPage() {
    const params = useParams();
    const router = useRouter();
    const quizId = params.id as string;

    const quizData = quizQuestions[quizId as keyof typeof quizQuestions];

    const [answers, setAnswers] = useState<Record<number, string | number>>({});
    const [timeLeft, setTimeLeft] = useState(quizData?.duration ? quizData.duration * 60 : 0);
    const [copyPasteEvents, setCopyPasteEvents] = useState<{ type: string; timestamp: Date }[]>([]);
    const [showWarning, setShowWarning] = useState(false);

    // Timer logic
    useEffect(() => {
        if (timeLeft <= 0) return;

        const timer = setInterval(() => {
            setTimeLeft((prev) => {
                if (prev <= 1) {
                    clearInterval(timer);
                    handleSubmit();
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [timeLeft]);

    // Copy-paste detection
    useEffect(() => {
        const handleCopy = () => {
            setCopyPasteEvents((prev) => [...prev, { type: "copy", timestamp: new Date() }]);
            setShowWarning(true);
            setTimeout(() => setShowWarning(false), 3000);
        };

        const handlePaste = () => {
            setCopyPasteEvents((prev) => [...prev, { type: "paste", timestamp: new Date() }]);
            setShowWarning(true);
            setTimeout(() => setShowWarning(false), 3000);
        };

        document.addEventListener("copy", handleCopy);
        document.addEventListener("paste", handlePaste);

        return () => {
            document.removeEventListener("copy", handleCopy);
            document.removeEventListener("paste", handlePaste);
        };
    }, []);

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
    };

    const handleAnswerChange = (questionId: number, answer: string | number) => {
        setAnswers((prev) => ({ ...prev, [questionId]: answer }));
    };

    const handleSubmit = useCallback(() => {
        console.log("Submitted Answers:", answers);
        console.log("Copy/Paste Events:", copyPasteEvents);
        alert(`Quiz submitted!\n\nCopy/Paste events detected: ${copyPasteEvents.length}`);
        router.push("/student/quizzes");
    }, [answers, copyPasteEvents, router]);

    if (!quizData) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <p className="text-gray-500">Quiz not found.</p>
            </div>
        );
    }

    const answeredCount = Object.keys(answers).length;
    const totalQuestions = quizData.questions.length;
    const progress = (answeredCount / totalQuestions) * 100;

    return (
        <div className="max-w-4xl mx-auto space-y-6 pb-24">
            {/* Warning Banner */}
            {showWarning && (
                <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-red-600 text-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-3 animate-pulse">
                    <AlertTriangle className="h-5 w-5" />
                    <span className="font-medium">Copy/Paste activity detected and logged!</span>
                </div>
            )}

            {/* Header */}
            <div className="sticky top-0 z-40 bg-gray-50 py-4 border-b border-gray-200 -mx-6 md:-mx-8 px-6 md:px-8">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-xl font-bold text-gray-900">{quizData.title}</h1>
                        <p className="text-sm text-gray-500">{quizData.subject}</p>
                    </div>
                    <div className="flex items-center gap-6">
                        {/* Timer */}
                        <div className={cn(
                            "flex items-center gap-2 px-4 py-2 rounded-lg font-mono text-lg font-bold",
                            timeLeft <= 60 ? "bg-red-100 text-red-700" : "bg-blue-100 text-blue-700"
                        )}>
                            <Clock className="h-5 w-5" />
                            {formatTime(timeLeft)}
                        </div>

                        {/* Copy-paste counter */}
                        {copyPasteEvents.length > 0 && (
                            <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-amber-100 text-amber-700 text-sm font-medium">
                                <ClipboardPaste className="h-4 w-4" />
                                {copyPasteEvents.length} event(s)
                            </div>
                        )}
                    </div>
                </div>

                {/* Progress bar */}
                <div className="mt-4">
                    <div className="flex justify-between text-xs text-gray-500 mb-1">
                        <span>Progress</span>
                        <span>{answeredCount} / {totalQuestions} answered</span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-gray-200">
                        <div
                            className="h-full rounded-full bg-green-500 transition-all duration-300"
                            style={{ width: `${progress}%` }}
                        />
                    </div>
                </div>
            </div>

            {/* Questions */}
            <div className="space-y-8">
                {quizData.questions.map((q, index) => (
                    <div
                        key={q.id}
                        className={cn(
                            "rounded-xl border bg-white p-6 shadow-sm transition-all",
                            answers[q.id] !== undefined ? "border-green-300" : "border-gray-200"
                        )}
                    >
                        <div className="flex items-start gap-4">
                            <span className={cn(
                                "flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold flex-shrink-0",
                                answers[q.id] !== undefined ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"
                            )}>
                                {index + 1}
                            </span>
                            <div className="flex-1">
                                <p className="text-gray-900 font-medium mb-4">{q.question}</p>

                                {q.type === "mcq" && q.options && (
                                    <div className="space-y-2">
                                        {q.options.map((option, optIdx) => (
                                            <label
                                                key={optIdx}
                                                className={cn(
                                                    "flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all",
                                                    answers[q.id] === optIdx
                                                        ? "border-blue-500 bg-blue-50"
                                                        : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                                                )}
                                            >
                                                <input
                                                    type="radio"
                                                    name={`question-${q.id}`}
                                                    value={optIdx}
                                                    checked={answers[q.id] === optIdx}
                                                    onChange={() => handleAnswerChange(q.id, optIdx)}
                                                    className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                                                />
                                                <span className="text-gray-700">{option}</span>
                                            </label>
                                        ))}
                                    </div>
                                )}

                                {q.type === "text" && (
                                    <textarea
                                        placeholder="Type your answer here..."
                                        value={(answers[q.id] as string) || ""}
                                        onChange={(e) => handleAnswerChange(q.id, e.target.value)}
                                        className="w-full rounded-lg border border-gray-300 p-3 text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 resize-none min-h-[100px]"
                                    />
                                )}
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Fixed Submit Bar */}
            <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 shadow-lg md:pl-72">
                <div className="max-w-4xl mx-auto flex items-center justify-between">
                    <p className="text-sm text-gray-500">
                        {answeredCount === totalQuestions ? (
                            <span className="flex items-center gap-2 text-green-600">
                                <CheckCircle className="h-4 w-4" />
                                All questions answered!
                            </span>
                        ) : (
                            `${totalQuestions - answeredCount} question(s) remaining`
                        )}
                    </p>
                    <button
                        onClick={handleSubmit}
                        className="rounded-lg bg-blue-600 px-8 py-3 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 transition-all"
                    >
                        Submit Quiz
                    </button>
                </div>
            </div>
        </div>
    );
}
