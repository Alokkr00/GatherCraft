export interface LiveTimelineStep {
  id: string;
  title: string;
  offsetMinutes: number;
  durationMinutes: number;
  isCompleted: boolean;
  description?: string;
}

export interface LiveTimelineProjection {
  eventId: string;
  title: string;
  date: string;
  startTime: string;
  endTime: string;
  timezone: string;
  currentPhase: 'upcoming' | 'doors_open' | 'active' | 'closing' | 'aftermath';
  humanDrift: string;
  activeStep: LiveTimelineStep | null;
  nextStep: LiveTimelineStep | null;
  timelineSteps: LiveTimelineStep[];
  completedCount: number;
  totalSteps: number;
  confirmedCount: number;
  lastUpdated: string;
}

export interface PublicInviteProjection {
  id: string;
  inviteToken: string;
  title: string;
  date: string;
  startTime: string;
  endTime: string;
  timezone: string;
  locationName: string;
  address: string;
  isTBD: boolean;
  publicPurpose?: string;
  themeColor?: string;
  coverAssetUrl?: string;
  capacity: number;
  status: 'planning' | 'confirmed' | 'live' | 'completed' | 'archived';
  confirmedCount: number;
  isClosed: boolean;
  lastUpdated: string;
}
