import { NextRequest, NextResponse } from 'next/server';
import { getLiveTimelineProjection } from '@/lib/projections/builder';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const projection = await getLiveTimelineProjection(params.id);

    if (!projection) {
      return NextResponse.json(
        { error: 'Timeline projection not found' },
        { status: 404 }
      );
    }

    const response = NextResponse.json({ timeline: projection }, { status: 200 });

    // Edge & CDN Caching Headers: Single-digit millisecond response on Vercel Edge POPs
    response.headers.set(
      'Cache-Control',
      'public, s-maxage=10, stale-while-revalidate=59'
    );
    response.headers.set(
      'CDN-Cache-Control',
      'public, s-maxage=10, stale-while-revalidate=59'
    );
    response.headers.set('X-GatherCraft-Edge', '1');

    return response;
  } catch (error) {
    console.error(`API GET /api/edge/timeline/${params.id} error:`, error);
    return NextResponse.json(
      { error: 'Failed to load timeline projection' },
      { status: 500 }
    );
  }
}
