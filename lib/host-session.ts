import { auth } from './firebase';
import { generatePrefixedId } from './id';

const HOST_ID_KEY = 'gathercraft_host_id';

/**
 * Returns the active host identifier.
 * Uses Firebase Auth UID if authenticated, or falls back to a persistent host UUID.
 */
export function getCurrentHostId(): string {
  if (typeof window === 'undefined') {
    return 'server-host';
  }

  // 1. Firebase Auth User
  const firebaseUser = auth?.currentUser;
  if (firebaseUser?.uid) {
    return firebaseUser.uid;
  }

  // 2. Persistent Local Host UUID
  try {
    let hostId = localStorage.getItem(HOST_ID_KEY);
    if (!hostId || hostId === 'current-host') {
      hostId = generatePrefixedId('host');
      localStorage.setItem(HOST_ID_KEY, hostId);
    }
    return hostId;
  } catch {
    return 'anonymous-host';
  }
}
