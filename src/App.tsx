import React, { useState, useEffect } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth, db, activeMode, toggleFirebaseMode, connectionStatus } from "./firebase-client";
import { doc, getDoc, setDoc } from "firebase/firestore";
import PublicMarketplace from "./components/PublicMarketplace";
import CustomerPortal from "./components/CustomerPortal";
import SuperAdmin from "./components/SuperAdmin";
import { zipLoaderService } from "./services/zipLoaderService";
import companyLogo from "./assets/images/company_logo_1783799272042.jpg";
import { 
  ShoppingBag, 
  User, 
  ShieldCheck, 
  ExternalLink,
  Layers,
  HelpCircle
} from "lucide-react";

export default function App() {
  const [currentPerspective, setCurrentPerspective] = useState<"marketplace" | "portal" | "admin">("marketplace");
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [dbStatus, setDbStatus] = useState<"checking" | "success" | "error">("checking");
  const [dbMessage, setDbMessage] = useState("");

  useEffect(() => {
    // Read the current state of our dynamic database diagnostics
    setDbStatus(connectionStatus.status);
    setDbMessage(connectionStatus.message);

    // Initialize zipLoaderService scanning
    zipLoaderService.scanZipDirectory();

    const unsubscribeStatus = connectionStatus.subscribe(() => {
      setDbStatus(connectionStatus.status);
      setDbMessage(connectionStatus.message);
    });

    return () => unsubscribeStatus();
  }, []);

  useEffect(() => {
    // Listen to Firebase Authentication state changes
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      if (user) {
        const isAdminEmail = user.email === "junubposcenter@gmail.com";
        // Sync user role from Firestore to determine if they are a Super Admin
        try {
          const clientDocRef = doc(db, "clients", user.uid);
          const snap = await getDoc(clientDocRef);
          
          if (snap.exists()) {
            const clientData = snap.data();
            setIsAdmin(clientData.role === "admin" || isAdminEmail);
          } else {
            // Default new signups to customer (or admin if email matches)
            await setDoc(clientDocRef, {
              id: user.uid,
              email: user.email,
              name: user.displayName || "Client Entrepreneur",
              role: isAdminEmail ? "admin" : "customer",
              status: "active",
              createdAt: new Date().toISOString()
            });
            setIsAdmin(isAdminEmail);
          }
        } catch (err) {
          console.warn("Notice: Operating in client fallback mode for user role:", err);
          // Fallback to email domain or similar if firestore fails
          setIsAdmin(isAdminEmail);
        }
      } else {
        setIsAdmin(false);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleLoginSuccess = (user: any) => {
    setCurrentUser(user);
    if (user.email === "junubposcenter@gmail.com") {
      setIsAdmin(true);
    }
    setCurrentPerspective("portal"); // Guide customer directly into their workspace!
  };

  const handleLogoutSuccess = () => {
    localStorage.removeItem("offline_user");
    setCurrentUser(null);
    setIsAdmin(false);
    setCurrentPerspective("marketplace"); // Redirect back to public view on logout
  };

  if (loading) {
    return (
      <div className="bg-slate-950 min-h-screen flex flex-col items-center justify-center gap-4 text-slate-100">
        <div className="relative flex items-center justify-center">
          <div className="w-24 h-24 border-2 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin absolute"></div>
          <img 
            src={companyLogo} 
            alt="Junub POS Center Logo" 
            className="w-16 h-16 rounded-full object-contain animate-pulse bg-white p-1"
            referrerPolicy="no-referrer"
          />
        </div>
        <p className="text-sm font-semibold tracking-wide text-slate-400">Synchronizing Application Handshake...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-between" id="app-viewport">
      {/* Main Perspective Router Area */}
      <div className="flex-1">
        {currentPerspective === "marketplace" && (
          <PublicMarketplace
            currentUser={currentUser}
            onNavigateToPortal={() => setCurrentPerspective("portal")}
          />
        )}

        {currentPerspective === "portal" && (
          isAdmin ? (
            <SuperAdmin onLogoutSuccess={handleLogoutSuccess} />
          ) : (
            <CustomerPortal
              currentUser={currentUser}
              onLoginSuccess={handleLoginSuccess}
              onLogoutSuccess={handleLogoutSuccess}
            />
          )
        )}
      </div>

      {/* Unified Platform Footer */}
      <footer className="bg-slate-950 border-t border-slate-900 py-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>© 2026 Junub POS Centre. All rights reserved. Securely synchronized with Firebase.</p>
          <div className="flex gap-4">
            <span className="hover:text-slate-300 transition cursor-pointer">Security Protocol</span>
            <span className="hover:text-slate-300 transition cursor-pointer">Cluster Status: Live</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
