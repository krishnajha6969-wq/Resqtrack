"use client";

import { useEffect, useState } from "react";
import api from "../lib/api";
import dynamic from "next/dynamic";

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
  }, []);

  return (
    <div>
      <h1 style={{ padding: "10px" }}>🚨 ResQTrack Live Map</h1>
      <MapView teams={teams} />
    </div>
  );
}