import { NextRequest, NextResponse } from 'next/server';
import { getEventByIdServer, saveEventServer, deleteEventServer } from '@/lib/server/store';
import { getHostIdFromRequest, requireEventAccess, ApiError } from '@/lib/server/guard';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const event = await getEventByIdServer(params.id);
    if (!event) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 });
    }
    return NextResponse.json({ event });
  } catch (error) {
    console.error(`API GET /api/events/${params.id} error:`, error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const hostId = getHostIdFromRequest(req);
    await requireEventAccess(params.id, hostId, 'owner');

    const body = await req.json();
    const event = await saveEventServer({ ...body, id: params.id });
    return NextResponse.json({ event });
  } catch (error: any) {
    if (error instanceof ApiError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    console.error(`API PUT /api/events/${params.id} error:`, error);
    return NextResponse.json({ error: 'Failed to update event' }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const hostId = getHostIdFromRequest(req);
    await requireEventAccess(params.id, hostId, 'owner');

    const deleted = await deleteEventServer(params.id);
    if (!deleted) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true });
  } catch (error: any) {
    if (error instanceof ApiError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    console.error(`API DELETE /api/events/${params.id} error:`, error);
    return NextResponse.json({ error: 'Failed to delete event' }, { status: 500 });
  }
}
