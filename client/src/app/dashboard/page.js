'use client';

import { useState, useEffect, useCallback } from 'react';
import dynamic from 'next/dynamic';
import Navbar from '@/components/Navbar';
import { IncidentCard, TeamCard, StatusBadge } from '@/components/Cards';

const MapView = dynamic(() => import('@/components/MapView'), { ssr: false });

// Demo data for standalone operation
const DEMO_TEAMS = [
    { id: '1', vehicle_id: 'RV-001', team_name: 'Mira-East Rescue', latitude: 19.2820, longitude: 72.8550, status: 'available', incident_title: null },
    { id: '2', vehicle_id: 'RV-002', team_name: 'Bhayander-West Medical', latitude: 19.3100, longitude: 72.8530, status: 'responding', incident_title: 'Building Collapse - Near Maxus' },
    { id: '3', vehicle_id: 'AMB-001', team_name: 'Mira Road Ambulance', latitude: 19.2800, longitude: 72.8700, status: 'busy', incident_title: 'Medical Emergency' },
    { id: '4', vehicle_id: 'RV-003', team_name: 'Golden Nest Relief', latitude: 19.2950, longitude: 72.8600, status: 'available', incident_title: null },
    { id: '5', vehicle_id: 'AMB-002', team_name: 'GCC Medical Unit', latitude: 19.2800, longitude: 72.8750, status: 'available', incident_title: null },
    { id: '6', vehicle_id: 'RV-004', team_name: 'Uttan Coastal SAR', latitude: 19.3150, longitude: 72.8100, status: 'responding', incident_title: 'Flood Water Rising' },
];

const DEMO_INCIDENTS = [
    { id: '1', title: 'Building Collapse - Near Maxus', latitude: 19.3100, longitude: 72.8440, severity: 'critical', description: 'Old building near Maxus Mall collapsed. Multiple casualties reported.', status: 'in_progress', assigned_team_name: 'Bhayander-West Medical', created_at: new Date(Date.now() - 3600000).toISOString() },
    { id: '2', title: 'Flood Water Rising - Uttan', latitude: 19.3200, longitude: 72.8050, severity: 'high', description: 'High tide causing water logging in low-lying coastal areas of Uttan.', status: 'reported', assigned_team_name: null, created_at: new Date(Date.now() - 1800000).toISOString() },
    { id: '3', title: 'Road Blocked - WEH Mira Road', latitude: 19.2900, longitude: 72.8710, severity: 'medium', description: 'Tree fell blocking the Western Express Highway.', status: 'reported', assigned_team_name: null, created_at: new Date(Date.now() - 900000).toISOString() },
    { id: '4', title: 'Medical Emergency - GCC Club', latitude: 19.2800, longitude: 72.8750, severity: 'high', description: 'Multiple heatstrokes reported at relief camp.', status: 'in_progress', assigned_team_name: 'Mira Road Ambulance', created_at: new Date(Date.now() - 600000).toISOString() },
    { id: '5', title: 'Gas Leak - Kashimira', latitude: 19.2850, longitude: 72.8800, severity: 'critical', description: 'Gas leak reported near Kashimira intersection.', status: 'reported', assigned_team_name: null, created_at: new Date(Date.now() - 300000).toISOString() },
];

const DEMO_CONGESTION = [
    { id: '1', road_segment: 'WEH - Fountain Hotel', latitude: 19.2920, longitude: 72.8750, vehicle_density: 8, average_speed: 5.2, status: 'congested' },
    { id: '2', road_segment: 'Mira Road Station Rd', latitude: 19.2820, longitude: 72.8550, vehicle_density: 4, average_speed: 18.5, status: 'moderate' },
    { id: '3', road_segment: 'Bhayander Phatak', latitude: 19.3050, longitude: 72.8580, vehicle_density: 6, average_speed: 8.1, status: 'congested' },
];

export default function DashboardPage() {
    const [teams, setTeams] = useState(DEMO_TEAMS);
    const [incidents, setIncidents] = useState(DEMO_INCIDENTS);
    const [congestion, setCongestion] = useState(DEMO_CONGESTION);
    const [activePanel, setActivePanel] = useState('incidents');
    const [selectedTeam, setSelectedTeam] = useState(null);
    const [showAssignModal, setShowAssignModal] = useState(null);

    // Simulate real-time movement
    useEffect(() => {
        const interval = setInterval(() => {
            setTeams(prev => prev.map(t => ({
                ...t,
                latitude: t.latitude + (Math.random() - 0.5) * 0.001,
                longitude: t.longitude + (Math.random() - 0.5) * 0.001,
            })));
        }, 3000);
        return () => clearInterval(interval);
    }, []);

    const handleAssign = (incident) => {
        setShowAssignModal(incident);
    };

    const confirmAssign = (incidentId, teamId) => {
        setIncidents(prev => prev.map(i =>
            i.id === incidentId ? { ...i, status: 'in_progress', assigned_team_name: teams.find(t => t.id === teamId)?.team_name } : i
        ));
        setTeams(prev => prev.map(t =>
            t.id === teamId ? { ...t, status: 'responding' } : t
        ));
        setShowAssignModal(null);
    };

    const statusCounts = {
        available: teams.filter(t => t.status === 'available').length,
        responding: teams.filter(t => t.status === 'responding').length,
        busy: teams.filter(t => t.status === 'busy').length,
    };

    const incidentCounts = {
        critical: incidents.filter(i => i.severity === 'critical').length,
        active: incidents.filter(i => i.status !== 'resolved' && i.status !== 'closed').length,
        unassigned: incidents.filter(i => !i.assigned_team_name).length,
    };

    return (
        <div className="min-h-screen bg-slate-950 flex flex-col">
            <Navbar />

            <div className="flex-1 flex flex-col lg:flex-row">
                {/* Main Map Area */}
                <div className="flex-1 relative">
                    {/* Status Bar */}
                    <div className="absolute top-4 left-4 right-4 z-20 flex flex-wrap gap-2">
                        <div className="glass px-6 py-2.5 rounded-2xl flex items-center gap-6 border-white/5">
                            <div className="flex items-center gap-2.5">
                                <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.6)]" />
                                <span className="text-[10px] text-slate-300 font-bold uppercase tracking-wider">{statusCounts.available} Available</span>
                            </div>
                            <div className="flex items-center gap-2.5">
                                <div className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse shadow-[0_0_12px_rgba(251,191,36,0.6)]" />
                                <span className="text-[10px] text-slate-300 font-bold uppercase tracking-wider">{statusCounts.responding} Responding</span>
                            </div>
                            <div className="flex items-center gap-2.5">
                                <div className="w-2.5 h-2.5 rounded-full bg-red-400 shadow-[0_0_8px_rgba(248,113,113,0.6)]" />
                                <span className="text-[10px] text-slate-300 font-bold uppercase tracking-wider">{statusCounts.busy} Busy</span>
                            </div>
                        </div>
                        <div className="glass px-6 py-2.5 rounded-2xl flex items-center gap-3 border-white/5">
                            <span className="text-[10px] text-red-400 font-black uppercase tracking-widest">{incidentCounts.critical} Critical Incidents</span>
                            <span className="text-slate-800">|</span>
                            <span className="text-[10px] text-amber-400 font-black uppercase tracking-widest">{incidentCounts.unassigned} Unassigned</span>
                        </div>
                    </div>

                    <MapView
                        teams={teams}
                        incidents={incidents}
                        congestion={congestion}
                        center={[19.2902, 72.8711]}
                        zoom={14}
                        height="100%"
                        className="min-h-[400px] lg:min-h-0"
                    />
                </div>

                {/* Side Panel */}
                <div className="w-full lg:w-96 bg-slate-900/95 border-l border-slate-700/50 flex flex-col max-h-[50vh] lg:max-h-none overflow-hidden">
                    {/* Panel Tabs */}
                    <div className="flex border-b border-slate-700/50 px-2 pt-2">
                        {[
                            { key: 'incidents', label: 'Incidents', count: incidentCounts.active },
                            { key: 'teams', label: 'Teams', count: teams.length },
                            { key: 'congestion', label: 'Traffic', count: congestion.length },
                        ].map(tab => (
                            <button
                                key={tab.key}
                                onClick={() => setActivePanel(tab.key)}
                                className={`flex-1 px-4 py-4 text-[10px] font-black uppercase tracking-[0.2em] rounded-t-xl transition-all duration-300 relative ${activePanel === tab.key
                                        ? 'bg-slate-900 text-white'
                                        : 'text-slate-500 hover:text-slate-300 hover:bg-white/5'
                                    }`}
                            >
                                {tab.label}
                                <span className={`ml-2 px-1.5 py-0.5 rounded-md ${activePanel === tab.key ? 'bg-red-500 text-white shadow-[0_0_10px_rgba(239,68,68,0.3)]' : 'bg-slate-800 text-slate-500'
                                    }`}>
                                    {tab.count}
                                </span>
                                {activePanel === tab.key && (
                                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-red-600" />
                                )}
                            </button>
                        ))}
                    </div>

                    {/* Panel Content */}
                    <div className="flex-1 overflow-y-auto p-3 space-y-2">
                        {activePanel === 'incidents' && incidents.map(incident => (
                            <IncidentCard key={incident.id} incident={incident} onAssign={handleAssign} />
                        ))}
                        {activePanel === 'teams' && teams.map(team => (
                            <TeamCard key={team.id} team={team} />
                        ))}
                        {activePanel === 'congestion' && congestion.map(zone => (
                            <div key={zone.id} className="bg-slate-800/80 p-4 rounded-xl border border-slate-700/50">
                                <div className="flex items-center justify-between mb-2">
                                    <h3 className="text-sm font-semibold text-white">{zone.road_segment}</h3>
                                    <StatusBadge status={zone.status} size="xs" />
                                </div>
                                <div className="flex items-center gap-4 text-xs text-slate-400">
                                    <span>🚗 {zone.vehicle_density} vehicles</span>
                                    <span>⚡ {zone.average_speed} km/h</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Assign Modal */}
            {showAssignModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 lg:p-12">
                    <div className="bg-slate-900 border border-slate-700 w-full max-w-4xl rounded-[2rem] shadow-2xl flex flex-col max-h-full overflow-hidden">
                        
                        {/* Header */}
                        <div className="p-6 sm:p-8 border-b border-slate-800 bg-slate-800/30">
                            <div className="flex items-start sm:items-center justify-between gap-4 mb-3">
                                <div>
                                    <h3 className="text-2xl sm:text-3xl font-black text-white tracking-tight">Assign Tactical Team</h3>
                                    <p className="text-sm sm:text-base text-slate-400 mt-1">Select a response unit for: <span className="text-white font-bold">{showAssignModal.title}</span></p>
                                </div>
                                <button onClick={() => setShowAssignModal(null)} className="p-3 text-slate-400 hover:text-white bg-slate-800 rounded-xl transition-all hover:bg-red-600 hover:rotate-90">
                                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                                </button>
                            </div>
                        </div>

                        {/* Team List Box */}
                        <div className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-4">
                            {teams.filter(t => t.status === 'available').length > 0 ? (
                                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
                                    {teams.filter(t => t.status === 'available').map(team => (
                                        <button
                                            key={team.id}
                                            onClick={() => confirmAssign(showAssignModal.id, team.id)}
                                            className="group relative text-left bg-slate-800/40 hover:bg-slate-800 border border-slate-700 hover:border-blue-500/50 p-6 rounded-2xl transition-all duration-300 hover:-translate-y-1 hover:shadow-xl shadow-black/50"
                                        >
                                            <div className="flex justify-between items-start mb-5">
                                                <div>
                                                    <p className="text-lg font-bold text-white group-hover:text-blue-400 transition-colors leading-tight">{team.team_name}</p>
                                                    <p className="text-xs text-slate-500 uppercase tracking-widest font-bold mt-1.5">{team.vehicle_id}</p>
                                                </div>
                                            </div>
                                            
                                            <div className="flex items-center justify-between mt-auto pt-4 border-t border-slate-700/50">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-1.5 h-1.5 rounded-full bg-slate-500" />
                                                    <span className="text-xs font-mono text-slate-400">{team.latitude.toFixed(4)}, {team.longitude.toFixed(4)}</span>
                                                </div>
                                                <div className="w-8 h-8 rounded-full bg-slate-700/80 flex items-center justify-center group-hover:bg-blue-600 group-hover:shadow-[0_0_15px_rgba(37,99,235,0.5)] transition-all">
                                                    <svg className="w-4 h-4 text-white group-hover:translate-x-0.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12h15m0 0l-6.75-6.75M19.5 12l-6.75 6.75" /></svg>
                                                </div>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-20 bg-slate-800/20 rounded-2xl border border-slate-800 border-dashed">
                                    <div className="w-16 h-16 rounded-full bg-slate-800 flex items-center justify-center mx-auto mb-4">
                                        <svg className="w-8 h-8 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                        </svg>
                                    </div>
                                    <p className="text-xl text-slate-300 font-bold mb-2">No Available Teams</p>
                                    <p className="text-base text-slate-500">All teams are currently busy or responding to other active missions.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
