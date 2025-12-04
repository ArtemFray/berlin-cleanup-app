import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/leaderboard - Get top volunteers
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '50');

    const topVolunteers = await prisma.user.findMany({
      where: {
        role: 'VOLUNTEER',
      },
      select: {
        id: true,
        name: true,
        profilePicture: true,
        points: true,
        _count: {
          select: {
            registrations: {
              where: {
                attended: true,
              },
            },
          },
        },
      },
      orderBy: {
        points: 'desc',
      },
      take: limit,
    });

    return NextResponse.json({ leaderboard: topVolunteers });
  } catch (error) {
    console.error('Get leaderboard error:', error);
    return NextResponse.json(
      { error: 'Failed to get leaderboard' },
      { status: 500 }
    );
  }
}
