'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import Navbar from '@/components/Navbar';
import { StatusBadge } from '@/components/Cards';
import { sendLocationUpdate } from '@/lib/socket';
import api from '@/lib/api';

const MapView = dynamic(() => import('@/components/MapView'), { ssr: false });

const DEMO_MISSION = {
    id: 'm1',
    incident: {
        id: 'i1',
        title: 'Building Collapse - Near Maxus',
        latitude: 19.3100,
        longitude: 72.8440,
        severity: 'critical',
        description: 'Old building near Maxus Mall collapsed. Multiple casualties reported. Need rescue with heavy equipment.',
    },
    status: 'en_route',
    started_at: new Date(Date.now() - 1200000).toISOString(),
};

export default function RescuePage() {
    const [teamStatus, setTeamStatus] = useState('responding');
    const [mission, setMission] = useState(DEMO_MISSION);
    const [position, setPosition] = useState({ lat: 19.2952, lng: 72.8544 }); // Starting from Mira Bhayander on land
    const [showReportModal, setShowReportModal] = useState(false);
    const [isOnline, setIsOnline] = useState(true);
    const [reportForm, setReportForm] = useState({ title: '', description: '', severity: 'medium', type: 'general' });
    const [route, setRoute] = useState([]);
    const [congestion, setCongestion] = useState([]);

    // 🟢 Fetch Smart Route and Congestion Data
    useEffect(() => {
        async function loadNavData() {
            try {
                // Get active congestion heatmaps
                const conData = await api.getCongestion();
                setCongestion(conData);
                
                if (mission) {
                    // Get smart route avoiding congestion
                    const res = await api.getOptimizedRoute(
                        position.lat, position.lng,
                        mission.incident.latitude, mission.incident.longitude
                    );
                    if (res && res.recommended_route) {
                        setRoute(res.recommended_route.waypoints);
                    }
                }
            } catch (err) {
                console.error("Navigation load failed:", err);
            }
        }
        loadNavData();
    }, [mission]);

    useEffect(() => {
        const interval = setInterval(() => {
            setPosition(prev => {
                const target = mission.incident;
                const dx = (target.latitude - prev.lat) * 0.02;
                const dy = (target.longitude - prev.lng) * 0.02;
                const nextPos = { lat: prev.lat + dx + (Math.random() - 0.5) * 0.0003, lng: prev.lng + dy + (Math.random() - 0.5) * 0.0003 };
                
                // Emitting the newly generated position to the command center
                sendLocationUpdate('RV-001', nextPos.lat, nextPos.lng, 35, 90);
                
                return nextPos;
            });
        }, 2000);
        return () => clearInterval(interval);
    }, [mission]);

    useEffect(() => {
        const handle = () => setIsOnline(navigator.onLine);
        window.addEventListener('online', handle);
        window.addEventListener('offline', handle);
        return () => { window.removeEventListener('online', handle); window.removeEventListener('offline', handle); };
    }, []);

    const handleStatusChange = (status) => setTeamStatus(status);

    const handleReport = (e) => {
        e.preventDefault();
        setShowReportModal(false);
        setReportForm({ title: '', description: '', severity: 'medium', type: 'general' });
    };

    const distanceToTarget = () => {
        const R = 6371;
        const dLat = (mission.incident.latitude - position.lat) * Math.PI / 180;
        const dLng = (mission.incident.longitude - position.lng) * Math.PI / 180;
        const a = Math.sin(dLat / 2) ** 2 + Math.cos(position.lat * Math.PI / 180) * Math.cos(mission.incident.latitude * Math.PI / 180) * Math.sin(dLng / 2) ** 2;
        return (R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)) * 1000).toFixed(0);
    };

    const teamMarker = [{ id: 'self', vehicle_id: 'RV-001', team_name: 'You', latitude: position.lat, longitude: position.lng, status: teamStatus }];
    const incidentMarker = [mission.incident];

    return (
        <div className="min-h-screen bg-slate-950 flex flex-col">
            <Navbar />

            {/* Main Content: Side-by-Side Layout */}
            <div className="flex-1 flex flex-col lg:flex-row">

                {/* LEFT: Map (takes majority space) */}
                <div className="flex-1 relative min-h-[400px] lg:min-h-0">
                    <MapView
                        teams={teamMarker}
                        incidents={incidentMarker}
                        congestion={congestion}
                        route={route}
                        center={[position.lat, position.lng]}
                        zoom={15}
                        height="100%"
                    />

                    {/* ETA Overlay on Map */}
                    <div className="absolute bottom-6 left-6 right-6 z-20 lg:right-auto lg:max-w-md">
                        <div className="glass rounded-2xl p-5">
                            <div className="flex items-center justify-between mb-3">
                                <div>
                                    <p className="text-sm text-slate-400 font-medium">Navigating to</p>
                                    <p className="text-lg font-bold text-white">{mission.incident.title}</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-2xl font-black text-red-400">{distanceToTarget()}m</p>
                                    <p className="text-xs text-slate-500 font-medium">remaining</p>
                                </div>
                            </div>
                            <div className="w-full bg-slate-700 rounded-full h-2">
                                <div className="bg-gradient-to-r from-red-500 to-amber-500 h-2 rounded-full transition-all" style={{ width: `${Math.max(10, 100 - parseInt(distanceToTarget()) / 20)}%` }} />
                            </div>
                        </div>
                    </div>

                    {/* Connection Status (top-left on map) */}
                    <div className="absolute top-4 left-4 z-20">
                        <div className="glass rounded-xl px-4 py-2.5 flex items-center gap-2.5">
                            <div className={`w-3 h-3 rounded-full ${isOnline ? 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.6)]' : 'bg-red-400 animate-pulse shadow-[0_0_8px_rgba(248,113,113,0.6)]'}`} />
                            <span className="text-sm text-slate-300 font-bold">{isOnline ? 'Connected' : 'Offline Mode'}</span>
                        </div>
                    </div>
                </div>

                {/* RIGHT: Controls Panel */}
                <div className="w-full lg:w-[420px] bg-slate-900 border-t lg:border-t-0 lg:border-l border-slate-800 flex flex-col">

                    {/* Status Header */}
                    <div className="px-6 py-5 border-b border-slate-800 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className={`w-3 h-3 rounded-full ${teamStatus === 'responding' ? 'bg-amber-400 animate-pulse shadow-[0_0_10px_rgba(251,191,36,0.6)]' : teamStatus === 'available' ? 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.5)]' : 'bg-red-400'}`} />
                            <span className="text-lg font-bold text-white capitalize">{teamStatus}</span>
                        </div>
                        <StatusBadge status={teamStatus} size="md" />
                    </div>

                    {/* Mission Info */}
                    <div className="px-6 py-5 border-b border-slate-800">
                        <div className="flex items-center gap-2 mb-4">
                            <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                            <p className="text-sm text-red-400 font-black uppercase tracking-widest">Active Mission</p>
                        </div>
                        <div className="bg-slate-800/60 rounded-2xl p-5 border border-slate-700/50">
                            <div className="flex items-start justify-between gap-3 mb-3">
                                <h3 className="text-lg font-bold text-white leading-tight">{mission.incident.title}</h3>
                                <StatusBadge status={mission.incident.severity} size="sm" />
                            </div>
                            <p className="text-base text-slate-400 mb-4 leading-relaxed">{mission.incident.description}</p>
                            <div className="flex items-center gap-5 text-sm text-slate-500">
                                <span className="font-medium">Started {new Date(mission.started_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                <span className="font-mono text-xs">{mission.incident.latitude.toFixed(4)}, {mission.incident.longitude.toFixed(4)}</span>
                            </div>
                        </div>
                    </div>

                    {/* Status Toggle */}
                    <div className="px-6 py-5 border-b border-slate-800">
                        <p className="text-sm text-slate-500 font-bold uppercase tracking-wider mb-4">Update Your Status</p>
                        <div className="grid grid-cols-3 gap-3">
                            {['available', 'responding', 'busy'].map(s => (
                                <button
                                    key={s}
                                    onClick={() => handleStatusChange(s)}
                                    className={`py-4 text-sm font-bold uppercase tracking-wider rounded-2xl transition-all duration-300 ${teamStatus === s
                                            ? s === 'available' ? 'bg-emerald-600 text-white shadow-[0_0_20px_rgba(16,185,129,0.3)]' :
                                                s === 'responding' ? 'bg-amber-600 text-white shadow-[0_0_20px_rgba(245,158,11,0.3)] animate-pulse' :
                                                    'bg-red-600 text-white shadow-[0_0_20px_rgba(239,68,68,0.3)]'
                                            : 'bg-slate-800 border border-slate-700 text-slate-500 hover:text-slate-300 hover:border-slate-500'
                                        }`}
                                >
                                    {s}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Action Buttons — fill remaining space */}
                    <div className="px-6 py-5 flex-1 flex flex-col gap-4 justify-center">
                        <button
                            onClick={() => setShowReportModal(true)}
                            className="w-full py-5 bg-red-600 hover:bg-red-500 text-white font-black uppercase tracking-widest rounded-2xl text-base transition-all shadow-[0_0_25px_rgba(239,68,68,0.2)] hover:shadow-[0_0_35px_rgba(239,68,68,0.4)] flex items-center justify-center gap-3 active:scale-95"
                        >
                            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                            </svg>
                            Report Incident
                        </button>
                        <button
                            className="w-full py-5 bg-slate-800 hover:bg-slate-700 text-white font-black uppercase tracking-widest rounded-2xl text-base transition-all border border-slate-700 hover:border-slate-500 flex items-center justify-center gap-3 active:scale-95 shadow-xl"
                        >
                            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                            </svg>
                            Road Blockage
                        </button>

                        {/* Offline Warning */}
                        {!isOnline && (
                            <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-4 flex items-center gap-4">
                                <div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center flex-shrink-0">
                                    <svg className="w-5 h-5 text-amber-400" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M8.288 15.038a5.25 5.25 0 017.424 0M5.106 11.856c3.807-3.808 9.98-3.808 13.788 0M1.924 8.674c5.565-5.565 14.587-5.565 20.152 0M12.53 18.22l-.53.53-.53-.53a.75.75 0 011.06 0z" />
                                    </svg>
                                </div>
                                <div>
                                    <p className="text-base font-bold text-amber-400">Offline Mode Active</p>
                                    <p className="text-sm text-slate-500">Data will sync when connection is restored</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Report Modal */}
            {showReportModal && (
                <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm">
                    <div className="bg-slate-900 border border-slate-700 rounded-t-2xl sm:rounded-2xl p-8 w-full max-w-lg shadow-2xl">
                        <h3 className="text-2xl font-black text-white mb-6">Report Incident</h3>
                        <form onSubmit={handleReport} className="space-y-5">
                            <input
                                type="text"
                                value={reportForm.title}
                                onChange={(e) => setReportForm({ ...reportForm, title: e.target.value })}
                                className="w-full px-5 py-4 bg-slate-800 border border-slate-600 rounded-xl text-white text-base focus:outline-none focus:border-red-500/50"
                                placeholder="Incident title"
                                required
                            />
                            <textarea
                                value={reportForm.description}
                                onChange={(e) => setReportForm({ ...reportForm, description: e.target.value })}
                                className="w-full px-5 py-4 bg-slate-800 border border-slate-600 rounded-xl text-white text-base focus:outline-none focus:border-red-500/50 h-24 resize-none"
                                placeholder="What happened?"
                                required
                            />
                            <div className="grid grid-cols-2 gap-4">
                                <select
                                    value={reportForm.severity}
                                    onChange={(e) => setReportForm({ ...reportForm, severity: e.target.value })}
                                    className="px-4 py-4 bg-slate-800 border border-slate-600 rounded-xl text-white text-base"
                                >
                                    <option value="low">Low</option>
                                    <option value="medium">Medium</option>
                                    <option value="high">High</option>
                                    <option value="critical">Critical</option>
                                </select>
                                <select
                                    value={reportForm.type}
                                    onChange={(e) => setReportForm({ ...reportForm, type: e.target.value })}
                                    className="px-4 py-4 bg-slate-800 border border-slate-600 rounded-xl text-white text-base"
                                >
                                    <option value="general">General</option>
                                    <option value="structural">Structural</option>
                                    <option value="flood">Flood</option>
                                    <option value="medical">Medical</option>
                                    <option value="blockage">Blockage</option>
                                </select>
                            </div>
                            <div className="flex gap-4">
                                <button type="button" onClick={() => setShowReportModal(false)} className="flex-1 py-4 text-base font-bold bg-slate-800 text-slate-400 rounded-xl hover:bg-slate-700 active:scale-95">Cancel</button>
                                <button type="submit" className="flex-1 py-4 text-base font-bold bg-red-600 text-white rounded-xl hover:bg-red-500 active:scale-95 shadow-lg shadow-red-600/20">Submit Report</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
