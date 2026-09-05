import { 
  getEventByIdServer, getGuestsServer, getTimelineItemsServer, 
  getTasksServer, getBudgetItemsServer 
} from '@/lib/server/store';
import { getActiveTimelineStep, TimelineStatusResult } from '@/lib/event-time';

export interface EventOperationalContext {
  event: {
    id: string;
    title: string;
    date: string;
    startTime: string;
    endTime: string;
    purpose?: string;
    capacity: number;
  };
  attendance: {
    totalInvited: number;
    confirmedHeadcount: number;
    checkedInCount: number;
    dietaryRestrictions: string[];
  };
  timeline: TimelineStatusResult;
  tasks: {
    total: number;
    completed: number;
    pendingUrgent: number;
  };
  budget: {
    totalBudget: number;
    plannedSpent: number;
    actualSpent: number;
  };
}

/**
 * Builds a unified, privacy-safe operational context for AI prompts and host intelligence.
 * Statically aggregates real-time event status while strictly excluding personal identifiers.
 */
export async function buildEventContext(eventId: string): Promise<EventOperationalContext | null> {
  const [event, guests, timeline, tasks, budget] = await Promise.all([
    getEventByIdServer(eventId),
    getGuestsServer(eventId),
    getTimelineItemsServer(eventId),
    getTasksServer(eventId),
    getBudgetItemsServer(eventId)
  ]);

  if (!event) return null;

  const confirmedGuests = guests.filter(g => g.rsvpStatus === 'yes');
  const confirmedHeadcount = confirmedGuests.reduce((acc, g) => acc + 1 + (g.plusOnesActual || 0), 0);
  const checkedInCount = guests.filter(g => Boolean(g.checkInAt)).reduce((acc, g) => acc + 1 + (g.plusOnesActual || 0), 0);

  const dietaryList = Array.from(
    new Set(
      guests
        .map(g => g.dietary?.trim())
        .filter((d): d is string => typeof d === 'string' && d.length > 0 && d.toLowerCase() !== 'none')
    )
  );

  const timelineStatus = getActiveTimelineStep(event.date, event.startTime, timeline);

  const pendingUrgentTasks = tasks.filter(t => t.priority === 'high' && t.status !== 'done').length;
  const completedTasks = tasks.filter(t => t.status === 'done').length;

  const plannedSpent = budget.reduce((sum, b) => sum + (b.plannedAmount || 0), 0);
  const actualSpent = budget.reduce((sum, b) => sum + (b.actualAmount || 0), 0);

  return {
    event: {
      id: event.id,
      title: event.title,
      date: event.date,
      startTime: event.startTime,
      endTime: event.endTime,
      purpose: event.purpose?.selectedStatement || event.purpose?.rawInput,
      capacity: event.capacity || 20
    },
    attendance: {
      totalInvited: guests.length,
      confirmedHeadcount,
      checkedInCount,
      dietaryRestrictions: dietaryList
    },
    timeline: timelineStatus,
    tasks: {
      total: tasks.length,
      completed: completedTasks,
      pendingUrgent: pendingUrgentTasks
    },
    budget: {
      totalBudget: event.totalBudget || 0,
      plannedSpent,
      actualSpent
    }
  };
}
