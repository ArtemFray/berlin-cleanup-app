import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUserFromRequest, isAdmin, unauthorizedResponse, forbiddenResponse } from '@/lib/auth';
import { sendBulkNotifications } from '@/lib/push-notifications';

// POST /api/notifications/send - Send notification (admin only)
export async function POST(request: NextRequest) {
  try {
    const user = getUserFromRequest(request);

    if (!user) {
      return unauthorizedResponse();
    }

    if (!isAdmin(user)) {
      return forbiddenResponse('Only admins can send notifications');
    }

    const body = await request.json();
    const { title, message, type, eventId } = body;

    if (!title || !message || !type) {
      return NextResponse.json(
        { error: 'Title, message, and type are required' },
        { status: 400 }
      );
    }

    // Create notification
    const notification = await prisma.notification.create({
      data: {
        title,
        message,
        type,
        eventId: eventId || null,
      },
    });

    // Get target users
    let targetUserIds: string[] = [];

    if (type === 'EVENT_SPECIFIC' && eventId) {
      // Send to event participants
      const registrations = await prisma.eventRegistration.findMany({
        where: { eventId },
        select: { userId: true },
      });
      targetUserIds = registrations.map((r) => r.userId);
    } else if (type === 'GENERAL_ANNOUNCEMENT') {
      // Send to all users
      const allUsers = await prisma.user.findMany({
        select: { id: true },
      });
      targetUserIds = allUsers.map((u) => u.id);
    }

    // Create user notifications
    await prisma.userNotification.createMany({
      data: targetUserIds.map((userId) => ({
        userId,
        notificationId: notification.id,
      })),
    });

    // Get push subscriptions for target users
    const subscriptions = await prisma.pushSubscription.findMany({
      where: {
        userId: { in: targetUserIds },
      },
    });

    // Send push notifications
    if (subscriptions.length > 0) {
      const pushPayload = {
        title,
        body: message,
        icon: '/icons/icon-192x192.png',
        badge: '/icons/badge-72x72.png',
        data: {
          notificationId: notification.id,
          eventId: eventId || null,
        },
      };

      const pushSubscriptionData = subscriptions.map((sub) => ({
        endpoint: sub.endpoint,
        keys: {
          p256dh: sub.p256dh,
          auth: sub.auth,
        },
      }));

      const pushResults = await sendBulkNotifications(
        pushSubscriptionData,
        pushPayload
      );

      return NextResponse.json({
        notification,
        recipientCount: targetUserIds.length,
        pushResults,
      });
    }

    return NextResponse.json({
      notification,
      recipientCount: targetUserIds.length,
    });
  } catch (error) {
    console.error('Send notification error:', error);
    return NextResponse.json(
      { error: 'Failed to send notification' },
      { status: 500 }
    );
  }
}
