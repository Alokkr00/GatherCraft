import { 
  PartyEvent, Guest, DietarySummary, RSVPStatus, 
  TimelineItem, TaskItem, BudgetItem, ShoppingItem, HostRetrospective 
} from './types';
import { STARTER_TEMPLATES } from './templates';

const EVENTS_KEY = 'party_planner_events';
const GUESTS_KEY = 'party_planner_guests';
const TIMELINE_KEY = 'party_planner_timeline';
const TASKS_KEY = 'party_planner_tasks';
const BUDGET_KEY = 'party_planner_budget';
const SHOPPING_KEY = 'party_planner_shopping';

const isClient = typeof window !== 'undefined';

// Initial Sample Event
export const INITIAL_SAMPLE_EVENTS: PartyEvent[] = [
  {
    id: 'sample-cocktail-party',
    title: 'Friday Sunset Cocktails & Bites',
    ownerId: 'host-1',
    templateId: 'cocktail-party',
    status: 'planning',
    purpose: {
      rawInput: 'Host a fun 2-hour cocktail party to introduce friends from different circles.',
      selectedStatement: 'To bring together 15 friends from tech, design, and music for high-energy conversations, introducing people who should know each other.',
      suggestions: {
        warm: 'To create a cozy evening where old and new friends naturally connect over artisan drinks.',
        bold: 'To host a fast-paced, high-impact 2-hour mixer designed to spark new friendships and collaborations.',
        minimal: 'To gather good people for great drinks and meaningful introductions.'
      },
      successCriteria: [
        'Guests meet at least 3 people they did not know before',
        'Enforce 2-hour hard end time so everyone leaves energized',
        'Serve signature house cocktail + non-alcoholic alternative'
      ],
      isPrivate: false
    },
    date: '2026-08-14',
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
    rsvpStatus: 'pending',
    plusOnesAllowed: 0,
    plusOnesActual: 0,
    updatedAt: new Date().toISOString()
  }
];

export const INITIAL_SAMPLE_TIMELINE: TimelineItem[] = [
  {
    id: 't-1',
    eventId: 'sample-cocktail-party',
    title: 'Arrival & Welcome Signature Drink',
    description: 'Greet guests at the door, hand them a welcome cocktail/mocktail, and introduce them to the first person nearby.',
    offsetMinutes: 0,
    durationMinutes: 30,
    assigneeName: 'Host (You)',
    isCompleted: true,
    orderIndex: 0
  },
  {
    id: 't-2',
    eventId: 'sample-cocktail-party',
    title: 'First Icebreaker Game ("Match 3")',
    description: 'Gather everyone around the kitchen island. Ask each person to share one surprising passion project.',
    offsetMinutes: 30,
    durationMinutes: 30,
    assigneeName: 'Alex Rivera',
    isCompleted: false,
    orderIndex: 1
  },
  {
    id: 't-3',
    eventId: 'sample-cocktail-party',
    title: 'Open Grazing & Small Group Mingling',
    description: 'Refill drinks, encourage people to mix with someone they haven\'t spoken to yet.',
    offsetMinutes: 60,
    durationMinutes: 45,
    assigneeName: 'Host (You)',
    isCompleted: false,
    orderIndex: 2
  },
  {
    id: 't-4',
    eventId: 'sample-cocktail-party',
    title: 'Host Toast & Group Photo',
    description: 'Short 2-minute toast thanking everyone for coming. Capture a group photo on the terrace.',
    offsetMinutes: 105,
    durationMinutes: 15,
    assigneeName: 'Host (You)',
    isCompleted: false,
    orderIndex: 3
  },
  {
    id: 't-5',
    eventId: 'sample-cocktail-party',
    title: 'Hard End Time Wrap-Up',
    description: 'Enforce hard end time! Thank guests, give out leftovers/cards, and invite those interested to an optional after-hang.',
    offsetMinutes: 120,
    durationMinutes: 10,
    assigneeName: 'Host (You)',
    isCompleted: false,
    orderIndex: 4
  }
];

export const INITIAL_SAMPLE_TASKS: TaskItem[] = [
  { id: 'tk-1', eventId: 'sample-cocktail-party', title: 'Buy ice bags & citrus garnishes', description: '3 bags of cubed ice + limes', category: 'Drinks', assigneeName: 'Alex Rivera', dueDate: '2026-08-14', priority: 'high', status: 'done', updatedAt: new Date().toISOString() },
  { id: 'tk-2', eventId: 'sample-cocktail-party', title: 'Chill glassware & pre-batch welcome punch', category: 'Drinks', assigneeName: 'Host (You)', dueDate: '2026-08-14', priority: 'high', status: 'in_progress', updatedAt: new Date().toISOString() },
  { id: 'tk-3', eventId: 'sample-cocktail-party', title: 'Set up grazing board', category: 'Food', assigneeName: 'Host (You)', dueDate: '2026-08-14', priority: 'medium', status: 'todo', updatedAt: new Date().toISOString() },
  { id: 'tk-4', eventId: 'sample-cocktail-party', title: 'Curate playlist', category: 'Decor', assigneeName: 'Sarah Chen', dueDate: '2026-08-13', priority: 'medium', status: 'done', updatedAt: new Date().toISOString() }
];

export const INITIAL_SAMPLE_BUDGET: BudgetItem[] = [
  { id: 'b-1', eventId: 'sample-cocktail-party', category: 'Drinks', name: 'Spirits & Bitters', plannedAmount: 90, actualAmount: 85, vendor: 'BevMo', updatedAt: new Date().toISOString() },
  { id: 'b-2', eventId: 'sample-cocktail-party', category: 'Food', name: 'Artisan Cheeses & Fruit', plannedAmount: 60, actualAmount: 68, vendor: 'Trader Joe\'s', updatedAt: new Date().toISOString() },
  { id: 'b-3', eventId: 'sample-cocktail-party', category: 'Decor', name: 'Biodegradable Cups & Napkins', plannedAmount: 25, actualAmount: 22, vendor: 'Target', updatedAt: new Date().toISOString() }
];

export const INITIAL_SAMPLE_SHOPPING: ShoppingItem[] = [
  { id: 's-1', eventId: 'sample-cocktail-party', name: 'Cubed Ice Bags', category: 'Drinks', quantity: '3 bags', isPurchased: true },
  { id: 's-2', eventId: 'sample-cocktail-party', name: 'Fresh Limes & Lemons', category: 'Drinks', quantity: '12 limes', isPurchased: true },
  { id: 's-3', eventId: 'sample-cocktail-party', name: 'Artisan Crackers & Cheeses', category: 'Food', quantity: '3 blocks', isPurchased: false }
];

// --- EVENT & GUEST CRUD ---
export const getEvents = (): PartyEvent[] => {
  if (!isClient) return INITIAL_SAMPLE_EVENTS;
  try {
    const raw = localStorage.getItem(EVENTS_KEY);
    if (!raw) {
      localStorage.setItem(EVENTS_KEY, JSON.stringify(INITIAL_SAMPLE_EVENTS));
      return INITIAL_SAMPLE_EVENTS;
    }
    return JSON.parse(raw);
  } catch (err) {
    return INITIAL_SAMPLE_EVENTS;
  }
};

export const getEventById = (id: string): PartyEvent | null => {
  const events = getEvents();
  return events.find(e => e.id === id) || null;
};

export const saveEvent = (event: PartyEvent): void => {
  if (!isClient) return;
  const events = getEvents();
  const index = events.findIndex(e => e.id === event.id);
  const updated = index >= 0
    ? events.map((e, i) => i === index ? { ...event, updatedAt: new Date().toISOString() } : e)
    : [event, ...events];
  localStorage.setItem(EVENTS_KEY, JSON.stringify(updated));
};

export const deleteEvent = (id: string): void => {
  if (!isClient) return;
  const events = getEvents().filter(e => e.id !== id);
  localStorage.setItem(EVENTS_KEY, JSON.stringify(events));

  // Cascade cleanup child entities
  const guests = getGuests().filter(g => g.eventId !== id);
  localStorage.setItem(GUESTS_KEY, JSON.stringify(guests));

  const timeline = getTimelineItems(id).filter(t => t.eventId !== id);
  localStorage.setItem(TIMELINE_KEY, JSON.stringify(timeline));

  const tasks = getTasks(id).filter(t => t.eventId !== id);
  localStorage.setItem(TASKS_KEY, JSON.stringify(tasks));

  const budget = getBudgetItems(id).filter(b => b.eventId !== id);
  localStorage.setItem(BUDGET_KEY, JSON.stringify(budget));

  const shopping = getShoppingItems(id).filter(s => s.eventId !== id);
  localStorage.setItem(SHOPPING_KEY, JSON.stringify(shopping));
};

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

export const saveGuest = (guest: Guest): void => {
  if (!isClient) return;
  const allGuests = getGuests();
  const index = allGuests.findIndex(g => g.id === guest.id);
  const updated = index >= 0
    ? allGuests.map((g, i) => i === index ? { ...guest, updatedAt: new Date().toISOString() } : g)
    : [...allGuests, guest];
  localStorage.setItem(GUESTS_KEY, JSON.stringify(updated));
};

export const saveGuestsBulk = (newGuests: Guest[]): void => {
  if (!isClient) return;
  const allGuests = getGuests();
  const newIds = new Set(newGuests.map(g => g.id));
  const remaining = allGuests.filter(g => !newIds.has(g.id));
  localStorage.setItem(GUESTS_KEY, JSON.stringify([...remaining, ...newGuests]));
};

export const deleteGuest = (id: string): void => {
  if (!isClient) return;
  const allGuests = getGuests().filter(g => g.id !== id);
  localStorage.setItem(GUESTS_KEY, JSON.stringify(allGuests));
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
    g => g.id === guestIdOrName || (data.email && g.email?.toLowerCase() === data.email.toLowerCase())
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
    const newGuest: Guest = {
      id: 'guest_' + Math.random().toString(36).substring(2, 9),
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

// --- v0.3 LIVE MODE & AFTERMATH HELPERS ---
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
export const getTimelineItems = (eventId: string): TimelineItem[] => {
  if (!isClient) return INITIAL_SAMPLE_TIMELINE.filter(t => t.eventId === eventId);
  try {
    const raw = localStorage.getItem(TIMELINE_KEY);
    let all: TimelineItem[] = !raw ? INITIAL_SAMPLE_TIMELINE : JSON.parse(raw);
    if (!raw) localStorage.setItem(TIMELINE_KEY, JSON.stringify(INITIAL_SAMPLE_TIMELINE));
    return all.filter(t => t.eventId === eventId).sort((a, b) => a.offsetMinutes - b.offsetMinutes);
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
};

export const deleteTimelineItem = (id: string): void => {
  if (!isClient) return;
  const raw = localStorage.getItem(TIMELINE_KEY);
  let all: TimelineItem[] = raw ? JSON.parse(raw) : INITIAL_SAMPLE_TIMELINE;
  all = all.filter(t => t.id !== id);
  localStorage.setItem(TIMELINE_KEY, JSON.stringify(all));
};

// --- TASKS CRUD ---
export const getTasks = (eventId: string): TaskItem[] => {
  if (!isClient) return INITIAL_SAMPLE_TASKS.filter(t => t.eventId === eventId);
  try {
    const raw = localStorage.getItem(TASKS_KEY);
    let all: TaskItem[] = !raw ? INITIAL_SAMPLE_TASKS : JSON.parse(raw);
    if (!raw) localStorage.setItem(TASKS_KEY, JSON.stringify(INITIAL_SAMPLE_TASKS));
    return all.filter(t => t.eventId === eventId);
  } catch (err) {
    return [];
  }
};

export const saveTask = (task: TaskItem): void => {
  if (!isClient) return;
  const raw = localStorage.getItem(TASKS_KEY);
  let all: TaskItem[] = raw ? JSON.parse(raw) : INITIAL_SAMPLE_TASKS;
  const idx = all.findIndex(t => t.id === task.id);
  if (idx >= 0) all[idx] = { ...task, updatedAt: new Date().toISOString() };
  else all.push(task);
  localStorage.setItem(TASKS_KEY, JSON.stringify(all));
};

export const deleteTask = (id: string): void => {
  if (!isClient) return;
  const raw = localStorage.getItem(TASKS_KEY);
  let all: TaskItem[] = raw ? JSON.parse(raw) : INITIAL_SAMPLE_TASKS;
  all = all.filter(t => t.id !== id);
  localStorage.setItem(TASKS_KEY, JSON.stringify(all));
};

export const generateDefaultTasks = (eventId: string, eventTitle: string): TaskItem[] => {
  const defaults: TaskItem[] = [
    { id: `tk_${Math.random()}`, eventId, title: 'Finalize headcount & dietary needs', category: 'Food', priority: 'high', status: 'todo', updatedAt: new Date().toISOString() },
    { id: `tk_${Math.random()}`, eventId, title: 'Purchase drinks, ice & signature mixers', category: 'Drinks', priority: 'high', status: 'todo', updatedAt: new Date().toISOString() },
    { id: `tk_${Math.random()}`, eventId, title: 'Clean main area & clear coat rack / entrance', category: 'Setup', priority: 'medium', status: 'todo', updatedAt: new Date().toISOString() },
    { id: `tk_${Math.random()}`, eventId, title: 'Set up background music & playlist', category: 'Decor', priority: 'medium', status: 'todo', updatedAt: new Date().toISOString() },
    { id: `tk_${Math.random()}`, eventId, title: 'Prep trash bags & dishwasher for easy cleanup', category: 'Cleanup', priority: 'low', status: 'todo', updatedAt: new Date().toISOString() }
  ];
  defaults.forEach(saveTask);
  return getTasks(eventId);
};

// --- BUDGET CRUD ---
export const getBudgetItems = (eventId: string): BudgetItem[] => {
  if (!isClient) return INITIAL_SAMPLE_BUDGET.filter(b => b.eventId === eventId);
  try {
    const raw = localStorage.getItem(BUDGET_KEY);
    let all: BudgetItem[] = !raw ? INITIAL_SAMPLE_BUDGET : JSON.parse(raw);
    if (!raw) localStorage.setItem(BUDGET_KEY, JSON.stringify(INITIAL_SAMPLE_BUDGET));
    return all.filter(b => b.eventId === eventId);
  } catch (err) {
    return [];
  }
};

export const saveBudgetItem = (item: BudgetItem): void => {
  if (!isClient) return;
  const raw = localStorage.getItem(BUDGET_KEY);
  let all: BudgetItem[] = raw ? JSON.parse(raw) : INITIAL_SAMPLE_BUDGET;
  const idx = all.findIndex(b => b.id === item.id);
  if (idx >= 0) all[idx] = { ...item, updatedAt: new Date().toISOString() };
  else all.push(item);
  localStorage.setItem(BUDGET_KEY, JSON.stringify(all));
};

export const deleteBudgetItem = (id: string): void => {
  if (!isClient) return;
  const raw = localStorage.getItem(BUDGET_KEY);
  let all: BudgetItem[] = raw ? JSON.parse(raw) : INITIAL_SAMPLE_BUDGET;
  all = all.filter(b => b.id !== id);
  localStorage.setItem(BUDGET_KEY, JSON.stringify(all));
};

// --- SHOPPING CRUD ---
export const getShoppingItems = (eventId: string): ShoppingItem[] => {
  if (!isClient) return INITIAL_SAMPLE_SHOPPING.filter(s => s.eventId === eventId);
  try {
    const raw = localStorage.getItem(SHOPPING_KEY);
    let all: ShoppingItem[] = !raw ? INITIAL_SAMPLE_SHOPPING : JSON.parse(raw);
    if (!raw) localStorage.setItem(SHOPPING_KEY, JSON.stringify(INITIAL_SAMPLE_SHOPPING));
    return all.filter(s => s.eventId === eventId);
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
};

export const deleteShoppingItem = (id: string): void => {
  if (!isClient) return;
  const raw = localStorage.getItem(SHOPPING_KEY);
  let all: ShoppingItem[] = raw ? JSON.parse(raw) : INITIAL_SAMPLE_SHOPPING;
  all = all.filter(s => s.id !== id);
  localStorage.setItem(SHOPPING_KEY, JSON.stringify(all));
};

export const generateShoppingList = (eventId: string, headcount: number): ShoppingItem[] => {
  const count = headcount > 0 ? headcount : 10;
  const items: ShoppingItem[] = [
    { id: `shop_${Math.random()}`, eventId, name: 'Ice Bags', category: 'Drinks', quantity: `${Math.ceil(count / 5)} bags`, isPurchased: false },
    { id: `shop_${Math.random()}`, eventId, name: 'Assorted Drinks / Mixers', category: 'Drinks', quantity: `${Math.ceil(count * 0.75)} liters`, isPurchased: false },
    { id: `shop_${Math.random()}`, eventId, name: 'Snacks / Grazing platter items', category: 'Food', quantity: `${count} servings`, isPurchased: false },
    { id: `shop_${Math.random()}`, eventId, name: 'Cocktail Napkins & Plates', category: 'Supplies', quantity: `${count * 2} count`, isPurchased: false },
    { id: `shop_${Math.random()}`, eventId, name: 'Trash Bags & Cleanup Supplies', category: 'Supplies', quantity: '1 pack', isPurchased: false }
  ];
  items.forEach(saveShoppingItem);
  return getShoppingItems(eventId);
};
