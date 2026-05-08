import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  getDocs,
  getDoc,
  query,
  orderBy,
  limit,
  startAfter,
  where,
  serverTimestamp,
  type DocumentData,
  type QueryDocumentSnapshot,
} from 'firebase/firestore';
import { db } from './firebase_config';
import type { Postulacion } from '@/types/cv';

const COLLECTION = 'postulaciones';

export interface PaginatedResult {
  items: Postulacion[];
  lastVisible: QueryDocumentSnapshot<DocumentData> | null;
  hasMore: boolean;
}

export async function savePostulacion(data: Omit<Postulacion, 'id'>): Promise<string> {
  const docRef = await addDoc(collection(db, COLLECTION), {
    ...data,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return docRef.id;
}

export async function updatePostulacion(id: string, data: Partial<Postulacion>): Promise<void> {
  const docRef = doc(db, COLLECTION, id);
  await updateDoc(docRef, {
    ...data,
    updatedAt: serverTimestamp(),
  });
}

export async function deletePostulacion(id: string): Promise<void> {
  await deleteDoc(doc(db, COLLECTION, id));
}

export async function getPostulaciones(pageSize = 15, lastVisible?: QueryDocumentSnapshot<DocumentData>): Promise<PaginatedResult> {
  let q = query(
    collection(db, COLLECTION),
    orderBy('createdAt', 'desc'),
    limit(pageSize + 1)
  );

  if (lastVisible) {
    q = query(
      collection(db, COLLECTION),
      orderBy('createdAt', 'desc'),
      startAfter(lastVisible),
      limit(pageSize + 1)
    );
  }

  const snapshot = await getDocs(q);
  const items: Postulacion[] = [];
  snapshot.docs.forEach((d) => {
    const data = d.data();
    items.push({
      id: d.id,
      ...data,
    } as Postulacion);
  });

  const hasMore = items.length > pageSize;
  if (hasMore) items.pop();

  return {
    items,
    lastVisible: hasMore ? snapshot.docs[snapshot.docs.length - 2] : null,
    hasMore,
  };
}

export async function getPostulacionesByEstado(estado: string): Promise<Postulacion[]> {
  try {
    const q = query(
      collection(db, COLLECTION),
      where('estado', '==', estado),
      orderBy('createdAt', 'desc')
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map((d) => ({ id: d.id, ...d.data() }) as Postulacion);
  } catch {
    const snapshot = await getDocs(collection(db, COLLECTION));
    return snapshot.docs
      .filter((d) => d.data().estado === estado)
      .sort((a, b) => {
        const aTime = a.data().createdAt?.toMillis?.() || 0;
        const bTime = b.data().createdAt?.toMillis?.() || 0;
        return bTime - aTime;
      })
      .map((d) => ({ id: d.id, ...d.data() }) as Postulacion);
  }
}

export async function getCountByEstado(): Promise<Record<string, number>> {
  const snapshot = await getDocs(collection(db, COLLECTION));
  const counts: Record<string, number> = { total: 0, 'Pendiente': 0, 'Enviado': 0, 'En proceso': 0, 'Descartado': 0 };
  snapshot.docs.forEach((d) => {
    const data = d.data();
    counts.total++;
    if (data.estado in counts) {
      counts[data.estado]++;
    }
  });
  return counts;
}

export async function getPostulacionById(id: string): Promise<Postulacion | null> {
  const docRef = doc(db, COLLECTION, id);
  const docSnap = await getDoc(docRef);
  if (!docSnap.exists()) return null;
  return { id: docSnap.id, ...docSnap.data() } as Postulacion;
}
