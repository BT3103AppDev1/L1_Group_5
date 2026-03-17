// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDmQxL-UZhap-tSMbC7J0IE2im8oxwbyak",
  authDomain: "bt3103-app.firebaseapp.com",
  projectId: "bt3103-app",
  storageBucket: "bt3103-app.firebasestorage.app",
  messagingSenderId: "524592688025",
  appId: "1:524592688025:web:cf00cb45eb935c3367c108",
  measurementId: "G-VNHG0B9Y16"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

const auth = getAuth(app);

export { auth };