"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import api from "../lib/api";

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    // Check if user is already authenticated
    const user = api.getUser?.();
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

    if (user && token) {
      // Authenticated — send to appropriate dashboard
      if (user.role === 'command_center' || user.role === 'admin') {
        router.replace('/dashboard');
      } else if (user.role === 'citizen') {
        router.replace('/report');
      } else {
        router.replace('/rescue');
      }
    } else {
      // Not authenticated — send to login
      router.replace('/login');
    }
  }, [router]);

  // Brief loading state while redirecting
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: '#020617',
    }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{
          width: 48,
          height: 48,
          border: '4px solid rgba(239,68,68,0.2)',
          borderTop: '4px solid #ef4444',
          borderRadius: '50%',
          animation: 'spin 0.8s linear infinite',
          margin: '0 auto 16px',
        }} />
        <p style={{ color: '#94a3b8', fontSize: 14, fontWeight: 500 }}>Loading ResQTrack...</p>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    </div>
  );
}