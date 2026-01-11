import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { getStorage } from 'firebase/storage';

// Firebase configuration for cards-a5cac project
const firebaseConfig = {
  apiKey: "AIzaSyDfj5CKpICQ4FMtLG9DDFi7NNvw3H7Kb1Y",
  authDomain: "cards-a5cac.firebaseapp.com",
  projectId: "cards-a5cac",
  storageBucket: "cards-a5cac.firebasestorage.app",
  messagingSenderId: "870709388322",
  appId: "1:870709388322:web:27ce569b5a9e6d2f6b967b",
  measurementId: "G-QHSYSVJJN9"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firestore
export const db = getFirestore(app);

// Initialize Auth (for admin authentication)
export const auth = getAuth(app);

// Initialize Storage
export const storage = getStorage(app);

export default app;
