import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const UPLOAD_DIR = path.join(process.cwd(), '.data', 'uploads');

export const dynamic = 'force-dynamic';

export async function PUT(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const key = searchParams.get('key');
    if (!key) return new NextResponse('Missing key', { status: 400 });

    const safeKey = key.replace(/[/\\]/g, '_');
    const targetFile = path.join(UPLOAD_DIR, safeKey);
    const dir = path.dirname(targetFile);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

    const arrayBuffer = await req.arrayBuffer();
    fs.writeFileSync(targetFile, Buffer.from(arrayBuffer));

    return new NextResponse(null, { status: 200 });
  } catch (err) {
    console.error('Mock upload PUT error:', err);
    return new NextResponse('Internal error', { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const key = searchParams.get('key');
    if (!key) return new NextResponse('Missing key', { status: 400 });

    const safeKey = key.replace(/[/\\]/g, '_');
    const targetFile = path.join(UPLOAD_DIR, safeKey);

    if (!fs.existsSync(targetFile)) {
      // Fallback placeholder image
      const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400" viewBox="0 0 400 400"><rect width="400" height="400" fill="#1e1b4b"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="#818cf8" font-family="sans-serif" font-size="20">GatherCraft Memory</text></svg>`;
      return new NextResponse(svg, {
        headers: { 'Content-Type': 'image/svg+xml' },
      });
    }

    const buffer = fs.readFileSync(targetFile);
    return new NextResponse(buffer, {
      headers: {
        'Content-Type': 'image/webp',
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    });
  } catch (err) {
    console.error('Mock upload GET error:', err);
    return new NextResponse('Internal error', { status: 500 });
  }
}
