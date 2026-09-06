import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { verifyObjectExists } from '@/lib/server/s3';

const CompleteSchema = z.object({
  assetId: z.string().min(1),
});

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const raw = await req.json();
    const parsed = CompleteSchema.safeParse(raw);
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
    }

    const asset = await prisma.mediaAsset.findUnique({
      where: { id: parsed.data.assetId },
    });

    if (!asset || asset.eventId !== params.id) {
      return NextResponse.json({ error: 'Asset not found' }, { status: 404 });
    }

    const exists = await verifyObjectExists(asset.storageKey);
    if (!exists) {
      return NextResponse.json({ error: 'Uploaded object not found in storage' }, { status: 400 });
    }

    const updated = await prisma.mediaAsset.update({
      where: { id: asset.id },
      data: {
        status: 'READY',
        updatedAt: new Date(),
      },
    });

    return NextResponse.json({ success: true, asset: updated });
  } catch (error) {
    console.error('Complete media upload error:', error);
    return NextResponse.json({ error: 'Failed to complete upload' }, { status: 500 });
  }
}
