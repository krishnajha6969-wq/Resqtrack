'use client';

import { useState, useEffect, useCallback } from 'react';
import dynamic from 'next/dynamic';
import Navbar from '@/components/Navbar';
import { IncidentCard, StatusBadge } from '@/components/Cards';

const MapView = dynamic(() => import('@/components/MapView'), { ssr: false });
const LocationPicker = dynamic(() => import('@/components/LocationPicker'), { ssr: false });

const INITIAL_INCIDENTS = [
    { id: '1', title: 'Building Collapse - Near Maxus Mall', latitude: 19.2952, longitude: 72.8544, severity: 'critical', description: 'Old building near Maxus Mall collapsed during heavy rain. Multiple casualties reported. First responders on scene. Need additional rescue teams with heavy equipment.', incident_type: 'structural', status: 'in_progress', assigned_team_name: 'Bravo Medical', reporter_name: 'Mira Road Fire Station', created_at: new Date(Date.now() - 3600000).toISOString(), updated_at: new Date(Date.now() - 1800000).toISOString() },
    { id: '2', title: 'Flood Water Rising - Uttan Beach', latitude: 19.2820, longitude: 72.7920, severity: 'high', description: 'High tide causing water logging in low-lying coastal areas of Uttan. Over 200 residents need immediate evacuation. Boats requested.', incident_type: 'flood', status: 'reported', assigned_team_name: null, reporter_name: 'Bhayander West Ward', created_at: new Date(Date.now() - 1800000).toISOString(), updated_at: new Date(Date.now() - 1800000).toISOString() },
    { id: '3', title: 'Road Blocked - WEH Mira Road', latitude: 19.2815, longitude: 72.8680, severity: 'medium', description: 'Tree fell blocking the Western Express Highway near Mira Road station. Both lanes blocked. Alternate routes via Kashimira are congested.', incident_type: 'blockage', status: 'reported', assigned_team_name: null, reporter_name: 'Traffic Police - Mira Road', created_at: new Date(Date.now() - 900000).toISOString(), updated_at: new Date(Date.now() - 900000).toISOString() },
    { id: '4', title: 'Medical Emergency - GCC Club', latitude: 19.2680, longitude: 72.8590, severity: 'high', description: 'Multiple heatstrokes reported at relief camp near GCC Club, Mira Road. Medical supplies running low. Need ambulance support.', incident_type: 'medical', status: 'in_progress', assigned_team_name: 'Mira Road Ambulance', reporter_name: 'Camp Manager', created_at: new Date(Date.now() - 600000).toISOString(), updated_at: new Date(Date.now() - 300000).toISOString() },
    { id: '5', title: 'Gas Leak - Kashimira Industrial Area', latitude: 19.3025, longitude: 72.8420, severity: 'critical', description: 'Chemical plant in Kashimira reporting hazardous gas leak. 500m evacuation zone established. HAZMAT team requested urgently.', incident_type: 'hazmat', status: 'reported', assigned_team_name: null, reporter_name: 'Plant Security - Kashimira', created_at: new Date(Date.now() - 300000).toISOString(), updated_at: new Date(Date.now() - 300000).toISOString() },
    { id: '6', title: 'Trapped Survivors - Bhayander Station', latitude: 19.3042, longitude: 72.8510, severity: 'critical', description: 'Portion of Bhayander railway station foot overbridge collapsed. Signals from trapped survivors detected. Need specialized rescue equipment.', incident_type: 'structural', status: 'reported', assigned_team_name: null, reporter_name: 'Railway Police Bhayander', created_at: new Date(Date.now() - 120000).toISOString(), updated_at: new Date(Date.now() - 120000).toISOString() },
];

export default function IncidentsPage() {
    const [incidents, setIncidents] = useState(INITIAL_INCIDENTS);
    const [filter, setFilter] = useState({ status: '', severity: '' });
    const [showCreate, setShowCreate] = useState(false);
    const [selectedIncident, setSelectedIncident] = useState(null);
    const [locationStatus, setLocationStatus] = useState('idle'); // idle | detecting | found | error
    const [newIncident, setNewIncident] = useState({
        title: '', description: '', severity: 'medium', incident_type: 'general',
        latitude: '', longitude: '',
    });

    // Auto-capture location the moment the form is opened
    useEffect(() => {
        if (!showCreate) return;
        if (!navigator.geolocation) {
            setLocationStatus('error');
            return;
        }
        setLocationStatus('detecting');
        navigator.geolocation.getCurrentPosition(
            (pos) => {
                setNewIncident(prev => ({
                    ...prev,
                    latitude: pos.coords.latitude.toFixed(6),
                    longitude: pos.coords.longitude.toFixed(6),
                }));
                setLocationStatus('found');
            },
            () => {
                // Fallback to area default if GPS denied
                setNewIncident(prev => ({
                    ...prev,
                    latitude: (19.290 + Math.random() * 0.02).toFixed(6),
                    longitude: (72.850 + Math.random() * 0.02).toFixed(6),
                }));
                setLocationStatus('fallback');
            },
            { timeout: 8000, enableHighAccuracy: true }
        );
    }, [showCreate]);

    const filteredIncidents = incidents.filter(i => {
        if (filter.status && i.status !== filter.status) return false;
        if (filter.severity && i.severity !== filter.severity) return false;
        return true;
    });

    const handleCreate = (e) => {
        e.preventDefault();
        const incident = {
            ...newIncident,
            id: Date.now().toString(),
            status: 'reported',
            assigned_team_name: null,
            reporter_name: 'You',
            latitude: parseFloat(newIncident.latitude),
            longitude: parseFloat(newIncident.longitude),
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
        };
        setIncidents([incident, ...incidents]);
        setShowCreate(false);
        setLocationStatus('idle');
        setNewIncident({ title: '', description: '', severity: 'medium', incident_type: 'general', latitude: '', longitude: '' });
    };

    const handleRetryLocation = () => {
        if (!navigator.geolocation) return;
        setLocationStatus('detecting');
        navigator.geolocation.getCurrentPosition(
            (pos) => {
                setNewIncident(prev => ({
                    ...prev,
                    latitude: pos.coords.latitude.toFixed(6),
                    longitude: pos.coords.longitude.toFixed(6),
                }));
                setLocationStatus('found');
            },
            () => setLocationStatus('error'),
            { timeout: 8000, enableHighAccuracy: true }
        );
    };

    const handleStatusChange = (id, newStatus) => {
        setIncidents(prev => prev.map(i =>
            i.id === id ? { ...i, status: newStatus, updated_at: new Date().toISOString() } : i
        ));
        if (selectedIncident?.id === id) {
            setSelectedIncident(prev => ({ ...prev, status: newStatus }));
        }
    };

    const severityCounts = {
        critical: incidents.filter(i => i.severity === 'critical').length,
        high: incidents.filter(i => i.severity === 'high').length,
        medium: incidents.filter(i => i.severity === 'medium').length,
        low: incidents.filter(i => i.severity === 'low').length,
    };

    return (
        <div className="min-h-screen bg-slate-950">
            <Navbar />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
                    <div>
                        <h1 className="text-3xl font-black text-white tracking-tight">Incident Management</h1>
                        <p className="text-base text-slate-400 mt-2">{incidents.length} total incidents • {incidents.filter(i => i.status === 'reported').length} awaiting response</p>
                    </div>
                    <button
                        onClick={() => setShowCreate(true)}
                        className="px-6 py-3 bg-red-600 hover:bg-red-500 text-white text-sm font-bold uppercase tracking-wider rounded-xl shadow-lg shadow-red-600/15 transition-all flex items-center gap-2 active:scale-95"
                    >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                        </svg>
                        Report Incident
                    </button>
                </div>

                {/* Summary Cards */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
                    {Object.entries(severityCounts).map(([sev, count]) => {
                        const colors = {
                            critical: 'from-red-600/20 to-red-900/10 border-red-500/20',
                            high: 'from-orange-600/20 to-orange-900/10 border-orange-500/20',
                            medium: 'from-yellow-600/20 to-yellow-900/10 border-yellow-500/20',
                            low: 'from-green-600/20 to-green-900/10 border-green-500/20',
                        };
                        return (
                            <div key={sev} className={`bg-gradient-to-br ${colors[sev]} p-5 rounded-2xl border`}>
                                <p className="text-3xl font-black text-white">{count}</p>
                                <p className="text-sm text-slate-400 capitalize mt-1 font-medium">{sev} Severity</p>
                            </div>
                        );
                    })}
                </div>

                {/* Filters */}
                <div className="flex flex-wrap gap-3 mb-8">
                    <select
                        value={filter.status}
                        onChange={(e) => setFilter({ ...filter, status: e.target.value })}
                        className="px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-base text-white font-medium"
                    >
                        <option value="">All Statuses</option>
                        <option value="reported">Reported</option>
                        <option value="in_progress">In Progress</option>
                        <option value="resolved">Resolved</option>
                    </select>
                    <select
                        value={filter.severity}
                        onChange={(e) => setFilter({ ...filter, severity: e.target.value })}
                        className="px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-base text-white font-medium"
                    >
                        <option value="">All Severities</option>
                        <option value="critical">Critical</option>
                        <option value="high">High</option>
                        <option value="medium">Medium</option>
                        <option value="low">Low</option>
                    </select>
                </div>

                {/* Incident Table / List */}
                <div className="grid lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 space-y-4">
                        {filteredIncidents.map(incident => (
                            <div
                                key={incident.id}
                                onClick={() => setSelectedIncident(incident)}
                                className={`cursor-pointer transition-all ${selectedIncident?.id === incident.id ? 'ring-2 ring-red-500/50 rounded-2xl' : ''}`}
                            >
                                <IncidentCard incident={incident} />
                            </div>
                        ))}
                        {filteredIncidents.length === 0 && (
                            <div className="text-center py-16 text-slate-500 text-lg">No incidents match the selected filters.</div>
                        )}
                    </div>

                    {/* Detail Panel */}
                    <div className="bg-slate-900/80 rounded-2xl border border-slate-700/50 p-6 h-fit sticky top-24">
                        {selectedIncident ? (
                            <>
                                <div className="flex items-start justify-between gap-3 mb-5">
                                    <h2 className="text-xl font-black text-white">{selectedIncident.title}</h2>
                                    <StatusBadge status={selectedIncident.severity} size="md" />
                                </div>
                                <p className="text-base text-slate-400 mb-5 leading-relaxed">{selectedIncident.description}</p>

                                <div className="space-y-4 text-base">
                                    <div className="flex justify-between">
                                        <span className="text-slate-500 font-medium">Status</span>
                                        <StatusBadge status={selectedIncident.status} size="sm" />
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-slate-500 font-medium">Type</span>
                                        <span className="text-slate-300 capitalize font-medium">{selectedIncident.incident_type}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-slate-500 font-medium">Assigned</span>
                                        <span className="text-slate-300 font-medium">{selectedIncident.assigned_team_name || 'Unassigned'}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-slate-500 font-medium">Reported by</span>
                                        <span className="text-slate-300 font-medium">{selectedIncident.reporter_name}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-slate-500 font-medium">Location</span>
                                        <span className="text-slate-300 font-mono text-sm">{selectedIncident.latitude?.toFixed(4)}, {selectedIncident.longitude?.toFixed(4)}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-slate-500 font-medium">Reported</span>
                                        <span className="text-slate-300 font-medium">{new Date(selectedIncident.created_at).toLocaleString()}</span>
                                    </div>
                                </div>

                                <div className="mt-6 pt-5 border-t border-slate-700/50 space-y-3">
                                    <p className="text-sm text-slate-500 font-bold uppercase tracking-wider mb-3">Update Status</p>
                                    <div className="grid grid-cols-2 gap-3">
                                        {['reported', 'in_progress', 'resolved', 'closed'].map(st => (
                                            <button
                                                key={st}
                                                onClick={() => handleStatusChange(selectedIncident.id, st)}
                                                disabled={selectedIncident.status === st}
                                                className={`px-4 py-3 text-sm font-bold rounded-xl capitalize transition-all ${selectedIncident.status === st
                                                        ? 'bg-red-600/20 text-red-400 border border-red-500/30'
                                                        : 'bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white border border-slate-700 active:scale-95'
                                                    }`}
                                            >
                                                {st.replace('_', ' ')}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </>
                        ) : (
                            <div className="text-center py-16">
                                <svg className="w-12 h-12 mx-auto text-slate-700 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.042 21.672L13.684 16.6m0 0l-2.51 2.225.569-9.47 5.227 7.917-3.286-.672zM12 2.25V4.5m5.834.166l-1.591 1.591M20.25 10.5H18M7.757 14.743l-1.59 1.59M6 10.5H3.75m4.007-4.243l-1.59-1.59" />
                                </svg>
                                <p className="text-slate-500 text-lg font-medium">Select an incident to view details</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Create Incident Modal */}
            {showCreate && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
                    <div className="bg-slate-900 border border-slate-700 rounded-2xl p-8 w-full max-w-lg shadow-2xl">
                        <h3 className="text-2xl font-black text-white mb-6">Report Incident (Enhanced)</h3>
                        <form onSubmit={handleCreate} className="space-y-5">
                            <div>
                                <label className="block text-sm font-bold text-slate-400 uppercase tracking-wider mb-2">Title</label>
                                <input
                                    type="text"
                                    value={newIncident.title}
                                    onChange={(e) => setNewIncident({ ...newIncident, title: e.target.value })}
                                    className="w-full px-5 py-3.5 bg-slate-800 border border-slate-600 rounded-xl text-white text-base focus:outline-none focus:border-red-500/50"
                                    placeholder="Brief incident title"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-slate-400 uppercase tracking-wider mb-2">Description</label>
                                <textarea
                                    value={newIncident.description}
                                    onChange={(e) => setNewIncident({ ...newIncident, description: e.target.value })}
                                    className="w-full px-5 py-3.5 bg-slate-800 border border-slate-600 rounded-xl text-white text-base focus:outline-none focus:border-red-500/50 h-28 resize-none"
                                    placeholder="Detailed description of the incident..."
                                    required
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-bold text-slate-400 uppercase tracking-wider mb-2">Severity</label>
                                    <select
                                        value={newIncident.severity}
                                        onChange={(e) => setNewIncident({ ...newIncident, severity: e.target.value })}
                                        className="w-full px-4 py-3.5 bg-slate-800 border border-slate-600 rounded-xl text-white text-base"
                                    >
                                        <option value="low">Low</option>
                                        <option value="medium">Medium</option>
                                        <option value="high">High</option>
                                        <option value="critical">Critical</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-slate-400 uppercase tracking-wider mb-2">Type</label>
                                    <select
                                        value={newIncident.incident_type}
                                        onChange={(e) => setNewIncident({ ...newIncident, incident_type: e.target.value })}
                                        className="w-full px-4 py-3.5 bg-slate-800 border border-slate-600 rounded-xl text-white text-base"
                                    >
                                        <optgroup label="🔥 Fire & Explosion">
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
                                        <optgroup label="🚗 Road & Traffic">
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
                                        <optgroup label="🏥 Medical & Safety">
                                            <option value="medical">🏥 Medical Emergency</option>
                                            <option value="mass_casualty">🚑 Mass Casualty Event</option>
                                            <option value="drowning">🏊 Drowning</option>
                                            <option value="missing_person">🔍 Missing Person</option>
                                            <option value="stampede">👥 Stampede / Crowd Crush</option>
                                        </optgroup>
                                        <optgroup label="☣️ Hazmat & Utility">
                                            <option value="hazmat">☣️ Chemical / Hazmat Spill</option>
                                            <option value="power_outage">🔌 Power Outage</option>
                                            <option value="water_supply">🚰 Water Supply Failure</option>
                                            <option value="sewage">🚨 Sewage / Drain Overflow</option>
                                        </optgroup>
                                        <optgroup label="🔒 Law & Order">
                                            <option value="civil_unrest">⚠️ Civil Unrest / Riot</option>
                                            <option value="bomb_threat">💣 Bomb Threat</option>
                                            <option value="animal_attack">🐆 Animal Attack</option>
                                        </optgroup>
                                        <optgroup label="📋 Other">
                                            <option value="general">📋 General / Other</option>
                                        </optgroup>
                                    </select>
                                </div>
                            </div>
                            {/* Location — auto-detected, no manual input */}
                            <div className="space-y-3">
                                <label className="text-sm font-bold text-slate-400 uppercase tracking-wider block">Incident Location</label>

                                {/* Status pill */}
                                {locationStatus === 'detecting' && (
                                    <div className="flex items-center gap-3 px-4 py-3 bg-blue-500/10 border border-blue-500/20 rounded-xl">
                                        <div className="w-4 h-4 border-2 border-blue-400 border-t-transparent rounded-full animate-spin flex-shrink-0" />
                                        <div>
                                            <p className="text-sm font-bold text-blue-300">Detecting your location...</p>
                                            <p className="text-xs text-slate-500">Please allow location access if prompted</p>
                                        </div>
                                    </div>
                                )}
                                {locationStatus === 'found' && (
                                    <div className="flex items-center justify-between px-4 py-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center flex-shrink-0">
                                                <svg className="w-4 h-4 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                                                </svg>
                                            </div>
                                            <div>
                                                <p className="text-sm font-bold text-emerald-300">📍 Location Captured</p>
                                                <p className="text-xs font-mono text-slate-400">{parseFloat(newIncident.latitude).toFixed(4)}°N, {parseFloat(newIncident.longitude).toFixed(4)}°E</p>
                                            </div>
                                        </div>
                                        <button type="button" onClick={handleRetryLocation} className="text-[11px] text-slate-500 hover:text-white transition-colors underline">Retry</button>
                                    </div>
                                )}
                                {locationStatus === 'fallback' && (
                                    <div className="flex items-center justify-between px-4 py-3 bg-amber-500/10 border border-amber-500/20 rounded-xl">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-amber-500/20 flex items-center justify-center flex-shrink-0">
                                                <svg className="w-4 h-4 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" /></svg>
                                            </div>
                                            <div>
                                                <p className="text-sm font-bold text-amber-300">Using estimated location</p>
                                                <p className="text-xs text-slate-500">GPS denied — you can fine-tune on the map below</p>
                                            </div>
                                        </div>
                                        <button type="button" onClick={handleRetryLocation} className="text-[11px] text-slate-500 hover:text-white transition-colors underline">Retry</button>
                                    </div>
                                )}
                                {locationStatus === 'error' && (
                                    <div className="flex items-center justify-between px-4 py-3 bg-red-500/10 border border-red-500/20 rounded-xl">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-red-500/20 flex items-center justify-center flex-shrink-0">
                                                <svg className="w-4 h-4 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                                            </div>
                                            <div>
                                                <p className="text-sm font-bold text-red-300">Location unavailable</p>
                                                <p className="text-xs text-slate-500">Please tap the map below to set location</p>
                                            </div>
                                        </div>
                                        <button type="button" onClick={handleRetryLocation} className="text-[11px] text-slate-500 hover:text-white transition-colors underline">Retry</button>
                                    </div>
                                )}

                                {/* Map fine-tuner — shown once we have any coords */}
                                {(locationStatus === 'found' || locationStatus === 'fallback' || locationStatus === 'error') && (
                                    <div className="relative rounded-xl overflow-hidden border border-slate-700 h-44 bg-slate-800 cursor-crosshair">
                                        <LocationPicker
                                            value={{ lat: newIncident.latitude || 19.2952, lng: newIncident.longitude || 72.8544 }}
                                            onChange={(lat, lng) => setNewIncident(prev => ({ ...prev, latitude: lat, longitude: lng }))}
                                        />
                                        <div className="absolute top-2 right-2 z-[1000] pointer-events-none">
                                            <div className="bg-slate-900/80 backdrop-blur-md px-2 py-1 rounded text-[10px] font-bold text-slate-400 border border-white/5">
                                                DRAG TO ADJUST
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                            <div className="flex gap-3 pt-3">
                                <button
                                    type="button"
                                    onClick={() => setShowCreate(false)}
                                    className="flex-1 py-3.5 text-base font-bold text-slate-400 bg-slate-800 rounded-xl hover:bg-slate-700 transition-colors active:scale-95"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 py-3.5 text-base font-bold text-white bg-red-600 hover:bg-red-500 rounded-xl transition-colors active:scale-95 shadow-lg shadow-red-600/20"
                                >
                                    Report Incident
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
