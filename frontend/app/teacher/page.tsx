import { BookOpen, GraduationCap, ClipboardList, Zap, ChevronRight, AlertCircle, Megaphone } from 'lucide-react';
import Link from 'next/link';
import PageHeader from '@/components/layouts/PageHeader';

export default function TeacherDashboard() {
    return (
        <div className="min-h-screen bg-[#f4f7f9]">
            {/* 1. Page Layout & Clean Sticky Header */}
            <PageHeader
                title="Dashboard"
                subtitle="Good morning, Mr. Tan — Monday, 2 June 2025"
            />

            {/* Main Content Wrapper */}
            <div className="max-w-7xl mx-auto w-full flex flex-col px-6 lg:px-8 pb-12 space-y-6">

                {/* 2. Welcome Banner */}
                <div className="bg-[#1b263b] rounded-[2rem] p-8 md:p-10 shadow-md flex flex-col md:flex-row gap-8 items-start md:items-center justify-between relative overflow-hidden">

                    <div className="relative z-10 flex-1">
                        <h2 className="text-4xl font-bold text-white mb-2 leading-tight">Hello, Mr. Tan!</h2>
                        <p className="text-slate-300 text-lg mt-4 font-medium">
                            <span className="text-blue-400 font-bold">Check out what to do for today class!</span>
                        </p>
                    </div>

                    <div className="relative z-10 flex gap-8 md:gap-12 items-center text-right mt-4 md:mt-0">
                        <div className="flex flex-col items-center md:items-end">
                            <div className="text-3xl font-bold text-white leading-none">4</div>
                            <div className="text-[9px] uppercase font-bold text-slate-400 mt-2 tracking-widest text-[#8a99af]">CLASSES TODAY</div>
                        </div>
                        <div className="w-px h-12 bg-slate-700/50 hidden md:block"></div>
                        <div className="flex flex-col items-center md:items-end">
                            <div className="text-3xl font-bold text-white leading-none">128</div>
                            <div className="text-[9px] uppercase font-bold text-slate-400 mt-2 tracking-widest text-[#8a99af]">TOTAL STUDENTS</div>
                        </div>
                        <div className="w-px h-12 bg-slate-700/50 hidden md:block"></div>
                        <div className="flex flex-col items-center md:items-end">
                            <div className="text-3xl font-bold text-white leading-none">3</div>
                            <div className="text-[9px] uppercase font-bold text-slate-400 mt-2 tracking-widest text-[#8a99af]">PENDING GRADE</div>
                        </div>
                    </div>
                </div>

                {/* 3. Top Stats Grid (4 Cards) */}
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
                    {/* Card 1 */}
                    <div className="bg-white rounded-3xl p-6 shadow-sm flex flex-col items-center text-center hover:shadow-md transition-shadow">
                        <h3 className="text-slate-900 font-bold text-2xl mb-2">4</h3>
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-[#f0efff] text-indigo-500 flex items-center justify-center shrink-0">
                                <BookOpen className="w-5 h-5" />
                            </div>
                            <div className="text-left">
                                <p className="text-[#8a99af] text-xs font-semibold leading-snug">Subjects<br />Teaching</p>
                            </div>
                        </div>
                        <p className="text-indigo-600 text-[11px] font-bold mt-3">3 classes each</p>
                    </div>

                    {/* Card 2 */}
                    <div className="bg-white rounded-3xl p-6 shadow-sm flex flex-col items-center text-center hover:shadow-md transition-shadow">
                        <h3 className="text-slate-900 font-bold text-2xl mb-2">128</h3>
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-[#e6f7ef] text-emerald-500 flex items-center justify-center shrink-0">
                                <GraduationCap className="w-5 h-5" />
                            </div>
                            <div className="text-left">
                                <p className="text-[#8a99af] text-xs font-semibold leading-snug">Total<br />Students</p>
                            </div>
                        </div>
                        <p className="text-emerald-600 text-[11px] font-bold mt-3">↑ 4 this term</p>
                    </div>

                    {/* Card 3 */}
                    <div className="bg-white rounded-3xl p-6 shadow-sm flex flex-col items-center text-center hover:shadow-md transition-shadow">
                        <h3 className="text-slate-900 font-bold text-2xl mb-2">3</h3>
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-[#fff0e5] text-orange-500 flex items-center justify-center shrink-0">
                                <ClipboardList className="w-5 h-5" />
                            </div>
                            <div className="text-left">
                                <p className="text-[#8a99af] text-xs font-semibold leading-snug">Pending<br />Grading</p>
                            </div>
                        </div>
                        <p className="text-orange-500 text-[11px] font-bold mt-3">2 overdue</p>
                    </div>

                    {/* Card 4 */}
                    <div className="bg-white rounded-3xl p-6 shadow-sm flex flex-col items-center text-center hover:shadow-md transition-shadow">
                        <h3 className="text-slate-900 font-bold text-2xl mb-2">1</h3>
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-[#faf5ff] text-purple-600 flex items-center justify-center shrink-0">
                                <Zap className="w-5 h-5" />
                            </div>
                            <div className="text-left">
                                <p className="text-[#8a99af] text-xs font-semibold leading-snug">Active<br />Quiz</p>
                            </div>
                        </div>
                        <p className="text-purple-600 text-[11px] font-bold mt-3">Closes 4 Jun</p>
                    </div>
                </div>

                {/* 4. Main Content Grid (Split Layout) */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

                    {/* 5. Left Column: Pending Grading (lg:col-span-7) */}
                    <div className="lg:col-span-7 flex flex-col">
                        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 flex-1 overflow-hidden">
                            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
                                <h2 className="text-lg font-bold text-slate-900">Pending Grading</h2>
                                <button className="text-sm font-medium text-blue-600 hover:text-blue-700 flex items-center border border-blue-200 hover:bg-blue-50 px-3 py-1.5 rounded-lg transition-colors">
                                    View all <ChevronRight className="w-4 h-4 ml-1" />
                                </button>
                            </div>
                            <div className="flex flex-col">
                                {/* Item 1 - Overdue */}
                                <div className="p-4 border-b border-slate-50 flex items-center hover:bg-slate-50 transition-colors group cursor-pointer">
                                    <div className="w-10 h-10 rounded-full bg-red-50 text-red-500 flex items-center justify-center shrink-0">
                                        <AlertCircle className="w-5 h-5" />
                                    </div>
                                    <div className="ml-4 flex-1 min-w-0 flex flex-col justify-center">
                                        <h4 className="text-sm font-bold text-slate-900 truncate group-hover:text-blue-600 transition-colors">Unit 3: Kinematics Quiz</h4>
                                        <div className="flex items-center text-xs text-slate-500 mt-0.5">
                                            <span className="font-medium text-slate-700">Physics · Class 11A</span>
                                            <span className="mx-2">•</span>
                                            <span className="text-red-500 font-medium">Overdue since 28 May</span>
                                        </div>
                                    </div>
                                    <div className="ml-4 text-right shrink-0">
                                        <div className="text-sm font-bold text-red-600">28 / 32</div>
                                        <div className="text-[10px] text-slate-400 uppercase font-bold tracking-wider mt-0.5">SUBMITTED</div>
                                    </div>
                                </div>

                                {/* Item 2 */}
                                <div className="p-4 border-b border-slate-50 flex items-center hover:bg-slate-50 transition-colors group cursor-pointer">
                                    <div className="w-10 h-10 rounded-full bg-orange-50 text-orange-500 flex items-center justify-center shrink-0">
                                        <ClipboardList className="w-5 h-5" />
                                    </div>
                                    <div className="ml-4 flex-1 min-w-0 flex flex-col justify-center">
                                        <h4 className="text-sm font-bold text-slate-900 truncate group-hover:text-blue-600 transition-colors">Lab Report: Simple Pendulum</h4>
                                        <div className="flex items-center text-xs text-slate-500 mt-0.5">
                                            <span className="font-medium text-slate-700">Physics · Class 11B</span>
                                            <span className="mx-2">•</span>
                                            <span>Due today</span>
                                        </div>
                                    </div>
                                    <div className="ml-4 text-right shrink-0">
                                        <div className="text-sm font-bold text-slate-700">15 / 30</div>
                                        <div className="text-[10px] text-slate-400 uppercase font-bold tracking-wider mt-0.5">SUBMITTED</div>
                                    </div>
                                </div>

                                {/* Item 3 */}
                                <div className="p-4 border-b border-slate-50 flex items-center hover:bg-slate-50 transition-colors group cursor-pointer">
                                    <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-500 flex items-center justify-center shrink-0">
                                        <ClipboardList className="w-5 h-5" />
                                    </div>
                                    <div className="ml-4 flex-1 min-w-0 flex flex-col justify-center">
                                        <h4 className="text-sm font-bold text-slate-900 truncate group-hover:text-blue-600 transition-colors">Worksheet: Newton's Laws</h4>
                                        <div className="flex items-center text-xs text-slate-500 mt-0.5">
                                            <span className="font-medium text-slate-700">Physics · Class 10A</span>
                                            <span className="mx-2">•</span>
                                            <span>Due tomorrow</span>
                                        </div>
                                    </div>
                                    <div className="ml-4 text-right shrink-0">
                                        <div className="text-sm font-bold text-slate-700">32 / 32</div>
                                        <div className="text-[10px] text-slate-400 uppercase font-bold tracking-wider mt-0.5">SUBMITTED</div>
                                    </div>
                                </div>

                                {/* Item 4 */}
                                <div className="p-4 flex items-center hover:bg-slate-50 transition-colors group cursor-pointer">
                                    <div className="w-10 h-10 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center shrink-0">
                                        <ClipboardList className="w-5 h-5" />
                                    </div>
                                    <div className="ml-4 flex-1 min-w-0 flex flex-col justify-center">
                                        <h4 className="text-sm font-bold text-slate-900 truncate group-hover:text-blue-600 transition-colors">Term 1 Final Project Draft</h4>
                                        <div className="flex items-center text-xs text-slate-500 mt-0.5">
                                            <span className="font-medium text-slate-700">Physics · Class 12A</span>
                                            <span className="mx-2">•</span>
                                            <span>Due 5 Jun</span>
                                        </div>
                                    </div>
                                    <div className="ml-4 text-right shrink-0">
                                        <div className="text-sm font-bold text-slate-700">0 / 25</div>
                                        <div className="text-[10px] text-slate-400 uppercase font-bold tracking-wider mt-0.5">SUBMITTED</div>
                                    </div>
                                </div>

                            </div>
                        </div>
                    </div>

                    {/* 6. Right Column: Today's Classes & Notice (lg:col-span-5 flex flex-col gap-6) */}
                    <div className="lg:col-span-5 flex flex-col gap-6">

                        {/* Today's Classes Card */}
                        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden flex-1">
                            <div className="p-5 border-b border-slate-100">
                                <h2 className="text-lg font-bold text-slate-900 flex items-center">
                                    <span className="w-1.5 h-5 bg-blue-500 rounded-full mr-2"></span>
                                    Today's Classes
                                </h2>
                            </div>
                            <div className="flex flex-col p-2 gap-1 content-start">

                                {/* Class 1 */}
                                <div className="flex items-center p-3 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer group">
                                    <div className="w-2.5 h-2.5 rounded-full bg-blue-500 shrink-0 mx-2"></div>
                                    <div className="ml-3 flex-1 min-w-0">
                                        <h4 className="text-sm font-bold text-slate-900 truncate group-hover:text-blue-600 transition-colors">Physics — 11A</h4>
                                        <p className="text-xs text-slate-500 mt-0.5">Room 302 • 32 students</p>
                                    </div>
                                    <div className="text-right flex flex-col items-end">
                                        <div className="text-sm font-bold text-slate-900 flex items-center">
                                            8:00 AM
                                            <span className="ml-2 bg-red-100 text-red-600 text-[9px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider">NOW</span>
                                        </div>
                                        <div className="text-xs text-slate-400 mt-0.5">1 hr 30 min</div>
                                    </div>
                                </div>

                                {/* Class 2 */}
                                <div className="flex items-center p-3 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer group">
                                    <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 shrink-0 mx-2"></div>
                                    <div className="ml-3 flex-1 min-w-0">
                                        <h4 className="text-sm font-bold text-slate-900 truncate group-hover:text-blue-600 transition-colors">Physics — 11B</h4>
                                        <p className="text-xs text-slate-500 mt-0.5">Room 304 • 30 students</p>
                                    </div>
                                    <div className="text-right flex flex-col items-end">
                                        <div className="text-sm font-bold text-slate-900 flex items-center">
                                            10:30 AM
                                            <span className="ml-2 bg-orange-100 text-orange-600 text-[9px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider">NEXT</span>
                                        </div>
                                        <div className="text-xs text-slate-400 mt-0.5">1 hr 30 min</div>
                                    </div>
                                </div>

                                {/* Class 3 */}
                                <div className="flex items-center p-3 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer group opacity-60">
                                    <div className="w-2.5 h-2.5 rounded-full bg-slate-300 shrink-0 mx-2"></div>
                                    <div className="ml-3 flex-1 min-w-0">
                                        <p className="text-sm font-medium text-slate-900 truncate">Siti submitted &apos;Lab Report 3&apos;</p>
                                        <p className="text-xs text-slate-500 mt-0.5">Staff Canteen</p>
                                    </div>
                                    <div className="text-right flex flex-col items-end">
                                        <div className="text-sm font-bold text-slate-600">
                                            12:00 PM
                                        </div>
                                        <div className="text-xs text-slate-400 mt-0.5">1 hr</div>
                                    </div>
                                </div>

                                {/* Class 4 */}
                                <div className="flex items-center p-3 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer group">
                                    <div className="w-2.5 h-2.5 rounded-full bg-purple-500 shrink-0 mx-2"></div>
                                    <div className="ml-3 flex-1 min-w-0">
                                        <h4 className="text-sm font-bold text-slate-900 truncate group-hover:text-blue-600 transition-colors">Physics — 10A</h4>
                                        <p className="text-xs text-slate-500 mt-0.5">Room 201 • 32 students</p>
                                    </div>
                                    <div className="text-right flex flex-col items-end">
                                        <div className="text-sm font-bold text-slate-900">
                                            1:00 PM
                                        </div>
                                        <div className="text-xs text-slate-400 mt-0.5">2 hr</div>
                                    </div>
                                </div>

                            </div>
                        </div>

                        {/* Staff Meeting Notice Card */}
                        <div className="bg-slate-900 rounded-2xl shadow-sm p-5 border border-slate-800 relative overflow-hidden group hover:border-slate-700 transition-colors cursor-pointer shrink-0">
                            <Link href="#" className="absolute inset-0 z-20"></Link>
                            <div className="absolute top-0 right-0 w-32 h-32 bg-pink-500/10 rounded-full blur-2xl -mr-10 -mt-10 transition-all group-hover:bg-pink-500/20"></div>

                            <div className="relative z-10 flex gap-4">
                                <div className="w-10 h-10 rounded-xl bg-pink-500/20 text-pink-400 flex items-center justify-center shrink-0">
                                    <Megaphone className="w-5 h-5" />
                                </div>
                                <div>
                                    <h3 className="text-white font-bold text-sm">Staff Meeting</h3>
                                    <p className="text-slate-400 text-xs mt-1 leading-relaxed">
                                        Departmental meeting on Thursday 5 Jun, 4:00 PM in the staff room. Attendance compulsory.
                                    </p>
                                </div>
                            </div>
                        </div>

                    </div>
                </div>
            </div>
        </div>
    );
}