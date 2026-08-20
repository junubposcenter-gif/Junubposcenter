import { initializeApp } from "firebase/app";
import { 
  getAuth, 
  setPersistence,
  browserLocalPersistence
} from "firebase/auth";
import { 
  getFirestore, 
  initializeFirestore,
  doc, 
  getDocFromServer,
  terminate
} from "firebase/firestore";
import firebaseConfig from "../firebase-applet-config.json";

// The pre-seeded sandbox credentials for full-persistence playground testing
export const SANDBOX_CONFIG = {
  projectId: "gen-lang-client-0924236264",
  appId: "1:674145280847:web:15bfa51cc1333666b11b3a",
  apiKey: "AIzaSyAjSK2mSNHH3vAuqAAqmooTqzLcvzSKteI",
  authDomain: "gen-lang-client-0924236264.firebaseapp.com",
  firestoreDatabaseId: "ai-studio-softwaremarketpl-07a905ce-ec82-4804-81d3-ecc9cf078183",
  storageBucket: "gen-lang-client-0924236264.firebasestorage.app",
  messagingSenderId: "674145280847",
  measurementId: ""
};

// Check active mode from localStorage
const getInitialMode = () => {
  if (typeof window !== "undefined") {
    const saved = localStorage.getItem("firebase_config_mode");
    if (saved === "sandbox" || saved === "custom") {
      return saved;
    }
  }
  return "custom"; // Default to custom since user has enabled the Firestore API
};

export const activeMode = getInitialMode();

// Choose the config
export const activeConfig = activeMode === "sandbox" ? SANDBOX_CONFIG : {
  projectId: firebaseConfig.projectId || "longuntech",
  appId: firebaseConfig.appId || "1:399543808700:web:19e330fb99db81634cd6b9",
  apiKey: firebaseConfig.apiKey || "AIzaSyAdnsYEJTGIH03wR6OFPjFoD3RX6nM3ofs",
  authDomain: firebaseConfig.authDomain || "longuntech.firebaseapp.com",
  firestoreDatabaseId: firebaseConfig.firestoreDatabaseId || "",
  storageBucket: firebaseConfig.storageBucket || "longuntech.firebasestorage.app",
  messagingSenderId: firebaseConfig.messagingSenderId || "399543808700",
  measurementId: firebaseConfig.measurementId || "G-ZBJT7DTZ1Y"
};

// Initialize Firebase App
const app = initializeApp({
  apiKey: activeConfig.apiKey,
  authDomain: activeConfig.authDomain,
  projectId: activeConfig.projectId,
  storageBucket: activeConfig.storageBucket,
  messagingSenderId: activeConfig.messagingSenderId,
  appId: activeConfig.appId,
});

export const auth = getAuth(app);
export const db = initializeFirestore(app, {
  experimentalForceLongPolling: true,
}, activeConfig.firestoreDatabaseId || undefined);

// Ensure local persistence is enabled for better UX
setPersistence(auth, browserLocalPersistence).catch((err) => {
  console.error("Auth persistence error:", err);
});

// Real-time connection diagnostic listener
export const connectionStatus = {
  status: "checking" as "success" | "error" | "checking",
  message: "",
  listeners: [] as (() => void)[],
  subscribe(listener: () => void) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  },
  notify() {
    this.listeners.forEach(l => l());
  }
};

async function testConnection() {
  try {
    // Attempt a live fetch with a 5-second timeout safeguard
    const fetchPromise = getDocFromServer(doc(db, "products", "junubpos"));
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error("Connection timeout")), 5000)
    );
    await Promise.race([fetchPromise, timeoutPromise]);
    
    connectionStatus.status = "success";
    connectionStatus.message = "Successfully connected to Cloud Firestore.";
    connectionStatus.notify();
    console.log("Firebase connection verified successfully.");
  } catch (error: any) {
    connectionStatus.status = "error";
    connectionStatus.message = error?.message || "Operating in offline mode with fallback catalog.";
    connectionStatus.notify();
    console.warn("Database initialization status:", error?.message);

    // If connection fails, API is disabled or permission denied, terminate db client to avoid background stream retry loops
    if (error?.message?.includes("PERMISSION_DENIED") || error?.code === "permission-denied" || error?.message?.includes("timeout")) {
      console.warn("Firestore connection unreachable or permission denied. Operating seamlessly with static catalog fallback.");
      try {
        await terminate(db);
      } catch (tErr) {
        // Silently catch termination errors
      }
    }
  }
}

testConnection();

// Safe helper to toggle configuration mode and trigger page refresh
export function toggleFirebaseMode(mode: "sandbox" | "custom") {
  if (typeof window !== "undefined") {
    localStorage.setItem("firebase_config_mode", mode);
    window.location.reload();
  }
}
