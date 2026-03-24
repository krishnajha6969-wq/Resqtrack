import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/database';

export async function PUT(request: NextRequest) {
  try {
    const { incident_id, team_id } = await request.json();
    const db = getDatabase();
    const incident = db.incidents.find(i => i.id === incident_id);
    if (!incident) {
      return NextResponse.json({ error: 'Incident not found' }, { status: 404 });
    }
    const team = db.teams.find(t => t.id === team_id);
    if (!team) {
      return NextResponse.json({ error: 'Team not found' }, { status: 404 });
    }
    incident.assigned_team = team_id;
    incident.status = 'assigned';
    team.assigned_incident = incident_id;
    team.status = 'en-route';
    return NextResponse.json({ incident, team });
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
