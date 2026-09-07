import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getHostIdFromRequest, requireEventAccess, ApiError } from '@/lib/server/guard';
import { prismaToGuest } from '@/lib/server/store';
import { z } from 'zod';

const CheckInSchema = z.object({
  checkInAt: z.string().nullable().optional(),
});

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string; guestId: string } }
) {
  try {
    const hostId = getHostIdFromRequest(req);
    await requireEventAccess(params.id, hostId, 'cohost');

    const raw = await req.json().catch(() => ({}));
    const parsed = CheckInSchema.safeParse(raw);
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid check-in payload', details: parsed.error.format() }, { status: 400 });
    }

    const guest = await prisma.guest.findFirst({
      where: {
        id: params.guestId,
        eventId: params.id,
      },
    });

    if (!guest) {
      return NextResponse.json({ error: 'Guest not found' }, { status: 404 });
    }

    const updated = await prisma.guest.update({
      where: { id: guest.id },
      data: {
        checkInAt: parsed.data.checkInAt ? new Date(parsed.data.checkInAt) : null,
      },
    });

    return NextResponse.json({ success: true, guest: prismaToGuest(updated) });
  } catch (error: any) {
    if (error instanceof ApiError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    console.error(`API PATCH /api/events/${params.id}/guests/${params.guestId}/checkin error:`, error);
    return NextResponse.json({ error: 'Failed to update check-in status' }, { status: 500 });
  }
}
