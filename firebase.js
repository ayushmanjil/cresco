import { initializeApp } from "firebase/app";
import {
  getFirestore,
  collection,
  doc,
  getDocs,
  setDoc,
  deleteDoc,
  onSnapshot,
  enableIndexedDbPersistence
} from "firebase/firestore";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyB-tdNiZkdpAre5fmCcTSkh-LbUX-K7nS0",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "cresco-aa413.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "cresco-aa413",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "cresco-aa413.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "244706981646",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:244706981646:web:59787e821f21929b3f495f",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "G-2YF4LFLHJT"
};

let app = null;
let db = null;
let isFirebaseReady = false;

try {
  if (firebaseConfig.apiKey && !firebaseConfig.apiKey.includes("your_")) {
    app = initializeApp(firebaseConfig);
    db = getFirestore(app);
    isFirebaseReady = true;
  }
} catch (e) {
  console.warn("Firebase initialization error:", e);
}

export { app, db, isFirebaseReady };

/**
 * Real-time listener for users collection in Firestore
 */
export function subscribeToUsers(onUpdate) {
  if (!db) return () => {};
  try {
    const usersCol = collection(db, "users");
    const unsubscribe = onSnapshot(usersCol, (snapshot) => {
      const usersList = [];
      snapshot.forEach(docSnap => {
        usersList.push(docSnap.data());
      });
      onUpdate(usersList);
    }, (error) => {
      console.warn("Firestore snapshot error (users):", error);
    });
    return unsubscribe;
  } catch (err) {
    console.warn("Error setting up users listener:", err);
    return () => {};
  }
}

/**
 * Persist/Update a single user in Firestore
 */
export async function saveUserToFirestore(user) {
  if (!db || !user?.uid) return;
  try {
    const userRef = doc(db, "users", user.uid);
    await setDoc(userRef, user, { merge: true });
  } catch (err) {
    console.warn(`Error saving user ${user.uid} to Firestore:`, err);
  }
}

/**
 * Delete a user from Firestore
 */
export async function deleteUserFromFirestore(uid) {
  if (!db || !uid) return;
  try {
    const userRef = doc(db, "users", uid);
    await deleteDoc(userRef);
  } catch (err) {
    console.warn(`Error deleting user ${uid} from Firestore:`, err);
  }
}

/**
 * Real-time listener for admin configuration in Firestore
 */
export function subscribeToAdmin(onUpdate) {
  if (!db) return () => {};
  try {
    const adminRef = doc(db, "config", "admin");
    const unsubscribe = onSnapshot(adminRef, (docSnap) => {
      if (docSnap.exists()) {
        onUpdate(docSnap.data());
      }
    }, (error) => {
      console.warn("Firestore snapshot error (admin):", error);
    });
    return unsubscribe;
  } catch (err) {
    console.warn("Error setting up admin listener:", err);
    return () => {};
  }
}

/**
 * Save Admin credentials/profile to Firestore
 */
export async function saveAdminToFirestore(adminData) {
  if (!db || !adminData) return;
  try {
    const adminRef = doc(db, "config", "admin");
    await setDoc(adminRef, adminData, { merge: true });
  } catch (err) {
    console.warn("Error saving admin data to Firestore:", err);
  }
}
