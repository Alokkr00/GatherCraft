import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { adjustScheduleWithAICommand } from '@/lib/commands/timeline-commands';
import { getHostIdFromRequest, ApiError } from '@/lib/server/guard';
import { checkRateLimit, getClientIp } from '@/lib/server/rateLimit';

const CommandSchema = z.object({
  eventId: z.string().min(1),
  instruction: z.string().min(1).max(500),
  currentDriftMinutes: z.number().optional(),
});

export async function POST(req: NextRequest) {
  try {
    const ip = getClientIp(req.headers);
    const rate = checkRateLimit(`cmd_schedule_${ip}`, { limit: 10, windowMs: 60 * 1000 });
    if (!rate.allowed) {
      return NextResponse.json(
        { error: 'Too many schedule adjustments requested. Please wait a minute.' },
        { status: 429 }
      );
    }

    const hostId = getHostIdFromRequest(req);
    const body = await req.json();
    const parsed = CommandSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid command payload', details: parsed.error.format() },
        { status: 400 }
      );
    }

    const result = await adjustScheduleWithAICommand({
      eventId: parsed.data.eventId,
      hostId,
      instruction: parsed.data.instruction,
      currentDriftMinutes: parsed.data.currentDriftMinutes,
    });

    return NextResponse.json(result, { status: 200 });
  } catch (error: any) {
    if (error instanceof ApiError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    console.error('API POST /api/commands/schedule-ai error:', error);
    return NextResponse.json(
      { error: 'Internal server error while executing schedule command' },
      { status: 500 }
    );
  }
}
