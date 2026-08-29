import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getEventsServer, saveEventServer } from '@/lib/server/store';
import { checkRateLimit, getClientIp } from '@/lib/server/rateLimit';

const CreateEventSchema = z.object({
  id: z.string().optional(),
  title: z.string().min(1).max(120),
  ownerId: z.string().optional(),
  templateId: z.string().optional(),
  status: z.enum(['draft', 'planning', 'confirmed', 'live', 'completed', 'archived']).optional(),
  purpose: z.object({
    rawInput: z.string().max(600).optional().default(''),
    selectedStatement: z.string().max(600).optional().default(''),
    suggestions: z.object({
      warm: z.string().optional(),
      bold: z.string().optional(),
      minimal: z.string().optional(),
    }).optional(),
    successCriteria: z.array(z.string()).optional().default([]),
    isPrivate: z.boolean().optional().default(false),
  }).optional(),
  date: z.string().optional(),
  startTime: z.string().optional(),
  endTime: z.string().optional(),
  timezone: z.string().optional(),
  location: z.object({
    name: z.string().max(200).optional(),
    address: z.string().max(300).optional().default(''),
    notes: z.string().max(500).optional(),
    isTBD: z.boolean().optional().default(true),
  }).optional(),
  capacity: z.number().min(1).max(1000).optional(),
  totalBudget: z.number().min(0).max(1000000).optional(),
  currency: z.string().max(10).optional(),
  coverAssetUrl: z.string().optional(),
  themeColor: z.string().optional(),
});

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const ownerId = searchParams.get('ownerId') || undefined;
    const events = await getEventsServer(ownerId);
    return NextResponse.json({ events });
  } catch (error) {
    console.error('API GET /api/events error:', error);
    return NextResponse.json({ error: 'Failed to fetch events' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const ip = getClientIp(req.headers);
    const rate = checkRateLimit(`event_create_${ip}`, { limit: 20, windowMs: 60 * 1000 });
    if (!rate.allowed) {
      return NextResponse.json({ error: 'Too many requests. Please wait a minute.' }, { status: 429 });
    }

    const body = await req.json();
    const parsed = CreateEventSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid event data', details: parsed.error.format() }, { status: 400 });
    }

    const event = await saveEventServer(parsed.data as any);
    return NextResponse.json({ event }, { status: 201 });
  } catch (error) {
    console.error('API POST /api/events error:', error);
    return NextResponse.json({ error: 'Failed to create event' }, { status: 500 });
  }
}
