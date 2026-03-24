'use client';
import { useState, useEffect } from 'react';
import type { Incident, Team } from '@/lib/database';

export default function IncidentsPage() {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [showCreate, setShowCreate] = useState(false);
  const [assignModal, setAssignModal] = useState<Incident | null>(null);
  const [filterSeverity, setFilterSeverity] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [form, setForm] = useState({ description: '', type: 'rescue', severity: 'medium', address: '', lat: '13.0827', lng: '80.2707' });

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    const [iRes, tRes] = await Promise.all([fetch('/api/incidents'), fetch('/api/teams')]);
    const iData = await iRes.json();
    const tData = await tRes.json();
    setIncidents(iData.incidents || []);
    setTeams(tData.teams || []);
  };

  const createIncident = async (e: React.FormEvent) => {
    e.preventDefault();
    await fetch('/api/incidents', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...form, location: { lat: parseFloat(form.lat), lng: parseFloat(form.lng) } }),
    });
    setShowCreate(false);
    setForm({ description: '', type: 'rescue', severity: 'medium', address: '', lat: '13.0827', lng: '80.2707' });
    fetchData();
  };

  const assignTeam = async (teamId: string) => {
    if (!assignModal) return;
    await fetch('/api/incidents/assign', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ incident_id: assignModal.id, team_id: teamId }),
    });
    setAssignModal(null);
    fetchData();
  };

  const filtered = incidents.filter(i => {
    if (filterSeverity !== 'all' && i.severity !== filterSeverity) return false;
    if (filterStatus !== 'all' && i.status !== filterStatus) return false;
    return true;
  });

  const severityStyles: Record<string, string> = {
    critical: 'bg-red-100 text-red-700 border-red-200',
    high: 'bg-orange-100 text-orange-700 border-orange-200',
    medium: 'bg-yellow-100 text-yellow-700 border-yellow-200',
    low: 'bg-green-100 text-green-700 border-green-200',
  };

  const statusStyles: Record<string, string> = {
    reported: 'bg-gray-100 text-gray-700',
    assigned: 'bg-blue-100 text-blue-700',
    'in-progress': 'bg-purple-100 text-purple-700',
    resolved: 'bg-green-100 text-green-700',
  };

  const typeIcons: Record<string, string> = {
    injured: '🤕', infrastructure: '🏗️', fire: '🔥', flood: '🌊', rescue: '🆘', medical: '🏥',
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Incident Management</h2>
          <p className="text-sm text-gray-500 mt-1">Track, assign, and manage disaster incidents</p>
        </div>
        <button onClick={() => setShowCreate(true)} className="gradient-primary text-white font-semibold px-6 py-3 rounded-xl hover:shadow-lg hover:-translate-y-0.5 transition-all text-sm flex items-center gap-2">
          <span className="text-lg">+</span> Report Incident
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Incidents', value: incidents.length, color: 'text-gray-900' },
          { label: 'Critical', value: incidents.filter(i => i.severity === 'critical').length, color: 'text-red-600' },
          { label: 'In Progress', value: incidents.filter(i => i.status === 'in-progress').length, color: 'text-purple-600' },
          { label: 'Resolved', value: incidents.filter(i => i.status === 'resolved').length, color: 'text-green-600' },
        ].map((s, i) => (
          <div key={i} className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
            <p className="text-xs text-gray-500 mb-1">{s.label}</p>
            <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <select value={filterSeverity} onChange={(e) => setFilterSeverity(e.target.value)} className="text-sm border border-gray-200 rounded-xl px-4 py-2.5 bg-white focus:border-[#D32F2F] outline-none">
          <option value="all">All Severities</option>
          <option value="critical">Critical</option>
          <option value="high">High</option>
          <option value="medium">Medium</option>
          <option value="low">Low</option>
        </select>
        <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="text-sm border border-gray-200 rounded-xl px-4 py-2.5 bg-white focus:border-[#D32F2F] outline-none">
          <option value="all">All Statuses</option>
          <option value="reported">Reported</option>
          <option value="assigned">Assigned</option>
          <option value="in-progress">In Progress</option>
          <option value="resolved">Resolved</option>
        </select>
      </div>

      {/* Incidents Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-6 py-4">Incident</th>
                <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-6 py-4">Severity</th>
                <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-6 py-4">Status</th>
                <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-6 py-4">Location</th>
                <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-6 py-4">Time</th>
                <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-6 py-4">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.map((incident) => (
                <tr key={incident.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <span className="text-xl">{typeIcons[incident.type] || '🚨'}</span>
                      <div>
                        <p className="text-sm font-semibold text-gray-900 line-clamp-1">{incident.description}</p>
                        <p className="text-xs text-gray-500 capitalize">{incident.type}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`text-[10px] font-bold uppercase px-2.5 py-1 rounded-full border ${severityStyles[incident.severity]}`}>{incident.severity}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`text-[10px] font-semibold px-2.5 py-1 rounded-full ${statusStyles[incident.status]}`}>{incident.status}</span>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm text-gray-600 max-w-[150px] truncate">📍 {incident.address}</p>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-xs text-gray-500">{new Date(incident.timestamp).toLocaleString()}</p>
                  </td>
                  <td className="px-6 py-4">
                    {!incident.assigned_team && incident.status !== 'resolved' && (
                      <button onClick={() => setAssignModal(incident)} className="text-xs font-semibold text-[#0D47A1] hover:text-[#1565C0] bg-blue-50 px-3 py-1.5 rounded-lg transition-colors">
                        Assign Team
                      </button>
                    )}
                    {incident.assigned_team && (
                      <span className="text-xs text-gray-500">✅ Assigned</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Incident Modal */}
      {showCreate && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-6 animate-fade-in">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-gray-900">Report New Incident</h3>
              <button onClick={() => setShowCreate(false)} className="text-gray-400 hover:text-gray-600 text-xl">✕</button>
            </div>
            <form onSubmit={createIncident} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea value={form.description} onChange={(e) => setForm({...form, description: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#D32F2F] focus:ring-2 focus:ring-red-100 outline-none text-sm resize-none" rows={3} required placeholder="Describe the incident..." />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                  <select value={form.type} onChange={(e) => setForm({...form, type: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#D32F2F] outline-none text-sm">
                    <option value="rescue">Rescue</option>
                    <option value="medical">Medical</option>
                    <option value="fire">Fire</option>
                    <option value="flood">Flood</option>
                    <option value="infrastructure">Infrastructure</option>
                    <option value="injured">Injured</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Severity</label>
                  <select value={form.severity} onChange={(e) => setForm({...form, severity: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#D32F2F] outline-none text-sm">
                    <option value="critical">Critical</option>
                    <option value="high">High</option>
                    <option value="medium">Medium</option>
                    <option value="low">Low</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                <input value={form.address} onChange={(e) => setForm({...form, address: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#D32F2F] outline-none text-sm" placeholder="Location address" required />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Latitude</label>
                  <input type="number" step="any" value={form.lat} onChange={(e) => setForm({...form, lat: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#D32F2F] outline-none text-sm" required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Longitude</label>
                  <input type="number" step="any" value={form.lng} onChange={(e) => setForm({...form, lng: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#D32F2F] outline-none text-sm" required />
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowCreate(false)} className="flex-1 py-3 rounded-xl border border-gray-200 text-gray-600 font-semibold text-sm hover:bg-gray-50 transition-colors">Cancel</button>
                <button type="submit" className="flex-1 py-3 rounded-xl gradient-primary text-white font-semibold text-sm hover:shadow-lg transition-all">Report Incident</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Assign Team Modal */}
      {assignModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 animate-fade-in">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-900">Assign Rescue Team</h3>
              <button onClick={() => setAssignModal(null)} className="text-gray-400 hover:text-gray-600 text-xl">✕</button>
            </div>
            <p className="text-sm text-gray-600 mb-4">Select a team to assign to: <strong>{assignModal.description}</strong></p>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {teams.filter(t => !t.assigned_incident).map(team => (
                <button key={team.id} onClick={() => assignTeam(team.id)} className="w-full flex items-center gap-3 p-3 rounded-xl border border-gray-100 hover:border-blue-200 hover:bg-blue-50/50 transition-all text-left">
                  <span className="text-2xl">{{ ambulance: '🚑', fire: '🚒', police: '🚓', relief: '🚚' }[team.type]}</span>
                  <div>
                    <p className="text-sm font-semibold text-gray-900">{team.team_name}</p>
                    <p className="text-xs text-gray-500">{team.vehicle_id} · <span className="capitalize">{team.status}</span></p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
