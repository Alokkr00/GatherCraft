import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

import { checkRateLimit, getClientIp } from '@/lib/server/rateLimit';

const UPLOAD_DIR = path.resolve(process.cwd(), '.data', 'uploads');
const MAX_UPLOAD_SIZE = 15 * 1024 * 1024; // 15MB

export const dynamic = 'force-dynamic';

export async function PUT(req: NextRequest) {
  try {
    const ip = getClientIp(req.headers);
    const rate = checkRateLimit(`mock_upload_${ip}`, { limit: 60, windowMs: 60 * 1000 });
    if (!rate.allowed) {
      return new NextResponse('Rate limit exceeded', { status: 429 });
    }

    const { searchParams } = new URL(req.url);
    const key = searchParams.get('key');
    if (!key) return new NextResponse('Missing key', { status: 400 });

    const contentLength = Number(req.headers.get('content-length') || 0);
    if (contentLength > MAX_UPLOAD_SIZE) {
      return new NextResponse('Payload too large. Max 15MB allowed.', { status: 413 });
    }

    const safeKey = key.replace(/[^a-zA-Z0-9_.-]/g, '_');
    const targetFile = path.resolve(UPLOAD_DIR, safeKey);

    // Prevent path traversal outside of UPLOAD_DIR
    if (!targetFile.startsWith(UPLOAD_DIR)) {
      return new NextResponse('Invalid storage key', { status: 400 });
    }

    const dir = path.dirname(targetFile);
    await fs.promises.mkdir(dir, { recursive: true });

    const arrayBuffer = await req.arrayBuffer();
    if (arrayBuffer.byteLength > MAX_UPLOAD_SIZE) {
      return new NextResponse('Payload too large. Max 15MB allowed.', { status: 413 });
    }

    await fs.promises.writeFile(targetFile, Buffer.from(arrayBuffer));

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

    const safeKey = key.replace(/[^a-zA-Z0-9_.-]/g, '_');
    const targetFile = path.resolve(UPLOAD_DIR, safeKey);

    // Prevent path traversal outside of UPLOAD_DIR
    if (!targetFile.startsWith(UPLOAD_DIR)) {
      return new NextResponse('Invalid storage key', { status: 400 });
    }

    try {
      const buffer = await fs.promises.readFile(targetFile);
      return new NextResponse(buffer, {
        headers: {
          'Content-Type': 'image/webp',
          'Cache-Control': 'public, max-age=31536000, immutable',
        },
      });
    } catch {
      // Fallback placeholder image if not found
      const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400" viewBox="0 0 400 400"><rect width="400" height="400" fill="#1e1b4b"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="#818cf8" font-family="sans-serif" font-size="20">GatherCraft Memory</text></svg>`;
      return new NextResponse(svg, {
        headers: { 'Content-Type': 'image/svg+xml' },
      });
    }
  } catch (err) {
    console.error('Mock upload GET error:', err);
    return new NextResponse('Internal error', { status: 500 });
  }
}
