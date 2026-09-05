import { TimelineItem } from './types';

export interface TimelineStatusResult {
  activeStep: TimelineItem | null;
  nextStep: TimelineItem | null;
  status: 'before-event' | 'in-progress' | 'complete';
  driftMinutes: number;
  humanDrift: string;
}

/**
 * Formats schedule drift into human-readable glanceable text for the host HUD.
 */
export function formatDrift(driftMinutes: number): string {
  if (driftMinutes > 5) {
    return `+${driftMinutes}m behind schedule`;
  }
  if (driftMinutes < -5) {
    return `${Math.abs(driftMinutes)}m ahead of schedule`;
  }
  return 'On schedule';
}

/**
 * Time-aware timeline status calculator.
 * Determines the current active milestone, upcoming activity, and schedule drift
 * based on wall-clock time and milestone durations.
 */
export function getActiveTimelineStep(
  eventDate: string,
  startTime: string,
  timeline: TimelineItem[],
  now: Date = new Date()
): TimelineStatusResult {
  if (!timeline || timeline.length === 0) {
    return {
      activeStep: null,
      nextStep: null,
      status: 'complete',
      driftMinutes: 0,
      humanDrift: 'No timeline scheduled'
    };
  }

  // Sort chronological by offset
  const sorted = [...timeline].sort((a, b) => a.offsetMinutes - b.offsetMinutes);

  // Parse start time
  const cleanStartTime = (startTime || '18:00').split(' ')[0];
  const eventStart = new Date(`${eventDate}T${cleanStartTime}:00`);

  if (isNaN(eventStart.getTime())) {
    // Fallback if date parsing fails: use manual completion state
    const manualActive = sorted.find(t => !t.isCompleted) || null;
    const manualNext = manualActive 
      ? sorted.find(t => t.offsetMinutes > manualActive.offsetMinutes && !t.isCompleted) || null 
      : null;
    return {
      activeStep: manualActive,
      nextStep: manualNext,
      status: manualActive ? 'in-progress' : 'complete',
      driftMinutes: 0,
      humanDrift: 'Manual run-of-show active'
    };
  }

  const elapsedMs = now.getTime() - eventStart.getTime();
  const currentOffsetMinutes = Math.floor(elapsedMs / (60 * 1000));

  // Event hasn't started yet
  if (currentOffsetMinutes < sorted[0].offsetMinutes) {
    return {
      activeStep: null,
      nextStep: sorted[0],
      status: 'before-event',
      driftMinutes: 0,
      humanDrift: `Starts in ${Math.abs(currentOffsetMinutes)}m`
    };
  }

  // Find active step based on time window
  const activeStep = sorted.find(step => {
    const start = step.offsetMinutes;
    const end = start + (step.durationMinutes || 30);
    return currentOffsetMinutes >= start && currentOffsetMinutes < end;
  });

  if (activeStep) {
    const end = activeStep.offsetMinutes + (activeStep.durationMinutes || 30);
    const drift = Math.max(0, currentOffsetMinutes - end);
    const nextStep = sorted.find(s => s.offsetMinutes > activeStep.offsetMinutes) || null;

    return {
      activeStep,
      nextStep,
      status: 'in-progress',
      driftMinutes: drift,
      humanDrift: formatDrift(drift)
    };
  }

  // Check if past all steps
  const lastStep = sorted[sorted.length - 1];
  const lastEnd = lastStep.offsetMinutes + (lastStep.durationMinutes || 30);

  if (currentOffsetMinutes >= lastEnd) {
    return {
      activeStep: null,
      nextStep: null,
      status: 'complete',
      driftMinutes: 0,
      humanDrift: 'Event scheduled time complete'
    };
  }

  // Between steps or fallback
  const upcomingStep = sorted.find(s => s.offsetMinutes > currentOffsetMinutes) || null;
  const previousStep = [...sorted].reverse().find(s => s.offsetMinutes <= currentOffsetMinutes) || null;

  return {
    activeStep: previousStep,
    nextStep: upcomingStep,
    status: 'in-progress',
    driftMinutes: 0,
    humanDrift: 'Transitioning between milestones'
  };
}
