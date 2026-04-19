'use client';

import React, { useState, useEffect, useCallback } from 'react';
import PageHeader from '@/components/layouts/PageHeader';
import { Plus, X, Trash2, Pin, CheckCircle2, Megaphone, Users, Clock, ChevronDown, Loader2, AlertCircle } from 'lucide-react';
import { announcementsApi } from '@/lib/api/announcements';
import type { Announcement, AnnouncementTarget, AnnouncementCreate } from '@/lib/api/announcements';

const TARGET_LABELS: Record<AnnouncementTarget, string> = {
  all: 'Everyone',
  teachers: 'All Teachers',
  students: 'All Students',
};

function timeAgo(dateStr: string): string {
  const now = new Date();
  const date = new Date(dateStr);
  const diffMs = now.getTime() - date.getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export default function AdminAnnouncementsPage() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState({ show: false, msg: '' });

  // Form state
  const [form, setForm] = useState<AnnouncementCreate>({
    title: '',
    body: '',
    target: 'all',
    is_pinned: false,
  });

  const triggerToast = (msg: string) => {
    setToast({ show: true, msg });
    setTimeout(() => setToast({ show: false, msg: '' }), 3500);
  };

  const loadAnnouncements = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await announcementsApi.list();
      setAnnouncements(data);
    } catch {
      setError('Failed to load announcements.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAnnouncements();
  }, [loadAnnouncements]);

  const openCreateModal = () => {
    setForm({ title: '', body: '', target: 'all', is_pinned: false });
    setIsModalOpen(true);
  };

  const handleCreate = async () => {
    if (!form.title.trim() || !form.body.trim()) return;
    setSaving(true);
    try {
      await announcementsApi.create(form);
      await loadAnnouncements();
      setIsModalOpen(false);
      triggerToast('Announcement published successfully');
    } catch {
      triggerToast('Failed to create announcement');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await announcementsApi.delete(id);
      setAnnouncements(prev => prev.filter(a => a.id !== id));
      triggerToast('Announcement deleted');
    } catch {
      triggerToast('Failed to delete announcement');
    }
  };

  const handleTogglePin = async (ann: Announcement) => {
    try {
      await announcementsApi.update(ann.id, { is_pinned: !ann.is_pinned });
      setAnnouncements(prev =>
        prev.map(a => a.id === ann.id ? { ...a, is_pinned: !a.is_pinned } : a)
      );
    } catch {
      triggerToast('Failed to update announcement');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col">
        <PageHeader title="Announcements" subtitle="Broadcast alerts and notices to students and staff" />
        <div className="flex items-center justify-center flex-1">
          <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col">
        <PageHeader title="Announcements" subtitle="Broadcast alerts and notices to students and staff" />
        <div className="flex flex-col items-center justify-center flex-1 gap-2">
          <AlertCircle className="h-8 w-8 text-red-400" />
          <p className="text-slate-500">{error}</p>
          <button onClick={loadAnnouncements} className="mt-2 px-4 py-2 bg-orange-500 text-white rounded-lg text-sm hover:bg-orange-600">
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <PageHeader
        title="Announcements"
        subtitle="Broadcast alerts and notices to students and staff"
        badge={`${announcements.length} total`}
      />

      <div className="flex-1 px-8 py-8 md:py-0 mb-8 max-w-5xl mx-auto w-full flex flex-col gap-6">
        {/* Actions Row */}
        <div className="flex items-center justify-between">
          <p className="text-sm text-slate-500">
            {announcements.filter(a => a.is_pinned).length} pinned
          </p>
          <button
            onClick={openCreateModal}
            className="px-5 py-2.5 bg-orange-500 hover:bg-orange-600 text-white rounded-xl text-sm font-bold flex items-center gap-2 transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4" /> New Announcement
          </button>
        </div>

        {/* Announcement Cards */}
        <div className="flex flex-col gap-4">
          {announcements.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-12 flex flex-col items-center text-center">
              <div className="w-14 h-14 rounded-full bg-slate-100 flex items-center justify-center mb-4">
                <Megaphone className="w-6 h-6 text-slate-400" />
              </div>
              <h3 className="text-base font-bold text-slate-900 mb-1">No announcements yet</h3>
              <p className="text-sm text-slate-500">Create your first announcement to broadcast to staff and students.</p>
            </div>
          ) : (
            announcements.map(ann => (
              <div
                key={ann.id}
                className={`bg-white rounded-2xl border shadow-sm overflow-hidden transition-all hover:shadow-md ${
                  ann.is_pinned ? 'border-orange-200 ring-1 ring-orange-100' : 'border-slate-200'
                }`}
              >
                <div className="flex">
                  {/* Pin stripe */}
                  <div className={`w-1.5 shrink-0 ${ann.is_pinned ? 'bg-orange-400' : 'bg-slate-200'}`} />

                  <div className="flex-1 p-5 flex gap-4">
                    {/* Icon */}
                    <div className="w-10 h-10 rounded-xl bg-orange-50 border border-orange-200 flex items-center justify-center shrink-0 mt-0.5">
                      <Megaphone className="w-5 h-5 text-orange-600" />
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <div className="flex items-center gap-2.5 mb-1">
                            <h3 className="text-[15px] font-bold text-slate-900 truncate">{ann.title}</h3>
                            {ann.is_pinned && (
                              <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-orange-50 text-orange-600 shrink-0">
                                <Pin className="w-3 h-3" /> Pinned
                              </span>
                            )}
                            <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-500 shrink-0">
                              <Users className="w-3 h-3" /> {TARGET_LABELS[ann.target]}
                            </span>
                          </div>
                          <p className="text-sm text-slate-600 leading-relaxed line-clamp-2">{ann.body}</p>
                        </div>

                        <div className="flex items-center gap-1 shrink-0">
                          <button
                            onClick={() => handleTogglePin(ann)}
                            className={`p-2 rounded-lg transition-colors ${
                              ann.is_pinned
                                ? 'text-orange-500 hover:bg-orange-50'
                                : 'text-slate-400 hover:text-orange-500 hover:bg-orange-50'
                            }`}
                            title={ann.is_pinned ? 'Unpin' : 'Pin'}
                          >
                            <Pin className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(ann.id)}
                            className="text-slate-400 hover:text-red-500 hover:bg-red-50 p-2 rounded-lg transition-colors"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      {/* Meta Row */}
                      <div className="flex items-center gap-4 mt-3">
                        {ann.author_name && (
                          <span className="text-xs font-medium text-slate-500">
                            By {ann.author_name}
                          </span>
                        )}
                        <span className="text-xs font-medium text-slate-400 flex items-center gap-1">
                          <Clock className="w-3 h-3" /> {timeAgo(ann.created_at)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* ========== CREATE MODAL ========== */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden">
            {/* Header */}
            <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center">
              <h2 className="text-lg font-bold text-slate-900">New Announcement</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:bg-slate-100 p-1.5 rounded-full transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Body */}
            <div className="p-6 flex flex-col gap-5 bg-slate-50/50 max-h-[70vh] overflow-y-auto">
              {/* Title */}
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 block">Title</label>
                <input
                  type="text"
                  value={form.title}
                  onChange={e => setForm({ ...form, title: e.target.value })}
                  placeholder="e.g. Water Festival Holiday"
                  className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-400 shadow-sm"
                />
              </div>

              {/* Body */}
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 block">Message</label>
                <textarea
                  value={form.body}
                  onChange={e => setForm({ ...form, body: e.target.value })}
                  placeholder="Describe the announcement details..."
                  rows={4}
                  className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-400 shadow-sm resize-none"
                />
              </div>

              {/* Target */}
              <div className="relative">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 block">Target Audience</label>
                <select
                  value={form.target}
                  onChange={e => setForm({ ...form, target: e.target.value as AnnouncementTarget })}
                  className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm font-medium text-slate-900 appearance-none focus:outline-none focus:ring-2 focus:ring-orange-500/20 shadow-sm"
                >
                  <option value="all">Everyone</option>
                  <option value="teachers">All Teachers</option>
                  <option value="students">All Students</option>
                </select>
                <ChevronDown className="absolute right-3 bottom-3 w-4 h-4 text-slate-400 pointer-events-none" />
              </div>

              {/* Pin toggle */}
              <label className="flex items-center gap-2 text-sm text-slate-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.is_pinned}
                  onChange={e => setForm({ ...form, is_pinned: e.target.checked })}
                  className="accent-orange-500"
                />
                Pin this announcement to the top
              </label>
            </div>

            {/* Footer */}
            <div className="p-6 border-t border-slate-100 bg-white flex justify-end gap-3">
              <button
                onClick={() => setIsModalOpen(false)}
                className="px-5 py-2.5 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-100 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleCreate}
                disabled={!form.title.trim() || !form.body.trim() || saving}
                className="bg-orange-500 hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed text-white px-6 py-2.5 rounded-xl text-sm font-bold shadow-sm transition-colors flex items-center gap-2"
              >
                <Megaphone className="w-4 h-4" /> {saving ? 'Publishing...' : 'Publish'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast.show && (
        <div className="fixed bottom-6 right-6 z-[60] bg-slate-900 text-white px-5 py-3 rounded-xl shadow-xl flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span className="text-sm font-bold">{toast.msg}</span>
        </div>
      )}
    </div>
  );
}
