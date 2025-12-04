import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { NextRequest } from 'next/server';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export interface JWTPayload {
  userId: string;
  email: string;
  role: 'ADMIN' | 'VOLUNTEER';
}

// Hash password
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

// Verify password
export async function verifyPassword(
  password: string,
  hashedPassword: string
): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword);
}

// Generate JWT token
export function generateToken(payload: JWTPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
}

// Verify JWT token
export function verifyToken(token: string): JWTPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as JWTPayload;
  } catch (error) {
    return null;
  }
}

// Get user from request (extract JWT from Authorization header or cookie)
export function getUserFromRequest(request: NextRequest): JWTPayload | null {
  // Try Authorization header
  const authHeader = request.headers.get('authorization');
  if (authHeader?.startsWith('Bearer ')) {
    const token = authHeader.substring(7);
    return verifyToken(token);
  }

  // Try cookie
  const token = request.cookies.get('token')?.value;
  if (token) {
    return verifyToken(token);
  }

  return null;
}

// Check if user is admin
export function isAdmin(user: JWTPayload | null): boolean {
  return user?.role === 'ADMIN';
}

// Unauthorized response
export function unauthorizedResponse(message = 'Unauthorized') {
  return Response.json({ error: message }, { status: 401 });
}

// Forbidden response
export function forbiddenResponse(message = 'Forbidden') {
  return Response.json({ error: message }, { status: 403 });
}
