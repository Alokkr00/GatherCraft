import { prisma } from '@/lib/prisma';
import { 
  PartyEvent, Guest, TimelineItem, TaskItem, 
  BudgetItem, ShoppingItem, PublicInviteView, RSVPStatus 
} from '@/lib/types';

// ==========================================
// PRISMA MODEL ADAPTERS
// ==========================================

function prismaToPartyEvent(ev: any): PartyEvent {
  return {
    id: ev.id,
    inviteToken: ev.inviteToken,
    title: ev.title,
    ownerId: ev.ownerId,
    coHostIds: ev.coHosts ? ev.coHosts.map((u: any) => u.id) : [],
    templateId: ev.templateId || undefined,
    status: ev.status as any,
    purpose: {
      rawInput: ev.rawPurpose || '',
      selectedStatement: ev.purposeStatement || ev.rawPurpose || '',
      suggestions: { warm: '', bold: '', minimal: '' },
      successCriteria: [],
      isPrivate: ev.isPurposePrivate || false,
    },
    date: ev.date,
    startTime: ev.startTime,
    endTime: ev.endTime,
    timezone: ev.timezone,
    location: {
      name: ev.locationName || undefined,
      address: ev.address || '',
      notes: ev.locationNotes || undefined,
      isTBD: ev.isLocationTBD,
    },
    capacity: ev.capacity,
    totalBudget: ev.totalBudget,
    currency: ev.currency,
    coverAssetUrl: ev.coverAssetUrl || undefined,
    themeColor: ev.themeColor || undefined,
    isClosed: ev.status === 'completed',
    retrospective: ev.retrospective
      ? {
          rating: ev.retrospective.rating || 5,
          whatWorked: ev.retrospective.whatWorked || '',
          whatToImprove: ev.retrospective.whatToImprove || '',
          completedAt: ev.retrospective.completedAt?.toISOString() || new Date().toISOString(),
          savedAsTemplate: false,
        }
      : undefined,
    createdAt: ev.createdAt instanceof Date ? ev.createdAt.toISOString() : ev.createdAt,
    updatedAt: ev.updatedAt instanceof Date ? ev.updatedAt.toISOString() : ev.updatedAt,
  };
}

function prismaToGuest(g: any): Guest {
  return {
    id: g.id,
    eventId: g.eventId,
    name: g.name,
    email: g.email || undefined,
    phone: g.phone || undefined,
    role: g.role as any,
    rsvpStatus: g.rsvpStatus as any,
    plusOnesAllowed: g.plusOnesAllowed,
    plusOnesActual: g.plusOnesActual,
    dietary: g.dietary || undefined,
    accessibility: g.accessibility || undefined,
    notes: g.notes || undefined,
    checkInAt: g.checkInAt ? (g.checkInAt instanceof Date ? g.checkInAt.toISOString() : g.checkInAt) : undefined,
    updatedAt: g.updatedAt instanceof Date ? g.updatedAt.toISOString() : g.updatedAt,
  };
}

function prismaToTimeline(t: any): TimelineItem {
  return {
    id: t.id,
    eventId: t.eventId,
    title: t.title,
    description: t.description || undefined,
    offsetMinutes: t.offsetMinutes,
    durationMinutes: t.durationMinutes,
    isCompleted: t.isCompleted,
    assigneeName: t.assigneeName || undefined,
    orderIndex: t.order ?? 0,
  };
}

function prismaToTask(t: any): TaskItem {
  return {
    id: t.id,
    eventId: t.eventId,
    title: t.title,
    category: (t.category as any) || 'General',
    priority: (t.priority as any) || 'medium',
    status: (t.status as any) || 'todo',
    updatedAt: t.updatedAt instanceof Date ? t.updatedAt.toISOString() : t.updatedAt,
  };
}

function prismaToBudget(b: any): BudgetItem {
  return {
    id: b.id,
    eventId: b.eventId,
    name: b.name,
    category: b.category || 'General',
    plannedAmount: b.plannedAmount,
    actualAmount: b.actualAmount ?? 0,
    notes: b.notes || undefined,
    updatedAt: b.updatedAt instanceof Date ? b.updatedAt.toISOString() : b.updatedAt,
  };
}

function prismaToShopping(s: any): ShoppingItem {
  return {
    id: s.id,
    eventId: s.eventId,
    name: s.name,
    category: s.category || 'General',
    quantity: String(s.quantity ?? 1),
    isPurchased: Boolean(s.isBought),
  };
}

async function ensureUserExists(userId: string) {
  await prisma.user.upsert({
    where: { id: userId },
    update: {},
    create: {
      id: userId,
      email: `${userId}@gathercraft.local`,
      name: 'Host',
    },
  });
}

// ==========================================
// EVENTS CRUD
// ==========================================

export async function getEventsServer(ownerId?: string): Promise<PartyEvent[]> {
  const where: any = {};
  if (ownerId && ownerId !== 'all') {
    where.OR = [
      { ownerId },
      { coHosts: { some: { id: ownerId } } }
    ];
  }

  const events = await prisma.event.findMany({
    where,
    include: {
      coHosts: true,
      retrospective: true,
    },
    orderBy: { createdAt: 'desc' },
  });

  return events.map(prismaToPartyEvent);
}

export async function getEventByIdServer(idOrToken: string): Promise<PartyEvent | null> {
  const ev = await prisma.event.findFirst({
    where: {
      OR: [{ id: idOrToken }, { inviteToken: idOrToken }],
    },
    include: {
      coHosts: true,
      retrospective: true,
    },
  });

  return ev ? prismaToPartyEvent(ev) : null;
}

export async function getPublicInviteServer(tokenOrId: string): Promise<PublicInviteView | null> {
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
  };
}

export async function saveEventServer(eventData: Partial<PartyEvent> & { title: string }): Promise<PartyEvent> {
  const ownerId = eventData.ownerId || 'host-1';
  await ensureUserExists(ownerId);

  const id = eventData.id || `ev_${crypto.randomUUID()}`;
  const inviteToken = eventData.inviteToken || crypto.randomUUID().replace(/-/g, '');

  const data: any = {
    title: eventData.title,
    templateId: eventData.templateId || null,
    status: eventData.status || 'planning',
    rawPurpose: eventData.purpose?.rawInput || null,
    purposeStatement: eventData.purpose?.selectedStatement || null,
    isPurposePrivate: eventData.purpose?.isPrivate || false,
    date: eventData.date || new Date().toISOString().split('T')[0],
    startTime: eventData.startTime || '18:00',
    endTime: eventData.endTime || '21:00',
    timezone: eventData.timezone || 'UTC',
    locationName: eventData.location?.name || null,
    address: eventData.location?.address || '',
    locationNotes: eventData.location?.notes || null,
    isLocationTBD: eventData.location?.isTBD || false,
    capacity: eventData.capacity || 20,
    totalBudget: eventData.totalBudget || 0,
    currency: eventData.currency || 'USD',
    coverAssetUrl: eventData.coverAssetUrl || null,
    themeColor: eventData.themeColor || null,
  };

  const saved = await prisma.event.upsert({
    where: { id },
    update: data,
    create: {
      ...data,
      id,
      inviteToken,
      ownerId,
    },
    include: {
      coHosts: true,
      retrospective: true,
    },
  });

  return prismaToPartyEvent(saved);
}

export async function deleteEventServer(id: string): Promise<boolean> {
  try {
    await prisma.event.delete({ where: { id } });
    return true;
  } catch {
    return false;
  }
}

// ==========================================
// GUESTS & RSVP CRUD
// ==========================================

export async function getGuestsServer(eventId?: string): Promise<Guest[]> {
  const guests = await prisma.guest.findMany({
    where: eventId ? { eventId } : undefined,
    orderBy: { name: 'asc' },
  });
  return guests.map(prismaToGuest);
}

export async function saveGuestServer(guestData: Partial<Guest> & { eventId: string; name: string }): Promise<Guest> {
  const trimmedName = guestData.name.trim();
  const trimmedEmail = guestData.email?.trim().toLowerCase() || null;

  // Find existing guest by ID or (eventId + email) or (eventId + name)
  let existing = null;
  if (guestData.id) {
    existing = await prisma.guest.findUnique({ where: { id: guestData.id } });
  }

  if (!existing) {
    existing = await prisma.guest.findFirst({
      where: {
        eventId: guestData.eventId,
        OR: [
          ...(trimmedEmail ? [{ email: trimmedEmail }] : []),
          { name: trimmedName },
        ],
      },
    });
  }

  const payload: any = {
    name: trimmedName,
    email: trimmedEmail,
    phone: guestData.phone?.trim() || null,
    role: guestData.role || 'guest',
    rsvpStatus: guestData.rsvpStatus || 'yes',
    plusOnesAllowed: guestData.plusOnesAllowed || 0,
    plusOnesActual: guestData.plusOnesActual || 0,
    dietary: guestData.dietary?.trim() || null,
    accessibility: guestData.accessibility?.trim() || null,
    notes: guestData.notes || null,
    checkInAt: guestData.checkInAt ? new Date(guestData.checkInAt) : null,
  };

  let saved;
  if (existing) {
    saved = await prisma.guest.update({
      where: { id: existing.id },
      data: payload,
    });
  } else {
    saved = await prisma.guest.create({
      data: {
        ...payload,
        id: guestData.id || `gst_${crypto.randomUUID()}`,
        eventId: guestData.eventId,
      },
    });
  }

  return prismaToGuest(saved);
}

export async function deleteGuestServer(id: string): Promise<boolean> {
  try {
    await prisma.guest.delete({ where: { id } });
    return true;
  } catch {
    return false;
  }
}

export async function submitRsvpServer(params: {
  eventIdOrToken: string;
  name: string;
  email?: string;
  phone?: string;
  rsvpStatus: RSVPStatus;
  plusOnesActual?: number;
  dietary?: string;
  accessibility?: string;
}): Promise<{ success: boolean; guest?: Guest; waitlisted?: boolean; error?: string }> {
  try {
    const ev = await prisma.event.findFirst({
      where: {
        OR: [{ id: params.eventIdOrToken }, { inviteToken: params.eventIdOrToken }],
      },
    });

    if (!ev) {
      return { success: false, error: 'Event not found' };
    }

    const plusOnes = Math.max(0, Math.min(5, Number(params.plusOnesActual) || 0));
    let status = params.rsvpStatus;
    let waitlisted = false;

    const result = await prisma.$transaction(async (tx) => {
      const trimmedEmail = params.email?.trim().toLowerCase();
      const existing = await tx.guest.findFirst({
        where: {
          eventId: ev.id,
          OR: [
            ...(trimmedEmail ? [{ email: trimmedEmail }] : []),
            { name: params.name.trim() },
          ],
        },
      });

      // Atomic capacity check
      if (status === 'yes' && ev.capacity > 0) {
        const confirmedGuests = await tx.guest.findMany({
          where: {
            eventId: ev.id,
            rsvpStatus: 'yes',
            ...(existing ? { NOT: { id: existing.id } } : {}),
          },
        });
        const currentCount = confirmedGuests.reduce((acc, g) => acc + 1 + g.plusOnesActual, 0);

        if (currentCount + 1 + plusOnes > ev.capacity) {
          status = 'waitlist';
          waitlisted = true;
        }
      }

      const guestData = {
        name: params.name.trim(),
        email: trimmedEmail || null,
        phone: params.phone?.trim() || null,
        role: existing?.role || 'guest',
        rsvpStatus: status,
        plusOnesAllowed: existing?.plusOnesAllowed || plusOnes,
        plusOnesActual: plusOnes,
        dietary: params.dietary?.trim() || null,
        accessibility: params.accessibility?.trim() || null,
      };

      if (existing) {
        return await tx.guest.update({
          where: { id: existing.id },
          data: guestData,
        });
      } else {
        return await tx.guest.create({
          data: {
            ...guestData,
            id: `gst_${crypto.randomUUID()}`,
            eventId: ev.id,
          },
        });
      }
    });

    return { success: true, guest: prismaToGuest(result), waitlisted };
  } catch (err: any) {
    console.error('Prisma submitRsvpServer error:', err);
    return { success: false, error: err.message || 'Failed to submit RSVP' };
  }
}

// ==========================================
// TIMELINE CRUD
// ==========================================

export async function getTimelineItemsServer(eventId?: string): Promise<TimelineItem[]> {
  const items = await prisma.timelineItem.findMany({
    where: eventId ? { eventId } : undefined,
    orderBy: { offsetMinutes: 'asc' },
  });
  return items.map(prismaToTimeline);
}

export async function saveTimelineItemServer(itemData: Partial<TimelineItem> & { eventId: string; title: string }): Promise<TimelineItem> {
  const id = itemData.id || `time_${crypto.randomUUID()}`;
  const payload: any = {
    title: itemData.title,
    description: itemData.description || null,
    offsetMinutes: itemData.offsetMinutes || 0,
    durationMinutes: itemData.durationMinutes || 30,
    isCompleted: itemData.isCompleted || false,
    assigneeName: itemData.assigneeName || null,
    order: (itemData as any).orderIndex ?? (itemData as any).order ?? 0,
  };

  const saved = await prisma.timelineItem.upsert({
    where: { id },
    update: payload,
    create: {
      ...payload,
      id,
      eventId: itemData.eventId,
    },
  });

  return prismaToTimeline(saved);
}

export async function deleteTimelineItemServer(id: string): Promise<boolean> {
  try {
    await prisma.timelineItem.delete({ where: { id } });
    return true;
  } catch {
    return false;
  }
}

// ==========================================
// TASKS CRUD
// ==========================================

export async function getTasksServer(eventId?: string): Promise<TaskItem[]> {
  const tasks = await prisma.task.findMany({
    where: eventId ? { eventId } : undefined,
    orderBy: { updatedAt: 'desc' },
  });
  return tasks.map(prismaToTask);
}

export async function saveTaskServer(taskData: Partial<TaskItem> & { eventId: string; title: string }): Promise<TaskItem> {
  const id = taskData.id || `tk_${crypto.randomUUID()}`;
  const payload: any = {
    title: taskData.title,
    category: taskData.category || 'General',
    priority: taskData.priority || 'medium',
    status: taskData.status || 'todo',
  };

  const saved = await prisma.task.upsert({
    where: { id },
    update: payload,
    create: {
      ...payload,
      id,
      eventId: taskData.eventId,
    },
  });

  return prismaToTask(saved);
}

export async function deleteTaskServer(id: string): Promise<boolean> {
  try {
    await prisma.task.delete({ where: { id } });
    return true;
  } catch {
    return false;
  }
}

// ==========================================
// BUDGET CRUD
// ==========================================

export async function getBudgetItemsServer(eventId?: string): Promise<BudgetItem[]> {
  const items = await prisma.budgetItem.findMany({
    where: eventId ? { eventId } : undefined,
    orderBy: { updatedAt: 'desc' },
  });
  return items.map(prismaToBudget);
}

export async function saveBudgetItemServer(itemData: Partial<BudgetItem> & { eventId: string; name: string }): Promise<BudgetItem> {
  const id = itemData.id || `bud_${crypto.randomUUID()}`;
  const payload: any = {
    name: itemData.name,
    category: itemData.category || 'General',
    plannedAmount: itemData.plannedAmount || 0,
    actualAmount: itemData.actualAmount || null,
    notes: itemData.notes || null,
  };

  const saved = await prisma.budgetItem.upsert({
    where: { id },
    update: payload,
    create: {
      ...payload,
      id,
      eventId: itemData.eventId,
    },
  });

  return prismaToBudget(saved);
}

export async function deleteBudgetItemServer(id: string): Promise<boolean> {
  try {
    await prisma.budgetItem.delete({ where: { id } });
    return true;
  } catch {
    return false;
  }
}

// ==========================================
// SHOPPING CRUD
// ==========================================

export async function getShoppingItemsServer(eventId?: string): Promise<ShoppingItem[]> {
  const items = await prisma.shoppingItem.findMany({
    where: eventId ? { eventId } : undefined,
  });
  return items.map(prismaToShopping);
}

export async function saveShoppingItemServer(itemData: Partial<ShoppingItem> & { eventId: string; name: string }): Promise<ShoppingItem> {
  const id = itemData.id || `shop_${crypto.randomUUID()}`;
  const payload: any = {
    name: itemData.name,
    quantity: typeof itemData.quantity === 'number' ? itemData.quantity : (parseInt(String(itemData.quantity), 10) || 1),
    category: itemData.category || 'General',
    isBought: Boolean((itemData as any).isPurchased ?? (itemData as any).isBought ?? false),
  };

  const saved = await prisma.shoppingItem.upsert({
    where: { id },
    update: payload,
    create: {
      ...payload,
      id,
      eventId: itemData.eventId,
    },
  });

  return prismaToShopping(saved);
}

export async function deleteShoppingItemServer(id: string): Promise<boolean> {
  try {
    await prisma.shoppingItem.delete({ where: { id } });
    return true;
  } catch {
    return false;
  }
}
