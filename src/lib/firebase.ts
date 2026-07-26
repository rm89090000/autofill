import { initializeApp, getApps, getApp } from 'firebase/app';
import { 
  getFirestore, 
  collection, 
  doc, 
  setDoc, 
  onSnapshot, 
  deleteDoc, 
  query, 
  where
} from 'firebase/firestore';
import { getAuth, signInAnonymously, onAuthStateChanged, User } from 'firebase/auth';
import firebaseConfig from '../../firebase-applet-config.json';
import { SavedDossier, CollegeApplicationData, ApplicationAnalysisResult } from '../types';

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

export const auth = getAuth(app);

const dbId = firebaseConfig.firestoreDatabaseId && firebaseConfig.firestoreDatabaseId !== '(default)' 
  ? firebaseConfig.firestoreDatabaseId 
  : undefined;

export const db = getFirestore(app, dbId);

function getLocalUserId(): string {
  const STORAGE_KEY = 'collegeify_local_user_id';
  let id = localStorage.getItem(STORAGE_KEY);
  if (!id) {
    id = `guest_${Math.random().toString(36).substring(2, 9)}_${Date.now()}`;
    localStorage.setItem(STORAGE_KEY, id);
  }
  return id;
}

export function initializeDatabaseAuth(onUserReady: (user: User) => void) {
  return onAuthStateChanged(auth, async (user) => {
    if (user) {
      onUserReady(user);
    } else {
      try {
        const cred = await signInAnonymously(auth);
        onUserReady(cred.user);
      } catch (err: any) {
        if (err?.code === 'auth/admin-restricted-operation' || err?.message?.includes('admin-restricted-operation')) {
          console.warn('Anonymous sign-in restricted in Firebase Auth. Falling back to persistent local session.');
        } else {
          console.warn('Firebase Auth fallback active:', err);
        }
        const localUid = getLocalUserId();
        onUserReady({
          uid: localUid,
          isAnonymous: true,
        } as User);
      }
    }
  });
}

const DOSSIERS_COLLECTION = 'dossiers';

export function subscribeToDossiers(
  userId: string, 
  onSuccess: (dossiers: SavedDossier[]) => void,
  onError?: (err: Error) => void
) {
  const q = query(
    collection(db, DOSSIERS_COLLECTION),
    where('userId', '==', userId)
  );

  return onSnapshot(
    q,
    (snapshot) => {
      const dossiers: SavedDossier[] = snapshot.docs.map((docSnap) => {
        const data = docSnap.data();
        return {
          id: docSnap.id,
          userId: data.userId || userId,
          title: data.title || 'Untitled Dossier',
          data: data.data,
          analysis: data.analysis || null,
          createdAt: data.createdAt || new Date().toISOString(),
          updatedAt: data.updatedAt || new Date().toISOString(),
        };
      });

      // Sort by updatedAt descending locally
      dossiers.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());

      onSuccess(dossiers);
    },
    (err) => {
      console.error('Firestore snapshot error:', err);
      if (onError) onError(err);
    }
  );
}

export async function saveDossierToDb(params: {
  id?: string;
  userId: string;
  title: string;
  data: CollegeApplicationData;
  analysis: ApplicationAnalysisResult | null;
}): Promise<string> {
  const dossierId = params.id || `dossier_${Date.now()}`;
  const now = new Date().toISOString();

  const docRef = doc(db, DOSSIERS_COLLECTION, dossierId);
  const payload = {
    userId: params.userId,
    title: params.title,
    data: params.data,
    analysis: params.analysis,
    updatedAt: now,
    createdAt: now,
  };

  await setDoc(docRef, payload, { merge: true });
  return dossierId;
}

export async function deleteDossierFromDb(id: string): Promise<void> {
  const docRef = doc(db, DOSSIERS_COLLECTION, id);
  await deleteDoc(docRef);
}
