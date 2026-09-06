import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { createPresignedUploadUrl } from '@/lib/server/s3';
import { checkRateLimit, getClientIp } from '@/lib/server/rateLimit';

const ALLOWED_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/heic',
  'image/avif',
  'video/mp4',
  'video/quicktime',
] as const;

const MIME_TO_EXT: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'image/heic': 'heic',
  'image/avif': 'avif',
  'video/mp4': 'mp4',
  'video/quicktime': 'mov',
};

const PresignSchema = z.object({
  fileName: z.string().min(1).max(255),
  fileSize: z.number().int().positive().max(52428800), // Max 50MB
  mimeType: z.enum(ALLOWED_MIME_TYPES),
  uploaderName: z.string().trim().min(1).max(100).default('Guest'),
  guestToken: z.string().optional(),
  guestId: z.string().optional(),
  purposeTag: z.string().max(100).optional(),
  caption: z.string().max(250).optional(),
  blurHash: z.string().max(1000).optional(),
  width: z.number().int().positive().optional(),
  height: z.number().int().positive().optional(),
  visibilityTier: z.enum(['HOST_VAULT', 'SHARED_ALBUM', 'PUBLIC_REEL']).default('SHARED_ALBUM'),
});

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const ip = getClientIp(req.headers);
    const rate = checkRateLimit(`presign_${params.id}_${ip}`, { limit: 60, windowMs: 60 * 1000 });
    if (!rate.allowed) {
      return NextResponse.json({ error: 'Too many upload requests. Please slow down.' }, { status: 429 });
    }

    const event = await prisma.event.findUnique({
      where: { id: params.id },
      select: { id: true, status: true },
    });

    if (!event) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 });
    }

    const raw = await req.json();
    const parsed = PresignSchema.safeParse(raw);
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid payload: Unsupported media format or oversized file.', details: parsed.error.format() }, { status: 400 });
    }

    const data = parsed.data;
    const assetId = `med_${crypto.randomUUID()}`;
    const ext = MIME_TO_EXT[data.mimeType] || 'webp';
    const storageKey = `events/${params.id}/${assetId}.${ext}`;

    const { uploadUrl, cdnUrl, isMock } = await createPresignedUploadUrl({
      storageKey,
      contentType: data.mimeType,
      contentLength: data.fileSize,
      expiresInSeconds: 300,
    });

    // Create record in database as PENDING_UPLOAD
    const mediaAsset = await prisma.mediaAsset.create({
      data: {
        id: assetId,
        eventId: params.id,
        uploaderGuestId: data.guestId || null,
        uploaderName: data.uploaderName,
        storageKey,
        cdnUrl,
        blurHash: data.blurHash || null,
        mimeType: data.mimeType,
        sizeBytes: data.fileSize,
        width: data.width || null,
        height: data.height || null,
        purposeTag: data.purposeTag || null,
        caption: data.caption || null,
        visibilityTier: data.visibilityTier,
        status: isMock ? 'READY' : 'PENDING_UPLOAD',
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30-day retention
      },
    });

    return NextResponse.json({
      assetId: mediaAsset.id,
      uploadUrl,
      cdnUrl: mediaAsset.cdnUrl,
      isMock,
    }, { status: 201 });
  } catch (error: any) {
    console.error('Presign media error:', error);
    return NextResponse.json({ error: 'Failed to generate upload URL' }, { status: 500 });
  }
}
