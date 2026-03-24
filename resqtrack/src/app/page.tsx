'use client';
import Link from 'next/link';
import { useState, useEffect } from 'react';

const features = [
  { icon: '📍', title: 'Real-Time GPS Tracking', desc: 'Track every rescue vehicle with live GPS updates on an interactive map with sub-second accuracy.', gradient: 'from-red-500/10 to-red-600/5' },
  { icon: '🚧', title: 'Smart Congestion Detection', desc: 'AI-powered congestion analysis detects traffic jams and immediately suggests optimized route alternatives.', gradient: 'from-orange-500/10 to-orange-600/5' },
  { icon: '📡', title: 'Offline-First Architecture', desc: 'Full offline operation with pre-downloaded maps and local route calculation. No internet? No problem.', gradient: 'from-blue-500/10 to-blue-600/5' },
  { icon: '🚨', title: 'Instant Incident Reporting', desc: 'One-tap emergency reporting for injuries, road blocks, fire, floods, and infrastructure damage.', gradient: 'from-purple-500/10 to-purple-600/5' },
  { icon: '📊', title: 'Live Command Dashboard', desc: 'Bird\'s-eye view of all operations. Track teams, manage incidents, assign resources from one place.', gradient: 'from-green-500/10 to-green-600/5' },
  { icon: '🔄', title: 'P2P Data Mesh Network', desc: 'Bluetooth and WiFi Direct enable device-to-device data exchange when cellular networks are down.', gradient: 'from-cyan-500/10 to-cyan-600/5' },
];

const workflow = [
  { step: '01', title: 'Mission Assignment', desc: 'Command center dispatches rescue teams based on real-time proximity and incident urgency.', color: '#D32F2F' },
  { step: '02', title: 'GPS Tracking Begins', desc: 'Mobile app activates continuous GPS tracking and syncs position to the live operations map.', color: '#E65100' },
  { step: '03', title: 'Smart Monitoring', desc: 'System watches vehicle speeds, detects congestion, and identifies road blockages automatically.', color: '#F9A825' },
  { step: '04', title: 'Local Data Sharing', desc: 'Nearby rescue teams exchange critical intel via Bluetooth and WiFi Direct mesh network.', color: '#2E7D32' },
  { step: '05', title: 'Cloud Sync', desc: 'When internet returns, all offline data synchronizes with the command center in real-time.', color: '#0D47A1' },
  { step: '06', title: 'Route Optimization', desc: 'AI analyzes congestion patterns and provides optimized routes for fastest emergency response.', color: '#6A1B9A' },
];

const stats = [
  { value: '< 2s', label: 'Dashboard Load', sub: 'Optimized rendering' },
  { value: '500ms', label: 'Realtime Latency', sub: 'WebSocket powered' },
  { value: '10K+', label: 'Vehicles Tracked', sub: 'Concurrent connections' },
  { value: '99.9%', label: 'System Uptime', sub: 'Enterprise SLA' },
];

export default function LandingPage() {
  const [scrollY, setScrollY] = useState(0);
  const [activeStep, setActiveStep] = useState(0);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const timer = setInterval(() => setActiveStep(prev => (prev + 1) % 6), 3000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="min-h-screen bg-white overflow-x-hidden">
      {/* ===== FIXED NAV ===== */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${scrollY > 60 ? 'glass shadow-xl py-2' : 'bg-transparent py-4'}`}>
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5 relative z-10">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-600 to-red-500 flex items-center justify-center text-white font-black text-lg shadow-lg shadow-red-500/30">R</div>
            <span className="text-xl font-extrabold tracking-tight">
              <span className={scrollY > 60 ? 'text-gray-900' : 'text-white'}>ResQ</span>
              <span className="text-red-500">Track</span>
            </span>
          </Link>
          <div className="hidden md:flex items-center gap-8">
            {['Features', 'Workflow', 'Performance', 'Contact'].map(item => (
              <a key={item} href={`#${item.toLowerCase()}`} className={`text-sm font-medium transition-colors hover:text-red-500 ${scrollY > 60 ? 'text-gray-600' : 'text-white/80'}`}>{item}</a>
            ))}
          </div>
          <div className="flex items-center gap-3 relative z-10">
            <Link href="/login" className={`text-sm font-semibold px-5 py-2.5 rounded-xl transition-all ${scrollY > 60 ? 'text-gray-700 hover:text-red-600' : 'text-white/90 hover:text-white'}`}>Sign In</Link>
            <Link href="/login" className="btn-primary !py-2.5 !px-6 !text-sm !rounded-xl">Get Started →</Link>
          </div>
        </div>
      </nav>

      {/* ===== HERO ===== */}
      <section className="relative min-h-screen flex items-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-blue-950 to-red-950"></div>
        <div className="absolute inset-0" style={{backgroundImage: 'radial-gradient(circle at 25% 40%, rgba(211,47,47,0.15) 0%, transparent 50%), radial-gradient(circle at 75% 30%, rgba(13,71,161,0.2) 0%, transparent 50%), radial-gradient(circle at 50% 90%, rgba(139,92,246,0.1) 0%, transparent 40%)'}}></div>
        
        {/* Decorative radar rings - pointer-events: none so they don't block clicks */}
        <div className="absolute top-1/3 left-1/4 w-72 h-72 rounded-full border border-white/5 animate-pulse-ring pointer-events-none"></div>
        <div className="absolute top-1/2 right-1/3 w-48 h-48 rounded-full border border-red-400/10 animate-pulse-ring pointer-events-none" style={{animationDelay: '0.7s'}}></div>
        
        {/* Grid bg */}
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{backgroundImage: 'linear-gradient(rgba(255,255,255,1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,1) 1px, transparent 1px)', backgroundSize: '60px 60px'}}></div>

        <div className="relative z-10 max-w-7xl mx-auto px-6 pt-28 pb-20 grid lg:grid-cols-2 gap-16 items-center">
          <div className="animate-fade-in">
            <div className="inline-flex items-center gap-2.5 bg-white/8 backdrop-blur-md border border-white/15 rounded-full px-5 py-2 mb-8">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-400"></span>
              </span>
              <span className="text-white/80 text-sm font-medium tracking-wide">Live Coordination System Active</span>
            </div>
            <h1 className="text-5xl lg:text-[4.5rem] font-black text-white leading-[1.1] mb-7 tracking-tight">
              Smart{' '}
              <span className="bg-gradient-to-r from-red-400 to-rose-300 bg-clip-text text-transparent">Disaster</span>{' '}
              Response{' '}
              <span className="bg-gradient-to-r from-blue-400 to-cyan-300 bg-clip-text text-transparent">Coordination</span>
            </h1>
            <p className="text-lg text-white/60 leading-relaxed mb-10 max-w-xl">
              Coordinate rescue teams in real-time. Track vehicles, detect congestion, optimize routes, and save more lives — even without internet connectivity.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link href="/login" className="btn-primary !text-base !px-10 !py-4 !rounded-2xl">
                Launch Dashboard
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg>
              </Link>
              <a href="#features" className="btn-ghost !text-base !px-10 !py-4 !rounded-2xl">
                Explore Features
              </a>
            </div>

            {/* Mini stats */}
            <div className="flex gap-8 mt-12 pt-8 border-t border-white/10">
              {[{v:'10K+', l:'Vehicles'}, {v:'24/7', l:'Monitoring'}, {v:'<500ms', l:'Latency'}].map((s, i) => (
                <div key={i}>
                  <p className="text-2xl font-black text-white">{s.v}</p>
                  <p className="text-xs text-white/40 mt-1">{s.l}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Hero Visual - Interactive Map Preview */}
          <div className="hidden lg:block animate-float pointer-events-none">
            <div className="relative w-full max-w-md mx-auto">
              <div className="rounded-3xl bg-white/5 backdrop-blur-xl border border-white/10 p-6 shadow-2xl shadow-black/20">
                <div className="rounded-2xl bg-gradient-to-br from-slate-800/80 to-slate-900/80 aspect-square flex flex-col items-center justify-center relative overflow-hidden">
                  {/* Simulated map grid */}
                  <div className="absolute inset-0 opacity-20" style={{backgroundImage: 'linear-gradient(rgba(255,255,255,.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.1) 1px, transparent 1px)', backgroundSize: '40px 40px'}}></div>
                  
                  {/* Floating vehicle markers */}
                  <div className="absolute top-[15%] left-[20%] w-10 h-10 rounded-full bg-red-500/90 flex items-center justify-center text-lg shadow-lg shadow-red-500/40 animate-pulse">🚑</div>
                  <div className="absolute top-[30%] right-[15%] w-10 h-10 rounded-full bg-orange-500/90 flex items-center justify-center text-lg shadow-lg shadow-orange-500/40 animate-pulse" style={{animationDelay: '0.5s'}}>🚒</div>
                  <div className="absolute bottom-[35%] left-[15%] w-10 h-10 rounded-full bg-blue-500/90 flex items-center justify-center text-lg shadow-lg shadow-blue-500/40 animate-pulse" style={{animationDelay: '1s'}}>🚓</div>
                  <div className="absolute bottom-[15%] right-[25%] w-10 h-10 rounded-full bg-green-500/90 flex items-center justify-center text-lg shadow-lg shadow-green-500/40 animate-pulse" style={{animationDelay: '1.5s'}}>🚚</div>

                  {/* Center content */}
                  <div className="text-center z-10">
                    <div className="text-5xl mb-3">🗺️</div>
                    <p className="text-white/90 text-sm font-semibold">Live Tracking Active</p>
                    <div className="flex items-center justify-center gap-1.5 mt-2">
                      <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-60"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-green-400"></span>
                      </span>
                      <span className="text-green-400 text-xs font-medium">10 Teams Online</span>
                    </div>
                  </div>
                </div>
                {/* Status bar */}
                <div className="flex items-center justify-between mt-4 px-1">
                  <div className="flex gap-1.5">
                    <div className="w-2 h-2 rounded-full bg-red-400"></div>
                    <div className="w-2 h-2 rounded-full bg-yellow-400"></div>
                    <div className="w-2 h-2 rounded-full bg-green-400"></div>
                  </div>
                  <span className="text-[10px] text-white/30 font-mono">ResQTrack v2.0 — Chennai Ops</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Scroll hint */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 animate-bounce pointer-events-none">
          <div className="w-7 h-12 rounded-full border-2 border-white/20 flex justify-center pt-2">
            <div className="w-1.5 h-3 rounded-full bg-white/40 animate-pulse"></div>
          </div>
        </div>
      </section>

      {/* ===== PROBLEM ===== */}
      <section className="py-28 bg-gradient-to-b from-gray-50 to-white relative">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-20">
            <span className="inline-block text-red-600 font-bold text-xs uppercase tracking-[0.2em] bg-red-50 px-4 py-1.5 rounded-full mb-4">The Challenge</span>
            <h2 className="text-4xl lg:text-[3.2rem] font-black text-gray-900 leading-tight mb-5">Why Coordination <span className="text-red-600">Fails</span> During Disasters</h2>
            <p className="text-lg text-gray-500 max-w-2xl mx-auto leading-relaxed">Traditional disaster response suffers from critical coordination gaps that cost precious time and lives.</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5 stagger-children">
            {[
              { icon: '🔴', title: 'No Live Tracking', desc: 'Rescue teams move blind — no visibility into other teams\' locations.', stat: '73%', statLabel: 'of teams report coordination issues' },
              { icon: '🟠', title: 'Route Congestion', desc: 'Multiple vehicles enter the same route, causing critical delays.', stat: '45min', statLabel: 'average delay per incident' },
              { icon: '🟡', title: 'Delayed Response', desc: 'Affected areas receive help too late due to poor routing decisions.', stat: '2.5x', statLabel: 'longer response time' },
              { icon: '⚫', title: 'Network Failures', desc: 'Mobile connectivity collapses in 89% of major disaster zones.', stat: '89%', statLabel: 'network failure rate' },
            ].map((item, i) => (
              <div key={i} className="card-premium p-7 group">
                <div className="text-3xl mb-4">{item.icon}</div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">{item.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed mb-4">{item.desc}</p>
                <div className="pt-4 border-t border-gray-100">
                  <p className="text-2xl font-black text-red-600">{item.stat}</p>
                  <p className="text-[11px] text-gray-400 mt-0.5">{item.statLabel}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== FEATURES ===== */}
      <section id="features" className="py-28 bg-white relative">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-20">
            <span className="inline-block text-blue-700 font-bold text-xs uppercase tracking-[0.2em] bg-blue-50 px-4 py-1.5 rounded-full mb-4">Platform Capabilities</span>
            <h2 className="text-4xl lg:text-[3.2rem] font-black text-gray-900 leading-tight mb-5">Powerful Features for <span className="text-blue-700">Rapid Response</span></h2>
            <p className="text-lg text-gray-500 max-w-2xl mx-auto leading-relaxed">Everything your disaster response team needs to coordinate efficiently and save more lives, faster.</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 stagger-children">
            {features.map((f, i) => (
              <div key={i} className="card-premium p-8 group relative overflow-hidden">
                <div className={`absolute inset-0 bg-gradient-to-br ${f.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500`}></div>
                <div className="relative">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center text-3xl mb-5 shadow-sm group-hover:scale-110 transition-transform duration-300">{f.icon}</div>
                  <h3 className="text-lg font-bold text-gray-900 mb-3">{f.title}</h3>
                  <p className="text-sm text-gray-500 leading-relaxed">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== WORKFLOW ===== */}
      <section id="workflow" className="py-28 bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-20">
            <span className="inline-block text-red-600 font-bold text-xs uppercase tracking-[0.2em] bg-red-50 px-4 py-1.5 rounded-full mb-4">System Workflow</span>
            <h2 className="text-4xl lg:text-[3.2rem] font-black text-gray-900 leading-tight mb-5">How <span className="text-red-600">ResQTrack</span> Works</h2>
            <p className="text-lg text-gray-500 max-w-2xl mx-auto leading-relaxed">A streamlined 6-step process ensuring efficient coordination between rescue teams and the command center.</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {workflow.map((w, i) => (
              <div key={i} onClick={() => setActiveStep(i)} className={`card-premium p-8 cursor-pointer relative overflow-hidden transition-all duration-500 ${activeStep === i ? 'shadow-xl' : ''}`} style={activeStep === i ? {outline: `2px solid ${w.color}`, outlineOffset: '-2px', borderRadius: '20px'} : {}}>
                {activeStep === i && <div className="absolute top-0 left-0 right-0 h-1 transition-all" style={{background: w.color}}></div>}
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-white font-black text-lg flex-shrink-0 shadow-md" style={{background: w.color}}>
                    {w.step}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-gray-900 mb-2">{w.title}</h3>
                    <p className="text-sm text-gray-500 leading-relaxed">{w.desc}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== PERFORMANCE ===== */}
      <section id="performance" className="py-28 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-blue-950 to-red-950"></div>
        <div className="absolute inset-0 opacity-[0.05] pointer-events-none" style={{backgroundImage: 'radial-gradient(circle, rgba(255,255,255,1) 1px, transparent 1px)', backgroundSize: '32px 32px'}}></div>
        <div className="relative z-10 max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <span className="inline-block text-red-300 font-bold text-xs uppercase tracking-[0.2em] bg-white/5 border border-white/10 px-4 py-1.5 rounded-full mb-4">Enterprise Grade</span>
            <h2 className="text-4xl lg:text-[3.2rem] font-black text-white leading-tight mb-5">Built for <span className="text-red-400">Performance</span></h2>
            <p className="text-xl text-white/50 max-w-2xl mx-auto">Real-time reliability that emergency response operations demand, at enterprise scale.</p>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
            {stats.map((s, i) => (
              <div key={i} className="bg-white/5 backdrop-blur-md rounded-2xl p-8 border border-white/10 text-center hover:bg-white/10 transition-all duration-300 hover:-translate-y-1 group">
                <div className="text-4xl lg:text-5xl font-black text-white mb-2 tracking-tight group-hover:scale-110 transition-transform">{s.value}</div>
                <div className="text-white/80 text-sm font-semibold mb-1">{s.label}</div>
                <div className="text-white/30 text-xs">{s.sub}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== CTA ===== */}
      <section id="contact" className="py-28 bg-white">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-4xl lg:text-[3.2rem] font-black text-gray-900 mb-6 leading-tight">Ready to Transform <span className="text-red-600">Disaster Response</span>?</h2>
          <p className="text-lg text-gray-500 mb-12 max-w-2xl mx-auto leading-relaxed">Join the next generation of disaster response coordination. Save time, optimize routes, and protect more lives.</p>
          <div className="flex flex-wrap justify-center gap-5 mb-20">
            <Link href="/login" className="btn-primary !text-base !px-12 !py-4 !rounded-2xl">
              Start Using ResQTrack
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg>
            </Link>
            <a href="mailto:contact@resqtrack.com" className="inline-flex items-center gap-2 border-2 border-gray-200 text-gray-700 font-semibold px-12 py-4 rounded-2xl hover:border-red-300 hover:text-red-600 hover:shadow-lg transition-all duration-300 text-base cursor-pointer">
              Contact Us
            </a>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              { icon: '📧', title: 'Email', detail: 'contact@resqtrack.com', bg: 'from-blue-600 to-blue-700' },
              { icon: '📞', title: 'Emergency Hotline', detail: '+91 1800-RESQ-TRACK', bg: 'from-red-600 to-red-700' },
              { icon: '🏢', title: 'Headquarters', detail: 'Chennai, Tamil Nadu, India', bg: 'from-orange-500 to-orange-600' },
            ].map((c, i) => (
              <div key={i} className="card-premium p-6 text-center">
                <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${c.bg} mx-auto mb-4 flex items-center justify-center text-white text-xl shadow-lg`}>{c.icon}</div>
                <h4 className="font-bold text-gray-900 mb-1">{c.title}</h4>
                <p className="text-sm text-gray-500">{c.detail}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== FOOTER ===== */}
      <footer className="bg-slate-900 text-white py-10 border-t border-white/5">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-red-600 to-red-500 flex items-center justify-center text-white font-bold text-sm shadow-md">R</div>
            <span className="text-lg font-extrabold tracking-tight">ResQ<span className="text-red-400">Track</span></span>
          </div>
          <p className="text-gray-500 text-sm">© 2024 ResQTrack. Smart Disaster Response Coordination System.</p>
          <div className="flex items-center gap-6">
            {['Privacy', 'Terms', 'Docs'].map(l => (
              <a key={l} href="#" className="text-gray-500 hover:text-white transition-colors text-sm">{l}</a>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
}
