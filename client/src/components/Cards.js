export function StatusBadge({ status, size = 'sm' }) {
    const colors = {
        // Team statuses
        available: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 shadow-[0_0_10px_rgba(16,185,129,0.1)]',
        responding: 'bg-amber-500/10 text-amber-400 border-amber-500/20 shadow-[0_0_10px_rgba(245,158,11,0.1)]',
        busy: 'bg-red-500/10 text-red-400 border-red-500/20 shadow-[0_0_10px_rgba(239,68,68,0.1)]',
        offline: 'bg-slate-500/10 text-slate-400 border-slate-500/20',

        // Incident statuses
        reported: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
        in_progress: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
        resolved: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
        closed: 'bg-slate-500/10 text-slate-400 border-slate-500/20',

        // Severity
        critical: 'bg-red-500/20 text-red-400 border-red-500/30 font-bold',
        high: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
        medium: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
        low: 'bg-green-500/20 text-green-400 border-green-500/30',

        // Congestion
        clear: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
        moderate: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
        congested: 'bg-red-500/10 text-red-400 border-red-500/20',
    };

    const sizes = {
        xs: 'px-2.5 py-1 text-xs',
        sm: 'px-3 py-1.5 text-sm',
        md: 'px-4 py-2 text-base',
    };

    return (
        <span className={`inline-flex items-center rounded-lg font-bold border capitalize backdrop-blur-sm transition-all duration-300 ${colors[status] || colors.offline} ${sizes[size]}`}>
            {status?.replace('_', ' ')}
        </span>
    );
}

export function IncidentCard({ incident, onAssign, onStatusChange, compact = false }) {
    const severityMap = {
        critical: { icon: '🚨', glow: 'shadow-[0_0_15px_rgba(239,68,68,0.3)]', border: 'hover:border-red-500/50' },
        high: { icon: '🔥', glow: 'shadow-[0_0_15px_rgba(249,115,22,0.3)]', border: 'hover:border-orange-500/50' },
        medium: { icon: '⚠️', glow: 'shadow-[0_0_15px_rgba(234,179,8,0.3)]', border: 'hover:border-yellow-500/50' },
        low: { icon: 'ℹ️', glow: 'shadow-[0_0_15px_rgba(34,197,94,0.3)]', border: 'hover:border-green-500/50' },
    };

    const style = severityMap[incident.severity] || severityMap.medium;

    return (
        <div className={`group bg-slate-900/40 backdrop-blur-md rounded-2xl border border-slate-800 transition-all duration-300 ${style.border} ${style.glow} ${compact ? 'p-3' : 'p-5'} hover:-translate-y-1`}>
            <div className="flex items-start justify-between gap-3 mb-3">
                <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1.5">
                        <span className="text-xl">{style.icon}</span>
                        <StatusBadge status={incident.severity} size="xs" />
                    </div>
                    <h3 className={`font-bold text-white transition-colors group-hover:text-red-400 ${compact ? 'text-sm' : 'text-base'}`}>
                        {incident.title}
                    </h3>
                </div>
                <span className="text-xs text-slate-500 font-mono mt-1">
                    {new Date(incident.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
            </div>

            {!compact && incident.description && (
                <p className="text-sm text-slate-400 mb-4 line-clamp-2 leading-relaxed">
                    {incident.description}
                </p>
            )}

            <div className="flex items-center justify-between mt-auto">
                <div className="flex items-center gap-2">
                    <StatusBadge status={incident.status} size="xs" />
                    {incident.assigned_team_name && (
                        <div className="flex items-center gap-1.5 px-2.5 py-1 bg-slate-800/50 rounded-lg border border-slate-700/50">
                            <div className="w-2 h-2 rounded-full bg-blue-400 shadow-[0_0_5px_rgba(96,165,250,0.5)]" />
                            <span className="text-xs text-slate-300 font-medium">{incident.assigned_team_name}</span>
                        </div>
                    )}
                </div>
            </div>

            {!compact && onAssign && incident.status === 'reported' && (
                <button
                    onClick={() => onAssign(incident)}
                    className="mt-5 w-full px-5 py-3 text-sm font-bold text-white bg-red-600 hover:bg-red-500 rounded-xl transition-all shadow-lg shadow-red-600/20 active:scale-95 flex items-center justify-center gap-2 group/btn"
                >
                    Assign Tactical Team
                    <svg className="w-3.5 h-3.5 group-hover/btn:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor font-bold">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                    </svg>
                </button>
            )}
        </div>
    );
}

export function TeamCard({ team, onStatusChange, compact = false }) {
    return (
        <div className={`group bg-slate-900/40 backdrop-blur-md rounded-2xl border border-slate-800 transition-all duration-300 hover:border-blue-500/30 ${compact ? 'p-3' : 'p-5'} hover:-translate-y-1`}>
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                    <div className="relative">
                        <div className={`w-3.5 h-3.5 rounded-full ${team.status === 'available' ? 'bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.5)]' :
                                team.status === 'responding' ? 'bg-amber-400 animate-pulse shadow-[0_0_15px_rgba(251,191,36,0.6)]' :
                                    team.status === 'busy' ? 'bg-red-400 shadow-[0_0_10px_rgba(248,113,113,0.5)]' : 'bg-slate-500'
                            }`} />
                        {team.status === 'responding' && (
                            <div className="absolute inset-0 rounded-full bg-amber-400 animate-ping opacity-25" />
                        )}
                    </div>
                    <div>
                        <h3 className="font-bold text-white text-base group-hover:text-blue-400 transition-colors">{team.team_name}</h3>
                        <p className="text-xs text-slate-500 uppercase tracking-widest font-bold">{team.vehicle_id}</p>
                    </div>
                </div>
                <StatusBadge status={team.status} size="xs" />
            </div>

            <div className="space-y-4">
                {team.incident_title && (
                    <div className="bg-amber-500/5 border border-amber-500/10 rounded-xl p-3">
                        <p className="text-xs text-amber-500 uppercase font-black tracking-tighter mb-1.5">Active Mission</p>
                        <p className="text-sm text-slate-200 font-medium truncate">{team.incident_title}</p>
                    </div>
                )}
                
                <div className="flex items-center justify-between">
                    {team.latitude && (
                        <div className="flex items-center gap-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-slate-600" />
                            <p className="text-xs text-slate-500 font-mono tracking-tighter">
                                {team.latitude?.toFixed(4)}, {team.longitude?.toFixed(4)}
                            </p>
                        </div>
                    )}
                </div>
            </div>

            {!compact && onStatusChange && (
                <div className="flex gap-2 mt-5 pt-4 border-t border-slate-800/50">
                    {['available', 'busy', 'responding'].map(status => (
                        <button
                            key={status}
                            onClick={() => onStatusChange(team.id, status)}
                            disabled={team.status === status}
                            className={`flex-1 px-3 py-2.5 text-xs font-bold rounded-xl capitalize transition-all ${team.status === status
                                    ? 'bg-slate-800/50 text-slate-500 border border-transparent cursor-default'
                                    : 'bg-slate-800 text-slate-300 border border-slate-700 hover:border-blue-500/50 hover:bg-slate-700/50 hover:text-white active:scale-95'
                                }`}
                        >
                            {status}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}
