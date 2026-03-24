'use client';
import { useState, useEffect } from 'react';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, LineElement, PointElement, ArcElement, Title, Tooltip, Legend, Filler } from 'chart.js';
import { Bar, Doughnut, Line } from 'react-chartjs-2';
import type { Team, Incident, Congestion } from '@/lib/database';

ChartJS.register(CategoryScale, LinearScale, BarElement, LineElement, PointElement, ArcElement, Title, Tooltip, Legend, Filler);

export default function AnalyticsPage() {
  const [teams, setTeams] = useState<Team[]>([]);
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [congestion, setCongestion] = useState<Congestion[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      const [tRes, iRes, cRes] = await Promise.all([fetch('/api/teams'), fetch('/api/incidents'), fetch('/api/congestion')]);
      setTeams((await tRes.json()).teams || []);
      setIncidents((await iRes.json()).incidents || []);
      setCongestion((await cRes.json()).congestion || []);
    };
    fetchData();
  }, []);

  const resolvedCount = incidents.filter(i => i.status === 'resolved').length;
  const completionRate = incidents.length ? Math.round((resolvedCount / incidents.length) * 100) : 0;
  const avgSpeed = teams.length ? Math.round(teams.reduce((s, t) => s + t.speed, 0) / teams.length) : 0;

  // Incident severity distribution
  const severityData = {
    labels: ['Critical', 'High', 'Medium', 'Low'],
    datasets: [{
      data: [
        incidents.filter(i => i.severity === 'critical').length,
        incidents.filter(i => i.severity === 'high').length,
        incidents.filter(i => i.severity === 'medium').length,
        incidents.filter(i => i.severity === 'low').length,
      ],
      backgroundColor: ['#C62828', '#E65100', '#F9A825', '#2E7D32'],
      borderWidth: 0,
      cutout: '65%',
    }],
  };

  // Vehicle type distribution
  const vehicleData = {
    labels: ['Ambulance', 'Fire Truck', 'Police', 'Relief'],
    datasets: [{
      label: 'Vehicle Count',
      data: [
        teams.filter(t => t.type === 'ambulance').length,
        teams.filter(t => t.type === 'fire').length,
        teams.filter(t => t.type === 'police').length,
        teams.filter(t => t.type === 'relief').length,
      ],
      backgroundColor: ['rgba(211,47,47,0.8)', 'rgba(255,111,0,0.8)', 'rgba(13,71,161,0.8)', 'rgba(46,125,50,0.8)'],
      borderRadius: 8,
      borderSkipped: false,
    }],
  };

  // Simulated response time trend
  const responseTrendData = {
    labels: ['00:00', '04:00', '08:00', '12:00', '16:00', '20:00', '24:00'],
    datasets: [
      {
        label: 'Avg Response Time (min)',
        data: [18, 22, 15, 12, 8, 14, 10],
        borderColor: '#D32F2F',
        backgroundColor: 'rgba(211,47,47,0.1)',
        tension: 0.4,
        fill: true,
        pointBackgroundColor: '#D32F2F',
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
        pointRadius: 5,
      },
      {
        label: 'Target (min)',
        data: [15, 15, 15, 15, 15, 15, 15],
        borderColor: '#2E7D32',
        borderDash: [5, 5],
        pointRadius: 0,
        tension: 0,
        fill: false,
      },
    ],
  };

  // Congestion trend
  const congestionTrendData = {
    labels: congestion.map(c => c.road_segment.split(' ')[0]),
    datasets: [{
      label: 'Avg Speed (km/h)',
      data: congestion.map(c => c.average_speed),
      backgroundColor: congestion.map(c =>
        c.status === 'blocked' ? 'rgba(136,14,79,0.8)' :
        c.status === 'congested' ? 'rgba(244,67,54,0.8)' :
        c.status === 'moderate' ? 'rgba(255,152,0,0.8)' : 'rgba(76,175,80,0.8)'
      ),
      borderRadius: 8,
      borderSkipped: false,
    }],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: {
      x: { grid: { display: false }, ticks: { font: { size: 11 } } },
      y: { grid: { color: '#f1f5f9' }, ticks: { font: { size: 11 } } },
    },
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Analytics Dashboard</h2>
        <p className="text-sm text-gray-500 mt-1">Operational insights and performance metrics</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        {[
          { label: 'Total Teams', value: teams.length, icon: '🚗', color: 'from-blue-500 to-blue-600', sub: `${teams.filter(t => t.status === 'active' || t.status === 'en-route').length} active` },
          { label: 'Total Incidents', value: incidents.length, icon: '🚨', color: 'from-red-500 to-red-600', sub: `${incidents.filter(i => i.status !== 'resolved').length} open` },
          { label: 'Completion Rate', value: `${completionRate}%`, icon: '✅', color: 'from-green-500 to-green-600', sub: `${resolvedCount} resolved` },
          { label: 'Avg Speed', value: `${avgSpeed} km/h`, icon: '⚡', color: 'from-purple-500 to-purple-600', sub: 'fleet average' },
          { label: 'Congested Routes', value: congestion.filter(c => c.status !== 'clear').length, icon: '🚧', color: 'from-orange-500 to-orange-600', sub: `of ${congestion.length} routes` },
        ].map((kpi, i) => (
          <div key={i} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xl">{kpi.icon}</span>
              <span className={`text-[10px] font-semibold text-white px-2 py-0.5 rounded-full bg-gradient-to-r ${kpi.color}`}>Live</span>
            </div>
            <div className="text-2xl font-bold text-gray-900 mb-0.5">{kpi.value}</div>
            <div className="text-xs text-gray-500">{kpi.label}</div>
            <div className="text-[10px] text-gray-400 mt-1">{kpi.sub}</div>
          </div>
        ))}
      </div>

      {/* Charts Grid */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Response Time Trend */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h3 className="font-bold text-gray-900 text-sm mb-4">Response Time Trend</h3>
          <div style={{height: '280px'}}>
            <Line data={responseTrendData} options={{...chartOptions, plugins: { ...chartOptions.plugins, legend: { display: true, position: 'top' as const, labels: { usePointStyle: true, pointStyle: 'circle', font: { size: 11 } } } }}} />
          </div>
        </div>

        {/* Incident Severity */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h3 className="font-bold text-gray-900 text-sm mb-4">Incidents by Severity</h3>
          <div className="flex items-center gap-8" style={{height: '280px'}}>
            <div className="flex-1 h-full">
              <Doughnut data={severityData} options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } } }} />
            </div>
            <div className="space-y-3">
              {['Critical', 'High', 'Medium', 'Low'].map((label, i) => (
                <div key={i} className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{backgroundColor: ['#C62828', '#E65100', '#F9A825', '#2E7D32'][i]}}></div>
                  <span className="text-xs text-gray-600">{label} ({severityData.datasets[0].data[i]})</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Vehicle Distribution */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h3 className="font-bold text-gray-900 text-sm mb-4">Vehicle Distribution</h3>
          <div style={{height: '280px'}}>
            <Bar data={vehicleData} options={chartOptions} />
          </div>
        </div>

        {/* Route Congestion */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h3 className="font-bold text-gray-900 text-sm mb-4">Route Speed Analysis</h3>
          <div style={{height: '280px'}}>
            <Bar data={congestionTrendData} options={{...chartOptions, indexAxis: 'y' as const}} />
          </div>
        </div>
      </div>

      {/* Status Summary */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <h3 className="font-bold text-gray-900 text-sm mb-4">Incident Status Pipeline</h3>
        <div className="grid grid-cols-4 gap-4">
          {[
            { status: 'Reported', count: incidents.filter(i => i.status === 'reported').length, color: 'bg-gray-200', textColor: 'text-gray-700' },
            { status: 'Assigned', count: incidents.filter(i => i.status === 'assigned').length, color: 'bg-blue-200', textColor: 'text-blue-700' },
            { status: 'In Progress', count: incidents.filter(i => i.status === 'in-progress').length, color: 'bg-purple-200', textColor: 'text-purple-700' },
            { status: 'Resolved', count: incidents.filter(i => i.status === 'resolved').length, color: 'bg-green-200', textColor: 'text-green-700' },
          ].map((s, i) => (
            <div key={i} className="text-center">
              <div className={`${s.color} rounded-2xl py-6 mb-2`}>
                <span className={`text-3xl font-bold ${s.textColor}`}>{s.count}</span>
              </div>
              <p className="text-xs font-semibold text-gray-600">{s.status}</p>
            </div>
          ))}
        </div>
        {/* Pipeline bar */}
        <div className="flex rounded-full overflow-hidden h-3 mt-4">
          <div className="bg-gray-400 transition-all" style={{width: `${incidents.length ? (incidents.filter(i => i.status === 'reported').length / incidents.length) * 100 : 25}%`}}></div>
          <div className="bg-blue-500 transition-all" style={{width: `${incidents.length ? (incidents.filter(i => i.status === 'assigned').length / incidents.length) * 100 : 25}%`}}></div>
          <div className="bg-purple-500 transition-all" style={{width: `${incidents.length ? (incidents.filter(i => i.status === 'in-progress').length / incidents.length) * 100 : 25}%`}}></div>
          <div className="bg-green-500 transition-all" style={{width: `${incidents.length ? (incidents.filter(i => i.status === 'resolved').length / incidents.length) * 100 : 25}%`}}></div>
        </div>
      </div>
    </div>
  );
}
