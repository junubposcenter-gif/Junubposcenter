import React, { useState, useEffect } from "react";
import { 
  collection, 
  getDocs, 
  doc, 
  setDoc, 
  updateDoc, 
  getDoc,
  arrayUnion,
  query,
  where
} from "firebase/firestore";
import { db, auth } from "../firebase-client";
import { Product, Subscription, SupportTicket, ClientProfile, Invoice } from "../types";
import { STATIC_PRODUCTS } from "../products-static";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  LineChart,
  Line
} from "recharts";
import { 
  TrendingUp, 
  Users, 
  ShieldAlert, 
  DollarSign, 
  Layers, 
  Plus, 
  Check, 
  X, 
  UserMinus, 
  UserCheck, 
  AlertTriangle,
  MessageSquare,
  FileText,
  Mail,
  Edit,
  Tag,
  Briefcase,
  LogOut
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface SuperAdminProps {
  onLogoutSuccess: () => void;
}

export default function SuperAdmin({ onLogoutSuccess }: SuperAdminProps) {
  const [activeSubTab, setActiveSubTab] = useState<"dashboard" | "products" | "customers" | "tickets">("dashboard");
  
  // Lists
  const [products, setProducts] = useState<Product[]>([]);
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [clients, setClients] = useState<ClientProfile[]>([]);
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);

  // New Product Form
  const [isNewProductOpen, setIsNewProductOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [productForm, setProductForm] = useState({
    id: "",
    name: "",
    tagline: "",
    description: "",
    category: "POS & Retail",
    pricingMonthly: 29,
    pricingYearly: 290,
    pricingLifetime: 599,
    screenshot1: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?auto=format&fit=crop&w=800&q=80",
    screenshot2: "https://images.unsplash.com/photo-1556740758-90de374c12ad?auto=format&fit=crop&w=800&q=80",
    status: "active" as "active" | "inactive"
  });

  // Ticket Reply Form
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
  const [adminReplyText, setAdminReplyText] = useState("");
  const [sendingReply, setSendingReply] = useState(false);

  useEffect(() => {
    loadAdminData();
  }, []);

  const loadAdminData = async () => {
    setLoading(true);

    const localSubs: Subscription[] = JSON.parse(localStorage.getItem("local_subscriptions") || "[]");
    const localInvoices: Invoice[] = JSON.parse(localStorage.getItem("local_invoices") || "[]");
    const localTickets: SupportTicket[] = JSON.parse(localStorage.getItem("local_tickets") || "[]");

    try {
      // Products
      const prodSnapshot = await getDocs(collection(db, "products"));
      const prods: Product[] = [];
      prodSnapshot.forEach((d) => prods.push({ id: d.id, ...d.data() } as Product));
      setProducts(prods.length > 0 ? prods : STATIC_PRODUCTS);

      // Subscriptions
      const subSnapshot = await getDocs(collection(db, "subscriptions"));
      const subs: Subscription[] = [];
      subSnapshot.forEach((d) => subs.push(d.data() as Subscription));
      
      const mergedSubs = [...subs];
      localSubs.forEach(ls => {
        if (!mergedSubs.some(s => s.id === ls.id)) mergedSubs.push(ls);
      });
      setSubscriptions(mergedSubs);

      // Clients
      const clientsSnapshot = await getDocs(collection(db, "clients"));
      const cls: ClientProfile[] = [];
      clientsSnapshot.forEach((d) => cls.push(d.data() as ClientProfile));
      
      const localClients = JSON.parse(localStorage.getItem("local_clients") || "[]");
      const mergedClients = [...cls];
      localClients.forEach((lc: any) => {
        if (!mergedClients.some(c => c.id === lc.id)) {
          mergedClients.push({
            id: lc.uid || lc.id,
            email: lc.email,
            name: lc.displayName || lc.name,
            company: lc.company || "Demo Company",
            phone: lc.phone || "",
            role: lc.role || "customer",
            status: lc.status || "active",
            createdAt: lc.createdAt || new Date().toISOString()
          } as ClientProfile);
        }
      });
      setClients(mergedClients);

      // Invoices
      const invSnapshot = await getDocs(collection(db, "invoices"));
      const invs: Invoice[] = [];
      invSnapshot.forEach((d) => invs.push(d.data() as Invoice));
      
      const mergedInvs = [...invs];
      localInvoices.forEach(li => {
        if (!mergedInvs.some(i => i.id === li.id)) mergedInvs.push(li);
      });
      setInvoices(mergedInvs);

      // Tickets
      const tixSnapshot = await getDocs(collection(db, "tickets"));
      const tix: SupportTicket[] = [];
      tixSnapshot.forEach((d) => tix.push(d.data() as SupportTicket));
      
      const mergedTix = [...tix];
      localTickets.forEach(lt => {
        if (!mergedTix.some(t => t.id === lt.id)) mergedTix.push(lt);
      });
      setTickets(mergedTix);
    } catch (err) {
      console.warn("Firestore fetch error for admin data, falling back to local state:", err);
      setProducts(STATIC_PRODUCTS);
      setSubscriptions(localSubs);
      setInvoices(localInvoices);
      setTickets(localTickets);
      
      // Seed a mock Admin profile and merge with local clients to keep layout consistent
      const localClients = JSON.parse(localStorage.getItem("local_clients") || "[]");
      const defaultAdmin: ClientProfile = {
        id: "super-admin-uid",
        email: "junubposcenter@gmail.com",
        name: "Super Admin (Offline)",
        role: "admin",
        status: "active",
        createdAt: new Date().toISOString()
      };
      const mergedClients: ClientProfile[] = [defaultAdmin];
      localClients.forEach((lc: any) => {
        const id = lc.uid || lc.id;
        if (!mergedClients.some(c => c.id === id)) {
          mergedClients.push({
            id: id,
            email: lc.email,
            name: lc.displayName || lc.name,
            company: lc.company || "Demo Company",
            phone: lc.phone || "",
            role: lc.role === "admin" ? "admin" : "customer",
            status: lc.status === "suspended" ? "suspended" : "active",
            createdAt: lc.createdAt || new Date().toISOString()
          });
        }
      });
      setClients(mergedClients);
    } finally {
      setLoading(false);
    }
  };

  // MRR Calculation
  const calculateMRR = () => {
    return subscriptions
      .filter((sub) => sub.status === "active")
      .reduce((acc, sub) => {
        if (sub.planType === "monthly") return acc + sub.price;
        if (sub.planType === "yearly") return acc + (sub.price / 12);
        return acc + (sub.price / 120); // Normalized estimate for lifetime amortization
      }, 0);
  };

  const calculateTotalRevenue = () => {
    return invoices.reduce((acc, inv) => acc + inv.amount, 0);
  };

  // Add/Edit Product Submission
  const handleProductSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const prodId = editingProduct ? editingProduct.id : productForm.id.toLowerCase().replace(/[^a-z0-9]/g, "");
    
    if (!prodId) return;

    const prodData: Product = {
      id: prodId,
      name: productForm.name,
      tagline: productForm.tagline,
      description: productForm.description,
      category: productForm.category,
      pricing: {
        monthly: Number(productForm.pricingMonthly),
        yearly: Number(productForm.pricingYearly),
        lifetime: Number(productForm.pricingLifetime)
      },
      screenshots: [productForm.screenshot1, productForm.screenshot2],
      rating: editingProduct ? editingProduct.rating : 5.0,
      reviewsCount: editingProduct ? editingProduct.reviewsCount : 0,
      status: productForm.status
    };

    try {
      await setDoc(doc(db, "products", prodId), prodData);
      setIsNewProductOpen(false);
      setEditingProduct(null);
      // Reset
      setProductForm({
        id: "",
        name: "",
        tagline: "",
        description: "",
        category: "POS & Retail",
        pricingMonthly: 29,
        pricingYearly: 290,
        pricingLifetime: 599,
        screenshot1: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?auto=format&fit=crop&w=800&q=80",
        screenshot2: "https://images.unsplash.com/photo-1556740758-90de374c12ad?auto=format&fit=crop&w=800&q=80",
        status: "active"
      });
      loadAdminData();
    } catch (err) {
      console.warn("Failed to write product to Cloud Firestore, saving to local session state:", err);
      // Fallback: update in-memory products state directly so it reflects on screen
      setProducts((prev) => {
        const index = prev.findIndex((p) => p.id === prodId);
        if (index !== -1) {
          const updated = [...prev];
          updated[index] = prodData;
          return updated;
        } else {
          return [...prev, prodData];
        }
      });
      setIsNewProductOpen(false);
      setEditingProduct(null);
    }
  };

  // Toggle client status (suspend/activate)
  const handleToggleClientStatus = async (client: ClientProfile) => {
    const newStatus = client.status === "active" ? "suspended" : "active";
    try {
      await updateDoc(doc(db, "clients", client.id), {
        status: newStatus
      });
      loadAdminData();
    } catch (err) {
      console.error("Failed to update client status:", err);
    }
  };

  // Submit Super Admin reply to customer support ticket
  const handleAdminTicketReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTicket || !adminReplyText.trim()) return;
    setSendingReply(true);

    const reply = {
      sender: "admin" as const,
      message: adminReplyText,
      timestamp: new Date().toISOString()
    };

    try {
      const ticketRef = doc(db, "tickets", selectedTicket.id);
      await updateDoc(ticketRef, {
        messages: arrayUnion(reply),
        status: "in-progress",
        updatedAt: new Date().toISOString()
      });

      setSelectedTicket((prev: any) => ({
        ...prev,
        status: "in-progress",
        messages: [...(prev.messages || []), reply]
      }));
      setAdminReplyText("");
      loadAdminData();
    } catch (err) {
      console.error("Failed to append admin reply:", err);
    } finally {
      setSendingReply(false);
    }
  };

  const handleResolveTicket = async (ticketId: string) => {
    try {
      await updateDoc(doc(db, "tickets", ticketId), {
        status: "resolved",
        updatedAt: new Date().toISOString()
      });
      if (selectedTicket?.id === ticketId) {
        setSelectedTicket((prev: any) => ({ ...prev, status: "resolved" }));
      }
      loadAdminData();
    } catch (err) {
      console.error(err);
    }
  };

  // Recharts Seed Data structures
  const chartData = [
    { name: "Jan", revenue: 1200, subscriptions: 12 },
    { name: "Feb", revenue: 1900, subscriptions: 18 },
    { name: "Mar", revenue: 3100, subscriptions: 24 },
    { name: "Apr", revenue: 4800, subscriptions: 31 },
    { name: "May", revenue: 6400, subscriptions: 42 },
    { name: "Jun", revenue: 8900, subscriptions: 58 },
    { name: "Jul", revenue: (calculateTotalRevenue() || 11200), subscriptions: subscriptions.length || 64 },
  ];

  // Best selling calculation
  const getCategoryCounts = () => {
    const counts: { [key: string]: number } = {};
    subscriptions.forEach((s) => {
      counts[s.productName] = (counts[s.productName] || 0) + 1;
    });
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  };

  return (
    <div className="bg-slate-900 min-h-screen text-slate-100 font-sans flex flex-col md:flex-row" id="admin-root">
      {/* Admin Panel Tab Sidebar */}
      <div className="w-full md:w-64 bg-slate-950 border-r border-slate-800 p-6 flex flex-col justify-between">
        <div className="space-y-8">
          <div>
            <span className="text-[10px] text-indigo-400 font-black tracking-widest uppercase block">Admin Center</span>
            <span className="font-extrabold text-sm block text-white mt-1">Super Controls</span>
          </div>

          <nav className="space-y-1">
            {[
              { id: "dashboard", label: "Dashboard Metrics", icon: TrendingUp },
              { id: "products", label: "Market Products", icon: Layers },
              { id: "customers", label: "Client Database", icon: Users },
              { id: "tickets", label: "Support Queues", icon: MessageSquare }
            ].map((tab) => {
              const IconComp = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveSubTab(tab.id as any)}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold tracking-wide transition cursor-pointer ${
                    activeSubTab === tab.id
                      ? "bg-indigo-600 text-white shadow-md"
                      : "text-slate-400 hover:text-slate-200 hover:bg-slate-900"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <IconComp className="w-4 h-4" />
                    <span>{tab.label}</span>
                  </div>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Sidebar Footer LogOut */}
        <div className="pt-4 border-t border-slate-800">
          <button
            onClick={async () => {
              try {
                await auth.signOut();
              } catch (e) {
                console.warn("Firebase signout error:", e);
              }
              onLogoutSuccess();
            }}
            className="w-full flex items-center gap-2 px-3 py-2.5 rounded-xl text-xs font-semibold tracking-wide text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 transition cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out Session</span>
          </button>
        </div>
      </div>

      {/* Main Panel */}
      <div className="flex-1 p-6 md:p-8 overflow-y-auto space-y-6">
        {/* Header */}
        <div className="border-b border-slate-800 pb-5">
          <h2 className="text-xl font-black text-white capitalize">System Control: {activeSubTab}</h2>
          <p className="text-xs text-slate-400">Configure global parameters, activate or suspend user licenses.</p>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 gap-4">
            <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-xs text-slate-400 font-medium">Downloading administrative ledgers...</p>
          </div>
        ) : (
          <>
            {/* SUBTAB 1: ANALYTICS DASHBOARD */}
            {activeSubTab === "dashboard" && (
              <div className="space-y-6">
                {/* Stats Widgets */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="bg-slate-850 p-5 rounded-2xl border border-slate-800 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">MRR (Amortized)</span>
                      <span className="text-2xl font-black text-white mt-1.5 block">
                        ${calculateMRR().toLocaleString(undefined, { maximumFractionDigits: 0 })}
                      </span>
                    </div>
                    <div className="p-3 bg-indigo-500/10 text-indigo-400 rounded-xl">
                      <DollarSign className="w-5 h-5" />
                    </div>
                  </div>

                  <div className="bg-slate-850 p-5 rounded-2xl border border-slate-800 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Total Clients</span>
                      <span className="text-2xl font-black text-white mt-1.5 block">
                        {clients.length || 8}
                      </span>
                    </div>
                    <div className="p-3 bg-indigo-500/10 text-indigo-400 rounded-xl">
                      <Users className="w-5 h-5" />
                    </div>
                  </div>

                  <div className="bg-slate-850 p-5 rounded-2xl border border-slate-800 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Active Licenses</span>
                      <span className="text-2xl font-black text-white mt-1.5 block">
                        {subscriptions.filter((s) => s.status === "active").length || 3}
                      </span>
                    </div>
                    <div className="p-3 bg-indigo-500/10 text-indigo-400 rounded-xl">
                      <TrendingUp className="w-5 h-5" />
                    </div>
                  </div>

                  <div className="bg-slate-850 p-5 rounded-2xl border border-slate-800 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Cumulative Income</span>
                      <span className="text-2xl font-black text-white mt-1.5 block">
                        ${calculateTotalRevenue().toLocaleString()}
                      </span>
                    </div>
                    <div className="p-3 bg-indigo-500/10 text-indigo-400 rounded-xl">
                      <FileText className="w-5 h-5" />
                    </div>
                  </div>
                </div>

                {/* Recharts Graphical Panels */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Revenue Growth Trend */}
                  <div className="bg-slate-850 border border-slate-800 p-5 rounded-2xl space-y-4">
                    <h3 className="text-sm font-bold text-white">Monthly Subscription Revenue Growth (USD)</h3>
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={chartData}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                          <XAxis dataKey="name" stroke="#64748b" fontSize={11} />
                          <YAxis stroke="#64748b" fontSize={11} />
                          <Tooltip contentStyle={{ backgroundColor: "#0f172a", borderColor: "#1e293b" }} />
                          <Line type="monotone" dataKey="revenue" stroke="#6366f1" strokeWidth={3} dot={{ fill: "#6366f1" }} />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  {/* Best Selling Products */}
                  <div className="bg-slate-850 border border-slate-800 p-5 rounded-2xl space-y-4">
                    <h3 className="text-sm font-bold text-white">Best Selling Applications (Volume)</h3>
                    {getCategoryCounts().length === 0 ? (
                      <p className="text-xs text-slate-500 py-20 text-center">No purchases recorded yet for sales breakdowns.</p>
                    ) : (
                      <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={getCategoryCounts()}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                            <XAxis dataKey="name" stroke="#64748b" fontSize={10} />
                            <YAxis stroke="#64748b" fontSize={10} />
                            <Tooltip contentStyle={{ backgroundColor: "#0f172a", borderColor: "#1e293b" }} />
                            <Bar dataKey="value" fill="#4f46e5" radius={[5, 5, 0, 0]} />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* SUBTAB 2: PRODUCT MANAGEMENT */}
            {activeSubTab === "products" && (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Active Catalog Products ({products.length})</span>
                  <button
                    onClick={() => {
                      setEditingProduct(null);
                      setIsNewProductOpen(true);
                    }}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs rounded-xl transition flex items-center gap-1.5 cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add New App</span>
                  </button>
                </div>

                <div className="bg-slate-850 border border-slate-800 rounded-2xl overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="bg-slate-900/60 text-slate-400 font-bold border-b border-slate-800 text-[10px] uppercase tracking-wider">
                          <th className="p-4">App ID</th>
                          <th className="p-4">Application Name</th>
                          <th className="p-4">Category</th>
                          <th className="p-4">Monthly</th>
                          <th className="p-4">Yearly</th>
                          <th className="p-4">Lifetime</th>
                          <th className="p-4">Status</th>
                          <th className="p-4">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/50">
                        {products.map((p) => (
                          <tr key={p.id} className="hover:bg-slate-800/40 text-slate-300">
                            <td className="p-4 font-mono text-indigo-400">{p.id}</td>
                            <td className="p-4 font-bold text-white">{p.name}</td>
                            <td className="p-4">{p.category}</td>
                            <td className="p-4">${p.pricing.monthly}</td>
                            <td className="p-4">${p.pricing.yearly}</td>
                            <td className="p-4">${p.pricing.lifetime}</td>
                            <td className="p-4">
                              <span className={`px-2 py-0.5 rounded-md font-semibold text-[10px] uppercase ${
                                p.status === "active" ? "bg-emerald-500/10 text-emerald-400" : "bg-rose-500/10 text-rose-400"
                              }`}>
                                {p.status}
                              </span>
                            </td>
                            <td className="p-4">
                              <button
                                onClick={() => {
                                  setEditingProduct(p);
                                  setProductForm({
                                    id: p.id,
                                    name: p.name,
                                    tagline: p.tagline,
                                    description: p.description,
                                    category: p.category,
                                    pricingMonthly: p.pricing.monthly,
                                    pricingYearly: p.pricing.yearly,
                                    pricingLifetime: p.pricing.lifetime,
                                    screenshot1: p.screenshots[0] || "",
                                    screenshot2: p.screenshots[1] || "",
                                    status: p.status
                                  });
                                  setIsNewProductOpen(true);
                                }}
                                className="p-1 hover:bg-slate-800 text-indigo-400 hover:text-indigo-300 rounded cursor-pointer transition"
                              >
                                <Edit className="w-4 h-4" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* SUBTAB 3: CUSTOMER MANAGEMENT */}
            {activeSubTab === "customers" && (
              <div className="space-y-4">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Registered Client Database</span>

                <div className="bg-slate-850 border border-slate-800 rounded-2xl overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="bg-slate-900/60 text-slate-400 font-bold border-b border-slate-800 text-[10px] uppercase tracking-wider">
                          <th className="p-4">User ID</th>
                          <th className="p-4">Client Name</th>
                          <th className="p-4">Email</th>
                          <th className="p-4">Company</th>
                          <th className="p-4">Role</th>
                          <th className="p-4">Status</th>
                          <th className="p-4">Created Date</th>
                          <th className="p-4">Control Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/50">
                        {clients.length === 0 ? (
                          <tr>
                            <td colSpan={8} className="p-8 text-center text-slate-500">
                              No third-party clients registered yet.
                            </td>
                          </tr>
                        ) : (
                          clients.map((c) => (
                            <tr key={c.id} className="hover:bg-slate-800/40 text-slate-300">
                              <td className="p-4 font-mono text-indigo-400">{c.id.substring(0, 8)}...</td>
                              <td className="p-4 font-bold text-white">{c.name}</td>
                              <td className="p-4">{c.email}</td>
                              <td className="p-4">{c.company || "General Retail"}</td>
                              <td className="p-4 capitalize">{c.role}</td>
                              <td className="p-4">
                                <span className={`px-2 py-0.5 rounded-md font-semibold text-[10px] uppercase ${
                                  c.status === "active" ? "bg-emerald-500/10 text-emerald-400" : "bg-rose-500/10 text-rose-400"
                                }`}>
                                  {c.status}
                                </span>
                              </td>
                              <td className="p-4 text-slate-400">{new Date(c.createdAt || Date.now()).toLocaleDateString()}</td>
                              <td className="p-4">
                                <button
                                  onClick={() => handleToggleClientStatus(c)}
                                  className={`px-2.5 py-1 text-[10px] font-bold rounded-lg transition cursor-pointer flex items-center gap-1 ${
                                    c.status === "active"
                                      ? "bg-rose-500/10 hover:bg-rose-500/20 text-rose-400"
                                      : "bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400"
                                  }`}
                                >
                                  {c.status === "active" ? (
                                    <>
                                      <UserMinus className="w-3.5 h-3.5" />
                                      <span>Suspend</span>
                                    </>
                                  ) : (
                                    <>
                                      <UserCheck className="w-3.5 h-3.5" />
                                      <span>Activate</span>
                                    </>
                                  )}
                                </button>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* SUBTAB 4: SUPPORT QUEUES */}
            {activeSubTab === "tickets" && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Tickets Lists */}
                <div className="space-y-4">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Global Tickets ({tickets.length})</span>
                  
                  {tickets.length === 0 ? (
                    <div className="bg-slate-850 border border-slate-800 p-8 text-center rounded-xl text-slate-500">
                      No client tickets open in the queue.
                    </div>
                  ) : (
                    <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
                      {tickets.map((t) => (
                        <div
                          key={t.id}
                          onClick={() => setSelectedTicket(t)}
                          className={`p-3.5 rounded-2xl border transition cursor-pointer text-left ${
                            selectedTicket?.id === t.id
                              ? "bg-slate-800 border-indigo-500"
                              : "bg-slate-850 border-slate-800 hover:bg-slate-800"
                          }`}
                        >
                          <div className="flex justify-between items-center text-[10px]">
                            <span className="font-bold text-indigo-400 uppercase tracking-wide">{t.category}</span>
                            <span className={`font-semibold uppercase ${
                              t.status === "resolved" ? "text-slate-500" : "text-emerald-400 animate-pulse"
                            }`}>{t.status}</span>
                          </div>
                          <h4 className="font-bold text-white text-xs mt-2">{t.subject}</h4>
                          <p className="text-[10px] text-slate-400 mt-0.5">From: {t.customerName} ({t.customerEmail})</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Ticket Discussion Chat Area */}
                <div className="lg:col-span-2">
                  {selectedTicket ? (
                    <div className="bg-slate-850 border border-slate-800 rounded-2xl overflow-hidden flex flex-col h-[400px]">
                      {/* Header */}
                      <div className="p-4 bg-slate-900 border-b border-slate-800 flex items-center justify-between text-xs">
                        <div>
                          <h4 className="font-bold text-white">{selectedTicket.subject}</h4>
                          <p className="text-[10px] text-slate-400 mt-0.5">Author: {selectedTicket.customerName} | Email: {selectedTicket.customerEmail}</p>
                        </div>

                        <div className="flex gap-2">
                          {selectedTicket.status !== "resolved" && (
                            <button
                              onClick={() => handleResolveTicket(selectedTicket.id)}
                              className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[10px] rounded-lg transition cursor-pointer"
                            >
                              Mark Resolved
                            </button>
                          )}
                          <span className="bg-indigo-500/10 text-indigo-400 px-2 py-0.5 rounded-full text-[10px] font-mono">
                            {selectedTicket.id}
                          </span>
                        </div>
                      </div>

                      {/* Messages logs */}
                      <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-slate-900/40">
                        {selectedTicket.messages?.map((msg, i) => {
                          const isAdmin = msg.sender === "admin";
                          return (
                            <div key={i} className={`flex ${isAdmin ? "justify-end" : "justify-start"}`}>
                              <div className={`p-3 rounded-2xl max-w-sm text-xs ${
                                isAdmin 
                                  ? "bg-indigo-600 text-white rounded-tr-none" 
                                  : "bg-slate-800 text-indigo-300 border border-slate-700 rounded-tl-none"
                              }`}>
                                <span className="text-[8px] font-bold block opacity-60 mb-1 uppercase">
                                  {msg.sender}
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

                      {/* Input Reply */}
                      <form onSubmit={handleAdminTicketReply} className="p-3 bg-slate-900 border-t border-slate-800 flex gap-2">
                        <input
                          type="text"
                          required
                          placeholder="Send administrative support advice to client..."
                          value={adminReplyText}
                          onChange={(e) => setAdminReplyText(e.target.value)}
                          className="flex-1 bg-slate-850 border border-slate-700 rounded-xl px-4 py-2 text-xs text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                        />
                        <button
                          type="submit"
                          disabled={sendingReply}
                          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl transition cursor-pointer"
                        >
                          {sendingReply ? "Sending..." : "Reply"}
                        </button>
                      </form>
                    </div>
                  ) : (
                    <div className="bg-slate-850 border border-slate-800 rounded-2xl h-[400px] flex flex-col justify-center items-center text-center p-6 text-slate-500">
                      <MessageSquare className="w-12 h-12 text-slate-700 mb-3" />
                      <p className="text-xs">Select any support ticket to launch the administrative reply workspace.</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* CREATE/EDIT PRODUCT MODAL */}
      <AnimatePresence>
        {isNewProductOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsNewProductOpen(false)}
              className="fixed inset-0 bg-slate-950 z-50 cursor-pointer"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="fixed inset-y-8 inset-x-4 md:inset-x-48 bg-slate-850 border border-slate-700 rounded-3xl shadow-2xl z-50 flex flex-col overflow-hidden max-w-2xl mx-auto"
              id="new-product-modal"
            >
              <div className="p-5 border-b border-slate-700 bg-slate-900 flex justify-between items-center">
                <span className="text-sm font-extrabold text-white">
                  {editingProduct ? `Edit Software Catalog: ${editingProduct.name}` : "Add New SaaS Application"}
                </span>
                <button
                  onClick={() => setIsNewProductOpen(false)}
                  className="p-1 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleProductSubmit} className="p-6 space-y-4 overflow-y-auto flex-1 text-xs">
                <div className="grid grid-cols-2 gap-4">
                  {!editingProduct && (
                    <div>
                      <label className="block text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-1">Unique Product ID</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. clinicpro"
                        value={productForm.id}
                        onChange={(e) => setProductForm({ ...productForm, id: e.target.value })}
                        className="w-full bg-slate-900 border border-slate-700 px-3 py-2 rounded-xl text-white outline-none"
                      />
                    </div>
                  )}

                  <div className={editingProduct ? "col-span-2" : ""}>
                    <label className="block text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-1">Application Name</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. ClinicPro UGA"
                      value={productForm.name}
                      onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                      className="w-full bg-slate-900 border border-slate-700 px-3 py-2 rounded-xl text-white outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-1">Tagline</label>
                  <input
                    type="text"
                    required
                    placeholder="Briefly describe the key value pitch..."
                    value={productForm.tagline}
                    onChange={(e) => setProductForm({ ...productForm, tagline: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700 px-3 py-2 rounded-xl text-white outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-1">Full Description</label>
                  <textarea
                    required
                    rows={3}
                    placeholder="Write detailed specifications of features, m-GURUSH offline syncing..."
                    value={productForm.description}
                    onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700 px-3 py-2 rounded-xl text-white outline-none"
                  />
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-1">Monthly Plan ($)</label>
                    <input
                      type="number"
                      required
                      value={productForm.pricingMonthly}
                      onChange={(e) => setProductForm({ ...productForm, pricingMonthly: Number(e.target.value) })}
                      className="w-full bg-slate-900 border border-slate-700 px-3 py-2 rounded-xl text-white outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-1">Yearly Plan ($)</label>
                    <input
                      type="number"
                      required
                      value={productForm.pricingYearly}
                      onChange={(e) => setProductForm({ ...productForm, pricingYearly: Number(e.target.value) })}
                      className="w-full bg-slate-900 border border-slate-700 px-3 py-2 rounded-xl text-white outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-1">Lifetime Plan ($)</label>
                    <input
                      type="number"
                      required
                      value={productForm.pricingLifetime}
                      onChange={(e) => setProductForm({ ...productForm, pricingLifetime: Number(e.target.value) })}
                      className="w-full bg-slate-900 border border-slate-700 px-3 py-2 rounded-xl text-white outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-1">Category</label>
                    <select
                      value={productForm.category}
                      onChange={(e) => setProductForm({ ...productForm, category: e.target.value })}
                      className="w-full bg-slate-900 border border-slate-700 px-3 py-2 rounded-xl text-white outline-none bg-slate-900"
                    >
                      <option value="POS & Retail">POS & Retail</option>
                      <option value="Healthcare">Healthcare</option>
                      <option value="Education">Education</option>
                      <option value="Hospitality">Hospitality</option>
                      <option value="Printing & Logistics">Printing & Logistics</option>
                      <option value="Enterprise & HR">Enterprise & HR</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-1">Status</label>
                    <select
                      value={productForm.status}
                      onChange={(e) => setProductForm({ ...productForm, status: e.target.value as any })}
                      className="w-full bg-slate-900 border border-slate-700 px-3 py-2 rounded-xl text-white outline-none bg-slate-900"
                    >
                      <option value="active">Active (Visible)</option>
                      <option value="inactive">Inactive (Disabled)</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-1">Screenshot Cover URL</label>
                    <input
                      type="text"
                      required
                      value={productForm.screenshot1}
                      onChange={(e) => setProductForm({ ...productForm, screenshot1: e.target.value })}
                      className="w-full bg-slate-900 border border-slate-700 px-3 py-2 rounded-xl text-white outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-1">Secondary Screenshot URL</label>
                    <input
                      type="text"
                      required
                      value={productForm.screenshot2}
                      onChange={(e) => setProductForm({ ...productForm, screenshot2: e.target.value })}
                      className="w-full bg-slate-900 border border-slate-700 px-3 py-2 rounded-xl text-white outline-none"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl transition cursor-pointer"
                >
                  {editingProduct ? "Save Catalog Modifications" : "Publish Software to Marketplace"}
                </button>
              </form>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
