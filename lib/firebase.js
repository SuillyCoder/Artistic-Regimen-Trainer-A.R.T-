// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAwRsrXWncd_qYj-pL_WwGE-d2OTeuUDyw",
  authDomain: "a-r-t-da2fb.firebaseapp.com",
  projectId: "a-r-t-da2fb",
  storageBucket: "a-r-t-da2fb.firebasestorage.app",
  messagingSenderId: "519574727476",
  appId: "1:519574727476:web:8777cca12e992ae551d361",
  measurementId: "G-8WQN1XZCW5"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);