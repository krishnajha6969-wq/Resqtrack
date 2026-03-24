import { NextResponse } from 'next/server';
import { getDatabase } from '@/lib/database';

export async function GET() {
  const db = getDatabase();
  // Simulated route optimization: find congested and blocked areas, suggest avoidance
  const congestedAreas = db.congestion.filter(c => c.status === 'congested' || c.status === 'blocked');
  const activeBlocks = db.roadBlocks.filter(r => r.status === 'active');

  const avoidZones = [
    ...congestedAreas.map(c => ({
      type: 'congestion' as const,
      location: c.location,
      road: c.road_segment,
      severity: c.status,
    })),
    ...activeBlocks.map(b => ({
      type: 'roadblock' as const,
      location: b.location,
      road: b.description,
      severity: 'blocked' as const,
    })),
  ];

  return NextResponse.json({
    message: 'Route optimization data',
    avoid_zones: avoidZones,
    recommendation: 'Avoid congested and blocked areas. Use alternative routes through less affected zones.',
    optimized: true,
  });
}
