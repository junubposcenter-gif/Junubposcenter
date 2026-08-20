import React, { useState, useEffect, useRef, useMemo } from 'react';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { 
  collection, 
  query, 
  where, 
  onSnapshot, 
  addDoc, 
  setDoc,
  deleteDoc,
  serverTimestamp,
  getDocs,
  updateDoc,
  doc,
  getDoc,
  orderBy,
  or,
  and,
  limit,
  collectionGroup,
  Timestamp
} from 'firebase/firestore';
import { db, auth } from '../firebase-client';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { 
  LayoutDashboard, 
  ShoppingCart, 
  Users, 
  Package, 
  Settings, 
  LogOut, 
  Plus, 
  PlusCircle,
  Search, 
  Edit,
  Edit3,
  ChevronRight, 
  ChevronDown,
  Printer, 
  CheckCircle2, 
  Clock, 
  AlertTriangle,
  ArrowUpCircle,
  DollarSign,
  FileText,
  CreditCard,
  Bell,
  Wallet,
  X,
  XCircle,
  Check,
  Trash2,
  UserCheck,
  TrendingUp,
  Lock,
  Unlock,
  ShieldAlert,
  BarChart3,
  Landmark,
  Info,
  Download,
  Shield,
  AlertCircle,
  LogIn,
  Calendar,
  MessageSquare,
  RefreshCcw,
  Send,
  Archive,
  Camera,
  Play,
  BookOpen,
  Wrench,
  Eye,
  EyeOff,
  Coins,
  Truck,
  CheckSquare,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { User, Order, Customer, Service, DashboardStats, Role, AppNotification, Expense, Funding, Status, ChatMessage, Payment, Quotation, Asset, Purchase } from '../types';

import { TERMS_AND_CONDITIONS, ROLE_DEFINITIONS } from '../constants';

import { firebaseService, OperationType, handleFirestoreError } from '../services/firebaseService';
import { ProductDemo } from './ProductDemo';
import { PWAInstallModal } from './PWAInstallModal';
import { TasksView } from './TasksView';

// --- Components ---

const Toast = ({ message, type, onClose }: { message: string, type: 'success' | 'error' | 'info', onClose: () => void }) => (
  <motion.div 
    initial={{ opacity: 0, y: -20 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -20 }}
    className={`fixed top-4 right-4 z-50 p-4 rounded-xl shadow-lg border flex items-center gap-3 min-w-[300px] ${
      type === 'success' ? 'bg-emerald-50 border-emerald-100 text-emerald-800' :
      type === 'error' ? 'bg-rose-50 border-rose-100 text-rose-800' :
      'bg-indigo-50 border-indigo-100 text-indigo-800'
    }`}
  >
    {type === 'success' ? <CheckCircle2 className="w-5 h-5" /> : 
     type === 'error' ? <AlertTriangle className="w-5 h-5" /> : 
     <Clock className="w-5 h-5" />}
    <p className="text-sm font-medium flex-1">{message}</p>
    <button onClick={onClose} className="p-1 hover:bg-black/5 rounded-lg transition-colors">
      <Plus className="w-4 h-4 rotate-45" />
    </button>
  </motion.div>
);

const Modal = ({ title, isOpen, onClose, children }: { title: string, isOpen: boolean, onClose: () => void, children: React.ReactNode }) => (
  <AnimatePresence>
    {isOpen && (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
        />
        <motion.div 
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden"
        >
          <div className="p-6 border-b border-slate-100 flex items-center justify-between">
            <h3 className="text-xl font-bold text-slate-900">{title}</h3>
            <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-xl transition-colors">
              <Plus className="w-5 h-5 rotate-45 text-slate-400" />
            </button>
          </div>
          <div className="p-6">
            {children}
          </div>
        </motion.div>
      </div>
    )}
  </AnimatePresence>
);

import Markdown from 'react-markdown';

const TermsModal = ({ onAccept }: { onAccept: () => void }) => {
  return (
    <div className="fixed inset-0 bg-slate-900/90 backdrop-blur-sm z-[9999] flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="bg-white w-full max-w-2xl max-h-[85vh] rounded-[2.5rem] shadow-2xl flex flex-col overflow-hidden"
      >
        <div className="px-8 py-6 border-b border-slate-100 flex items-center gap-4 bg-slate-50">
          <div className="w-12 h-12 bg-red-100 rounded-2xl flex items-center justify-center text-red-600">
            <FileText className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-black text-slate-900">ARK Management: Rules & Terms</h2>
            <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">Ark Printing and Longun Tech</p>
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto px-8 py-8 prose prose-slate prose-sm max-w-none">
          <div className="markdown-body">
            <Markdown>{TERMS_AND_CONDITIONS}</Markdown>
          </div>
        </div>

        <div className="px-8 py-6 bg-slate-50 border-t border-slate-100 flex flex-col gap-4">
          <div className="flex items-start gap-3 p-4 bg-amber-50 rounded-2xl border border-amber-100">
            <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <p className="text-xs text-amber-900 leading-relaxed font-medium">
              By accepting, you activate your administrative privileges and agree to the subscription fees of $70/mo (Monthly) or $50/mo (Annualized).
            </p>
          </div>
          <button 
                onClick={onAccept}
                className="w-full bg-slate-900 text-white py-4 rounded-2xl font-black hover:bg-black transition-all shadow-lg hover:shadow-slate-200"
              >
                I Accept & Agree to Terms
              </button>
        </div>
      </motion.div>
    </div>
  );
};

const ConfirmationModal = ({ isOpen, title, message, onConfirm, onCancel, selectionOptions }: { 
  isOpen: boolean, 
  title: string, 
  message: string, 
  onConfirm: (id?: string) => void | Promise<void>, 
  onCancel: () => void,
  selectionOptions?: {id: string, label: string}[]
}) => {
  const [selectedId, setSelectedId] = useState(selectionOptions?.[0]?.id || '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const handleConfirm = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    try {
      await onConfirm(selectedId);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <Modal title={title} isOpen={isOpen} onClose={isSubmitting ? undefined : onCancel}>
      <div className="space-y-6">
        <p className="text-slate-600">{message}</p>
        
        {selectionOptions && (
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Select Personnel</label>
            <select 
              className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 outline-none focus:ring-2 focus:ring-red-500 font-bold text-slate-700"
              value={selectedId}
              disabled={isSubmitting}
              onChange={(e) => setSelectedId(e.target.value)}
            >
              {selectionOptions.map(opt => (
                <option key={opt.id} value={opt.id}>{opt.label}</option>
              ))}
            </select>
          </div>
        )}

        <div className="flex gap-3">
          <button 
            onClick={onCancel}
            disabled={isSubmitting}
            className="flex-1 px-4 py-3 rounded-xl font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancel
          </button>
          <button 
            onClick={handleConfirm}
            disabled={isSubmitting}
            className="flex-1 px-4 py-3 rounded-xl font-bold text-white bg-red-600 hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Processing...' : 'Confirm'}
          </button>
        </div>
      </div>
    </Modal>
  );
};

const StatCard = ({ title, value, icon: Icon, color, onClick }: { title: string, value: string | number, icon: any, color: string, onClick?: () => void }) => (
  <div 
    onClick={onClick}
    className={`bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4 ${onClick ? 'cursor-pointer hover:shadow-md hover:border-slate-200 transition-all active:scale-95' : ''}`}
  >
    <div className={`p-3 rounded-xl ${color}`}>
      <Icon className="w-6 h-6 text-white" />
    </div>
    <div>
      <p className="text-sm font-medium text-slate-500">{title}</p>
      <h3 className="text-2xl font-bold text-slate-900">{value}</h3>
    </div>
  </div>
);

  const getStatusLabel = (status?: string) => {
  switch(status) {
    case 'pending': return 'Queueing';
    case 'at_designer': return "At Designer's Table";
    case 'production': return 'In Production';
    case 'pending_client_approval': return 'Pending Client Approval';
    case 'done_awaiting_invoice': return 'Done (Accounts Table)';
    case 'ready_for_payment': return 'Ready for Payment';
    case 'completed': return 'Taken/Finished';
    case 'paid': return 'Paid';
    default: return status || 'Unknown';
  }
};

const Badge = ({ status }: { status: string }) => {
    const colors: Record<string, string> = {
      pending: 'bg-orange-100 text-orange-700',
      at_designer: 'bg-red-100 text-red-700',
      production: 'bg-yellow-100 text-yellow-700',
      pending_client_approval: 'bg-amber-100 text-amber-700',
      done_awaiting_invoice: 'bg-emerald-100 text-emerald-700',
      ready_for_payment: 'bg-emerald-100 text-emerald-700',
      completed: 'bg-slate-900 text-white',
      paid: 'bg-emerald-50 text-emerald-600',
      partially_paid: 'bg-amber-100 text-amber-700',
      unpaid: 'bg-rose-100 text-rose-700',
    };
    
    const icons: Record<string, any> = {
      pending: Clock,
      at_designer: FileText,
      production: Printer,
      pending_client_approval: UserCheck,
      done_awaiting_invoice: CheckCircle2,
      ready_for_payment: CheckCircle2,
      completed: CheckCircle2,
      paid: DollarSign,
      partially_paid: DollarSign,
      unpaid: DollarSign,
    };

    const Icon = icons[status] || Clock;

    return (
      <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold ${colors[status] || 'bg-slate-100 text-slate-700'}`}>
        <Icon className="w-3.5 h-3.5" />
        {getStatusLabel(status)}
      </span>
    );
  };

const ServiceSelectItem = ({ s, onAdd, formatCurrency, usdToSsp }: { s: Service, onAdd: (qty: number) => void, formatCurrency: (a: number) => string, usdToSsp: (a: number) => number, key?: any }) => {
  const [qty, setQty] = useState(1);
  return (
    <div className="flex items-center gap-3 p-3 rounded-xl border border-slate-100 hover:border-red-200 hover:bg-slate-50 transition-all text-left">
      <div className="flex-1">
        <p className="text-sm font-bold text-slate-900">{s.name}</p>
        <div className="flex items-center gap-2">
           <p className="text-xs text-slate-500">{s.category || 'General'} - {formatCurrency(usdToSsp(s.price || 0))}</p>
           <span className="text-[10px] font-bold text-slate-400 bg-slate-100 px-1.5 rounded">$ {(s.price || 0).toFixed(2)}</span>
        </div>
        <p className="text-[10px] font-bold text-red-600 uppercase">Stock: {s.stock} {s.unit}</p>
      </div>
      <div className="flex items-center gap-2">
        <input 
          type="number" 
          min="1"
          className="w-12 px-2 py-1 text-xs border rounded-lg focus:ring-1 focus:ring-red-500 outline-none bg-white"
          value={qty}
          onChange={(e) => setQty(Math.max(1, parseInt(e.target.value) || 1))}
        />
        <button 
          onClick={() => onAdd(qty)}
          className="p-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          disabled={s.stock <= 0}
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

// --- Helper for local system date string ---
export const getLocalDateString = (date: any = new Date()) => {
  try {
    const d = date.toDate ? date.toDate() : (date instanceof Date ? date : new Date(date));
    if (isNaN(d.getTime())) return '';
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  } catch {
    return '';
  }
};

// --- Safe helper to parse date strings into local Date objects without UTC shift ---
export const parseLocalDate = (dateStr: any, isEnd: boolean = false): Date => {
  if (!dateStr) return new Date();
  try {
    if (dateStr instanceof Date) {
      return new Date(dateStr.getTime());
    }
    const cleanStr = dateStr.toDate ? getLocalDateString(dateStr) : String(dateStr).split('T')[0];
    const parts = cleanStr.split('-');
    if (parts.length === 3) {
      const year = parseInt(parts[0], 10);
      const month = parseInt(parts[1], 10) - 1; // 0-indexed
      const day = parseInt(parts[2], 10);
      if (isEnd) {
        return new Date(year, month, day, 23, 59, 59, 999);
      }
      return new Date(year, month, day, 0, 0, 0, 0);
    }
    const parsed = new Date(dateStr);
    if (!isNaN(parsed.getTime())) {
      return parsed;
    }
  } catch (err) {
    console.error("Error parsing date:", dateStr, err);
  }
  return new Date();
};

// --- Helper to check if a collection (payment) is a Recovered Debt (made strictly after the day the job order was created) ---
export const isRecoveredDebtPayment = (paymentDate: Date, orderCreationDate: Date): boolean => {
  if (!paymentDate || !orderCreationDate) return false;
  const pStr = getLocalDateString(paymentDate);
  const oStr = getLocalDateString(orderCreationDate);
  if (!pStr || !oStr) return false;
  
  const pMidnight = parseLocalDate(pStr);
  const oMidnight = parseLocalDate(oStr);
  
  // Strictly past a day from the creation date (payment calendar day is greater than order creation calendar day)
  return pMidnight.getTime() > oMidnight.getTime();
};

// --- Main App ---

interface JubaPrintManagerProps {
  domain?: string;
  licenseKey?: string;
}

export function JubaPrintManager({ domain, licenseKey }: JubaPrintManagerProps) {
  const [user, setRawUser] = useState<User | null>(null);
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  
  // Security Session & OTP States
  const [pendingUser, setPendingUser] = useState<User | null>(null);
  const [showOtpScreen, setShowOtpScreen] = useState<boolean>(false);
  const [otpCode, setOtpCode] = useState<string>('');
  const [enteredOtp, setEnteredOtp] = useState<string>('');
  const [sendingOtp, setSendingOtp] = useState<boolean>(false);
  const [otpMessage, setOtpMessage] = useState<string>('');
  
  // Ref to ignore device-change checks during authentication/verification transition
  const ignoreDeviceCheckRef = useRef<boolean>(false);

  const device_id = useMemo(() => {
    let id = localStorage.getItem('device_id');
    if (!id) {
      id = 'device_' + Math.random().toString(36).substring(2, 15) + '_' + Date.now();
      localStorage.setItem('device_id', id);
    }
    return id;
  }, []);

  const sendOtpToGmail = async (u: User, generatedOtp: string) => {
    setSendingOtp(true);
    try {
      const response = await fetch("/api/send-email-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: u.username || u.email || "User",
          otp: generatedOtp,
          email: u.email || "",
          deviceDetails: navigator.userAgent
        })
      });
      if (!response.ok) {
        throw new Error(`Server returned HTTP ${response.status}`);
      }
      const resData = await response.json();
      if (resData.simulated) {
        setOtpMessage(`[SIMULATION MODE] A security OTP alert code (${generatedOtp}) was simulated to your registered Gmail (${resData.recipient || u.email || 'N/A'}).\n\nEnter code "${generatedOtp}" to authorize this device.`);
      } else {
        setOtpMessage(`A security OTP verification code has been sent successfully to your registered Gmail address: ${resData.recipient || u.email}.`);
      }
    } catch (err) {
      console.error("Error sending Gmail OTP:", err);
      setOtpMessage(`Failed to send email message, but here is the simulated OTP code for testing: "${generatedOtp}"`);
    } finally {
      setSendingOtp(false);
    }
  };

  const handleResendOtp = async (channel: 'gmail') => {
    if (!pendingUser) return;
    const generatedOtp = Math.floor(100000 + Math.random() * 900000).toString();
    setOtpCode(generatedOtp);
    await sendOtpToGmail(pendingUser, generatedOtp);
  };

  const setUser = async (u: User | null) => {
    if (u) {
      const storedId = u.current_device_id;
      if (storedId && storedId !== device_id) {
        setPendingUser(u);
        setShowOtpScreen(true);
        const generatedOtp = Math.floor(100000 + Math.random() * 900000).toString();
        setOtpCode(generatedOtp);
        // Default to Gmail delivery as requested
        await sendOtpToGmail(u, generatedOtp);
      } else {
        ignoreDeviceCheckRef.current = true;
        try {
          await updateDoc(doc(db, "users", u.id), {
            current_device_id: device_id
          });
        } catch (err) {
          console.error("Error updating current_device_id:", err);
        }
        setRawUser(u);
      }
    } else {
      setRawUser(null);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pendingUser) return;
    
    if (enteredOtp.trim() === otpCode) {
      try {
        setLoading(true);
        
        // Critical: Update the DB and ignore device-change check before setting the state to avoid instant session logout
        ignoreDeviceCheckRef.current = true;
        await updateDoc(doc(db, "users", pendingUser.id), {
          current_device_id: device_id
        });
        
        // Set authorized raw user
        setRawUser(pendingUser);
        showNotification("Security verification successful! Device authorized.", "success");
        
        // Reset verification states
        setShowOtpScreen(false);
        setPendingUser(null);
        setEnteredOtp('');
        setOtpCode('');
        setOtpMessage('');
      } catch (err: any) {
        console.error("Error updating user device ID:", err);
        showNotification(`Verification error: ${err.message}`, "error");
      } finally {
        setLoading(false);
      }
    } else {
      showNotification("Incorrect security verification OTP code. Please check your Gmail or try again.", "error");
    }
  };

  const handleCancelOtp = () => {
    // Reset everything and go back to login screen
    setShowOtpScreen(false);
    setPendingUser(null);
    setEnteredOtp('');
    setOtpCode('');
    setOtpMessage('');
    signOut(auth);
  };

  const [currency, setCurrency] = useState<'SSP' | 'USD'>('SSP');
  const [usdRate, setUsdRate] = useState(130); // Example rate: 1 USD = 130 SSP
  const [isNewCustomer, setIsNewCustomer] = useState(false);
  const [newCustomerOrder, setNewCustomerOrder] = useState({ name: '', phone: '', address: '' });
  const [approverId, setApproverId] = useState('');
  const [activeTab, setActiveTab] = useState('dashboard');
  const [showPrinterDiagnostic, setShowPrinterDiagnostic] = useState(false);
  
  // PWA (Progressive Web App) Download Hook
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showInstallBtn, setShowInstallBtn] = useState<boolean>(false);
  const [isPWAInstallModalOpen, setIsPWAInstallModalOpen] = useState<boolean>(false);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowInstallBtn(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // If already launched in standalone mode
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setShowInstallBtn(false);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallApp = async () => {
    if (!deferredPrompt) return;
    try {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      console.log(`[PWA] Install status decision: ${outcome}`);
    } catch (err) {
      console.error('[PWA prompt error]:', err);
    } finally {
      setDeferredPrompt(null);
      setShowInstallBtn(false);
      setIsPWAInstallModalOpen(false);
    }
  };
  
  useEffect(() => {
    setCustomerSearch('');
  }, [activeTab]);
  const [orderQueueTab, setOrderQueueTab] = useState<'none' | 'all' | 'queuing' | 'designer' | 'production' | 'awaiting_invoice'>('none');
  const [jobsDoneTab, setJobsDoneTab] = useState<'none' | 'all' | 'unpaid' | 'paid' | 'partial'>('none');
  const [showProductDemo, setShowProductDemo] = useState(false);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [rawOrders, setRawOrders] = useState<Order[]>([]);
  
  // Memoized orders with customer names mapped
  const orders = useMemo(() => {
    return rawOrders.map(order => ({
      ...order,
      customer_name: customers.find(c => c.id === order.customer_id)?.name || 'Unknown'
    }));
  }, [rawOrders, customers]);

  const referredCustomerIds = useMemo(() => {
    if (user?.role !== 'sales_marketing' || !rawOrders) return null;
    const ids = new Set<string>();
    rawOrders.forEach(o => {
      if (o.referrer_id === user?.id && o.customer_id) {
        ids.add(o.customer_id);
      }
    });
    return ids;
  }, [user?.role, user?.id, rawOrders]);
  const [services, setServices] = useState<Service[]>([]);
  const [assets, setAssets] = useState<Asset[]>([]);
  const [isAssetModalOpen, setIsAssetModalOpen] = useState(false);
  const [newAsset, setNewAsset] = useState<Partial<Asset>>({ name: '', type: 'fixed', quantity: 1, value: 0 });
  const [servicesTab, setServicesTab] = useState<'services' | 'assets'>('services');
  const [servicesSearchTerm, setServicesSearchTerm] = useState('');
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const filteredServices = useMemo(() => {
    if (!servicesSearchTerm.trim()) return services;
    const term = servicesSearchTerm.toLowerCase();
    return services.filter(s => 
      (s.name || '').toLowerCase().includes(term) ||
      (s.category || '').toLowerCase().includes(term)
    );
  }, [services, servicesSearchTerm]);
  const [users, setUsers] = useState<User[]>([]);
  const [filterDateRange, setFilterDateRange] = useState({ 
    start: getLocalDateString(), 
    end: getLocalDateString() 
  });
  const [staffReports, setStaffReports] = useState<any[]>([]);

  const [inventoryLogs, setInventoryLogs] = useState<any[]>([]);
  const [selectedAnalyticsItem, setSelectedAnalyticsItem] = useState<Service | null>(null);
  const [analyticsSubTab, setAnalyticsSubTab] = useState<'materials' | 'staff' | 'expenses' | 'profits'>('materials');
  const [staffSearchQuery, setStaffSearchQuery] = useState('');
  const [profitSearchTerm, setProfitSearchTerm] = useState('');
  const [profitDetailsMode, setProfitDetailsMode] = useState<'items' | 'orders'>('items');
  const [selectedProfitItemName, setSelectedProfitItemName] = useState<string | null>(null);
  const [selectedExpenseCategory, setSelectedExpenseCategory] = useState<string | null>(null);
  const [debtFilter, setDebtFilter] = useState<'all' | 'partial' | 'unpaid' | 'designer' | 'production' | 'done'>('all');
  const [selectedStaffUser, setSelectedStaffUser] = useState<User | null>(null);
  const [allOrderItems, setAllOrderItems] = useState<any[]>([]);

  useEffect(() => {
    if (analyticsSubTab === 'profits' && allOrderItems.length === 0) {
      firebaseService.getAllOrderItems().then(setAllOrderItems);
    }
  }, [analyticsSubTab, allOrderItems.length]);

  const now = new Date();
  const todayStr = getLocalDateString(new Date(now.getFullYear(), now.getMonth(), now.getDate()));
  const thisMonthStartStr = getLocalDateString(new Date(now.getFullYear(), now.getMonth(), 1));
  const thisMonthEndStr = getLocalDateString(new Date(now.getFullYear(), now.getMonth() + 1, 0));
  const lastMonthStartStr = getLocalDateString(new Date(now.getFullYear(), now.getMonth() - 1, 1));
  const lastMonthEndStr = getLocalDateString(new Date(now.getFullYear(), now.getMonth(), 0));

  const [card1Dates, setCard1Dates] = useState({ start: todayStr, end: todayStr });
  const [card2Dates, setCard2Dates] = useState({ start: thisMonthStartStr, end: thisMonthEndStr });
  const [card3Dates, setCard3Dates] = useState({ start: lastMonthStartStr, end: lastMonthEndStr });
  const [isEditingCardDates, setIsEditingCardDates] = useState<number | null>(null);

  const isMaster = useMemo(() => {
    if (!user) return false;
    const lower = user.email?.toLowerCase();
    return user?.staff_id === 'MASTER' || 
           lower === 'tekkisandereagan@gmail.com' || 
           lower === 'kulyakosukusandereagan@gmail.com' ||
           lower === 'junubposcenter@gmail.com';
  }, [user]);

  const isAdminUser = useMemo(() => {
    return user?.role === 'admin' || isMaster;
  }, [user, isMaster]);

  const isSupervisor = useMemo(() => {
    return user?.role === 'supervisor' || isAdminUser;
  }, [user, isAdminUser]);

  const isAuthorisedForPayments = useMemo(() => {
    // Strictly receptionist or admin. Master is always allowed. Supervisor is restricted from payments.
    const roles = ['receptionist', 'admin'];
    return roles.includes(user?.role || '') || isMaster;
  }, [user, isMaster]);

  const isManagementUser = useMemo(() => {
    return isAdminUser || isSupervisor;
  }, [isAdminUser, isSupervisor]);

  const [detailedHistoryLoading, setDetailedHistoryLoading] = useState(false);
  const [detailedHistory, setDetailedHistory] = useState<any[]>([]);
  const [detailedStats, setDetailedStats] = useState({
    stock: 0,
    totalUsage: 0,
    revenueGenerated: 0,
    timesRequested: 0
  });

  const filteredDetailedHistory = useMemo(() => {
    if (!detailedHistory.length) return [];
    try {
      const start = new Date(filterDateRange.start);
      const end = new Date(new Date(filterDateRange.end).setHours(23, 59, 59, 999));
      return detailedHistory.filter(item => {
        if (!item.date) return true;
        const d = item.date.toDate ? item.date.toDate() : new Date(item.date);
        return d >= start && d <= end;
      });
    } catch {
      return detailedHistory;
    }
  }, [detailedHistory, filterDateRange.start, filterDateRange.end]);

  const filteredDetailedStats = useMemo(() => {
    const stock = selectedAnalyticsItem?.stock || 0;
    const totalUsage = filteredDetailedHistory
      .filter(h => h.type === 'Sold')
      .reduce((sum, h) => sum + Math.abs(h.amount), 0);
    const revenueGenerated = filteredDetailedHistory
      .filter(h => h.type === 'Sold' && h.payment_status === 'paid')
      .reduce((sum, h) => sum + (Math.abs(h.amount) * h.unitPrice), 0);
    const timesRequested = filteredDetailedHistory
      .filter(h => h.type === 'Sold')
      .length;
    return { stock, totalUsage, revenueGenerated, timesRequested };
  }, [filteredDetailedHistory, selectedAnalyticsItem]);

  const loadDetailedHistory = async (item: Service) => {
    setDetailedHistoryLoading(true);
    setDetailedHistory([]);
    setDetailedStats({
      stock: item.stock || 0,
      totalUsage: 0,
      revenueGenerated: 0,
      timesRequested: 0
    });

    try {
      // 1. Fetch inventory logs (all restocks and adjustments)
      let fetchedLogs: any[] = [];
      try {
        const logsQ = query(
          collection(db, "inventory_logs"),
          where("service_id", "==", item.id)
        );
        const logsSnap = await getDocs(logsQ);
        fetchedLogs = logsSnap.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          created_at: doc.data().created_at
        } as any));
      } catch (logsErr) {
        console.warn("Error fetching inventory logs:", logsErr);
      }

      // 2. Fetch sales of this item (Tier 1: CollectionGroup scan, Tier 2: In-memory fallback scanning)
      const salesItems: any[] = [];
      try {
        const salesQ = query(collectionGroup(db, "items"));
        const salesSnap = await getDocs(salesQ);
        salesSnap.docs.forEach(docSnap => {
          const data = docSnap.data();
          if (data.service_id === item.id) {
            const refPath = docSnap.ref.path;
            const parts = refPath.split('/');
            const orderId = parts[1]; // path matches "orders/{orderId}/items/{itemId}"
            if (orderId) {
              salesItems.push({
                id: docSnap.id,
                orderId,
                ...data
              });
            }
          }
        });
        console.log(`Successfully loaded ${salesItems.length} items from collectionGroup items.`);
      } catch (grpErr) {
        console.warn("CollectionGroup items query failed or unauthorized, running manual order subcollection scanner fallback...", grpErr);
        
        let ordersToScan = [...rawOrders];
        // Ensure we have a decent history set of orders
        if (ordersToScan.length < 5) {
          try {
            const fallbackQ = query(collection(db, "orders"), orderBy("created_at", "desc"), limit(150));
            const fallbackSnap = await getDocs(fallbackQ);
            const fetchedOrders = fallbackSnap.docs.map(d => ({ id: d.id, ...d.data() } as any));
            fetchedOrders.forEach(fo => {
              if (!ordersToScan.some(o => o.id === fo.id)) {
                ordersToScan.push(fo);
              }
            });
          } catch (fallbackErr) {
            console.warn("Fallback query for orders failed:", fallbackErr);
          }
        }

        // Scan ALL orders that are likely to contain our service name or ID
        const candidateOrders = ordersToScan.filter(o => {
          // If items_summary is empty or invalid, scan it anyway to avoid missing items
          if (!o.items_summary || typeof o.items_summary !== 'string') return true;
          const normSummary = o.items_summary.toLowerCase();
          const normItemName = item.name.toLowerCase();
          return normSummary.includes(normItemName);
        });

        const fetchItemsPromises = candidateOrders.map(async (order) => {
          try {
            const itemsSnap = await getDocs(collection(db, "orders", order.id, "items"));
            itemsSnap.forEach(docSnap => {
              const data = docSnap.data();
              if (data.service_id === item.id) {
                salesItems.push({
                  id: docSnap.id,
                  orderId: order.id,
                  ...data
                });
              }
            });
          } catch (err) {
            console.error(`Error loading items for order ${order.id}:`, err);
          }
        });
        await Promise.all(fetchItemsPromises);
      }

      // 3. Resolve matched orders (fetch if not in-memory)
      const uniqueOrderIds = Array.from(new Set(salesItems.map(si => si.orderId)));
      const resolvedOrdersMap: { [orderId: string]: any } = {};

      // Match with current rawOrders list first
      uniqueOrderIds.forEach(orderId => {
        const match = rawOrders.find(o => o.id === orderId);
        if (match) {
          resolvedOrdersMap[orderId] = {
            ...match,
            customer_name: customers.find(c => c.id === match.customer_id)?.name || 'Unknown'
          };
        }
      });

      // For any missing orders, fetch them directly from Firestore in parallel
      const missingOrderIds = uniqueOrderIds.filter(id => !resolvedOrdersMap[id]);
      if (missingOrderIds.length > 0) {
        const fetchPromises = missingOrderIds.map(async (orderId) => {
          try {
            const orderDoc = await getDoc(doc(db, "orders", orderId));
            if (orderDoc.exists()) {
              const orderData = orderDoc.data();
              const customerId = orderData.customer_id;
              const customerMatch = customers.find(c => c.id === customerId);
              let custName = 'Unknown';
              if (customerMatch) {
                custName = customerMatch.name;
              } else if (customerId) {
                const custDoc = await getDoc(doc(db, "customers", customerId));
                if (custDoc.exists()) {
                  custName = custDoc.data().name || 'Unknown';
                }
              }
              resolvedOrdersMap[orderId] = {
                id: orderDoc.id,
                ...orderData,
                customer_name: custName
              };
            }
          } catch (err) {
            console.error(`Error loading order ${orderId}:`, err);
          }
        });
        await Promise.all(fetchPromises);
      }

      // 4. Map and compile Sold history
      const compiledSales = salesItems.map(si => {
        const matchedOrder = resolvedOrdersMap[si.orderId];
        return {
          id: si.id,
          date: matchedOrder?.created_at || null,
          type: 'Sold',
          details: matchedOrder?.customer_name || 'Unknown Customer',
          orderId: `#${String(si.orderId).substring(0, 6).toUpperCase()}`,
          rawOrderId: si.orderId,
          amount: -(si.quantity || 0),
          unitPrice: si.price_at_time || si.price || 0,
          staff: matchedOrder?.assigned_staff_username || 'System',
          status: matchedOrder?.status || 'completed',
          payment_status: matchedOrder?.payment_status || 'unpaid'
        };
      });

      // 5. Map Inventory Updates (restock, adjustment, etc.)
      const compiledLogs = fetchedLogs.map(log => ({
        id: log.id,
        date: log.created_at,
        type: log.type === 'restock' ? 'Restock' : 'Adjustment',
        details: 'Inventory Update',
        orderId: '-',
        rawOrderId: null,
        amount: log.amount,
        unitPrice: 0,
        staff: log.staff_name || 'System',
        status: 'completed',
        payment_status: 'paid'
      }));

      // Combine both lists and sort by date desc
      const combinedHistory = [...compiledSales, ...compiledLogs].sort((a, b) => {
        const tA = a.date?.toMillis?.() || a.date?.toDate?.()?.getTime() || (a.date ? new Date(a.date).getTime() : 0) || 0;
        const tB = b.date?.toMillis?.() || b.date?.toDate?.()?.getTime() || (b.date ? new Date(b.date).getTime() : 0) || 0;
        return tB - tA;
      });

      // Create summarized stats from the full history
      const totalUsage = salesItems.reduce((sum, si) => sum + (si.quantity || 0), 0);
      const revenueGenerated = compiledSales
        .filter(cs => cs.payment_status === 'paid')
        .reduce((sum, cs) => sum + (Math.abs(cs.amount) * cs.unitPrice), 0);
      const timesRequested = salesItems.length;

      setDetailedHistory(combinedHistory);
      setDetailedStats({
        stock: item.stock || 0,
        totalUsage,
        revenueGenerated,
        timesRequested
      });

    } catch (error) {
      console.error("Error loading comprehensive details:", error);
      showNotification("Failed to load historical database information", "error");
    } finally {
      setDetailedHistoryLoading(false);
    }
  };

  useEffect(() => {
    if (selectedAnalyticsItem) {
      loadDetailedHistory(selectedAnalyticsItem);
    } else {
      setDetailedHistory([]);
    }
  }, [selectedAnalyticsItem?.id]);
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState<{ message: string, type: 'success' | 'error' | 'info' } | null>(null);
  const [appNotifications, setAppNotifications] = useState<AppNotification[]>([]);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
  // Finance States
  const [finances, setFinances] = useState<{expenses: Expense[], funding: Funding[], payments: Payment[]}>({expenses: [], funding: [], payments: []});
  const [financeSubTab, setFinanceSubTab] = useState<'records' | 'approvals'>('records');

  const combinedInflows = useMemo(() => {
    const fundingInflows = (finances.funding || []).map(f => {
      const d = f.created_at?.toDate ? f.created_at.toDate() : (f.created_at ? new Date(f.created_at) : new Date());
      return {
        id: f.id,
        type: 'funding',
        source: f.source || 'Capital Funding',
        amount: f.amount || 0,
        recorded_by: f.recorder_name || 'System',
        date: d,
        created_at: f.created_at
      };
    });

    const paymentInflows = (finances.payments || []).map(p => {
      const d = p.created_at?.toDate ? p.created_at.toDate() : (p.created_at ? new Date(p.created_at) : new Date());
      const order = orders.find(o => o.id === p.order_id);
      const customerSuffix = order ? ` - ${order.customer_name}` : '';
      const source = `Payment/Cleared Debt for Order #${String(p.order_id).substring(0, 8).toUpperCase()}${customerSuffix} [${p.method || 'Cash'}]`;
      return {
        id: p.id,
        type: 'payment',
        source: source,
        amount: p.amount || 0,
        recorded_by: p.recorded_by || 'System',
        date: d,
        created_at: p.created_at
      };
    });

    const allInflows = [...fundingInflows, ...paymentInflows];
    allInflows.sort((a, b) => b.date.getTime() - a.date.getTime());
    return allInflows;
  }, [finances.funding, finances.payments, orders]);
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
  const [isFundingModalOpen, setIsFundingModalOpen] = useState(false);
  const [newExpense, setNewExpense] = useState<{
    item: string;
    amount: number;
    category: string;
    staff_id?: string;
    staff_name?: string;
    transport_from?: string;
    transport_to?: string;
  }>({ item: '', amount: 0, category: 'Materials', staff_id: '', staff_name: '' });
  const [selectedPendingExpenses, setSelectedPendingExpenses] = useState<string[]>([]);
  const [isEditingStaff, setIsEditingStaff] = useState(false);
  const [isDebtRecoveryModalOpen, setIsDebtRecoveryModalOpen] = useState(false);
  const [debtRecoveryModalTitle, setDebtRecoveryModalTitle] = useState('');
  const [debtRecoveryModalPayments, setDebtRecoveryModalPayments] = useState<any[]>([]);
  const [editStaffData, setEditStaffData] = useState({ full_name: '', username: '', email: '', position: '', role: 'operator' as Role });
  const [isEditingOrder, setIsEditingOrder] = useState(false);
  const [editOrderData, setEditOrderData] = useState({ customer_name: '', description: '', total_amount: 0, assigned_staff_id: '', assigned_staff_username: '', status: '' });
  const [newFunding, setNewFunding] = useState({ source: '', amount: 0 });

  const [isRestockModalOpen, setIsRestockModalOpen] = useState(false);
  const [selectedRestockItem, setSelectedRestockItem] = useState<any | null>(null);
  const [restockAmount, setRestockAmount] = useState(0);

  // Modal States
  const [isStaffModalOpen, setIsStaffModalOpen] = useState(false);
  const [isServiceModalOpen, setIsServiceModalOpen] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState<User | null>(null);
  const [lastTestCodeSent, setLastTestCodeSent] = useState<{ [staffId: string]: string }>({});
  const [isStaffDetailModalOpen, setIsStaffDetailModalOpen] = useState(false);
  const [isQuotationModalOpen, setIsQuotationModalOpen] = useState(false);
  const [editingQuotationId, setEditingQuotationId] = useState<string | null>(null);
  const [quotationSearch, setQuotationSearch] = useState('');
  const [activeQuoteDropdownId, setActiveQuoteDropdownId] = useState<string | null>(null);
  const [quotationStartDate, setQuotationStartDate] = useState('');
  const [quotationEndDate, setQuotationEndDate] = useState('');
  const [isCustomerModalOpen, setIsCustomerModalOpen] = useState(false);
  
  // Converted & Deposit Edit Modal States
  const [isConvertModalOpen, setIsConvertModalOpen] = useState(false);
  const [selectedQuoteForConvert, setSelectedQuoteForConvert] = useState<Quotation | null>(null);
  const [selectedDesignerForConvert, setSelectedDesignerForConvert] = useState<string>('');
  const [convertDepositValue, setConvertDepositValue] = useState<number>(0);
  
  const [isDepositModalOpen, setIsDepositModalOpen] = useState(false);
  const [selectedQuoteForDeposit, setSelectedQuoteForDeposit] = useState<Quotation | null>(null);
  const [tempDepositValue, setTempDepositValue] = useState<number>(0);

  const [serviceSearchTerm, setServiceSearchTerm] = useState('');
  const [debtStartDate, setDebtStartDate] = useState('');
  const [debtEndDate, setDebtEndDate] = useState('');
  const [analyticsSearchTerm, setAnalyticsSearchTerm] = useState('');
  const [selectedServiceId, setSelectedServiceId] = useState<string | null>(null);
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean, 
    title: string, 
    message: string, 
    onConfirm: (selectedId?: string) => void,
    selectionOptions?: {id: string, label: string}[]
  } | null>(null);
  const [newPassword, setNewPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [customerSearch, setCustomerSearch] = useState('');
  // Purchase Ledger States
  const [purchaseSearch, setPurchaseSearch] = useState('');
  const [purchaseStartDate, setPurchaseStartDate] = useState('');
  const [purchaseEndDate, setPurchaseEndDate] = useState('');
  const [newPurchase, setNewPurchase] = useState({ item: '', country: '', unitPrice: '', quantity: '' });
  
  const [newCustomer, setNewCustomer] = useState({ name: '', phone: '', address: '' });
  const [newService, setNewService] = useState({ 
    name: '', price: 0, category: 'General', description: '', unitCost: 0, 
    cost_material: 0, cost_labor: 0, cost_transportation: 0, cost_power: 0, cost_taxes: 0, cost_others: 0,
    stock: 0, minStock: 10, unit: 'pcs' 
  });
  const [usdRateValue, setUsdRateValue] = useState(usdRate.toString());
  const [customLogoUrl, setCustomLogoUrl] = useState<string | null>(null);
  const [tenantName, setTenantName] = useState(() => localStorage.getItem('active_tenant_name') || 'Junub Printing');
  const [tenantCode, setTenantCode] = useState(() => localStorage.getItem('active_tenant_code') || 'junub');
  const [tenantsList, setTenantsList] = useState<any[]>([]);

  useEffect(() => {
    if (user) {
      const info = firebaseService.getTenantInfo();
      setTenantName(info.name || 'Junub Printing');
      setTenantCode(info.code || 'junub');
    }
  }, [user]);

  useEffect(() => {
    if (isMaster) {
      firebaseService.getTenants().then(setTenantsList);
    }
  }, [isMaster]);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [orderPayments, setOrderPayments] = useState<any[]>([]);
  const [paymentAmount, setPaymentAmount] = useState<number>(0);
  const [paymentMethod, setPaymentMethod] = useState<string>('Cash');
  const [isOrderDetailModalOpen, setIsOrderDetailModalOpen] = useState(false);
  const [deliveryQuantities, setDeliveryQuantities] = useState<{[itemId: string]: number}>({});
  const [isDeliveryNoteFormExpanded, setIsDeliveryNoteFormExpanded] = useState<boolean>(false);
  const [chatRecipient, setChatRecipient] = useState<User | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);
  const [discount, setDiscount] = useState(0);
  const [isDiscountRequestModalOpen, setIsDiscountRequestModalOpen] = useState(false);
  const [discountRequestAmount, setDiscountRequestAmount] = useState(0);
  const [discountRequestReason, setDiscountRequestReason] = useState('');
  const chatScrollRef = useRef<HTMLDivElement>(null);
  const [authChecked, setAuthChecked] = useState(false);
  const [deletedStaffList, setDeletedStaffList] = useState<any[]>([]);
  const [isScanningDeletedStaff, setIsScanningDeletedStaff] = useState(false);
  const [scannedDeletedStaffOnce, setScannedDeletedStaffOnce] = useState(false);
  const [isAppLocked, setIsAppLocked] = useState(false);
  const [isLowStockModalOpen, setIsLowStockModalOpen] = useState(false);
  const [isAdminLockedDown, setIsAdminLockedDown] = useState(false);
  const [showTerms, setShowTerms] = useState(false);

  useEffect(() => {
    if (!user) {
      setShowTerms(false);
      return;
    }

    // Master account bypass
    if (isMaster) {
      setShowTerms(false);
      return;
    }

    if (user.role !== 'admin') {
      setShowTerms(false);
      return;
    }

    const deviceAccepted = localStorage.getItem(`terms_accepted_${user.id}`);
    const adminGlobalAccept = user.terms_accepted;

    if (!deviceAccepted || !adminGlobalAccept) {
      setShowTerms(true);
    } else {
      setShowTerms(false);
    }
  }, [user]);

  const handleTermsAccept = async () => {
    if (!user) return;
    try {
      if (user.role === 'admin') {
        await firebaseService.acceptTerms(user.id);
        setUser({ ...user, terms_accepted: true });
      }
      localStorage.setItem(`terms_accepted_${user.id}`, 'true');
      setShowTerms(false);
      showNotification("Terms accepted. Welcome to the portal.", "success");
    } catch (err) {
      showNotification("Failed to save acceptance.", "error");
    }
  };

  useEffect(() => {
    if (!auth.currentUser) return;

    const checkLock = async () => {
      try {
        const locked = await firebaseService.isAppLocked();
        setIsAppLocked(locked);
        if (locked && !isMaster) {
          setIsAdminLockedDown(true);
        } else {
          setIsAdminLockedDown(false);
        }
      } catch (err) {
        console.error("Lock check error:", err);
      }
    };
    checkLock();
    
    const unsub = onSnapshot(doc(db, "settings", "app_lock"), (snap) => {
      const data = snap.data();
      if (data) {
        setIsAppLocked(!!data.locked);
        if (data.locked && !isMaster) {
          setIsAdminLockedDown(true);
        } else {
          setIsAdminLockedDown(false);
        }
      }
    }, (error) => {
      // Don't log master admin out or show scary errors for lock check
      if (error.code !== 'permission-denied') {
        console.error("App lock sync error:", error);
      }
    });

    return () => unsub();
  }, [user, auth.currentUser]);

  useEffect(() => {
    if (selectedOrder?.id) {
      firebaseService.getOrderPayments(selectedOrder.id)
        .then(setOrderPayments)
        .catch(err => {
          if (err.message?.includes('index is currently building')) {
            console.info("Firestore index is building, payments will appear in a few minutes.");
          } else {
            console.error(err);
          }
        });
      
      const remainingBalance = (selectedOrder.total_amount || 0) * (1 - (selectedOrder.discount || 0) / 100) - (selectedOrder.paid_amount || 0);
      setPaymentAmount(remainingBalance > 0 ? remainingBalance : 0);
      setPaymentMethod('Cash');
    } else {
      setOrderPayments([]);
      setPaymentAmount(0);
    }
  }, [selectedOrder?.id, selectedOrder?.paid_amount]);

  useEffect(() => {
    // Safety timeout: if auth state doesn't resolve in 10s, force it (likely logged out/error)
    const timer = setTimeout(() => {
      if (!authChecked) {
        console.warn("Auth check timed out, forcing ready state");
        setAuthChecked(true);
      }
    }, 10000);

    const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
      if (fbUser) {
        try {
          const userDoc = await getDoc(doc(db, "users", fbUser.uid));
          if (userDoc.exists()) {
            const data = userDoc.data() as User;
            setUser({ 
              id: userDoc.id, 
              ...data, 
              email: data.email || data.username || fbUser.email || "",
              role: (data.role || 'guest').toLowerCase() as any 
            } as User);
          } else {
            const isMaster = fbUser.email === "tekkisandereagan@gmail.com" || 
                             fbUser.email === "kulyakosukusandereagan@gmail.com" || 
                             fbUser.email === "junubposcenter@gmail.com";
            if (isMaster) {
              const masterAdminData = {
                username: fbUser.email || '',
                role: "admin",
                full_name: "Master Admin",
                staff_id: "MASTER",
                email: fbUser.email || '',
              };
              try {
                await setDoc(doc(db, "users", fbUser.uid), masterAdminData);
              } catch (setErr) {
                console.error("Failed to auto-create master user document:", setErr);
              }
              setUser({
                id: fbUser.uid,
                ...masterAdminData,
                role: 'admin'
              } as User);
            } else if (fbUser.email) {
              const lowerEmail = fbUser.email.toLowerCase().trim();
              let emailDoc = await getDoc(doc(db, "users", lowerEmail));
              if (!emailDoc.exists() && fbUser.email !== lowerEmail) {
                emailDoc = await getDoc(doc(db, "users", fbUser.email));
              }
              if (emailDoc.exists()) {
                const profile = emailDoc.data() as User;
                const profileId = emailDoc.id;
                const profileData = { ...profile, updated_at: serverTimestamp() };
                try {
                  await setDoc(doc(db, "users", fbUser.uid), profileData);
                  if (profileId !== fbUser.uid) {
                    await deleteDoc(doc(db, "users", profileId));
                  }
                } catch (migrateErr) {
                  console.error("Failed migrating user doc on auth change:", migrateErr);
                }
                setUser({ 
                  id: fbUser.uid, 
                  ...profileData, 
                  email: profileData.email || profileData.username || fbUser.email || "",
                  role: (profileData.role || 'guest').toLowerCase() as any 
                } as User);
              } else {
                const q = query(collection(db, "users"), where("email", "==", fbUser.email));
                const qSnapshot = await getDocs(q);
                if (!qSnapshot.empty) {
                  const profile = qSnapshot.docs[0].data() as User;
                  const profileId = qSnapshot.docs[0].id;
                  const profileData = { ...profile, updated_at: serverTimestamp() };
                  try {
                    await setDoc(doc(db, "users", fbUser.uid), profileData);
                    if (profileId !== fbUser.uid) {
                      await deleteDoc(doc(db, "users", profileId));
                    }
                  } catch (migrateErr) {
                    console.error("Failed migrating user doc on auth change via query:", migrateErr);
                  }
                  setUser({ 
                    id: fbUser.uid, 
                    ...profileData, 
                    email: profileData.email || profileData.username || fbUser.email || "",
                    role: (profileData.role || 'guest').toLowerCase() as any 
                  } as User);
                }
              }
            }
          }
        } catch (err) {
          console.error("Auth sync error:", err);
        }
      } else {
        setUser(null);
      }
      setAuthChecked(true);
      clearTimeout(timer);
    });
    return () => {
      unsubscribe();
      clearTimeout(timer);
    };
  }, []);

  // Real-time active session listener to prevent multiple device concurrent usage
  useEffect(() => {
    if (!user || !user.id) return;
    
    // Proactively sync all user mappings to username_map in the background
    firebaseService.syncAllUsersToUsernameMap();

    const userDocRef = doc(db, "users", user.id);
    const unsubscribe = onSnapshot(userDocRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data();
        
        // Handle race-condition ignore flag during login/verification transitions
        if (ignoreDeviceCheckRef.current) {
          if (data.current_device_id === device_id) {
            // Once the Firestore state catches up to this device's ID, safely clear the ignore flag
            ignoreDeviceCheckRef.current = false;
          }
          return;
        }

        if (data.current_device_id && data.current_device_id !== device_id) {
          // Log out this device because another device logged in
          setRawUser(null);
          signOut(auth);
          showNotification("Security logout: This account has been logged in on another device.", "error");
          alert("Security Notification: This account has been logged in on another device. You have been automatically logged out.");
        }
      }
    });
    return () => unsubscribe();
  }, [user?.id, device_id]);

  // 15-Minute Inactivity Auto-Logout Tracker
  const lastActivityRef = useRef(Date.now());
  useEffect(() => {
    if (!user) return;

    const resetTimer = () => {
      lastActivityRef.current = Date.now();
      localStorage.setItem('last_active_time', Date.now().toString());
    };

    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];
    events.forEach(event => window.addEventListener(event, resetTimer));

    const checkInterval = setInterval(() => {
      const lastActive = parseInt(localStorage.getItem('last_active_time') || lastActivityRef.current.toString(), 10);
      if (Date.now() - lastActive > 15 * 60 * 1000) { // 15 minutes of inactivity
        setRawUser(null);
        signOut(auth);
        showNotification("You have been logged out due to 15 minutes of inactivity.", "info");
        alert("You have been logged out due to 15 minutes of inactivity to protect your account.");
      }
    }, 10000); // Check every 10 seconds

    return () => {
      events.forEach(event => window.removeEventListener(event, resetTimer));
      clearInterval(checkInterval);
    };
  }, [user]);

  useEffect(() => {
    if (chatScrollRef.current) {
      chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
    }
  }, [messages]);

  // Real-time chat with onSnapshot
  useEffect(() => {
      if (activeTab === 'chat' && user && chatRecipient) {
        const unsubscribe = firebaseService.subscribeMessages(
          user.id, 
          user.email || '', 
          chatRecipient.id, 
          chatRecipient.email || '', 
          (msgs) => {
            setMessages(msgs);
          }
        );
        return () => unsubscribe();
      }
  }, [activeTab, user?.id, chatRecipient?.id, chatRecipient?.email]);

  const handleSendMessage = async () => {
    if (!chatInput.trim() || !user || !chatRecipient) return;
    const msg = chatInput.trim();
    setChatInput('');
    try {
      await firebaseService.sendMessage({
        sender_id: user.id,
        sender_email: user.email || '',
        receiver_id: chatRecipient.id,
        receiver_email: chatRecipient.email || null,
        message: msg
      });
    } catch (err) {
      showNotification('Message failed to send', 'error');
    }
  };

  // Form States (already defined above if needed, but these are the main ones used in forms)
  const [newStaff, setNewStaff] = useState({ fullName: '', username: '', email: '', position: '', role: 'operator' as Role, password: 'password123' });
  const [linkMaterial, setLinkMaterial] = useState({ materialId: '', amount: 0 });
  const [quotations, setQuotations] = useState<Quotation[]>([]);
  const [quotationData, setQuotationData] = useState({ 
    name: '', 
    phone: '',
    email: '',
    attn: '',
    address: 'Juba, South Sudan', 
    items: [] as any[], 
    quotNo: Math.floor(1000 + Math.random() * 9000).toString(), 
    date: new Date().toISOString().split('T')[0], 
    validityDays: 14,
    paymentTerms: '75% Deposit, 25% on Delivery',
    turnaroundDelivery: '3-5 working days',
    discountVal: 0,
    discountType: 'flat' as 'flat' | 'percent',
    taxRate: 0,
    notes: '1. Quotation is valid for 14 days from date of issue.\n2. 75% Advance payment is required; balance before collection.\n3. Turnaround delivery is 3-5 working days upon design approval.',
    deposit: 0
  });

  const [quoteItemServiceId, setQuoteItemServiceId] = useState('');
  const [quoteItemDesc, setQuoteItemDesc] = useState('');
  const [quoteItemQty, setQuoteItemQty] = useState(1);
  const [quoteItemPrice, setQuoteItemPrice] = useState(0);
  const [quoteItemUom, setQuoteItemUom] = useState('pcs');

  const [selectedReferrerId, setSelectedReferrerId] = useState('');
  const [assignedStaffId, setAssignedStaffId] = useState('');

  const addWatermark = (doc: any, width: number, height: number, logoBase64?: string) => {
    doc.saveGraphicsState();
    try {
      doc.setGState(new (doc as any).GState({ opacity: logoBase64 ? 0.05 : 0.1 }));
    } catch (e) {}
    
    const centerX = width / 2;
    const centerY = height / 2;
    
    if (logoBase64) {
      const size = Math.min(width, height) * 0.4;
      doc.addImage(logoBase64, 'PNG', centerX - size/2, centerY - size/2, size, size, undefined, 'NONE');
    } else {
      const size = Math.min(width, height) * 0.5;
      
      // Watermark Logo
      doc.setFillColor(245, 158, 11);
      doc.path([
        { op: 'm', c: [centerX - size/3, centerY + size/3] },
        { op: 'l', c: [centerX, centerY - size/2] },
        { op: 'l', c: [centerX + size/6, centerY + size/3] }
      ], 'F');
      doc.setFillColor(220, 38, 38);
      doc.path([
        { op: 'm', c: [centerX + size/10, centerY - size/3] },
        { op: 'c', c: [centerX + size/2, centerY - size/2, centerX + size/2, centerY + size/4, centerX + size/4, centerY + size/6] }
      ], 'F');
    }
    
    doc.restoreGraphicsState();
  };

  const drawArkLogo = (doc: any, x: number, y: number, scale: number = 1, isMonochrome: boolean = false) => {
    const size = 20 * scale;
    // Stylized "A" and "P" based on official logo
    if (isMonochrome) {
      doc.setFillColor(0, 0, 0); // Pure black
    } else {
      doc.setFillColor(245, 158, 11); // Orange
    }
    // Left leg of A
    doc.path([{ op: 'm', c: [x + size*0.1, y + size] }, { op: 'l', c: [x + size*0.45, y] }, { op: 'l', c: [x + size*0.55, y] }, { op: 'l', c: [x + size*0.25, y + size] }], 'F');
    // Middle bar of A
    doc.path([{ op: 'm', c: [x + size*0.3, y + size*0.65] }, { op: 'l', c: [x + size*0.6, y + size*0.65] }, { op: 'l', c: [x + size*0.6, y + size*0.75] }, { op: 'l', c: [x + size*0.25, y + size*0.75] }], 'F');
    
    if (isMonochrome) {
      doc.setFillColor(0, 0, 0); // Pure black
    } else {
      doc.setFillColor(220, 38, 38); // Red
    }
    // Stylized P loop
    doc.path([{ op: 'm', c: [x + size*0.5, y + size*0.1] }, { op: 'c', c: [x + size*1.2, y - size*0.2, x + size*1.2, y + size*0.8, x + size*0.6, y + size*0.55] }, { op: 'l', c: [x + size*0.6, y + size*0.25] }], 'F');
  };

  const getLogoBase64 = async (): Promise<{data: string, width: number, height: number}> => {
    try {
      // Use cached logo if available
      let logoSource = customLogoUrl;
      
      if (!logoSource) {
        // Fallback to fetch from settings if state is empty
        const settings = await firebaseService.getSettings();
        logoSource = settings.logo_base64 || '/logo.png';
      }
      
      let blob: Blob;
      const response = await fetch(logoSource, { cache: 'no-cache' });
      if (!response.ok) {
        // Ultimate fallback to local logo.png if everything failed
        if (logoSource !== '/logo.png') {
          const fallbackRes = await fetch('/logo.png');
          if (!fallbackRes.ok) return { data: '', width: 0, height: 0 };
          blob = await fallbackRes.blob();
        } else {
          return { data: '', width: 0, height: 0 };
        }
      } else {
        blob = await response.blob();
      }

      const base64: string = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });
      
      // Get dimensions and verify it's a valid image
      return new Promise((resolve) => {
        const img = new Image();
        img.onload = () => {
          resolve({ data: base64, width: img.naturalWidth, height: img.naturalHeight });
        };
        img.onerror = () => {
          console.error("Failed to decode logo image");
          resolve({ data: base64, width: 0, height: 0 });
        };
        img.src = base64;
      });
    } catch (e) {
      console.error("Logo fetch error:", e);
      return { data: '', width: 0, height: 0 };
    }
  };

  const generateDebtorsPDF = async () => {
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
      putOnlyUsedFonts: true,
      floatPrecision: 16
    });
    const pageWidth = doc.internal.pageSize.width;
    const pageHeight = doc.internal.pageSize.height;
    
    const { data: logoBase64, width: logoW, height: logoH } = await getLogoBase64();
    addWatermark(doc, pageWidth, pageHeight, logoBase64);
    addPDFFooter(doc, pageWidth, pageHeight);

    if (logoBase64 && logoW > 0) {
      const aspect = logoW / logoH;
      const displayW = 25;
      const displayH = displayW / aspect;
      doc.addImage(logoBase64, 'PNG', 10, 10, displayW, displayH, undefined, 'FAST');
    } else {
      drawArkLogo(doc, 10, 10, 0.8);
    }

    doc.setFont("helvetica", "bold");
    doc.setFontSize(22);
    doc.setTextColor(220, 38, 38);
    doc.text("ARK PRINTERS", 40, 18);
    
    doc.setFontSize(14);
    doc.setTextColor(51, 65, 85);
    doc.text("Outstanding Debts Report", 40, 26);

    doc.setFontSize(10);
    doc.text(`Generated on: ${new Date().toLocaleString()}`, 10, 45);

    const debtors = orders
      .filter(o => o.payment_status !== 'paid')
      .map(o => {
        const total = (o.total_amount || 0) * (1 - (o.discount || 0) / 100);
        const balance = total - (o.paid_amount || 0);
        const contact = customers.find(c => c.id === o.customer_id)?.phone || 'N/A';
        return [
          `#${String(o.id).substring(0, 8).toUpperCase()}`,
          o.customer_name,
          contact,
          formatDate(o.created_at).split(',')[0],
          formatCurrency(total),
          formatCurrency(o.paid_amount || 0),
          formatCurrency(balance),
          o.payment_status?.toUpperCase()
        ];
      });

    autoTable(doc, {
      startY: 50,
      head: [['Order ID', 'Customer', 'Contact', 'Date', 'Total', 'Paid', 'Balance', 'Status']],
      body: debtors,
      theme: 'grid',
      headStyles: { fillColor: [220, 38, 38], textColor: 255, fontStyle: 'bold' },
      styles: { fontSize: 8, cellPadding: 3 },
      columnStyles: {
        6: { fontStyle: 'bold', textColor: [220, 38, 38] }
      }
    });

    const finalY = (doc as any).lastAutoTable.finalY || 150;
    const totalDebt = orders
      .filter(o => {
        const isUnpaid = o.payment_status !== 'paid';
        if (!isUnpaid) return false;
        
        const orderDate = new Date(o.created_at);
        if (debtStartDate && orderDate < new Date(debtStartDate)) return false;
        if (debtEndDate && orderDate > new Date(debtEndDate)) return false;
        
        return true;
      })
      .reduce((sum, o) => {
          const total = (o.total_amount || 0) * (1 - (o.discount || 0) / 100);
          return sum + (total - (o.paid_amount || 0));
      }, 0);

    doc.setFontSize(12);
    doc.text(`Total Outstanding Debt: ${formatCurrency(totalDebt)}`, 140, finalY + 15, { align: 'right' });

    doc.save(`ARK_Debtors_Report_${new Date().toISOString().split('T')[0]}.pdf`);
  };

  const generateItemConsumptionPDF = async (item: Service, historyData?: any[]) => {
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
      putOnlyUsedFonts: true,
      floatPrecision: 16
    });
    const pageWidth = doc.internal.pageSize.width;
    const pageHeight = doc.internal.pageSize.height;
    
    const { data: logoBase64, width: logoW, height: logoH } = await getLogoBase64();
    addWatermark(doc, pageWidth, pageHeight, logoBase64);
    addPDFFooter(doc, pageWidth, pageHeight);

    if (logoBase64 && logoW > 0) {
      const aspect = logoW / logoH;
      const displayW = 25;
      const displayH = displayW / aspect;
      doc.addImage(logoBase64, 'PNG', 10, 10, displayW, displayH, undefined, 'NONE');
    } else {
      drawArkLogo(doc, 10, 10, 0.8);
    }

    doc.setFont("helvetica", "bold");
    doc.setFontSize(22);
    doc.setTextColor(220, 38, 38);
    doc.text("ARK PRINTERS", 40, 18);
    
    doc.setFontSize(14);
    doc.setTextColor(51, 65, 85);
    doc.text(`Item Consumption: ${item.name}`, 40, 26);

    doc.setFontSize(10);
    doc.text(`Category: ${item.category}`, 10, 45);
    doc.text(`Current Stock: ${item.stock} ${item.unit}`, 10, 50);
    doc.text(`Report Period: Full Cumulative History`, 10, 55);

    const sourceData = historyData || detailedHistory;

    const history = sourceData.map(log => {
      const formattedDate = formatDate(log.date || log.created_at).split(',')[0];
      const isSold = log.type === 'Sold';
      const changeStr = isSold ? `-${Math.abs(log.amount)}` : `+${log.amount}`;
      const unitValue = isSold ? log.unitPrice : 0;
      const totalCostValue = isSold ? (Math.abs(log.amount) * log.unitPrice) : 0;

      return [
        formattedDate,
        log.type || 'Sold',
        log.details || 'Inventory Update',
        log.orderId || '-',
        changeStr,
        unitValue > 0 ? formatCurrency(unitValue) : '-',
        totalCostValue > 0 ? formatCurrency(totalCostValue) : '-'
      ];
    });

    autoTable(doc, {
      startY: 65,
      head: [['Date', 'Type', 'Customer/Source', 'Order ID', 'Qty Change', 'Unit Price', 'Total']],
      body: history,
      theme: 'grid',
      headStyles: { fillColor: [51, 65, 85], textColor: 255 },
      styles: { fontSize: 8 }
    });

    doc.save(`ARK_Item_Analytics_${item.name.replace(/\s+/g, '_')}.pdf`);
  };

  const generateStaffPerformancePDF = async (
    staffUser: any,
    jobs: any[],
    expenses: any[],
    referrals: any[]
  ) => {
    setLoading(true);
    try {
      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
        putOnlyUsedFonts: true,
        floatPrecision: 16
      });
      const pageWidth = doc.internal.pageSize.width;
      const pageHeight = doc.internal.pageSize.height;
      
      const { data: logoBase64, width: logoW, height: logoH } = await getLogoBase64();
      addWatermark(doc, pageWidth, pageHeight, logoBase64);
      addPDFFooter(doc, pageWidth, pageHeight);

      if (logoBase64 && logoW > 0) {
        const aspect = logoW / logoH;
        const displayW = 25;
        const displayH = displayW / aspect;
        doc.addImage(logoBase64, 'PNG', 10, 10, displayW, displayH, undefined, 'FAST');
      } else {
        drawArkLogo(doc, 10, 10, 0.8);
      }

      doc.setFont("helvetica", "bold");
      doc.setFontSize(22);
      doc.setTextColor(220, 38, 38);
      doc.text("ARK PRINTERS", 40, 18);
      
      doc.setFontSize(14);
      doc.setTextColor(51, 65, 85);
      doc.text("Staff Performance & Productivity Report", 40, 26);

      // Staff Details card in PDF
      doc.setFontSize(10);
      doc.setTextColor(51, 65, 85);
      doc.setFont("helvetica", "bold");
      doc.text("STAFF MEMBER DETAILS:", 10, 45);
      doc.setFont("helvetica", "normal");
      doc.text(`Full Name: ${staffUser.full_name}`, 10, 51);
      doc.text(`Username: @${staffUser.username}`, 10, 56);
      doc.text(`Role/Title: ${staffUser.role}`, 10, 61);

      doc.setFont("helvetica", "bold");
      doc.text("REPORT PERIOD:", 110, 45);
      doc.setFont("helvetica", "normal");
      doc.text(`Period: ${filterDateRange.start || 'Beginning'} to ${filterDateRange.end || 'Present'}`, 110, 51);
      doc.text(`Exported On: ${new Date().toLocaleString()}`, 110, 56);

      // Horizontal separator line
      doc.setDrawColor(226, 232, 240);
      doc.setLineWidth(0.5);
      doc.line(10, 66, pageWidth - 10, 66);

      // Calculations
      const finishedJobs = jobs.filter(o => o.status === 'completed' || o.status === 'paid').length;
      const pendingJobs = jobs.filter(o => o.status !== 'completed' && o.status !== 'paid' && o.status !== 'cancelled').length;
      const completionRate = jobs.length > 0 ? Math.round((finishedJobs / jobs.length) * 100) : 0;
      const totalExpenses = expenses.filter(e => e.status !== 'rejected').reduce((sum, e) => sum + e.amount, 0);
      const totalCommPaid = referrals.filter(o => o.status === 'paid' || o.payment_status === 'paid').reduce((sum, o) => sum + (o.commission_amount || 0), 0);
      const totalCommPending = referrals.filter(o => o.status !== 'paid' && o.payment_status !== 'paid').reduce((sum, o) => sum + (o.commission_amount || 0), 0);

      // KPI box row in PDF
      doc.setFillColor(248, 250, 252);
      doc.roundedRect(10, 71, pageWidth - 20, 24, 3, 3, 'F');

      doc.setFont("helvetica", "bold");
      doc.setFontSize(8);
      doc.setTextColor(100, 116, 139);
      doc.text("JOBS INVOLVED", 15, 77);
      doc.text("COMPLETION RATE", 65, 77);
      doc.text("EXPENSES DETECTED", 115, 77);
      doc.text("TOTAL REFERRALS", 160, 77);

      doc.setFontSize(11);
      doc.setTextColor(15, 23, 42);
      doc.text(`${jobs.length} Jobs (${finishedJobs} Done / ${pendingJobs} Pend)`, 15, 84);
      doc.setTextColor(16, 185, 129); // emerald
      doc.text(`${completionRate}%`, 65, 84);
      doc.setTextColor(225, 29, 72); // rose
      doc.text(formatCurrency(totalExpenses), 115, 84);
      doc.setTextColor(139, 92, 246); // violet
      doc.text(`${referrals.length} (${formatCurrency(totalCommPaid + totalCommPending)})`, 160, 84);

      let currentY = 103;

      // TABLE 1: JOBS list
      doc.setFont("helvetica", "bold");
      doc.setFontSize(10);
      doc.setTextColor(30, 41, 59);
      doc.text("1. ASSIGNED JOBS & WORK ORDERS WEEKLY/DAILY SUMMARY", 10, currentY);
      currentY += 4;

      const jobRows = jobs.map(o => {
        const finished = o.status === 'completed' || o.status === 'paid';
        return [
          `#${String(o.id).substring(0, 6).toUpperCase()}`,
          formatDate(o.created_at).split(',')[0],
          o.customer_name || 'N/A',
          o.items_summary || (o.items?.map((oi: any) => oi.service_name).join(', ')) || 'No summary',
          finished ? 'Finished' : (o.status?.replace('_', ' ') || 'Pending'),
          (o.payment_status || 'unpaid').toUpperCase(),
          formatCurrency(o.total_amount || 0)
        ];
      });

      autoTable(doc, {
        startY: currentY,
        head: [['Order ID', 'Date', 'Customer', 'Service Details', 'Status', 'Payment', 'Job Value']],
        body: jobRows.length > 0 ? jobRows : [['-', '-', 'No registered tasks in this period.', '-', '-', '-', '-']],
        theme: 'grid',
        headStyles: { fillColor: [51, 65, 85], textColor: 255 },
        styles: { fontSize: 7, cellPadding: 2 },
        margin: { left: 10, right: 10 }
      });

      currentY = (doc as any).lastAutoTable?.finalY + 12 || currentY + 20;

      // Adjust height check for next section to prevent orphan titles
      if (currentY > pageHeight - 50) {
        doc.addPage();
        addWatermark(doc, pageWidth, pageHeight, logoBase64);
        addPDFFooter(doc, pageWidth, pageHeight);
        currentY = 20;
      }

      // TABLE 2: EXPENSES list
      doc.setFont("helvetica", "bold");
      doc.setFontSize(10);
      doc.setTextColor(30, 41, 59);
      doc.text("2. FILED EXPENSES UNDER EMPLOYEE NAME", 10, currentY);
      currentY += 4;

      const expenseRows = expenses.map(exp => [
        formatDate(exp.created_at).split(',')[0],
        exp.item || 'N/A',
        exp.category || 'N/A',
        (exp.status || 'pending').toUpperCase(),
        formatCurrency(exp.amount || 0)
      ]);

      autoTable(doc, {
        startY: currentY,
        head: [['Date', 'Expense Item Title', 'Category', 'Status', 'Amount']],
        body: expenseRows.length > 0 ? expenseRows : [['-', 'No expenses filed in employee name.', '-', '-', '-']],
        theme: 'grid',
        headStyles: { fillColor: [190, 24, 74], textColor: 255 }, // Dark rose
        styles: { fontSize: 7, cellPadding: 2 },
        margin: { left: 10, right: 10 }
      });

      currentY = (doc as any).lastAutoTable?.finalY + 12 || currentY + 20;

      if (currentY > pageHeight - 50) {
        doc.addPage();
        addWatermark(doc, pageWidth, pageHeight, logoBase64);
        addPDFFooter(doc, pageWidth, pageHeight);
        currentY = 20;
      }

      // TABLE 3: REFERRALS list
      doc.setFont("helvetica", "bold");
      doc.setFontSize(10);
      doc.setTextColor(30, 41, 59);
      doc.text("3. CLIENT REFERRAL PIPELINE & EARNED COMMISSIONS", 10, currentY);
      currentY += 4;

      const referralRows = referrals.map(refOrd => {
        const isPaid = refOrd.payment_status === 'paid' || refOrd.status === 'paid';
        return [
          `#${String(refOrd.id).substring(0, 6).toUpperCase()}`,
          formatDate(refOrd.created_at).split(',')[0],
          refOrd.customer_name || 'N/A',
          (refOrd.status || 'pending').toUpperCase(),
          isPaid ? 'PAID' : 'UNPAID',
          formatCurrency(refOrd.commission_amount || 0)
        ];
      });

      autoTable(doc, {
        startY: currentY,
        head: [['Order ID', 'Date Referred', 'Referred Client', 'Work Status', 'Payment Status', 'Commission']],
        body: referralRows.length > 0 ? referralRows : [['-', '-', 'No referred deals discovered.', '-', '-', '-']],
        theme: 'grid',
        headStyles: { fillColor: [109, 40, 217], textColor: 255 }, // Violet
        styles: { fontSize: 7, cellPadding: 2 },
        margin: { left: 10, right: 10 }
      });

      doc.save(`ARK_Staff_Performance_${staffUser.full_name.replace(/\s+/g, '_')}_${filterDateRange.start}_to_${filterDateRange.end}.pdf`);
      showNotification('Staff performance report generated successfully!', 'success');
    } catch (err) {
      console.error("Error generating staff PDF:", err);
      showNotification('Failed to generate staff performance PDF. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const generateExpensesPDF = async () => {
    setLoading(true);
    try {
      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
        putOnlyUsedFonts: true,
        floatPrecision: 16
      });
      const pageWidth = doc.internal.pageSize.width;
      const pageHeight = doc.internal.pageSize.height;
      
      const { data: logoBase64, width: logoW, height: logoH } = await getLogoBase64();
      addWatermark(doc, pageWidth, pageHeight, logoBase64);
      addPDFFooter(doc, pageWidth, pageHeight);

      if (logoBase64 && logoW > 0) {
        const aspect = logoW / logoH;
        const displayW = 25;
        const displayH = displayW / aspect;
        doc.addImage(logoBase64, 'PNG', 10, 10, displayW, displayH, undefined, 'FAST');
      } else {
        drawArkLogo(doc, 10, 10, 0.8);
      }

      doc.setFont("helvetica", "bold");
      doc.setFontSize(22);
      doc.setTextColor(220, 38, 38);
      doc.text("ARK PRINTERS", 40, 18);
      
      doc.setFontSize(14);
      doc.setTextColor(51, 65, 85);
      doc.text("Expenses Report", 40, 26);

      doc.setFontSize(10);
      doc.text(`Period: ${filterDateRange.start} to ${filterDateRange.end}`, 10, 45);
      doc.text(`Generated on: ${new Date().toLocaleString()}`, 10, 50);

      const filteredExpenses = (finances.expenses || []).filter(e => {
        if (!e) return false;
        if (!(e as any).created_at) return true;
        const d = (e as any).created_at?.toDate ? (e as any).created_at.toDate() : new Date((e as any).created_at);
        return d >= new Date(filterDateRange.start) && d <= new Date(new Date(filterDateRange.end).setHours(23, 59, 59, 999));
      });

      if (filteredExpenses.length === 0) {
        showNotification('No expenses found for the selected period.', 'info');
        setLoading(false);
        return;
      }

      const expenseRows = filteredExpenses.map(e => [
        e.item || 'N/A',
        formatCurrency(e.amount),
        e.category || 'N/A',
        e.approver_name || 'System',
        formatDate(e.created_at).split(',')[0],
        (e.status || 'pending').toUpperCase()
      ]);

      autoTable(doc, {
        startY: 60,
        head: [['Item Name', 'Amount', 'Category', 'Approver', 'Date', 'Status']],
        body: expenseRows,
        headStyles: { fillColor: [220, 38, 38] },
        margin: { top: 60 },
        theme: 'grid'
      });

      const total = filteredExpenses
        .filter(e => e.status !== 'rejected')
        .reduce((sum, e) => sum + (e.amount || 0), 0);
      const finalY = (doc as any).lastAutoTable?.finalY || 60;

      doc.setFont("helvetica", "bold");
      doc.setFontSize(12);
      doc.text(`TOTAL EXPENSES: ${formatCurrency(total)}`, pageWidth - 80, finalY + 15);

      doc.save(`Expenses_Report_${filterDateRange.start}_to_${filterDateRange.end}.pdf`);
      showNotification('Expenses report exported successfully!', 'success');
    } catch (err) {
      console.error("Error exporting expenses PDF:", err);
      showNotification('Failed to generate expenses PDF. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const generateDebtRecoveryPDF = async (title: string, payments: any[]) => {
    setLoading(true);
    try {
      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
        putOnlyUsedFonts: true,
        floatPrecision: 16
      });
      const pageWidth = doc.internal.pageSize.width;
      const pageHeight = doc.internal.pageSize.height;
      
      const { data: logoBase64, width: logoW, height: logoH } = await getLogoBase64();
      addWatermark(doc, pageWidth, pageHeight, logoBase64);
      addPDFFooter(doc, pageWidth, pageHeight);

      if (logoBase64 && logoW > 0) {
        const aspect = logoW / logoH;
        const displayW = 25;
        const displayH = displayW / aspect;
        doc.addImage(logoBase64, 'PNG', 10, 10, displayW, displayH, undefined, 'FAST');
      } else {
        drawArkLogo(doc, 10, 10, 0.8);
      }

      doc.setFont("helvetica", "bold");
      doc.setFontSize(20);
      doc.setTextColor(13, 148, 136); // Teal-600
      doc.text("ARK PRINTERS", 40, 18);
      
      doc.setFontSize(13);
      doc.setTextColor(51, 65, 85);
      doc.text("Debt Recovery & Clearance Report", 40, 25);

      doc.setFontSize(9);
      doc.setTextColor(100, 116, 139);
      doc.text(`Period / Label: ${title}`, 10, 42);
      doc.text(`Generated on: ${new Date().toLocaleString()}`, 10, 47);

      // Summary table
      const totalRecovered = payments.reduce((sum, p) => sum + (p.amount || 0), 0);
      const summaryRows = [
        ["Total Recovery Transactions", payments.length.toString()],
        ["Total Recovered Amount", formatCurrency(totalRecovered)]
      ];

      doc.setFontSize(11);
      doc.setTextColor(13, 148, 136);
      doc.text("RECOVERY SUMMARY", 10, 58);

      autoTable(doc, {
        startY: 62,
        head: [['Summary Metric', 'Value']],
        body: summaryRows,
        headStyles: { fillColor: [13, 148, 136] }, // Teal color
        theme: 'grid',
        styles: { fontSize: 10, fontStyle: 'bold' }
      });

      // Ledger details
      doc.setFontSize(11);
      doc.setTextColor(13, 148, 136);
      doc.text("CLEARANCE LEDGER DETAILS", 10, (doc as any).lastAutoTable.finalY + 12);

      const tableRows = payments.map(p => {
        const dateStr = p.dateObj ? p.dateObj.toLocaleString() : '';
        const orderIdDisplay = p.order ? (p.order.job_order_id || '#' + String(p.order.id).substring(0, 6).toUpperCase()) : `#${String(p.order_id).substring(0, 6).toUpperCase()}`;
        const customerNameDisplay = p.order ? p.order.customer_name : 'Unknown Customer';
        return [
          dateStr,
          `${customerNameDisplay} (${orderIdDisplay})`,
          p.recorded_by || 'System',
          p.method || 'Cash',
          formatCurrency(p.amount)
        ];
      });

      autoTable(doc, {
        startY: (doc as any).lastAutoTable.finalY + 16,
        head: [['Clearance Timestamp', 'Client / Order', 'Recorded By', 'Method', 'Recovered Amount']],
        body: tableRows,
        headStyles: { fillColor: [51, 65, 85] }, // Dark Slate color
        theme: 'striped',
        styles: { fontSize: 9 }
      });

      doc.save(`Debt_Recovery_Report_${title.replace(/\s+/g, '_')}.pdf`);
      showNotification('Debt recovery PDF generated successfully!', 'success');
    } catch (err) {
      console.error("Error exporting debt recovery PDF:", err);
      showNotification('Failed to generate debt recovery PDF. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const openDebtRecoveryDetails = (title: string, start: Date, end: Date) => {
    const recoveredPayments = (finances.payments || [])
      .map(p => {
        const d = p.created_at?.toDate ? p.created_at.toDate() : (p.created_at ? new Date(p.created_at) : new Date());
        const order = orders.find(o => o.id === p.order_id);
        return {
          ...p,
          dateObj: d,
          order
        };
      })
      .filter(p => {
        if (!(p.dateObj >= start && p.dateObj <= end)) return false;
        if (!p.order) return false;
        const oDate = p.order.created_at?.toDate ? p.order.created_at.toDate() : new Date(p.order.created_at);
        return isRecoveredDebtPayment(p.dateObj, oDate);
      })
      .sort((a, b) => b.dateObj.getTime() - a.dateObj.getTime());

    setDebtRecoveryModalTitle(title);
    setDebtRecoveryModalPayments(recoveredPayments);
    setIsDebtRecoveryModalOpen(true);
  };

  const generateGeneralReportPDF = async () => {
    setLoading(true);
    try {
      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
        putOnlyUsedFonts: true,
        floatPrecision: 16
      });
      const pageWidth = doc.internal.pageSize.width;
      const pageHeight = doc.internal.pageSize.height;
      
      const { data: logoBase64, width: logoW, height: logoH } = await getLogoBase64();
      addWatermark(doc, pageWidth, pageHeight, logoBase64);
      addPDFFooter(doc, pageWidth, pageHeight);

      if (logoBase64 && logoW > 0) {
        const aspect = logoW / logoH;
        const displayW = 25;
        const displayH = displayW / aspect;
        doc.addImage(logoBase64, 'PNG', 10, 10, displayW, displayH, undefined, 'FAST');
      } else {
        drawArkLogo(doc, 10, 10, 0.8);
      }

      doc.setFont("helvetica", "bold");
      doc.setFontSize(22);
      doc.setTextColor(220, 38, 38);
      doc.text("ARK PRINTERS", 40, 18);
      
      doc.setFontSize(14);
      doc.setTextColor(51, 65, 85);
      doc.text("General Performance Report", 40, 26);

      doc.setFontSize(10);
      doc.text(`Period: ${filterDateRange.start} to ${filterDateRange.end}`, 10, 45);
      doc.text(`Generated on: ${new Date().toLocaleString()}`, 10, 50);

      // Period Performance Snapshot
      const start = new Date(filterDateRange.start);
      const end = new Date(new Date(filterDateRange.end).setHours(23, 59, 59, 999));

      const periodJobs = orders.filter(o => {
        const d = o.created_at?.toDate ? o.created_at.toDate() : new Date(o.created_at);
        return d >= start && d <= end;
      });
      const periodSalesTotal = finances.payments.filter(p => {
        const d = p.created_at?.toDate ? p.created_at.toDate() : new Date(p.created_at);
        return d >= start && d <= end;
      }).reduce((sum, p) => sum + (p.amount || 0), 0);
      const periodFundingTotal = finances.funding.filter(f => {
        const d = f.created_at?.toDate ? f.created_at.toDate() : new Date(f.created_at);
        return d >= start && d <= end;
      }).reduce((sum, f) => sum + (f.amount || 0), 0);
      const periodExpensesTotal = finances.expenses.filter(e => {
        const d = e.created_at?.toDate ? e.created_at.toDate() : new Date(e.created_at);
        return d >= start && d <= end && e.status === 'approved';
      }).reduce((sum, e) => sum + (e.amount || 0), 0);

      const performanceSnapshot = [
        ["Jobs Received (Period)", periodJobs.length.toString()],
        ["Sales (Period Collections)", formatCurrency(periodSalesTotal)],
        ["Total Funding (Period)", formatCurrency(periodFundingTotal)],
        ["Expenses (Period)", formatCurrency(periodExpensesTotal)],
        ["Net Cash (Period)", formatCurrency((periodSalesTotal + periodFundingTotal) - periodExpensesTotal)]
      ];

      doc.setFontSize(12);
      doc.setTextColor(220, 38, 38);
      doc.text("PERIOD PERFORMANCE SNAPSHOT", 10, 65);

      autoTable(doc, {
        startY: 70,
        head: [['Metric', 'Value']],
        body: performanceSnapshot,
        headStyles: { fillColor: [220, 38, 38] },
        theme: 'grid',
        styles: { fontSize: 10 }
      });

      const periodExpenses = finances.expenses.filter(e => {
        const expDate = e.created_at?.toDate ? e.created_at.toDate() : new Date(e.created_at);
        if (filterDateRange.start && expDate < new Date(filterDateRange.start)) return false;
        if (filterDateRange.end) {
          const end = new Date(filterDateRange.end);
          end.setHours(23, 59, 59, 999);
          if (expDate > end) return false;
        }
        return true;
      });

      // Period Summary Table
      const summaryData = [
        ["JOBS REGISTERED", stats?.jobsRegistered?.toString() || "0"],
        ["JOBS DONE AND PAID", stats?.jobsDoneAndPaid?.toString() || "0"],
        ["JOBS DONE AND UNPAID", stats?.jobsDoneAndUnpaid?.toString() || "0"],
        ["PENDING JOBS (Period)", stats?.pendingOrders?.toString() || "0"],
        ["UNPAID DEBTS (Strict Period)", formatCurrency(stats?.totalArrears || 0)],
        ["GROSS COLLECTIONS (Total Sales)", formatCurrency(stats?.dailySales || 0)],
        ["TOTAL FUNDINGS (Period)", formatCurrency(stats?.totalFunding || 0)],
        ["TOTAL EXPENSES (Period)", formatCurrency(stats?.totalExpenses || 0)],
        ["NET TOTAL CASH (In Period)", formatCurrency(stats?.totalCash || 0)]
      ];

      doc.setFontSize(12);
      doc.setTextColor(51, 65, 85);
      doc.text("PERIOD SUMMARY REPORT", 10, (doc as any).lastAutoTable.finalY + 15);

      autoTable(doc, {
        startY: (doc as any).lastAutoTable.finalY + 20,
        head: [['Key Performance Metric', 'Value']],
        body: summaryData,
        headStyles: { fillColor: [51, 65, 85] },
        theme: 'striped',
        styles: { fontSize: 10 }
      });

      // Top Staff Performance
      const sortedStaff = [...staffReports]
        .filter(u => u.role !== 'admin' && u.role !== 'receptionist')
        .sort((a, b) => (b.total_value || 0) - (a.total_value || 0))
        .slice(0, 5);

      if (sortedStaff.length > 0) {
        const staffData = sortedStaff.map(s => [
          s.full_name || s.username,
          s.role.toUpperCase(),
          (s.work_count || 0).toString(),
          formatCurrency(s.total_value || 0)
        ]);

        autoTable(doc, {
          startY: (doc as any).lastAutoTable.finalY + 15,
          head: [['Staff Member', 'Role', 'Work Units', 'Revenue Contribution']],
          body: staffData,
          headStyles: { fillColor: [220, 38, 38] },
          theme: 'grid',
          styles: { fontSize: 9 }
        });
      }

      doc.save(`General_Report_${filterDateRange.start}_to_${filterDateRange.end}.pdf`);
      showNotification('General report exported successfully!', 'success');
    } catch (err) {
      console.error("Error exporting general PDF:", err);
      showNotification('Failed to generate general report. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const addPDFFooter = (doc: jsPDF, pageWidth: number, pageHeight: number) => {
    doc.setFontSize(8);
    doc.setTextColor(148, 163, 184); // slate-400
    doc.text("ENGINEERED BY LONGUN TECH AND AI AGENCY", pageWidth / 2, pageHeight - 10, { align: 'center' });
    doc.text("Precision. Innovation. Excellence.", pageWidth / 2, pageHeight - 6, { align: 'center' });
  };

  const generateAssetsPDF = async () => {
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });
    const pageWidth = doc.internal.pageSize.width;
    const pageHeight = doc.internal.pageSize.height;
    
    const { data: logoBase64, width: logoW, height: logoH } = await getLogoBase64();
    addWatermark(doc, pageWidth, pageHeight, logoBase64);
    addPDFFooter(doc, pageWidth, pageHeight);

    if (logoBase64 && logoW > 0) {
      const aspect = logoW / logoH;
      const displayW = 25;
      const displayH = displayW / aspect;
      doc.addImage(logoBase64, 'PNG', 10, 10, displayW, displayH, undefined, 'NONE');
    } else {
      drawArkLogo(doc, 10, 10, 0.8);
    }

    doc.setFont("helvetica", "bold");
    doc.setFontSize(22);
    doc.setTextColor(220, 38, 38);
    doc.text("ARK PRINTERS", 40, 18);
    
    doc.setFontSize(14);
    doc.setTextColor(51, 65, 85);
    doc.text("Company Assets Report", 40, 26);

    doc.setFontSize(10);
    doc.text(`Generated on: ${new Date().toLocaleString()}`, 10, 45);

    const assetData = assets.map(a => [
      a.name,
      a.type.toUpperCase(),
      (a.quantity || 1).toString(),
      formatCurrency(a.value || 0),
      formatCurrency((a.quantity || 1) * (a.value || 0))
    ]);

    const totalAssetsValue = assets.reduce((sum, a) => sum + ((a.quantity || 1) * (a.value || 0)), 0);
    assetData.push([
      "TOTAL",
      "",
      "",
      "",
      formatCurrency(totalAssetsValue)
    ]);

    autoTable(doc, {
      startY: 50,
      head: [['Asset Name', 'Type', 'Qty', 'Unit Value', 'Total Value']],
      body: assetData,
      theme: 'grid',
      headStyles: { fillColor: [51, 65, 85], textColor: 255, fontStyle: 'bold', fontSize: 9 },
      bodyStyles: { fontSize: 8, textColor: 50 },
      alternateRowStyles: { fillColor: [248, 250, 252] },
      columnStyles: {
        2: { halign: 'center' },
        3: { halign: 'right' },
        4: { halign: 'right' }
      },
      didParseCell: function (data: any) {
        if (data.row.index === assetData.length - 1) {
          data.cell.styles.fillColor = [241, 245, 249];
          data.cell.styles.textColor = [15, 23, 42];
          data.cell.styles.fontStyle = 'bold';
        }
      }
    });

    const now = new Date();
    doc.save(`ARK_Assets_Report_${now.toISOString().split('T')[0]}.pdf`);
  };

  const generateJobsDonePDF = async () => {
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
      putOnlyUsedFonts: true,
      floatPrecision: 16
    });
    const pageWidth = doc.internal.pageSize.width;
    const pageHeight = doc.internal.pageSize.height;
    
    const { data: logoBase64, width: logoW, height: logoH } = await getLogoBase64();
    addWatermark(doc, pageWidth, pageHeight, logoBase64);
    addPDFFooter(doc, pageWidth, pageHeight);

    if (logoBase64 && logoW > 0) {
      const aspect = logoW / logoH;
      const displayW = 25;
      const displayH = displayW / aspect;
      doc.addImage(logoBase64, 'PNG', 10, 10, displayW, displayH, undefined, 'NONE');
    } else {
      drawArkLogo(doc, 10, 10, 0.8);
    }

    doc.setFont("helvetica", "bold");
    doc.setFontSize(22);
    doc.setTextColor(220, 38, 38);
    doc.text("ARK PRINTERS", 40, 18);
    
    doc.setFontSize(14);
    doc.setTextColor(51, 65, 85);
    doc.text("Completed Jobs Report", 40, 26);

    doc.setFontSize(10);
    doc.text(`Generated on: ${new Date().toLocaleString()}`, 10, 45);

    const completedOrders = orders
      .filter(o => ['completed', 'paid', 'ready_for_payment', 'done_awaiting_invoice'].includes(o.status || ''))
      .map(o => [
        `#${String(o.id).substring(0, 8).toUpperCase()}`,
        o.customer_name,
        o.items_summary || 'N/A',
        formatDate(o.created_at).split(',')[0],
        formatCurrency(o.total_amount || 0),
        o.designer_id ? (users.find(u => u.id === o.designer_id)?.full_name || o.designer_name || 'Assigned') : 'N/A',
        o.operator_id ? (users.find(u => u.id === o.operator_id)?.full_name || o.operator_name || 'Assigned') : 'N/A',
        formatDate(o.updated_at).split(',')[0]
      ]);

    autoTable(doc, {
      startY: 50,
      head: [['Order ID', 'Customer', 'Items', 'Started', 'Total Value', 'Designer', 'Operator', 'Completed']],
      body: completedOrders,
      theme: 'grid',
      headStyles: { fillColor: [5, 150, 105], textColor: 255, fontStyle: 'bold' },
      styles: { fontSize: 8, cellPadding: 3 }
    });

    doc.save(`ARK_Completed_Jobs_${new Date().toISOString().split('T')[0]}.pdf`);
  };

  const generateLowStockPDF = async () => {
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
      putOnlyUsedFonts: true,
      floatPrecision: 16
    });
    const pageWidth = doc.internal.pageSize.width;
    const pageHeight = doc.internal.pageSize.height;
    
    const { data: logoBase64, width: logoW, height: logoH } = await getLogoBase64();
    addWatermark(doc, pageWidth, pageHeight, logoBase64);
    addPDFFooter(doc, pageWidth, pageHeight);

    if (logoBase64 && logoW > 0) {
      const aspect = logoW / logoH;
      const displayW = 25;
      const displayH = displayW / aspect;
      doc.addImage(logoBase64, 'PNG', 10, 10, displayW, displayH, undefined, 'NONE');
    } else {
      drawArkLogo(doc, 10, 10, 0.8);
    }

    doc.setFont("helvetica", "bold");
    doc.setFontSize(22);
    doc.setTextColor(220, 38, 38);
    doc.text("ARK PRINTERS", 40, 18);
    
    doc.setFontSize(14);
    doc.setTextColor(51, 65, 85);
    doc.text("Low Stock Inventory Report", 40, 26);

    doc.setFontSize(10);
    doc.text(`Generated on: ${new Date().toLocaleString()}`, 10, 45);

    const lowStockItems = services
      .filter(s => s.stock <= s.minimum_stock)
      .map(s => [
        s.name,
        s.category || 'General',
        `${s.stock} ${s.unit}`,
        `${s.minimum_stock} ${s.unit}`,
        formatUSD(s.price),
        formatCurrency(usdToSsp(s.price))
      ]);

    autoTable(doc, {
      startY: 50,
      head: [['Item Name', 'Category', 'Current Stock', 'Minimum Stock', 'Price (USD)', 'Price (SSP)']],
      body: lowStockItems,
      theme: 'grid',
      headStyles: { fillColor: [244, 63, 94], textColor: 255, fontStyle: 'bold' },
      styles: { fontSize: 9, cellPadding: 4 }
    });

    doc.save(`ARK_Low_Stock_Report_${new Date().toISOString().split('T')[0]}.pdf`);
    showNotification('Low stock report exported!', 'success');
  };

  const generateFullInventoryPDF = async () => {
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
      putOnlyUsedFonts: true,
      floatPrecision: 16
    });
    const pageWidth = doc.internal.pageSize.width;
    const pageHeight = doc.internal.pageSize.height;
    
    const { data: logoBase64, width: logoW, height: logoH } = await getLogoBase64();
    addWatermark(doc, pageWidth, pageHeight, logoBase64);
    addPDFFooter(doc, pageWidth, pageHeight);

    if (logoBase64 && logoW > 0) {
      const aspect = logoW / logoH;
      const displayW = 25;
      const displayH = displayW / aspect;
      doc.addImage(logoBase64, 'PNG', 10, 10, displayW, displayH, undefined, 'NONE');
    } else {
      drawArkLogo(doc, 10, 10, 0.8);
    }

    doc.setFont("helvetica", "bold");
    doc.setFontSize(22);
    doc.setTextColor(220, 38, 38);
    doc.text("ARK PRINTERS", 40, 18);
    
    doc.setFontSize(14);
    doc.setTextColor(51, 65, 85);
    doc.text("Master Inventory & Services Report", 40, 26);

    doc.setFontSize(10);
    doc.text(`Generated on: ${new Date().toLocaleString()}`, 10, 45);

    const allItems = services
      .sort((a, b) => (a.name || '').localeCompare(b.name || ''))
      .map(s => [
        s.name,
        s.category || 'General',
        `${s.stock} ${s.unit}`,
        `${s.minimum_stock} ${s.unit}`,
        formatUSD(s.price),
        formatCurrency(usdToSsp(s.price))
      ]);

    autoTable(doc, {
      startY: 50,
      head: [['Item Name', 'Category', 'Stock Level', 'Min Stock', 'Price (USD)', 'Price (SSP)']],
      body: allItems,
      theme: 'grid',
      headStyles: { fillColor: [51, 65, 85], textColor: 255, fontStyle: 'bold' },
      styles: { fontSize: 9, cellPadding: 4 },
      didParseCell: (data) => {
        if (data.column.index === 2) {
          const rowData = services.sort((a,b) => (a.name || '').localeCompare(b.name || ''))[data.row.index];
          if (rowData && rowData.stock <= rowData.minimum_stock) {
            data.cell.styles.textColor = [220, 38, 38]; // Red for low stock
            data.cell.styles.fontStyle = 'bold';
          }
        }
      }
    });

    doc.save(`ARK_Full_Inventory_${new Date().toISOString().split('T')[0]}.pdf`);
    showNotification('Full inventory report exported!', 'success');
  };

  const generateUserManualPDF = async () => {
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
      putOnlyUsedFonts: true,
      floatPrecision: 16,
      compress: false
    });
    const pageWidth = doc.internal.pageSize.width;
    const pageHeight = doc.internal.pageSize.height;
    
    const { data: logoBase64, width: logoW, height: logoH } = await getLogoBase64();
    addWatermark(doc, pageWidth, pageHeight, logoBase64);
    addPDFFooter(doc, pageWidth, pageHeight);

    if (logoBase64 && logoW > 0) {
      const aspect = logoW / logoH;
      const displayW = 25;
      const displayH = displayW / aspect;
      doc.addImage(logoBase64, 'PNG', 10, 10, displayW, displayH, undefined, 'NONE');
    } else {
      drawArkLogo(doc, 10, 10, 0.8);
    }

    doc.setFont("helvetica", "bold");
    doc.setFontSize(24);
    doc.setTextColor(220, 38, 38);
    doc.text("ARK ERP USER MANUAL", 40, 20);
    
    doc.setFontSize(12);
    doc.setTextColor(100, 116, 139);
    doc.text("Official Technical Documentation for ARK Printers", 40, 28);

    doc.line(10, 40, pageWidth - 10, 40);

    let yPos = 55;
    const sections = [
      { 
        title: "CHAPTER 1: SYSTEM AUTHENTICATION & ACCESS", 
        content: "ARK ERP is a secure, role-based platform. All users must authenticate via Google Login.\n\n• MASTER ACCESS: tekkisandereagan@gmail.com / kulyakosukusandereagan@gmail.com\n• ALLOWED GMAIL: Only whitelisted company emails.\n• UNAUTHORIZED MESSAGE: If you see this, your email must be whitelisted by an Admin.\n\nRESPONSIBILITY: Admin manages staff access." 
      },
      {
        title: "[ILLUSTRATION: ACCESS FLOW]",
        content: "[ EMPLOYEE EMAIL ] -> [ GOOGLE AUTH ] -> [ ROLE CHECK ] -> [ ERP HOME ]"
      },
      { 
        title: "CHAPTER 2: UI NAVIGATION & INTERFACE", 
        content: "The interface is divided into key interaction zones:\n\n1. SIDEBAR (Left): Your main menu. Access changes based on your role.\n2. SEARCH BARS: Top of every list. Type to filter orders or items instantly.\n3. ACTION BUTTONS: Red/Grey buttons in rows used to trigger processing steps.\n4. EXPORT BUTTONS: Found at the top right of report pages for PDF generation.\n\nRESPONSIBILITY: All staff must know their specific sidebar tabs." 
      },
      { 
        title: "CHAPTER 3: ROLES & PERMISSIONS MATRIX", 
        content: "• ADMIN: Master control. (Staff, Services, Finance, Analytics).\n• RECEPTIONIST: The front line. (Orders, Customers, Quotations, Debts).\n• DESIGNER: The creative hub. (Order Queue [Designing stage]).\n• OPERATOR: The production hub. (Order Queue [Printing stage], Jobs Done).\n• SUPERVISOR: Oversight. (Analytics, Debt Reports, Jobs Logs)." 
      },
      { 
        title: "CHAPTER 4: CUSTOMER & CONTACT SYSTEM", 
        content: "Step 1: Go to 'Customers' tab.\nStep 2: Use search to see if customer exists.\nStep 3: If not, click 'Register New Customer'.\nStep 4: Enter precise phone numbers (format: +211...). \n\nRESPONSIBILITY: Receptionists maintain clear communication data." 
      },
      { 
        title: "CHAPTER 5: ORDER LIFECYCLE (TECHNICAL BLOCKS)", 
        content: "Step-by-step through the production pipeline:\n\n1. PENDING: Reception takes order + deposit.\n2. DESIGNING: Designer prepares artwork and pushes 'Design Ready'.\n3. PRINTING: Operator starts machinery and pushes 'Start Printing'.\n4. COMPLETED: Operator finishes job and pushes 'Mark Finished'.\n5. DELIVERED: Reception confirms final payment and hands over job.\n\nRESPONSIBILITY: Each station must update the LIVE status immediately." 
      },
      { 
        title: "CHAPTER 6: FINANCIAL RECOVERY (DEBT TRACKER)", 
        content: "Managing unpaid and partially paid orders:\n\n• DEBT TAB: Only shows customers with a balance due.\n• INSTALLMENT BUTTON: Click to record a new receipt. Enter amount.\n• AUTO-CALC: System handles the subtraction and status update.\n\nRESPONSIBILITY: Receptionists reconcile cash with system updates." 
      },
      { 
        title: "CHAPTER 7: INVENTORY & USD VALUATION", 
        content: "• USD BASE: Inventory prices (Selling Price & Unit Cost) are stored in USD to hedge against SSP volatility.\n• DAILY RATE: Admin updates the 'SSP per 1 USD' rate daily in Settings. All shop prices recalculate instantly.\n• LINKING: Admins link 'Vinyl Banner' service to 'Vinyl Roll' stock.\n• CONSUMPTION: Marking a job as 'Printing' deducts stock automatically.\n\nRESPONSIBILITY: Admin must ensure the Daily Rate is accurate before opening the shop." 
      },
      { 
        title: "CHAPTER 8: BUSINESS INTELLIGENCE (ANALYTICS)", 
        content: "Search any item's name to view its performance history:\n• Monthly consumption rate.\n• Revenue generated per unit.\n• Historical customer logs.\n\nRESPONSIBILITY: Admin and Supervisors use this for fiscal audits." 
      },
      { 
        title: "CHAPTER 9: THE ENGINEERING SIGNATURE", 
        content: "All exports (Invoices, Quotations, Reports) are precision-aligned with ARK Branding. Every page footer contains the LONGUN TECH & AI AGENCY developer signature. Any tampering with these watermarks violates the license agreement." 
      }
    ];

    sections.forEach(s => {
      if (yPos > pageHeight - 30) {
        doc.addPage();
        addPDFFooter(doc, pageWidth, pageHeight);
        yPos = 20;
      }
      doc.setFontSize(14);
      doc.setTextColor(15, 23, 42);
      doc.text(s.title, 15, yPos);
      yPos += 8;
      
      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(71, 85, 105);
      const lines = doc.splitTextToSize(s.content, pageWidth - 30);
      doc.text(lines, 15, yPos);
      yPos += (lines.length * 5) + 12;
      doc.setFont("helvetica", "bold");
    });

    doc.save("ARK_ERP_User_Manual.pdf");
  };

  const printReceiptHTML = async (order: Order, appliedDiscount?: number) => {
    const isAllowedToPrint = 
      user?.role === 'receptionist' || 
      user?.role === 'admin' || 
      isMaster;

    if (!isAllowedToPrint) {
      showNotification('Access denied: Only Receptionist, Admin, and Master Admin accounts can print thermal receipts and order details.', 'error');
      return;
    }

    setLoading(true);

    let orderWithItems = { ...order };
    if (!order.items || order.items.length === 0) {
      try {
        const items = await firebaseService.getOrderItems(order.id);
        orderWithItems.items = items;
      } catch (err) {
        showNotification('Failed to fetch order items', 'error');
        setLoading(false);
        return;
      }
    }

    let logoImgHTML = '';
    try {
      const logoData = await getLogoBase64();
      if (logoData && logoData.data) {
        logoImgHTML = `<img src="${logoData.data}" class="thermal-logo" alt="Logo" />`;
      }
    } catch (logoErr) {
      console.error("Failed to load logo for thermal printing:", logoErr);
    }

    setLoading(false);

    const receiptNo = String(orderWithItems.id || '').substring(0, 6).toUpperCase();
    const formattedDate = formatDate(orderWithItems.created_at);
    const customerName = (orderWithItems.customer_name || 'Walk-in').toUpperCase();

    // Generate table rows HTML
    const tableRowsHTML = (orderWithItems.items || []).map((item: any) => {
      const name = (item.service_name || item.name || 'Srv').toUpperCase();
      const qty = item.quantity;
      const priceVal = item.price_at_time || item.price || 0;
      const totalVal = qty * priceVal;
      return `
        <tr>
          <td style="padding: 5px 1px; border-bottom: 1.5px dashed #000000; font-weight: 950;">${name}</td>
          <td style="padding: 5px 1px; border-bottom: 1.5px dashed #000000; font-weight: 950;" class="text-center">${qty}</td>
          <td style="padding: 5px 1px; border-bottom: 1.5px dashed #000000; font-weight: 950;" class="text-right">${formatCurrency(priceVal)}</td>
          <td style="padding: 5px 1px; border-bottom: 1.5px dashed #000000; font-weight: 950;" class="text-right">${formatCurrency(totalVal)}</td>
        </tr>
      `;
    }).join('');

    const discPercentage = appliedDiscount || (typeof discount === 'number' ? discount : 0);
    const discAmount = (orderWithItems.total_amount * (discPercentage / 100));
    const finalTotal = orderWithItems.total_amount - discAmount;
    const balanceVal = Math.max(0, finalTotal - (orderWithItems.paid_amount || 0));

    let discountRowHTML = '';
    if (discAmount > 0) {
      discountRowHTML = `
        <tr>
          <td style="padding: 4px 0; font-weight: 950;">SUBTOTAL:</td>
          <td></td>
          <td></td>
          <td class="text-right" style="padding: 4px 0; font-weight: 950;">${formatCurrency(orderWithItems.total_amount)}</td>
        </tr>
        <tr>
          <td style="padding: 4px 0; font-weight: 950;">DISCOUNT (${discPercentage}%):</td>
          <td></td>
          <td></td>
          <td class="text-right" style="padding: 4px 0; font-weight: 950;">-${formatCurrency(discAmount)}</td>
        </tr>
      `;
    }

    const balanceLabel = balanceVal > 0.01 ? 'BALANCE DUE' : 'STATUS';
    const balanceFormatted = balanceVal > 0.01 ? formatCurrency(balanceVal) : 'FULLY PAID';

    const printWindowHTML = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Receipt_${receiptNo}</title>
        <style>
          /* Normalize page for thermal receipt paper */
          @page {
            margin: 0;
            size: 80mm auto;
          }
          @media print {
            body {
              margin: 0;
              padding: 2mm 3mm;
              width: 74mm;
              box-sizing: border-box;
            }
          }
          body {
            font-family: 'Arial Black', 'Arial-BoldMT', 'Helvetica Neue', 'Cooper Black', Arial, sans-serif;
            font-weight: 950;
            color: #000000 !important;
            background-color: #ffffff !important;
            margin: 0;
            padding: 8px;
            font-size: 11.5px;
            line-height: 1.35;
            -webkit-font-smoothing: none !important;
            -moz-osx-font-smoothing: none !important;
            font-smoothing: none !important;
          }
          * {
            -webkit-font-smoothing: none !important;
            -moz-osx-font-smoothing: none !important;
            font-smoothing: none !important;
            color: #000000 !important;
            font-weight: 950 !important;
            text-shadow: none !important;
            box-shadow: none !important;
          }
          .text-center { text-align: center !important; }
          .text-right { text-align: right !important; }
          
          .logo-container {
            margin-bottom: 6px !important;
            text-align: center !important;
            display: flex !important;
            flex-direction: column !important;
            align-items: center !important;
            justify-content: center !important;
          }
          .thermal-logo {
            max-width: 65px !important;
            max-height: 65px !important;
            margin: 0 auto 5px auto !important;
            display: block !important;
            /* Force solid 100% black silhouette to be thermal-head-friendly (no fading or dithering) */
            filter: brightness(0) !important;
            -webkit-filter: brightness(0) !important;
            image-rendering: -webkit-optimize-contrast !important;
            image-rendering: crisp-edges !important;
            image-rendering: pixelated !important;
          }
          .header-title {
            font-size: 19px !important;
            font-weight: 950 !important;
            letter-spacing: 0.5px !important;
            margin: 0 !important;
            font-family: 'Arial Black', sans-serif !important;
          }
          .subtitle {
            font-size: 8.5px !important;
            margin-top: 1.5px !important;
            margin-bottom: 1.5px !important;
            font-weight: 950 !important;
          }
          .divider {
            border-top: 2px dashed #000000 !important;
            margin: 7px 0 !important;
            height: 0 !important;
          }
          .double-divider {
            border-top: 3.5px double #000000 !important;
            margin: 8px 0 !important;
            height: 0 !important;
          }
          .info-table, .items-table, .totals-section {
            width: 100% !important;
            border-collapse: collapse !important;
          }
          .info-table td {
            font-size: 10.5px !important;
            padding: 2px 0 !important;
            font-weight: 950 !important;
          }
          .items-table th {
            padding: 5px 1px !important;
            border-top: 2px dashed #000000 !important;
            border-bottom: 2px dashed #000000 !important;
            font-size: 10.5px !important;
            text-transform: uppercase !important;
            text-align: left !important;
            font-weight: 950 !important;
          }
          .items-table td {
            font-size: 10.5px !important;
            word-break: break-word !important;
            font-weight: 950 !important;
          }
          .totals-section td {
            padding: 2.5px 0 !important;
            font-size: 10.5px !important;
            font-weight: 950 !important;
          }
          .footer {
            font-size: 9.5px !important;
            text-align: center !important;
            margin-top: 15px !important;
            line-height: 1.35 !important;
            border-top: 2px dashed #000000 !important;
            padding-top: 10px !important;
            font-weight: 950 !important;
          }
          .footer-stamp {
            font-size: 10.5px !important;
            font-weight: 950 !important;
            margin-top: 4px !important;
            font-family: 'Arial Black', sans-serif !important;
          }
        </style>
      </head>
      <body>
        <div class="logo-container">
          ${logoImgHTML}
          <div class="header-title">ARK PRINTERS</div>
        </div>
        <div class="text-center subtitle">DESIGNING | PRINTING | BRANDING | ADVERTISING</div>
        <div class="text-center subtitle">MALAKIA, JUBA | +211 921 004 501</div>
        <div class="text-center subtitle">ARKFINANCE9@GMAIL.COM</div>
        
        <div class="divider"></div>
        
        <table class="info-table">
          <tr>
            <td>RECEIPT: #${receiptNo}</td>
            <td class="text-right">DATE: ${formattedDate}</td>
          </tr>
          <tr>
            <td colspan="2">CLIENT: ${customerName}</td>
          </tr>
        </table>
        
        <table class="items-table">
          <thead>
            <tr>
              <th style="width: 45%;">Item</th>
              <th class="text-center" style="width: 15%;">Qty</th>
              <th class="text-right" style="width: 20%;">Price</th>
              <th class="text-right" style="width: 20%;">Total</th>
            </tr>
          </thead>
          <tbody>
            ${tableRowsHTML}
          </tbody>
        </table>
        
        <div class="divider"></div>
        
        <table class="totals-section">
          ${discountRowHTML}
          <tr>
            <td style="padding: 3px 0;"><b>TOTAL DUE:</b></td>
            <td></td>
            <td></td>
            <td class="text-right" style="padding: 3px 0;"><b>${formatCurrency(finalTotal)}</b></td>
          </tr>
          <tr>
            <td style="padding: 3px 0;">PAID AMOUNT:</td>
            <td></td>
            <td></td>
            <td class="text-right" style="padding: 3px 0;">${formatCurrency(orderWithItems.paid_amount || 0)}</td>
          </tr>
          <tr>
            <td style="padding: 3px 0;"><b>${balanceLabel}:</b></td>
            <td></td>
            <td></td>
            <td class="text-right" style="padding: 3px 0;"><b>${balanceFormatted}</b></td>
          </tr>
        </table>
        
        <div class="double-divider"></div>
        
        <div class="footer">
          <div>THANK YOU FOR YOUR BUSINESS!</div>
          <div class="footer-stamp">POWERED BY LONGUN TECH AND AI AGENCY</div>
        </div>
      </body>
      </html>
    `;

    // Print using an iframe
    const existingIframe = document.getElementById('print-receipt-iframe');
    if (existingIframe) {
      existingIframe.remove();
    }

    const iframe = document.createElement('iframe');
    iframe.id = 'print-receipt-iframe';
    iframe.style.position = 'absolute';
    iframe.style.width = '0px';
    iframe.style.height = '0px';
    iframe.style.border = 'none';
    iframe.style.visibility = 'hidden';
    document.body.appendChild(iframe);

    const iframeDoc = iframe.contentWindow?.document || iframe.contentDocument;
    if (iframeDoc) {
      iframeDoc.open();
      iframeDoc.write(printWindowHTML);
      iframeDoc.close();
      
      setTimeout(() => {
        if (iframe.contentWindow) {
          iframe.contentWindow.focus();
          iframe.contentWindow.print();
          setTimeout(() => {
            iframe.remove();
          }, 10000);
        }
      }, 500);
    }
  };

  const generateInvoicePDF = async (order: Order, appliedDiscount?: number, shouldPrint: boolean = false) => {
    const isAllowedToPrint = 
      user?.role === 'receptionist' || 
      user?.role === 'admin' || 
      isMaster;

    if (!isAllowedToPrint) {
      showNotification('Access denied: Only Receptionist, Admin, and Master Admin accounts can print thermal receipts and order details.', 'error');
      return;
    }

    let orderWithItems = { ...order };
    if (!order.items || order.items.length === 0) {
      setLoading(true);
      try {
        const items = await firebaseService.getOrderItems(order.id);
        orderWithItems.items = items;
      } catch (err) {
        showNotification('Failed to fetch order items', 'error');
        setLoading(false);
        return;
      }
      setLoading(false);
    }

    const { data: logoBase64, width: logoW, height: logoH } = await getLogoBase64();
    
    // Fixed height for thermal receipt as per user request
    const dynamicHeight = 297; 

    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: [80, dynamicHeight],
      putOnlyUsedFonts: true,
      floatPrecision: 16,
      compress: false
    });
    
    // We intentionally omit the translucent watermark on 80mm thermal receipts.
    // Low-opacity watermarks confuse thermal printer drivers and print as faint, dithered, low-contrast patterns.
    
    if (logoBase64 && logoW > 0) {
      const aspect = logoW / logoH;
      const displayW = 8;
      const displayH = displayW / aspect;
      doc.addImage(logoBase64, 'PNG', 5, 2, displayW, displayH, undefined, 'NONE');
    } else {
      drawArkLogo(doc, 5, 2, 0.4, true); // True draws the logo in bold monochrome black
    }
    
    doc.setTextColor(0, 0, 0); // Pure solid black for maximum heat density
    doc.setFontSize(12); // Bold display title
    doc.setFont('courier', 'bold');
    doc.text('ARK PRINTERS', 40, 6, { align: 'center' });
    
    doc.setTextColor(0, 0, 0); // Solid black
    doc.setFontSize(5.5); // Clear body text size for POS
    doc.setFont('courier', 'bold');
    doc.text('DESIGNING | PRINTING | BRANDING | ADVERTISING', 40, 9.5, { align: 'center' });
    doc.setFontSize(5);
    doc.text('Malakia, Juba | +211 921 004 501 | arkprinters001@gmail.com', 40, 12, { align: 'center' });
    
    // Horizontal Line - Solid high-contrast black divider
    doc.setDrawColor(0, 0, 0);
    doc.setLineWidth(0.2);
    doc.line(3.95, 14, 76.05, 14);
    
    // Header Info
    doc.setFontSize(8);
    doc.setFont('courier', 'bold');
    doc.setTextColor(0, 0, 0);
    doc.text('INVOICE / RECEIPT', 3.95, 18);
    doc.text(`#${String(orderWithItems.id || '').substring(0, 6).toUpperCase()}`, 76.05, 18, { align: 'right' });
    
    doc.setFontSize(6.5); // Warm and clear size
    doc.setFont('courier', 'bold');
    const orderDateFormatted = formatDate(orderWithItems.created_at);
    doc.text(`Date: ${orderDateFormatted}`, 3.95, 22);
    doc.text(`Client: ${orderWithItems.customer_name || 'Walk-in'}`, 3.95, 25);
    
    const tableData = (orderWithItems.items || []).map((item: any) => [
      item.service_name || item.name || 'Srv',
      item.quantity.toString(),
      formatCurrency(item.price_at_time || item.price || 0, orderWithItems.usd_rate),
      formatCurrency(item.quantity * (item.price_at_time || item.price || 0), orderWithItems.usd_rate)
    ]);
    
    const discPercentage = appliedDiscount || (typeof discount === 'number' ? discount : 0);
    const discAmount = (orderWithItems.total_amount * (discPercentage / 100));
    const finalTotal = orderWithItems.total_amount - discAmount;
 
    // Table with high-contrast, clear pure black lines for accurate thermal rendering
    autoTable(doc, {
      startY: 28,
      head: [['Item', 'Qty', 'Price', 'Total']],
      body: tableData,
      theme: 'grid',
      styles: { 
        fontSize: 7, // Crisp clear text size
        cellPadding: 1.2, 
        font: 'courier',
        fontStyle: 'bold',
        textColor: [0, 0, 0], // Pure black text
        lineColor: [0, 0, 0], // Pure black grid lines
        lineWidth: 0.25
      },
      headStyles: { 
        fillColor: [0, 0, 0], // Black header block
        textColor: [255, 255, 255], // White bold header text
        fontStyle: 'bold',
        lineColor: [0, 0, 0]
      },
      alternateRowStyles: {
        fillColor: [255, 255, 255] // Turn off gray alternate rows (grey halftones look faded on POS)
      },
      margin: { left: 3.95, right: 3.95 }
    });
    
    const finalY = (doc as any).lastAutoTable?.finalY || 45;
    
    doc.setFontSize(7.5);
    doc.setFont('courier', 'bold');
    doc.setTextColor(0, 0, 0); // Pure solid black
    const currencySymbol = currency === 'USD' ? 'USD' : 'SSP';
    if (discAmount > 0) {
      doc.text(`Subtotal: ${formatCurrency(orderWithItems.total_amount, orderWithItems.usd_rate)}`, 76.05, finalY + 4, { align: 'right' });
      doc.text(`Disc. (${discPercentage}%): -${formatCurrency(discAmount, orderWithItems.usd_rate)}`, 76.05, finalY + 7, { align: 'right' });
      doc.text(`TOTAL: ${formatCurrency(finalTotal, orderWithItems.usd_rate)}`, 76.05, finalY + 11, { align: 'right' });
      
      doc.setFontSize(6.5);
      doc.setTextColor(0, 0, 0); // Pure black
      doc.text(`Paid Amount: ${formatCurrency(orderWithItems.paid_amount || 0, orderWithItems.usd_rate)}`, 76.05, finalY + 15, { align: 'right' });
      
      const balanceVal = Math.max(0, finalTotal - (orderWithItems.paid_amount || 0));
      if (balanceVal > 0.01) {
        doc.setTextColor(0, 0, 0); // Pure black
        doc.setFont('courier', 'bold');
        doc.text(`BALANCE DUE: ${formatCurrency(balanceVal, orderWithItems.usd_rate)}`, 76.05, finalY + 19, { align: 'right' });
      } else {
        doc.setTextColor(0, 0, 0); // Pure black
        doc.setFont('courier', 'bold');
        doc.text(`STATUS: FULLY PAID`, 76.05, finalY + 19, { align: 'right' });
      }
    } else {
      doc.text(`TOTAL: ${formatCurrency(finalTotal, orderWithItems.usd_rate)}`, 76.05, finalY + 5, { align: 'right' });
      
      doc.setFontSize(6.5);
      doc.setTextColor(0, 0, 0); // Pure black
      doc.text(`Paid Amount: ${formatCurrency(orderWithItems.paid_amount || 0, orderWithItems.usd_rate)}`, 76.05, finalY + 9, { align: 'right' });
      
      const balanceVal = Math.max(0, finalTotal - (orderWithItems.paid_amount || 0));
      if (balanceVal > 0.01) {
        doc.setTextColor(0, 0, 0); // Pure black
        doc.setFont('courier', 'bold');
        doc.text(`BALANCE DUE: ${formatCurrency(balanceVal, orderWithItems.usd_rate)}`, 76.05, finalY + 13, { align: 'right' });
      } else {
        doc.setTextColor(0, 0, 0); // Pure black
        doc.setFont('courier', 'bold');
        doc.text(`STATUS: FULLY PAID`, 76.05, finalY + 13, { align: 'right' });
      }
    }
    
    doc.setFontSize(5.5);
    doc.setFont('courier', 'bold'); // Bold footer text
    doc.setTextColor(0, 0, 0); // Pure black
    doc.text('Thank you for your business!', 40, dynamicHeight - 8, { align: 'center' });
    doc.setFontSize(6.5);
    doc.setFont('courier', 'bold');
    doc.setTextColor(0, 0, 0); // Pure black
    doc.text('POWERED BY LONGUN TECH AND AI AGENCY', 40, dynamicHeight - 4, { align: 'center' });

    if (shouldPrint) {
      doc.autoPrint();
      const h_blob = doc.output('bloburl');
      window.open(h_blob, '_blank');
    } else {
      doc.save(`Invoice_ARK_${String(orderWithItems.id || '').substring(0, 6).toUpperCase()}.pdf`);
    }
  };

  const printJobDescriptionConfirmationHTML = async (order: Order) => {
    const isAllowedToPrint = 
      user?.role === 'receptionist' || 
      user?.role === 'admin' || 
      isMaster;

    if (!isAllowedToPrint) {
      showNotification('Access denied: Only Receptionist, Admin, and Master Admin accounts can print job specifications.', 'error');
      return;
    }

    setLoading(true);

    let orderWithItems = { ...order };
    if (!order.items || order.items.length === 0) {
      try {
        const items = await firebaseService.getOrderItems(order.id);
        orderWithItems.items = items;
      } catch (err) {
        showNotification('Failed to fetch order items', 'error');
        setLoading(false);
        return;
      }
    }

    let logoImgHTML = '';
    try {
      const logoData = await getLogoBase64();
      if (logoData && logoData.data) {
        logoImgHTML = `<img src="${logoData.data}" class="thermal-logo" alt="Logo" />`;
      }
    } catch (logoErr) {
      console.error("Failed to load logo for thermal printing:", logoErr);
    }

    setLoading(false);

    const jobOrderId = orderWithItems.job_order_id || String(orderWithItems.id || '').substring(0, 8).toUpperCase();
    const formattedDate = formatDate(orderWithItems.created_at);
    const customerName = (orderWithItems.customer_name || 'Walk-in Client').toUpperCase();
    const assignedStaff = orderWithItems.assigned_staff_username ? '@' + orderWithItems.assigned_staff_username : 'ARK Design Desk';
    const productionStage = getStatusLabel(orderWithItems.status);

    const tableRowsHTML = (orderWithItems.items || []).map((item: any, idx: number) => {
      const name = (item.service_name || item.name || 'Srv').toUpperCase();
      const qty = item.quantity;
      const spec = orderWithItems.description || 'Full print/branding specifications to be rendered as per layout/file requirements.';
      return `
        <tr>
          <td style="padding: 5px 1px; border-bottom: 1.5px dashed #000000; font-weight: 950; vertical-align: top;">
            ${name}<br/>
            <span style="font-size: 9px; font-weight: normal;">QTY: ${qty}</span>
          </td>
          <td style="padding: 5px 1px; border-bottom: 1.5px dashed #000000; font-weight: 950; vertical-align: top; font-size: 9.5px;">
            ${spec}
          </td>
        </tr>
      `;
    }).join('');

    const printWindowHTML = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>JobSpec_${jobOrderId}</title>
        <style>
          @page {
            margin: 0;
            size: 80mm auto;
          }
          @media print {
            body {
              margin: 0;
              padding: 2mm 3mm;
              width: 74mm;
              box-sizing: border-box;
            }
          }
          body {
            font-family: 'Arial Black', 'Arial-BoldMT', 'Helvetica Neue', Arial, sans-serif;
            font-weight: 950;
            color: #000000 !important;
            background-color: #ffffff !important;
            margin: 0;
            padding: 8px;
            font-size: 11.5px;
            line-height: 1.35;
          }
          * {
            -webkit-font-smoothing: none !important;
            font-smoothing: none !important;
            color: #000000 !important;
            font-weight: 950 !important;
          }
          .text-center { text-align: center !important; }
          .text-right { text-align: right !important; }
          
          .logo-container {
            margin-bottom: 6px !important;
            text-align: center !important;
            display: flex !important;
            flex-direction: column !important;
            align-items: center !important;
            justify-content: center !important;
          }
          .thermal-logo {
            max-width: 65px !important;
            max-height: 65px !important;
            margin: 0 auto 5px auto !important;
            display: block !important;
            filter: brightness(0) !important;
            -webkit-filter: brightness(0) !important;
            image-rendering: -webkit-optimize-contrast !important;
            image-rendering: crisp-edges !important;
          }
          .header-title {
            font-size: 19px !important;
            font-weight: 950 !important;
            letter-spacing: 0.5px !important;
            margin: 0 !important;
            font-family: 'Arial Black', sans-serif !important;
          }
          .subtitle {
            font-size: 8.5px !important;
            margin-top: 1.5px !important;
            margin-bottom: 1.5px !important;
            font-weight: 950 !important;
          }
          .divider {
            border-top: 2px dashed #000000 !important;
            margin: 7px 0 !important;
            height: 0 !important;
          }
          .info-table, .items-table {
            width: 100% !important;
            border-collapse: collapse !important;
          }
          .info-table td {
            font-size: 10.5px !important;
            padding: 2px 0 !important;
            font-weight: 950 !important;
          }
          .items-table th {
            padding: 5px 1px !important;
            border-top: 2px dashed #000000 !important;
            border-bottom: 2px dashed #000000 !important;
            font-size: 10.5px !important;
            text-transform: uppercase !important;
            text-align: left !important;
            font-weight: 950 !important;
          }
          .items-table td {
            font-size: 10.5px !important;
            word-break: break-word !important;
            font-weight: 950 !important;
          }
          .footer {
            font-size: 9.5px !important;
            text-align: center !important;
            margin-top: 15px !important;
            line-height: 1.35 !important;
            border-top: 2px dashed #000000 !important;
            padding-top: 10px !important;
            font-weight: 950 !important;
          }
          .footer-stamp {
            font-size: 10.5px !important;
            font-weight: 950 !important;
            margin-top: 4px !important;
            font-family: 'Arial Black', sans-serif !important;
          }
        </style>
      </head>
      <body>
        <div class="logo-container">
          ${logoImgHTML}
          <div class="header-title">ARK PRINTERS</div>
        </div>
        <div class="text-center subtitle">DESIGNING | PRINTING | BRANDING | ADVERTISING</div>
        <div class="text-center subtitle">MALAKIA, JUBA | +211 921 004 501</div>
        <div class="text-center subtitle">ARKFINANCE9@GMAIL.COM</div>
        
        <div class="divider"></div>
        
        <div class="text-center" style="font-size: 13px; font-family: 'Arial Black', sans-serif; margin-bottom: 6px;">JOB SPECIFICATION CONFIRMATION</div>
        
        <table class="info-table">
          <tr>
            <td>JOB ORDER ID: #${jobOrderId}</td>
            <td class="text-right">DATE: ${formattedDate}</td>
          </tr>
          <tr>
            <td colspan="2">CLIENT: ${customerName}</td>
          </tr>
          <tr>
            <td>ASSIGNED STAFF: ${assignedStaff}</td>
            <td class="text-right">STAGE: ${productionStage}</td>
          </tr>
        </table>
        
        <div class="divider"></div>
        
        <table class="items-table">
          <thead>
            <tr>
              <th style="width: 40%;">Item / Qty</th>
              <th style="width: 60%;">Specifications</th>
            </tr>
          </thead>
          <tbody>
            ${tableRowsHTML}
          </tbody>
        </table>
        
        <div class="divider"></div>
        
        <div style="font-size: 8.5px; font-weight: 950; text-transform: uppercase; margin-bottom: 4px;">SPECIFICATION AGREEMENT:</div>
        <div style="font-size: 8px; font-weight: normal; line-height: 1.3; margin-bottom: 24px;">
          1. SIZE & ORIENTATION APPROVED.<br/>
          2. SPELLING & CONTENT VERIFIED.<br/>
          3. COLOR & MEDIA SELECTION CONFIRMED.<br/>
          4. PRODUCTION BEGINS IMMEDIATELY.
        </div>
        
        <table style="width: 100%; font-size: 9px; margin-top: 15px; border-collapse: collapse;">
          <tr>
            <td style="width: 45%; border-top: 1.5px solid #000000; padding-top: 5px; text-align: center; font-weight: 950;">
              CLIENT SIGNATURE<br/>
              <span style="font-size: 7.5px; font-weight: normal;">${customerName}</span>
            </td>
            <td style="width: 10%;"></td>
            <td style="width: 45%; border-top: 1.5px solid #000000; padding-top: 5px; text-align: center; font-weight: 950;">
              AUTHORIZED BY<br/>
              <span style="font-size: 7.5px; font-weight: normal;">${(user?.full_name || 'ARK DESIGNER').toUpperCase()}</span>
            </td>
          </tr>
        </table>
        
        <div class="footer">
          <div>THANK YOU FOR YOUR BUSINESS!</div>
          <div class="footer-stamp">POWERED BY LONGUN TECH AND AI AGENCY</div>
        </div>
      </body>
      </html>
    `;

    // Print using an iframe
    const existingIframe = document.getElementById('print-jobspec-iframe');
    if (existingIframe) {
      existingIframe.remove();
    }

    const iframe = document.createElement('iframe');
    iframe.id = 'print-jobspec-iframe';
    iframe.style.position = 'absolute';
    iframe.style.width = '0px';
    iframe.style.height = '0px';
    iframe.style.border = 'none';
    iframe.style.visibility = 'hidden';
    document.body.appendChild(iframe);

    const iframeDoc = iframe.contentWindow?.document || iframe.contentDocument;
    if (iframeDoc) {
      iframeDoc.open();
      iframeDoc.write(printWindowHTML);
      iframeDoc.close();
      
      setTimeout(() => {
        if (iframe.contentWindow) {
          iframe.contentWindow.focus();
          iframe.contentWindow.print();
          setTimeout(() => {
            iframe.remove();
          }, 10000);
        }
      }, 500);
    }
  };

  const printDeliveryNoteHTML = async (order: Order, itemsDelivered: {[itemId: string]: number}) => {
    const isAllowedToPrint = 
      user?.role === 'receptionist' || 
      user?.role === 'admin' || 
      isMaster;

    if (!isAllowedToPrint) {
      showNotification('Access denied: Only Receptionist, Admin, and Master Admin accounts can print delivery notes.', 'error');
      return;
    }

    setLoading(true);

    let orderWithItems = { ...order };
    if (!order.items || order.items.length === 0) {
      try {
        const items = await firebaseService.getOrderItems(order.id);
        orderWithItems.items = items;
      } catch (err) {
        showNotification('Failed to fetch order items', 'error');
        setLoading(false);
        return;
      }
    }

    let logoImgHTML = '';
    try {
      const logoData = await getLogoBase64();
      if (logoData && logoData.data) {
        logoImgHTML = `<img src="${logoData.data}" class="thermal-logo" alt="Logo" />`;
      }
    } catch (logoErr) {
      console.error("Failed to load logo for thermal printing:", logoErr);
    }

    setLoading(false);

    const jobOrderId = orderWithItems.job_order_id || String(orderWithItems.id || '').substring(0, 8).toUpperCase();
    const formattedDate = new Date().toLocaleDateString();
    const customerName = (orderWithItems.customer_name || 'Walk-in Client').toUpperCase();
    const dispatchedBy = user?.full_name || 'ARK Logistics Team';

    const tableRowsHTML = (orderWithItems.items || []).map((item: any, idx: number) => {
      const name = (item.service_name || item.name || 'Srv').toUpperCase();
      const ordQty = item.quantity;
      const itemId = item.id || item.service_id || String(idx);
      const delQty = typeof itemsDelivered[itemId] === 'number' ? itemsDelivered[itemId] : ordQty;
      const balance = Math.max(0, ordQty - delQty);
      return `
        <tr>
          <td style="padding: 5px 1px; border-bottom: 1.5px dashed #000000; font-weight: 950; vertical-align: top;">
            ${name}
          </td>
          <td style="padding: 5px 1px; border-bottom: 1.5px dashed #000000; font-weight: 950; vertical-align: top;" class="text-center">
            ${ordQty}
          </td>
          <td style="padding: 5px 1px; border-bottom: 1.5px dashed #000000; font-weight: 950; vertical-align: top;" class="text-center">
            ${delQty}
          </td>
          <td style="padding: 5px 1px; border-bottom: 1.5px dashed #000000; font-weight: 950; vertical-align: top;" class="text-center">
            ${balance}
          </td>
        </tr>
      `;
    }).join('');

    const printWindowHTML = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>DeliveryNote_${jobOrderId}</title>
        <style>
          @page {
            margin: 0;
            size: 80mm auto;
          }
          @media print {
            body {
              margin: 0;
              padding: 2mm 3mm;
              width: 74mm;
              box-sizing: border-box;
            }
          }
          body {
            font-family: 'Arial Black', 'Arial-BoldMT', 'Helvetica Neue', Arial, sans-serif;
            font-weight: 950;
            color: #000000 !important;
            background-color: #ffffff !important;
            margin: 0;
            padding: 8px;
            font-size: 11.5px;
            line-height: 1.35;
          }
          * {
            -webkit-font-smoothing: none !important;
            font-smoothing: none !important;
            color: #000000 !important;
            font-weight: 950 !important;
          }
          .text-center { text-align: center !important; }
          .text-right { text-align: right !important; }
          
          .logo-container {
            margin-bottom: 6px !important;
            text-align: center !important;
            display: flex !important;
            flex-direction: column !important;
            align-items: center !important;
            justify-content: center !important;
          }
          .thermal-logo {
            max-width: 65px !important;
            max-height: 65px !important;
            margin: 0 auto 5px auto !important;
            display: block !important;
            filter: brightness(0) !important;
            -webkit-filter: brightness(0) !important;
            image-rendering: -webkit-optimize-contrast !important;
            image-rendering: crisp-edges !important;
          }
          .header-title {
            font-size: 19px !important;
            font-weight: 950 !important;
            letter-spacing: 0.5px !important;
            margin: 0 !important;
            font-family: 'Arial Black', sans-serif !important;
          }
          .subtitle {
            font-size: 8.5px !important;
            margin-top: 1.5px !important;
            margin-bottom: 1.5px !important;
            font-weight: 950 !important;
          }
          .divider {
            border-top: 2px dashed #000000 !important;
            margin: 7px 0 !important;
            height: 0 !important;
          }
          .info-table, .items-table {
            width: 100% !important;
            border-collapse: collapse !important;
          }
          .info-table td {
            font-size: 10.5px !important;
            padding: 2px 0 !important;
            font-weight: 950 !important;
          }
          .items-table th {
            padding: 5px 1px !important;
            border-top: 2px dashed #000000 !important;
            border-bottom: 2px dashed #000000 !important;
            font-size: 10.5px !important;
            text-transform: uppercase !important;
            text-align: left !important;
            font-weight: 950 !important;
          }
          .items-table td {
            font-size: 10.5px !important;
            word-break: break-word !important;
            font-weight: 950 !important;
          }
          .footer {
            font-size: 9.5px !important;
            text-align: center !important;
            margin-top: 15px !important;
            line-height: 1.35 !important;
            border-top: 2px dashed #000000 !important;
            padding-top: 10px !important;
            font-weight: 950 !important;
          }
          .footer-stamp {
            font-size: 10.5px !important;
            font-weight: 950 !important;
            margin-top: 4px !important;
            font-family: 'Arial Black', sans-serif !important;
          }
        </style>
      </head>
      <body>
        <div class="logo-container">
          ${logoImgHTML}
          <div class="header-title">ARK PRINTERS</div>
        </div>
        <div class="text-center subtitle">DESIGNING | PRINTING | BRANDING | ADVERTISING</div>
        <div class="text-center subtitle">MALAKIA, JUBA | +211 921 004 501</div>
        <div class="text-center subtitle">ARKFINANCE9@GMAIL.COM</div>
        
        <div class="divider"></div>
        
        <div class="text-center" style="font-size: 13px; font-family: 'Arial Black', sans-serif; margin-bottom: 6px;">GOODS DELIVERY NOTE</div>
        
        <table class="info-table">
          <tr>
            <td>DELIVERY NOTE: #DN-${jobOrderId}</td>
            <td class="text-right">DATE: ${formattedDate}</td>
          </tr>
          <tr>
            <td colspan="2">CLIENT: ${customerName}</td>
          </tr>
          <tr>
            <td>REF ORDER: #${jobOrderId}</td>
            <td class="text-right">DISPATCHED: ${dispatchedBy}</td>
          </tr>
        </table>
        
        <div class="divider"></div>
        
        <table class="items-table">
          <thead>
            <tr>
              <th style="width: 46%;">Item</th>
              <th class="text-center" style="width: 18%;">Ord</th>
              <th class="text-center" style="width: 18%;">Del</th>
              <th class="text-center" style="width: 18%;">Bal</th>
            </tr>
          </thead>
          <tbody>
            ${tableRowsHTML}
          </tbody>
        </table>
        
        <div class="divider"></div>
        
        <div style="font-size: 8.5px; font-weight: 950; text-transform: uppercase; margin-bottom: 4px;">DELIVERY TERMS:</div>
        <div style="font-size: 8px; font-weight: normal; line-height: 1.3; margin-bottom: 24px;">
          1. VERIFY QUALITY & QUANTITY UPON RECEIPT.<br/>
          2. GOODS ACCEPTED IN GOOD CONDITION AFTER SIGNING.<br/>
          3. OUTSTANDING BALANCES DELIVERED SEPARATELY.
        </div>
        
        <table style="width: 100%; font-size: 9px; margin-top: 15px; border-collapse: collapse;">
          <tr>
            <td style="width: 45%; border-top: 1.5px solid #000000; padding-top: 5px; text-align: center; font-weight: 950;">
              CLIENT SIGNATURE<br/>
              <span style="font-size: 7.5px; font-weight: normal;">${customerName}</span>
            </td>
            <td style="width: 10%;"></td>
            <td style="width: 45%; border-top: 1.5px solid #000000; padding-top: 5px; text-align: center; font-weight: 950;">
              DISPATCHED BY<br/>
              <span style="font-size: 7.5px; font-weight: normal;">${dispatchedBy.toUpperCase()}</span>
            </td>
          </tr>
        </table>
        
        <div class="footer">
          <div>THANK YOU FOR YOUR BUSINESS!</div>
          <div class="footer-stamp">POWERED BY LONGUN TECH AND AI AGENCY</div>
        </div>
      </body>
      </html>
    `;

    // Print using an iframe
    const existingIframe = document.getElementById('print-delivery-iframe');
    if (existingIframe) {
      existingIframe.remove();
    }

    const iframe = document.createElement('iframe');
    iframe.id = 'print-delivery-iframe';
    iframe.style.position = 'absolute';
    iframe.style.width = '0px';
    iframe.style.height = '0px';
    iframe.style.border = 'none';
    iframe.style.visibility = 'hidden';
    document.body.appendChild(iframe);

    const iframeDoc = iframe.contentWindow?.document || iframe.contentDocument;
    if (iframeDoc) {
      iframeDoc.open();
      iframeDoc.write(printWindowHTML);
      iframeDoc.close();
      
      setTimeout(() => {
        if (iframe.contentWindow) {
          iframe.contentWindow.focus();
          iframe.contentWindow.print();
          setTimeout(() => {
            iframe.remove();
          }, 10000);
        }
      }, 500);
    }
  };

  const generateOrderQueuePDF = async () => {
    const doc = new jsPDF({ 
      orientation: 'landscape', 
      format: 'a4',
      putOnlyUsedFonts: true,
      floatPrecision: 16,
      compress: false
    });
    const { data: logoBase64, width: logoW, height: logoH } = await getLogoBase64();
    addWatermark(doc, 297, 210, logoBase64);
    addPDFFooter(doc, 297, 210);
    
    if (logoBase64 && logoW > 0) {
      const aspect = logoW / logoH;
      const displayH = 20;
      const displayW = displayH * aspect;
      doc.addImage(logoBase64, 'PNG', 10, 8, displayW, displayH, undefined, 'NONE');
    } else {
      drawArkLogo(doc, 10, 10, 1);
    }
    
    doc.setFontSize(22);
    doc.setTextColor(220, 38, 38);
    doc.setFont('helvetica', 'bold');
    doc.text('ARK PRINTERS', 35, 20);
    
    doc.setFontSize(18);
    doc.setTextColor(51, 65, 85);
    doc.text('PRODUCTION ORDER QUEUE', 148, 40, { align: 'center' });
    
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`Generated on: ${new Date().toLocaleString()}`, 148, 48, { align: 'center' });
    
    const tableData = orders
      .filter(o => !['cancelled'].includes(o.status || ''))
      .map(order => [
        `#${String(order.id || '').substring(0, 8).toUpperCase()}`,
        order.customer_name,
        order.items_summary || 'N/A',
        getStatusLabel(order.status),
        order.assigned_staff_username ? `@${order.assigned_staff_username}` : 'UNASSIGNED',
        formatCurrency(order.total_amount, order.usd_rate),
        formatDate(order.created_at)
      ]);
    
    autoTable(doc, {
      startY: 55,
      head: [['ID', 'Customer', 'Items', 'Status', 'Staff Assigned', 'Amount', 'Date Ordered']],
      body: tableData,
      theme: 'striped',
      headStyles: { fillColor: [220, 38, 38] },
      styles: { fontSize: 9, cellPadding: 4 }
    });
    
    doc.save(`Order_Queue_${new Date().toISOString().split('T')[0]}.pdf`);
  };

  const getNextQuotationNo = (existingQuotes: Quotation[], targetDateString: string) => {
    let maxScore = 0;
    existingQuotes.forEach(q => {
      const qNo = q.quotNo || '';
      // Expected format e.g. A001 or B025 or A1000
      const match = qNo.match(/^([A-Z])(\d{3,4})/i);
      if (match) {
        const letter = match[1].toUpperCase();
        const num = parseInt(match[2], 10);
        const letterIndex = letter.charCodeAt(0) - 65;
        if (letterIndex >= 0 && num >= 1 && num <= 1000) {
          const score = (letterIndex * 1000) + num;
          if (score > maxScore) {
            maxScore = score;
          }
        }
      }
    });

    const nextScore = maxScore === 0 ? 1 : maxScore + 1;
    const numVal = nextScore % 1000 === 0 ? 1000 : nextScore % 1000;
    const letterIndex = Math.floor((nextScore - 1) / 1000);
    const letter = String.fromCharCode(65 + (letterIndex % 26)); // e.g., 'A', 'B' ... 'Z'
    const paddedNum = String(numVal).padStart(3, '0');

    let monthStr = '01';
    let yearStr = '2026';
    try {
      const d = new Date(targetDateString);
      if (!isNaN(d.getTime())) {
        monthStr = String(d.getMonth() + 1).padStart(2, '0');
        yearStr = String(d.getFullYear());
      } else {
        const today = new Date();
        monthStr = String(today.getMonth() + 1).padStart(2, '0');
        yearStr = String(today.getFullYear());
      }
    } catch (e) {
      const today = new Date();
      monthStr = String(today.getMonth() + 1).padStart(2, '0');
      yearStr = String(today.getFullYear());
    }

    return `${letter}${paddedNum}/${monthStr}/${yearStr}`;
  };

  const handleOpenQuotationModal = () => {
    const defaultDate = new Date().toISOString().split('T')[0];
    const nextNo = getNextQuotationNo(quotations, defaultDate);
    setQuotationData({
      name: '', 
      phone: '',
      email: '',
      attn: '',
      address: 'Juba, South Sudan', 
      items: [] as any[], 
      quotNo: nextNo, 
      date: defaultDate, 
      validityDays: 14,
      paymentTerms: '75% Deposit, 25% on Delivery',
      turnaroundDelivery: '3-5 working days',
      discountVal: 0,
      discountType: 'flat' as 'flat' | 'percent',
      taxRate: 0,
      notes: '1. Quotation is valid for 14 days from date of issue.\n2. 75% Advance payment is required; balance before collection.\n3. Turnaround delivery is 3-5 working days upon design approval.',
      deposit: 0
    });
    setIsQuotationModalOpen(true);
  };

  const handleOpenQuotationEditModal = (quote: Quotation) => {
    setEditingQuotationId(quote.id);
    setQuotationData({
      name: quote.name,
      phone: quote.phone || '',
      email: quote.email || '',
      attn: quote.attn || '',
      address: quote.address || 'Juba, South Sudan',
      items: quote.items || [],
      quotNo: quote.quotNo,
      date: quote.date,
      validityDays: quote.validityDays || 14,
      paymentTerms: quote.paymentTerms || '75% Deposit, 25% on Delivery',
      turnaroundDelivery: quote.turnaroundDelivery || '3-5 working days',
      discountVal: quote.discountVal || 0,
      discountType: quote.discountType || 'flat',
      taxRate: quote.taxRate || 0,
      notes: quote.notes || '',
      deposit: quote.deposit || 0
    });
    setIsQuotationModalOpen(true);
  };

  const handleQuotationDateChange = (newDate: string) => {
    setQuotationData(prev => {
      const currentPrefix = (prev.quotNo || '').split('/')[0] || 'A001';
      let monthStr = '01';
      let yearStr = '2026';
      try {
        const d = new Date(newDate);
        if (!isNaN(d.getTime())) {
          monthStr = String(d.getMonth() + 1).padStart(2, '0');
          yearStr = String(d.getFullYear());
        }
      } catch (e) {}
      return {
        ...prev,
        date: newDate,
        quotNo: `${currentPrefix}/${monthStr}/${yearStr}`
      };
    });
  };

  const updateQuotationMetadata = (updates: any) => {
    setQuotationData(prev => {
      const merged = { ...prev, ...updates };
      const valDays = merged.validityDays || 14;
      const payTerms = merged.paymentTerms || '75% Deposit, 25% on Delivery';
      const delivery = merged.turnaroundDelivery || '3-5 working days';
      const newNotes = `1. Quotation is valid for ${valDays} days from date of issue.\n2. Payment terms: ${payTerms}.\n3. Turnaround delivery is ${delivery} upon design approval.`;
      
      return {
        ...merged,
        notes: newNotes
      };
    });
  };

  const handleConvertQuoteToJob = (quote: Quotation) => {
    setSelectedQuoteForConvert(quote);
    const designers = users.filter(u => u.role === 'designer');
    setSelectedDesignerForConvert(designers[0]?.id || '');
    setConvertDepositValue(quote.deposit || 0);
    setIsConvertModalOpen(true);
  };

  const handleOpenDepositUpdateModal = (quote: Quotation) => {
    setSelectedQuoteForDeposit(quote);
    setTempDepositValue(quote.deposit || 0);
    setIsDepositModalOpen(true);
  };

  const performConversion = async (quote: Quotation, designerId?: string) => {
    let clientOptional = customers.find(c => (c.name || '').toLowerCase() === (quote.name || '').toLowerCase());
    let customerId = '';
    
    setLoading(true);
    try {
      if (!clientOptional) {
        const dynamicCust = {
          name: quote.name,
          phone: quote.phone || '',
          address: quote.address || 'Juba, South Sudan'
        };
        const res = await firebaseService.addCustomer(dynamicCust);
        customerId = res;
      } else {
        customerId = clientOptional.id;
      }
      
      const itemsForOrder = quote.items.map(item => ({
        service_id: item.serviceId || `manual-${Date.now()}`,
        service_name: item.name || item.description || 'Custom Service',
        quantity: Number(item.quantity) || 1,
        price: Number(item.price) || 0,
        price_at_time: Number(item.price) || 0
      }));

      const total = itemsForOrder.reduce((sum, item) => sum + (item.price * item.quantity), 0);
      const isMaster = user?.staff_id === 'MASTER' || user?.email === 'tekkisandereagan@gmail.com' || user?.email === 'kulyakosukusandereagan@gmail.com';
      const staffName = isMaster ? 'System' : (user?.full_name || user?.username || 'Staff');

      const createdOrderId = await firebaseService.createOrder({
        customer_id: customerId,
        customer_name: quote.name,
        total_amount: Number(total) || 0,
        description: `CONVERTED FROM QUOTE #${quote.quotNo}. Extra Details: ${quote.notes || ''}`,
        discount: quote.discountVal || 0,
        status: 'pending',
        staff_id: user.id,
        staff_name: staffName,
        assigned_staff_id: designerId || undefined,
        assigned_staff_username: users.find(u => u.id === designerId)?.full_name || undefined,
        items: itemsForOrder,
        usd_rate: Number(quote.usd_rate) || Number(usdRate)
      });

      if (quote.deposit && Number(quote.deposit) > 0) {
        await firebaseService.processPayment(createdOrderId as string, Number(quote.deposit), 'Deposit', staffName);
      }

      await firebaseService.updateQuotationStatus(quote.id, 'converted', createdOrderId as string, quote.usd_rate || Number(usdRate));
      showNotification(`Quotation #${quote.quotNo} successfully converted to Job Order!`, 'success');
    } catch (err) {
      console.error(err);
      showNotification('Conversion to Job Order failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  const generateQuotationA4Invoice = async (data: any, shouldPrint: boolean = false) => {
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
      putOnlyUsedFonts: true,
      floatPrecision: 16,
      compress: false
    });
    
    const formatWithRate = (amount: number) => formatCurrency(amount, data.usd_rate);

    const { data: logoBase64, width: logoW, height: logoH } = await getLogoBase64();
    addWatermark(doc, 210, 297, logoBase64);
    addPDFFooter(doc, 210, 297);
    
    if (logoBase64 && logoW > 0) {
      const aspect = logoW / logoH;
      const displayH = 24;
      const displayW = displayH * aspect;
      doc.addImage(logoBase64, 'PNG', 15, 10, displayW, displayH, undefined, 'NONE');
    } else {
      drawArkLogo(doc, 15, 10, 1.1);
    }
    
    doc.setTextColor(220, 38, 38);
    doc.setFontSize(26);
    doc.setFont('helvetica', 'bold');
    doc.text('ARK PRINTERS', 50, 21);
    
    doc.setFillColor(220, 38, 38);
    doc.rect(50, 24.5, 85, 4.5, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(6.5);
    doc.text('DESIGNING  |  PRINTING  |  BRANDING  |  ADVERTISING', 52, 27.7);
    
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.text('Malakia Police Station, Juba - South Sudan', 195, 14, { align: 'right' });
    doc.text('+211 921 004 501  |  +211 921 004 502', 195, 18, { align: 'right' });
    doc.text('arkprinters001@gmail.com', 195, 22, { align: 'right' });
    
    doc.setDrawColor(220, 38, 38);
    doc.setLineWidth(0.6);
    doc.line(15, 33, 195, 33);

    doc.setFillColor(51, 65, 85);
    doc.roundedRect(15, 37, 180, 8, 1, 1, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text('OFFICIAL BUSINESS INVOICE', 105, 42.2, { align: 'center' });
    
    doc.setTextColor(51, 65, 85);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.text('INVOICE TO CLIENT:', 15, 52);
    
    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.3);
    doc.line(15, 54, 100, 54);
    
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.text(String(data.name || '').toUpperCase(), 15, 59);
    
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(71, 85, 105);
    doc.text(`Address: ${data.address || 'Juba, South Sudan'}`, 15, 64);
    doc.text(`Phone: ${data.phone || 'N/A'}`, 15, 69);
    doc.text(`Email: ${data.email || 'N/A'}`, 15, 74);
    if (data.attn) {
      doc.text(`Attention: ${data.attn}`, 15, 79);
    }

    doc.setTextColor(51, 65, 85);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.text('INVOICE DETAILS:', 115, 52);
    doc.line(115, 54, 195, 54);
    
    doc.setFillColor(248, 250, 252);
    doc.roundedRect(115, 57, 80, 24, 1, 1, 'F');

    doc.setTextColor(51, 65, 85);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.text('INVOICE NO:', 118, 62);
    doc.setTextColor(220, 38, 38);
    doc.text(`#INV-${data.quotNo.split('/')[0] || data.quotNo}`, 155, 62);
    
    doc.setTextColor(51, 65, 85);
    doc.setFont('helvetica', 'normal');
    doc.text('DATE:', 118, 66);
    doc.setTextColor(0, 0, 0);
    doc.text(`${new Date().toISOString().split('T')[0]}`, 155, 66);

    doc.setTextColor(51, 65, 85);
    doc.text('REF QUOTE NO:', 118, 70);
    doc.setTextColor(0, 0, 0);
    doc.text(`#${data.quotNo}`, 155, 70);

    doc.setTextColor(51, 65, 85);
    doc.text('PAYMENT TERMS:', 118, 74);
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(8); 
    doc.text(String(data.paymentTerms || '75% Deposit, 25% on Delivery'), 155, 74);

    doc.setFontSize(8.5);
    doc.setTextColor(51, 65, 85);
    doc.text('ISSUED BY:', 118, 78);
    doc.setTextColor(0, 0, 0);
    doc.text(`${user?.full_name || 'Accounts Department'}`, 155, 78);

    const tableData = data.items.map((item: any, idx: number) => [
      String(idx + 1),
      item.name || item.description,
      item.uom || 'pcs',
      Number(item.quantity).toLocaleString(),
      formatWithRate(item.price),
      formatWithRate(item.quantity * item.price)
    ]);
    
    const subtotal = data.items.reduce((sum: number, item: any) => sum + (item.quantity * item.price), 0);
    let discountAmount = 0;
    if (data.discountType === 'percent') {
      discountAmount = subtotal * (Number(data.discountVal) || 0) / 100;
    } else {
      discountAmount = Number(data.discountVal) || 0;
    }
    const taxableAmount = subtotal - discountAmount;
    const taxRate = Number(data.taxRate) || 0;
    const taxAmount = taxableAmount * taxRate / 100;
    const grandTotal = taxableAmount + taxAmount;
    const depositPaid = Number(data.deposit) || 0;
    const balanceDue = grandTotal - depositPaid;

    autoTable(doc, {
      startY: 85,
      head: [['#', 'SERVICE / ITEM DESCRIPTION', 'UoM', 'QTY', 'UNIT PRICE', 'LINE TOTAL']],
      body: tableData,
      theme: 'grid',
      headStyles: { fillColor: [51, 65, 85], textColor: 255, fontStyle: 'bold', fontSize: 8.5 },
      columnStyles: {
        0: { cellWidth: 10, halign: 'center' },
        1: { cellWidth: 80, halign: 'left' },
        2: { cellWidth: 15, halign: 'center' },
        3: { cellWidth: 15, halign: 'center' },
        4: { cellWidth: 30, halign: 'right' },
        5: { cellWidth: 30, halign: 'right' },
      },
      styles: { fontSize: 8, cellPadding: 2.5, valign: 'middle' },
      alternateRowStyles: { fillColor: [250, 250, 250] },
    });
    
    const finalY = (doc as any).lastAutoTable?.finalY || 135;
    
    const totalsStartX = 125;
    let currentY = finalY + 8;

    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.3);
    
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(100);
    doc.text('SUBTOTAL:', totalsStartX, currentY);
    doc.setTextColor(0);
    doc.text(formatWithRate(subtotal), 195, currentY, { align: 'right' });
    
    if (discountAmount > 0) {
      currentY += 5;
      doc.setTextColor(100);
      const discLbl = data.discountType === 'percent' ? `DISCOUNT (${data.discountVal}%):` : 'DISCOUNT:';
      doc.text(discLbl, totalsStartX, currentY);
      doc.setTextColor(220, 38, 38);
      doc.text(`-${formatWithRate(discountAmount)}`, 195, currentY, { align: 'right' });
    }

    if (taxRate > 0) {
      currentY += 5;
      doc.setTextColor(100);
      doc.text(`VAT / TAX (${taxRate}%):`, totalsStartX, currentY);
      doc.setTextColor(0);
      doc.text(formatWithRate(taxAmount), 195, currentY, { align: 'right' });
    }

    currentY += 3;
    doc.setFillColor(248, 250, 252);
    doc.rect(totalsStartX, currentY, 70, 9, 'F');
    doc.setDrawColor(220, 38, 38);
    doc.setLineWidth(0.5);
    doc.rect(totalsStartX, currentY, 70, 9, 'S');
    
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9.5);
    doc.setTextColor(51, 65, 85);
    doc.text('GRAND TOTAL:', totalsStartX + 3, currentY + 6);
    doc.setTextColor(220, 38, 38);
    doc.setFontSize(10.5);
    doc.text(formatWithRate(grandTotal), 192, currentY + 6, { align: 'right' });

    // Deposit Paid Row
    currentY += 12;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(100);
    doc.text('DEPOSIT PAID:', totalsStartX, currentY);
    doc.setTextColor(16, 185, 129); // Green text for deposit
    doc.text(`-${formatWithRate(depositPaid)}`, 195, currentY, { align: 'right' });

    // Balance Due Box
    currentY += 3;
    doc.setFillColor(240, 253, 244); // Soft green background
    doc.rect(totalsStartX, currentY, 70, 9, 'F');
    doc.setDrawColor(16, 185, 129); // Emerald border
    doc.setLineWidth(0.5);
    doc.rect(totalsStartX, currentY, 70, 9, 'S');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9.5);
    doc.setTextColor(51, 65, 85);
    doc.text('BALANCE DUE:', totalsStartX + 3, currentY + 6);
    doc.setTextColor(16, 185, 129);
    doc.setFontSize(10.5);
    doc.text(formatWithRate(balanceDue), 192, currentY + 6, { align: 'right' });

    const notesY = finalY + 8;
    doc.setFontSize(8.5);
    doc.setTextColor(51, 65, 85);
    doc.setFont('helvetica', 'bold');
    doc.text('INVOICE PAYMENT TERMS:', 15, notesY);
    
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(71, 85, 105);
    
    const splitNotes = doc.splitTextToSize("All payments should be issued directly to ARK PRINTERS bank details.\nEnsure official receipts are received for all collection payments.", 100);
    doc.text(splitNotes, 15, notesY + 5);

    let sigY = Math.max(currentY + 18, notesY + (splitNotes.length * 4) + 12);
    if (sigY > 250) {
      doc.addPage();
      addWatermark(doc, 210, 297, logoBase64);
      addPDFFooter(doc, 210, 297);
      sigY = 40;
    }

    doc.setDrawColor(203, 213, 225);
    doc.setLineWidth(0.4);

    doc.line(15, sigY + 15, 80, sigY + 15);
    doc.setTextColor(100);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.text('Issued By Accounts:', 15, sigY + 19);
    doc.setTextColor(0);
    doc.setFont('helvetica', 'bold');
    doc.text(`${user?.full_name || 'Authorized Accountant'}`, 15, sigY + 23);

    doc.line(130, sigY + 15, 195, sigY + 15);
    doc.setTextColor(100);
    doc.text('Client Acknowledgement & Receipt:', 130, sigY + 19);
    doc.setTextColor(0);
    doc.setFont('helvetica', 'bold');
    doc.text(String(data.name || '').toUpperCase(), 130, sigY + 23);

    if (shouldPrint) {
      doc.autoPrint();
      const h_blob = doc.output('bloburl');
      window.open(h_blob, '_blank');
    } else {
      doc.save(`Invoice_ARK_${data.quotNo.split('/')[0] || data.quotNo}.pdf`);
    }
  };

  const generateQuotationA4DeliveryNote = async (data: any, shouldPrint: boolean = false) => {
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
      putOnlyUsedFonts: true,
      floatPrecision: 16,
      compress: false
    });
    
    const { data: logoBase64, width: logoW, height: logoH } = await getLogoBase64();
    addWatermark(doc, 210, 297, logoBase64);
    addPDFFooter(doc, 210, 297);
    
    if (logoBase64 && logoW > 0) {
      const aspect = logoW / logoH;
      const displayH = 24;
      const displayW = displayH * aspect;
      doc.addImage(logoBase64, 'PNG', 15, 10, displayW, displayH, undefined, 'NONE');
    } else {
      drawArkLogo(doc, 15, 10, 1.1);
    }
    
    doc.setTextColor(220, 38, 38);
    doc.setFontSize(26);
    doc.setFont('helvetica', 'bold');
    doc.text('ARK PRINTERS', 50, 21);
    
    doc.setFillColor(220, 38, 38);
    doc.rect(50, 24.5, 85, 4.5, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(6.5);
    doc.text('DESIGNING  |  PRINTING  |  BRANDING  |  ADVERTISING', 52, 27.7);
    
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.text('Malakia Police Station, Juba - South Sudan', 195, 14, { align: 'right' });
    doc.text('+211 921 004 501  |  +211 921 004 502', 195, 18, { align: 'right' });
    doc.text('arkprinters001@gmail.com', 195, 22, { align: 'right' });
    
    doc.setDrawColor(220, 38, 38);
    doc.setLineWidth(0.6);
    doc.line(15, 33, 195, 33);

    doc.setFillColor(71, 85, 105);
    doc.roundedRect(15, 37, 180, 8, 1, 1, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text('OFFICIAL GOODS DELIVERY NOTE', 105, 42.2, { align: 'center' });
    
    doc.setTextColor(51, 65, 85);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.text('DELIVERED TO CLIENT:', 15, 52);
    
    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.3);
    doc.line(15, 54, 100, 54);
    
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.text(String(data.name || '').toUpperCase(), 15, 59);
    
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(71, 85, 105);
    doc.text(`Address: ${data.address || 'Juba, South Sudan'}`, 15, 64);
    doc.text(`Phone: ${data.phone || 'N/A'}`, 15, 69);
    doc.text(`Email: ${data.email || 'N/A'}`, 15, 74);
    if (data.attn) {
      doc.text(`Attention: ${data.attn}`, 15, 79);
    }

    doc.setTextColor(51, 65, 85);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.text('DELIVERY DETAILS:', 115, 52);
    doc.line(115, 54, 195, 54);
    
    doc.setFillColor(248, 250, 252);
    doc.roundedRect(115, 57, 80, 24, 1, 1, 'F');

    doc.setTextColor(51, 65, 85);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.text('DELIVERY NOTE NO:', 118, 62);
    doc.setTextColor(220, 38, 38);
    doc.text(`#DN-${data.quotNo.split('/')[0] || data.quotNo}`, 155, 62);
    
    doc.setTextColor(51, 65, 85);
    doc.setFont('helvetica', 'normal');
    doc.text('DELIVERY DATE:', 118, 66);
    doc.setTextColor(0, 0, 0);
    doc.text(`${new Date().toISOString().split('T')[0]}`, 155, 66);

    doc.setTextColor(51, 65, 85);
    doc.text('REF QUOTE NO:', 118, 70);
    doc.setTextColor(0, 0, 0);
    doc.text(`#${data.quotNo}`, 155, 70);

    doc.setTextColor(51, 65, 85);
    doc.text('DELIVERED BY:', 118, 74);
    doc.setTextColor(0, 0, 0);
    doc.text(`${user?.full_name || 'ARK Logistics Team'}`, 155, 74);

    doc.setFontSize(8.5);
    doc.setTextColor(51, 65, 85);
    doc.text('STATUS:', 118, 78);
    doc.setTextColor(16, 185, 129);
    doc.setFont('helvetica', 'bold');
    doc.text('GOODS DISPATCHED', 155, 78);

    const tableData = data.items.map((item: any, idx: number) => [
      String(idx + 1),
      item.name || item.description,
      item.uom || 'pcs',
      Number(item.quantity).toLocaleString(),
      '________________',
      'OK / Good Condition'
    ]);

    autoTable(doc, {
      startY: 85,
      head: [['#', 'DELIVERED ITEM DESCRIPTION', 'UoM', 'QTY ORDERED', 'QTY DELIVERED', 'RECEIVING STATUS / COMMENTS']],
      body: tableData,
      theme: 'grid',
      headStyles: { fillColor: [71, 85, 105], textColor: 255, fontStyle: 'bold', fontSize: 8.5 },
      columnStyles: {
        0: { cellWidth: 10, halign: 'center' },
        1: { cellWidth: 80, halign: 'left' },
        2: { cellWidth: 15, halign: 'center' },
        3: { cellWidth: 20, halign: 'center' },
        4: { cellWidth: 25, halign: 'center' },
        5: { cellWidth: 30, halign: 'center' },
      },
      styles: { fontSize: 8, cellPadding: 3, valign: 'middle' },
      alternateRowStyles: { fillColor: [250, 250, 250] },
    });
    
    const finalY = (doc as any).lastAutoTable?.finalY || 135;

    const notesY = finalY + 8;
    doc.setFontSize(8.5);
    doc.setTextColor(51, 65, 85);
    doc.setFont('helvetica', 'bold');
    doc.text('DELIVERY CONDITIONS & AGREEMENT:', 15, notesY);
    
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(71, 85, 105);
    
    const splitNotes = doc.splitTextToSize("1. Client should verify all goods quality & quantities upon receipt before signing.\n2. Once delivery note is signed and stamped, goods are deemed accepted in sound condition.\n3. Any defective or missing items must be declared on this sheet.", 160);
    doc.text(splitNotes, 15, notesY + 5);

    let sigY = Math.max(notesY + (splitNotes.length * 4) + 15, 190);
    if (sigY > 250) {
      doc.addPage();
      addWatermark(doc, 210, 297, logoBase64);
      addPDFFooter(doc, 210, 297);
      sigY = 40;
    }

    doc.setDrawColor(203, 213, 225);
    doc.setLineWidth(0.4);

    doc.line(15, sigY + 15, 80, sigY + 15);
    doc.setTextColor(100);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.text('Dispatched & Delivered By:', 15, sigY + 19);
    doc.setTextColor(0);
    doc.setFont('helvetica', 'bold');
    doc.text(`${user?.full_name || 'Dispatch Personnel'}`, 15, sigY + 23);

    doc.line(130, sigY + 15, 195, sigY + 15);
    doc.setTextColor(100);
    doc.text('Customer Received (Sign & Stamp):', 130, sigY + 19);
    doc.setTextColor(0);
    doc.setFont('helvetica', 'bold');
    doc.text(String(data.name || '').toUpperCase(), 130, sigY + 23);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100);
    doc.text('Date of Receipt: ____/____/2026', 130, sigY + 27);

    if (shouldPrint) {
      doc.autoPrint();
      const h_blob = doc.output('bloburl');
      window.open(h_blob, '_blank');
    } else {
      doc.save(`DeliveryNote_ARK_${data.quotNo.split('/')[0] || data.quotNo}.pdf`);
    }
  };

  const generateQuotationPDF = async (data: any, shouldPrint: boolean = false) => {
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
      putOnlyUsedFonts: true,
      floatPrecision: 16,
      compress: false
    });
    
    const formatWithRate = (amount: number) => formatCurrency(amount, data.usd_rate);
    
    const { data: logoBase64, width: logoW, height: logoH } = await getLogoBase64();
    addWatermark(doc, 210, 297, logoBase64);
    addPDFFooter(doc, 210, 297);
    
    if (logoBase64 && logoW > 0) {
      const aspect = logoW / logoH;
      const displayH = 24;
      const displayW = displayH * aspect;
      doc.addImage(logoBase64, 'PNG', 15, 10, displayW, displayH, undefined, 'NONE');
    } else {
      drawArkLogo(doc, 15, 10, 1.1);
    }
    
    // Header Letterhead
    doc.setTextColor(220, 38, 38); // Red
    doc.setFontSize(26);
    doc.setFont('helvetica', 'bold');
    doc.text('ARK PRINTERS', 50, 21);
    
    // Tagline Bar
    doc.setFillColor(220, 38, 38);
    doc.rect(50, 24.5, 85, 4.5, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(6.5);
    doc.text('DESIGNING  |  PRINTING  |  BRANDING  |  ADVERTISING', 52, 27.7);
    
    // Contact Info (Right Side)
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.text('Malakia Police Station, Juba - South Sudan', 195, 14, { align: 'right' });
    doc.text('+211 921 004 501  |  +211 921 004 502', 195, 18, { align: 'right' });
    doc.text('arkprinters001@gmail.com', 195, 22, { align: 'right' });
    
    // Horizontal divider
    doc.setDrawColor(220, 38, 38);
    doc.setLineWidth(0.6);
    doc.line(15, 33, 195, 33);

    // Document Title Box
    doc.setFillColor(51, 65, 85); // Slate-700
    doc.roundedRect(15, 37, 180, 8, 1, 1, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text('OFFICIAL BUSINESS QUOTATION', 105, 42.2, { align: 'center' });
    
    // Sidebar/Double Column Layout for metadata (Starting Y = 50)
    // Left Column: Customer Details (Client)
    doc.setTextColor(51, 65, 85);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.text('QUOTATION ISSUED TO:', 15, 52);
    
    doc.setDrawColor(226, 232, 240); // tailwind slate-200
    doc.setLineWidth(0.3);
    doc.line(15, 54, 100, 54);
    
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.text(String(data.name || '').toUpperCase(), 15, 59);
    
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(71, 85, 105); // slate-600
    doc.text(`Address: ${data.address || 'Juba, South Sudan'}`, 15, 64);
    doc.text(`Phone: ${data.phone || 'N/A'}`, 15, 69);
    doc.text(`Email: ${data.email || 'N/A'}`, 15, 74);
    doc.text(`Attention: ${data.attn || 'Procurement Team / Finance Dept'}`, 15, 79);

    // Right Column: Quotation Metadata
    doc.setTextColor(51, 65, 85);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.text('QUOTATION DETAILS:', 115, 52);
    doc.line(115, 54, 195, 54);
    
    // Draw small slate block for Quote #
    doc.setFillColor(248, 250, 252); // slate-50 background for meta block
    doc.roundedRect(115, 57, 80, 24, 1, 1, 'F');

    doc.setTextColor(51, 65, 85);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.text('QUOTATION NO:', 118, 62);
    doc.setTextColor(220, 38, 38); // Highlight quote no in red
    doc.text(`#${data.quotNo}`, 155, 62);
    
    doc.setTextColor(51, 65, 85);
    doc.setFont('helvetica', 'normal');
    doc.text('DATE OF ISSUE:', 118, 66);
    doc.setTextColor(0, 0, 0);
    doc.text(`${data.date}`, 155, 66);

    doc.setTextColor(51, 65, 85);
    doc.text('VALIDITY PERIOD:', 118, 70);
    doc.setTextColor(0, 0, 0);
    doc.text(`${data.validityDays || 14} Days`, 155, 70);

    doc.setTextColor(51, 65, 85);
    doc.text('PAYMENT TERMS:', 118, 74);
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(8); // slightly smaller to avoid truncation if long
    doc.text(String(data.paymentTerms || '75% Deposit, 25% on Delivery'), 155, 74);

    doc.setFontSize(8.5);
    doc.setTextColor(51, 65, 85);
    doc.text('REPRESENTATIVE:', 118, 78);
    doc.setTextColor(0, 0, 0);
    doc.text(`${user?.full_name || 'Sales Department'}`, 155, 78);

    // Items table data mapping
    const tableData = data.items.map((item: any, idx: number) => [
      String(idx + 1),
      item.name || item.description,
      item.uom || 'pcs',
      Number(item.quantity).toLocaleString(),
      formatWithRate(item.price),
      formatWithRate(item.quantity * item.price)
    ]);
    
    const subtotal = data.items.reduce((sum: number, item: any) => sum + (item.quantity * item.price), 0);
    let discountAmount = 0;
    if (data.discountType === 'percent') {
      discountAmount = subtotal * (Number(data.discountVal) || 0) / 100;
    } else {
      discountAmount = Number(data.discountVal) || 0;
    }
    const taxableAmount = subtotal - discountAmount;
    const taxRate = Number(data.taxRate) || 0;
    const taxAmount = taxableAmount * taxRate / 100;
    const grandTotal = taxableAmount + taxAmount;

    // Use autoTable starting at Y=85 to give spacing
    autoTable(doc, {
      startY: 85,
      head: [['#', 'SERVICE / ITEM DESCRIPTION', 'UoM', 'QTY', 'UNIT PRICE', 'LINE TOTAL']],
      body: tableData,
      theme: 'grid',
      headStyles: { fillColor: [51, 65, 85], textColor: 255, fontStyle: 'bold', fontSize: 8.5 },
      columnStyles: {
        0: { cellWidth: 10, halign: 'center' },
        1: { cellWidth: 80, halign: 'left' },
        2: { cellWidth: 15, halign: 'center' },
        3: { cellWidth: 15, halign: 'center' },
        4: { cellWidth: 30, halign: 'right' },
        5: { cellWidth: 30, halign: 'right' },
      },
      styles: { fontSize: 8, cellPadding: 2.5, valign: 'middle' },
      alternateRowStyles: { fillColor: [250, 250, 250] },
    });
    
    const finalY = (doc as any).lastAutoTable?.finalY || 135;
    
    // Right side: Financial Totals Block
    const totalsStartX = 125;
    let currentY = finalY + 8;

    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.3);
    
    // Subtotal row
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(100);
    doc.text('SUBTOTAL:', totalsStartX, currentY);
    doc.setTextColor(0);
    doc.text(formatWithRate(subtotal), 195, currentY, { align: 'right' });
    
    // Discount row if specified
    if (discountAmount > 0) {
      currentY += 5;
      doc.setTextColor(100);
      const discLbl = data.discountType === 'percent' ? `DISCOUNT (${data.discountVal}%):` : 'DISCOUNT:';
      doc.text(discLbl, totalsStartX, currentY);
      doc.setTextColor(220, 38, 38);
      doc.text(`-${formatWithRate(discountAmount)}`, 195, currentY, { align: 'right' });
    }

    // Tax row if specified
    if (taxRate > 0) {
      currentY += 5;
      doc.setTextColor(100);
      doc.text(`VAT / TAX (${taxRate}%):`, totalsStartX, currentY);
      doc.setTextColor(0);
      doc.text(formatWithRate(taxAmount), 195, currentY, { align: 'right' });
    }

    // Grand Total box
    currentY += 3;
    doc.setFillColor(248, 250, 252);
    doc.rect(totalsStartX, currentY, 70, 9, 'F');
    doc.setDrawColor(220, 38, 38);
    doc.setLineWidth(0.5);
    doc.rect(totalsStartX, currentY, 70, 9, 'S');
    
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9.5);
    doc.setTextColor(51, 65, 85);
    doc.text('GRAND TOTAL:', totalsStartX + 3, currentY + 6);
    doc.setTextColor(220, 38, 38);
    doc.setFontSize(10.5);
    doc.text(formatWithRate(grandTotal), 192, currentY + 6, { align: 'right' });

    // Left side: Terms & Validity (starting at finalY + 8)
    const notesY = finalY + 8;
    doc.setFontSize(8.5);
    doc.setTextColor(51, 65, 85);
    doc.setFont('helvetica', 'bold');
    doc.text('TERMS & VALIDITY NOTES:', 15, notesY);
    
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(71, 85, 105);
    
    const valDays = data.validityDays || 14;
    const payTerms = data.paymentTerms || '75% Deposit, 25% on Delivery';
    const delivery = data.turnaroundDelivery || '3-5 working days';
    const rawNotes = data.notes || `1. Quotation is valid for ${valDays} days from date of issue.\n2. Payment terms: ${payTerms}.\n3. Turnaround delivery is ${delivery} upon design approval.`;
    const splitNotes = doc.splitTextToSize(rawNotes, 100);
    // Draw lines of notes
    doc.text(splitNotes, 15, notesY + 5);

    // Bottom Signatures Block
    let sigY = Math.max(currentY + 18, notesY + (splitNotes.length * 4) + 12);
    if (sigY > 250) {
      // Add a page if signature overlaps bottom margins
      doc.addPage();
      addWatermark(doc, 210, 297, logoBase64);
      addPDFFooter(doc, 210, 297);
      sigY = 40;
    }

    doc.setDrawColor(203, 213, 225); // slate-300
    doc.setLineWidth(0.4);

    // Left Signature: Prepared by
    doc.line(15, sigY + 15, 80, sigY + 15);
    doc.setTextColor(100);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.text('Prepared By:', 15, sigY + 19);
    doc.setTextColor(0);
    doc.setFont('helvetica', 'bold');
    doc.text(`${user?.full_name || 'Authorized Personnel'}`, 15, sigY + 23);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100);
    doc.text('ARK Printers Sales / Accounts', 15, sigY + 27);

    // Right Signature: Client Acceptance
    doc.line(130, sigY + 15, 195, sigY + 15);
    doc.setTextColor(100);
    doc.text('Client Acceptance (Sign & Stamp):', 130, sigY + 19);
    doc.setTextColor(0);
    doc.setFont('helvetica', 'bold');
    doc.text(String(data.name || '').toUpperCase(), 130, sigY + 23);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100);
    doc.text('Signature Date: ____/____/2026', 130, sigY + 27);

    if (shouldPrint) {
      doc.autoPrint();
      const h_blob = doc.output('bloburl');
      window.open(h_blob, '_blank');
    } else {
      doc.save(`Quotation_ARK_${data.quotNo}.pdf`);
    }
  };

  const generateRoleManualPDF = async () => {
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
      compress: false
    });

    const primaryColor = [220, 38, 38]; // Red 600

    // Header
    doc.setFillColor(30, 41, 59); // Slate 800
    doc.rect(0, 0, 210, 40, 'F');
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(24);
    doc.setFont('helvetica', 'bold');
    doc.text('ARK PRINTING MANAGEMENT', 20, 20);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'normal');
    doc.text('Organizational Role Reference Manual', 20, 30);

    let y = 55;

    Object.entries(ROLE_DEFINITIONS).forEach(([key, role]) => {
      // Check for page break
      if (y > 240) {
        doc.addPage();
        y = 30;
      }

      // Role Header Box
      doc.setFillColor(248, 250, 252); // Slate 50
      doc.setDrawColor(226, 232, 240); // Slate 200
      doc.rect(15, y, 180, 15, 'FD');
      
      doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text(role.title.toUpperCase(), 20, y + 10);
      
      y += 22;

      // Description
      doc.setTextColor(71, 85, 105); // Slate 600
      doc.setFontSize(11);
      doc.setFont('helvetica', 'italic');
      const descLines = doc.splitTextToSize(`"${role.description}"`, 170);
      doc.text(descLines, 20, y);
      y += (descLines.length * 6) + 4;

      // Duties
      doc.setTextColor(30, 41, 59); // Slate 800
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.text('CORE RESPONSIBILITIES:', 20, y);
      y += 8;

      doc.setFont('helvetica', 'normal');
      role.duties.forEach((duty) => {
        doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
        doc.circle(22, y - 1, 0.8, 'F');
        doc.text(duty, 26, y);
        y += 7;
      });

      y += 10; // Spacing between roles
    });

    // Footer
    const pageCount = doc.getNumberOfPages();
    for(let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(9);
        doc.setTextColor(148, 163, 184);
        doc.text(`ARK System Document - Generated on ${new Date().toLocaleDateString()}`, 20, 285);
        doc.text(`Page ${i} of ${pageCount}`, 170, 285);
    }

    doc.save('ARK_Organizational_Role_Manual.pdf');
  };

  const generateSoftwareGuidelinePDF = async () => {
    const doc = new jsPDF({ 
      orientation: 'portrait', 
      unit: 'mm', 
      format: 'a4',
      putOnlyUsedFonts: true,
      floatPrecision: 16,
      compress: false
    });
    const { data: logoBase64 } = await getLogoBase64();
    addWatermark(doc, 210, 297, logoBase64);
    
    // Header
    doc.setFillColor(220, 38, 38);
    doc.rect(0, 0, 210, 40, 'F');
    
    doc.setTextColor(255);
    doc.setFontSize(24);
    doc.setFont('helvetica', 'bold');
    doc.text('SOFTWARE USER GUIDELINE', 20, 25);
    
    if (logoBase64) {
      doc.addImage(logoBase64, 'PNG', 170, 5, 30, 30, undefined, 'NONE');
    }
    
    doc.setTextColor(0);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    
    let y = 50;
    
    // Overview
    doc.setFont('helvetica', 'bold');
    doc.text('1. Overview', 20, y);
    y += 10;
    doc.setFont('helvetica', 'normal');
    const overviewText = "The Print Shop Management System is a comprehensive solution designed to streamline the workflow of a modern printing business. It manages everything from customer relations and order tracking to inventory control and staff performance reporting.";
    const splitOverview = doc.splitTextToSize(overviewText, 170);
    doc.text(splitOverview, 20, y);
    y += splitOverview.length * 7 + 5;
    
    // User Roles
    doc.setFont('helvetica', 'bold');
    doc.text('2. User Roles & Permissions', 20, y);
    y += 5;
    
    const roles = [
      ['Admin', 'Full system access, staff management, and financial oversight.'],
      ['Supervisor', 'Oversees production, approves designs, and manages inventory.'],
      ['Receptionist', 'Customer registration, order creation, and payment processing.'],
      ['Designer', 'Handles design tasks, updates design status, and submits for QA.'],
      ['Operator', 'Manages production tasks and monitors material usage.']
    ];
    
    autoTable(doc, {
      startY: y,
      head: [['Role', 'Responsibilities']],
      body: roles,
      headStyles: { fillColor: [51, 65, 85] }, // Slate-700
      margin: { left: 20, right: 20 }
    });
    
    y = (doc as any).lastAutoTable?.finalY || y + 40;
    y += 15;
    
    // Workflow
    doc.setFont('helvetica', 'bold');
    doc.text('3. Standard Order Workflow', 20, y);
    y += 5;
    
    const workflow = [
      ['Step 1: Intake', 'Receptionist registers customer and creates a new order.'],
      ['Step 2: Design', 'Designer receives order and starts the creative process.'],
      ['Step 3: QA', 'Design is submitted for Quality Assessment and Approval.'],
      ['Step 4: Production', 'Operator starts printing/production after approval.'],
      ['Step 5: Completion', 'Order is marked as done and customer is notified.'],
      ['Step 6: Payment', 'Receptionist processes final payment and issues invoice.']
    ];
    
    autoTable(doc, {
      startY: y,
      head: [['Stage', 'Description']],
      body: workflow,
      headStyles: { fillColor: [220, 38, 38] },
      margin: { left: 20, right: 20 }
    });
    
    y = (doc as any).lastAutoTable?.finalY || y + 40;
    y += 15;
    
    // Modules
    doc.setFont('helvetica', 'bold');
    doc.text('4. Key Modules', 20, y);
    y += 10;
    doc.setFont('helvetica', 'normal');
    doc.text('- Dashboard: Real-time statistics and quick alerts.', 25, y); y += 7;
    doc.text('- Orders: Central hub for tracking work progress.', 25, y); y += 7;
    doc.text('- Inventory: Monitor stock levels and material costs.', 25, y); y += 7;
    doc.text('- Customers: Manage client history and contact details.', 25, y); y += 7;
    doc.text('- Reports: Analyze staff productivity and commissions.', 25, y); y += 7;

    doc.save('PrintShop_Software_Guideline.pdf');
  };

  const showNotification = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 5000);
  };

  // Login State
  const [loginData, setLoginData] = useState({ username: '', password: '', businessCode: '' });
  const [loginMode, setLoginMode] = useState<'signin' | 'register'>('signin');
  const [regData, setRegData] = useState({
    businessName: '',
    businessCode: '',
    adminUsername: '',
    adminFullName: '',
    adminEmail: '',
    adminPassword: '',
  });
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [selectedCustomerId, setSelectedCustomerId] = useState('');
  const [orderDescription, setOrderDescription] = useState('');
  const [orderDiscount, setOrderDiscount] = useState<number>(0);
  const [selectedItems, setSelectedItems] = useState<{serviceId: string, name: string, price: number, quantity: number, cost?: number}[]>([]);
  const [manualItemName, setManualItemName] = useState('');
  const [manualItemPrice, setManualItemPrice] = useState<number | string>('');

  const handleCreatePurchase = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPurchase.item || !newPurchase.country || !newPurchase.unitPrice || !newPurchase.quantity) {
      showNotification("All fields are required to record a purchase.", "error");
      return;
    }
    const upVal = parseFloat(newPurchase.unitPrice);
    const qtyVal = parseInt(newPurchase.quantity, 10);
    if (isNaN(upVal) || upVal <= 0) {
      showNotification("Unit Price must be a positive number.", "error");
      return;
    }
    if (isNaN(qtyVal) || qtyVal <= 0) {
      showNotification("Quantity must be a positive integer.", "error");
      return;
    }

    try {
      setLoading(true);
      const todayString = new Date().toISOString().split('T')[0];
      const purchaseObj = {
        item: newPurchase.item.trim(),
        country: newPurchase.country.trim(),
        unit_price: upVal,
        quantity: qtyVal,
        date: todayString,
        created_at: serverTimestamp(),
        recorded_by: user?.username || user?.email || "Admin"
      };

      await addDoc(collection(db, "purchases"), purchaseObj);
      showNotification("Purchase successfully recorded in ledger!", "success");
      setNewPurchase({ item: '', country: '', unitPrice: '', quantity: '' });
    } catch (err: any) {
      console.error("Error creating purchase:", err);
      showNotification(`Failed to record purchase: ${err.message}`, "error");
    } finally {
      setLoading(false);
    }
  };

  const handleDeletePurchase = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this purchase record?")) return;
    try {
      setLoading(true);
      await deleteDoc(doc(db, "purchases", id));
      showNotification("Purchase record deleted successfully.", "success");
    } catch (err: any) {
      console.error("Error deleting purchase:", err);
      showNotification(`Failed to delete purchase record: ${err.message}`, "error");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateOrder = async (cid?: string, forcedStaffId?: string) => {
    const finalCustomerId = cid || selectedCustomerId;
    if (!finalCustomerId) {
      showNotification('Please select a customer', 'error');
      return;
    }
    if (selectedItems.length === 0) {
      showNotification('Please add at least one service', 'error');
      return;
    }

    setLoading(true);
    try {
      const itemsForOrder = selectedItems.map(item => ({
        service_id: item.serviceId,
        service_name: item.name,
        quantity: Number(item.quantity) || 1,
        price: Number(item.price) || 0,
        price_at_time: Number(item.price) || 0,
        unit_cost: Number(item.cost) || 0
      }));

      const total = itemsForOrder.reduce((sum, item) => sum + (item.price * item.quantity), 0);
      const totalCost = itemsForOrder.reduce((sum, item) => sum + (item.unit_cost * item.quantity), 0);
      const profit = total - totalCost;
      const customer = customers.find(c => c.id === finalCustomerId);
      
      const targetStaffId = forcedStaffId || assignedStaffId;
      
      const isMaster = user?.staff_id === 'MASTER' || user?.email === 'tekkisandereagan@gmail.com' || user?.email === 'kulyakosukusandereagan@gmail.com';
      const staffName = isMaster ? 'System' : (user?.full_name || user?.username || 'Staff');
      
      await firebaseService.createOrder({
        customer_id: finalCustomerId,
        customer_name: customer?.name || 'Unknown Customer',
        total_amount: Number(total) || 0,
        total_profit: profit,
        description: orderDescription || '',
        discount: orderDiscount || 0,
        status: 'pending',
        staff_id: user.id,
        staff_name: staffName,
        referrer_id: selectedReferrerId || undefined,
        assigned_staff_id: targetStaffId || undefined,
        assigned_staff_username: users.find(u => u.id === targetStaffId)?.full_name || undefined,
        items: itemsForOrder,
        usd_rate: Number(usdRate)
      });

      setSelectedCustomerId('');
      setSelectedReferrerId('');
      setAssignedStaffId('');
      setOrderDescription('');
      setOrderDiscount(0);
      setSelectedItems([]);
      setActiveTab('orders');
      await fetchDashboardData();
      showNotification('Order created successfully!', 'success');
    } catch (err) {
      console.error("Error creating order:", err);
      const msg = err instanceof Error ? err.message : String(err);
      if (msg.toLowerCase().includes('permission-denied') || msg.toLowerCase().includes('insufficient permissions')) {
        showNotification('Permission Denied: Your account role may not have order creation rights.', 'error');
      } else {
        showNotification('Failed to create order. Please try again.', 'error');
      }
    } finally {
      setLoading(false);
    }
  };

  const addServiceToOrder = (service: Service) => {
    setSelectedItems(prev => {
      const existing = prev.find(item => item.serviceId === service.id);
      if (existing) {
        return prev.map(item => item.serviceId === service.id ? { ...item, quantity: item.quantity + 1 } : item);
      }
      return [...prev, { serviceId: service.id, name: service.name, price: service.price, quantity: 1 }];
    });
  };
  useEffect(() => {
    window.onerror = (msg, url, lineNo, columnNo, error) => {
      showNotification(`System Error: ${msg}`, 'error');
      return false;
    };
  }, []);

  const navItems = useMemo(() => [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, roles: ['admin', 'receptionist', 'operator', 'designer', 'supervisor', 'sales_marketing'] },
    { id: 'orders', label: 'Order Queue', icon: ShoppingCart, roles: ['admin', 'receptionist', 'operator', 'designer', 'supervisor', 'sales_marketing'] },
    { id: 'tasks', label: 'Production Tasks', icon: CheckSquare, roles: ['admin', 'receptionist', 'operator', 'designer', 'supervisor', 'sales_marketing'] },
    { id: 'jobs_done', label: 'Jobs Done', icon: CheckCircle2, roles: ['admin', 'receptionist', 'supervisor'] },
    { id: 'quotations', label: 'Quotations', icon: FileText, roles: ['admin', 'receptionist', 'supervisor', 'sales_marketing'] },
    { id: 'customers', label: 'Customers', icon: Users, roles: ['admin', 'receptionist', 'supervisor', 'sales_marketing'] },
    { id: 'services', label: 'Services & Stock', icon: Package, roles: ['admin', 'receptionist', 'supervisor'] },
    { id: 'analytics', label: 'Analytics', icon: BarChart3, roles: ['admin', 'supervisor'] },
    { id: 'finances', label: 'Financing', icon: Wallet, roles: ['admin', 'receptionist', 'supervisor'] },
    { id: 'commissions', label: 'My Commissions', icon: DollarSign, roles: ['admin', 'receptionist', 'operator', 'designer', 'supervisor', 'sales_marketing'] },
    { id: 'chat', label: 'Staff Chat', icon: MessageSquare, roles: ['admin', 'receptionist', 'operator', 'designer', 'supervisor', 'sales_marketing'] },
    { id: 'reports', label: 'Daily Reports', icon: FileText, roles: ['admin', 'receptionist', 'supervisor'] },
    { id: 'debts', label: 'Debt Tracker', icon: Landmark, roles: ['admin', 'receptionist', 'supervisor'] },
    { id: 'purchase_ledger', label: 'Purchase Ledger', icon: BookOpen, roles: ['admin', 'supervisor'] },
    { id: 'staff', label: 'Staff Management', icon: Shield, roles: ['admin', 'supervisor'] },
    { id: 'new-order', label: 'New Order', icon: PlusCircle, roles: ['admin', 'receptionist', 'supervisor'] },
    { id: 'manual', label: 'User Manual', icon: BookOpen, roles: ['admin', 'supervisor'], hidden: true },
    { id: 'settings', label: 'Settings', icon: Settings, roles: ['admin', 'receptionist', 'operator', 'designer', 'supervisor', 'sales_marketing'] },
  ], [user?.email]);

  const filteredNav = navItems.filter(item => {
    if (item.hidden) return false;
    if (isMaster) return true;
    return item.roles.includes(user?.role || '');
  });

  // Ensure active screen is always one the user is permitted to see
  useEffect(() => {
    if (!user || !navItems) return;
    
    // Manual check for master user bypass on technical manual tab
    if (activeTab === 'manual' && !isMaster && user.role !== 'admin') {
      setActiveTab('dashboard');
      return;
    }

    const isAllowed = navItems.some(item => 
      item.id === activeTab && 
      (item.roles.includes(user.role) || isMaster)
    );

    if (!isAllowed && activeTab !== 'dashboard') {
      setActiveTab('dashboard');
    }
  }, [user?.role, activeTab, navItems, user?.email]);

  useEffect(() => {
    if (user && authChecked) {
      fetchDashboardData();
    }
  }, [user?.id, authChecked]);

  const notifyDevice = (title: string, body: string) => {
    if ('Notification' in window && window.Notification.permission === 'granted') {
      new window.Notification(title, { body });
    }
  };

  // Real-time synchronization for core entities
  useEffect(() => {
    if (!user) return;

    const unsubscribers: (() => void)[] = [];

    // Real-time Users (Staff)
    const usersQuery = query(collection(db, "users"));
    const unsubUsers = onSnapshot(usersQuery, (snapshot) => {
      try {
        const allUsers = snapshot.docs
          .map(doc => ({ id: doc.id, ...doc.data() } as User))
          .filter(u => u.staff_id !== 'MASTER' && u.email !== 'tekkisandereagan@gmail.com' && u.email !== 'kulyakosukusandereagan@gmail.com');
        
        // Deduplicate by email, preferring those with a real Firebase UID
        const userMap = new Map<string, User>();
        allUsers.forEach(u => {
          const emailKey = u.email || `${u.username}@arkprinters.com`;
          const existing = userMap.get(emailKey);
          const isEmailId = u.id.includes('@');
          const existingIsEmailId = existing ? existing.id.includes('@') : true;

          if (!existing || (existingIsEmailId && !isEmailId)) {
             userMap.set(emailKey, u);
          }
        });

        const dedupedUsers = Array.from(userMap.values());
        setUsers(dedupedUsers);
        
        // Update current user...
        const updatedProfile = allUsers.find(usr => usr.id === user?.id || usr.email === user?.email);
        if (updatedProfile) {
          if (updatedProfile.suspended || updatedProfile.locked) {
            setRawUser(null);
            showNotification('Your account has been suspended by the administrator.', 'error');
            return;
          }
          setRawUser(prev => {
            if (!prev) return null;
            // Strict check for changes including role
            if (prev.commission_balance === updatedProfile.commission_balance && 
                prev.role === updatedProfile.role && 
                prev.full_name === updatedProfile.full_name &&
                prev.suspended === updatedProfile.suspended &&
                prev.locked === updatedProfile.locked &&
                prev.terms_accepted === updatedProfile.terms_accepted) {
              return prev;
            }
            console.log("Profile updated from server:", updatedProfile.role);
            return { ...prev, ...updatedProfile };
          });
        }
      } catch (err) {
        console.error("User sync processing error:", err);
      }
    }, (error) => {
      // Don't crash on permission errors during role transitions
      if (error.code !== 'permission-denied') {
        handleFirestoreError(error, OperationType.LIST, "users");
      }
    });
    unsubscribers.push(unsubUsers);

    // Real-time Services (Visible to all staff for order creation and inventory monitoring)
    const canSeeServices = isManagementUser || user?.role === 'receptionist' || user?.role === 'designer' || user?.role === 'operator' || user?.role === 'sales_marketing';
    let unsubServices = () => {};
    let unsubAssets = () => {};
    if (canSeeServices) {
      const servicesQuery = query(collection(db, "services"));
      unsubServices = onSnapshot(servicesQuery, (snapshot) => {
        const servicesList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Service));
        // Sort services alphabetically by name
        servicesList.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
        setServices(servicesList);
      }, (error) => {
        if (error.code !== 'permission-denied') {
          handleFirestoreError(error, OperationType.LIST, "services");
        }
      });
      
      const assetsQuery = query(collection(db, "assets"));
      unsubAssets = onSnapshot(assetsQuery, (snapshot) => {
        const assetsList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Asset));
        assetsList.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
        setAssets(assetsList);
      }, (error) => {
        if (error.code !== 'permission-denied') {
          handleFirestoreError(error, OperationType.LIST, "assets");
        }
      });
    }
    unsubscribers.push(unsubServices);
    unsubscribers.push(unsubAssets);

    // Real-time Customers
    const customersQuery = query(collection(db, "customers"));
    const unsubCustomers = onSnapshot(customersQuery, (snapshot) => {
      const customersList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Customer));
      setCustomers(customersList);
    }, (error) => {
      if (error.code !== 'permission-denied') {
        handleFirestoreError(error, OperationType.LIST, "customers");
      }
    });
    unsubscribers.push(unsubCustomers);

    // Real-time Settings
    const settingsQuery = query(collection(db, "settings"));
    const unsubSettings = onSnapshot(settingsQuery, (snapshot) => {
      const activeTenantId = firebaseService.getTenantInfo().id;
      const tenantPrefix = activeTenantId ? `${activeTenantId}_` : 'default_tenant_';
      
      snapshot.docs.forEach(doc => {
        const data = doc.data();
        const isCurrentTenantDoc = doc.id.startsWith(tenantPrefix);
        const isLegacyDoc = !doc.id.includes('_');
        
        if (isCurrentTenantDoc || isLegacyDoc) {
          const key = isCurrentTenantDoc ? doc.id.substring(tenantPrefix.length) : doc.id;
          if (key === 'usd_rate') {
            const val = String(data.value || '');
            if (val) {
              setUsdRate(Number(val));
              setUsdRateValue(val);
            }
          } else if (key === 'logo_base64') {
            const val = String(data.value || '');
            if (val) {
              setCustomLogoUrl(val);
            }
          }
        }
      });
    }, (error) => {
      if (error.code !== 'permission-denied') {
        console.error("Error watching settings:", error);
      }
    });
    unsubscribers.push(unsubSettings);

    // Real-time Quotations
    const quotationsQuery = query(collection(db, "quotations"));
    const unsubQuotations = onSnapshot(quotationsQuery, (snapshot) => {
      let quotationsList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Quotation));
      // Sort manually or rely on Firestore, manual is safer to avoid composite index errors
      quotationsList.sort((a, b) => {
        const timeA = a.created_at?.toMillis?.() || 0;
        const timeB = b.created_at?.toMillis?.() || 0;
        return timeB - timeA;
      });
      setQuotations(quotationsList);
    }, (error) => {
      if (error.code !== 'permission-denied') {
        handleFirestoreError(error, OperationType.LIST, "quotations");
      }
    });
    unsubscribers.push(unsubQuotations);

    // Real-time Finances (Visible to all management and staff handling payments)
    const canSeeFinances = isManagementUser || user?.role === 'receptionist';
    
    if (canSeeFinances) {
      const expensesQuery = query(collection(db, "expenses"));
      const unsubExpenses = onSnapshot(expensesQuery, (snapshot) => {
        const expenseList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Expense));
        setFinances(prev => ({ ...prev, expenses: expenseList }));
      }, (error) => {
        if (error.code !== 'permission-denied') {
          handleFirestoreError(error, OperationType.LIST, "expenses");
        }
      });
      unsubscribers.push(unsubExpenses);

      const fundingQuery = query(collection(db, "funding"));
      const unsubFunding = onSnapshot(fundingQuery, (snapshot) => {
        const fundingList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Funding));
        setFinances(prev => ({ ...prev, funding: fundingList }));
      }, (error) => {
        if (error.code !== 'permission-denied') {
          handleFirestoreError(error, OperationType.LIST, "funding");
        }
      });
      unsubscribers.push(unsubFunding);

      const paymentsQuery = query(collection(db, "payments"));
      const unsubPayments = onSnapshot(paymentsQuery, (snapshot) => {
        const paymentList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Payment));
        setFinances(prev => ({ ...prev, payments: paymentList }));
      }, (error) => {
        if (error.code !== 'permission-denied') {
          handleFirestoreError(error, OperationType.LIST, "payments");
        }
      });
      unsubscribers.push(unsubPayments);
    }

    // Real-time Purchases
    const canSeePurchases = isManagementUser || user?.role === 'admin' || user?.role === 'supervisor' || user?.staff_id === 'MASTER';
    if (canSeePurchases) {
      const purchasesQuery = query(collection(db, "purchases"));
      const unsubPurchases = onSnapshot(purchasesQuery, (snapshot) => {
        const purchaseList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Purchase));
        purchaseList.sort((a, b) => {
          const dateA = a.created_at?.toMillis?.() || new Date(a.date || 0).getTime();
          const dateB = b.created_at?.toMillis?.() || new Date(b.date || 0).getTime();
          return dateB - dateA;
        });
        setPurchases(purchaseList);
      }, (error) => {
        if (error.code !== 'permission-denied') {
          handleFirestoreError(error, OperationType.LIST, "purchases");
        }
      });
      unsubscribers.push(unsubPurchases);
    }

    // Real-time Notifications
    // We use a simplified query and filter client-side to avoid index requirements in preview
    const notesQuery = query(
      collection(db, "notifications"),
      orderBy("created_at", "desc"),
      limit(50)
    );

    const unsubNotes = onSnapshot(notesQuery, (snapshot) => {
      const notesList = snapshot.docs
        .map(doc => ({ id: doc.id, ...doc.data() } as AppNotification))
        .filter(note => {
          const isForMe = note.user_id === user.id;
          const isForMyRole = note.role === user.role;
          const isForAll = note.user_id === 'all' || note.role === 'all';
          const isAdmin = isAdminUser;
          return (isForMe || isForMyRole || isForAll || isAdmin);
        })
        .sort((a, b) => (b.created_at?.toMillis?.() || 0) - (a.created_at?.toMillis?.() || 0));
      
      // Show toast for new notifications that haven't been read
      snapshot.docChanges().forEach((change) => {
        if (change.type === "added") {
          const note = change.doc.data() as AppNotification;
          // Filter again for the added note
          const isForMe = note.user_id === user.id;
          const isForMyRole = note.role === user.role;
          const isForCategory = note.user_id === 'all' || note.role === 'all';
          
          if (isForMe || isForMyRole || isForCategory) {
            const isChatMessage = note.message.includes('New message');
            if (!isChatMessage || activeTab !== 'chat') {
              showNotification(note.message, 'success');
              notifyDevice("ARK System Notification", note.message);
            }
          }
        }
      });

      setAppNotifications(notesList);
    }, (error) => {
       if (error.code !== 'permission-denied') {
         handleFirestoreError(error, OperationType.LIST, "notifications");
       }
    });
    unsubscribers.push(unsubNotes);

    return () => unsubscribers.forEach(unsub => unsub());
  }, [user?.id, user?.role, user?.staff_id, user?.email]);

  // Real-time Orders Synchronization
  useEffect(() => {
    if (!user) return;

    const dates = { 
      start: new Date(filterDateRange.start), 
      end: new Date(new Date(filterDateRange.end).setHours(23, 59, 59, 999)) 
    };

    const isAuthorizedForFullView = isAuthorisedForPayments || isManagementUser;
    
    let ordersQuery;
    if (isAuthorizedForFullView) {
      ordersQuery = query(
        collection(db, "orders"),
        orderBy("created_at", "desc")
      );
    } else if (user?.role === 'sales_marketing') {
      ordersQuery = query(
        collection(db, "orders"),
        where("referrer_id", "==", user.id)
      );
    } else {
      // Designers and Operators strictly see only their assigned work
      // Removed orderBy to avoid requiring a composite index; sorting happens client-side
      ordersQuery = query(
        collection(db, "orders"),
        where("assigned_staff_id", "==", user.id)
      );
    }

    const unsubscribe = onSnapshot(ordersQuery, (snapshot) => {
      let ordersList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as any));
      
      // Sort manually: most recent activity first (favor updated_at or created_at)
      ordersList.sort((a, b) => {
        const timeA = a.updated_at?.toMillis?.() || a.created_at?.toMillis?.() || 0;
        const timeB = b.updated_at?.toMillis?.() || b.created_at?.toMillis?.() || 0;
        return timeB - timeA;
      });
      
    const isPrivileged = isManagementUser;
    const isReceptionistOrStaff = user?.role === 'receptionist' || user?.role === 'designer' || user?.role === 'operator' || user?.role === 'sales_marketing';
    
    const startT = dates.start.getTime();
    const endT = dates.end.getTime();

    // Post-fetch filtering
    ordersList = ordersList.filter(order => {
      // Date Filter: Include if order was created OR updated/completed in the period
      const createdTime = order.created_at?.toMillis?.() || 0;
      const updatedTime = order.updated_at?.toMillis?.() || 0;
      const completedTime = order.stage_history?.completed?.toMillis?.() || 0;
      
      const isInCreatedRange = createdTime >= startT && createdTime <= endT;
      const isInUpdatedRange = (updatedTime >= startT && updatedTime <= endT) || (completedTime >= startT && completedTime <= endT);

      // We want orders that were either created in this period 
      // OR orders that are currently pending work tracking (to show in queues)
      // OR orders that are financially outstanding (have debt/unpaid)
      // OR orders that were finished/paid in this period
      const isWorkPending = !['completed', 'paid', 'cancelled', 'ready_for_payment'].includes(order.status || '');
      const isDebtOutstanding = order.payment_status !== 'paid' && order.status !== 'cancelled';
      
      if (!isInCreatedRange && !isInUpdatedRange && !isWorkPending && !isDebtOutstanding) return false;

      // Staff Visibility Filter: Specialists see assigned work OR unassigned work in their target stage
      if (user?.role === 'designer' || user?.role === 'operator') {
        const isAssignedToMe = order.assigned_staff_id === user.id;
        
        // Show only if strictly assigned to me OR if it's history I was involved in
        const isInvolvedInHistory = (order.status === 'completed' || order.status === 'paid' || order.status === 'done_awaiting_invoice') && 
                                    (order.designer_id === user.id || order.operator_id === user.id);

        if (!isAssignedToMe && !isInvolvedInHistory) {
          return false;
        }
      }

      if (user?.role === 'sales_marketing') {
        if (order.referrer_id !== user.id) {
          return false;
        }
      }

      // History restriction for others (receptionists see all history in range)
      const isHistory = order.status === 'completed' || order.payment_status === 'paid' || order.status === 'paid' || order.status === 'done_awaiting_invoice';
      const canSeeHistory = isPrivileged || user?.role === 'receptionist' || user?.role === 'sales_marketing';
      if (!canSeeHistory && isHistory) return false;
      
      return true;
    });

      ordersList.sort((a, b) => (b.updated_at?.toMillis?.() || b.created_at?.toMillis?.() || 0) - (a.updated_at?.toMillis?.() || a.created_at?.toMillis?.() || 0));
      setRawOrders(ordersList);
    }, (error) => {
      if (error.code !== 'permission-denied') {
        handleFirestoreError(error, OperationType.LIST, "orders");
      }
    });

    return () => {
      unsubscribe();
    };
  }, [user?.id, user?.role, filterDateRange.start, filterDateRange.end]);

  // Local calculation for Stats and Reports to save Quota
  useEffect(() => {
    if (!orders || !users) return;

    const dates = { 
      start: new Date(filterDateRange.start), 
      end: new Date(new Date(filterDateRange.end).setHours(23, 59, 59, 999)) 
    };

    // Calculate Dashboard Stats
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    const periodOrders = orders.filter(o => {
      if (!o.created_at) return false;
      const d = o.created_at?.toDate ? o.created_at.toDate() : new Date(o.created_at);
      return d >= dates.start && d <= dates.end;
    });

    const isDoneStatus = (status: string) => ['completed', 'paid', 'ready_for_payment', 'done_awaiting_invoice'].includes(status);

    const jobsRegistered = periodOrders.length;
    const jobsDoneAndPaid = periodOrders.filter(o => isDoneStatus(o.status) && o.payment_status === 'paid').length;
    const jobsDoneAndUnpaid = periodOrders.filter(o => isDoneStatus(o.status) && o.payment_status !== 'paid').length;

    // Today's Sales Calculation (Strictly Today)
    const todayStr = new Date().toDateString();
    const todaySalesAmount = finances.payments.filter(p => {
        const d = p.created_at?.toDate ? p.created_at.toDate() : new Date(p.created_at);
        return d.toDateString() === todayStr;
    }).reduce((sum, p) => sum + (p.amount || 0), 0);

    const periodRevenue = periodOrders.reduce((sum, o) => sum + (o.total_amount || 0) * (1 - (o.discount || 0) / 100), 0);
    const periodSales = finances.payments
      .filter(p => {
        const d = p.created_at?.toDate ? p.created_at.toDate() : new Date(p.created_at);
        return d >= dates.start && d <= dates.end;
      })
      .reduce((sum, p) => sum + (p.amount || 0), 0);

    // Dynamic Period Summaries
    const getSummary = (pStart: Date, pEnd: Date) => {
      const pOrders = orders.filter(o => {
        if (!o.created_at) return false;
        const d = o.created_at?.toDate ? o.created_at.toDate() : new Date(o.created_at);
        return d >= pStart && d <= pEnd;
      });

      // Sales represents the TOTAL contract value of registered jobs during this period
      const pRevenue = pOrders.reduce((sum, o) => {
        const total = (o.total_amount || 0) * (1 - (o.discount || 0) / 100);
        return sum + total;
      }, 0);

      // ACTUAL payments/cash collections received during this period
      const pSalesAmount = (finances.payments || [])
        .filter(p => {
          if (!p.created_at) return false;
          const d = p.created_at?.toDate ? p.created_at.toDate() : new Date(p.created_at);
          return d >= pStart && d <= pEnd;
        })
        .reduce((sum, p) => sum + (p.amount || 0), 0);
      
      const pFundingsAmount = (finances.funding || []).filter(f => {
        if (!(f as any).created_at) return false;
        const d = (f as any).created_at?.toDate ? (f as any).created_at.toDate() : new Date((f as any).created_at);
        return d >= pStart && d <= pEnd;
      }).reduce((sum, f) => sum + (f.amount || 0), 0);
      
      const pExpensesAmount = (finances.expenses || []).filter(e => {
        if (e.status !== 'approved') return false; 
        if (!(e as any).created_at) return false;
        const d = (e as any).created_at?.toDate ? (e as any).created_at.toDate() : new Date((e as any).created_at);
        return d >= pStart && d <= pEnd;
      }).reduce((sum, e) => sum + (e.amount || 0), 0);
      
      const pArrears = pOrders.reduce((sum, o) => {
        const total = (o.total_amount || 0) * (1 - (o.discount || 0) / 100);
        const paid = o.paid_amount || 0;
        return sum + Math.max(0, total - paid);
      }, 0);

      // Since pSalesAmount is already the actual cash collected during this period, net cash is simply collections + capital funding - expenses
      const pCash = pSalesAmount + pFundingsAmount - pExpensesAmount;

      const pRecoveredDebtsAmount = (finances.payments || [])
        .filter(p => {
          if (!p.created_at) return false;
          const d = p.created_at?.toDate ? p.created_at.toDate() : new Date(p.created_at);
          if (!(d >= pStart && d <= pEnd)) return false;
          const order = orders.find(o => o.id === p.order_id);
          if (!order) return false;
          const oDate = order.created_at?.toDate ? order.created_at.toDate() : new Date(order.created_at);
          return isRecoveredDebtPayment(d, oDate);
        })
        .reduce((sum, p) => sum + (p.amount || 0), 0);

      const pDirectSalesAmount = (finances.payments || [])
        .filter(p => {
          if (!p.created_at) return false;
          const d = p.created_at?.toDate ? p.created_at.toDate() : new Date(p.created_at);
          if (!(d >= pStart && d <= pEnd)) return false;
          const order = orders.find(o => o.id === p.order_id);
          if (!order) return true; // fallback
          const oDate = order.created_at?.toDate ? order.created_at.toDate() : new Date(order.created_at);
          return !isRecoveredDebtPayment(d, oDate);
        })
        .reduce((sum, p) => sum + (p.amount || 0), 0);

      const isDoneStatus = (status: string) => ['completed', 'paid', 'ready_for_payment', 'done_awaiting_invoice'].includes(status);
      const isPendingStatus = (status: string) => !['completed', 'paid', 'cancelled', 'done_awaiting_invoice', 'ready_for_payment'].includes(status);
      
      return {
        sales: pRevenue,
        fundings: pFundingsAmount,
        expenses: pExpensesAmount,
        arrears: pArrears,
        cash: pCash,
        jobsRegistered: pOrders.length,
        jobsPending: pOrders.filter(o => isPendingStatus(o.status || '')).length,
        jobsDoneAndPaid: pOrders.filter(o => isDoneStatus(o.status || '') && o.payment_status === 'paid').length,
        jobsDoneAndUnpaid: pOrders.filter(o => isDoneStatus(o.status || '') && o.payment_status !== 'paid' && (!o.paid_amount || o.paid_amount === 0)).length,
        jobsDoneAndPartiallyPaid: pOrders.filter(o => isDoneStatus(o.status || '') && o.payment_status !== 'paid' && (o.paid_amount || 0) > 0).length,
        recoveredDebts: pRecoveredDebtsAmount,
        directSales: pDirectSalesAmount
      };
    };
    
    // Custom Cards
    const c1Start = new Date(card1Dates.start + 'T00:00:00');
    const c1End = new Date(card1Dates.end + 'T23:59:59.999');
    const c2Start = new Date(card2Dates.start + 'T00:00:00');
    const c2End = new Date(card2Dates.end + 'T23:59:59.999');
    const c3Start = new Date(card3Dates.start + 'T00:00:00');
    const c3End = new Date(card3Dates.end + 'T23:59:59.999');

    const todaySummary = getSummary(c1Start, c1End);
    const thisMonthSummary = getSummary(c2Start, c2End);
    const lastMonthSummary = getSummary(c3Start, c3End);

    // All-time Cash Calculation (True Balance)
    const allTimeSales = finances.payments.reduce((sum, p) => sum + (p.amount || 0), 0);
    const allTimeExpenses = finances.expenses
      .filter(e => e.status === 'approved')
      .reduce((sum, e) => sum + (e.amount || 0), 0);
    const allTimeFunding = finances.funding.reduce((sum, f) => sum + (f.amount || 0), 0);
    const actualCashAtHand = allTimeSales + allTimeFunding - allTimeExpenses;

    // All-time Arrears (Cumulative Debt)
    const cumulativeArrears = orders
      .filter(o => o.payment_status !== 'paid' && o.status !== 'cancelled')
      .reduce((sum, o) => {
        const total = (o.total_amount || 0) * (1 - (o.discount || 0) / 100);
        const paid = o.paid_amount || 0;
        return sum + Math.max(0, total - paid);
      }, 0);

    // Period Arrears (strictly orders from this period)
    const periodArrears = periodOrders
      .filter(o => o.payment_status !== 'paid' && o.status !== 'cancelled')
      .reduce((sum, o) => {
        const total = (o.total_amount || 0) * (1 - (o.discount || 0) / 100);
        const paid = o.paid_amount || 0;
        return sum + Math.max(0, total - paid);
      }, 0);

    const filteredExpenses = finances.expenses.filter(e => {
        if (e.status !== 'approved') return false; 
        if (!(e as any).created_at) return true;
        const d = (e as any).created_at?.toDate ? (e as any).created_at.toDate() : new Date((e as any).created_at);
        return d >= dates.start && d <= dates.end;
    });

    const filteredFunding = finances.funding.filter(f => {
        if (!(f as any).created_at) return true;
        const d = (f as any).created_at?.toDate ? (f as any).created_at.toDate() : new Date((f as any).created_at);
        return d >= dates.start && d <= dates.end;
    });

    const totalFunding = filteredFunding.reduce((sum, f) => sum + (f.amount || 0), 0);
    const totalExpenses = filteredExpenses.reduce((sum, e) => sum + (e.amount || 0), 0);

    const periodRecoveredDebts = (finances.payments || [])
      .filter(p => {
        if (!p.created_at) return false;
        const d = p.created_at?.toDate ? p.created_at.toDate() : new Date(p.created_at);
        if (!(d >= dates.start && d <= dates.end)) return false;
        const order = orders.find(o => o.id === p.order_id);
        if (!order) return false;
        const oDate = order.created_at?.toDate ? order.created_at.toDate() : new Date(order.created_at);
        return isRecoveredDebtPayment(d, oDate);
      })
      .reduce((sum, p) => sum + (p.amount || 0), 0);

    const periodDirectSales = (finances.payments || [])
      .filter(p => {
        if (!p.created_at) return false;
        const d = p.created_at?.toDate ? p.created_at.toDate() : new Date(p.created_at);
        if (!(d >= dates.start && d <= dates.end)) return false;
        const order = orders.find(o => o.id === p.order_id);
        if (!order) return true; // fallback
        const oDate = order.created_at?.toDate ? order.created_at.toDate() : new Date(order.created_at);
        return !isRecoveredDebtPayment(d, oDate);
      })
      .reduce((sum, p) => sum + (p.amount || 0), 0);

    const periodCash = periodSales + totalFunding - totalExpenses;

    setStats({
      todaySummary,
      thisMonthSummary,
      lastMonthSummary,
      todaySales: todaySalesAmount,
      dailySales: periodSales, 
      monthlyRevenue: periodRevenue, 
      jobsRegistered,
      jobsDoneAndPaid,
      jobsDoneAndUnpaid,
      pendingOrders: periodOrders.filter(o => {
        if (['completed', 'paid', 'cancelled', 'done_awaiting_invoice', 'ready_for_payment'].includes(o.status || '')) return false;
        if (user?.role === 'designer' || user?.role === 'operator') return o.assigned_staff_id === user?.id;
        return true;
      }).length,
      lowStockAlerts: services.filter(s => s.stock <= s.minimum_stock).length,
      pendingApprovals: periodOrders.filter(o => o.status === 'at_designer' && !o.approval).length,
      totalExpenses,
      totalFunding,
      totalArrears: cumulativeArrears,
      periodDebts: periodArrears,
      totalCash: periodCash,
      trueBalance: actualCashAtHand,
      pendingInvoices: periodOrders.filter(o => o.status === 'done_awaiting_invoice').length,
      allTimeSales: allTimeSales,
      periodRecoveredDebts,
      periodDirectSales
    });

    // Calculate Staff Reports
    const reports = users.map(u => {
      let workCount = 0;
      let totalValue = 0;
      const involvedOrders: any[] = [];

      orders.forEach(o => {
        const stageHistory = (o as any).stage_history || {};
        const designStage = stageHistory.at_designer;
        const prodStage = stageHistory.production;
        const completedStage = stageHistory.completed;
        
        const designerId = designStage?.staff_id || (o as any).designer_id;
        const operatorId = prodStage?.staff_id || (o as any).operator_id;

        const isDesigner = designerId === u.id;
        const isOperator = operatorId === u.id;
        const isAssigned = o.assigned_staff_id === u.id;

        // Check if work happened in range
        const designDate = designStage?.completed?.toDate?.() || designStage?.date?.toDate?.() || null;
        const prodDate = prodStage?.completed?.toDate?.() || prodStage?.date?.toDate?.() || null;
        const compDate = completedStage?.toDate?.() || o.updated_at?.toDate?.() || null;

        const isInRange = (d: any) => d && d >= dates.start && d <= dates.end;
        
        if (isDesigner || isOperator || isAssigned) {
          const workedInRange = isInRange(designDate) || isInRange(prodDate) || isInRange(compDate) || isInRange(o.created_at?.toDate?.());
          if (!workedInRange) return;

          involvedOrders.push(o);
          
          const hasSharedDifferent = designerId && operatorId && designerId !== operatorId;
          
          if (hasSharedDifferent && (isDesigner || isOperator)) {
            workCount += 0.5;
            totalValue += (o.total_amount || 0) * 0.5;
          } else {
             workCount += 1;
             totalValue += (o.total_amount || 0);
          }
        }
      });

      return {
        ...u,
        work_count: workCount,
        total_value: totalValue,
        orders: involvedOrders
      };
    });
    setStaffReports(reports);

  }, [orders, users, services, filterDateRange.start, filterDateRange.end, card1Dates, card2Dates, card3Dates]);

  useEffect(() => {
    if (user && authChecked) {
      fetchDashboardData();
    }
  }, [filterDateRange.start, filterDateRange.end, user?.id, authChecked]);

  if (!authChecked) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-red-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-slate-500 font-bold animate-pulse text-xs tracking-widest uppercase">Initializing Printing Manager...</p>
        </div>
      </div>
    );
  }

  const fetchDashboardData = async () => {
    try {
      if (!user) return;

      // Fetch USD Rate & Logo (settings) once
      const settings = await firebaseService.getSettings();
      if (settings.usd_rate) {
        setUsdRate(Number(settings.usd_rate));
        setUsdRateValue(settings.usd_rate);
      }
      if (settings.logo_base64) {
        setCustomLogoUrl(settings.logo_base64);
      }
      
      // Finances, Stats, Reports are now all handled via onSnapshot and local effects
    } catch (err) {
      console.error("Error fetching data:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenStaffDetail = (u: any) => {
    setSelectedStaff(u);
    setIsEditingStaff(false);
    setEditStaffData({
      full_name: u.full_name || '',
      username: u.username || '',
      email: u.email || '',
      position: u.position || '',
      role: u.role || 'operator'
    });
    setIsStaffDetailModalOpen(true);
  };

  const scanForDeletedStaff = async () => {
    setIsScanningDeletedStaff(true);
    setScannedDeletedStaffOnce(true);
    try {
      const usersSnap = await getDocs(collection(db, "users"));
      const activeUsers = usersSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as any));
      const activeUserIds = new Set(activeUsers.map(u => u.id));
      const activeUsernames = new Set(activeUsers.map(u => (u.username || '').toLowerCase()));
      const activeEmails = new Set(activeUsers.map(u => (u.email || '').toLowerCase()));

      const ordersSnap = await getDocs(collection(db, "orders"));
      const allOrders = ordersSnap.docs.map(doc => doc.data() as any);

      const expensesSnap = await getDocs(collection(db, "expenses"));
      const allExpenses = expensesSnap.docs.map(doc => doc.data() as any);

      const missingMap = new Map<string, {
        id: string;
        username: string;
        full_name: string;
        email: string;
        guessedRole: string;
        staff_id: string;
        source: string;
      }>();

      const addMissing = (id: string, name: string, username: string, email: string, role: string, source: string) => {
        if (!id || id === 'MASTER' || id === 'system' || id === 'System') return;
        
        if (activeUserIds.has(id)) return;
        if (username && activeUsernames.has(username.toLowerCase())) return;
        if (email && activeEmails.has(email.toLowerCase())) return;

        const existing = missingMap.get(id);
        if (!existing) {
          missingMap.set(id, {
            id,
            username: username || name.toLowerCase().replace(/\s+/g, ''),
            full_name: name,
            email: email || (username ? `${username}@arkprinters.com` : `${name.toLowerCase().replace(/\s+/g, '')}@arkprinters.com`),
            guessedRole: role,
            staff_id: 'STF-' + Math.random().toString(36).substr(2, 5).toUpperCase(),
            source
          });
        } else {
          if (!existing.username && username) existing.username = username;
          if (!existing.full_name && name) existing.full_name = name;
          if (!existing.email && email) existing.email = email;
          if (role !== 'operator' && existing.guessedRole === 'operator') {
            existing.guessedRole = role;
          }
        }
      };

      allOrders.forEach(o => {
        if (o.assigned_staff_id) {
          addMissing(
            o.assigned_staff_id,
            o.assigned_staff_name || o.assigned_staff_username || 'Unknown Staff',
            o.assigned_staff_username || '',
            '',
            'operator',
            'Order assignment'
          );
        }
        if (o.designer_id) {
          addMissing(
            o.designer_id,
            o.designer_name || 'Unknown Designer',
            '',
            '',
            'designer',
            'Order design stage'
          );
        }
        if (o.operator_id) {
          addMissing(
            o.operator_id,
            o.operator_name || 'Unknown Operator',
            '',
            '',
            'operator',
            'Order production stage'
          );
        }
        if (o.referrer_id) {
          addMissing(
            o.referrer_id,
            'Referrer',
            '',
            '',
            'sales_marketing',
            'Order referral'
          );
        }
        if (o.staff_id) {
          addMissing(
            o.staff_id,
            o.staff_name || 'Unknown Staff',
            '',
            '',
            'receptionist',
            'Order creator'
          );
        }
      });

      allExpenses.forEach(e => {
        if (e.staff_id) {
          addMissing(
            e.staff_id,
            e.staff_name || 'Unknown Staff',
            '',
            '',
            'operator',
            'Expense recorder'
          );
        }
        if (e.recorded_by) {
          addMissing(
            e.recorded_by,
            e.recorder_name || 'Unknown Staff',
            '',
            '',
            'receptionist',
            'Expense filer'
          );
        }
      });

      setDeletedStaffList(Array.from(missingMap.values()));
      showNotification(`Found ${missingMap.size} potentially deleted staff members!`, 'success');
    } catch (err: any) {
      console.error("Error scanning for deleted staff:", err);
      showNotification("Scan failed: " + (err.message || err), "error");
    } finally {
      setIsScanningDeletedStaff(false);
    }
  };

  const updateDeletedStaffField = (id: string, field: string, value: string) => {
    setDeletedStaffList(prev => prev.map(s => s.id === id ? { ...s, [field]: value } : s));
  };

  const restoreStaffMember = async (staff: any) => {
    try {
      setLoading(true);
      
      const profileData: any = {
        username: staff.username,
        full_name: staff.full_name,
        role: staff.guessedRole,
        position: staff.guessedRole.charAt(0).toUpperCase() + staff.guessedRole.slice(1),
        email: staff.email,
        password: "password123",
        staff_id: staff.staff_id,
        commission_balance: 0,
        created_at: serverTimestamp(),
        suspended: false,
        locked: false
      };

      await setDoc(doc(db, "users", staff.id), profileData);

      showNotification(`Staff member ${staff.full_name} successfully restored! Default password: password123`, 'success');
      setDeletedStaffList(prev => prev.filter(s => s.id !== staff.id));
      fetchDashboardData();
    } catch (err: any) {
      console.error("Restoration failed:", err);
      showNotification("Failed to restore: " + (err.message || err), "error");
    } finally {
      setLoading(false);
    }
  };

  const handleOpenOrderDetail = async (order: Order) => {
    setSelectedOrder(order);
    setIsEditingOrder(false);
    setIsDeliveryNoteFormExpanded(false);
    setDeliveryQuantities({});
    setEditOrderData({
      customer_name: order.customer_name || '',
      description: order.description || '',
      total_amount: order.total_amount || 0,
      assigned_staff_id: order.assigned_staff_id || '',
      assigned_staff_username: order.assigned_staff_username || '',
      status: order.status || ''
    });
    setIsOrderDetailModalOpen(true);
    try {
      const items = await firebaseService.getOrderItems(order.id);
      setSelectedOrder(prev => prev && prev.id === order.id ? { ...prev, items } : prev);
      const initialQtys: {[itemId: string]: number} = {};
      items.forEach((item: any, idx: number) => {
        const itemId = item.id || item.service_id || String(idx);
        initialQtys[itemId] = item.quantity;
      });
      setDeliveryQuantities(initialQtys);
    } catch (err) {
      console.error("Fetch items error:", err);
    }
  };

  const handleRegisterTenant = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!regData.businessName || !regData.businessCode || !regData.adminUsername || !regData.adminFullName || !regData.adminPassword) {
      showNotification("Please fill in all registration fields.", "error");
      return;
    }
    
    setLoading(true);
    try {
      const code = regData.businessCode.trim().toLowerCase();
      if (!/^[a-z0-9-]+$/.test(code)) {
        throw new Error("Shortcode must contain only lowercase letters, numbers, and dashes (no spaces).");
      }

      await firebaseService.registerTenantBusiness(
        regData.businessName,
        code,
        {
          username: regData.adminUsername,
          full_name: regData.adminFullName,
          email: regData.adminEmail,
          password: regData.adminPassword
        }
      );

      showNotification(`Business ${regData.businessName} registered successfully! You can now log in with shortcode: ${code}`, 'success');
      
      // Auto-populate login parameters
      setLoginData({
        username: regData.adminUsername,
        password: regData.adminPassword,
        businessCode: code
      });
      setLoginMode('signin');
    } catch (err: any) {
      console.error("Registration error:", err);
      showNotification(err.message || "Failed to register new business.", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    setLoading(true);
    try {
      const authUser = await firebaseService.login(loginData);
      if (authUser.suspended || authUser.locked) {
        throw new Error('Access denied: Your account has been suspended by the administrator.');
      }
      setUser({ 
        ...authUser, 
        email: authUser.email || authUser.username || "", 
        role: (authUser.role || 'guest').toLowerCase() as any 
      });
      
      // Request notification permission
      if ('Notification' in window && window.Notification.permission === 'default') {
        await window.Notification.requestPermission();
      }
      showNotification(`Welcome back, ${authUser.full_name}!`, 'success');
    } catch (err: any) {
      console.error("Login error:", err);
      let errorMessage = "Access denied: wrong password or username.";
      
      if (err.code === 'auth/user-not-found' || err.code === 'auth/invalid-credential') {
        errorMessage = "Access denied: This email/username is not registered, or the password is incorrect.";
      } else if (err.code === 'auth/wrong-password') {
        errorMessage = "Access denied: Incorrect password or security key.";
      } else if (err.message && err.message.includes("User profile not found")) {
        errorMessage = "Verification failed: Your account exists in Auth, but your staff profile could not be found in Firestore. Please contact administration.";
      } else if (err.message) {
        errorMessage = `Login error: ${err.message}`;
      }
      
      showNotification(errorMessage, 'error');
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    if (showOtpScreen) {
      return (
        <div className="min-h-screen bg-slate-950 flex items-center justify-center overflow-hidden font-sans relative">
          {/* Ambient Security Background */}
          <div className="absolute inset-0 bg-gradient-to-b from-slate-900 to-black pointer-events-none">
            <div className="absolute top-0 right-0 w-1/2 h-full bg-indigo-500/5 skew-x-[-15deg] translate-x-1/2 opacity-30"></div>
            <div className="absolute bottom-0 left-0 w-1/2 h-1/2 bg-red-500/5 rounded-full blur-[150px] -translate-x-1/2 translate-y-1/2 opacity-30"></div>
          </div>

          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="relative w-full max-w-md bg-slate-900 border border-slate-800 rounded-[2.5rem] shadow-2xl p-8 md:p-10 mx-4 text-center overflow-hidden"
          >
            {/* Visual lock accent */}
            <div className="mx-auto w-16 h-16 rounded-full bg-amber-500/10 border border-amber-500/30 flex items-center justify-center mb-6 text-amber-500 animate-pulse">
              <ShieldAlert className="w-8 h-8" />
            </div>

            <h3 className="text-xl font-black text-white uppercase tracking-tight">Security Verification</h3>
            <p className="text-slate-400 text-xs mt-2 font-medium">Single-Device Security Policy is Active</p>

            <div className="bg-slate-950/80 border border-slate-800/80 rounded-2xl p-4 my-6 text-left space-y-2">
              <p className="text-slate-300 text-xs font-bold leading-relaxed whitespace-pre-wrap">
                {otpMessage || "A verification message with an OTP code has been sent to your primary Gmail."}
              </p>
              {sendingOtp && (
                <div className="flex items-center gap-2 text-indigo-400 text-[11px] font-bold">
                  <span className="w-2 h-2 rounded-full bg-indigo-400 animate-ping"></span>
                  Sending OTP security code via Gmail...
                </div>
              )}
            </div>

            <form onSubmit={handleVerifyOtp} className="space-y-6">
              <div>
                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 text-left">Enter 6-Digit OTP Code</label>
                <input 
                  type="text" 
                  maxLength={6}
                  required
                  placeholder="------"
                  value={enteredOtp}
                  onChange={(e) => setEnteredOtp(e.target.value.replace(/\D/g, ''))}
                  className="w-full text-center tracking-[0.5em] font-mono text-2xl font-black py-3 rounded-2xl border border-slate-800 bg-slate-950 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              {/* Secure Channel Fail-safe / Resend Options */}
              <div className="border-t border-slate-800 pt-4 mt-2">
                <p className="text-slate-500 text-[10px] font-bold uppercase tracking-wider mb-2 text-left">Didn't receive the code?</p>
                <button
                  type="button"
                  disabled={sendingOtp || loading}
                  onClick={() => handleResendOtp('gmail')}
                  className="w-full py-2.5 bg-indigo-950 hover:bg-indigo-900 border border-indigo-800 text-indigo-200 text-xs font-bold rounded-xl transition-colors flex items-center justify-center gap-1.5 disabled:opacity-50"
                >
                  📧 Resend secure code via Gmail
                </button>
              </div>

              <div className="flex gap-3 pt-2">
                <button 
                  type="button"
                  onClick={handleCancelOtp}
                  className="flex-1 py-3 bg-slate-950 hover:bg-slate-900 text-slate-400 border border-slate-800 font-black rounded-xl text-xs uppercase tracking-wider transition-all"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  disabled={loading || enteredOtp.length < 6}
                  className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-black rounded-xl text-xs uppercase tracking-wider transition-all disabled:opacity-40"
                >
                  Verify Device
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      );
    }


    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center overflow-hidden">
        {/* Background Decorative Elements */}
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-600 to-indigo-900 pointer-events-none">
          <div className="absolute top-0 right-0 w-1/2 h-full bg-white skew-x-[-15deg] translate-x-1/2 opacity-5"></div>
          <div className="absolute bottom-0 left-0 w-1/2 h-1/2 bg-blue-500 rounded-full blur-[120px] -translate-x-1/2 translate-y-1/2 opacity-20"></div>
        </div>

        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="relative w-full max-w-4xl grid md:grid-cols-2 bg-white rounded-[2rem] shadow-2xl overflow-hidden m-4 z-10"
        >
          {/* Brand Side */}
          <div className="hidden md:flex flex-col items-center justify-center p-12 bg-slate-900 text-white relative">
            <div className="absolute inset-0 opacity-10">
              <div className="grid grid-cols-8 gap-2 p-4">
                {Array.from({ length: 64 }).map((_, i) => (
                  <div key={i} className="w-2 h-2 bg-white rounded-full"></div>
                ))}
              </div>
            </div>
            
            <div className="relative w-32 h-32 mb-8 z-10">
              <img src={customLogoUrl || `/logo.png?t=${Date.now()}`} alt={`${tenantName} Logo`} className="w-full h-full object-contain filter invert" />
              <div className="absolute inset-x-0 -bottom-2 h-1 bg-indigo-500 blur-sm rounded-full"></div>
            </div>
            
            <div className="text-center z-10">
              <h2 className="text-3xl font-black tracking-tight mb-2">{tenantName}</h2>
              <p className="text-indigo-400 text-[10px] font-black uppercase tracking-[0.2em] mb-4">Multi-Tenant Print ERP Engine</p>
              <p className="text-slate-400 text-sm font-medium">South Sudan's Premier Cloud ERP for Print, Design, & Branding Agencies</p>
            </div>
            
            <div className="mt-12 flex flex-wrap justify-center gap-4 z-10">
              {['Multi-Tenant', 'Designing', 'Printing', 'Billing'].map(tag => (
                <span key={tag} className="px-3 py-1 bg-white/5 border border-white/10 rounded-full text-[10px] font-black uppercase tracking-widest">{tag}</span>
              ))}
            </div>

            <button 
              onClick={() => setShowProductDemo(true)}
              className="mt-12 flex items-center gap-3 px-6 py-3 bg-white/10 hover:bg-white/20 border border-white/20 rounded-2xl transition-all z-10 group"
            >
              <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Play className="w-4 h-4 text-white fill-current" />
              </div>
              <div className="text-left">
                <p className="text-[10px] font-black uppercase tracking-widest text-white/60">Product Showcase</p>
                <p className="text-xs font-bold text-white">Watch Video Demo</p>
              </div>
            </button>
          </div>

          {/* Form Side */}
          <div className="p-8 md:p-12 flex flex-col justify-center bg-white">
            <div className="md:hidden flex flex-col items-center mb-8">
               <img src={customLogoUrl || `/logo.png?t=${Date.now()}`} alt={`${tenantName} Logo`} className="w-20 h-20 object-contain mb-4 filter invert" />
               <h1 className="text-2xl font-black text-slate-900">{tenantName}</h1>
               <p className="text-[9px] font-black text-indigo-500 uppercase tracking-widest mt-1">MULTI-TENANT SYSTEM</p>
            </div>

            {/* Form Mode Selector */}
            <div className="flex border-b border-slate-100 mb-8 p-1 bg-slate-50 rounded-2xl">
              <button 
                type="button"
                onClick={() => setLoginMode('signin')}
                className={`flex-1 py-3 text-center text-xs font-black uppercase tracking-wider rounded-xl transition-all ${
                  loginMode === 'signin' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400 hover:text-slate-600'
                }`}
              >
                Sign In
              </button>
              <button 
                type="button"
                onClick={() => setLoginMode('register')}
                className={`flex-1 py-3 text-center text-xs font-black uppercase tracking-wider rounded-xl transition-all ${
                  loginMode === 'register' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400 hover:text-slate-600'
                }`}
              >
                Register Business
              </button>
            </div>

            {loginMode === 'signin' ? (
              <>
                <div className="mb-6 flex items-center justify-between">
                  <div>
                    <h3 className="text-xl font-black text-slate-900 mb-1">Welcome Back</h3>
                    <p className="text-xs font-bold text-slate-500">Access your business dashboard workflow.</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setUser({
                        id: 'demo-admin-id',
                        username: 'admin',
                        full_name: 'Master Admin (Demo)',
                        email: 'admin@jubaprint.com',
                        role: 'admin',
                        staff_id: 'MASTER'
                      } as any);
                    }}
                    className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-[11px] rounded-xl transition shadow-md cursor-pointer flex items-center gap-1 shrink-0"
                  >
                    <span>Instant Demo Login</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                <form onSubmit={handleLogin} className="space-y-4">
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Business Code / ID</label>
                    <div className="relative">
                       <Landmark className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                       <input 
                        type="text" 
                        className="w-full pl-11 pr-4 py-3 rounded-2xl border border-slate-200 focus:ring-2 focus:ring-indigo-600 focus:border-transparent outline-none transition-all font-medium text-slate-700 text-sm"
                        placeholder="junub (leave blank for main tenant)"
                        value={loginData.businessCode}
                        onChange={e => setLoginData({...loginData, businessCode: e.target.value})}
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Username or Email</label>
                    <div className="relative">
                       <Users className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                       <input 
                        type="text" 
                        required
                        className="w-full pl-11 pr-4 py-3 rounded-2xl border border-slate-200 focus:ring-2 focus:ring-indigo-600 focus:border-transparent outline-none transition-all font-medium text-slate-700 text-sm"
                        placeholder="admin"
                        value={loginData.username}
                        onChange={e => setLoginData({...loginData, username: e.target.value})}
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Security Key / Password</label>
                    <div className="relative">
                       <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                       <input 
                        type={showLoginPassword ? "text" : "password"} 
                        required
                        className="w-full pl-11 pr-12 py-3 rounded-2xl border border-slate-200 focus:ring-2 focus:ring-indigo-600 focus:border-transparent outline-none transition-all font-medium text-slate-700 text-sm"
                        placeholder="••••••••"
                        value={loginData.password}
                        onChange={e => setLoginData({...loginData, password: e.target.value})}
                      />
                      <button
                        type="button"
                        onClick={() => setShowLoginPassword(!showLoginPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none p-1.5 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer flex items-center justify-center"
                        title={showLoginPassword ? "Hide password" : "Show password"}
                      >
                        {showLoginPassword ? (
                          <EyeOff className="w-4 h-4" />
                        ) : (
                          <Eye className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>
                  <button 
                    type="submit"
                    disabled={loading}
                    className="w-full bg-indigo-600 text-white py-3.5 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-100 flex items-center justify-center gap-3 disabled:opacity-50 cursor-pointer"
                  >
                    {loading ? 'Authenticating...' : 'Enter Dashboard'}
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </form>
              </>
            ) : (
              <>
                <div className="mb-6">
                  <h3 className="text-xl font-black text-slate-900 mb-1">Register Printing Business</h3>
                  <p className="text-xs font-bold text-slate-500">Create a secure tenant profile for your printing shop.</p>
                </div>

                <form onSubmit={handleRegisterTenant} className="space-y-4 max-h-[420px] overflow-y-auto pr-1">
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Business / Agency Name</label>
                    <div className="relative">
                       <Landmark className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                       <input 
                        type="text" 
                        required
                        className="w-full pl-11 pr-4 py-3 rounded-2xl border border-slate-200 focus:ring-2 focus:ring-indigo-600 focus:border-transparent outline-none transition-all font-medium text-slate-700 text-sm"
                        placeholder="Junub Printing Ltd"
                        value={regData.businessName}
                        onChange={e => setRegData({...regData, businessName: e.target.value})}
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Business Code / Shortcode (No spaces)</label>
                    <div className="relative">
                       <PlusCircle className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                       <input 
                        type="text" 
                        required
                        className="w-full pl-11 pr-4 py-3 rounded-2xl border border-slate-200 focus:ring-2 focus:ring-indigo-600 focus:border-transparent outline-none transition-all font-medium text-slate-700 text-sm"
                        placeholder="junub-juba"
                        value={regData.businessCode}
                        onChange={e => setRegData({...regData, businessCode: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '')})}
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Admin Full Name</label>
                    <div className="relative">
                       <Users className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                       <input 
                        type="text" 
                        required
                        className="w-full pl-11 pr-4 py-3 rounded-2xl border border-slate-200 focus:ring-2 focus:ring-indigo-600 focus:border-transparent outline-none transition-all font-medium text-slate-700 text-sm"
                        placeholder="Reagan Sande"
                        value={regData.adminFullName}
                        onChange={e => setRegData({...regData, adminFullName: e.target.value})}
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Admin Username</label>
                    <div className="relative">
                       <Users className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                       <input 
                        type="text" 
                        required
                        className="w-full pl-11 pr-4 py-3 rounded-2xl border border-slate-200 focus:ring-2 focus:ring-indigo-600 focus:border-transparent outline-none transition-all font-medium text-slate-700 text-sm"
                        placeholder="admin"
                        value={regData.adminUsername}
                        onChange={e => setRegData({...regData, adminUsername: e.target.value})}
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Admin Email Address</label>
                    <div className="relative">
                       <Users className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                       <input 
                        type="email" 
                        required
                        className="w-full pl-11 pr-4 py-3 rounded-2xl border border-slate-200 focus:ring-2 focus:ring-indigo-600 focus:border-transparent outline-none transition-all font-medium text-slate-700 text-sm"
                        placeholder="admin@junub.com"
                        value={regData.adminEmail}
                        onChange={e => setRegData({...regData, adminEmail: e.target.value})}
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Admin Security Key / Password</label>
                    <div className="relative">
                       <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                       <input 
                        type="password" 
                        required
                        className="w-full pl-11 pr-4 py-3 rounded-2xl border border-slate-200 focus:ring-2 focus:ring-indigo-600 focus:border-transparent outline-none transition-all font-medium text-slate-700 text-sm"
                        placeholder="••••••••"
                        value={regData.adminPassword}
                        onChange={e => setRegData({...regData, adminPassword: e.target.value})}
                      />
                    </div>
                  </div>
                  <button 
                    type="submit"
                    disabled={loading}
                    className="w-full bg-indigo-600 text-white py-3.5 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-100 flex items-center justify-center gap-3 disabled:opacity-50 cursor-pointer"
                  >
                    {loading ? 'Creating Business...' : 'Create Printing Business'}
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </form>
              </>
            )}

            <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
               <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest">v2.5.0 (Tenant Enabled)</span>
               <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest">Built for Juba, SS</span>
            </div>
          </div>
        </motion.div>

        {showProductDemo && <ProductDemo onClose={() => setShowProductDemo(false)} />}
      </div>
    );
  }

  const formatCurrency = (amount: number, overrideRate?: number) => {
    if (currency === 'USD') {
      const rateToUse = overrideRate || usdRate;
      return `$ ${(amount / rateToUse).toFixed(2)}`;
    }
    return `${amount?.toLocaleString() || 0} SSP`;
  };

  const usdToSsp = (val: number | undefined | null) => {
    const rate = Number(usdRate) || 130;
    const price = Number(val) || 0;
    return price * rate;
  };

  const formatUSD = (val: number | undefined | null) => `$ ${(Number(val) || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  const formatDate = (date: any) => {
    if (!date) return 'N/A';
    try {
      // Handle nested timestamp object { seconds, nanoseconds } or { timestamp: ... }
      const actualDate = date.timestamp || date;
      const d = actualDate.toDate ? actualDate.toDate() : (actualDate instanceof Date ? actualDate : new Date(actualDate));
      if (isNaN(d.getTime())) return 'N/A';
      return d.toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' });
    } catch {
      return 'N/A';
    }
  };

  const handleForwardOrder = async (order: Order) => {
    let nextStatus: Status = order.status || 'pending';
    
    switch(order.status) {
      case 'pending': 
        // If already assigned to an operator, skip design
        const assignedUser = users.find(u => u.id === order.assigned_staff_id);
        if (assignedUser?.role === 'operator') {
          nextStatus = 'production';
        } else {
          nextStatus = 'at_designer';
        }
        break;
      case 'at_designer': nextStatus = 'production'; break;
      case 'production': nextStatus = 'done_awaiting_invoice'; break;
      case 'done_awaiting_invoice': 
        if (order.payment_status === 'paid') {
          nextStatus = 'completed';
        } else {
          showNotification('Order must be paid before marking as taken', 'error');
          return;
        }
        break;
      default: return;
    }
    
    // Always prompt for staff selection when moving to a stage that requires a specific role
    const needsNewAssignment = (nextStatus === 'at_designer' || nextStatus === 'production');

    if (needsNewAssignment) {
      const eligibleUsers = users.filter(u => 
        (nextStatus === 'at_designer' && u.role === 'designer') || 
        (nextStatus === 'production' && u.role === 'operator')
      );
      
      if (eligibleUsers.length > 0) {
        setConfirmModal({
          isOpen: true,
          title: `Assign to ${nextStatus === 'at_designer' ? 'Designer' : 'Operator'}`,
          message: `Select staff member for this ${nextStatus.replace('_', ' ')} stage:`,
          onConfirm: async (selectedStaffIdInModal?: string) => {
             const targetStaffId = selectedStaffIdInModal || eligibleUsers[0].id;
             const targetStaffName = users.find(u => u.id === targetStaffId)?.full_name || 'Staff';
             try {
               await firebaseService.updateOrderStatus(order.id, nextStatus, targetStaffId, targetStaffName);
               fetchDashboardData();
               showNotification(`Order moved to ${nextStatus.replace('_', ' ')} and assigned to ${targetStaffName}`, 'success');
             } catch (err) {
               showNotification('Forward failed', 'error');
             }
             setConfirmModal(null);
          },
          selectionOptions: eligibleUsers.map(u => ({ id: u.id, label: u.full_name }))
        });
        return;
      } else {
        // If no specialists found AND current user is not privileged, don't just auto-assign
        if (user?.role !== 'admin' && user?.role !== 'supervisor' && user?.staff_id !== 'MASTER') {
          showNotification(`No eligible ${nextStatus === 'at_designer' ? 'Designers' : 'Operators'} found to assign.`, 'error');
          return;
        }
      }
    }

    try {
      const staffName = isMaster ? 'System' : (user?.full_name || user?.username || 'Staff');
      await firebaseService.updateOrderStatus(order.id, nextStatus, user?.id || '', staffName);
      fetchDashboardData();
      showNotification(`Order moved to ${nextStatus.replace('_', ' ')}`, 'success');
    } catch (err) {
      showNotification('Failed to forward order', 'error');
    }
  };


  if (isAdminLockedDown) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-8">
        <div className="max-w-md w-full bg-white rounded-3xl p-12 text-center shadow-2xl">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center text-red-600 mx-auto mb-8">
            <Lock className="w-10 h-10" />
          </div>
          <h1 className="text-3xl font-black text-slate-900 mb-4">Service Suspended</h1>
          <p className="text-slate-600 mb-8 leading-relaxed">
            The application is currently locked by the administrator. This may be due to maintenance or pending subscription payments. 
            Please contact support or the master administrator to resolve this.
          </p>
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 text-sm text-slate-500 italic">
            Reference ID: {user?.id || 'GUEST-LOCK'}
          </div>
          <div className="mt-8 flex flex-col gap-3">
            {isMaster ? (
              <button 
                onClick={() => setIsAdminLockedDown(false)}
                className="w-full bg-slate-900 text-white py-4 rounded-2xl font-black hover:bg-black transition-all shadow-lg flex items-center justify-center gap-3"
              >
                <Unlock className="w-5 h-5" />
                Emergency Override (Master Only)
              </button>
            ) : (
              <button 
                onClick={async () => {
                  try {
                    await signOut(auth);
                    setUser(null);
                  } catch (err) {
                    console.error("Sign out error:", err);
                  }
                }}
                className="w-full bg-slate-100 text-slate-600 py-4 rounded-2xl font-bold hover:bg-slate-200 transition-all flex items-center justify-center gap-3"
              >
                <LogOut className="w-5 h-5" />
                Switch to Master Account
              </button>
            )}
            
            <button 
              onClick={() => window.location.href = "mailto:support@longun.tech"}
              className="text-slate-400 text-sm font-medium hover:text-slate-600 transition-colors"
            >
              Contact System Provider
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row relative max-w-[100vw] overflow-x-hidden">
      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsSidebarOpen(false)}
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[60] md:hidden"
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 z-[70] w-64 bg-white border-r border-slate-200 flex flex-col transition-transform duration-300 md:relative md:translate-x-0
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative w-12 h-12 flex-shrink-0">
              <img 
                src={customLogoUrl || `/logo.png?t=${Date.now()}`} 
                alt={`${tenantName} Logo`} 
                className="w-full h-full object-contain"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none';
                  const fb = (e.target as HTMLImageElement).nextElementSibling as HTMLElement;
                  if (fb) fb.style.display = 'flex';
                }}
              />
              <div className="absolute inset-0 border-2 border-red-600 rounded-full items-center justify-center bg-slate-50 overflow-hidden shadow-inner hidden">
                 <span className="text-red-600 text-lg font-black italic">{tenantName.charAt(0).toUpperCase()}</span>
              </div>
            </div>
            <div className="flex flex-col leading-none">
              <span className="font-black text-red-600 text-lg tracking-tighter truncate max-w-[140px]" title={tenantName}>
                {tenantName.split(' ')[0] || 'Junub'}
              </span>
              <span className="font-black text-red-600 text-[10px] tracking-tighter uppercase truncate max-w-[140px]">
                {tenantName.split(' ').slice(1).join(' ') || 'Printing'}
              </span>
            </div>
          </div>
          <button 
            onClick={() => setIsSidebarOpen(false)}
            className="p-2 hover:bg-slate-50 rounded-xl md:hidden"
          >
            <Plus className="w-5 h-5 rotate-45 text-slate-400" />
          </button>
        </div>

        <nav className="flex-1 px-4 space-y-1 mt-4 overflow-y-auto">
          {filteredNav.map(item => (
            <button
              key={item.id}
              onClick={() => {
                setActiveTab(item.id);
                setIsSidebarOpen(false);
              }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                activeTab === item.id 
                  ? 'bg-red-50 text-red-600 shadow-sm border-l-4 border-red-600' 
                  : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900 border-l-4 border-transparent'
              }`}
            >
              <item.icon className="w-5 h-5" />
              {item.label}
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-slate-100 bg-white flex-shrink-0">
          <div className="flex items-center gap-3 px-4 py-3 mb-2">
            <div className="w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center text-slate-600 font-bold text-xs ring-2 ring-slate-50">
              {user?.username?.[0]?.toUpperCase() || 'U'}
            </div>
            <div className="flex-1 overflow-hidden">
              <p className="text-sm font-semibold text-slate-900 truncate">
                {(user?.staff_id === 'MASTER' || user?.email === 'tekkisandereagan@gmail.com' || user?.email === 'kulyakosukusandereagan@gmail.com') ? 'System Admin' : (user?.username || 'Guest')}
              </p>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{user?.role || 'No Role'}</p>
            </div>
          </div>
          <button 
            onClick={async () => {
              try {
                await signOut(auth);
                setUser(null);
              } catch (err) {
                console.error("Sign out error:", err);
              }
            }}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-rose-500 hover:bg-rose-50 transition-all mb-4"
          >
            <LogOut className="w-5 h-5" />
            Sign Out
          </button>

          {/* PWA Direct Installation Wizard */}
          <button 
            onClick={() => {
              if (deferredPrompt) {
                handleInstallApp();
              } else {
                setIsPWAInstallModalOpen(true);
              }
            }}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl text-sm font-bold transition-all mb-4 shadow-md shadow-red-100 cursor-pointer animate-pulse"
          >
            <Download className="w-4 h-4 text-white" />
            Download App Now
          </button>
          
          <div className="px-4 py-3 bg-slate-50 rounded-2xl border border-slate-100 mb-4">
            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-1">Software By</p>
            <p className="text-[10px] font-black text-slate-600 leading-tight">LONGUN TECH AND AI AGENCY</p>
          </div>
          
          <div className="flex items-center gap-2 px-4 py-2 bg-emerald-50 rounded-xl border border-emerald-100">
            <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></div>
            <span className="text-[9px] font-black text-emerald-700 uppercase tracking-widest">Global Live Sync Active</span>
          </div>
        </div>
      </aside>

      <main className="flex-1 flex flex-col overflow-hidden w-full">
        <header className="h-16 bg-white border-b border-slate-200 px-4 md:px-8 flex items-center justify-between">
          <div className="flex items-center gap-3">
             <button 
               onClick={() => setIsSidebarOpen(true)}
               className="p-2 hover:bg-slate-50 rounded-xl md:hidden"
             >
               <LayoutDashboard className="w-5 h-5 text-slate-500" />
             </button>
             <h2 className="text-lg font-bold text-slate-900 capitalize">{activeTab.replace('_', ' ')}</h2>
          </div>
          <div className="flex items-center gap-2 md:gap-4">
            <div className="flex items-center bg-slate-100 rounded-lg p-1 mr-4">
              <button 
                onClick={() => setCurrency('SSP')}
                className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${currency === 'SSP' ? 'bg-white shadow-sm text-red-600' : 'text-slate-500'}`}
              >
                SSP
              </button>
              <button 
                onClick={() => setCurrency('USD')}
                className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${currency === 'USD' ? 'bg-white shadow-sm text-red-600' : 'text-slate-500'}`}
              >
                USD
              </button>
            </div>

            <div className="flex-col items-end mr-4 pr-4 border-r border-slate-200 hidden lg:flex">
              <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none">System Time</span>
              <span className="text-[11px] font-mono font-black text-slate-900 leading-tight">
                {currentTime.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })} | {currentTime.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
              </span>
            </div>
            <div className="relative">
              <button 
                onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                className="p-2 hover:bg-slate-50 rounded-xl relative transition-colors"
              >
                <Bell className="w-5 h-5 text-slate-500" />
                {appNotifications.length > 0 && (
                  <span className="absolute top-1 right-1 w-2 h-2 bg-red-600 rounded-full border-2 border-white"></span>
                )}
              </button>
              
              <AnimatePresence>
                {isNotificationsOpen && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-xl border border-slate-100 z-50 overflow-hidden"
                  >
                    <div className="p-4 border-b border-slate-50 flex items-center justify-between">
                      <h4 className="font-bold text-slate-900">Notifications</h4>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">{appNotifications.length} New</span>
                    </div>
                    <div className="max-h-[400px] overflow-y-auto">
                      {appNotifications.length === 0 ? (
                        <div className="p-8 text-center">
                          <p className="text-sm text-slate-400 italic">No new notifications</p>
                        </div>
                      ) : (
                        appNotifications.map(note => (
                          <div 
                            key={note.id} 
                            onClick={async () => {
                              await firebaseService.markNotificationRead(note.id);
                              setAppNotifications(prev => prev.filter(n => n.id !== note.id));
                              setIsNotificationsOpen(false);
                              
                              // If it's a task or system notification, jump to chat with SYSTEM
                              if (note.message.toLowerCase().includes('assignment') || note.message.toLowerCase().includes('order')) {
                                setActiveTab('chat');
                                setChatRecipient({
                                  id: 'SYSTEM',
                                  full_name: `${tenantName.toUpperCase()} SYSTEM`,
                                  username: 'SYSTEM',
                                  role: 'system',
                                  email: tenantCode ? `system@${tenantCode}.com` : 'system@junub.com',
                                  staff_id: 'SYSTEM'
                                });
                              } else if (note.message.toLowerCase().includes('message')) {
                                setActiveTab('chat');
                                if (note.sender_id) {
                                  const sender = users.find(u => u.id === note.sender_id);
                                  if (sender) setChatRecipient(sender);
                                }
                              }
                            }}
                            className="p-4 hover:bg-slate-50 border-b border-slate-50 last:border-0 cursor-pointer transition-colors"
                          >
                            <p className="text-sm text-slate-700 leading-snug">{note.message}</p>
                            <span className="text-[10px] text-slate-400 mt-1 block">
                              {formatDate(note.created_at)}
                            </span>
                          </div>
                        ))
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input 
                type="text" 
                placeholder="Search..." 
                className="pl-10 pr-4 py-2 bg-slate-50 border-transparent rounded-lg text-sm focus:bg-white focus:ring-2 focus:ring-red-500 outline-none w-64 transition-all"
              />
            </div>
            {['admin', 'receptionist', 'supervisor'].includes(user.role) && (
              <button 
                onClick={() => setActiveTab('new-order')}
                className="bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-2 hover:bg-red-700 transition-colors shadow-sm"
              >
                <Plus className="w-4 h-4" />
                New Order
              </button>
            )}
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-4 md:p-8">
          <div key={activeTab}>
            {/* Call UI Removed */}
            
            {activeTab === 'chat' && (
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 min-h-[600px] md:h-[calc(100vh-200px)]">
                  {/* Staff List */}
                  <div className="md:col-span-1 bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden flex flex-col">
                    <div className="p-6 border-b border-slate-100">
                      <h3 className="font-black text-slate-900 uppercase tracking-widest text-xs">Staff Directory</h3>
                    </div>
                    <div className="flex-1 overflow-y-auto">
                      {/* Virtual System Account */}
                      <button 
                        onClick={() => setChatRecipient({
                          id: 'SYSTEM',
                          full_name: `${tenantName.toUpperCase()} SYSTEM`,
                          role: 'admin' as Role,
                          username: 'system',
                          email: tenantCode ? `system@${tenantCode}.com` : 'system@junub.com',
                          staff_id: 'SYSTEM'
                        })}
                        className={`w-full p-4 flex items-center gap-3 hover:bg-slate-50 transition-colors border-l-4 ${chatRecipient?.id === 'SYSTEM' ? 'border-red-600 bg-red-50/30' : 'border-transparent'}`}
                      >
                        <div className="w-10 h-10 bg-red-600 rounded-xl flex items-center justify-center text-white text-[10px] font-black shrink-0 animate-pulse">
                          SYS
                        </div>
                        <div className="text-left overflow-hidden">
                          <p className="font-bold text-slate-900 truncate">{tenantName.toUpperCase()} SYSTEM</p>
                          <p className="text-[10px] text-red-500 uppercase font-black tracking-tighter">Automated Notifications</p>
                        </div>
                      </button>

                      {users.map(u => (
                        <button 
                          key={u.id}
                          onClick={() => setChatRecipient(u)}
                          className={`w-full p-4 flex items-center gap-3 hover:bg-slate-50 transition-colors border-l-4 ${chatRecipient?.id === u.id ? 'border-red-600 bg-red-50/30' : 'border-transparent'}`}
                        >
                          <div className="w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center text-white text-xs font-black shrink-0">
                            {u.full_name ? u.full_name[0] : 'U'}
                          </div>
                          <div className="text-left overflow-hidden">
                            <p className="font-bold text-slate-900 truncate">{u.full_name}</p>
                            <p className="text-[10px] text-slate-400 uppercase font-black tracking-tighter">{u.role}</p>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Chat Window */}
                  <div className="md:col-span-3 bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden flex flex-col">
                    {chatRecipient ? (
                      <>
                        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-red-600 rounded-xl flex items-center justify-center text-white text-xs font-black">
                              {chatRecipient.full_name ? chatRecipient.full_name[0] : 'U'}
                            </div>
                            <div>
                              <h3 className="font-bold text-slate-900">{chatRecipient.full_name}</h3>
                              <p className="text-xs text-emerald-500 font-bold flex items-center gap-1">
                                <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
                                Online
                              </p>
                            </div>
                          </div>
                          <div className="flex gap-2">
                          </div>
                        </div>

                        <div ref={chatScrollRef} className="flex-1 overflow-y-auto p-6 space-y-4 bg-slate-50/30">
                          {messages.length === 0 && (
                            <div className="h-full flex flex-col items-center justify-center text-slate-400 space-y-2">
                              <MessageSquare className="w-12 h-12 opacity-20" />
                              <p className="text-sm font-medium">No messages yet. Start the conversation!</p>
                            </div>
                          )}
                          {messages.map((m, idx) => {
                             const isMe = user && m.sender_id === user.id;
                             const isSystem = m.sender_id === 'SYSTEM';
                             return (
                               <div key={idx} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                                 <div className={`max-w-[80%] p-4 rounded-2xl ${
                                   isMe 
                                     ? 'bg-red-600 text-white rounded-tr-none shadow-lg shadow-red-100' 
                                     : isSystem
                                       ? 'bg-slate-900 text-white rounded-tl-none shadow-lg border-l-4 border-red-600'
                                       : 'bg-white text-slate-900 border border-slate-100 rounded-tl-none shadow-sm'
                                 }`}>
                                   {isSystem && (
                                     <div className="flex items-center gap-1.5 mb-2 text-[10px] font-black uppercase tracking-widest text-red-500">
                                       <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse"></span>
                                       System Log
                                     </div>
                                   )}
                                   <p className="text-sm leading-relaxed whitespace-pre-wrap">{m.message}</p>
                                   <p className={`text-[10px] mt-2 font-bold uppercase tracking-wider ${isMe || isSystem ? 'text-white/60' : 'text-slate-400'}`}>
                                     {formatDate(m.created_at)}
                                   </p>
                                 </div>
                               </div>
                             );
                           })}
                        </div>

                        <div className="p-6 bg-white border-t border-slate-100">
                          <div className="flex gap-3">
                            <input 
                              type="text"
                              placeholder="Type your message..."
                              className="flex-1 bg-slate-50 border-2 border-slate-50 focus:border-red-500 focus:bg-white outline-none rounded-2xl px-6 py-3 transition-all"
                              value={chatInput}
                              onChange={(e) => setChatInput(e.target.value)}
                              onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                            />
                            <button 
                              onClick={handleSendMessage}
                              className="bg-red-600 text-white p-4 rounded-2xl hover:bg-red-700 transition-all shadow-lg active:scale-95"
                            >
                              <Send className="w-5 h-5" />
                            </button>
                          </div>
                        </div>
                      </>
                    ) : (
                      <div className="flex-1 flex flex-col items-center justify-center text-slate-400 space-y-4">
                        <div className="w-20 h-20 bg-slate-50 rounded-[2.5rem] flex items-center justify-center">
                          <MessageSquare className="w-10 h-10 opacity-20" />
                        </div>
                        <div className="text-center">
                          <h4 className="font-black text-slate-900 uppercase tracking-widest text-sm">Select a staff member</h4>
                          <p className="text-sm mt-1">Pick someone from the directory to start chatting</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

            {activeTab === 'staff' && (
              <div className="space-y-6 font-sans">
                <div className="flex justify-between items-center bg-white p-6 rounded-3xl border border-slate-100 shadow-sm font-sans">
                  <h3 className="text-xl font-bold text-slate-900">Staff Members</h3>
                  {isAdminUser && (
                    <button 
                      onClick={() => setIsStaffModalOpen(true)}
                      className="bg-red-600 text-white px-5 py-2.5 rounded-xl text-sm font-black uppercase tracking-widest flex items-center gap-2 hover:bg-red-700 transition-all shadow-lg shadow-red-200 cursor-pointer"
                    >
                      <Plus className="w-5 h-5" />
                      Register Staff
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start font-sans">
                  {/* Left Column: Staff List */}
                  <div className={`lg:col-span-7 space-y-6 ${selectedStaff ? 'hidden lg:block' : 'block'}`}>
                    <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden font-sans">
                      <div className="overflow-x-auto">
                        <table className="w-full text-left">
                          <thead>
                            <tr className="bg-slate-50 text-slate-400 text-[10px] font-black uppercase tracking-widest">
                              <th className="px-4 sm:px-8 py-4">Name</th>
                              <th className="px-4 sm:px-8 py-4">Role</th>
                              <th className="px-4 sm:px-8 py-4 text-right">Actions</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100">
                            {users.map(u => (
                              <tr key={u.id} className={`hover:bg-slate-50 transition-colors ${selectedStaff?.id === u.id ? 'bg-red-50/50' : ''}`}>
                                <td className="px-4 sm:px-8 py-4 cursor-pointer" onClick={() => handleOpenStaffDetail(u)}>
                                  <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center text-white text-xs font-black shrink-0">
                                      {u.full_name ? u.full_name[0] : 'U'}
                                    </div>
                                    <div className="flex flex-col min-w-0">
                                      <span className="font-black text-slate-900 block truncate">{u.full_name}</span>
                                      {isAdminUser && u.password && (
                                        <p className="text-[10px] text-red-600 font-mono truncate">Password: {u.password}</p>
                                      )}
                                    </div>
                                  </div>
                                </td>
                                <td className="px-4 sm:px-8 py-4">
                                  {['admin', 'receptionist', 'supervisor'].includes(user.role) || user.staff_id === 'MASTER' ? (
                                    <select 
                                      className="bg-transparent text-xs font-bold text-slate-600 outline-none"
                                      value={u.role}
                                      onChange={async (e) => {
                                        const oldRole = u.role;
                                        const newRole = e.target.value;
                                        setUsers(prev => prev.map(usr => usr.id === u.id ? { ...usr, role: newRole as any } : usr));
                                        try {
                                          await firebaseService.updateStaffRole(u.id, newRole);
                                          showNotification('Role updated', 'success');
                                          fetchDashboardData();
                                        } catch (err) {
                                          setUsers(prev => prev.map(usr => usr.id === u.id ? { ...usr, role: oldRole as any } : usr));
                                          showNotification('Failed to update role', 'error');
                                        }
                                      }}
                                    >
                                      <option value="admin">Admin</option>
                                      <option value="receptionist">Receptionist</option>
                                      <option value="operator">Operator</option>
                                      <option value="designer">Designer</option>
                                      <option value="supervisor">Supervisor</option>
                                      <option value="sales_marketing">Sales & Marketing</option>
                                    </select>
                                  ) : (
                                    <span className="text-xs text-slate-400 capitalize">{u.role}</span>
                                  )}
                                </td>
                                <td className="px-4 sm:px-8 py-4 text-right">
                                  <div className="flex items-center justify-end gap-2">
                                    <button 
                                      onClick={() => handleOpenStaffDetail(u)}
                                      className="p-2 text-slate-400 hover:text-slate-600 cursor-pointer"
                                    >
                                      <ChevronRight className="w-5 h-5" />
                                    </button>
                                    {isAdminUser && (
                                      <button 
                                        onClick={() => {
                                          setConfirmModal({
                                            isOpen: true,
                                            title: 'Delete Staff',
                                            message: `Are you sure you want to remove ${u.full_name}?`,
                                            onConfirm: async () => {
                                              try {
                                                await firebaseService.deleteUser(u.id);
                                                showNotification('Staff removed', 'success');
                                              } catch (err) {
                                                showNotification('Delete failed', 'error');
                                              }
                                              setConfirmModal(null);
                                            }
                                          });
                                        }}
                                        className="p-2 text-rose-400 hover:text-rose-600 cursor-pointer"
                                      >
                                        <Trash2 className="w-5 h-5" />
                                      </button>
                                    )}
                                  </div>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>

                  {/* Right Column: Staff Details Inline Panel */}
                  <div className={`lg:col-span-5 ${selectedStaff ? 'block' : 'hidden lg:block'}`}>
                    {selectedStaff ? (
                      <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden flex flex-col">
                        {/* Detail Header */}
                        <div className="bg-slate-900 p-6 text-white flex justify-between items-start flex-shrink-0">
                          <div className="flex items-center gap-4">
                            <div className="w-14 h-14 bg-red-600 rounded-2xl flex items-center justify-center text-xl font-black shrink-0">
                              {selectedStaff.full_name ? selectedStaff.full_name[0] : 'U'}
                            </div>
                            <div className="min-w-0">
                              <h2 className="text-lg font-bold truncate">{selectedStaff.full_name}</h2>
                              <p className="text-slate-400 text-xs italic truncate">@{selectedStaff.username}</p>
                            </div>
                          </div>
                          <button 
                            onClick={() => {
                              setSelectedStaff(null);
                              setIsStaffDetailModalOpen(false);
                            }}
                            className="p-2 hover:bg-white/10 rounded-full transition-colors shrink-0 cursor-pointer"
                            title="Close profile panel"
                          >
                            <X className="w-5 h-5" />
                          </button>
                        </div>

                        {/* Detail Content */}
                        <div className="p-6 space-y-6">
                          {/* Back Button (Mobile only) */}
                          <button
                            onClick={() => {
                              setSelectedStaff(null);
                              setIsStaffDetailModalOpen(false);
                            }}
                            className="lg:hidden w-full py-2.5 mb-2 border border-slate-200 text-slate-600 font-bold rounded-xl hover:bg-slate-50 transition flex items-center justify-center gap-1 text-xs cursor-pointer"
                          >
                            ← Back to Staff List
                          </button>

                          {isAdminUser && (
                            <div className="flex justify-end">
                              <button
                                onClick={() => {
                                  if (!isEditingStaff) {
                                    setEditStaffData({
                                      full_name: selectedStaff.full_name || '',
                                      username: selectedStaff.username || '',
                                      email: selectedStaff.email || '',
                                      position: selectedStaff.position || '',
                                      role: selectedStaff.role || 'operator'
                                    });
                                  }
                                  setIsEditingStaff(!isEditingStaff);
                                }}
                                className="px-4 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-lg transition-all cursor-pointer"
                              >
                                {isEditingStaff ? 'Cancel Editing' : '✏️ Edit Profile'}
                              </button>
                            </div>
                          )}

                          {isEditingStaff ? (
                            <div className="space-y-4">
                              <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Full Name</label>
                                <input 
                                  type="text"
                                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-red-500 outline-none font-medium text-slate-800 bg-white"
                                  value={editStaffData.full_name}
                                  onChange={e => setEditStaffData({...editStaffData, full_name: e.target.value})}
                                />
                              </div>
                              <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Username</label>
                                <input 
                                  type="text"
                                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-red-500 outline-none font-medium text-slate-800 bg-white"
                                  value={editStaffData.username}
                                  onChange={e => setEditStaffData({...editStaffData, username: e.target.value})}
                                />
                              </div>
                              <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Gmail Address</label>
                                <input 
                                  type="email"
                                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-red-500 outline-none font-medium text-slate-800 bg-white"
                                  value={editStaffData.email}
                                  onChange={e => setEditStaffData({...editStaffData, email: e.target.value})}
                                />
                              </div>
                              <div className="grid grid-cols-2 gap-3">
                                <div>
                                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Position</label>
                                  <input 
                                    type="text"
                                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-red-500 outline-none font-medium text-slate-800 bg-white"
                                    value={editStaffData.position}
                                    onChange={e => setEditStaffData({...editStaffData, position: e.target.value})}
                                  />
                                </div>
                                <div>
                                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Role</label>
                                  <select 
                                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-red-500 outline-none font-bold text-slate-800 bg-white"
                                    value={editStaffData.role}
                                    onChange={e => setEditStaffData({...editStaffData, role: e.target.value as Role})}
                                  >
                                    <option value="receptionist">Receptionist</option>
                                    <option value="operator">Operator</option>
                                    <option value="designer">Designer</option>
                                    <option value="supervisor">Supervisor</option>
                                    <option value="sales_marketing">Sales & Marketing</option>
                                    <option value="admin">Admin</option>
                                  </select>
                                </div>
                              </div>
                              <button
                                onClick={async () => {
                                  if (!editStaffData.full_name || !editStaffData.username) {
                                    showNotification('Full name and username are required', 'error');
                                    return;
                                  }
                                  if (!editStaffData.email || !editStaffData.email.trim()) {
                                    showNotification('Gmail address is required', 'error');
                                    return;
                                  }
                                  const cleanEmail = editStaffData.email.trim().toLowerCase();
                                  if (!cleanEmail.endsWith('@gmail.com')) {
                                    showNotification('A valid Gmail address ending with @gmail.com is required!', 'error');
                                    return;
                                  }
                                  try {
                                    setLoading(true);
                                    await firebaseService.updateUser(selectedStaff.id, {
                                      full_name: editStaffData.full_name,
                                      username: editStaffData.username,
                                      email: cleanEmail,
                                      position: editStaffData.position,
                                      role: editStaffData.role
                                    });
                                    setSelectedStaff({...selectedStaff, ...editStaffData});
                                    setIsEditingStaff(false);
                                    showNotification('Staff profile updated successfully!', 'success');
                                    fetchDashboardData();
                                  } catch (err: any) {
                                    showNotification(err.message || 'Update failed', 'error');
                                  } finally {
                                    setLoading(false);
                                  }
                                }}
                                className="w-full py-2.5 bg-emerald-600 text-white font-bold rounded-xl hover:bg-emerald-700 transition cursor-pointer text-sm shadow-md"
                              >
                                Save Changes
                              </button>
                            </div>
                          ) : (
                            <div className="space-y-6">
                              {/* Responsive stats cards: stack on extra small, columns on larger */}
                              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 min-w-0">
                                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1 truncate">Position</p>
                                  <p className="font-bold text-slate-900 uppercase text-[11px] truncate" title={selectedStaff.position}>{selectedStaff.position || 'Not Set'}</p>
                                </div>
                                <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 min-w-0">
                                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1 truncate">System Role</p>
                                  <p className="font-bold text-slate-900 uppercase text-[11px] truncate">{selectedStaff.role}</p>
                                </div>
                                <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 min-w-0">
                                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1 truncate">Staff ID</p>
                                  <p className="font-mono text-slate-900 font-bold text-[11px] truncate">#{selectedStaff.staff_id || selectedStaff.id.substring(0, 6).toUpperCase()}</p>
                                </div>
                              </div>

                              <div className="space-y-4 py-3 border-b border-slate-100 text-left">
                                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1 sm:gap-4 text-sm">
                                  <span className="font-medium text-slate-500">Gmail Address</span>
                                  <span className="font-bold text-slate-800 break-all text-right">{selectedStaff.email || 'N/A'}</span>
                                </div>

                                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1.5 mt-1">
                                  <span className="text-xs font-medium text-slate-500">OTP Status:</span>
                                  {selectedStaff.email && selectedStaff.email.toLowerCase().endsWith('@gmail.com') ? (
                                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                      <span>✅</span> Gmail Format Verified
                                    </span>
                                  ) : (
                                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200 animate-pulse">
                                      <span>⚠️</span> Non-Gmail (Needs Update)
                                    </span>
                                  )}
                                </div>

                                {(!selectedStaff.email || !selectedStaff.email.toLowerCase().endsWith('@gmail.com')) && (
                                  <div className="bg-amber-50/75 border border-amber-200 text-amber-800 rounded-xl p-3 text-[11px] font-medium leading-relaxed mt-1">
                                    🔒 <strong>OTP Action Required:</strong> This staff member currently has an old or auto-generated email (<em>{selectedStaff.email || 'None'}</em>). They <strong>must</strong> be edited to have a real <strong>@gmail.com</strong> address to receive login security codes. Click <strong>✏️ Edit Profile</strong> above to update.
                                  </div>
                                )}

                                <div className="flex justify-between items-center text-sm border-t border-slate-50 pt-3">
                                  <span className="font-medium text-slate-500">Joined Date</span>
                                  <span className="font-bold text-slate-800">{formatDate(selectedStaff.created_at)}</span>
                                </div>

                                {/* Test Email Verification Trigger */}
                                <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4 space-y-3 mt-2">
                                  <div className="flex flex-col">
                                    <span className="text-xs font-black text-slate-400 uppercase tracking-widest">Inbox Delivery Test</span>
                                    <p className="text-[11px] text-slate-500 mt-0.5 leading-normal">
                                      Test if this staff member receives secure login codes successfully at their registered address.
                                    </p>
                                  </div>

                                  <div className="flex items-center gap-2">
                                    <button
                                      type="button"
                                      disabled={loading || !selectedStaff.email || !selectedStaff.email.toLowerCase().endsWith('@gmail.com')}
                                      onClick={async () => {
                                        const cleanEmail = (selectedStaff.email || "").trim().toLowerCase();
                                        if (!cleanEmail.endsWith('@gmail.com')) {
                                          showNotification("Please update this profile to a valid @gmail.com address first!", "error");
                                          return;
                                        }
                                        try {
                                          setLoading(true);
                                          const testOtp = Math.floor(100000 + Math.random() * 900000).toString();
                                          
                                          const response = await fetch("/api/send-email-otp", {
                                            method: "POST",
                                            headers: { "Content-Type": "application/json" },
                                            body: JSON.stringify({
                                              username: selectedStaff.full_name || selectedStaff.username || "Staff Member",
                                              otp: testOtp,
                                              email: cleanEmail,
                                              deviceDetails: "Administrator Verification Test"
                                            })
                                          });
                                          
                                          if (!response.ok) {
                                            throw new Error(`Server returned HTTP ${response.status}`);
                                          }
                                          const resData = await response.json();
                                          
                                          setLastTestCodeSent(prev => ({
                                            ...prev,
                                            [selectedStaff.id]: testOtp
                                          }));

                                          if (resData.simulated) {
                                            showNotification(`[Simulation Mode] Test code ${testOtp} simulated to ${cleanEmail}!`, "info");
                                          } else {
                                            showNotification(`Verification test email successfully dispatched to ${cleanEmail}!`, "success");
                                          }
                                        } catch (err: any) {
                                          showNotification(err.message || "Failed to dispatch test verification email.", "error");
                                        } finally {
                                          setLoading(false);
                                        }
                                      }}
                                      className={`flex-1 py-2.5 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                                        selectedStaff.email && selectedStaff.email.toLowerCase().endsWith('@gmail.com')
                                          ? "bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm"
                                          : "bg-slate-200 text-slate-400 cursor-not-allowed"
                                      }`}
                                    >
                                      📧 Dispatch Test Verification Code
                                    </button>
                                  </div>

                                  {lastTestCodeSent[selectedStaff.id] && (
                                    <div className="flex items-center justify-between bg-indigo-50/50 border border-indigo-100 rounded-xl px-3 py-2 text-[11px] font-bold text-indigo-900">
                                      <span>Last Dispatched Test Code:</span>
                                      <span className="font-mono bg-indigo-100 px-2 py-0.5 rounded text-xs tracking-wider font-extrabold text-indigo-700">
                                        {lastTestCodeSent[selectedStaff.id]}
                                      </span>
                                    </div>
                                  )}
                                </div>
                              </div>

                              {/* Password resetting & lockout actions */}
                              {isAdminUser && (
                                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 space-y-4 text-left">
                                  {selectedStaff.id !== user.id && (
                                    <div className="flex items-center justify-between">
                                      <div>
                                        <p className="text-xs font-black text-slate-400 uppercase tracking-wider">Access Power</p>
                                        <p className="text-sm font-bold text-slate-800 mt-0.5">
                                          {(selectedStaff.suspended || selectedStaff.locked) ? '🚫 Suspended / Locked Out' : '💚 Active & Authed'}
                                        </p>
                                      </div>
                                      <button
                                        onClick={async () => {
                                          const newStatus = !(selectedStaff.suspended || selectedStaff.locked);
                                          setConfirmModal({
                                            isOpen: true,
                                            title: newStatus ? 'Suspend Access' : 'Restore Access',
                                            message: newStatus 
                                              ? `Are you sure you want to suspend access for ${selectedStaff.full_name}? They will not be able to log in.`
                                              : `Are you sure you want to reactivate access for ${selectedStaff.full_name}?`,
                                            onConfirm: async () => {
                                              try {
                                                setLoading(true);
                                                await firebaseService.updateUser(selectedStaff.id, { suspended: newStatus, locked: newStatus });
                                                setSelectedStaff({ ...selectedStaff, suspended: newStatus, locked: newStatus });
                                                showNotification(newStatus ? `${selectedStaff.full_name} suspended!` : `${selectedStaff.full_name} reactivated!`, 'success');
                                                fetchDashboardData();
                                              } catch (err) {
                                                showNotification('Lockout action failed', 'error');
                                              } finally {
                                                setLoading(false);
                                                setConfirmModal(null);
                                              }
                                            }
                                          });
                                        }}
                                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                                          (selectedStaff.suspended || selectedStaff.locked)
                                            ? 'bg-emerald-100 hover:bg-emerald-200 text-emerald-800'
                                            : 'bg-amber-100 hover:bg-amber-200 text-amber-800'
                                        }`}
                                      >
                                        {(selectedStaff.suspended || selectedStaff.locked) ? 'Restore Access' : 'Suspend Staff'}
                                      </button>
                                    </div>
                                  )}

                                  <div className="space-y-3 pt-3 border-t border-slate-200">
                                    <div className="flex justify-between items-center text-xs text-slate-500">
                                      <span className="font-bold uppercase tracking-wider">System Password</span>
                                      <span className="font-mono font-bold text-red-600">{selectedStaff.password || '********'}</span>
                                    </div>
                                    <div className="flex gap-2">
                                      <input 
                                        type="text" 
                                        placeholder="New password" 
                                        className="flex-1 px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:ring-1 focus:ring-red-500 outline-none font-bold"
                                        id="staff-reset-pwd-detail"
                                      />
                                      <button 
                                        onClick={async () => {
                                          const pwdInput = document.getElementById('staff-reset-pwd-detail') as HTMLInputElement;
                                          const pwd = pwdInput?.value;
                                          if (!pwd) return showNotification('Enter new password', 'error');
                                          try {
                                            setLoading(true);
                                            await firebaseService.updateUser(selectedStaff.id, { password: pwd });
                                            setSelectedStaff({ ...selectedStaff, password: pwd });
                                            showNotification('Password updated successfully', 'success');
                                            pwdInput.value = '';
                                            fetchDashboardData();
                                          } catch (err) {
                                            showNotification('Update failed', 'error');
                                          } finally {
                                            setLoading(false);
                                          }
                                        }}
                                        className="bg-slate-900 hover:bg-slate-850 text-white px-3 py-1 text-xs font-bold rounded-lg uppercase cursor-pointer"
                                      >Reset</button>
                                    </div>
                                  </div>
                                </div>
                              )}

                              {isAdminUser && selectedStaff.id !== user.id && (
                                <button 
                                  onClick={() => {
                                    setConfirmModal({
                                      isOpen: true,
                                      title: 'Delete Staff Account',
                                      message: `Permanently remove ${selectedStaff.full_name} from the system?`,
                                      onConfirm: async () => {
                                        try {
                                          await firebaseService.deleteUser(selectedStaff.id);
                                          fetchDashboardData();
                                          setSelectedStaff(null);
                                          setIsStaffDetailModalOpen(false);
                                          showNotification('Staff record deleted', 'success');
                                        } catch (err) {
                                          showNotification('Action failed', 'error');
                                        }
                                        setConfirmModal(null);
                                      }
                                    });
                                  }}
                                  className="w-full py-2.5 rounded-xl bg-red-50 text-red-600 font-bold hover:bg-red-100 transition-colors cursor-pointer text-xs uppercase"
                                >
                                  Delete Account
                                </button>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    ) : (
                      <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm p-12 text-center space-y-3 h-full flex flex-col items-center justify-center min-h-[350px]">
                        <div className="w-12 h-12 bg-slate-50 border border-slate-100 rounded-2xl flex items-center justify-center text-slate-400 shadow-sm">
                          <Users className="w-5 h-5 text-slate-400" />
                        </div>
                        <div>
                          <p className="font-bold text-slate-800 text-sm">No Staff Selected</p>
                          <p className="text-xs text-slate-400 max-w-[250px] mx-auto mt-1 leading-normal">
                            Click on any staff member from the list to view their detailed profile, update password, test verification codes, or lock/suspend their account.
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                    {/* Database Recovery: Restore Deleted Staff */}
                    {isAdminUser && (
                      <div className="bg-slate-50 border border-dashed border-slate-300 p-8 rounded-[2rem] space-y-6 font-sans">
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                          <div>
                            <h4 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                              <span>🛠️</span> Recover Mistakenly Deleted Staff
                            </h4>
                            <p className="text-slate-500 text-xs mt-1">
                              Scan the historical orders and expenses to find staff profiles that were deleted but are still referenced in historical logs.
                            </p>
                          </div>
                          <button
                            onClick={scanForDeletedStaff}
                            disabled={isScanningDeletedStaff}
                            className="bg-slate-800 hover:bg-slate-900 text-white px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all disabled:opacity-50 cursor-pointer"
                          >
                            {isScanningDeletedStaff ? "Scanning..." : "Scan Database for Deleted Staff"}
                          </button>
                        </div>

                        {scannedDeletedStaffOnce && (
                          <div className="space-y-4">
                            {deletedStaffList.length === 0 ? (
                              <p className="text-slate-400 text-xs italic bg-white p-4 rounded-2xl text-center border border-slate-100">
                                No deleted staff profiles found in historical records.
                              </p>
                            ) : (
                              <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
                                <div className="p-4 bg-slate-100/50 border-b border-slate-100">
                                  <p className="text-[10px] font-black uppercase tracking-wider text-slate-500">
                                    Potentially Recoverable Profiles ({deletedStaffList.length})
                                  </p>
                                </div>
                                <div className="overflow-x-auto">
                                  <table className="w-full text-left text-xs">
                                    <thead>
                                      <tr className="bg-slate-50 text-slate-500 text-[10px] font-bold uppercase tracking-wider">
                                        <th className="px-6 py-3">Reference Source</th>
                                        <th className="px-6 py-3">Full Name</th>
                                        <th className="px-6 py-3">Username</th>
                                        <th className="px-6 py-3">Email Address</th>
                                        <th className="px-6 py-3">Assigned Role</th>
                                        <th className="px-6 py-3 text-right">Actions</th>
                                      </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                      {deletedStaffList.map((s) => (
                                        <tr key={s.id} className="hover:bg-slate-50/50">
                                          <td className="px-6 py-3">
                                            <span className="bg-slate-100 text-slate-600 px-2.5 py-1 rounded-full text-[9px] font-bold uppercase">
                                              {s.source}
                                            </span>
                                            <p className="text-[9px] font-mono text-slate-400 mt-1">ID: {s.id.substring(0, 8)}...</p>
                                          </td>
                                          <td className="px-6 py-3 font-medium">
                                            <input
                                              type="text"
                                              className="px-2 py-1 rounded border border-slate-200 w-full focus:ring-1 focus:ring-red-500"
                                              value={s.full_name}
                                              onChange={(e) => updateDeletedStaffField(s.id, 'full_name', e.target.value)}
                                            />
                                          </td>
                                          <td className="px-6 py-3">
                                            <input
                                              type="text"
                                              className="px-2 py-1 rounded border border-slate-200 w-full font-mono text-slate-700 focus:ring-1 focus:ring-red-500"
                                              value={s.username}
                                              onChange={(e) => updateDeletedStaffField(s.id, 'username', e.target.value)}
                                            />
                                          </td>
                                          <td className="px-6 py-3">
                                            <input
                                              type="email"
                                              className="px-2 py-1 rounded border border-slate-200 w-full focus:ring-1 focus:ring-red-500"
                                              value={s.email}
                                              onChange={(e) => updateDeletedStaffField(s.id, 'email', e.target.value)}
                                            />
                                          </td>
                                          <td className="px-6 py-3">
                                            <select
                                              className="px-2 py-1 rounded border border-slate-200 w-full font-bold text-slate-700 bg-white"
                                              value={s.guessedRole}
                                              onChange={(e) => updateDeletedStaffField(s.id, 'guessedRole', e.target.value)}
                                            >
                                              <option value="operator">Operator (Production)</option>
                                              <option value="designer">Designer (Creative)</option>
                                              <option value="receptionist">Receptionist (Frontdesk)</option>
                                              <option value="admin">Admin (Full access)</option>
                                              <option value="supervisor">Supervisor (Oversight)</option>
                                              <option value="sales_marketing">Sales / Marketing</option>
                                            </select>
                                          </td>
                                          <td className="px-6 py-3 text-right">
                                            <button
                                              onClick={() => restoreStaffMember(s)}
                                              className="bg-emerald-600 hover:bg-emerald-700 text-white px-3.5 py-1.5 rounded-xl font-bold transition-all text-[11px] uppercase cursor-pointer shadow-sm"
                                            >
                                              Restore
                                            </button>
                                          </td>
                                        </tr>
                                      ))}
                                    </tbody>
                                  </table>
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    )}
                </div>
              )}

              {activeTab === 'reports' && (
                <div className="space-y-6">
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-white p-6 rounded-3xl border border-slate-100 shadow-sm gap-4">
                    <div>
                      <h3 className="text-xl font-bold text-slate-900 font-sans">Work & Financial Reports</h3>
                      <p className="text-slate-500 text-sm font-sans">Comprehensive overview of business performance</p>
                    </div>
                    <div className="flex flex-wrap items-center gap-3">
                      <div className="flex items-center gap-1">
                         <button 
                           onClick={() => {
                             const today = new Date().toISOString().split('T')[0];
                             setFilterDateRange({ start: today, end: today });
                           }}
                           className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded text-[10px] font-bold"
                         >Today</button>
                         <button 
                           onClick={() => {
                             const now = new Date();
                             const start = new Date(now.setDate(now.getDate() - now.getDay())).toISOString().split('T')[0];
                             const today = new Date().toISOString().split('T')[0];
                             setFilterDateRange({ start: start, end: today });
                           }}
                           className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded text-[10px] font-bold"
                         >This Week</button>
                         <button 
                           onClick={() => {
                             const now = new Date();
                             const start = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
                             const today = new Date().toISOString().split('T')[0];
                             setFilterDateRange({ start: start, end: today });
                           }}
                           className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded text-[10px] font-bold"
                         >This Month</button>
                      </div>
                      <div className="flex items-center gap-2 bg-slate-50 p-1 px-3 rounded-xl border border-slate-200">
                        <Calendar className="w-4 h-4 text-slate-400" />
                        <input 
                          type="date" 
                          className="bg-transparent text-sm font-bold text-slate-600 outline-none"
                          value={filterDateRange.start}
                          onChange={(e) => setFilterDateRange({...filterDateRange, start: e.target.value})}
                        />
                        <span className="text-slate-300">to</span>
                        <input 
                          type="date" 
                          className="bg-transparent text-sm font-bold text-slate-600 outline-none"
                          value={filterDateRange.end}
                          onChange={(e) => setFilterDateRange({...filterDateRange, end: e.target.value})}
                        />
                      </div>
                      <button 
                        onClick={() => fetchDashboardData()}
                        className="bg-slate-900 text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-black transition-colors"
                      >
                        Refresh Report
                      </button>
                      <button 
                        onClick={() => generateGeneralReportPDF()}
                        className="bg-slate-900 text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-black transition-colors shadow-sm flex items-center gap-2"
                      >
                        <FileText className="w-4 h-4" />
                        General Report
                      </button>
                      <button 
                        onClick={() => generateExpensesPDF()}
                        className="bg-emerald-600 text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-emerald-700 transition-colors shadow-sm flex items-center gap-2"
                      >
                        <FileText className="w-4 h-4" />
                        Export Expenses
                      </button>
                    </div>
                  </div>

                  {/* Daily Summary Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 font-sans">
                    <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
                      <div className="flex items-center justify-between mb-2">
                        <div className="p-2 bg-blue-50 rounded-lg">
                          <ShoppingCart className="w-4 h-4 text-blue-600" />
                        </div>
                      </div>
                      <p className="text-slate-500 text-[10px] font-bold uppercase tracking-wider">Jobs Registered</p>
                      <h4 className="text-xl font-black text-slate-900">{stats?.jobsRegistered || 0}</h4>
                    </div>

                    <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
                      <div className="flex items-center justify-between mb-2">
                        <div className="p-2 bg-emerald-50 rounded-lg">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        </div>
                      </div>
                      <p className="text-slate-500 text-[10px] font-bold uppercase tracking-wider">Jobs Done & Paid</p>
                      <h4 className="text-xl font-black text-emerald-600">{stats?.jobsDoneAndPaid || 0}</h4>
                    </div>

                    <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
                      <div className="flex items-center justify-between mb-2">
                        <div className="p-2 bg-amber-50 rounded-lg">
                          <Clock className="w-4 h-4 text-amber-600" />
                        </div>
                      </div>
                      <p className="text-slate-500 text-[10px] font-bold uppercase tracking-wider">Jobs Done & Unpaid</p>
                      <h4 className="text-xl font-black text-amber-600">{stats?.jobsDoneAndUnpaid || 0}</h4>
                    </div>

                    <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
                      <div className="flex items-center justify-between mb-2">
                        <div className="p-2 bg-rose-50 rounded-lg">
                          <AlertTriangle className="w-4 h-4 text-rose-600" />
                        </div>
                      </div>
                      <p className="text-slate-500 text-[10px] font-bold uppercase tracking-wider">Unpaid Debts (Period)</p>
                      <h4 className="text-xl font-black text-rose-600">{formatCurrency(stats?.periodDebts || 0)}</h4>
                    </div>

                    <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
                      <div className="flex items-center justify-between mb-2">
                        <div className="p-2 bg-slate-50 rounded-lg">
                          <Wallet className="w-4 h-4 text-slate-600" />
                        </div>
                      </div>
                      <p className="text-slate-500 text-[10px] font-bold uppercase tracking-wider">Total Expenses</p>
                      <h4 className="text-xl font-black text-slate-900">{formatCurrency(stats?.totalExpenses || 0)}</h4>
                    </div>

                    <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm border-emerald-100 bg-emerald-50/10">
                      <div className="flex items-center justify-between mb-2">
                        <div className="p-2 bg-emerald-50 rounded-lg">
                          <DollarSign className="w-4 h-4 text-emerald-600" />
                        </div>
                      </div>
                      <p className="text-emerald-700 text-[10px] font-bold uppercase tracking-wider">Total Cash (Period)</p>
                      <h4 className="text-xl font-black text-emerald-600">{formatCurrency(stats?.totalCash || 0)}</h4>
                    </div>

                    <div 
                      onClick={() => openDebtRecoveryDetails(`Reports Period: ${filterDateRange.start} to ${filterDateRange.end}`, parseLocalDate(filterDateRange.start), parseLocalDate(filterDateRange.end, true))}
                      className="bg-white p-5 rounded-2xl border border-teal-100 bg-teal-50/10 relative group cursor-pointer hover:shadow-md hover:scale-[1.02] active:scale-95 transition-all duration-200"
                    >
                      <div className="absolute top-4 right-4 text-teal-500">
                        <Info className="w-3.5 h-3.5 cursor-help" />
                        <div className="absolute top-6 right-0 w-56 bg-slate-900 text-white text-[10px] p-3 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity z-50 pointer-events-none font-medium leading-relaxed shadow-lg">
                          Total customer payments collected for older orders registered on a previous date. Click to view recovery list and details!
                        </div>
                      </div>
                      <div className="flex items-center justify-between mb-2">
                        <div className="p-2 bg-teal-50 rounded-lg flex items-center gap-1.5">
                          <Coins className="w-4 h-4 text-teal-600 animate-pulse" />
                          <span className="text-[9px] bg-teal-100 text-teal-800 px-2 py-0.5 rounded-full font-bold uppercase">View Ledger</span>
                        </div>
                      </div>
                      <p className="text-teal-700 text-[10px] font-bold uppercase tracking-wider">Recovered Debts (Period)</p>
                      <h4 className="text-xl font-black text-teal-600">{formatCurrency(stats?.periodRecoveredDebts || 0)}</h4>
                      <div className="mt-1 flex items-center gap-1.5">
                        <span className="text-[10px] text-slate-400 font-medium">All-Time:</span>
                        <span className="text-[10px] font-bold text-slate-600">{formatCurrency(stats?.allTimeSales || 0)}</span>
                      </div>
                    </div>

                    <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
                      <div className="flex items-center justify-between mb-2">
                        <div className="p-2 bg-blue-50 rounded-lg">
                          <RefreshCcw className="w-4 h-4 text-blue-600" />
                        </div>
                      </div>
                      <p className="text-slate-500 text-[10px] font-bold uppercase tracking-wider">Pending Jobs</p>
                      <h4 className="text-xl font-black text-blue-600">{stats?.pendingOrders || 0}</h4>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 font-sans">
                    <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm relative group">
                      <div className="absolute top-4 right-4 text-slate-400">
                        <Info className="w-4 h-4 cursor-help" />
                        <div className="absolute top-6 right-0 w-48 bg-slate-900 text-white text-[10px] p-3 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity z-50 pointer-events-none font-medium leading-relaxed">
                          Total value of all jobs registered in this period, paid or unpaid.
                        </div>
                      </div>
                      <p className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-1">Registered Jobs (Sales)</p>
                      <h4 className="text-2xl font-black text-slate-900">{formatCurrency(stats?.monthlyRevenue || 0)}</h4>
                    </div>
                    
                    <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm relative group">
                       <div className="absolute top-4 right-4 text-amber-500">
                        <Info className="w-4 h-4 cursor-help" />
                        <div className="absolute top-6 right-0 w-48 bg-slate-900 text-white text-[10px] p-3 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity z-50 pointer-events-none font-medium leading-relaxed">
                          Unpaid amounts (Debts/Arrears) for the active period.
                        </div>
                      </div>
                      <p className="text-amber-600 text-xs font-bold uppercase tracking-wider mb-1">Unpaid Jobs</p>
                      <h4 className="text-2xl font-black text-amber-600">{formatCurrency(stats?.periodDebts || 0)}</h4>
                    </div>

                    <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm relative group">
                      <div className="absolute top-4 right-4 text-emerald-500">
                        <Info className="w-4 h-4 cursor-help" />
                        <div className="absolute top-6 right-0 w-48 bg-slate-900 text-white text-[10px] p-3 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity z-50 pointer-events-none font-medium leading-relaxed">
                          External funding/capital added to the system during this period.
                        </div>
                      </div>
                      <p className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-1">Total Fundings</p>
                      <h4 className="text-2xl font-black text-emerald-600">{formatCurrency(stats?.totalFunding || 0)}</h4>
                    </div>

                    <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
                      <p className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-1">Total Expenses</p>
                      <h4 className="text-2xl font-black text-rose-600">{formatCurrency(stats?.totalExpenses || 0)}</h4>
                    </div>

                    <div className="bg-white p-6 rounded-3xl border border-emerald-100 bg-emerald-50/20 shadow-sm relative group">
                      <div className="absolute top-4 right-4 text-emerald-600">
                        <Info className="w-4 h-4 cursor-help" />
                        <div className="absolute top-6 right-0 w-64 bg-slate-900 text-white text-[10px] p-3 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity z-50 pointer-events-none font-black leading-relaxed">
                          NET CASH CALCULATION:<br/>
                          (Sales + Funding + Recovered Debts) - Unpaid - Total Expenses<br/>
                          = {formatCurrency((stats?.monthlyRevenue || 0) + (stats?.totalFunding || 0) + (stats?.periodRecoveredDebts || 0))} - {formatCurrency(stats?.periodDebts || 0)} - {formatCurrency(stats?.totalExpenses || 0)}
                        </div>
                      </div>
                      <p className="text-emerald-600 text-xs font-bold mb-1 uppercase tracking-widest">Net Cash At Hand</p>
                      <h4 className="text-2xl font-black text-emerald-600">{formatCurrency(stats?.totalCash || 0)}</h4>
                    </div>
                  </div>

                  <div className="mt-8"></div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 font-sans">
                    <div className="bg-slate-900 p-8 rounded-3xl shadow-xl shadow-slate-200">
                      <div className="flex items-center gap-3 mb-2 text-slate-400">
                        <Landmark className="w-5 h-5" />
                        <p className="text-xs font-black uppercase tracking-widest">All-Time Liquidity</p>
                      </div>
                      <p className="text-4xl font-black text-white">{formatCurrency(stats?.trueBalance || 0)}</p>
                      <p className="text-slate-400 text-xs mt-2 font-medium">Actual cash at hand across all periods.</p>
                    </div>
                    <div className="bg-rose-600 p-8 rounded-3xl shadow-xl shadow-rose-100">
                      <div className="flex items-center gap-3 mb-2 text-rose-200">
                        <AlertCircle className="w-5 h-5" />
                        <p className="text-xs font-black uppercase tracking-widest">Total Outstanding Debt</p>
                      </div>
                      <p className="text-4xl font-black text-white">{formatCurrency(stats?.totalArrears || 0)}</p>
                      <p className="text-rose-200 text-xs mt-2 font-medium">Cumulative unpaid balances from all orders.</p>
                    </div>
                  </div>

                  <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden font-sans">
                    <div className="p-8 border-b border-slate-100">
                      <h4 className="text-lg font-bold text-slate-900">Staff Achievement Ledger</h4>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full text-left">
                        <thead>
                          <tr className="bg-slate-50 text-slate-400 text-[10px] font-black uppercase tracking-widest">
                            <th className="px-8 py-4">Staff Member</th>
                            <th className="px-8 py-4 text-center">Work Units (Shared)</th>
                            <th className="px-8 py-4 text-right">Revenue Contributed</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {staffReports.filter(u => u.role !== 'admin' && u.role !== 'receptionist').map(report => {
                            return (
                              <tr key={report.id} className="hover:bg-slate-50 transition-colors">
                                <td className="px-8 py-4">
                                  <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 bg-slate-900 rounded-lg flex items-center justify-center text-white text-[10px] font-bold">
                                      {report.full_name ? report.full_name[0] : (report.username ? report.username[0] : '?')}
                                    </div>
                                    <div>
                                      <span className="font-bold text-slate-900 block leading-none mb-1">{report.full_name || report.username}</span>
                                      <span className="text-[9px] text-slate-400 uppercase font-black uppercase">{report.role}</span>
                                    </div>
                                  </div>
                                </td>
                                <td className="px-8 py-4 text-center">
                                  <div className="flex flex-col items-center">
                                    <span className="text-sm font-black text-slate-900">{report.work_count.toFixed(1)}</span>
                                    {report.work_count % 1 !== 0 && (
                                      <span className="text-[9px] text-amber-600 font-bold uppercase tracking-tighter">Includes 0.5 Shares</span>
                                    )}
                                  </div>
                                </td>
                                <td className="px-8 py-4 text-right">
                                  <span className="text-sm font-black text-emerald-600">{formatCurrency(report.total_value)}</span>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden font-sans">
                    <div className="p-8 border-b border-slate-100 flex items-center justify-between">
                      <div>
                        <h4 className="text-lg font-bold text-slate-900">Debt Recovery & Clearance Ledger</h4>
                        <p className="text-xs text-slate-500 mt-1 font-medium">History of cleared customer debts and payment collections within this period.</p>
                      </div>
                      <div className="flex items-center gap-2 bg-teal-50 text-teal-700 px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider">
                        <Coins className="w-3.5 h-3.5 text-teal-600 animate-pulse" />
                        Recovered
                      </div>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full text-left font-sans">
                        <thead>
                          <tr className="bg-slate-50 text-slate-400 text-[10px] font-black uppercase tracking-widest">
                            <th className="px-8 py-4">Clearance Date</th>
                            <th className="px-8 py-4">Client / Order ID</th>
                            <th className="px-8 py-4">Recovery Status</th>
                            <th className="px-8 py-4">Received By</th>
                            <th className="px-8 py-4 text-right">Amount Recovered</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {(() => {
                            const start = new Date(filterDateRange.start + 'T00:00:00');
                            const end = new Date(filterDateRange.end + 'T23:59:59.999');
                            
                            // Map over payments, match order, filter by date, sort descending
                            const recoveredPayments = (finances.payments || [])
                              .map(p => {
                                const d = p.created_at?.toDate ? p.created_at.toDate() : (p.created_at ? new Date(p.created_at) : new Date());
                                const order = orders.find(o => o.id === p.order_id);
                                return {
                                  ...p,
                                  dateObj: d,
                                  order
                                };
                              })
                              .filter(p => p.dateObj >= start && p.dateObj <= end)
                              .sort((a, b) => b.dateObj.getTime() - a.dateObj.getTime());

                            if (recoveredPayments.length === 0) {
                              return (
                                <tr>
                                  <td colSpan={5} className="p-12 text-center text-slate-400 italic">
                                    No debt recovery or clearance transactions recorded in this period.
                                  </td>
                                </tr>
                              );
                            }

                            return recoveredPayments.map(p => {
                              const orderIdDisplay = p.order ? (p.order.job_order_id || '#' + String(p.order.id).substring(0, 6).toUpperCase()) : `#${String(p.order_id).substring(0, 6).toUpperCase()}`;
                              const customerNameDisplay = p.order ? p.order.customer_name : 'Unknown Customer';
                              return (
                                <tr key={p.id} className="hover:bg-slate-50 transition-colors">
                                  <td className="px-8 py-4">
                                    <span className="text-xs font-bold text-slate-900 block">
                                      {p.dateObj.toLocaleDateString()}
                                    </span>
                                    <span className="text-[10px] text-slate-400 font-medium">
                                      {p.dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                  </td>
                                  <td className="px-8 py-4">
                                    <span className="font-bold text-slate-900 block leading-none mb-1">
                                      {customerNameDisplay}
                                    </span>
                                    <span className="text-[10px] font-mono text-slate-400 uppercase">
                                      {orderIdDisplay} • Method: {p.method || 'Cash'}
                                    </span>
                                  </td>
                                  <td className="px-8 py-4">
                                    <span className="inline-flex items-center gap-1 bg-teal-50 text-teal-700 text-[10px] font-black uppercase px-2.5 py-1 rounded-full border border-teal-100">
                                      <TrendingUp className="w-3 h-3 text-teal-600 animate-pulse" />
                                      Recovery
                                    </span>
                                  </td>
                                  <td className="px-8 py-4 text-sm text-slate-500 font-medium">
                                    {p.recorded_by || 'System'}
                                  </td>
                                  <td className="px-8 py-4 text-right">
                                    <span className="text-sm font-black text-teal-600">
                                      {formatCurrency(p.amount)}
                                    </span>
                                  </td>
                                </tr>
                              );
                            });
                          })()}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}
              {activeTab === 'commissions' && (
                <div className="space-y-6">
                  <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm">
                    <div className="flex items-center gap-6 mb-8">
                      <div className="w-16 h-16 bg-orange-100 rounded-2xl flex items-center justify-center text-orange-600">
                        <DollarSign className="w-8 h-8" />
                      </div>
                      <div>
                        <h3 className="text-2xl font-bold text-slate-900">My Commissions</h3>
                        <p className="text-slate-500">Track your earnings from referrals and high-value orders.</p>
                      </div>
                    </div>

                     <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                       <div className="bg-slate-50 p-6 rounded-2xl">
                         <p className="text-sm font-medium text-slate-500 mb-1">Current Balance</p>
                         <p className="text-3xl font-black text-slate-900">{formatCurrency(user.commission_balance || 0)}</p>
                       </div>
                       <div className="bg-slate-50 p-6 rounded-2xl">
                         <p className="text-sm font-medium text-slate-500 mb-1">Total Earned</p>
                         <p className="text-3xl font-black text-emerald-600">
                           {formatCurrency(orders.filter(o => o.referrer_id === user.id && o.status === 'paid').reduce((sum, o) => sum + (o.commission_amount || 0), 0))}
                         </p>
                       </div>
                       <div className="bg-slate-50 p-6 rounded-2xl">
                         <p className="text-sm font-medium text-slate-500 mb-1">Pending Payout</p>
                         <p className="text-3xl font-black text-orange-500">
                           {formatCurrency(orders.filter(o => o.referrer_id === user.id && o.status !== 'paid').reduce((sum, o) => sum + (o.commission_amount || 0), 0))}
                         </p>
                       </div>
                     </div>

                    <h4 className="font-bold text-slate-900 mb-4">Commission History</h4>
                    <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
                      <table className="w-full text-left">
                        <thead>
                          <tr className="bg-slate-50 text-slate-500 text-xs font-bold uppercase tracking-wider">
                            <th className="px-6 py-4">Order ID</th>
                            <th className="px-6 py-4">Date</th>
                            <th className="px-6 py-4">Total Earned</th>
                            <th className="px-6 py-4">Commission</th>
                            <th className="px-6 py-4">Status</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {orders.filter(o => o.referrer_id === user.id).length === 0 ? (
                            <tr>
                              <td colSpan={5} className="px-6 py-12 text-center text-slate-400 italic">
                                No commission history found.
                              </td>
                            </tr>
                          ) : (
                            orders.filter(o => o.referrer_id === user.id).map(order => (
                              <tr key={order.id} className="hover:bg-slate-50 transition-colors">
                                <td className="px-6 py-4 font-bold text-slate-900">{order.job_order_id || '#' + String(order.id).substring(0, 6).toUpperCase()}</td>
                                <td className="px-6 py-4 text-sm text-slate-600">{formatDate(order.created_at)}</td>
                                <td className="px-6 py-4 text-sm text-slate-600">{formatCurrency(order.total_amount || 0)}</td>
                                <td className="px-6 py-4 text-sm font-bold text-orange-600">{formatCurrency(order.commission_amount || 0)}</td>
                                <td className="px-6 py-4">
                                  <span className={`text-[10px] font-bold uppercase px-2 py-1 rounded-full ${order.status === 'paid' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'}`}>
                                    {order.status === 'paid' ? 'Paid' : 'Pending'}
                                  </span>
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
               {activeTab === 'dashboard' && (
                <div className="space-y-8">
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                    {[
                      { index: 1, title: "Today", summary: stats?.todaySummary, dates: card1Dates, setDates: setCard1Dates },
                      { index: 2, title: "This Month", summary: stats?.thisMonthSummary, dates: card2Dates, setDates: setCard2Dates },
                      { index: 3, title: "Last Month", summary: stats?.lastMonthSummary, dates: card3Dates, setDates: setCard3Dates }
                    ].map((col, idx) => (
                      <div key={idx} className="bg-white rounded-[2rem] border border-slate-100 shadow-sm p-6 flex flex-col h-full font-sans transition-all hover:shadow-md">
                        <div className="mb-6 flex items-center justify-between relative">
                          <div>
                            <h3 className="text-xl font-black tracking-tight text-slate-800">{col.title}</h3>
                            {(col.dates.start !== todayStr || col.dates.end !== todayStr) && col.index === 1 && (
                              <p className="text-[10px] font-bold text-indigo-500 uppercase">Custom: {col.dates.start} to {col.dates.end}</p>
                            )}
                            {(col.dates.start !== thisMonthStartStr || col.dates.end !== thisMonthEndStr) && col.index === 2 && (
                              <p className="text-[10px] font-bold text-indigo-500 uppercase">Custom: {col.dates.start} to {col.dates.end}</p>
                            )}
                            {(col.dates.start !== lastMonthStartStr || col.dates.end !== lastMonthEndStr) && col.index === 3 && (
                              <p className="text-[10px] font-bold text-indigo-500 uppercase">Custom: {col.dates.start} to {col.dates.end}</p>
                            )}
                          </div>
                          <div className="relative">
                            <button 
                              onClick={() => setIsEditingCardDates(isEditingCardDates === col.index ? null : col.index)}
                              className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${isEditingCardDates === col.index ? 'bg-indigo-100 text-indigo-600' : 'bg-slate-50 text-slate-400 hover:bg-slate-100 mt-0'}`}
                            >
                              <Calendar className="w-5 h-5" />
                            </button>
                            {isEditingCardDates === col.index && (
                               <div className="absolute right-0 top-12 bg-white border border-slate-200 shadow-xl rounded-xl p-4 z-50 w-64">
                                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">Custom Period</h4>
                                  <div className="space-y-3">
                                     <div>
                                        <label className="block text-[10px] font-bold text-slate-400 mb-1 rounded-sm uppercase tracking-wider">Start Date</label>
                                        <input type="date" value={col.dates.start} onChange={e => col.setDates(p => ({...p, start: e.target.value}))} className="w-full text-xs font-bold border border-slate-200 p-2 rounded-lg outline-none" />
                                     </div>
                                     <div>
                                        <label className="block text-[10px] font-bold text-slate-400 mb-1 rounded-sm uppercase tracking-wider">End Date</label>
                                        <input type="date" value={col.dates.end} onChange={e => col.setDates(p => ({...p, end: e.target.value}))} className="w-full text-xs font-bold border border-slate-200 p-2 rounded-lg outline-none" />
                                     </div>
                                     <button onClick={() => setIsEditingCardDates(null)} className="w-full bg-slate-900 text-white text-xs font-bold py-2 rounded-lg mt-2 hover:bg-slate-800">Apply Filter</button>
                                  </div>
                               </div>
                            )}
                          </div>
                        </div>
                        
                        {col.summary ? (
                          <div className="space-y-4 flex-1">
                            {isAuthorisedForPayments && (
                              <div className="space-y-2 mb-4">
                                <div className="flex items-center justify-between p-3.5 bg-sky-50 rounded-2xl border border-sky-100/50">
                                  <span className="text-[11px] font-bold text-sky-800 uppercase tracking-widest flex items-center gap-1.5"><DollarSign className="w-4 h-4"/> Sales</span>
                                  <span className="text-base font-black text-sky-600">{formatCurrency(col.summary.sales)}</span>
                                </div>
                                <div className="pl-4 pr-2 py-1 flex items-center justify-between text-[10px] text-slate-500 font-bold uppercase tracking-wider">
                                  <span className="flex items-center gap-1">↳ Direct Sales</span>
                                  <span className="font-extrabold text-slate-700">{formatCurrency(col.summary.directSales || 0)}</span>
                                </div>
                                <div 
                                  onClick={() => openDebtRecoveryDetails(`${col.title} Recovered Debts`, parseLocalDate(col.dates.start), parseLocalDate(col.dates.end, true))}
                                  className="pl-4 pr-2 py-1.5 flex items-center justify-between text-[10px] text-teal-600 font-bold uppercase tracking-wider bg-teal-50/40 rounded-xl hover:bg-teal-50 cursor-pointer transition-all group/row"
                                >
                                  <span className="flex items-center gap-1">
                                    ↳ Recovered Debts 
                                    <Coins className="w-3.5 h-3.5 text-teal-500 animate-pulse" />
                                    <span className="text-[8px] bg-teal-100 text-teal-800 px-1.5 py-0.5 rounded-full font-black uppercase tracking-wider scale-90 opacity-0 group-hover/row:opacity-100 transition-opacity">View</span>
                                  </span>
                                  <span className="font-black text-teal-700 group-hover/row:underline">{formatCurrency(col.summary.recoveredDebts || 0)}</span>
                                </div>
                                <div className="flex items-center justify-between p-3.5 bg-indigo-50 rounded-2xl border border-indigo-100/50">
                                  <span className="text-[11px] font-bold text-indigo-800 uppercase tracking-widest flex items-center gap-1.5"><PlusCircle className="w-4 h-4"/> Fundings</span>
                                  <span className="text-base font-black text-indigo-600">{formatCurrency(col.summary.fundings)}</span>
                                </div>
                                <div className="flex items-center justify-between p-3.5 bg-rose-50 rounded-2xl border border-rose-100/50">
                                  <span className="text-[11px] font-bold text-rose-800 uppercase tracking-widest flex items-center gap-1.5"><Trash2 className="w-4 h-4"/> Expenses</span>
                                  <span className="text-base font-black text-rose-600">{formatCurrency(col.summary.expenses)}</span>
                                </div>
                                <div className="flex items-center justify-between p-3.5 bg-orange-50 rounded-2xl border border-orange-100/50">
                                  <span className="text-[11px] font-bold text-orange-800 uppercase tracking-widest flex items-center gap-1.5"><AlertCircle className="w-4 h-4"/> Arrears</span>
                                  <span className="text-base font-black text-orange-600">{formatCurrency(col.summary.arrears)}</span>
                                </div>
                                <div className="flex items-center justify-between p-3.5 bg-emerald-50 rounded-xl shadow-sm border border-emerald-200">
                                  <span className="text-[11px] font-bold text-emerald-900 uppercase tracking-widest flex items-center gap-1.5"><Wallet className="w-4 h-4"/> Net Cash</span>
                                  <span className="text-base font-black text-emerald-600">{formatCurrency(col.summary.cash)}</span>
                                </div>
                              </div>
                            )}

                            <div className="pt-2 border-t border-slate-100/60">
                              <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Operational Pulse</div>
                              <div className="space-y-3">
                                <div className="flex justify-between items-center group">
                                  <div className="flex items-center gap-2">
                                    <div className="w-1.5 h-1.5 rounded-full bg-indigo-400"></div>
                                    <span className="text-sm font-medium text-slate-600 group-hover:text-slate-900 transition-colors">Jobs Registered</span>
                                  </div>
                                  <span className="text-sm font-black text-slate-800 bg-slate-50 px-2 py-0.5 rounded-md">{col.summary.jobsRegistered}</span>
                                </div>
                                <div className="flex justify-between items-center group">
                                  <div className="flex items-center gap-2">
                                    <div className="w-1.5 h-1.5 rounded-full bg-amber-400"></div>
                                    <span className="text-sm font-medium text-slate-600 group-hover:text-slate-900 transition-colors">Pending Work</span>
                                  </div>
                                  <span className="text-sm font-black text-amber-600 bg-amber-50 px-2 py-0.5 rounded-md">{col.summary.jobsPending}</span>
                                </div>
                                <div className="flex justify-between items-center group">
                                  <div className="flex items-center gap-2">
                                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-400"></div>
                                    <span className="text-sm font-medium text-slate-600 group-hover:text-slate-900 transition-colors">Done & Paid</span>
                                  </div>
                                  <span className="text-sm font-black text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md">{col.summary.jobsDoneAndPaid}</span>
                                </div>
                                <div className="flex justify-between items-center group">
                                  <div className="flex items-center gap-2">
                                    <div className="w-1.5 h-1.5 rounded-full bg-rose-400"></div>
                                    <span className="text-sm font-medium text-slate-600 group-hover:text-slate-900 transition-colors">Done & Unpaid</span>
                                  </div>
                                  <span className="text-sm font-black text-rose-600 bg-rose-50 px-2 py-0.5 rounded-md">{col.summary.jobsDoneAndUnpaid}</span>
                                </div>
                                <div className="flex justify-between items-center group">
                                  <div className="flex items-center gap-2">
                                    <div className="w-1.5 h-1.5 rounded-full bg-purple-400"></div>
                                    <span className="text-sm font-medium text-slate-600 group-hover:text-slate-900 transition-colors">Done & Partial Pay</span>
                                  </div>
                                  <span className="text-sm font-black text-purple-600 bg-purple-50 px-2 py-0.5 rounded-md">{col.summary.jobsDoneAndPartiallyPaid}</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div className="flex-1 flex items-center justify-center text-slate-400 text-sm italic font-medium">Loading summary...</div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === 'tasks' && (
                <TasksView 
                  currentUser={user}
                  orders={rawOrders}
                  showNotification={(msg, type) => showNotification(msg, type)}
                />
              )}

              {activeTab === 'orders' && (
                <div className="space-y-6">
                  {/* Order Queue Tabs */}
                  <div className="flex gap-2 p-1 bg-slate-100 rounded-xl overflow-x-auto">
                    {[
                      { id: 'all', label: 'Total Job Orders' },
                      { id: 'queuing', label: 'Orders Queuing' },
                      { id: 'designer', label: 'Designer\'s Table' },
                      { id: 'production', label: 'In Production' },
                      { id: 'awaiting_invoice', label: 'Awaiting Invoices' },
                    ].map(t => (
                      <button
                        key={t.id}
                        onClick={() => setOrderQueueTab(t.id as any)}
                        className={`px-4 py-2 text-xs font-bold rounded-lg flex-shrink-0 transition-colors ${orderQueueTab === t.id ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                      >
                        {t.label}
                      </button>
                    ))}
                  </div>

                  {/* Date Filter & Actions */}
                  <div className="flex justify-between items-center bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
                    <div className="flex items-center gap-4">
                      <div className="relative">
                        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input 
                          type="text" 
                          placeholder="Search customer or ID..." 
                          className="pl-9 pr-4 py-2 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-red-500 w-64 text-xs font-bold"
                          value={customerSearch}
                          onChange={(e) => setCustomerSearch(e.target.value)}
                        />
                      </div>
                      <div className="flex items-center gap-2 border-l pl-4 border-slate-100">
                        <Calendar className="w-4 h-4 text-slate-400" />
                        <span className="text-sm font-bold text-slate-600">Queue Period:</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <input 
                          type="date" 
                          className="text-xs font-bold border-0 bg-slate-50 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-red-500"
                          value={filterDateRange.start}
                          onChange={(e) => setFilterDateRange(prev => ({ ...prev, start: e.target.value }))}
                        />
                        <span className="text-slate-400 font-bold text-xs uppercase">to</span>
                        <input 
                          type="date" 
                          className="text-xs font-bold border-0 bg-slate-50 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-red-500"
                          value={filterDateRange.end}
                          onChange={(e) => setFilterDateRange(prev => ({ ...prev, end: e.target.value }))}
                        />
                      </div>
                    </div>
                    <button 
                      onClick={() => {
                        setLoading(true);
                        generateOrderQueuePDF().finally(() => setLoading(false));
                      }}
                      className="px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-slate-800 transition-colors flex items-center gap-2 active:scale-95 shadow-sm"
                    >
                      <FileText className="w-3.5 h-3.5" /> Export PDF A4
                    </button>
                  </div>
                  {orderQueueTab === 'none' ? (
                    <div className="flex flex-col items-center justify-center py-24 bg-white border border-slate-100 border-dashed rounded-[2rem] mt-2 shadow-sm">
                      <FileText className="w-12 h-12 text-slate-200 mb-4" />
                      <h3 className="text-lg font-black text-slate-800 uppercase tracking-tight">Select a Queue Category</h3>
                      <p className="text-slate-500 font-medium text-sm mt-1 max-w-sm text-center">Click one of the predefined queue tabs above to display the corresponding orders.</p>
                    </div>
                  ) : (
                  <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="bg-slate-50 text-slate-500 text-xs font-bold uppercase tracking-wider">
                        <th className="px-6 py-4">Order ID</th>
                        <th className="px-6 py-4">Customer</th>
                        <th className="px-6 py-4">Status</th>
                        <th className="px-6 py-4">Staff Assigned</th>
                        <th className="px-6 py-4">Amount</th>
                        <th className="px-6 py-4">Payment</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {orders.filter(order => {
                        // Customer or ID search
                        if (customerSearch) {
                          const term = customerSearch.toLowerCase();
                          const matchesName = order.customer_name?.toLowerCase().includes(term);
                          const matchesId = String(order.id).toLowerCase().includes(term);
                          if (!matchesName && !matchesId) return false;
                        }

                        // For Admin/Receptionist, hid completed/paid jobs
                        const isAdminReceptionist = ['admin', 'receptionist', 'supervisor'].includes(user.role);
                        if (isAdminReceptionist && ['completed', 'paid', 'ready_for_payment'].includes(order.status || '')) return false;
                        
                        // For Specialized Staff (Designers/Operators)
                        const isSpecializedStaff = user.role === 'designer' || user.role === 'operator';
                        if (isSpecializedStaff) {
                          // Hide ALL completed/history jobs
                          const isHistory = ['done_awaiting_invoice', 'completed', 'paid'].includes(order.status);
                          if (isHistory) return false;

                          // Only see jobs assigned to you
                          // If it's not assigned to them, hide it from the Queue
                          if (order.assigned_staff_id !== user.id) return false;
                        }

                        // Tab specific filtering
                        if (orderQueueTab === 'queuing' && order.status !== 'pending') return false;
                        if (orderQueueTab === 'designer' && order.status !== 'at_designer') return false;
                        if (orderQueueTab === 'production' && order.status !== 'production') return false;
                        if (orderQueueTab === 'awaiting_invoice' && order.status !== 'done_awaiting_invoice') return false;

                        return true;
                      }).map(order => (
                        <tr 
                          key={order.id} 
                          className="hover:bg-slate-50 transition-colors cursor-pointer group"
                          onClick={() => handleOpenOrderDetail(order)}
                        >
                          <td className="px-6 py-4 font-bold text-slate-900 group-hover:text-red-600">{order.job_order_id || '#' + String(order.id).substring(0, 6).toUpperCase()}</td>
                          <td className="px-6 py-4 text-sm text-slate-600">
                            <div>
                              <p className="font-bold">{order.customer_name}</p>
                              <p className="text-[10px] text-slate-400 line-clamp-1">{order.description || 'No description'}</p>
                              {order.items_summary && (
                                <p className="text-[9px] text-red-500 mt-1 font-medium">
                                  {order.items_summary}
                                </p>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span className="text-[10px] font-bold uppercase px-2 py-1 rounded bg-slate-100 text-slate-600">
                              {getStatusLabel(order.status)}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-sm text-slate-500">
                            {order.assigned_staff_username ? (
                              <div className="flex flex-col">
                                <span className="font-medium text-slate-700">@{order.assigned_staff_username}</span>
                                <span className="text-[10px] text-slate-400">Assigned</span>
                              </div>
                            ) : (
                              <span className="text-slate-400 italic">Unassigned</span>
                            )}
                          </td>
                          <td className="px-6 py-4 text-sm font-bold text-slate-900">
                             <div>
                               <p>{formatCurrency(order.total_amount || 0, order.usd_rate)}</p>
                               {order.paid_amount > 0 && order.paid_amount < order.total_amount && (
                                 <p className="text-[10px] text-orange-600">Bal: {formatCurrency(order.total_amount - (order.paid_amount || 0), order.usd_rate)}</p>
                               )}
                             </div>
                          </td>
                          <td className="px-6 py-4 text-sm"><Badge status={order.payment_status} /></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                )}
              </div>
            )}

      {activeTab === 'jobs_done' && (
        <div className="space-y-6">
          <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-6">
              <div>
                <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tight">Jobs Done History</h3>
                <p className="text-slate-500">View and manage completed production work.</p>
              </div>
              <div className="flex items-center gap-3">
                <button 
                  onClick={() => generateJobsDonePDF()}
                  className="bg-emerald-600 text-white px-6 py-3 rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-emerald-700 transition-all flex items-center gap-2 shadow-lg shadow-emerald-100"
                >
                  <Download className="w-4 h-4" /> Export Jobs PDF
                </button>
                <div className="flex items-center gap-4 bg-slate-50 p-2 rounded-2xl">
                  <div className="flex items-center gap-2 px-4 py-2 border-r border-slate-200">
                    <Calendar className="w-4 h-4 text-slate-400" />
                    <input 
                      type="date" 
                      value={filterDateRange.start} 
                      onChange={e => setFilterDateRange(prev => ({ ...prev, start: e.target.value }))}
                      className="bg-transparent text-sm font-bold border-none outline-none focus:ring-0"
                    />
                  </div>
                  <div className="flex items-center gap-2 px-4">
                    <input 
                      type="date" 
                      value={filterDateRange.end} 
                      onChange={e => setFilterDateRange(prev => ({ ...prev, end: e.target.value }))}
                      className="bg-transparent text-sm font-bold border-none outline-none focus:ring-0"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Sub Tabs */}
            <div className="flex flex-wrap gap-3">
              {[
                { id: 'all', label: 'Total Jobs Done' },
                { id: 'unpaid', label: 'Jobs Done & Unpaid' },
                { id: 'paid', label: 'Jobs Done & Paid' },
                { id: 'partial', label: 'Jobs Paid Partially' }
              ].map(t => (
                <button
                  key={t.id}
                  onClick={() => setJobsDoneTab(t.id as any)}
                  className={`px-6 py-3 rounded-xl font-bold transition-all text-xs tracking-wide shadow-sm border ${
                    jobsDoneTab === t.id 
                      ? 'bg-slate-900 text-white border-slate-900 shadow-md' 
                      : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          {jobsDoneTab === 'none' ? (
            <div className="flex flex-col items-center justify-center py-24 bg-white border border-slate-100 border-dashed rounded-[2rem] shadow-sm">
              <Archive className="w-12 h-12 text-slate-200 mb-4" />
              <h3 className="text-lg font-black text-slate-800 uppercase tracking-tight">Select a History Category</h3>
              <p className="text-slate-500 font-medium text-sm mt-1 max-w-sm text-center">Click one of the predefined history tabs above to display the corresponding completed jobs.</p>
            </div>
          ) : (
            <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden font-sans">
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-slate-50 text-slate-400 text-[10px] font-black uppercase tracking-widest">
                      <th className="px-8 py-4">Job ID</th>
                      <th className="px-8 py-4">Customer</th>
                      <th className="px-8 py-4">Completed On</th>
                      <th className="px-8 py-4">Financials</th>
                      <th className="px-8 py-4">Status</th>
                      <th className="px-8 py-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {orders
                      .filter(o => ['completed', 'paid', 'ready_for_payment', 'done_awaiting_invoice'].includes(o.status || ''))
                      .filter(o => {
                         const isPrivileged = ['admin', 'receptionist', 'supervisor'].includes(user.role);
                         if (isPrivileged) return true;
                         if (user.role === 'designer') return o.designer_id === user.id || o.assigned_staff_id === user.id;
                         if (user.role === 'operator') return o.operator_id === user.id || o.assigned_staff_id === user.id;
                         return false;
                      })
                      .filter(order => {
                        if (!order.created_at) return false;
                        const d = order.created_at.toDate ? order.created_at.toDate() : new Date(order.created_at);
                        if (isNaN(d.getTime())) return false;
                        const orderDate = d.toISOString().split('T')[0];
                        return orderDate >= filterDateRange.start && orderDate <= filterDateRange.end;
                      })
                      .filter(order => {
                        const total = (order.total_amount || 0) * (1 - (order.discount || 0) / 100);
                        const paid = order.paid_amount || 0;
                        if (jobsDoneTab === 'unpaid') return paid === 0;
                        if (jobsDoneTab === 'paid') return paid >= total && total > 0;
                        if (jobsDoneTab === 'partial') return paid > 0 && paid < total;
                        return true; // 'all'
                      })
                      .map(order => (
                      <tr 
                        key={order.id} 
                        className="hover:bg-slate-50 transition-colors group cursor-pointer"
                        onClick={() => handleOpenOrderDetail(order)}
                      >
                        <td className="px-8 py-4 font-black text-slate-900 group-hover:text-red-500 transition-colors">
                          {order.job_order_id || '#' + String(order.id || '').substring(0, 8).toUpperCase()}
                        </td>
                        <td className="px-8 py-4 font-bold text-slate-700">{order.customer_name}</td>
                        <td className="px-8 py-4 text-xs font-medium text-slate-500">
                          {order.created_at?.toDate ? new Date(order.created_at.toDate()).toLocaleDateString() : 'N/A'}
                        </td>
                        <td className="px-8 py-4 text-xs">
                           <div>
                             <p className="text-slate-900 font-bold">Total: {formatCurrency((order.total_amount || 0) * (1 - (order.discount || 0) / 100))}</p>
                             <p className="text-emerald-600 font-medium mt-0.5">Paid: {formatCurrency(order.paid_amount || 0)}</p>
                             {(order.total_amount || 0) * (1 - (order.discount || 0) / 100) - (order.paid_amount || 0) > 0 && (
                               <p className="text-red-500 font-bold mt-0.5">Bal: {formatCurrency((order.total_amount || 0) * (1 - (order.discount || 0) / 100) - (order.paid_amount || 0))}</p>
                             )}
                           </div>
                        </td>
                        <td className="px-8 py-4"><Badge status={order.payment_status || 'unpaid'} /></td>
                        <td className="px-8 py-4 flex items-center justify-end gap-2" onClick={(e) => e.stopPropagation()}>
                           {isAuthorisedForPayments && (
                              <button 
                                onClick={() => {
                                  setConfirmModal({
                                    isOpen: true,
                                    title: 'Finish Transaction',
                                    message: `Process final balance payment for ${order.customer_name}?`,
                                    onConfirm: async () => {
                                      try {
                                        const isMaster = user?.staff_id === 'MASTER' || user?.email === 'tekkisandereagan@gmail.com' || user?.email === 'kulyakosukusandereagan@gmail.com';
                                        const staffName = isMaster ? 'System' : (user?.full_name || user?.username || 'Staff');
                                        const remaining = (order.total_amount || 0) * (1 - (order.discount || 0) / 100) - (order.paid_amount || 0);
                                        const result = await firebaseService.processPayment(order.id, Math.max(0, remaining), 'Cash', staffName);
                                        if (result) {
                                          await firebaseService.updateOrderStatus(order.id, 'paid', user.id, staffName);
                                          fetchDashboardData();
                                          showNotification('Payment processed', 'success');
                                        } else {
                                          showNotification('Payment recording error', 'error');
                                        }
                                      } catch (err) {
                                        showNotification('Error processing payment', 'error');
                                      }
                                      setConfirmModal(null);
                                    }
                                  });
                                }}
                                className="px-4 py-2 bg-emerald-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-100 whitespace-nowrap"
                              >
                                {((order.total_amount || 0) * (1 - (order.discount || 0) / 100) - (order.paid_amount || 0)) > 0.01 ? 'Charge Balance' : 'Close Job'}
                              </button>
                           )}
                           {(user?.role === 'receptionist' || user?.role === 'admin' || user?.email === "tekkisandereagan@gmail.com" || user?.email === "kulyakosukusandereagan@gmail.com" || user?.staff_id === 'MASTER') && (
                             <button onClick={(e) => {
                                 e.stopPropagation();
                                 setLoading(true);
                                 generateInvoicePDF(order).finally(() => setLoading(false));
                               }} 
                               className="p-2 border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors text-slate-600 group" title="Download Invoice"
                             >
                                <FileText className="w-4 h-4 group-hover:text-slate-900" />
                             </button>
                           )}
                        </td>
                      </tr>
                    ))}
                    {orders.filter(o => ['completed', 'paid', 'ready_for_payment', 'done_awaiting_invoice'].includes(o.status || '')).length === 0 && (
                      <tr>
                        <td colSpan={6} className="px-8 py-12 text-center text-slate-400 font-medium">
                          Select a tab or adjust date logic to view entries.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

              {activeTab === 'customers' && (
                <div className="space-y-6">
                  <div className="flex justify-between items-center">
                    <h3 className="text-xl font-bold text-slate-900">Customer Directory</h3>
                    <div className="flex items-center gap-4">
                      <div className="relative">
                        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input 
                          type="text" 
                          placeholder="Search clients..." 
                          className="pl-9 pr-4 py-2 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-red-500 w-64"
                          value={customerSearch}
                          onChange={(e) => setCustomerSearch(e.target.value)}
                        />
                      </div>
                      {['admin', 'receptionist', 'supervisor'].includes(user.role) && (
                        <button 
                        onClick={() => setIsCustomerModalOpen(true)}
                        className="bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-2 hover:bg-red-700 transition-colors"
                      >
                        <Plus className="w-4 h-4" />
                        Add New Customer
                      </button>
                    )}
                    </div>
                  </div>
                  {(!customers || !Array.isArray(customers) || customers.length === 0) ? (
                    <div className="bg-white p-12 rounded-2xl border border-dashed border-slate-200 text-center">
                      <Users className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                      <p className="text-slate-500">No customers found.</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {customers
                        .filter(c => {
                          if (referredCustomerIds && !referredCustomerIds.has(c.id)) {
                            return false;
                          }
                          return (c.name && c.name.toLowerCase().includes(customerSearch.toLowerCase())) || 
                                 (c.phone && c.phone.includes(customerSearch));
                        })
                        .map(customer => (
                        <div key={customer.id} className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow relative group">
                          {user.role === 'admin' && (
                            <button 
                              onClick={() => {
                                setConfirmModal({
                                  isOpen: true,
                                  title: 'Delete Customer',
                                  message: `Delete ${customer.name}?`,
                                  onConfirm: async () => {
                                    try {
                                      await firebaseService.deleteCustomer(customer.id);
                                      fetchDashboardData();
                                      showNotification('Customer deleted', 'success');
                                    } catch (err) {
                                      showNotification('Failed to delete', 'error');
                                    }
                                    setConfirmModal(null);
                                  }
                                });
                              }}
                              className="absolute top-4 right-4 p-2 text-slate-300 hover:text-rose-600 hover:bg-rose-50 rounded-lg opacity-0 group-hover:opacity-100 transition-all"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                          <div className="flex items-center gap-4 mb-4">
                            <div className="w-12 h-12 bg-red-50 rounded-xl flex items-center justify-center text-red-600 font-bold text-lg">
                              {customer.name ? customer.name[0] : '?'}
                            </div>
                            <div>
                              <h4 className="font-bold text-slate-900">{customer.name}</h4>
                              <p className="text-xs text-slate-500">ID: {customer.id ? String(customer.id).substring(0, 8).toUpperCase() : 'N/A'}</p>
                            </div>
                          </div>
                          <div className="space-y-2 text-sm text-slate-600 mb-6">
                            <p className="flex items-center gap-2">
                              <span className="text-slate-400 font-medium w-12">Phone:</span> {customer.phone}
                            </p>
                            <p className="flex items-center gap-2">
                              <span className="text-slate-400 font-medium w-12">Addr:</span> {customer.address}
                            </p>
                          </div>

                          <div className="pt-4 border-t border-slate-100 flex justify-between items-center">
                            <div>
                               <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Total Balance Due</p>
                               <p className={`text-sm font-black ${
                                   orders.filter(o => o.customer_id === customer.id).reduce((sum, o) => {
                                       const total = (o.total_amount || 0) * (1 - (o.discount || 0) / 100);
                                       return sum + (total - (o.paid_amount || 0));
                                   }, 0) > 0.01 ? 'text-rose-600' : 'text-emerald-600'
                               }`}>
                                   {formatCurrency(orders.filter(o => o.customer_id === customer.id).reduce((sum, o) => {
                                       const total = (o.total_amount || 0) * (1 - (o.discount || 0) / 100);
                                       return sum + (total - (o.paid_amount || 0));
                                   }, 0))}
                               </p>
                            </div>
                            <button 
                              onClick={() => {
                                setCustomerSearch(customer.name);
                                setActiveTab('debts');
                              }}
                              className="text-[10px] font-black text-red-600 uppercase tracking-widest hover:underline"
                            >
                              View Debts
                            </button>
                          </div>
                          <div className="mt-6 pt-4 border-t border-slate-50 flex justify-between items-center">
                            <span className="text-xs text-slate-400">Member since {formatDate(customer.created_at)}</span>
                            <button className="text-red-600 text-sm font-semibold hover:underline">View History</button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'finances' && (
                <div className="space-y-6">
                  {/* Date Filter */}
                  <div className="flex items-center gap-4 bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-slate-400" />
                      <span className="text-sm font-bold text-slate-600">Finance Period:</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <input 
                        type="date" 
                        className="text-xs font-bold border-0 bg-slate-50 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-red-500"
                        value={filterDateRange.start}
                        onChange={(e) => setFilterDateRange(prev => ({ ...prev, start: e.target.value }))}
                      />
                      <span className="text-slate-400 font-bold text-xs uppercase">to</span>
                      <input 
                        type="date" 
                        className="text-xs font-bold border-0 bg-slate-50 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-red-500"
                        value={filterDateRange.end}
                        onChange={(e) => setFilterDateRange(prev => ({ ...prev, end: e.target.value }))}
                      />
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="flex bg-slate-100 p-1 rounded-xl">
                      <button 
                        onClick={() => setFinanceSubTab('records')}
                        className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${financeSubTab === 'records' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                      >
                        Financial Records
                      </button>
                      <button 
                        onClick={() => setFinanceSubTab('approvals')}
                        className={`px-6 py-2 rounded-lg text-sm font-bold transition-all flex items-center gap-2 ${financeSubTab === 'approvals' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                      >
                        Pending Approvals
                        {finances.expenses.filter(e => e.status === 'pending').length > 0 && (
                          <span className="bg-rose-500 text-white text-[10px] w-5 h-5 rounded-full flex items-center justify-center animate-pulse">
                            {finances.expenses.filter(e => e.status === 'pending').length}
                          </span>
                        )}
                      </button>
                    </div>
                    <div className="flex gap-3">
                      <button 
                        onClick={() => generateExpensesPDF()}
                        className="bg-slate-900 text-white px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-2 hover:bg-black transition-colors shadow-sm"
                      >
                        <FileText className="w-4 h-4" />
                        Export PDF
                      </button>
                      {(user.role === 'admin' || user.role === 'receptionist' || user.staff_id === 'MASTER') && (
                        <button 
                          onClick={() => setIsFundingModalOpen(true)}
                          className="bg-emerald-600 text-white px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-2 hover:bg-emerald-700 transition-colors shadow-sm"
                        >
                          <Wallet className="w-4 h-4" />
                          Record Funding
                        </button>
                      )}
                      {(user.role === 'receptionist' || user.staff_id === 'MASTER') && (
                        <button 
                          onClick={() => setIsExpenseModalOpen(true)}
                          className="bg-rose-600 text-white px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-2 hover:bg-rose-700 transition-colors shadow-sm"
                        >
                          <DollarSign className="w-4 h-4" />
                          Record Expense Request
                        </button>
                      )}
                    </div>
                  </div>

                  {financeSubTab === 'records' ? (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                      <div className="space-y-4">
                        <h4 className="font-bold text-slate-800 flex items-center gap-2">
                          <Wallet className="w-5 h-5 text-emerald-500" />
                          Incoming Funds
                        </h4>
                        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                          <table className="w-full text-left">
                            <thead>
                              <tr className="bg-slate-50 text-slate-500 text-xs font-bold uppercase tracking-wider">
                                <th className="px-6 py-4">Source</th>
                                <th className="px-6 py-4">Amount</th>
                                <th className="px-6 py-4">Recorded By</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                              {(() => {
                                const start = new Date(filterDateRange.start + 'T00:00:00');
                                const end = new Date(filterDateRange.end + 'T23:59:59.999');
                                const filteredInflows = combinedInflows.filter(item => item.date >= start && item.date <= end);
                                
                                if (filteredInflows.length === 0) {
                                  return (
                                    <tr>
                                      <td colSpan={3} className="p-8 text-center text-slate-400 italic">
                                        No incoming funds (payments or capital funding) in this period
                                      </td>
                                    </tr>
                                  );
                                }
                                
                                return filteredInflows.map(item => (
                                  <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                                    <td className="px-6 py-4 text-sm font-bold text-slate-900 flex flex-col">
                                      <span>{item.source}</span>
                                      <span className="text-[10px] text-slate-400 mt-0.5">
                                        {item.date.toLocaleString()} • {item.type === 'funding' ? 'Capital Injection' : 'Client Receipt'}
                                      </span>
                                    </td>
                                    <td className="px-6 py-4 text-sm font-bold text-emerald-600">
                                      {formatCurrency(item.amount)}
                                    </td>
                                    <td className="px-6 py-4 text-sm text-slate-500">
                                      {item.recorded_by}
                                    </td>
                                  </tr>
                                ));
                              })()}
                            </tbody>
                          </table>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <h4 className="font-bold text-slate-800 flex items-center gap-2">
                          <DollarSign className="w-5 h-5 text-rose-500" />
                          Expenses
                        </h4>
                        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                          <table className="w-full text-left">
                            <thead>
                              <tr className="bg-slate-50 text-slate-500 text-xs font-bold uppercase tracking-wider">
                                <th className="px-6 py-4">Item</th>
                                <th className="px-6 py-4">Amount</th>
                                <th className="px-6 py-4">Category</th>
                                <th className="px-6 py-4">Approver</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                              {finances.expenses
                                .filter(e => {
                                  if (e.status !== 'approved') return false;
                                  if (!(e as any).created_at) return true;
                                  const d = (e as any).created_at?.toDate ? (e as any).created_at.toDate() : new Date((e as any).created_at);
                                  return d >= new Date(filterDateRange.start) && d <= new Date(new Date(filterDateRange.end).setHours(23, 59, 59, 999));
                                })
                                .length === 0 ? (
                                <tr><td colSpan={4} className="p-8 text-center text-slate-400 italic">No approved expenses in this period</td></tr>
                              ) : (
                                finances.expenses
                                  .filter(e => {
                                    if (e.status !== 'approved') return false;
                                    if (!(e as any).created_at) return true;
                                    const d = (e as any).created_at?.toDate ? (e as any).created_at.toDate() : new Date((e as any).created_at);
                                    return d >= new Date(filterDateRange.start) && d <= new Date(new Date(filterDateRange.end).setHours(23, 59, 59, 999));
                                  })
                                  .map(e => (
                                  <tr key={e.id} className="hover:bg-slate-50 transition-colors">
                                    <td className="px-6 py-4">
                                      <p className="text-sm font-bold text-slate-900">{e.item}</p>
                                      {e.category === 'Transport' && e.transport_from && e.transport_to && (
                                        <p className="text-xs text-slate-500">{e.transport_from} ➔ {e.transport_to}</p>
                                      )}
                                      {e.staff_name && (
                                        <p className="text-[10px] text-slate-400 font-semibold uppercase mt-0.5">Linked: {e.staff_name}</p>
                                      )}
                                    </td>
                                    <td className="px-6 py-4 text-sm font-bold text-rose-600">{formatCurrency(e.amount)}</td>
                                    <td className="px-6 py-4 text-sm text-slate-500">{e.category}</td>
                                    <td className="px-6 py-4">
                                      <div className="flex flex-col">
                                        <span className="text-xs font-bold text-slate-900">{e.approver_name || 'System'}</span>
                                        <span className="text-[10px] text-emerald-500 font-bold uppercase tracking-tighter">Approved</span>
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
                  ) : (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between gap-4 mb-2 flex-wrap">
                        <div className="flex items-center gap-2">
                          <AlertTriangle className="w-5 h-5 text-amber-500" />
                          <h4 className="font-bold text-slate-800 tracking-tight">Pending Expense Requests</h4>
                        </div>
                        {isSupervisor && selectedPendingExpenses.length > 0 && (
                          <div className="flex items-center gap-2 animate-in fade-in slide-in-from-top-1 duration-200">
                            <span className="text-xs font-bold text-slate-500 mr-2 bg-slate-100 px-3 py-1.5 rounded-full">
                              {selectedPendingExpenses.length} Selected
                            </span>
                            <button
                              onClick={() => {
                                setConfirmModal({
                                  isOpen: true,
                                  title: 'Bulk Approve Expenses',
                                  message: `Are you sure you want to approve all ${selectedPendingExpenses.length} selected expense requests?`,
                                  onConfirm: async () => {
                                    try {
                                      setLoading(true);
                                      const name = isMaster ? 'Master' : (user?.full_name || user?.username || 'Staff');
                                      for (const expId of selectedPendingExpenses) {
                                        await firebaseService.approveExpense(expId, user!.id, name, 'approved');
                                      }
                                      showNotification(`${selectedPendingExpenses.length} expenses approved!`, 'success');
                                      setSelectedPendingExpenses([]);
                                      setFinanceSubTab('records');
                                      fetchDashboardData();
                                    } catch (err) {
                                      showNotification('Bulk approval failed', 'error');
                                    } finally {
                                      setLoading(false);
                                      setConfirmModal(null);
                                    }
                                  }
                                });
                              }}
                              className="px-4 py-1.5 bg-emerald-600 text-white rounded-xl text-xs font-black uppercase hover:bg-emerald-700 transition-all shadow-md shadow-emerald-50 cursor-pointer"
                            >
                              Approve Selected
                            </button>
                            <button
                              onClick={() => {
                                setConfirmModal({
                                  isOpen: true,
                                  title: 'Bulk Delete Expenses',
                                  message: `Are you sure you want to permanently delete all ${selectedPendingExpenses.length} selected expense requests?`,
                                  onConfirm: async () => {
                                    try {
                                      setLoading(true);
                                      for (const expId of selectedPendingExpenses) {
                                        await firebaseService.deleteExpense(expId);
                                      }
                                      showNotification(`${selectedPendingExpenses.length} expenses successfully deleted!`, 'success');
                                      setSelectedPendingExpenses([]);
                                      setFinanceSubTab('records');
                                      fetchDashboardData();
                                    } catch (err) {
                                      showNotification('Bulk deletion failed', 'error');
                                    } finally {
                                      setLoading(false);
                                      setConfirmModal(null);
                                    }
                                  }
                                });
                              }}
                              className="px-4 py-1.5 bg-rose-600 text-white rounded-xl text-xs font-black uppercase hover:bg-rose-700 transition-all shadow-md shadow-rose-50 cursor-pointer"
                            >
                              Delete Selected
                            </button>
                          </div>
                        )}
                      </div>
                      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden overflow-x-auto">
                        <table className="w-full text-left min-w-[800px]">
                          <thead>
                            <tr className="bg-slate-50 text-slate-500 text-[10px] font-black uppercase tracking-widest">
                              {isSupervisor && (
                                <th className="px-6 py-5 w-12 text-center">
                                  <input 
                                    type="checkbox"
                                    className="rounded border-slate-300 text-red-600 focus:ring-red-500 w-4 h-4 cursor-pointer"
                                    checked={finances.expenses.filter(e => e.status === 'pending').length > 0 && selectedPendingExpenses.length === finances.expenses.filter(e => e.status === 'pending').length}
                                    onChange={(event) => {
                                      const pList = finances.expenses.filter(e => e.status === 'pending');
                                      if (event.target.checked) {
                                        setSelectedPendingExpenses(pList.map(item => item.id));
                                      } else {
                                        setSelectedPendingExpenses([]);
                                      }
                                    }}
                                  />
                                </th>
                              )}
                              <th className="px-8 py-5">Date</th>
                              <th className="px-8 py-5">Item Details</th>
                              <th className="px-8 py-5">Amount</th>
                              <th className="px-8 py-5">Requested By</th>
                              <th className="px-8 py-5 text-right">Approval Actions</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100">
                            {finances.expenses.filter(e => e.status === 'pending').length === 0 ? (
                              <tr>
                                <td colSpan={isSupervisor ? 6 : 5} className="px-8 py-20 text-center">
                                  <div className="max-w-xs mx-auto">
                                    <CheckCircle2 className="w-12 h-12 text-emerald-200 mx-auto mb-4" />
                                    <h4 className="text-slate-900 font-bold mb-1">Clear Horizon!</h4>
                                    <p className="text-sm text-slate-400">All expense requests have been processed.</p>
                                  </div>
                                </td>
                              </tr>
                            ) : (
                              finances.expenses
                                .filter(e => e.status === 'pending')
                                .sort((a,b) => (b.created_at?.toMillis?.() || 0) - (a.created_at?.toMillis?.() || 0))
                                .map(e => (
                                <tr key={e.id} className="hover:bg-slate-50/50 transition-all group">
                                  {isSupervisor && (
                                    <td className="px-6 py-5 text-center">
                                      <input 
                                        type="checkbox"
                                        className="rounded border-slate-300 text-red-600 focus:ring-red-500 w-4 h-4 cursor-pointer"
                                        checked={selectedPendingExpenses.includes(e.id)}
                                        onChange={(event) => {
                                          if (event.target.checked) {
                                            setSelectedPendingExpenses(prev => [...prev, e.id]);
                                          } else {
                                            setSelectedPendingExpenses(prev => prev.filter(id => id !== e.id));
                                          }
                                        }}
                                      />
                                    </td>
                                  )}
                                  <td className="px-8 py-5 whitespace-nowrap">
                                    <span className="text-xs font-bold text-slate-400">{formatDate(e.created_at)}</span>
                                  </td>
                                  <td className="px-8 py-5">
                                    <div className="flex flex-col">
                                      <span className="text-sm font-black text-slate-900 group-hover:text-red-600 transition-colors">{e.item}</span>
                                      <div className="flex flex-wrap items-center gap-1.5 text-xs text-slate-400">
                                        <span>{e.category}</span>
                                        {e.category === 'Transport' && e.transport_from && e.transport_to && (
                                          <>
                                            <span>•</span>
                                            <span>{e.transport_from} ➔ {e.transport_to}</span>
                                          </>
                                        )}
                                        {e.staff_name && (
                                          <>
                                            <span>•</span>
                                            <span className="text-rose-500 font-semibold bg-rose-50 px-1.5 py-0.5 rounded text-[10px]">Staff: {e.staff_name}</span>
                                          </>
                                        )}
                                      </div>
                                    </div>
                                  </td>
                                  <td className="px-8 py-5">
                                    <span className="text-sm font-black text-rose-600 px-3 py-1 bg-rose-50 rounded-lg">{formatCurrency(e.amount)}</span>
                                  </td>
                                  <td className="px-8 py-5">
                                    <div className="flex items-center gap-3">
                                      <div className="w-8 h-8 rounded-full bg-slate-900 flex items-center justify-center text-white text-xs font-black">
                                        {e.recorder_name?.charAt(0) || 'U'}
                                      </div>
                                      <span className="text-sm font-bold text-slate-700">{e.recorder_name}</span>
                                    </div>
                                  </td>
                                  <td className="px-8 py-5 text-right">
                                    {isSupervisor ? (
                                      <div className="flex items-center justify-end gap-2">
                                        <button 
                                          onClick={() => {
                                            setConfirmModal({
                                              isOpen: true,
                                              title: 'Reject Expense',
                                              message: `Are you sure you want to reject "${e.item}"?`,
                                              onConfirm: async () => {
                                                try {
                                                  setLoading(true);
                                                  const name = isMaster ? 'Master' : (user?.full_name || user?.username || 'Staff');
                                                  await firebaseService.approveExpense(e.id, user!.id, name, 'rejected');
                                                  showNotification('Expense request rejected', 'success');
                                                  setFinanceSubTab('records');
                                                } catch (err) {
                                                  showNotification('Failed to reject expense', 'error');
                                                } finally {
                                                  setLoading(false);
                                                  setConfirmModal(null);
                                                }
                                              }
                                            });
                                          }}
                                          className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all"
                                          title="Reject"
                                        >
                                          <XCircle className="w-5 h-5" />
                                        </button>
                                        <button 
                                          onClick={() => {
                                            setConfirmModal({
                                              isOpen: true,
                                              title: 'Approve Expense',
                                              message: `Approve payment of ${formatCurrency(e.amount)} for "${e.item}"?`,
                                              onConfirm: async () => {
                                                try {
                                                  setLoading(true);
                                                  const name = isMaster ? 'Master' : (user?.full_name || user?.username || 'Staff');
                                                  await firebaseService.approveExpense(e.id, user!.id, name, 'approved');
                                                  showNotification('Expense request approved!', 'success');
                                                  setFinanceSubTab('records');
                                                } catch (err) {
                                                  showNotification('Failed to approve expense', 'error');
                                                } finally {
                                                  setLoading(false);
                                                  setConfirmModal(null);
                                                }
                                              }
                                            });
                                          }}
                                          className="flex items-center gap-2 bg-emerald-600 text-white px-4 py-2 rounded-xl text-sm font-black hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-100"
                                        >
                                          <Check className="w-4 h-4" />
                                          Approve
                                        </button>
                                      </div>
                                    ) : (
                                      <span className="text-xs font-black text-slate-300 italic uppercase tracking-tighter">Waiting for Approval</span>
                                    )}
                                  </td>
                                </tr>
                              ))
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'services' && (
                <div className="space-y-6">
                  <div className="flex justify-between items-center bg-white p-6 rounded-3xl border border-slate-100 shadow-sm font-sans flex-col md:flex-row gap-4">
                    <div className="flex gap-4 items-center">
                      <h3 className="text-xl font-bold text-slate-900 leading-none">Services & Stock</h3>
                      <div className="h-6 w-px bg-slate-200 hidden md:block"></div>
                      <div className="flex gap-2 p-1 bg-slate-100 rounded-xl overflow-x-auto">
                         <button 
                             onClick={() => setServicesTab('services')}
                             className={`px-4 py-2 text-xs font-bold rounded-lg flex-shrink-0 transition-colors ${servicesTab === 'services' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                         >Services & Materials</button>
                         <button 
                             onClick={() => setServicesTab('assets')}
                             className={`px-4 py-2 text-xs font-bold rounded-lg flex-shrink-0 transition-colors ${servicesTab === 'assets' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                         >Company Assets</button>
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <button 
                        onClick={() => {
                          if (servicesTab === 'services') {
                            generateFullInventoryPDF();
                          } else {
                            generateAssetsPDF();
                          }
                        }}
                        className="bg-slate-100 text-slate-700 px-5 py-2.5 rounded-xl text-sm font-black uppercase tracking-widest flex items-center gap-2 hover:bg-slate-200 transition-all border border-slate-200"
                      >
                        <Download className="w-5 h-5" />
                        Export PDF
                      </button>
                      {isManagementUser && servicesTab === 'services' && (
                        <button 
                          onClick={() => setIsServiceModalOpen(true)}
                          className="bg-red-600 text-white px-5 py-2.5 rounded-xl text-sm font-black uppercase tracking-widest flex items-center gap-2 hover:bg-red-700 transition-all shadow-lg shadow-red-200"
                        >
                          <Plus className="w-5 h-5" />
                          Add Service
                        </button>
                      )}
                      {isManagementUser && servicesTab === 'assets' && (
                        <button 
                          onClick={() => setIsAssetModalOpen(true)}
                          className="bg-red-600 text-white px-5 py-2.5 rounded-xl text-sm font-black uppercase tracking-widest flex items-center gap-2 hover:bg-red-700 transition-all shadow-lg shadow-red-200"
                        >
                          <Plus className="w-5 h-5" />
                          Add Asset
                        </button>
                      )}
                    </div>
                  </div>

                  {servicesTab === 'services' && (
                    <>
                      {/* Search Input for Services, Materials & Inventory */}
                      <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm font-sans flex items-center gap-3">
                        <Search className="text-slate-400 w-5 h-5" />
                    <input 
                      type="text"
                      placeholder="Search specific service, material, or category history..."
                      value={servicesSearchTerm}
                      onChange={(e) => setServicesSearchTerm(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 font-medium transition-all text-slate-800"
                    />
                    {servicesSearchTerm && (
                      <button 
                        onClick={() => setServicesSearchTerm('')}
                        className="text-slate-400 hover:text-slate-600 font-medium text-xs uppercase tracking-widest px-3 py-1 bg-slate-100 hover:bg-slate-200 rounded-lg transition-all"
                      >
                        Clear
                      </button>
                    )}
                  </div>
                  
                  {(!filteredServices || filteredServices.length === 0) ? (
                    <div className="bg-white p-12 rounded-2xl border border-dashed border-slate-200 text-center">
                      <Package className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                      <p className="text-slate-500">No services or materials match your search.</p>
                    </div>
                  ) : (
                    <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden font-sans">
                      <table className="w-full text-left">
                        <thead>
                          <tr className="bg-slate-50 text-slate-400 text-[10px] font-black uppercase tracking-widest">
                            <th className="px-8 py-4">Service Name</th>
                            <th className="px-8 py-4">Stock Level</th>
                            <th className="px-8 py-4">Base Price (USD)</th>
                            <th className="px-8 py-4">Daily Price (SSP)</th>
                            <th className="px-8 py-4 text-right">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {[...(filteredServices || [])].sort((a, b) => (a.name || '').localeCompare(b.name || '')).map(s => (
                            <tr key={s.id} className="hover:bg-slate-50 transition-colors">
                              <td className="px-8 py-4">
                                <span className="font-black text-slate-900 block">{s.name}</span>
                                <span className="text-xs text-slate-400 capitalize">{s.category || 'General'}</span>
                              </td>
                              <td className="px-8 py-4">
                                <div className="space-y-1">
                                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold ${s.stock <= s.minimum_stock ? 'bg-rose-100 text-rose-700' : 'bg-emerald-100 text-emerald-700'}`}>
                                    {s.stock} {s.unit}
                                  </span>
                                  {s.stock <= s.minimum_stock && (
                                    <p className="text-[10px] text-rose-500 font-bold flex items-center gap-1">
                                      <AlertTriangle className="w-3 h-3" /> Needs Restock
                                    </p>
                                  )}
                                </div>
                              </td>
                              <td className="px-8 py-4 font-black text-emerald-600">
                                {formatUSD(s.price)}
                              </td>
                              <td className="px-8 py-4 font-bold text-slate-600">
                                {formatCurrency(usdToSsp(s.price))}
                              </td>
                              <td className="px-8 py-4 text-right">
                                <div className="flex items-center justify-end gap-2">
                                  {/* Detailed History Action Button */}
                                  <button
                                    onClick={() => {
                                      setSelectedAnalyticsItem(s);
                                      setIsHistoryModalOpen(true);
                                    }}
                                    className="bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all inline-flex items-center gap-1.5"
                                  >
                                    <Clock className="w-3.5 h-3.5 text-slate-500" /> History
                                  </button>

                                  {(user.role === 'admin' || user.role === 'supervisor') && (
                                    <button 
                                      onClick={() => {
                                        setSelectedRestockItem({
                                          id: s.id,
                                          item_name: s.name,
                                          stock: s.stock,
                                          minimum_stock: s.minimum_stock,
                                          unit: s.unit || 'pcs',
                                          is_service: true
                                        } as any);
                                        setRestockAmount(0);
                                        setIsRestockModalOpen(true);
                                      }}
                                      className="bg-slate-900 text-white px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-slate-800 transition-all"
                                    >
                                      Restock
                                    </button>
                                  )}
                                  {isAdminUser && (
                                    <button 
                                      onClick={() => {
                                        setConfirmModal({
                                          isOpen: true,
                                          title: 'Delete Service',
                                          message: `Are you sure you want to delete ${s.name}?`,
                                          onConfirm: async () => {
                                            try {
                                              await firebaseService.deleteService(s.id);
                                              showNotification('Service deleted', 'success');
                                            } catch (err) {
                                              showNotification('Delete failed', 'error');
                                            }
                                            setConfirmModal(null);
                                          }
                                        });
                                      }}
                                      className="p-2 text-rose-400 hover:text-rose-600"
                                    >
                                      <Trash2 className="w-5 h-5" />
                                    </button>
                                  )}
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}

                  {/* Comprehensive Side Drawer for Movements History */}
                  {isHistoryModalOpen && selectedAnalyticsItem && (
                    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex justify-end font-sans transition-all animate-fade-in" id="history-drawer-overlay" onClick={(e) => {
                      if ((e.target as HTMLElement).id === 'history-drawer-overlay') setIsHistoryModalOpen(false);
                    }}>
                      <div className="w-full max-w-4xl bg-white h-full shadow-2xl flex flex-col overflow-hidden animate-slide-left">
                        {/* Drawer Header */}
                        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                          <div>
                            <span className="text-xs font-black uppercase text-red-600 tracking-widest">{selectedAnalyticsItem.category || 'General'}</span>
                            <h4 className="text-2xl font-black text-slate-900 mt-1">{selectedAnalyticsItem.name}</h4>
                            <p className="text-xs text-slate-500 mt-0.5">Comprehensive Purchase, Selling & Stock Adjustment Logs</p>
                          </div>
                          <button 
                            onClick={() => setIsHistoryModalOpen(false)}
                            className="p-2 hover:bg-slate-200 rounded-full text-slate-400 hover:text-slate-600 transition-all"
                          >
                            <X className="w-6 h-6" />
                          </button>
                        </div>

                        {/* Drawer Body */}
                        <div className="flex-1 overflow-y-auto p-8 space-y-8">
                          {detailedHistoryLoading ? (
                            <div className="h-full flex flex-col items-center justify-center py-20">
                              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-red-600 mb-4"></div>
                              <p className="text-slate-500 text-sm font-medium">Fetching real-time historical movements...</p>
                            </div>
                          ) : (
                            <>
                              {/* Summary Cards */}
                              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1">Available Stock</p>
                                  <p className="text-xl font-black text-slate-900">{detailedStats.stock?.toLocaleString()} {selectedAnalyticsItem.unit || 'pcs'}</p>
                                </div>
                                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1">Total Usage (All Time)</p>
                                  <p className="text-xl font-black text-red-600">{detailedStats.totalUsage?.toLocaleString()} {selectedAnalyticsItem.unit || 'pcs'}</p>
                                </div>
                                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1">Revenue Generated</p>
                                  <p className="text-xl font-black text-emerald-600">{formatCurrency(detailedStats.revenueGenerated)}</p>
                                </div>
                                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1">Logs Count</p>
                                  <p className="text-xl font-black text-indigo-600">{detailedHistory.length}</p>
                                </div>
                              </div>

                              {/* Actions Bar */}
                              <div className="flex justify-end">
                                <button 
                                  onClick={() => generateItemConsumptionPDF(selectedAnalyticsItem, detailedHistory)}
                                  className="bg-slate-900 text-white px-5 py-2.5 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-slate-800 transition-all flex items-center gap-2 shadow-sm"
                                >
                                  <Download className="w-4 h-4" /> Download Statement PDF
                                </button>
                              </div>

                              {/* Table */}
                              <div className="space-y-3">
                                <h5 className="font-black text-slate-900 uppercase tracking-widest text-[11px] px-1">Movement Details</h5>
                                <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-sm">
                                  <table className="w-full text-left">
                                    <thead>
                                      <tr className="bg-slate-50 text-slate-400 text-[10px] font-black uppercase tracking-widest border-b border-slate-100">
                                        <th className="px-6 py-3.5">Date</th>
                                        <th className="px-6 py-3.5">Action</th>
                                        <th className="px-6 py-3.5">Source/Customer</th>
                                        <th className="px-6 py-3.5">Order ID</th>
                                        <th className="px-6 py-3.5">Qty Change</th>
                                        <th className="px-6 py-3.5">Unit Price</th>
                                        <th className="px-6 py-3.5">Assigned Staff</th>
                                      </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100 text-slate-700">
                                      {detailedHistory.length === 0 ? (
                                        <tr>
                                          <td colSpan={7} className="text-center py-12 text-slate-400 italic text-sm">
                                            No purchase or selling history loaded for this item.
                                          </td>
                                        </tr>
                                      ) : (
                                        detailedHistory.map((log, idx) => (
                                          <tr key={idx} className="hover:bg-slate-50/80 transition-colors text-xs lg:text-sm">
                                            <td className="px-6 py-4 text-xs font-semibold text-slate-500 whitespace-nowrap">
                                              {formatDate(log.date)}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                              <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-extrabold uppercase tracking-wider ${
                                                log.type === 'Sold' 
                                                  ? 'bg-amber-50 text-amber-600 border border-amber-100' 
                                                  : log.type === 'Restock' 
                                                    ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' 
                                                    : 'bg-blue-50 text-blue-600 border border-blue-100'
                                              }`}>
                                                {log.type}
                                              </span>
                                            </td>
                                            <td className="px-6 py-4 font-bold text-slate-800 truncate max-w-[150px]">
                                              {log.details}
                                            </td>
                                            <td className="px-6 py-4 text-xs font-mono font-bold text-slate-400 whitespace-nowrap">
                                              {log.orderId}
                                            </td>
                                            <td className={`px-6 py-4 font-black whitespace-nowrap ${log.amount < 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
                                              {log.amount > 0 ? '+' : ''}{log.amount}
                                            </td>
                                            <td className="px-6 py-4 font-bold text-slate-600 whitespace-nowrap">
                                              {log.unitPrice > 0 ? formatCurrency(log.unitPrice) : '-'}
                                            </td>
                                            <td className="px-6 py-4 text-xs text-slate-500 whitespace-nowrap">
                                              @{log.staff}
                                            </td>
                                          </tr>
                                        ))
                                      )}
                                    </tbody>
                                  </table>
                                </div>
                              </div>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                  </>
                  )}

                  {servicesTab === 'assets' && (
                    <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden font-sans">
                      <table className="w-full text-left">
                        <thead>
                          <tr className="bg-slate-50 text-slate-400 text-[10px] font-black uppercase tracking-widest">
                            <th className="px-8 py-4">Asset Name</th>
                            <th className="px-8 py-4">Type</th>
                            <th className="px-8 py-4">Quantity</th>
                            <th className="px-8 py-4">Total Value</th>
                            <th className="px-8 py-4 text-right">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {assets.length === 0 ? (
                            <tr>
                              <td colSpan={5} className="px-8 py-12 text-center text-slate-400 italic font-medium">No company assets recorded.</td>
                            </tr>
                          ) : (
                            assets.map((a: Asset) => (
                              <tr key={a.id} className="hover:bg-slate-50 transition-colors">
                                <td className="px-8 py-4">
                                  <span className="font-black text-slate-900 block">{a.name}</span>
                                  {a.description && <span className="text-xs text-slate-400 truncate max-w-[200px] block">{a.description}</span>}
                                </td>
                                <td className="px-8 py-4">
                                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest ${a.type === 'usable' ? 'bg-indigo-100 text-indigo-700' : 'bg-slate-100 text-slate-700'}`}>
                                    {a.type}
                                  </span>
                                </td>
                                <td className="px-8 py-4 font-bold text-slate-600">
                                  {a.quantity}
                                </td>
                                <td className="px-8 py-4 font-black text-emerald-600">
                                  {formatUSD(a.value)}
                                </td>
                                <td className="px-8 py-4 text-right">
                                  <div className="flex items-center justify-end gap-2">
                                    {a.type === 'usable' && (
                                      <button 
                                        onClick={() => {
                                          if (isAdminUser) {
                                            setConfirmModal({
                                              isOpen: true,
                                              title: 'Record Usage',
                                              message: `Record usage of 1 unit of ${a.name}?`,
                                              onConfirm: async () => {
                                                try {
                                                  if (a.quantity <= 0) {
                                                    showNotification('Out of stock', 'error');
                                                    setConfirmModal(null);
                                                    return;
                                                  }
                                                  // Reduce quantity and adjust total value proportionally
                                                  const unitValue = a.value / a.quantity;
                                                  await firebaseService.updateAsset(a.id, { 
                                                    quantity: a.quantity - 1,
                                                    value: a.value - unitValue
                                                  });
                                                  showNotification('Usage recorded', 'success');
                                                } catch (err) {
                                                  showNotification('Action failed', 'error');
                                                }
                                                setConfirmModal(null);
                                              }
                                            });
                                          } else {
                                            setConfirmModal({
                                              isOpen: true,
                                              title: 'Request Usage',
                                              message: `Request admin approval to use 1 unit of ${a.name}?`,
                                              onConfirm: async () => {
                                                try {
                                                  await firebaseService.requestAssetReduction(a.id, {
                                                    amount: 1,
                                                    requested_by: user!.full_name,
                                                    reason: 'Usage Request'
                                                  });
                                                  showNotification('Request sent to admin', 'success');
                                                } catch (err) {
                                                  showNotification('Action failed', 'error');
                                                }
                                                setConfirmModal(null);
                                              }
                                            });
                                          }
                                        }}
                                        className="bg-indigo-50 text-indigo-600 hover:bg-indigo-100 px-3 py-1.5 rounded-lg text-xs font-black tracking-widest uppercase transition-colors mr-2"
                                      >
                                        {isAdminUser ? 'Use Asset' : 'Request Use'}
                                      </button>
                                    )}
                                    {isAdminUser && (
                                      <button 
                                        onClick={() => {
                                          setConfirmModal({
                                            isOpen: true,
                                            title: 'Delete Asset',
                                            message: `Are you sure you want to remove ${a.name}?`,
                                            onConfirm: async () => {
                                              try {
                                                await firebaseService.deleteAsset(a.id);
                                                showNotification('Asset removed', 'success');
                                              } catch (err) {
                                                showNotification('Action failed', 'error');
                                              }
                                              setConfirmModal(null);
                                            }
                                          });
                                        }}
                                        className="p-2 text-rose-400 hover:text-rose-600"
                                      >
                                        <Trash2 className="w-5 h-5" />
                                      </button>
                                    )}
                                  </div>
                                  {a.type === 'usable' && isAdminUser && a.reduction_requests && (
                                    <div className="mt-2 space-y-1">
                                      {a.reduction_requests.filter(r => r.status === 'pending').map(req => (
                                        <div key={req.id} className="text-[10px] text-left bg-orange-50 px-3 py-2 rounded-lg border border-orange-100 flex justify-between items-center w-full">
                                          <span><b className="text-orange-900">{req.requested_by}</b> requests {req.amount}</span>
                                          <div className="flex gap-2">
                                            <button onClick={() => {
                                              firebaseService.processAssetReduction(a.id, req.id, 'approved', a.reduction_requests!, req.amount).then(()=>showNotification('Approved','success')).catch(()=>showNotification('Failed','error'));
                                            }} className="text-emerald-600 font-bold hover:underline uppercase tracking-wider">Approve</button>
                                            <button onClick={() => {
                                              firebaseService.processAssetReduction(a.id, req.id, 'rejected', a.reduction_requests!).then(()=>showNotification('Rejected','info')).catch(()=>showNotification('Failed','error'));
                                            }} className="text-rose-600 font-bold hover:underline uppercase tracking-wider">Decline</button>
                                          </div>
                                        </div>
                                      ))}
                                    </div>
                                  )}
                                </td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'analytics' && (
                <div className="space-y-8 animate-fade-in">
                  <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex flex-col md:flex-row md:items-center gap-4">
                      <h3 className="text-xl font-bold text-slate-800">Business Analytics</h3>
                      
                      {/* Sub-tab Selection */}
                      <div className="flex bg-slate-100 p-1.5 rounded-2xl shrink-0 overflow-x-auto">
                        <button 
                          onClick={() => {
                            setAnalyticsSubTab('materials');
                            setSelectedAnalyticsItem(null);
                          }}
                          className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all whitespace-nowrap ${analyticsSubTab === 'materials' ? 'bg-white shadow-sm text-slate-900' : 'text-slate-500 hover:text-slate-900'}`}
                        >
                          Material Analysis
                        </button>
                        <button 
                          onClick={() => setAnalyticsSubTab('staff')}
                          className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all whitespace-nowrap ${analyticsSubTab === 'staff' ? 'bg-white shadow-sm text-slate-900' : 'text-slate-500 hover:text-slate-900'}`}
                        >
                          Staff Performance
                        </button>
                        <button 
                          onClick={() => setAnalyticsSubTab('expenses')}
                          className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all whitespace-nowrap ${analyticsSubTab === 'expenses' ? 'bg-white shadow-sm text-slate-900' : 'text-slate-500 hover:text-slate-900'}`}
                        >
                          Expenses
                        </button>
                        <button 
                          onClick={() => setAnalyticsSubTab('profits')}
                          className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all whitespace-nowrap ${analyticsSubTab === 'profits' ? 'bg-white shadow-sm text-slate-900' : 'text-slate-500 hover:text-slate-900'}`}
                        >
                          Profits
                        </button>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-4 w-full md:w-auto">
                      {analyticsSubTab === 'materials' && (
                        <div className="relative w-full md:w-80">
                          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                          <input 
                            type="text" 
                            placeholder="Search specific item/service history..." 
                            className="w-full pl-10 pr-4 py-3 rounded-2xl border border-slate-100 bg-slate-50 outline-none focus:ring-2 focus:ring-red-500 font-medium transition-all"
                            value={analyticsSearchTerm}
                            onChange={(e) => setAnalyticsSearchTerm(e.target.value)}
                          />
                          {analyticsSearchTerm && (
                            <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-xl border border-slate-100 z-50 max-h-60 overflow-y-auto w-full">
                              {services
                                .filter(s => s.name.toLowerCase().includes(analyticsSearchTerm.toLowerCase()))
                                .map(s => (
                                  <button 
                                    key={s.id}
                                    onClick={() => {
                                      setSelectedAnalyticsItem(s);
                                      setAnalyticsSearchTerm('');
                                    }}
                                    className="w-full p-4 flex items-center gap-3 hover:bg-slate-50 border-b border-slate-50 last:border-0 text-left"
                                  >
                                    <div className="w-10 h-10 bg-red-50 rounded-xl flex items-center justify-center text-red-600 font-bold text-xs shrink-0">
                                      {s.name[0]}
                                    </div>
                                    <div className="overflow-hidden">
                                      <p className="font-bold text-slate-900 truncate">{s.name}</p>
                                      <p className="text-[10px] text-slate-400 uppercase font-black tracking-tighter">{s.category}</p>
                                    </div>
                                  </button>
                                ))}
                            </div>
                          )}
                        </div>
                      )}

                      {/* Unified Date Range Filter */}
                      <div className="flex flex-wrap items-center gap-2 bg-slate-50 p-2 rounded-2xl border border-slate-100">
                        <div className="flex items-center gap-1.5 px-3 py-1.5">
                          <Calendar className="w-4 h-4 text-slate-500" />
                          <span className="text-[10px] font-black uppercase text-slate-500 tracking-wider">Analysis Period:</span>
                        </div>
                        <input 
                          type="date" 
                          value={filterDateRange.start}
                          onChange={(e) => setFilterDateRange({...filterDateRange, start: e.target.value})}
                          className="bg-white px-3 py-1.5 text-xs font-bold border border-slate-105 rounded-xl outline-none focus:ring-2 focus:ring-red-500 shrink-0"
                        />
                        <span className="text-xs font-extrabold text-slate-400">to</span>
                        <input 
                          type="date" 
                          value={filterDateRange.end}
                          onChange={(e) => setFilterDateRange({...filterDateRange, end: e.target.value})}
                          className="bg-white px-3 py-1.5 text-xs font-bold border border-slate-105 rounded-xl outline-none focus:ring-2 focus:ring-red-500 shrink-0"
                        />
                      </div>
                    </div>
                  </div>

                  {analyticsSubTab === 'materials' && (
                    selectedAnalyticsItem ? (
                      <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm">
                        <button onClick={() => setSelectedAnalyticsItem(null)} className="mb-6 text-xs font-black text-red-600 uppercase tracking-widest hover:underline flex items-center gap-1 bg-red-50 px-4 py-2 rounded-xl">
                          ← Back to Global Summary
                        </button>
                        <div className="flex flex-col md:flex-row justify-between items-start mb-8 gap-4">
                          <div>
                            <h4 className="text-3xl font-black text-slate-900 mb-2">{selectedAnalyticsItem.item_name || selectedAnalyticsItem.name}</h4>
                            <p className="text-slate-500 font-medium">{selectedAnalyticsItem.category} | {selectedAnalyticsItem.is_service ? 'Consumer Service' : 'Raw Material'}</p>
                          </div>
                          <button 
                            onClick={() => generateItemConsumptionPDF(selectedAnalyticsItem, filteredDetailedHistory)}
                            className="bg-slate-900 text-white px-6 py-3 rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-slate-800 transition-all flex items-center gap-2"
                          >
                            <FileText className="w-4 h-4" /> Download History
                          </button>
                        </div>
                        
                        {detailedHistoryLoading ? (
                          <div className="flex flex-col items-center justify-center py-20">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600 mb-2"></div>
                            <p className="text-slate-500 text-sm">Loading comprehensive history...</p>
                          </div>
                        ) : (
                          <>
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
                              <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
                                <p className="text-[10px] font-black text-slate-400 uppercase mb-2 tracking-widest">Available Stock</p>
                                <p className="text-2xl font-black text-slate-900">{filteredDetailedStats.stock?.toLocaleString()} {selectedAnalyticsItem.unit}</p>
                              </div>
                              <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
                                <p className="text-[10px] font-black text-slate-400 uppercase mb-2 tracking-widest">Selected Period Usage</p>
                                <p className="text-2xl font-black text-red-600">
                                  {filteredDetailedStats.totalUsage?.toLocaleString()} {selectedAnalyticsItem.unit}
                                </p>
                              </div>
                              <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
                                <p className="text-[10px] font-black text-slate-400 uppercase mb-2 tracking-widest">Revenue Generated (Paid)</p>
                                <p className="text-2xl font-black text-emerald-600">
                                  {formatCurrency(filteredDetailedStats.revenueGenerated)}
                                </p>
                              </div>
                              <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
                                <p className="text-[10px] font-black text-slate-400 uppercase mb-2 tracking-widest">Times Requested</p>
                                <p className="text-2xl font-black text-slate-900">
                                  {filteredDetailedStats.timesRequested?.toLocaleString()}
                                </p>
                              </div>
                            </div>

                            <div className="space-y-4">
                              <h5 className="font-black text-slate-900 uppercase tracking-widest text-xs px-2">Detailed Purchase & Selling History</h5>
                              <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-sm">
                                <table className="w-full text-left">
                                  <thead>
                                    <tr className="bg-slate-50 text-slate-400 text-[10px] font-black uppercase tracking-widest">
                                      <th className="px-6 py-4">Date</th>
                                      <th className="px-6 py-4">Action</th>
                                      <th className="px-6 py-4">Customer/Source</th>
                                      <th className="px-6 py-4">Order ID</th>
                                      <th className="px-6 py-4">Qty Change</th>
                                      <th className="px-6 py-4">Unit Price</th>
                                      <th className="px-6 py-4">Staff</th>
                                    </tr>
                                  </thead>
                                  <tbody className="divide-y divide-slate-100">
                                    {filteredDetailedHistory.length === 0 ? (
                                      <tr>
                                        <td colSpan={7} className="text-center py-8 text-slate-400 italic text-sm">
                                          No transactions or restock records found for this item in this period
                                        </td>
                                      </tr>
                                    ) : (
                                      filteredDetailedHistory.map((log, idx) => (
                                        <tr key={idx} className="hover:bg-slate-50 transition-colors">
                                          <td className="px-6 py-4 text-xs font-semibold text-slate-500">{formatDate(log.date)}</td>
                                          <td className="px-6 py-4">
                                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase ${
                                              log.type === 'Sold' 
                                                ? 'bg-orange-50 text-orange-600' 
                                                : log.type === 'Restock' 
                                                  ? 'bg-emerald-50 text-emerald-600' 
                                                  : 'bg-blue-50 text-blue-600'
                                            }`}>
                                              {log.type}
                                            </span>
                                          </td>
                                          <td className="px-6 py-4 text-sm font-bold text-slate-900 truncate max-w-[150px]">{log.details}</td>
                                          <td className="px-6 py-4 text-xs font-mono font-bold text-slate-400">{log.orderId}</td>
                                          <td className={`px-6 py-4 text-sm font-black ${log.amount < 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
                                            {log.amount > 0 ? '+' : ''}{log.amount}
                                          </td>
                                          <td className="px-6 py-4 text-xs font-bold text-slate-600">{log.unitPrice > 0 ? formatCurrency(log.unitPrice) : '-'}</td>
                                          <td className="px-6 py-4 text-xs text-slate-500">@{log.staff}</td>
                                        </tr>
                                      ))
                                    )}
                                  </tbody>
                                </table>
                              </div>
                            </div>
                          </>
                        )}
                      </div>
                    ) : (
                      <>
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                          <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm">
                            <h4 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
                              <Package className="w-5 h-5 text-red-600" />
                              Most Used Materials (Tap for Details)
                            </h4>
                            <div className="space-y-4">
                              {services.sort((a,b) => ((b.opening_stock || b.stock) - b.stock) - ((a.opening_stock || a.stock) - a.stock)).slice(0, 5).map(item => {
                                const used = (item.opening_stock || item.stock) - item.stock;
                                const percentage = (item.opening_stock || item.stock) > 0 ? (used / (item.opening_stock || item.stock)) * 100 : 0;
                                return (
                                  <div key={item.id} onClick={() => setSelectedAnalyticsItem(item)} className="space-y-2 cursor-pointer group">
                                    <div className="flex justify-between text-sm">
                                      <span className="font-medium text-slate-700 group-hover:text-red-600 transition-colors">{item.name}</span>
                                      <span className="text-slate-500 font-bold">{used.toLocaleString()} {item.unit} used</span>
                                    </div>
                                    <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                                      <div className="h-full bg-red-600 rounded-full group-hover:bg-red-500 transition-colors" style={{ width: `${Math.min(100, percentage)}%` }} />
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>

                          <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm">
                            <h4 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
                              <AlertTriangle className="w-5 h-5 text-amber-500" />
                              Slow Moving Stock (Tap for Details)
                            </h4>
                            <div className="space-y-4">
                              {services.sort((a,b) => (((a.opening_stock || a.stock) - a.stock) / (a.opening_stock || a.stock || 1)) - (((b.opening_stock || b.stock) - b.stock) / (b.opening_stock || b.stock || 1))).slice(0, 5).map(item => {
                                const used = (item.opening_stock || item.stock) - item.stock;
                                const percentage = (item.opening_stock || item.stock) > 0 ? (used / (item.opening_stock || item.stock)) * 100 : 0;
                                return (
                                  <div key={item.id} onClick={() => setSelectedAnalyticsItem(item)} className="space-y-2 cursor-pointer group">
                                    <div className="flex justify-between text-sm">
                                      <span className="font-medium text-slate-700 group-hover:text-amber-600 transition-colors">{item.name}</span>
                                      <span className="text-slate-400">{percentage.toFixed(1)}% usage rate</span>
                                    </div>
                                    <div className="h-2 bg-slate-50 rounded-full overflow-hidden">
                                      <div className="h-full bg-slate-300 rounded-full group-hover:bg-amber-400 transition-colors" style={{ width: `${Math.min(100, percentage)}%` }} />
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        </div>

                        <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm">
                          <h4 className="text-lg font-bold text-slate-900 mb-6">Profitability by Category</h4>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {['Printing', 'Branding', 'Copying', 'General'].map(cat => {
                              const catServices = services.filter(i => i.category === cat);
                              const totalRev = catServices.reduce((sum, s) => {
                                const salesCount = orders
                                  .filter(o => {
                                    if (o.payment_status !== 'paid') return false;
                                    try {
                                      const d = o.created_at?.toDate ? o.created_at.toDate() : new Date(o.created_at);
                                      const start = new Date(filterDateRange.start);
                                      const end = new Date(new Date(filterDateRange.end).setHours(23, 59, 59, 999));
                                      return d >= start && d <= end;
                                    } catch {
                                      return true;
                                    }
                                  })
                                  .flatMap(o => o.items || [])
                                  .filter(oi => oi.service_id === s.id)
                                  .reduce((cnt, oi) => cnt + oi.quantity, 0);
                                return sum + (salesCount * s.price);
                              }, 0);
                              return (
                                <div key={cat} className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
                                  <p className="text-xs font-bold text-slate-400 uppercase mb-1">{cat}</p>
                                  <p className="text-2xl font-black text-slate-900">{formatCurrency(totalRev)}</p>
                                  <div className="mt-4 flex items-center gap-2 text-[10px] text-emerald-600 font-bold">
                                    <Plus className="w-3 h-3" /> Trending Up
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      </>
                    )
                  )}
                  {analyticsSubTab === 'staff' && (
                    /* STAFF PERFORMANCE ANALYSIS */
                    <div className="space-y-6">
                      <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-4">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                          <div>
                            <h4 className="text-lg font-bold text-slate-900">Search & Select Staff Member</h4>
                            <p className="text-xs text-slate-400 font-medium">Type a name or choose from the list below to analyze daily work status, pending vs paid tasks, expenses, and referral pipelines.</p>
                          </div>

                          {/* Inline Date Filter */}
                          <div className="flex flex-wrap items-center gap-2 bg-slate-50 p-2 rounded-2xl border border-slate-100">
                            <div className="flex items-center gap-1.5 px-3 py-1.5">
                              <Calendar className="w-4 h-4 text-slate-500" />
                              <span className="text-[10px] font-black uppercase text-slate-450 tracking-wider">Analysis Period:</span>
                            </div>
                            <input 
                              type="date" 
                              value={filterDateRange.start}
                              onChange={(e) => setFilterDateRange({...filterDateRange, start: e.target.value})}
                              className="bg-white px-3 py-1.5 text-xs font-bold border border-slate-100 rounded-xl outline-none focus:ring-2 focus:ring-rose-500 shrink-0"
                            />
                            <span className="text-xs font-extrabold text-slate-400">to</span>
                            <input 
                              type="date" 
                              value={filterDateRange.end}
                              onChange={(e) => setFilterDateRange({...filterDateRange, end: e.target.value})}
                              className="bg-white px-3 py-1.5 text-xs font-bold border border-slate-100 rounded-xl outline-none focus:ring-2 focus:ring-rose-500 shrink-0"
                            />
                          </div>
                        </div>

                        {/* Search Selector */}
                        <div className="relative">
                          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                          <input 
                            type="text" 
                            placeholder="Type staff name, role, or username..." 
                            className="w-full pl-10 pr-4 py-3 rounded-2xl border border-slate-100 bg-slate-50 outline-none focus:ring-2 focus:ring-red-500 font-medium transition-all text-sm"
                            value={staffSearchQuery}
                            onChange={(e) => setStaffSearchQuery(e.target.value)}
                          />
                        </div>

                        {/* Staff Grid/Scroll */}
                        <div className="flex flex-wrap gap-2 pt-2 max-h-40 overflow-y-auto">
                          {users
                            .filter(u => {
                              if (!staffSearchQuery) return true;
                              return u.full_name?.toLowerCase().includes(staffSearchQuery.toLowerCase()) || 
                                     u.role?.toLowerCase().includes(staffSearchQuery.toLowerCase()) ||
                                     u.username?.toLowerCase().includes(staffSearchQuery.toLowerCase());
                            })
                            .map(u => (
                              <button
                                key={u.id}
                                onClick={() => {
                                  setSelectedStaffUser(u);
                                  setStaffSearchQuery('');
                                }}
                                className={`flex items-center gap-2 px-4 py-2 rounded-2xl border transition-all text-left ${selectedStaffUser?.id === u.id ? 'bg-red-50 border-red-200 text-red-700 shadow-sm' : 'bg-slate-50 border-slate-100 text-slate-700 hover:bg-slate-100'}`}
                              >
                                <div className="w-6 h-6 rounded-full bg-slate-200 text-slate-600 font-bold text-[10px] flex items-center justify-center uppercase shrink-0">
                                  {u.full_name[0]}
                                </div>
                                <div>
                                  <p className="text-xs font-bold leading-tight">{u.full_name}</p>
                                  <p className="text-[9px] text-slate-400 font-black uppercase tracking-tighter">{u.role}</p>
                                </div>
                              </button>
                            ))}
                        </div>
                      </div>

                      {/* Display Performance dashboard if staff member is selected */}
                      {selectedStaffUser ? (() => {
                        const startTS = filterDateRange.start ? new Date(filterDateRange.start).getTime() : 0;
                        const endTS = filterDateRange.end ? new Date(new Date(filterDateRange.end).setHours(23, 59, 59, 999)).getTime() : Infinity;

                        // Filter jobs/orders
                        const staffJobs = orders.filter(o => {
                          const t = o.created_at?.toMillis?.() || o.created_at?.toDate?.()?.getTime() || 0;
                          if (t < startTS || t > endTS) return false;
                          
                          const u = selectedStaffUser;
                          return o.assigned_staff_id === u.id ||
                                 o.designer_id === u.id ||
                                 o.operator_id === u.id ||
                                 o.staff_id === u.id ||
                                 o.assigned_staff_username?.toLowerCase() === u.username.toLowerCase() ||
                                 o.assigned_staff_name?.toLowerCase() === u.full_name.toLowerCase() ||
                                 o.designer_name?.toLowerCase() === u.full_name.toLowerCase() ||
                                 o.operator_name?.toLowerCase() === u.full_name.toLowerCase() ||
                                 o.staff_name?.toLowerCase() === u.full_name.toLowerCase();
                        });

                        // Filter expenses
                        const staffExpenses = (finances.expenses || []).filter(e => {
                          const t = e.created_at?.toMillis?.() || e.created_at?.toDate?.()?.getTime() || 0;
                          if (t < startTS || t > endTS) return false;
                          
                          const u = selectedStaffUser;
                          return e.recorded_by === u.id || e.staff_id === u.id || e.staff_name?.toLowerCase() === u.full_name.toLowerCase() || 
                                 e.recorder_name?.toLowerCase() === u.full_name.toLowerCase() ||
                                 e.item.toLowerCase().includes(`filed by ${u.full_name.toLowerCase()}`) ||
                                 e.item.toLowerCase().includes(`by ${u.username.toLowerCase()}`);
                        });

                        // Filter referrals
                        const staffReferrals = orders.filter(o => {
                          const t = o.created_at?.toMillis?.() || o.created_at?.toDate?.()?.getTime() || 0;
                          if (t < startTS || t > endTS) return false;
                          
                          return o.referrer_id === selectedStaffUser.id;
                        });

                        // Computations
                        const jobsCount = staffJobs.length;
                        const finishedJobsCount = staffJobs.filter(o => o.status === 'completed' || o.status === 'paid').length;
                        const pendingJobsCount = staffJobs.filter(o => o.status !== 'completed' && o.status !== 'paid' && o.status !== 'cancelled').length;
                        const completionRate = jobsCount > 0 ? Math.round((finishedJobsCount / jobsCount) * 100) : 0;
                        const totalExpensesAmount = staffExpenses.filter(e => e.status !== 'rejected').reduce((sum, e) => sum + e.amount, 0);
                        const referralsCount = staffReferrals.length;
                        const totalCommissionPaid = staffReferrals.filter(o => o.status === 'paid' || o.payment_status === 'paid').reduce((sum, o) => sum + (o.commission_amount || 0), 0);
                        const totalCommissionPending = staffReferrals.filter(o => o.status !== 'paid' && o.payment_status !== 'paid').reduce((sum, o) => sum + (o.commission_amount || 0), 0);

                        return (
                          <div className="space-y-6">
                            {/* Profile Header */}
                            <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-950 text-white p-8 rounded-3xl border border-slate-800 shadow-xl">
                              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-6">
                                <div className="flex items-center gap-4">
                                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-rose-500 to-amber-500 text-white font-extrabold text-2xl flex items-center justify-center uppercase shadow-lg select-none">
                                    {selectedStaffUser.full_name[0]}
                                  </div>
                                  <div>
                                    <h4 className="text-2xl font-black tracking-tight">{selectedStaffUser.full_name}</h4>
                                    <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">
                                      @{selectedStaffUser.username} • <span className="bg-slate-700 text-slate-300 px-2.5 py-0.5 rounded-full text-[10px] font-black">{selectedStaffUser.role}</span>
                                    </p>
                                  </div>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                  <button 
                                    onClick={() => generateStaffPerformancePDF(selectedStaffUser, staffJobs, staffExpenses, staffReferrals)}
                                    className="text-xs font-black text-white bg-red-600 uppercase tracking-widest hover:bg-red-700 transition-all px-4 py-2 rounded-xl flex items-center gap-2 shadow-md cursor-pointer"
                                  >
                                    <FileText className="w-4 h-4" /> Download Report
                                  </button>
                                  <button 
                                    onClick={() => setSelectedStaffUser(null)} 
                                    className="text-xs font-black text-rose-400 uppercase tracking-widest hover:underline flex items-center gap-1 bg-slate-800 px-4 py-2 rounded-xl border border-slate-700 hover:bg-slate-700 transition-all shadow-inner"
                                  >
                                    ← Back to Staff Search
                                  </button>
                                </div>
                              </div>

                              {/* Performance Metrics */}
                              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t border-slate-800/60">
                                <div>
                                  <p className="text-[10px] uppercase font-black tracking-wider text-slate-400">Jobs Logged/Involved</p>
                                  <p className="text-3xl font-black mt-1 text-white">{jobsCount}</p>
                                  <p className="text-[10px] text-slate-405 mt-1 font-semibold">{finishedJobsCount} Finished • {pendingJobsCount} Pending</p>
                                </div>
                                <div>
                                  <p className="text-[10px] uppercase font-black tracking-wider text-slate-400">Completion rate</p>
                                  <p className="text-3xl font-black mt-1 text-emerald-400">{completionRate}%</p>
                                  <div className="w-full bg-slate-800 h-1.5 rounded-full mt-2 overflow-hidden">
                                    <div className="bg-emerald-500 h-full rounded-full transition-all duration-500" style={{ width: `${completionRate}%` }} />
                                  </div>
                                </div>
                                <div>
                                  <p className="text-[10px] uppercase font-black tracking-wider text-slate-400">Expenses in Name</p>
                                  <p className="text-3xl font-black mt-1 text-rose-400">{formatCurrency(totalExpensesAmount)}</p>
                                  <p className="text-[10px] text-slate-405 mt-1 font-semibold">{staffExpenses.length} File entries</p>
                                </div>
                                <div>
                                  <p className="text-[10px] uppercase font-black tracking-wider text-slate-400">Referrals Commission</p>
                                  <p className="text-3xl font-black mt-1 text-violet-400">{formatCurrency(totalCommissionPaid + totalCommissionPending)}</p>
                                  <p className="text-[10px] text-slate-405 mt-1 font-semibold">{referralsCount} Client referrals</p>
                                </div>
                              </div>
                            </div>

                            {/* Detailing tables */}
                            <div className="space-y-6">

                              {/* Jobs list */}
                              <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-4">
                                <div className="flex items-center justify-between border-b border-slate-55 pb-4">
                                  <h5 className="font-extrabold text-slate-800 text-sm uppercase tracking-wider flex items-center gap-2">
                                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                                    Jobs Done & Work Orders
                                  </h5>
                                  <span className="bg-slate-100 text-slate-705 text-[10px] font-black uppercase px-2 py-0.5 rounded-full">{staffJobs.length} Jobs</span>
                                </div>

                                <div className="overflow-x-auto text-slate-800">
                                  <table className="w-full text-left">
                                    <thead>
                                      <tr className="bg-slate-50 text-slate-400 text-[10px] font-black uppercase tracking-wider border-b border-slate-100">
                                        <th className="px-4 py-3">Order ID</th>
                                        <th className="px-5 py-3">Date</th>
                                        <th className="px-4 py-3">Customer</th>
                                        <th className="px-4 py-3">Service Details</th>
                                        <th className="px-4 py-3 text-center">Status</th>
                                        <th className="px-4 py-3 text-center">Payment Status</th>
                                        <th className="px-4 py-3 text-right">Job Value</th>
                                      </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                      {staffJobs.length === 0 ? (
                                        <tr>
                                          <td colSpan={7} className="px-4 py-8 text-center text-slate-404 italic text-sm">No tasks registered or assigned for {selectedStaffUser.full_name} in this period.</td>
                                        </tr>
                                      ) : (
                                        staffJobs.map(o => {
                                          const finished = o.status === 'completed' || o.status === 'paid';
                                          const paid = o.payment_status === 'paid';
                                          return (
                                            <tr key={o.id} className="hover:bg-slate-50 transition-colors text-xs text-slate-700">
                                              <td className="px-4 py-3 font-mono font-bold text-slate-900">#{o.id.substring(0, 6).toUpperCase()}</td>
                                              <td className="px-4 py-3 text-slate-600">{formatDate(o.created_at)}</td>
                                              <td className="px-4 py-3 font-bold text-slate-800">{o.customer_name}</td>
                                              <td className="px-4 py-3 text-slate-500 max-w-xs truncate">{o.items_summary || (o.items?.map(oi => oi.service_name).join(', ')) || 'No summary'}</td>
                                              <td className="px-4 py-3 text-center">
                                                <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold capitalize ${finished ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'}`}>
                                                  {finished ? 'Finished ✓' : o.status?.replace('_', ' ') || 'Pending'}
                                                </span>
                                              </td>
                                              <td className="px-4 py-3 text-center">
                                                <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase ${paid ? 'bg-emerald-50 text-emerald-700' : 'bg-orange-50 text-orange-700'}`}>
                                                  {o.payment_status || 'unpaid'}
                                                </span>
                                              </td>
                                              <td className="px-4 py-3 text-right font-black text-slate-900">{formatCurrency(o.total_amount, o.usd_rate)}</td>
                                            </tr>
                                          );
                                        })
                                      )}
                                    </tbody>
                                  </table>
                                </div>
                              </div>

                              {/* Expenses list */}
                              <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-4">
                                <div className="flex items-center justify-between border-b border-slate-50 pb-4">
                                  <h5 className="font-extrabold text-slate-800 text-sm uppercase tracking-wider flex items-center gap-2">
                                    <DollarSign className="w-4 h-4 text-rose-500" />
                                    Expenses done in employee name
                                  </h5>
                                  <span className="bg-rose-50 text-rose-750 text-[10px] font-black uppercase px-2 py-0.5 rounded-full">{formatCurrency(totalExpensesAmount)} Total</span>
                                </div>

                                <div className="overflow-x-auto text-slate-800">
                                  <table className="w-full text-left">
                                    <thead>
                                      <tr className="bg-slate-50 text-slate-400 text-[10px] font-black uppercase tracking-wider border-b border-slate-100">
                                        <th className="px-4 py-3">Date</th>
                                        <th className="px-4 py-3">Expense Item Title</th>
                                        <th className="px-4 py-3">Category</th>
                                        <th className="px-4 py-3 text-center">Status</th>
                                        <th className="px-4 py-3 text-right">Amount</th>
                                      </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                      {staffExpenses.length === 0 ? (
                                        <tr>
                                          <td colSpan={5} className="px-4 py-8 text-center text-slate-400 italic text-sm">No expenses filed under {selectedStaffUser.full_name}'s name in this period.</td>
                                        </tr>
                                      ) : (
                                        staffExpenses.map(exp => (
                                          <tr key={exp.id} className="hover:bg-slate-50 transition-colors text-xs text-slate-700">
                                            <td className="px-4 py-3 text-slate-600">{formatDate(exp.created_at)}</td>
                                            <td className="px-4 py-3 font-bold text-slate-800">{exp.item}</td>
                                            <td className="px-4 py-3 text-slate-500">{exp.category}</td>
                                            <td className="px-4 py-3 text-center">
                                              <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                                                exp.status === 'approved' ? 'bg-emerald-50 text-emerald-700' :
                                                exp.status === 'rejected' ? 'bg-rose-50 text-rose-700' : 'bg-amber-50 text-amber-500'
                                              }`}>
                                                {exp.status}
                                              </span>
                                            </td>
                                            <td className="px-4 py-3 text-right font-black text-rose-600">-{formatCurrency(exp.amount)}</td>
                                          </tr>
                                        ))
                                      )}
                                    </tbody>
                                  </table>
                                </div>
                              </div>

                              {/* Referrals list */}
                              <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-4">
                                <div className="flex items-center justify-between border-b border-slate-50 pb-4">
                                  <h5 className="font-extrabold text-slate-800 text-sm uppercase tracking-wider flex items-center gap-2">
                                    <Users className="w-4 h-4 text-violet-500" />
                                    Referral Pipeline List
                                  </h5>
                                  <span className="bg-violet-50 text-violet-750 text-[10px] font-black uppercase px-2 py-0.5 rounded-full">{staffReferrals.length} Referrals</span>
                                </div>

                                <div className="overflow-x-auto text-slate-800">
                                  <table className="w-full text-left">
                                    <thead>
                                      <tr className="bg-slate-50 text-slate-400 text-[10px] font-black uppercase tracking-wider border-b border-slate-100">
                                        <th className="px-4 py-3">Order ID</th>
                                        <th className="px-4 py-3">Date Referred</th>
                                        <th className="px-4 py-3">Referred Client</th>
                                        <th className="px-4 py-3 text-center">Work Status</th>
                                        <th className="px-4 py-3 text-center">Payment Status</th>
                                        <th className="px-4 py-3 text-right">Commission Due</th>
                                      </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                      {staffReferrals.length === 0 ? (
                                        <tr>
                                          <td colSpan={6} className="px-4 py-8 text-center text-slate-400 italic text-sm">No referred deals discovered for {selectedStaffUser.full_name} in this period.</td>
                                        </tr>
                                      ) : (
                                        staffReferrals.map(refOrd => {
                                          const isPaid = refOrd.payment_status === 'paid' || refOrd.status === 'paid';
                                          return (
                                            <tr key={refOrd.id} className="hover:bg-slate-50 transition-colors text-xs text-slate-700">
                                              <td className="px-4 py-3 font-mono font-bold text-slate-900">#{refOrd.id.substring(0, 6).toUpperCase()}</td>
                                              <td className="px-4 py-3 text-slate-600">{formatDate(refOrd.created_at)}</td>
                                              <td className="px-4 py-3 font-bold text-slate-800">{refOrd.customer_name}</td>
                                              <td className="px-4 py-3 text-center">
                                                <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase bg-slate-100 text-slate-650 animate-pulse">
                                                  {refOrd.status || 'pending'}
                                                </span>
                                              </td>
                                              <td className="px-4 py-3 text-center">
                                                <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${isPaid ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'}`}>
                                                  {isPaid ? 'Paid [Active]' : 'Unpaid [On Hold]'}
                                                </span>
                                              </td>
                                              <td className="px-4 py-3 text-right font-black text-emerald-600">
                                                {formatCurrency(refOrd.commission_amount || 0)}
                                              </td>
                                            </tr>
                                          );
                                        })
                                      )}
                                    </tbody>
                                  </table>
                                </div>
                              </div>

                            </div>
                          </div>
                        );
                      })() : (
                        <div className="bg-slate-50 border border-dashed border-slate-200 p-12 rounded-3xl text-center space-y-3">
                          <div className="w-12 h-12 bg-white border border-slate-100 rounded-2xl flex items-center justify-center text-slate-400 shadow-sm mx-auto">
                            <Users className="w-5 h-5 text-slate-400" />
                          </div>
                          <div>
                            <p className="font-bold text-slate-800 text-sm">No Employee Selected</p>
                            <p className="text-xs text-slate-400 max-w-sm mx-auto mt-1">Please select an employee name above to analyze their productivity dashboard, filed expenses, and deal referrals for the selected period.</p>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {analyticsSubTab === 'profits' && (
                    <div className="space-y-6">
                      <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
                        <h4 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2"><TrendingUp className="w-5 h-5 text-emerald-500"/> Profits Analysis</h4>
                        
                        {(() => {
                           let totalProfit = 0;
                           let itemProfits: Record<string, {name: string, sold: number, rev: number, cost: number, profit: number}> = {};
                           
                           const completedOrders = orders.filter(o => o.status === 'completed' || o.payment_status === 'paid' || o.status === 'paid');

                           completedOrders.forEach(o => {
                             const oItems = allOrderItems.filter(poi => poi.order_id === o.id) || [];
                             if (oItems.length === 0) {
                                totalProfit += (o.total_profit || 0);
                                return;
                             }
                             oItems.forEach((item: any) => {
                               const itemName = item.service_name || item.name || 'Unknown Item';
                               const svc = services.find(s => s.name === itemName);
                               const qty = item.quantity || 1;
                               const price = item.price || 0;
                               const rev = price * qty;
                               const cost = item.unit_cost !== undefined ? (item.unit_cost * qty) : ((svc?.unit_cost || 0) * qty);
                               const profit = rev - cost;
                               
                               totalProfit += profit;
                               
                               if (!itemProfits[itemName]) {
                                 itemProfits[itemName] = { name: itemName, sold: 0, rev: 0, cost: 0, profit: 0 };
                               }
                               itemProfits[itemName].sold += qty;
                               itemProfits[itemName].rev += rev;
                               itemProfits[itemName].cost += cost;
                               itemProfits[itemName].profit += profit;
                             });
                           });
                           
                           const filteredOrders = profitSearchTerm.trim() === '' ? completedOrders : completedOrders.filter(o => {
                             const c = customers.find(c => c.id === o.customer_id);
                             const term = profitSearchTerm.toLowerCase();
                             return o.id.toLowerCase().includes(term) || 
                                    o.job_order_id?.toLowerCase().includes(term) ||
                                    o.customer_name?.toLowerCase().includes(term) ||
                                    c?.phone?.toLowerCase().includes(term);
                           });

                           return (
                             <div className="space-y-8">
                               <div className="bg-emerald-50 p-6 rounded-2xl border border-emerald-100 flex flex-col justify-center items-center py-10">
                                 <p className="text-xs font-black text-emerald-800 uppercase tracking-widest mb-2">Total System Profits</p>
                                 <p className="text-4xl font-black text-emerald-600">{formatCurrency(totalProfit)}</p>
                                 <p className="text-[10px] font-bold text-emerald-500 uppercase mt-2">calculated over all paid and completed jobs</p>
                               </div>

                               <div>
                                  <div className="flex justify-between items-center mb-4">
                                    <h5 className="font-bold text-slate-800">Profit Breakdown</h5>
                                    <div className="flex items-center gap-2">
                                      <button 
                                        onClick={() => setProfitDetailsMode('items')} 
                                        className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors ${profitDetailsMode === 'items' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}
                                      >By Item</button>
                                      <button 
                                        onClick={() => setProfitDetailsMode('orders')} 
                                        className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors ${profitDetailsMode === 'orders' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}
                                      >By Order</button>
                                    </div>
                                  </div>

                                  {profitDetailsMode === 'items' ? (
                                    <div className="space-y-6">
                                      <div className="overflow-hidden rounded-2xl border border-slate-100 bg-slate-50">
                                        <table className="w-full text-left">
                                          <thead>
                                            <tr className="bg-slate-100 text-slate-500 text-xs font-bold uppercase tracking-wider">
                                              <th className="px-6 py-4">Item/Service</th>
                                              <th className="px-6 py-4 text-center">Qty Sold</th>
                                              <th className="px-6 py-4 text-right">Revenue</th>
                                              <th className="px-6 py-4 text-right">Cost</th>
                                              <th className="px-6 py-4 text-right">Profit</th>
                                            </tr>
                                          </thead>
                                          <tbody className="divide-y divide-slate-100">
                                            {Object.values(itemProfits).sort((a,b) => b.profit - a.profit).map((line, idx) => (
                                              <tr 
                                                key={idx} 
                                                className={`transition-colors cursor-pointer ${selectedProfitItemName === line.name ? 'bg-emerald-50' : 'bg-white hover:bg-slate-50'}`}
                                                onClick={() => setSelectedProfitItemName(selectedProfitItemName === line.name ? null : line.name)}
                                              >
                                                  <td className={`px-6 py-4 font-bold ${selectedProfitItemName === line.name ? 'text-emerald-900' : 'text-slate-900'}`}>{line.name}</td>
                                                  <td className="px-6 py-4 text-center font-bold text-slate-500">{line.sold}</td>
                                                  <td className="px-6 py-4 text-right font-bold text-slate-700">{formatCurrency(line.rev)}</td>
                                                  <td className="px-6 py-4 text-right font-bold text-rose-500">{formatCurrency(line.cost)}</td>
                                                  <td className={`px-6 py-4 text-right font-black ${selectedProfitItemName === line.name ? 'text-emerald-700' : 'text-emerald-600'}`}>{formatCurrency(line.profit)}</td>
                                              </tr>
                                            ))}
                                            {Object.values(itemProfits).length === 0 && (
                                              <tr><td colSpan={5} className="px-6 py-8 text-center text-slate-400 italic">No profits recorded yet.</td></tr>
                                            )}
                                          </tbody>
                                        </table>
                                      </div>
                                      
                                      {selectedProfitItemName && (() => {
                                        const relatedOrders = completedOrders.filter(o => 
                                          allOrderItems.some(poi => poi.order_id === o.id && (poi.service_name === selectedProfitItemName || poi.name === selectedProfitItemName))
                                        );
                                        return (
                                          <div className="bg-slate-50 rounded-2xl border border-slate-200 p-6 shadow-inner">
                                            <div className="flex justify-between items-center mb-4">
                                              <h5 className="font-bold text-slate-800">Cost Breakdown: {selectedProfitItemName}</h5>
                                              <button onClick={() => setSelectedProfitItemName(null)} className="text-xs font-bold text-slate-500 hover:text-slate-800 transition-colors">Close</button>
                                            </div>
                                            <div className="overflow-x-auto border border-slate-100 rounded-xl bg-white">
                                              <table className="w-full text-left text-sm">
                                                <thead className="bg-slate-100 text-slate-500 text-[10px] font-black uppercase tracking-wider">
                                                  <tr>
                                                    <th className="px-4 py-3">Order ID</th>
                                                    <th className="px-4 py-3">Client</th>
                                                    <th className="px-4 py-3 text-center">Qty</th>
                                                    <th className="px-4 py-3 text-right">Sale Price</th>
                                                    <th className="px-4 py-3 text-right">Unit Cost</th>
                                                    <th className="px-4 py-3 text-right">Item Profit</th>
                                                  </tr>
                                                </thead>
                                                <tbody className="divide-y divide-slate-100">
                                                  {relatedOrders.map((o, idx) => {
                                                    const oItems = allOrderItems.filter(poi => poi.order_id === o.id && (poi.service_name === selectedProfitItemName || poi.name === selectedProfitItemName));
                                                    return oItems.map((item, iIdx) => {
                                                      const svc = services.find(s => s.name === item.service_name || s.name === item.name);
                                                      const qty = item.quantity || 1;
                                                      const price = item.price || 0;
                                                      const cost = item.unit_cost !== undefined ? item.unit_cost : (svc?.unit_cost || 0);
                                                      const itemProfit = (price * qty) - (cost * qty);
                                                      return (
                                                        <tr key={`${idx}-${iIdx}`} className="hover:bg-slate-50">
                                                          <td className="px-4 py-3 font-mono font-bold text-slate-700 text-xs">#{o.id.substring(0, 6).toUpperCase()}</td>
                                                          <td className="px-4 py-3 text-xs">{o.customer_name}</td>
                                                          <td className="px-4 py-3 text-center font-bold text-slate-600">{qty}</td>
                                                          <td className="px-4 py-3 text-right font-bold text-slate-700">{formatCurrency(price)}</td>
                                                          <td className="px-4 py-3 text-right font-bold text-rose-500">{formatCurrency(cost)}</td>
                                                          <td className="px-4 py-3 text-right font-black text-emerald-600">{formatCurrency(itemProfit)}</td>
                                                        </tr>
                                                      );
                                                    });
                                                  })}
                                                </tbody>
                                              </table>
                                            </div>
                                          </div>
                                        );
                                      })()}
                                    </div>
                                  ) : (
                                    <div className="space-y-4">
                                      <div className="relative">
                                        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                        <input 
                                          type="text" 
                                          placeholder="Search completed orders by ID, Client Name, or Contact..." 
                                          className="w-full bg-slate-50 border border-slate-200 outline-none rounded-xl px-10 py-2.5 text-sm font-medium focus:ring-2 focus:ring-emerald-500 text-slate-700"
                                          value={profitSearchTerm}
                                          onChange={(e) => setProfitSearchTerm(e.target.value)}
                                        />
                                      </div>
                                      <div className="overflow-hidden rounded-2xl border border-slate-100 bg-slate-50 max-h-96 overflow-y-auto">
                                        <table className="w-full text-left">
                                          <thead className="sticky top-0 bg-slate-100 z-10">
                                            <tr className="text-slate-500 text-xs font-bold uppercase tracking-wider shadow-sm">
                                              <th className="px-6 py-3">Order ID</th>
                                              <th className="px-6 py-3">Client</th>
                                              <th className="px-6 py-3">Summary</th>
                                              <th className="px-6 py-3 text-right">Profit</th>
                                            </tr>
                                          </thead>
                                          <tbody className="divide-y divide-slate-100">
                                            {filteredOrders.sort((a,b) => (b.updated_at?.toMillis?.() || 0) - (a.updated_at?.toMillis?.() || 0)).map((o, idx) => {
                                              const oItems = allOrderItems.filter(poi => poi.order_id === o.id) || [];
                                              let oProfit = o.total_profit || 0;
                                              if (oItems.length > 0) {
                                                oProfit = oItems.reduce((acc, item) => {
                                                  const svc = services.find(s => s.name === item.service_name || s.name === item.name);
                                                  const qty = item.quantity || 1;
                                                  const price = item.price || 0;
                                                  const cost = item.unit_cost !== undefined ? (item.unit_cost * qty) : ((svc?.unit_cost || 0) * qty);
                                                  return acc + ((price * qty) - cost);
                                                }, 0);
                                              }
                                              const contact = customers.find(c => c.id === o.customer_id)?.phone || 'N/A';
                                              return (
                                                <tr key={idx} className="bg-white hover:bg-slate-50 transition-colors">
                                                  <td className="px-6 py-3 font-mono font-bold text-slate-800 text-xs">#{o.id.substring(0, 6).toUpperCase()}</td>
                                                  <td className="px-6 py-3">
                                                    <p className="font-bold text-slate-900 text-xs">{o.customer_name}</p>
                                                    <p className="text-[10px] font-semibold text-slate-400">{contact}</p>
                                                  </td>
                                                  <td className="px-6 py-3 text-xs text-slate-500 truncate max-w-[200px]">{o.items_summary || (oItems.map((i:any)=>i.name || i.service_name).join(', '))}</td>
                                                  <td className="px-6 py-3 text-right font-black text-emerald-600 text-xs">{formatCurrency(oProfit)}</td>
                                                </tr>
                                              );
                                            })}
                                            {filteredOrders.length === 0 && (
                                              <tr><td colSpan={4} className="px-6 py-8 text-center text-slate-400 italic text-sm">No orders found.</td></tr>
                                            )}
                                          </tbody>
                                        </table>
                                      </div>
                                    </div>
                                  )}
                               </div>
                             </div>
                           );
                        })()}
                      </div>
                    </div>
                  )}

                  {analyticsSubTab === 'expenses' && (
                    <div className="space-y-6">
                      <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
                        <h4 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2"><DollarSign className="w-5 h-5 text-rose-500"/> Expense Categories Analysis</h4>
                        
                        {(() => {
                          const startTS = filterDateRange.start ? new Date(filterDateRange.start).getTime() : 0;
                          const endTS = filterDateRange.end ? new Date(new Date(filterDateRange.end).setHours(23, 59, 59, 999)).getTime() : Infinity;

                          const filteredExpList = finances.expenses.filter(e => {
                            const t = e.created_at?.toMillis?.() || e.created_at?.toDate?.()?.getTime() || 0;
                            return e.status === 'approved' && t >= startTS && t <= endTS;
                          });

                          const catTotals: Record<string, number> = {};
                          filteredExpList.forEach(e => {
                            if (!catTotals[e.category]) catTotals[e.category] = 0;
                            catTotals[e.category] += e.amount;
                          });

                          return (
                            <div className="space-y-6">
                              <div className="flex flex-col sm:flex-row justify-between items-center bg-slate-50 p-4 rounded-2xl border border-slate-100 gap-4">
                                <p className="text-sm font-bold text-slate-700">Filter expenses by category:</p>
                                <select 
                                  value={selectedExpenseCategory || ''}
                                  onChange={(e) => setSelectedExpenseCategory(e.target.value || null)}
                                  className="bg-white border border-slate-200 text-slate-700 text-sm font-bold rounded-xl px-4 py-2 outline-none focus:ring-2 focus:ring-rose-500"
                                >
                                  <option value="">All Categories</option>
                                  {Array.from(new Set([...finances.expenses.map(e => e.category).filter(Boolean), 'Materials', 'Utilities', 'Rent', 'Salary', 'Allowance', 'Fuel', 'Transport', 'Maintenance', 'Other'])).sort().map(cat => (
                                    <option key={cat} value={cat}>{cat}</option>
                                  ))}
                                </select>
                              </div>
                              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                {Object.entries(catTotals).sort((a,b) => b[1] - a[1]).map(([cat, amount], idx) => (
                                  <div 
                                    key={idx} 
                                    onClick={() => setSelectedExpenseCategory(selectedExpenseCategory === cat ? null : cat)}
                                    className={`p-6 rounded-2xl border cursor-pointer transition-all ${selectedExpenseCategory === cat ? 'bg-rose-100 border-rose-300 shadow-md transform scale-105' : 'bg-rose-50 border-rose-100 hover:bg-rose-100'}`}
                                  >
                                    <p className="text-[10px] font-black text-rose-800 uppercase tracking-widest mb-1">{cat}</p>
                                    <p className={`text-2xl font-black ${selectedExpenseCategory === cat ? 'text-rose-700' : 'text-rose-600'}`}>{formatCurrency(amount)}</p>
                                  </div>
                                ))}
                                {Object.keys(catTotals).length === 0 && (
                                  <div className="col-span-full py-10 text-center text-slate-400 italic font-medium">No approved expenses recorded yet for this period.</div>
                                )}
                              </div>
                              
                              {selectedExpenseCategory && (
                                <div className="mt-8">
                                  <div className="flex justify-between items-center mb-4">
                                    <h5 className="font-bold text-slate-800">Breakdown for {selectedExpenseCategory}</h5>
                                    <button onClick={() => setSelectedExpenseCategory(null)} className="text-xs font-bold text-slate-500 hover:text-slate-800 transition-colors">Close</button>
                                  </div>
                                  <div className="overflow-hidden rounded-2xl border border-slate-100 bg-slate-50 max-h-96 overflow-y-auto">
                                    <table className="w-full text-left">
                                      <thead className="sticky top-0 bg-slate-100 z-10">
                                        <tr className="text-slate-500 text-xs font-bold uppercase tracking-wider shadow-sm">
                                          <th className="px-6 py-3">Date</th>
                                          <th className="px-6 py-3">Item / Description</th>
                                          <th className="px-6 py-3">Staff / Details</th>
                                          <th className="px-6 py-3">Registered By</th>
                                          <th className="px-6 py-3">Approved By</th>
                                          <th className="px-6 py-3 text-right">Amount</th>
                                        </tr>
                                      </thead>
                                      <tbody className="divide-y divide-slate-100">
                                        {filteredExpList
                                          .filter(e => e.category === selectedExpenseCategory)
                                          .sort((a,b) => (b.created_at?.toMillis?.() || 0) - (a.created_at?.toMillis?.() || 0))
                                          .map((exp, idx) => (
                                          <tr key={idx} className="bg-white hover:bg-slate-50 transition-colors">
                                            <td className="px-6 py-3 text-xs text-slate-500">{formatDate(exp.created_at)}</td>
                                            <td className="px-6 py-3 text-xs font-bold text-slate-800">{exp.item}</td>
                                            <td className="px-6 py-3 text-xs text-slate-500">
                                              {exp.staff_name ? `Staff: ${exp.staff_name}` : ''}
                                              {exp.transport_from && exp.transport_to ? (exp.staff_name ? <br/> : '') + `Route: ${exp.transport_from} → ${exp.transport_to}` : ''}
                                            </td>
                                            <td className="px-6 py-3 text-xs text-slate-500">{exp.recorder_name || '-'}</td>
                                            <td className="px-6 py-3 text-xs text-slate-500">{exp.approver_name || '-'}</td>
                                            <td className="px-6 py-3 text-xs font-black text-rose-600 text-right">{formatCurrency(exp.amount)}</td>
                                          </tr>
                                        ))}
                                      </tbody>
                                    </table>
                                  </div>
                                </div>
                              )}
                            </div>
                          );
                        })()}
                      </div>
                    </div>
                  )}

                </div>
              )}

              {activeTab === 'debts' && (
                <div className="space-y-6">
                  <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                      <div>
                        <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tight">Debt Tracker</h3>
                        <p className="text-slate-500">Unpaid and partially paid confirmed orders.</p>
                      </div>
                      <div className="flex flex-wrap items-center gap-4">
                        <div className="relative">
                          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                          <input 
                            type="text" 
                            placeholder="Search debtor..." 
                            className="pl-9 pr-4 py-2 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-red-500 w-48 text-xs font-bold"
                            value={customerSearch}
                            onChange={(e) => setCustomerSearch(e.target.value)}
                          />
                        </div>
                        <div className="flex items-center gap-2 bg-slate-50 p-2 rounded-2xl border border-slate-100">
                          <div className="flex items-center gap-2 px-3 border-r border-slate-200">
                            <span className="text-[10px] font-black text-slate-400">FROM</span>
                            <input 
                              type="date" 
                              className="bg-transparent border-none outline-none text-xs font-bold"
                              value={debtStartDate}
                              onChange={(e) => setDebtStartDate(e.target.value)}
                            />
                          </div>
                          <div className="flex items-center gap-2 px-3">
                            <span className="text-[10px] font-black text-slate-400">TO</span>
                            <input 
                              type="date" 
                              className="bg-transparent border-none outline-none text-xs font-bold"
                              value={debtEndDate}
                              onChange={(e) => setDebtEndDate(e.target.value)}
                            />
                          </div>
                        </div>
                        <div className="bg-slate-50 px-6 py-3 rounded-2xl border border-slate-100">
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Outstanding Balance</p>
                          <p className="text-xl font-black text-rose-600">
                            {formatCurrency(orders
                              .filter(o => {
                                if (o.payment_status === 'paid') return false;
                                const orderDate = new Date(o.created_at);
                                if (debtStartDate && orderDate < new Date(debtStartDate)) return false;
                                if (debtEndDate && orderDate > new Date(debtEndDate)) return false;
                                return true;
                              })
                              .reduce((sum, o) => {
                                const total = (o.total_amount || 0) * (1 - (o.discount || 0) / 100);
                                return sum + (total - (o.paid_amount || 0));
                              }, 0)
                            )}
                          </p>
                        </div>
                        <button 
                          onClick={() => generateDebtorsPDF()}
                          className="bg-slate-900 text-white px-6 py-3 rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-slate-800 transition-all flex items-center gap-2"
                        >
                          <FileText className="w-4 h-4" /> Export Report
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden font-sans">
                    {(() => {
                      const debtOrders = orders.filter(o => {
                        if (o.payment_status === 'paid') return false;
                        if (customerSearch && !o.customer_name?.toLowerCase().includes(customerSearch.toLowerCase())) return false;
                        const orderDate = new Date(o.created_at);
                        if (debtStartDate && orderDate < new Date(debtStartDate)) return false;
                        if (debtEndDate && orderDate > new Date(debtEndDate)) return false;
                        return true;
                      });

                      let partiallyPaid = 0;
                      let totalUnpaid = 0;
                      let designerUnpaid = 0;
                      let productionUnpaid = 0;
                      let doneUnpaid = 0;

                      debtOrders.forEach(o => {
                        const total = (o.total_amount || 0) * (1 - (o.discount || 0) / 100);
                        const balance = total - (o.paid_amount || 0);

                        if ((o.paid_amount || 0) > 0) {
                          partiallyPaid += balance;
                        } else {
                          totalUnpaid += balance;
                        }

                        const st = o.status || '';
                        if (st === 'at_designer' || st === 'pending' || st === 'pending_client_approval') designerUnpaid += balance;
                        else if (st === 'production') productionUnpaid += balance;
                        else if (['completed', 'ready_for_payment', 'done_awaiting_invoice'].includes(st)) doneUnpaid += balance;
                      });

                      return (
                        <div className="p-6">
                          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
                            <div 
                              onClick={() => setDebtFilter(debtFilter === 'partial' ? 'all' : 'partial')}
                              className={`p-5 rounded-2xl border shadow-sm border-t-4 border-t-amber-400 cursor-pointer transition-all ${debtFilter === 'partial' ? 'bg-amber-50 border-amber-200 transform scale-105' : 'bg-slate-50 border-slate-100 hover:bg-slate-100'}`}
                            >
                              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Partially Paid</p>
                              <p className="text-xl font-black text-amber-600">{formatCurrency(partiallyPaid)}</p>
                            </div>
                            <div 
                              onClick={() => setDebtFilter(debtFilter === 'unpaid' ? 'all' : 'unpaid')}
                              className={`p-5 rounded-2xl border shadow-sm border-t-4 border-t-rose-500 cursor-pointer transition-all ${debtFilter === 'unpaid' ? 'bg-rose-50 border-rose-200 transform scale-105' : 'bg-slate-50 border-slate-100 hover:bg-slate-100'}`}
                            >
                              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Total Unpaid</p>
                              <p className="text-xl font-black text-rose-600">{formatCurrency(totalUnpaid)}</p>
                            </div>
                            <div 
                              onClick={() => setDebtFilter(debtFilter === 'designer' ? 'all' : 'designer')}
                              className={`p-5 rounded-2xl border shadow-sm border-t-4 border-t-slate-800 cursor-pointer transition-all ${debtFilter === 'designer' ? 'bg-slate-200 border-slate-300 transform scale-105' : 'bg-slate-50 border-slate-100 hover:bg-slate-100'}`}
                            >
                              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Unpaid (Designer)</p>
                              <p className="text-lg font-bold text-slate-700">{formatCurrency(designerUnpaid)}</p>
                            </div>
                            <div 
                              onClick={() => setDebtFilter(debtFilter === 'production' ? 'all' : 'production')}
                              className={`p-5 rounded-2xl border shadow-sm border-t-4 border-t-indigo-500 cursor-pointer transition-all ${debtFilter === 'production' ? 'bg-indigo-50 border-indigo-200 transform scale-105' : 'bg-slate-50 border-slate-100 hover:bg-slate-100'}`}
                            >
                              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Unpaid (Production)</p>
                              <p className="text-lg font-bold text-slate-700">{formatCurrency(productionUnpaid)}</p>
                            </div>
                            <div 
                              onClick={() => setDebtFilter(debtFilter === 'done' ? 'all' : 'done')}
                              className={`p-5 rounded-2xl border shadow-sm border-t-4 border-t-emerald-500 cursor-pointer transition-all ${debtFilter === 'done' ? 'bg-emerald-100 border-emerald-300 transform scale-105' : 'bg-emerald-50/20 border-emerald-100 hover:bg-emerald-50'}`}
                            >
                              <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest mb-1">Unpaid (Done)</p>
                              <p className="text-lg font-bold text-emerald-700">{formatCurrency(doneUnpaid)}</p>
                            </div>
                          </div>

                          <div className="overflow-x-auto border border-slate-100 rounded-2xl">
                            <table className="w-full text-left">
                              <thead>
                                <tr className="bg-slate-50 text-slate-400 text-[10px] font-black uppercase tracking-widest">
                                  <th className="px-8 py-4">Order ID</th>
                                  <th className="px-8 py-4">Customer</th>
                                  <th className="px-8 py-4">Items / Summary</th>
                                  <th className="px-8 py-4">Total Amount</th>
                                  <th className="px-8 py-4">Paid Amount</th>
                                  <th className="px-8 py-4">Balance Due</th>
                                  <th className="px-8 py-4">Status</th>
                                  <th className="px-8 py-4 text-right">Actions</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-slate-100">
                                {debtOrders.filter(o => {
                                  if (debtFilter === 'all') return true;
                                  const total = (o.total_amount || 0) * (1 - (o.discount || 0) / 100);
                                  const balance = total - (o.paid_amount || 0);
                                  if (debtFilter === 'partial') return (o.paid_amount || 0) > 0;
                                  if (debtFilter === 'unpaid') return (o.paid_amount || 0) === 0;
                                  const st = o.status || '';
                                  if (debtFilter === 'designer') return st === 'at_designer' || st === 'pending' || st === 'pending_client_approval';
                                  if (debtFilter === 'production') return st === 'production';
                                  if (debtFilter === 'done') return ['completed', 'ready_for_payment', 'done_awaiting_invoice'].includes(st);
                                  return true;
                                }).map(order => {
                                  const total = (order.total_amount || 0) * (1 - (order.discount || 0) / 100);
                                  const balance = total - (order.paid_amount || 0);
                                  return (
                                    <tr 
                                      key={order.id} 
                                      className="hover:bg-slate-50 transition-colors cursor-pointer group"
                                      onClick={() => handleOpenOrderDetail(order)}
                                    >
                                      <td className="px-8 py-4 font-black text-slate-900">{order.job_order_id || '#' + String(order.id).substring(0, 8).toUpperCase()}</td>
                                      <td className="px-8 py-4">
                                        <span className="font-bold text-slate-900 block">{order.customer_name}</span>
                                        <div className="flex flex-col gap-0.5 text-[10px]">
                                          <span className="text-slate-500 font-medium">📞 {customers.find(c => c.id === order.customer_id)?.phone || 'No phone'}</span>
                                          <span className="text-slate-400">{formatDate(order.created_at)}</span>
                                        </div>
                                      </td>
                                      <td className="px-8 py-4">
                                        <span className="text-xs text-slate-500 max-w-[200px] truncate block">{order.items_summary || 'Multiple items'}</span>
                                      </td>
                                      <td className="px-8 py-4 text-sm font-bold text-slate-600">{formatCurrency(total)}</td>
                                      <td className="px-8 py-4 text-sm font-bold text-emerald-600">{formatCurrency(order.paid_amount || 0)}</td>
                                      <td className="px-8 py-4 text-sm font-black text-rose-600">{formatCurrency(balance)}</td>
                                      <td className="px-8 py-4">
                                        <div className="flex flex-col gap-1 items-start">
                                          <Badge status={order.payment_status || 'unpaid'} />
                                          <Badge status={order.status || 'pending'} />
                                        </div>
                                      </td>
                                      <td className="px-8 py-4 text-right flex flex-col justify-end items-end gap-2">
                                        <button 
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            handleOpenOrderDetail(order);
                                          }}
                                          className="bg-red-600 text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-red-700 transition-all shadow-lg shadow-red-100"
                                        >
                                          Pay Installment
                                        </button>
                                      </td>
                                    </tr>
                                  );
                                })}
                                {debtOrders.length === 0 && (
                                  <tr>
                                    <td colSpan={8} className="px-8 py-20 text-center">
                                      <p className="text-slate-400 italic">No outstanding debts recorded.</p>
                                    </td>
                                  </tr>
                                )}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      );
                    })()}
                  </div>
                </div>
              )}

              {activeTab === 'purchase_ledger' && (
                <div className="space-y-6">
                  {/* Ledger Banner / Title */}
                  <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                      <div>
                        <div className="flex items-center gap-2 text-indigo-600 font-extrabold uppercase tracking-wider text-xs mb-1">
                          <BookOpen className="w-4 h-4 animate-pulse" />
                          Ledger Administration
                        </div>
                        <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tight">Purchase Ledger</h3>
                        <p className="text-slate-500 text-xs mt-1 font-medium">Record and analyze raw materials, supplies, and asset acquisitions in USD.</p>
                      </div>
                      
                      {/* Key Summary Stats Widget Cards */}
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 flex-1 max-w-xl">
                        <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                          <span className="block text-[9px] font-black uppercase tracking-widest text-slate-400">Total Spent</span>
                          <span className="text-lg font-black text-slate-800 block mt-1 font-mono">
                            ${(() => {
                              const total = purchases
                                .filter(p => {
                                  const matchSearch = !purchaseSearch.trim() || 
                                    (p.item || '').toLowerCase().includes(purchaseSearch.toLowerCase()) || 
                                    (p.country || '').toLowerCase().includes(purchaseSearch.toLowerCase());
                                  const matchStartDate = !purchaseStartDate || p.date >= purchaseStartDate;
                                  const matchEndDate = !purchaseEndDate || p.date <= purchaseEndDate;
                                  return matchSearch && matchStartDate && matchEndDate;
                                })
                                .reduce((acc, curr) => acc + ((curr.unit_price || 0) * (curr.quantity || 0)), 0);
                              return total.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
                            })()}
                          </span>
                        </div>
                        <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                          <span className="block text-[9px] font-black uppercase tracking-widest text-slate-400">Total Quantity</span>
                          <span className="text-lg font-black text-slate-800 block mt-1 font-mono">
                            {purchases
                              .filter(p => {
                                const matchSearch = !purchaseSearch.trim() || 
                                  (p.item || '').toLowerCase().includes(purchaseSearch.toLowerCase()) || 
                                  (p.country || '').toLowerCase().includes(purchaseSearch.toLowerCase());
                                const matchStartDate = !purchaseStartDate || p.date >= purchaseStartDate;
                                  const matchEndDate = !purchaseEndDate || p.date <= purchaseEndDate;
                                return matchSearch && matchStartDate && matchEndDate;
                              })
                              .reduce((acc, curr) => acc + (curr.quantity || 0), 0).toLocaleString()}
                          </span>
                        </div>
                        <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 col-span-2 md:col-span-1">
                          <span className="block text-[9px] font-black uppercase tracking-widest text-slate-400">Countries</span>
                          <span className="text-lg font-black text-indigo-600 block mt-1 font-sans">
                            {new Set(purchases
                              .filter(p => {
                                const matchSearch = !purchaseSearch.trim() || 
                                  (p.item || '').toLowerCase().includes(purchaseSearch.toLowerCase()) || 
                                  (p.country || '').toLowerCase().includes(purchaseSearch.toLowerCase());
                                const matchStartDate = !purchaseStartDate || p.date >= purchaseStartDate;
                                  const matchEndDate = !purchaseEndDate || p.date <= purchaseEndDate;
                                return matchSearch && matchStartDate && matchEndDate;
                              })
                              .map(p => p.country?.trim()?.toUpperCase()).filter(Boolean)).size} Distinct
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="grid lg:grid-cols-3 gap-6 items-start">
                    {/* Record New Purchase Form (1 Col) */}
                    <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-4">
                      <div>
                        <h4 className="text-md font-bold text-slate-900 uppercase tracking-tight">Log New Purchase</h4>
                        <p className="text-[11px] text-slate-500 font-medium">Add a raw item or equipment purchase to the durable cloud ledger.</p>
                      </div>

                      <form onSubmit={handleCreatePurchase} className="space-y-4">
                        <div>
                          <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Item / Supply Name</label>
                          <input 
                            type="text" 
                            required
                            placeholder="e.g. Glossy Paper rolls (A4), Red ink"
                            value={newPurchase.item}
                            onChange={(e) => setNewPurchase(prev => ({ ...prev, item: e.target.value }))}
                            className="w-full px-3.5 py-2.5 text-xs font-semibold rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                          />
                        </div>

                        <div>
                          <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Country of Purchase (Origin)</label>
                          <input 
                            type="text" 
                            required
                            placeholder="e.g. Uganda, Kenya, China"
                            value={newPurchase.country}
                            onChange={(e) => setNewPurchase(prev => ({ ...prev, country: e.target.value }))}
                            className="w-full px-3.5 py-2.5 text-xs font-semibold rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Unit Price (USD)</label>
                            <input 
                              type="number" 
                              step="0.01"
                              required
                              placeholder="0.00"
                              value={newPurchase.unitPrice}
                              onChange={(e) => setNewPurchase(prev => ({ ...prev, unitPrice: e.target.value }))}
                              className="w-full px-3.5 py-2.5 text-xs font-semibold rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                            />
                          </div>
                          <div>
                            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Quantity</label>
                            <input 
                              type="number" 
                              required
                              placeholder="1"
                              value={newPurchase.quantity}
                              onChange={(e) => setNewPurchase(prev => ({ ...prev, quantity: e.target.value }))}
                              className="w-full px-3.5 py-2.5 text-xs font-semibold rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                            />
                          </div>
                        </div>

                        <div className="bg-slate-50 border border-dashed border-slate-200 p-3 rounded-xl">
                          <div className="flex justify-between text-xs font-bold text-slate-600">
                            <span>Auto-Date:</span>
                            <span>{new Date().toLocaleDateString()}</span>
                          </div>
                          <div className="flex justify-between text-xs font-black text-indigo-600 mt-2 pt-2 border-t border-slate-100">
                            <span>Estimated Total:</span>
                            <span>
                              ${(() => {
                                const up = parseFloat(newPurchase.unitPrice) || 0;
                                const qty = parseInt(newPurchase.quantity, 10) || 0;
                                return (up * qty).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
                              })()}
                            </span>
                          </div>
                        </div>

                        <button 
                          type="submit"
                          disabled={loading}
                          className="w-full py-3 bg-indigo-600 text-white font-extrabold rounded-xl text-xs uppercase tracking-wider hover:bg-indigo-700 transition-all shadow-md shadow-indigo-100 disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                          <PlusCircle className="w-4 h-4" /> Record Purchase Ledger
                        </button>
                      </form>
                    </div>

                    {/* Ledger History List & Searching (2 Cols) */}
                    <div className="lg:col-span-2 space-y-4">
                      {/* Interactive Search Bar & Filters */}
                      <div className="bg-white p-4 rounded-3xl border border-slate-100 shadow-sm flex flex-col md:flex-row items-center gap-4">
                        <div className="relative flex-1 w-full">
                          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                          <input 
                            type="text" 
                            placeholder="Search by item name or country of origin..." 
                            className="w-full pl-9 pr-4 py-2.5 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-550 text-xs font-bold bg-slate-50/20"
                            value={purchaseSearch}
                            onChange={(e) => setPurchaseSearch(e.target.value)}
                          />
                        </div>

                        <div className="flex items-center gap-2 bg-slate-50 p-2 rounded-2xl border border-slate-100 flex-shrink-0">
                          <div className="flex items-center gap-2 px-3 border-r border-slate-200">
                            <span className="text-[9px] font-black text-slate-400">FROM</span>
                            <input 
                              type="date" 
                              value={purchaseStartDate}
                              onChange={(e) => setPurchaseStartDate(e.target.value)}
                              className="bg-transparent border-none text-xs font-bold outline-none text-slate-700"
                            />
                          </div>
                          <div className="flex items-center gap-2 px-3">
                            <span className="text-[9px] font-black text-slate-400">TO</span>
                            <input 
                              type="date" 
                              value={purchaseEndDate}
                              onChange={(e) => setPurchaseEndDate(e.target.value)}
                              className="bg-transparent border-none text-xs font-bold outline-none text-slate-700"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Ledger History Table */}
                      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
                        <div className="overflow-x-auto">
                          <table className="w-full text-left border-collapse font-sans text-xs">
                            <thead>
                              <tr className="bg-slate-50 border-b border-slate-100 text-slate-400 text-[10px] font-black uppercase tracking-widest">
                                <th className="px-6 py-4">Purchase Date</th>
                                <th className="px-6 py-4">Item Name</th>
                                <th className="px-6 py-4">Country</th>
                                <th className="px-6 py-4 text-right">Unit Price (USD)</th>
                                <th className="px-6 py-4 text-center">Qty</th>
                                <th className="px-6 py-4 text-right">Total Cost (USD)</th>
                                <th className="px-6 py-4">Recorded By</th>
                                <th className="px-6 py-4 text-right">Action</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                              {(() => {
                                const list = purchases.filter(p => {
                                  const matchSearch = !purchaseSearch.trim() || 
                                    (p.item || '').toLowerCase().includes(purchaseSearch.toLowerCase()) || 
                                    (p.country || '').toLowerCase().includes(purchaseSearch.toLowerCase());
                                  const matchStartDate = !purchaseStartDate || p.date >= purchaseStartDate;
                                  const matchEndDate = !purchaseEndDate || p.date <= purchaseEndDate;
                                  return matchSearch && matchStartDate && matchEndDate;
                                });
                                if (list.length === 0) {
                                  return (
                                    <tr>
                                      <td colSpan={8} className="px-6 py-16 text-center italic text-slate-400">
                                        No purchase ledger transactions match the search filters.
                                      </td>
                                    </tr>
                                  );
                                }

                                return list.map(p => {
                                  const totalCost = (p.unit_price || 0) * (p.quantity || 0);
                                  return (
                                    <tr key={p.id} className="hover:bg-slate-50 transition-colors">
                                      <td className="px-6 py-4 font-bold text-slate-600">
                                        {p.date ? new Date(p.date).toLocaleDateString() : 'N/A'}
                                      </td>
                                      <td className="px-6 py-4 font-black text-slate-800">
                                        {p.item}
                                      </td>
                                      <td className="px-6 py-4">
                                        <span className="bg-indigo-50 px-2.5 py-1 rounded-full text-[10px] font-bold text-indigo-600 uppercase tracking-wider">
                                          {p.country}
                                        </span>
                                      </td>
                                      <td className="px-6 py-4 text-right font-mono font-bold text-slate-700">
                                        ${(p.unit_price || 0).toFixed(2)}
                                      </td>
                                      <td className="px-6 py-4 text-center font-mono font-bold text-slate-700">
                                        {p.quantity}
                                      </td>
                                      <td className="px-6 py-4 text-right font-mono font-black text-indigo-600">
                                        ${totalCost.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                      </td>
                                      <td className="px-6 py-4 text-slate-500 font-medium">
                                        {p.recorded_by}
                                      </td>
                                      <td className="px-6 py-4 text-right">
                                        <button 
                                          onClick={() => handleDeletePurchase(p.id)}
                                          className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg transition-colors"
                                          title="Delete from ledger"
                                        >
                                          <Trash2 className="w-4 h-4" />
                                        </button>
                                      </td>
                                    </tr>
                                  );
                                });
                              })()}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'quotations' && (
                (() => {
                  const filteredQuotations = quotations.filter((quote) => {
                    if (quotationStartDate && quote.date < quotationStartDate) return false;
                    if (quotationEndDate && quote.date > quotationEndDate) return false;

                    if (!quotationSearch.trim()) return true;
                    const term = quotationSearch.toLowerCase().trim();
                    const quotNoStr = (quote.quotNo || '').toLowerCase();
                    const nameStr = (quote.name || '').toLowerCase();
                    const phoneStr = (quote.phone || '').toLowerCase();
                    const emailStr = (quote.email || '').toLowerCase();
                    const itemsStr = (quote.items || []).map(it => (it.name || it.description || '').toLowerCase()).join(' ');
                    return (
                      quotNoStr.includes(term) ||
                      `#${quotNoStr}`.includes(term) ||
                      nameStr.includes(term) ||
                      phoneStr.includes(term) ||
                      emailStr.includes(term) ||
                      itemsStr.includes(term)
                    );
                  });

                  return (
                    <div className="space-y-6">
                      {/* Top Header Deck */}
                      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                        <div>
                          <h3 className="text-xl font-black text-slate-950 tracking-tight">Quotations Hub</h3>
                          <p className="text-xs text-slate-500 font-semibold mt-1">
                            Track sequential customer estimates, convert accepted quotes to work orders, and generate pre-delivery receipts.
                          </p>
                        </div>
                        <button 
                          onClick={handleOpenQuotationModal}
                          className="bg-red-600 hover:bg-red-750 active:scale-95 text-white px-5 py-3 rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-2.5 transition-all shadow-md shadow-red-100 cursor-pointer"
                        >
                          <Plus className="w-4 h-4" />
                          Generate New Estimate
                        </button>
                      </div>

                      {/* Operational Dashboard Metrics Block */}
                      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
                        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
                          <span className="block text-[10px] font-black uppercase tracking-wider text-slate-400">Total Estimates</span>
                          <span className="text-xl font-extrabold text-slate-900 block mt-1 font-mono">{quotations.length}</span>
                        </div>
                        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
                          <span className="block text-[10px] font-black uppercase tracking-wider text-slate-400">Draft Status</span>
                          <span className="text-xl font-extrabold text-slate-500 block mt-1 font-mono">
                            {quotations.filter(q => q.status === 'draft' || !q.status).length}
                          </span>
                        </div>
                        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
                          <span className="block text-[10px] font-black uppercase tracking-wider text-slate-400">Sent / Out</span>
                          <span className="text-xl font-extrabold text-blue-600 block mt-1 font-mono">
                            {quotations.filter(q => q.status === 'sent').length}
                          </span>
                        </div>
                        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
                          <span className="block text-[10px] font-black uppercase tracking-wider text-slate-400">Accepted</span>
                          <span className="text-xl font-extrabold text-emerald-600 block mt-1 font-mono">
                            {quotations.filter(q => q.status === 'accepted').length}
                          </span>
                        </div>
                        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
                          <span className="block text-[10px] font-black uppercase tracking-wider text-slate-400">Converted Jobs</span>
                          <span className="text-xl font-extrabold text-purple-600 block mt-1 font-mono">
                            {quotations.filter(q => q.status === 'converted').length}
                          </span>
                        </div>
                      </div>

                      {/* Table Control and Real-time Search */}
                      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
                        {/* Interactive Search Bar Panel */}
                        <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex flex-col lg:flex-row items-stretch lg:items-center gap-4">
                          <div className="relative flex-1 w-full">
                            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                            <input
                              type="text"
                              placeholder="Search saved estimates by reference, client name, phone number, services..."
                              value={quotationSearch}
                              onChange={(e) => setQuotationSearch(e.target.value)}
                              className="w-full pl-10 pr-4 py-2.5 text-xs font-semibold rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-red-550 focus:border-red-550 bg-white shadow-3xs"
                            />
                          </div>

                          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
                            <div className="flex items-center gap-1.5">
                              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider whitespace-nowrap">From:</span>
                              <input
                                type="date"
                                value={quotationStartDate}
                                onChange={(e) => setQuotationStartDate(e.target.value)}
                                className="px-3 py-2 text-xs font-semibold rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-red-550 bg-white"
                              />
                            </div>
                            <div className="flex items-center gap-1.5">
                              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider whitespace-nowrap">To:</span>
                              <input
                                type="date"
                                value={quotationEndDate}
                                onChange={(e) => setQuotationEndDate(e.target.value)}
                                className="px-3 py-2 text-xs font-semibold rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-red-550 bg-white"
                              />
                            </div>
                            
                            {(quotationSearch || quotationStartDate || quotationEndDate) && (
                              <button
                                onClick={() => {
                                  setQuotationSearch('');
                                  setQuotationStartDate('');
                                  setQuotationEndDate('');
                                }}
                                className="bg-slate-200 hover:bg-slate-300 text-slate-700 font-extrabold text-[10px] px-3.5 py-2.5 rounded-lg uppercase tracking-wider transition-all cursor-pointer whitespace-nowrap shadow-3xs"
                              >
                                Reset Date/Filter
                              </button>
                            )}
                          </div>
                        </div>

                        {filteredQuotations.length === 0 ? (
                          <div className="p-16 text-center">
                            <FileText className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                            <h4 className="text-slate-900 font-bold text-base">
                              {quotations.length === 0 ? 'No Saved Estimations found' : 'No matching results found'}
                            </h4>
                            <p className="text-slate-500 text-xs max-w-sm mx-auto mt-1.5 leading-relaxed">
                              {quotations.length === 0 
                                ? 'Estimates are saved to Firestore when you click "Save & Print" or "Save & Download" in the builder. Click above to produce your first document.'
                                : 'Try adjusting your search query, selecting different date ranges, or click "Reset Date/Filter" above to restore list items.'
                              }
                            </p>
                          </div>
                        ) : (
                          <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                              <thead>
                                <tr className="bg-slate-50 border-b border-slate-100">
                                  <th className="px-6 py-4 text-[10px] font-black uppercase tracking-wider text-slate-500">Quot Ref</th>
                                  <th className="px-6 py-4 text-[10px] font-black uppercase tracking-wider text-slate-500">Date Issued</th>
                                  <th className="px-6 py-4 text-[10px] font-black uppercase tracking-wider text-slate-500">Client / Customer</th>
                                  <th className="px-6 py-4 text-[10px] font-black uppercase tracking-wider text-slate-500">Core Services</th>
                                  <th className="px-6 py-4 text-[10px] font-black uppercase tracking-wider text-slate-500 text-right">Estimate Total</th>
                                  <th className="px-6 py-4 text-[10px] font-black uppercase tracking-wider text-slate-500 text-center">Lifecycle Status</th>
                                  <th className="px-6 py-4 text-[10px] font-black uppercase tracking-wider text-slate-500 text-right">Actions Deck</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-slate-100">
                                {filteredQuotations.map((quote) => {
                                  const grandTotal = (quote.items || []).reduce((sum, item) => sum + (Number(item.quantity) * Number(item.price)), 0);
                                  
                                  let statusBadge = (
                                    <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase bg-slate-100 text-slate-500 border border-slate-200">Draft</span>
                                  );
                                  if (quote.status === 'sent') {
                                    statusBadge = (
                                      <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase bg-blue-50 text-blue-600 border border-blue-200">Sent</span>
                                    );
                                  } else if (quote.status === 'accepted') {
                                    statusBadge = (
                                      <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase bg-emerald-50 text-emerald-600 border border-emerald-200">Accepted</span>
                                    );
                                  } else if (quote.status === 'declined') {
                                    statusBadge = (
                                      <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase bg-rose-50 text-rose-600 border border-rose-200">Declined</span>
                                    );
                                  } else if (quote.status === 'converted') {
                                    statusBadge = (
                                      <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase bg-purple-50 text-purple-600 border border-purple-200">Converted</span>
                                    );
                                  }

                                  const isExpanded = activeQuoteDropdownId === quote.id;

                                  return (
                                    <React.Fragment key={quote.id}>
                                      {/* Primary Single-Line Row */}
                                      <tr className={`hover:bg-slate-50/50 transition-colors ${isExpanded ? 'bg-slate-50/50' : ''}`}>
                                        <td className="px-6 py-3 font-mono font-bold text-xs text-red-600">#{quote.quotNo}</td>
                                        <td className="px-6 py-3 text-xs font-semibold text-slate-600 whitespace-nowrap">{quote.date}</td>
                                        <td className="px-6 py-3 whitespace-nowrap">
                                          <div className="font-extrabold text-slate-900 text-xs uppercase">{quote.name}</div>
                                          <div className="text-[10px] font-bold text-slate-400 mt-0.5">{quote.phone || 'No phone'}</div>
                                        </td>
                                        <td className="px-6 py-3">
                                          <div className="text-xs text-slate-700 font-semibold truncate max-w-[200px]" title={(quote.items || []).map(it => `${it.quantity}x ${it.name || it.description}`).join(', ')}>
                                            {(quote.items || []).map(it => `${it.quantity}x ${it.name || it.description}`).join(', ') || 'No Items'}
                                          </div>
                                          <div className="text-[10px] text-slate-400 font-medium mt-0.5">{(quote.items || []).length} items</div>
                                        </td>
                                        <td className="px-6 py-3 text-right font-mono font-extrabold text-xs text-slate-900 whitespace-nowrap">
                                          {formatCurrency(grandTotal, quote.usd_rate)}
                                        </td>
                                        <td className="px-6 py-3 text-center whitespace-nowrap">{statusBadge}</td>
                                        <td className="px-6 py-3 text-right whitespace-nowrap">
                                          <button
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              setActiveQuoteDropdownId(isExpanded ? null : quote.id);
                                            }}
                                            className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider inline-flex items-center gap-1 transition-all cursor-pointer border ${
                                              isExpanded 
                                                ? 'bg-red-600 text-white border-red-600 shadow-md shadow-red-100' 
                                                : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200 shadow-3xs'
                                            }`}
                                          >
                                            <span>Manage</span>
                                            <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`} />
                                          </button>
                                        </td>
                                      </tr>

                                      {/* Collapsible Tap-in Details Panel (Available when active) */}
                                      {isExpanded && (
                                        <tr className="bg-slate-50/85">
                                          <td colSpan={7} className="px-8 py-4 border-t border-b border-red-100/40">
                                            <div className="flex flex-col lg:flex-row justify-between lg:items-center gap-4">
                                              <div>
                                                <span className="text-[10px] uppercase font-black tracking-wider text-slate-400 block font-mono">Operations Console • Quote #{quote.quotNo}</span>
                                                <span className="text-xs text-slate-500 font-semibold">Change status, convert to a live work order, or download export copies.</span>
                                              </div>
                                              
                                              <div className="flex flex-wrap items-center gap-2.5">
                                                {/* Status Controllers */}
                                                <div className="flex items-center gap-1.5 bg-white p-1 rounded-xl border border-slate-100 shadow-3xs">
                                                  {quote.status !== 'converted' && quote.status !== 'declined' && (
                                                    <button
                                                      onClick={() => handleConvertQuoteToJob(quote)}
                                                      className="bg-purple-600 hover:bg-purple-700 active:scale-95 text-white font-black text-[10px] px-3.5 py-2 rounded-lg uppercase tracking-wider flex items-center gap-1 transition-all shadow-xs cursor-pointer"
                                                      title="Convert this quotation into a active Job Order in the queue"
                                                    >
                                                      <TrendingUp className="w-3.5 h-3.5 text-purple-100" />
                                                      Convert to Job Order
                                                    </button>
                                                  )}
                                                  
                                                  {(quote.status === 'draft' || !quote.status || quote.status === 'sent') && (
                                                    <>
                                                      <button
                                                        onClick={() => {
                                                          firebaseService.updateQuotationStatus(quote.id, 'accepted', undefined, quote.usd_rate || Number(usdRate))
                                                            .then(() => showNotification('Estimate marked as accepted!', 'success'));
                                                        }}
                                                        className="px-3 py-2 text-[10px] font-black uppercase tracking-wider bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-lg transition-all cursor-pointer"
                                                        title="Approve estimate"
                                                      >
                                                        Approve
                                                      </button>
                                                      <button
                                                        onClick={async () => {
                                                          const isStrictAdmin = user && (user.role === 'admin' || user.staff_id === 'MASTER' || user.email === 'tekkisandereagan@gmail.com' || user.email === 'kulyakosukusandereagan@gmail.com');
                                                          if (isStrictAdmin) {
                                                            setConfirmModal({
                                                              isOpen: true,
                                                              title: "Decline & Delete Estimate",
                                                              message: `Are you sure you want to decline and permanently delete the estimate for "${quote.name || "Customer"}"? This action cannot be undone.`,
                                                              onConfirm: async () => {
                                                                try {
                                                                  await firebaseService.deleteQuotation(quote.id);
                                                                  showNotification("Estimate declined and permanently deleted!", "success");
                                                                  fetchDashboardData();
                                                                } catch (err) {
                                                                  showNotification("Failed to delete the estimate.", "error");
                                                                }
                                                                setConfirmModal(null);
                                                              }
                                                            });
                                                          } else {
                                                            firebaseService.updateQuotationStatus(quote.id, 'declined')
                                                              .then(() => {
                                                                showNotification('Estimate marked as declined!', 'success');
                                                                fetchDashboardData();
                                                              });
                                                          }
                                                        }}
                                                        className="px-3 py-2 text-[10px] font-black uppercase tracking-wider bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-lg transition-all cursor-pointer"
                                                        title="Decline estimate"
                                                      >
                                                        Decline
                                                      </button>
                                                    </>
                                                  )}

                                                  {quote.status === 'converted' && (
                                                    <span className="text-[10px] text-purple-700 font-extrabold bg-purple-50 px-3 py-2 rounded-lg border border-purple-100 flex items-center gap-1">
                                                      ✓ Converted to Work Order
                                                    </span>
                                                  )}
                                                </div>

                                                {/* Admin-only Edit Controls */}
                                                {isAdminUser && (
                                                  <div className="flex items-center gap-1.5 bg-white p-1 rounded-xl border border-slate-100 shadow-3xs">
                                                    <button
                                                      onClick={() => handleOpenQuotationEditModal(quote)}
                                                      className="px-3.5 py-2 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-700 text-[10px] font-black transition-all flex items-center gap-1 border border-amber-200 cursor-pointer shadow-3xs uppercase tracking-wider"
                                                      title="Edit quotation data"
                                                    >
                                                      <Edit3 className="w-3.5 h-3.5 text-amber-500" />
                                                      Edit Estimate
                                                    </button>
                                                  </div>
                                                )}

                                                {/* Reception/Admin Deposit Controls */}
                                                {isAuthorisedForPayments && (
                                                  <div className="flex items-center gap-1.5 bg-white p-1 rounded-xl border border-slate-100 shadow-3xs">
                                                    <button
                                                      onClick={() => handleOpenDepositUpdateModal(quote)}
                                                      className="px-3.5 py-2 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-[10px] font-black transition-all flex items-center gap-1 border border-emerald-200 cursor-pointer shadow-3xs uppercase tracking-wider"
                                                      title="Quickly record or update client deposit"
                                                    >
                                                      <DollarSign className="w-3.5 h-3.5 text-emerald-500" />
                                                      Add/Update Deposit
                                                    </button>
                                                  </div>
                                                )}

                                                {/* Pre-Delivery & Documents Deck */}
                                                <div className="flex items-center gap-1.5 bg-white p-1 rounded-xl border border-slate-100 shadow-3xs">
                                                  <button
                                                    onClick={() => generateQuotationPDF(quote, false)}
                                                    className="px-3 py-2 rounded-lg bg-red-50 hover:bg-red-105 text-red-700 text-[10px] font-extrabold transition-all flex items-center gap-1 border border-red-200 cursor-pointer shadow-3xs"
                                                    title="Download Estimate PDF"
                                                  >
                                                    <FileText className="w-3.5 h-3.5 text-red-500" />
                                                    Estimate
                                                  </button>

                                                  <button
                                                    onClick={() => generateQuotationA4Invoice(quote, false)}
                                                    className="px-3 py-2 rounded-lg bg-blue-50 hover:bg-blue-105 text-blue-700 text-[10px] font-extrabold transition-all flex items-center gap-1 border border-blue-200 cursor-pointer shadow-3xs"
                                                    title="Pre-Delivery Receipt (Invoice PDF)"
                                                  >
                                                    <Printer className="w-3.5 h-3.5 text-blue-500" />
                                                    Pre-Delivery Receipt
                                                  </button>

                                                  <button
                                                    onClick={() => generateQuotationA4DeliveryNote(quote, false)}
                                                    className="px-3 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-[10px] font-extrabold transition-all flex items-center gap-1 border border-slate-300 cursor-pointer shadow-3xs"
                                                    title="Download Delivery Note PDF"
                                                  >
                                                    <Package className="w-3.5 h-3.5 text-slate-500" />
                                                    Delivery Note
                                                  </button>
                                                </div>
                                              </div>
                                            </div>
                                          </td>
                                        </tr>
                                      )}
                                    </React.Fragment>
                                  );
                                })}
                              </tbody>
                            </table>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })()
              )}

              {activeTab === 'new-order' && (
                <div className="max-w-4xl mx-auto bg-white rounded-3xl shadow-sm border border-slate-100 p-8">
                  <h3 className="text-xl font-bold text-slate-900 mb-6">Consolidated Client Intake & Order</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-6">
                      <div className="grid grid-cols-1 gap-6">
                        <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                          <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Customer Information</label>
                          <div className="flex gap-2 mb-4">
                            <button 
                              onClick={() => setIsNewCustomer(false)}
                              className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${!isNewCustomer ? 'bg-white shadow-sm text-red-600' : 'text-slate-500'}`}
                            >
                              Existing Client
                            </button>
                            <button 
                              onClick={() => setIsNewCustomer(true)}
                              className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${isNewCustomer ? 'bg-white shadow-sm text-red-600' : 'text-slate-500'}`}
                            >
                              New Client
                            </button>
                          </div>

                          {!isNewCustomer ? (
                            <div className="space-y-3">
                              <div className="relative">
                                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                <input 
                                  type="text"
                                  placeholder="Type name or phone..."
                                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 bg-white outline-none focus:ring-2 focus:ring-red-500 text-sm"
                                  value={customerSearch}
                                  onChange={(e) => setCustomerSearch(e.target.value)}
                                />
                              </div>
                              <select 
                                value={selectedCustomerId}
                                onChange={(e) => setSelectedCustomerId(e.target.value)}
                                className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white outline-none focus:ring-2 focus:ring-red-500 text-sm"
                              >
                                <option value="">Select customer from results...</option>
                                {customers
                                  .filter(c => 
                                    c.name.toLowerCase().includes(customerSearch.toLowerCase()) || 
                                    (c.phone && c.phone.includes(customerSearch))
                                  )
                                  .slice(0, 100)
                                  .map(c => <option key={c.id} value={c.id}>{c.name} ({c.phone || 'No Phone'})</option>)}
                              </select>
                            </div>
                          ) : (
                            <div className="space-y-3">
                              <input 
                                type="text"
                                placeholder="Full Name"
                                className="w-full px-4 py-2 rounded-xl border border-slate-200 bg-white outline-none focus:ring-2 focus:ring-red-500"
                                value={newCustomerOrder.name}
                                onChange={e => setNewCustomerOrder({...newCustomerOrder, name: e.target.value})}
                              />
                              <input 
                                type="text"
                                placeholder="Phone Number"
                                className="w-full px-4 py-2 rounded-xl border border-slate-200 bg-white outline-none focus:ring-2 focus:ring-red-500"
                                value={newCustomerOrder.phone}
                                onChange={e => setNewCustomerOrder({...newCustomerOrder, phone: e.target.value})}
                              />
                              <input 
                                type="text"
                                placeholder="Address (Optional)"
                                className="w-full px-4 py-2 rounded-xl border border-slate-200 bg-white outline-none focus:ring-2 focus:ring-red-500"
                                value={newCustomerOrder.address}
                                onChange={e => setNewCustomerOrder({...newCustomerOrder, address: e.target.value})}
                              />
                            </div>
                          )}
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-2">Referrer (Optional)</label>
                          <select 
                            value={selectedReferrerId}
                            onChange={(e) => setSelectedReferrerId(e.target.value)}
                            className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-red-500"
                          >
                            <option value="">No Referrer</option>
                            {users.map(u => <option key={u.id} value={u.id}>{u.full_name} ({u.role})</option>)}
                          </select>
                        </div>
                      </div>
                      <div>
                        {/* We now prompt for designer on creation if not selected, but let's keep the option in form if user prefers it. 
                            Actually, the user said "prompt", so let's simplify the form if possible or just use the prompt as a confirmation.
                            I will keep the dropdown but if it's empty, clicking Generate will prompt. */}
                        <label className="block text-sm font-medium text-slate-700 mb-2">Assign Designer (Optional here, will prompt otherwise)</label>
                        <select 
                          className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-red-500 bg-white"
                          value={assignedStaffId}
                          onChange={(e) => setAssignedStaffId(e.target.value)}
                        >
                          <option value="">Choose a Designer...</option>
                          {users.filter(u => u.role === 'designer').map(u => (
                            <option key={u.id} value={u.id}>{u.full_name}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">Job Description</label>
                        <textarea 
                          value={orderDescription}
                          onChange={(e) => setOrderDescription(e.target.value)}
                          placeholder="Instructions for production team..."
                          className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-red-500 h-24"
                        />
                      </div>
                      <div>
                        <div className="flex items-center justify-between mb-2">
                           <label className="block text-sm font-medium text-slate-700">Add Services</label>
                           <div className="relative">
                             <Search className="w-3 h-3 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                             <input 
                               type="text" 
                               placeholder="Search services..." 
                               className="pl-8 pr-3 py-1.5 bg-slate-100 rounded-lg text-[10px] outline-none focus:bg-white focus:ring-1 focus:ring-red-500 transition-all"
                               value={serviceSearchTerm}
                               onChange={(e) => setServiceSearchTerm(e.target.value)}
                             />
                           </div>
                        </div>
                        <div className="grid grid-cols-1 gap-2 max-h-48 overflow-y-auto pr-2 mb-4">
                          {[...(services || [])]
                            .filter(s => (s.name || '').toLowerCase().includes((serviceSearchTerm || '').toLowerCase()))
                            .sort((a, b) => (a.name || '').localeCompare(b.name || ''))
                            .map(s => (
                            <ServiceSelectItem 
                              key={s.id} 
                              s={s} 
                              formatCurrency={formatCurrency}
                              usdToSsp={usdToSsp}
                              onAdd={(qty) => {
                                setSelectedItems(prev => {
                                  const existing = prev.find(item => item.serviceId === s.id);
                                  if (existing) {
                                    return prev.map(item => item.serviceId === s.id ? { ...item, quantity: item.quantity + qty } : item);
                                  }
                                  return [...prev, { serviceId: s.id, name: s.name, price: usdToSsp(s.price || 0), quantity: qty, cost: usdToSsp(s.unit_cost || 0) }];
                                });
                              }}
                            />
                          ))}
                        </div>

                        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                          <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Add Manual / Labour Charge</label>
                          <div className="flex gap-2">
                            <input 
                              type="text"
                              placeholder="Description (e.g. Extra Labour)"
                              className="flex-1 px-3 py-2 text-xs rounded-lg border border-slate-200 bg-white outline-none focus:ring-1 focus:ring-red-500"
                              value={manualItemName}
                              onChange={e => setManualItemName(e.target.value)}
                            />
                            <input 
                              type="number"
                              placeholder="Price"
                              className="w-20 px-3 py-2 text-xs rounded-lg border border-slate-200 bg-white outline-none focus:ring-1 focus:ring-red-500"
                              value={manualItemPrice}
                              onChange={e => setManualItemPrice(e.target.value)}
                            />
                            <button 
                              onClick={() => {
                                if (!manualItemName || !manualItemPrice) return;
                                const priceNum = Number(manualItemPrice);
                                setSelectedItems(prev => [...prev, { 
                                  serviceId: `manual-${Date.now()}`, 
                                  name: manualItemName, 
                                  price: priceNum, 
                                  quantity: 1 
                                }]);
                                setManualItemName('');
                                setManualItemPrice('');
                              }}
                              className="bg-slate-900 text-white px-3 py-2 rounded-lg text-xs font-bold hover:bg-black transition-colors"
                            >
                              Add
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-slate-50 rounded-2xl p-6 flex flex-col">
                      <h4 className="font-bold text-slate-900 mb-4">Order Summary</h4>
                      <div className="flex-1 space-y-3 overflow-y-auto max-h-80">
                        {selectedItems.map((item, idx) => (
                          <div key={idx} className="bg-white p-3 rounded-xl border border-slate-100 flex items-center justify-between gap-3 shadow-sm">
                            <div className="flex-1">
                              {item.serviceId.startsWith('manual-') ? (
                                <div className="space-y-1">
                                  <input 
                                    type="text"
                                    value={item.name}
                                    onChange={e => {
                                      setSelectedItems(prev => prev.map((it, i) => i === idx ? { ...it, name: e.target.value } : it));
                                    }}
                                    className="w-full bg-slate-50 border-none p-0 font-bold text-slate-900 text-sm focus:ring-0"
                                  />
                                  <div className="flex items-center gap-1">
                                    <span className="text-[10px] text-slate-400">Price:</span>
                                    <input 
                                      type="number"
                                      value={item.price}
                                      onChange={e => {
                                        setSelectedItems(prev => prev.map((it, i) => i === idx ? { ...it, price: Number(e.target.value) } : it));
                                      }}
                                      className="w-16 bg-slate-50 border-none p-0 text-xs text-slate-500 focus:ring-0"
                                    />
                                  </div>
                                </div>
                              ) : (
                                <>
                                  <p className="font-bold text-slate-900 text-sm">{item.name}</p>
                                  <p className="text-xs text-slate-400">{formatCurrency(item.price)} each</p>
                                </>
                              )}
                            </div>
                            <div className="flex items-center gap-2">
                              <div className="flex items-center bg-slate-100 rounded-lg overflow-hidden border border-slate-200">
                                <button 
                                  onClick={() => {
                                    setSelectedItems(prev => prev.map((it, i) => i === idx ? { ...it, quantity: Math.max(1, it.quantity - 1) } : it));
                                  }}
                                  className="w-8 h-8 flex items-center justify-center text-slate-600 hover:bg-slate-200"
                                >
                                  -
                                </button>
                                <span className="w-8 h-8 flex items-center justify-center text-xs font-bold text-slate-900 bg-white">
                                  {item.quantity}
                                </span>
                                <button 
                                  onClick={() => {
                                    setSelectedItems(prev => prev.map((it, i) => i === idx ? { ...it, quantity: it.quantity + 1 } : it));
                                  }}
                                  className="w-8 h-8 flex items-center justify-center text-slate-600 hover:bg-slate-200"
                                >
                                  +
                                </button>
                              </div>
                              <button 
                                onClick={() => {
                                  setSelectedItems(prev => prev.filter((_, i) => i !== idx));
                                }}
                                className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        ))}
                        {selectedItems.length === 0 && <p className="text-slate-400 text-sm italic">No services added yet</p>}
                      </div>
                      <div className="mt-6 pt-4 border-t border-slate-200 space-y-4">
                        <div className="bg-white p-4 rounded-xl border border-slate-100 space-y-3">
                           <div className="flex justify-between items-center">
                              <label className="text-xs font-bold text-slate-500 uppercase">Apply Discount (%)</label>
                              <div className="flex items-center gap-2">
                                <input 
                                  type="number" 
                                  className="w-16 px-2 py-1 text-xs font-bold border border-slate-200 rounded-lg text-right focus:ring-1 focus:ring-red-500 outline-none"
                                  value={orderDiscount}
                                  onChange={e => {
                                    const val = Number(e.target.value);
                                    setOrderDiscount(Math.min(100, Math.max(0, val)));
                                  }}
                                  min="0"
                                  max="100"
                                />
                                <span className="text-sm font-bold text-slate-400">%</span>
                              </div>
                           </div>
                           <div className="flex justify-between items-center text-xs text-slate-400">
                              <span>Sub-total</span>
                              <span className="font-bold">{formatCurrency(selectedItems.reduce((sum, item) => sum + (item.price * item.quantity), 0))}</span>
                           </div>
                           {orderDiscount > 0 && (
                             <div className="flex justify-between items-center text-xs text-red-500">
                                <span>Discount ({orderDiscount}%)</span>
                                <span className="font-bold">-{formatCurrency(selectedItems.reduce((sum, item) => sum + (item.price * item.quantity), 0) * (orderDiscount / 100))}</span>
                             </div>
                           )}
                        </div>

                        <div className="flex justify-between items-center">
                          <span className="text-slate-500 font-medium tracking-tight uppercase text-xs font-black">Final Total</span>
                          <span className="text-2xl font-black text-slate-900">
                            {formatCurrency(selectedItems.reduce((sum, item) => sum + (item.price * item.quantity), 0) * (1 - (orderDiscount || 0) / 100))}
                          </span>
                        </div>
                        <button 
                          onClick={async () => {
                            let customerId = selectedCustomerId;
                            if (isNewCustomer) {
                              if (!newCustomerOrder.name || !newCustomerOrder.phone) {
                                showNotification('Please provide new client name and phone', 'error');
                                return;
                              }
                              const res = await firebaseService.addCustomer(newCustomerOrder);
                              customerId = res;
                              setNewCustomerOrder({ name: '', phone: '', address: '' });
                              setIsNewCustomer(false);
                            }

                            if (!customerId) {
                              showNotification('Please select or add a customer', 'error');
                              return;
                            }

                            // Prompt for designer if not selected or to confirm
                            const designers = users.filter(u => u.role === 'designer');
                            if (designers.length > 0) {
                              setConfirmModal({
                                isOpen: true,
                                title: 'Step 1: Designer Assignment',
                                message: 'Confirm the designer who will handle this order:',
                                onConfirm: (selectedId) => {
                                  if (selectedId) {
                                    handleCreateOrder(customerId, selectedId);
                                    setConfirmModal(null);
                                  } else {
                                    showNotification('Please select a designer', 'error');
                                  }
                                },
                                selectionOptions: designers.map(u => ({ id: u.id, label: u.full_name }))
                              });
                            } else {
                              handleCreateOrder(customerId);
                            }
                          }}
                          disabled={loading}
                          className="w-full bg-red-600 text-white py-3 rounded-xl font-bold hover:bg-red-700 transition-colors shadow-lg shadow-red-100 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                        >
                          {loading ? 'Processing...' : 'Process Intake & Send to Design'}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'manual' && (user?.email === 'tekkisandereagan@gmail.com' || user?.email === 'kulyakosukusandereagan@gmail.com') && (
                <div className="space-y-8 max-w-5xl mx-auto py-8">
                  <div className="bg-white p-12 rounded-[3rem] border border-slate-100 shadow-xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-red-500/5 blur-3xl rounded-full -mr-20 -mt-20" />
                    
                    <div className="flex flex-col md:flex-row justify-between items-start mb-12 gap-8 relative z-10">
                      <div className="flex items-center gap-6">
                        <div className="w-20 h-20 bg-red-600 rounded-3xl flex items-center justify-center shadow-2xl shadow-red-200">
                          <BookOpen className="w-10 h-10 text-white" />
                        </div>
                        <div>
                          <h2 className="text-4xl font-black text-slate-900 tracking-tight mb-2">MASTER USER MANUAL</h2>
                          <p className="text-slate-500 font-medium">Enterprise Resource Planning Guide • Ver 2.0</p>
                        </div>
                      </div>
                      <button 
                        onClick={() => generateUserManualPDF()}
                        className="bg-slate-900 text-white px-8 py-4 rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-black transition-all flex items-center gap-3 shadow-xl"
                      >
                        <FileText className="w-5 h-5" /> Download Manual (PDF)
                      </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 relative z-10">
                      {[
                        { title: "Role-Based Navigation", desc: "The software UI adapts to who is logged in. Admins see 'Staff' and 'Services', while Operators see only 'Work Queues' and 'Jobs Done'. Buttons are disabled based on role hierarchy." },
                        { title: "Dynamic Search Engines", desc: "Every tab (Orders, Customers, Analytics) has a 'Real-time Search' bar. Typing instantly filters large databases using Firebase optimized queries." },
                        { title: "Order Pipeline Control", desc: "Each order in the queue has primary action buttons (Process, Print, Complete). These move the job through building-wide production stages." },
                        { title: "Debt & installment Logic", desc: "The 'Installment' component calculates balances in real-time. It uses server-authoritative math to prevent balance errors during partial payments." },
                        { title: "Item Inventory Engine", desc: "Stock is linked to specific services. When a print is finished, the backend identifies linked raw materials and decrements stock levels automatically." },
                        { title: "Engineering Signature", desc: "Every PDF generated (Invoice/Report) features a Longun Tech Agency signature in the footer, ensuring brand consistency across all printouts." }
                      ].map((item, i) => (
                        <div key={i} className="group p-6 rounded-2xl bg-neutral-50 hover:bg-white hover:shadow-lg transition-all border border-transparent hover:border-slate-100">
                          <h4 className="text-base font-black text-slate-900 mb-2 flex items-center gap-2">
                             <div className="w-2 h-2 bg-red-600 rounded-full" />
                             {item.title}
                          </h4>
                          <p className="text-slate-500 leading-relaxed text-xs font-medium">{item.desc}</p>
                        </div>
                      ))}
                    </div>

                    <div className="mt-16 pt-8 border-t border-slate-100 flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-slate-400">
                      <span>Confidential Master Document</span>
                      <span>Product of Longun Tech & AI Agency</span>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'settings' && (
                <div className="space-y-6">
                  {user.role === 'admin' && (
                    <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm">
                      <h4 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                        <DollarSign className="w-5 h-5 text-emerald-600" />
                        Daily USD Exchange Rate
                      </h4>
                      <div className="flex gap-4 items-end max-w-sm">
                        <div className="flex-1">
                          <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Current Rate (SSP per 1 USD)</label>
                          <input 
                            type="number"
                            className="w-full px-4 py-2 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-emerald-500"
                            value={usdRateValue}
                            onChange={(e) => setUsdRateValue(e.target.value)}
                          />
                        </div>
                        <button 
                          onClick={async () => {
                            try {
                              await firebaseService.updateSetting('usd_rate', usdRateValue);
                              setUsdRate(Number(usdRateValue));
                              showNotification('USD Rate updated', 'success');
                            } catch (err) {
                              showNotification('Failed to update rate', 'error');
                            }
                          }}
                          className="bg-emerald-600 text-white px-6 py-2 rounded-xl font-bold hover:bg-emerald-700 transition-colors"
                        >
                          Save
                        </button>
                      </div>
                    </div>
                  )}

                  {user.role === 'admin' && (
                    <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm">
                      <h4 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                        <Camera className="w-5 h-5 text-red-600" />
                        Company Branding
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                        <div className="space-y-4">
                          <p className="text-sm text-slate-500">
                            Upload your company logo. This will appear on all generated invoices, receipts, and reports.
                            Recommended size: Square (e.g. 512x512).
                          </p>
                          <input 
                            type="file" 
                            accept="image/*"
                            onChange={async (e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                const reader = new FileReader();
                                reader.onloadend = async () => {
                                  const base64 = reader.result as string;
                                  try {
                                    setLoading(true);
                                    await firebaseService.setLogoBase64(base64);
                                    setCustomLogoUrl(base64);
                                    showNotification('Logo updated successfully!', 'success');
                                  } catch (err) {
                                    showNotification('Failed to upload logo', 'error');
                                  } finally {
                                    setLoading(false);
                                  }
                                };
                                reader.readAsDataURL(file);
                              }
                            }}
                            className="text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-black file:bg-red-50 file:text-red-700 hover:file:bg-red-100 transition-all cursor-pointer"
                          />
                        </div>
                        <div className="flex justify-center">
                          <div className="w-32 h-32 rounded-2xl border-2 border-dashed border-slate-200 flex items-center justify-center overflow-hidden bg-slate-50">
                            {customLogoUrl ? (
                              <img src={customLogoUrl} alt="Logo Preview" className="w-full h-full object-contain" />
                            ) : (
                              <p className="text-[10px] text-slate-400 font-bold uppercase">No Custom Logo</p>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                  {isMaster && (
                    <div className="bg-white p-8 rounded-3xl border border-red-100 shadow-sm shadow-red-50 mb-6">
                      <h4 className="text-lg font-black text-red-900 mb-4 flex items-center gap-2">
                        <ShieldAlert className="w-5 h-5 text-red-600" />
                        Master Administrative Panel
                      </h4>
                      <p className="text-sm text-slate-500 mb-6">
                        These controls allow you to manage the entire application state. Use them with caution.
                      </p>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <button 
                          onClick={() => {
                            setConfirmModal({
                              isOpen: true,
                              title: 'CRITICAL: PURGE DATABASE',
                              message: 'This will permanently delete ALL orders, customers, financial records, and inventory logs. This action IS DESTRUCTIVE and CANNOT BE UNDONE. Confirm to continue?',
                              onConfirm: async () => {
                                try {
                                  setLoading(true);
                                  await firebaseService.purgeAllData();
                                  showNotification("System data purged successfully.", "success" as any);
                                  fetchDashboardData();
                                } catch (err) {
                                  showNotification("Purge failed. Check rules.", "error" as any);
                                } finally {
                                  setLoading(false);
                                  setConfirmModal(null);
                                }
                              }
                            });
                          }}
                          className="flex items-center justify-between p-4 bg-rose-50 border border-rose-100 rounded-2xl hover:bg-rose-100 transition-all group"
                        >
                          <div className="text-left">
                            <span className="block font-bold text-rose-900 leading-none mb-1">Purge Database</span>
                            <span className="text-[10px] text-rose-500 font-extrabold uppercase tracking-widest">Wipe everything</span>
                          </div>
                          <Trash2 className="w-5 h-5 text-rose-400 group-hover:text-rose-600 transition-colors" />
                        </button>
                        <button 
                          onClick={async () => {
                            const newStatus = !isAppLocked;
                            try {
                              setLoading(true);
                              await firebaseService.toggleAppLock(newStatus);
                              showNotification(newStatus ? "Application RESTRICTED" : "Application RELEASED", "success" as any);
                            } catch (err) {
                              showNotification("Failed to toggle access.", "error" as any);
                            } finally {
                              setLoading(false);
                            }
                          }}
                          className={`flex items-center justify-between p-4 border rounded-2xl transition-all group ${
                            isAppLocked 
                              ? "bg-emerald-50 border-emerald-100 hover:bg-emerald-100" 
                              : "bg-orange-50 border-orange-100 hover:bg-orange-100"
                          }`}
                        >
                          <div className="text-left">
                            <span className={`block font-bold leading-none mb-1 ${isAppLocked ? "text-emerald-900" : "text-orange-900"}`}>
                              {isAppLocked ? "Unlock App" : "Lock App"}
                            </span>
                            <span className={`text-[10px] font-extrabold uppercase tracking-widest ${isAppLocked ? "text-emerald-500" : "text-orange-500"}`}>
                              {isAppLocked ? "Grant full access" : "Pending payment mode"}
                            </span>
                          </div>
                          {isAppLocked ? (
                            <Unlock className="w-5 h-5 text-emerald-400 group-hover:text-emerald-600 transition-colors" />
                          ) : (
                            <Lock className="w-5 h-5 text-orange-400 group-hover:text-orange-600 transition-colors" />
                          )}
                        </button>
                      </div>

                      {/* Multi-Tenant Control Switcher */}
                      <div className="mt-8 border-t border-slate-100 pt-6">
                        <h5 className="text-xs font-black text-slate-800 uppercase tracking-widest mb-3 flex items-center gap-2">
                          <Landmark className="w-4 h-4 text-slate-400" />
                          Multi-Tenant Control Switcher
                        </h5>
                        <p className="text-xs text-slate-500 mb-4">
                          Currently managing: <strong className="text-red-600">{tenantName} ({tenantCode})</strong>. Select any registered tenant below to switch your live administrative context.
                        </p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                          {tenantsList.map((t) => (
                            <button
                              key={t.id}
                              onClick={async () => {
                                try {
                                  setLoading(true);
                                  // Set tenant in service (updates localStorage)
                                  firebaseService.setTenant(t.id, t.name, t.code || t.id);
                                  // Update reactive states
                                  setTenantName(t.name);
                                  setTenantCode(t.code || t.id);
                                  // Clear custom logo to force reload or fetch the new one
                                  setCustomLogoUrl(null);
                                  // Fetch dashboard data with new tenant context
                                  await fetchDashboardData();
                                  showNotification(`Switched administrative context to ${t.name}!`, 'success');
                                } catch (err) {
                                  showNotification('Failed to switch tenant context.', 'error');
                                } finally {
                                  setLoading(false);
                                }
                              }}
                              className={`p-4 rounded-2xl border text-left transition-all relative overflow-hidden group ${
                                tenantCode === (t.code || t.id)
                                  ? 'bg-red-50/50 border-red-200 ring-2 ring-red-600/20'
                                  : 'bg-slate-50 border-slate-200/60 hover:bg-white hover:border-slate-300 hover:shadow-sm'
                              }`}
                            >
                              <span className="block font-bold text-slate-800 text-xs leading-none mb-1 truncate">
                                {t.name}
                              </span>
                              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest block">
                                Shortcode: {t.code || t.id}
                              </span>
                              {tenantCode === (t.code || t.id) && (
                                <span className="absolute top-2 right-2 w-2 h-2 bg-red-600 rounded-full"></span>
                              )}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm">
                    <div className="flex items-center gap-6 mb-8">
                      <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center text-slate-600">
                        <Settings className="w-8 h-8" />
                      </div>
                      <div>
                        <h3 className="text-2xl font-bold text-slate-900">User Settings</h3>
                        <p className="text-slate-500">Update your account preferences and security.</p>
                      </div>
                    </div>

                    <div className="max-w-md space-y-6">
                      <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100">
                        <h4 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
                          <Lock className="w-4 h-4 text-red-600" />
                          Change Password
                        </h4>
                        <div className="space-y-4">
                          <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">New Password</label>
                            <div className="relative">
                              <input 
                                type={showNewPassword ? "text" : "password"}
                                className="w-full pl-4 pr-12 py-2.5 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-red-500 bg-white text-xs font-semibold text-slate-700"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                placeholder="Min 6 characters..."
                              />
                              <button
                                type="button"
                                onClick={() => setShowNewPassword(!showNewPassword)}
                                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none p-1 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer flex items-center justify-center"
                                title={showNewPassword ? "Hide password" : "Show password"}
                              >
                                {showNewPassword ? (
                                  <EyeOff className="w-4 h-4" />
                                ) : (
                                  <Eye className="w-4 h-4" />
                                )}
                              </button>
                            </div>
                          </div>
                          <button 
                            onClick={async () => {
                              if (newPassword.length < 6) {
                                showNotification('Password must be at least 6 characters', 'error');
                                return;
                              }
                              try {
                                await firebaseService.changePassword(user.id, newPassword);
                                setNewPassword('');
                                showNotification('Password updated successfully!', 'success');
                              } catch (err: any) {
                                console.error(err);
                                showNotification(err.message || 'Failed to update password', 'error');
                              }
                            }}
                            className="w-full bg-slate-900 text-white py-2 rounded-xl font-bold hover:bg-slate-800 transition-colors"
                          >
                            Update Password
                          </button>
                        </div>
                      </div>

                      <div className="pt-4">
                        <button 
                          onClick={generateSoftwareGuidelinePDF}
                          className="inline-flex items-center gap-2 text-slate-500 text-sm font-medium hover:text-slate-900 transition-colors"
                        >
                          <FileText className="w-4 h-4" />
                          View Software Guidelines
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm mt-8 border-t-4 border-t-red-600">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
                      <h4 className="text-xl font-black text-slate-900 flex items-center gap-3">
                        <BookOpen className="w-6 h-6 text-red-600" />
                        Organizational Role Reference Manual
                      </h4>
                      <button 
                        onClick={() => generateRoleManualPDF()}
                        className="px-6 py-3 bg-red-600 text-white rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-red-700 transition-all flex items-center gap-2 shadow-xl shadow-red-200"
                      >
                        <FileText className="w-4 h-4" /> Download manual PDF
                      </button>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                      {Object.entries(ROLE_DEFINITIONS).map(([key, role]) => (
                        <div key={key} className={`p-6 rounded-3xl border transition-all ${key === 'supervisor' ? 'bg-red-50 border-red-200 ring-2 ring-red-100' : 'bg-slate-50 border-slate-100'}`}>
                          <div className="flex justify-between items-start mb-4">
                            <div>
                               <h5 className={`font-black uppercase tracking-tight text-lg ${key === 'supervisor' ? 'text-red-900' : 'text-slate-900'}`}>{role.title}</h5>
                               <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">System Permissions: Level {key === 'admin' ? '5' : (key === 'supervisor' ? '4' : '2')}</p>
                            </div>
                            {key === 'supervisor' && <span className="bg-red-600 text-white text-[10px] px-3 py-1 rounded-full font-black uppercase shadow-lg shadow-red-200">Key Supervisor</span>}
                          </div>
                          <p className="text-sm text-slate-600 mb-6 leading-relaxed font-medium italic">"{role.description}"</p>
                          <div className="space-y-4">
                             <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-white pb-2">Core Responsibilities</p>
                             <ul className="space-y-3">
                                {role.duties.map((duty, idx) => (
                                  <li key={idx} className="flex items-start gap-3 text-xs text-slate-700 font-bold">
                                    <div className={`w-1.5 h-1.5 rounded-full mt-1.5 shrink-0 ${key === 'supervisor' ? 'bg-red-600' : 'bg-slate-400'}`} />
                                    {duty}
                                  </li>
                                ))}
                             </ul>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
        </div>
      </main>

      {/* Modals & Notifications */}
      {notification && (
        <Toast 
          message={notification.message} 
          type={notification.type} 
          onClose={() => setNotification(null)} 
        />
      )}

      {/* Low Stock Detailed Modal */}
      <Modal 
        title="Low Stock Inventory Alerts" 
        isOpen={isLowStockModalOpen} 
        onClose={() => setIsLowStockModalOpen(false)}
      >
        <div className="space-y-6">
          <div className="flex justify-between items-center bg-rose-50 p-6 rounded-3xl border border-rose-100 mb-4">
             <div>
                <p className="text-2xl font-black text-rose-600">{stats?.lowStockAlerts || 0}</p>
                <p className="text-[10px] font-black text-rose-400 uppercase tracking-widest">Critical Items Need Restock</p>
             </div>
             <button 
               onClick={() => generateLowStockPDF()}
               className="bg-rose-600 text-white px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-rose-700 transition-all flex items-center gap-2"
             >
               <Download className="w-4 h-4" /> Export PDF
             </button>
          </div>

          <div className="max-h-[50vh] overflow-y-auto space-y-3 pr-2 scrollbar-hide">
            {services.filter(s => s.stock <= s.minimum_stock).length === 0 ? (
              <div className="py-10 text-center">
                 <CheckCircle2 className="w-12 h-12 text-emerald-300 mx-auto mb-2" />
                 <p className="text-slate-500 font-bold">All stock levels are healthy.</p>
              </div>
            ) : (
              services.filter(s => s.stock <= s.minimum_stock).map(item => (
                <div key={item.id} className="p-4 bg-white rounded-2xl border border-slate-100 flex items-center justify-between group hover:border-red-200 transition-all">
                  <div>
                    <h5 className="font-bold text-slate-900 group-hover:text-red-600 transition-colors">{item.name}</h5>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter">Current: {item.stock} {item.unit} • Threshold: {item.minimum_stock} {item.unit}</p>
                  </div>
                  <button 
                    onClick={() => {
                        setSelectedRestockItem({
                          id: item.id,
                          item_name: item.name,
                          stock: item.stock,
                          minimum_stock: item.minimum_stock,
                          unit: item.unit || 'pcs'
                        } as any);
                        setRestockAmount(0);
                        setIsRestockModalOpen(true);
                        setIsLowStockModalOpen(false);
                    }}
                    className="p-2 bg-slate-50 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
                  >
                    <ArrowUpCircle className="w-6 h-6" />
                  </button>
                </div>
              ))
            )}
          </div>
          
          <button 
            onClick={() => setIsLowStockModalOpen(false)}
            className="w-full bg-slate-100 text-slate-600 py-4 rounded-2xl font-black uppercase tracking-widest hover:bg-slate-200 transition-all"
          >
            Done
          </button>
        </div>
      </Modal>

      {/* Restock Modal */}
      <Modal 
        title={`Restock: ${selectedRestockItem?.item_name}`} 
        isOpen={isRestockModalOpen} 
        onClose={() => {
          setIsRestockModalOpen(false);
          setSelectedRestockItem(null);
        }}
      >
        <div className="space-y-6">
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 flex justify-between items-center">
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Current Level</p>
              <p className="text-xl font-bold text-slate-900">{selectedRestockItem?.stock} {selectedRestockItem?.unit}</p>
            </div>
            <div className="text-right">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Min. Alert</p>
              <p className="text-xl font-bold text-rose-500">{selectedRestockItem?.minimum_stock} {selectedRestockItem?.unit}</p>
            </div>
          </div>

          <div>
            <label className="block text-sm font-black text-slate-900 mb-2">Restock Quantity ({selectedRestockItem?.unit})</label>
            <input 
              type="number"
              className="w-full px-6 py-4 rounded-2xl border-2 border-slate-100 focus:border-red-500 outline-none font-bold text-lg text-slate-900"
              placeholder="0"
              value={restockAmount || ''}
              onChange={(e) => setRestockAmount(parseInt(e.target.value) || 0)}
              autoFocus
            />
            <div className="flex gap-2 mt-3">
              {[10, 50, 100, 500].map(val => (
                <button 
                  key={val}
                  onClick={() => setRestockAmount(val)}
                  className="px-3 py-1 bg-slate-100 rounded-lg text-xs font-bold text-slate-600 hover:bg-red-50 hover:text-red-600 transition-colors"
                >
                  +{val}
                </button>
              ))}
            </div>
          </div>

          <button 
            onClick={async () => {
              if (restockAmount <= 0) return;
              if (user!.role === 'receptionist') {
                showNotification('Receptionists are not allowed to restock', 'error');
                return;
              }
              try {
                await firebaseService.restock(selectedRestockItem!.id, restockAmount, user!.id, user!.full_name);
                showNotification(`Successfully added ${restockAmount} to stock`, 'success');
                setIsRestockModalOpen(false);
                setSelectedRestockItem(null);
                fetchDashboardData();
              } catch (err) {
                showNotification('Restock failed', 'error');
              }
            }}
            className="w-full bg-red-600 text-white py-4 rounded-2xl font-black uppercase tracking-widest hover:bg-red-700 transition-all shadow-xl shadow-red-100"
          >
            Confirm Restock
          </button>
        </div>
      </Modal>

      <Modal 
        title="Add New Customer" 
        isOpen={isCustomerModalOpen} 
        onClose={() => setIsCustomerModalOpen(false)}
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Full Name</label>
            <input 
              type="text" 
              className="w-full px-4 py-2 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-red-500"
              value={newCustomer.name}
              onChange={e => setNewCustomer({...newCustomer, name: e.target.value})}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Phone Number</label>
            <input 
              type="text" 
              className="w-full px-4 py-2 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-red-500"
              value={newCustomer.phone}
              onChange={e => setNewCustomer({...newCustomer, phone: e.target.value})}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Address</label>
            <input 
              type="text" 
              className="w-full px-4 py-2 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-red-500"
              value={newCustomer.address}
              onChange={e => setNewCustomer({...newCustomer, address: e.target.value})}
            />
          </div>
          <button 
            onClick={async () => {
              if (!newCustomer.name || !newCustomer.phone) return;
              await firebaseService.addCustomer(newCustomer);
              setIsCustomerModalOpen(false);
              setNewCustomer({ name: '', phone: '', address: '' });
              fetchDashboardData();
              showNotification('Customer added successfully!', 'success');
            }}
            className="w-full bg-red-600 text-white py-3 rounded-xl font-bold hover:bg-red-700 transition-colors"
          >
            Add Customer
          </button>
        </div>
      </Modal>

      <Modal 
        title={editingQuotationId ? "Edit Saved Quotation" : "Interactive Quotation Builder"} 
        isOpen={isQuotationModalOpen} 
        onClose={() => {
          setIsQuotationModalOpen(false);
          setEditingQuotationId(null);
          // Clean builder states
          setQuoteItemServiceId('');
          setQuoteItemDesc('');
          setQuoteItemQty(1);
          setQuoteItemPrice(0);
          setQuoteItemUom('pcs');
        }}
      >
        <div className="space-y-6 max-h-[80vh] overflow-y-auto pr-2">
          {/* Customer Selection Block */}
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 space-y-3">
            <div className="flex justify-between items-center mb-1">
              <h4 className="font-extrabold text-xs text-slate-800 uppercase tracking-widest">1. Customer Identification</h4>
              <span className="text-[10px] font-bold text-red-500 bg-red-50 px-2 py-0.5 rounded-full">CRM Connected</span>
            </div>
            
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1">Select from Database (Auto-Fill)</label>
              <select 
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-sm outline-none focus:ring-2 focus:ring-red-500 font-medium text-slate-700"
                value=""
                onChange={(e) => {
                  const custId = e.target.value;
                  if (!custId) return;
                  const c = customers.find(item => item.id === custId);
                  if (c) {
                    setQuotationData({
                      ...quotationData,
                      name: c.name,
                      phone: c.phone || '',
                      address: c.address || 'Juba, South Sudan'
                    });
                  }
                }}
              >
                <option value="">-- Choose Existing Client (Optional) --</option>
                {[...(customers || [])].sort((a,b)=>(a.name || '').localeCompare(b.name || '')).map(c => (
                  <option key={c.id} value={c.id}>{c.name} ({c.phone || 'No Phone'})</option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">Client Name *</label>
                <input 
                  type="text" 
                  placeholder="e.g. United Nations OCHA Juba"
                  className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-red-500 text-slate-800 font-semibold"
                  value={quotationData.name}
                  onChange={e => setQuotationData({...quotationData, name: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">Client Address</label>
                <input 
                  type="text" 
                  placeholder="e.g. Juba, South Sudan"
                  className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-red-500 text-slate-700"
                  value={quotationData.address}
                  onChange={e => setQuotationData({...quotationData, address: e.target.value})}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">Phone Number</label>
                <input 
                  type="text" 
                  placeholder="e.g. +211 9..."
                  className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-red-500 text-slate-700"
                  value={quotationData.phone || ''}
                  onChange={e => setQuotationData({...quotationData, phone: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">Email Address</label>
                <input 
                  type="email" 
                  placeholder="e.g. procurement@domain.com"
                  className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-red-500 text-slate-700"
                  value={quotationData.email || ''}
                  onChange={e => setQuotationData({...quotationData, email: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">Attention Person</label>
                <input 
                  type="text" 
                  placeholder="e.g. Attn: Logistics Officer"
                  className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-red-500 text-slate-700"
                  value={quotationData.attn || ''}
                  onChange={e => setQuotationData({...quotationData, attn: e.target.value})}
                />
              </div>
            </div>
          </div>

          {/* Item Builder Control Grid */}
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 space-y-4">
            <h4 className="font-extrabold text-xs text-slate-800 uppercase tracking-widest block mb-1">2. Add Services / Custom Items</h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">Quick-Add Predetermined Service</label>
                <select 
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-sm outline-none focus:ring-2 focus:ring-red-500 text-slate-700 font-medium"
                  value={quoteItemServiceId}
                  onChange={(e) => {
                    const sId = e.target.value;
                    setQuoteItemServiceId(sId);
                    if (sId) {
                      const s = services.find(x => x.id === sId);
                      if (s) {
                        setQuoteItemDesc(s.name);
                        setQuoteItemPrice(Math.round(usdToSsp(s.price || 0)));
                        setQuoteItemUom(s.unit || 'pcs');
                      }
                    }
                  }}
                >
                  <option value="">-- Custom (Not in Database) --</option>
                  {[...(services || [])].sort((a,b)=> (a.name || '').localeCompare(b.name || '')).map(s => (
                    <option key={s.id} value={s.id}>{s.name} ({formatCurrency(usdToSsp(s.price))})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">Item Description / Specifications *</label>
                <input 
                  type="text" 
                  placeholder="e.g. Outdoor PVC Flex Printing 4mx3m with eyelets"
                  className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-red-500 text-slate-800 font-medium"
                  value={quoteItemDesc}
                  onChange={e => setQuoteItemDesc(e.target.value)}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">UoM</label>
                <select 
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs outline-none focus:ring-2 focus:ring-red-500 text-slate-700 font-bold"
                  value={quoteItemUom}
                  onChange={e => setQuoteItemUom(e.target.value)}
                >
                  <option value="pcs">pcs (Pieces)</option>
                  <option value="meters">m (Meters)</option>
                  <option value="rolls">rolls</option>
                  <option value="sq ft">sq ft</option>
                  <option value="sq m">sq m</option>
                  <option value="books">books</option>
                  <option value="reams">reams</option>
                  <option value="packs">packs</option>
                  <option value="box">box</option>
                  <option value="hours">hours</option>
                  <option value="custom">Custom Text...</option>
                </select>
                {quoteItemUom === 'custom' && (
                  <input 
                    type="text"
                    placeholder="Enter unit"
                    className="w-full px-2 py-1 text-xs border rounded-lg mt-1 outline-none"
                    onChange={e => setQuoteItemUom(e.target.value)}
                  />
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">Quantity</label>
                <input 
                  type="number" 
                  min="1"
                  className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-red-500 font-bold"
                  value={quoteItemQty}
                  onChange={e => setQuoteItemQty(Math.max(1, parseInt(e.target.value) || 1))}
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">Unit Price ({currency})</label>
                <input 
                  type="number" 
                  min="0"
                  step="any"
                  className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-red-500 font-bold text-slate-900"
                  value={quoteItemPrice}
                  onChange={e => setQuoteItemPrice(parseFloat(e.target.value) || 0)}
                />
              </div>

              <div className="flex items-end">
                <button 
                  type="button"
                  onClick={() => {
                    if (!quoteItemDesc.trim()) {
                      showNotification('Item description is required!', 'info');
                      return;
                    }
                    if (quoteItemPrice <= 0) {
                      showNotification('Please enter a valid price!', 'info');
                      return;
                    }
                    
                    const newItem = {
                      id: Math.random().toString(36).substring(2, 9),
                      name: quoteItemDesc,
                      uom: quoteItemUom,
                      quantity: quoteItemQty,
                      price: quoteItemPrice
                    };

                    setQuotationData({
                      ...quotationData,
                      items: [...quotationData.items, newItem]
                    });

                    // Clear builder items block
                    setQuoteItemServiceId('');
                    setQuoteItemDesc('');
                    setQuoteItemQty(1);
                    setQuoteItemPrice(0);
                    setQuoteItemUom('pcs');
                    showNotification('Item added to quotation draft!', 'success');
                  }}
                  className="w-full bg-slate-900 text-white font-bold text-xs py-2.5 rounded-xl hover:bg-slate-800 transition-colors flex items-center justify-center gap-1.5 shadow-md"
                >
                  <Plus className="w-4 h-4" /> Add Item
                </button>
              </div>
            </div>
          </div>

          {/* Draft Items List */}
          <div className="border border-slate-100 rounded-2xl overflow-hidden shadow-sm">
            <div className="bg-slate-500 text-white px-4 py-2 flex justify-between items-center text-xs font-bold uppercase tracking-wider">
              <span>Added Items ({quotationData.items.length})</span>
              <span>Draft Board</span>
            </div>
            
            {quotationData.items.length === 0 ? (
              <div className="p-8 text-center text-sm text-slate-400 font-medium bg-white">
                No items added yet. Use the item generator controls above to build the quotation list.
              </div>
            ) : (
              <div className="divide-y divide-slate-100 bg-white">
                {quotationData.items.map((item, idx) => (
                  <div key={item.id} className="p-3.5 flex justify-between items-start gap-3 hover:bg-slate-50 transition-colors">
                    <div className="flex-1">
                      <p className="text-xs font-semibold text-slate-400"># {idx + 1}</p>
                      <p className="text-sm font-bold text-slate-800">{item.name}</p>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {item.quantity} {item.uom} • {formatCurrency(item.price)} each
                      </p>
                    </div>
                    <div className="text-right flex items-center gap-3">
                      <p className="text-sm font-black text-slate-950 font-mono">
                        {formatCurrency(item.quantity * item.price)}
                      </p>
                      <button 
                        type="button"
                        onClick={() => {
                          setQuotationData({
                            ...quotationData,
                            items: quotationData.items.filter(i => i.id !== item.id)
                          });
                          showNotification('Item removed', 'info');
                        }}
                        className="p-1 px-2 text-[10px] font-bold text-rose-500 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 rounded-lg transition-colors border border-rose-100"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Pricing Adjustments: Discount, Tax & Summary */}
          {quotationData.items.length > 0 && (
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 space-y-4">
              <h4 className="font-extrabold text-xs text-slate-800 uppercase tracking-widest block mb-1">3. Financial Modifiers</h4>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Discount input */}
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1">Apply Discount</label>
                  <div className="flex gap-1.5">
                    <input 
                      type="number" 
                      min="0"
                      placeholder="0"
                      className="w-full px-3 py-1.5 text-xs rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-red-500 font-bold"
                      value={quotationData.discountVal || ''}
                      onChange={e => setQuotationData({...quotationData, discountVal: parseFloat(e.target.value) || 0})}
                    />
                    <select 
                      className="px-2 py-1.5 text-xs rounded-xl border border-slate-200 bg-white font-bold text-slate-700"
                      value={quotationData.discountType}
                      onChange={e => setQuotationData({...quotationData, discountType: e.target.value as 'flat' | 'percent'})}
                    >
                      <option value="flat">Value</option>
                      <option value="percent">% PCT</option>
                    </select>
                  </div>
                </div>

                {/* Tax Input */}
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1">VAT / Tax Rate (%)</label>
                  <input 
                    type="number" 
                    min="0"
                    placeholder="e.g. 5"
                    className="w-full px-3 py-1.5 text-xs rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-red-500 font-bold"
                    value={quotationData.taxRate || ''}
                    onChange={e => setQuotationData({...quotationData, taxRate: parseFloat(e.target.value) || 0})}
                  />
                </div>

                {/* Summary calculation display */}
                <div className="bg-white p-3 rounded-xl border border-slate-200 flex flex-col justify-center space-y-0.5 shadow-inner">
                  {(() => {
                    const sub = quotationData.items.reduce((sum, item) => sum + (item.quantity * item.price), 0);
                    let disc = 0;
                    if (quotationData.discountType === 'percent') {
                      disc = sub * (quotationData.discountVal || 0) / 100;
                    } else {
                      disc = quotationData.discountVal || 0;
                    }
                    const tax = (sub - disc) * (quotationData.taxRate || 0) / 100;
                    const finalG = sub - disc + tax;
                    return (
                      <>
                        <div className="flex justify-between text-[11px] font-medium text-slate-500">
                          <span>Subtotal:</span>
                          <span className="font-mono">{formatCurrency(sub)}</span>
                        </div>
                        {disc > 0 && (
                          <div className="flex justify-between text-[11px] font-medium text-rose-500">
                            <span>Discount:</span>
                            <span className="font-mono">-{formatCurrency(disc)}</span>
                          </div>
                        )}
                        {tax > 0 && (
                          <div className="flex justify-between text-[11px] font-medium text-slate-500">
                            <span>VAT Tax:</span>
                            <span className="font-mono">+{formatCurrency(tax)}</span>
                          </div>
                        )}
                        <div className="flex justify-between text-xs font-black text-slate-900 border-t pt-1 mt-1">
                          <span>ESTIMATED TOTAL:</span>
                          <span className="font-mono text-red-650">{formatCurrency(finalG)}</span>
                        </div>
                      </>
                    );
                  })()}
                </div>
              </div>
            </div>
          )}

          {/* Quotation Metadata (Quote No, Date, Validity, Payment Terms, Turnaround) */}
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 space-y-3">
            <h4 className="font-extrabold text-xs text-slate-800 uppercase tracking-widest block mb-1">4. Letterhead Details, Validity & Delivery Terms</h4>
            
            <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">Quote No. (Pre-field)</label>
                <input 
                  type="text" 
                  className="w-full px-3 py-1.5 text-xs rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-red-500 font-mono text-center font-bold"
                  value={quotationData.quotNo}
                  onChange={e => setQuotationData({...quotationData, quotNo: e.target.value})}
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">Issue Date</label>
                <input 
                  type="date" 
                  className="w-full px-3 py-1.5 text-xs rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-red-500 text-center font-semibold"
                  value={quotationData.date || ''}
                  onChange={e => handleQuotationDateChange(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">Valid For (Days)</label>
                <input 
                  type="number" 
                  min="1"
                  className="w-full px-3 py-1.5 text-xs rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-red-500 text-center font-bold"
                  value={quotationData.validityDays}
                  onChange={e => updateQuotationMetadata({ validityDays: parseInt(e.target.value) || 14 })}
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">Payment Conditions</label>
                <select 
                  className="w-full px-3 py-1.5 text-xs rounded-xl border border-slate-200 bg-white outline-none text-slate-700 font-semibold"
                  value={['75% Deposit, 25% on Delivery', '50% Deposit, 50% on Delivery', '100% Full Upfront Payment', 'Cash / Pay on Delivery', 'Standard Corporate Net30'].includes(quotationData.paymentTerms || '') ? quotationData.paymentTerms : 'Custom Negotiated Terms'}
                  onChange={e => {
                    const val = e.target.value;
                    if (val === 'Custom Negotiated Terms') {
                      updateQuotationMetadata({ paymentTerms: '' });
                    } else {
                      updateQuotationMetadata({ paymentTerms: val });
                    }
                  }}
                >
                  <option value="75% Deposit, 25% on Delivery">75% Deposit, 25% on Delivery</option>
                  <option value="50% Deposit, 50% on Delivery">50% Deposit, 50% on Delivery</option>
                  <option value="100% Full Upfront Payment">100% Full Upfront Payment</option>
                  <option value="Cash / Pay on Delivery">Cash / Pay on Delivery</option>
                  <option value="Standard Corporate Net30">Corporate Net 30 Days</option>
                  <option value="Custom Negotiated Terms">Custom Negotiated Terms (Edit Below)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">Turnaround Delivery</label>
                <select 
                  className="w-full px-3 py-1.5 text-xs rounded-xl border border-slate-200 bg-white outline-none text-slate-700 font-semibold"
                  value={['3-5 working days', '1-2 working days', '5-7 working days', 'Same day delivery'].includes(quotationData.turnaroundDelivery || '') ? quotationData.turnaroundDelivery : 'Custom Delivery Leadtime'}
                  onChange={e => {
                    const val = e.target.value;
                    if (val === 'Custom Delivery Leadtime') {
                      updateQuotationMetadata({ turnaroundDelivery: '' });
                    } else {
                      updateQuotationMetadata({ turnaroundDelivery: val });
                    }
                  }}
                >
                  <option value="3-5 working days">3-5 working days</option>
                  <option value="1-2 working days">1-2 working days (Express)</option>
                  <option value="5-7 working days">5-7 working days</option>
                  <option value="Same day delivery">Same day delivery</option>
                  <option value="Custom Delivery Leadtime">Custom Delivery Leadtime (Edit Below)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">Client Deposit (SSP)</label>
                <input 
                  type="number" 
                  min="0"
                  placeholder="e.g. 50000"
                  className="w-full px-3 py-1.5 text-xs rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-red-500 text-center font-bold text-slate-800"
                  value={quotationData.deposit || ''}
                  onChange={e => updateQuotationMetadata({ deposit: e.target.value === '' ? '' : (Number(e.target.value) || 0) })}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {!['75% Deposit, 25% on Delivery', '50% Deposit, 50% on Delivery', '100% Full Upfront Payment', 'Cash / Pay on Delivery', 'Standard Corporate Net30'].includes(quotationData.paymentTerms || '') && (
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1">Describe Custom Payment Terms</label>
                  <input 
                    type="text"
                    value={quotationData.paymentTerms || ''}
                    placeholder="e.g. 60% with order, 40% after testing"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-red-500 font-semibold text-slate-700"
                    onChange={e => updateQuotationMetadata({ paymentTerms: e.target.value })}
                  />
                </div>
              )}

              {!['3-5 working days', '1-2 working days', '5-7 working days', 'Same day delivery'].includes(quotationData.turnaroundDelivery || '') && (
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1">Describe Custom Turnaround Delivery</label>
                  <input 
                    type="text"
                    value={quotationData.turnaroundDelivery || ''}
                    placeholder="e.g. 2-3 working days"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-red-500 font-semibold text-slate-700"
                    onChange={e => updateQuotationMetadata({ turnaroundDelivery: e.target.value })}
                  />
                </div>
              )}
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1">Terms & Validity Remarks (Appears in Left Footer panel - Auto Updates above)</label>
              <textarea 
                rows={3}
                placeholder="Write customized footnotes or delivery lead time guarantees..."
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-red-500 placeholder-slate-300 font-semibold text-slate-700"
                value={quotationData.notes}
                onChange={e => setQuotationData({...quotationData, notes: e.target.value})}
              ></textarea>
            </div>
          </div>

          {/* Action Launcher Buttons */}
          <div className="flex gap-3 border-t pt-4">
            <button 
              type="button"
              disabled={!quotationData.name || quotationData.items.length === 0}
              onClick={async () => {
                if (!quotationData.name || quotationData.items.length === 0) return;
                setLoading(true);
                try {
                  const itemsWithDefaultVal = (quotationData.items || []).map((it: any) => ({
                    ...it,
                    serviceId: it.serviceId || it.service_id || `manual-${Date.now()}`
                  }));

                  const existingQuote = editingQuotationId ? quotations.find(q => q.id === editingQuotationId) : null;

                  const docToSave: any = {
                    quotNo: quotationData.quotNo,
                    name: quotationData.name,
                    address: quotationData.address || 'Juba, South Sudan',
                    phone: quotationData.phone || '',
                    email: quotationData.email || '',
                    attn: quotationData.attn || '',
                    date: quotationData.date,
                    validityDays: Number(quotationData.validityDays) || 14,
                    paymentTerms: quotationData.paymentTerms || '75% Deposit, 25% on Delivery',
                    turnaroundDelivery: quotationData.turnaroundDelivery || '3-5 working days',
                    discountVal: Number(quotationData.discountVal) || 0,
                    discountType: quotationData.discountType || 'flat',
                    taxRate: Number(quotationData.taxRate) || 0,
                    notes: quotationData.notes || '',
                    items: itemsWithDefaultVal,
                    status: existingQuote?.status || 'sent',
                    created_by: existingQuote?.created_by || user?.id || 'staff',
                    created_by_name: existingQuote?.created_by_name || user?.full_name || user?.username || 'Staff',
                    deposit: Number(quotationData.deposit) || 0,
                    usd_rate: existingQuote?.usd_rate || Number(usdRate)
                  };

                  if (editingQuotationId) {
                    await firebaseService.updateQuotation(editingQuotationId, docToSave);
                    await generateQuotationPDF({ id: editingQuotationId, ...docToSave }, true);
                    setIsQuotationModalOpen(false);
                    setEditingQuotationId(null);
                    showNotification('Quotation updated in database and sent to printer!', 'success');
                  } else {
                    await firebaseService.createQuotation(docToSave);
                    await generateQuotationPDF(docToSave, true);
                    setIsQuotationModalOpen(false);
                    showNotification('Quotation saved to database and sent to printer!', 'success');
                  }
                } catch (err) {
                  showNotification('Error saving quotation', 'error');
                } finally {
                  setLoading(false);
                }
              }}
              className="flex-1 bg-red-600 text-white py-3.5 rounded-xl text-sm font-black uppercase tracking-wider hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 shadow-lg shadow-red-100 animate-none"
            >
              <Printer className="w-4 h-4" /> {editingQuotationId ? "Update & Direct Print" : "Save & Direct Print"}
            </button>
            <button 
              type="button"
              disabled={!quotationData.name || quotationData.items.length === 0}
              onClick={async () => {
                if (!quotationData.name || quotationData.items.length === 0) return;
                setLoading(true);
                try {
                  const itemsWithDefaultVal = (quotationData.items || []).map((it: any) => ({
                    ...it,
                    serviceId: it.serviceId || it.service_id || `manual-${Date.now()}`
                  }));

                  const existingQuote = editingQuotationId ? quotations.find(q => q.id === editingQuotationId) : null;

                  const docToSave: any = {
                    quotNo: quotationData.quotNo,
                    name: quotationData.name,
                    address: quotationData.address || 'Juba, South Sudan',
                    phone: quotationData.phone || '',
                    email: quotationData.email || '',
                    attn: quotationData.attn || '',
                    date: quotationData.date,
                    validityDays: Number(quotationData.validityDays) || 14,
                    paymentTerms: quotationData.paymentTerms || '75% Deposit, 25% on Delivery',
                    turnaroundDelivery: quotationData.turnaroundDelivery || '3-5 working days',
                    discountVal: Number(quotationData.discountVal) || 0,
                    discountType: quotationData.discountType || 'flat',
                    taxRate: Number(quotationData.taxRate) || 0,
                    notes: quotationData.notes || '',
                    items: itemsWithDefaultVal,
                    status: existingQuote?.status || 'draft',
                    created_by: existingQuote?.created_by || user?.id || 'staff',
                    created_by_name: existingQuote?.created_by_name || user?.full_name || user?.username || 'Staff',
                    deposit: Number(quotationData.deposit) || 0,
                    usd_rate: existingQuote?.usd_rate || Number(usdRate)
                  };

                  if (editingQuotationId) {
                    await firebaseService.updateQuotation(editingQuotationId, docToSave);
                    await generateQuotationPDF({ id: editingQuotationId, ...docToSave }, false);
                    setIsQuotationModalOpen(false);
                    setEditingQuotationId(null);
                    showNotification('Quotation updated in database and downloaded as PDF!', 'success');
                  } else {
                    await firebaseService.createQuotation(docToSave);
                    await generateQuotationPDF(docToSave, false);
                    setIsQuotationModalOpen(false);
                    showNotification('Quotation saved to database and downloaded as PDF!', 'success');
                  }
                } catch (err) {
                  showNotification('Error saving quotation', 'error');
                } finally {
                  setLoading(false);
                }
              }}
              className="flex-1 bg-slate-900 text-white py-3.5 rounded-xl text-sm font-black uppercase tracking-wider hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 shadow-lg shadow-slate-200"
            >
              <FileText className="w-4 h-4" /> {editingQuotationId ? "Update & Download PDF" : "Save & Download PDF"}
            </button>
          </div>
        </div>
      </Modal>

      <Modal 
        title="Record Expense" 
        isOpen={isExpenseModalOpen} 
        onClose={() => setIsExpenseModalOpen(false)}
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Item/Description</label>
            <input 
              type="text" 
              className="w-full px-4 py-2 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-red-500"
              value={newExpense.item}
              onChange={e => setNewExpense({...newExpense, item: e.target.value})}
              placeholder="e.g., Ink cartridges, Paper rolls"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Amount (SSP)</label>
            <input 
              type="number" 
              className="w-full px-4 py-2 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-red-500"
              value={newExpense.amount}
              onChange={e => setNewExpense({...newExpense, amount: Number(e.target.value)})}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Category</label>
            <select 
              className="w-full px-4 py-2 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-red-500"
              value={newExpense.category}
              onChange={e => setNewExpense({...newExpense, category: e.target.value})}
            >
              <option value="Materials">Materials</option>
              <option value="Utilities">Utilities</option>
              <option value="Rent">Rent</option>
              <option value="Salary">Salary</option>
              <option value="Allowance">Allowance</option>
              <option value="Fuel">Fuel</option>
              <option value="Transport">Transport</option>
              <option value="Maintenance">Maintenance</option>
              <option value="Other">Other</option>
            </select>
          </div>
          {newExpense.category === 'Transport' && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">From</label>
                <input 
                  type="text"
                  className="w-full px-4 py-2 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-red-500"
                  value={newExpense.transport_from || ''}
                  onChange={e => setNewExpense({...newExpense, transport_from: e.target.value})}
                  placeholder="Starting point"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">To</label>
                <input 
                  type="text"
                  className="w-full px-4 py-2 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-red-500"
                  value={newExpense.transport_to || ''}
                  onChange={e => setNewExpense({...newExpense, transport_to: e.target.value})}
                  placeholder="Destination"
                />
              </div>
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Linked Staff Member (Optional)</label>
            <select 
              className="w-full px-4 py-2 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-red-500"
              value={newExpense.staff_id || ""}
              onChange={e => {
                const sId = e.target.value;
                const foundUser = users.find(u => u.id === sId);
                setNewExpense({
                  ...newExpense, 
                  staff_id: sId,
                  staff_name: foundUser ? foundUser.full_name : ''
                });
              }}
            >
              <option value="">None (General/Corporate)</option>
              {users.map(u => (
                <option key={u.id} value={u.id}>{u.full_name} ({u.role})</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Approving Personnel</label>
            <select 
              className="w-full px-4 py-2 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-red-500"
              value={approverId}
              onChange={e => setApproverId(e.target.value)}
            >
              <option value="">Select Approver...</option>
              {users.filter(u => ['admin', 'supervisor'].includes(u.role)).map(u => (
                <option key={u.id} value={u.id}>{u.full_name} ({u.role})</option>
              ))}
            </select>
          </div>
          <button 
            onClick={async () => {
              if (!newExpense.item || newExpense.amount <= 0 || !approverId) {
                showNotification('Please fill all fields including approver', 'error');
                return;
              }
              try {
                const isMaster = user?.staff_id === 'MASTER' || user?.email === 'tekkisandereagan@gmail.com' || user?.email === 'kulyakosukusandereagan@gmail.com';
                const staffName = isMaster ? 'System' : (user?.full_name || user?.username || 'Staff');
                await firebaseService.recordExpense({
                  ...newExpense, 
                  recorded_by: user!.id, 
                  recorder_name: staffName,
                  approver_id: approverId
                });
                setIsExpenseModalOpen(false);
                setNewExpense({ item: '', amount: 0, category: 'Materials', staff_id: '', staff_name: '' });
                setApproverId('');
                fetchDashboardData();
                showNotification('Expense recorded and pending approval!', 'success');
              } catch (err) {
                console.error("Expense error:", err);
                showNotification('Failed to record expense. Please try again.', 'error');
              }
            }}
            className="w-full bg-rose-600 text-white py-3 rounded-xl font-bold hover:bg-rose-700 transition-colors mt-4"
          >
            Record Expense
          </button>
        </div>
      </Modal>

      <Modal 
        title="Record Incoming Funds" 
        isOpen={isFundingModalOpen} 
        onClose={() => setIsFundingModalOpen(false)}
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Funding Source</label>
            <input 
              type="text" 
              className="w-full px-4 py-2 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-red-500"
              value={newFunding.source}
              onChange={e => setNewFunding({...newFunding, source: e.target.value})}
              placeholder="e.g., Owner Investment, Bank Loan"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Amount (SSP)</label>
            <input 
              type="number" 
              className="w-full px-4 py-2 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-red-500"
              value={newFunding.amount}
              onChange={e => setNewFunding({...newFunding, amount: Number(e.target.value)})}
            />
          </div>
          <button 
            onClick={async () => {
              if (!newFunding.source || !newFunding.source.trim()) {
                showNotification('Please enter a funding source', 'error');
                return;
              }
              const amount = Number(newFunding.amount);
              if (isNaN(amount) || amount <= 0) {
                showNotification('Funding amount must be greater than zero', 'error');
                return;
              }
              try {
                const isMaster = user?.staff_id === 'MASTER' || user?.email === 'tekkisandereagan@gmail.com' || user?.email === 'kulyakosukusandereagan@gmail.com';
                const staffName = isMaster ? 'System' : (user?.full_name || user?.username || 'Staff');
                await firebaseService.recordFunding({
                  source: newFunding.source.trim(),
                  amount: amount,
                  recorded_by: user?.id || 'system',
                  recorder_name: staffName
                });
                setIsFundingModalOpen(false);
                setNewFunding({ source: '', amount: 0 });
                fetchDashboardData();
                showNotification('Funding record added!', 'success');
              } catch (err: any) {
                console.error("Funding error:", err);
                showNotification(err.message || 'Failed to record funding. Please try again.', 'error');
              }
            }}
            className="w-full bg-emerald-600 text-white py-3 rounded-xl font-bold hover:bg-emerald-700 transition-colors mt-4"
          >
            Record Funding
          </button>
        </div>
      </Modal>

      <Modal 
        title="Register New Staff" 
        isOpen={isStaffModalOpen} 
        onClose={() => setIsStaffModalOpen(false)}
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Full Name</label>
            <input 
              type="text" 
              className="w-full px-4 py-2 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-red-500"
              value={newStaff.fullName}
              onChange={e => setNewStaff({...newStaff, fullName: e.target.value})}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Username</label>
            <input 
              type="text" 
              className="w-full px-4 py-2 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-red-500"
              value={newStaff.username}
              onChange={e => setNewStaff({...newStaff, username: e.target.value})}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Gmail Address</label>
            <input 
              type="email" 
              className="w-full px-4 py-2 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-red-500"
              value={newStaff.email}
              onChange={e => setNewStaff({...newStaff, email: e.target.value})}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Position</label>
            <input 
              type="text" 
              className="w-full px-4 py-2 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-red-500"
              value={newStaff.position}
              onChange={e => setNewStaff({...newStaff, position: e.target.value})}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Role</label>
            <select 
              className="w-full px-4 py-2 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-red-500"
              value={newStaff.role}
              onChange={e => setNewStaff({...newStaff, role: e.target.value as Role})}
            >
              <option value="receptionist">Receptionist</option>
              <option value="operator">Operator</option>
              <option value="designer">Designer</option>
              <option value="supervisor">Supervisor</option>
              <option value="sales_marketing">Sales & Marketing</option>
              <option value="admin">Admin</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Initial Password</label>
            <input 
              type="password" 
              className="w-full px-4 py-2 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-red-500"
              value={newStaff.password}
              onChange={e => setNewStaff({...newStaff, password: e.target.value})}
              placeholder="Leave empty for 'password123'"
            />
          </div>
          <button 
            onClick={async () => {
              if (!newStaff.fullName || !newStaff.username) {
                showNotification('Full name and username are required', 'error');
                return;
              }
              if (!newStaff.email || !newStaff.email.trim()) {
                showNotification('Gmail address is required', 'error');
                return;
              }
              const cleanEmail = newStaff.email.trim().toLowerCase();
              if (!cleanEmail.endsWith('@gmail.com')) {
                showNotification('A valid Gmail address ending with @gmail.com is required!', 'error');
                return;
              }
              try {
                const result: any = await firebaseService.registerStaff({
                  full_name: newStaff.fullName,
                  username: newStaff.username,
                  password: newStaff.password || 'password123',
                  email: cleanEmail,
                  position: newStaff.position,
                  role: newStaff.role,
                  staff_id: 'STF-' + Math.random().toString(36).substr(2, 5).toUpperCase()
                });
                setIsStaffModalOpen(false);
                setNewStaff({ fullName: '', username: '', role: 'operator', email: '', position: '', password: 'password123' });
                fetchDashboardData();
                showNotification(`Staff registered! Login email: ${result.email}`, 'success');
              } catch (err: any) {
                showNotification(err.message || 'Registration failed', 'error');
              }
            }}
            disabled={loading}
            className="w-full bg-red-600 text-white py-3 rounded-xl font-bold hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Registering...' : 'Register Staff'}
          </button>
        </div>
      </Modal>


      <Modal 
        title="Add New Service & Initial Stock" 
        isOpen={isServiceModalOpen} 
        onClose={() => setIsServiceModalOpen(false)}
      >
        <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Service Name</label>
            <input 
              type="text" 
              className="w-full px-4 py-2 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-red-500"
              value={newService.name}
              onChange={e => setNewService({...newService, name: e.target.value})}
              placeholder="e.g., Banner Printing"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Selling Price (USD)</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold">$</span>
                <input 
                  type="number" 
                  step="0.01"
                  className="w-full pl-8 pr-4 py-2 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-red-500 font-bold"
                  value={newService.price}
                  onChange={e => setNewService({...newService, price: parseFloat(e.target.value)})}
                />
              </div>
              <p className="text-[10px] text-slate-400 mt-1 font-bold">Daily Conversion: {formatCurrency(usdToSsp(newService.price || 0))}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Total Unit Cost (USD)</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold">$</span>
                <input 
                  type="number" 
                  step="0.01"
                  className="w-full pl-8 pr-4 py-2 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-red-500 font-bold"
                  value={newService.unitCost}
                  onChange={e => setNewService({...newService, unitCost: parseFloat(e.target.value)})}
                />
              </div>
              <p className="text-[10px] text-slate-400 mt-1 font-bold">Sum of costs below, or fixed.</p>
            </div>
          </div>
          
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 space-y-3">
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-widest">Cost Breakdown (Optional)</h4>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-[10px] font-bold text-slate-500 mb-1">Material</label>
                <input type="number" step="0.01" className="w-full px-3 py-1.5 text-sm rounded-lg border border-slate-200 focus:ring-2 focus:ring-red-500" value={newService.cost_material} onChange={e => setNewService({...newService, cost_material: parseFloat(e.target.value)})} />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-500 mb-1">Labor</label>
                <input type="number" step="0.01" className="w-full px-3 py-1.5 text-sm rounded-lg border border-slate-200 focus:ring-2 focus:ring-red-500" value={newService.cost_labor} onChange={e => setNewService({...newService, cost_labor: parseFloat(e.target.value)})} />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-500 mb-1">Transport</label>
                <input type="number" step="0.01" className="w-full px-3 py-1.5 text-sm rounded-lg border border-slate-200 focus:ring-2 focus:ring-red-500" value={newService.cost_transportation} onChange={e => setNewService({...newService, cost_transportation: parseFloat(e.target.value)})} />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-500 mb-1">Power/Energy</label>
                <input type="number" step="0.01" className="w-full px-3 py-1.5 text-sm rounded-lg border border-slate-200 focus:ring-2 focus:ring-red-500" value={newService.cost_power} onChange={e => setNewService({...newService, cost_power: parseFloat(e.target.value)})} />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-500 mb-1">Taxes</label>
                <input type="number" step="0.01" className="w-full px-3 py-1.5 text-sm rounded-lg border border-slate-200 focus:ring-2 focus:ring-red-500" value={newService.cost_taxes} onChange={e => setNewService({...newService, cost_taxes: parseFloat(e.target.value)})} />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-500 mb-1">Others</label>
                <input type="number" step="0.01" className="w-full px-3 py-1.5 text-sm rounded-lg border border-slate-200 focus:ring-2 focus:ring-red-500" value={newService.cost_others} onChange={e => setNewService({...newService, cost_others: parseFloat(e.target.value)})} />
              </div>
            </div>
            <button 
              className="text-xs text-red-600 font-bold hover:underline"
              onClick={() => {
                const total = (newService.cost_material||0) + (newService.cost_labor||0) + (newService.cost_transportation||0) + (newService.cost_power||0) + (newService.cost_taxes||0) + (newService.cost_others||0);
                setNewService({...newService, unitCost: total});
              }}
            >
              Autosum to Unit Cost
            </button>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Category</label>
              <input 
                type="text" 
                className="w-full px-4 py-2 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-red-500"
                value={newService.category}
                onChange={e => setNewService({...newService, category: e.target.value})}
                placeholder="General"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
              <input 
                type="text" 
                className="w-full px-4 py-2 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-red-500"
                value={newService.description}
                onChange={e => setNewService({...newService, description: e.target.value})}
                placeholder="Product description"
              />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Initial Stock</label>
              <input 
                type="number" 
                className="w-full px-4 py-2 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-red-500"
                value={newService.stock}
                onChange={e => setNewService({...newService, stock: parseInt(e.target.value)})}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Alert Level</label>
              <input 
                type="number" 
                className="w-full px-4 py-2 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-red-500"
                value={newService.minStock}
                onChange={e => setNewService({...newService, minStock: parseInt(e.target.value)})}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Unit</label>
              <input 
                type="text" 
                className="w-full px-4 py-2 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-red-500"
                value={newService.unit}
                onChange={e => setNewService({...newService, unit: e.target.value})}
                placeholder="pcs"
              />
            </div>
          </div>
          <button 
            onClick={async () => {
              if (!newService.name || newService.price <= 0) {
                showNotification('Please provide a name and valid price', 'error');
                return;
              }
              try {
                await firebaseService.addService({
                  name: newService.name,
                  price: newService.price,
                  category: newService.category || 'General',
                  stock: newService.stock,
                  minimum_stock: newService.minStock,
                  unit: newService.unit || 'pcs',
                  description: newService.description || '',
                  unit_cost: newService.unitCost || (newService.price * 0.1),
                  cost_material: newService.cost_material || 0,
                  cost_labor: newService.cost_labor || 0,
                  cost_transportation: newService.cost_transportation || 0,
                  cost_power: newService.cost_power || 0,
                  cost_taxes: newService.cost_taxes || 0,
                  cost_others: newService.cost_others || 0,
                  last_restock: new Date().toISOString()
                });
                setIsServiceModalOpen(false);
                setNewService({ 
                  name: '', price: 0, category: 'General', description: '', unitCost: 0, 
                  cost_material: 0, cost_labor: 0, cost_transportation: 0, cost_power: 0, cost_taxes: 0, cost_others: 0,
                  stock: 0, minStock: 10, unit: 'pcs' 
                });
                fetchDashboardData();
                showNotification('Service and stock added!', 'success');
              } catch (err: any) {
                showNotification(err.message || 'Failed to add service', 'error');
              }
            }}
            className="w-full bg-red-600 text-white py-4 rounded-2xl font-black uppercase tracking-widest hover:bg-red-700 transition-all shadow-xl shadow-red-100 mt-4"
          >
            Create Service
          </button>
        </div>
      </Modal>

      <Modal 
        title="Record Company Asset" 
        isOpen={isAssetModalOpen} 
        onClose={() => setIsAssetModalOpen(false)}
      >
        <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Asset Name</label>
            <input 
              type="text" 
              className="w-full px-4 py-2 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-red-500"
              value={newAsset.name || ''}
              onChange={e => setNewAsset({...newAsset, name: e.target.value})}
              placeholder="e.g., Canon Printer XYZ"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Type</label>
              <select 
                className="w-full px-4 py-2 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-red-500 font-medium"
                value={newAsset.type || 'fixed'}
                onChange={e => setNewAsset({...newAsset, type: e.target.value as 'fixed' | 'usable'})}
              >
                <option value="fixed">Fixed (Equipment/Machinery)</option>
                <option value="usable">Usable (Consumable/Reduces)</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Quantity/Amount</label>
              <input 
                type="number" 
                className="w-full px-4 py-2 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-red-500"
                value={newAsset.quantity || 1}
                onChange={e => setNewAsset({...newAsset, quantity: parseFloat(e.target.value)})}
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Total Value (USD)</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold">$</span>
                <input 
                  type="number" 
                  step="0.01"
                  className="w-full pl-8 pr-4 py-2 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-red-500 font-bold"
                  value={newAsset.value || 0}
                  onChange={e => setNewAsset({...newAsset, value: parseFloat(e.target.value)})}
                />
              </div>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Description / Condition</label>
            <textarea 
              className="w-full px-4 py-2 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-red-500 text-sm"
              value={newAsset.description || ''}
              onChange={e => setNewAsset({...newAsset, description: e.target.value})}
              placeholder="Provide details about condition, location, or usage."
              rows={3}
            />
          </div>
          <button 
            onClick={async () => {
              if (!newAsset.name || !newAsset.type) {
                showNotification('Please provide a name and select a type', 'error');
                return;
              }
              try {
                await firebaseService.addAsset({
                  name: newAsset.name,
                  type: newAsset.type,
                  quantity: newAsset.quantity || 1,
                  value: newAsset.value || 0,
                  description: newAsset.description || ''
                });
                setIsAssetModalOpen(false);
                setNewAsset({ name: '', type: 'fixed', quantity: 1, value: 0 });
                showNotification('Asset recorded successfully!', 'success');
              } catch (err: any) {
                showNotification(err.message || 'Failed to record asset', 'error');
              }
            }}
            className="w-full bg-slate-900 text-white py-4 rounded-2xl font-black uppercase tracking-widest hover:bg-slate-800 transition-all shadow-xl shadow-slate-200 mt-4"
          >
            Record Asset
          </button>
        </div>
      </Modal>

      {confirmModal && (
        <ConfirmationModal 
          isOpen={confirmModal.isOpen}
          title={confirmModal.title}
          message={confirmModal.message}
          onConfirm={confirmModal.onConfirm}
          onCancel={() => setConfirmModal(null)}
          selectionOptions={confirmModal.selectionOptions}
        />
      )}

      <Modal 
        title="Request Discount" 
        isOpen={isDiscountRequestModalOpen} 
        onClose={() => setIsDiscountRequestModalOpen(false)}
      >
        <div className="space-y-4">
          <p className="text-sm text-slate-500">Maximum allowed discount is 10%.</p>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Discount Amount (%)</label>
            <input 
              type="number" 
              className="w-full px-4 py-2 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-red-500 font-bold"
              value={discountRequestAmount}
              onChange={e => {
                const val = parseFloat(e.target.value);
                if (val > 10) setDiscountRequestAmount(10);
                else if (val < 0) setDiscountRequestAmount(0);
                else setDiscountRequestAmount(val);
              }}
              min="0"
              max="10"
              placeholder="e.g., 5"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Reason for Discount</label>
            <textarea 
              className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-red-500 h-24 text-sm"
              value={discountRequestReason}
              onChange={e => setDiscountRequestReason(e.target.value)}
              placeholder="Explain why this discount is needed..."
            />
          </div>
          <button 
            disabled={!discountRequestAmount || !discountRequestReason}
            onClick={async () => {
              if (selectedOrder) {
                try {
                  if (user.role === 'admin' || user.role === 'supervisor') {
                    // Admin/Supervisor can apply directly
                    await firebaseService.requestDiscount(selectedOrder.id, discountRequestAmount, discountRequestReason, { id: user.id, name: user.full_name });
                    await firebaseService.decideDiscount(selectedOrder.id, 'approved', { id: user.id, name: user.full_name });
                    showNotification('Discount applied directly!', 'success');
                    // Locally update to reflect immediately
                    setSelectedOrder(prev => prev ? { ...prev, discount: discountRequestAmount, discount_request: { 
                      status: 'approved',
                      amount: discountRequestAmount,
                      reason: discountRequestReason,
                      requested_by_id: user.id,
                      requested_by_name: user.full_name,
                      requested_at: new Date()
                    } } : null);
                  } else {
                    await firebaseService.requestDiscount(selectedOrder.id, discountRequestAmount, discountRequestReason, { id: user.id, name: user.full_name });
                    showNotification('Discount request sent to Admin!', 'success');
                    setSelectedOrder(prev => prev ? { ...prev, discount_request: { 
                      amount: discountRequestAmount, 
                      reason: discountRequestReason, 
                      status: 'pending', 
                      requested_by_id: user.id, 
                      requested_by_name: user.full_name, 
                      requested_at: new Date() 
                    } } : null);
                  }
                  setIsDiscountRequestModalOpen(false);
                  fetchDashboardData();
                } catch (err) {
                  showNotification('Action failed', 'error');
                }
              }
            }}
            className="w-full bg-slate-900 text-white py-4 rounded-xl font-bold uppercase tracking-widest hover:bg-slate-800 transition-all disabled:opacity-50"
          >
            {isManagementUser ? 'Apply Discount Now' : 'Submit Request'}
          </button>
        </div>
      </Modal>

      {/* Convert Quotation to Job Order Modal */}
      <Modal 
        title={`Convert Estimate #${selectedQuoteForConvert?.quotNo} to Job Order`} 
        isOpen={isConvertModalOpen} 
        onClose={() => setIsConvertModalOpen(false)}
      >
        <div className="space-y-5 font-sans">
          <p className="text-xs font-semibold text-slate-500">
            Convert this approved quotation into a live Job Order in the print queue. Specify the assigned designer and optionally record/update client deposit.
          </p>

          {/* Designer Selection */}
          <div>
            <label className="block text-xs font-black text-slate-400 uppercase tracking-wider mb-2">Assigned Personnel (Designer)</label>
            <select 
              className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 outline-none focus:ring-2 focus:ring-red-500 font-bold text-slate-700 text-sm"
              value={selectedDesignerForConvert}
              onChange={(e) => setSelectedDesignerForConvert(e.target.value)}
            >
              <option value="">-- No Designer Assigned --</option>
              {users.filter(u => u.role === 'designer').map(designer => (
                <option key={designer.id} value={designer.id}>{designer.full_name}</option>
              ))}
            </select>
          </div>

          {/* Deposit Input */}
          <div>
            <label className="block text-xs font-black text-slate-400 uppercase tracking-wider mb-2">
              Record Client Deposit (SSP)
            </label>
            <div className="relative">
              <input 
                type="number" 
                className="w-full pl-4 pr-12 py-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-red-500 font-black text-slate-700 text-sm"
                value={convertDepositValue || ''}
                onChange={(e) => setConvertDepositValue(parseFloat(e.target.value) || 0)}
                placeholder="0.00"
              />
              <span className="absolute right-4 top-3.5 text-xs font-bold text-slate-400">SSP</span>
            </div>
            <p className="text-[10px] text-slate-400 font-medium mt-1">
              * This deposit will be automatically subtracted from the total amount on the official invoice.
            </p>
          </div>

          {/* Order Totals Preview */}
          {selectedQuoteForConvert && (() => {
            const subtotal = (selectedQuoteForConvert.items || []).reduce((sum, item) => sum + (Number(item.price) * Number(item.quantity)), 0);
            let discountAmount = 0;
            if (selectedQuoteForConvert.discountType === 'percent') {
              discountAmount = subtotal * (Number(selectedQuoteForConvert.discountVal) || 0) / 100;
            } else {
              discountAmount = Number(selectedQuoteForConvert.discountVal) || 0;
            }
            const grandTotal = subtotal - discountAmount;
            const balanceRemaining = Math.max(0, grandTotal - Number(convertDepositValue));
            const quoteRate = selectedQuoteForConvert.usd_rate || Number(usdRate);

            return (
              <div className="bg-slate-50 border border-slate-150 rounded-2xl p-4 space-y-2.5">
                <div className="flex justify-between items-center text-xs font-semibold text-slate-500">
                  <span>Grand Total:</span>
                  <span className="font-mono font-bold text-slate-700">
                    {grandTotal.toLocaleString()} SSP / $ {(grandTotal / quoteRate).toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between items-center text-xs font-semibold text-slate-500">
                  <span>Client Deposit:</span>
                  <span className="font-mono font-bold text-emerald-600">
                    -{Number(convertDepositValue).toLocaleString()} SSP / $ {(Number(convertDepositValue) / quoteRate).toFixed(2)}
                  </span>
                </div>
                <div className="border-t border-slate-200 pt-2.5 flex justify-between items-center text-sm font-bold text-slate-800">
                  <span>BALANCE DUE:</span>
                  <span className="font-mono font-black text-red-600">
                    {balanceRemaining.toLocaleString()} SSP / $ {(balanceRemaining / quoteRate).toFixed(2)}
                  </span>
                </div>
                <div className="text-[9px] text-slate-400 font-bold uppercase tracking-widest text-center pt-1">
                  Exchange Rate Locked: 1 USD = {quoteRate} SSP
                </div>
              </div>
            );
          })()}

          {/* Action Buttons */}
          <div className="flex gap-3">
            <button 
              type="button"
              onClick={() => setIsConvertModalOpen(false)}
              className="flex-1 px-4 py-3 rounded-xl font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors text-xs uppercase tracking-wider"
            >
              Cancel
            </button>
            <button 
              type="button"
              onClick={async () => {
                if (!selectedQuoteForConvert) return;
                setLoading(true);
                try {
                  const updatedDeposit = Number(convertDepositValue) || 0;
                  
                  // Update the deposit in the quotation document
                  await firebaseService.updateQuotation(selectedQuoteForConvert.id, { 
                    deposit: updatedDeposit 
                  });
                  
                  selectedQuoteForConvert.deposit = updatedDeposit;
                  
                  // Perform the conversion to Job Order
                  await performConversion(selectedQuoteForConvert, selectedDesignerForConvert || undefined);
                  
                  setIsConvertModalOpen(false);
                  setSelectedQuoteForConvert(null);
                  fetchDashboardData();
                } catch (err) {
                  console.error(err);
                  showNotification('Failed to convert quotation', 'error');
                } finally {
                  setLoading(false);
                }
              }}
              className="flex-1 px-4 py-3 rounded-xl font-black text-white bg-red-600 hover:bg-red-700 transition-colors text-xs uppercase tracking-wider shadow-lg shadow-red-100"
            >
              Approve & Convert
            </button>
          </div>
        </div>
      </Modal>

      {/* Client Deposit Quick Update Modal */}
      <Modal 
        title="Client Deposit Manager" 
        isOpen={isDepositModalOpen} 
        onClose={() => setIsDepositModalOpen(false)}
      >
        <div className="space-y-5 font-sans">
          <div>
            <span className="text-[10px] uppercase font-black tracking-widest text-red-600 font-mono block mb-1">
              Estimate #{selectedQuoteForDeposit?.quotNo}
            </span>
            <p className="text-xs font-semibold text-slate-500">
              Update the deposit received from client "{selectedQuoteForDeposit?.name}". This amount will be subtracted from the total invoice.
            </p>
          </div>

          {/* Deposit Input */}
          <div>
            <label className="block text-xs font-black text-slate-400 uppercase tracking-wider mb-2">
              Client Deposit (SSP)
            </label>
            <div className="relative">
              <input 
                type="number" 
                className="w-full pl-4 pr-12 py-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-red-500 font-black text-slate-700 text-sm"
                value={tempDepositValue || ''}
                onChange={(e) => setTempDepositValue(parseFloat(e.target.value) || 0)}
                placeholder="0.00"
              />
              <span className="absolute right-4 top-3.5 text-xs font-bold text-slate-400">SSP</span>
            </div>
          </div>

          {/* Preview Panel */}
          {selectedQuoteForDeposit && (() => {
            const subtotal = (selectedQuoteForDeposit.items || []).reduce((sum, item) => sum + (Number(item.price) * Number(item.quantity)), 0);
            let discountAmount = 0;
            if (selectedQuoteForDeposit.discountType === 'percent') {
              discountAmount = subtotal * (Number(selectedQuoteForDeposit.discountVal) || 0) / 100;
            } else {
              discountAmount = Number(selectedQuoteForDeposit.discountVal) || 0;
            }
            const grandTotal = subtotal - discountAmount;
            const balanceRemaining = Math.max(0, grandTotal - Number(tempDepositValue));
            const quoteRate = selectedQuoteForDeposit.usd_rate || Number(usdRate);

            return (
              <div className="bg-slate-50 border border-slate-150 rounded-2xl p-4 space-y-2 flex flex-col">
                <div className="flex justify-between items-center text-xs font-semibold text-slate-500">
                  <span>Grand Total:</span>
                  <span className="font-mono font-bold text-slate-700">
                    {grandTotal.toLocaleString()} SSP / $ {(grandTotal / quoteRate).toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between items-center text-xs font-semibold text-slate-500">
                  <span>Updated Deposit:</span>
                  <span className="font-mono font-bold text-emerald-600">
                    -{Number(tempDepositValue).toLocaleString()} SSP / $ {(Number(tempDepositValue) / quoteRate).toFixed(2)}
                  </span>
                </div>
                <div className="border-t border-slate-200 pt-2 flex justify-between items-center text-xs font-bold text-slate-800">
                  <span>NEW BALANCE DUE:</span>
                  <span className="font-mono font-black text-red-600">
                    {balanceRemaining.toLocaleString()} SSP / $ {(balanceRemaining / quoteRate).toFixed(2)}
                  </span>
                </div>
                <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider text-center mt-1">
                  Exchange Rate Locked: 1 USD = {quoteRate} SSP
                </span>
              </div>
            );
          })()}

          {/* Action Buttons */}
          <div className="flex gap-3">
            <button 
              type="button"
              onClick={() => setIsDepositModalOpen(false)}
              className="flex-1 px-4 py-3 rounded-xl font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors text-xs uppercase tracking-wider"
            >
              Cancel
            </button>
            <button 
              type="button"
              onClick={async () => {
                if (!selectedQuoteForDeposit) return;
                setLoading(true);
                try {
                  const updatedDeposit = Number(tempDepositValue) || 0;
                  await firebaseService.updateQuotation(selectedQuoteForDeposit.id, { deposit: updatedDeposit });
                  showNotification(`Client deposit updated to ${formatCurrency(updatedDeposit, selectedQuoteForDeposit.usd_rate)}!`, 'success');
                  setIsDepositModalOpen(false);
                  setSelectedQuoteForDeposit(null);
                  fetchDashboardData();
                } catch (err) {
                  console.error(err);
                  showNotification('Failed to update client deposit', 'error');
                } finally {
                  setLoading(false);
                }
              }}
              className="flex-1 px-4 py-3 rounded-xl font-black text-white bg-red-600 hover:bg-red-700 transition-colors text-xs uppercase tracking-wider shadow-lg shadow-red-100"
            >
              Save Deposit
            </button>
          </div>
        </div>
      </Modal>

      <Modal 
        title={debtRecoveryModalTitle || "Debt Recovery & Clearance Details"} 
        isOpen={isDebtRecoveryModalOpen} 
        onClose={() => setIsDebtRecoveryModalOpen(false)}
      >
        <div className="space-y-6 max-h-[75vh] overflow-y-auto pr-2 font-sans">
          <div className="bg-teal-50 border border-teal-100 rounded-2xl p-5 flex items-center justify-between">
            <div>
              <p className="text-teal-800 text-[10px] font-black uppercase tracking-wider mb-0.5">Total Recovered Cash</p>
              <h3 className="text-2xl font-black text-teal-600">
                {formatCurrency(debtRecoveryModalPayments.reduce((sum, p) => sum + (p.amount || 0), 0))}
              </h3>
            </div>
            <div>
              <p className="text-teal-800 text-[10px] font-black uppercase tracking-wider mb-0.5 text-right">Transactions</p>
              <h3 className="text-xl font-bold text-teal-700 text-right">{debtRecoveryModalPayments.length} Payments</h3>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <h4 className="text-xs font-black uppercase tracking-wider text-slate-400">Clearance Ledger</h4>
            <button
              onClick={() => generateDebtRecoveryPDF(debtRecoveryModalTitle, debtRecoveryModalPayments)}
              className="bg-teal-600 text-white px-3 py-1.5 rounded-xl text-xs font-bold hover:bg-teal-700 transition-colors shadow-sm flex items-center gap-1.5"
            >
              <Download className="w-3.5 h-3.5" />
              Download PDF Report
            </button>
          </div>

          <div className="overflow-x-auto border border-slate-100 rounded-2xl">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100 text-[10px] font-black text-slate-400 uppercase tracking-wider">
                  <th className="p-4">Date & Time</th>
                  <th className="p-4">Customer & Order</th>
                  <th className="p-4">Cleared By</th>
                  <th className="p-4 text-right font-bold">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {debtRecoveryModalPayments.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="p-8 text-center text-slate-400 italic text-xs">
                      No debt recoveries found in this list.
                    </td>
                  </tr>
                ) : (
                  debtRecoveryModalPayments.map(p => {
                    const orderIdDisplay = p.order ? (p.order.job_order_id || '#' + String(p.order.id).substring(0, 6).toUpperCase()) : `#${String(p.order_id).substring(0, 6).toUpperCase()}`;
                    const customerNameDisplay = p.order ? p.order.customer_name : 'Unknown Customer';
                    return (
                      <tr key={p.id} className="hover:bg-slate-50/50 transition-colors text-xs">
                        <td className="p-4">
                          <span className="font-bold text-slate-900 block">
                            {p.dateObj ? p.dateObj.toLocaleDateString() : ''}
                          </span>
                          <span className="text-[10px] text-slate-400">
                            {p.dateObj ? p.dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                          </span>
                        </td>
                        <td className="p-4">
                          <span className="font-bold text-slate-900 block leading-tight">{customerNameDisplay}</span>
                          <span className="text-[10px] font-mono text-slate-400 uppercase">
                            {orderIdDisplay} • {p.method || 'Cash'}
                          </span>
                        </td>
                        <td className="p-4 text-slate-500 font-medium">
                          {p.recorded_by || 'System'}
                        </td>
                        <td className="p-4 text-right">
                          <span className="font-black text-teal-600 block">
                            {formatCurrency(p.amount)}
                          </span>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          <button 
            onClick={() => setIsDebtRecoveryModalOpen(false)}
            className="w-full bg-slate-900 text-white py-3 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-slate-800 transition-colors shadow-sm"
          >
            Close Details
          </button>
        </div>
      </Modal>

      {showTerms && user?.role === 'admin' && <TermsModal onAccept={handleTermsAccept} />}

      <PWAInstallModal
        isOpen={isPWAInstallModalOpen}
        onClose={() => setIsPWAInstallModalOpen(false)}
        deferredPrompt={deferredPrompt}
        onInstall={handleInstallApp}
        showNotification={showNotification}
      />

      {/* Order Detail Modal */}
      {isOrderDetailModalOpen && selectedOrder && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[2rem] w-full max-w-2xl overflow-hidden shadow-2xl animate-in font-sans">
            <div className="bg-slate-900 p-8 text-white flex justify-between items-start">
              <div>
                <p className="text-red-400 font-bold text-xs uppercase tracking-widest mb-1">Order Details</p>
                <h2 className="text-3xl font-black">{selectedOrder.job_order_id || '#' + String(selectedOrder.id || '').substring(0, 8).toUpperCase()}</h2>
                <div className="mt-4 flex items-center gap-3">
                  <span className="px-3 py-1 rounded-full bg-white/10 text-xs font-bold uppercase">
                    {getStatusLabel(selectedOrder.status)}
                  </span>
                  <span className="text-slate-400 text-sm">
                    {formatDate(selectedOrder.created_at)}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {(user?.role === 'admin' || user?.staff_id === 'MASTER' || user?.email === "tekkisandereagan@gmail.com" || user?.email === "kulyakosukusandereagan@gmail.com") && (
                  <button 
                    onClick={() => {
                      if (isEditingOrder) {
                        setIsEditingOrder(false);
                      } else {
                        setIsEditingOrder(true);
                        setEditOrderData({
                          customer_name: selectedOrder.customer_name || '',
                          description: selectedOrder.description || '',
                          total_amount: selectedOrder.total_amount || 0,
                          assigned_staff_id: selectedOrder.assigned_staff_id || '',
                          assigned_staff_username: selectedOrder.assigned_staff_username || '',
                          status: selectedOrder.status || ''
                        });
                      }
                    }}
                    className="p-2 hover:bg-white/10 rounded-xl transition-colors flex items-center gap-1.5 text-xs font-black uppercase tracking-wider border border-white/20 px-3 cursor-pointer"
                  >
                    {isEditingOrder ? 'Cancel' : 'Edit Order'}
                  </button>
                )}
                <button 
                  onClick={() => setIsOrderDetailModalOpen(false)}
                  className="p-2 hover:bg-white/10 rounded-full transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>
            
            {isEditingOrder ? (
              <div className="p-8 space-y-5 max-h-[70vh] overflow-y-auto">
                <p className="text-red-650 font-black text-xs uppercase tracking-widest border-b border-slate-100 pb-2">Edit Job Order Details</p>
                
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Customer Name</label>
                  <input 
                    type="text" 
                    value={editOrderData.customer_name} 
                    onChange={e => setEditOrderData({ ...editOrderData, customer_name: e.target.value })}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-1 focus:ring-slate-900 outline-none font-medium text-slate-800"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Job Description</label>
                  <textarea 
                    value={editOrderData.description} 
                    onChange={e => setEditOrderData({ ...editOrderData, description: e.target.value })}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-1 focus:ring-slate-900 outline-none font-medium text-slate-800 h-24 resize-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Total Amount ({currency === 'USD' ? 'USD' : 'SSP'})</label>
                    <input 
                      type="number" 
                      value={editOrderData.total_amount} 
                      onChange={e => setEditOrderData({ ...editOrderData, total_amount: Number(e.target.value) })}
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-1 focus:ring-slate-900 outline-none font-medium text-slate-800"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Workflow Status</label>
                    <select 
                      value={editOrderData.status} 
                      onChange={e => setEditOrderData({ ...editOrderData, status: e.target.value })}
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-1 focus:ring-slate-900 outline-none font-bold text-slate-850 text-xs"
                    >
                      <option value="pending">Pending</option>
                      <option value="at_designer">Design Stage</option>
                      <option value="production">Production Stage</option>
                      <option value="pending_client_approval">Pending Client Approval</option>
                      <option value="done_awaiting_invoice">Accounts (Awaiting Invoice)</option>
                      <option value="ready_for_payment">Ready for Payment</option>
                      <option value="completed">Completed / Paid</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Assigned Staff</label>
                  <select 
                    value={editOrderData.assigned_staff_id} 
                    onChange={e => {
                      const selectedUser = users.find(u => u.id === e.target.value);
                      setEditOrderData({ 
                        ...editOrderData, 
                        assigned_staff_id: e.target.value,
                        assigned_staff_username: selectedUser ? selectedUser.username : ''
                      });
                    }}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-1 focus:ring-slate-900 outline-none font-bold text-slate-850 text-xs"
                  >
                    <option value="">Unassigned</option>
                    {users.map(u => (
                      <option key={u.id} value={u.id}>{u.full_name} (@{u.username})</option>
                    ))}
                  </select>
                </div>

                <div className="flex gap-4 pt-4">
                  <button 
                    onClick={() => setIsEditingOrder(false)}
                    className="flex-1 px-4 py-3 rounded-xl border border-slate-200 font-bold text-slate-600 hover:bg-slate-50 transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={async (e) => {
                      const btn = e.currentTarget;
                      if (btn.disabled) return;
                      btn.disabled = true;
                      try {
                        setLoading(true);
                        await firebaseService.updateOrder(selectedOrder.id, {
                          customer_name: editOrderData.customer_name,
                          description: editOrderData.description,
                          total_amount: editOrderData.total_amount,
                          assigned_staff_id: editOrderData.assigned_staff_id,
                          assigned_staff_username: editOrderData.assigned_staff_username,
                          status: editOrderData.status as any
                        });
                        setSelectedOrder({
                          ...selectedOrder,
                          customer_name: editOrderData.customer_name,
                          description: editOrderData.description,
                          total_amount: editOrderData.total_amount,
                          assigned_staff_id: editOrderData.assigned_staff_id,
                          assigned_staff_username: editOrderData.assigned_staff_username,
                          status: editOrderData.status as any
                        });
                        setIsEditingOrder(false);
                        showNotification('Job Order details updated successfully!', 'success');
                        fetchDashboardData();
                      } catch (err: any) {
                        showNotification(err.message || 'Update failed', 'error');
                      } finally {
                        setLoading(false);
                        btn.disabled = false;
                      }
                    }}
                    className="flex-1 px-4 py-3 rounded-xl bg-slate-900 text-white font-bold hover:bg-slate-850 transition-colors cursor-pointer"
                  >
                    Save Changes
                  </button>
                </div>
              </div>
            ) : (
              <>
                <div className="p-8 space-y-8 max-h-[70vh] overflow-y-auto">
              {/* Customer & Staff */}
              <div className="grid grid-cols-2 gap-8">
                <div className="space-y-1">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Customer</p>
                  <p className="text-lg font-bold text-slate-900">{selectedOrder.customer_name}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Assigned Staff</p>
                  <p className="text-lg font-bold text-slate-900">
                    {selectedOrder.assigned_staff_username ? `@${selectedOrder.assigned_staff_username}` : 'Unassigned'}
                  </p>
                </div>
              </div>

              {/* Job Description */}
              <div className="space-y-2">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 pb-2">Job Description</p>
                <div className="bg-slate-50 p-4 rounded-xl">
                  <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">
                    {selectedOrder.description || 'No detailed description provided.'}
                  </p>
                </div>
              </div>

              {/* Timeline */}
              <div className="space-y-4">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 pb-2">Job Timeline</p>
                <div className="space-y-6 relative before:content-[''] before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-[2px] before:bg-slate-100">
                  <div className="relative pl-8 flex flex-col">
                    <div className="absolute left-0 top-1 w-6 h-6 rounded-full bg-slate-900 flex items-center justify-center border-4 border-white shadow-sm">
                      <div className="w-1.5 h-1.5 rounded-full bg-white" />
                    </div>
                    <span className="text-xs font-bold text-slate-900">Order Created</span>
                    <span className="text-[10px] text-slate-400">{formatDate(selectedOrder.created_at)}</span>
                  </div>

                  {selectedOrder.stage_history?.at_designer && (
                    <div className="relative pl-8 flex flex-col">
                      <div className="absolute left-0 top-1 w-6 h-6 rounded-full bg-orange-500 flex items-center justify-center border-4 border-white shadow-sm">
                        <div className="w-1.5 h-1.5 rounded-full bg-white" />
                      </div>
                      <span className="text-xs font-bold text-slate-900">Reached Designer ({selectedOrder.stage_history.at_designer.staff_name || 'Staff'})</span>
                      <span className="text-[10px] text-slate-400">{formatDate(selectedOrder.stage_history.at_designer.timestamp || selectedOrder.stage_history.at_designer)}</span>
                    </div>
                  )}

                  {selectedOrder.stage_history?.production && (
                    <div className="relative pl-8 flex flex-col">
                      <div className="absolute left-0 top-1 w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center border-4 border-white shadow-sm">
                        <div className="w-1.5 h-1.5 rounded-full bg-white" />
                      </div>
                      <span className="text-xs font-bold text-slate-900">In Production ({selectedOrder.stage_history.production.staff_name || 'Operator'})</span>
                      <span className="text-[10px] text-slate-400">{formatDate(selectedOrder.stage_history.production.timestamp || selectedOrder.stage_history.production)}</span>
                    </div>
                  )}

                  {selectedOrder.stage_history?.completed && (
                    <div className="relative pl-8 flex flex-col">
                      <div className="absolute left-0 top-1 w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center border-4 border-white shadow-sm">
                        <div className="w-1.5 h-1.5 rounded-full bg-white" />
                      </div>
                      <span className="text-xs font-bold text-slate-900">Job Completed</span>
                      <span className="text-[10px] text-slate-400">{formatDate(selectedOrder.stage_history.completed.timestamp || selectedOrder.stage_history.completed)}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Items */}
              <div className="space-y-4">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 pb-2">Order items</p>
                <div className="space-y-3">
                  {selectedOrder.items?.map((item, idx) => (
                    <div key={idx} className="flex justify-between items-center group">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-slate-50 rounded flex items-center justify-center text-xs font-bold text-slate-400 group-hover:bg-red-50 group-hover:text-red-600 transition-colors">
                          {idx + 1}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-slate-900">{item.service_name || 'Service'}</p>
                          <p className="text-[10px] text-slate-400 italic">Qty: {item.quantity}</p>
                        </div>
                      </div>
                      <p className="text-sm font-bold text-slate-900">{formatCurrency((item.price_at_time || 0) * (item.quantity || 0), selectedOrder.usd_rate)}</p>
                    </div>
                  ))}
                </div>
              </div>

                {/* Totals & Payments */}
                <div className="space-y-4">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 pb-2">Payment Summary</p>
                  
                  {/* Discount Section */}
                  {selectedOrder.discount_request ? (
                    <div className={`p-4 rounded-2xl border ${selectedOrder.discount_request.status === 'pending' ? 'bg-amber-50 border-amber-200' : (selectedOrder.discount_request.status === 'approved' ? 'bg-emerald-50 border-emerald-200' : 'bg-red-50 border-red-200')}`}>
                      <div className="flex justify-between items-start mb-2">
                         <p className={`text-[10px] font-black uppercase tracking-widest ${selectedOrder.discount_request.status === 'pending' ? 'text-amber-700' : (selectedOrder.discount_request.status === 'approved' ? 'text-emerald-700' : 'text-red-700')}`}>
                           Discount Request: {selectedOrder.discount_request.status}
                         </p>
                         <span className="text-sm font-bold">{selectedOrder.discount_request.amount}%</span>
                      </div>
                      <p className="text-xs text-slate-600 italic">"{selectedOrder.discount_request.reason}"</p>
                      
                      {selectedOrder.discount_request.status === 'pending' && isSupervisor && (
                        <div className="flex gap-2 mt-4">
                          <button 
                            onClick={async () => {
                              try {
                                await firebaseService.decideDiscount(selectedOrder.id, 'approved', { id: user.id, name: user.full_name });
                                showNotification('Discount approved!', 'success');
                                fetchDashboardData();
                                setSelectedOrder(prev => prev ? { ...prev, discount: prev.discount_request?.amount, discount_request: { ...prev.discount_request!, status: 'approved' } } : null);
                              } catch (err) {
                                showNotification('Failed to approve', 'error');
                              }
                            }}
                            className="bg-emerald-600 text-white px-4 py-2 rounded-lg text-xs font-bold hover:bg-emerald-700"
                          >
                            Approve
                          </button>
                          <button 
                            onClick={async () => {
                              try {
                                await firebaseService.decideDiscount(selectedOrder.id, 'rejected', { id: user.id, name: user.full_name });
                                showNotification('Discount rejected', 'info');
                                fetchDashboardData();
                                setSelectedOrder(prev => prev ? { ...prev, discount_request: { ...prev.discount_request!, status: 'rejected' } } : null);
                              } catch (err) {
                                showNotification('Failed to reject', 'error');
                              }
                            }}
                            className="bg-red-600 text-white px-4 py-2 rounded-lg text-xs font-bold hover:bg-red-700"
                          >
                            Reject
                          </button>
                        </div>
                      )}
                    </div>
                  ) : (
                    (isSupervisor || user.role === 'receptionist') && selectedOrder.payment_status !== 'paid' && (
                      <button 
                        onClick={() => setIsDiscountRequestModalOpen(true)}
                        className="w-full py-3 border-2 border-dashed border-sky-200 rounded-2xl text-sky-600 text-xs font-bold bg-sky-50 hover:bg-sky-100 transition-colors uppercase tracking-widest"
                      >
                        {isSupervisor ? 'Apply Direct Discount (Max 10%)' : 'Request Discount (Max 10%)'}
                      </button>
                    )
                  )}

                  <div className="bg-slate-50 rounded-2xl p-6 space-y-4 shadow-inner">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-500">Total Order Amount</span>
                      <span className="font-bold text-slate-900">{formatCurrency((selectedOrder.total_amount || 0) * (1 - (selectedOrder.discount || 0) / 100), selectedOrder.usd_rate)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-500">Amount Paid</span>
                      <span className="font-bold text-emerald-600">{formatCurrency(selectedOrder.paid_amount || 0, selectedOrder.usd_rate)}</span>
                    </div>
                    <div className="flex justify-between items-center pt-2 border-t border-slate-200">
                      <span className="text-slate-900 font-bold">Remaining Balance</span>
                      <span className={`text-xl font-black ${((selectedOrder.total_amount || 0) * (1 - (selectedOrder.discount || 0) / 100) - (selectedOrder.paid_amount || 0)) > 0.01 ? 'text-red-600' : 'text-emerald-600'}`}>
                        {formatCurrency(Math.max(0, (selectedOrder.total_amount || 0) * (1 - (selectedOrder.discount || 0) / 100) - (selectedOrder.paid_amount || 0)), selectedOrder.usd_rate)}
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-center pt-2">
                    <span className="text-xs font-bold uppercase tracking-widest text-slate-400">Status</span>
                    <Badge status={selectedOrder.payment_status || 'unpaid'} />
                  </div>
                </div>

                {/* Record New Installment */}
                {selectedOrder.payment_status !== 'paid' && isAuthorisedForPayments && (
                  <div className="p-4 bg-white border-2 border-dashed border-slate-200 rounded-2xl space-y-3">
                    <p className="text-xs font-black text-slate-900 uppercase tracking-tighter">Record Payment Installment</p>
                    <div className="flex gap-3">
                      <div className="flex-1 relative">
                        <input 
                          type="number" 
                          value={paymentAmount || ''}
                          onChange={(e) => setPaymentAmount(parseFloat(e.target.value) || 0)}
                          className="w-full pl-3 pr-16 py-2 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-red-500 text-sm font-bold"
                          placeholder="Amount"
                        />
                        <button 
                          onClick={() => {
                            const balance = (selectedOrder.total_amount || 0) * (1 - (selectedOrder.discount || 0) / 100) - (selectedOrder.paid_amount || 0);
                            setPaymentAmount(Math.max(0, balance));
                          }}
                          className="absolute right-2 top-1.5 px-2 py-1 bg-slate-100 text-slate-500 hover:bg-slate-200 rounded-lg text-[10px] font-black uppercase transition-colors"
                        >
                          Max
                        </button>
                      </div>
                      <select 
                        value={paymentMethod}
                        onChange={(e) => setPaymentMethod(e.target.value)}
                        className="px-3 py-2 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-red-500 text-sm font-bold"
                      >
                        <option value="Cash">Cash</option>
                        <option value="Bank Transfer">Bank</option>
                        <option value="Mobile Money">M-Pesa</option>
                      </select>
                      <button 
                        onClick={async () => {
                          if (isNaN(paymentAmount) || paymentAmount <= 0) {
                            showNotification('Please enter a payment amount greater than zero', 'error');
                            return;
                          }
                          try {
                            const isMaster = user?.staff_id === 'MASTER' || user?.email === 'tekkisandereagan@gmail.com' || user?.email === 'kulyakosukusandereagan@gmail.com';
                            const staffName = isMaster ? 'System' : (user?.full_name || user?.username || 'Staff');
                            const result = await firebaseService.processPayment(selectedOrder.id, paymentAmount, paymentMethod, staffName);
                            showNotification(`Payment of ${formatCurrency(paymentAmount, selectedOrder.usd_rate)} recorded!`, 'success');
                            setSelectedOrder(prev => prev ? { ...prev, paid_amount: result.newPaidAmount, payment_status: result.isFullyPaid ? 'paid' : 'partially_paid' } : null);
                            fetchDashboardData();
                            setPaymentAmount(0);
                          } catch (err: any) {
                            console.error("Payment error:", err);
                            showNotification(err.message || 'Failed to record payment', 'error');
                          }
                        }}
                        className="px-6 py-2 bg-red-600 text-white rounded-xl text-sm font-black uppercase tracking-widest hover:bg-red-700 transition-all shadow-lg shadow-red-100"
                      >
                        Record
                      </button>
                    </div>
                  </div>
                )}

                {/* Payment History */}
                {orderPayments.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Payment History</p>
                    <div className="space-y-2 max-h-40 overflow-y-auto pr-2">
                      {orderPayments.map((p, idx) => (
                        <div key={idx} className="flex justify-between items-center bg-slate-50 p-3 rounded-xl border border-slate-100">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center text-emerald-600">
                              <DollarSign className="w-4 h-4" />
                            </div>
                            <div>
                              <p className="font-bold text-slate-900 text-sm">{formatCurrency(p.amount)} via {p.method}</p>
                              <p className="text-[10px] text-slate-400 font-medium">By {p.recorded_by || 'System'} • {formatDate(p.created_at)}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Workflow Timeline (Timestamps) */}
                <div className="space-y-3">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 pb-2">Production Timeline</p>
                  <div className="space-y-4 pl-2 border-l-2 border-slate-100">
                    {[
                      { label: 'Intake', stage: 'pending', color: 'bg-slate-400' },
                      { label: 'Design Stage', stage: 'at_designer', color: 'bg-indigo-500' },
                      { label: 'Production Stage', stage: 'production', color: 'bg-amber-500' },
                      { label: 'Completion', stage: 'completed', color: 'bg-emerald-600' }
                    ].map((step, idx) => {
                      const hist = selectedOrder.stage_history?.[step.stage];
                      const isActive = selectedOrder.status === step.stage;
                      
                      return (
                        <div key={idx} className="relative flex items-start gap-4">
                          <div className={`absolute -left-[13px] w-6 h-6 rounded-full border-4 border-white shadow-sm flex items-center justify-center ${hist ? step.color : 'bg-slate-200'}`}>
                            {hist && <Check className="w-2 h-2 text-white" />}
                          </div>
                          <div>
                            <p className={`text-xs font-black uppercase tracking-widest ${hist ? 'text-slate-900' : 'text-slate-300'}`}>
                              {step.label}
                            </p>
                            {hist ? (
                              <div className="mt-1">
                                <p className="text-[10px] text-slate-500 font-medium">Reached at {formatDate(hist.timestamp)}</p>
                                <p className="text-[10px] text-slate-400 font-bold uppercase">Staff: {hist.staff_name || 'System'}</p>
                              </div>
                            ) : (
                              isActive ? <p className="text-[10px] text-blue-500 font-black uppercase animate-pulse">Current Stage</p> : null
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {selectedOrder.approval && (
                <div className="flex items-center gap-3 p-4 bg-emerald-50 rounded-xl border border-emerald-100">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                  <div>
                    <p className="text-xs font-bold text-emerald-900 uppercase tracking-widest">Design Approved</p>
                    <p className="text-xs text-emerald-600">By {selectedOrder.approval.approved_by_name} on {formatDate(selectedOrder.approval.approved_at)}</p>
                  </div>
                </div>
              )}

              {/* Delivery Note Item Builder */}
              {isDeliveryNoteFormExpanded && selectedOrder && (
                <div className="p-6 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200 space-y-4">
                  <div className="flex justify-between items-center pb-2 border-b border-slate-200">
                    <div>
                      <h4 className="text-sm font-black text-slate-800 uppercase tracking-tight flex items-center gap-1.5">
                        <Truck className="w-4 h-4 text-amber-600" /> Goods Delivery Note Builder
                      </h4>
                      <p className="text-[10px] text-slate-500 font-medium">Input the quantity delivered for each item below.</p>
                    </div>
                    <button 
                      onClick={() => setIsDeliveryNoteFormExpanded(false)}
                      className="text-xs font-black text-rose-600 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-100 px-3 py-1.5 rounded-xl transition-colors cursor-pointer uppercase tracking-wider"
                    >
                      Hide
                    </button>
                  </div>
                  
                  <div className="space-y-3">
                    {(selectedOrder.items || []).map((item: any, idx: number) => {
                      const itemId = item.id || item.service_id || String(idx);
                      const currentVal = typeof deliveryQuantities[itemId] === 'number' ? deliveryQuantities[itemId] : item.quantity;
                      return (
                        <div key={idx} className="flex justify-between items-center bg-white p-4 rounded-xl border border-slate-100 shadow-3xs hover:border-slate-200 transition-all">
                          <div className="space-y-0.5">
                            <p className="text-xs font-bold text-slate-900">{(item.service_name || 'Service Item').toUpperCase()}</p>
                            <div className="flex items-center gap-2">
                              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Ordered: <span className="font-extrabold text-slate-800">{item.quantity}</span></span>
                              <span className="text-slate-350">•</span>
                              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Remaining: <span className="font-extrabold text-red-600">{Math.max(0, item.quantity - currentVal)}</span></span>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-black text-slate-400">DELIVERING:</span>
                            <input 
                              type="number"
                              min={0}
                              max={item.quantity}
                              value={currentVal}
                              onChange={(e) => {
                                const val = Math.min(item.quantity, Math.max(0, parseInt(e.target.value) || 0));
                                setDeliveryQuantities(prev => ({ ...prev, [itemId]: val }));
                              }}
                              className="w-16 px-2 py-1.5 rounded-lg border border-slate-200 outline-none focus:ring-2 focus:ring-red-500 text-xs font-bold text-center"
                            />
                            <button 
                              onClick={() => setDeliveryQuantities(prev => ({ ...prev, [itemId]: item.quantity }))}
                              className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 rounded-lg text-[10px] font-bold text-slate-600 transition-colors cursor-pointer"
                            >
                              All
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  
                  <div className="flex gap-2.5 pt-2">
                    <button 
                      onClick={() => printDeliveryNoteHTML(selectedOrder, deliveryQuantities)}
                      className="flex-1 py-3 bg-red-650 text-white font-black text-xs uppercase tracking-widest rounded-xl hover:bg-red-750 transition-all flex items-center justify-center gap-1.5 shadow-md shadow-red-200 cursor-pointer"
                    >
                      <Printer className="w-3.5 h-3.5" /> Print Delivery Note
                    </button>
                  </div>
                </div>
              )}
            </div>
            
            <div className="p-8 bg-slate-50 flex gap-4">
              <button 
                onClick={() => setIsOrderDetailModalOpen(false)}
                className="flex-1 px-6 py-3 rounded-xl border border-slate-200 font-bold bg-white text-slate-700 hover:bg-slate-100 transition-colors"
              >
                Close
              </button>
              {user?.role === 'admin' && (
                <button 
                  onClick={() => {
                    setConfirmModal({
                      isOpen: true,
                      title: 'Danger: Delete Job Order',
                      message: 'Are you sure you want to completely erase this job order? All payments, items, and records related to this order will be permanently deleted.',
                      onConfirm: async () => {
                        try {
                          await firebaseService.deleteOrder(selectedOrder.id);
                          showNotification('Job Order entirely erased!', 'success');
                          setIsOrderDetailModalOpen(false);
                          fetchDashboardData();
                        } catch (err) {
                          showNotification('Failed to delete order', 'error');
                        }
                      }
                    });
                  }}
                  className="px-6 py-3 rounded-xl border border-rose-200 font-bold bg-rose-50 text-rose-600 hover:bg-rose-100 transition-colors"
                >
                  <Trash2 className="w-4 h-4 mx-auto" />
                </button>
              )}
              {selectedOrder && (user?.role === 'receptionist' || user?.role === 'admin' || user?.email === "tekkisandereagan@gmail.com" || user?.email === "kulyakosukusandereagan@gmail.com" || user?.staff_id === 'MASTER') && (
                <div className="flex flex-col gap-1.5 min-w-[240px]">
                  <div className="flex gap-1.5">
                    <button 
                      onClick={() => printReceiptHTML(selectedOrder)}
                      title="Print Thermal Receipt"
                      className="flex-1 py-2 px-3 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-[10px] uppercase transition-colors shadow-md flex items-center justify-center gap-1 cursor-pointer"
                    >
                      <Printer className="w-3.5 h-3.5" /> Receipt
                    </button>
                    <button 
                      onClick={() => generateInvoicePDF(selectedOrder)}
                      title="Download PDF Invoice"
                      className="flex-1 py-2 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-[10px] uppercase transition-colors shadow-md flex items-center justify-center gap-1 cursor-pointer"
                    >
                      <FileText className="w-3.5 h-3.5" /> Invoice
                    </button>
                  </div>
                  <div className="flex gap-1.5">
                    <button 
                      onClick={() => printJobDescriptionConfirmationHTML(selectedOrder)}
                      title="Print Job Specification Confirmation"
                      className="flex-1 py-2 px-3 rounded-xl bg-sky-700 hover:bg-sky-850 text-white font-bold text-[10px] uppercase transition-colors shadow-md flex items-center justify-center gap-1 cursor-pointer"
                    >
                      <Printer className="w-3.5 h-3.5" /> Job Spec
                    </button>
                    <button 
                      onClick={() => setIsDeliveryNoteFormExpanded(prev => !prev)}
                      title="Open Delivery Note Builder"
                      className={`flex-1 py-2 px-3 rounded-xl font-bold text-[10px] uppercase transition-all shadow-md flex items-center justify-center gap-1 cursor-pointer ${isDeliveryNoteFormExpanded ? 'bg-amber-600 hover:bg-amber-700 text-white' : 'bg-slate-700 hover:bg-slate-800 text-white'}`}
                    >
                      <Truck className="w-3.5 h-3.5" /> Delivery Note
                    </button>
                  </div>
                </div>
              )}

              {/* Workflow Buttons */}
              {user && (
                <>
                  {((user.role === 'admin' || user.role === 'supervisor') || 
                    user.id === selectedOrder.assigned_staff_id
                   ) && 
                   ['pending', 'at_designer', 'production', 'pending_client_approval', 'done_awaiting_invoice', 'ready_for_payment'].includes(selectedOrder.status || '') && (
                    <button 
                      onClick={() => {
                        handleForwardOrder(selectedOrder);
                        setIsOrderDetailModalOpen(false);
                      }}
                      className="flex-1 px-6 py-3 rounded-xl font-bold transition-colors shadow-lg bg-slate-900 hover:bg-slate-800 text-white"
                    >
                      {selectedOrder.status === 'at_designer' ? 'Finish Design & Send to Production' : 
                       (selectedOrder.status === 'production' ? 'Finalize Production & Move to Accounts' :
                        (selectedOrder.status === 'done_awaiting_invoice' ? 'Complete & Close Job' : 'Forward to Next Stage'))}
                    </button>
                  )}


                  {/* Approve Design Action */}
                  {(user.role === 'admin' || user.role === 'supervisor' || user.role === 'designer') && selectedOrder.status === 'at_designer' && !selectedOrder.approval && (
                    <button 
                      onClick={() => {
                        setConfirmModal({
                          isOpen: true,
                          title: 'Approve Design',
                          message: 'Confirm this design is ready?',
                          onConfirm: () => {
                            const isMaster = user?.staff_id === 'MASTER' || user?.email === 'tekkisandereagan@gmail.com' || user?.email === 'kulyakosukusandereagan@gmail.com';
                            const staffName = isMaster ? 'System' : (user?.full_name || user?.username || 'Staff');
                            firebaseService.approveOrder(selectedOrder.id, user.id, staffName)
                              .then(() => {
                                fetchDashboardData();
                                setIsOrderDetailModalOpen(false);
                              })
                              .catch(err => showNotification('Approval failed', 'error'));
                            setConfirmModal(null);
                          }
                        });
                      }}
                      className="flex-1 px-6 py-3 rounded-xl bg-emerald-600 text-white font-bold hover:bg-emerald-700 transition-colors shadow-lg"
                    >
                      Approve Design
                    </button>
                  )}

                  {/* Operator Finish Work - Handled by handleWorkflowAction above now, so removing this redundant block */}
                  
                  {/* Receptionist Close Order */}
                  {(selectedOrder.status === 'ready_for_payment' || selectedOrder.status === 'done_awaiting_invoice' || selectedOrder.payment_status === 'paid') && isAuthorisedForPayments && (
                    <button 
                      onClick={async () => {
                        try {
                          const isMaster = user?.staff_id === 'MASTER' || user?.email === 'tekkisandereagan@gmail.com' || user?.email === 'kulyakosukusandereagan@gmail.com';
                          const staffName = isMaster ? 'System' : (user?.full_name || user?.username || 'Staff');
                          if (selectedOrder.payment_status !== 'paid') {
                            const remaining = (selectedOrder.total_amount || 0) * (1 - (selectedOrder.discount || 0) / 100) - (selectedOrder.paid_amount || 0);
                            if (remaining > 0) {
                              await firebaseService.processPayment(selectedOrder.id, remaining, 'Cash', staffName);
                            }
                          }
                          // Also update status to paid if it wasn't
                          await firebaseService.updateOrderStatus(selectedOrder.id, 'paid', user?.id || 'system', staffName);
                          showNotification('Order fulfilled and closed!', 'success');
                          setIsOrderDetailModalOpen(false);
                          fetchDashboardData();
                        } catch (err: any) {
                          console.error("Close order error:", err);
                          showNotification(err.message || 'Failed to settle balance and close order', 'error');
                        }
                      }}
                      className="flex-1 px-6 py-3 rounded-xl bg-red-600 text-white font-bold hover:bg-red-700 transition-colors shadow-lg"
                    >
                      {selectedOrder.payment_status === 'paid' ? 'Close Fulfilled Order' : 'Settle Balance & Close Order'}
                    </button>
                  )}
                </>
              )}
              {isAdminUser && (
                <button 
                  onClick={() => {
                    setConfirmModal({
                      isOpen: true,
                      title: 'Delete Order',
                      message: `Are you sure you want to delete order #${selectedOrder.id}? This action is permanent.`,
                      onConfirm: async () => {
                        try {
                          await firebaseService.deleteOrder(selectedOrder.id);
                          showNotification('Order deleted permanently', 'success');
                          await fetchDashboardData();
                          setIsOrderDetailModalOpen(false);
                        } catch (err) {
                          showNotification('Failed to delete order', 'error');
                        }
                        setConfirmModal(null);
                      }
                    });
                  }}
                  className="p-3 rounded-xl bg-red-50 text-red-600 hover:bg-red-100 transition-colors"
                  title="Delete Order"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              )}
            </div>
          </>
        )}
          </div>
        </div>
      )}
    </div>
  );
}
