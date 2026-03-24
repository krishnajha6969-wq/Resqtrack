'use client';

import Link from 'next/link';
import Navbar from '@/components/Navbar';

const features = [
  {
    icon: '📡',
    title: 'Real-Time GPS Tracking',
    desc: 'Track every rescue vehicle, ambulance, and relief team on a live map with sub-second updates.',
  },
  {
    icon: '🚧',
    title: 'Congestion Detection',
    desc: 'Automatically detect when routes are congested and suggest alternate paths for rescue vehicles.',
  },
  {
    icon: '📋',
    title: 'Incident Management',
    desc: 'Report, assign, and track incidents from the field with severity-based prioritization.',
  },
  {
    icon: '📡',
    title: 'Offline-First Operation',
    desc: 'Continue working without internet. Data syncs automatically when connectivity returns.',
  },
  {
    icon: '🗺️',
    title: 'Smart Route Navigation',
    desc: 'Get optimized routes that avoid blocked roads, flooded areas, and congestion zones.',
  },
  {
    icon: '🔗',
    title: 'Device-to-Device Sync',
    desc: 'Share critical updates between nearby devices using local wireless communication.',
  },
];

const workflowSteps = [
  { num: '01', title: 'Mission Assigned', desc: 'Command center assigns rescue team to an incident', color: 'from-blue-500 to-cyan-500' },
  { num: '02', title: 'GPS Tracking Begins', desc: 'Mobile app tracks vehicle location in real-time', color: 'from-cyan-500 to-emerald-500' },
  { num: '03', title: 'Route Analyzed', desc: 'System detects congestion and suggests optimal paths', color: 'from-emerald-500 to-yellow-500' },
  { num: '04', title: 'Incidents Reported', desc: 'Field teams report blockages and emergencies', color: 'from-yellow-500 to-orange-500' },
  { num: '05', title: 'Local Data Shared', desc: 'Nearby devices exchange updates without internet', color: 'from-orange-500 to-red-500' },
  { num: '06', title: 'Data Synchronized', desc: 'When online, all data syncs to command center', color: 'from-red-500 to-pink-500' },
];

const stats = [
  { value: '500+', label: 'Vehicles Tracked' },
  { value: '<2s', label: 'Dashboard Load' },
  { value: '99.9%', label: 'Uptime SLA' },
  { value: '50ms', label: 'Update Latency' },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-slate-950">
      <Navbar />

      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex items-center overflow-hidden">
        {/* Advanced Background Effects */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-red-600/20 rounded-full blur-[120px] animate-pulse" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-600/20 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '2s' }} />
          
          {/* Grid Pattern */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)]" />
          
          {/* Floating Dots */}
          <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2220%22%20height%3D%2220%22%20viewBox%3D%220%200%2020%2020%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Ccircle%20cx%3D%222%22%20cy%3D%222%22%20r%3D%220.5%22%20fill%3D%22%23ffffff44%22%2F%3E%3C%2Fsvg%3E')] opacity-30" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 pb-20 w-full">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="text-left">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-500/10 border border-red-500/20 mb-8 backdrop-blur-md">
                <div className="w-2 h-2 rounded-full bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.8)] animate-pulse" />
                <span className="text-xs text-red-400 font-semibold uppercase tracking-wider">Next-Gen Rescue Platform</span>
              </div>

              <h1 className="text-6xl sm:text-7xl lg:text-8xl font-black leading-[0.9] mb-8 tracking-tighter">
                <span className="text-white">SAVE</span>
                <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 via-red-400 to-orange-400">SECONDS</span>
                <br />
                <span className="text-white">SAVE LIVES.</span>
              </h1>

              <p className="text-lg sm:text-xl text-slate-400 max-w-xl mb-10 leading-relaxed font-medium">
                The world's most advanced disaster response coordination system. 
                <span className="text-white font-semibold"> Mira-Bhayander</span> localized deployment prepared for rapid response.
              </p>

              <div className="flex flex-col sm:flex-row items-center gap-5">
                <Link
                  href="/login"
                  className="w-full sm:w-auto px-10 py-4 bg-red-600 hover:bg-red-500 text-white font-bold rounded-2xl shadow-[0_0_20px_rgba(239,68,68,0.3)] hover:shadow-[0_0_30px_rgba(239,68,68,0.5)] transition-all flex items-center justify-center gap-3 transform hover:-translate-y-1 active:translate-y-0"
                >
                  Enter Command Center
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                  </svg>
                </Link>
                <Link
                  href="#features"
                  className="w-full sm:w-auto px-10 py-4 bg-slate-900/50 hover:bg-slate-800/50 text-white font-bold rounded-2xl border border-slate-700 hover:border-slate-500 transition-all backdrop-blur-md flex items-center justify-center transform hover:-translate-y-1 active:translate-y-0"
                >
                  System Protocols
                </Link>
              </div>

              {/* Stats Bar */}
              <div className="flex flex-wrap gap-8 mt-16 pt-10 border-t border-slate-800/50">
                {stats.map((stat, i) => (
                  <div key={i}>
                    <p className="text-3xl font-black text-white">{stat.value}</p>
                    <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold mt-1">{stat.label}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Visual Element - Mock Dashboard Preview */}
            <div className="relative hidden lg:block">
              <div className="absolute -inset-4 bg-gradient-to-r from-red-500/20 to-blue-500/20 rounded-[2.5rem] blur-3xl opacity-50" />
              <div className="relative bg-slate-900/80 rounded-[2rem] border border-slate-700/50 overflow-hidden shadow-2xl backdrop-blur-xl rotate-2 hover:rotate-0 transition-transform duration-700">
                <div className="h-8 bg-slate-800/50 flex items-center gap-1.5 px-4">
                  <div className="w-2 h-2 rounded-full bg-red-500/50" />
                  <div className="w-2 h-2 rounded-full bg-amber-500/50" />
                  <div className="w-2 h-2 rounded-full bg-emerald-500/50" />
                </div>
                <div className="aspect-video bg-slate-950 p-6 flex flex-col gap-4">
                  <div className="flex gap-3">
                    <div className="w-1/3 h-20 bg-slate-800/50 rounded-xl animate-pulse" />
                    <div className="flex-1 h-20 bg-slate-800/50 rounded-xl animate-pulse" />
                  </div>
                  <div className="flex-1 bg-slate-900/50 rounded-2xl border border-slate-800 flex items-center justify-center overflow-hidden">
                    <div className="w-full h-full bg-[radial-gradient(circle_at_center,#ef444422_0%,transparent_70%)] flex items-center justify-center">
                       <span className="text-xs text-slate-500 font-mono tracking-widest uppercase">Live Map Feed</span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {[1,2,3,4].map(i => <div key={i} className="flex-1 h-6 bg-slate-800/30 rounded-full" />)}
                  </div>
                </div>
              </div>
              
              {/* Floating Alert Card */}
              <div className="absolute top-1/2 -left-12 transform -translate-y-1/2 bg-red-600/90 text-white p-4 rounded-2xl shadow-2xl backdrop-blur-md border border-white/20 animate-bounce transition-all">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
                    <svg className="w-6 h-6" fill="white" viewBox="0 0 24 24">
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
                    </svg>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wider opacity-80">Priority Alpha</p>
                    <p className="text-sm font-bold">Building Collapse</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Problem Section */}
      <section className="py-20 bg-slate-900/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              The Crisis of Uncoordinated Rescue
            </h2>
            <p className="text-slate-400 text-lg">
              During disasters, communication failures lead to duplicated efforts,
              missed victims, and delayed response — costing lives.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: '🔴', problem: 'Blind Teams', detail: 'Rescue teams cannot see live locations of other teams in the field' },
              { icon: '🚗', problem: 'Route Congestion', detail: 'Multiple vehicles enter same routes causing gridlock in disaster zones' },
              { icon: '⏰', problem: 'Delayed Response', detail: 'Some disaster zones receive critically delayed assistance' },
              { icon: '📵', problem: 'Network Failure', detail: 'Mobile networks become weak or unavailable when most needed' },
            ].map((item, i) => (
              <div key={i} className="group relative bg-slate-900/40 p-8 rounded-[2rem] border border-slate-800 hover:border-red-500/50 transition-all duration-500 hover:shadow-[0_0_30px_rgba(239,68,68,0.1)]">
                <div className="w-14 h-14 bg-slate-800/50 rounded-2xl flex items-center justify-center text-3xl mb-6 group-hover:scale-110 transition-transform duration-500">
                  {item.icon}
                </div>
                <h3 className="text-white text-xl font-bold mb-3">{item.problem}</h3>
                <p className="text-sm text-slate-400 leading-relaxed font-medium">{item.detail}</p>
                <div className="absolute inset-x-8 bottom-0 h-1 bg-gradient-to-r from-transparent via-red-500/0 to-transparent group-hover:via-red-500/50 transition-all duration-700" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">Platform Capabilities</h2>
            <p className="text-slate-400 text-lg max-w-2xl mx-auto">
              Every feature built for life-critical situations where seconds matter.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f, i) => (
              <div
                key={i}
                className="group relative bg-slate-800/40 p-6 rounded-2xl border border-slate-700/50 hover:border-red-500/30 transition-all hover:-translate-y-1 duration-300"
              >
                <div className="text-4xl mb-4">{f.icon}</div>
                <h3 className="text-lg font-semibold text-white mb-2 group-hover:text-red-400 transition-colors">
                  {f.title}
                </h3>
                <p className="text-sm text-slate-400 leading-relaxed">{f.desc}</p>
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-red-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Workflow Section */}
      <section className="py-20 bg-slate-900/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">System Workflow</h2>
            <p className="text-slate-400 text-lg">From mission assignment to synchronized coordination</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {workflowSteps.map((step, i) => (
              <div key={i} className="relative bg-slate-800/60 p-6 rounded-2xl border border-slate-700/50">
                <div className={`inline-flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br ${step.color} mb-4`}>
                  <span className="text-white text-sm font-bold">{step.num}</span>
                </div>
                <h3 className="text-white font-semibold mb-2">{step.title}</h3>
                <p className="text-sm text-slate-400">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Tech Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-br from-slate-800/60 to-slate-900/60 rounded-3xl border border-slate-700/50 p-8 sm:p-12">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-3xl font-bold text-white mb-4">Built for Extreme Conditions</h2>
                <p className="text-slate-400 mb-6">
                  ResQTrack is engineered to operate in the harshest disaster scenarios with
                  offline-first architecture and future Starlink satellite integration readiness.
                </p>
                <div className="space-y-3">
                  {[
                    'Offline-first with IndexedDB & Service Workers',
                    'WebSocket real-time updates under 500ms',
                    'Supports 10,000+ simultaneous vehicles',
                    'Role-based access with JWT authentication',
                    'Future-ready for Starlink satellite connectivity',
                  ].map((t, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <div className="w-5 h-5 rounded-full bg-emerald-500/20 flex items-center justify-center flex-shrink-0">
                        <svg className="w-3 h-3 text-emerald-400" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                        </svg>
                      </div>
                      <span className="text-sm text-slate-300">{t}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                {['React & Next.js', 'Node.js & Express', 'PostgreSQL', 'Socket.io', 'Leaflet Maps', 'IndexedDB'].map((tech, i) => (
                  <div key={i} className="bg-slate-800/80 p-4 rounded-xl border border-slate-700/50 text-center">
                    <p className="text-sm font-medium text-white">{tech}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            Ready to Save Lives?
          </h2>
          <p className="text-slate-400 text-lg mb-8 max-w-2xl mx-auto">
            Deploy ResQTrack for your emergency response organization and coordinate
            rescue operations with unprecedented efficiency.
          </p>
          <Link
            href="/login"
            className="inline-flex items-center gap-2 px-10 py-4 bg-red-600 hover:bg-red-700 text-white font-semibold text-lg rounded-xl shadow-2xl shadow-red-600/20 hover:shadow-red-600/40 transition-all"
          >
            Get Started Now
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
            </svg>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-800 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-red-500 to-red-700 flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
              </svg>
            </div>
            <span className="text-sm font-semibold text-slate-400">ResQTrack</span>
          </div>
          <p className="text-xs text-slate-600">© 2026 ResQTrack. Saving lives through technology.</p>
        </div>
      </footer>
    </div>
  );
}
