'use client';

import React, { useState, useMemo } from 'react';
import { useAuthStore } from '@/store/useAuthStore';
import { getTeacherData } from '@/lib/mock-data/teacher';
import { mockPeople10A } from '@/lib/mock-data/people';
import PageHeader from '@/components/layouts/PageHeader';
import { Card, Button } from '@/components/ui';
import { LayoutGrid, List, User, Phone, Mail, Search, AlertCircle, Users } from 'lucide-react';

type ViewMode = 'grid' | 'list';

export default function HomeClassPeoplePage() {
    const { user } = useAuthStore();
    const teacherData = getTeacherData(user?.id ?? 'teacher_001');
    const [viewMode, setViewMode] = useState<ViewMode>('grid');
    const [searchQuery, setSearchQuery] = useState('');
    const [genderFilter, setGenderFilter] = useState<'All' | 'Boy' | 'Girl'>('All');

    const filteredStudents = useMemo(() => {
        let sorted = [...mockPeople10A];
        if (searchQuery.trim() !== '') {
            const q = searchQuery.toLowerCase();
            sorted = sorted.filter(s => 
                s.name.toLowerCase().includes(q) || 
                s.studentId.toLowerCase().includes(q) ||
                s.parentName.toLowerCase().includes(q)
            );
        }
        
        if (genderFilter !== 'All') {
            sorted = sorted.filter(s => s.gender === genderFilter);
        }
        
        return sorted;
    }, [searchQuery, genderFilter]);

    const stats = useMemo(() => {
        return {
            total: mockPeople10A.length
        };
    }, []);


    return (
        <div className="min-h-screen bg-slate-50 font-sans">
            <PageHeader
                title="People"
                subtitle={`Student directory and contact info for ${teacherData?.homeClass?.name || 'your class'}`}
            />

            <div className="max-w-[1400px] mx-auto w-full px-6 lg:px-8 pb-12 pt-6">
                
                {/* ── Top Stats Grid ── */}
                <div className="flex mb-6">
                    <Card className="p-4 flex flex-col justify-center border-slate-200 shadow-sm w-full md:w-64">
                        <span className="text-sm font-medium text-slate-500 mb-1 flex items-center gap-1.5"><Users className="w-4 h-4" /> Total Students</span>
                        <span className="text-2xl font-bold text-slate-900">{stats.total}</span>
                    </Card>
                </div>

                {/* ── Controls Section ── */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 w-full sm:w-auto">
                        <select
                            value={genderFilter}
                            onChange={(e) => setGenderFilter(e.target.value as 'All' | 'Boy' | 'Girl')}
                            className="block w-full sm:w-32 pl-3 pr-8 py-2 text-sm border border-slate-300 rounded-md bg-white text-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 shadow-sm appearance-none cursor-pointer"
                            style={{ backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`, backgroundPosition: `right 0.5rem center`, backgroundRepeat: `no-repeat`, backgroundSize: `1.5em 1.5em` }}
                        >
                            <option value="All">All Genders</option>
                            <option value="Boy">Boys</option>
                            <option value="Girl">Girls</option>
                        </select>
                    
                        <div className="relative w-full sm:w-80">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Search className="h-4 w-4 text-slate-400" />
                        </div>
                        <input
                            type="text"
                            placeholder="Search name, ID, or parent..."
                            className="block w-full pl-10 pr-3 py-2 border border-slate-300 rounded-md leading-5 bg-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm shadow-sm transition-colors"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                </div>

                <div className="flex items-center gap-2 bg-white border border-slate-200 p-1 rounded-md shadow-sm shrink-0">
                        <button 
                            className={`p-1.5 rounded flex items-center justify-center transition-colors ${viewMode === 'grid' ? 'bg-slate-100 text-slate-900 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                            onClick={() => setViewMode('grid')}
                            title="Grid View"
                        >
                            <LayoutGrid className="w-4 h-4" />
                        </button>
                        <button 
                            className={`p-1.5 rounded flex items-center justify-center transition-colors ${viewMode === 'list' ? 'bg-slate-100 text-slate-900 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                            onClick={() => setViewMode('list')}
                            title="List View"
                        >
                            <List className="w-4 h-4" />
                        </button>
                    </div>
                </div>

                {/* ── View Container ── */}
                {filteredStudents.length === 0 ? (
                    <Card className="p-16 flex flex-col items-center justify-center text-center bg-white border-dashed border-2 border-slate-200 shadow-none mt-8">
                        <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-6">
                            <Search className="w-10 h-10 text-slate-400" />
                        </div>
                        <h3 className="text-xl font-bold text-slate-900 mb-3">No students found</h3>
                        <p className="text-slate-500 max-w-md">
                            We couldn't find anyone matching "{searchQuery}". Try a different search term.
                        </p>
                    </Card>
                ) : viewMode === 'grid' ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                        {filteredStudents.map(student => (
                            <Card key={student.id} className="p-0 overflow-hidden flex flex-col bg-white border-slate-200 hover:shadow-md transition-shadow">
                                <div className="p-5 flex flex-col items-center text-center border-b border-slate-100 relative">
                                    <div className="w-16 h-16 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center text-xl font-bold mb-3 shadow-inner ring-1 ring-slate-200">
                                        {student.avatar || student.name.charAt(0)}
                                    </div>
                                    <h3 className="font-bold text-slate-900 text-base leading-tight mb-1">{student.name}</h3>
                                    <span className="text-xs text-slate-500 font-medium tracking-wide">{student.studentId}</span>
                                    
                                    <div className="flex gap-4 mt-4 w-full justify-center text-xs text-slate-600">
                                        <span className="flex items-center gap-1 bg-slate-50 px-2 py-1 rounded-md border border-slate-100">
                                            {student.gender}
                                        </span>
                                        <span className="flex items-center gap-1 bg-slate-50 px-2 py-1 rounded-md border border-slate-100">
                                            DOB: {student.dob}
                                        </span>
                                    </div>
                                </div>
                                <div className="bg-slate-50/80 p-5 flex flex-col gap-3 text-sm grow">
                                    <div className="flex items-start gap-3 text-slate-700">
                                        <User className="w-4 h-4 mt-0.5 text-slate-400 shrink-0" />
                                        <div className="flex flex-col leading-tight">
                                            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-0.5">Parent / Guardian</span>
                                            <span className="font-medium text-slate-800">{student.parentName}</span>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3 text-slate-700">
                                        <Phone className="w-4 h-4 text-slate-400 shrink-0" />
                                        <span className="text-slate-600 font-medium">{student.phone}</span>
                                    </div>
                                    <div className="flex items-center gap-3 text-slate-700">
                                        <Mail className="w-4 h-4 text-slate-400 shrink-0" />
                                        <span className="text-slate-600 font-medium truncate" title={student.email}>{student.email}</span>
                                    </div>
                                </div>
                            </Card>
                        ))}
                    </div>
                ) : (
                    <Card className="p-0 overflow-hidden shadow-sm border border-slate-200 bg-white">
                        <div className="w-full overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-slate-50 border-b border-slate-200 text-[11px] uppercase tracking-wider text-slate-500 font-bold">
                                        <th className="px-5 py-4 w-[250px] border-r border-slate-200">Student</th>
                                        <th className="px-5 py-4 w-32">Gender</th>
                                        <th className="px-5 py-4 w-40">Date of Birth</th>
                                        <th className="px-5 py-4 w-56 border-l border-slate-200">Parent / Guardian</th>
                                        <th className="px-5 py-4">Contact Logic</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {filteredStudents.map(student => (
                                        <tr key={student.id} className="hover:bg-slate-50/80 transition-colors group">
                                            <td className="px-5 py-4 align-middle border-r border-slate-50">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-9 h-9 rounded-full bg-slate-200 flex items-center justify-center text-slate-600 font-bold text-xs shrink-0 shadow-inner">
                                                        {student.avatar || student.name.charAt(0)}
                                                    </div>
                                                    <div className="flex flex-col">
                                                        <span className="font-bold text-slate-900 text-sm group-hover:text-blue-600 transition-colors">{student.name}</span>
                                                        <span className="text-[11px] text-slate-500 font-medium">{student.studentId}</span>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-5 py-4 align-middle text-sm text-slate-600 font-medium">
                                                {student.gender}
                                            </td>
                                            <td className="px-5 py-4 align-middle text-sm text-slate-600">
                                                {student.dob}
                                            </td>
                                            <td className="px-5 py-4 align-middle border-l border-slate-50">
                                                <div className="flex items-center gap-2">
                                                    <User className="w-4 h-4 text-slate-400" />
                                                    <span className="font-bold text-slate-700 text-sm">{student.parentName}</span>
                                                </div>
                                            </td>
                                            <td className="px-5 py-4 align-middle">
                                                <div className="flex flex-col gap-1.5 text-sm text-slate-600">
                                                    <span className="flex items-center gap-2"><Phone className="w-3.5 h-3.5 text-slate-400" /> {student.phone}</span>
                                                    <span className="flex items-center gap-2"><Mail className="w-3.5 h-3.5 text-slate-400" /> {student.email}</span>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </Card>
                )}
            </div>
        </div>
    );
}
