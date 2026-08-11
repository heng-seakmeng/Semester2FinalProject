import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyDzgMfpQcKpq5XTKHXjXBrYJdnKUfQ0tN0",
  authDomain: "final-project-8b89e.firebaseapp.com",
  projectId: "final-project-8b89e",
  storageBucket: "final-project-8b89e.firebasestorage.app",
  messagingSenderId: "21020186159",
  appId: "1:21020186159:web:ab3672310bf76abc51d8da",
  measurementId: "G-C1156H7JH6",
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
