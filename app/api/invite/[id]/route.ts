import { NextRequest, NextResponse } from 'next/server';
import { getPublicInviteServer } from '@/lib/server/store';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const invite = await getPublicInviteServer(params.id);
    if (!invite) {
      return NextResponse.json({ error: 'Invitation not found' }, { status: 404 });
    }
    return NextResponse.json({ invite });
  } catch (error) {
    console.error(`API GET /api/invite/${params.id} error:`, error);
    return NextResponse.json({ error: 'Failed to load invitation' }, { status: 500 });
  }
}
