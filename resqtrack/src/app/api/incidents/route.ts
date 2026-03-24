import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/database';
import { v4 as uuidv4 } from 'uuid';

export async function GET() {
  const db = getDatabase();
  return NextResponse.json({ incidents: db.incidents });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const db = getDatabase();
    const incident = {
      id: uuidv4(),
      location: body.location,
      severity: body.severity || 'medium',
      description: body.description,
      type: body.type || 'rescue',
      assigned_team: null,
      status: 'reported' as const,
      reporter: body.reporter || 'Anonymous',
      timestamp: new Date().toISOString(),
      address: body.address || 'Unknown Location',
    };
    db.incidents.push(incident);
    return NextResponse.json({ incident }, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
