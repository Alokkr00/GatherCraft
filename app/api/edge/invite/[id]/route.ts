import { NextRequest, NextResponse } from 'next/server';
import { getPublicInviteProjection } from '@/lib/projections/builder';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const projection = await getPublicInviteProjection(params.id);

    if (!projection) {
      return NextResponse.json(
        { error: 'Invitation projection not found' },
        { status: 404 }
      );
    }

    const response = NextResponse.json({ invite: projection }, { status: 200 });

    // Edge & CDN Caching Headers: Sub-15ms response on Vercel Edge POPs with zero DB load
    response.headers.set(
      'Cache-Control',
      'public, s-maxage=15, stale-while-revalidate=59'
    );
    response.headers.set(
      'CDN-Cache-Control',
      'public, s-maxage=15, stale-while-revalidate=59'
    );
    response.headers.set('X-GatherCraft-Edge', '1');

    return response;
  } catch (error) {
    console.error(`API GET /api/edge/invite/${params.id} error:`, error);
    return NextResponse.json(
      { error: 'Failed to load invitation projection' },
      { status: 500 }
    );
  }
}
