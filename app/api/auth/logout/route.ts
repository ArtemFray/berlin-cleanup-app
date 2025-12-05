import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  const response = NextResponse.json({ success: true });

  // Clear the token cookie
  response.cookies.set('token', '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 0, // Expire immediately
    path: '/',
  });

  console.log('[Logout] Cleared cookie');

  return response;
}
