import { S3Client, PutObjectCommand, HeadObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

const endpoint =
  process.env.S3_ENDPOINT ||
  process.env.SUPABASE_STORAGE_ENDPOINT ||
  (process.env.CLOUDFLARE_R2_ACCOUNT_ID
    ? `https://${process.env.CLOUDFLARE_R2_ACCOUNT_ID}.r2.cloudflarestorage.com`
    : undefined);

const accessKeyId =
  process.env.S3_ACCESS_KEY_ID ||
  process.env.SUPABASE_S3_ACCESS_KEY_ID ||
  process.env.CLOUDFLARE_R2_ACCESS_KEY_ID;

const secretAccessKey =
  process.env.S3_SECRET_ACCESS_KEY ||
  process.env.SUPABASE_S3_SECRET_ACCESS_KEY ||
  process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY;

const region = process.env.S3_REGION || 'auto';

const BUCKET_NAME =
  process.env.S3_BUCKET_NAME ||
  process.env.SUPABASE_BUCKET_NAME ||
  process.env.CLOUDFLARE_R2_BUCKET_NAME ||
  'gathercraft-media';

const CDN_BASE_URL =
  process.env.S3_PUBLIC_DOMAIN ||
  process.env.SUPABASE_STORAGE_PUBLIC_URL ||
  process.env.CLOUDFLARE_R2_PUBLIC_DOMAIN ||
  process.env.CLOUDFLARE_R2_PUBLIC_URL ||
  'https://media.gathercraft.io';

const isStorageConfigured = Boolean(endpoint && accessKeyId && secretAccessKey);

const s3Client = isStorageConfigured
  ? new S3Client({
      region,
      endpoint: endpoint!,
      credentials: {
        accessKeyId: accessKeyId!,
        secretAccessKey: secretAccessKey!,
      },
      forcePathStyle: true,
    })
  : null;

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

  if (!isStorageConfigured || !s3Client) {
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

  const uploadUrl = await getSignedUrl(s3Client, command, { expiresIn: expiresInSeconds });

  return {
    uploadUrl,
    cdnUrl,
    isMock: false,
  };
}

export async function verifyObjectExists(storageKey: string): Promise<boolean> {
  if (!isStorageConfigured || !s3Client) {
    return true; // Mock mode assumes success
  }

  try {
    const command = new HeadObjectCommand({
      Bucket: BUCKET_NAME,
      Key: storageKey,
    });
    await s3Client.send(command);
    return true;
  } catch (err: any) {
    if (err.name === 'NotFound' || err.$metadata?.httpStatusCode === 404) {
      return false;
    }
    console.warn(`S3 verifyObjectExists warning for ${storageKey}:`, err);
    return true; // Graceful fallback
  }
}

export async function deleteObject(storageKey: string): Promise<boolean> {
  if (!isStorageConfigured || !s3Client) {
    return true;
  }

  try {
    const command = new DeleteObjectCommand({
      Bucket: BUCKET_NAME,
      Key: storageKey,
    });
    await s3Client.send(command);
    return true;
  } catch (err) {
    console.error(`S3 deleteObject error for ${storageKey}:`, err);
    return false;
  }
}
