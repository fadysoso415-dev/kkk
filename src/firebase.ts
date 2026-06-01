/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  GoogleAuthProvider, 
  signInWithPopup, 
  signOut,
  onAuthStateChanged,
  User
} from 'firebase/auth';
import { 
  getFirestore, 
  doc, 
  getDoc, 
  getDocFromServer,
  setDoc, 
  updateDoc, 
  deleteDoc, 
  collection, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  onSnapshot,
  increment
} from 'firebase/firestore';
import firebaseConfig from '../firebase-applet-config.json';
import { Restaurant, Category, Product } from './types';

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId); /* CRITICAL: The app will break without this line */
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
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
  }
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// Check Firestore connection on startup
async function testConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.error("Please check your Firebase configuration.");
    }
  }
}
testConnection();

// --- Auth Functions ---
export async function signInWithGoogle(): Promise<User | null> {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    return result.user;
  } catch (error) {
    console.error("Google login failed", error);
    return null;
  }
}

export async function logoutUser(): Promise<void> {
  await signOut(auth);
}

// --- DB Utility Operations ---

// Get restaurant by ID
export async function getRestaurantById(id: string): Promise<Restaurant | null> {
  const rRef = doc(db, 'restaurants', id);
  try {
    const snap = await getDoc(rRef);
    if (!snap.exists()) return null;
    return { id: snap.id, ...snap.data() } as Restaurant;
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, `restaurants/${id}`);
    return null;
  }
}

// Get restaurant by its specific custom URL slug
export async function getRestaurantBySlug(slug: string): Promise<Restaurant | null> {
  const q = query(collection(db, 'restaurants'), where('slug', '==', slug));
  try {
    const snap = await getDocs(q);
    if (snap.empty) return null;
    const firstDoc = snap.docs[0];
    return { id: firstDoc.id, ...firstDoc.data() } as Restaurant;
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, 'restaurants');
    return null;
  }
}

// Get all restaurants belonging to an owner UID
export async function getRestaurantsByOwner(ownerUid: string): Promise<Restaurant[]> {
  const q = query(collection(db, 'restaurants'), where('ownerUid', '==', ownerUid));
  try {
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...d.data() } as Restaurant));
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, 'restaurants');
    return [];
  }
}

// Save or Update Restaurant Info
export async function saveRestaurant(id: string, data: Partial<Restaurant>): Promise<void> {
  const rRef = doc(db, 'restaurants', id);
  try {
    await setDoc(rRef, data, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `restaurants/${id}`);
  }
}

// Record analytics: Increments viewsCount
export async function incrementRestaurantViews(id: string): Promise<void> {
  const rRef = doc(db, 'restaurants', id);
  try {
    await updateDoc(rRef, { viewsCount: increment(1) });
  } catch (error) {
    // Fail silently for view increments
    console.warn("Could not increment views", error);
  }
}

// Record analytics: Increments whatsappOrdersCount
export async function incrementWhatsappOrders(id: string): Promise<void> {
  const rRef = doc(db, 'restaurants', id);
  try {
    await updateDoc(rRef, { whatsappOrdersCount: increment(1) });
  } catch (error) {
    console.warn("Could not increment orders", error);
  }
}

// --- Categories ---
export async function getCategories(restaurantId: string): Promise<Category[]> {
  const cRef = collection(db, 'restaurants', restaurantId, 'categories');
  const q = query(cRef, orderBy('order', 'asc'));
  try {
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...d.data() } as Category));
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, `restaurants/${restaurantId}/categories`);
    return [];
  }
}

export async function saveCategory(restaurantId: string, categoryId: string, data: Omit<Category, 'id'>): Promise<void> {
  const docRef = doc(db, 'restaurants', restaurantId, 'categories', categoryId);
  try {
    await setDoc(docRef, data);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `restaurants/${restaurantId}/categories/${categoryId}`);
  }
}

export async function deleteCategory(restaurantId: string, categoryId: string): Promise<void> {
  const docRef = doc(db, 'restaurants', restaurantId, 'categories', categoryId);
  try {
    await deleteDoc(docRef);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `restaurants/${restaurantId}/categories/${categoryId}`);
  }
}

// --- Products ---
export async function getProducts(restaurantId: string): Promise<Product[]> {
  const pRef = collection(db, 'restaurants', restaurantId, 'products');
  const q = query(pRef, orderBy('order', 'asc'));
  try {
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...d.data() } as Product));
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, `restaurants/${restaurantId}/products`);
    return [];
  }
}

export async function saveProduct(restaurantId: string, productId: string, data: Omit<Product, 'id'>): Promise<void> {
  const docRef = doc(db, 'restaurants', restaurantId, 'products', productId);
  try {
    await setDoc(docRef, data);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `restaurants/${restaurantId}/products/${productId}`);
  }
}

export async function deleteProduct(restaurantId: string, productId: string): Promise<void> {
  const docRef = doc(db, 'restaurants', restaurantId, 'products', productId);
  try {
    await deleteDoc(docRef);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `restaurants/${restaurantId}/products/${productId}`);
  }
}
