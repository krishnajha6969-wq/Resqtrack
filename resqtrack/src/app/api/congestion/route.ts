import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/database';
import { v4 as uuidv4 } from 'uuid';

export async function GET() {
  const db = getDatabase();
  return NextResponse.json({ congestion: db.congestion, roadBlocks: db.roadBlocks });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const db = getDatabase();
    const congestion = {
      id: uuidv4(),
      road_segment: body.road_segment,
      location: body.location,
      vehicle_count: body.vehicle_count || 1,
      average_speed: body.average_speed || 0,
      status: body.status || 'moderate' as const,
      timestamp: new Date().toISOString(),
    };
    db.congestion.push(congestion);
    return NextResponse.json({ congestion }, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
