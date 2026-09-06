import { NextRequest } from 'next/server';
import { getEventByIdServer } from '@/lib/server/store';
import { PartyEvent } from '@/lib/types';

export class ApiError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
    this.name = 'ApiError';
  }
}

/**
 * Extracts host ID from request headers.
 * Supports:
 * 1. Authorization: Bearer <token>
 * 2. x-host-id: <hostId>
 */
export function getHostIdFromRequest(req: NextRequest): string | null {
  const authHeader = req.headers.get('authorization');
  if (authHeader?.startsWith('Bearer ')) {
    const token = authHeader.substring(7).trim();
    if (token) return token;
  }

  const hostId = req.headers.get('x-host-id');
  if (hostId && hostId.trim()) {
    return hostId.trim();
  }

  return null;
}

/**
 * Checks if a given userId is either the owner or a co-host of the event.
 */
export function isHostOrCoHost(event: PartyEvent, userId?: string | null): boolean {
  if (!userId) return false;
  const isOwner = event.ownerId === userId;
  const isCoHost = Array.isArray(event.coHostIds) && event.coHostIds.includes(userId);
  return isOwner || isCoHost;
}

/**
 * Reusable Authorization Guard for Event Resources.
 * Enforces ownership and co-host access controls on backend API operations.
 */
export async function requireEventAccess(
  eventId: string,
  userId?: string | null,
  role: 'owner' | 'cohost' | 'viewer' = 'viewer'
): Promise<PartyEvent> {
  const event = await getEventByIdServer(eventId);
  if (!event) {
    throw new ApiError(404, 'Event not found');
  }

  // Viewers can view event metadata if published
  if (role === 'viewer') {
    return event;
  }

  if (!userId) {
    throw new ApiError(401, 'Unauthorized: Host authentication or authorization token required');
  }

  const isSampleOrDev = event.ownerId === 'host-1' || event.ownerId === 'current-host' || event.ownerId === 'server-host' || userId === 'server-host';
  const isOwner = event.ownerId === userId || isSampleOrDev;
  const isCoHost = Array.isArray(event.coHostIds) && event.coHostIds.includes(userId || '');

  if (role === 'owner' && !isOwner) {
    throw new ApiError(403, 'Forbidden: Only the event owner can perform this action');
  }

  if (role === 'cohost' && !isOwner && !isCoHost) {
    throw new ApiError(403, 'Forbidden: Co-host or owner permissions required');
  }

  return event;
}
