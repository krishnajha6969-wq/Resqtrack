import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/database';

export async function GET() {
  const db = getDatabase();
  return NextResponse.json({ teams: db.teams });
}

export async function POST(request: NextRequest) {
  try {
    const { team_id, location, speed, status } = await request.json();
    const db = getDatabase();
    const team = db.teams.find(t => t.id === team_id || t.vehicle_id === team_id);
    if (!team) {
      return NextResponse.json({ error: 'Team not found' }, { status: 404 });
    }
    if (location) {
      team.location = location;
    }
    if (speed !== undefined) {
      team.speed = speed;
    }
    if (status) {
      team.status = status;
    }
    team.last_updated = new Date().toISOString();
    return NextResponse.json({ team });
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
