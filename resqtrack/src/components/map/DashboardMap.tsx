'use client';
import { useEffect } from 'react';
import L from 'leaflet';
import { MapContainer, TileLayer, Marker, Popup, Circle, useMap } from 'react-leaflet';
import type { Team, Incident, Congestion, RoadBlock } from '@/lib/database';
import 'leaflet/dist/leaflet.css';

// Fix default marker icon
const DefaultIcon = L.icon({
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});
L.Marker.prototype.options.icon = DefaultIcon;

const createTeamIcon = (type: string, status: string) => {
  const colors: Record<string, string> = { ambulance: '#D32F2F', fire: '#FF6F00', police: '#0D47A1', relief: '#2E7D32' };
  const icons: Record<string, string> = { ambulance: '🚑', fire: '🚒', police: '🚓', relief: '🚚' };
  const color = colors[type] || '#666';
  const isActive = status !== 'idle';
  return L.divIcon({
    className: 'custom-marker',
    html: `<div style="background:${color};width:36px;height:36px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:18px;border:3px solid white;box-shadow:0 2px 8px rgba(0,0,0,0.3);${isActive ? 'animation:pulse 2s infinite;' : ''}">${icons[type] || '🚗'}</div>`,
    iconSize: [36, 36],
    iconAnchor: [18, 18],
  });
};

const createIncidentIcon = (severity: string) => {
  const colors: Record<string, string> = { critical: '#C62828', high: '#E65100', medium: '#F9A825', low: '#2E7D32' };
  const color = colors[severity] || '#666';
  return L.divIcon({
    className: 'custom-marker',
    html: `<div style="background:${color};width:28px;height:28px;border-radius:6px;display:flex;align-items:center;justify-content:center;font-size:14px;border:2px solid white;box-shadow:0 2px 8px rgba(0,0,0,0.3);transform:rotate(45deg);"><span style="transform:rotate(-45deg)">⚠️</span></div>`,
    iconSize: [28, 28],
    iconAnchor: [14, 14],
  });
};

function MapUpdater({ center }: { center: [number, number] }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, 13);
  }, [center, map]);
  return null;
}

interface Props {
  teams: Team[];
  incidents: Incident[];
  congestion: Congestion[];
  roadBlocks: RoadBlock[];
  onTeamSelect: (team: Team) => void;
}

export default function DashboardMap({ teams, incidents, congestion, roadBlocks, onTeamSelect }: Props) {
  const center: [number, number] = [13.0827, 80.2707];

  const congestionColor: Record<string, string> = {
    clear: '#4CAF50',
    moderate: '#FF9800',
    congested: '#F44336',
    blocked: '#880E4F',
  };

  return (
    <MapContainer center={center} zoom={13} style={{ height: '100%', width: '100%' }} zoomControl={true}>
      <MapUpdater center={center} />
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      {/* Congestion zones */}
      {congestion.map(c => (
        <Circle
          key={c.id}
          center={[c.location.lat, c.location.lng]}
          radius={300}
          pathOptions={{
            color: congestionColor[c.status] || '#999',
            fillColor: congestionColor[c.status] || '#999',
            fillOpacity: 0.25,
            weight: 2,
          }}
        >
          <Popup>
            <div className="text-xs">
              <p className="font-bold mb-1">{c.road_segment}</p>
              <p>Status: <strong className="capitalize">{c.status}</strong></p>
              <p>Vehicles: {c.vehicle_count}</p>
              <p>Avg Speed: {c.average_speed} km/h</p>
            </div>
          </Popup>
        </Circle>
      ))}

      {/* Road blocks */}
      {roadBlocks.filter(r => r.status === 'active').map(rb => (
        <Circle
          key={rb.id}
          center={[rb.location.lat, rb.location.lng]}
          radius={150}
          pathOptions={{ color: '#D32F2F', fillColor: '#D32F2F', fillOpacity: 0.4, weight: 3, dashArray: '5,5' }}
        >
          <Popup>
            <div className="text-xs">
              <p className="font-bold text-red-600 mb-1">🚧 Road Blocked</p>
              <p>{rb.description}</p>
              <p className="text-gray-500 mt-1">Reported by: {rb.reported_by}</p>
            </div>
          </Popup>
        </Circle>
      ))}

      {/* Incident markers */}
      {incidents.map(incident => (
        <Marker key={incident.id} position={[incident.location.lat, incident.location.lng]} icon={createIncidentIcon(incident.severity)}>
          <Popup>
            <div className="text-xs min-w-[180px]">
              <p className="font-bold text-red-600 mb-1">⚠️ {incident.type.toUpperCase()}</p>
              <p className="mb-1">{incident.description}</p>
              <p className="text-gray-500">📍 {incident.address}</p>
              <div className="flex gap-2 mt-2">
                <span className="bg-red-100 text-red-700 px-2 py-0.5 rounded text-[10px] font-bold uppercase">{incident.severity}</span>
                <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded text-[10px] font-bold capitalize">{incident.status}</span>
              </div>
            </div>
          </Popup>
        </Marker>
      ))}

      {/* Team markers */}
      {teams.map(team => (
        <Marker
          key={team.id}
          position={[team.location.lat, team.location.lng]}
          icon={createTeamIcon(team.type, team.status)}
          eventHandlers={{ click: () => onTeamSelect(team) }}
        >
          <Popup>
            <div className="text-xs min-w-[160px]">
              <p className="font-bold mb-1">{team.team_name}</p>
              <p className="text-gray-500 mb-1">{team.vehicle_id}</p>
              <p>Speed: <strong>{team.speed} km/h</strong></p>
              <p>Status: <strong className="capitalize">{team.status}</strong></p>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
