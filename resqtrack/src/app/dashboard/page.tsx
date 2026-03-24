'use client';
import dynamic from 'next/dynamic';
import { useState, useEffect } from 'react';
import type { Team, Incident, Congestion, RoadBlock } from '@/lib/database';

const DashboardMap = dynamic(() => import('@/components/map/DashboardMap'), { ssr: false, loading: () => <div className="w-full h-full bg-gray-100 rounded-2xl animate-pulse flex items-center justify-center text-gray-400">Loading map...</div> });

export default function DashboardPage() {
  const [teams, setTeams] = useState<Team[]>([]);
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [congestion, setCongestion] = useState<Congestion[]>([]);
  const [roadBlocks, setRoadBlocks] = useState<RoadBlock[]>([]);
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);
  const [filter, setFilter] = useState<'all' | 'ambulance' | 'fire' | 'police' | 'relief'>('all');

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 10000);
    return () => clearInterval(interval);
  }, []);

  const fetchData = async () => {
    try {
      const [teamsRes, incidentsRes, congestionRes] = await Promise.all([
        fetch('/api/teams'),
        fetch('/api/incidents'),
        fetch('/api/congestion'),
      ]);
      const teamsData = await teamsRes.json();
      const incidentsData = await incidentsRes.json();
      const congestionData = await congestionRes.json();
      setTeams(teamsData.teams || []);
      setIncidents(incidentsData.incidents || []);
      setCongestion(congestionData.congestion || []);
      setRoadBlocks(congestionData.roadBlocks || []);
    } catch (err) { console.error('Fetch error:', err); }
  };

  const filteredTeams = filter === 'all' ? teams : teams.filter(t => t.type === filter);
  const activeIncidents = incidents.filter(i => i.status !== 'resolved');
  const criticalCount = incidents.filter(i => i.severity === 'critical' && i.status !== 'resolved').length;
  const congestedCount = congestion.filter(c => c.status === 'congested' || c.status === 'blocked').length;

  const severityColor: Record<string, string> = {
    critical: 'bg-red-100 text-red-700 border-red-200',
    high: 'bg-orange-100 text-orange-700 border-orange-200',
    medium: 'bg-yellow-100 text-yellow-700 border-yellow-200',
    low: 'bg-green-100 text-green-700 border-green-200',
  };

  const statusColor: Record<string, string> = {
    reported: 'bg-gray-100 text-gray-700',
    assigned: 'bg-blue-100 text-blue-700',
    'in-progress': 'bg-purple-100 text-purple-700',
    resolved: 'bg-green-100 text-green-700',
  };

  const typeIcon: Record<string, string> = {
    ambulance: '🚑',
    fire: '🚒',
    police: '🚓',
    relief: '🚚',
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Stats Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
        {[
          { label: 'Active Teams', value: teams.filter(t => t.status !== 'idle').length, total: teams.length, icon: '🚗', gradient: 'from-blue-600 to-blue-500', shadow: 'shadow-blue-500/20' },
          { label: 'Open Incidents', value: activeIncidents.length, total: incidents.length, icon: '🚨', gradient: 'from-red-600 to-red-500', shadow: 'shadow-red-500/20' },
          { label: 'Critical Alerts', value: criticalCount, total: null, icon: '⚠️', gradient: 'from-orange-600 to-amber-500', shadow: 'shadow-orange-500/20' },
          { label: 'Congested Routes', value: congestedCount, total: congestion.length, icon: '🚧', gradient: 'from-purple-600 to-purple-500', shadow: 'shadow-purple-500/20' },
        ].map((stat, i) => (
          <div key={i} className="stat-card group">
            <div className="flex items-center justify-between mb-4">
              <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${stat.gradient} flex items-center justify-center text-lg shadow-lg ${stat.shadow}`}>{stat.icon}</div>
              <span className="relative flex h-2.5 w-2.5"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-60"></span><span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-400"></span></span>
            </div>
            <div className="text-3xl font-black text-gray-900 mb-1 tracking-tight">{stat.value}</div>
            <div className="text-sm text-gray-500 font-medium">{stat.label}{stat.total !== null ? <span className="text-gray-300"> / {stat.total}</span> : ''}</div>
          </div>
        ))}
      </div>

      {/* Main Content */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Map - Takes 2 columns */}
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden" style={{height: '600px'}}>
          <div className="p-4 border-b border-gray-100 flex items-center justify-between">
            <h2 className="font-bold text-gray-900 text-sm">Live Operations Map</h2>
            <div className="flex gap-1">
              {(['all', 'ambulance', 'fire', 'police', 'relief'] as const).map(f => (
                <button key={f} onClick={() => setFilter(f)} className={`text-xs px-3 py-1.5 rounded-lg transition-all cursor-pointer font-semibold ${filter === f ? 'bg-[#D32F2F] text-white shadow-md shadow-red-500/20' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
                  {f === 'all' ? 'All' : typeIcon[f]}
                </button>
              ))}
            </div>
          </div>
          <div className="h-[calc(100%-57px)]">
            <DashboardMap teams={filteredTeams} incidents={activeIncidents} congestion={congestion} roadBlocks={roadBlocks} onTeamSelect={setSelectedTeam} />
          </div>
        </div>

        {/* Side Panel */}
        <div className="space-y-6">
          {/* Selected Team Info */}
          {selectedTeam && (
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-blue-200 animate-fade-in">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-bold text-gray-900 text-sm">Selected Vehicle</h3>
                <button onClick={() => setSelectedTeam(null)} className="text-gray-400 hover:text-gray-600">✕</button>
              </div>
              <div className="flex items-center gap-3 mb-3">
                <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center text-2xl">{typeIcon[selectedTeam.type]}</div>
                <div>
                  <p className="font-semibold text-gray-900">{selectedTeam.team_name}</p>
                  <p className="text-xs text-gray-500">{selectedTeam.vehicle_id}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="bg-gray-50 rounded-lg p-2 text-center">
                  <p className="text-xs text-gray-500">Speed</p>
                  <p className="font-bold text-gray-900">{selectedTeam.speed} km/h</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-2 text-center">
                  <p className="text-xs text-gray-500">Status</p>
                  <p className="font-bold text-gray-900 capitalize text-xs">{selectedTeam.status}</p>
                </div>
              </div>
            </div>
          )}

          {/* Active Incidents */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 max-h-[500px] overflow-hidden flex flex-col">
            <div className="p-4 border-b border-gray-100 flex-shrink-0">
              <h3 className="font-bold text-gray-900 text-sm">Active Incidents ({activeIncidents.length})</h3>
            </div>
            <div className="flex-1 overflow-y-auto p-3 space-y-2">
              {activeIncidents.map((incident) => (
                <div key={incident.id} className="p-3 rounded-xl border border-gray-100 hover:border-red-200 hover:bg-red-50/30 transition-all cursor-pointer">
                  <div className="flex items-center justify-between mb-2">
                    <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full border ${severityColor[incident.severity]}`}>{incident.severity}</span>
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${statusColor[incident.status]}`}>{incident.status}</span>
                  </div>
                  <p className="text-sm font-medium text-gray-900 mb-1 line-clamp-2">{incident.description}</p>
                  <p className="text-xs text-gray-500 flex items-center gap-1">
                    <span>📍</span> {incident.address}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
