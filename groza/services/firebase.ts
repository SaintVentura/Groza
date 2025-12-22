import { initializeApp, getApps } from 'firebase/app';
import { initializeAuth, getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage';

// Type assertion for getReactNativePersistence - exists at runtime but types may be incomplete
import * as firebaseAuth from 'firebase/auth';
const getReactNativePersistence = (firebaseAuth as any).getReactNativePersistence;

// ============================================================
// FIREBASE CONFIGURATION
// ============================================================
// To get your Firebase credentials:
// 1. Go to https://console.firebase.google.com/
// 2. Create a new project (or select existing one)
// 3. Click on the gear icon ⚙️ next to "Project Overview"
// 4. Select "Project settings"
// 5. Scroll down to "Your apps" section
// 6. Click on the </> (Web) icon to add a web app
// 7. Register your app (name it "Groza" or similar)
// 8. Copy the config values and paste them below
// ============================================================

const firebaseConfig = {
  apiKey: "AIzaSyDi1h2EdSLhYwvwuTkBwCFvZPvxThVQtQk",
  authDomain: "groza-delivery.firebaseapp.com",
  projectId: "groza-delivery",
  storageBucket: "groza-delivery.firebasestorage.app",
  messagingSenderId: "527723470890",
  appId: "1:527723470890:web:5d6164a6dd5d8d93012353",
  measurementId: "G-EQFR7R7D85"
};

// Initialize Firebase
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

// Initialize Auth with AsyncStorage persistence
// This ensures auth state persists between app sessions
let auth;
try {
  auth = initializeAuth(app, {
    persistence: getReactNativePersistence(ReactNativeAsyncStorage)
  });
} catch (error: any) {
  // If auth is already initialized, get the existing instance
  if (error.code === 'auth/already-initialized') {
    auth = getAuth(app);
  } else {
    throw error;
  }
}

// Initialize Firestore
const db = getFirestore(app);

// Initialize Storage
const storage = getStorage(app);

export { auth, db, storage };
export default app; 