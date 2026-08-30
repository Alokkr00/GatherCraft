import fs from 'fs';
import path from 'path';
import os from 'os';
import crypto from 'crypto';

let cachedDataDir: string | null = null;

/**
 * Checks if a target directory path is writable by creating and removing a probe file.
 */
export function isDirectoryWritable(dirPath: string): boolean {
  try {
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
    }
    const probeFile = path.join(dirPath, `.probe-${crypto.randomBytes(4).toString('hex')}.tmp`);
    fs.writeFileSync(probeFile, 'ok', 'utf-8');
    fs.unlinkSync(probeFile);
    return true;
  } catch {
    return false;
  }
}

/**
 * Sanitizes a file or subdirectory name to prevent path traversal attacks.
 */
export function sanitizePathSegment(segment: string): string {
  if (!segment) return 'default';
  // Remove null bytes, path separators, and dot-dot traversals
  const cleaned = segment
    .replace(/\0/g, '')
    .replace(/[/\\]/g, '')
    .replace(/\.\.+/g, '')
    .trim();

  return cleaned || 'default';
}

/**
 * Dynamic Platform-Agnostic Directory Resolver.
 * Resolves the optimal data storage directory depending on runtime environment:
 * 1. Environment Variable override (GATHERCRAFT_DATA_DIR or DATA_DIR)
 * 2. Serverless / Cloud runtime (Vercel, AWS Lambda, Google Cloud Run) -> os.tmpdir()/gathercraft
 * 3. Local Node.js / Docker persistent volume -> process.cwd()/.data
 * 4. Read-only filesystem fallback -> os.tmpdir()/gathercraft
 */
export function getPlatformDataDirectory(): string {
  if (cachedDataDir) {
    return cachedDataDir;
  }

  // 1. Explicit Environment Override
  const customEnvDir = process.env.GATHERCRAFT_DATA_DIR || process.env.DATA_DIR;
  if (customEnvDir) {
    const resolvedPath = path.resolve(customEnvDir);
    if (isDirectoryWritable(resolvedPath)) {
      cachedDataDir = resolvedPath;
      return cachedDataDir;
    }
  }

  // 2. Serverless Detection (Vercel, AWS Lambda, Netlify, GCP Functions / Cloud Run)
  const isServerless = Boolean(
    process.env.VERCEL ||
    process.env.AWS_LAMBDA_FUNCTION_NAME ||
    process.env.NETLIFY ||
    process.env.NOW_REGION ||
    process.env.K_SERVICE ||
    process.env.LAMBDA_TASK_ROOT
  );

  if (isServerless) {
    const serverlessDir = path.join(os.tmpdir(), 'gathercraft');
    if (isDirectoryWritable(serverlessDir)) {
      cachedDataDir = serverlessDir;
      return cachedDataDir;
    }
  }

  // 3. Local Standard Project Root (.data)
  const localDataDir = path.resolve(process.cwd(), '.data');
  if (isDirectoryWritable(localDataDir)) {
    cachedDataDir = localDataDir;
    return cachedDataDir;
  }

  // 4. Ultimate Fallback to OS Temp Directory
  const fallbackDir = path.join(os.tmpdir(), 'gathercraft');
  if (!fs.existsSync(fallbackDir)) {
    fs.mkdirSync(fallbackDir, { recursive: true });
  }
  cachedDataDir = fallbackDir;
  return cachedDataDir;
}

/**
 * Resolves an absolute, platform-normalized storage file path within the data directory.
 */
export function getStorageFilePath(filename: string, subDir?: string): string {
  const baseDir = getPlatformDataDirectory();
  const safeFilename = sanitizePathSegment(filename);
  
  if (subDir) {
    const safeSubDir = sanitizePathSegment(subDir);
    const targetDir = path.join(baseDir, safeSubDir);
    if (!fs.existsSync(targetDir)) {
      fs.mkdirSync(targetDir, { recursive: true });
    }
    return path.join(targetDir, safeFilename);
  }

  return path.join(baseDir, safeFilename);
}

/**
 * Safely reads and parses a JSON file with fallback if missing or corrupted.
 */
export function safeReadJsonSync<T>(filePath: string, fallback: T): T {
  try {
    if (fs.existsSync(filePath)) {
      const raw = fs.readFileSync(filePath, 'utf-8');
      const parsed = JSON.parse(raw);
      if (parsed !== null && parsed !== undefined) {
        return parsed as T;
      }
    }
  } catch (err) {
    console.warn(`[SafeStorage] Warning reading JSON from ${filePath}:`, err);
  }
  return fallback;
}

/**
 * Atomically writes data to a JSON file via a temporary file + rename.
 * Eliminates partial/corrupt writes during concurrent operations.
 */
export function atomicWriteJsonSync<T>(filePath: string, data: T): void {
  const dir = path.dirname(filePath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  const tmpPath = `${filePath}.${crypto.randomBytes(6).toString('hex')}.tmp`;
  const jsonContent = JSON.stringify(data, null, 2);

  try {
    fs.writeFileSync(tmpPath, jsonContent, 'utf-8');
    fs.renameSync(tmpPath, filePath);
  } catch (err: any) {
    // If cross-device link error (EXDEV), fallback to write directly
    try {
      if (fs.existsSync(tmpPath)) {
        fs.unlinkSync(tmpPath);
      }
    } catch {
      // ignore tmp cleanup error
    }
    fs.writeFileSync(filePath, jsonContent, 'utf-8');
  }
}
