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

      // ✅ Test marker (you can remove later)
      L.marker([19.2952, 72.8544])
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

      const marker = L.marker([lat, lng]).addTo(map);

      marker.bindPopup(`
        🚑 ${team.team_name || "Team"} <br/>
        Vehicle: ${team.vehicle_id || "N/A"}
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