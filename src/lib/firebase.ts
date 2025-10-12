// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getDatabase } from 'firebase/database';

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDBuSgdv4esu9DBs7w2jL9NMSn2CN2xn-0",
  authDomain: "auctionmanager-ee1e8.firebaseapp.com",
  projectId: "auctionmanager-ee1e8",
  storageBucket: "auctionmanager-ee1e8.firebasestorage.app",
  messagingSenderId: "447159134172",
  appId: "1:447159134172:web:b61b72694c4ddc6c025119",
  measurementId: "G-R4EQC98QZ8"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
export const database = getDatabase(app);