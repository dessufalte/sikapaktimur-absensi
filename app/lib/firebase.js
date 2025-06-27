
import { initializeApp } from 'firebase/app';
import { getDatabase } from 'firebase/database';
import { getAnalytics, isSupported } from 'firebase/analytics';
import { getFirestore } from "firebase/firestore";


const firebaseConfig = {
  apiKey: "AIzaSyCE4Ljj9M-GINQeGxign2rigjpSNoZx4xo",
  authDomain: "absensi-sikapak-timur.firebaseapp.com",
  databaseURL: "https://absensi-sikapak-timur-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "absensi-sikapak-timur",
  storageBucket: "absensi-sikapak-timur.firebasestorage.app",
  messagingSenderId: "777653602425",
  appId: "1:777653602425:web:9217a875d585157099eca8",
  measurementId: "G-QXXN1Y92ZD"
  
};

// Inisialisasi Firebase App
const app = initializeApp(firebaseConfig);

// Inisialisasi Realtime Database
const database = getDatabase(app);
const firestore = getFirestore(app);

let analytics;
if (typeof window !== "undefined") {
  isSupported().then((supported) => {
    if (supported) {
      analytics = getAnalytics(app);
    }
  });
}

export { app, database, analytics, firestore };
