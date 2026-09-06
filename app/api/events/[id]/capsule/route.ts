import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import crypto from 'crypto';

const PublishCapsuleSchema = z.object({
  heroQuote: z.string().max(300).optional(),
  summaryStory: z.string().max(2000).optional(),
  featuredMedia: z.array(z.string()).default([]),
});

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const capsule = await prisma.memoryCapsule.findFirst({
      where: {
        OR: [{ eventId: params.id }, { capsuleToken: params.id }],
      },
      include: {
        event: {
          select: {
            id: true,
            title: true,
            date: true,
            startTime: true,
            endTime: true,
            timezone: true,
            purposeStatement: true,
            rawPurpose: true,
            themeColor: true,
            coverAssetUrl: true,
            guests: {
              select: {
                id: true,
                name: true,
                role: true,
                rsvpStatus: true,
              },
            },
          },
        },
      },
    });

    if (!capsule) {
      return NextResponse.json({ error: 'Memory Capsule not found' }, { status: 404 });
    }

    // Increment views count asynchronously
    prisma.memoryCapsule.update({
      where: { id: capsule.id },
      data: {
        viewsCount: { increment: 1 },
        lastViewedAt: new Date(),
      },
    }).catch(console.error);

    return NextResponse.json({ capsule });
  } catch (error) {
    console.error('Fetch capsule error:', error);
    return NextResponse.json({ error: 'Failed to fetch capsule' }, { status: 500 });
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const raw = await req.json();
    const parsed = PublishCapsuleSchema.safeParse(raw);
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid capsule payload' }, { status: 400 });
    }

    const event = await prisma.event.findUnique({
      where: { id: params.id },
      include: { retrospective: true },
    });

    if (!event) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 });
    }

    const { heroQuote, summaryStory, featuredMedia } = parsed.data;
    const token = crypto.randomUUID().replace(/-/g, '').substring(0, 16);

    const capsule = await prisma.memoryCapsule.upsert({
      where: { eventId: params.id },
      create: {
        eventId: params.id,
        capsuleToken: token,
        isPublished: true,
        heroQuote: heroQuote || event.purposeStatement || 'Gathering on purpose',
        summaryStory: summaryStory || event.retrospective?.whatWorked || 'A night of genuine connection.',
        featuredMedia: featuredMedia,
        publishedAt: new Date(),
      },
      update: {
        isPublished: true,
        heroQuote: heroQuote || undefined,
        summaryStory: summaryStory || undefined,
        featuredMedia: featuredMedia.length > 0 ? featuredMedia : undefined,
        publishedAt: new Date(),
      },
    });

    return NextResponse.json({ capsule, shareUrl: `/capsule/${capsule.capsuleToken}` });
  } catch (error) {
    console.error('Publish capsule error:', error);
    return NextResponse.json({ error: 'Failed to publish capsule' }, { status: 500 });
  }
}
