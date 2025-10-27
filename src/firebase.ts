// src/firebase.ts
import { initializeApp } from "firebase/app";
import { getAuth, connectAuthEmulator, onAuthStateChanged } from "firebase/auth";
import { getFirestore, connectFirestoreEmulator, doc, getDoc, setDoc } from "firebase/firestore";
import { getAnalytics } from "firebase/analytics";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyAr0aVoUXFUyuWhEhANBUeN0HzdOcSq4mk",
  authDomain: "codie-83e2d.firebaseapp.com",
  projectId: "codie-83e2d",
  storageBucket: "codie-83e2d.appspot.com",
  messagingSenderId: "824118028224",
  appId: "1:824118028224:web:d4d0201bfe762d59a6ca25",
  measurementId: "G-SRSPG4WHK4"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

// Emulator mode disabled - using real Firebase services
// if (window.location.hostname === "localhost") {
//   connectAuthEmulator(auth, "http://localhost:9099");
//   connectFirestoreEmulator(db, "localhost", 8080);
// }

// User roles
export const ROLES = {
  HR: "hr",
  STUDENT: "student",
};

// Set user role in Firestore
export const setUserRole = async (userId: string, role: string) => {
  try {
    await setDoc(
      doc(db, "users", userId),
      { role, createdAt: new Date() },
      { merge: true }
    );
    return true;
  } catch (err) {
    console.error("Error setting user role:", err);
    return false;
  }
};

// Get user role from Firestore
export const getUserRole = async (userId: string) => {
  try {
    const userDoc = await getDoc(doc(db, "users", userId));
    if (userDoc.exists()) return userDoc.data().role;
    return null;
  } catch (err) {
    console.warn("Error getting user role, defaulting to STUDENT:", err);
    return null; // fallback
  }
};

// Optional: listen to auth changes
onAuthStateChanged(auth, (user) => {
  if (user) console.log("User signed in:", user.uid);
  else console.log("User signed out");
});
