"use client";

import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

export default function MapView({ teams = [], incidents = [], congestion = [], route = [] }) {
  const mapRef = useRef(null);
  const mapInstance = useRef(null);
  const markersRef = useRef([]);

  useEffect(() => {
    if (!mapRef.current) return;

    // 🟢 Initialize map only once
    if (!mapInstance.current) {
      const map = L.map(mapRef.current, {
        center: [19.2952, 72.8544], // Mira Bhayander
        zoom: 13,
      });

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "&copy; OpenStreetMap contributors",
      }).addTo(map);

      mapInstance.current = map;
    }

    const map = mapInstance.current;

    // 🟢 Remove old markers safely
    markersRef.current.forEach((marker) => map.removeLayer(marker));
    markersRef.current = [];

    // 🟢 Add new markers
    teams.forEach((team) => {
      const lat = team.latitude ?? team.lat;
      const lng = team.longitude ?? team.lng;

      if (lat == null || lng == null) return;

      const customIcon = L.divIcon({
        className: 'custom-team-marker',
        html: `<div style="font-size: 24px; filter: drop-shadow(2px 4px 6px rgba(0,0,0,0.5));">🚑</div>`,
        iconSize: [24, 24],
        iconAnchor: [12, 12],
        popupAnchor: [0, -12]
      });

      const marker = L.marker([lat, lng], { icon: customIcon }).addTo(map);

      marker.bindPopup(`
        <div style="font-family: sans-serif; background: #020617; color: white; padding: 4px; border-radius: 8px;">
           <span style="font-size: 16px;">🚑</span> <strong style="color: #60a5fa">${team.team_name || "Team"}</strong> <br/>
           <span style="color: #94a3b8; font-size: 11px; text-transform: uppercase;">Vehicle ID:</span> ${team.vehicle_id || "N/A"} <br/>
           <span style="color: #94a3b8; font-size: 11px; text-transform: uppercase;">Status:</span> ${team.status || "Unknown"} <br/>
           ${team.last_seen ? `<span style="color: #60a5fa; font-size: 10px; font-weight: bold;">LIVE: ${team.last_seen}</span>` : ''}
        </div>
      `);

      markersRef.current.push(marker);
    });

    // 🟢 Add Incident Markers (Pulsing Alerts)
    incidents.forEach((incident) => {
      const lat = incident.latitude ?? incident.lat;
      const lng = incident.longitude ?? incident.lng;

      if (lat == null || lng == null) return;

      const isCritical = incident.severity === 'critical';
      const bgColor = isCritical ? 'rgba(239, 68, 68, 0.2)' : 'rgba(245, 158, 11, 0.2)';
      const borderColor = isCritical ? '#ef4444' : '#f59e0b';

      const alertIcon = L.divIcon({
        className: 'custom-incident-marker',
        html: `
          <div style="position: relative; width: 32px; height: 32px; display: flex; align-items: center; justify-content: center; background: #020617; border-radius: 50%; border: 2px solid ${borderColor}; box-shadow: 0 0 15px ${bgColor};">
            <div class="animate-ping" style="position: absolute; inset: 0; border-radius: 50%; background: ${borderColor}; opacity: 0.4;"></div>
            <span style="font-size: 18px; position: relative; z-index: 10;">⚠️</span>
          </div>
        `,
        iconSize: [32, 32],
        iconAnchor: [16, 16],
        popupAnchor: [0, -16]
      });

      const incidentMarker = L.marker([lat, lng], { icon: alertIcon }).addTo(map);
      incidentMarker.bindPopup(`
        <div style="font-family: sans-serif; background: #0f172a; color: white; padding: 5px; border-radius: 8px; border-left: 4px solid ${borderColor};">
           <strong style="color: white; font-size: 14px;">${incident.title}</strong><br/>
           <span style="color: #94a3b8; font-size: 12px; margin-top: 4px; display: block;">Severity: <b style="color: ${borderColor}; text-transform: uppercase;">${incident.severity}</b></span>
        </div>
      `);
      markersRef.current.push(incidentMarker);
    });

    // 🟢 Add Congestion Heatmap Zones (L.circle)
    congestion.forEach((zone) => {
      const lat = zone.latitude ?? zone.lat;
      const lng = zone.longitude ?? zone.lng;

      if (lat == null || lng == null) return;

      const isHeavy = zone.vehicle_density > 5;
      const heatColor = isHeavy ? '#ef4444' : '#f59e0b'; // Red for heavy, Amber for medium

      const heatCircle = L.circle([lat, lng], {
        color: heatColor,
        fillColor: heatColor,
        fillOpacity: isHeavy ? 0.35 : 0.15,
        radius: isHeavy ? 450 : 250, // Area of heat spread (meters)
        weight: 1,
        dashArray: '3, 6'
      }).addTo(map);

      heatCircle.bindPopup(`
        <div style="background: #020617; color: white; padding: 4px; font-family: sans-serif;">
           <strong>${zone.road_segment}</strong><br/>
           <span style="color: #94a3b8; font-size: 12px;">Density: ${zone.vehicle_density} vehicles</span><br/>
           <span style="color: #94a3b8; font-size: 12px;">Avg Speed: ${zone.average_speed} km/h</span>
        </div>
      `);
      markersRef.current.push(heatCircle);
    });

    // 🟢 Draw Smart Routing Path
    if (route && route.length > 1) {
      const latlngs = route.map(wp => [wp.lat, wp.lng]);
      
      // Draw outer glow
      const glowLine = L.polyline(latlngs, {
        color: '#06b6d4', // Cyan
        weight: 8,
        opacity: 0.3,
        lineCap: 'round',
        lineJoin: 'round'
      }).addTo(map);
      
      // Draw inner core
      const coreLine = L.polyline(latlngs, {
        color: '#22d3ee', // Bright Cyan
        weight: 4,
        opacity: 0.9,
        dashArray: '10, 10',
        className: 'route-path-animation',
        lineCap: 'round',
        lineJoin: 'round'
      }).addTo(map);

      markersRef.current.push(glowLine);
      markersRef.current.push(coreLine);
      
      // Add detour markers if any
      route.forEach(wp => {
        if (wp.is_detour) {
           const detourIcon = L.divIcon({
              className: 'detour-marker',
              html: `<div style="width: 12px; height: 12px; background: #06b6d4; border: 2px solid white; border-radius: 50%; box-shadow: 0 0 10px #06b6d4;"></div>`,
              iconSize: [12, 12],
              iconAnchor: [6, 6]
           });
           const dm = L.marker([wp.lat, wp.lng], { icon: detourIcon }).addTo(map);
           dm.bindPopup(`<strong>Smart Detour</strong><br/>Avoiding: ${wp.avoided_zone}`);
           markersRef.current.push(dm);
        }
      });
    }

  }, [teams, incidents, congestion, route]);

  return (
    <div
      ref={mapRef}
      style={{
        height: "100vh",
        width: "100%",
      }}
    />
  );
}