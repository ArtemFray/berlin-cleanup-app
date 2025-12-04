import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUserFromRequest, isAdmin, unauthorizedResponse, forbiddenResponse } from '@/lib/auth';

// GET /api/events - Get all events (public)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const upcoming = searchParams.get('upcoming');

    let where: any = {};

    if (status) {
      where.status = status;
    }

    if (upcoming === 'true') {
      where.startDateTime = {
        gte: new Date(),
      };
      where.status = 'UPCOMING';
    }

    const events = await prisma.event.findMany({
      where,
      include: {
        creator: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        _count: {
          select: {
            registrations: true,
          },
        },
      },
      orderBy: {
        startDateTime: 'asc',
      },
    });

    return NextResponse.json({ events });
  } catch (error) {
    console.error('Get events error:', error);
    return NextResponse.json(
      { error: 'Failed to get events' },
      { status: 500 }
    );
  }
}

// POST /api/events - Create event (admin only)
export async function POST(request: NextRequest) {
  try {
    const user = getUserFromRequest(request);

    if (!user) {
      return unauthorizedResponse();
    }

    if (!isAdmin(user)) {
      return forbiddenResponse('Only admins can create events');
    }

    const body = await request.json();
    const {
      title,
      description,
      location,
      latitude,
      longitude,
      startDateTime,
      endDateTime,
      maxParticipants,
      meetingPoint,
    } = body;

    // Validation
    if (!title || !description || !location || !latitude || !longitude || !startDateTime || !endDateTime || !meetingPoint) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Create event
    const event = await prisma.event.create({
      data: {
        title,
        description,
        location,
        latitude: parseFloat(latitude),
        longitude: parseFloat(longitude),
        startDateTime: new Date(startDateTime),
        endDateTime: new Date(endDateTime),
        maxParticipants: maxParticipants ? parseInt(maxParticipants) : null,
        meetingPoint,
        creatorId: user.userId,
      },
      include: {
        creator: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    return NextResponse.json({ event }, { status: 201 });
  } catch (error) {
    console.error('Create event error:', error);
    return NextResponse.json(
      { error: 'Failed to create event' },
      { status: 500 }
    );
  }
}
