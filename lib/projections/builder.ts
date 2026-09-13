import { unstable_cache } from 'next/cache';
import { prisma } from '@/lib/prisma';
import { getActiveTimelineStep } from '@/lib/event-time';
import { LiveTimelineProjection, PublicInviteProjection, LiveTimelineStep } from './types';
import { TimelineItem } from '@/lib/types';

/**
 * Builds the denormalized live timeline projection from primary database.
 */
async function computeLiveTimelineProjection(eventId: string): Promise<LiveTimelineProjection | null> {
  const ev = await prisma.event.findUnique({
    where: { id: eventId },
    include: {
      timeline: {
        orderBy: { offsetMinutes: 'asc' },
      },
      guests: {
        where: { rsvpStatus: 'yes' },
        select: { plusOnesActual: true },
      },
    },
  });

  if (!ev) return null;

  const confirmedCount = ev.guests.reduce((acc, g) => acc + 1 + g.plusOnesActual, 0);

  const formattedSteps: TimelineItem[] = ev.timeline.map(t => ({
    id: t.id,
    eventId: t.eventId,
    title: t.title,
    description: t.description || undefined,
    offsetMinutes: t.offsetMinutes,
    durationMinutes: t.durationMinutes,
    assigneeName: t.assigneeName || 'Host',
    isCompleted: t.isCompleted,
    orderIndex: t.order ?? 0,
  }));

  const now = new Date();
  const timelineStatus = getActiveTimelineStep(ev.date, ev.startTime, formattedSteps, now);

  // Map to clean, public-safe timeline steps
  const publicSteps: LiveTimelineStep[] = formattedSteps.map(s => ({
    id: s.id,
    title: s.title,
    offsetMinutes: s.offsetMinutes,
    durationMinutes: s.durationMinutes,
    isCompleted: s.isCompleted,
    description: s.description,
  }));

  const activeStep: LiveTimelineStep | null = timelineStatus.activeStep ? {
    id: timelineStatus.activeStep.id,
    title: timelineStatus.activeStep.title,
    offsetMinutes: timelineStatus.activeStep.offsetMinutes,
    durationMinutes: timelineStatus.activeStep.durationMinutes,
    isCompleted: timelineStatus.activeStep.isCompleted,
    description: timelineStatus.activeStep.description,
  } : null;

  const nextStep: LiveTimelineStep | null = timelineStatus.nextStep ? {
    id: timelineStatus.nextStep.id,
    title: timelineStatus.nextStep.title,
    offsetMinutes: timelineStatus.nextStep.offsetMinutes,
    durationMinutes: timelineStatus.nextStep.durationMinutes,
    isCompleted: timelineStatus.nextStep.isCompleted,
    description: timelineStatus.nextStep.description,
  } : null;

  let currentPhase: LiveTimelineProjection['currentPhase'] = 'upcoming';
  if (ev.status === 'completed') {
    currentPhase = 'aftermath';
  } else if (timelineStatus.status === 'in-progress') {
    currentPhase = 'active';
  } else if (timelineStatus.status === 'before-event') {
    currentPhase = timelineStatus.driftMinutes >= -30 ? 'doors_open' : 'upcoming';
  }

  return {
    eventId: ev.id,
    title: ev.title,
    date: ev.date,
    startTime: ev.startTime,
    endTime: ev.endTime,
    timezone: ev.timezone,
    currentPhase,
    humanDrift: timelineStatus.humanDrift,
    activeStep,
    nextStep,
    timelineSteps: publicSteps,
    completedCount: publicSteps.filter(s => s.isCompleted).length,
    totalSteps: publicSteps.length,
    confirmedCount,
    lastUpdated: new Date().toISOString(),
  };
}

/**
 * Builds the denormalized public invite projection from primary database.
 */
async function computePublicInviteProjection(tokenOrId: string): Promise<PublicInviteProjection | null> {
  const ev = await prisma.event.findFirst({
    where: {
      OR: [{ id: tokenOrId }, { inviteToken: tokenOrId }],
    },
    include: {
      guests: {
        where: { rsvpStatus: 'yes' },
        select: { plusOnesActual: true },
      },
    },
  });

  if (!ev) return null;

  const confirmedCount = ev.guests.reduce((acc, g) => acc + 1 + g.plusOnesActual, 0);

  return {
    id: ev.id,
    inviteToken: ev.inviteToken,
    title: ev.title,
    date: ev.date,
    startTime: ev.startTime,
    endTime: ev.endTime,
    timezone: ev.timezone,
    locationName: ev.isLocationTBD ? 'Location TBD' : (ev.locationName || 'Venue to be announced'),
    address: ev.isLocationTBD ? '' : (ev.address || ''),
    isTBD: ev.isLocationTBD,
    publicPurpose: ev.isPurposePrivate ? undefined : (ev.purposeStatement || ev.rawPurpose || undefined),
    themeColor: ev.themeColor || undefined,
    coverAssetUrl: ev.coverAssetUrl || undefined,
    capacity: ev.capacity,
    status: ev.status as any,
    confirmedCount,
    isClosed: ev.status === 'completed',
    lastUpdated: new Date().toISOString(),
  };
}

/**
 * Edge-cached retrieval for Live Timeline Projection with tag-based invalidation.
 */
export async function getLiveTimelineProjection(eventId: string): Promise<LiveTimelineProjection | null> {
  const cachedFn = unstable_cache(
    async (id: string) => computeLiveTimelineProjection(id),
    [`projection-timeline-${eventId}`],
    {
      revalidate: 15, // Fallback background revalidation every 15s
      tags: [`event-${eventId}-timeline`, `event-${eventId}`],
    }
  );

  return cachedFn(eventId);
}

/**
 * Edge-cached retrieval for Public Invite Projection with tag-based invalidation.
 */
export async function getPublicInviteProjection(tokenOrId: string): Promise<PublicInviteProjection | null> {
  const cachedFn = unstable_cache(
    async (key: string) => computePublicInviteProjection(key),
    [`projection-invite-${tokenOrId}`],
    {
      revalidate: 30, // Fallback background revalidation every 30s
      tags: [`event-${tokenOrId}-invite`, `event-${tokenOrId}`],
    }
  );

  return cachedFn(tokenOrId);
}
