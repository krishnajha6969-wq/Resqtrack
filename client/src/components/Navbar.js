'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';

export default function Navbar() {
    const pathname = usePathname();
    const [user, setUser] = useState(null);
    const [mobileOpen, setMobileOpen] = useState(false);

    useEffect(() => {
        const stored = localStorage.getItem('resqtrack_user');
        if (stored) setUser(JSON.parse(stored));
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('resqtrack_token');
        localStorage.removeItem('resqtrack_user');
        window.location.href = '/login';
    };

    const navLinks = user ? [
        { href: '/dashboard', label: 'Command Center', roles: ['command_center', 'admin'] },
        { href: '/incidents', label: 'Incidents', roles: ['command_center', 'admin', 'rescue_team'] },
        { href: '/rescue', label: 'Field Ops', roles: ['rescue_team'] },
        { href: '/analytics', label: 'Analytics', roles: ['command_center', 'admin'] },
    ].filter(link => link.roles.includes(user.role)) : [];

    const isActive = (href) => pathname === href;

    return (
        <nav className="bg-slate-950/40 backdrop-blur-xl border-b border-white/5 sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-20">
                    {/* Logo */}
                    <Link href="/" className="flex items-center gap-3 group">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-red-500 to-red-700 flex items-center justify-center shadow-[0_0_20px_rgba(239,68,68,0.3)] group-hover:shadow-[0_0_30px_rgba(239,68,68,0.5)] transition-all duration-500 group-hover:rotate-12">
                            <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                            </svg>
                        </div>
                        <div className="flex flex-col">
                            <span className="text-2xl font-black text-white tracking-tighter leading-none">
                                Res<span className="text-red-500">Q</span>Track
                            </span>
                            <span className="text-[11px] text-slate-500 font-bold uppercase tracking-[0.2em] leading-none mt-1">Tactical Engine</span>
                        </div>
                    </Link>

                    {/* Desktop Nav */}
                    <div className="hidden md:flex items-center gap-2">
                        {navLinks.map(link => (
                            <Link
                                key={link.href}
                                href={link.href}
                                className={`px-5 py-2.5 rounded-xl text-sm font-bold uppercase tracking-wider transition-all duration-300 ${isActive(link.href)
                                        ? 'bg-red-600/10 text-red-500 border border-red-500/20 shadow-[0_0_15px_rgba(239,68,68,0.1)]'
                                        : 'text-slate-400 hover:bg-white/5 hover:text-white'
                                    }`}
                            >
                                {link.label}
                            </Link>
                        ))}
                    </div>

                    {/* Right Side */}
                    <div className="flex items-center gap-3">
                        {/* Status Indicator */}
                        <div className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-full bg-slate-800 border border-slate-700">
                            <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                            <span className="text-sm text-slate-400 font-medium">Online</span>
                        </div>

                        {user ? (
                            <div className="flex items-center gap-4">
                                <div className="hidden lg:flex flex-col items-end">
                                    <p className="text-base font-bold text-white leading-none">{user.full_name}</p>
                                    <p className="text-xs text-slate-500 font-bold uppercase tracking-tighter mt-1">{user.role?.replace('_', ' ')}</p>
                                </div>
                                <button
                                    onClick={handleLogout}
                                    className="px-5 py-2.5 text-sm font-bold text-slate-300 bg-white/5 hover:bg-red-600 hover:text-white rounded-xl border border-white/10 hover:border-red-500 transition-all duration-300 active:scale-95"
                                >
                                    Log Out
                                </button>
                            </div>
                        ) : (
                            <Link
                                href="/login"
                                className="px-6 py-3 text-sm font-black uppercase tracking-widest text-white bg-red-600 hover:bg-red-500 rounded-xl shadow-[0_0_20px_rgba(239,68,68,0.2)] hover:shadow-[0_0_30px_rgba(239,68,68,0.4)] transition-all duration-300 active:scale-95"
                            >
                                Deployment Login
                            </Link>
                        )}

                        {/* Mobile Menu Toggle */}
                        <button
                            onClick={() => setMobileOpen(!mobileOpen)}
                            className="md:hidden p-2 text-slate-400 hover:text-white rounded-lg"
                        >
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                                {mobileOpen ? (
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                ) : (
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
                                )}
                            </svg>
                        </button>
                    </div>
                </div>

                {/* Mobile Nav */}
                {mobileOpen && (
                    <div className="md:hidden py-3 border-t border-slate-700/50">
                        {navLinks.map(link => (
                            <Link
                                key={link.href}
                                href={link.href}
                                onClick={() => setMobileOpen(false)}
                                className={`block px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${isActive(link.href)
                                        ? 'bg-red-600/20 text-red-400'
                                        : 'text-slate-300 hover:bg-slate-800'
                                    }`}
                            >
                                {link.label}
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </nav>
    );
}
