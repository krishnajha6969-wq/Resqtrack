"use client";

import { useEffect, useState } from "react";
import api from "../lib/api";
import dynamic from "next/dynamic";
import { getSocket, joinRole, disconnectSocket } from "../lib/socket";

const MapView = dynamic(() => import("../components/MapView"), {
  ssr: false,
});

export default function Home() {
  const [teams, setTeams] = useState([]);

  useEffect(() => {
    async function loadTeams() {
      try {
        const data = await api.getTeams();
        console.log("API RESPONSE:", data); // 🔥 IMPORTANT
        setTeams(data);
      } catch (err) {
        console.error("API ERROR:", err);
      }
    }

    loadTeams();

    // SOCKET.IO REAL-TIME INTEGRATION
    const socket = getSocket();
    
    // We must join the 'command_center' role to receive the map broadcasts
    joinRole('command_center');

    // Listen for live vehicle movement
    socket.on('team:location', (update) => {
      console.log('📍 Live Movement Received:', update);
      
      setTeams((prevTeams) => 
        prevTeams.map((team) => {
          // Check against vehicle_id or team_id depending on how it's matched
          if (team.id === update.team_id || team.vehicle_id === update.team_id) {
            return {
              ...team,
              lat: update.latitude,  // update aliases
              lng: update.longitude, // update aliases
              latitude: update.latitude,
              longitude: update.longitude,
            };
          }
          return team;
        })
      );
    });

    return () => {
      socket.off('team:location');
      // disconnectSocket(); // Optional: kept alive for navigation
    };
  }, []);

  return (
    <div>
      <h1 style={{ padding: "10px" }}>🚨 ResQTrack Live Map</h1>
      <MapView teams={teams} />
    </div>
  );
}