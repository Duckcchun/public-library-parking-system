import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyCrLtJCOdUawuMMLZp3B81rndVqoTfbeBc",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "parking-web-5bf23.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "parking-web-5bf23",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "parking-web-5bf23.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "1087487357150",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:1087487357150:web:f51e7d65994aeef055524f",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "G-ZMXCSY2NVN"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
