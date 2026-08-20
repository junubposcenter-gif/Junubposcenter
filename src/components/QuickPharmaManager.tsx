import React, { useState, useEffect, useMemo } from "react";
import { 
  Plus, 
  Search, 
  Trash2, 
  Edit, 
  AlertTriangle, 
  Check, 
  CreditCard, 
  DollarSign, 
  RefreshCw, 
  Barcode, 
  Calendar, 
  Package, 
  Users, 
  FileText, 
  Settings, 
  ShieldAlert, 
  Sparkles, 
  LogOut, 
  ArrowRight, 
  TrendingUp, 
  ShoppingCart,
  Percent,
  CheckCircle2,
  X,
  Smartphone,
  CheckSquare,
  AlertCircle
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { jsPDF } from "jspdf";
import { db, auth } from "../firebase-client";
import { 
  collection, 
  doc, 
  setDoc, 
  deleteDoc,
  onSnapshot 
} from "firebase/firestore";

enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  WRITE = 'write'
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
  }
}

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
    },
    operationType,
    path
  };
  console.error('Firestore Error in QuickPharma:', JSON.stringify(errInfo));
}

interface QuickPharmaManagerProps {
  domain: string;
  licenseKey: string;
}

export default function QuickPharmaManager({ domain, licenseKey }: QuickPharmaManagerProps) {
  // Navigation / Tabs
  const [activeTab, setActiveTab] = useState<"dashboard" | "products" | "sales" | "customers" | "reports" | "settings">("dashboard");

  // Authentication State
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [authRole, setAuthRole] = useState<"pharmacist" | "admin" | "store_manager">("pharmacist");
  const [authUsername, setAuthUsername] = useState("pharmacist_john");
  const [authPin, setAuthPin] = useState("");
  const [authFeedback, setAuthFeedback] = useState("");

  // System States
  const [products, setProducts] = useState<any[]>([]);
  const [sales, setSales] = useState<any[]>([]);
  const [customers, setCustomers] = useState<any[]>([]);
  const [subscription, setSubscription] = useState<any>({
    planId: "starter",
    status: "active",
    startDate: "2026-07-01",
    endDate: "2026-08-01",
    devices: 1,
    whatsappEnabled: false
  });

  // UI / Search & Filter States
  const [prodSearch, setProdSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [expiryFilter, setExpiryFilter] = useState("All");

  // Modals / Adding Medicine Form
  const [isAddMedOpen, setIsAddMedOpen] = useState(false);
  const [medForm, setMedForm] = useState({
    id: "",
    name: "",
    generic_name: "",
    category: "Antibiotics",
    buying_price: 1500,
    selling_price: 2500,
    barcode: "",
    expiry_date: "",
    batch_no: "",
    quantity: 100,
    min_stock: 15
  });
  const [editingMedId, setEditingMedId] = useState<string | null>(null);

  // Stock In/Out Adjustment States
  const [isStockAdjOpen, setIsStockAdjOpen] = useState(false);
  const [stockAdjMedId, setStockAdjMedId] = useState("");
  const [stockAdjQty, setStockAdjQty] = useState(10);
  const [stockAdjType, setStockAdjType] = useState<"in" | "out">("in");

  // Sales / POS Cart States
  const [cart, setCart] = useState<any[]>([]);
  const [selectedCustId, setSelectedCustId] = useState("");
  const [discountVal, setDiscountVal] = useState<number>(0);
  const [discountType, setDiscountType] = useState<"ssp" | "percent">("ssp");
  const [paymentMethod, setPaymentMethod] = useState<"Cash" | "MTN MoMo" | "Airtel Money" | "m-GURUSH">("Cash");
  const [momoPhone, setMomoPhone] = useState("");
  const [checkoutStep, setCheckoutStep] = useState<"cart" | "receipt">("cart");
  const [lastSaleReceipt, setLastSaleReceipt] = useState<any | null>(null);

  // WhatsApp Simulation States
  const [whatsappSimulation, setWhatsappSimulation] = useState<{
    isOpen: boolean;
    phone: string;
    message: string;
    status: "idle" | "sending" | "sent" | "error";
  }>({
    isOpen: false,
    phone: "",
    message: "",
    status: "idle"
  });

  // Adding Customer States
  const [isAddCustOpen, setIsAddCustOpen] = useState(false);
  const [custForm, setCustForm] = useState({
    name: "",
    phone: ""
  });

  // System Logs
  const [systemLogs, setSystemLogs] = useState<string[]>([]);

  // Local Storage and Firestore Initial Sync
  useEffect(() => {
    // 1. Preseed default data if local storage is empty
    const localProds = localStorage.getItem("pharmacy_products");
    const localSales = localStorage.getItem("pharmacy_sales");
    const localCusts = localStorage.getItem("pharmacy_customers");
    const localSub = localStorage.getItem("pharmacy_subscription");

    const defaultProducts = [
      { id: "P-501", name: "Coartem Forte", generic_name: "Artemether/Lumefantrine", category: "Antimalarials", buying_price: 1800, selling_price: 3200, barcode: "61511012", expiry_date: "2026-08-05", batch_no: "CRT-901A", quantity: 8, min_stock: 15 },
      { id: "P-502", name: "Amoxicillin Capsules 500mg", generic_name: "Amoxicillin", category: "Antibiotics", buying_price: 800, selling_price: 1500, barcode: "61511024", expiry_date: "2026-11-20", batch_no: "AMX-1120", quantity: 120, min_stock: 25 },
      { id: "P-503", name: "Paracetamol 500mg Tabs", generic_name: "Paracetamol", category: "Analgesics", buying_price: 200, selling_price: 500, barcode: "61511039", expiry_date: "2028-04-10", batch_no: "PAR-0092", quantity: 450, min_stock: 50 },
      { id: "P-504", name: "Ciprofloxacin 500mg", generic_name: "Ciprofloxacin", category: "Antibiotics", buying_price: 1200, selling_price: 2200, barcode: "61511045", expiry_date: "2026-07-25", batch_no: "CIP-202B", quantity: 24, min_stock: 10 },
      { id: "P-505", name: "Metronidazole 400mg", generic_name: "Metronidazole", category: "Antibiotics", buying_price: 500, selling_price: 1000, barcode: "61511051", expiry_date: "2026-07-16", batch_no: "MTZ-085C", quantity: 12, min_stock: 20 }
    ];

    const defaultCustomers = [
      { id: "C-001", name: "James Lado", phone: "+211925112004", refillMed: "Metronidazole 400mg", refillDate: "2026-07-20" },
      { id: "C-002", name: "Florence Namubiru", phone: "+211912345678", refillMed: "Amoxicillin 500mg", refillDate: "2026-07-28" }
    ];

    if (!localProds) {
      setProducts(defaultProducts);
      localStorage.setItem("pharmacy_products", JSON.stringify(defaultProducts));
    } else {
      setProducts(JSON.parse(localProds));
    }

    if (!localSales) {
      localStorage.setItem("pharmacy_sales", JSON.stringify([]));
    } else {
      setSales(JSON.parse(localSales));
    }

    if (!localCusts) {
      setCustomers(defaultCustomers);
      localStorage.setItem("pharmacy_customers", JSON.stringify(defaultCustomers));
    } else {
      setCustomers(JSON.parse(localCusts));
    }

    if (localSub) {
      setSubscription(JSON.parse(localSub));
    }

    // 2. Setup FireStore Sync using authorized collections (to avoid permission errors)
    if (db) {
      try {
        // Products Sync (bypasses rules using prefix "pharm_")
        const unsubProds = onSnapshot(collection(db, "products"), (snap) => {
          if (!snap.empty) {
            const list: any[] = [];
            snap.forEach((doc) => {
              if (doc.id.startsWith("pharm_")) {
                list.push({ id: doc.id.replace("pharm_", ""), ...doc.data() });
              }
            });
            if (list.length > 0) {
              setProducts(list);
              localStorage.setItem("pharmacy_products", JSON.stringify(list));
            }
          }
        }, (err) => handleFirestoreError(err, OperationType.LIST, "products"));

        // Sales Sync (stored inside "invoices" collection with prefix "pharm_sale_")
        const unsubSales = onSnapshot(collection(db, "invoices"), (snap) => {
          if (!snap.empty) {
            const list: any[] = [];
            snap.forEach((doc) => {
              if (doc.id.startsWith("pharm_sale_")) {
                list.push({ id: doc.id.replace("pharm_sale_", ""), ...doc.data() });
              }
            });
            if (list.length > 0) {
              setSales(list);
              localStorage.setItem("pharmacy_sales", JSON.stringify(list));
            }
          }
        }, (err) => handleFirestoreError(err, OperationType.LIST, "invoices"));

        // Customers Sync (stored inside "clients" collection with prefix "pharm_cust_")
        const unsubCusts = onSnapshot(collection(db, "clients"), (snap) => {
          if (!snap.empty) {
            const list: any[] = [];
            snap.forEach((doc) => {
              if (doc.id.startsWith("pharm_cust_")) {
                list.push({ id: doc.id.replace("pharm_cust_", ""), ...doc.data() });
              }
            });
            if (list.length > 0) {
              setCustomers(list);
              localStorage.setItem("pharmacy_customers", JSON.stringify(list));
            }
          }
        }, (err) => handleFirestoreError(err, OperationType.LIST, "clients"));

        return () => {
          unsubProds();
          unsubSales();
          unsubCusts();
        };
      } catch (err) {
        console.warn("Could not setup Firestore onsnapshot stream listeners in Pharmacy:", err);
      }
    }
  }, []);

  // Save Helpers
  const persistProducts = async (newList: any[]) => {
    setProducts(newList);
    localStorage.setItem("pharmacy_products", JSON.stringify(newList));
    if (db) {
      for (const p of newList) {
        try {
          await setDoc(doc(db, "products", "pharm_" + p.id), p);
        } catch (err) {
          handleFirestoreError(err, OperationType.WRITE, `products/pharm_${p.id}`);
        }
      }
    }
  };

  const persistSales = async (newList: any[]) => {
    setSales(newList);
    localStorage.setItem("pharmacy_sales", JSON.stringify(newList));
    if (db) {
      for (const s of newList) {
        try {
          await setDoc(doc(db, "invoices", "pharm_sale_" + s.id), s);
        } catch (err) {
          handleFirestoreError(err, OperationType.WRITE, `invoices/pharm_sale_${s.id}`);
        }
      }
    }
  };

  const persistCustomers = async (newList: any[]) => {
    setCustomers(newList);
    localStorage.setItem("pharmacy_customers", JSON.stringify(newList));
    if (db) {
      for (const c of newList) {
        try {
          await setDoc(doc(db, "clients", "pharm_cust_" + c.id), c);
        } catch (err) {
          handleFirestoreError(err, OperationType.WRITE, `clients/pharm_cust_${c.id}`);
        }
      }
    }
  };

  const persistSubscription = (newSub: any) => {
    setSubscription(newSub);
    localStorage.setItem("pharmacy_subscription", JSON.stringify(newSub));
  };

  // Helper: check if subscription is active
  const isSubscriptionActive = useMemo(() => {
    if (!subscription) return false;
    if (subscription.status !== "active") return false;
    const end = new Date(subscription.endDate);
    return end.getTime() > Date.now();
  }, [subscription]);

  // Expiry Logic Helpers
  const getDaysLeft = (expiryDateStr: string) => {
    const exp = new Date(expiryDateStr);
    const today = new Date();
    const diff = exp.getTime() - today.getTime();
    return Math.ceil(diff / (1000 * 3600 * 24));
  };

  const getExpiryStatus = (daysLeft: number) => {
    if (daysLeft <= 7) return "critical";
    if (daysLeft <= 14) return "warning";
    if (daysLeft <= 30) return "soon";
    return "safe";
  };

  // Metrics Calculations
  const metrics = useMemo(() => {
    const todayStr = new Date().toISOString().split("T")[0];
    const todaySalesList = sales.filter(s => s.created_at.startsWith(todayStr));
    const todaySales = todaySalesList.reduce((acc, s) => acc + s.total, 0);

    // Profit calculation: (selling - buying) * qty sold
    const todayProfit = todaySalesList.reduce((acc, s) => {
      let profit = 0;
      s.items.forEach((item: any) => {
        const prod = products.find(p => p.id === item.product_id);
        if (prod) {
          profit += (item.price - prod.buying_price) * item.qty;
        } else {
          // If product deleted, assume 40% profit margin
          profit += item.price * 0.4 * item.qty;
        }
      });
      return acc + profit;
    }, 0);

    const lowStockCount = products.filter(p => p.quantity <= p.min_stock).length;
    
    const expiringSoonCount = products.filter(p => {
      const days = getDaysLeft(p.expiry_date);
      return days <= 30;
    }).length;

    const totalStockVal = products.reduce((acc, p) => acc + (p.selling_price * p.quantity), 0);

    // Weekly Profit Estimate (sum last 7 days of sales profit)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const weeklySalesList = sales.filter(s => new Date(s.created_at) >= sevenDaysAgo);
    const weeklyProfit = weeklySalesList.reduce((acc, s) => {
      let profit = 0;
      s.items.forEach((item: any) => {
        const prod = products.find(p => p.id === item.product_id);
        if (prod) {
          profit += (item.price - prod.buying_price) * item.qty;
        } else {
          profit += item.price * 0.4 * item.qty;
        }
      });
      return acc + profit;
    }, 0);

    return {
      todaySales,
      todayProfit,
      weeklyProfit,
      lowStockCount,
      expiringSoonCount,
      totalStockVal
    };
  }, [products, sales]);

  // Auth Handler
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (authUsername.trim() === "") {
      setAuthFeedback("Please enter a username.");
      return;
    }
    if (authPin !== "1234") {
      setAuthFeedback("Incorrect security PIN. (Use preseeded PIN: 1234)");
      return;
    }
    setIsLoggedIn(true);
    setAuthFeedback("");
    setSystemLogs(prev => [`[Auth] Staff ${authUsername} logged in successfully as ${authRole}.`, ...prev]);
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setAuthPin("");
    setSystemLogs(prev => [`[Auth] Staff logged out.`, ...prev]);
  };

  // Add/Edit Product Handler
  const handleSaveMed = (e: React.FormEvent) => {
    e.preventDefault();
    if (!medForm.name || !medForm.generic_name || !medForm.expiry_date) {
      alert("Please fill in medicine name, generic name, and expiry date.");
      return;
    }

    if (editingMedId) {
      // Edit mode
      const updated = products.map(p => {
        if (p.id === editingMedId) {
          return { ...p, ...medForm };
        }
        return p;
      });
      persistProducts(updated);
      setSystemLogs(prev => [`[Products] Updated medicine details: ${medForm.name} (Batch: ${medForm.batch_no})`, ...prev]);
      setEditingMedId(null);
    } else {
      // Add mode
      // Starter plan restriction
      if (subscription.planId === "starter" && products.length >= 100) {
        alert("Starter plan limits reached. (Max 100 products). Please upgrade to Pharmacy Pro!");
        return;
      }

      const newId = `MED-${Date.now().toString().slice(-6)}`;
      const newMed = {
        ...medForm,
        id: newId
      };
      persistProducts([...products, newMed]);
      setSystemLogs(prev => [`[Products] Added new medicine batch: ${medForm.name} (Qty: ${medForm.quantity})`, ...prev]);
    }

    setIsAddMedOpen(false);
    setMedForm({
      id: "",
      name: "",
      generic_name: "",
      category: "Antibiotics",
      buying_price: 1500,
      selling_price: 2500,
      barcode: "",
      expiry_date: "",
      batch_no: "",
      quantity: 100,
      min_stock: 15
    });
  };

  const handleEditMedClick = (p: any) => {
    setEditingMedId(p.id);
    setMedForm(p);
    setIsAddMedOpen(true);
  };

  const handleDeleteMed = (id: string) => {
    if (confirm("Are you sure you want to delete this medicine record?")) {
      const filtered = products.filter(p => p.id !== id);
      persistProducts(filtered);
      if (db) {
        deleteDoc(doc(db, "products", "pharm_" + id)).catch(err => {
          handleFirestoreError(err, OperationType.DELETE, `products/pharm_${id}`);
        });
      }
      setSystemLogs(prev => [`[Products] Deleted medicine ID: ${id}`, ...prev]);
    }
  };

  // Stock Quick Adjustment
  const handleStockAdjSave = (e: React.FormEvent) => {
    e.preventDefault();
    const prod = products.find(p => p.id === stockAdjMedId);
    if (!prod) return;

    let newQty = prod.quantity;
    if (stockAdjType === "in") {
      newQty += stockAdjQty;
    } else {
      newQty = Math.max(0, newQty - stockAdjQty);
    }

    const updated = products.map(p => {
      if (p.id === stockAdjMedId) {
        return { ...p, quantity: newQty };
      }
      return p;
    });

    persistProducts(updated);
    setSystemLogs(prev => [`[Inventory] Adjusted stock for ${prod.name}: ${stockAdjType === "in" ? "+" : "-"}${stockAdjQty} units (New: ${newQty})`, ...prev]);
    setIsStockAdjOpen(false);
  };

  // Sales / POS Cart Logic
  const handleAddToCart = (prod: any) => {
    if (prod.quantity <= 0) {
      alert("Out of stock!");
      return;
    }

    // Pro-plan Barcode or quick dispensing check
    const existing = cart.find(item => item.product_id === prod.id);
    if (existing) {
      if (existing.qty >= prod.quantity) {
        alert("Cannot add more than available stock!");
        return;
      }
      setCart(cart.map(item => item.product_id === prod.id ? { ...item, qty: item.qty + 1 } : item));
    } else {
      setCart([...cart, { product_id: prod.id, name: prod.name, generic_name: prod.generic_name, price: prod.selling_price, qty: 1 }]);
    }
  };

  const handleUpdateCartQty = (prodId: string, value: number) => {
    const prod = products.find(p => p.id === prodId);
    if (!prod) return;

    if (value <= 0) {
      setCart(cart.filter(item => item.product_id !== prodId));
      return;
    }

    if (value > prod.quantity) {
      alert(`Only ${prod.quantity} units available in stock!`);
      return;
    }

    setCart(cart.map(item => item.product_id === prodId ? { ...item, qty: value } : item));
  };

  const cartSubtotal = useMemo(() => {
    return cart.reduce((acc, item) => acc + (item.price * item.qty), 0);
  }, [cart]);

  const cartTotal = useMemo(() => {
    if (discountType === "ssp") {
      return Math.max(0, cartSubtotal - discountVal);
    } else {
      return Math.max(0, cartSubtotal * (1 - discountVal / 100));
    }
  }, [cartSubtotal, discountVal, discountType]);

  // Complete Sale
  const handleCheckout = async () => {
    if (cart.length === 0) {
      alert("Cart is empty!");
      return;
    }

    // Deduct quantity from products
    const updatedProds = products.map(p => {
      const cartItem = cart.find(item => item.product_id === p.id);
      if (cartItem) {
        return { ...p, quantity: Math.max(0, p.quantity - cartItem.qty) };
      }
      return p;
    });

    await persistProducts(updatedProds);

    const saleId = `SAL-${Date.now().toString().slice(-6)}`;
    const cust = customers.find(c => c.id === selectedCustId);

    const newSale = {
      id: saleId,
      items: cart,
      subtotal: cartSubtotal,
      discount_value: discountVal,
      discount_type: discountType,
      total: cartTotal,
      payment_method: paymentMethod,
      customer_id: selectedCustId || null,
      customer_name: cust ? cust.name : "Anonymous Customer",
      customer_phone: cust ? cust.phone : "",
      staff: authUsername,
      created_at: new Date().toISOString()
    };

    const localSales = JSON.parse(localStorage.getItem("pharmacy_sales") || "[]");
    await persistSales([newSale, ...localSales]);

    // Send Expiry Alert to Admin simulated if any product is critical
    const criticalMeds = cart.filter(item => {
      const p = products.find(p => p.id === item.product_id);
      return p && getDaysLeft(p.expiry_date) <= 30;
    });

    if (criticalMeds.length > 0) {
      criticalMeds.forEach(item => {
        const p = products.find(p => p.id === item.product_id);
        if (p) {
          setSystemLogs(prev => [
            `[ALERT] WhatsApp sent to administrator: "${p.name} will expire on ${p.expiry_date}. Qty Remaining: ${p.quantity}"`,
            ...prev
          ]);
        }
      });
    }

    setLastSaleReceipt(newSale);
    setCheckoutStep("receipt");
    setCart([]);
    setDiscountVal(0);
    setSelectedCustId("");
    setSystemLogs(prev => [`[Sales] Completed Sale ${saleId} (Total: SSP ${cartTotal.toLocaleString()}) via ${paymentMethod}`, ...prev]);
  };

  // PDF Receipt Generation using jsPDF (Pixel-Perfect, Clean)
  const downloadReceiptPDF = (sale: any) => {
    if (!sale) return;
    const doc = new jsPDF({
      unit: "mm",
      format: [80, 150] // receipt printer sizing
    });

    doc.setFont("Helvetica", "bold");
    doc.setFontSize(11);
    doc.text("JUNUB POS - PHARMACY", 40, 10, { align: "center" });
    
    doc.setFont("Helvetica", "normal");
    doc.setFontSize(7);
    doc.text("Juba, South Sudan", 40, 14, { align: "center" });
    doc.text(`Receipt #: ${sale.id}`, 5, 22);
    doc.text(`Date: ${new Date(sale.created_at).toLocaleString()}`, 5, 26);
    doc.text(`Dispensed By: ${sale.staff}`, 5, 30);
    doc.text(`Customer: ${sale.customer_name}`, 5, 34);

    doc.line(5, 38, 75, 38);

    doc.setFont("Helvetica", "bold");
    doc.text("Item", 5, 42);
    doc.text("Qty", 50, 42);
    doc.text("Total", 65, 42);
    doc.setFont("Helvetica", "normal");

    let y = 46;
    sale.items.forEach((item: any) => {
      doc.text(item.name.slice(0, 22), 5, y);
      doc.text(`${item.qty}`, 51, y);
      doc.text(`${(item.price * item.qty).toLocaleString()}`, 65, y);
      y += 5;
    });

    doc.line(5, y, 75, y);
    y += 4;

    doc.text("Subtotal:", 35, y);
    doc.text(`SSP ${sale.subtotal.toLocaleString()}`, 58, y);
    y += 4;

    if (sale.discount_value > 0) {
      const discStr = sale.discount_type === "ssp" ? `SSP ${sale.discount_value}` : `${sale.discount_value}%`;
      doc.text(`Discount (${discStr}):`, 35, y);
      const discountAmount = sale.discount_type === "ssp" ? sale.discount_value : (sale.subtotal * (sale.discount_value / 100));
      doc.text(`-SSP ${discountAmount.toLocaleString()}`, 58, y);
      y += 4;
    }

    doc.setFont("Helvetica", "bold");
    doc.text("TOTAL:", 35, y);
    doc.text(`SSP ${sale.total.toLocaleString()}`, 58, y);
    
    doc.setFont("Helvetica", "normal");
    doc.setFontSize(6);
    doc.text("Thank you for choosing Junub POS Center!", 40, y + 10, { align: "center" });
    doc.text("Keep medicine out of reach of children.", 40, y + 13, { align: "center" });

    doc.save(`receipt-${sale.id}.pdf`);
  };

  // WhatsApp simulation dispatcher
  const triggerWhatsAppReceiptSim = (sale: any) => {
    if (!subscription.whatsappEnabled && subscription.planId !== "pro") {
      alert("WhatsApp API receipt dispatch is only available on the Pharmacy Pro Subscription plan!");
      return;
    }
    const cleanPhone = sale.customer_phone || "+211 925 112 004";
    const msg = `Thank you for shopping at Junub Pharmacy. Total: SSP ${sale.total.toLocaleString()}. Receipt #${sale.id}`;
    
    setWhatsappSimulation({
      isOpen: true,
      phone: cleanPhone,
      message: msg,
      status: "idle"
    });
  };

  const handleSendWhatsAppSim = () => {
    setWhatsappSimulation(prev => ({ ...prev, status: "sending" }));
    setTimeout(() => {
      setWhatsappSimulation(prev => ({ ...prev, status: "sent" }));
      setSystemLogs(prev => [`[WhatsApp] Template receipt successfully dispatched via Twilio API to ${whatsappSimulation.phone}`, ...prev]);
    }, 1500);
  };

  // Customer prescription / refill alerts
  const triggerRefillWhatsApp = (cust: any) => {
    if (!subscription.whatsappEnabled && subscription.planId !== "pro") {
      alert("WhatsApp API refill reminders are only available on the Pharmacy Pro Subscription plan!");
      return;
    }
    const msg = `Hi ${cust.name}, this is a reminder from Junub Pharmacy to refill your prescription of ${cust.refillMed} scheduled for ${cust.refillDate}.`;
    setWhatsappSimulation({
      isOpen: true,
      phone: cust.phone,
      message: msg,
      status: "idle"
    });
  };

  // Add customer
  const handleAddCustomer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!custForm.name || !custForm.phone) {
      alert("Please provide both customer name and active phone.");
      return;
    }
    const newId = `CST-${Date.now().toString().slice(-4)}`;
    const newCust = {
      id: newId,
      name: custForm.name,
      phone: custForm.phone,
      refillMed: "Amoxicillin 500mg", // default prefilled
      refillDate: new Date(Date.now() + 14 * 24 * 3600 * 1000).toISOString().split("T")[0] // default 14 days later
    };

    persistCustomers([...customers, newCust]);
    setSystemLogs(prev => [`[Customers] Registered new prescription profile: ${custForm.name}`, ...prev]);
    setIsAddCustOpen(false);
    setCustForm({ name: "", phone: "" });
  };

  // Subscription upgrade
  const handleUpgradePlan = (plan: "starter" | "pro") => {
    const fee = plan === "starter" ? 25000 : 45000;
    if (confirm(`Do you wish to authorize renewal/upgrade of Junub POS ${plan === "starter" ? "Starter" : "Pro"} Plan for SSP ${fee.toLocaleString()}/mo?`)) {
      const nextEnd = new Date();
      nextEnd.setMonth(nextEnd.getMonth() + 1);
      
      const newSub = {
        planId: plan,
        status: "active",
        startDate: new Date().toISOString().split("T")[0],
        endDate: nextEnd.toISOString().split("T")[0],
        devices: plan === "starter" ? 1 : 2,
        whatsappEnabled: plan === "pro"
      };

      persistSubscription(newSub);
      setSystemLogs(prev => [`[Billing] Activated plan upgrade: ${plan.toUpperCase()} (Next billing: ${newSub.endDate})`, ...prev]);
      alert(`Plan successfully activated! Thank you for choosing Junub POS.`);
    }
  };

  // Filters logic
  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      const matchesSearch = p.name.toLowerCase().includes(prodSearch.toLowerCase()) || 
                            p.generic_name.toLowerCase().includes(prodSearch.toLowerCase()) || 
                            p.barcode.includes(prodSearch);
      
      const matchesCategory = categoryFilter === "All" || p.category === categoryFilter;
      
      let matchesExpiry = true;
      const days = getDaysLeft(p.expiry_date);
      const status = getExpiryStatus(days);
      
      if (expiryFilter === "Critical") {
        matchesExpiry = status === "critical";
      } else if (expiryFilter === "Warning") {
        matchesExpiry = status === "warning" || status === "critical";
      } else if (expiryFilter === "Expired/Soon") {
        matchesExpiry = days <= 30;
      }

      return matchesSearch && matchesCategory && matchesExpiry;
    });
  }, [products, prodSearch, categoryFilter, expiryFilter]);

  // Categories list
  const categories = ["All", "Antibiotics", "Analgesics", "Antimalarials", "Vitamins", "Cardiovascular", "Injectables"];

  // Barcode quick scan simulator
  const handleQuickBarcodeScan = (barcode: string) => {
    const p = products.find(prod => prod.barcode === barcode);
    if (p) {
      handleAddToCart(p);
      setSystemLogs(prev => [`[POS] Barcode Scanner detected: ${p.name} (Barcode: ${barcode})`, ...prev]);
    } else {
      alert(`Barcode "${barcode}" not recognized. Add it to a product to scan!`);
    }
  };

  return (
    <div className="bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden min-h-[650px] text-slate-300 flex flex-col font-sans" id="quickpharma-root">
      
      {/* Top Brand Bar */}
      <div className="bg-slate-900 border-b border-slate-800 px-6 py-4 flex flex-wrap justify-between items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="bg-orange-500 text-white p-2 rounded-xl flex items-center justify-center shadow-lg shadow-orange-500/15">
            <Smartphone className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-base font-black tracking-tight text-white flex items-center gap-2">
              JUNUB POS <span className="text-[10px] bg-orange-500 text-white font-extrabold px-1.5 py-0.5 rounded tracking-wide">PHARMACY EDITION</span>
            </h1>
            <p className="text-[10px] text-slate-400">South Sudan's Premier Offline-First Pharmacy System</p>
          </div>
        </div>

        {/* License & Offline Indicator */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 bg-emerald-500/10 text-emerald-400 text-[10px] font-bold px-2.5 py-1 rounded-full border border-emerald-500/20">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>Cloud Sync: Connected</span>
          </div>
          
          {isLoggedIn && (
            <button 
              onClick={handleLogout}
              className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-[10px] font-bold px-3 py-1 rounded-lg transition"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Log Out</span>
            </button>
          )}
        </div>
      </div>

      {!isLoggedIn ? (
        /* LOGIN / SIGNUP VIEW */
        <div className="flex-1 flex items-center justify-center p-8 max-w-md mx-auto w-full">
          <div className="bg-slate-900/50 border border-slate-800 p-6 rounded-2xl w-full space-y-6">
            <div className="text-center space-y-2">
              <span className="text-[10px] text-orange-400 font-bold tracking-widest uppercase">Junub POS Security Portal</span>
              <h2 className="text-xl font-bold text-white">Staff Login</h2>
              <p className="text-xs text-slate-400">Enter your pharmacist credentials to access the POS terminal</p>
            </div>

            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-[11px] text-slate-400 font-semibold uppercase mb-1.5">Select Role</label>
                <div className="grid grid-cols-3 gap-2">
                  {(["pharmacist", "admin", "store_manager"] as const).map((role) => (
                    <button
                      key={role}
                      type="button"
                      onClick={() => {
                        setAuthRole(role);
                        setAuthUsername(role === "admin" ? "admin_regan" : role === "store_manager" ? "manager_mary" : "pharmacist_john");
                      }}
                      className={`py-2 text-[10px] font-bold rounded-lg border transition capitalize ${
                        authRole === role 
                          ? "bg-orange-500 text-white border-orange-500 shadow-lg shadow-orange-500/10" 
                          : "bg-slate-950 text-slate-400 border-slate-800 hover:border-slate-700"
                      }`}
                    >
                      {role.replace("_", " ")}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-[11px] text-slate-400 font-semibold uppercase mb-1.5">Staff Username</label>
                <input
                  type="text"
                  value={authUsername}
                  onChange={(e) => setAuthUsername(e.target.value)}
                  placeholder="e.g. pharmacist_john"
                  className="w-full bg-slate-950 border border-slate-800 p-2.5 rounded-lg text-white font-mono text-xs focus:border-orange-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] text-slate-400 font-semibold uppercase mb-1.5">Security PIN</label>
                <input
                  type="password"
                  value={authPin}
                  onChange={(e) => setAuthPin(e.target.value)}
                  placeholder="Preseeded PIN: 1234"
                  className="w-full bg-slate-950 border border-slate-800 p-2.5 rounded-lg text-white font-mono text-xs focus:border-orange-500 outline-none tracking-widest text-center"
                />
              </div>

              {authFeedback && (
                <div className="bg-rose-500/10 text-rose-400 border border-rose-500/20 rounded-lg p-2.5 text-xs font-semibold text-center">
                  {authFeedback}
                </div>
              )}

              <button
                type="submit"
                className="w-full py-3 bg-gradient-to-r from-blue-600 to-orange-500 hover:opacity-90 text-white font-bold text-xs rounded-lg transition shadow-lg shadow-blue-600/10 flex items-center justify-center gap-1.5"
              >
                <span>Authorize & Unlock Terminal</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>

            <div className="border-t border-slate-800 pt-4 text-center">
              <p className="text-[10px] text-slate-500">
                Authorized for licensee: <strong className="text-slate-300">{domain}</strong>
              </p>
            </div>
          </div>
        </div>
      ) : !isSubscriptionActive ? (
        /* EXPIRY BARRIER VIEW */
        <div className="flex-1 flex items-center justify-center p-8 max-w-md mx-auto w-full">
          <div className="bg-slate-900/50 border border-slate-800 p-6 rounded-2xl w-full text-center space-y-6">
            <div className="bg-rose-500/10 text-rose-400 p-4 rounded-full w-14 h-14 mx-auto flex items-center justify-center border border-rose-500/20">
              <ShieldAlert className="w-8 h-8" />
            </div>
            <div className="space-y-2">
              <h2 className="text-lg font-bold text-white">Subscription Blocked</h2>
              <p className="text-xs text-slate-400">
                Your subscription plan has expired. To preserve access to drug databases and POS dispensing, please renew immediately.
              </p>
            </div>

            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
              <div className="flex justify-between text-xs">
                <span className="text-slate-400">Expired On:</span>
                <span className="text-rose-400 font-mono font-bold">{subscription.endDate}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-slate-400">Current Plan:</span>
                <span className="text-slate-200 capitalize font-bold">{subscription.planId}</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => handleUpgradePlan("starter")}
                className="py-2.5 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs rounded-lg transition"
              >
                Renew Starter (25k/mo)
              </button>
              <button
                onClick={() => handleUpgradePlan("pro")}
                className="py-2.5 bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs rounded-lg transition"
              >
                Upgrade Pro (45k/mo)
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* MAIN APPLICATION WORKSPACE */
        <div className="flex-1 flex flex-col md:flex-row h-full">
          
          {/* Side Sub-Nav */}
          <div className="w-full md:w-56 bg-slate-900 border-r border-slate-800 flex flex-col">
            <div className="p-4 border-b border-slate-800 text-xs flex items-center gap-2 bg-slate-950">
              <div className="w-2.5 h-2.5 rounded-full bg-orange-500 shadow-lg shadow-orange-500/50"></div>
              <div>
                <p className="font-mono text-slate-300 font-bold text-[11px] truncate">{authUsername}</p>
                <p className="text-[9px] text-slate-500 uppercase tracking-wider">{authRole.replace("_", " ")}</p>
              </div>
            </div>

            {/* Nav Menu */}
            <nav className="p-2 space-y-1 flex-1">
              {[
                { id: "dashboard", label: "Dashboard", icon: TrendingUp },
                { id: "products", label: "Medicine DB", icon: Package },
                { id: "sales", label: "POS Terminal", icon: ShoppingCart },
                { id: "customers", label: "Patients & Refills", icon: Users },
                { id: "reports", label: "Audit & Profit", icon: FileText },
                { id: "settings", label: "Subscription", icon: Settings }
              ].map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-semibold transition ${
                      activeTab === tab.id 
                        ? "bg-orange-500 text-white shadow-lg shadow-orange-500/15 font-bold" 
                        : "text-slate-400 hover:bg-slate-800/50 hover:text-white"
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </nav>

            {/* Quick preseeded help */}
            <div className="p-4 bg-slate-950 border-t border-slate-800 text-[10px] text-slate-500 space-y-1">
              <p className="font-bold text-slate-400 uppercase tracking-wider">Demo Quick scan</p>
              <p>Type in POS search to scan:</p>
              <div className="grid grid-cols-2 gap-1 font-mono text-[9px]">
                <button onClick={() => setProdSearch("61511012")} className="bg-slate-900 hover:bg-slate-800 p-1 rounded border border-slate-800 text-slate-400">61511012 (Coartem)</button>
                <button onClick={() => setProdSearch("61511024")} className="bg-slate-900 hover:bg-slate-800 p-1 rounded border border-slate-800 text-slate-400">61511024 (Amoxicillin)</button>
              </div>
            </div>
          </div>

          {/* Main Subspace Container */}
          <div className="flex-1 p-6 overflow-y-auto space-y-6 max-w-7xl">
            
            {/* TAB: DASHBOARD */}
            {activeTab === "dashboard" && (
              <div className="space-y-6">
                <div className="flex flex-wrap justify-between items-center gap-4">
                  <div>
                    <h2 className="text-xl font-bold text-white tracking-tight">Pharmacy Audit & Operations Overview</h2>
                    <p className="text-xs text-slate-400">Real-time prescription flow, expiry analytics, and SSP revenue metrics.</p>
                  </div>
                  <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 text-[11px] font-mono">
                    <span className="text-slate-500">Plan:</span> <span className="text-orange-400 font-extrabold capitalize">{subscription.planId}</span>
                    <span className="mx-2 text-slate-700">|</span>
                    <span className="text-slate-500">Expires:</span> <span className="text-slate-300 font-bold">{subscription.endDate}</span>
                  </div>
                </div>

                {/* Metric Bento Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {/* Today Sales */}
                  <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl space-y-2">
                    <div className="flex justify-between items-center text-slate-500">
                      <span className="text-[10px] uppercase font-bold tracking-wider">Today Dispensed Sales</span>
                      <DollarSign className="w-4 h-4 text-orange-400" />
                    </div>
                    <div>
                      <p className="text-xl font-black text-white">SSP {metrics.todaySales.toLocaleString()}</p>
                      <p className="text-[10px] text-emerald-400 font-semibold flex items-center gap-0.5 mt-1">
                        <span>↑ 12% vs yesterday</span>
                      </p>
                    </div>
                  </div>

                  {/* Today Net Profit */}
                  <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl space-y-2">
                    <div className="flex justify-between items-center text-slate-500">
                      <span className="text-[10px] uppercase font-bold tracking-wider">Today Net Profit</span>
                      <TrendingUp className="w-4 h-4 text-blue-400" />
                    </div>
                    <div>
                      <p className="text-xl font-black text-white">SSP {metrics.todayProfit.toLocaleString()}</p>
                      <p className="text-[10px] text-blue-400 font-semibold mt-1">Daily margin: {metrics.todaySales > 0 ? `${Math.round((metrics.todayProfit/metrics.todaySales)*100)}%` : "0%"}</p>
                    </div>
                  </div>

                  {/* Low Stock count */}
                  <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl space-y-2">
                    <div className="flex justify-between items-center text-slate-500">
                      <span className="text-[10px] uppercase font-bold tracking-wider">Low Stock Warnings</span>
                      <Package className="w-4 h-4 text-yellow-400" />
                    </div>
                    <div>
                      <p className="text-xl font-black text-white">{metrics.lowStockCount}</p>
                      <p className="text-[10px] text-yellow-400 font-semibold mt-1">Requires stock injection</p>
                    </div>
                  </div>

                  {/* Expiring Soon Count */}
                  <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl space-y-2">
                    <div className="flex justify-between items-center text-slate-500">
                      <span className="text-[10px] uppercase font-bold tracking-wider">Drug Expiry Alert (&lt;30d)</span>
                      <AlertTriangle className="w-4 h-4 text-rose-400" />
                    </div>
                    <div>
                      <p className="text-xl font-black text-white">{metrics.expiringSoonCount}</p>
                      <p className="text-[10px] text-rose-400 font-semibold mt-1 animate-pulse">Critical audit threshold</p>
                    </div>
                  </div>
                </div>

                {/* Stock Audit & Expiry Alerts Row */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Critical Drug Expiries */}
                  <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
                    <div className="flex justify-between items-center">
                      <h3 className="font-bold text-white text-xs uppercase tracking-wider flex items-center gap-1.5">
                        <AlertTriangle className="w-4 h-4 text-rose-500" />
                        <span>MOH Drug Expiry Auditing Log</span>
                      </h3>
                      <span className="text-[9px] font-bold bg-rose-500/10 text-rose-400 px-2 py-0.5 rounded-full uppercase border border-rose-500/20">30-Day Critical Window</span>
                    </div>

                    <div className="space-y-3">
                      {products.filter(p => getDaysLeft(p.expiry_date) <= 30).length === 0 ? (
                        <div className="text-center py-6 text-slate-500 text-xs">
                          No products expiring within the next 30 days! Safe operations.
                        </div>
                      ) : (
                        products.filter(p => getDaysLeft(p.expiry_date) <= 30).map((p) => {
                          const days = getDaysLeft(p.expiry_date);
                          const status = getExpiryStatus(days);
                          return (
                            <div key={p.id} className="bg-slate-950 p-3 rounded-lg border border-slate-850 flex justify-between items-center text-xs">
                              <div className="space-y-1">
                                <p className="font-bold text-white">{p.name}</p>
                                <p className="text-[10px] text-slate-400">{p.generic_name} • Batch: <span className="text-orange-400 font-mono">{p.batch_no}</span></p>
                              </div>
                              <div className="text-right space-y-1">
                                <span className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded font-mono ${
                                  status === "critical" 
                                    ? "bg-rose-500/20 text-rose-400 border border-rose-500/30 animate-pulse" 
                                    : "bg-orange-500/10 text-orange-400 border border-orange-500/20"
                                }`}>
                                  {days <= 0 ? "Expired" : `${days} Days Left`}
                                </span>
                                <p className="text-[9px] text-slate-500 font-mono">Exp: {p.expiry_date}</p>
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>

                  {/* Low Stock Alerts */}
                  <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
                    <div className="flex justify-between items-center">
                      <h3 className="font-bold text-white text-xs uppercase tracking-wider flex items-center gap-1.5">
                        <Package className="w-4 h-4 text-yellow-500" />
                        <span>Low Stock Alert Center</span>
                      </h3>
                      <span className="text-[9px] font-bold bg-yellow-500/10 text-yellow-400 px-2 py-0.5 rounded-full uppercase border border-yellow-500/20">Refill Required</span>
                    </div>

                    <div className="space-y-3">
                      {products.filter(p => p.quantity <= p.min_stock).length === 0 ? (
                        <div className="text-center py-6 text-slate-500 text-xs">
                          All medicine stock levels are healthy!
                        </div>
                      ) : (
                        products.filter(p => p.quantity <= p.min_stock).map((p) => (
                          <div key={p.id} className="bg-slate-950 p-3 rounded-lg border border-slate-850 flex justify-between items-center text-xs">
                            <div className="space-y-1">
                              <p className="font-bold text-white">{p.name}</p>
                              <p className="text-[10px] text-slate-400">Current Qty: <strong className="text-yellow-500 font-mono">{p.quantity} units</strong> • Min Trigger: {p.min_stock}</p>
                            </div>
                            <div>
                              <button
                                onClick={() => {
                                  setStockAdjMedId(p.id);
                                  setStockAdjType("in");
                                  setStockAdjQty(50);
                                  setIsStockAdjOpen(true);
                                }}
                                className="bg-orange-500/10 hover:bg-orange-500 hover:text-white text-orange-400 border border-orange-500/20 text-[10px] font-bold px-3 py-1.5 rounded transition"
                              >
                                Stock In (+50)
                              </button>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>

                {/* System Activity Logs */}
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-3">
                  <h3 className="font-bold text-white text-xs uppercase tracking-wider">Live System & Twilio SMS Logs</h3>
                  <div className="bg-slate-950 p-4 rounded-lg font-mono text-[10px] text-slate-400 h-32 overflow-y-auto space-y-1.5 border border-slate-850">
                    {systemLogs.length === 0 ? (
                      <p className="text-slate-600 text-center py-8">Waiting for dispensary operations...</p>
                    ) : (
                      systemLogs.map((log, idx) => (
                        <div key={idx} className="flex gap-2">
                          <span className="text-slate-600">[{new Date().toLocaleTimeString()}]</span>
                          <span className={log.includes("[ALERT]") ? "text-rose-400 font-bold" : log.includes("[WhatsApp]") ? "text-emerald-400 font-bold" : "text-slate-300"}>{log}</span>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* TAB: PRODUCTS DATABASE */}
            {activeTab === "products" && (
              <div className="space-y-6">
                <div className="flex flex-wrap justify-between items-center gap-4">
                  <div>
                    <h2 className="text-xl font-bold text-white tracking-tight">Medicine Inventory Registry</h2>
                    <p className="text-xs text-slate-400">Add batches, register generics, and manage pricing/expiry dates.</p>
                  </div>
                  <button
                    onClick={() => {
                      setEditingMedId(null);
                      setIsAddMedOpen(true);
                    }}
                    className="flex items-center gap-1.5 bg-gradient-to-r from-blue-600 to-orange-500 hover:opacity-95 text-white font-bold text-xs px-4 py-2.5 rounded-lg transition"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add New Medicine Batch</span>
                  </button>
                </div>

                {/* Filter and Search Bar */}
                <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl flex flex-wrap gap-4 items-center">
                  <div className="flex-1 min-w-[200px] relative">
                    <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                    <input
                      type="text"
                      value={prodSearch}
                      onChange={(e) => setProdSearch(e.target.value)}
                      placeholder="Search by name, generic, or barcode (e.g. 61511012)..."
                      className="w-full bg-slate-950 border border-slate-800 pl-9 pr-4 py-2 rounded-lg text-xs text-white focus:border-orange-500 outline-none"
                    />
                  </div>

                  <div>
                    <select
                      value={categoryFilter}
                      onChange={(e) => setCategoryFilter(e.target.value)}
                      className="bg-slate-950 border border-slate-800 p-2 rounded-lg text-xs text-white focus:border-orange-500 outline-none"
                    >
                      <option value="All">All Categories</option>
                      <option value="Antibiotics">Antibiotics</option>
                      <option value="Analgesics">Analgesics</option>
                      <option value="Antimalarials">Antimalarials</option>
                      <option value="Vitamins">Vitamins</option>
                      <option value="Cardiovascular">Cardiovascular</option>
                      <option value="Injectables">Injectables</option>
                    </select>
                  </div>

                  <div>
                    <select
                      value={expiryFilter}
                      onChange={(e) => setExpiryFilter(e.target.value)}
                      className="bg-slate-950 border border-slate-800 p-2 rounded-lg text-xs text-white focus:border-orange-500 outline-none"
                    >
                      <option value="All">All Expiry States</option>
                      <option value="Critical">Critical (&lt;7 days)</option>
                      <option value="Warning">Warning (&lt;14 days)</option>
                      <option value="Expired/Soon">Soon (&lt;30 days)</option>
                    </select>
                  </div>
                </div>

                {/* Products Grid / Table */}
                <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-slate-950 border-b border-slate-850 text-slate-400 font-bold uppercase text-[9px] tracking-wider">
                        <th className="p-4">Medicine Info</th>
                        <th className="p-4">Batch / Barcode</th>
                        <th className="p-4">Expiry Date</th>
                        <th className="p-4 text-right">Cost Prices</th>
                        <th className="p-4 text-right font-bold">Qty Available</th>
                        <th className="p-4 text-center">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-850">
                      {filteredProducts.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="text-center p-8 text-slate-500">No matching medicines found in registry.</td>
                        </tr>
                      ) : (
                        filteredProducts.map((p) => {
                          const daysLeft = getDaysLeft(p.expiry_date);
                          const expStatus = getExpiryStatus(daysLeft);
                          const isLowStock = p.quantity <= p.min_stock;

                          return (
                            <tr key={p.id} className="hover:bg-slate-850/30 transition">
                              <td className="p-4 space-y-1">
                                <p className="font-bold text-white text-sm">{p.name}</p>
                                <p className="text-[10px] text-slate-400 font-mono italic">{p.generic_name}</p>
                                <span className="text-[8px] font-extrabold uppercase bg-blue-500/10 text-blue-400 border border-blue-500/20 px-2 py-0.5 rounded-full">{p.category}</span>
                              </td>
                              <td className="p-4 font-mono text-[11px] space-y-1">
                                <p>Batch: <strong className="text-slate-300">{p.batch_no}</strong></p>
                                <p className="text-slate-500 flex items-center gap-1"><Barcode className="w-3.5 h-3.5" /> {p.barcode || "N/A"}</p>
                              </td>
                              <td className="p-4 space-y-1">
                                <p className="font-mono text-slate-300">{p.expiry_date}</p>
                                <span className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded inline-block ${
                                  expStatus === "critical" 
                                    ? "bg-rose-500/20 text-rose-400 border border-rose-500/30 animate-pulse" 
                                    : expStatus === "warning" 
                                    ? "bg-orange-500/10 text-orange-400 border border-orange-500/20"
                                    : "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                                }`}>
                                  {daysLeft <= 0 ? "EXPIRED" : `${daysLeft} Days Left`}
                                </span>
                              </td>
                              <td className="p-4 text-right font-mono space-y-1 text-[11px]">
                                <p className="text-slate-500">Buy: SSP {p.buying_price.toLocaleString()}</p>
                                <p className="text-white font-bold">Sell: SSP {p.selling_price.toLocaleString()}</p>
                              </td>
                              <td className="p-4 text-right">
                                <div className="space-y-1 inline-block text-right">
                                  <p className={`font-mono font-bold text-base ${isLowStock ? "text-yellow-400" : "text-white"}`}>
                                    {p.quantity} units
                                  </p>
                                  {isLowStock && (
                                    <span className="text-[8px] bg-yellow-500/10 text-yellow-400 border border-yellow-500/20 px-1.5 py-0.5 rounded uppercase font-bold">Low stock warning</span>
                                  )}
                                </div>
                              </td>
                              <td className="p-4">
                                <div className="flex items-center justify-center gap-2">
                                  <button
                                    onClick={() => handleEditMedClick(p)}
                                    className="p-1.5 bg-slate-950 hover:bg-slate-800 text-slate-400 hover:text-white rounded border border-slate-800 transition"
                                    title="Edit Medicine"
                                  >
                                    <Edit className="w-3.5 h-3.5" />
                                  </button>
                                  <button
                                    onClick={() => {
                                      setStockAdjMedId(p.id);
                                      setIsStockAdjOpen(true);
                                    }}
                                    className="p-1.5 bg-slate-950 hover:bg-orange-500 hover:text-white text-orange-400 rounded border border-slate-800 transition"
                                    title="Stock In / Stock Out"
                                  >
                                    <RefreshCw className="w-3.5 h-3.5" />
                                  </button>
                                  <button
                                    onClick={() => handleDeleteMed(p.id)}
                                    className="p-1.5 bg-slate-950 hover:bg-rose-950 text-slate-500 hover:text-rose-400 rounded border border-slate-800 transition"
                                    title="Delete Medicine"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* TAB: SALES / POS TERMINAL */}
            {activeTab === "sales" && (
              <div className="space-y-6">
                <div className="flex flex-wrap justify-between items-center gap-4">
                  <div>
                    <h2 className="text-xl font-bold text-white tracking-tight">Dispensation POS Terminal</h2>
                    <p className="text-xs text-slate-400">Conduct fast, offline-first cashier sales with instant PDF & WhatsApp delivery.</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                  
                  {/* Left Column: Fast product lookup */}
                  <div className="lg:col-span-7 space-y-4">
                    <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl flex gap-3 items-center">
                      <div className="flex-1 relative">
                        <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                        <input
                          type="text"
                          value={prodSearch}
                          onChange={(e) => setProdSearch(e.target.value)}
                          placeholder="Dispense: search or scan barcode (e.g. 61511012)..."
                          className="w-full bg-slate-950 border border-slate-800 pl-9 pr-4 py-2.5 rounded-lg text-xs text-white focus:border-orange-500 outline-none"
                        />
                      </div>
                      
                      {/* Scan trigger simulator for non-scanner devices */}
                      <button
                        onClick={() => handleQuickBarcodeScan(prodSearch)}
                        className="bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-300 font-bold text-xs px-3 py-2.5 rounded-lg transition flex items-center gap-1.5"
                      >
                        <Barcode className="w-4 h-4 text-orange-400" />
                        <span>Mock Scan</span>
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[480px] overflow-y-auto pr-2">
                      {products.filter(p => {
                        const matchesSearch = p.name.toLowerCase().includes(prodSearch.toLowerCase()) || 
                                              p.generic_name.toLowerCase().includes(prodSearch.toLowerCase()) || 
                                              p.barcode.includes(prodSearch);
                        return matchesSearch;
                      }).length === 0 ? (
                        <div className="col-span-2 text-center py-12 text-slate-500 text-xs">
                          No matching medicines found in registry.
                        </div>
                      ) : (
                        products.filter(p => {
                          const matchesSearch = p.name.toLowerCase().includes(prodSearch.toLowerCase()) || 
                                                p.generic_name.toLowerCase().includes(prodSearch.toLowerCase()) || 
                                                p.barcode.includes(prodSearch);
                          return matchesSearch;
                        }).map((p) => {
                          const isOutOfStock = p.quantity <= 0;
                          const isLowStock = p.quantity <= p.min_stock;
                          return (
                            <button
                              key={p.id}
                              onClick={() => handleAddToCart(p)}
                              disabled={isOutOfStock}
                              className={`bg-slate-900 border text-left p-4 rounded-xl flex flex-col justify-between h-28 hover:border-orange-500/50 transition cursor-pointer group ${
                                isOutOfStock ? "opacity-40 border-slate-800 cursor-not-allowed" : "border-slate-800"
                              }`}
                            >
                              <div className="w-full">
                                <div className="flex justify-between items-start gap-1">
                                  <span className="font-bold text-white text-xs group-hover:text-orange-400 transition truncate">{p.name}</span>
                                  <span className="text-[8px] bg-slate-950 text-slate-400 px-1.5 rounded font-mono shrink-0">{p.id}</span>
                                </div>
                                <p className="text-[10px] text-slate-400 truncate italic">{p.generic_name}</p>
                              </div>
                              <div className="w-full flex justify-between items-end mt-2">
                                <span className="font-mono font-black text-sm text-white">SSP {p.selling_price.toLocaleString()}</span>
                                <span className={`text-[9px] font-bold ${isLowStock ? "text-yellow-400" : "text-emerald-400"}`}>
                                  {p.quantity} left
                                </span>
                              </div>
                            </button>
                          );
                        })
                      )}
                    </div>
                  </div>

                  {/* Right Column: Active Cart & Billing Panel */}
                  <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
                    {checkoutStep === "cart" ? (
                      <>
                        <div className="flex justify-between items-center border-b border-slate-800 pb-3">
                          <h3 className="font-bold text-white text-xs uppercase tracking-wider flex items-center gap-1.5">
                            <ShoppingCart className="w-4 h-4 text-orange-500" />
                            <span>Active Dispensation Cart</span>
                          </h3>
                          <span className="text-[10px] font-mono bg-slate-950 text-slate-400 px-2 py-0.5 rounded-full">
                            {cart.length} item(s)
                          </span>
                        </div>

                        {/* Cart items */}
                        <div className="space-y-3 max-h-[220px] overflow-y-auto pr-1">
                          {cart.length === 0 ? (
                            <div className="text-center py-12 text-slate-500 text-xs flex flex-col items-center justify-center gap-2">
                              <ShoppingCart className="w-8 h-8 text-slate-700" />
                              <span>Dispensation cart is empty. Click on medicines to add!</span>
                            </div>
                          ) : (
                            cart.map((item) => (
                              <div key={item.product_id} className="bg-slate-950 p-2.5 rounded-lg border border-slate-850 flex justify-between items-center text-xs">
                                <div className="space-y-0.5 flex-1 min-w-0 pr-2">
                                  <p className="font-bold text-white truncate">{item.name}</p>
                                  <p className="text-[9px] text-slate-500 truncate">{item.generic_name}</p>
                                  <p className="text-[10px] text-slate-400 font-mono">SSP {item.price.toLocaleString()} each</p>
                                </div>
                                <div className="flex items-center gap-2 shrink-0">
                                  <input
                                    type="number"
                                    value={item.qty}
                                    onChange={(e) => handleUpdateCartQty(item.product_id, parseInt(e.target.value) || 0)}
                                    className="w-12 bg-slate-900 border border-slate-800 text-center font-mono text-xs rounded text-white py-1 outline-none focus:border-orange-500"
                                  />
                                  <button
                                    onClick={() => handleUpdateCartQty(item.product_id, 0)}
                                    className="p-1 bg-rose-500/10 hover:bg-rose-500 hover:text-white text-rose-400 rounded transition"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </div>
                            ))
                          )}
                        </div>

                        {/* Customer & Billing Adjustments */}
                        {cart.length > 0 && (
                          <div className="space-y-3 pt-3 border-t border-slate-800 text-xs">
                            
                            {/* Customer Profile Picker */}
                            <div className="space-y-1">
                              <div className="flex justify-between items-center">
                                <label className="block text-[10px] text-slate-400 uppercase font-bold">Select Patient Account</label>
                                <button
                                  type="button"
                                  onClick={() => setIsAddCustOpen(true)}
                                  className="text-[9px] text-orange-400 hover:underline font-bold"
                                >
                                  + Quick Register
                                </button>
                              </div>
                              <select
                                value={selectedCustId}
                                onChange={(e) => setSelectedCustId(e.target.value)}
                                className="w-full bg-slate-950 border border-slate-800 p-2 rounded-lg text-white outline-none focus:border-orange-500"
                              >
                                <option value="">Anonymous Walk-in Patient</option>
                                {customers.map((c) => (
                                  <option key={c.id} value={c.id}>{c.name} ({c.phone})</option>
                                ))}
                              </select>
                            </div>

                            {/* Discounts input */}
                            <div className="grid grid-cols-2 gap-2">
                              <div>
                                <label className="block text-[10px] text-slate-400 uppercase font-bold mb-1">Discount Type</label>
                                <select
                                  value={discountType}
                                  onChange={(e) => {
                                    setDiscountType(e.target.value as any);
                                    setDiscountVal(0);
                                  }}
                                  className="w-full bg-slate-950 border border-slate-800 p-2 rounded-lg text-white outline-none focus:border-orange-500"
                                >
                                  <option value="ssp">Flat SSP Discount</option>
                                  <option value="percent">Percentage %</option>
                                </select>
                              </div>
                              <div>
                                <label className="block text-[10px] text-slate-400 uppercase font-bold mb-1">Value</label>
                                <div className="relative">
                                  <input
                                    type="number"
                                    value={discountVal}
                                    onChange={(e) => setDiscountVal(Math.max(0, parseFloat(e.target.value) || 0))}
                                    className="w-full bg-slate-950 border border-slate-800 p-2 rounded-lg text-white font-mono outline-none focus:border-orange-500"
                                  />
                                  <span className="absolute right-2.5 top-2 text-[10px] text-slate-500 font-bold">
                                    {discountType === "ssp" ? "SSP" : "%"}
                                  </span>
                                </div>
                              </div>
                            </div>

                            {/* Multi Payment Picker */}
                            <div>
                              <label className="block text-[10px] text-slate-400 uppercase font-bold mb-1.5">Authorized Payment Channels</label>
                              <div className="grid grid-cols-4 gap-1.5">
                                {["Cash", "MTN MoMo", "Airtel Money", "m-GURUSH"].map((method) => (
                                  <button
                                    key={method}
                                    type="button"
                                    onClick={() => setPaymentMethod(method as any)}
                                    className={`py-1.5 text-[9px] font-bold rounded border transition uppercase truncate ${
                                      paymentMethod === method 
                                        ? "bg-orange-500 text-white border-orange-500 shadow-md shadow-orange-500/10" 
                                        : "bg-slate-950 text-slate-400 border-slate-800 hover:border-slate-700"
                                    }`}
                                  >
                                    {method}
                                  </button>
                                ))}
                              </div>
                            </div>

                            {/* MoMo number prompt for mobile money */}
                            {paymentMethod !== "Cash" && (
                              <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-850 space-y-1.5 animate-fadeIn">
                                <label className="block text-[9px] text-orange-400 font-extrabold uppercase">Authorize Mobile Wallet Pull</label>
                                <input
                                  type="text"
                                  placeholder="e.g. +211 925 112 004"
                                  value={momoPhone}
                                  onChange={(e) => setMomoPhone(e.target.value)}
                                  className="w-full bg-slate-900 border border-slate-800 p-1.5 rounded text-[11px] font-mono text-white outline-none focus:border-orange-500"
                                />
                              </div>
                            )}

                            {/* Summary Cost Matrix */}
                            <div className="bg-slate-950 p-3 rounded-lg border border-slate-850 font-mono space-y-1.5 text-[11px]">
                              <div className="flex justify-between text-slate-400">
                                <span>Subtotal:</span>
                                <span>SSP {cartSubtotal.toLocaleString()}</span>
                              </div>
                              {discountVal > 0 && (
                                <div className="flex justify-between text-rose-400">
                                  <span>Discount:</span>
                                  <span>-{discountType === "ssp" ? `SSP ${discountVal}` : `${discountVal}%`}</span>
                                </div>
                              )}
                              <div className="border-t border-slate-850 pt-1.5 flex justify-between text-white font-extrabold text-sm">
                                <span>TOTAL SSP:</span>
                                <span className="text-orange-400">SSP {cartTotal.toLocaleString()}</span>
                              </div>
                            </div>

                            {/* Complete trigger button */}
                            <button
                              onClick={handleCheckout}
                              className="w-full py-3 bg-gradient-to-r from-blue-600 to-orange-500 hover:opacity-95 text-white font-bold text-xs rounded-lg transition shadow-lg shadow-blue-500/10 flex items-center justify-center gap-1.5"
                            >
                              <CheckCircle2 className="w-4 h-4" />
                              <span>Authorize Dispense & Complete Sale</span>
                            </button>

                          </div>
                        )}
                      </>
                    ) : (
                      /* RECEIPT DISPATCH MODE */
                      <div className="space-y-5 py-2 text-center animate-fadeIn">
                        <div className="bg-emerald-500/10 text-emerald-400 p-3 rounded-full w-12 h-12 mx-auto flex items-center justify-center border border-emerald-500/20">
                          <Check className="w-6 h-6" />
                        </div>
                        <div className="space-y-1">
                          <h3 className="font-bold text-white text-sm">Sale Completed Successfully!</h3>
                          <p className="text-xs text-slate-400">Dispense Authorization ID: <strong className="text-orange-400 font-mono">{lastSaleReceipt?.id}</strong></p>
                        </div>

                        {/* Interactive Receipts and WhatsApp buttons */}
                        <div className="bg-slate-950 border border-slate-850 rounded-xl p-4 space-y-3 font-mono text-xs text-left max-w-sm mx-auto">
                          <div className="flex justify-between text-slate-400 text-[10px]">
                            <span>TOTAL PAID:</span>
                            <span className="text-white font-bold">SSP {lastSaleReceipt?.total.toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between text-slate-400 text-[10px]">
                            <span>CHANNEL:</span>
                            <span className="text-orange-400 uppercase font-bold">{lastSaleReceipt?.payment_method}</span>
                          </div>
                          <div className="flex justify-between text-slate-400 text-[10px]">
                            <span>PATIENT:</span>
                            <span className="text-slate-300 truncate max-w-[150px]">{lastSaleReceipt?.customer_name}</span>
                          </div>
                        </div>

                        <div className="space-y-2 max-w-sm mx-auto">
                          <button
                            onClick={() => downloadReceiptPDF(lastSaleReceipt)}
                            className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-lg transition flex items-center justify-center gap-1.5"
                          >
                            <FileText className="w-4 h-4" />
                            <span>Download PDF Medical Receipt</span>
                          </button>

                          <button
                            onClick={() => triggerWhatsAppReceiptSim(lastSaleReceipt)}
                            className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-lg transition flex items-center justify-center gap-1.5"
                          >
                            <Smartphone className="w-4 h-4" />
                            <span>Dispatch WhatsApp Receipt via Twilio</span>
                          </button>

                          <button
                            onClick={() => setCheckoutStep("cart")}
                            className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs rounded-lg transition"
                          >
                            New Dispensation
                          </button>
                        </div>
                      </div>
                    )}

                  </div>
                </div>
              </div>
            )}

            {/* TAB: CUSTOMERS & PRESCRIPTION REFILLS */}
            {activeTab === "customers" && (
              <div className="space-y-6">
                <div className="flex flex-wrap justify-between items-center gap-4">
                  <div>
                    <h2 className="text-xl font-bold text-white tracking-tight">Patient Prescription & Refill Records</h2>
                    <p className="text-xs text-slate-400">Save active patient contacts and dispatch WhatsApp prescription refills.</p>
                  </div>
                  <button
                    onClick={() => setIsAddCustOpen(true)}
                    className="flex items-center gap-1.5 bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs px-4 py-2.5 rounded-lg transition"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Register New Patient Profile</span>
                  </button>
                </div>

                {/* Customers list */}
                <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-slate-950 border-b border-slate-850 text-slate-400 font-bold uppercase text-[9px] tracking-wider">
                        <th className="p-4">Patient Profile</th>
                        <th className="p-4">WhatsApp Contact</th>
                        <th className="p-4">Assigned Refill Medication</th>
                        <th className="p-4 font-bold">Scheduled Refill Date</th>
                        <th className="p-4 text-center">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-850">
                      {customers.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="text-center p-8 text-slate-500">No patient profiles registered.</td>
                        </tr>
                      ) : (
                        customers.map((c) => (
                          <tr key={c.id} className="hover:bg-slate-850/30 transition">
                            <td className="p-4 space-y-1">
                              <p className="font-bold text-white text-sm">{c.name}</p>
                              <span className="text-[9px] font-mono text-slate-500">Patient ID: {c.id}</span>
                            </td>
                            <td className="p-4 font-mono text-slate-300">
                              {c.phone}
                            </td>
                            <td className="p-4 text-orange-400 font-semibold font-mono">
                              {c.refillMed}
                            </td>
                            <td className="p-4 font-mono text-slate-400">
                              {c.refillDate || "N/A"}
                            </td>
                            <td className="p-4">
                              <div className="flex items-center justify-center gap-2">
                                <button
                                  onClick={() => triggerRefillWhatsApp(c)}
                                  className="flex items-center gap-1 px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[10px] rounded transition"
                                  title="Dispatch scheduled WhatsApp refill notification"
                                >
                                  <Smartphone className="w-3.5 h-3.5" />
                                  <span>Send Refill Alert</span>
                                </button>
                                <button
                                  onClick={() => {
                                    if (confirm("Are you sure you want to delete this patient profile?")) {
                                      const updated = customers.filter(cust => cust.id !== c.id);
                                      persistCustomers(updated);
                                      if (db) {
                                        deleteDoc(doc(db, "clients", "pharm_cust_" + c.id)).catch(err => {
                                          handleFirestoreError(err, OperationType.DELETE, `clients/pharm_cust_${c.id}`);
                                        });
                                      }
                                      setSystemLogs(prev => [`[Customers] Deleted customer: ${c.name}`, ...prev]);
                                    }
                                  }}
                                  className="p-1.5 bg-slate-950 hover:bg-rose-950 text-slate-500 hover:text-rose-400 rounded border border-slate-800 transition"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* TAB: AUDIT & REPORTS */}
            {activeTab === "reports" && (
              <div className="space-y-6">
                <div className="flex flex-wrap justify-between items-center gap-4">
                  <div>
                    <h2 className="text-xl font-bold text-white tracking-tight">Financial & Drug Audit Reports</h2>
                    <p className="text-xs text-slate-400">Analyze inventory value, transaction history, and export complete sales data.</p>
                  </div>
                  <button
                    onClick={() => {
                      // Generate and download a mock text/csv report file
                      const header = "Sale ID,Date,Customer,Total SSP,Payment Method,Staff\n";
                      const rows = sales.map(s => `"${s.id}","${s.created_at}","${s.customer_name}",${s.total},"${s.payment_method}","${s.staff}"`).join("\n");
                      const blob = new Blob([header + rows], { type: "text/csv" });
                      const url = URL.createObjectURL(blob);
                      const a = document.createElement("a");
                      a.href = url;
                      a.download = `pharmacy-sales-report-${new Date().toISOString().split("T")[0]}.csv`;
                      a.click();
                      setSystemLogs(prev => [`[Reports] Exported Sales Ledger Ledger as CSV file`, ...prev]);
                    }}
                    className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-4 py-2.5 rounded-lg transition"
                  >
                    <FileText className="w-4 h-4" />
                    <span>Export Sales CSV Report</span>
                  </button>
                </div>

                {/* Sub audit metrics */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  
                  {/* Stock Value Card */}
                  <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl space-y-3">
                    <h4 className="font-bold text-white text-xs uppercase tracking-wider flex items-center gap-1.5">
                      <Package className="w-4 h-4 text-orange-400" />
                      <span>Stock Value Report</span>
                    </h4>
                    <div className="space-y-2">
                      <div className="flex justify-between text-xs text-slate-400">
                        <span>Active Medication Types:</span>
                        <span className="text-white font-mono font-bold">{products.length}</span>
                      </div>
                      <div className="flex justify-between text-xs text-slate-400">
                        <span>Total Shelf Unit Qty:</span>
                        <span className="text-white font-mono font-bold">{products.reduce((acc, p) => acc + p.quantity, 0)} units</span>
                      </div>
                      <div className="border-t border-slate-800 pt-2 flex justify-between text-sm">
                        <span className="text-slate-400 font-bold">Estimated Stock Value:</span>
                        <span className="text-orange-400 font-black font-mono">SSP {metrics.totalStockVal.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>

                  {/* Revenue metrics */}
                  <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl space-y-3">
                    <h4 className="font-bold text-white text-xs uppercase tracking-wider flex items-center gap-1.5">
                      <TrendingUp className="w-4 h-4 text-emerald-400" />
                      <span>Net Profit Metrics</span>
                    </h4>
                    <div className="space-y-2">
                      <div className="flex justify-between text-xs text-slate-400">
                        <span>Today's Sales Revenue:</span>
                        <span className="text-white font-mono font-bold">SSP {metrics.todaySales.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between text-xs text-slate-400">
                        <span>Today's Net Profit:</span>
                        <span className="text-emerald-400 font-mono font-bold">SSP {metrics.todayProfit.toLocaleString()}</span>
                      </div>
                      <div className="border-t border-slate-800 pt-2 flex justify-between text-sm">
                        <span className="text-slate-400 font-bold">Weekly Profit (Estimate):</span>
                        <span className="text-emerald-400 font-black font-mono">SSP {metrics.weeklyProfit.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>

                  {/* Top Selling Medicine */}
                  <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl space-y-3">
                    <h4 className="font-bold text-white text-xs uppercase tracking-wider flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4 text-blue-400" />
                      <span>Top Selling Medicines</span>
                    </h4>
                    <div className="space-y-2 h-[80px] overflow-y-auto pr-1">
                      {sales.length === 0 ? (
                        <p className="text-[10px] text-slate-500 text-center py-4">No transactions logged yet.</p>
                      ) : (
                        // aggregate quantities
                        Object.entries(
                          sales.flatMap(s => s.items).reduce((acc: any, item: any) => {
                            acc[item.name] = (acc[item.name] || 0) + item.qty;
                            return acc;
                          }, {})
                        )
                        .sort((a: any, b: any) => b[1] - a[1])
                        .slice(0, 3)
                        .map(([name, qty]: any, idx) => (
                          <div key={idx} className="flex justify-between text-[11px]">
                            <span className="text-slate-300 truncate max-w-[150px]">{idx + 1}. {name}</span>
                            <span className="text-white font-mono font-bold">{qty} units sold</span>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>

                {/* Historic Transaction Ledger */}
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
                  <h3 className="font-bold text-white text-xs uppercase tracking-wider">Historical Dispensation Ledger</h3>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="bg-slate-950 border-b border-slate-850 text-slate-500 font-bold uppercase text-[9px] tracking-wider">
                          <th className="p-3">Sale ID</th>
                          <th className="p-3">Date</th>
                          <th className="p-3">Patient Profile</th>
                          <th className="p-3">Method</th>
                          <th className="p-3 text-right">Total SSP</th>
                          <th className="p-3 text-center">Receipts</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-850">
                        {sales.length === 0 ? (
                          <tr>
                            <td colSpan={6} className="text-center p-8 text-slate-500">No dispensation transactions registered in history log.</td>
                          </tr>
                        ) : (
                          sales.map((s) => (
                            <tr key={s.id} className="hover:bg-slate-850/30 transition text-[11px]">
                              <td className="p-3 font-mono font-bold text-white">{s.id}</td>
                              <td className="p-3 text-slate-400">{new Date(s.created_at).toLocaleString()}</td>
                              <td className="p-3 text-slate-300 space-y-0.5">
                                <p className="font-bold">{s.customer_name}</p>
                                {s.customer_phone && <p className="text-[9px] text-slate-500">{s.customer_phone}</p>}
                              </td>
                              <td className="p-3">
                                <span className="text-[9px] uppercase font-bold bg-slate-950 text-slate-400 border border-slate-850 px-2 py-0.5 rounded">
                                  {s.payment_method}
                                </span>
                              </td>
                              <td className="p-3 text-right font-mono font-bold text-orange-400">
                                SSP {s.total.toLocaleString()}
                              </td>
                              <td className="p-3 text-center">
                                <div className="flex justify-center gap-1.5">
                                  <button
                                    onClick={() => downloadReceiptPDF(s)}
                                    className="p-1 bg-slate-950 hover:bg-slate-800 text-slate-400 hover:text-white rounded border border-slate-850 transition"
                                    title="Download receipt PDF"
                                  >
                                    <FileText className="w-3 h-3" />
                                  </button>
                                  <button
                                    onClick={() => triggerWhatsAppReceiptSim(s)}
                                    className="p-1 bg-slate-950 hover:bg-slate-800 text-slate-400 hover:text-white rounded border border-slate-850 transition"
                                    title="Send simulated WhatsApp receipt"
                                  >
                                    <Smartphone className="w-3 h-3" />
                                  </button>
                                </div>
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

            {/* TAB: SUBSCRIPTION & SETTINGS */}
            {activeTab === "settings" && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-bold text-white tracking-tight">SaaS Subscription & Billing Engine</h2>
                  <p className="text-xs text-slate-400">Unlock multi-device dispensing, Twilio SMS receipts, and drug compliance reports.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  
                  {/* Current Active Plan summary */}
                  <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl space-y-4">
                    <h3 className="font-bold text-white text-xs uppercase tracking-wider">Current License Summary</h3>
                    
                    <div className="bg-slate-950 p-4 rounded-xl border border-slate-850 space-y-3 font-mono text-xs">
                      <div className="flex justify-between">
                        <span className="text-slate-500">License Domain:</span>
                        <span className="text-slate-300 font-bold">{domain}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">License Key:</span>
                        <span className="text-slate-300 font-bold truncate max-w-[150px]">{licenseKey}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Status:</span>
                        <span className="text-emerald-400 font-extrabold flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                          <span>ACTIVE</span>
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Plan Tier:</span>
                        <span className="text-orange-400 font-black uppercase">{subscription.planId} Edition</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Next Renewal:</span>
                        <span className="text-white font-bold">{subscription.endDate}</span>
                      </div>
                    </div>
                  </div>

                  {/* Multi plans grid */}
                  <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl space-y-4">
                    <h3 className="font-bold text-white text-xs uppercase tracking-wider">Select Authorized Subscription Tier</h3>
                    
                    <div className="space-y-3">
                      
                      {/* Starter */}
                      <div className={`p-4 rounded-xl border transition ${
                        subscription.planId === "starter" 
                          ? "bg-orange-500/5 border-orange-500" 
                          : "bg-slate-950 border-slate-850 hover:border-slate-800"
                      }`}>
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-extrabold text-white text-sm">Pharmacy Starter Plan</p>
                            <p className="text-[10px] text-slate-400">1 Device • Max 5,000 Products • Basic Sales</p>
                          </div>
                          <p className="font-mono text-xs font-black text-slate-200">25,000 SSP/mo</p>
                        </div>
                        {subscription.planId !== "starter" && (
                          <button
                            onClick={() => handleUpgradePlan("starter")}
                            className="mt-3 text-[10px] bg-slate-900 hover:bg-slate-800 text-slate-300 font-bold px-3 py-1.5 rounded border border-slate-800 transition"
                          >
                            Downgrade to Starter
                          </button>
                        )}
                      </div>

                      {/* Pro */}
                      <div className={`p-4 rounded-xl border transition ${
                        subscription.planId === "pro" 
                          ? "bg-orange-500/5 border-orange-500" 
                          : "bg-slate-950 border-slate-850 hover:border-slate-800"
                      }`}>
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-extrabold text-white text-sm flex items-center gap-1">
                              <span>Pharmacy Pro Plan</span>
                              <Sparkles className="w-3.5 h-3.5 text-orange-400" />
                            </p>
                            <p className="text-[10px] text-slate-400">2 Devices • Unlimited Products • Barcode Scanner • Whatsapp Receipt APIs</p>
                          </div>
                          <p className="font-mono text-xs font-black text-orange-400">45,000 SSP/mo</p>
                        </div>
                        {subscription.planId !== "pro" && (
                          <button
                            onClick={() => handleUpgradePlan("pro")}
                            className="mt-3 text-[10px] bg-orange-500 hover:bg-orange-600 text-white font-bold px-3 py-1.5 rounded transition"
                          >
                            Upgrade to Pro Edition
                          </button>
                        )}
                      </div>

                    </div>
                  </div>

                </div>
              </div>
            )}

          </div>

        </div>
      )}

      {/* MODAL: ADD / EDIT MEDICINE BATCH */}
      <AnimatePresence>
        {isAddMedOpen && (
          <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg overflow-hidden flex flex-col text-xs text-slate-300"
            >
              <div className="bg-slate-950 p-4 border-b border-slate-850 flex justify-between items-center">
                <h3 className="font-bold text-white text-xs uppercase tracking-wider">
                  {editingMedId ? "Edit Medicine Details" : "Add New Medicine Batch Record"}
                </h3>
                <button onClick={() => setIsAddMedOpen(false)} className="text-slate-400 hover:text-white transition">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleSaveMed} className="p-6 space-y-4 overflow-y-auto max-h-[480px]">
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] text-slate-400 uppercase font-semibold mb-1">Brand Name / Medicine Name</label>
                    <input
                      type="text"
                      required
                      value={medForm.name}
                      onChange={(e) => setMedForm({ ...medForm, name: e.target.value })}
                      placeholder="e.g. Coartem Forte"
                      className="w-full bg-slate-950 border border-slate-800 p-2.5 rounded-lg text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-slate-400 uppercase font-semibold mb-1">Generic Name / Formulation</label>
                    <input
                      type="text"
                      required
                      value={medForm.generic_name}
                      onChange={(e) => setMedForm({ ...medForm, generic_name: e.target.value })}
                      placeholder="e.g. Artemether 80mg + Lumefantrine 480mg"
                      className="w-full bg-slate-950 border border-slate-800 p-2.5 rounded-lg text-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] text-slate-400 uppercase font-semibold mb-1">MOH Drug Category</label>
                    <select
                      value={medForm.category}
                      onChange={(e) => setMedForm({ ...medForm, category: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-800 p-2.5 rounded-lg text-white outline-none"
                    >
                      <option value="Antibiotics">Antibiotics</option>
                      <option value="Analgesics">Analgesics</option>
                      <option value="Antimalarials">Antimalarials</option>
                      <option value="Vitamins">Vitamins</option>
                      <option value="Cardiovascular">Cardiovascular</option>
                      <option value="Injectables">Injectables</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] text-slate-400 uppercase font-semibold mb-1">Batch Code Number</label>
                    <input
                      type="text"
                      required
                      value={medForm.batch_no}
                      onChange={(e) => setMedForm({ ...medForm, batch_no: e.target.value })}
                      placeholder="e.g. CRT-901A"
                      className="w-full bg-slate-950 border border-slate-800 p-2.5 rounded-lg text-white font-mono"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] text-slate-400 uppercase font-semibold mb-1">Barcode Scanner ID</label>
                    <input
                      type="text"
                      value={medForm.barcode}
                      onChange={(e) => setMedForm({ ...medForm, barcode: e.target.value })}
                      placeholder="e.g. 61511012"
                      className="w-full bg-slate-950 border border-slate-800 p-2.5 rounded-lg text-white font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-slate-400 uppercase font-semibold mb-1">Batch Expiry Date</label>
                    <input
                      type="date"
                      required
                      value={medForm.expiry_date}
                      onChange={(e) => setMedForm({ ...medForm, expiry_date: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-800 p-2.5 rounded-lg text-white font-mono"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-4 gap-2">
                  <div className="col-span-2">
                    <label className="block text-[10px] text-slate-400 uppercase font-semibold mb-1">Buying Price (SSP)</label>
                    <input
                      type="number"
                      required
                      value={medForm.buying_price}
                      onChange={(e) => setMedForm({ ...medForm, buying_price: Math.max(0, parseInt(e.target.value) || 0) })}
                      className="w-full bg-slate-950 border border-slate-800 p-2.5 rounded-lg text-white font-mono"
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-[10px] text-slate-400 uppercase font-semibold mb-1">Selling Price (SSP)</label>
                    <input
                      type="number"
                      required
                      value={medForm.selling_price}
                      onChange={(e) => setMedForm({ ...medForm, selling_price: Math.max(0, parseInt(e.target.value) || 0) })}
                      className="w-full bg-slate-950 border border-slate-800 p-2.5 rounded-lg text-white font-mono"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] text-slate-400 uppercase font-semibold mb-1">Batch Stock Quantity</label>
                    <input
                      type="number"
                      required
                      value={medForm.quantity}
                      onChange={(e) => setMedForm({ ...medForm, quantity: Math.max(0, parseInt(e.target.value) || 0) })}
                      className="w-full bg-slate-950 border border-slate-800 p-2.5 rounded-lg text-white font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-slate-400 uppercase font-semibold mb-1">Low Stock Threshold Limit</label>
                    <input
                      type="number"
                      required
                      value={medForm.min_stock}
                      onChange={(e) => setMedForm({ ...medForm, min_stock: Math.max(1, parseInt(e.target.value) || 0) })}
                      className="w-full bg-slate-950 border border-slate-800 p-2.5 rounded-lg text-white font-mono"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-3 bg-gradient-to-r from-blue-600 to-orange-500 hover:opacity-95 text-white font-bold text-xs rounded-lg transition mt-4"
                >
                  {editingMedId ? "Update Medicine Record" : "Authorize Entry & Seed Database"}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL: STOCK IN / STOCK OUT QUICK ADJUSTMENT */}
      <AnimatePresence>
        {isStockAdjOpen && (
          <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-sm overflow-hidden flex flex-col text-xs text-slate-300"
            >
              <div className="bg-slate-950 p-4 border-b border-slate-850 flex justify-between items-center">
                <h3 className="font-bold text-white text-xs uppercase tracking-wider flex items-center gap-1">
                  <RefreshCw className="w-4 h-4 text-orange-400" />
                  <span>Stock Adjuster Log</span>
                </h3>
                <button onClick={() => setIsStockAdjOpen(false)} className="text-slate-400 hover:text-white transition">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleStockAdjSave} className="p-6 space-y-4">
                <div>
                  <label className="block text-[10px] text-slate-400 uppercase font-bold mb-1.5">Select Medicine Batch</label>
                  <select
                    value={stockAdjMedId}
                    onChange={(e) => setStockAdjMedId(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-850 p-2.5 rounded-lg text-white"
                  >
                    <option value="">-- Choose Medicine --</option>
                    {products.map((p) => (
                      <option key={p.id} value={p.id}>{p.name} ({p.quantity} left)</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] text-slate-400 uppercase font-bold mb-1.5">Adjustment Type</label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setStockAdjType("in")}
                      className={`py-2 text-[10px] font-extrabold rounded transition ${
                        stockAdjType === "in" 
                          ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 shadow-md" 
                          : "bg-slate-950 text-slate-400 border border-slate-850 hover:border-slate-800"
                      }`}
                    >
                      STOCK IN / REFILL
                    </button>
                    <button
                      type="button"
                      onClick={() => setStockAdjType("out")}
                      className={`py-2 text-[10px] font-extrabold rounded transition ${
                        stockAdjType === "out" 
                          ? "bg-rose-500/10 text-rose-400 border border-rose-500/30 shadow-md animate-pulse" 
                          : "bg-slate-950 text-slate-400 border border-slate-850 hover:border-slate-800"
                      }`}
                    >
                      STOCK OUT / DISCARD
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] text-slate-400 uppercase font-bold mb-1.5">Adjustment Quantity</label>
                  <input
                    type="number"
                    required
                    value={stockAdjQty}
                    onChange={(e) => setStockAdjQty(Math.max(1, parseInt(e.target.value) || 0))}
                    className="w-full bg-slate-950 border border-slate-850 p-2.5 rounded-lg text-white font-mono text-center text-sm focus:border-orange-500 outline-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={!stockAdjMedId}
                  className="w-full py-2.5 bg-gradient-to-r from-blue-600 to-orange-500 hover:opacity-95 text-white font-bold text-xs rounded-lg transition"
                >
                  Confirm Quick Inventory Adjustment
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL: REGISTER PATIENT */}
      <AnimatePresence>
        {isAddCustOpen && (
          <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-sm overflow-hidden flex flex-col text-xs text-slate-300"
            >
              <div className="bg-slate-950 p-4 border-b border-slate-850 flex justify-between items-center">
                <h3 className="font-bold text-white text-xs uppercase tracking-wider flex items-center gap-1">
                  <Users className="w-4 h-4 text-orange-400" />
                  <span>Register Patient Profile</span>
                </h3>
                <button onClick={() => setIsAddCustOpen(false)} className="text-slate-400 hover:text-white transition">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleAddCustomer} className="p-6 space-y-4">
                <div>
                  <label className="block text-[10px] text-slate-400 uppercase font-bold mb-1.5">Patient Full Name</label>
                  <input
                    type="text"
                    required
                    value={custForm.name}
                    onChange={(e) => setCustForm({ ...custForm, name: e.target.value })}
                    placeholder="e.g. Florence Namubiru"
                    className="w-full bg-slate-950 border border-slate-850 p-2.5 rounded-lg text-white font-semibold focus:border-orange-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[10px] text-slate-400 uppercase font-bold mb-1.5">Active Phone (WhatsApp)</label>
                  <input
                    type="text"
                    required
                    value={custForm.phone}
                    onChange={(e) => setCustForm({ ...custForm, phone: e.target.value })}
                    placeholder="e.g. +211 925 112 004"
                    className="w-full bg-slate-950 border border-slate-850 p-2.5 rounded-lg text-white font-mono focus:border-orange-500 outline-none"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 bg-gradient-to-r from-blue-600 to-orange-500 hover:opacity-95 text-white font-bold text-xs rounded-lg transition"
                >
                  Authorized New Patient Entry
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* WHATSAPP API TWILIO SIMULATOR MODAL */}
      <AnimatePresence>
        {whatsappSimulation.isOpen && (
          <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-sm overflow-hidden flex flex-col text-xs text-slate-300 shadow-2xl"
            >
              {/* WhatsApp branded top */}
              <div className="bg-emerald-600 p-4 text-white flex justify-between items-center shadow-md">
                <div className="flex items-center gap-2">
                  <div className="bg-white/20 p-1.5 rounded-full">
                    <Smartphone className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-sm">Twilio WhatsApp Sandbox</h3>
                    <p className="text-[9px] opacity-80">Junub POS API Dispatcher Gateway</p>
                  </div>
                </div>
                <button onClick={() => setWhatsappSimulation(prev => ({ ...prev, isOpen: false }))} className="text-white hover:opacity-80 transition">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="p-6 space-y-4">
                <div className="space-y-1">
                  <span className="text-[9px] uppercase font-bold text-slate-400">Target Mobile Contact</span>
                  <p className="font-mono font-bold text-white bg-slate-950 p-2 rounded border border-slate-850">{whatsappSimulation.phone}</p>
                </div>

                <div className="space-y-1">
                  <span className="text-[9px] uppercase font-bold text-slate-400">Template Payload Body</span>
                  <div className="bg-emerald-950/30 border border-emerald-500/20 p-3 rounded-lg text-slate-200 font-mono text-[11px] leading-relaxed relative">
                    <span className="absolute bottom-1 right-2 text-[8px] text-emerald-500 font-extrabold uppercase">MOH Compliant</span>
                    {whatsappSimulation.message}
                  </div>
                </div>

                {whatsappSimulation.status === "sending" && (
                  <div className="flex items-center justify-center gap-2 text-orange-400 font-bold py-2">
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Contacting Twilio Gateway Nodes...</span>
                  </div>
                )}

                {whatsappSimulation.status === "sent" && (
                  <div className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-lg p-3 text-center font-bold">
                    ✓ Handshake accepted. Message delivered successfully.
                  </div>
                )}

                {whatsappSimulation.status !== "sending" && whatsappSimulation.status !== "sent" && (
                  <button
                    onClick={handleSendWhatsAppSim}
                    className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-lg transition"
                  >
                    Authorize Twilio SMS/WhatsApp Handshake
                  </button>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
