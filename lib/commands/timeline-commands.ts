import { revalidateTag } from 'next/cache';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { prisma } from '@/lib/prisma';
import { requireEventAccess } from '@/lib/server/guard';
import { TimelineItem } from '@/lib/types';

export interface ScheduleAdjustmentInput {
  eventId: string;
  hostId?: string | null;
  instruction: string; // e.g. "We started 25 minutes late, compress dinner by 10 mins so we still have time for dessert"
  currentDriftMinutes?: number;
}

export interface ScheduleAdjustmentResult {
  success: boolean;
  message: string;
  coherenceStatus: 'coherent' | 'tension_detected';
  coherenceNotes: string[];
  updatedSteps: Array<{
    id: string;
    title: string;
    offsetMinutes: number;
    durationMinutes: number;
  }>;
}

/**
 * Command Handler: Rebalances the live event schedule using Gemini AI
 * within transactional integrity, evaluates Mandala coherence, and purges Edge projections.
 */
export async function adjustScheduleWithAICommand(
  input: ScheduleAdjustmentInput
): Promise<ScheduleAdjustmentResult> {
  const { eventId, hostId, instruction } = input;

  // 1. Authorization Guard: Ensure caller has host or co-host authority
  const event = await requireEventAccess(eventId, hostId, 'cohost');

  // 2. Fetch current timeline items from primary database
  const timelineRecords = await prisma.timelineItem.findMany({
    where: { eventId },
    orderBy: { offsetMinutes: 'asc' },
  });

  if (timelineRecords.length === 0) {
    return {
      success: false,
      message: 'No timeline steps exist for this event to adjust.',
      coherenceStatus: 'coherent',
      coherenceNotes: [],
      updatedSteps: [],
    };
  }

  // 3. Prepare AI Prompt with Purpose context and current run-of-show
  const apiKey = process.env.GEMINI_API_KEY;
  let rebalancedSteps = timelineRecords.map(t => ({
    id: t.id,
    title: t.title,
    offsetMinutes: t.offsetMinutes,
    durationMinutes: t.durationMinutes,
  }));
  let aiMessage = 'Schedule rebalanced automatically.';

  if (apiKey) {
    try {
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

      const prompt = `You are a live event director. The host wants to dynamically adjust their party run-of-show.

Event Purpose: "${event.purpose?.selectedStatement || event.purpose?.rawInput || 'Bringing people together'}"
Current Timeline:
${JSON.stringify(rebalancedSteps, null, 2)}

Host's Live Directive: "${instruction}"

Instructions:
1. Rebalance offsetMinutes and durationMinutes for each step to satisfy the host's directive.
2. Keep step IDs intact.
3. Return ONLY valid JSON with this schema:
{
  "message": "1-sentence explanation of what was adjusted",
  "steps": [
    { "id": "string", "title": "string", "offsetMinutes": number, "durationMinutes": number }
  ]
}`;

      const res = await model.generateContent(prompt);
      const text = res.response.text().trim();
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        if (Array.isArray(parsed.steps) && parsed.steps.length === timelineRecords.length) {
          rebalancedSteps = parsed.steps;
          aiMessage = parsed.message || aiMessage;
        }
      }
    } catch (err) {
      console.warn('Gemini schedule rebalancing failed, applying algorithmic cascade fallback:', err);
      // Algorithmic fallback: shift uncompleted steps forward by drift
      const shift = Math.min(60, Math.max(-60, input.currentDriftMinutes || 15));
      rebalancedSteps = timelineRecords.map(t => ({
        id: t.id,
        title: t.title,
        offsetMinutes: t.isCompleted ? t.offsetMinutes : Math.max(0, t.offsetMinutes + shift),
        durationMinutes: t.durationMinutes,
      }));
      aiMessage = `Adjusted uncompleted steps by ${shift > 0 ? `+${shift}` : shift} minutes.`;
    }
  } else {
    // Deterministic fallback when no API key is present
    const shift = 15;
    rebalancedSteps = timelineRecords.map(t => ({
      id: t.id,
      title: t.title,
      offsetMinutes: t.isCompleted ? t.offsetMinutes : t.offsetMinutes + shift,
      durationMinutes: t.durationMinutes,
    }));
    aiMessage = `Shifted upcoming steps by +${shift} minutes to accommodate delay.`;
  }

  // 4. Mandala Coherence Engine Evaluation (Pre-Commit Guard)
  const coherenceNotes: string[] = [];
  let coherenceStatus: ScheduleAdjustmentResult['coherenceStatus'] = 'coherent';

  const totalEventDurationMinutes = 180; // Default 3 hours
  const totalScheduledMinutes = rebalancedSteps.reduce((sum, s) => sum + s.durationMinutes, 0);

  if (totalScheduledMinutes > totalEventDurationMinutes * 0.8) {
    coherenceStatus = 'tension_detected';
    coherenceNotes.push(
      'Schedule density is very high (>80% of event is programmed), leaving limited organic conversation buffers.'
    );
  }

  // 5. Atomic Prisma $transaction Commit
  await prisma.$transaction([
    ...rebalancedSteps.map(step =>
      prisma.timelineItem.update({
        where: { id: step.id },
        data: {
          offsetMinutes: step.offsetMinutes,
          durationMinutes: step.durationMinutes,
          updatedAt: new Date(),
        },
      })
    ),
    prisma.event.update({
      where: { id: eventId },
      data: { updatedAt: new Date() },
    }),
  ]);

  // 6. Edge Invalidation: Instant purge of Edge POP caches
  revalidateTag(`event-${eventId}-timeline`);
  revalidateTag(`event-${eventId}`);

  return {
    success: true,
    message: aiMessage,
    coherenceStatus,
    coherenceNotes,
    updatedSteps: rebalancedSteps,
  };
}
