'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Lock, Eye, EyeOff, Loader2, ShieldCheck } from 'lucide-react';
import { useAuth } from '@/components/auth/AuthProvider';
import { usersApi } from '@/lib/api';

export default function ChangePasswordPage() {
    const { user, loading: authLoading, refreshUser } = useAuth();
    const router = useRouter();

    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // If not logged in, redirect to login
    useEffect(() => {
        if (!authLoading && !user) {
            router.replace('/login');
        }
    }, [authLoading, user, router]);

    // If user doesn't need to change password, redirect to home
    useEffect(() => {
        if (!authLoading && user && !user.must_change_password) {
            router.replace('/');
        }
    }, [authLoading, user, router]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        if (newPassword.length < 6) {
            setError('Password must be at least 6 characters.');
            return;
        }
        if (newPassword !== confirmPassword) {
            setError('Passwords do not match.');
            return;
        }

        setSaving(true);
        try {
            await usersApi.updateMe({ password: newPassword });
            await refreshUser();
            router.replace('/');
        } catch (err: unknown) {
            const apiErr = err as { data?: { detail?: string } };
            setError(apiErr?.data?.detail ?? 'Failed to change password. Please try again.');
        } finally {
            setSaving(false);
        }
    };

    if (authLoading || !user) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-900">
                <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-900 relative overflow-hidden px-4 sm:px-6 lg:px-8">
            {/* Grid pattern background (matches login page) */}
            <div
                className="absolute inset-0 z-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:32px_32px]"
            />

            <div className="relative z-10 w-full max-w-md p-8 sm:p-10 bg-slate-800/80 backdrop-blur-md rounded-2xl border border-slate-700 shadow-2xl">
                {/* Header */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-orange-500/10 border border-orange-500/20 mb-4">
                        <ShieldCheck className="h-8 w-8 text-orange-400" />
                    </div>
                    <h2 className="text-3xl font-serif font-bold text-white mb-2 tracking-tight">
                        Change Your Password
                    </h2>
                    <p className="text-slate-400 text-sm">
                        For security, you must set a new password before accessing your account.
                    </p>
                </div>

                {/* Logged-in as indicator */}
                <div className="mb-6 px-4 py-3 rounded-lg bg-slate-700/50 border border-slate-600 text-sm">
                    <p className="text-slate-400">
                        Logged in as <span className="text-white font-medium">{user.full_name}</span>
                    </p>
                    <p className="text-slate-500 text-xs mt-0.5">{user.email}</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                    {error && (
                        <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-500 text-sm text-center">
                            {error}
                        </div>
                    )}

                    {/* New Password */}
                    <div className="space-y-2">
                        <label className="block text-sm font-medium text-slate-300">
                            New Password
                        </label>
                        <div className="relative">
                            <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                            <input
                                type={showPassword ? 'text' : 'password'}
                                required
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                placeholder="At least 6 characters"
                                className="w-full pl-10 pr-12 py-3 bg-slate-700/50 border border-slate-600 rounded-xl text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                            >
                                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </button>
                        </div>
                    </div>

                    {/* Confirm Password */}
                    <div className="space-y-2">
                        <label className="block text-sm font-medium text-slate-300">
                            Confirm Password
                        </label>
                        <div className="relative">
                            <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                            <input
                                type={showPassword ? 'text' : 'password'}
                                required
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                placeholder="Re-enter your new password"
                                className="w-full pl-10 pr-4 py-3 bg-slate-700/50 border border-slate-600 rounded-xl text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all"
                            />
                        </div>
                    </div>

                    {/* Password strength hint */}
                    {newPassword.length > 0 && newPassword.length < 6 && (
                        <p className="text-xs text-amber-400">
                            Password is too short ({newPassword.length}/6 characters minimum)
                        </p>
                    )}

                    <button
                        type="submit"
                        disabled={saving || !newPassword || !confirmPassword}
                        className="w-full py-3 bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm"
                    >
                        {saving ? (
                            <>
                                <Loader2 className="h-4 w-4 animate-spin" />
                                Changing Password...
                            </>
                        ) : (
                            <>
                                <ShieldCheck className="h-4 w-4" />
                                Set New Password & Continue
                            </>
                        )}
                    </button>
                </form>
            </div>
        </div>
    );
}
