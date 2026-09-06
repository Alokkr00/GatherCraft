import { 
  PartyEvent, Guest, DietarySummary, RSVPStatus, 
  TimelineItem, TaskItem, BudgetItem, ShoppingItem, HostRetrospective 
} from './types';
import { STARTER_TEMPLATES } from './templates';
import { saveEventCloud, deleteEventCloud, saveGuestCloud } from './db';
import { generatePrefixedId } from './id';
import { getCurrentHostId } from './host-session';

const EVENTS_KEY = 'party_planner_events';
const GUESTS_KEY = 'party_planner_guests';
const TIMELINE_KEY = 'party_planner_timeline';
const TASKS_KEY = 'party_planner_tasks';
const BUDGET_KEY = 'party_planner_budget';
const SHOPPING_KEY = 'party_planner_shopping';

const isClient = typeof window !== 'undefined';

// Initial Sample Events
export const INITIAL_SAMPLE_EVENTS: PartyEvent[] = [
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

export const INITIAL_SAMPLE_GUESTS: Guest[] = [
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

export const INITIAL_SAMPLE_TIMELINE: TimelineItem[] = [
  { id: 'item-1', eventId: 'sample-cocktail-party', title: 'Arrival & Welcome Drinks', description: 'Serve signature cocktail & hand out icebreaker cards', offsetMinutes: 0, durationMinutes: 30, isCompleted: true, orderIndex: 0 },
  { id: 'item-2', eventId: 'sample-cocktail-party', title: 'Speed Icebreaker Circle', description: 'Introduce guests with 1 non-work passion', offsetMinutes: 30, durationMinutes: 20, isCompleted: true, orderIndex: 1 },
  { id: 'item-3', eventId: 'sample-cocktail-party', title: 'Host Toast & Grazing Platter', description: 'Share purpose statement and thank everyone', offsetMinutes: 50, durationMinutes: 30, isCompleted: false, orderIndex: 2 },
  { id: 'item-4', eventId: 'sample-cocktail-party', title: 'Hard Stop & Group Farewell', description: 'Wrap up event on time to leave guests wanting more', offsetMinutes: 120, durationMinutes: 10, isCompleted: false, orderIndex: 3 }
];

export const INITIAL_SAMPLE_TASKS: TaskItem[] = [
  { id: 'task-1', eventId: 'sample-cocktail-party', title: 'Finalize drink menu & ice order', category: 'Drinks', priority: 'high', status: 'done', updatedAt: new Date().toISOString() },
  { id: 'task-2', eventId: 'sample-cocktail-party', title: 'Confirm dietary preferences with guests', category: 'Food', priority: 'high', status: 'done', updatedAt: new Date().toISOString() },
  { id: 'task-3', eventId: 'sample-cocktail-party', title: 'Prep name tags & icebreaker question cards', category: 'Setup', priority: 'medium', status: 'in_progress', updatedAt: new Date().toISOString() },
  { id: 'task-4', eventId: 'sample-cocktail-party', title: 'Curate 2-hour playlist', category: 'Decor', priority: 'low', status: 'todo', updatedAt: new Date().toISOString() }
];

export const INITIAL_SAMPLE_BUDGET: BudgetItem[] = [
  { id: 'b-1', eventId: 'sample-cocktail-party', category: 'Drinks', name: 'Artisan Spirits & Mixers', plannedAmount: 80, actualAmount: 75, vendor: 'Local Cellar', updatedAt: new Date().toISOString() },
  { id: 'b-2', eventId: 'sample-cocktail-party', category: 'Food', name: 'Artisan Cheese & Charcuterie Platter', plannedAmount: 60, actualAmount: 65, vendor: 'Gourmet Market', updatedAt: new Date().toISOString() },
  { id: 'b-3', eventId: 'sample-cocktail-party', category: 'Supplies', name: 'Glassware, Napkins & Ice', plannedAmount: 30, actualAmount: 25, vendor: 'Party Outlet', updatedAt: new Date().toISOString() }
];

export const INITIAL_SAMPLE_SHOPPING: ShoppingItem[] = [
  { id: 's-1', eventId: 'sample-cocktail-party', name: 'Fresh Rosemary & Citrus for Garnish', category: 'Drinks', quantity: '2 bunches', isPurchased: true },
  { id: 's-2', eventId: 'sample-cocktail-party', name: 'Artisan Sourdough Crackers', category: 'Food', quantity: '3 boxes', isPurchased: true },
  { id: 's-3', eventId: 'sample-cocktail-party', name: 'Ice (2 Large Bags)', category: 'Drinks', quantity: '2 bags', isPurchased: false },
  { id: 's-4', eventId: 'sample-cocktail-party', name: 'Cocktail Napkins', category: 'Supplies', quantity: '50 pack', isPurchased: false }
];

// --- SERVER SYNC HELPER ---
async function syncToServer(url: string, method: string, data?: any) {
  if (!isClient) return null;
  try {
    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: data ? JSON.stringify(data) : undefined
    });
    if (!res.ok) return null;
    return await res.json();
  } catch (err) {
    return null;
  }
}

// --- EVENTS CRUD ---
export const getEvents = (): PartyEvent[] => {
  if (!isClient) return INITIAL_SAMPLE_EVENTS;
  try {
    const raw = localStorage.getItem(EVENTS_KEY);
    if (!raw) {
      localStorage.setItem(EVENTS_KEY, JSON.stringify(INITIAL_SAMPLE_EVENTS));
      return INITIAL_SAMPLE_EVENTS;
    }
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed) || parsed.length === 0) {
      localStorage.setItem(EVENTS_KEY, JSON.stringify(INITIAL_SAMPLE_EVENTS));
      return INITIAL_SAMPLE_EVENTS;
    }
    return parsed;
  } catch (err) {
    return INITIAL_SAMPLE_EVENTS;
  }
};

export const getEventById = (id: string): PartyEvent | null => {
  const events = getEvents();
  const found = events.find(e => e.id === id || e.inviteToken === id);
  if (found) return found;

  const sampleFallback = INITIAL_SAMPLE_EVENTS.find(e => e.id === id || e.inviteToken === id);
  if (sampleFallback) {
    saveEvent(sampleFallback);
    return sampleFallback;
  }

  return null;
};

export const saveEventsBulk = (newEvents: PartyEvent[]): void => {
  if (!isClient || !Array.isArray(newEvents)) return;
  const current = getEvents();
  const map = new Map<string, PartyEvent>();
  for (const e of current) map.set(e.id, e);
  for (const e of newEvents) map.set(e.id, e);
  localStorage.setItem(EVENTS_KEY, JSON.stringify(Array.from(map.values())));
};

export const saveEvent = (event: PartyEvent): void => {
  if (!isClient) return;
  const events = getEvents();
  const index = events.findIndex(e => e.id === event.id);
  const updatedEvent = { ...event, updatedAt: new Date().toISOString() };
  const updated = index >= 0
    ? events.map((e, i) => i === index ? updatedEvent : e)
    : [updatedEvent, ...events];
  localStorage.setItem(EVENTS_KEY, JSON.stringify(updated));
  
  // Async background server sync
  syncToServer(index >= 0 ? `/api/events/${event.id}` : '/api/events', index >= 0 ? 'PUT' : 'POST', updatedEvent);
  saveEventCloud(updatedEvent).catch(console.error);
};

export const saveEventAsync = async (event: Partial<PartyEvent> & { title: string }): Promise<PartyEvent> => {
  const serverRes = await syncToServer('/api/events', 'POST', event);
  const savedEvent: PartyEvent = serverRes?.event || {
    ...event,
    id: event.id || generatePrefixedId('ev'),
    inviteToken: event.inviteToken || generatePrefixedId('inv'),
    title: event.title,
    ownerId: event.ownerId || getCurrentHostId(),
    status: event.status || 'planning',
    purpose: event.purpose || { rawInput: '', selectedStatement: '', isPrivate: false },
    date: event.date || new Date().toISOString().split('T')[0],
    startTime: event.startTime || '18:00',
    endTime: event.endTime || '21:00',
    timezone: event.timezone || 'UTC',
    location: event.location || { address: '', isTBD: true },
    capacity: event.capacity || 20,
    totalBudget: event.totalBudget || 0,
    currency: event.currency || 'USD',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  saveEvent(savedEvent);
  return savedEvent;
};

export const deleteEvent = (id: string): void => {
  if (!isClient) return;
  const events = getEvents().filter(e => e.id !== id);
  localStorage.setItem(EVENTS_KEY, JSON.stringify(events));
  
  syncToServer(`/api/events/${id}`, 'DELETE');
  deleteEventCloud(id).catch(console.error);

  // Cascade cleanup child entities safely
  const guests = getGuests().filter(g => g.eventId !== id);
  localStorage.setItem(GUESTS_KEY, JSON.stringify(guests));

  const timeline = getTimelineItems().filter(t => t.eventId !== id);
  localStorage.setItem(TIMELINE_KEY, JSON.stringify(timeline));

  const tasks = getTasks().filter(t => t.eventId !== id);
  localStorage.setItem(TASKS_KEY, JSON.stringify(tasks));

  const budget = getBudgetItems().filter(b => b.eventId !== id);
  localStorage.setItem(BUDGET_KEY, JSON.stringify(budget));

  const shopping = getShoppingItems().filter(s => s.eventId !== id);
  localStorage.setItem(SHOPPING_KEY, JSON.stringify(shopping));
};

// --- GUESTS CRUD ---
export const getGuests = (eventId?: string): Guest[] => {
  if (!isClient) return INITIAL_SAMPLE_GUESTS;
  try {
    const raw = localStorage.getItem(GUESTS_KEY);
    let allGuests: Guest[] = !raw ? INITIAL_SAMPLE_GUESTS : JSON.parse(raw);
    if (!raw) localStorage.setItem(GUESTS_KEY, JSON.stringify(INITIAL_SAMPLE_GUESTS));
    return eventId ? allGuests.filter(g => g.eventId === eventId) : allGuests;
  } catch (err) {
    return [];
  }
};

export const saveGuestLocalOnly = (guest: Guest): void => {
  if (!isClient) return;
  const allGuests = getGuests();
  const index = allGuests.findIndex(g => 
    g.id === guest.id || 
    (g.eventId === guest.eventId && guest.email && g.email?.toLowerCase() === guest.email.toLowerCase()) ||
    (g.eventId === guest.eventId && g.name.toLowerCase() === guest.name.toLowerCase())
  );
  const updatedGuest = { ...guest, updatedAt: new Date().toISOString() };
  const updated = index >= 0
    ? allGuests.map((g, i) => i === index ? updatedGuest : g)
    : [...allGuests, updatedGuest];
  localStorage.setItem(GUESTS_KEY, JSON.stringify(updated));
};

export const saveGuest = (guest: Guest): void => {
  if (!isClient) return;
  const allGuests = getGuests();
  const index = allGuests.findIndex(g => 
    g.id === guest.id || 
    (g.eventId === guest.eventId && guest.email && g.email?.toLowerCase() === guest.email.toLowerCase()) ||
    (g.eventId === guest.eventId && g.name.toLowerCase() === guest.name.toLowerCase())
  );
  const updatedGuest = { ...guest, updatedAt: new Date().toISOString() };
  const updated = index >= 0
    ? allGuests.map((g, i) => i === index ? updatedGuest : g)
    : [...allGuests, updatedGuest];
  localStorage.setItem(GUESTS_KEY, JSON.stringify(updated));
  
  syncToServer(`/api/events/${guest.eventId}/guests`, 'POST', updatedGuest);
  saveGuestCloud(updatedGuest).catch(console.error);
};

export const saveGuestsBulk = (newGuests: Guest[]): void => {
  if (!isClient) return;
  const allGuests = getGuests();
  const newIds = new Set(newGuests.map(g => g.id));
  const remaining = allGuests.filter(g => !newIds.has(g.id));
  localStorage.setItem(GUESTS_KEY, JSON.stringify([...remaining, ...newGuests]));
  newGuests.forEach(g => {
    syncToServer(`/api/events/${g.eventId}/guests`, 'POST', g);
    saveGuestCloud(g).catch(console.error);
  });
};

export const deleteGuest = (id: string): void => {
  if (!isClient) return;
  const allGuests = getGuests();
  const guest = allGuests.find(g => g.id === id);
  const filtered = allGuests.filter(g => g.id !== id);
  localStorage.setItem(GUESTS_KEY, JSON.stringify(filtered));
  
  if (guest) {
    syncToServer(`/api/events/${guest.eventId}/guests?guestId=${id}`, 'DELETE');
  }
};

export const updateGuestRSVP = (
  eventId: string,
  guestIdOrName: string,
  data: {
    rsvpStatus: RSVPStatus;
    name?: string;
    email?: string;
    phone?: string;
    plusOnesActual?: number;
    dietary?: string;
    accessibility?: string;
  }
): Guest => {
  const eventGuests = getGuests(eventId);
  let existing = eventGuests.find(
    g => g.id === guestIdOrName || 
         (data.email && g.email?.toLowerCase() === data.email.toLowerCase()) ||
         (data.name && g.name.toLowerCase() === data.name.trim().toLowerCase())
  );

  if (existing) {
    const updated: Guest = {
      ...existing,
      rsvpStatus: data.rsvpStatus,
      name: data.name || existing.name,
      email: data.email || existing.email,
      phone: data.phone || existing.phone,
      plusOnesActual: data.plusOnesActual !== undefined ? data.plusOnesActual : existing.plusOnesActual,
      dietary: data.dietary !== undefined ? data.dietary : existing.dietary,
      accessibility: data.accessibility !== undefined ? data.accessibility : existing.accessibility,
      updatedAt: new Date().toISOString()
    };
    saveGuest(updated);
    return updated;
  } else {
    const guestId = (guestIdOrName && guestIdOrName.startsWith('gst_')) 
      ? guestIdOrName 
      : generatePrefixedId('gst');

    const newGuest: Guest = {
      id: guestId,
      eventId,
      name: data.name || 'Guest',
      email: data.email,
      phone: data.phone,
      role: 'guest',
      rsvpStatus: data.rsvpStatus,
      plusOnesAllowed: 1,
      plusOnesActual: data.plusOnesActual || 0,
      dietary: data.dietary || '',
      accessibility: data.accessibility || '',
      updatedAt: new Date().toISOString()
    };
    saveGuest(newGuest);
    return newGuest;
  }
};

// --- LIVE MODE & AFTERMATH HELPERS ---
export const toggleGuestCheckIn = (guest: Guest): Guest => {
  const isCheckedIn = Boolean(guest.checkInAt);
  const updated: Guest = {
    ...guest,
    checkInAt: isCheckedIn ? undefined : new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  saveGuest(updated);
  return updated;
};

export const closeEvent = (eventId: string, retrospective?: HostRetrospective): PartyEvent | null => {
  const ev = getEventById(eventId);
  if (!ev) return null;
  const updated: PartyEvent = {
    ...ev,
    status: 'completed',
    isClosed: true,
    retrospective: retrospective || ev.retrospective,
    updatedAt: new Date().toISOString()
  };
  saveEvent(updated);
  return updated;
};

export const generateThankYouMessage = (eventTitle: string, guestName: string, tone: 'warm' | 'fun' | 'short'): string => {
  const firstName = guestName ? guestName.split(' ')[0] : 'friend';
  if (tone === 'warm') {
    return `Hi ${firstName}! Thank you so much for coming to ${eventTitle}! Your energy and conversation made the evening truly special. So glad you were part of it! ❤️`;
  } else if (tone === 'fun') {
    return `Hey ${firstName}! Thanks for bringing the good vibes to ${eventTitle}! 🥂 Couldn't have asked for a better night. Let's do it again soon! 🎉`;
  } else {
    return `Hi ${firstName}, thanks for coming to ${eventTitle}! Great having you with us! 🙌`;
  }
};

export const calculateDietarySummary = (guests: Guest[]): DietarySummary => {
  const confirmed = guests.filter(g => g.rsvpStatus === 'yes');
  let summary: DietarySummary = {
    total: confirmed.length + confirmed.reduce((acc, g) => acc + (g.plusOnesActual || 0), 0),
    vegetarian: 0,
    vegan: 0,
    glutenFree: 0,
    nutAllergy: 0,
    dairyFree: 0,
    customList: []
  };

  confirmed.forEach(g => {
    if (!g.dietary || g.dietary.trim() === '' || g.dietary.toLowerCase() === 'none') return;
    const lower = g.dietary.toLowerCase();

    if (/\bvegetarian\b/i.test(lower) && !/\bvegan\b/i.test(lower)) summary.vegetarian++;
    if (/\bvegan\b/i.test(lower)) summary.vegan++;
    if (/\bgluten\b|\bgf\b/i.test(lower)) summary.glutenFree++;
    if (/\bnut\b|\bpeanut\b/i.test(lower)) summary.nutAllergy++;
    if (/\bdairy\b|\blactose\b/i.test(lower)) summary.dairyFree++;

    summary.customList.push({
      guestName: g.name + (g.plusOnesActual > 0 ? ` (+${g.plusOnesActual})` : ''),
      note: g.dietary
    });
  });

  return summary;
};

// --- TIMELINE CRUD ---
export const getTimelineItems = (eventId?: string): TimelineItem[] => {
  if (!isClient) return eventId ? INITIAL_SAMPLE_TIMELINE.filter(t => t.eventId === eventId) : INITIAL_SAMPLE_TIMELINE;
  try {
    const raw = localStorage.getItem(TIMELINE_KEY);
    let all: TimelineItem[] = !raw ? INITIAL_SAMPLE_TIMELINE : JSON.parse(raw);
    if (!raw) localStorage.setItem(TIMELINE_KEY, JSON.stringify(INITIAL_SAMPLE_TIMELINE));
    const list = eventId ? all.filter(t => t.eventId === eventId) : all;
    return list.sort((a, b) => a.offsetMinutes - b.offsetMinutes);
  } catch (err) {
    return [];
  }
};

export const saveTimelineItem = (item: TimelineItem): void => {
  if (!isClient) return;
  const raw = localStorage.getItem(TIMELINE_KEY);
  let all: TimelineItem[] = raw ? JSON.parse(raw) : INITIAL_SAMPLE_TIMELINE;
  const idx = all.findIndex(t => t.id === item.id);
  if (idx >= 0) all[idx] = item;
  else all.push(item);
  localStorage.setItem(TIMELINE_KEY, JSON.stringify(all));
  syncToServer(`/api/events/${item.eventId}/timeline`, 'POST', item);
};

export const deleteTimelineItem = (id: string): void => {
  if (!isClient) return;
  const raw = localStorage.getItem(TIMELINE_KEY);
  let all: TimelineItem[] = raw ? JSON.parse(raw) : INITIAL_SAMPLE_TIMELINE;
  const item = all.find(t => t.id === id);
  all = all.filter(t => t.id !== id);
  localStorage.setItem(TIMELINE_KEY, JSON.stringify(all));
  if (item) {
    syncToServer(`/api/events/${item.eventId}/timeline?itemId=${id}`, 'DELETE');
  }
};

// --- TASKS CRUD ---
export const getTasks = (eventId?: string): TaskItem[] => {
  if (!isClient) return eventId ? INITIAL_SAMPLE_TASKS.filter(t => t.eventId === eventId) : INITIAL_SAMPLE_TASKS;
  try {
    const raw = localStorage.getItem(TASKS_KEY);
    let all: TaskItem[] = !raw ? INITIAL_SAMPLE_TASKS : JSON.parse(raw);
    if (!raw) localStorage.setItem(TASKS_KEY, JSON.stringify(INITIAL_SAMPLE_TASKS));
    return eventId ? all.filter(t => t.eventId === eventId) : all;
  } catch (err) {
    return [];
  }
};

export const saveTask = (task: TaskItem): void => {
  if (!isClient) return;
  const raw = localStorage.getItem(TASKS_KEY);
  let all: TaskItem[] = raw ? JSON.parse(raw) : INITIAL_SAMPLE_TASKS;
  const idx = all.findIndex(t => t.id === task.id);
  const updatedTask = { ...task, updatedAt: new Date().toISOString() };
  if (idx >= 0) all[idx] = updatedTask;
  else all.push(updatedTask);
  localStorage.setItem(TASKS_KEY, JSON.stringify(all));
  syncToServer(`/api/events/${task.eventId}/tasks`, 'POST', updatedTask);
};

export const deleteTask = (id: string): void => {
  if (!isClient) return;
  const raw = localStorage.getItem(TASKS_KEY);
  let all: TaskItem[] = raw ? JSON.parse(raw) : INITIAL_SAMPLE_TASKS;
  const task = all.find(t => t.id === id);
  all = all.filter(t => t.id !== id);
  localStorage.setItem(TASKS_KEY, JSON.stringify(all));
  if (task) {
    syncToServer(`/api/events/${task.eventId}/tasks?taskId=${id}`, 'DELETE');
  }
};

export const generateDefaultTasks = (eventId: string, eventTitle: string): TaskItem[] => {
  const defaults: TaskItem[] = [
    { id: generatePrefixedId('tk'), eventId, title: 'Finalize headcount & dietary needs', category: 'Food', priority: 'high', status: 'todo', updatedAt: new Date().toISOString() },
    { id: generatePrefixedId('tk'), eventId, title: 'Purchase drinks, ice & signature mixers', category: 'Drinks', priority: 'high', status: 'todo', updatedAt: new Date().toISOString() },
    { id: generatePrefixedId('tk'), eventId, title: 'Clean main area & clear coat rack / entrance', category: 'Setup', priority: 'medium', status: 'todo', updatedAt: new Date().toISOString() },
    { id: generatePrefixedId('tk'), eventId, title: 'Set up background music & playlist', category: 'Decor', priority: 'medium', status: 'todo', updatedAt: new Date().toISOString() },
    { id: generatePrefixedId('tk'), eventId, title: 'Prep trash bags & dishwasher for easy cleanup', category: 'Cleanup', priority: 'low', status: 'todo', updatedAt: new Date().toISOString() }
  ];
  defaults.forEach(saveTask);
  return getTasks(eventId);
};

// --- BUDGET CRUD ---
export const getBudgetItems = (eventId?: string): BudgetItem[] => {
  if (!isClient) return eventId ? INITIAL_SAMPLE_BUDGET.filter(b => b.eventId === eventId) : INITIAL_SAMPLE_BUDGET;
  try {
    const raw = localStorage.getItem(BUDGET_KEY);
    let all: BudgetItem[] = !raw ? INITIAL_SAMPLE_BUDGET : JSON.parse(raw);
    if (!raw) localStorage.setItem(BUDGET_KEY, JSON.stringify(INITIAL_SAMPLE_BUDGET));
    return eventId ? all.filter(b => b.eventId === eventId) : all;
  } catch (err) {
    return [];
  }
};

export const saveBudgetItem = (item: BudgetItem): void => {
  if (!isClient) return;
  const raw = localStorage.getItem(BUDGET_KEY);
  let all: BudgetItem[] = raw ? JSON.parse(raw) : INITIAL_SAMPLE_BUDGET;
  const idx = all.findIndex(b => b.id === item.id);
  const updatedItem = { ...item, updatedAt: new Date().toISOString() };
  if (idx >= 0) all[idx] = updatedItem;
  else all.push(updatedItem);
  localStorage.setItem(BUDGET_KEY, JSON.stringify(all));
  syncToServer(`/api/events/${item.eventId}/budget`, 'POST', updatedItem);
};

export const deleteBudgetItem = (id: string): void => {
  if (!isClient) return;
  const raw = localStorage.getItem(BUDGET_KEY);
  let all: BudgetItem[] = raw ? JSON.parse(raw) : INITIAL_SAMPLE_BUDGET;
  const item = all.find(b => b.id === id);
  all = all.filter(b => b.id !== id);
  localStorage.setItem(BUDGET_KEY, JSON.stringify(all));
  if (item) {
    syncToServer(`/api/events/${item.eventId}/budget?itemId=${id}`, 'DELETE');
  }
};

// --- SHOPPING CRUD ---
export const getShoppingItems = (eventId?: string): ShoppingItem[] => {
  if (!isClient) return eventId ? INITIAL_SAMPLE_SHOPPING.filter(s => s.eventId === eventId) : INITIAL_SAMPLE_SHOPPING;
  try {
    const raw = localStorage.getItem(SHOPPING_KEY);
    let all: ShoppingItem[] = !raw ? INITIAL_SAMPLE_SHOPPING : JSON.parse(raw);
    if (!raw) localStorage.setItem(SHOPPING_KEY, JSON.stringify(INITIAL_SAMPLE_SHOPPING));
    return eventId ? all.filter(s => s.eventId === eventId) : all;
  } catch (err) {
    return [];
  }
};

export const saveShoppingItem = (item: ShoppingItem): void => {
  if (!isClient) return;
  const raw = localStorage.getItem(SHOPPING_KEY);
  let all: ShoppingItem[] = raw ? JSON.parse(raw) : INITIAL_SAMPLE_SHOPPING;
  const idx = all.findIndex(s => s.id === item.id);
  if (idx >= 0) all[idx] = item;
  else all.push(item);
  localStorage.setItem(SHOPPING_KEY, JSON.stringify(all));
  syncToServer(`/api/events/${item.eventId}/shopping`, 'POST', item);
};

export const deleteShoppingItem = (id: string): void => {
  if (!isClient) return;
  const raw = localStorage.getItem(SHOPPING_KEY);
  let all: ShoppingItem[] = raw ? JSON.parse(raw) : INITIAL_SAMPLE_SHOPPING;
  const item = all.find(s => s.id === id);
  all = all.filter(s => s.id !== id);
  localStorage.setItem(SHOPPING_KEY, JSON.stringify(all));
  if (item) {
    syncToServer(`/api/events/${item.eventId}/shopping?itemId=${id}`, 'DELETE');
  }
};

export const generateShoppingList = (eventId: string, headcount: number): ShoppingItem[] => {
  const count = headcount > 0 ? headcount : 10;
  const items: ShoppingItem[] = [
    { id: generatePrefixedId('shop'), eventId, name: 'Ice Bags', category: 'Drinks', quantity: `${Math.ceil(count / 5)} bags`, isPurchased: false },
    { id: generatePrefixedId('shop'), eventId, name: 'Assorted Drinks / Mixers', category: 'Drinks', quantity: `${Math.ceil(count * 0.75)} liters`, isPurchased: false },
    { id: generatePrefixedId('shop'), eventId, name: 'Snacks / Grazing platter items', category: 'Food', quantity: `${count} servings`, isPurchased: false },
    { id: generatePrefixedId('shop'), eventId, name: 'Cocktail Napkins & Plates', category: 'Supplies', quantity: `${count * 2} count`, isPurchased: false },
    { id: generatePrefixedId('shop'), eventId, name: 'Trash Bags & Cleanup Supplies', category: 'Supplies', quantity: '1 pack', isPurchased: false }
  ];
  items.forEach(saveShoppingItem);
  return getShoppingItems(eventId);
};
