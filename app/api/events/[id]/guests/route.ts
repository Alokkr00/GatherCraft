import { NextRequest, NextResponse } from 'next/server';
import { getGuestsServer, saveGuestServer, deleteGuestServer } from '@/lib/server/store';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const guests = await getGuestsServer(params.id);
    return NextResponse.json({ guests });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch guests' }, { status: 500 });
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await req.json();
    const guest = await saveGuestServer({ ...body, eventId: params.id });
    return NextResponse.json({ guest }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to save guest' }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { searchParams } = new URL(req.url);
    const guestId = searchParams.get('guestId');
    if (!guestId) return NextResponse.json({ error: 'Guest ID required' }, { status: 400 });

    const deleted = await deleteGuestServer(guestId);
    return NextResponse.json({ success: deleted });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete guest' }, { status: 500 });
  }
}
