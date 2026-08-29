import { NextRequest, NextResponse } from 'next/server';
import { getBudgetItemsServer, saveBudgetItemServer, deleteBudgetItemServer } from '@/lib/server/store';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const budget = await getBudgetItemsServer(params.id);
    return NextResponse.json({ budget });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch budget' }, { status: 500 });
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await req.json();
    const item = await saveBudgetItemServer({ ...body, eventId: params.id });
    return NextResponse.json({ budgetItem: item }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to save budget item' }, { status: 500 });
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

    const deleted = await deleteBudgetItemServer(itemId);
    return NextResponse.json({ success: deleted });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete budget item' }, { status: 500 });
  }
}
