import { NextRequest, NextResponse } from 'next/server';
import { getShoppingItemsServer, saveShoppingItemServer, deleteShoppingItemServer } from '@/lib/server/store';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const shopping = await getShoppingItemsServer(params.id);
    return NextResponse.json({ shopping });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch shopping items' }, { status: 500 });
  }
}

import { getHostIdFromRequest, requireEventAccess, ApiError } from '@/lib/server/guard';

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const hostId = getHostIdFromRequest(req);
    await requireEventAccess(params.id, hostId, 'cohost');

    const body = await req.json();
    const item = await saveShoppingItemServer({ ...body, eventId: params.id });
    return NextResponse.json({ shoppingItem: item }, { status: 201 });
  } catch (error: any) {
    if (error instanceof ApiError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    return NextResponse.json({ error: 'Failed to save shopping item' }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const hostId = getHostIdFromRequest(req);
    await requireEventAccess(params.id, hostId, 'cohost');

    const { searchParams } = new URL(req.url);
    const itemId = searchParams.get('itemId');
    if (!itemId) return NextResponse.json({ error: 'Item ID required' }, { status: 400 });

    const deleted = await deleteShoppingItemServer(itemId, params.id);
    return NextResponse.json({ success: deleted });
  } catch (error: any) {
    if (error instanceof ApiError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    return NextResponse.json({ error: 'Failed to delete shopping item' }, { status: 500 });
  }
}
