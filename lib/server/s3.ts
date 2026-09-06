import { S3Client, PutObjectCommand, HeadObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

const isR2Configured = Boolean(
  process.env.CLOUDFLARE_R2_ACCOUNT_ID &&
  process.env.CLOUDFLARE_R2_ACCESS_KEY_ID &&
  process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY &&
  process.env.CLOUDFLARE_R2_BUCKET_NAME
);

const r2Client = isR2Configured
  ? new S3Client({
      region: 'auto',
      endpoint: `https://${process.env.CLOUDFLARE_R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId: process.env.CLOUDFLARE_R2_ACCESS_KEY_ID!,
        secretAccessKey: process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY!,
      },
    })
  : null;

const BUCKET_NAME = process.env.CLOUDFLARE_R2_BUCKET_NAME || 'gathercraft-media';
const CDN_BASE_URL = process.env.CLOUDFLARE_R2_PUBLIC_URL || 'https://media.gathercraft.io';

export async function createPresignedUploadUrl({
  storageKey,
  contentType,
  contentLength,
  expiresInSeconds = 300,
}: {
  storageKey: string;
  contentType: string;
  contentLength?: number;
  expiresInSeconds?: number;
}): Promise<{ uploadUrl: string; cdnUrl: string; isMock: boolean }> {
  const cdnUrl = `${CDN_BASE_URL.replace(/\/$/, '')}/${storageKey}`;

  if (!isR2Configured || !r2Client) {
    // Development fallback mock mode - serves real uploaded files locally with zero card needed
    const mockUrl = `/api/mock-upload?key=${encodeURIComponent(storageKey)}`;
    return {
      uploadUrl: mockUrl,
      cdnUrl: mockUrl,
      isMock: true,
    };
  }

  const command = new PutObjectCommand({
    Bucket: BUCKET_NAME,
    Key: storageKey,
    ContentType: contentType,
    ...(contentLength ? { ContentLength: contentLength } : {}),
  });

  const uploadUrl = await getSignedUrl(r2Client, command, { expiresIn: expiresInSeconds });

  return {
    uploadUrl,
    cdnUrl,
    isMock: false,
  };
}

export async function verifyObjectExists(storageKey: string): Promise<boolean> {
  if (!isR2Configured || !r2Client) {
    return true; // Mock mode assumes success
  }

  try {
    const command = new HeadObjectCommand({
      Bucket: BUCKET_NAME,
      Key: storageKey,
    });
    await r2Client.send(command);
    return true;
  } catch (err: any) {
    if (err.name === 'NotFound' || err.$metadata?.httpStatusCode === 404) {
      return false;
    }
    console.warn(`R2 verifyObjectExists warning for ${storageKey}:`, err);
    return true; // Graceful fallback
  }
}

export async function deleteObject(storageKey: string): Promise<boolean> {
  if (!isR2Configured || !r2Client) {
    return true;
  }

  try {
    const command = new DeleteObjectCommand({
      Bucket: BUCKET_NAME,
      Key: storageKey,
    });
    await r2Client.send(command);
    return true;
  } catch (err) {
    console.error(`R2 deleteObject error for ${storageKey}:`, err);
    return false;
  }
}
