'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';

export default function CitizenLogin() {
    const router = useRouter();
    const [isRegister, setIsRegister] = useState(false);
    const [form, setForm] = useState({ email: '', password: '', full_name: '', phone: '' });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            if (isRegister) {
                await api.register(form.email, form.password, form.full_name, 'citizen');
            } else {
                await api.login(form.email, form.password);
            }
            const user = api.getUser();
            if (user && !user.role) { user.role = 'citizen'; api.setUser(user); }
            router.push('/report');
        } catch (err) {
            setError(err.message || 'Authentication failed. Check your credentials.');
        } finally {
            setLoading(false);
        }
    };

    const handleDemo = () => {
        api.setToken('demo-token-' + Date.now());
        api.setUser({ id: 'demo-citizen', email: 'citizen@resqtrack.io', full_name: 'Demo Citizen', role: 'citizen' });
        router.push('/report');
    };

    return (
        <div className="min-h-screen bg-slate-950 flex overflow-hidden">
            {/* Left Panel */}
            <div className="hidden lg:flex lg:w-1/2 relative flex-col justify-between p-16">
                <div className="absolute inset-0 overflow-hidden">
                    <div className="absolute -top-32 -left-32 w-[600px] h-[600px] bg-red-700/20 rounded-full blur-[140px] animate-pulse" />
                    <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-orange-700/15 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '2s' }} />
                    <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:60px_60px]" />
                </div>

                {/* Logo */}
                <div className="relative z-10">
                    <button onClick={() => router.push('/login')} className="inline-flex items-center gap-3 group">
                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-red-500 to-red-700 flex items-center justify-center shadow-[0_0_25px_rgba(239,68,68,0.4)]">
                            <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                            </svg>
                        </div>
                        <div>
                            <p className="text-2xl font-black text-white tracking-tighter leading-none">Res<span className="text-red-500">Q</span>Track</p>
                            <p className="text-[9px] font-bold text-slate-500 uppercase tracking-[0.25em] mt-0.5">Tactical Engine</p>
                        </div>
                    </button>
                </div>

                {/* Hero */}
                <div className="relative z-10 max-w-lg">
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-red-500/10 border border-red-500/20 rounded-full mb-8">
                        <div className="w-2 h-2 rounded-full bg-red-400 animate-pulse shadow-[0_0_8px_rgba(248,113,113,0.8)]" />
                        <span className="text-xs font-bold text-red-400 uppercase tracking-widest">Citizen Portal</span>
                    </div>
                    <h1 className="text-5xl font-black text-white tracking-tighter leading-[0.95] mb-6">
                        Report.<br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-orange-400">Protect.</span><br />
                        Save Lives.
                    </h1>
                    <p className="text-slate-400 text-lg leading-relaxed">
                        Your eyes are our first line of defense. Sign in to report emergencies, traffic blockages, and safety hazards in real-time.
                    </p>
                    <div className="flex gap-8 mt-10 pt-8 border-t border-slate-800/60">
                        {[{ val: '24/7', label: 'Always Active' }, { val: '< 10m', label: 'Response Time' }, { val: 'GPS', label: 'Auto Location' }].map((s, i) => (
                            <div key={i}>
                                <p className="text-3xl font-black text-white">{s.val}</p>
                                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] mt-1">{s.label}</p>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="relative z-10">
                    <p className="text-xs text-slate-700">© 2026 ResQTrack · Mira-Bhayander Emergency Response</p>
                </div>
            </div>

            {/* Right Panel — Form */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-8 lg:p-16 relative">
                <div className="absolute inset-0 bg-slate-900/50 lg:border-l lg:border-white/5" />
                <div className="relative w-full max-w-lg">

                    {/* Mobile logo */}
                    <div className="lg:hidden flex items-center gap-3 mb-10">
                        <button onClick={() => router.push('/login')} className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-500 to-red-700 flex items-center justify-center shadow-[0_0_20px_rgba(239,68,68,0.4)]">
                                <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                                </svg>
                            </div>
                            <span className="text-xl font-black text-white tracking-tighter">Res<span className="text-red-500">Q</span>Track</span>
                        </button>
                    </div>

                    {/* Back link */}
                    <button onClick={() => router.push('/login')} className="flex items-center gap-2 text-slate-500 hover:text-white text-sm font-bold mb-8 transition-colors group">
                        <svg className="w-4 h-4 group-hover:-translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 12h-15m0 0l6.75 6.75M4.5 12l6.75-6.75" />
                        </svg>
                        All Portals
                    </button>

                    {/* Role badge */}
                    <div className="inline-flex items-center gap-3 px-4 py-2.5 bg-red-600/10 border border-red-500/30 rounded-2xl mb-8">
                        <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-red-500 to-orange-600 flex items-center justify-center" style={{ boxShadow: '0 0 15px rgba(239,68,68,0.4)' }}>
                            <span className="text-sm">🚨</span>
                        </div>
                        <div>
                            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Accessing</p>
                            <p className="text-sm font-black text-white">Citizen Portal</p>
                        </div>
                    </div>

                    <h2 className="text-3xl font-black text-white tracking-tight mb-1">
                        {isRegister ? 'Create Account' : 'Citizen Login'}
                    </h2>
                    <p className="text-slate-400 mb-8">
                        {isRegister ? 'Register to report emergencies & traffic issues' : 'Sign in to report incidents in your area'}
                    </p>

                    {error && (
                        <div className="mb-6 px-5 py-4 bg-red-500/10 border border-red-500/25 rounded-2xl flex items-center gap-3">
                            <svg className="w-4 h-4 text-red-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                            <p className="text-red-400 font-semibold text-sm">{error}</p>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        {isRegister && (
                            <div>
                                <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2">Full Name</label>
                                <input type="text" value={form.full_name} onChange={e => setForm({ ...form, full_name: e.target.value })}
                                    className="w-full px-5 py-4 bg-slate-800/60 border-2 border-slate-700/60 rounded-2xl text-white placeholder-slate-600 outline-none focus:border-red-500/60 transition-all"
                                    placeholder="Your full name" required />
                            </div>
                        )}
                        <div>
                            <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2">Email Address</label>
                            <input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })}
                                className="w-full px-5 py-4 bg-slate-800/60 border-2 border-slate-700/60 rounded-2xl text-white placeholder-slate-600 outline-none focus:border-red-500/60 transition-all"
                                placeholder="you@example.com" required />
                        </div>
                        <div>
                            <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2">Password</label>
                            <input type="password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })}
                                className="w-full px-5 py-4 bg-slate-800/60 border-2 border-slate-700/60 rounded-2xl text-white placeholder-slate-600 outline-none focus:border-red-500/60 transition-all"
                                placeholder="••••••••••••" required />
                        </div>
                        <button type="submit" disabled={loading}
                            className="w-full py-5 text-base font-black uppercase tracking-widest text-white bg-red-600 hover:bg-red-500 disabled:bg-red-800/60 disabled:cursor-wait rounded-2xl shadow-[0_0_30px_rgba(239,68,68,0.25)] hover:shadow-[0_0_40px_rgba(239,68,68,0.4)] transition-all duration-300 active:scale-[0.98] flex items-center justify-center gap-3 mt-2"
                        >
                            {loading ? (
                                <><div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />Authenticating...</>
                            ) : (
                                <>{isRegister ? 'Create Account' : 'Sign In & Report'}
                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                                    </svg>
                                </>
                            )}
                        </button>
                    </form>

                    <div className="mt-5 text-center">
                        <button onClick={() => { setIsRegister(!isRegister); setError(''); }}
                            className="text-sm text-slate-500 hover:text-white transition-colors">
                            {isRegister ? 'Already have an account? ' : "Don't have an account? "}
                            <span className="text-red-400 font-bold hover:text-red-300">{isRegister ? 'Sign In' : 'Register'}</span>
                        </button>
                    </div>

                    <div className="mt-8 pt-6 border-t border-slate-800/60">
                        <p className="text-xs font-black text-slate-600 uppercase tracking-[0.3em] text-center mb-4">Quick Demo</p>
                        <button onClick={handleDemo}
                            className="w-full py-4 bg-slate-800/60 border border-slate-700 text-slate-300 rounded-2xl hover:border-red-500/40 hover:text-white text-sm font-bold transition-all">
                            🚨 Enter as Demo Citizen
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
