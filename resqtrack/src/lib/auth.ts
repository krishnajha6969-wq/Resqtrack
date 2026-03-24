import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'resqtrack-disaster-response-secret-key-2024';

export interface JWTPayload {
  userId: string;
  email: string;
  role: 'command' | 'rescue';
  name: string;
}

export function signToken(payload: JWTPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '24h' });
}

export function verifyToken(token: string): JWTPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as JWTPayload;
  } catch {
    return null;
  }
}
