import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyBsA6jNDrwwpph5CbYpL6rv5C3_0jjGX1c",
  authDomain: "stayput-a909f.firebaseapp.com",
  projectId: "stayput-a909f",
  storageBucket: "stayput-a909f.firebasestorage.app",
  messagingSenderId: "541706763477",
  appId: "1:541706763477:web:60d187b52b6b235053b65c",
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db   = getFirestore(app);
