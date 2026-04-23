'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import Navbar from '@/components/Navbar';
import api from '@/lib/api';

const BarChart = dynamic(() => import('@/components/StatsChart').then(m => m.BarChart), { ssr: false });
const DoughnutChart = dynamic(() => import('@/components/StatsChart').then(m => m.DoughnutChart), { ssr: false });
const LineChart = dynamic(() => import('@/components/StatsChart').then(m => m.LineChart), { ssr: false });

export default function AnalyticsPage() {
    const [timeRange, setTimeRange] = useState('7d');
    const [incidents, setIncidents] = useState([]);
    const [teams, setTeams] = useState([]);
    const [congestion, setCongestion] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchData() {
            setLoading(true);
            try {
                const [incs, tms, congs] = await Promise.all([
                    api.getIncidents(),
                    api.getTeams(),
                    api.getCongestion()
                ]);
                setIncidents(incs || []);
                setTeams(tms || []);
                setCongestion(congs || []);
            } catch (err) {
                console.error("Failed to load analytics:", err);
            } finally {
                setLoading(false);
            }
        }
        fetchData();
    }, []);

    // Compute Live Metrics
    const totalIncidents = incidents.length;
    const activeTeams = teams.filter(t => ['patrolling', 'responding'].includes(t.status)).length;
    const zonesCovered = congestion.length;

    const metricsCards = [
        { label: 'Total Incidents', value: totalIncidents.toString(), change: 'Live', color: 'text-red-400', bg: 'from-red-600/20 to-red-900/10', border: 'border-red-500/20', icon: '🔴' },
        { label: 'Avg Response Time', value: '8.4 min', change: '-22%', color: 'text-emerald-400', bg: 'from-emerald-600/20 to-emerald-900/10', border: 'border-emerald-500/20', icon: '⚡' },
        { label: 'Active Teams', value: activeTeams.toString(), change: 'Live', color: 'text-blue-400', bg: 'from-blue-600/20 to-blue-900/10', border: 'border-blue-500/20', icon: '🚑' },
        { label: 'Zones Covered', value: zonesCovered.toString(), change: 'Live', color: 'text-amber-400', bg: 'from-amber-600/20 to-amber-900/10', border: 'border-amber-500/20', icon: '📍' },
    ];

    // Compute Vehicle Distribution from Teams
    const vehicleCounts = { Available: 0, Responding: 0, Offline: 0 };
    teams.forEach(t => {
        if (t.status === 'patrolling') vehicleCounts.Available++;
        else if (t.status === 'responding') vehicleCounts.Responding++;
        else vehicleCounts.Offline++;
    });

    const vehicleDistribution = {
        labels: ['Available', 'Responding', 'Offline'],
        datasets: [{
            data: [vehicleCounts.Available, vehicleCounts.Responding, vehicleCounts.Offline],
            backgroundColor: ['rgba(16, 185, 129, 0.8)', 'rgba(245, 158, 11, 0.8)', 'rgba(100, 116, 139, 0.8)'],
            borderColor: ['#10b981', '#f59e0b', '#64748b'],
            borderWidth: 2,
        }],
    };

    // Compute Team Performance (Based on team assignments)
    const teamNames = teams.map(t => t.team_name);
    const teamMissions = teams.map(t => t.assigned_incident_id ? 1 : 0);

    const teamPerformanceData = {
        labels: teamNames.length > 0 ? teamNames : ['No Teams'],
        datasets: [
            {
                label: 'Current Active Missions',
                data: teamNames.length > 0 ? teamMissions : [0],
                backgroundColor: 'rgba(59, 130, 246, 0.7)',
                borderColor: '#3b82f6',
                borderWidth: 2,
                borderRadius: 8,
            },
        ],
    };

    // Static Historical Data (Time-series data usually comes from a data warehouse)
    const responseTimeData = {
        labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
        datasets: [
            {
                label: 'Avg Response Time (min)',
                data: [12, 8, 15, 7, 10, 6, 9],
                backgroundColor: 'rgba(239, 68, 68, 0.6)',
                borderColor: '#ef4444',
                borderWidth: 2,
                borderRadius: 8,
            },
        ],
    };

    const congestionData = {
        labels: ['00:00', '04:00', '08:00', '12:00', '16:00', '20:00'],
        datasets: [
            { label: 'Congested Routes', data: [2, 1, 5, 8, 6, 3], borderColor: '#ef4444', backgroundColor: 'rgba(239, 68, 68, 0.1)', fill: true, tension: 0.4 },
        ],
    };

    const incidentTrend = {
        labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
        datasets: [
            { label: 'Critical', data: [5, 8, 3, 6], borderColor: '#ef4444', backgroundColor: 'rgba(239, 68, 68, 0.1)', fill: true, tension: 0.4 },
            { label: 'High', data: [8, 12, 7, 9], borderColor: '#f97316', backgroundColor: 'rgba(249, 115, 22, 0.1)', fill: true, tension: 0.4 },
        ],
    };

    return (
        <div className="min-h-screen bg-slate-950">
            <Navbar />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                {/* Header */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
                    <div>
                        <h1 className="text-3xl font-black text-white tracking-tight">Operations Analytics</h1>
                        <p className="text-base text-slate-400 mt-2">Live performance metrics and operational insights</p>
                    </div>
                </div>

                {loading ? (
                    <div className="flex items-center justify-center h-64">
                        <div className="w-10 h-10 border-4 border-slate-800 border-t-red-500 rounded-full animate-spin" />
                    </div>
                ) : (
                    <>
                        {/* Metric Cards */}
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
                            {metricsCards.map((m, i) => (
                                <div key={i} className={`bg-gradient-to-br ${m.bg} p-6 rounded-2xl border ${m.border}`}>
                                    <div className="flex items-center justify-between mb-3">
                                        <span className="text-3xl">{m.icon}</span>
                                        <span className={`text-sm font-bold ${m.color}`}>{m.change}</span>
                                    </div>
                                    <p className="text-3xl font-black text-white">{m.value}</p>
                                    <p className="text-sm text-slate-400 mt-1 font-medium">{m.label}</p>
                                </div>
                            ))}
                        </div>

                        {/* Charts Grid */}
                        <div className="grid lg:grid-cols-2 gap-6 mb-6">
                            {/* Response Time */}
                            <div className="bg-slate-900/80 rounded-2xl border border-slate-700/50 p-5">
                                <div className="flex items-center justify-between mb-4">
                                    <div>
                                        <h3 className="text-lg font-bold text-white">Historical Response Time</h3>
                                        <p className="text-sm text-slate-500">Average time to reach incident site (Past 7 Days)</p>
                                    </div>
                                </div>
                                <div className="h-[280px]">
                                    <BarChart data={responseTimeData} height={280} />
                                </div>
                            </div>

                            {/* Congestion Frequency */}
                            <div className="bg-slate-900/80 rounded-2xl border border-slate-700/50 p-5">
                                <div className="flex items-center justify-between mb-4">
                                    <div>
                                        <h3 className="text-lg font-bold text-white">Congestion Frequency</h3>
                                        <p className="text-sm text-slate-500">Route congestion patterns over time</p>
                                    </div>
                                </div>
                                <div className="h-[280px]">
                                    <LineChart data={congestionData} height={280} />
                                </div>
                            </div>

                            {/* Team Performance */}
                            <div className="bg-slate-900/80 rounded-2xl border border-slate-700/50 p-5">
                                <div className="flex items-center justify-between mb-4">
                                    <div>
                                        <h3 className="text-lg font-bold text-white">Live Team Status</h3>
                                        <p className="text-sm text-slate-500">Active missions assigned by team</p>
                                    </div>
                                </div>
                                <div className="h-[280px]">
                                    <BarChart data={teamPerformanceData} height={280} />
                                </div>
                            </div>

                            {/* Vehicle Distribution */}
                            <div className="bg-slate-900/80 rounded-2xl border border-slate-700/50 p-5">
                                <div className="flex items-center justify-between mb-4">
                                    <div>
                                        <h3 className="text-lg font-bold text-white">Live Vehicle Distribution</h3>
                                        <p className="text-sm text-slate-500">Current fleet status breakdown</p>
                                    </div>
                                </div>
                                <div className="h-[280px] flex items-center justify-center">
                                    <DoughnutChart data={vehicleDistribution} height={260} />
                                </div>
                            </div>
                        </div>

                        {/* Incident Trend (Full Width) */}
                        <div className="bg-slate-900/80 rounded-2xl border border-slate-700/50 p-5">
                            <div className="flex items-center justify-between mb-4">
                                <div>
                                    <h3 className="text-lg font-bold text-white">Historical Incident Severity Trends</h3>
                                    <p className="text-sm text-slate-500">Weekly incident breakdown by severity</p>
                                </div>
                            </div>
                            <div className="h-[300px]">
                                <LineChart data={incidentTrend} height={300} />
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
