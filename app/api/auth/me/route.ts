import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUserFromRequest, unauthorizedResponse } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    // Get user from JWT
    const jwtUser = getUserFromRequest(request);

    if (!jwtUser) {
      return unauthorizedResponse();
    }

    // Fetch full user data from database
    const user = await prisma.user.findUnique({
      where: { id: jwtUser.userId },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        points: true,
        profilePicture: true,
        createdAt: true,
      },
    });

    if (!user) {
      return unauthorizedResponse();
    }

    return NextResponse.json({ user });
  } catch (error) {
    console.error('Get user error:', error);
    return NextResponse.json(
      { error: 'Failed to get user' },
      { status: 500 }
    );
  }
}
