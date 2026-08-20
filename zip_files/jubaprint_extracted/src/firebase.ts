import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore, doc, getDocFromServer } from "firebase/firestore";
import { getAuth } from "firebase/auth";

// Your web app's Firebase configuration
export const firebaseConfig = {
  apiKey: "AIzaSyBYg3m4WgWR2Wcj5rVIR5LxEBmGZw0xtPU",
  authDomain: "printing-manager-9a6d2.firebaseapp.com",
  projectId: "printing-manager-9a6d2",
  storageBucket: "printing-manager-9a6d2.firebasestorage.app",
  messagingSenderId: "540298445964",
  appId: "1:540298445964:web:026f95e38794fb9aef27a9",
  measurementId: "G-HCTKFQLY17"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = typeof window !== "undefined" ? getAnalytics(app) : null;
const db = getFirestore(app);
const auth = getAuth(app);

// Validate Connection to Firestore on boot
async function testConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
    console.log('[Firebase Connection] Connected successfully to Firestore.');
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.error("[Firebase Connection] Please check your Firebase configuration: the client is offline.");
    } else {
      console.warn("[Firebase Connection] Initial connection test completed/warned:", error);
    }
  }
}
testConnection();

export { app, analytics, db, auth };
