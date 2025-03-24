// Import the functions you need from the SDKs you need
import { initializeApp, getApps } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDCFYj7Rda824c-QJTfwfdfWULm4cl193k",
  authDomain: "swap-84db8.firebaseapp.com",
  projectId: "swap-84db8",
  storageBucket: "swap-84db8.firebasestorage.app",
  messagingSenderId: "503131487514",
  appId: "1:503131487514:web:a14e2094918816d7a0c0a3",
  measurementId: "G-NXJHZFJVF2"
};

// Initialize Firebase
let app;
if (!getApps().length) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApps()[0];
}

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

export { app };
