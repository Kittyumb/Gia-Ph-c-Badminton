import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getFirestore,
  doc,
  getDoc,
  getDocFromServer,
  setDoc,
  onSnapshot,
  enableIndexedDbPersistence,
} from 'firebase/firestore';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  User,
} from 'firebase/auth';
import firebaseConfig from '../../firebase-applet-config.json';
import { TournamentState } from '../types/tournament';

// Initialize Firebase App
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// Initialize Firestore with specific database ID
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);

// Initialize Auth
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

export const TOURNAMENT_DOC_ID = 'gia-phuc-cup-2026';

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(
  error: unknown,
  operationType: OperationType,
  path: string | null
): never {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo:
        auth.currentUser?.providerData?.map((provider) => ({
          providerId: provider.providerId,
          email: provider.email,
        })) || [],
    },
    operationType,
    path,
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// Connection test
export async function testConnection(): Promise<boolean> {
  try {
    await getDocFromServer(doc(db, 'tournaments', TOURNAMENT_DOC_ID));
    return true;
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn('Firebase client is offline, local cache will be used.');
      return false;
    }
    // Document might not exist yet on fresh setup, but connection to server succeeded
    return true;
  }
}

// Save tournament state to Firestore
export async function saveTournamentToFirestore(
  state: TournamentState,
  userEmail?: string | null
): Promise<void> {
  const path = `tournaments/${TOURNAMENT_DOC_ID}`;
  try {
    const rawPayload = {
      id: TOURNAMENT_DOC_ID,
      name: 'Gia Phúc Cup 2026',
      v: state.v || 2,
      teams: (state.teams || []).map((t) => ({
        id: t.id,
        name: t.name || '',
        p1: t.p1 || '',
        p2: t.p2 || '',
      })),
      courts: state.courts || ['Sân 1', 'Sân 2'],
      matches: (state.matches || []).map((m) => ({
        id: m.id,
        court: m.court,
        slot: m.slot,
        a: m.a || '',
        b: m.b || '',
        sa: m.sa ?? 0,
        sb: m.sb ?? 0,
        forfeit: m.forfeit || '',
        final: Boolean(m.final),
        referee: m.referee || '',
      })),
      bracket: state.bracket ? JSON.parse(JSON.stringify(state.bracket)) : null,
      tieOrder: state.tieOrder || {},
      tieConfirm: state.tieConfirm || {},
      court: state.court || 1,
      activeMatchId: state.activeMatchId || 'm1',
      updatedAt: new Date().toISOString(),
      updatedBy: userEmail || auth.currentUser?.email || 'Hệ thống điều hành',
    };

    // Eliminate any undefined properties to guarantee Firestore setDoc succeeds
    const payload = JSON.parse(JSON.stringify(rawPayload));

    await setDoc(doc(db, 'tournaments', TOURNAMENT_DOC_ID), payload, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

// Fetch tournament once
export async function fetchTournamentFromFirestore(): Promise<Partial<TournamentState> | null> {
  const path = `tournaments/${TOURNAMENT_DOC_ID}`;
  try {
    const snap = await getDoc(doc(db, 'tournaments', TOURNAMENT_DOC_ID));
    if (snap.exists()) {
      const data = snap.data();
      return {
        v: data.v,
        teams: data.teams,
        courts: data.courts,
        matches: data.matches,
        bracket: data.bracket,
        tieOrder: data.tieOrder,
        tieConfirm: data.tieConfirm,
        court: data.court,
        activeMatchId: data.activeMatchId,
      };
    }
    return null;
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, path);
  }
}

// Subscribe to real-time tournament updates
export function subscribeToTournament(
  onUpdate: (data: Partial<TournamentState>, updatedAt: string, updatedBy?: string) => void,
  onError?: (err: Error) => void
) {
  const path = `tournaments/${TOURNAMENT_DOC_ID}`;
  return onSnapshot(
    doc(db, 'tournaments', TOURNAMENT_DOC_ID),
    (snap) => {
      if (snap.exists()) {
        const data = snap.data();
        onUpdate(
          {
            v: data.v,
            teams: data.teams,
            courts: data.courts,
            matches: data.matches,
            bracket: data.bracket,
            tieOrder: data.tieOrder,
            tieConfirm: data.tieConfirm,
            court: data.court,
            activeMatchId: data.activeMatchId,
          },
          data.updatedAt || new Date().toISOString(),
          data.updatedBy
        );
      }
    },
    (error) => {
      if (onError) {
        onError(error instanceof Error ? error : new Error(String(error)));
      }
      handleFirestoreError(error, OperationType.GET, path);
    }
  );
}

// Google Sign-In
export async function loginWithGoogle(): Promise<User> {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    return result.user;
  } catch (error) {
    console.error('Google Sign In error:', error);
    throw error;
  }
}

// Sign-Out
export async function logoutUser(): Promise<void> {
  try {
    await signOut(auth);
  } catch (error) {
    console.error('Sign Out error:', error);
    throw error;
  }
}
