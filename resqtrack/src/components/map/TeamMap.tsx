'use client';
import { useEffect } from 'react';
import L from 'leaflet';
import { MapContainer, TileLayer, Marker, Popup, Circle, useMap } from 'react-leaflet';
import type { Team, Incident } from '@/lib/database';
import 'leaflet/dist/leaflet.css';

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

const createIcon = (emoji: string, color: string, size: number = 36) => {
  return L.divIcon({
    className: 'custom-marker',
    html: `<div style="background:${color};width:${size}px;height:${size}px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:${size * 0.5}px;border:3px solid white;box-shadow:0 2px 10px rgba(0,0,0,0.4);">${emoji}</div>`,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
  });
};

function FocusMap({ center }: { center: [number, number] }) {
  const map = useMap();
  useEffect(() => { map.setView(center, 14); }, [center, map]);
  return null;
}

interface Props {
  teams: Team[];
  incidents: Incident[];
  myTeam: Team | null;
  myMission: Incident | null;
}

export default function TeamMap({ teams, incidents, myTeam, myMission }: Props) {
  const center: [number, number] = myTeam ? [myTeam.location.lat, myTeam.location.lng] : [13.0827, 80.2707];
  const typeIcons: Record<string, string> = { ambulance: '🚑', fire: '🚒', police: '🚓', relief: '🚚' };
  const typeColors: Record<string, string> = { ambulance: '#D32F2F', fire: '#FF6F00', police: '#0D47A1', relief: '#2E7D32' };

  return (
    <MapContainer center={center} zoom={14} style={{ height: '100%', width: '100%' }} zoomControl={false}>
      <FocusMap center={center} />
      <TileLayer
        attribution='&copy; OpenStreetMap'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      {/* My location pulse */}
      {myTeam && (
        <Circle center={[myTeam.location.lat, myTeam.location.lng]} radius={200} pathOptions={{ color: '#D32F2F', fillColor: '#D32F2F', fillOpacity: 0.1, weight: 1 }} />
      )}

      {/* Mission destination */}
      {myMission && (
        <>
          <Circle center={[myMission.location.lat, myMission.location.lng]} radius={150} pathOptions={{ color: '#FF6F00', fillColor: '#FF6F00', fillOpacity: 0.2, weight: 2, dashArray: '5,5' }} />
          <Marker position={[myMission.location.lat, myMission.location.lng]} icon={createIcon('🎯', '#FF6F00', 40)}>
            <Popup><div className="text-xs"><p className="font-bold text-red-600 mb-1">🎯 Mission Target</p><p>{myMission.description}</p><p className="text-gray-500 mt-1">📍 {myMission.address}</p></div></Popup>
          </Marker>
        </>
      )}

      {/* Other incidents */}
      {incidents.filter(i => i.id !== myMission?.id && i.status !== 'resolved').map(incident => (
        <Marker key={incident.id} position={[incident.location.lat, incident.location.lng]} icon={createIcon('⚠️', incident.severity === 'critical' ? '#C62828' : '#E65100', 28)}>
          <Popup><div className="text-xs"><p className="font-bold">{incident.description}</p><p className="text-gray-500">📍 {incident.address}</p></div></Popup>
        </Marker>
      ))}

      {/* Other teams */}
      {teams.filter(t => t.id !== myTeam?.id).map(team => (
        <Marker key={team.id} position={[team.location.lat, team.location.lng]} icon={createIcon(typeIcons[team.type] || '🚗', typeColors[team.type] || '#666', 30)} opacity={0.7}>
          <Popup><div className="text-xs"><p className="font-bold">{team.team_name}</p><p className="text-gray-500">{team.vehicle_id} · {team.speed} km/h</p></div></Popup>
        </Marker>
      ))}

      {/* My team marker (on top) */}
      {myTeam && (
        <Marker position={[myTeam.location.lat, myTeam.location.lng]} icon={createIcon(typeIcons[myTeam.type] || '🚗', typeColors[myTeam.type] || '#D32F2F', 44)} zIndexOffset={1000}>
          <Popup><div className="text-xs"><p className="font-bold text-blue-600">📍 My Location</p><p>{myTeam.team_name}</p><p className="text-gray-500">{myTeam.speed} km/h · {myTeam.status}</p></div></Popup>
        </Marker>
      )}
    </MapContainer>
  );
}
