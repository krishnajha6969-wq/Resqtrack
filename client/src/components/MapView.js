'use client';

import { useEffect, useRef, useState } from 'react';

/**
 * Leaflet Map component with vehicle markers, incident markers, and congestion overlay
 * Dynamically imports Leaflet to avoid SSR issues
 */
export default function MapView({
    teams = [],
    incidents = [],
    congestion = [],
    center = [19.2902, 72.8711],
    zoom = 13,
    onMapClick = null,
    className = '',
    height = '100%',
}) {
    const mapRef = useRef(null);
    const mapInstanceRef = useRef(null);
    const markersRef = useRef({});
    const [loaded, setLoaded] = useState(false);
    const leafletRef = useRef(null);

    useEffect(() => {
        if (typeof window === 'undefined') return;

        // Dynamically import Leaflet
        const loadLeaflet = async () => {
            const L = (await import('leaflet')).default;
            await import('leaflet/dist/leaflet.css');
            leafletRef.current = L;

            if (mapInstanceRef.current) return;

            // Fix default marker icons
            delete L.Icon.Default.prototype._getIconUrl;
            L.Icon.Default.mergeOptions({
                iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
                iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
                shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
            });

            // Create map
            const map = L.map(mapRef.current, {
                center,
                zoom,
                zoomControl: false,
                maxBounds: [
                    [19.20, 72.75], // Southwest
                    [19.40, 72.98]  // Northeast
                ],
                minZoom: 12,
            });

            // Add dark tile layer
            L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
                attribution: '&copy; OpenStreetMap &copy; CARTO',
                maxZoom: 19,
            }).addTo(map);

            // Custom Zoom Control will be handled by React state
            mapInstanceRef.current = map;
            setLoaded(true);

            if (onMapClick) {
                map.on('click', (e) => onMapClick(e.latlng));
            }

            mapInstanceRef.current = map;
            setLoaded(true);
        };

        loadLeaflet();

        return () => {
            if (mapInstanceRef.current) {
                mapInstanceRef.current.remove();
                mapInstanceRef.current = null;
            }
        };
    }, []);

    // Update team markers
    useEffect(() => {
        if (!loaded || !mapInstanceRef.current || !leafletRef.current) return;
        const L = leafletRef.current;
        const map = mapInstanceRef.current;

        // Clear existing team markers
        Object.keys(markersRef.current).forEach(key => {
            if (key.startsWith('team_')) {
                markersRef.current[key].remove();
                delete markersRef.current[key];
            }
        });

        const statusColors = {
            available: '#10b981',
            responding: '#f59e0b',
            busy: '#ef4444',
            offline: '#6b7280',
        };

        teams.forEach(team => {
            if (!team.latitude || !team.longitude) return;

            const color = statusColors[team.status] || '#6b7280';
            const icon = L.divIcon({
                html: `
          <div class="team-marker-container" style="position:relative;">
            <div class="team-marker-glow" style="position:absolute;inset:-8px;background:${color}33;border-radius:50%;filter:blur(8px);transform:scale(1.2);"></div>
            <div style="width:32px;height:32px;border-radius:50%;background:${color};border:3px solid white;box-shadow:0 0 15px ${color}66;display:flex;align-items:center;justify-content:center;position:relative;">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="white">
                <path d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11c-.66 0-1.21.42-1.42 1.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99zM6.5 16c-.83 0-1.5-.67-1.5-1.5S5.67 13 6.5 13s1.5.67 1.5 1.5S7.33 16 6.5 16zm11 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zM5 11l1.5-4.5h11L19 11H5z"/>
              </svg>
            </div>
            <div style="position:absolute;top:-4px;right:-4px;width:12px;height:12px;border-radius:50%;background:${color};border:2px solid white;${team.status === 'responding' ? 'animation:pulse 1s infinite;' : ''}"></div>
          </div>
        `,
                className: '',
                iconSize: [32, 32],
                iconAnchor: [16, 16],
            });

            const marker = L.marker([team.latitude, team.longitude], { icon }).addTo(map);
            marker.bindPopup(`
        <div style="font-family:system-ui;min-width:160px;">
          <h3 style="font-weight:700;font-size:14px;margin:0 0 4px;">${team.team_name}</h3>
          <p style="color:#666;font-size:12px;margin:2px 0;">Vehicle: ${team.vehicle_id}</p>
          <p style="font-size:12px;margin:2px 0;">
            Status: <span style="color:${color};font-weight:600;text-transform:capitalize;">${team.status}</span>
          </p>
          ${team.incident_title ? `<p style="font-size:12px;margin:2px 0;">Mission: ${team.incident_title}</p>` : ''}
        </div>
      `);

            markersRef.current[`team_${team.id}`] = marker;
        });
    }, [teams, loaded]);

    // Update incident markers
    useEffect(() => {
        if (!loaded || !mapInstanceRef.current || !leafletRef.current) return;
        const L = leafletRef.current;
        const map = mapInstanceRef.current;

        Object.keys(markersRef.current).forEach(key => {
            if (key.startsWith('incident_')) {
                markersRef.current[key].remove();
                delete markersRef.current[key];
            }
        });

        const severityColors = {
            critical: '#dc2626',
            high: '#f97316',
            medium: '#eab308',
            low: '#22c55e',
        };

        incidents.forEach(incident => {
            const color = severityColors[incident.severity] || '#6b7280';
            const icon = L.divIcon({
                html: `
          <div class="incident-marker" style="width:32px;height:32px;position:relative;display:flex;align-items:center;justify-content:center;">
            <div style="position:absolute;inset:0;background:${color};opacity:0.25;border-radius:8px;transform:rotate(45deg);animation:pulse 2s infinite;"></div>
            <div style="width:24px;height:24px;border-radius:6px;background:${color};border:2px solid white;box-shadow:0 0 15px ${color}66;display:flex;align-items:center;justify-content:center;transform:rotate(45deg);position:relative;z-index:2;">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="white" style="transform:rotate(-45deg);">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
              </svg>
            </div>
          </div>
        `,
                className: '',
                iconSize: [28, 28],
                iconAnchor: [14, 14],
            });

            const marker = L.marker([incident.latitude, incident.longitude], { icon }).addTo(map);
            marker.bindPopup(`
        <div style="font-family:system-ui;min-width:180px;">
          <h3 style="font-weight:700;font-size:14px;margin:0 0 4px;">${incident.title}</h3>
          <p style="font-size:12px;margin:2px 0;">
            Severity: <span style="color:${color};font-weight:600;text-transform:uppercase;">${incident.severity}</span>
          </p>
          <p style="color:#666;font-size:12px;margin:2px 0;">${incident.description || 'No description'}</p>
          <p style="font-size:12px;margin:2px 0;">Status: <span style="text-transform:capitalize;">${incident.status}</span></p>
        </div>
      `);

            markersRef.current[`incident_${incident.id}`] = marker;
        });
    }, [incidents, loaded]);

    // Congestion circles
    useEffect(() => {
        if (!loaded || !mapInstanceRef.current || !leafletRef.current) return;
        const L = leafletRef.current;
        const map = mapInstanceRef.current;

        Object.keys(markersRef.current).forEach(key => {
            if (key.startsWith('congestion_')) {
                markersRef.current[key].remove();
                delete markersRef.current[key];
            }
        });

        congestion.forEach((zone, i) => {
            const color = zone.status === 'congested' ? '#ef4444' : '#f59e0b';
            const circle = L.circle([zone.latitude || zone.lat, zone.longitude || zone.lng], {
                radius: 300,
                color: color,
                fillColor: color,
                fillOpacity: 0.2,
                weight: 2,
                dashArray: '5, 5',
            }).addTo(map);

            circle.bindPopup(`
        <div style="font-family:system-ui;">
          <h3 style="font-weight:700;font-size:13px;margin:0 0 4px;">${zone.road_segment || 'Zone'}</h3>
          <p style="font-size:12px;margin:2px 0;">Vehicles: ${zone.vehicle_density || zone.density}</p>
          <p style="font-size:12px;margin:2px 0;">Avg Speed: ${zone.average_speed || zone.speed} km/h</p>
          <p style="font-size:12px;margin:2px 0;color:${color};font-weight:600;text-transform:uppercase;">${zone.status}</p>
        </div>
      `);

            markersRef.current[`congestion_${i}`] = circle;
        });
    }, [congestion, loaded]);

    const handleZoomIn = () => mapInstanceRef.current?.zoomIn();
    const handleZoomOut = () => mapInstanceRef.current?.zoomOut();
    const handleRecenter = () => mapInstanceRef.current?.setView(center, zoom);

    return (
        <div className={`relative ${className} group/map`} style={{ height }}>
            {/* Vignette Overlay */}
            <div className="absolute inset-0 pointer-events-none z-[10] shadow-[inset_0_0_100px_rgba(0,0,0,0.5)] rounded-xl" />
            
            <div ref={mapRef} className="w-full h-full rounded-xl overflow-hidden saturate-[1.2] brightness-[0.8] contrast-[1.1]" />
            
            {/* Custom Controls */}
            <div className="absolute bottom-6 right-6 z-[20] flex flex-col gap-2">
                <button 
                  onClick={handleRecenter}
                  className="w-10 h-10 bg-slate-900/80 backdrop-blur-md border border-slate-700 text-slate-300 rounded-xl flex items-center justify-center hover:bg-red-600 hover:text-white hover:border-red-500 transition-all shadow-xl"
                  title="Recenter Map"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                  </svg>
                </button>
                <div className="flex flex-col bg-slate-900/80 backdrop-blur-md border border-slate-700 rounded-xl overflow-hidden shadow-xl">
                    <button 
                      onClick={handleZoomIn}
                      className="w-10 h-10 flex items-center justify-center text-slate-300 hover:bg-slate-800 hover:text-white transition-colors border-b border-slate-700"
                    >
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                      </svg>
                    </button>
                    <button 
                      onClick={handleZoomOut}
                      className="w-10 h-10 flex items-center justify-center text-slate-300 hover:bg-slate-800 hover:text-white transition-colors"
                    >
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 12h-15" />
                      </svg>
                    </button>
                </div>
            </div>

            {!loaded && (
                <div className="absolute inset-0 flex items-center justify-center bg-slate-950/90 z-[30] rounded-xl">
                    <div className="flex flex-col items-center gap-4">
                        <div className="relative w-12 h-12">
                            <div className="absolute inset-0 border-4 border-red-500/20 rounded-full" />
                            <div className="absolute inset-0 border-4 border-red-600 border-t-transparent rounded-full animate-spin" />
                        </div>
                        <span className="text-sm font-bold text-slate-400 tracking-widest uppercase">Initializing Neural Map...</span>
                    </div>
                </div>
            )}

            <style jsx global>{`
                @keyframes pulse {
                    0% { transform: scale(1); opacity: 1; }
                    50% { transform: scale(1.1); opacity: 0.7; }
                    100% { transform: scale(1); opacity: 1; }
                }
                .leaflet-popup-content-wrapper {
                    background: rgba(15, 23, 42, 0.9) !important;
                    backdrop-filter: blur(12px) !important;
                    border: 1px solid rgba(51, 65, 85, 0.5) !important;
                    color: white !important;
                    border-radius: 16px !important;
                    box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.3) !important;
                }
                .leaflet-popup-tip {
                    background: rgba(15, 23, 42, 0.9) !important;
                }
            `}</style>
        </div>
    );
}
