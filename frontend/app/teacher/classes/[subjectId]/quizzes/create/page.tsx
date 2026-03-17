'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import {
    ArrowLeft, CheckCircle2, Circle, Clock, Copy, Trash2, Plus,
    Settings2, Eye, Check, AlertTriangle, FileText,
    X, CheckSquare, Zap, BookOpen, Calculator, Calendar, ToggleLeft
} from 'lucide-react';

// --- Type Definitions ---
type QuestionType = 'MCQ' | 'TF' | 'Writing';

interface Option {
    id: string;
    text: string;
}

interface Question {
    id: string;
    type: QuestionType;
    text: string;
    points: number;
    options?: Option[];
    correctAnswer?: string;
    rubric?: string;
}

interface QuizSettings {
    title: string;
    description: string;
    subject: string;
    chapter: string;
    openDate: string;
    closeDate: string;
    timeLimit: string;
    assignedClasses: string[];
    autoGrade: boolean;
    shuffleQ: boolean;
    shuffleA: boolean;
    showScore: boolean;
}

// --- Dummy Data ---
const DUMMY_CLASSES = [
    { id: '11a', name: '11A', students: 32 },
    { id: '11b', name: '11B', students: 30 },
    { id: '11c', name: '11C', students: 28 },
    { id: '12a', name: 'Adv 12A', students: 25 },
];

const INITIAL_QUESTIONS: Question[] = [];

const INITIAL_SETTINGS: QuizSettings = {
    title: '',
    description: '',
    subject: '',
    chapter: '',
    openDate: '',
    closeDate: '',
    timeLimit: '45',
    assignedClasses: [],
    autoGrade: true,
    shuffleQ: false,
    shuffleA: false,
    showScore: false
};

export default function QuizCreatorWizard() {
    const params = useParams();
    const router = useRouter();
    const searchParams = useSearchParams();
    const subjectId = params?.subjectId as string;
    const editId = searchParams?.get('edit');

    // --- State Management ---
    const [currentStep, setCurrentStep] = useState(1);
    const [quizSettings, setQuizSettings] = useState<QuizSettings>(INITIAL_SETTINGS);
    const [questions, setQuestions] = useState<Question[]>(INITIAL_QUESTIONS);

    // UI States
    const [activeQuestionId, setActiveQuestionId] = useState<string | null>('q1');
    const [isPreviewOpen, setIsPreviewOpen] = useState(false);
    const [isPublishOpen, setIsPublishOpen] = useState(false);
    const [toastMessage, setToastMessage] = useState<string | null>(null);

    // Refs for scrolling to new questions
    const questionRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});

    // --- Helpers ---
    const showToast = (msg: string) => {
        setToastMessage(msg);
        setTimeout(() => setToastMessage(null), 3000);
    };

    const updateSetting = (key: keyof QuizSettings, value: string | boolean | string[]) => {
        setQuizSettings(prev => ({ ...prev, [key]: value }));
    };

    const toggleClass = (classId: string) => {
        setQuizSettings(prev => {
            const current = prev.assignedClasses;
            if (current.includes(classId)) {
                return { ...prev, assignedClasses: current.filter(id => id !== classId) };
            } else {
                return { ...prev, assignedClasses: [...current, classId] };
            }
        });
    };

    // --- Question Handlers ---
    const addQuestion = (type: QuestionType) => {
        const id = `q${Date.now()}`;
        const newQ: Question = {
            id,
            type,
            text: '',
            points: 5,
            options: type === 'MCQ' ? [{ id: `o${Date.now()}1`, text: '' }, { id: `o${Date.now()}2`, text: '' }] : undefined,
            correctAnswer: undefined,
            rubric: type === 'Writing' ? '' : undefined
        };
        setQuestions(prev => [...prev, newQ]);
        setActiveQuestionId(id);
        showToast(`Added ${type} Question`);

        // Scroll to new question after render
        setTimeout(() => {
            questionRefs.current[id]?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }, 100);
    };

    const deleteQuestion = (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        if (questions.length <= 1) {
            showToast('Warning: Quiz must have at least one question.');
            return;
        }
        setQuestions(prev => prev.filter(q => q.id !== id));
        if (activeQuestionId === id) setActiveQuestionId(null);
        showToast('Question deleted');
    };

    const duplicateQuestion = (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        const target = questions.find(q => q.id === id);
        if (target) {
            const newId = `q${Date.now()}`;
            const dup = {
                ...target,
                id: newId,
                options: target.options ? target.options.map(o => ({ ...o, id: `o${Date.now()}${Math.random()}` })) : undefined
            };
            setQuestions(prev => [...prev, dup]);
            setActiveQuestionId(newId);
            showToast('Question duplicated');
            setTimeout(() => {
                questionRefs.current[newId]?.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }, 100);
        }
    };

    const updateQuestion = (id: string, field: keyof Question, value: string | number) => {
        setQuestions(prev => prev.map(q => q.id === id ? { ...q, [field]: value } : q));
    };

    const updateOption = (qId: string, oId: string, text: string) => {
        setQuestions(prev => prev.map(q => {
            if (q.id === qId && q.options) {
                return { ...q, options: q.options.map(o => o.id === oId ? { ...o, text } : o) };
            }
            return q;
        }));
    };

    const addOption = (qId: string) => {
        setQuestions(prev => prev.map(q => {
            if (q.id === qId && q.options && q.options.length < 6) {
                return { ...q, options: [...q.options, { id: `o${Date.now()}`, text: '' }] };
            }
            return q;
        }));
    };

    const deleteOption = (qId: string, oId: string) => {
        setQuestions(prev => prev.map(q => {
            if (q.id === qId && q.options && q.options.length > 2) {
                // If the deleted option was the correct answer, clear it
                const isCorrect = q.correctAnswer === oId;
                return {
                    ...q,
                    options: q.options.filter(o => o.id !== oId),
                    correctAnswer: isCorrect ? undefined : q.correctAnswer
                };
            }
            return q;
        }));
    };

    const setCorrectAnswer = (qId: string, answerIdOrVal: string) => {
        setQuestions(prev => prev.map(q => q.id === qId ? { ...q, correctAnswer: answerIdOrVal } : q));
    };

    // --- Derived Math ---
    const totalPoints = questions.reduce((sum, q) => sum + (Number(q.points) || 0), 0);
    const autoGradedCount = questions.filter(q => q.type === 'MCQ' || q.type === 'TF').length;
    const manualGradedCount = questions.filter(q => q.type === 'Writing').length;

    // --- Pre-Publish Checklist Logic ---
    const hasTitle = quizSettings.title.trim().length > 0;
    const hasQuestions = questions.length > 0;
    const allQuestionsHaveAnswers = questions.every(q => {
        if (q.type === 'Writing') return true;
        return q.correctAnswer !== undefined && !!q.correctAnswer;
    });
    const hasClasses = quizSettings.assignedClasses.length > 0;
    const hasDates = !!quizSettings.openDate && !!quizSettings.closeDate;
    const isReadyToPublish = hasTitle && hasQuestions && allQuestionsHaveAnswers && hasClasses && hasDates;

    // Load existing quiz for editing
    useEffect(() => {
        if (editId && typeof window !== 'undefined') {
            const storedQuizzes = localStorage.getItem(`quizzes-${subjectId}`);
            if (storedQuizzes) {
                const quizzes = JSON.parse(storedQuizzes);
                const quizToEdit = quizzes.find((q: any) => q.id === editId);
                if (quizToEdit) {
                    if (quizToEdit.settings) setQuizSettings(quizToEdit.settings);
                    else {
                        setQuizSettings({
                            ...INITIAL_SETTINGS,
                            title: quizToEdit.title,
                            description: quizToEdit.description,
                            openDate: quizToEdit.startDate,
                            closeDate: quizToEdit.dueDate,
                            timeLimit: quizToEdit.timeLimit.replace(' mins', ''),
                        });
                    }
                    if (quizToEdit.questions) setQuestions(quizToEdit.questions);
                }
            }
        }
    }, [editId, subjectId]);

    // --- Render Components ---
    const renderTopbar = () => (
        <div className="sticky top-0 z-40 bg-white border-b border-slate-200 shadow-sm w-full">
            <div className="max-w-7xl mx-auto px-6 lg:px-8 h-16 flex items-center justify-between">
                {/* Left */}
                <div className="flex items-center gap-4 w-1/4">
                    <Link href={`/teacher/classes/${subjectId || ''}/quizzes`} className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors">
                        <ArrowLeft className="w-4 h-4" />
                    </Link>
                    <h1 className="text-lg font-bold font-serif text-slate-900 truncate" title={quizSettings.title || 'Untitled Quiz'}>
                        {quizSettings.title || 'Untitled Quiz'}
                    </h1>
                </div>

                {/* Center Steps */}
                <div className="flex items-center justify-center gap-2 w-2/4">
                    {[
                        { num: 1, label: 'Setup' },
                        { num: 2, label: 'Questions' },
                        { num: 3, label: 'Review' }
                    ].map((step, idx) => (
                        <React.Fragment key={step.num}>
                            <button
                                onClick={() => setCurrentStep(step.num)}
                                className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-bold transition-colors ${currentStep === step.num ? 'bg-indigo-100 text-indigo-700' :
                                    currentStep > step.num ? 'text-green-600' : 'text-slate-400 hover:text-slate-600'
                                    }`}
                            >
                                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${currentStep === step.num ? 'bg-indigo-600 text-white' :
                                    currentStep > step.num ? 'bg-green-600 text-white' : 'bg-slate-200 text-slate-500'
                                    }`}>
                                    {currentStep > step.num ? <Check className="w-3.5 h-3.5" /> : step.num}
                                </div>
                                {step.label}
                            </button>
                            {idx < 2 && (
                                <div className={`w-8 h-px ${currentStep > idx + 1 ? 'bg-green-500' : 'bg-slate-200'}`}></div>
                            )}
                        </React.Fragment>
                    ))}
                </div>

                {/* Right Actions */}
                <div className="flex items-center justify-end gap-3 w-1/4">
                    <button
                        onClick={() => showToast('Draft saved successfully')}
                        className="text-sm font-bold text-slate-500 hover:text-slate-800 transition-colors px-3 py-2"
                    >
                        Save Draft
                    </button>
                    <button
                        onClick={() => setIsPreviewOpen(true)}
                        className="text-sm font-bold text-indigo-600 hover:text-indigo-800 transition-colors flex items-center gap-1.5 px-3 py-2 border border-indigo-200 bg-indigo-50 rounded-lg shadow-sm"
                    >
                        <Eye className="w-4 h-4" /> Preview
                    </button>
                    {currentStep < 3 ? (
                        <button
                            onClick={() => setCurrentStep(currentStep + 1)}
                            className="bg-slate-900 hover:bg-slate-800 text-white px-5 py-2.5 rounded-xl text-sm font-bold transition-colors shadow-sm whitespace-nowrap"
                        >
                            Next Step →
                        </button>
                    ) : (
                        <button
                            onClick={() => {
                                if (isReadyToPublish) setIsPublishOpen(true);
                                else showToast('Please complete checklist to publish');
                            }}
                            className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all shadow-sm whitespace-nowrap ${isReadyToPublish ? 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-500/20' : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                                }`}
                        >
                            Publish Quiz
                        </button>
                    )}
                </div>
            </div>
            {/* Progress Bar */}
            <div className="w-full bg-slate-100 h-1">
                <div
                    className="h-full bg-indigo-600 transition-all duration-300 ease-in-out"
                    style={{ width: `${(currentStep / 3) * 100}%` }}
                ></div>
            </div>
        </div>
    );

    const renderStep1 = () => (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 w-full">
            {/* Left Col */}
            <div className="lg:col-span-2 flex flex-col gap-6">
                <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
                    <h2 className="text-xl font-bold font-serif text-slate-900 mb-5">Quiz Details</h2>
                    <div className="flex flex-col gap-5">
                        <div className="flex flex-col gap-2">
                            <label className="text-sm font-bold text-slate-700">Quiz Title <span className="text-red-500">*</span></label>
                            <input
                                type="text"
                                value={quizSettings.title}
                                onChange={(e) => updateSetting('title', e.target.value)}
                                placeholder="e.g. Mid-Term Physics Assessment"
                                className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-medium text-slate-900 placeholder:font-normal"
                            />
                        </div>
                        <div className="flex flex-col gap-2">
                            <label className="text-sm font-bold text-slate-700">Description</label>
                            <textarea
                                value={quizSettings.description}
                                onChange={(e) => updateSetting('description', e.target.value)}
                                placeholder="Provide instructions or context for students..."
                                rows={3}
                                className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-medium text-slate-900 placeholder:font-normal resize-none"
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="flex flex-col gap-2">
                                <label className="text-sm font-bold text-slate-700">Subject</label>
                                <input
                                    type="text"
                                    value={quizSettings.subject}
                                    onChange={(e) => updateSetting('subject', e.target.value)}
                                    placeholder="e.g. Physics"
                                    className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-medium text-slate-900 placeholder:font-normal"
                                />
                            </div>
                            <div className="flex flex-col gap-2">
                                <label className="text-sm font-bold text-slate-700">Chapter / Topic</label>
                                <input
                                    type="text"
                                    value={quizSettings.chapter}
                                    onChange={(e) => updateSetting('chapter', e.target.value)}
                                    placeholder="e.g. Kinematics"
                                    className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-medium text-slate-900 placeholder:font-normal"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
                    <div className="flex justify-between items-center mb-5">
                        <h2 className="text-xl font-bold font-serif text-slate-900">Assign Classes</h2>
                        <span className="text-sm font-bold text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full">{quizSettings.assignedClasses.length} Selected</span>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                        {DUMMY_CLASSES.map(cls => (
                            <button
                                key={cls.id}
                                onClick={() => toggleClass(cls.id)}
                                className={`flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all ${quizSettings.assignedClasses.includes(cls.id)
                                    ? 'border-indigo-600 bg-indigo-50 lg:shadow-md'
                                    : 'border-slate-100 bg-white hover:border-slate-300'
                                    }`}
                            >
                                <div className={`w-8 h-8 rounded-full mb-2 flex items-center justify-center ${quizSettings.assignedClasses.includes(cls.id) ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-400'}`}>
                                    {quizSettings.assignedClasses.includes(cls.id) ? <Check className="w-4 h-4" /> : <BookOpen className="w-4 h-4" />}
                                </div>
                                <span className="font-bold text-slate-900">{cls.name}</span>
                                <span className="text-xs font-medium text-slate-500 mt-0.5">{cls.students} students</span>
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Right Col */}
            <div className="lg:col-span-1 flex flex-col gap-6">
                <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
                    <h2 className="text-lg font-bold font-serif text-slate-900 mb-5 flex items-center gap-2">
                        <Calendar className="w-5 h-5 text-indigo-500" /> Timing
                    </h2>
                    <div className="flex flex-col gap-4">
                        <div className="flex flex-col gap-2">
                            <label className="text-sm font-bold text-slate-700">Open Date & Time <span className="text-red-500">*</span></label>
                            <input
                                type="datetime-local"
                                value={quizSettings.openDate}
                                onChange={(e) => updateSetting('openDate', e.target.value)}
                                className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-medium text-slate-900"
                            />
                        </div>
                        <div className="flex flex-col gap-2">
                            <label className="text-sm font-bold text-slate-700">Close Date & Time <span className="text-red-500">*</span></label>
                            <input
                                type="datetime-local"
                                value={quizSettings.closeDate}
                                onChange={(e) => updateSetting('closeDate', e.target.value)}
                                className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-medium text-slate-900"
                            />
                        </div>
                        <div className="flex flex-col gap-2 pt-2 border-t border-slate-100">
                            <label className="text-sm font-bold text-slate-700">Time Limit</label>
                            <select
                                value={quizSettings.timeLimit}
                                onChange={(e) => updateSetting('timeLimit', e.target.value)}
                                className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-medium text-slate-900 appearance-none bg-white"
                            >
                                <option value="No limit">No limit</option>
                                <option value="15">15 minutes</option>
                                <option value="30">30 minutes</option>
                                <option value="45">45 minutes</option>
                                <option value="60">60 minutes</option>
                                <option value="90">90 minutes</option>
                                <option value="120">120 minutes</option>
                            </select>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
                    <h2 className="text-lg font-bold font-serif text-slate-900 mb-5 flex items-center gap-2">
                        <Settings2 className="w-5 h-5 text-indigo-500" /> Advanced Options
                    </h2>
                    <div className="flex flex-col gap-4">
                        {[
                            { key: 'autoGrade', label: 'Auto-grade MCQ/TF', desc: 'Saves time by automatically scoring objective questions' },
                            { key: 'shuffleQ', label: 'Shuffle Questions', desc: 'Randomize question order for each student' },
                            { key: 'shuffleA', label: 'Shuffle Answers', desc: 'Randomize MCQ options order' },
                            { key: 'showScore', label: 'Show Score Immediately', desc: 'Students see objective scored right after submission' }
                        ].map(opt => (
                            <div key={opt.key} className="flex items-start justify-between gap-4 py-2">
                                <div className="flex flex-col w-3/4">
                                    <span className="text-sm font-bold text-slate-800">{opt.label}</span>
                                    <span className="text-xs text-slate-500 mt-0.5">{opt.desc}</span>
                                </div>
                                <button
                                    onClick={() => updateSetting(opt.key as keyof QuizSettings, !quizSettings[opt.key as keyof QuizSettings])}
                                    className={`shrink-0 w-11 h-6 rounded-full flex items-center transition-colors px-1 ${quizSettings[opt.key as keyof QuizSettings] ? 'bg-indigo-600 justify-end' : 'bg-slate-200 justify-start'
                                        }`}
                                >
                                    <div className="w-4 h-4 bg-white rounded-full shadow-sm"></div>
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );

    const renderStep2 = () => (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 w-full relative">
            {/* Left Col: Questions List */}
            <div className="lg:col-span-3 flex flex-col gap-6 pb-24">
                {questions.map((q, index) => (
                    <div
                        key={q.id}
                        ref={el => { questionRefs.current[q.id] = el; }}
                        onClick={() => setActiveQuestionId(q.id)}
                        className={`bg-white rounded-2xl border-2 transition-all shadow-sm ${activeQuestionId === q.id ? 'border-indigo-400 ring-4 ring-indigo-50/50' : 'border-slate-200 hover:border-slate-300'
                            }`}
                    >
                        {/* Question Header */}
                        <div className="flex items-center justify-between p-4 border-b border-slate-100 bg-slate-50/50 rounded-t-2xl">
                            <div className="flex items-center gap-3">
                                <span className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-700 font-bold flex items-center justify-center text-sm">
                                    {index + 1}
                                </span>
                                <span className={`px-2.5 py-1 text-xs font-bold uppercase tracking-wider rounded-md ${q.type === 'MCQ' ? 'bg-blue-100 text-blue-700' :
                                    q.type === 'TF' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                                    }`}>
                                    {q.type === 'MCQ' ? 'MCQ' : q.type === 'Writing' ? 'Written' : 'True/False'}
                                </span>
                            </div>
                            <div className="flex items-center gap-4">
                                <div className="flex items-center gap-2">
                                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Points</span>
                                    <input
                                        type="number"
                                        min="1"
                                        value={q.points}
                                        onChange={(e) => updateQuestion(q.id, 'points', Number(e.target.value))}
                                        className="w-16 h-8 text-center border border-slate-200 rounded-lg text-sm font-bold text-slate-900 focus:outline-none focus:border-indigo-500 bg-white"
                                    />
                                </div>
                                <div className="w-px h-6 bg-slate-200"></div>
                                <div className="flex items-center gap-1">
                                    <button onClick={(e) => duplicateQuestion(q.id, e)} className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors" title="Duplicate">
                                        <Copy className="w-4 h-4" />
                                    </button>
                                    <button onClick={(e) => deleteQuestion(q.id, e)} className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Delete">
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Question Body */}
                        <div className="p-6 flex flex-col gap-6">
                            <input
                                type="text"
                                value={q.text}
                                onChange={(e) => updateQuestion(q.id, 'text', e.target.value)}
                                placeholder="Type your question here..."
                                className="w-full text-lg font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none bg-transparent"
                            />

                            {/* Option Rendering by Type */}
                            {q.type === 'MCQ' && (
                                <div className="flex flex-col gap-3">
                                    {q.options?.map((opt, oIdx) => (
                                        <div key={opt.id} className="flex items-center gap-3">
                                            <button
                                                onClick={() => setCorrectAnswer(q.id, opt.id)}
                                                className={`w-6 h-6 rounded-full shrink-0 flex items-center justify-center transition-colors border-2 ${q.correctAnswer === opt.id ? 'bg-emerald-500 border-emerald-500 text-white' : 'border-slate-300 hover:border-slate-400 text-transparent'
                                                    }`}
                                            >
                                                <Check className="w-3.5 h-3.5" />
                                            </button>
                                            <input
                                                type="text"
                                                value={opt.text}
                                                onChange={(e) => updateOption(q.id, opt.id, e.target.value)}
                                                placeholder={`Option ${oIdx + 1}`}
                                                className={`flex-1 border rounded-xl px-4 py-2.5 text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500/20 ${q.correctAnswer === opt.id ? 'bg-emerald-50/50 border-emerald-200 font-medium text-slate-900' : 'bg-white border-slate-200 text-slate-700'
                                                    }`}
                                            />
                                            <button
                                                onClick={() => deleteOption(q.id, opt.id)}
                                                disabled={q.options && q.options.length <= 2}
                                                className="w-8 h-8 flex items-center justify-center text-slate-300 hover:text-red-500 disabled:opacity-30 disabled:hover:text-slate-300 transition-colors shrink-0"
                                            >
                                                <X className="w-5 h-5" />
                                            </button>
                                        </div>
                                    ))}
                                    {q.options && q.options.length < 6 && (
                                        <button
                                            onClick={() => addOption(q.id)}
                                            className="mt-2 text-sm font-bold text-indigo-600 hover:text-indigo-800 transition-colors flex items-center gap-1.5 w-fit ml-9"
                                        >
                                            <Plus className="w-4 h-4" /> Add Option
                                        </button>
                                    )}
                                </div>
                            )}

                            {q.type === 'TF' && (
                                <div className="flex gap-4">
                                    {['True', 'False'].map(val => (
                                        <button
                                            key={val}
                                            onClick={() => setCorrectAnswer(q.id, val)}
                                            className={`flex-1 py-4 rounded-xl border-2 font-bold text-lg transition-all ${q.correctAnswer === val
                                                ? 'bg-emerald-50 border-emerald-500 text-emerald-700 shadow-sm'
                                                : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
                                                }`}
                                        >
                                            {val}
                                        </button>
                                    ))}
                                </div>
                            )}

                            {q.type === 'Writing' && (
                                <div className="flex flex-col gap-4">
                                    <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 flex items-start gap-2 text-sm text-amber-800">
                                        <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                                        <span>This question type <strong>cannot be auto-graded</strong>. You will need to manually review and score student submissions.</span>
                                    </div>
                                    <div className="flex flex-col gap-2">
                                        <label className="text-sm font-bold text-slate-700">Grading Rubric / Reference Notes (Optional)</label>
                                        <textarea
                                            value={q.rubric || ''}
                                            onChange={(e) => updateQuestion(q.id, 'rubric', e.target.value)}
                                            placeholder="Add notes for yourself to reference when grading..."
                                            rows={2}
                                            className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 bg-slate-50 transition-all font-medium text-slate-800 resize-none"
                                        />
                                    </div>
                                </div>
                            )}

                        </div>
                    </div>
                ))}

                {/* Action Bar (Sticky Bottom) */}
                <div className="bg-white/90 backdrop-blur-md border border-slate-200 rounded-2xl p-4 shadow-xl sticky bottom-6 flex items-center justify-center gap-4 z-10 w-fit mx-auto">
                    <span className="text-sm font-bold text-slate-500 mr-2">Add New:</span>
                    <button onClick={() => addQuestion('MCQ')} className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-xl text-sm font-bold border border-blue-200 transition-colors">
                        <CheckSquare className="w-4 h-4" /> Multiple Choice
                    </button>
                    <button onClick={() => addQuestion('TF')} className="flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded-xl text-sm font-bold border border-emerald-200 transition-colors">
                        <ToggleLeft className="w-4 h-4" /> True / False
                    </button>
                    <button onClick={() => addQuestion('Writing')} className="flex items-center gap-2 px-4 py-2 bg-amber-50 text-amber-700 hover:bg-amber-100 rounded-xl text-sm font-bold border border-amber-200 transition-colors">
                        <FileText className="w-4 h-4" /> Written
                    </button>
                </div>
            </div>

            {/* Right Col: Summary Sidebar */}
            <div className="lg:col-span-1 hidden lg:block relative">
                <div className="sticky top-24 flex flex-col gap-4">
                    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                        <div className="bg-slate-900 p-4 text-center">
                            <h3 className="text-white font-bold font-serif text-lg">Quiz Summary</h3>
                        </div>
                        <div className="p-5 flex flex-col gap-5">
                            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                                <span className="text-sm font-medium text-slate-500">Total Questions</span>
                                <span className="text-xl font-bold text-slate-900">{questions.length}</span>
                            </div>
                            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                                <span className="text-sm font-medium text-slate-500">Total Points</span>
                                <span className="text-xl font-bold text-indigo-600">{totalPoints}</span>
                            </div>
                            <div className="flex flex-col gap-2 pt-1 border-b border-slate-100 pb-4">
                                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Grading Breakdown</span>
                                <div className="flex items-center justify-between">
                                    <span className="text-sm font-medium text-slate-700 flex items-center gap-2"><Zap className="w-3.5 h-3.5 text-yellow-500" /> Auto-graded</span>
                                    <span className="text-sm font-bold text-slate-900">{autoGradedCount}</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-sm font-medium text-slate-700 flex items-center gap-2"><FileText className="w-3.5 h-3.5 text-slate-400" /> Manual</span>
                                    <span className="text-sm font-bold text-slate-900">{manualGradedCount}</span>
                                </div>
                            </div>
                            <div className="flex items-center justify-between bg-slate-50 p-3 rounded-xl border border-slate-100">
                                <span className="text-sm font-bold text-slate-600 flex items-center gap-2"><Clock className="w-4 h-4 text-slate-400" /> Est. Time</span>
                                <span className="text-sm font-bold text-slate-900">{quizSettings.timeLimit === 'No limit' ? 'None' : quizSettings.timeLimit + 'm'}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );

    const renderStep3 = () => (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 w-full max-w-5xl mx-auto">
            {/* Left Col: Review Summary */}
            <div className="lg:col-span-2 flex flex-col gap-6">
                <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm relative overflow-hidden">
                    {/* Decorative bg badge */}
                    <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50 rounded-bl-[100px] flex items-start justify-end p-6 z-0">
                        <CheckCircle2 className="w-8 h-8 text-indigo-200" />
                    </div>

                    <div className="relative z-10">
                        <h2 className="text-3xl font-bold font-serif text-slate-900 mb-2">{quizSettings.title || 'Untitled Quiz'}</h2>
                        <div className="flex items-center gap-3 text-sm font-bold text-indigo-600 mb-6">
                            <span>{quizSettings.subject || 'No Subject'}</span>
                            <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                            <span>{quizSettings.chapter || 'No Chapter'}</span>
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
                            <div className="flex flex-col gap-1 p-3 bg-slate-50 rounded-xl border border-slate-100">
                                <span className="text-xs font-bold text-slate-500 uppercase">Questions</span>
                                <span className="text-lg font-bold text-slate-900">{questions.length}</span>
                            </div>
                            <div className="flex flex-col gap-1 p-3 bg-slate-50 rounded-xl border border-slate-100">
                                <span className="text-xs font-bold text-slate-500 uppercase">Points</span>
                                <span className="text-lg font-bold text-slate-900">{totalPoints}</span>
                            </div>
                            <div className="flex flex-col gap-1 p-3 bg-slate-50 rounded-xl border border-slate-100">
                                <span className="text-xs font-bold text-slate-500 uppercase">Time Limit</span>
                                <span className="text-lg font-bold text-slate-900">{quizSettings.timeLimit === 'No limit' ? 'None' : quizSettings.timeLimit + 'm'}</span>
                            </div>
                            <div className="flex flex-col gap-1 p-3 bg-slate-50 rounded-xl border border-slate-100">
                                <span className="text-xs font-bold text-slate-500 uppercase">Auto-Grade</span>
                                <span className="text-lg font-bold text-slate-900">{quizSettings.autoGrade ? 'ON' : 'OFF'}</span>
                            </div>
                        </div>

                        <div className="flex flex-col gap-4 border-t border-slate-100 pt-6">
                            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-6">
                                <span className="text-sm font-bold text-slate-500 w-32">Assigned To:</span>
                                <div className="flex flex-wrap gap-2">
                                    {quizSettings.assignedClasses.length > 0 ? (
                                        quizSettings.assignedClasses.map(cId => {
                                            const name = DUMMY_CLASSES.find(d => d.id === cId)?.name;
                                            return <span key={cId} className="px-3 py-1 bg-indigo-100 text-indigo-800 text-xs font-bold rounded-full">{name}</span>;
                                        })
                                    ) : (
                                        <span className="text-red-500 text-sm font-medium">No classes assigned</span>
                                    )}
                                </div>
                            </div>
                            <div className="flex flex-col sm:flex-row gap-2 sm:gap-6">
                                <span className="text-sm font-bold text-slate-500 w-32 shrink-0">Window:</span>
                                <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 text-sm font-medium text-slate-800 flex-wrap">
                                    {quizSettings.openDate ? new Date(quizSettings.openDate).toLocaleString('en-GB', { dateStyle: 'medium', timeStyle: 'short' }) : <span className="text-red-500 font-bold">Missing Date</span>}
                                    <ArrowLeft className="w-3 h-3 text-slate-400 rotate-180 hidden sm:block" />
                                    <span className="text-slate-400 sm:hidden">to</span>
                                    {quizSettings.closeDate ? new Date(quizSettings.closeDate).toLocaleString('en-GB', { dateStyle: 'medium', timeStyle: 'short' }) : <span className="text-red-500 font-bold">Missing Date</span>}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {manualGradedCount > 0 && (
                    <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 flex items-start gap-4 shadow-sm">
                        <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center shrink-0">
                            <AlertTriangle className="w-5 h-5 text-amber-600" />
                        </div>
                        <div className="flex flex-col">
                            <h4 className="text-sm font-bold text-amber-900">Manual Grading Required</h4>
                            <p className="text-sm text-amber-700 mt-1">You have included <strong>{manualGradedCount} Written question(s)</strong>. Final scores will not be released automatically; you must review and grade these submissions manually.</p>
                        </div>
                    </div>
                )}
            </div>

            {/* Right Col: Checklist & Publish */}
            <div className="lg:col-span-1 flex flex-col gap-6">
                <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
                    <h3 className="text-lg font-bold font-serif text-slate-900 mb-4 border-b border-slate-100 pb-3">Pre-Publish Checklist</h3>
                    <div className="flex flex-col gap-3">
                        <div className="flex items-center gap-3">
                            {hasTitle ? <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" /> : <Circle className="w-5 h-5 text-slate-300 shrink-0" />}
                            <span className={`text-sm font-bold ${hasTitle ? 'text-slate-700' : 'text-slate-400'}`}>Quiz Title set</span>
                        </div>
                        <div className="flex items-center gap-3">
                            {hasQuestions ? <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" /> : <Circle className="w-5 h-5 text-slate-300 shrink-0" />}
                            <span className={`text-sm font-bold ${hasQuestions ? 'text-slate-700' : 'text-slate-400'}`}>Has questions ({questions.length})</span>
                        </div>
                        <div className="flex items-start gap-3">
                            {allQuestionsHaveAnswers ? <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" /> : <Circle className="w-5 h-5 text-red-400 shrink-0" />}
                            <span className={`text-sm font-bold ${allQuestionsHaveAnswers ? 'text-slate-700' : 'text-red-500'}`}>All objective answers configured</span>
                        </div>
                        <div className="flex items-center gap-3">
                            {hasClasses ? <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" /> : <Circle className="w-5 h-5 text-red-400 shrink-0" />}
                            <span className={`text-sm font-bold ${hasClasses ? 'text-slate-700' : 'text-red-500'}`}>Classes assigned</span>
                        </div>
                        <div className="flex items-center gap-3">
                            {hasDates ? <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" /> : <Circle className="w-5 h-5 text-red-400 shrink-0" />}
                            <span className={`text-sm font-bold ${hasDates ? 'text-slate-700' : 'text-red-500'}`}>Dates configured</span>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
                    <h3 className="text-sm font-bold text-slate-900 mb-4">Notifications</h3>
                    <div className="flex flex-col gap-4">
                        <div className="flex items-start justify-between gap-4">
                            <span className="text-sm font-bold text-slate-700">Notify students immediately</span>
                            <button className="shrink-0 w-11 h-6 rounded-full flex items-center transition-colors px-1 bg-indigo-600 justify-end">
                                <div className="w-4 h-4 bg-white rounded-full shadow-sm"></div>
                            </button>
                        </div>
                        <div className="flex items-start justify-between gap-4">
                            <span className="text-sm font-bold text-slate-700">Send 1-day reminder</span>
                            <button className="shrink-0 w-11 h-6 rounded-full flex items-center transition-colors px-1 bg-slate-200 justify-start">
                                <div className="w-4 h-4 bg-white rounded-full shadow-sm"></div>
                            </button>
                        </div>
                        <div className="flex items-start justify-between gap-4">
                            <span className="text-sm font-bold text-slate-700">Alert teacher on submission</span>
                            <button className="shrink-0 w-11 h-6 rounded-full flex items-center transition-colors px-1 bg-indigo-600 justify-end">
                                <div className="w-4 h-4 bg-white rounded-full shadow-sm"></div>
                            </button>
                        </div>
                    </div>
                </div>

                <div className="flex flex-col gap-3">
                    <button
                        onClick={() => setIsPublishOpen(true)}
                        disabled={!isReadyToPublish}
                        className={`w-full py-4 rounded-xl text-base font-bold transition-all shadow-sm ${isReadyToPublish ? 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-500/20 active:scale-[0.98]' : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                            }`}
                    >
                        Publish Quiz Now
                    </button>
                    <button
                        onClick={() => showToast('Draft saved securely')}
                        className="w-full py-3 rounded-xl border border-slate-200 bg-white text-slate-600 font-bold hover:bg-slate-50 transition-colors"
                    >
                        Save as Draft
                    </button>
                </div>

                {!isReadyToPublish && (
                    <p className="text-xs text-center text-red-500 font-medium px-4">Complete the checklist above to unlock publishing.</p>
                )}
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col relative pb-10">
            {renderTopbar()}

            <main className="max-w-7xl mx-auto w-full px-6 lg:px-8 mt-10">
                {currentStep === 1 && renderStep1()}
                {currentStep === 2 && renderStep2()}
                {currentStep === 3 && renderStep3()}
            </main>

            {/* Modals & Toasts */}
            {toastMessage && (
                <div className="fixed bottom-6 right-6 bg-slate-900 text-white px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-3 z-[100] animate-in slide-in-from-bottom-5 fade-in duration-300">
                    <CheckCircle2 className="w-5 h-5 text-green-400" />
                    <span className="font-bold text-sm tracking-wide">{toastMessage}</span>
                </div>
            )}

            {/* Preview Modal */}
            {isPreviewOpen && (
                <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 py-10">
                    <div className="bg-white w-full max-w-3xl h-full rounded-2xl shadow-2xl flex flex-col overflow-hidden relative">
                        <div className="p-6 bg-slate-50 border-b border-slate-200 flex justify-between items-center shrink-0">
                            <div className="flex flex-col">
                                <span className="text-xs font-bold text-slate-500 uppercase flex items-center gap-1.5"><Eye className="w-3.5 h-3.5" /> Student Preview Mode</span>
                                <h2 className="text-xl font-bold font-serif text-slate-900 mt-1">{quizSettings.title || 'Untitled Quiz'}</h2>
                            </div>
                            <button onClick={() => setIsPreviewOpen(false)} className="w-10 h-10 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-500 hover:bg-slate-100 transition-colors">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <div className="flex-1 overflow-y-auto p-8 flex flex-col gap-10 bg-white">
                            {/* Student Info Banner */}
                            <div className="flex items-center gap-6 pb-6 border-b border-slate-100 w-full mb-4">
                                <div className="flex items-center gap-2 text-sm text-slate-600"><Clock className="w-4 h-4 text-slate-400" /> <span className="font-bold">{quizSettings.timeLimit === 'No limit' ? 'None' : quizSettings.timeLimit + ' mins'}</span></div>
                                <div className="flex items-center gap-2 text-sm text-slate-600"><FileText className="w-4 h-4 text-slate-400" /> <span className="font-bold">{questions.length} questions</span></div>
                                <div className="flex items-center gap-2 text-sm text-slate-600"><Calculator className="w-4 h-4 text-slate-400" /> <span className="font-bold">{totalPoints} points</span></div>
                            </div>

                            {questions.map((q, i) => (
                                <div key={q.id} className="flex flex-col gap-5">
                                    <div className="flex gap-4">
                                        <span className="text-lg font-bold text-indigo-600">{i + 1}.</span>
                                        <div className="flex flex-col gap-1 flex-1">
                                            <p className="text-lg font-medium text-slate-900">{q.text || <span className="text-slate-300 italic">Empty Question</span>}</p>
                                            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">{q.points} Points</span>
                                        </div>
                                    </div>

                                    <div className="pl-8">
                                        {q.type === 'MCQ' && (
                                            <div className="flex flex-col gap-3">
                                                {q.options?.map(opt => (
                                                    <div key={opt.id} className="flex items-center gap-3 p-3 rounded-xl border border-slate-200 bg-slate-50">
                                                        <div className="w-5 h-5 rounded-full border-2 border-slate-300 bg-white"></div>
                                                        <span className="text-sm font-medium text-slate-700">{opt.text || '...'}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                        {q.type === 'TF' && (
                                            <div className="flex gap-3">
                                                {['True', 'False'].map(val => (
                                                    <div key={val} className="flex-1 flex items-center justify-center py-3 rounded-xl border border-slate-200 bg-slate-50">
                                                        <span className="text-sm font-bold text-slate-700">{val}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                        {q.type === 'Writing' && (
                                            <textarea
                                                disabled
                                                rows={5}
                                                placeholder="Student types their answer here..."
                                                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 text-sm resize-none"
                                            ></textarea>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* Publish Confirmation Modal */}
            {isPublishOpen && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white max-w-md w-full rounded-3xl p-8 flex flex-col items-center text-center shadow-2xl relative">
                        <button onClick={() => setIsPublishOpen(false)} className="absolute top-4 right-4 p-2 text-slate-400 hover:bg-slate-100 rounded-full transition-colors">
                            <X className="w-5 h-5" />
                        </button>
                        <div className="w-20 h-20 bg-indigo-100 rounded-full flex items-center justify-center mb-6">
                            <Zap className="w-10 h-10 text-indigo-600" />
                        </div>
                        <h2 className="text-2xl font-bold font-serif text-slate-900 mb-2">Publish Quiz?</h2>
                        <p className="text-sm text-slate-600 mb-6">You are about to publish <strong>&quot;{quizSettings.title}&quot;</strong> to {quizSettings.assignedClasses.length} assigned classes.</p>

                        <div className="w-full bg-slate-50 rounded-xl p-4 flex flex-col gap-3 mb-8 text-left border border-slate-100">
                            <div className="flex items-center justify-between text-sm">
                                <span className="font-bold text-slate-500">Total Students:</span>
                                <span className="font-bold text-slate-900">
                                    {quizSettings.assignedClasses.reduce((sum, cId) => {
                                        const c = DUMMY_CLASSES.find(d => d.id === cId);
                                        return sum + (c ? c.students : 0);
                                    }, 0)}
                                </span>
                            </div>
                            <div className="flex flex-col gap-1 text-sm bg-indigo-50 p-3 rounded-lg border border-indigo-100">
                                <span className="font-bold text-indigo-700">Goes Live:</span>
                                <span className="font-bold text-indigo-900">{new Date(quizSettings.openDate).toLocaleString('en-GB', { dateStyle: 'full', timeStyle: 'short' })}</span>
                            </div>
                        </div>

                        <div className="flex gap-3 w-full">
                            <button
                                onClick={() => setIsPublishOpen(false)}
                                className="flex-1 py-3.5 rounded-xl border-2 border-slate-200 text-slate-600 font-bold hover:bg-slate-50 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => {
                                    setIsPublishOpen(false);

                                    const newQuiz = {
                                        id: editId || `q${Date.now()}`,
                                        title: quizSettings.title,
                                        description: quizSettings.description || 'Custom quiz created by teacher.',
                                        publishDate: new Date().toISOString(),
                                        startDate: quizSettings.openDate,
                                        dueDate: quizSettings.closeDate,
                                        timeLimit: quizSettings.timeLimit === 'No limit' ? 'No limit' : `${quizSettings.timeLimit} mins`,
                                        status: 'Active',
                                        completedCount: 0,
                                        settings: quizSettings,
                                        questions: questions
                                    };

                                    const storedQuizzes = localStorage.getItem(`quizzes-${subjectId}`);
                                    const initialQuizzes = [
                                        { id: 'q1', title: 'Mid-Term Physics Assessment', description: 'Comprehensive test covering Chapter 1 to 4.', publishDate: '2025-05-20T08:00', startDate: '2025-05-21T09:00', dueDate: '2025-05-21T10:30', timeLimit: '90 mins', status: 'Active', completedCount: 28 },
                                        { id: 'q2', title: 'Kinematics Pop Quiz', description: 'Quick check on recent kinematics concepts.', publishDate: '2025-05-28T08:00', startDate: '2025-05-29T14:00', dueDate: '2025-05-29T14:45', timeLimit: '45 mins', status: 'Scheduled', completedCount: 0 },
                                        { id: 'q3', title: 'Newton\'s Laws Checkpoint', description: 'Standard evaluation for Chapter 3.', publishDate: '2025-06-05T08:00', startDate: '2025-06-06T10:00', dueDate: '2025-06-06T11:00', timeLimit: '60 mins', status: 'Draft', completedCount: 0 }
                                    ];

                                    let currentQuizzes = storedQuizzes ? JSON.parse(storedQuizzes) : initialQuizzes;
                                    if (editId) {
                                        const existingIndex = currentQuizzes.findIndex((q: any) => q.id === editId);
                                        if (existingIndex >= 0) {
                                            newQuiz.completedCount = currentQuizzes[existingIndex].completedCount;
                                            currentQuizzes[existingIndex] = newQuiz;
                                        } else {
                                            currentQuizzes = [newQuiz, ...currentQuizzes];
                                        }
                                    } else {
                                        currentQuizzes = [newQuiz, ...currentQuizzes];
                                    }

                                    localStorage.setItem(`quizzes-${subjectId}`, JSON.stringify(currentQuizzes));

                                    router.push(`/teacher/classes/${subjectId}?tab=Quiz&published=true`);
                                }}
                                className="flex-1 py-3.5 rounded-xl bg-indigo-600 text-white font-bold hover:bg-indigo-700 shadow-sm shadow-indigo-500/20 active:scale-95 transition-all"
                            >
                                Confirm Publish
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
