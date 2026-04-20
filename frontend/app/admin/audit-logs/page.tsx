'use client';

import React, { useState, useEffect, useCallback } from 'react';
import PageHeader from '@/components/layouts/PageHeader';
import { auditLogsApi, AuditLog } from '@/lib/api/audit-logs';
import { ShieldCheck, Loader2, AlertCircle, RefreshCw, ChevronDown, ChevronRight } from 'lucide-react';

const ACTION_COLORS: Record<string, string> = {
  created:        'bg-emerald-50 text-emerald-700 border-emerald-200',
  updated:        'bg-blue-50 text-blue-700 border-blue-200',
  deleted:        'bg-red-50 text-red-700 border-red-200',
  reset_password: 'bg-amber-50 text-amber-700 border-amber-200',
  imported:       'bg-purple-50 text-purple-700 border-purple-200',
  enrolled:       'bg-teal-50 text-teal-700 border-teal-200',
  unenrolled:     'bg-orange-50 text-orange-700 border-orange-200',
};

function actionBadge(action: string) {
  const cls = ACTION_COLORS[action] ?? 'bg-slate-100 text-slate-600 border-slate-200';
  return `inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold border ${cls}`;
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

const ACTIONS = ['created', 'updated', 'deleted', 'reset_password', 'imported', 'enrolled', 'unenrolled'];
const RESOURCE_TYPES = ['user', 'grade', 'enrollment', 'class', 'assignment', 'announcement'];

function PayloadDiff({ payload }: { payload: AuditLog['payload'] }) {
  if (!payload) return null;
  const { before, after } = payload;
  const keys = Array.from(new Set([...Object.keys(before ?? {}), ...Object.keys(after ?? {})]));
  if (keys.length === 0) return null;

  return (
    <div className="mt-2 text-xs font-mono bg-slate-50 border border-slate-200 rounded-lg overflow-hidden">
      <table className="w-full">
        <thead>
          <tr className="bg-slate-100 text-slate-500">
            <th className="text-left px-3 py-1.5 font-semibold w-24">Field</th>
            <th className="text-left px-3 py-1.5 font-semibold text-red-500">Before</th>
            <th className="text-left px-3 py-1.5 font-semibold text-emerald-600">After</th>
          </tr>
        </thead>
        <tbody>
          {keys.map(k => (
            <tr key={k} className="border-t border-slate-100">
              <td className="px-3 py-1.5 text-slate-600">{k}</td>
              <td className="px-3 py-1.5 text-red-500">{String(before?.[k] ?? '—')}</td>
              <td className="px-3 py-1.5 text-emerald-700">{String(after?.[k] ?? '—')}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function LogRow({ log, idx, offset }: { log: AuditLog; idx: number; offset: number }) {
  const [expanded, setExpanded] = useState(false);
  const hasPayload = log.payload && (
    Object.keys(log.payload.before ?? {}).length > 0 ||
    Object.keys(log.payload.after ?? {}).length > 0
  );

  return (
    <>
      <tr
        className={`hover:bg-slate-50 transition-colors ${hasPayload ? 'cursor-pointer' : ''}`}
        onClick={() => hasPayload && setExpanded(e => !e)}
      >
        <td className="px-4 py-3 text-slate-400">{offset + idx + 1}</td>
        <td className="px-4 py-3 font-medium text-slate-800">
          {log.actor_name ?? `#${log.actor_id}`}
        </td>
        <td className="px-4 py-3">
          <span className={actionBadge(log.action)}>{log.action}</span>
        </td>
        <td className="px-4 py-3 text-slate-600">
          <span className="font-mono text-xs bg-slate-100 px-1.5 py-0.5 rounded">{log.resource_type}</span>
          {log.resource_id != null && (
            <span className="text-slate-400 text-xs ml-1">#{log.resource_id}</span>
          )}
        </td>
        <td className="px-4 py-3 text-slate-500 max-w-xs">
          <div className="flex items-center gap-1">
            {hasPayload && (
              expanded
                ? <ChevronDown className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                : <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            )}
            <span className="truncate" title={log.detail ?? ''}>{log.detail ?? '—'}</span>
          </div>
        </td>
        <td className="px-4 py-3 text-slate-400 whitespace-nowrap text-xs">
          {formatDate(log.created_at)}
        </td>
      </tr>
      {expanded && hasPayload && (
        <tr className="bg-slate-50">
          <td colSpan={6} className="px-6 pb-4 pt-1">
            <PayloadDiff payload={log.payload} />
          </td>
        </tr>
      )}
    </>
  );
}

export default function AuditLogsPage() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionFilter, setActionFilter] = useState('');
  const [resourceFilter, setResourceFilter] = useState('');
  const [page, setPage] = useState(0);
  const pageSize = 50;

  const loadLogs = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await auditLogsApi.list({
        action: actionFilter || undefined,
        resource_type: resourceFilter || undefined,
        skip: page * pageSize,
        limit: pageSize,
      });
      setLogs(data);
    } catch {
      setError('Failed to load audit logs.');
    } finally {
      setLoading(false);
    }
  }, [actionFilter, resourceFilter, page]);

  useEffect(() => { loadLogs(); }, [loadLogs]);
  useEffect(() => { setPage(0); }, [actionFilter, resourceFilter]);

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      <PageHeader
        title="Audit Logs"
        subtitle="Track all admin actions across the system"
        badge={`${logs.length} entries`}
      />

      {/* Filters */}
      <div className="flex flex-wrap gap-3 items-center">
        <select
          value={actionFilter}
          onChange={e => setActionFilter(e.target.value)}
          className="border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 bg-white"
        >
          <option value="">All Actions</option>
          {ACTIONS.map(a => <option key={a} value={a}>{a}</option>)}
        </select>
        <select
          value={resourceFilter}
          onChange={e => setResourceFilter(e.target.value)}
          className="border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 bg-white"
        >
          <option value="">All Resources</option>
          {RESOURCE_TYPES.map(r => <option key={r} value={r}>{r}</option>)}
        </select>
        <button
          onClick={loadLogs}
          className="flex items-center gap-1.5 px-3 py-2 text-sm border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors text-slate-600"
        >
          <RefreshCw className="w-4 h-4" /> Refresh
        </button>
        <p className="text-xs text-slate-400 ml-auto">Click a row to expand before/after diff</p>
      </div>

      {/* Table */}
      <div className="border border-slate-200 rounded-2xl shadow-sm bg-white overflow-hidden">
        {loading ? (
          <div className="py-16 flex justify-center">
            <Loader2 className="h-7 w-7 animate-spin text-orange-500" />
          </div>
        ) : error ? (
          <div className="py-16 flex flex-col items-center gap-2 text-slate-500">
            <AlertCircle className="h-7 w-7 text-red-400" />
            <p>{error}</p>
            <button onClick={loadLogs} className="mt-1 px-4 py-2 bg-orange-500 text-white rounded-lg text-sm hover:bg-orange-600">Retry</button>
          </div>
        ) : logs.length === 0 ? (
          <div className="py-16 text-center text-slate-400 text-sm flex flex-col items-center gap-2">
            <ShieldCheck className="h-8 w-8 text-slate-300" />
            <p>No audit logs found.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50">
                  <th className="text-left px-4 py-3 font-semibold text-slate-600 w-10">#</th>
                  <th className="text-left px-4 py-3 font-semibold text-slate-600">Actor</th>
                  <th className="text-left px-4 py-3 font-semibold text-slate-600">Action</th>
                  <th className="text-left px-4 py-3 font-semibold text-slate-600">Resource</th>
                  <th className="text-left px-4 py-3 font-semibold text-slate-600">Detail</th>
                  <th className="text-left px-4 py-3 font-semibold text-slate-600 whitespace-nowrap">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {logs.map((log, idx) => (
                  <LogRow key={log.id} log={log} idx={idx} offset={page * pageSize} />
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between text-sm text-slate-500">
        <p>Showing {page * pageSize + 1}–{page * pageSize + logs.length}</p>
        <div className="flex gap-2">
          <button
            onClick={() => setPage(p => Math.max(0, p - 1))}
            disabled={page === 0}
            className="px-3 py-1.5 border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            Prev
          </button>
          <button
            onClick={() => setPage(p => p + 1)}
            disabled={logs.length < pageSize}
            className="px-3 py-1.5 border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
