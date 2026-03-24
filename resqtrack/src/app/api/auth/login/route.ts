import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/database';
import { signToken } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();
    const db = getDatabase();
    const user = db.users.find(u => u.email === email && u.password === password);
    if (!user) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }
    const token = signToken({
      userId: user.id,
      email: user.email,
      role: user.role,
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
