'use client';
import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'command' | 'rescue'>('command');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const router = useRouter();

  const demoCredentials = {
    command: { email: 'command@resqtrack.com', password: 'admin123' },
    rescue: { email: 'rescue@resqtrack.com', password: 'rescue123' },
  };

  const fillDemo = () => {
    const creds = demoCredentials[role];
    setEmail(creds.email);
    setPassword(creds.password);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const success = await login(email, password);
    if (success) {
      router.push(role === 'command' ? '/dashboard' : '/team');
    } else {
      setError('Invalid credentials. Try using the demo credentials below.');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Panel */}
      <div className="hidden lg:flex lg:w-[45%] relative overflow-hidden items-center justify-center">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-blue-950 to-red-950"></div>
        <div className="absolute inset-0" style={{backgroundImage: 'radial-gradient(circle at 30% 50%, rgba(211,47,47,0.15) 0%, transparent 50%), radial-gradient(circle at 70% 30%, rgba(13,71,161,0.2) 0%, transparent 50%)'}}></div>
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{backgroundImage: 'linear-gradient(rgba(255,255,255,1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,1) 1px, transparent 1px)', backgroundSize: '50px 50px'}}></div>
        <div className="absolute top-1/4 left-1/4 w-48 h-48 rounded-full border border-white/5 animate-pulse-ring pointer-events-none"></div>
        
        <div className="relative z-10 text-center px-12 max-w-md">
          <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-red-600 to-red-500 mx-auto mb-8 flex items-center justify-center text-white text-4xl font-black shadow-2xl shadow-red-500/30">R</div>
          <h1 className="text-4xl font-black text-white mb-3 tracking-tight">ResQ<span className="text-red-400">Track</span></h1>
          <p className="text-white/50 text-lg mb-10">Smart Disaster Response Coordination</p>
          <div className="space-y-4 text-left">
            {[
              { text: 'Real-time rescue team tracking', icon: '📍' },
              { text: 'AI-powered congestion detection', icon: '🧠' },
              { text: 'Offline-first architecture', icon: '📡' },
              { text: 'Centralized command dashboard', icon: '🖥️' },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-4 bg-white/5 rounded-2xl px-5 py-3.5 border border-white/5">
                <span className="text-xl">{item.icon}</span>
                <span className="text-white/70 text-sm font-medium">{item.text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Panel - Form */}
      <div className="w-full lg:w-[55%] flex items-center justify-center bg-gray-50 p-8">
        <div className="w-full max-w-md">
          <Link href="/" className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-red-600 transition-colors mb-10 group">
            <svg className="w-4 h-4 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
            Back to Home
          </Link>

          <div className="mb-8">
            <h2 className="text-3xl font-black text-gray-900 mb-2 tracking-tight">Welcome Back</h2>
            <p className="text-gray-500">Sign in to access your ResQTrack dashboard</p>
          </div>

          {/* Role Selector */}
          <div className="flex bg-gray-100 rounded-2xl p-1.5 mb-8">
            {(['command', 'rescue'] as const).map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => { setRole(r); setError(''); }}
                className={`flex-1 py-3.5 px-4 rounded-xl text-sm font-bold transition-all duration-300 cursor-pointer ${
                  role === r
                    ? r === 'command'
                      ? 'bg-gradient-to-r from-blue-700 to-blue-600 text-white shadow-lg shadow-blue-700/30'
                      : 'bg-gradient-to-r from-red-600 to-red-500 text-white shadow-lg shadow-red-600/30'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                {r === 'command' ? '🖥️ Command Center' : '🚑 Rescue Team'}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input-field"
                placeholder="Enter your email address"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input-field"
                placeholder="Enter your password"
                required
              />
            </div>

            {error && (
              <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4 text-sm text-red-700 font-medium flex items-center gap-2">
                <span className="text-red-500">⚠️</span> {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className={`w-full py-4 rounded-xl font-bold text-white transition-all duration-300 text-sm cursor-pointer ${
                role === 'command'
                  ? 'bg-gradient-to-r from-blue-700 to-blue-600 shadow-lg shadow-blue-700/30 hover:shadow-xl hover:shadow-blue-700/40 hover:-translate-y-0.5'
                  : 'bg-gradient-to-r from-red-600 to-red-500 shadow-lg shadow-red-600/30 hover:shadow-xl hover:shadow-red-600/40 hover:-translate-y-0.5'
              } disabled:opacity-50 disabled:hover:translate-y-0 disabled:cursor-not-allowed`}
            >
              {loading ? (
                <span className="inline-flex items-center gap-2">
                  <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path></svg>
                  Signing In...
                </span>
              ) : 'Sign In →'}
            </button>
          </form>

          {/* Demo Credentials */}
          <div className="mt-8 rounded-2xl border-2 border-dashed border-blue-200 bg-blue-50/50 p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-blue-800 uppercase tracking-wider flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
                Demo Credentials
              </span>
              <button type="button" onClick={fillDemo} className="text-xs font-bold text-blue-600 hover:text-blue-800 bg-blue-100 hover:bg-blue-200 px-3 py-1.5 rounded-lg transition-all cursor-pointer">
                ✨ Auto-fill
              </button>
            </div>
            <div className="text-sm text-blue-700 space-y-1.5 font-mono">
              <p><span className="text-blue-500 font-sans font-medium">Email:</span> {demoCredentials[role].email}</p>
              <p><span className="text-blue-500 font-sans font-medium">Pass:</span> {demoCredentials[role].password}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
