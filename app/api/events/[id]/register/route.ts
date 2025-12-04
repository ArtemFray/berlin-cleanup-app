import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUserFromRequest, unauthorizedResponse } from '@/lib/auth';
import { awardPoints, POINTS } from '@/lib/points';

// POST /api/events/[id]/register - Register for event
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = getUserFromRequest(request);

    if (!user) {
      return unauthorizedResponse();
    }

    // Check if event exists
    const event = await prisma.event.findUnique({
      where: { id: params.id },
      include: {
        _count: {
          select: {
            registrations: true,
          },
        },
      },
    });

    if (!event) {
      return NextResponse.json(
        { error: 'Event not found' },
        { status: 404 }
      );
    }

    // Check if event is full
    if (event.maxParticipants && event._count.registrations >= event.maxParticipants) {
      return NextResponse.json(
        { error: 'Event is full' },
        { status: 400 }
      );
    }

    // Check if already registered
    const existingRegistration = await prisma.eventRegistration.findUnique({
      where: {
        userId_eventId: {
          userId: user.userId,
          eventId: params.id,
        },
      },
    });

    if (existingRegistration) {
      return NextResponse.json(
        { error: 'Already registered for this event' },
        { status: 400 }
      );
    }

    // Create registration
    const registration = await prisma.eventRegistration.create({
      data: {
        userId: user.userId,
        eventId: params.id,
      },
      include: {
        event: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    // Award points for registration
    await awardPoints(
      prisma,
      user.userId,
      POINTS.REGISTER_EVENT,
      `Registered for event: ${event.title}`,
      params.id
    );

    return NextResponse.json({ registration }, { status: 201 });
  } catch (error) {
    console.error('Register for event error:', error);
    return NextResponse.json(
      { error: 'Failed to register for event' },
      { status: 500 }
    );
  }
}

// DELETE /api/events/[id]/register - Unregister from event
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = getUserFromRequest(request);

    if (!user) {
      return unauthorizedResponse();
    }

    // Delete registration
    await prisma.eventRegistration.delete({
      where: {
        userId_eventId: {
          userId: user.userId,
          eventId: params.id,
        },
      },
    });

    // Remove registration points
    await prisma.user.update({
      where: { id: user.userId },
      data: { points: { decrement: POINTS.REGISTER_EVENT } },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Unregister from event error:', error);
    return NextResponse.json(
      { error: 'Failed to unregister from event' },
      { status: 500 }
    );
  }
}
