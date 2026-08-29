import { NextRequest, NextResponse } from 'next/server';
import { getTimelineItemsServer, saveTimelineItemServer, deleteTimelineItemServer } from '@/lib/server/store';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const items = await getTimelineItemsServer(params.id);
    return NextResponse.json({ timeline: items });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch timeline' }, { status: 500 });
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await req.json();
    const item = await saveTimelineItemServer({ ...body, eventId: params.id });
    return NextResponse.json({ timelineItem: item }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to save timeline item' }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { searchParams } = new URL(req.url);
    const itemId = searchParams.get('itemId');
    if (!itemId) return NextResponse.json({ error: 'Item ID required' }, { status: 400 });

    const deleted = await deleteTimelineItemServer(itemId);
    return NextResponse.json({ success: deleted });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete timeline item' }, { status: 500 });
  }
}
