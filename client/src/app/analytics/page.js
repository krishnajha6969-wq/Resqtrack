'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
import Navbar from '@/components/Navbar';

const BarChart = dynamic(() => import('@/components/StatsChart').then(m => m.BarChart), { ssr: false });
const DoughnutChart = dynamic(() => import('@/components/StatsChart').then(m => m.DoughnutChart), { ssr: false });
const LineChart = dynamic(() => import('@/components/StatsChart').then(m => m.LineChart), { ssr: false });

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
        {
            label: 'Target (min)',
            data: [10, 10, 10, 10, 10, 10, 10],
            backgroundColor: 'rgba(34, 197, 94, 0.2)',
            borderColor: '#22c55e',
            borderWidth: 2,
            borderDash: [5, 5],
            borderRadius: 8,
        },
    ],
};

const congestionData = {
    labels: ['00:00', '04:00', '08:00', '12:00', '16:00', '20:00'],
    datasets: [
        {
            label: 'Congested Routes',
            data: [2, 1, 5, 8, 6, 3],
            borderColor: '#ef4444',
            backgroundColor: 'rgba(239, 68, 68, 0.1)',
            fill: true,
            tension: 0.4,
        },
        {
            label: 'Moderate Routes',
            data: [3, 2, 4, 5, 7, 4],
            borderColor: '#f59e0b',
            backgroundColor: 'rgba(245, 158, 11, 0.1)',
            fill: true,
            tension: 0.4,
        },
    ],
};

const teamPerformanceData = {
    labels: ['Alpha', 'Bravo', 'Charlie', 'Delta', 'Echo', 'Foxtrot'],
    datasets: [
        {
            label: 'Missions Completed',
            data: [12, 9, 15, 7, 11, 8],
            backgroundColor: [
                'rgba(239, 68, 68, 0.7)',
                'rgba(245, 158, 11, 0.7)',
                'rgba(34, 197, 94, 0.7)',
                'rgba(59, 130, 246, 0.7)',
                'rgba(168, 85, 247, 0.7)',
                'rgba(236, 72, 153, 0.7)',
            ],
            borderColor: [
                '#ef4444', '#f59e0b', '#22c55e', '#3b82f6', '#a855f7', '#ec4899',
            ],
            borderWidth: 2,
            borderRadius: 8,
        },
    ],
};

const vehicleDistribution = {
    labels: ['Available', 'Responding', 'Busy', 'Offline'],
    datasets: [{
        data: [12, 8, 5, 2],
        backgroundColor: [
            'rgba(16, 185, 129, 0.8)',
            'rgba(245, 158, 11, 0.8)',
            'rgba(239, 68, 68, 0.8)',
            'rgba(100, 116, 139, 0.8)',
        ],
        borderColor: ['#10b981', '#f59e0b', '#ef4444', '#64748b'],
        borderWidth: 2,
    }],
};

const incidentTrend = {
    labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
    datasets: [
        {
            label: 'Critical',
            data: [5, 8, 3, 6],
            borderColor: '#ef4444',
            backgroundColor: 'rgba(239, 68, 68, 0.1)',
            fill: true,
            tension: 0.4,
        },
        {
            label: 'High',
            data: [8, 12, 7, 9],
            borderColor: '#f97316',
            backgroundColor: 'rgba(249, 115, 22, 0.1)',
            fill: true,
            tension: 0.4,
        },
        {
            label: 'Medium',
            data: [12, 9, 14, 11],
            borderColor: '#eab308',
            backgroundColor: 'rgba(234, 179, 8, 0.1)',
            fill: true,
            tension: 0.4,
        },
    ],
};

const metricsCards = [
    { label: 'Total Incidents', value: '47', change: '+12%', color: 'text-red-400', bg: 'from-red-600/20 to-red-900/10', border: 'border-red-500/20', icon: '🔴' },
    { label: 'Avg Response Time', value: '8.4 min', change: '-22%', color: 'text-emerald-400', bg: 'from-emerald-600/20 to-emerald-900/10', border: 'border-emerald-500/20', icon: '⚡' },
    { label: 'Active Teams', value: '27', change: '+5', color: 'text-blue-400', bg: 'from-blue-600/20 to-blue-900/10', border: 'border-blue-500/20', icon: '🚑' },
    { label: 'Zones Covered', value: '14', change: '+3', color: 'text-amber-400', bg: 'from-amber-600/20 to-amber-900/10', border: 'border-amber-500/20', icon: '📍' },
];

export default function AnalyticsPage() {
    const [timeRange, setTimeRange] = useState('7d');

    return (
        <div className="min-h-screen bg-slate-950">
            <Navbar />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                {/* Header */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
                    <div>
                        <h1 className="text-3xl font-black text-white tracking-tight">Operations Analytics</h1>
                        <p className="text-base text-slate-400 mt-2">Performance metrics and operational insights</p>
                    </div>
                    <div className="flex items-center gap-2 bg-slate-800 rounded-xl p-1.5 border border-slate-700">
                        {['24h', '7d', '30d', '90d'].map(range => (
                            <button
                                key={range}
                                onClick={() => setTimeRange(range)}
                                className={`px-5 py-2 text-sm font-bold rounded-lg transition-colors ${timeRange === range ? 'bg-red-600 text-white' : 'text-slate-400 hover:text-white'
                                    }`}
                            >
                                {range}
                            </button>
                        ))}
                    </div>
                </div>

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
                                <h3 className="text-lg font-bold text-white">Response Time</h3>
                                <p className="text-sm text-slate-500">Average time to reach incident site</p>
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
                                <h3 className="text-lg font-bold text-white">Team Performance</h3>
                                <p className="text-sm text-slate-500">Missions completed by team</p>
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
                                <h3 className="text-lg font-bold text-white">Vehicle Distribution</h3>
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
                            <h3 className="text-lg font-bold text-white">Incident Severity Trends</h3>
                            <p className="text-sm text-slate-500">Weekly incident breakdown by severity</p>
                        </div>
                    </div>
                    <div className="h-[300px]">
                        <LineChart data={incidentTrend} height={300} />
                    </div>
                </div>
            </div>
        </div>
    );
}
