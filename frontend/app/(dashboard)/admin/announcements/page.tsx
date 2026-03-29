'use client';

import React, { useState } from 'react';
import PageHeader from '@/components/layouts/PageHeader';
import { Plus, X, Trash2, Info, AlertTriangle, AlertOctagon, CheckCircle2, Megaphone, Users, CalendarDays, ChevronDown } from 'lucide-react';

// --- Types ---
type Severity = 'info' | 'warning' | 'urgent';
type Status = 'active' | 'scheduled' | 'expired';
type FilterTab = 'All' | 'Active' | 'Scheduled' | 'Expired';

interface Announcement {
    id: string;
    title: string;
    message: string;
    severity: Severity;
    audience: string;
    startDate: string;
    endDate: string;
    status: Status;
}

// --- Constants ---
const AUDIENCES = ['Global', 'All Teachers', 'All Students', 'Grade 10A', 'Grade 10B', 'Grade 11A', 'Grade 12A'];

const SEVERITY_CONFIG: Record<Severity, { label: string; icon: React.ElementType; bg: string; border: string; text: string; badge: string }> = {
    info: { label: 'Info', icon: Info, bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-700', badge: 'bg-blue-100 text-blue-700' },
    warning: { label: 'Warning', icon: AlertTriangle, bg: 'bg-amber-50', border: 'border-amber-200', text: 'text-amber-700', badge: 'bg-amber-100 text-amber-700' },
    urgent: { label: 'Urgent', icon: AlertOctagon, bg: 'bg-red-50', border: 'border-red-200', text: 'text-red-700', badge: 'bg-red-100 text-red-700' },
};

const STATUS_CONFIG: Record<Status, { label: string; dot: string; bg: string; text: string }> = {
    active: { label: 'Active', dot: 'bg-emerald-500', bg: 'bg-emerald-50', text: 'text-emerald-700' },
    scheduled: { label: 'Scheduled', dot: 'bg-blue-500', bg: 'bg-blue-50', text: 'text-blue-700' },
    expired: { label: 'Expired', dot: 'bg-slate-400', bg: 'bg-slate-100', text: 'text-slate-500' },
};

// --- Helpers ---
const formatDate = (dateStr: string) => {
    const d = new Date(dateStr + 'T00:00:00');
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

const getToday = () => new Date().toISOString().split('T')[0];

const deriveStatus = (startDate: string, endDate: string): Status => {
    const today = getToday();
    if (endDate < today) return 'expired';
    if (startDate <= today) return 'active';
    return 'scheduled';
};

// --- Mock Data ---
const MOCK_ANNOUNCEMENTS: Announcement[] = [
    {
        id: 'ann_1', title: 'Water Main Break — Block B Closed',
        message: 'Due to an emergency pipe burst, Block B classrooms (Room 201–210) are closed until further notice. All affected classes will be relocated to the library and auditorium.',
        severity: 'urgent', audience: 'Global', startDate: '2026-03-17', endDate: '2026-03-20', status: 'active',
    },
    {
        id: 'ann_2', title: 'Mr. Sok Absent — Substitute Assigned',
        message: 'Mr. Sok will be absent on March 19. Ms. Chea will cover Grade 10A Mathematics and Grade 10B Physics.',
        severity: 'warning', audience: 'Grade 10A', startDate: '2026-03-19', endDate: '2026-03-19', status: 'scheduled',
    },
    {
        id: 'ann_3', title: 'Water Festival Holiday — School Closed',
        message: 'School will be closed from April 13–16 for the Khmer New Year / Water Festival. Classes resume on April 17.',
        severity: 'info', audience: 'Global', startDate: '2026-04-13', endDate: '2026-04-16', status: 'scheduled',
    },
    {
        id: 'ann_4', title: 'Last Day for Semester 2 Registration',
        message: 'All students must complete their Semester 2 elective registration by March 10. Late submissions will not be accepted.',
        severity: 'info', audience: 'All Students', startDate: '2026-03-01', endDate: '2026-03-10', status: 'expired',
    },
];

// --- Main Page ---
export default function AdminAnnouncementsPage() {
    const [announcements, setAnnouncements] = useState<Announcement[]>(MOCK_ANNOUNCEMENTS);
    const [filterTab, setFilterTab] = useState<FilterTab>('All');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [toast, setToast] = useState({ show: false, msg: '' });

    // Form state
    const [form, setForm] = useState({
        title: '', message: '', severity: 'info' as Severity, audience: 'Global',
        startDate: getToday(), endDate: getToday(),
    });

    const triggerToast = (msg: string) => {
        setToast({ show: true, msg });
        setTimeout(() => setToast({ show: false, msg: '' }), 3500);
    };

    const openCreateModal = () => {
        setForm({ title: '', message: '', severity: 'info', audience: 'Global', startDate: getToday(), endDate: getToday() });
        setIsModalOpen(true);
    };

    const handleCreate = () => {
        if (!form.title.trim() || !form.message.trim()) return;
        const newAnn: Announcement = {
            id: `ann_${Date.now()}`,
            ...form,
            status: deriveStatus(form.startDate, form.endDate),
        };
        setAnnouncements([newAnn, ...announcements]);
        setIsModalOpen(false);
        triggerToast('Announcement published successfully');
    };

    const handleDelete = (id: string) => {
        setAnnouncements(announcements.filter(a => a.id !== id));
        triggerToast('Announcement deleted');
    };

    // Filtered list
    const filtered = filterTab === 'All' ? announcements : announcements.filter(a => a.status === filterTab.toLowerCase());

    // Tab counts
    const counts = {
        All: announcements.length,
        Active: announcements.filter(a => a.status === 'active').length,
        Scheduled: announcements.filter(a => a.status === 'scheduled').length,
        Expired: announcements.filter(a => a.status === 'expired').length,
    };

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
            <PageHeader 
                title="Announcements"
                subtitle="Broadcast alerts, notices, and schedule overlays to students and staff"
            />

            <div className="flex-1 px-8 py-8 md:py-0 mb-8 max-w-5xl mx-auto w-full flex flex-col gap-6">

                {/* Actions Row */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    {/* Filter Tabs */}
                    <div className="flex items-center gap-1 bg-white rounded-xl border border-slate-200 p-1 shadow-sm self-start">
                        {(['All', 'Active', 'Scheduled', 'Expired'] as FilterTab[]).map(tab => (
                            <button
                                key={tab}
                                onClick={() => setFilterTab(tab)}
                                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${filterTab === tab ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-50'}`}
                            >
                                {tab}
                                <span className={`text-[11px] font-bold px-1.5 py-0.5 rounded-md ${filterTab === tab ? 'bg-indigo-500 text-white' : 'bg-slate-100 text-slate-500'}`}>
                                    {counts[tab]}
                                </span>
                            </button>
                        ))}
                    </div>

                    <button onClick={openCreateModal} className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-bold flex items-center gap-2 transition-colors shadow-sm shrink-0">
                        <Plus className="w-4 h-4" /> New Announcement
                    </button>
                </div>

                {/* Announcement Cards */}
                <div className="flex flex-col gap-4">
                    {filtered.length === 0 ? (
                        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-12 flex flex-col items-center text-center">
                            <div className="w-14 h-14 rounded-full bg-slate-100 flex items-center justify-center mb-4">
                                <Megaphone className="w-6 h-6 text-slate-400" />
                            </div>
                            <h3 className="text-base font-bold text-slate-900 mb-1">No announcements</h3>
                            <p className="text-sm text-slate-500">There are no {filterTab.toLowerCase()} announcements to display.</p>
                        </div>
                    ) : filtered.map(ann => {
                        const sevConfig = SEVERITY_CONFIG[ann.severity];
                        const statConfig = STATUS_CONFIG[ann.status];
                        const SevIcon = sevConfig.icon;

                        return (
                            <div key={ann.id} className={`bg-white rounded-2xl border shadow-sm overflow-hidden transition-all hover:shadow-md ${ann.status === 'expired' ? 'opacity-60' : ''}`}>
                                <div className="flex">
                                    {/* Severity Stripe */}
                                    <div className={`w-1.5 shrink-0 ${ann.severity === 'urgent' ? 'bg-red-500' : ann.severity === 'warning' ? 'bg-amber-400' : 'bg-blue-400'}`} />

                                    <div className="flex-1 p-5 flex gap-4">
                                        {/* Icon */}
                                        <div className={`w-10 h-10 rounded-xl ${sevConfig.bg} ${sevConfig.border} border flex items-center justify-center shrink-0 mt-0.5`}>
                                            <SevIcon className={`w-5 h-5 ${sevConfig.text}`} />
                                        </div>

                                        {/* Content */}
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-start justify-between gap-3">
                                                <div className="min-w-0">
                                                    <div className="flex items-center gap-2.5 mb-1">
                                                        <h3 className="text-[15px] font-bold text-slate-900 truncate">{ann.title}</h3>
                                                        <span className={`inline-flex items-center gap-1.5 text-[11px] font-bold px-2 py-0.5 rounded-full shrink-0 ${statConfig.bg} ${statConfig.text}`}>
                                                            <span className={`w-1.5 h-1.5 rounded-full ${statConfig.dot} ${ann.status === 'active' ? 'animate-pulse' : ''}`}></span>
                                                            {statConfig.label}
                                                        </span>
                                                        <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full shrink-0 ${sevConfig.badge}`}>
                                                            {sevConfig.label}
                                                        </span>
                                                    </div>
                                                    <p className="text-sm text-slate-600 leading-relaxed line-clamp-2">{ann.message}</p>
                                                </div>

                                                <button onClick={() => handleDelete(ann.id)} className="text-slate-400 hover:text-red-500 hover:bg-red-50 p-2 rounded-lg transition-colors shrink-0" title="Delete">
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>

                                            {/* Meta Row */}
                                            <div className="flex items-center gap-4 mt-3">
                                                <span className="text-xs font-medium text-slate-500 flex items-center gap-1.5">
                                                    <Users className="w-3.5 h-3.5 text-slate-400" /> {ann.audience}
                                                </span>
                                                <span className="text-xs font-medium text-slate-500 flex items-center gap-1.5">
                                                    <CalendarDays className="w-3.5 h-3.5 text-slate-400" />
                                                    {formatDate(ann.startDate)} — {formatDate(ann.endDate)}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* ========== CREATE MODAL ========== */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden animate-in zoom-in-95">
                        {/* Header */}
                        <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center">
                            <h2 className="text-lg font-bold text-slate-900">New Announcement</h2>
                            <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:bg-slate-100 p-1.5 rounded-full transition-colors"><X className="w-5 h-5" /></button>
                        </div>

                        {/* Body */}
                        <div className="p-6 flex flex-col gap-5 bg-slate-50/50 max-h-[70vh] overflow-y-auto">

                            {/* Title */}
                            <div>
                                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 block">Title</label>
                                <input type="text" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="e.g. Room 304 AC Broken" className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 shadow-sm" />
                            </div>

                            {/* Message */}
                            <div>
                                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 block">Message</label>
                                <textarea value={form.message} onChange={e => setForm({ ...form, message: e.target.value })} placeholder="Describe the announcement details..." rows={3} className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 shadow-sm resize-none" />
                            </div>

                            {/* Severity Radio */}
                            <div>
                                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 block">Severity</label>
                                <div className="flex gap-2">
                                    {(['info', 'warning', 'urgent'] as Severity[]).map(sev => {
                                        const cfg = SEVERITY_CONFIG[sev];
                                        const SIcon = cfg.icon;
                                        const isSelected = form.severity === sev;
                                        return (
                                            <button key={sev} onClick={() => setForm({ ...form, severity: sev })} className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold border-2 transition-all ${isSelected ? `${cfg.bg} ${cfg.border} ${cfg.text}` : 'border-slate-200 bg-white text-slate-500 hover:border-slate-300'}`}>
                                                <SIcon className="w-4 h-4" /> {cfg.label}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Audience */}
                            <div className="relative">
                                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 block">Audience</label>
                                <select value={form.audience} onChange={e => setForm({ ...form, audience: e.target.value })} className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm font-medium text-slate-900 appearance-none focus:outline-none focus:ring-2 focus:ring-indigo-500/20 shadow-sm">
                                    {AUDIENCES.map(a => <option key={a} value={a}>{a}</option>)}
                                </select>
                                <ChevronDown className="absolute right-3 bottom-3 w-4 h-4 text-slate-400 pointer-events-none" />
                            </div>

                            {/* Dates */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 block">Start Date</label>
                                    <input type="date" value={form.startDate} onChange={e => setForm({ ...form, startDate: e.target.value })} className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 shadow-sm" />
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 block">End Date</label>
                                    <input type="date" value={form.endDate} onChange={e => setForm({ ...form, endDate: e.target.value })} className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 shadow-sm" />
                                </div>
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="p-6 border-t border-slate-100 bg-white flex justify-end gap-3">
                            <button onClick={() => setIsModalOpen(false)} className="px-5 py-2.5 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-100 transition-colors">Cancel</button>
                            <button onClick={handleCreate} disabled={!form.title.trim() || !form.message.trim()} className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white px-6 py-2.5 rounded-xl text-sm font-bold shadow-sm transition-colors flex items-center gap-2">
                                <Megaphone className="w-4 h-4" /> Publish Announcement
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Toast */}
            {toast.show && (
                <div className="fixed bottom-6 right-6 z-[60] bg-slate-900 text-white px-5 py-3 rounded-xl shadow-xl flex items-center gap-2 animate-in slide-in-from-bottom-5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span className="text-sm font-bold">{toast.msg}</span>
                </div>
            )}
        </div>
    );
}
