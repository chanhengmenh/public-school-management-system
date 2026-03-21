'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Mail, Lock, Eye, EyeOff, User, GraduationCap, Shield, ChevronDown } from 'lucide-react';

export default function LoginPage() {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState('student');
    const [subRole, setSubRole] = useState('normal');
    const [showPassword, setShowPassword] = useState(false);

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        // Set the mock authentication cookie for the middleware to read
        document.cookie = `mock_role=${role}; path=/; max-age=86400`;
        document.cookie = `mock_sub_role=${subRole}; path=/; max-age=86400`;

        // Trigger the redirect
        if (role === 'admin') router.push('/admin');
        else if (role === 'teacher') router.push('/teacher');
        else router.push('/student');
    };

    const renderRoleIcon = () => {
        if (role === 'student') return <GraduationCap className="h-4 w-4 text-slate-400" />;
        if (role === 'teacher') return <User className="h-4 w-4 text-slate-400" />;
        if (role === 'admin') return <Shield className="h-4 w-4 text-slate-400" />;
        return <User className="h-4 w-4 text-slate-400" />;
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-900 relative overflow-hidden px-4 sm:px-6 lg:px-8">
            {/* Subtle Grid Pattern Background */}
            <div
                className="absolute inset-0 z-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:32px_32px]"
            ></div>

            <div className="relative z-10 w-full max-w-md p-8 sm:p-10 bg-slate-800/80 backdrop-blur-md rounded-2xl border border-slate-700 shadow-2xl">
                <div className="text-center mb-10">
                    <h2 className="text-4xl font-serif font-bold text-white mb-2 tracking-tight">Login</h2>
                    <p className="text-slate-400 text-sm">Enter your credentials to access your dashboard</p>
                </div>

                <form onSubmit={handleLogin} className="space-y-6">
                    {/* Sign In As */}
                    <div className="space-y-2">
                        <label className="block text-xs uppercase tracking-wider font-semibold text-slate-400">
                            Sign In As
                        </label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                                {renderRoleIcon()}
                            </div>
                            <select
                                value={role}
                                onChange={(e) => setRole(e.target.value)}
                                className="block w-full pl-10 pr-10 py-3 bg-slate-900/50 border border-slate-700 rounded-lg text-white appearance-none focus:outline-none focus:ring-1 focus:ring-amber-500 focus:border-amber-500 transition-colors cursor-pointer text-sm"
                            >
                                <option value="student">Student</option>
                                <option value="teacher">Teacher</option>
                                <option value="admin">Admin</option>
                            </select>
                            <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none">
                                <ChevronDown className="h-4 w-4 text-slate-400" />
                            </div>
                        </div>
                    </div>

                    {/* Sub Role */}
                    <div className="space-y-2">
                        <label className="block text-xs uppercase tracking-wider font-semibold text-slate-400">
                            🧪 Test Environment: Select Sub-Role
                        </label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                                <Shield className="h-4 w-4 text-slate-400" />
                            </div>
                            <select
                                value={subRole}
                                onChange={(e) => setSubRole(e.target.value)}
                                className="block w-full pl-10 pr-10 py-3 bg-slate-900/50 border border-slate-700 rounded-lg text-white appearance-none focus:outline-none focus:ring-1 focus:ring-amber-500 focus:border-amber-500 transition-colors cursor-pointer text-sm"
                            >
                                <option value="normal">Normal</option>
                                <option value="monitor">Class Monitor</option>
                            </select>
                            <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none">
                                <ChevronDown className="h-4 w-4 text-slate-400" />
                            </div>
                        </div>
                    </div>

                    {/* Email Address */}
                    <div className="space-y-2">
                        <label className="block text-xs uppercase tracking-wider font-semibold text-slate-400">
                            Email Address
                        </label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                                <Mail className="h-4 w-4 text-slate-400" />
                            </div>
                            <input
                                type="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="you@school.edu"
                                className="block w-full pl-10 pr-3.5 py-3 bg-slate-900/50 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-amber-500 focus:border-amber-500 transition-colors text-sm"
                            />
                        </div>
                    </div>

                    {/* Password */}
                    <div className="space-y-2">
                        <label className="block text-xs uppercase tracking-wider font-semibold text-slate-400">
                            Password
                        </label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                                <Lock className="h-4 w-4 text-slate-400" />
                            </div>
                            <input
                                type={showPassword ? 'text' : 'password'}
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="Enter your password"
                                className="block w-full pl-10 pr-10 py-3 bg-slate-900/50 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-amber-500 focus:border-amber-500 transition-colors text-sm"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-white transition-colors"
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
                    <button
                        type="submit"
                        className="w-full flex items-center justify-center py-3.5 px-4 bg-amber-500 hover:bg-amber-400 text-slate-900 font-bold rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 focus:ring-offset-slate-900 mt-6 text-sm"
                    >
                        <span>Sign In &rarr;</span>
                    </button>
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