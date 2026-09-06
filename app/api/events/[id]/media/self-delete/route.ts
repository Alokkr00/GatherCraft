import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';

const SelfDeleteSchema = z.object({
  assetId: z.string().min(1),
  reason: z.string().optional().default('guest_self_removal'),
});

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const raw = await req.json();
    const parsed = SelfDeleteSchema.safeParse(raw);
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
    }

    const asset = await prisma.mediaAsset.findUnique({
      where: { id: parsed.data.assetId },
    });

    if (!asset || asset.eventId !== params.id) {
      return NextResponse.json({ error: 'Asset not found' }, { status: 404 });
    }

    // Instant, atomic soft-delete: vanishes from public/shared gallery immediately
    const updated = await prisma.mediaAsset.update({
      where: { id: asset.id },
      data: {
        isFlaggedHidden: true,
        status: 'FLAGGED_HIDDEN',
        selfRemovedAt: new Date(),
        moderationReason: parsed.data.reason,
        updatedAt: new Date(),
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Photo removed from the shared gallery immediately.',
      assetId: updated.id,
    });
  } catch (error) {
    console.error('Self-delete media error:', error);
    return NextResponse.json({ error: 'Failed to process removal request' }, { status: 500 });
  }
}
