'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Mail, Lock, Eye, EyeOff } from 'lucide-react';
import { authenticateUser } from '@/lib/mock-data/auth';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';

export default function LoginPage() {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        const user = await authenticateUser(email, password);

        if (!user) {
            setError('Invalid email or password');
            setIsLoading(false);
            return;
        }

        // Set the mock authentication cookie for the middleware to read
        document.cookie = `mock_role=${user.role}; path=/; max-age=86400`;
        document.cookie = `mock_sub_role=${user.subRole}; path=/; max-age=86400`;
        if (user.role === 'student') {
            document.cookie = `mock_student_id=${user.id}; path=/; max-age=86400`;
        }

        // Trigger the redirect
        router.push(`/${user.role}`);
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-900 relative overflow-hidden px-4 sm:px-6 lg:px-8">
            {/* Subtle Grid Pattern Background */}
            <div
                className="absolute inset-0 z-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:32px_32px]"
            ></div>

            <div className="relative z-10 w-full max-w-md p-8 sm:p-10 bg-slate-800/80 backdrop-blur-md rounded-2xl border border-slate-700 shadow-2xl">
                <div className="text-center mb-10">
                    <h2 className="text-4xl font-bold text-white mb-2 tracking-tight">Login</h2>
                    <p className="text-slate-400 text-sm">Enter your credentials to access your dashboard</p>
                </div>

                {error && (
                    <div className="mb-6 p-3 bg-red-500/10 border border-red-500/50 rounded-lg text-red-500 text-sm text-center">
                        {error}
                    </div>
                )}

                <form onSubmit={handleLogin} className="space-y-6">
                    {/* Email Address */}
                    <div className="space-y-2">
                        <label className="block text-xs uppercase tracking-wider font-semibold text-slate-400">
                            Email Address
                        </label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none z-10">
                                <Mail className="h-4 w-4 text-slate-400" />
                            </div>
                            <Input
                                type="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="you@school.edu"
                                className="!pl-10 !pr-3.5 !py-3 !bg-slate-900/50 !border-slate-700 !text-white placeholder:!text-slate-500 focus:!ring-1 focus:!ring-amber-500 focus:!border-amber-500 text-sm"
                            />
                        </div>
                    </div>

                    {/* Password */}
                    <div className="space-y-2">
                        <label className="block text-xs uppercase tracking-wider font-semibold text-slate-400">
                            Password
                        </label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none z-10">
                                <Lock className="h-4 w-4 text-slate-400" />
                            </div>
                            <Input
                                type={showPassword ? 'text' : 'password'}
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="Enter your password"
                                className="!pl-10 !pr-10 !py-3 !bg-slate-900/50 !border-slate-700 !text-white placeholder:!text-slate-500 focus:!ring-1 focus:!ring-amber-500 focus:!border-amber-500 text-sm"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-white transition-colors z-10"
                                aria-label={showPassword ? "Hide password" : "Show password"}
                            >
                                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </button>
                        </div>
                    </div>

                    {/* Forgot Password Link */}
                    <div className="flex justify-end !mt-2">
                        <Link
                            href="/forgot-password"
                            className="text-xs font-semibold text-amber-500 hover:text-amber-400 transition-colors"
                        >
                            Forgot password?
                        </Link>
                    </div>

                    {/* Submit Button */}
                    <Button
                        type="submit"
                        isLoading={isLoading}
                        className="w-full flex items-center justify-center !py-3.5 !px-4 !bg-amber-500 hover:!bg-amber-400 !text-slate-900 font-bold rounded-lg transition-colors focus:!outline-none focus:!ring-2 focus:!ring-offset-2 focus:!ring-amber-500 focus:!ring-offset-slate-900 mt-6 text-sm"
                    >
                        <span>{isLoading ? 'Signing In...' : 'Sign In \u2192'}</span>
                    </Button>
                </form>

                <div className="mt-8 text-center text-xs text-slate-400">
                    <p>
                        New to EduPeak?{' '}
                        <a href="#" className="font-semibold text-amber-500 hover:text-amber-400 transition-colors">
                            Contact your school admin
                        </a>
                    </p>
                </div>
            </div>
        </div>
    );
}