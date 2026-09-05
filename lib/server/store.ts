import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { 
  PartyEvent, Guest, TimelineItem, TaskItem, BudgetItem, ShoppingItem, 
  PublicInviteView, RSVPStatus 
} from '@/lib/types';
import { STARTER_TEMPLATES } from '@/lib/templates';
import { getStorageFilePath, atomicWriteJsonSync, safeReadJsonSync } from '@/lib/server/paths';

interface ServerDbSchema {
  events: PartyEvent[];
  guests: Guest[];
  timeline: TimelineItem[];
  tasks: TaskItem[];
  budget: BudgetItem[];
  shopping: ShoppingItem[];
}

const DB_FILENAME = 'gathercraft.json';

// In-memory cache for ultra-fast queries across requests
let memoryCache: ServerDbSchema | null = null;

const INITIAL_SAMPLE_EVENTS: PartyEvent[] = [
  {
    id: 'sample-cocktail-party',
    inviteToken: 'sample-cocktail-party',
    title: 'Friday Sunset Cocktails & Bites',
    ownerId: 'host-1',
    templateId: 'cocktail-party',
    status: 'planning',
    purpose: {
      rawInput: 'Host a fun cocktail gathering to introduce friends from different circles.',
      selectedStatement: 'To bring together 15 friends from tech, design, and music for high-energy conversations, introducing people who should know each other.',
      suggestions: {
        warm: 'To create a cozy evening where old and new friends naturally connect over artisan drinks.',
        bold: 'To host a fast-paced, high-impact mixer designed to spark new friendships and collaborations.',
        minimal: 'To gather good people for great drinks and meaningful introductions.'
      },
      successCriteria: [
        'Guests meet at least 3 people they did not know before',
        'Enforce hard end time so everyone leaves energized',
        'Serve signature house cocktail + non-alcoholic alternative'
      ],
      isPrivate: false
    },
    date: new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
    startTime: '18:30',
    endTime: '20:30',
    timezone: 'America/Los_Angeles',
    location: {
      address: '742 Evergreen Terrace, San Francisco, CA',
      name: 'Host Penthouse Terrace',
      notes: 'Ring bell #4B. Elevator to top floor.',
      isTBD: false
    },
    capacity: 16,
    totalBudget: 200,
    currency: 'USD',
    coverAssetUrl: STARTER_TEMPLATES[0].coverImage,
    themeColor: STARTER_TEMPLATES[0].themeColor,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'sample-birthday-dinner',
    inviteToken: 'sample-birthday-dinner',
    title: "Maya's 30th Milestone Birthday Dinner",
    ownerId: 'host-1',
    templateId: 'birthday-dinner',
    status: 'completed',
    purpose: {
      rawInput: 'Celebrate Maya turning 30 with intimate storytelling and great food.',
      selectedStatement: "To honor Maya's 30th birthday with 10 close friends sharing personal stories, gratitude, and a gourmet 3-course dinner.",
      suggestions: {
        warm: "To gather Maya's inner circle for a memorable feast filled with heartfelt toasts.",
        bold: "To mark Maya's 30th milestone with an unforgettable dinner party and surprise guest tributes.",
        minimal: "To celebrate Maya turning 30 with good food and great stories."
      },
      successCriteria: [
        'Every guest shares one favorite memory or tribute during dessert',
        '3-course meal served family style',
        'Capture high-quality group photo before departure'
      ],
      isPrivate: false
    },
    date: new Date(Date.now() - 3 * 86400000).toISOString().split('T')[0],
    startTime: '19:00',
    endTime: '22:00',
    timezone: 'America/Los_Angeles',
    location: {
      address: '1288 Mission St, San Francisco, CA',
      name: 'Private Dining Room - Osteria Bella',
      notes: 'Reservation under Maya Lin.',
      isTBD: false
    },
    capacity: 12,
    totalBudget: 450,
    currency: 'USD',
    coverAssetUrl: STARTER_TEMPLATES[1].coverImage,
    themeColor: STARTER_TEMPLATES[1].themeColor,
    isClosed: true,
    retrospective: {
      rating: 5,
      whatWorked: 'The toast round during dessert was incredible — everyone shared heartfelt memories. Food was served right on time.',
      whatToImprove: 'Set up background music playlist earlier before guests arrive.',
      completedAt: new Date(Date.now() - 3 * 86400000).toISOString(),
      savedAsTemplate: true
    },
    createdAt: new Date(Date.now() - 10 * 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 3 * 86400000).toISOString()
  }
];

const INITIAL_SAMPLE_GUESTS: Guest[] = [
  {
    id: 'guest-1',
    eventId: 'sample-cocktail-party',
    name: 'Alex Rivera',
    email: 'alex@example.com',
    phone: '+1 415-555-0192',
    role: 'co-host',
    rsvpStatus: 'yes',
    plusOnesAllowed: 1,
    plusOnesActual: 1,
    dietary: 'Vegetarian',
    notes: 'Bringing signature mezcal bottle',
    checkInAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'guest-2',
    eventId: 'sample-cocktail-party',
    name: 'Sarah Chen',
    email: 'sarah.c@example.com',
    role: 'guest',
    rsvpStatus: 'yes',
    plusOnesAllowed: 0,
    plusOnesActual: 0,
    dietary: 'Gluten-Free',
    notes: 'Introduced by Alex',
    updatedAt: new Date().toISOString()
  },
  {
    id: 'guest-3',
    eventId: 'sample-cocktail-party',
    name: 'Marcus Vance',
    email: 'marcus@example.com',
    role: 'guest',
    rsvpStatus: 'maybe',
    plusOnesAllowed: 1,
    plusOnesActual: 0,
    dietary: 'None',
    updatedAt: new Date().toISOString()
  },
  {
    id: 'guest-4',
    eventId: 'sample-cocktail-party',
    name: 'Elena Rostova',
    email: 'elena@example.com',
    role: 'guest',
    rsvpStatus: 'no',
    plusOnesAllowed: 0,
    plusOnesActual: 0,
    dietary: 'Nut allergy',
    updatedAt: new Date().toISOString()
  }
];

function deduplicateGuestList(guests: Guest[]): Guest[] {
  if (!Array.isArray(guests)) return [];
  const map = new Map<string, Guest>();
  for (const g of guests) {
    // Unique key: eventId + (email || name)
    const key = `${g.eventId}_${(g.email || g.name || '').toLowerCase().trim()}`;
    if (!map.has(key)) {
      map.set(key, g);
    } else {
      const existing = map.get(key)!;
      map.set(key, {
        ...existing,
        ...g,
        id: existing.id,
        updatedAt: g.updatedAt || existing.updatedAt
      });
    }
  }
  return Array.from(map.values());
}

function initDb(): ServerDbSchema {
  if (memoryCache) return memoryCache;

  const defaultSeed: ServerDbSchema = {
    events: INITIAL_SAMPLE_EVENTS,
    guests: INITIAL_SAMPLE_GUESTS,
    timeline: [],
    tasks: [],
    budget: [],
    shopping: []
  };

  try {
    const dbPath = getStorageFilePath(DB_FILENAME);
    const parsed = safeReadJsonSync<ServerDbSchema>(dbPath, defaultSeed);
    if (parsed && Array.isArray(parsed.events)) {
      parsed.guests = deduplicateGuestList(parsed.guests || []);
      memoryCache = parsed;
      persistDb();
      return memoryCache;
    }
  } catch (err) {
    console.warn('Server file db initialization warning:', err);
  }

  memoryCache = defaultSeed;
  persistDb();
  return memoryCache;
}

function persistDb() {
  if (!memoryCache) return;
  try {
    const dbPath = getStorageFilePath(DB_FILENAME);
    atomicWriteJsonSync(dbPath, memoryCache);
  } catch (err) {
    console.warn('Server file db write warning:', err);
  }
}

// --- EVENTS ---
export async function getEventsServer(ownerId?: string): Promise<PartyEvent[]> {
  const db = initDb();
  if (ownerId && ownerId !== 'all') {
    return db.events.filter(e => e.ownerId === ownerId || e.coHostIds?.includes(ownerId));
  }
  return db.events;
}

export async function getEventByIdServer(idOrToken: string): Promise<PartyEvent | null> {
  const db = initDb();
  const ev = db.events.find(e => e.id === idOrToken || e.inviteToken === idOrToken);
  return ev || null;
}

export async function getPublicInviteServer(tokenOrId: string): Promise<PublicInviteView | null> {
  const ev = await getEventByIdServer(tokenOrId);
  if (!ev) return null;

  const db = initDb();
  const confirmedGuests = db.guests.filter(g => g.eventId === ev.id && g.rsvpStatus === 'yes');
  const confirmedCount = confirmedGuests.reduce((acc, g) => acc + 1 + (g.plusOnesActual || 0), 0);

  return {
    id: ev.id,
    inviteToken: ev.inviteToken || ev.id,
    title: ev.title,
    date: ev.date,
    startTime: ev.startTime,
    endTime: ev.endTime,
    timezone: ev.timezone,
    locationName: ev.location.isTBD ? 'Location TBD' : (ev.location.name || 'Venue to be announced'),
    address: ev.location.isTBD ? '' : (ev.location.address || ''),
    isTBD: ev.location.isTBD,
    publicPurpose: ev.purpose.isPrivate ? undefined : ev.purpose.selectedStatement,
    themeColor: ev.themeColor,
    coverAssetUrl: ev.coverAssetUrl,
    capacity: ev.capacity,
    status: ev.status,
    confirmedCount
  };
}

export async function saveEventServer(eventData: Partial<PartyEvent> & { title: string }): Promise<PartyEvent> {
  const db = initDb();
  const now = new Date().toISOString();
  
  let event: PartyEvent;
  const existingIndex = eventData.id ? db.events.findIndex(e => e.id === eventData.id) : -1;

  if (existingIndex >= 0) {
    event = {
      ...db.events[existingIndex],
      ...eventData,
      updatedAt: now
    };
    db.events[existingIndex] = event;
  } else {
    const id = eventData.id || `ev_${crypto.randomUUID()}`;
    const inviteToken = eventData.inviteToken || crypto.randomUUID().replace(/-/g, '');

    event = {
      id,
      inviteToken,
      title: eventData.title,
      ownerId: eventData.ownerId || `host_${crypto.randomUUID()}`,
      coHostIds: eventData.coHostIds || [],
      templateId: eventData.templateId,
      status: eventData.status || 'planning',
      purpose: eventData.purpose || {
        rawInput: '',
        selectedStatement: '',
        isPrivate: false
      },
      date: eventData.date || new Date().toISOString().split('T')[0],
      startTime: eventData.startTime || '18:00',
      endTime: eventData.endTime || '21:00',
      timezone: eventData.timezone || 'UTC',
      location: eventData.location || { address: '', isTBD: true },
      capacity: eventData.capacity || 20,
      totalBudget: eventData.totalBudget || 0,
      currency: eventData.currency || 'USD',
      coverAssetUrl: eventData.coverAssetUrl,
      themeColor: eventData.themeColor,
      createdAt: eventData.createdAt || now,
      updatedAt: now
    };
    db.events.unshift(event);
  }

  persistDb();
  return event;
}

export async function deleteEventServer(id: string): Promise<boolean> {
  const db = initDb();
  const beforeLen = db.events.length;
  db.events = db.events.filter(e => e.id !== id);
  
  if (db.events.length !== beforeLen) {
    // Cascade deletions
    db.guests = db.guests.filter(g => g.eventId !== id);
    db.timeline = db.timeline.filter(t => t.eventId !== id);
    db.tasks = db.tasks.filter(t => t.eventId !== id);
    db.budget = db.budget.filter(b => b.eventId !== id);
    db.shopping = db.shopping.filter(s => s.eventId !== id);
    persistDb();
    return true;
  }
  return false;
}

// --- GUESTS & RSVP ---
export async function getGuestsServer(eventId?: string): Promise<Guest[]> {
  const db = initDb();
  return eventId ? db.guests.filter(g => g.eventId === eventId) : db.guests;
}

export async function saveGuestServer(guestData: Partial<Guest> & { eventId: string; name: string }): Promise<Guest> {
  const db = initDb();
  const now = new Date().toISOString();
  const trimmedName = guestData.name.trim().toLowerCase();
  const trimmedEmail = guestData.email?.trim().toLowerCase();

  const existingIndex = db.guests.findIndex(g => 
    g.eventId === guestData.eventId && (
      (guestData.id && g.id === guestData.id) ||
      (trimmedEmail && g.email && g.email.toLowerCase() === trimmedEmail) ||
      (g.name.toLowerCase() === trimmedName)
    )
  );

  let guest: Guest;
  if (existingIndex >= 0) {
    guest = {
      ...db.guests[existingIndex],
      ...guestData,
      updatedAt: now
    };
    db.guests[existingIndex] = guest;
  } else {
    guest = {
      id: guestData.id || `gst_${crypto.randomUUID()}`,
      eventId: guestData.eventId,
      name: guestData.name.trim(),
      email: guestData.email?.trim(),
      phone: guestData.phone?.trim(),
      role: guestData.role || 'guest',
      rsvpStatus: guestData.rsvpStatus || 'yes',
      plusOnesAllowed: guestData.plusOnesAllowed || 0,
      plusOnesActual: guestData.plusOnesActual || 0,
      dietary: guestData.dietary?.trim(),
      accessibility: guestData.accessibility?.trim(),
      notes: guestData.notes,
      checkInAt: guestData.checkInAt,
      updatedAt: now
    };
    db.guests.push(guest);
  }

  persistDb();
  return guest;
}

export async function deleteGuestServer(id: string): Promise<boolean> {
  const db = initDb();
  const initialLen = db.guests.length;
  db.guests = db.guests.filter(g => g.id !== id);
  if (db.guests.length !== initialLen) {
    persistDb();
    return true;
  }
  return false;
}

const eventLocks = new Map<string, Promise<any>>();

export async function runWithEventLock<T>(eventId: string, fn: () => Promise<T>): Promise<T> {
  const currentLock = eventLocks.get(eventId) || Promise.resolve();
  let releaseLock: () => void;
  const nextLock = new Promise<void>((resolve) => {
    releaseLock = resolve;
  });
  
  eventLocks.set(eventId, nextLock);

  try {
    await currentLock;
    return await fn();
  } finally {
    releaseLock!();
    if (eventLocks.get(eventId) === nextLock) {
      eventLocks.delete(eventId);
    }
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
  const ev = await getEventByIdServer(params.eventIdOrToken);
  if (!ev) {
    return { success: false, error: 'Event not found' };
  }

  return runWithEventLock(ev.id, async () => {
    const db = initDb();
    const existingGuest = db.guests.find(
      g => g.eventId === ev.id && (
        (params.email && g.email?.toLowerCase() === params.email.toLowerCase()) ||
        g.name.toLowerCase() === params.name.trim().toLowerCase()
      )
    );

  const plusOnes = Math.max(0, Math.min(5, Number(params.plusOnesActual) || 0));
  let status = params.rsvpStatus;
  let waitlisted = false;

  // Capacity check
  if (status === 'yes' && ev.capacity && ev.capacity > 0) {
    const currentConfirmed = db.guests
      .filter(g => g.eventId === ev.id && g.rsvpStatus === 'yes' && g.id !== existingGuest?.id)
      .reduce((sum, g) => sum + 1 + (g.plusOnesActual || 0), 0);

    if (currentConfirmed + 1 + plusOnes > ev.capacity) {
      status = 'waitlist';
      waitlisted = true;
    }
  }

  const saved = await saveGuestServer({
    id: existingGuest?.id,
    eventId: ev.id,
    name: params.name.trim(),
    email: params.email?.trim() || undefined,
    phone: params.phone?.trim() || undefined,
    role: existingGuest?.role || 'guest',
    rsvpStatus: status,
    plusOnesAllowed: existingGuest?.plusOnesAllowed || plusOnes,
    plusOnesActual: plusOnes,
    dietary: params.dietary?.trim() || undefined,
    accessibility: params.accessibility?.trim() || undefined
  });

    return { success: true, guest: saved, waitlisted };
  });
}

// --- TIMELINE ---
export async function getTimelineItemsServer(eventId?: string): Promise<TimelineItem[]> {
  const db = initDb();
  return eventId ? db.timeline.filter(t => t.eventId === eventId) : db.timeline;
}

export async function saveTimelineItemServer(itemData: Partial<TimelineItem> & { eventId: string; title: string }): Promise<TimelineItem> {
  const db = initDb();
  const existingIndex = itemData.id ? db.timeline.findIndex(t => t.id === itemData.id) : -1;
  let item: TimelineItem;

  if (existingIndex >= 0) {
    item = { ...db.timeline[existingIndex], ...itemData };
    db.timeline[existingIndex] = item;
  } else {
    item = {
      id: itemData.id || `tl_${crypto.randomUUID()}`,
      eventId: itemData.eventId,
      title: itemData.title,
      description: itemData.description,
      offsetMinutes: itemData.offsetMinutes || 0,
      durationMinutes: itemData.durationMinutes || 30,
      assigneeName: itemData.assigneeName,
      isCompleted: itemData.isCompleted || false,
      orderIndex: itemData.orderIndex || db.timeline.length
    };
    db.timeline.push(item);
  }
  persistDb();
  return item;
}

export async function deleteTimelineItemServer(id: string): Promise<boolean> {
  const db = initDb();
  const len = db.timeline.length;
  db.timeline = db.timeline.filter(t => t.id !== id);
  if (db.timeline.length !== len) {
    persistDb();
    return true;
  }
  return false;
}

// --- TASKS ---
export async function getTasksServer(eventId?: string): Promise<TaskItem[]> {
  const db = initDb();
  return eventId ? db.tasks.filter(t => t.eventId === eventId) : db.tasks;
}

export async function saveTaskServer(taskData: Partial<TaskItem> & { eventId: string; title: string }): Promise<TaskItem> {
  const db = initDb();
  const now = new Date().toISOString();
  const existingIndex = taskData.id ? db.tasks.findIndex(t => t.id === taskData.id) : -1;
  let task: TaskItem;

  if (existingIndex >= 0) {
    task = { ...db.tasks[existingIndex], ...taskData, updatedAt: now };
    db.tasks[existingIndex] = task;
  } else {
    task = {
      id: taskData.id || `tk_${crypto.randomUUID()}`,
      eventId: taskData.eventId,
      title: taskData.title,
      description: taskData.description,
      category: taskData.category || 'Setup',
      assigneeName: taskData.assigneeName,
      dueDate: taskData.dueDate,
      priority: taskData.priority || 'medium',
      status: taskData.status || 'todo',
      linkedBudgetItemId: taskData.linkedBudgetItemId,
      updatedAt: now
    };
    db.tasks.push(task);
  }
  persistDb();
  return task;
}

export async function deleteTaskServer(id: string): Promise<boolean> {
  const db = initDb();
  const len = db.tasks.length;
  db.tasks = db.tasks.filter(t => t.id !== id);
  if (db.tasks.length !== len) {
    persistDb();
    return true;
  }
  return false;
}

// --- BUDGET ---
export async function getBudgetItemsServer(eventId?: string): Promise<BudgetItem[]> {
  const db = initDb();
  return eventId ? db.budget.filter(b => b.eventId === eventId) : db.budget;
}

export async function saveBudgetItemServer(itemData: Partial<BudgetItem> & { eventId: string; name: string }): Promise<BudgetItem> {
  const db = initDb();
  const now = new Date().toISOString();
  const existingIndex = itemData.id ? db.budget.findIndex(b => b.id === itemData.id) : -1;
  let item: BudgetItem;

  if (existingIndex >= 0) {
    item = { ...db.budget[existingIndex], ...itemData, updatedAt: now };
    db.budget[existingIndex] = item;
  } else {
    item = {
      id: itemData.id || `bg_${crypto.randomUUID()}`,
      eventId: itemData.eventId,
      category: itemData.category || 'General',
      name: itemData.name,
      plannedAmount: Number(itemData.plannedAmount) || 0,
      actualAmount: Number(itemData.actualAmount) || 0,
      vendor: itemData.vendor,
      notes: itemData.notes,
      updatedAt: now
    };
    db.budget.push(item);
  }
  persistDb();
  return item;
}

export async function deleteBudgetItemServer(id: string): Promise<boolean> {
  const db = initDb();
  const len = db.budget.length;
  db.budget = db.budget.filter(b => b.id !== id);
  if (db.budget.length !== len) {
    persistDb();
    return true;
  }
  return false;
}

// --- SHOPPING ---
export async function getShoppingItemsServer(eventId?: string): Promise<ShoppingItem[]> {
  const db = initDb();
  return eventId ? db.shopping.filter(s => s.eventId === eventId) : db.shopping;
}

export async function saveShoppingItemServer(itemData: Partial<ShoppingItem> & { eventId: string; name: string }): Promise<ShoppingItem> {
  const db = initDb();
  const existingIndex = itemData.id ? db.shopping.findIndex(s => s.id === itemData.id) : -1;
  let item: ShoppingItem;

  if (existingIndex >= 0) {
    item = { ...db.shopping[existingIndex], ...itemData };
    db.shopping[existingIndex] = item;
  } else {
    item = {
      id: itemData.id || `sh_${crypto.randomUUID()}`,
      eventId: itemData.eventId,
      category: itemData.category || 'Other',
      name: itemData.name,
      quantity: itemData.quantity || '1',
      isPurchased: itemData.isPurchased || false,
      assignedTo: itemData.assignedTo
    };
    db.shopping.push(item);
  }
  persistDb();
  return item;
}

export async function deleteShoppingItemServer(id: string): Promise<boolean> {
  const db = initDb();
  const len = db.shopping.length;
  db.shopping = db.shopping.filter(s => s.id !== id);
  if (db.shopping.length !== len) {
    persistDb();
    return true;
  }
  return false;
}
