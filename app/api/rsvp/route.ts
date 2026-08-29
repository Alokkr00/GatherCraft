import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { submitRsvpServer } from '@/lib/server/store';
import { checkRateLimit, getClientIp } from '@/lib/server/rateLimit';

const RsvpSchema = z.object({
  eventIdOrToken: z.string().min(1),
  name: z.string().trim().min(1, 'Name is required').max(100),
  email: z.string().trim().email('Invalid email address').optional().or(z.literal('')),
  phone: z.string().trim().max(30).optional().or(z.literal('')),
  rsvpStatus: z.enum(['yes', 'no', 'maybe']),
  plusOnesActual: z.coerce.number().int().min(0).max(5).default(0),
  dietary: z.string().trim().max(300).optional().or(z.literal('')),
  accessibility: z.string().trim().max(300).optional().or(z.literal('')),
});

export async function POST(req: NextRequest) {
  try {
    const ip = getClientIp(req.headers);
    const rate = checkRateLimit(`rsvp_${ip}`, { limit: 15, windowMs: 60 * 1000 });
    if (!rate.allowed) {
      return NextResponse.json({ error: 'Too many requests. Please wait a moment.' }, { status: 429 });
    }

    const body = await req.json();
    const parsed = RsvpSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ 
        error: 'Invalid RSVP form submission', 
        details: parsed.error.format() 
      }, { status: 400 });
    }

    const result = await submitRsvpServer({
      eventIdOrToken: parsed.data.eventIdOrToken,
      name: parsed.data.name,
      email: parsed.data.email || undefined,
      phone: parsed.data.phone || undefined,
      rsvpStatus: parsed.data.rsvpStatus,
      plusOnesActual: parsed.data.plusOnesActual,
      dietary: parsed.data.dietary || undefined,
      accessibility: parsed.data.accessibility || undefined,
    });

    if (!result.success) {
      return NextResponse.json({ error: result.error || 'Failed to process RSVP' }, { status: 400 });
    }

    return NextResponse.json({ 
      success: true, 
      guest: result.guest, 
      waitlisted: result.waitlisted 
    }, { status: 200 });
  } catch (error) {
    console.error('API POST /api/rsvp error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
