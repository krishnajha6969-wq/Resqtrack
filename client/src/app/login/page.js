'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import api from '@/lib/api';

export default function LoginPage() {
    const router = useRouter();
    const [isRegister, setIsRegister] = useState(false);
    const [form, setForm] = useState({ email: '', password: '', full_name: '', role: 'rescue_team' });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [focusedField, setFocusedField] = useState(null);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            if (isRegister) {
                await api.register(form.email, form.password, form.full_name, form.role);
            } else {
                await api.login(form.email, form.password);
                // Override role based on what the user explicitly selected on login
                const currentUser = api.getUser();
                if (currentUser) {
                    currentUser.role = form.role;
                    api.setUser(currentUser);
                }
            }
            
            const user = api.getUser();
            // Route based on the role the user chose
            if (user?.role === 'command_center' || user?.role === 'admin') {
                router.push('/dashboard');
            } else {
                router.push('/rescue');
            }
        } catch (err) {
            setError(err.message || 'Authentication failed');
        } finally {
            setLoading(false);
        }
    };

    const handleDemoLogin = (role) => {
        const demoUser = {
            id: 'demo-' + role,
            email: `demo@resqtrack.io`,
            full_name: role === 'command_center' ? 'Command Admin' : 'Alpha Team Lead',
            role,
        };
        api.setToken('demo-token-' + Date.now());
        api.setUser(demoUser);
        router.push(role === 'command_center' ? '/dashboard' : '/rescue');
    };

    const inputClass = (field) => `
        w-full px-6 py-5 text-lg bg-slate-800/50 border-2 rounded-2xl text-white 
        placeholder-slate-600 outline-none transition-all duration-300 font-medium
        ${focusedField === field
            ? 'border-red-500/60 bg-slate-800/70 shadow-[0_0_0_4px_rgba(239,68,68,0.1)]'
            : 'border-slate-700/60 hover:border-slate-600'
        }
    `;

    return (
        <div className="min-h-screen bg-slate-950 flex overflow-hidden max-w-screen-2xl mx-auto w-full shadow-2xl">

            {/* ── LEFT PANEL — Branding ── */}
            <div className="hidden lg:flex lg:w-1/2 relative flex-col justify-between p-16">
                {/* Animated background blobs */}
                <div className="absolute inset-0 overflow-hidden">
                    <div className="absolute -top-32 -left-32 w-[600px] h-[600px] bg-red-700/20 rounded-full blur-[140px] animate-pulse" />
                    <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-blue-700/15 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '2s' }} />
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] bg-red-600/10 rounded-full blur-[80px] animate-pulse" style={{ animationDelay: '1s' }} />
                    {/* Grid */}
                    <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff06_1px,transparent_1px),linear-gradient(to_bottom,#ffffff06_1px,transparent_1px)] bg-[size:60px_60px]" />
                </div>

                {/* Logo */}
                <div className="relative z-10">
                    <Link href="/" className="inline-flex items-center gap-3 group">
                        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-red-500 to-red-700 flex items-center justify-center shadow-[0_0_30px_rgba(239,68,68,0.4)] group-hover:shadow-[0_0_50px_rgba(239,68,68,0.6)] transition-all duration-500">
                            <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                            </svg>
                        </div>
                        <div>
                            <p className="text-3xl font-black text-white tracking-tighter leading-none">
                                Res<span className="text-red-500">Q</span>Track
                            </p>
                            <p className="text-xs font-bold text-slate-500 uppercase tracking-[0.25em] mt-1">Tactical Engine</p>
                        </div>
                    </Link>
                </div>

                {/* Hero Text */}
                <div className="relative z-10 max-w-lg">
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-red-500/10 border border-red-500/20 rounded-full mb-8">
                        <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse shadow-[0_0_8px_rgba(239,68,68,0.8)]" />
                        <span className="text-xs font-bold text-red-400 uppercase tracking-widest">Live Deployment Active</span>
                    </div>
                    <h1 className="text-6xl font-black text-white tracking-tighter leading-[0.9] mb-6">
                        Coordinate.<br/>
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-orange-400">
                            Respond.
                        </span><br/>
                        Save Lives.
                    </h1>
                    <p className="text-slate-400 text-xl font-medium leading-relaxed">
                        The tactical nerve center for Mira-Bhayander's disaster response teams. Real-time, offline-first, built for critical operations.
                    </p>

                    {/* Stats Row */}
                    <div className="flex gap-10 mt-12 pt-10 border-t border-slate-800/50">
                        {[
                            { val: '6', label: 'Active Teams' },
                            { val: '5', label: 'Live Incidents' },
                            { val: '< 2s', label: 'Update Latency' },
                        ].map((s, i) => (
                            <div key={i}>
                                <p className="text-4xl font-black text-white">{s.val}</p>
                                <p className="text-[11px] font-bold text-slate-500 uppercase tracking-[0.2em] mt-1">{s.label}</p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Bottom badge */}
                <div className="relative z-10">
                    <p className="text-xs text-slate-600 font-medium">
                        © 2026 ResQTrack · Mira-Bhayander Emergency Response · v1.0
                    </p>
                </div>
            </div>

            {/* ── RIGHT PANEL — Form ── */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-8 lg:p-16 relative">
                {/* Subtle right-panel bg */}
                <div className="absolute inset-0 bg-slate-900/50 lg:border-l lg:border-white/5" />

                <div className="relative w-full max-w-lg">

                    {/* Mobile Logo */}
                    <div className="lg:hidden text-center mb-10">
                        <Link href="/" className="inline-flex items-center gap-3">
                            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-red-500 to-red-700 flex items-center justify-center shadow-[0_0_20px_rgba(239,68,68,0.4)]">
                                <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                                </svg>
                            </div>
                            <span className="text-2xl font-black text-white tracking-tighter">Res<span className="text-red-500">Q</span>Track</span>
                        </Link>
                    </div>

                    {/* Heading */}
                    <div className="mb-10">
                        <h2 className="text-4xl font-black text-white tracking-tight mb-2">
                            {isRegister ? 'Create Account' : 'Secure Access'}
                        </h2>
                        <p className="text-slate-400 text-lg font-medium">
                            {isRegister
                                ? 'Join the tactical response network'
                                : 'Authenticate to enter the command network'}
                        </p>
                    </div>

                    {/* Error */}
                    {error && (
                        <div className="mb-6 px-5 py-4 bg-red-500/10 border border-red-500/25 rounded-2xl flex items-center gap-3">
                            <div className="w-5 h-5 rounded-full bg-red-500/20 flex items-center justify-center flex-shrink-0">
                                <svg className="w-3 h-3 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </div>
                            <p className="text-red-400 font-semibold text-base">{error}</p>
                        </div>
                    )}

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="space-y-5">
                        {/* Always show Role Selection First */}
                        <div>
                            <label className="block text-sm font-bold text-slate-400 uppercase tracking-widest mb-3">Select Role</label>
                            <div className="grid grid-cols-2 gap-4">
                                {[
                                    { value: 'rescue_team', label: 'Rescue Team', desc: 'Field operations', icon: '🚑' },
                                    { value: 'command_center', label: 'Command Center', desc: 'Coordination hub', icon: '🏢' },
                                ].map(r => (
                                    <button
                                        key={r.value}
                                        type="button"
                                        onClick={() => setForm({ ...form, role: r.value })}
                                        className={`p-5 rounded-2xl border-2 text-left transition-all duration-300 ${form.role === r.value
                                                ? 'bg-red-600/10 border-red-500/50 shadow-[0_0_20px_rgba(239,68,68,0.1)]'
                                                : 'bg-slate-800/30 border-slate-700/50 hover:border-slate-600'
                                            }`}
                                    >
                                        <span className="text-3xl block mb-3">{r.icon}</span>
                                        <p className="text-base font-bold text-white">{r.label}</p>
                                        <p className="text-xs text-slate-500 font-medium mt-1">{r.desc}</p>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {isRegister && (
                            <div>
                                <label className="block text-sm font-bold text-slate-400 uppercase tracking-widest mb-3">Full Name</label>
                                <input
                                    type="text"
                                    value={form.full_name}
                                    onChange={(e) => setForm({ ...form, full_name: e.target.value })}
                                    onFocus={() => setFocusedField('name')}
                                    onBlur={() => setFocusedField(null)}
                                    className={inputClass('name')}
                                    placeholder="Commander Smith"
                                    required={isRegister}
                                />
                            </div>
                        )}

                        <div>
                            <label className="block text-sm font-bold text-slate-400 uppercase tracking-widest mb-3">Email Address</label>
                            <input
                                type="email"
                                value={form.email}
                                onChange={(e) => setForm({ ...form, email: e.target.value })}
                                onFocus={() => setFocusedField('email')}
                                onBlur={() => setFocusedField(null)}
                                className={inputClass('email')}
                                placeholder="you@resqtrack.io"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-slate-400 uppercase tracking-widest mb-3">Password</label>
                            <input
                                type="password"
                                value={form.password}
                                onChange={(e) => setForm({ ...form, password: e.target.value })}
                                onFocus={() => setFocusedField('password')}
                                onBlur={() => setFocusedField(null)}
                                className={inputClass('password')}
                                placeholder="••••••••••••"
                                required
                            />
                        </div>

                        {/* Submit */}
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-5 text-lg font-black uppercase tracking-widest text-white bg-red-600 hover:bg-red-500 disabled:bg-red-800/60 disabled:cursor-wait rounded-2xl shadow-[0_0_30px_rgba(239,68,68,0.25)] hover:shadow-[0_0_40px_rgba(239,68,68,0.4)] transition-all duration-300 active:scale-[0.98] flex items-center justify-center gap-3 mt-3"
                        >
                            {loading ? (
                                <>
                                    <div className="w-5 h-5 border-3 border-white/30 border-t-white rounded-full animate-spin" />
                                    Authenticating...
                                </>
                            ) : (
                                <>
                                    {isRegister ? 'Create Account' : 'Enter System'}
                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                                    </svg>
                                </>
                            )}
                        </button>
                    </form>

                    {/* Toggle Register */}
                    <div className="mt-6 text-center">
                        <button
                            onClick={() => { setIsRegister(!isRegister); setError(''); }}
                            className="text-base text-slate-500 hover:text-white transition-colors font-medium"
                        >
                            {isRegister ? 'Already have an account? ' : "Don't have an account? "}
                            <span className="text-red-400 font-bold hover:text-red-300">
                                {isRegister ? 'Sign In' : 'Register'}
                            </span>
                        </button>
                    </div>

                    {/* Demo Access */}
                    <div className="mt-10 pt-8 border-t border-slate-800/60">
                        <p className="text-xs font-black text-slate-600 uppercase tracking-[0.3em] text-center mb-5">Quick Demo Access</p>
                        <div className="grid grid-cols-2 gap-4">
                            <button
                                onClick={() => handleDemoLogin('command_center')}
                                className="group px-4 py-4 bg-blue-600/5 text-blue-400 border-2 border-blue-500/15 rounded-2xl hover:bg-blue-600/15 hover:border-blue-500/40 transition-all duration-300 flex items-center justify-center gap-3 font-bold text-sm"
                            >
                                <span className="text-2xl">🏢</span>
                                <div className="text-left">
                                    <p className="text-sm font-bold">Command Center</p>
                                    <p className="text-[10px] font-medium text-blue-600 uppercase tracking-wider">Dashboard Access</p>
                                </div>
                            </button>
                            <button
                                onClick={() => handleDemoLogin('rescue_team')}
                                className="group px-4 py-4 bg-emerald-600/5 text-emerald-400 border-2 border-emerald-500/15 rounded-2xl hover:bg-emerald-600/15 hover:border-emerald-500/40 transition-all duration-300 flex items-center justify-center gap-3 font-bold text-sm"
                            >
                                <span className="text-2xl">🚑</span>
                                <div className="text-left">
                                    <p className="text-sm font-bold">Rescue Team</p>
                                    <p className="text-[10px] font-medium text-emerald-600 uppercase tracking-wider">Field Operations</p>
                                </div>
                            </button>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}
