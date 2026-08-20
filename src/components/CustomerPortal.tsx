import React, { useState, useEffect, useRef } from "react";
import { 
  collection, 
  getDocs, 
  query, 
  where, 
  doc, 
  setDoc, 
  onSnapshot,
  updateDoc, 
  arrayUnion,
  addDoc
} from "firebase/firestore";
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  updateProfile,
  GoogleAuthProvider,
  signInWithPopup
} from "firebase/auth";
import { db, auth } from "../firebase-client";
import { Subscription, SupportTicket, ProvisioningLog, Invoice } from "../types";
import companyLogo from "../assets/images/company_logo_1783799272042.jpg";
import { SaaSSimulatorModal } from "./SaaSSimulators";
import { ErrorBoundary } from "./ErrorBoundary";
import { 
  User, 
  Key, 
  Cpu, 
  LifeBuoy, 
  ChevronRight, 
  LogOut, 
  Lock, 
  Mail, 
  AlertCircle, 
  Play, 
  Terminal, 
  Check, 
  Copy, 
  Send,
  Plus,
  RefreshCw,
  FolderMinus,
  FileText,
  Monitor,
  Chrome
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface CustomerPortalProps {
  currentUser: any;
  onLogoutSuccess: () => void;
  onLoginSuccess: (user: any) => void;
}

export default function CustomerPortal({ currentUser, onLogoutSuccess, onLoginSuccess }: CustomerPortalProps) {
  // Auth States
  const [isRegister, setIsRegister] = useState(false);
  const authMethod = "cloud";
  const [authEmail, setAuthEmail] = useState("");
  const [authPassword, setAuthPassword] = useState("");
  const [authName, setAuthName] = useState("");
  const [authCompany, setAuthCompany] = useState("");
  const [authPhone, setAuthPhone] = useState("");
  const [authError, setAuthError] = useState("");
  const [authLoading, setAuthLoading] = useState(false);

  // Portal State
  const [activeTab, setActiveTab] = useState<"subscriptions" | "licensing" | "support" | "billing">("subscriptions");
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [loadingPortal, setLoadingPortal] = useState(false);

  // Active Provisioning simulation
  const [activeProvisioning, setActiveProvisioning] = useState<ProvisioningLog | null>(null);
  const [isProvisioningModalOpen, setIsProvisioningModalOpen] = useState(false);
  const terminalEndRef = useRef<HTMLDivElement>(null);

  // Ticket detail view
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
  const [newTicketSubject, setNewTicketSubject] = useState("");
  const [newTicketDescription, setNewTicketDescription] = useState("");
  const [newTicketCategory, setNewTicketCategory] = useState<"Technical" | "Billing" | "Sales" | "General">("Technical");
  const [newTicketPriority, setNewTicketPriority] = useState<"low" | "medium" | "high">("low");
  const [isNewTicketOpen, setIsNewTicketOpen] = useState(false);
  const [chatMessage, setChatMessage] = useState("");

  // License Simulator
  const [simLicenseKey, setSimLicenseKey] = useState("");
  const [simProductId, setSimProductId] = useState("");
  const [simLogs, setSimLogs] = useState<string[]>([]);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Active Simulated SaaS Product Overlay
  const [selectedSimProduct, setSelectedSimProduct] = useState<{
    id: string;
    name: string;
    domain: string;
    licenseKey: string;
  } | null>(null);

  useEffect(() => {
    if (currentUser) {
      loadPortalData();
    }
  }, [currentUser]);

  useEffect(() => {
    if (terminalEndRef.current) {
      terminalEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [activeProvisioning?.logs]);

  const loadPortalData = async () => {
    setLoadingPortal(true);
    
    // Retrieve offline-saved parameters from local storage
    const localSubs: Subscription[] = JSON.parse(localStorage.getItem("local_subscriptions") || "[]");
    const localInvoices: Invoice[] = JSON.parse(localStorage.getItem("local_invoices") || "[]");
    const localTickets: SupportTicket[] = JSON.parse(localStorage.getItem("local_tickets") || "[]");

    try {
      // Subscriptions
      const subQuery = query(
        collection(db, "subscriptions"), 
        where("customerId", "==", currentUser.uid)
      );
      const subSnapshot = await getDocs(subQuery);
      const subs: Subscription[] = [];
      subSnapshot.forEach((docSnap) => subs.push(docSnap.data() as Subscription));
      
      const mergedSubs = [...subs];
      localSubs.forEach(ls => {
        if (!mergedSubs.some(s => s.id === ls.id)) {
          mergedSubs.push(ls);
        }
      });
      const defaultJubaPrintSub: Subscription = {
        id: "sub-JUBA-PRINT-DEMO",
        customerId: currentUser.uid,
        customerEmail: currentUser.email || "client@jubaprint.com",
        productId: "jubaprint",
        productName: "JubaPrint Manager",
        planType: "yearly",
        price: 200,
        status: "active",
        startDate: new Date().toISOString(),
        endDate: new Date(Date.now() + 31536000000).toISOString(),
        licenseKey: "JPM-2026-ACTIVE-9981",
        deploymentType: "Multi-Tenant SaaS",
        domain: "print.jubaprint.saas.com"
      };

      if (!mergedSubs.some(s => s.productId === "jubaprint" || s.productName.toLowerCase().includes("jubaprint"))) {
        mergedSubs.unshift(defaultJubaPrintSub);
      }
      setSubscriptions(mergedSubs);

      // Invoices
      const invQuery = query(
        collection(db, "invoices"), 
        where("customerId", "==", currentUser.uid)
      );
      const invSnapshot = await getDocs(invQuery);
      const invs: Invoice[] = [];
      invSnapshot.forEach((docSnap) => invs.push(docSnap.data() as Invoice));
      
      const mergedInvs = [...invs];
      localInvoices.forEach(li => {
        if (!mergedInvs.some(i => i.id === li.id)) {
          mergedInvs.push(li);
        }
      });
      setInvoices(mergedInvs);

      // Tickets
      const tixQuery = query(
        collection(db, "tickets"), 
        where("customerId", "==", currentUser.uid)
      );
      const tixSnapshot = await getDocs(tixQuery);
      const tix: SupportTicket[] = [];
      tixSnapshot.forEach((docSnap) => tix.push(docSnap.data() as SupportTicket));
      
      const mergedTix = [...tix];
      localTickets.forEach(lt => {
        if (!mergedTix.some(t => t.id === lt.id)) {
          mergedTix.push(lt);
        }
      });
      setTickets(mergedTix);
    } catch (err) {
      console.warn("Firestore customer data fetch failed, using offline fallback:", err);
      // Fail-safe load pure local data filtered by customer uid or guest
      const fallbackSubs = localSubs.filter(s => s.customerId === currentUser.uid || s.customerId === "guest_user");
      const defaultJubaPrintSub: Subscription = {
        id: "sub-JUBA-PRINT-DEMO",
        customerId: currentUser.uid,
        customerEmail: currentUser.email || "client@jubaprint.com",
        productId: "jubaprint",
        productName: "JubaPrint Manager",
        planType: "yearly",
        price: 200,
        status: "active",
        startDate: new Date().toISOString(),
        endDate: new Date(Date.now() + 31536000000).toISOString(),
        licenseKey: "JPM-2026-ACTIVE-9981",
        deploymentType: "Multi-Tenant SaaS",
        domain: "print.jubaprint.saas.com"
      };
      if (!fallbackSubs.some(s => s.productId === "jubaprint" || s.productName.toLowerCase().includes("jubaprint"))) {
        fallbackSubs.unshift(defaultJubaPrintSub);
      }
      setSubscriptions(fallbackSubs);
      setInvoices(localInvoices.filter(i => i.customerId === currentUser.uid || i.customerId === "guest_user"));
      setTickets(localTickets.filter(t => t.customerId === currentUser.uid || t.customerId === "guest_user"));
    } finally {
      setLoadingPortal(false);
    }
  };

  // One-click Demo Account bypass
  const handleDemoLogin = async () => {
    setAuthLoading(true);
    setAuthError("");

    try {
      const email = "junubposcenter@gmail.com";
      const pass = "password123";
      
      try {
        const userCredential = await signInWithEmailAndPassword(auth, email, pass);
        onLoginSuccess(userCredential.user);
      } catch (signInErr: any) {
        // If demo user doesn't exist, register them automatically!
        if (signInErr.code === "auth/user-not-found" || signInErr.code === "auth/invalid-credential") {
          const userCred = await createUserWithEmailAndPassword(auth, email, pass);
          await updateProfile(userCred.user, { displayName: "Demo Entrepreneur" });
          
          // Seed their profile client document in firestore
          await setDoc(doc(db, "clients", userCred.user.uid), {
            id: userCred.user.uid,
            email: email,
            name: "Demo Entrepreneur",
            company: "East African Retail Hub",
            phone: "+256 772 123456",
            country: "Uganda",
            role: "customer",
            status: "active",
            createdAt: new Date().toISOString()
          });

          // Seed a mock default subscription so they instantly see some data
          const subId = "sub-MOCK-CMS-UGA";
          await setDoc(doc(db, "subscriptions", subId), {
            id: subId,
            customerId: userCred.user.uid,
            customerEmail: email,
            productId: "supaclinic",
            productName: "SupaClinic UGA",
            planType: "yearly",
            price: 390,
            status: "active",
            startDate: new Date().toISOString(),
            endDate: new Date(Date.now() + 31536000000).toISOString(),
            licenseKey: "CMS-UGA-2026-XQ8891",
            deploymentType: "Multi-Tenant SaaS",
            domain: "democlinic.supaclinic.saas.com"
          });

          // Seed default invoice
          await setDoc(doc(db, "invoices", "inv-MOCK-CMS-1"), {
            id: "inv-MOCK-CMS-1",
            customerId: userCred.user.uid,
            customerEmail: email,
            subscriptionId: subId,
            productName: "SupaClinic UGA",
            planType: "yearly",
            amount: 390,
            currency: "UGX",
            paymentMethod: "MTN MoMo",
            status: "paid",
            createdAt: new Date().toISOString()
          });

          onLoginSuccess(userCred.user);
        } else {
          throw signInErr;
        }
      }
    } catch (err: any) {
      setAuthError(err.message);
    } finally {
      setAuthLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setAuthLoading(true);
    setAuthError("");
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      
      // Save client profile in Firestore so they are visible in SuperAdmin
      await setDoc(doc(db, "clients", user.uid), {
        id: user.uid,
        email: user.email || "",
        name: user.displayName || "Google Client",
        company: "Google Connected Account",
        phone: user.phoneNumber || "",
        role: "customer",
        status: "active",
        createdAt: new Date().toISOString()
      }, { merge: true });

      onLoginSuccess(user);
    } catch (err: any) {
      setAuthError(err.message);
    } finally {
      setAuthLoading(false);
    }
  };

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthLoading(true);
    setAuthError("");

    if (!authEmail.trim() || !authPassword.trim()) {
      setAuthError("Email and Password are required.");
      setAuthLoading(false);
      return;
    }

    try {
      if (isRegister) {
        const userCred = await createUserWithEmailAndPassword(auth, authEmail, authPassword);
        try {
          await updateProfile(userCred.user, { displayName: authName });
        } catch (profileErr) {
          console.warn("Failed to update profile display name:", profileErr);
        }
        
        try {
          await setDoc(doc(db, "clients", userCred.user.uid), {
            id: userCred.user.uid,
            email: authEmail,
            name: authName,
            company: authCompany,
            phone: authPhone,
            role: "customer",
            status: "active",
            createdAt: new Date().toISOString()
          });
        } catch (fsErr) {
          console.warn("Firestore client doc registration failed, proceeding with local fallback:", fsErr);
        }

        onLoginSuccess(userCred.user);
      } else {
        const userCred = await signInWithEmailAndPassword(auth, authEmail, authPassword);
        onLoginSuccess(userCred.user);
      }
    } catch (err: any) {
      setAuthError(err.message);
    } finally {
      setAuthLoading(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      onLogoutSuccess();
    } catch (err) {
      console.error(err);
    }
  };

  // Launch Automated Provisioning Task
  const handleStartProvisioning = async (sub: Subscription) => {
    setIsProvisioningModalOpen(true);
    setActiveProvisioning({
      id: "prov-loading",
      subscriptionId: sub.id,
      customerId: currentUser.uid,
      productName: sub.productName,
      domain: sub.domain,
      deploymentType: sub.deploymentType,
      status: "provisioning",
      progress: 5,
      logs: ["[Client] Preparing server handshake..."],
      createdAt: new Date().toISOString()
    });

    try {
      const response = await fetch("/api/provision", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subscriptionId: sub.id,
          productName: sub.productName,
          domain: sub.domain,
          deploymentType: sub.deploymentType,
          customerId: currentUser.uid
        })
      });

      const data = await response.json();
      if (data.success && data.logId) {
        // Attach onSnapshot to listen in real-time to the provisioning logs!
        const logDocRef = doc(db, "provisioningLogs", data.logId);
        const unsubscribe = onSnapshot(logDocRef, (snapshot) => {
          if (snapshot.exists()) {
            const data = snapshot.data() as ProvisioningLog;
            setActiveProvisioning(data);
            
            // If active/completed, refresh dashboard data
            if (data.progress === 100) {
              loadPortalData();
              unsubscribe();
            }
          }
        });
      }
    } catch (err: any) {
      console.error("Failed to start server provisioning:", err);
    }
  };

  // Copy License To Clipboard helper
  const copyToClipboard = (key: string) => {
    navigator.clipboard.writeText(key);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  // Verify License Simulator on Physical Devices
  const handleSimulateActivation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!simLicenseKey.trim() || !simProductId) return;

    setSimLogs((prev) => [...prev, `[Device Client] Initializing validation query for ${simLicenseKey}...`]);
    await new Promise((r) => setTimeout(r, 1000));

    try {
      const response = await fetch("/api/license/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          licenseKey: simLicenseKey,
          productId: simProductId
        })
      });

      const data = await response.json();
      if (data.valid) {
        setSimLogs((prev) => [
          ...prev, 
          `[Server Gate] Status: ACTIVE. OK!`,
          `[Server Gate] Msg: ${data.message}`,
          `[Device Client] Registration Succeeded! Device has been activated successfully.`
        ]);
        loadPortalData(); // Reload to update device count
      } else {
        setSimLogs((prev) => [
          ...prev, 
          `[Server Gate] AUTH_FAILED: ${data.message}`,
          `[Device Client] ERROR: Activation Rejected by Central Licensing Gate.`
        ]);
      }
    } catch (err: any) {
      setSimLogs((prev) => [...prev, `[Device Client] CONNECTION ERROR: ${err.message}`]);
    }
  };

  // Submit Support Ticket
  const handleCreateTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTicketSubject.trim() || !newTicketDescription.trim()) return;

    const ticketId = `tix-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
    const newTicket: SupportTicket = {
      id: ticketId,
      customerId: currentUser.uid,
      customerEmail: currentUser.email,
      customerName: currentUser.displayName || "Client",
      subject: newTicketSubject,
      description: newTicketDescription,
      category: newTicketCategory,
      status: "open",
      priority: newTicketPriority,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      messages: [
        {
          sender: "customer",
          message: newTicketDescription,
          timestamp: new Date().toISOString()
        }
      ]
    };

    try {
      await setDoc(doc(db, "tickets", ticketId), newTicket);
      setIsNewTicketOpen(false);
      setNewTicketSubject("");
      setNewTicketDescription("");
      loadPortalData();
    } catch (err) {
      console.warn("Failed to submit support ticket to cloud database, saving locally:", err);
      try {
        const localTickets = JSON.parse(localStorage.getItem("local_tickets") || "[]");
        localTickets.push(newTicket);
        localStorage.setItem("local_tickets", JSON.stringify(localTickets));
        
        setIsNewTicketOpen(false);
        setNewTicketSubject("");
        setNewTicketDescription("");
        loadPortalData();
      } catch (localErr) {
        console.error("Local ticket write failed:", localErr);
      }
    }
  };

  // Reply to chat in Ticket
  const handleSendTicketReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTicket || !chatMessage.trim()) return;

    const reply = {
      sender: "customer",
      message: chatMessage,
      timestamp: new Date().toISOString()
    };

    try {
      const ticketRef = doc(db, "tickets", selectedTicket.id);
      await updateDoc(ticketRef, {
        messages: arrayUnion(reply),
        status: "open", // Reopen/update status
        updatedAt: new Date().toISOString()
      });

      setSelectedTicket((prev: any) => ({
        ...prev,
        messages: [...(prev.messages || []), reply]
      }));
      setChatMessage("");
      loadPortalData();
    } catch (err) {
      console.warn("Error sending reply to cloud database, saving locally:", err);
      try {
        const localTickets = JSON.parse(localStorage.getItem("local_tickets") || "[]");
        const idx = localTickets.findIndex((t: any) => t.id === selectedTicket.id);
        if (idx !== -1) {
          localTickets[idx].messages.push(reply);
          localTickets[idx].status = "open";
          localTickets[idx].updatedAt = new Date().toISOString();
          localStorage.setItem("local_tickets", JSON.stringify(localTickets));
        }
        
        setSelectedTicket((prev: any) => ({
          ...prev,
          messages: [...(prev.messages || []), reply]
        }));
        setChatMessage("");
        loadPortalData();
      } catch (localErr) {
        console.error("Local reply save failed:", localErr);
      }
    }
  };

  return (
    <div className="bg-slate-900 min-h-screen text-slate-100 font-sans flex flex-col md:flex-row" id="portal-root">
      {/* Auth Gate view */}
      {!currentUser ? (
        <div className="flex-1 flex flex-col items-center justify-center py-20 px-4 max-w-md mx-auto space-y-6">
          <div className="bg-slate-800 p-8 rounded-3xl border border-slate-700 w-full shadow-2xl space-y-6">
            <div className="text-center space-y-3">
              <img 
                src={companyLogo} 
                alt="Junub POS Center Logo" 
                className="w-16 h-16 object-contain rounded-full mx-auto shadow-lg bg-white p-1 border border-slate-700"
                referrerPolicy="no-referrer"
              />
              <div>
                <h2 className="text-xl font-black text-white">{isRegister ? "Create Account" : "Account Sign In"}</h2>
                <p className="text-xs text-slate-400">Access your digital products, licensing keys, and support tickets.</p>
              </div>
            </div>

             {authError && (
              <div className="space-y-3">
                <div className="bg-rose-500/10 border border-rose-500/20 text-rose-300 p-3 rounded-xl text-xs flex gap-2 items-center">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <p className="flex-1">{authError}</p>
                </div>
                {authError.includes("operation-not-allowed") && (
                  <div className="bg-amber-500/10 border border-amber-500/20 text-amber-200 p-4 rounded-xl text-xs space-y-2 text-left">
                    <p className="font-bold text-amber-400 flex items-center gap-1.5">
                      <span className="inline-block w-2 h-2 rounded-full bg-amber-400 animate-pulse"></span>
                      Firebase Setup Notice: Action Required
                    </p>
                    <p className="leading-relaxed text-slate-300 text-[11px]">
                      Your Firebase project is online, but the <strong>Email/Password Sign-In Provider</strong> has not been enabled in your Firebase web console yet.
                    </p>
                    <div className="text-[10.5px] text-slate-400 space-y-1.5 pl-1">
                      <p>1. Go to the <a href="https://console.firebase.google.com/" target="_blank" rel="noreferrer" className="text-indigo-400 underline hover:text-indigo-300">Firebase Console</a>.</p>
                      <p>2. Open your project, click on <strong>Build &gt; Authentication</strong> in the left sidebar.</p>
                      <p>3. Go to the <strong>Sign-in method</strong> tab, click <strong>Add new provider</strong>, choose <strong>Email/Password</strong>, and toggle it to <strong>Enabled</strong>.</p>
                    </div>
                  </div>
                )}
              </div>
            )}

            <form onSubmit={handleAuthSubmit} className="space-y-4">
              {isRegister && (
                <>
                  <div>
                    <label className="block text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-1">Full Name</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. John Bosco"
                      value={authName}
                      onChange={(e) => setAuthName(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 px-3 py-2 rounded-xl text-xs text-white focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-1">Company / Retailer Name</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Juba POS Center"
                      value={authCompany}
                      onChange={(e) => setAuthCompany(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 px-3 py-2 rounded-xl text-xs text-white focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                    />
                  </div>
                </>
              )}

              <div>
                <label className="block text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-1">Email Address</label>
                <div className="relative">
                  <Mail className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    placeholder="e.g. customer@company.com"
                    value={authEmail}
                    onChange={(e) => setAuthEmail(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 pl-9 pr-3 py-2 rounded-xl text-xs text-white focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-1">Password</label>
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={authPassword}
                  onChange={(e) => setAuthPassword(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 px-3 py-2 rounded-xl text-xs text-white focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <button
                type="submit"
                disabled={authLoading}
                className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-md transition cursor-pointer"
              >
                {authLoading ? "Authenticating security credentials..." : isRegister ? "Create Account" : "Sign In"}
              </button>

              {authMethod === "cloud" && (
                <>
                  <div className="flex items-center my-3">
                    <div className="flex-1 border-t border-slate-800"></div>
                    <span className="px-2 text-[10px] text-slate-500 font-semibold uppercase">Or continue with</span>
                    <div className="flex-1 border-t border-slate-800"></div>
                  </div>
                  <button
                    type="button"
                    onClick={handleGoogleSignIn}
                    disabled={authLoading}
                    className="w-full py-2.5 bg-slate-900 hover:bg-slate-850 border border-slate-700 text-slate-200 hover:text-white font-bold text-xs rounded-xl shadow-md transition cursor-pointer flex items-center justify-center gap-2"
                  >
                    <Chrome className="w-4 h-4 text-indigo-400" />
                    <span>Google Secure Single Sign-On</span>
                  </button>
                </>
              )}
            </form>

            <div className="text-center pt-2">
              <button
                onClick={() => setIsRegister(!isRegister)}
                className="text-xs text-indigo-400 hover:text-indigo-300 transition cursor-pointer"
              >
                {isRegister ? "Already registered? Sign In" : "New business? Create an Account"}
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* Authenticated Client Dashboard */
        <>
          {/* Sidebar / Sidebar tabs */}
          <div className="w-full md:w-64 bg-slate-950 border-r border-slate-800 p-6 flex flex-col justify-between">
            <div className="space-y-8">
              {/* Company Logo Header */}
              <div className="flex items-center gap-3 pb-4 border-b border-slate-800/80">
                <img 
                  src={companyLogo} 
                  alt="Junub POS Center Logo" 
                  className="w-10 h-10 object-contain rounded-full shadow-inner bg-white p-0.5"
                  referrerPolicy="no-referrer"
                />
                <div>
                  <h3 className="font-black text-xs text-white tracking-wider">Junub POS Center</h3>
                  <p className="text-[9px] text-indigo-400 font-semibold tracking-widest uppercase">Client Area</p>
                </div>
              </div>

              <div className="space-y-2">
                <span className="text-[10px] text-slate-500 font-bold tracking-widest uppercase block">Logged client profile</span>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-indigo-600/25 text-indigo-400 flex items-center justify-center font-extrabold text-xs uppercase border border-indigo-600/30">
                    {currentUser.displayName ? currentUser.displayName[0] : "C"}
                  </div>
                  <div>
                    <span className="font-extrabold text-xs block text-white">{currentUser.displayName || "Customer"}</span>
                    <span className="text-[10px] text-slate-500 block line-clamp-1">{currentUser.email}</span>
                  </div>
                </div>
              </div>

              <nav className="space-y-1">
                {[
                  { id: "subscriptions", label: "My Applications", icon: Cpu },
                  { id: "licensing", label: "Device Licensing", icon: Key },
                  { id: "support", label: "Support Tickets", icon: LifeBuoy },
                  { id: "billing", label: "Invoice History", icon: FileText }
                ].map((tab) => {
                  const IconComp = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => {
                        setActiveTab(tab.id as any);
                        setSelectedTicket(null);
                      }}
                      id={`tab-btn-${tab.id}`}
                      className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold tracking-wide transition cursor-pointer ${
                        activeTab === tab.id
                          ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/10"
                          : "text-slate-400 hover:text-slate-200 hover:bg-slate-900"
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <IconComp className="w-4 h-4" />
                        <span>{tab.label}</span>
                      </div>
                      <ChevronRight className="w-3 h-3 text-slate-500" />
                    </button>
                  );
                })}
              </nav>
            </div>

            <button
              onClick={handleSignOut}
              className="w-full py-2.5 mt-8 border border-slate-800 text-slate-400 hover:text-white hover:bg-slate-900 hover:border-slate-700 text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Log Out Portal</span>
            </button>
          </div>

          {/* Core Content Area */}
          <div className="flex-1 p-6 md:p-8 overflow-y-auto space-y-6">
            {/* Header Title */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-800 pb-5">
              <div>
                <h2 className="text-xl font-black text-white capitalize">{activeTab} Hub</h2>
                <p className="text-xs text-slate-400">Configure your parameters, monitor active states, or submit tickets.</p>
              </div>
              <button 
                onClick={loadPortalData}
                className="p-2 border border-slate-800 hover:bg-slate-800 rounded-xl transition text-slate-400 hover:text-white cursor-pointer"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>

            {loadingPortal ? (
              <div className="flex flex-col items-center justify-center py-24 gap-4">
                <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                <p className="text-xs text-slate-400 font-medium">Syncing profile ledgers from cloud...</p>
              </div>
            ) : (
              <>
                {/* TAB 1: SUBSCRIPTIONS */}
                {activeTab === "subscriptions" && (
                  <div className="space-y-6">
                    {subscriptions.length === 0 ? (
                      <div className="bg-slate-800/30 border border-slate-800 p-12 text-center rounded-3xl max-w-md mx-auto space-y-4">
                        <Cpu className="w-12 h-12 text-slate-600 mx-auto" />
                        <h3 className="font-bold text-white text-base">No active software subscriptions</h3>
                        <p className="text-slate-400 text-xs">Browse our marketplace in the top header, pick an application, and complete the local mobile money payment!</p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {subscriptions.map((sub) => (
                          <div key={sub.id} className="bg-slate-850 border border-slate-800 rounded-2xl p-5 space-y-4 flex flex-col justify-between">
                            <div>
                              <div className="flex items-center justify-between">
                                <span className={`text-[10px] font-bold tracking-wider px-2 py-0.5 rounded-md uppercase ${
                                  sub.status === "active" ? "bg-emerald-500/10 text-emerald-400" : "bg-rose-500/10 text-rose-400"
                                }`}>
                                  {sub.status}
                                </span>
                                <span className="text-[10px] text-slate-500 font-mono">ID: {sub.id}</span>
                              </div>

                              <h3 className="text-lg font-extrabold text-white mt-3">{sub.productName}</h3>
                              <p className="text-xs text-slate-400 italic">Hosting Domain: <span className="text-indigo-400 font-semibold">{sub.domain}</span></p>

                              <div className="grid grid-cols-2 gap-4 mt-4 bg-slate-900/60 p-3 rounded-xl border border-slate-800 text-[11px]">
                                <div>
                                  <span className="text-slate-500 font-semibold block">Plan Tier</span>
                                  <span className="font-bold text-white capitalize">{sub.planType}</span>
                                </div>
                                <div>
                                  <span className="text-slate-500 font-semibold block">Expiration</span>
                                  <span className="font-bold text-white">
                                    {new Date(sub.endDate).toLocaleDateString()}
                                  </span>
                                </div>
                              </div>
                            </div>

                            <div className="flex flex-col sm:flex-row gap-2 pt-3 border-t border-slate-800/50 mt-4">
                              <button
                                onClick={() => setSelectedSimProduct({
                                  id: sub.productId,
                                  name: sub.productName,
                                  domain: sub.domain,
                                  licenseKey: sub.licenseKey
                                })}
                                className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer shadow-md"
                              >
                                <Monitor className="w-3.5 h-3.5" />
                                <span>Launch Live SaaS App</span>
                              </button>
                              
                              <button
                                onClick={() => handleStartProvisioning(sub)}
                                className="py-2 px-3 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer border border-slate-700"
                                title="Run automated virtual node server provisioning logs"
                              >
                                <Terminal className="w-3.5 h-3.5" />
                                <span>Deploy Logs</span>
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* TAB 2: LICENSING & DEVICE ACTIVATOR */}
                {activeTab === "licensing" && (
                  <div className="space-y-6">
                    {subscriptions.length === 0 ? (
                      <div className="bg-slate-800/30 border border-slate-800 p-8 text-center rounded-2xl">
                        <p className="text-slate-400 text-xs">No subscriptions registered. Buy a system to test the key activator simulator.</p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* List of active License Keys */}
                        <div className="space-y-4">
                          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Generated Software Licenses</span>
                          
                          {subscriptions.map((sub) => (
                            <div key={sub.id} className="bg-slate-850 border border-slate-800 rounded-xl p-4 space-y-3">
                              <div className="flex items-center justify-between text-xs">
                                <span className="font-bold text-white">{sub.productName}</span>
                                <span className="text-slate-500">Device Limit: 5</span>
                              </div>

                              <div className="flex items-center justify-between bg-slate-900 border border-slate-800 rounded-lg p-2 font-mono text-xs text-indigo-400">
                                <span>{sub.licenseKey}</span>
                                <button
                                  onClick={() => copyToClipboard(sub.licenseKey)}
                                  className="p-1 hover:bg-slate-800 text-slate-400 hover:text-white rounded transition cursor-pointer"
                                >
                                  {copiedKey === sub.licenseKey ? (
                                    <Check className="w-4 h-4 text-emerald-400" />
                                  ) : (
                                    <Copy className="w-4 h-4" />
                                  )}
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>

                        {/* Interactive Activation Simulator */}
                        <div className="bg-slate-800/40 border border-slate-800 rounded-3xl p-6 space-y-4">
                          <div className="flex items-center gap-2">
                            <Terminal className="w-5 h-5 text-indigo-400" />
                            <div>
                              <h4 className="font-bold text-white text-sm">Physical Device Activation Simulator</h4>
                              <p className="text-[10px] text-slate-400">Simulate activating your SaaS software on a retail tablet or school server.</p>
                            </div>
                          </div>

                          <form onSubmit={handleSimulateActivation} className="space-y-3">
                            <div>
                              <label className="block text-[10px] text-slate-400 mb-1">Target Software Product</label>
                              <select
                                required
                                value={simProductId}
                                onChange={(e) => setSimProductId(e.target.value)}
                                className="w-full bg-slate-900 border border-slate-700 px-3 py-2 rounded-xl text-xs text-white outline-none"
                              >
                                <option value="">-- Choose Product --</option>
                                {subscriptions.map((s) => (
                                  <option key={s.id} value={s.productId}>{s.productName}</option>
                                ))}
                              </select>
                            </div>

                            <div>
                              <label className="block text-[10px] text-slate-400 mb-1">Enter Generated License Key</label>
                              <input
                                type="text"
                                required
                                placeholder="Paste format: PROD-CTR-YYYY-XXXXXX"
                                value={simLicenseKey}
                                onChange={(e) => setSimLicenseKey(e.target.value)}
                                className="w-full bg-slate-900 border border-slate-700 px-3 py-2 rounded-xl text-xs text-indigo-300 font-mono focus:ring-1 focus:ring-indigo-500 outline-none"
                              />
                            </div>

                            <button
                              type="submit"
                              className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl transition cursor-pointer"
                            >
                              Simulate Hardware Activation
                            </button>
                          </form>

                          {/* Live Verification Console Output */}
                          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 font-mono text-[10px] h-36 overflow-y-auto space-y-1 text-emerald-400">
                            <span className="text-slate-500 block">*** CENTRAL LICENSING CONSOLE ***</span>
                            {simLogs.map((log, i) => (
                              <p key={i}>{log}</p>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* TAB 3: SUPPORT TICKETS & REAL-TIME CHAT */}
                {activeTab === "support" && (
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Left 1/3: Ticket List & Create button */}
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Tickets ({tickets.length})</span>
                        <button
                          onClick={() => setIsNewTicketOpen(true)}
                          className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-[10px] rounded-lg transition flex items-center gap-1 cursor-pointer"
                        >
                          <Plus className="w-3 h-3" />
                          <span>New Ticket</span>
                        </button>
                      </div>

                      {tickets.length === 0 ? (
                        <div className="bg-slate-850 border border-slate-800 p-8 text-center rounded-xl">
                          <p className="text-slate-400 text-xs">No active support tickets.</p>
                        </div>
                      ) : (
                        <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
                          {tickets.map((t) => (
                            <div
                              key={t.id}
                              onClick={() => setSelectedTicket(t)}
                              className={`p-3 rounded-xl border transition cursor-pointer text-left ${
                                selectedTicket?.id === t.id
                                  ? "bg-slate-800 border-indigo-500"
                                  : "bg-slate-850 border-slate-800 hover:bg-slate-800"
                              }`}
                            >
                              <div className="flex justify-between text-[10px]">
                                <span className="font-mono text-slate-500">{t.category}</span>
                                <span className={`font-semibold uppercase ${
                                  t.status === "open" ? "text-emerald-400" : "text-slate-400"
                                }`}>{t.status}</span>
                              </div>
                              <h4 className="font-bold text-white text-xs mt-1.5 line-clamp-1">{t.subject}</h4>
                              <p className="text-[10px] text-slate-400 line-clamp-1 mt-0.5">{t.description}</p>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Right 2/3: Live Ticket Messaging Chat */}
                    <div className="lg:col-span-2">
                      {selectedTicket ? (
                        <div className="bg-slate-850 border border-slate-800 rounded-2xl overflow-hidden flex flex-col h-[400px]">
                          {/* Chat Header */}
                          <div className="p-4 bg-slate-900 border-b border-slate-800 flex items-center justify-between text-xs">
                            <div>
                              <h4 className="font-bold text-white">{selectedTicket.subject}</h4>
                              <p className="text-[10px] text-slate-400 mt-0.5">Category: {selectedTicket.category} | Priority: {selectedTicket.priority}</p>
                            </div>
                            <span className="bg-indigo-500/10 text-indigo-400 px-2.5 py-0.5 rounded-full text-[10px] font-bold">
                              Ticket: {selectedTicket.id}
                            </span>
                          </div>

                          {/* Chat Messages Scrolling Area */}
                          <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-slate-900/40">
                            {selectedTicket.messages?.map((msg, i) => {
                              const isAdmin = msg.sender === "admin";
                              return (
                                <div key={i} className={`flex ${isAdmin ? "justify-start" : "justify-end"}`}>
                                  <div className={`p-3 rounded-2xl max-w-sm text-xs ${
                                    isAdmin 
                                      ? "bg-slate-800 text-indigo-300 border border-slate-700 rounded-tl-none" 
                                      : "bg-indigo-600 text-white rounded-tr-none"
                                  }`}>
                                    <span className="text-[8px] font-bold block opacity-60 mb-1">
                                      {isAdmin ? "SUPER ADMIN" : "CLIENT"}
                                    </span>
                                    <p className="leading-relaxed whitespace-pre-wrap">{msg.message}</p>
                                    <span className="text-[7px] text-right block mt-1 opacity-50">
                                      {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                  </div>
                                </div>
                              );
                            })}
                          </div>

                          {/* Chat Reply Input Bar */}
                          <form onSubmit={handleSendTicketReply} className="p-3 bg-slate-900 border-t border-slate-800 flex gap-2">
                            <input
                              type="text"
                              required
                              placeholder="Type response to support tech..."
                              value={chatMessage}
                              onChange={(e) => setChatMessage(e.target.value)}
                              className="flex-1 bg-slate-850 border border-slate-700 rounded-xl px-4 py-2 text-xs text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                            />
                            <button
                              type="submit"
                              className="p-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl transition cursor-pointer"
                            >
                              <Send className="w-4 h-4" />
                            </button>
                          </form>
                        </div>
                      ) : (
                        <div className="bg-slate-850 border border-slate-800 rounded-2xl h-[400px] flex flex-col justify-center items-center text-center p-6 text-slate-500">
                          <LifeBuoy className="w-12 h-12 text-slate-700 mb-3" />
                          <p className="text-xs">Select any support ticket to launch the live messaging chat interface.</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* TAB 4: BILLING / INVOICES */}
                {activeTab === "billing" && (
                  <div className="bg-slate-850 border border-slate-800 rounded-2xl overflow-hidden">
                    {invoices.length === 0 ? (
                      <div className="p-12 text-center text-slate-400 text-xs space-y-2">
                        <FileText className="w-10 h-10 text-slate-700 mx-auto mb-2" />
                        <p>No billing invoices recorded yet.</p>
                      </div>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse text-xs">
                          <thead>
                            <tr className="bg-slate-900/60 text-slate-400 font-bold border-b border-slate-800 text-[10px] uppercase tracking-wider">
                              <th className="p-4">Invoice ID</th>
                              <th className="p-4">Application</th>
                              <th className="p-4">Channel</th>
                              <th className="p-4">Billing Plan</th>
                              <th className="p-4">Amount</th>
                              <th className="p-4">Status</th>
                              <th className="p-4">Generated At</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-800/50">
                            {invoices.map((inv) => (
                              <tr key={inv.id} className="hover:bg-slate-800/40 text-slate-300">
                                <td className="p-4 font-mono text-indigo-400">{inv.id}</td>
                                <td className="p-4 font-bold text-white">{inv.productName}</td>
                                <td className="p-4">{inv.paymentMethod}</td>
                                <td className="p-4 capitalize">{inv.planType}</td>
                                <td className="p-4 font-extrabold text-white">
                                  {inv.currency === "UGX" ? `${inv.amount * 3700}` : `${inv.amount * 130}`} {inv.currency}
                                </td>
                                <td className="p-4">
                                  <span className="bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded-md font-semibold uppercase text-[10px]">
                                    {inv.status}
                                  </span>
                                </td>
                                <td className="p-4 text-slate-400">
                                  {new Date(inv.createdAt).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                )}
              </>
            )}
          </div>
        </>
      )}

      {/* NEW TICKET MODAL */}
      <AnimatePresence>
        {isNewTicketOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsNewTicketOpen(false)}
              className="fixed inset-0 bg-slate-950 z-50 cursor-pointer"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="fixed inset-y-12 inset-x-4 md:inset-x-64 bg-slate-800 rounded-3xl shadow-2xl z-50 border border-slate-700 max-w-lg mx-auto flex flex-col overflow-hidden"
              id="new-ticket-modal"
            >
              <div className="p-5 border-b border-slate-700 bg-slate-900 flex justify-between items-center">
                <span className="text-sm font-extrabold text-white">Submit New Support Ticket</span>
                <button
                  onClick={() => setIsNewTicketOpen(false)}
                  className="p-1 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition cursor-pointer"
                >
                  <XIcon className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleCreateTicket} className="p-6 space-y-4 overflow-y-auto flex-1">
                <div>
                  <label className="block text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-1">Ticket Subject</label>
                  <input
                    type="text"
                    required
                    placeholder="Briefly state your concern..."
                    value={newTicketSubject}
                    onChange={(e) => setNewTicketSubject(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 px-3 py-2 rounded-xl text-xs text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-1">Category</label>
                    <select
                      value={newTicketCategory}
                      onChange={(e) => setNewTicketCategory(e.target.value as any)}
                      className="w-full bg-slate-900 border border-slate-700 px-3 py-2 rounded-xl text-xs text-white outline-none"
                    >
                      <option value="Technical">Technical Support</option>
                      <option value="Billing">Billing & Subscription</option>
                      <option value="Sales">Sales & Upgrades</option>
                      <option value="General">General Question</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-1">Priority</label>
                    <select
                      value={newTicketPriority}
                      onChange={(e) => setNewTicketPriority(e.target.value as any)}
                      className="w-full bg-slate-900 border border-slate-700 px-3 py-2 rounded-xl text-xs text-white outline-none"
                    >
                      <option value="low">Low Priority</option>
                      <option value="medium">Medium Priority</option>
                      <option value="high">High Priority</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-1">Full Concern Details</label>
                  <textarea
                    required
                    rows={4}
                    placeholder="Describe what occurred. If a device validation error, paste log output..."
                    value={newTicketDescription}
                    onChange={(e) => setNewTicketDescription(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 px-3 py-2 rounded-xl text-xs text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl transition cursor-pointer"
                >
                  Create Support Record
                </button>
              </form>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* REAL-TIME DYNAMIC PROVISIONING SIMULATION TERMINAL */}
      <AnimatePresence>
        {isProvisioningModalOpen && activeProvisioning && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={() => {
                if (activeProvisioning.progress === 100) {
                  setIsProvisioningModalOpen(false);
                }
              }}
              className="fixed inset-0 bg-slate-950 z-50 cursor-pointer"
            />
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 30 }}
              className="fixed inset-y-12 inset-x-4 md:inset-x-32 bg-slate-950 border border-slate-800 rounded-3xl shadow-2xl z-50 max-w-2xl mx-auto flex flex-col overflow-hidden"
              id="provisioning-terminal-modal"
            >
              {/* Header */}
              <div className="p-4 bg-slate-900 border-b border-slate-800 flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <Terminal className="w-5 h-5 text-indigo-400" />
                  <div>
                    <h3 className="font-extrabold text-sm text-white">SaaS Deploy Management</h3>
                    <p className="text-[10px] text-slate-400">Automated Server Provisioner Instance</p>
                  </div>
                </div>
                {activeProvisioning.progress === 100 && (
                  <button
                    onClick={() => setIsProvisioningModalOpen(false)}
                    className="p-1 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white cursor-pointer transition"
                  >
                    <XIcon className="w-5 h-5" />
                  </button>
                )}
              </div>

              {/* Terminal Logs area */}
              <div className="flex-1 p-5 overflow-y-auto space-y-1 font-mono text-[10px] text-emerald-400">
                {activeProvisioning.logs.map((logStr, i) => (
                  <p key={i}>{logStr}</p>
                ))}
                <div ref={terminalEndRef} />
              </div>

              {/* Progress Slider */}
              <div className="p-5 bg-slate-900 border-t border-slate-800 space-y-3">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-400">Server Deploy Progress</span>
                  <span className="font-extrabold text-white">{activeProvisioning.progress}%</span>
                </div>

                <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                  <div
                    className="bg-indigo-500 h-full transition-all duration-300"
                    style={{ width: `${activeProvisioning.progress}%` }}
                  />
                </div>

                {activeProvisioning.progress === 100 ? (
                  <div className="pt-2 flex justify-between items-center">
                    <span className="text-[10px] text-emerald-400 font-semibold flex items-center gap-1">
                      <Check className="w-3.5 h-3.5" />
                      <span>SaaS Container Deployment Successful!</span>
                    </span>
                    <button
                      onClick={() => {
                        setIsProvisioningModalOpen(false);
                        setSelectedSimProduct({
                          id: (activeProvisioning as any).productId || "app",
                          name: activeProvisioning.productName,
                          domain: activeProvisioning.domain,
                          licenseKey: "SSD-LIC-ACTIVE-2026"
                        });
                      }}
                      className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-bold rounded-lg transition cursor-pointer flex items-center gap-1"
                    >
                      <span>Open Live App</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ) : (
                  <p className="text-[9px] text-slate-500">Creating isolated databases & routing tables on cluster. Do not close this panel...</p>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* SAAS SOFTWARE SIMULATOR MODAL OVERLAY */}
      <ErrorBoundary fallbackTitle="Client Portal SaaS Viewer">
        <SaaSSimulatorModal
          isOpen={selectedSimProduct !== null}
          onClose={() => setSelectedSimProduct(null)}
          productId={selectedSimProduct?.id || ""}
          productName={selectedSimProduct?.name || ""}
          domain={selectedSimProduct?.domain || ""}
          licenseKey={selectedSimProduct?.licenseKey || ""}
        />
      </ErrorBoundary>
    </div>
  );
}

// Simple internal helper icon
function XIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M18 6 6 18" />
      <path d="m6 6 12 12" />
    </svg>
  );
}
