import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUserFromRequest, isAdmin, unauthorizedResponse, forbiddenResponse } from '@/lib/auth';
import { calculateEventPoints, awardPoints } from '@/lib/points';

// POST /api/events/[id]/attendance - Mark attendance (admin only)
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = getUserFromRequest(request);

    if (!user) {
      return unauthorizedResponse();
    }

    if (!isAdmin(user)) {
      return forbiddenResponse('Only admins can mark attendance');
    }

    const body = await request.json();
    const { userId, attended, hoursWorked, trashCollected } = body;

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    // Get event
    const event = await prisma.event.findUnique({
      where: { id: params.id },
    });

    if (!event) {
      return NextResponse.json(
        { error: 'Event not found' },
        { status: 404 }
      );
    }

    // Update registration
    const registration = await prisma.eventRegistration.update({
      where: {
        userId_eventId: {
          userId,
          eventId: params.id,
        },
      },
      data: {
        attended,
        hoursWorked: hoursWorked ? parseFloat(hoursWorked) : null,
        trashCollected: trashCollected ? parseInt(trashCollected) : null,
      },
    });

    // Calculate and award points if attended
    if (attended) {
      const points = calculateEventPoints(
        attended,
        registration.hoursWorked,
        registration.trashCollected
      );

      await awardPoints(
        prisma,
        userId,
        points,
        `Attended event: ${event.title}`,
        params.id
      );
    }

    return NextResponse.json({ registration });
  } catch (error) {
    console.error('Mark attendance error:', error);
    return NextResponse.json(
      { error: 'Failed to mark attendance' },
      { status: 500 }
    );
  }
}
