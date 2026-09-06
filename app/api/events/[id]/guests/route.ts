import { NextRequest, NextResponse } from 'next/server';
import { getGuestsServer, saveGuestServer, deleteGuestServer } from '@/lib/server/store';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const guests = await getGuestsServer(params.id);
    return NextResponse.json({ guests });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch guests' }, { status: 500 });
  }
}

import { z } from 'zod';

const GuestSchema = z.object({
  id: z.string().optional(),
  name: z.string().trim().min(1, 'Name is required').max(100),
  email: z.string().trim().email().optional().or(z.literal('')),
  phone: z.string().trim().max(30).optional().or(z.literal('')),
  rsvpStatus: z.enum(['yes', 'no', 'maybe', 'pending']).default('pending'),
  role: z.enum(['guest', 'co-host', 'helper', 'vip']).default('guest'),
  plusOnesAllowed: z.coerce.number().int().min(0).max(10).default(0),
  plusOnesActual: z.coerce.number().int().min(0).max(10).default(0),
  dietary: z.string().trim().max(300).optional().or(z.literal('')),
  accessibility: z.string().trim().max(300).optional().or(z.literal('')),
  notes: z.string().trim().max(500).optional().or(z.literal('')),
  checkInAt: z.string().optional().nullable(),
});

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const raw = await req.json();
    const parsed = GuestSchema.safeParse(raw);
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid guest payload', details: parsed.error.format() }, { status: 400 });
    }
    const guest = await saveGuestServer({
      ...parsed.data,
      eventId: params.id,
      checkInAt: parsed.data.checkInAt ?? undefined,
    });
    return NextResponse.json({ guest }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to save guest' }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { searchParams } = new URL(req.url);
    const guestId = searchParams.get('guestId');
    if (!guestId) return NextResponse.json({ error: 'Guest ID required' }, { status: 400 });

    const deleted = await deleteGuestServer(guestId);
    return NextResponse.json({ success: deleted });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete guest' }, { status: 500 });
  }
}
