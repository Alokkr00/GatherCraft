/**
 * Dynamic Platform-Agnostic URL & Origin Resolution.
 * Resolves the canonical base URL for invite links, webhooks, and share targets
 * across local development, custom domains, and Vercel preview environments.
 */
export function getBaseUrl(): string {
  // 1. Browser Client Runtime
  if (typeof window !== 'undefined' && window.location?.origin) {
    return window.location.origin;
  }

  // 2. Explicit Environment Variable
  if (process.env.NEXT_PUBLIC_APP_URL) {
    return process.env.NEXT_PUBLIC_APP_URL.replace(/\/+$/, '');
  }

  // 3. Vercel System Deployment URL
  if (process.env.NEXT_PUBLIC_VERCEL_URL) {
    return `https://${process.env.NEXT_PUBLIC_VERCEL_URL.replace(/\/+$/, '')}`;
  }

  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL.replace(/\/+$/, '')}`;
  }

  // 4. Default Local Fallback
  return 'http://localhost:3000';
}

/**
 * Builds a dynamic, platform-agnostic public invite URL.
 */
export function buildInviteUrl(inviteIdentifier: string): string {
  const base = getBaseUrl();
  const cleanId = encodeURIComponent(inviteIdentifier.trim());
  return `${base}/invite/${cleanId}`;
}

/**
 * Builds a dynamic event workspace URL.
 */
export function buildEventUrl(eventId: string, pathSuffix = ''): string {
  const base = getBaseUrl();
  const cleanId = encodeURIComponent(eventId.trim());
  const suffix = pathSuffix ? `/${pathSuffix.replace(/^\/+/, '')}` : '';
  return `${base}/events/${cleanId}${suffix}`;
}
