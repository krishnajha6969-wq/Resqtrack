import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/database';
import { signToken } from '@/lib/auth';
import { v4 as uuidv4 } from 'uuid';

export async function POST(request: NextRequest) {
  try {
    const { email, password, name, role } = await request.json();
    const db = getDatabase();
    const existing = db.users.find(u => u.email === email);
    if (existing) {
      return NextResponse.json({ error: 'User already exists' }, { status: 409 });
    }
    const user = {
      id: uuidv4(),
      email,
      password,
      name,
      role: role || 'rescue',
      team_id: null,
    };
    db.users.push(user);
    const token = signToken({
      userId: user.id,
      email: user.email,
      role: user.role as 'command' | 'rescue',
      name: user.name,
    });
    return NextResponse.json({
      token,
      user: { id: user.id, email: user.email, role: user.role, name: user.name },
    });
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
