import { 
  signInWithPopup, 
  signInAnonymously, 
  signOut as firebaseSignOut, 
  onAuthStateChanged, 
  User 
} from 'firebase/auth';
import { auth, googleProvider, isFirebaseConfigured } from './firebase';
import { useState, useEffect } from 'react';

export interface AuthState {
  user: User | null;
  loading: boolean;
  isConfigured: boolean;
}

export const useAuth = (): AuthState => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const configured = isFirebaseConfigured();

  useEffect(() => {
    if (!configured) {
      setLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [configured]);

  return { user, loading, isConfigured: configured };
};

export const signInWithGoogle = async (): Promise<User | null> => {
  if (!isFirebaseConfigured()) {
    console.warn('Firebase is not configured. Falling back to local mode.');
    return null;
  }

  try {
    const result = await signInWithPopup(auth, googleProvider);
    return result.user;
  } catch (error) {
    console.error('Google Sign-In Error:', error);
    throw error;
  }
};

export const signInGuestAnonymously = async (): Promise<User | null> => {
  if (!isFirebaseConfigured()) return null;

  try {
    const result = await signInAnonymously(auth);
    return result.user;
  } catch (error) {
    console.error('Anonymous Sign-In Error:', error);
    return null;
  }
};

export const signOutUser = async (): Promise<void> => {
  if (!isFirebaseConfigured()) return;
  try {
    await firebaseSignOut(auth);
  } catch (error) {
    console.error('Sign Out Error:', error);
  }
};
