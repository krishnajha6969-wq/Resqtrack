"use client";

import { useEffect, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

export default function LocationPicker({ value = { lat: 19.2952, lng: 72.8544 }, onChange }) {
  const mapRef = useRef(null);
  const mapInstance = useRef(null);
  const markerRef = useRef(null);

  useEffect(() => {
    if (!mapRef.current) return;

    if (!mapInstance.current) {
      const map = L.map(mapRef.current, {
        center: [value.lat || 19.2952, value.lng || 72.8544],
        zoom: 13,
        zoomControl: false
      });

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      }).addTo(map);

      // Custom pulse icon for the picker
      const pickerIcon = L.divIcon({
        className: 'location-picker-marker',
        html: `
          <div style="position: relative; width: 24px; height: 24px; display: flex; align-items: center; justify-content: center; background: #ef4444; border-radius: 50%; border: 2px solid white; box-shadow: 0 0 10px rgba(239, 68, 68, 0.5);">
            <div style="width: 8px; height: 8px; background: white; border-radius: 50%;"></div>
            <div style="position: absolute; width: 100%; height: 100%; border-radius: 50%; border: 2px solid #ef4444; animation: pulse 2s infinite;"></div>
          </div>
          <style>
            @keyframes pulse {
              0% { transform: scale(1); opacity: 1; }
              100% { transform: scale(2.5); opacity: 0; }
            }
          </style>
        `,
        iconSize: [24, 24],
        iconAnchor: [12, 12]
      });

      const marker = L.marker([value.lat || 19.2952, value.lng || 72.8544], {
        icon: pickerIcon,
        draggable: true
      }).addTo(map);

      marker.on('dragend', function(event) {
        const marker = event.target;
        const position = marker.getLatLng();
        onChange(position.lat.toFixed(6), position.lng.toFixed(6));
      });

      map.on('click', function(e) {
        const { lat, lng } = e.latlng;
        marker.setLatLng([lat, lng]);
        onChange(lat.toFixed(6), lng.toFixed(6));
      });

      mapInstance.current = map;
      markerRef.current = marker;
    } else {
        // Sync marker if coordinates changed externally (like Locate Me)
        if (value.lat && value.lng && markerRef.current) {
            const current = markerRef.current.getLatLng();
            if (current.lat !== parseFloat(value.lat) || current.lng !== parseFloat(value.lng)) {
                markerRef.current.setLatLng([value.lat, value.lng]);
                mapInstance.current.setView([value.lat, value.lng]);
            }
        }
    }
  }, [value, onChange]);

  return (
    <div
      ref={mapRef}
      style={{
        height: "100%",
        width: "100%",
        borderRadius: '12px'
      }}
    />
  );
}
