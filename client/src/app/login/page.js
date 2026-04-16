'use client';

import { useRouter } from 'next/navigation';

export default function LoginPage() {
    const router = useRouter();

    const portals = [
        {
            role: 'command_center',
            href: '/login/command-center',
            label: 'Command Center',
            subtitle: 'Operations & Coordination',
            description: 'Oversee all rescue operations, assign teams to live incidents, and monitor the full disaster response network.',
            gradient: 'from-blue-600 via-blue-700 to-indigo-800',
            glowColor: 'rgba(37,99,235,0.5)',
            borderColor: 'rgba(59,130,246,0.3)',
            accentColor: '#3b82f6',
            tag: '🏢',
            icon: (
                <svg className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3v11.25A2.25 2.25 0 006 16.5h2.25M3.75 3h-1.5m1.5 0h16.5m0 0h1.5m-1.5 0v11.25A2.25 2.25 0 0118 16.5h-2.25m-7.5 0h7.5m-7.5 0l-1 3m8.5-3l1 3m0 0l.5 1.5m-.5-1.5h-9.5m0 0l-.5 1.5M9 11.25v1.5M12 9v3.75m3-6v6" />
                </svg>
            ),
            features: ['Live incident dashboard', 'Team assignment & dispatch', 'Congestion & route monitoring', 'Full situational awareness'],
            demoRoute: '/dashboard',
        },
        {
            role: 'rescue_team',
            href: '/login/rescue-team',
            label: 'Rescue Team',
            subtitle: 'Field Operations',
            description: 'Receive live mission assignments, GPS-navigate to incidents, and submit real-time field reports.',
            gradient: 'from-emerald-600 via-emerald-700 to-teal-800',
            glowColor: 'rgba(16,185,129,0.5)',
            borderColor: 'rgba(52,211,153,0.3)',
            accentColor: '#10b981',
            tag: '🚑',
            icon: (
                <svg className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                </svg>
            ),
            features: ['Live mission alerts', 'GPS navigation to incidents', 'Report incidents from field', 'Offline-first operation'],
            demoRoute: '/rescue',
        },
    ];

    const handleDemoLogin = (portal) => {
        if (typeof window === 'undefined') return;
        const demoUser = {
            id: 'demo-' + portal.role,
            email: 'demo@resqtrack.io',
            full_name: portal.role === 'command_center' ? 'Command Admin' : 'Alpha Team Lead',
            role: portal.role,
        };
        localStorage.setItem('resqtrack_token', 'demo-token-' + Date.now());
        localStorage.setItem('resqtrack_user', JSON.stringify(demoUser));
        window.location.href = portal.demoRoute;
    };

    return (
        <div className="min-h-screen bg-slate-950 flex flex-col relative overflow-hidden">
            {/* Background */}
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-blue-700/10 rounded-full blur-[150px]" />
                <div className="absolute bottom-0 right-1/4 w-[600px] h-[600px] bg-emerald-700/10 rounded-full blur-[150px]" />
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff03_1px,transparent_1px),linear-gradient(to_bottom,#ffffff03_1px,transparent_1px)] bg-[size:60px_60px]" />
            </div>

            {/* Header */}
            <header className="relative z-10 flex items-center justify-center pt-10 pb-4">
                <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-red-500 to-red-700 flex items-center justify-center shadow-[0_0_25px_rgba(239,68,68,0.4)]">
                        <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                        </svg>
                    </div>
                    <div>
                        <p className="text-xl font-black text-white tracking-tighter leading-none">
                            Res<span className="text-red-500">Q</span>Track
                        </p>
                        <p className="text-[9px] font-bold text-slate-500 uppercase tracking-[0.25em]">Tactical Engine</p>
                    </div>
                </div>
            </header>

            {/* Hero */}
            <div className="relative z-10 text-center pt-8 pb-12 px-4">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-red-500/10 border border-red-500/20 rounded-full mb-6">
                    <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse shadow-[0_0_8px_rgba(239,68,68,0.8)]" />
                    <span className="text-xs font-bold text-red-400 uppercase tracking-widest">Live Deployment Active</span>
                </div>
                <h1 className="text-4xl sm:text-5xl font-black text-white tracking-tight mb-4">
                    Select Your Portal
                </h1>
                <p className="text-slate-400 text-lg max-w-xl mx-auto">
                    Choose your operational role to access the ResQTrack command network.
                </p>
            </div>

            {/* Portal Cards */}
            <main className="relative z-10 flex-1 flex items-start justify-center px-4 pb-16">
                <div className="grid md:grid-cols-2 gap-6 w-full max-w-4xl">
                    {portals.map((portal) => (
                        <div key={portal.role} className="flex flex-col">
                            {/* Main Card */}
                            <button
                                onClick={() => router.push(portal.href)}
                                className="group flex-1 relative text-left p-8 rounded-3xl border bg-slate-900/80 hover:bg-slate-900 transition-all duration-300 hover:-translate-y-2"
                                style={{
                                    borderColor: portal.borderColor,
                                    boxShadow: `0 0 0 0 ${portal.glowColor}`,
                                }}
                                onMouseEnter={e => e.currentTarget.style.boxShadow = `0 20px 60px ${portal.glowColor}`}
                                onMouseLeave={e => e.currentTarget.style.boxShadow = `0 0 0 0 ${portal.glowColor}`}
                            >
                                {/* Icon bubble */}
                                <div
                                    className={`w-20 h-20 rounded-2xl bg-gradient-to-br ${portal.gradient} flex items-center justify-center text-white mb-6 group-hover:scale-110 transition-transform duration-300 shadow-xl`}
                                    style={{ boxShadow: `0 0 40px ${portal.glowColor}` }}
                                >
                                    {portal.icon}
                                </div>

                                {/* Label */}
                                <div className="mb-5">
                                    <p className="text-xs font-black text-slate-500 uppercase tracking-[0.2em] mb-1">{portal.subtitle}</p>
                                    <h2 className="text-2xl font-black text-white tracking-tight mb-3">{portal.label}</h2>
                                    <p className="text-slate-400 leading-relaxed">{portal.description}</p>
                                </div>

                                {/* Feature list */}
                                <ul className="space-y-2 mb-6">
                                    {portal.features.map((f, i) => (
                                        <li key={i} className="flex items-center gap-3 text-sm text-slate-400">
                                            <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: portal.accentColor }} />
                                            {f}
                                        </li>
                                    ))}
                                </ul>

                                {/* CTA */}
                                <div className="flex items-center justify-between pt-5 border-t" style={{ borderColor: portal.borderColor }}>
                                    <span className="text-sm font-black uppercase tracking-widest" style={{ color: portal.accentColor }}>
                                        Login / Register
                                    </span>
                                    <div
                                        className="w-10 h-10 rounded-full flex items-center justify-center group-hover:translate-x-1 transition-transform"
                                        style={{ background: `${portal.accentColor}20`, border: `1px solid ${portal.accentColor}40` }}
                                    >
                                        <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12h15m0 0l-6.75-6.75M19.5 12l-6.75 6.75" />
                                        </svg>
                                    </div>
                                </div>

                                {/* Tag */}
                                <div className="absolute top-6 right-6 text-3xl">{portal.tag}</div>
                            </button>

                            {/* Demo shortcut below each card */}
                            <button
                                onClick={() => handleDemoLogin(portal)}
                                className="mt-3 w-full py-3 text-xs font-bold uppercase tracking-widest rounded-2xl border border-slate-800 text-slate-600 hover:text-slate-300 hover:border-slate-600 transition-all"
                            >
                                Try Demo — {portal.label}
                            </button>
                        </div>
                    ))}
                </div>
            </main>

            {/* Footer */}
            <div className="relative z-10 text-center pb-6">
                <p className="text-xs text-slate-700">© 2026 ResQTrack · Mira-Bhayander Emergency Response · v1.0</p>
            </div>
        </div>
    );
}
