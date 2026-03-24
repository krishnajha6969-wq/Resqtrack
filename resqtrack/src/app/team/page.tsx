'use client';
import dynamic from 'next/dynamic';
import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import type { Team, Incident } from '@/lib/database';

const TeamMap = dynamic(() => import('@/components/map/TeamMap'), { ssr: false, loading: () => <div className="w-full h-full bg-gray-100 animate-pulse flex items-center justify-center text-gray-400">Loading map...</div> });

export default function TeamPage() {
  const { user, logout, isLoading } = useAuth();
  const router = useRouter();
  const [teams, setTeams] = useState<Team[]>([]);
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [myTeam, setMyTeam] = useState<Team | null>(null);
  const [myMission, setMyMission] = useState<Incident | null>(null);
  const [showReport, setShowReport] = useState(false);
  const [showStatus, setShowStatus] = useState(false);
  const [showOffline, setShowOffline] = useState(false);
  const [reportForm, setReportForm] = useState({ description: '', type: 'rescue', severity: 'medium' });
  const [statusMsg, setStatusMsg] = useState('');

  useEffect(() => {
    if (!isLoading && !user) router.push('/login');
  }, [user, isLoading, router]);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 8000);
    return () => clearInterval(interval);
  }, []);

  const fetchData = async () => {
    try {
      const [tRes, iRes] = await Promise.all([fetch('/api/teams'), fetch('/api/incidents')]);
      const tData = await tRes.json();
      const iData = await iRes.json();
      setTeams(tData.teams || []);
      setIncidents(iData.incidents || []);
      // Simulate: first team with assigned_incident as "my team"
      const assigned = (tData.teams || []).find((t: Team) => t.assigned_incident);
      if (assigned) {
        setMyTeam(assigned);
        const mission = (iData.incidents || []).find((i: Incident) => i.id === assigned.assigned_incident);
        setMyMission(mission || null);
      } else {
        setMyTeam((tData.teams || [])[0] || null);
      }
    } catch (err) { console.error(err); }
  };

  const submitReport = async (e: React.FormEvent) => {
    e.preventDefault();
    const location = myTeam ? myTeam.location : { lat: 13.0827, lng: 80.2707 };
    await fetch('/api/incidents', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...reportForm, location, address: 'Reported from field', reporter: myTeam?.vehicle_id || 'Field Team' }),
    });
    setShowReport(false);
    setReportForm({ description: '', type: 'rescue', severity: 'medium' });
    setStatusMsg('✅ Incident reported successfully!');
    setTimeout(() => setStatusMsg(''), 3000);
    fetchData();
  };

  if (isLoading || !user) return null;

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col relative">
      {/* Full-screen Map */}
      <div className="absolute inset-0 z-0">
        <TeamMap teams={teams} incidents={incidents} myTeam={myTeam} myMission={myMission} />
      </div>

      {/* Top header overlay */}
      <div className="relative z-10 p-4">
        <div className="glass-dark rounded-2xl p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center text-white font-bold shadow-md">R</div>
            <div>
              <h1 className="text-sm font-bold text-white">ResQTrack</h1>
              <p className="text-[10px] text-white/60">Rescue Team Interface</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 bg-green-500/20 text-green-400 text-[10px] font-semibold px-2.5 py-1 rounded-full">
              <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse"></span>
              Online
            </div>
            <button onClick={() => { logout(); router.push('/'); }} className="text-white/60 hover:text-white p-1.5">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7" /></svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mission card overlay */}
      {myMission && (
        <div className="relative z-10 px-4 mt-auto mb-2">
          <div className="glass-dark rounded-2xl p-4 animate-fade-in">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-red-400">🚨 Active Mission</span>
              <span className="bg-red-500/20 text-red-400 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">{myMission.severity}</span>
            </div>
            <p className="text-sm font-semibold text-white mb-1">{myMission.description}</p>
            <p className="text-xs text-white/60 mb-3">📍 {myMission.address}</p>
            <div className="grid grid-cols-3 gap-2">
              <div className="bg-white/5 rounded-lg p-2 text-center">
                <p className="text-[10px] text-white/40">Type</p>
                <p className="text-xs font-semibold text-white capitalize">{myMission.type}</p>
              </div>
              <div className="bg-white/5 rounded-lg p-2 text-center">
                <p className="text-[10px] text-white/40">Status</p>
                <p className="text-xs font-semibold text-white capitalize">{myMission.status}</p>
              </div>
              <div className="bg-white/5 rounded-lg p-2 text-center">
                <p className="text-[10px] text-white/40">ETA</p>
                <p className="text-xs font-semibold text-green-400">~8 min</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Vehicle info */}
      {myTeam && !myMission && (
        <div className="relative z-10 px-4 mt-auto mb-2">
          <div className="glass-dark rounded-2xl p-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center text-2xl">
                {{ ambulance: '🚑', fire: '🚒', police: '🚓', relief: '🚚' }[myTeam.type] || '🚗'}
              </div>
              <div>
                <p className="text-sm font-semibold text-white">{myTeam.team_name}</p>
                <p className="text-xs text-white/60">{myTeam.vehicle_id} · {myTeam.speed} km/h</p>
              </div>
              <div className="ml-auto bg-green-500/20 text-green-400 text-xs font-semibold px-3 py-1 rounded-full capitalize">{myTeam.status}</div>
            </div>
          </div>
        </div>
      )}

      {/* Status message */}
      {statusMsg && (
        <div className="relative z-20 px-4 mb-2">
          <div className="bg-green-500/90 backdrop-blur-sm text-white text-sm font-semibold text-center py-3 rounded-xl animate-fade-in">{statusMsg}</div>
        </div>
      )}

      {/* Bottom action bar */}
      <div className="relative z-10 p-4">
        <div className="glass-dark rounded-2xl p-3 flex items-center justify-around">
          <button onClick={() => setShowReport(true)} className="flex flex-col items-center gap-1 text-white/80 hover:text-white transition-colors">
            <div className="w-12 h-12 rounded-xl bg-red-500/20 flex items-center justify-center text-xl">🚨</div>
            <span className="text-[10px] font-medium">Report</span>
          </button>
          <button onClick={() => setShowStatus(true)} className="flex flex-col items-center gap-1 text-white/80 hover:text-white transition-colors">
            <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center text-xl">📋</div>
            <span className="text-[10px] font-medium">Status</span>
          </button>
          <button onClick={() => setShowOffline(true)} className="flex flex-col items-center gap-1 text-white/80 hover:text-white transition-colors">
            <div className="w-12 h-12 rounded-xl bg-purple-500/20 flex items-center justify-center text-xl">📡</div>
            <span className="text-[10px] font-medium">Nearby</span>
          </button>
          <button onClick={() => router.push('/dashboard')} className="flex flex-col items-center gap-1 text-white/80 hover:text-white transition-colors">
            <div className="w-12 h-12 rounded-xl bg-green-500/20 flex items-center justify-center text-xl">🖥️</div>
            <span className="text-[10px] font-medium">HQ</span>
          </button>
        </div>
      </div>

      {/* Report Incident Modal */}
      {showReport && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-end justify-center p-4">
          <div className="bg-gray-900 rounded-t-3xl w-full max-w-lg p-6 animate-slide-up border border-white/10">
            <div className="w-10 h-1 bg-white/20 rounded-full mx-auto mb-6"></div>
            <h3 className="text-lg font-bold text-white mb-4">🚨 Report Incident</h3>
            <form onSubmit={submitReport} className="space-y-4">
              <textarea value={reportForm.description} onChange={(e) => setReportForm({...reportForm, description: e.target.value})} className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/10 text-white placeholder-white/40 outline-none focus:border-red-500 text-sm" rows={3} placeholder="Describe the emergency..." required />
              <div className="grid grid-cols-2 gap-3">
                <select value={reportForm.type} onChange={(e) => setReportForm({...reportForm, type: e.target.value})} className="px-4 py-3 rounded-xl bg-white/10 border border-white/10 text-white outline-none text-sm">
                  <option value="rescue" className="bg-gray-900">Rescue</option>
                  <option value="medical" className="bg-gray-900">Medical</option>
                  <option value="fire" className="bg-gray-900">Fire</option>
                  <option value="flood" className="bg-gray-900">Flood</option>
                  <option value="infrastructure" className="bg-gray-900">Infrastructure</option>
                </select>
                <select value={reportForm.severity} onChange={(e) => setReportForm({...reportForm, severity: e.target.value})} className="px-4 py-3 rounded-xl bg-white/10 border border-white/10 text-white outline-none text-sm">
                  <option value="critical" className="bg-gray-900">Critical</option>
                  <option value="high" className="bg-gray-900">High</option>
                  <option value="medium" className="bg-gray-900">Medium</option>
                  <option value="low" className="bg-gray-900">Low</option>
                </select>
              </div>
              <div className="flex gap-3">
                <button type="button" onClick={() => setShowReport(false)} className="flex-1 py-3 rounded-xl border border-white/10 text-white/60 font-semibold text-sm">Cancel</button>
                <button type="submit" className="flex-1 py-3 rounded-xl gradient-primary text-white font-semibold text-sm">Submit Report</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Status Update Modal */}
      {showStatus && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-end justify-center p-4">
          <div className="bg-gray-900 rounded-t-3xl w-full max-w-lg p-6 animate-slide-up border border-white/10">
            <div className="w-10 h-1 bg-white/20 rounded-full mx-auto mb-6"></div>
            <h3 className="text-lg font-bold text-white mb-4">📋 Update Status</h3>
            <div className="space-y-2 mb-4">
              {['active', 'en-route', 'on-scene', 'idle'].map(s => (
                <button key={s} onClick={() => { setStatusMsg(`Status updated to "${s}"`); setTimeout(() => setStatusMsg(''), 3000); setShowStatus(false); }} className="w-full py-3.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm font-medium hover:bg-white/10 transition-colors capitalize text-left px-4">{s === 'en-route' ? '🚗 En Route' : s === 'on-scene' ? '📍 On Scene' : s === 'active' ? '✅ Active' : '⏸️ Idle'}</button>
              ))}
            </div>
            <button onClick={() => setShowStatus(false)} className="w-full py-3 rounded-xl border border-white/10 text-white/60 font-semibold text-sm">Cancel</button>
          </div>
        </div>
      )}

      {/* Offline / Nearby Sharing Modal */}
      {showOffline && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-end justify-center p-4">
          <div className="bg-gray-900 rounded-t-3xl w-full max-w-lg p-6 animate-slide-up border border-white/10">
            <div className="w-10 h-1 bg-white/20 rounded-full mx-auto mb-6"></div>
            <h3 className="text-lg font-bold text-white mb-2">📡 Nearby Teams & Data Sharing</h3>
            <p className="text-xs text-white/50 mb-4">Share location, congestion, and road blockage data with nearby rescue teams via local communication.</p>

            <div className="space-y-3 mb-4">
              <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center"><span className="text-sm">📶</span></div>
                  <div>
                    <p className="text-sm font-semibold text-white">Bluetooth Discovery</p>
                    <p className="text-[10px] text-green-400">Active — Scanning for nearby devices</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 ml-11">
                  <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></span>
                  <span className="text-xs text-white/60">2 devices found nearby</span>
                </div>
              </div>

              {teams.slice(1, 3).map(team => (
                <div key={team.id} className="bg-white/5 rounded-xl p-3 border border-white/10 flex items-center gap-3">
                  <span className="text-xl">{{ ambulance: '🚑', fire: '🚒', police: '🚓', relief: '🚚' }[team.type] || '🚗'}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-white truncate">{team.team_name}</p>
                    <p className="text-[10px] text-white/50">{team.vehicle_id} · {Math.round(Math.random() * 500 + 100)}m away</p>
                  </div>
                  <span className="text-xs text-green-400 bg-green-500/10 px-2 py-1 rounded-lg">synced</span>
                </div>
              ))}
            </div>

            <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-3 mb-4">
              <p className="text-xs text-blue-300">ℹ️ Data exchanged: Location updates, road blockage reports, congestion alerts. All data syncs to command center when internet returns.</p>
            </div>

            <button onClick={() => setShowOffline(false)} className="w-full py-3 rounded-xl border border-white/10 text-white/60 font-semibold text-sm">Close</button>
          </div>
        </div>
      )}
    </div>
  );
}
