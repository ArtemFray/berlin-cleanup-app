// Gamification points system

export const POINTS = {
  REGISTER_EVENT: 10,
  ATTEND_EVENT: 50,
  TRASH_PER_KG: 5,
  HOUR_WORKED: 20,
} as const;

export function calculateEventPoints(
  attended: boolean,
  hoursWorked?: number | null,
  trashCollected?: number | null
): number {
  if (!attended) return 0;

  let points = POINTS.ATTEND_EVENT;

  if (hoursWorked) {
    points += Math.floor(hoursWorked * POINTS.HOUR_WORKED);
  }

  if (trashCollected) {
    points += Math.floor(trashCollected * POINTS.TRASH_PER_KG);
  }

  return points;
}

export async function awardPoints(
  prisma: any,
  userId: string,
  points: number,
  reason: string,
  eventId?: string
) {
  // Add points to user
  await prisma.user.update({
    where: { id: userId },
    data: { points: { increment: points } },
  });

  // Create point history record
  await prisma.pointHistory.create({
    data: {
      userId,
      points,
      reason,
      eventId,
    },
  });
}
