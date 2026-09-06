import { NextRequest, NextResponse } from 'next/server';

export async function PUT(req: NextRequest) {
  // In development mock mode, accept the binary stream and return 200 OK
  return new NextResponse(null, { status: 200 });
}
