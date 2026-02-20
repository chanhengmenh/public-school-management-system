"use client";

import React from "react";
import { homeClassAnalytics } from "@/data/home-class-analytics";
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
    LineChart,
    Line,
    ReferenceLine
} from "recharts";
import {
    Calculator,
    TrendingUp,
    TrendingDown,
    BarChart3,
    PieChart,
    Users,
    Activity
} from "lucide-react";

export default function AnalyticsPage() {
    const { overallStats, subjectPerformance, gradeDistribution, monthlyTrend, quantiles } = homeClassAnalytics;

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                        <BarChart3 className="w-6 h-6 text-blue-600" />
                        Cross-Subject Analytics
                    </h1>
                    <p className="text-gray-500">Comprehensive academic performance report for Class 10-A</p>
                </div>
            </div>

            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-sm font-medium text-gray-500">Class Average</p>
                            <h3 className="text-2xl font-bold text-gray-900 mt-1">{overallStats.averageScore}</h3>
                        </div>
                        <div className="p-2 bg-blue-50 rounded-lg text-blue-600">
                            <Calculator className="w-5 h-5" />
                        </div>
                    </div>
                    <div className="mt-4 flex items-center text-sm">
                        <span className="text-green-600 flex items-center gap-1 font-medium">
                            <TrendingUp className="w-4 h-4" />
                            +2.4%
                        </span>
                        <span className="text-gray-500 ml-2">vs last month</span>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-sm font-medium text-gray-500">Median Score</p>
                            <h3 className="text-2xl font-bold text-gray-900 mt-1">{overallStats.medianScore}</h3>
                        </div>
                        <div className="p-2 bg-purple-50 rounded-lg text-purple-600">
                            <BarChart3 className="w-5 h-5" />
                        </div>
                    </div>
                    <div className="mt-4 text-xs text-gray-500">
                        Middle value of entire class distribution
                    </div>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-sm font-medium text-gray-500">Mode Score</p>
                            <h3 className="text-2xl font-bold text-gray-900 mt-1">{overallStats.modeScore}</h3>
                        </div>
                        <div className="p-2 bg-indigo-50 rounded-lg text-indigo-600">
                            <Activity className="w-5 h-5" />
                        </div>
                    </div>
                    <div className="mt-4 text-xs text-gray-500">
                        Most frequent score in the class
                    </div>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-sm font-medium text-gray-500">Std. Deviation</p>
                            <h3 className="text-2xl font-bold text-gray-900 mt-1">{overallStats.standardDeviation}</h3>
                        </div>
                        <div className="p-2 bg-orange-50 rounded-lg text-orange-600">
                            <PieChart className="w-5 h-5" />
                        </div>
                    </div>
                    <div className="mt-4 text-xs text-gray-500">
                        Measure of score variability
                    </div>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-sm font-medium text-gray-500">Passing Rate</p>
                            <h3 className="text-2xl font-bold text-gray-900 mt-1">{overallStats.passingRate}%</h3>
                        </div>
                        <div className="p-2 bg-green-50 rounded-lg text-green-600">
                            <Users className="w-5 h-5" />
                        </div>
                    </div>
                    <div className="mt-4 flex items-center text-sm">
                        <span className="text-green-600 flex items-center gap-1 font-medium">
                            <TrendingUp className="w-4 h-4" />
                            +1.2%
                        </span>
                        <span className="text-gray-500 ml-2">vs last month</span>
                    </div>
                </div>
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Grade Distribution */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                    <div className="mb-6">
                        <h3 className="text-lg font-semibold text-gray-900">Grade Distribution</h3>
                        <p className="text-sm text-gray-500">Number of students per grade range</p>
                    </div>
                    <div className="h-80 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={gradeDistribution}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                <XAxis dataKey="label" />
                                <YAxis />
                                <Tooltip
                                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                    cursor={{ fill: '#f3f4f6' }}
                                />
                                <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={40} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Subject Performance Comparison */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                    <div className="mb-6">
                        <h3 className="text-lg font-semibold text-gray-900">Subject Performance</h3>
                        <p className="text-sm text-gray-500">Average score comparison across subjects</p>
                    </div>
                    <div className="h-80 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={subjectPerformance} layout="vertical" margin={{ left: 20 }}>
                                <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
                                <XAxis type="number" domain={[0, 100]} />
                                <YAxis dataKey="subject" type="category" width={100} tick={{ fontSize: 12 }} />
                                <Tooltip
                                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                    cursor={{ fill: '#f3f4f6' }}
                                />
                                <Bar dataKey="average" fill="#8884d8" radius={[0, 4, 4, 0]} barSize={20} />
                                <ReferenceLine x={overallStats.averageScore} stroke="red" strokeDasharray="3 3" label={{ value: 'Avg', fill: 'red', fontSize: 10 }} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* Quantiles & Trends */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Monthly Trend */}
                <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                    <div className="mb-6">
                        <h3 className="text-lg font-semibold text-gray-900">Performance Trend</h3>
                        <p className="text-sm text-gray-500">Monthly class average progression</p>
                    </div>
                    <div className="h-80 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={monthlyTrend}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                <XAxis dataKey="month" />
                                <YAxis domain={[60, 100]} />
                                <Tooltip
                                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                />
                                <Line type="monotone" dataKey="average" stroke="#2563eb" strokeWidth={3} dot={{ r: 4, fill: "#2563eb", strokeWidth: 2, stroke: "#fff" }} activeDot={{ r: 6 }} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Quantiles / Top & Bottom Performers */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                    <div className="mb-6">
                        <h3 className="text-lg font-semibold text-gray-900">Quantiles Analysis</h3>
                        <p className="text-sm text-gray-500">Top and Bottom 10% Performers</p>
                    </div>

                    <div className="space-y-6">
                        <div>
                            <h4 className="text-sm font-semibold text-green-700 bg-green-50 px-3 py-1 rounded inline-block mb-3">Top 10%</h4>
                            <div className="space-y-3">
                                {quantiles.top10Percent.map((student, idx) => (
                                    <div key={idx} className="flex justify-between items-center text-sm border-b border-gray-50 pb-2 last:border-0">
                                        <span className="font-medium text-gray-800">{student.name}</span>
                                        <span className="font-bold text-gray-900">{student.average}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div>
                            <h4 className="text-sm font-semibold text-red-700 bg-red-50 px-3 py-1 rounded inline-block mb-3">Bottom 10%</h4>
                            <div className="space-y-3">
                                {quantiles.bottom10Percent.map((student, idx) => (
                                    <div key={idx} className="flex justify-between items-center text-sm border-b border-gray-50 pb-2 last:border-0">
                                        <span className="font-medium text-gray-800">{student.name}</span>
                                        <span className="font-bold text-gray-900">{student.average}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
