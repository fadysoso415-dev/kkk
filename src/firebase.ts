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
  User,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile
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
import { Restaurant, Category, Product, Order, ViewLog, Shift } from './types';

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId); /* CRITICAL: The app will break without this line */
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

/**
 * Recursively cleans any object of undefined keys before transmitting to Firestore.
 */
export function cleanUndefined<T>(obj: T): T {
  if (obj === null || typeof obj !== 'object') {
    return obj;
  }
  if (Array.isArray(obj)) {
    return obj.map(item => cleanUndefined(item)) as any;
  }
  const cleaned: any = {};
  for (const [key, value] of Object.entries(obj)) {
    if (value !== undefined) {
      cleaned[key] = cleanUndefined(value);
    }
  }
  return cleaned as T;
}

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
    throw error;
  }
}

export async function signUpWithCredentials(name: string, emailOrPhone: string, password: string): Promise<User | null> {
  let email = emailOrPhone.trim();
  // Normalize custom usernames/phones to virtual emails to fit Firebase Auth schema
  if (!email.includes('@')) {
    const cleanStr = email.replace(/\+/g, '').replace(/[^a-zA-Z0-9]/g, '');
    email = `${cleanStr}@menuclick.local`;
  }
  
  try {
    const credential = await createUserWithEmailAndPassword(auth, email, password);
    if (credential.user) {
      await updateProfile(credential.user, { displayName: name });
    }
    return credential.user;
  } catch (error: any) {
    console.error("Sign up error in credentials:", error);
    throw error;
  }
}

export async function signInWithCredentials(emailOrPhone: string, password: string): Promise<User | null> {
  let email = emailOrPhone.trim();
  if (!email.includes('@')) {
    const cleanStr = email.replace(/\+/g, '').replace(/[^a-zA-Z0-9]/g, '');
    email = `${cleanStr}@menuclick.local`;
  }
  
  try {
    const credential = await signInWithEmailAndPassword(auth, email, password);
    return credential.user;
  } catch (error: any) {
    console.error("Sign in error in credentials:", error);
    throw error;
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
    await setDoc(rRef, cleanUndefined(data), { merge: true });
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

// Log a menu view event inside the subcollection
export async function logMenuView(restaurantId: string): Promise<void> {
  try {
    const colRef = collection(db, 'restaurants', restaurantId, 'views_log');
    const docRef = doc(colRef);
    
    // Simple device detection
    const ua = navigator.userAgent;
    let device: 'iPhone' | 'Android' | 'Desktop' | 'Other' = 'Other';
    if (/iPhone|iPad/i.test(ua)) {
      device = 'iPhone';
    } else if (/Android/i.test(ua)) {
      device = 'Android';
    } else if (/Macintosh|Windows|Linux/i.test(ua)) {
      device = 'Desktop';
    }

    const payload: Omit<ViewLog, 'id'> = {
      timestamp: new Date().toISOString(),
      device,
      userAgent: ua.slice(0, 300),
      referrer: document.referrer || 'direct'
    };
    await setDoc(docRef, cleanUndefined(payload));
  } catch (error) {
    console.warn("Could not log menu view doc", error);
  }
}

// Log an order event inside the subcollection and return doc ID
export async function logOrder(restaurantId: string, orderData: Omit<Order, 'id'>): Promise<string> {
  try {
    const colRef = collection(db, 'restaurants', restaurantId, 'orders');
    const docRef = doc(colRef);
    const updatedData = {
      ...orderData,
      status: orderData.status || 'pending'
    };
    await setDoc(docRef, cleanUndefined(updatedData));
    return docRef.id;
  } catch (error) {
    console.warn("Could not log order doc", error);
    return '';
  }
}

// Update the status of an order
export async function updateOrderStatus(
  restaurantId: string,
  orderId: string,
  status: 'pending' | 'preparing' | 'completed'
): Promise<void> {
  try {
    const docRef = doc(db, 'restaurants', restaurantId, 'orders', orderId);
    await updateDoc(docRef, { status });
  } catch (error) {
    console.error("Could not update order status:", error);
  }
}

// Update the settlement status of an order (تصفية حساب الشيف للكاشير)
export async function updateOrderSettlementStatus(
  restaurantId: string,
  orderId: string,
  isSettled: boolean
): Promise<void> {
  try {
    const docRef = doc(db, 'restaurants', restaurantId, 'orders', orderId);
    await updateDoc(docRef, { 
      isSettled, 
      settledAt: isSettled ? new Date().toISOString() : null 
    });
  } catch (error) {
    console.error("Could not update order settlement status:", error);
  }
}

// Log a completed shift to history (حفظ الوردية المصفرة)
export async function logShift(restaurantId: string, shiftData: Omit<Shift, "id">): Promise<string> {
  try {
    const colRef = collection(db, "restaurants", restaurantId, "shifts");
    const docRef = doc(colRef);
    await setDoc(docRef, cleanUndefined(shiftData));
    return docRef.id;
  } catch (error) {
    console.error("Could not log shift to db:", error);
    throw error;
  }
}

// Retrieve past shifts of the restaurant
export async function getShifts(restaurantId: string): Promise<Shift[]> {
  const colRef = collection(db, "restaurants", restaurantId, "shifts");
  const q = query(colRef, orderBy("closedAt", "desc"));
  try {
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...d.data() } as Shift));
  } catch (error) {
    console.warn("Could not retrieve shifts history", error);
    return [];
  }
}

// Clear all active orders in firestore to start a fresh shift (بدء وردية جديدة)
export async function clearShiftOrders(restaurantId: string): Promise<void> {
  try {
    const colRef = collection(db, "restaurants", restaurantId, "orders");
    const snap = await getDocs(colRef);
    for (const d of snap.docs) {
      await deleteDoc(doc(db, "restaurants", restaurantId, "orders", d.id));
    }
  } catch (error) {
    console.error("Could not clear active orders:", error);
    throw error;
  }
}

// Retrieve real orders from Firestore
export async function getOrders(restaurantId: string): Promise<Order[]> {
  const colRef = collection(db, 'restaurants', restaurantId, 'orders');
  const q = query(colRef, orderBy('timestamp', 'desc'));
  try {
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...d.data() } as Order));
  } catch (error) {
    console.warn("Could not retrieve orders log", error);
    return [];
  }
}

// Retrieve real visitor views log from Firestore
export async function getViewsLog(restaurantId: string): Promise<ViewLog[]> {
  const colRef = collection(db, 'restaurants', restaurantId, 'views_log');
  const q = query(colRef, orderBy('timestamp', 'desc'));
  try {
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...d.data() } as ViewLog));
  } catch (error) {
    console.warn("Could not retrieve views log", error);
    return [];
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
    await setDoc(docRef, cleanUndefined(data));
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
    await setDoc(docRef, cleanUndefined(data));
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
