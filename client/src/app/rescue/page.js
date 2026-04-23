'use client';

import { useState, useEffect, useRef } from 'react';
import dynamic from 'next/dynamic';
import Navbar from '@/components/Navbar';
import { StatusBadge } from '@/components/Cards';
import { getSocket, joinTeam, sendLocationUpdate } from '@/lib/socket';
import api from '@/lib/api';

const MapView = dynamic(() => import('@/components/MapView'), { ssr: false });

export default function RescuePage() {
    const [teamStatus, setTeamStatus] = useState('available');
    const [myTeam, setMyTeam] = useState(null);           // This team's DB record
    const [mission, setMission] = useState(null);          // Active mission (null = standby)
    const [position, setPosition] = useState({ lat: 19.2952, lng: 72.8544 });
    const [showReportModal, setShowReportModal] = useState(false);
    const [showBlockageModal, setShowBlockageModal] = useState(false);
    const [isOnline, setIsOnline] = useState(true);
    const [loading, setLoading] = useState(true);
    const [reportForm, setReportForm] = useState({ title: '', description: '', severity: 'medium', type: 'general' });
    const [route, setRoute] = useState([]);
    const [congestion, setCongestion] = useState([]);
    const [newMissionAlert, setNewMissionAlert] = useState(false);
    const [activeIncidents, setActiveIncidents] = useState([]);

    const positionRef = useRef(position);
    positionRef.current = position;

    // ─── 1. Load team identity + initial mission ──────────────────────────────
    useEffect(() => {
        async function bootstrap() {
            setLoading(true);
            try {
                // Identify which team this user belongs to
                const user = api.getUser();
                const teams = await api.getTeams();

                // Match by vehicle_id from user profile, or pick first team as default (demo)
                const vehicleId = user?.vehicle_id || 'RV-001';
                const team = teams.find(t => t.vehicle_id === vehicleId) || teams[0];
                setMyTeam(team);

                if (team) {
                    setTeamStatus(team.status || 'available');
                    // Seed position from DB coordinates if available
                    if (team.latitude && team.longitude) {
                        setPosition({ lat: parseFloat(team.latitude), lng: parseFloat(team.longitude) });
                    }

                    // Find an active incident assigned to this team, and save all active incidents for the map
                    const incidents = await api.getIncidents();
                    
                    const active = incidents.filter(i => i.status !== 'resolved' && i.status !== 'closed');
                    setActiveIncidents(active);

                    const assigned = active.find(i =>
                        i.assigned_team_name === team.team_name ||
                        i.assigned_team_id === team.id
                    );

                    if (assigned) {
                        setMission({
                            id: 'live-' + assigned.id,
                            incident: assigned,
                            status: 'en_route',
                            started_at: assigned.updated_at || assigned.created_at,
                        });
                        setTeamStatus('responding');
                    }
                }
            } catch (err) {
                console.error('[Rescue] Bootstrap failed:', err);
            } finally {
                setLoading(false);
            }
        }
        bootstrap();
    }, []);

    // ─── 2. WebSocket — join team room & listen for live assignments ──────────
    useEffect(() => {
        if (!myTeam) return;

        const socket = getSocket();
        joinTeam(myTeam.id);

        // Live mission assignment from Command Center
        const handleNewMission = (incident) => {
            setMission({
                id: 'live-' + incident.id,
                incident,
                status: 'en_route',
                started_at: new Date().toISOString(),
            });
            setTeamStatus('responding');
            setNewMissionAlert(true);
            setTimeout(() => setNewMissionAlert(false), 6000);
        };

        // Live incident updates (e.g. cancellation or status change)
        const handleIncidentUpdate = (incident) => {
            setActiveIncidents(prev => {
                const exists = prev.some(i => i.id === incident.id);
                if (incident.status === 'resolved' || incident.status === 'closed') {
                    return prev.filter(i => i.id !== incident.id);
                }
                if (exists) {
                    return prev.map(i => i.id === incident.id ? incident : i);
                }
                return [...prev, incident];
            });

            setMission(prev => {
                if (!prev) return prev;
                if (prev.incident.id === incident.id) {
                    if (incident.status === 'resolved' || incident.status === 'closed') {
                        setTeamStatus('available');
                        return null;
                    }
                    return { ...prev, incident };
                }
                return prev;
            });
        };

        const handleNewIncident = (incident) => {
            setActiveIncidents(prev => [...prev, incident]);
        };

        socket.on('mission:new', handleNewMission);
        socket.on('incident:new', handleNewIncident);
        socket.on('incident:updated', handleIncidentUpdate);

        return () => {
            socket.off('mission:new', handleNewMission);
            socket.off('incident:new', handleNewIncident);
            socket.off('incident:updated', handleIncidentUpdate);
        };
    }, [myTeam]);

    // ─── 3. Fetch congestion + optimized route once mission is known ──────────
    useEffect(() => {
        async function loadNavData() {
            try {
                const conData = await api.getCongestion();
                setCongestion(conData);

                if (mission) {
                    const res = await api.getOptimizedRoute(
                        positionRef.current.lat, positionRef.current.lng,
                        mission.incident.latitude, mission.incident.longitude
                    );
                    if (res?.recommended_route) {
                        setRoute(res.recommended_route.waypoints || []);
                    }
                }
            } catch (err) {
                console.error('[Rescue] Nav data failed:', err);
            }
        }
        loadNavData();
    }, [mission]);

    // ─── 4. GPS simulation — move toward incident or patrol, emit location ──────
    useEffect(() => {
        if (!myTeam) return;
        const vehicleId = myTeam.vehicle_id || 'RV-001';

        const interval = setInterval(() => {
            setPosition(prev => {
                let nextPos;
                
                if (mission) {
                    // Mission Mode: Move toward target
                    const target = mission.incident;
                    const dx = (target.latitude - prev.lat) * 0.02;
                    const dy = (target.longitude - prev.lng) * 0.02;
                    nextPos = {
                        lat: prev.lat + dx + (Math.random() - 0.5) * 0.0003,
                        lng: prev.lng + dy + (Math.random() - 0.5) * 0.0003,
                    };
                } else {
                    // Patrol Mode: Small random movements around current area
                    nextPos = {
                        lat: prev.lat + (Math.random() - 0.5) * 0.0005,
                        lng: prev.lng + (Math.random() - 0.5) * 0.0005,
                    };
                }

                // Emit to websocket so Command Center sees the movement
                sendLocationUpdate(vehicleId, nextPos.lat, nextPos.lng, 35, 90);
                return nextPos;
            });
        }, 3000); // Pulse every 3 seconds

        return () => clearInterval(interval);
    }, [mission, myTeam]);

    // ─── 5. Online/Offline detection ─────────────────────────────────────────
    useEffect(() => {
        const handle = () => setIsOnline(navigator.onLine);
        window.addEventListener('online', handle);
        window.addEventListener('offline', handle);
        return () => {
            window.removeEventListener('online', handle);
            window.removeEventListener('offline', handle);
        };
    }, []);

    // ─── Handlers ─────────────────────────────────────────────────────────────
    const handleStatusChange = async (status) => {
        setTeamStatus(status);
        if (myTeam) {
            try { await api.updateTeamStatus(myTeam.id, status); } catch (_) { /* silent */ }
        }
    };

    const handleReport = async (e) => {
        e.preventDefault();
        try {
            await api.createIncident({
                ...reportForm,
                latitude: position.lat,
                longitude: position.lng,
                incident_type: reportForm.type,
            });
        } catch (err) {
            console.error('[Rescue] Incident report failed:', err);
        }
        setShowReportModal(false);
        setReportForm({ title: '', description: '', severity: 'medium', type: 'general' });
    };

    const distanceToTarget = () => {
        if (!mission) return 0;
        const R = 6371;
        const dLat = (mission.incident.latitude - position.lat) * Math.PI / 180;
        const dLng = (mission.incident.longitude - position.lng) * Math.PI / 180;
        const a = Math.sin(dLat / 2) ** 2 +
            Math.cos(position.lat * Math.PI / 180) *
            Math.cos(mission.incident.latitude * Math.PI / 180) *
            Math.sin(dLng / 2) ** 2;
        return (R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)) * 1000).toFixed(0);
    };

    const teamMarker = myTeam
        ? [{ id: myTeam.id, vehicle_id: myTeam.vehicle_id, team_name: 'You', latitude: position.lat, longitude: position.lng, status: teamStatus }]
        : [];
    
    // Show all active incidents on the map, not just the assigned one
    const mapIncidents = activeIncidents.map(inc => {
        // Highlight the assigned mission
        if (mission && mission.incident.id === inc.id) {
            return { ...inc, isMissionTarget: true };
        }
        return inc;
    });

    // ─── Loading state ─────────────────────────────────────────────────────────
    if (loading) {
        return (
            <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center">
                <div className="w-12 h-12 border-4 border-slate-800 border-t-red-500 rounded-full animate-spin" />
                <p className="text-slate-500 mt-4 font-mono text-sm tracking-widest uppercase">Syncing Mission Data...</p>
            </div>
        );
    }

    return (
        <>
        <div className="min-h-screen bg-slate-950 flex flex-col">
            <Navbar />

            {/* New Mission Alert Banner */}
            {newMissionAlert && (
                <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[9999] flex items-center gap-4 px-6 py-4 bg-red-600 text-white rounded-2xl shadow-2xl shadow-red-600/40 animate-bounce">
                    <div className="w-3 h-3 rounded-full bg-white animate-ping" />
                    <span className="font-black uppercase tracking-widest text-sm">New Mission Assigned!</span>
                </div>
            )}

            {/* Main Content: Side-by-Side Layout */}
            <div className="flex-1 flex flex-col lg:flex-row">

                {/* LEFT: Map */}
                <div className="flex-1 relative min-h-[400px] lg:min-h-0">
                    <MapView
                        teams={teamMarker}
                        incidents={mapIncidents}
                        congestion={congestion}
                        route={route}
                        center={[position.lat, position.lng]}
                        zoom={15}
                        height="100%"
                    />

                    {/* ETA Overlay — only shown when on a mission */}
                    {mission && (
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
                                    <div
                                        className="bg-gradient-to-r from-red-500 to-amber-500 h-2 rounded-full transition-all duration-1000"
                                        style={{ width: `${Math.max(5, 100 - parseInt(distanceToTarget()) / 20)}%` }}
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Connection Status */}
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
                            <div className={`w-3 h-3 rounded-full ${
                                teamStatus === 'responding' ? 'bg-amber-400 animate-pulse shadow-[0_0_10px_rgba(251,191,36,0.6)]' :
                                teamStatus === 'available' ? 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.5)]' :
                                'bg-red-400'}`}
                            />
                            <span className="text-lg font-bold text-white capitalize">{teamStatus}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            {myTeam && <span className="text-xs text-slate-500 font-mono">{myTeam.vehicle_id}</span>}
                            <StatusBadge status={teamStatus} size="md" />
                        </div>
                    </div>

                    {/* Mission Info */}
                    <div className="px-6 py-5 border-b border-slate-800">
                        {mission ? (
                            <>
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
                                        <span className="font-medium">
                                            Started {new Date(mission.started_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </span>
                                        <span className="font-mono text-xs">
                                            {parseFloat(mission.incident.latitude).toFixed(4)}, {parseFloat(mission.incident.longitude).toFixed(4)}
                                        </span>
                                    </div>
                                </div>
                            </>
                        ) : (
                            // Standby state
                            <div className="flex flex-col items-center text-center py-4">
                                <div className="w-14 h-14 rounded-2xl bg-slate-800 flex items-center justify-center mb-4 border border-slate-700">
                                    <svg className="w-7 h-7 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </div>
                                <p className="text-base font-bold text-slate-300">On Standby</p>
                                <p className="text-sm text-slate-600 mt-1">Awaiting mission assignment from Command Center</p>
                            </div>
                        )}
                    </div>

                    {/* Status Toggle */}
                    <div className="px-6 py-5 border-b border-slate-800">
                        <p className="text-sm text-slate-500 font-bold uppercase tracking-wider mb-4">Update Your Status</p>
                        <div className="grid grid-cols-3 gap-3">
                            {['available', 'responding', 'busy'].map(s => (
                                <button
                                    key={s}
                                    onClick={() => handleStatusChange(s)}
                                    className={`py-4 text-sm font-bold uppercase tracking-wider rounded-2xl transition-all duration-300 ${
                                        teamStatus === s
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

                    {/* Action Buttons */}
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
                            onClick={() => setShowBlockageModal(true)}
                            className="w-full py-5 bg-slate-800 hover:bg-slate-700 text-white font-black uppercase tracking-widest rounded-2xl text-base transition-all border border-slate-700 hover:border-amber-500/50 flex items-center justify-center gap-3 active:scale-95 shadow-xl"
                        >
                            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                            </svg>
                            Road Blockage
                        </button>

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
        </div>

        {/* ── Report Incident Modal — outside layout for correct fixed positioning ── */}
        {showReportModal && (
            <div className="fixed inset-0 z-[9999] flex items-end sm:items-center justify-center bg-black/70 backdrop-blur-sm p-4">
                <div className="bg-slate-900 border border-slate-700 rounded-t-3xl sm:rounded-3xl p-8 w-full max-w-lg shadow-2xl">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-2xl font-black text-white">Report Incident</h3>
                        <button onClick={() => setShowReportModal(false)} className="p-2 text-slate-400 hover:text-white bg-slate-800 rounded-xl hover:bg-red-600 transition-all">
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                        </button>
                    </div>
                    <form onSubmit={handleReport} className="space-y-5">
                        <input
                            type="text"
                            value={reportForm.title}
                            onChange={(e) => setReportForm({ ...reportForm, title: e.target.value })}
                            className="w-full px-5 py-4 bg-slate-800 border border-slate-600 rounded-xl text-white text-base focus:outline-none focus:border-red-500/70 transition-colors"
                            placeholder="Incident title"
                            required
                        />
                        <textarea
                            value={reportForm.description}
                            onChange={(e) => setReportForm({ ...reportForm, description: e.target.value })}
                            className="w-full px-5 py-4 bg-slate-800 border border-slate-600 rounded-xl text-white text-base focus:outline-none focus:border-red-500/70 transition-colors h-24 resize-none"
                            placeholder="What happened?"
                            required
                        />
                        <div className="grid grid-cols-2 gap-4">
                            <select
                                value={reportForm.severity}
                                onChange={(e) => setReportForm({ ...reportForm, severity: e.target.value })}
                                className="px-4 py-4 bg-slate-800 border border-slate-600 rounded-xl text-white text-base focus:outline-none focus:border-red-500/70"
                            >
                                <option value="low">Low</option>
                                <option value="medium">Medium</option>
                                <option value="high">High</option>
                                <option value="critical">Critical</option>
                            </select>
                            <select
                                value={reportForm.type}
                                onChange={(e) => setReportForm({ ...reportForm, type: e.target.value })}
                                className="px-4 py-4 bg-slate-800 border border-slate-600 rounded-xl text-white text-base focus:outline-none focus:border-red-500/70"
                            >
                                <optgroup label="🔥 Fire &amp; Explosion">
                                    <option value="fire">🔥 Fire (Building)</option>
                                    <option value="vehicle_fire">🚗 Vehicle Fire</option>
                                    <option value="forest_fire">🌲 Forest / Wildfire</option>
                                    <option value="explosion">💥 Explosion</option>
                                    <option value="gas_leak">⛽ Gas Leak</option>
                                </optgroup>
                                <optgroup label="🌊 Natural Disaster">
                                    <option value="flood">🌊 Flood</option>
                                    <option value="earthquake">🌍 Earthquake</option>
                                    <option value="landslide">⛰️ Landslide</option>
                                    <option value="cyclone">🌀 Cyclone / Storm</option>
                                    <option value="lightning">⚡ Lightning Strike</option>
                                </optgroup>
                                <optgroup label="🚗 Road &amp; Traffic">
                                    <option value="road_accident">🚗 Road Accident</option>
                                    <option value="blockage">🚧 Road Blockage</option>
                                    <option value="bridge_collapse">🌉 Bridge Failure</option>
                                    <option value="vehicle_breakdown">🔧 Vehicle Breakdown</option>
                                </optgroup>
                                <optgroup label="🏗️ Structural">
                                    <option value="structural">🏚️ Building Collapse</option>
                                    <option value="infrastructure">🏗️ Infrastructure Failure</option>
                                    <option value="dam_breach">💧 Dam / Reservoir Breach</option>
                                </optgroup>
                                <optgroup label="🏥 Medical &amp; Safety">
                                    <option value="medical">🏥 Medical Emergency</option>
                                    <option value="mass_casualty">🚑 Mass Casualty Event</option>
                                    <option value="drowning">🏊 Drowning</option>
                                    <option value="missing_person">🔍 Missing Person</option>
                                    <option value="stampede">👥 Stampede / Crowd Crush</option>
                                </optgroup>
                                <optgroup label="☣️ Hazmat &amp; Utility">
                                    <option value="hazmat">☣️ Chemical / Hazmat Spill</option>
                                    <option value="power_outage">🔌 Power Outage</option>
                                    <option value="water_supply">🚰 Water Supply Failure</option>
                                    <option value="sewage">🚨 Sewage / Drain Overflow</option>
                                </optgroup>
                                <optgroup label="🔒 Law &amp; Order">
                                    <option value="civil_unrest">⚠️ Civil Unrest / Riot</option>
                                    <option value="bomb_threat">💣 Bomb Threat</option>
                                    <option value="animal_attack">🐆 Animal Attack</option>
                                </optgroup>
                                <optgroup label="📋 Other">
                                    <option value="general">📋 General / Other</option>
                                </optgroup>
                            </select>
                        </div>
                        <p className="text-xs text-slate-500">📍 Location auto-captured from your current position</p>
                        <div className="flex gap-4">
                            <button type="button" onClick={() => setShowReportModal(false)} className="flex-1 py-4 text-base font-bold bg-slate-800 text-slate-400 rounded-xl hover:bg-slate-700 active:scale-95">Cancel</button>
                            <button type="submit" className="flex-1 py-4 text-base font-bold bg-red-600 text-white rounded-xl hover:bg-red-500 active:scale-95 shadow-lg shadow-red-600/20">Submit Report</button>
                        </div>
                    </form>
                </div>
            </div>
        )}

        {/* ── Road Blockage Modal ── */}
        {showBlockageModal && (
            <div className="fixed inset-0 z-[9999] flex items-end sm:items-center justify-center bg-black/70 backdrop-blur-sm p-4">
                <div className="bg-slate-900 border border-slate-700 rounded-t-3xl sm:rounded-3xl p-8 w-full max-w-lg shadow-2xl">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-2xl font-black text-white">Report Road Blockage</h3>
                        <button onClick={() => setShowBlockageModal(false)} className="p-2 text-slate-400 hover:text-white bg-slate-800 rounded-xl hover:bg-red-600 transition-all">
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                        </button>
                    </div>
                    <form onSubmit={async (e) => {
                        e.preventDefault();
                        try {
                            await api.reportCongestion({
                                road_segment: e.target.road.value,
                                status: 'blocked',
                                latitude: position.lat,
                                longitude: position.lng,
                                vehicle_density: 0,
                                average_speed: 0,
                            });
                        } catch (err) {
                            console.error('[Rescue] Blockage report failed:', err);
                        }
                        setShowBlockageModal(false);
                    }} className="space-y-5">
                        <input
                            name="road"
                            type="text"
                            className="w-full px-5 py-4 bg-slate-800 border border-slate-600 rounded-xl text-white text-base focus:outline-none focus:border-amber-500/70 transition-colors"
                            placeholder="Road segment name (e.g. Bhayander East Link Rd)"
                            required
                        />
                        <p className="text-xs text-slate-500">📍 Blockage coordinates auto-captured from your current position</p>
                        <div className="flex gap-4">
                            <button type="button" onClick={() => setShowBlockageModal(false)} className="flex-1 py-4 text-base font-bold bg-slate-800 text-slate-400 rounded-xl hover:bg-slate-700 active:scale-95">Cancel</button>
                            <button type="submit" className="flex-1 py-4 text-base font-bold bg-amber-600 text-white rounded-xl hover:bg-amber-500 active:scale-95 shadow-lg shadow-amber-600/20">Report Blockage</button>
                        </div>
                    </form>
                </div>
            </div>
        )}
        </>
    );
}
