// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import {
  browserSessionPersistence,
  getAuth,
  onAuthStateChanged,
  setPersistence,
} from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCaZMdRjXX357bJ02JqejZMO0svosO_8h8",
  authDomain: "munchmap-ffe0f.firebaseapp.com",
  projectId: "munchmap-ffe0f",
  storageBucket: "munchmap-ffe0f.firebasestorage.app",
  messagingSenderId: "6342611684",
  appId: "1:6342611684:web:cd775d41f237f701b992f1"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

const authPersistenceReady = setPersistence(auth, browserSessionPersistence);
const authStateReady = authPersistenceReady.then(
  () =>
    new Promise((resolve) => {
      const unsubscribe = onAuthStateChanged(auth, () => {
        unsubscribe();
        resolve();
      });
    }),
);

export { db, auth, authPersistenceReady, authStateReady };
