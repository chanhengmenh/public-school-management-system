"use client";

import React, { useState, useEffect } from "react";
import PageHeader from '@/components/layouts/PageHeader';
import {
  Building2,
  Calendar,
  Bell,
  ShieldCheck,
  Save,
  Plus,
  Trash2,
  CheckCircle2,
  Edit2,
  AlertTriangle,
  X,
  User,
  Pencil,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { useAuth } from "@/components/auth/AuthProvider";
import { usersApi } from "@/lib/api";

type TabProps = "Account" | "General" | "Calendar" | "Bell" | "Security";

interface Semester {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  isActive: boolean;
}

interface Period {
  id: string;
  name: string;
  startTime: string;
  endTime: string;
  type: "Class" | "Break";
}

export default function GlobalSettingsPage() {
  const { user, refreshUser } = useAuth();
  const [activeTab, setActiveTab] = useState<TabProps>("Account");
  const [showToast, setShowToast] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  // ── My Account state ────────────────────────────────────────
  const [acctEditing,   setAcctEditing]   = useState(false);
  const [draftName,     setDraftName]     = useState('');
  const [draftEmail,    setDraftEmail]    = useState('');
  const [acctSaving,    setAcctSaving]    = useState(false);
  const [acctSuccess,   setAcctSuccess]   = useState(false);
  const [acctError,     setAcctError]     = useState<string | null>(null);

  const [newPassword,     setNewPassword]     = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [pwSaving,        setPwSaving]        = useState(false);
  const [pwSuccess,       setPwSuccess]       = useState(false);
  const [pwError,         setPwError]         = useState<string | null>(null);

  const startAcctEdit = () => {
    setDraftName(user?.full_name ?? '');
    setDraftEmail(user?.email ?? '');
    setAcctSuccess(false);
    setAcctError(null);
    setAcctEditing(true);
  };

  const cancelAcctEdit = () => { setAcctEditing(false); setAcctError(null); };

  const handleSaveAccount = async () => {
    setAcctSaving(true); setAcctError(null); setAcctSuccess(false);
    try {
      const updates: { full_name?: string; email?: string } = {};
      if (draftName  !== user?.full_name) updates.full_name = draftName;
      if (draftEmail !== user?.email)     updates.email     = draftEmail;
      if (Object.keys(updates).length > 0) {
        await usersApi.updateMe(updates);
        await refreshUser();
      }
      setAcctSuccess(true);
      setAcctEditing(false);
    } catch (err: unknown) {
      const e = err as { data?: { detail?: string } };
      setAcctError(e?.data?.detail ?? 'Failed to update profile.');
    } finally {
      setAcctSaving(false);
    }
  };

  const handleChangePassword = async () => {
    setPwError(null); setPwSuccess(false);
    if (newPassword.length < 6) { setPwError('Password must be at least 6 characters.'); return; }
    if (newPassword !== confirmPassword) { setPwError('Passwords do not match.'); return; }
    setPwSaving(true);
    try {
      await usersApi.updateMe({ password: newPassword });
      setPwSuccess(true);
      setNewPassword(''); setConfirmPassword('');
    } catch (err: unknown) {
      const e = err as { data?: { detail?: string } };
      setPwError(e?.data?.detail ?? 'Failed to change password.');
    } finally {
      setPwSaving(false);
    }
  };

  // --- State ---
  const [generalInfo, setGeneralInfo] = useState({
    schoolName: "Springfield High School",
    email: "admin@springfieldhigh.edu",
    phone: "+1 (555) 123-4567",
    address: "123 Education Lane, Springfield, IL 62701",
    language: "en-US",
  });

  const [semesters, setSemesters] = useState<Semester[]>([
    { id: "1", name: "Fall 2026", startDate: "2026-08-20", endDate: "2026-12-18", isActive: true },
    { id: "2", name: "Spring 2027", startDate: "2027-01-11", endDate: "2027-05-28", isActive: false },
  ]);

  const [periods, setPeriods] = useState<Period[]>([
    { id: "1", name: "Homeroom", startTime: "08:00", endTime: "08:15", type: "Class" },
    { id: "2", name: "Period 1", startTime: "08:20", endTime: "09:10", type: "Class" },
    { id: "3", name: "Morning Break", startTime: "09:10", endTime: "09:25", type: "Break" },
  ]);

  const [systemAccess, setSystemAccess] = useState({
    maintenanceMode: false,
    allowStudentLogins: true,
    emailNotifications: true
  });

  // --- Handlers ---
  const handleSaveClick = () => {
    setShowConfirmModal(true);
  };

  const handleConfirmSave = () => {
    setShowConfirmModal(false);
    setIsEditing(false); // Exit edit mode
    setShowToast(true);
  };

  const handleCancelSave = () => {
    setShowConfirmModal(false);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
  };

  useEffect(() => {
    if (showToast) {
      const timer = setTimeout(() => setShowToast(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [showToast]);

  const handleSetActiveSemester = (id: string) => {
    setSemesters(prev => prev.map(s => ({
      ...s,
      isActive: s.id === id
    })));
  };

  const handleAddSemester = () => {
    const newId = Math.random().toString(36).substr(2, 9);
    setSemesters([...semesters, { id: newId, name: "", startDate: "", endDate: "", isActive: false }]);
  };

  const handleUpdateSemester = (id: string, field: keyof Semester, value: string) => {
    setSemesters(prev => prev.map(s => s.id === id ? { ...s, [field]: value } : s));
  };

  const handleAddPeriod = () => {
    const newId = Math.random().toString(36).substr(2, 9);
    setPeriods([...periods, { id: newId, name: "", startTime: "", endTime: "", type: "Class" }]);
  };

  const handleDeletePeriod = (id: string) => {
    setPeriods(prev => prev.filter(p => p.id !== id));
  };

  const handleUpdatePeriod = (id: string, field: keyof Period, value: string) => {
    setPeriods(prev => prev.map(p => p.id === id ? { ...p, [field]: value } : p));
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-12 relative overflow-x-hidden">

      {/* Toast Notification overlay */}
      <div
        className={`fixed top-6 right-6 z-50 transition-all duration-300 transform ${showToast ? "translate-y-0 opacity-100" : "-translate-y-12 opacity-0 pointer-events-none"
          }`}
      >
        <div className="bg-white border border-emerald-200 shadow-lg shadow-emerald-100/50 rounded-2xl p-4 flex items-center gap-3">
          <CheckCircle2 className="w-5 h-5 text-emerald-500 flex-shrink-0" />
          <div>
            <h4 className="text-sm font-semibold text-slate-800">Settings Saved</h4>
            <p className="text-xs text-slate-500 mt-0.5">Your system configurations have been updated.</p>
          </div>
        </div>
      </div>

      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl p-6 shadow-xl w-full max-w-sm relative zoom-in-95 animate-in duration-200">
            <button
              onClick={handleCancelSave}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 transition-colors p-1"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="w-12 h-12 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center mb-4">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-slate-900">Save Changes?</h3>
            <p className="text-sm text-slate-500 mt-2">
              Are you sure you want to apply these system configurations? This may affect the entire platform.
            </p>
            <div className="mt-8 flex items-center justify-end gap-3">
              <button
                onClick={handleCancelSave}
                className="px-4 py-2 font-medium text-slate-600 hover:bg-slate-50 rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmSave}
                className="px-4 py-2 font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-colors flex items-center gap-2"
              >
                <Save className="w-4 h-4" />
                Confirm & Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Sticky Header */}
      <PageHeader 
        title="Global Settings"
        subtitle="Manage core configuration and system preferences."
      />

      {/* Settings Actions Container */}
      <div className="max-w-7xl mx-auto px-8 flex justify-end">
        <div className="flex items-center gap-3">
          {!isEditing ? (
            <button
              onClick={() => setIsEditing(true)}
              className="bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 hover:text-slate-900 px-5 py-2.5 rounded-xl font-medium text-sm flex items-center gap-2 transition-all shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-200 focus:ring-offset-2 focus:ring-offset-slate-50"
            >
              <Edit2 className="w-4 h-4" />
              Edit Settings
            </button>
          ) : (
            <>
              <button
                onClick={handleCancelEdit}
                className="bg-white border border-slate-200 text-slate-500 hover:bg-slate-50 hover:text-slate-700 px-5 py-2.5 rounded-xl font-medium text-sm transition-all focus:outline-none focus:ring-2 focus:ring-slate-200"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveClick}
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl font-medium text-sm flex items-center gap-2 transition-all shadow-sm shadow-indigo-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-slate-50 animate-in slide-in-from-right-2 duration-300"
              >
                <Save className="w-4 h-4" />
                Save Changes
              </button>
            </>
          )}
        </div>
      </div>

      {/* Layout */}
      <div className="max-w-7xl mx-auto px-8 mt-6 flex flex-col md:flex-row gap-8 items-start">

        {/* Left Sidebar */}
        <aside className="w-full md:w-64 flex-shrink-0">
          <nav className="flex flex-col gap-1.5">
            <button
              onClick={() => setActiveTab("Account")}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${activeTab === "Account" ? "bg-indigo-50 text-indigo-700 shadow-sm shadow-indigo-100/50" : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                }`}
            >
              <User className={`w-5 h-5 transition-colors ${activeTab === "Account" ? "text-indigo-600" : "text-slate-400"}`} />
              My Account
            </button>
            <button
              onClick={() => setActiveTab("General")}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${activeTab === "General" ? "bg-indigo-50 text-indigo-700 shadow-sm shadow-indigo-100/50" : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                }`}
            >
              <Building2 className={`w-5 h-5 transition-colors ${activeTab === "General" ? "text-indigo-600" : "text-slate-400"}`} />
              General Info
            </button>
            <button
              onClick={() => setActiveTab("Calendar")}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${activeTab === "Calendar" ? "bg-indigo-50 text-indigo-700 shadow-sm shadow-indigo-100/50" : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                }`}
            >
              <Calendar className={`w-5 h-5 transition-colors ${activeTab === "Calendar" ? "text-indigo-600" : "text-slate-400"}`} />
              Academic Calendar
            </button>
            <button
              onClick={() => setActiveTab("Bell")}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${activeTab === "Bell" ? "bg-indigo-50 text-indigo-700 shadow-sm shadow-indigo-100/50" : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                }`}
            >
              <Bell className={`w-5 h-5 transition-colors ${activeTab === "Bell" ? "text-indigo-600" : "text-slate-400"}`} />
              Bell Schedule
            </button>
            <button
              onClick={() => setActiveTab("Security")}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${activeTab === "Security" ? "bg-indigo-50 text-indigo-700 shadow-sm shadow-indigo-100/50" : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                }`}
            >
              <ShieldCheck className={`w-5 h-5 transition-colors ${activeTab === "Security" ? "text-indigo-600" : "text-slate-400"}`} />
              System Access
            </button>
          </nav>
        </aside>

        {/* Right Main Content */}
        <main className="flex-1 min-w-0 bg-white border border-slate-200 shadow-sm rounded-3xl p-8 relative overflow-hidden">

          {/* TAB 0: My Account */}
          {activeTab === "Account" && (
            <div className="animate-in fade-in slide-in-from-bottom-2 duration-500 space-y-8">
              {/* Profile section */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <h2 className="text-xl font-bold text-slate-900">My Profile</h2>
                  {!acctEditing && (
                    <button onClick={startAcctEdit} className="flex items-center gap-2 text-sm font-bold text-indigo-600 hover:text-indigo-800 px-4 py-2 rounded-xl hover:bg-indigo-50 transition-colors">
                      <Pencil className="w-4 h-4" /> Edit
                    </button>
                  )}
                </div>
                <p className="text-sm text-slate-500 mt-1 mb-6">Your admin account name and email address.</p>

                {acctSuccess && (
                  <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm rounded-xl px-4 py-3 mb-4">
                    <CheckCircle2 className="h-4 w-4" /> Profile updated successfully.
                  </div>
                )}
                {acctError && (
                  <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3 mb-4">
                    <AlertCircle className="h-4 w-4" /> {acctError}
                  </div>
                )}

                <div className="flex items-center gap-5 mb-8 pb-8 border-b border-slate-100">
                  <div className="w-16 h-16 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-xl font-bold border-2 border-indigo-200">
                    {(acctEditing ? draftName : user?.full_name)?.charAt(0)?.toUpperCase() ?? 'A'}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-900">{acctEditing ? draftName : user?.full_name}</p>
                    <p className="text-xs text-slate-500 capitalize mt-0.5">{user?.role}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-1.5">
                    <label className="text-sm font-semibold text-slate-700">Full Name</label>
                    <input
                      type="text"
                      disabled={!acctEditing}
                      value={acctEditing ? draftName : (user?.full_name ?? '')}
                      onChange={(e) => setDraftName(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-300 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 transition-all text-slate-900 disabled:bg-slate-50 disabled:text-slate-500 disabled:cursor-not-allowed"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-semibold text-slate-700">Email Address</label>
                    <input
                      type="email"
                      disabled={!acctEditing}
                      value={acctEditing ? draftEmail : (user?.email ?? '')}
                      onChange={(e) => setDraftEmail(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-300 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 transition-all text-slate-900 disabled:bg-slate-50 disabled:text-slate-500 disabled:cursor-not-allowed"
                    />
                  </div>
                </div>

                {acctEditing && (
                  <div className="flex justify-end gap-3 pt-6 mt-6 border-t border-slate-100">
                    <button onClick={cancelAcctEdit} className="bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 px-5 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2 transition-all">
                      <X className="w-4 h-4" /> Cancel
                    </button>
                    <button onClick={handleSaveAccount} disabled={acctSaving} className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2 transition-all disabled:opacity-60">
                      {acctSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                      Save Changes
                    </button>
                  </div>
                )}
              </div>

              {/* Password section */}
              <div className="pt-8 border-t border-slate-100">
                <h3 className="text-lg font-bold text-slate-900 mb-1">Change Password</h3>
                <p className="text-sm text-slate-500 mb-6">Update your admin account password.</p>

                {pwSuccess && (
                  <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm rounded-xl px-4 py-3 mb-4">
                    <CheckCircle2 className="h-4 w-4" /> Password changed successfully.
                  </div>
                )}
                {pwError && (
                  <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3 mb-4">
                    <AlertCircle className="h-4 w-4" /> {pwError}
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-xl">
                  <div className="space-y-1.5">
                    <label className="text-sm font-semibold text-slate-700">New Password</label>
                    <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="At least 6 characters"
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-300 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 transition-all" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-semibold text-slate-700">Confirm Password</label>
                    <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="Re-enter new password"
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-300 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 transition-all" />
                  </div>
                </div>
                <div className="flex justify-start mt-6">
                  <button onClick={handleChangePassword} disabled={pwSaving || !newPassword}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2 transition-all disabled:opacity-60">
                    {pwSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4" />}
                    Change Password
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 1: General Info */}
          {activeTab === "General" && (
            <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-slate-900">School Details</h2>
                
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-1.5 flex flex-col">
                  <label className="text-sm font-semibold text-slate-700">Official School Name</label>
                  <input
                    type="text"
                    disabled={!isEditing}
                    value={generalInfo.schoolName}
                    onChange={(e) => setGeneralInfo({ ...generalInfo, schoolName: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-300 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 transition-all text-slate-900 disabled:bg-slate-50 disabled:text-slate-500 disabled:opacity-80 disabled:cursor-not-allowed"
                    placeholder="Enter school name"
                  />
                </div>

                <div className="space-y-1.5 flex flex-col">
                  <label className="text-sm font-semibold text-slate-700">Contact Email</label>
                  <input
                    type="email"
                    disabled={!isEditing}
                    value={generalInfo.email}
                    onChange={(e) => setGeneralInfo({ ...generalInfo, email: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-300 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 transition-all text-slate-900 disabled:bg-slate-50 disabled:text-slate-500 disabled:opacity-80 disabled:cursor-not-allowed"
                    placeholder="admin@school.edu"
                  />
                </div>

                <div className="space-y-1.5 flex flex-col">
                  <label className="text-sm font-semibold text-slate-700">Main Phone Number</label>
                  <input
                    type="tel"
                    disabled={!isEditing}
                    value={generalInfo.phone}
                    onChange={(e) => setGeneralInfo({ ...generalInfo, phone: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-300 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 transition-all text-slate-900 disabled:bg-slate-50 disabled:text-slate-500 disabled:opacity-80 disabled:cursor-not-allowed"
                    placeholder="+1 (555) 000-0000"
                  />
                </div>

                <div className="space-y-1.5 md:col-span-2 flex flex-col">
                  <label className="text-sm font-semibold text-slate-700">Physical Address</label>
                  <input
                    type="text"
                    disabled={!isEditing}
                    value={generalInfo.address}
                    onChange={(e) => setGeneralInfo({ ...generalInfo, address: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-300 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 transition-all text-slate-900 disabled:bg-slate-50 disabled:text-slate-500 disabled:opacity-80 disabled:cursor-not-allowed"
                    placeholder="Street, City, State ZIP"
                  />
                </div>

                <div className="space-y-1.5 flex flex-col md:col-span-2 max-w-md">
                  <label className="text-sm font-semibold text-slate-700">Default Language</label>
                  <select
                    disabled={!isEditing}
                    value={generalInfo.language}
                    onChange={(e) => setGeneralInfo({ ...generalInfo, language: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-300 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 transition-all text-slate-900 appearance-none bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20width%3D%2220%22%20height%3D%2220%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2020%2020%22%20fill%3D%22currentColor%22%3E%3Cpath%20fill-rule%3D%22evenodd%22%20d%3D%22M5.293%207.293a1%201%200%20011.414%200L10%2010.586l3.293-3.293a1%201%200%20111.414%201.414l-4%204a1%201%200%2001-1.414%200l-4-4a1%201%200%20010-1.414z%22%20clip-rule%3D%22evenodd%22%20%2F%3E%3C%2Fsvg%3E')] bg-[length:1.25rem_1.25rem] bg-[right_0.5rem_center] bg-no-repeat pr-10 disabled:bg-slate-50 disabled:text-slate-500 disabled:opacity-80 disabled:cursor-not-allowed"
                  >
                    <option value="en-US">English (US)</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: Academic Calendar */}
          {activeTab === "Calendar" && (
            <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-xl font-bold text-slate-900 flex items-center gap-3">
                    Academic Semesters
                    
                  </h2>
                  <p className="text-sm text-slate-500 mt-0.5">Define grading periods and active terms.</p>
                </div>
                {isEditing && (
                  <button
                    onClick={handleAddSemester}
                    className="text-sm font-medium text-indigo-700 hover:text-indigo-800 flex items-center gap-1.5 bg-indigo-50 hover:bg-indigo-100 px-3 py-2 rounded-xl transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    Add Semester
                  </button>
                )}
              </div>

              <div className="space-y-4">
                {semesters.map((semester) => (
                  <div
                    key={semester.id}
                    className={`p-6 rounded-2xl border transition-all duration-300 ${semester.isActive
                      ? "border-indigo-200 bg-indigo-50/40 shadow-sm"
                      : "border-slate-200 bg-white hover:border-slate-300 hover:shadow-sm"
                      }`}
                  >
                    <div className="flex flex-col md:flex-row gap-5 items-start md:items-end">

                      <div className="flex-1 space-y-1.5 w-full">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Term Name</label>
                        <input
                          type="text"
                          disabled={!isEditing}
                          value={semester.name}
                          onChange={(e) => handleUpdateSemester(semester.id, "name", e.target.value)}
                          className="w-full px-4 py-2 text-sm font-medium rounded-xl border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 text-slate-900 disabled:bg-slate-50/50 disabled:border-slate-200 disabled:text-slate-600 disabled:cursor-not-allowed"
                          placeholder="e.g. Fall 2026"
                        />
                      </div>

                      <div className="flex-1 space-y-1.5 w-full">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Start Date</label>
                        <input
                          type="date"
                          disabled={!isEditing}
                          value={semester.startDate}
                          onChange={(e) => handleUpdateSemester(semester.id, "startDate", e.target.value)}
                          className="w-full px-4 py-2 text-sm rounded-xl border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 text-slate-700 disabled:bg-slate-50/50 disabled:border-slate-200 disabled:text-slate-500 disabled:cursor-not-allowed"
                        />
                      </div>

                      <div className="flex-1 space-y-1.5 w-full">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">End Date</label>
                        <input
                          type="date"
                          disabled={!isEditing}
                          value={semester.endDate}
                          onChange={(e) => handleUpdateSemester(semester.id, "endDate", e.target.value)}
                          className="w-full px-4 py-2 text-sm rounded-xl border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 text-slate-700 disabled:bg-slate-50/50 disabled:border-slate-200 disabled:text-slate-500 disabled:cursor-not-allowed"
                        />
                      </div>

                      <div className="flex-shrink-0 w-full md:w-auto mt-2 md:mt-0">
                        <button
                          onClick={() => handleSetActiveSemester(semester.id)}
                          disabled={!isEditing || semester.isActive}
                          className={`w-full md:w-auto px-5 py-2 rounded-xl text-sm font-semibold transition-all duration-300 ${semester.isActive
                            ? "bg-indigo-100 text-indigo-700 cursor-default"
                            : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-900 hover:border-slate-300 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white"
                            }`}
                        >
                          {semester.isActive ? (
                            <span className="flex items-center justify-center gap-1.5">
                              <CheckCircle2 className="w-4 h-4" /> Active
                            </span>
                          ) : "Set Active"}
                        </button>
                      </div>

                    </div>
                  </div>
                ))}

                {semesters.length === 0 && (
                  <div className="text-center py-12 border-2 border-dashed rounded-2xl border-slate-200 text-slate-500 text-sm">
                    No semesters defined. Click "Edit Settings" and "Add Semester" to begin.
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 3: Bell Schedule */}
          {activeTab === "Bell" && (
            <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-xl font-bold text-slate-900 flex items-center gap-3">
                    Bell Schedule
                    
                  </h2>
                  <p className="text-sm text-slate-500 mt-0.5">Configure period names and daily time blocks.</p>
                </div>
                {isEditing && (
                  <button
                    onClick={handleAddPeriod}
                    className="text-sm font-medium text-indigo-700 hover:text-indigo-800 flex items-center gap-1.5 bg-indigo-50 hover:bg-indigo-100 px-3 py-2 rounded-xl transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    Add Period
                  </button>
                )}
              </div>

              <div className="rounded-2xl border border-slate-200 overflow-x-auto bg-white">
                <table className="w-full text-left border-collapse min-w-[600px]">
                  <thead>
                    <tr className="bg-slate-50/80 border-b border-slate-200">
                      <th className="px-5 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider w-[35%]">Name</th>
                      <th className="px-5 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Start</th>
                      <th className="px-5 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">End</th>
                      <th className="px-5 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Type</th>
                      {isEditing && <th className="px-5 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider w-12 text-center"></th>}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {periods.map((period) => (
                      <tr key={period.id} className="hover:bg-slate-50/50 transition-colors group">
                        <td className="px-3 py-3">
                          <input
                            type="text"
                            disabled={!isEditing}
                            value={period.name}
                            onChange={(e) => handleUpdatePeriod(period.id, "name", e.target.value)}
                            className="w-full px-3 py-1.5 font-medium text-sm rounded-lg border border-transparent hover:border-slate-300 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 bg-transparent focus:bg-white transition-all outline-none text-slate-900 placeholder-slate-400 disabled:text-slate-600 disabled:opacity-90 disabled:cursor-not-allowed disabled:hover:border-transparent"
                            placeholder="Period Name"
                          />
                        </td>
                        <td className="px-3 py-3">
                          <div className="relative">
                            <input
                              type="time"
                              disabled={!isEditing}
                              value={period.startTime}
                              onChange={(e) => handleUpdatePeriod(period.id, "startTime", e.target.value)}
                              className="w-full px-3 py-1.5 text-sm rounded-lg border border-transparent hover:border-slate-300 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 bg-transparent focus:bg-white transition-all outline-none text-slate-700 disabled:text-slate-500 disabled:opacity-90 disabled:cursor-not-allowed disabled:hover:border-transparent"
                            />
                          </div>
                        </td>
                        <td className="px-3 py-3">
                          <div className="relative">
                            <input
                              type="time"
                              disabled={!isEditing}
                              value={period.endTime}
                              onChange={(e) => handleUpdatePeriod(period.id, "endTime", e.target.value)}
                              className="w-full px-3 py-1.5 text-sm rounded-lg border border-transparent hover:border-slate-300 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 bg-transparent focus:bg-white transition-all outline-none text-slate-700 disabled:text-slate-500 disabled:opacity-90 disabled:cursor-not-allowed disabled:hover:border-transparent"
                            />
                          </div>
                        </td>
                        <td className="px-3 py-3">
                          <select
                            disabled={!isEditing}
                            value={period.type}
                            onChange={(e) => handleUpdatePeriod(period.id, "type", e.target.value)}
                            className={`w-full px-3 py-1.5 text-sm font-medium rounded-lg border border-transparent hover:border-slate-300 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 bg-transparent focus:bg-white transition-all outline-none appearance-none cursor-pointer disabled:cursor-not-allowed disabled:hover:border-transparent ${period.type === "Break" ? "text-amber-600" : "text-slate-700"
                              } ${!isEditing ? 'opacity-80' : ''}`}
                          >
                            <option value="Class">Class</option>
                            <option value="Break">Break</option>
                          </select>
                        </td>
                        {isEditing && (
                          <td className="px-4 py-3 text-right">
                            <button
                              onClick={() => handleDeletePeriod(period.id)}
                              className="text-slate-300 hover:text-red-500 transition-colors p-2 rounded-lg hover:bg-red-50 opacity-0 group-hover:opacity-100 focus:opacity-100"
                              title="Delete period"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        )}
                      </tr>
                    ))}
                    {periods.length === 0 && (
                      <tr>
                        <td colSpan={isEditing ? 5 : 4} className="px-4 py-10 text-center text-slate-500 text-sm">
                          No periods defined. Enable Edit Mode and add a period.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 4: System Access */}
          {activeTab === "Security" && (
            <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-slate-900">System Access & Limits</h2>
                
              </div>

              <div className="space-y-4">

                {/* Maintenance Mode Toggle */}
                <div
                  className={`flex items-start justify-between p-6 rounded-2xl border transition-all ${systemAccess.maintenanceMode ? "border-red-200 bg-red-50/30" : "border-slate-200 bg-white"
                    } ${isEditing ? 'cursor-pointer hover:border-red-300' : 'cursor-default opacity-80'}`}
                  onClick={() => isEditing && setSystemAccess({ ...systemAccess, maintenanceMode: !systemAccess.maintenanceMode })}
                >
                  <div className="pr-8">
                    <h3 className={`text-sm font-bold ${systemAccess.maintenanceMode ? "text-red-700" : "text-slate-900"}`}>Maintenance Mode</h3>
                    <p className="text-sm text-slate-500 mt-1">
                      Forces the frontend into offline mode. Only core administrators can access the dashboard.
                    </p>
                  </div>
                  <div className="flex-shrink-0 mt-1">
                    <div className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-300 ease-in-out ${systemAccess.maintenanceMode ? (isEditing ? "bg-red-500" : "bg-red-400") : "bg-slate-300"
                      }`}>
                      <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition duration-300 ease-in-out shadow-sm ${systemAccess.maintenanceMode ? "translate-x-6" : "translate-x-1"
                        }`} />
                    </div>
                  </div>
                </div>

                {/* Allow Student Logins Toggle */}
                <div
                  className={`flex items-start justify-between p-6 rounded-2xl border transition-all ${systemAccess.allowStudentLogins ? "border-emerald-200 bg-emerald-50/30" : "border-slate-200 bg-white"
                    } ${isEditing ? 'cursor-pointer hover:border-emerald-300' : 'cursor-default opacity-80'}`}
                  onClick={() => isEditing && setSystemAccess({ ...systemAccess, allowStudentLogins: !systemAccess.allowStudentLogins })}
                >
                  <div className="pr-8">
                    <h3 className={`text-sm font-bold ${systemAccess.allowStudentLogins ? "text-emerald-700" : "text-slate-900"}`}>Allow Student Logins</h3>
                    <p className="text-sm text-slate-500 mt-1">
                      Enable or disable access to the Student Portal. Disable this over summer breaks.
                    </p>
                  </div>
                  <div className="flex-shrink-0 mt-1">
                    <div className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-300 ease-in-out ${systemAccess.allowStudentLogins ? (isEditing ? "bg-emerald-500" : "bg-emerald-400") : "bg-slate-300"
                      }`}>
                      <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition duration-300 ease-in-out shadow-sm ${systemAccess.allowStudentLogins ? "translate-x-6" : "translate-x-1"
                        }`} />
                    </div>
                  </div>
                </div>

                {/* Email Notifications Toggle */}
                <div
                  className={`flex items-start justify-between p-6 rounded-2xl border transition-all ${systemAccess.emailNotifications ? "border-indigo-200 bg-indigo-50/40" : "border-slate-200 bg-white"
                    } ${isEditing ? 'cursor-pointer hover:border-indigo-300' : 'cursor-default opacity-80'}`}
                  onClick={() => isEditing && setSystemAccess({ ...systemAccess, emailNotifications: !systemAccess.emailNotifications })}
                >
                  <div className="pr-8">
                    <h3 className={`text-sm font-bold ${systemAccess.emailNotifications ? "text-indigo-700" : "text-slate-900"}`}>System Email Dispatch</h3>
                    <p className="text-sm text-slate-500 mt-1">
                      Automatically send emails for password resets, grade deployments, and announcements.
                    </p>
                  </div>
                  <div className="flex-shrink-0 mt-1">
                    <div className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-300 ease-in-out ${systemAccess.emailNotifications ? (isEditing ? "bg-indigo-500" : "bg-indigo-400") : "bg-slate-300"
                      }`}>
                      <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition duration-300 ease-in-out shadow-sm ${systemAccess.emailNotifications ? "translate-x-6" : "translate-x-1"
                        }`} />
                    </div>
                  </div>
                </div>

              </div>
            </div>
          )}

        </main>
      </div>
    </div>
  );
}
