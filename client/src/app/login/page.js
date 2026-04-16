'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';

export default function LoginPage() {
    const router = useRouter();

    // Step 1 = role picker, Step 2 = credentials form
    const [step, setStep] = useState(1);
    const [selectedRole, setSelectedRole] = useState(null);
    const [isRegister, setIsRegister] = useState(false);
    const [form, setForm] = useState({ email: '', password: '', full_name: '' });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const roles = [
        {
            value: 'command_center',
            label: 'Command Center',
            subtitle: 'Coordination Hub',
            description: 'Oversee all operations, assign teams to incidents, and monitor the full disaster response network in real time.',
            icon: (
                <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3v11.25A2.25 2.25 0 006 16.5h2.25M3.75 3h-1.5m1.5 0h16.5m0 0h1.5m-1.5 0v11.25A2.25 2.25 0 0118 16.5h-2.25m-7.5 0h7.5m-7.5 0l-1 3m8.5-3l1 3m0 0l.5 1.5m-.5-1.5h-9.5m0 0l-.5 1.5m.75-9l3-3 2.148 2.148A12.061 12.061 0 0116.5 7.605" />
                </svg>
            ),
            color: 'blue',
            gradient: 'from-blue-600 to-indigo-700',
            glow: 'rgba(37,99,235,0.4)',
            border: 'border-blue-500/40',
            bg: 'bg-blue-600/10',
            ring: 'ring-blue-500/30',
            tag: '🏢',
        },
        {
            value: 'rescue_team',
            label: 'Rescue Team',
            subtitle: 'Field Operations',
            description: 'Receive live mission assignments, track your route to incidents, and report real-time updates from the field.',
            icon: (
                <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                </svg>
            ),
            color: 'emerald',
            gradient: 'from-emerald-600 to-teal-700',
            glow: 'rgba(16,185,129,0.4)',
            border: 'border-emerald-500/40',
            bg: 'bg-emerald-600/10',
            ring: 'ring-emerald-500/30',
            tag: '🚑',
        },
    ];

    const handleRoleSelect = (role) => {
        setSelectedRole(role);
        setStep(2);
        setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            if (isRegister) {
                await api.register(form.email, form.password, form.full_name, selectedRole.value);
            } else {
                await api.login(form.email, form.password);
                // Override the DB role with what the user explicitly chose
                const currentUser = api.getUser();
                if (currentUser) {
                    currentUser.role = selectedRole.value;
                    api.setUser(currentUser);
                }
            }

            const user = api.getUser();
            if (user?.role === 'command_center' || user?.role === 'admin') {
                router.push('/dashboard');
            } else {
                router.push('/rescue');
            }
        } catch (err) {
            setError(err.message || 'Authentication failed. Please check your credentials.');
        } finally {
            setLoading(false);
        }
    };

    const handleDemoLogin = (role) => {
        const r = roles.find(r => r.value === role);
        const demoUser = {
            id: 'demo-' + role,
            email: 'demo@resqtrack.io',
            full_name: role === 'command_center' ? 'Command Admin' : 'Alpha Team Lead',
            role,
        };
        api.setToken('demo-token-' + Date.now());
        api.setUser(demoUser);
        router.push(role === 'command_center' ? '/dashboard' : '/rescue');
    };

    const roleObj = roles.find(r => r.value === selectedRole?.value);

    return (
        <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 relative overflow-hidden">
            {/* Background effects */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-40 -left-40 w-[700px] h-[700px] bg-red-700/10 rounded-full blur-[160px]" />
                <div className="absolute -bottom-40 -right-40 w-[600px] h-[600px] bg-blue-700/10 rounded-full blur-[160px]" />
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff04_1px,transparent_1px),linear-gradient(to_bottom,#ffffff04_1px,transparent_1px)] bg-[size:60px_60px]" />
            </div>

            <div className="relative w-full max-w-5xl">

                {/* Logo */}
                <div className="text-center mb-10">
                    <div className="inline-flex items-center gap-3">
                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-red-500 to-red-700 flex items-center justify-center shadow-[0_0_30px_rgba(239,68,68,0.4)]">
                            <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                            </svg>
                        </div>
                        <div className="text-left">
                            <p className="text-2xl font-black text-white tracking-tighter leading-none">
                                Res<span className="text-red-500">Q</span>Track
                            </p>
                            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.25em]">Tactical Engine</p>
                        </div>
                    </div>
                </div>

                {/* ─── STEP 1: Role Picker ────────────────────────────────────────── */}
                {step === 1 && (
                    <div>
                        <div className="text-center mb-10">
                            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-red-500/10 border border-red-500/20 rounded-full mb-5">
                                <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse shadow-[0_0_8px_rgba(239,68,68,0.8)]" />
                                <span className="text-xs font-bold text-red-400 uppercase tracking-widest">Live Deployment Active</span>
                            </div>
                            <h1 className="text-4xl font-black text-white tracking-tight mb-3">Who are you logging in as?</h1>
                            <p className="text-slate-400 text-lg">Select your role to access the right operational view.</p>
                        </div>

                        <div className="grid md:grid-cols-2 gap-6 max-w-3xl mx-auto">
                            {roles.map((role) => (
                                <button
                                    key={role.value}
                                    onClick={() => handleRoleSelect(role)}
                                    className={`group relative text-left p-8 rounded-3xl border-2 ${role.border} bg-slate-900 hover:${role.bg} transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl focus:outline-none focus:ring-4 ${role.ring}`}
                                    style={{
                                        '--glow': role.glow,
                                    }}
                                >
                                    {/* Icon */}
                                    <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${role.gradient} flex items-center justify-center text-white mb-6 shadow-lg group-hover:scale-110 transition-transform duration-300`}
                                        style={{ boxShadow: `0 0 30px ${role.glow}` }}>
                                        {role.icon}
                                    </div>

                                    {/* Content */}
                                    <div className="mb-5">
                                        <p className="text-xs font-black text-slate-500 uppercase tracking-[0.2em] mb-1">{role.subtitle}</p>
                                        <h2 className="text-2xl font-black text-white tracking-tight mb-3">{role.label}</h2>
                                        <p className="text-slate-400 text-base leading-relaxed">{role.description}</p>
                                    </div>

                                    {/* CTA Arrow */}
                                    <div className="flex items-center gap-2 text-slate-500 group-hover:text-white transition-colors">
                                        <span className="text-sm font-bold uppercase tracking-widest">Select Role</span>
                                        <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12h15m0 0l-6.75-6.75M19.5 12l-6.75 6.75" />
                                        </svg>
                                    </div>

                                    {/* Emoji tag */}
                                    <div className="absolute top-6 right-6 text-3xl">{role.tag}</div>
                                </button>
                            ))}
                        </div>

                        {/* Quick Demo */}
                        <div className="text-center mt-10">
                            <p className="text-xs font-black text-slate-600 uppercase tracking-[0.3em] mb-4">Quick Demo Access</p>
                            <div className="flex justify-center flex-wrap gap-3">
                                <button onClick={() => handleDemoLogin('command_center')}
                                    className="px-5 py-3 bg-slate-800/80 border border-slate-700 text-slate-300 rounded-2xl hover:border-blue-500/50 hover:text-white text-sm font-bold transition-all">
                                    🏢 Demo Command Center
                                </button>
                                <button onClick={() => handleDemoLogin('rescue_team')}
                                    className="px-5 py-3 bg-slate-800/80 border border-slate-700 text-slate-300 rounded-2xl hover:border-emerald-500/50 hover:text-white text-sm font-bold transition-all">
                                    🚑 Demo Rescue Team
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* ─── STEP 2: Credentials Form ───────────────────────────────────── */}
                {step === 2 && roleObj && (
                    <div className="max-w-md mx-auto w-full">

                        {/* Back button */}
                        <button
                            onClick={() => { setStep(1); setError(''); setForm({ email: '', password: '', full_name: '' }); }}
                            className="flex items-center gap-2 text-slate-500 hover:text-white text-sm font-bold mb-8 transition-colors group"
                        >
                            <svg className="w-4 h-4 group-hover:-translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 12h-15m0 0l6.75 6.75M4.5 12l6.75-6.75" />
                            </svg>
                            Change Role
                        </button>

                        {/* Role context badge */}
                        <div className={`inline-flex items-center gap-3 px-4 py-2.5 rounded-2xl border ${roleObj.border} ${roleObj.bg} mb-8`}>
                            <div className={`w-8 h-8 rounded-xl bg-gradient-to-br ${roleObj.gradient} flex items-center justify-center`}
                                style={{ boxShadow: `0 0 15px ${roleObj.glow}` }}>
                                <span className="text-sm">{roleObj.tag}</span>
                            </div>
                            <div>
                                <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">Logging in as</p>
                                <p className="text-sm font-black text-white">{roleObj.label}</p>
                            </div>
                        </div>

                        {/* Heading */}
                        <h2 className="text-3xl font-black text-white tracking-tight mb-1">
                            {isRegister ? 'Create Account' : 'Secure Access'}
                        </h2>
                        <p className="text-slate-400 text-base mb-8">
                            {isRegister ? 'Join the tactical response network' : 'Authenticate to enter the command network'}
                        </p>

                        {/* Error */}
                        {error && (
                            <div className="mb-6 px-5 py-4 bg-red-500/10 border border-red-500/25 rounded-2xl flex items-center gap-3">
                                <div className="w-5 h-5 rounded-full bg-red-500/20 flex items-center justify-center flex-shrink-0">
                                    <svg className="w-3 h-3 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </div>
                                <p className="text-red-400 font-semibold text-sm">{error}</p>
                            </div>
                        )}

                        {/* Form */}
                        <form onSubmit={handleSubmit} className="space-y-4">
                            {isRegister && (
                                <div>
                                    <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2">Full Name</label>
                                    <input
                                        type="text"
                                        value={form.full_name}
                                        onChange={(e) => setForm({ ...form, full_name: e.target.value })}
                                        className="w-full px-5 py-4 bg-slate-800/60 border-2 border-slate-700/60 rounded-2xl text-white text-base placeholder-slate-600 outline-none focus:border-red-500/60 transition-all"
                                        placeholder="Commander Smith"
                                        required={isRegister}
                                    />
                                </div>
                            )}

                            <div>
                                <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2">Email Address</label>
                                <input
                                    type="email"
                                    value={form.email}
                                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                                    className="w-full px-5 py-4 bg-slate-800/60 border-2 border-slate-700/60 rounded-2xl text-white text-base placeholder-slate-600 outline-none focus:border-red-500/60 transition-all"
                                    placeholder="you@resqtrack.io"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2">Password</label>
                                <input
                                    type="password"
                                    value={form.password}
                                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                                    className="w-full px-5 py-4 bg-slate-800/60 border-2 border-slate-700/60 rounded-2xl text-white text-base placeholder-slate-600 outline-none focus:border-red-500/60 transition-all"
                                    placeholder="••••••••••••"
                                    required
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full py-5 text-base font-black uppercase tracking-widest text-white bg-red-600 hover:bg-red-500 disabled:bg-red-800/60 disabled:cursor-wait rounded-2xl shadow-[0_0_30px_rgba(239,68,68,0.25)] hover:shadow-[0_0_40px_rgba(239,68,68,0.4)] transition-all duration-300 active:scale-[0.98] flex items-center justify-center gap-3 mt-2"
                            >
                                {loading ? (
                                    <>
                                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
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

                        <div className="mt-6 text-center">
                            <button
                                onClick={() => { setIsRegister(!isRegister); setError(''); }}
                                className="text-sm text-slate-500 hover:text-white transition-colors font-medium"
                            >
                                {isRegister ? 'Already have an account? ' : "Don't have an account? "}
                                <span className="text-red-400 font-bold hover:text-red-300">
                                    {isRegister ? 'Sign In' : 'Register'}
                                </span>
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
