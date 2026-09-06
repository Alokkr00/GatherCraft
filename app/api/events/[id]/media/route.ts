import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

import { getHostIdFromRequest, requireEventAccess } from '@/lib/server/guard';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { searchParams } = new URL(req.url);
    const requestedTier = searchParams.get('tier') || 'SHARED_ALBUM';

    let allowedTiers: ('HOST_VAULT' | 'SHARED_ALBUM' | 'PUBLIC_REEL')[] = ['SHARED_ALBUM', 'PUBLIC_REEL'];

    if (requestedTier === 'PUBLIC_REEL') {
      allowedTiers = ['PUBLIC_REEL'];
    } else if (requestedTier === 'HOST_VAULT') {
      const hostId = getHostIdFromRequest(req);
      try {
        await requireEventAccess(params.id, hostId, 'owner');
        allowedTiers = ['HOST_VAULT', 'SHARED_ALBUM', 'PUBLIC_REEL'];
      } catch {
        // Fallback to safe shared tiers if not authenticated as host
        allowedTiers = ['SHARED_ALBUM', 'PUBLIC_REEL'];
      }
    }

    const media = await prisma.mediaAsset.findMany({
      where: {
        eventId: params.id,
        isFlaggedHidden: false,
        status: 'READY',
        visibilityTier: { in: allowedTiers },
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
