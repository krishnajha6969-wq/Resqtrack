"use client";

import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

export default function MapView({ teams = [] }) {
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

      // ✅ Test marker fixed to L.divIcon too
      const testIcon = L.divIcon({
        className: 'test-marker',
        html: `<div style="font-size: 24px;">🚩</div>`,
        iconSize: [24, 24],
        iconAnchor: [12, 12],
        popupAnchor: [0, -12]
      });

      L.marker([19.2952, 72.8544], { icon: testIcon })
        .addTo(map)
        .bindPopup("TEST MARKER - Mira Bhayander")
        .openPopup();

      mapInstance.current = map;
    }

    const map = mapInstance.current;

    console.log("ALL TEAMS:", teams);

    // 🟢 Remove old markers safely
    markersRef.current.forEach((marker) => map.removeLayer(marker));
    markersRef.current = [];

    // 🟢 Add new markers
    teams.forEach((team) => {
      console.log("TEAM:", team);

      const lat = team.latitude ?? team.lat;
      const lng = team.longitude ?? team.lng;

      console.log("COORDS:", lat, lng);

      if (lat == null || lng == null) return;

      // Use a custom divIcon to avoid Next.js missing image 404s
      const customIcon = L.divIcon({
        className: 'custom-team-marker',
        html: `<div style="font-size: 24px; filter: drop-shadow(2px 4px 6px rgba(0,0,0,0.5));">🚑</div>`,
        iconSize: [24, 24],
        iconAnchor: [12, 12],
        popupAnchor: [0, -12]
      });

      const marker = L.marker([lat, lng], { icon: customIcon }).addTo(map);

      marker.bindPopup(`
        🚑 <strong>${team.team_name || "Team"}</strong> <br/>
        Vehicle: ${team.vehicle_id || "N/A"} <br/>
        Status: ${team.status || "Unknown"}
      `);

      markersRef.current.push(marker);
    });

  }, [teams]);

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