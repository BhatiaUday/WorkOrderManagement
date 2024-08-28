// firebase.ts
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';  // For authentication
import { getFirestore } from 'firebase/firestore';  // For Firestore database
import { getStorage } from "firebase/storage";


const firebaseConfig = {
    apiKey: "AIzaSyBdJ8kS3vfKKWrh-NUB9jHTgIFVp849gR0",
    authDomain: "internalhackathon-3381a.firebaseapp.com",
    projectId: "internalhackathon-3381a",
    storageBucket: "internalhackathon-3381a.appspot.com",
    messagingSenderId: "981200307096",
    appId: "1:981200307096:web:2f3690c62a4a88ddb161ed"
  };
  
// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);  // Initialize Firebase Storage

