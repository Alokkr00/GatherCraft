export type EventStatus = 'draft' | 'planning' | 'confirmed' | 'live' | 'completed' | 'archived';

export type GuestRole = 'guest' | 'co-host' | 'helper' | 'vip';
export type RSVPStatus = 'yes' | 'no' | 'maybe' | 'pending' | 'waitlist';

export interface PurposeStatement {
  rawInput: string;
  selectedStatement: string;
  suggestions?: {
    warm?: string;
    bold?: string;
    minimal?: string;
  };
  successCriteria?: string[];
  isPrivate: boolean;
}

export interface EventLocation {
  address: string;
  name?: string;
  notes?: string;
  isTBD: boolean;
}

export interface HostRetrospective {
  whatWorked: string;
  whatToImprove: string;
  rating: number; // 1 to 5
  completedAt: string;
  savedAsTemplate: boolean;
}

export interface PartyEvent {
  id: string;
  inviteToken?: string;
  title: string;
  ownerId: string;
  coHostIds?: string[];
  templateId?: string;
  status: EventStatus;
  
  // Purpose Engine
  purpose: PurposeStatement;
  
  // Basics
  date: string; // YYYY-MM-DD
  startTime: string; // HH:mm
  endTime: string; // HH:mm
  timezone: string;
  location: EventLocation;
  capacity?: number;
  totalBudget?: number;
  currency: string;
  coverAssetUrl?: string;
  themeColor?: string;
  
  // Expiry & Closeout
  inviteExpiresAt?: string;
  isClosed?: boolean;
  retrospective?: HostRetrospective;

  createdAt: string;
  updatedAt: string;
}

export interface PublicInviteView {
  id: string;
  inviteToken?: string;
  title: string;
  date: string;
  startTime: string;
  endTime: string;
  timezone: string;
  locationName?: string;
  address?: string;
  isTBD: boolean;
  publicPurpose?: string;
  themeColor?: string;
  coverAssetUrl?: string;
  capacity?: number;
  status: EventStatus;
  confirmedCount?: number;
}

export interface Guest {
  id: string;
  eventId: string;
  name: string;
  email?: string;
  phone?: string;
  role: GuestRole;
  rsvpStatus: RSVPStatus;
  plusOnesAllowed: number;
  plusOnesActual: number;
  dietary?: string;
  accessibility?: string;
  notes?: string; // host-only
  relationshipTag?: string;
  checkInAt?: string; // ISO timestamp when checked in
  updatedAt: string;
}

export interface StarterTemplate {
  id: string;
  title: string;
  subtitle: string;
  category: string;
  defaultPurpose: string;
  defaultDurationHours: number;
  suggestedCapacity: number;
  suggestedBudget: number;
  coverImage: string;
  themeColor: string;
  defaultSuccessCriteria: string[];
}

export interface DietarySummary {
  total: number;
  vegetarian: number;
  vegan: number;
  glutenFree: number;
  nutAllergy: number;
  dairyFree: number;
  customList: { guestName: string; note: string }[];
}

export interface TimelineItem {
  id: string;
  eventId: string;
  title: string;
  description?: string;
  offsetMinutes: number; // minutes from event start
  durationMinutes: number;
  assigneeName?: string;
  isCompleted: boolean;
  orderIndex: number;
}

export type TaskCategory = 'Setup' | 'Food' | 'Drinks' | 'Decor' | 'Cleanup' | 'Other';
export type TaskPriority = 'low' | 'medium' | 'high';
export type TaskStatus = 'todo' | 'in_progress' | 'done';

export interface TaskItem {
  id: string;
  eventId: string;
  title: string;
  description?: string;
  category: TaskCategory;
  assigneeName?: string;
  dueDate?: string;
  priority: TaskPriority;
  status: TaskStatus;
  linkedBudgetItemId?: string;
  updatedAt: string;
}

export interface BudgetItem {
  id: string;
  eventId: string;
  category: string;
  name: string;
  plannedAmount: number;
  actualAmount: number;
  vendor?: string;
  receiptUrl?: string;
  notes?: string;
  updatedAt: string;
}

export interface ShoppingItem {
  id: string;
  eventId: string;
  name: string;
  category: string;
  quantity: string;
  isPurchased: boolean;
  assignedTo?: string;
}
