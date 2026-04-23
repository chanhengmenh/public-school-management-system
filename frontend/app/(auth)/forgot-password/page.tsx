'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Mail, ArrowLeft, CheckCircle2 } from 'lucide-react';

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState('');
    const [isSubmitted, setIsSubmitted] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitted(true);
        // In a real app, this would call an API
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-900 relative overflow-hidden px-4 sm:px-6 lg:px-8">
            {/* Subtle Grid Pattern Background */}
            <div
                className="absolute inset-0 z-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:32px_32px]"
            ></div>

            <div className="relative z-10 w-full max-w-md p-8 sm:p-10 bg-slate-800/80 backdrop-blur-md rounded-2xl border border-slate-700 shadow-2xl">
                <div className="text-center mb-10">
                    <h2 className="text-4xl font-sans font-bold text-white mb-2 tracking-tight">Reset Password</h2>
                    <p className="text-slate-400 text-sm">Enter your email to receive a password reset link</p>
                </div>

                {!isSubmitted ? (
                    <form className="space-y-6" onSubmit={handleSubmit}>
                        {/* Email Address */}
                        <div className="space-y-2">
                            <label className="block text-xs uppercase tracking-wider font-semibold text-slate-400" htmlFor="email">
                                Email Address
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                                    <Mail className="h-4 w-4 text-slate-400" />
                                </div>
                                <input
                                    id="email"
                                    type="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="you@school.edu"
                                    className="block w-full pl-10 pr-3.5 py-3 bg-slate-900/50 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-amber-500 focus:border-amber-500 transition-colors text-sm"
                                />
                            </div>
                        </div>

                        {/* Submit Button */}
                        <div className="pt-2">
                            <button
                                type="submit"
                                className="w-full flex items-center justify-center py-3.5 px-4 bg-amber-500 hover:bg-amber-400 text-slate-900 font-bold rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 focus:ring-offset-slate-900 text-sm"
                            >
                                Send Reset Link
                            </button>
                        </div>

                        <div className="text-sm flex justify-center mt-6">
                            <Link href="/login" className="flex items-center text-slate-400 hover:text-white transition-colors">
                                <ArrowLeft className="h-4 w-4 mr-2" />
                                Back to Login
                            </Link>
                        </div>
                    </form>
                ) : (
                    <div className="space-y-6">
                        <div className="rounded-lg bg-green-900/30 p-4 border border-green-800/50">
                            <div className="flex">
                                <div className="flex-shrink-0">
                                    <CheckCircle2 className="h-5 w-5 text-green-400" />
                                </div>
                                <div className="ml-3">
                                    <h3 className="text-sm font-medium text-green-300">
                                        Reset link sent
                                    </h3>
                                    <div className="mt-2 text-sm text-green-200/70">
                                        <p>
                                            If an account exists for <span className="text-white font-medium">{email}</span>, we have sent a password reset link to it.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="text-sm flex justify-center mt-6">
                            <Link href="/login" className="flex items-center text-slate-400 hover:text-white transition-colors">
                                <ArrowLeft className="h-4 w-4 mr-2" />
                                Return to Login
                            </Link>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}