import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { checkRateLimit, getClientIp } from '@/lib/server/rateLimit';

const ChatMessageSchema = z.object({
  authorName: z.string().trim().min(1).max(80),
  content: z.string().trim().min(1).max(1000),
  guestId: z.string().optional(),
  senderRole: z.enum(['host', 'co-host', 'guest']).default('guest'),
  phase: z.enum(['PLANNING', 'LIVE', 'GRATITUDE', 'ARCHIVED']).default('PLANNING'),
  isBroadcast: z.boolean().default(false),
});

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const messages = await prisma.chatMessage.findMany({
      where: {
        eventId: params.id,
        isMuted: false,
        deletedAt: null,
      },
      orderBy: { createdAt: 'asc' },
      take: 150,
    });

    return NextResponse.json({ messages });
  } catch (error) {
    console.error('Fetch chat error:', error);
    return NextResponse.json({ error: 'Failed to fetch messages' }, { status: 500 });
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const ip = getClientIp(req.headers);
    const rate = checkRateLimit(`chat_${params.id}_${ip}`, { limit: 30, windowMs: 60 * 1000 });
    if (!rate.allowed) {
      return NextResponse.json({ error: 'Sending too quickly. Please pause a moment.' }, { status: 429 });
    }

    const raw = await req.json();
    const parsed = ChatMessageSchema.safeParse(raw);
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid message', details: parsed.error.format() }, { status: 400 });
    }

    const { authorName, content, guestId, senderRole, phase, isBroadcast } = parsed.data;

    const message = await prisma.chatMessage.create({
      data: {
        eventId: params.id,
        senderGuestId: guestId || null,
        senderName: authorName,
        senderRole,
        content,
        phase,
        isBroadcast,
        clientIpHash: ip,
      },
    });

    return NextResponse.json({ message }, { status: 201 });
  } catch (error) {
    console.error('Post chat error:', error);
    return NextResponse.json({ error: 'Failed to post message' }, { status: 500 });
  }
}
