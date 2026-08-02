import { 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  getDocs, 
  deleteDoc, 
  query, 
  where, 
  onSnapshot, 
  Unsubscribe 
} from 'firebase/firestore';
import { db, isFirebaseConfigured } from './firebase';
import { PartyEvent, Guest, TimelineItem, TaskItem, BudgetItem, ShoppingItem } from './types';

// Collection Names
const EVENTS_COL = 'events';
const GUESTS_COL = 'guests';
const TIMELINE_COL = 'timeline';
const TASKS_COL = 'tasks';
const BUDGET_COL = 'budget';
const SHOPPING_COL = 'shopping';

// --- EVENT REAL-TIME SYNC ---
export const subscribeToEvent = (eventId: string, callback: (event: PartyEvent | null) => void): Unsubscribe | null => {
  if (!isFirebaseConfigured()) return null;
  const docRef = doc(db, EVENTS_COL, eventId);
  return onSnapshot(docRef, (snapshot) => {
    if (snapshot.exists()) {
      callback({ id: snapshot.id, ...snapshot.data() } as PartyEvent);
    } else {
      callback(null);
    }
  }, (err) => {
    console.error(`Firestore Event Listener Error [${eventId}]:`, err);
  });
};

export const saveEventCloud = async (event: PartyEvent): Promise<void> => {
  if (!isFirebaseConfigured()) return;
  try {
    const docRef = doc(db, EVENTS_COL, event.id);
    await setDoc(docRef, event, { merge: true });
  } catch (err) {
    console.error('Firestore Save Event Error:', err);
  }
};

export const deleteEventCloud = async (eventId: string): Promise<void> => {
  if (!isFirebaseConfigured()) return;
  try {
    await deleteDoc(doc(db, EVENTS_COL, eventId));
  } catch (err) {
    console.error('Firestore Delete Event Error:', err);
  }
};

// --- GUESTS REAL-TIME SYNC ---
export const subscribeToGuests = (eventId: string, callback: (guests: Guest[]) => void): Unsubscribe | null => {
  if (!isFirebaseConfigured()) return null;
  const q = query(collection(db, GUESTS_COL), where('eventId', '==', eventId));
  return onSnapshot(q, (snapshot) => {
    const guests: Guest[] = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Guest));
    callback(guests);
  }, (err) => {
    console.error(`Firestore Guests Listener Error [${eventId}]:`, err);
  });
};

export const saveGuestCloud = async (guest: Guest): Promise<void> => {
  if (!isFirebaseConfigured()) return;
  try {
    const docRef = doc(db, GUESTS_COL, guest.id);
    await setDoc(docRef, guest, { merge: true });
  } catch (err) {
    console.error('Firestore Save Guest Error:', err);
  }
};

export const deleteGuestCloud = async (guestId: string): Promise<void> => {
  if (!isFirebaseConfigured()) return;
  try {
    await deleteDoc(doc(db, GUESTS_COL, guestId));
  } catch (err) {
    console.error('Firestore Delete Guest Error:', err);
  }
};

// --- TIMELINE REAL-TIME SYNC ---
export const subscribeToTimeline = (eventId: string, callback: (items: TimelineItem[]) => void): Unsubscribe | null => {
  if (!isFirebaseConfigured()) return null;
  const q = query(collection(db, TIMELINE_COL), where('eventId', '==', eventId));
  return onSnapshot(q, (snapshot) => {
    const items: TimelineItem[] = snapshot.docs
      .map(doc => ({ id: doc.id, ...doc.data() } as TimelineItem))
      .sort((a, b) => a.offsetMinutes - b.offsetMinutes);
    callback(items);
  }, (err) => {
    console.error(`Firestore Timeline Listener Error [${eventId}]:`, err);
  });
};

export const saveTimelineItemCloud = async (item: TimelineItem): Promise<void> => {
  if (!isFirebaseConfigured()) return;
  try {
    await setDoc(doc(db, TIMELINE_COL, item.id), item, { merge: true });
  } catch (err) {
    console.error('Firestore Save Timeline Error:', err);
  }
};

// --- TASKS REAL-TIME SYNC ---
export const subscribeToTasks = (eventId: string, callback: (tasks: TaskItem[]) => void): Unsubscribe | null => {
  if (!isFirebaseConfigured()) return null;
  const q = query(collection(db, TASKS_COL), where('eventId', '==', eventId));
  return onSnapshot(q, (snapshot) => {
    const tasks: TaskItem[] = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as TaskItem));
    callback(tasks);
  }, (err) => {
    console.error(`Firestore Tasks Listener Error [${eventId}]:`, err);
  });
};

export const saveTaskCloud = async (task: TaskItem): Promise<void> => {
  if (!isFirebaseConfigured()) return;
  try {
    await setDoc(doc(db, TASKS_COL, task.id), task, { merge: true });
  } catch (err) {
    console.error('Firestore Save Task Error:', err);
  }
};
