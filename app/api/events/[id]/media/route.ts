import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { searchParams } = new URL(req.url);
    const tier = searchParams.get('tier') || 'SHARED_ALBUM';

    const media = await prisma.mediaAsset.findMany({
      where: {
        eventId: params.id,
        isFlaggedHidden: false,
        status: 'READY',
        ...(tier === 'SHARED_ALBUM'
          ? { visibilityTier: { in: ['SHARED_ALBUM', 'PUBLIC_REEL'] } }
          : tier === 'PUBLIC_REEL'
          ? { visibilityTier: 'PUBLIC_REEL' }
          : {}),
      },
      orderBy: { createdAt: 'desc' },
      take: 100,
    });

    return NextResponse.json({ media });
  } catch (error) {
    console.error('Fetch media error:', error);
    return NextResponse.json({ error: 'Failed to fetch media assets' }, { status: 500 });
  }
}
