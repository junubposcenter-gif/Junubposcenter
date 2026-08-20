import React, { useState, useEffect } from "react";
import { 
  X, 
  Monitor, 
  Smartphone, 
  Plus, 
  Search, 
  Trash, 
  CreditCard, 
  Users, 
  BookOpen, 
  Receipt, 
  Percent, 
  ShieldAlert, 
  Hotel, 
  Wine, 
  Activity, 
  Calendar, 
  Printer, 
  Calculator, 
  CheckCircle2, 
  Download, 
  ChevronRight,
  ShieldCheck,
  Briefcase,
  Layers,
  ArrowRight,
  RefreshCw,
  Clock,
  MapPin,
  ClipboardList
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { JubaPrintManager } from "./JubaPrintManager";
import QuickPharmaManager from "./QuickPharmaManager";
import { ErrorBoundary } from "./ErrorBoundary";

interface SaaSSimulatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  productId: string;
  productName: string;
  domain: string;
  licenseKey: string;
}

export function SaaSSimulatorModal({
  isOpen,
  onClose,
  productId,
  productName,
  domain,
  licenseKey
}: SaaSSimulatorModalProps) {
  const [activeMockTab, setActiveMockTab] = useState<string>("dashboard");
  const [systemLogs, setSystemLogs] = useState<string[]>([
    `[System] Initializing tenant virtual instance on sub-domain: ${domain}...`,
    `[Database] Isolated PostgreSQL database schema connected.`,
    `[Security] TLS/SSL certificate verified for secure transactions.`,
    `[License] License Key verified active: ${licenseKey}`,
    `[Ready] Application initialized successfully.`
  ]);

  // POS State
  const [posCart, setPosCart] = useState<{ id: string; name: string; priceSSP: number; priceUGX: number; qty: number }[]>([]);
  const [posCurrency, setPosCurrency] = useState<"SSP" | "UGX" | "USD">("SSP");
  const [posPaymentMethod, setPosPaymentMethod] = useState<string>("m-GURUSH");
  const [posSalesHistory, setPosSalesHistory] = useState<any[]>([
    { id: "TX-9021", items: "Sugar 2kg, Soap x1", totalSSP: 5500, totalUGX: 15400, method: "m-GURUSH", time: "10 mins ago" },
    { id: "TX-9020", items: "Nile Special Beer x5", totalSSP: 9000, totalUGX: 25000, method: "Cash", time: "1 hour ago" }
  ]);
  const [lastReceipt, setLastReceipt] = useState<any | null>(null);
  const [lowStockWarning, setLowStockWarning] = useState<boolean>(true);

  // NileSchool State
  const [schoolStudents, setSchoolStudents] = useState([
    { id: "STU-101", name: "Emmanuel Kenyi", class: "Primary 6", balanceSSP: 45000, balanceUSD: 120, parentPhone: "+211 921 555121" },
    { id: "STU-102", name: "Grace Nakato", class: "Senior 3", balanceSSP: 90000, balanceUSD: 240, parentPhone: "+256 772 444312" },
    { id: "STU-103", name: "Moses Deng", class: "Primary 4", balanceSSP: 30000, balanceUSD: 80, parentPhone: "+211 912 333454" }
  ]);
  const [paymentStudentId, setPaymentStudentId] = useState<string>("STU-101");
  const [paymentAmountSSP, setPaymentAmountSSP] = useState<number>(15000);
  const [paymentAmountUSD, setPaymentAmountUSD] = useState<number>(40);
  const [schoolPayMethod, setSchoolPayMethod] = useState<string>("MTN MoMo");
  const [schoolLedger, setSchoolLedger] = useState<any[]>([
    { id: "PAY-501", studentName: "Emmanuel Kenyi", amountSSP: 10000, amountUSD: 25, method: "m-GURUSH", status: "Reconciled", time: "Today, 08:30 AM" },
    { id: "PAY-500", studentName: "Grace Nakato", amountSSP: 30000, amountUSD: 80, method: "MTN MoMo", status: "Reconciled", time: "Yesterday" }
  ]);
  const [activeReportCardStudent, setActiveReportCardStudent] = useState<any | null>(null);

  // KampalaBar State
  const [barTables, setBarTables] = useState([
    { id: "T1", name: "Table 1 (Main Lounge)", status: "occupied", billUGX: 45000, items: [{ name: "Nile Special Beer", qty: 3, price: 5000 }, { name: "Pork Ribs Large", qty: 2, price: 15000 }] },
    { id: "T2", name: "Table 2 (VIP Couch)", status: "empty", billUGX: 0, items: [] },
    { id: "T3", name: "Table 3 (Garden Bench)", status: "occupied", billUGX: 25000, items: [{ name: "Club Premium Lager", qty: 5, price: 5000 }] },
    { id: "T4", name: "Bar Counter stool #2", status: "occupied", billUGX: 17000, items: [{ name: "Uganda Waragi 250ml", qty: 1, price: 12000 }, { name: "Tonic Can", qty: 1, price: 5000 }] }
  ]);
  const [selectedBarTable, setSelectedBarTable] = useState<any | null>(null);
  const [splitCount, setSplitCount] = useState<number>(2);

  // SuddHotel State
  const [hotelRooms, setHotelRooms] = useState([
    { num: "101", type: "Standard Double", status: "occupied", guestName: "Deng John", passport: "SSD-990812", country: "South Sudan", checkIn: "2026-07-09" },
    { num: "102", type: "Executive Suite", status: "empty", guestName: "", passport: "", country: "", checkIn: "" },
    { num: "201", type: "VIP President", status: "occupied", guestName: "Amelia Smith", passport: "USA-304191", country: "United States", checkIn: "2026-07-10" }
  ]);
  const [checkInName, setCheckInName] = useState("");
  const [checkInPassport, setCheckInPassport] = useState("");
  const [checkInCountry, setCheckInCountry] = useState("Uganda");
  const [checkInRoomNum, setCheckInRoomNum] = useState("102");
  const [alienReportMockup, setAlienReportMockup] = useState<any | null>(null);

  // SupaClinic/Healthcare State
  const [clinicPatients, setClinicPatients] = useState([
    { id: "PT-01", name: "Florence Namubiru", age: 34, diagnosis: "Malaria Plus", prescription: "Coartem 20mg x 24 tabs", date: "Today" },
    { id: "PT-02", name: "James Lado", age: 45, diagnosis: "Acute Hypertension", prescription: "Amlodipine 5mg Daily", date: "Yesterday" }
  ]);
  const [clinicNewName, setClinicNewName] = useState("");
  const [clinicNewDiagnosis, setClinicNewDiagnosis] = useState("");
  const [clinicNewPrescription, setClinicNewPrescription] = useState("");

  // Pharmacy State
  const [pharmacyStock, setPharmacyStock] = useState([
    { id: "P-501", name: "Coartem (Artemether/Lumefantrine)", batch: "C8091", expiry: "2026-08-15", daysLeft: 35, status: "critical" },
    { id: "P-502", name: "Amoxicillin Capsules 500mg", batch: "A1120", expiry: "2026-11-20", daysLeft: 132, status: "warning" },
    { id: "P-503", name: "Paracetamol 500mg Tabs", batch: "P0092", expiry: "2028-04-10", daysLeft: 638, status: "safe" }
  ]);

  // JubaPrint State
  const [printPaperGsm, setPrintPaperGsm] = useState<string>("80");
  const [printQuantity, setPrintQuantity] = useState<number>(500);
  const [printLayoutType, setPrintLayoutType] = useState<string>("A4 Color");

  // EquatorHRM State
  const [employeeSalaryUSD, setEmployeeSalaryUSD] = useState<number>(450);

  useEffect(() => {
    if (isOpen) {
      setActiveMockTab("app-core");
      setLastReceipt(null);
      setAlienReportMockup(null);
      setSelectedBarTable(null);
    }
  }, [isOpen, productId]);

  if (!isOpen) return null;

  // POS Add Item helper
  const addPosItem = (item: { id: string; name: string; priceSSP: number; priceUGX: number }) => {
    setPosCart((prev) => {
      const exist = prev.find((i) => i.id === item.id);
      if (exist) {
        return prev.map((i) => (i.id === item.id ? { ...i, qty: i.qty + 1 } : i));
      }
      return [...prev, { ...item, qty: 1 }];
    });
    setSystemLogs((prev) => [...prev, `[POS] Added ${item.name} to checkout basket.`]);
  };

  const removePosItem = (id: string) => {
    setPosCart((prev) => prev.filter((i) => i.id !== id));
  };

  const calculatePosTotal = () => {
    let ssp = 0;
    let ugx = 0;
    posCart.forEach((i) => {
      ssp += i.priceSSP * i.qty;
      ugx += i.priceUGX * i.qty;
    });
    const vatSSP = ssp * 0.18;
    const vatUGX = ugx * 0.18;
    return {
      subSSP: ssp,
      subUGX: ugx,
      vatSSP: Math.round(vatSSP),
      vatUGX: Math.round(vatUGX),
      totalSSP: Math.round(ssp + vatSSP),
      totalUGX: Math.round(ugx + vatUGX),
      totalUSD: Math.round((ssp / 130) * 10) / 10
    };
  };

  const handlePOSCheckout = () => {
    const totals = calculatePosTotal();
    if (totals.totalSSP === 0) return;

    const itemsStr = posCart.map((i) => `${i.name} x${i.qty}`).join(", ");
    const txId = `TX-${Math.floor(1000 + Math.random() * 9000)}`;

    const newTx = {
      id: txId,
      items: itemsStr,
      totalSSP: totals.totalSSP,
      totalUGX: totals.totalUGX,
      method: posPaymentMethod,
      time: "Just now"
    };

    setPosSalesHistory([newTx, ...posSalesHistory]);
    setLastReceipt({
      id: txId,
      date: new Date().toLocaleString(),
      items: [...posCart],
      ...totals,
      paymentMethod: posPaymentMethod
    });

    setPosCart([]);
    setSystemLogs((prev) => [
      ...prev,
      `[POS] Created Transaction ${txId} via ${posPaymentMethod}. Instant Ledger updated.`,
      `[SMS API] Broadcast mobile receipt message to customer queue.`
    ]);
  };

  // NileSchool Pay Fees helper
  const handleSchoolPayment = (e: React.FormEvent) => {
    e.preventDefault();
    const student = schoolStudents.find((s) => s.id === paymentStudentId);
    if (!student) return;

    // Deduct fees
    setSchoolStudents((prev) =>
      prev.map((s) =>
        s.id === paymentStudentId
          ? {
              ...s,
              balanceSSP: Math.max(0, s.balanceSSP - paymentAmountSSP),
              balanceUSD: Math.max(0, s.balanceUSD - paymentAmountUSD)
            }
          : s
      )
    );

    const payId = `PAY-${Math.floor(500 + Math.random() * 500)}`;
    const newRecord = {
      id: payId,
      studentName: student.name,
      amountSSP: paymentAmountSSP,
      amountUSD: paymentAmountUSD,
      method: schoolPayMethod,
      status: "Reconciled",
      time: "Just now"
    };

    setSchoolLedger([newRecord, ...schoolLedger]);
    setSystemLogs((prev) => [
      ...prev,
      `[NileSchool] Fees payment ${payId} of $${paymentAmountUSD} reconciled for student ${student.name}.`,
      `[Integration] Triggered automated SMS notification to guardian phone: ${student.parentPhone}`
    ]);
  };

  // KampalaBar actions
  const handleSelectBarTable = (table: any) => {
    setSelectedBarTable(table);
  };

  const addDrinkToTable = (drinkName: string, price: number) => {
    if (!selectedBarTable) return;
    setBarTables((prev) =>
      prev.map((t) => {
        if (t.id === selectedBarTable.id) {
          const items = [...t.items];
          const exist = items.find((i) => i.name === drinkName);
          let newItems;
          if (exist) {
            newItems = items.map((i) => (i.name === drinkName ? { ...i, qty: i.qty + 1 } : i));
          } else {
            newItems = [...items, { name: drinkName, qty: 1, price }];
          }
          const totalBill = newItems.reduce((acc, i) => acc + i.price * i.qty, 0);
          const updatedTable = { ...t, status: "occupied" as const, items: newItems, billUGX: totalBill };
          setSelectedBarTable(updatedTable);
          return updatedTable;
        }
        return t;
      })
    );
    setSystemLogs((prev) => [...prev, `[KampalaBar] Table ${selectedBarTable.id} updated with ${drinkName}.`]);
  };

  const handleSettleBarTable = () => {
    if (!selectedBarTable) return;
    setBarTables((prev) =>
      prev.map((t) =>
        t.id === selectedBarTable.id
          ? { ...t, status: "empty" as const, billUGX: 0, items: [] }
          : t
      )
    );
    setSystemLogs((prev) => [
      ...prev,
      `[KampalaBar] Table ${selectedBarTable.id} bill settled. Reconciled cash registry draw.`
    ]);
    setSelectedBarTable(null);
  };

  // SuddHotel check-in and alien form
  const handleHotelCheckIn = (e: React.FormEvent) => {
    e.preventDefault();
    setHotelRooms((prev) =>
      prev.map((r) =>
        r.num === checkInRoomNum
          ? {
              ...r,
              status: "occupied",
              guestName: checkInName,
              passport: checkInPassport,
              country: checkInCountry,
              checkIn: new Date().toISOString().split("T")[0]
            }
          : r
      )
    );
    setSystemLogs((prev) => [
      ...prev,
      `[SuddHotel] Guest ${checkInName} checked in to Room ${checkInRoomNum}.`,
      `[Compliance] Automatically created security declaration manifest.`
    ]);
    
    // Auto-select for compliance check
    const generatedReport = {
      guestName: checkInName,
      passport: checkInPassport,
      country: checkInCountry,
      roomNum: checkInRoomNum,
      checkInDate: new Date().toLocaleDateString(),
      refNumber: `SS-MOI-2026-${Math.floor(10000 + Math.random() * 90000)}`
    };
    setAlienReportMockup(generatedReport);

    setCheckInName("");
    setCheckInPassport("");
  };

  // SupaClinic Register Patient
  const handleClinicRegister = (e: React.FormEvent) => {
    e.preventDefault();
    if (!clinicNewName) return;
    const newPat = {
      id: `PT-${Math.floor(10 + Math.random() * 90)}`,
      name: clinicNewName,
      age: Math.floor(20 + Math.random() * 50),
      diagnosis: clinicNewDiagnosis || "Under Observation",
      prescription: clinicNewPrescription || "Bed Rest, Paracetamol",
      date: "Just now"
    };
    setClinicPatients([newPat, ...clinicPatients]);
    setSystemLogs((prev) => [
      ...prev,
      `[SupaClinic] Patient health card registered for ${clinicNewName}.`,
      `[Prescription] Digital ledger locked. Expiry verification completed.`
    ]);
    setClinicNewName("");
    setClinicNewDiagnosis("");
    setClinicNewPrescription("");
  };

  // Printing Estimator Calculations
  const estimatePrintCost = () => {
    const basePrice = printLayoutType === "A4 Color" ? 150 : 50; // UGX per page
    const totalRaw = printQuantity * basePrice;
    const markupFactor = printPaperGsm === "300" ? 1.4 : 1.0;
    return Math.round(totalRaw * markupFactor);
  };

  // payroll tax estimator
  const calculatePAYE = () => {
    const gross = employeeSalaryUSD;
    // Basic East African bracket simulation (Uganda PAYE standard)
    // Up to $100 -> 0%
    // Next $200 -> 10%
    // Over $300 -> 30%
    let tax = 0;
    if (gross > 300) {
      tax = (gross - 300) * 0.3 + 20;
    } else if (gross > 100) {
      tax = (gross - 100) * 0.1;
    }
    const nssf = gross * 0.05;
    return {
      tax: Math.round(tax * 100) / 100,
      nssf: Math.round(nssf * 100) / 100,
      net: Math.round((gross - tax - nssf) * 100) / 100
    };
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-0 sm:p-4 md:p-6 bg-slate-950/80 backdrop-blur-sm" id="saas-sandbox-container">
      <div className="bg-slate-900 border border-slate-800 w-full h-full sm:h-[90vh] sm:max-w-5xl sm:rounded-3xl shadow-2xl flex flex-col overflow-hidden relative">
        
        {/* TOP BAR / INSTANCE ADDR */}
        <div className="bg-slate-950 px-4 py-3 border-b border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <div className="bg-indigo-600/20 text-indigo-400 p-1 rounded-lg">
              <Monitor className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-white text-xs">{productName}</span>
                <span className="bg-emerald-500/10 text-emerald-400 font-mono text-[9px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  Active Tenant
                </span>
              </div>
              <p className="text-[10px] text-slate-500 font-mono leading-none mt-1">Host: <span className="text-indigo-400 underline">{domain}</span></p>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-4 self-end sm:self-auto">
            {/* Quick License Status Pill */}
            <div className="bg-slate-900 border border-slate-800 px-3 py-1 rounded-lg text-[10px] text-slate-400 font-mono hidden md:block">
              Licensing Key: <span className="text-indigo-300 font-bold">{licenseKey}</span>
            </div>
            
            <button
              onClick={onClose}
              className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* CONTAINER SHELL */}
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden bg-slate-900/60">
          
          {/* SIDEBAR FOR APP SECTIONS */}
          <div className="w-full md:w-52 bg-slate-950 border-r border-slate-800/80 p-3 flex flex-row md:flex-col gap-1 overflow-x-auto md:overflow-x-visible shrink-0">
            <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest px-2.5 py-1.5 hidden md:block">Console Sections</span>
            {[
              { id: "dashboard", label: "Tenant Dashboard", icon: Layers },
              { id: "app-core", label: "Live System UI", icon: Monitor },
              { id: "logs", label: "Database System Logs", icon: ClipboardList }
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveMockTab(tab.id)}
                  className={`px-3 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 whitespace-nowrap cursor-pointer ${
                    activeMockTab === tab.id
                      ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/10"
                      : "text-slate-400 hover:text-slate-200 hover:bg-slate-900"
                  }`}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* MAIN SIMULATOR VIEWPORT */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-slate-900/10">
            
            {/* TAB: TENANT DASHBOARD OVERVIEW */}
            {activeMockTab === "dashboard" && (
              <div className="space-y-6">
                <div className="bg-gradient-to-r from-slate-900 to-slate-950 p-6 rounded-2xl border border-slate-800 space-y-2 relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-8 opacity-5">
                    <ShieldCheck className="w-48 h-48 text-indigo-500" />
                  </div>
                  <h3 className="text-base font-black text-white">How This Product Operates After Purchase</h3>
                  <p className="text-xs text-slate-400 leading-relaxed max-w-2xl">
                    When your customer purchases <strong>{productName}</strong> in the public marketplace:
                  </p>
                  <ul className="text-xs text-slate-300 space-y-1.5 pl-4 list-disc max-w-2xl">
                    <li>The central marketplace triggers an automated web-hook, spawning a dedicated Docker software container cluster.</li>
                    <li>A private, isolated relational database schema is configured and migrated immediately.</li>
                    <li>The system binds a unique SSL sub-domain (<code className="text-indigo-400 font-mono">{domain}</code>) for the client's business staff to access.</li>
                    <li>A specialized **Licensing Verification Key** is generated. The customer can paste this key into any counter tablet, printer, or local barcode scanner to register physical hardware logs.</li>
                  </ul>
                  <div className="pt-2">
                    <button
                      onClick={() => setActiveMockTab("app-core")}
                      className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl transition flex items-center gap-1.5 cursor-pointer"
                    >
                      <span>Open Live System UI</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* TENANT REVENUE STATS FOR SIMULATOR */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="bg-slate-850 p-4 rounded-xl border border-slate-800 text-left">
                    <span className="text-[10px] text-slate-500 uppercase font-black">Provisioning State</span>
                    <span className="text-base font-black text-emerald-400 block mt-1">100% HEALTHY</span>
                    <span className="text-[10px] text-slate-400 block mt-1">Docker Nodes Online</span>
                  </div>
                  <div className="bg-slate-850 p-4 rounded-xl border border-slate-800 text-left">
                    <span className="text-[10px] text-slate-500 uppercase font-black">Database Storage</span>
                    <span className="text-base font-black text-indigo-300 block mt-1">Isolated DB</span>
                    <span className="text-[10px] text-slate-400 block mt-1">PostgreSQL DB Active</span>
                  </div>
                  <div className="bg-slate-850 p-4 rounded-xl border border-slate-800 text-left">
                    <span className="text-[10px] text-slate-500 uppercase font-black">Daily Data Backup</span>
                    <span className="text-base font-black text-white block mt-1">Scheduled</span>
                    <span className="text-[10px] text-emerald-400 block mt-1">✔ Enabled at midnight</span>
                  </div>
                </div>

                {/* DEMO BYPASS BOX */}
                <div className="p-4 bg-indigo-950/40 border border-indigo-900/60 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs">
                  <div className="space-y-1">
                    <p className="font-bold text-indigo-300">Ready to test the exact system interface?</p>
                    <p className="text-slate-400 text-[11px]">We have designed a live functional mockup interface for you to test and showcase directly to clients!</p>
                  </div>
                  <button
                    onClick={() => setActiveMockTab("app-core")}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs rounded-lg transition shrink-0 cursor-pointer"
                  >
                    Launch Interactive UI
                  </button>
                </div>
              </div>
            )}

            {/* TAB: SYSTEM DATABASE LOGS */}
            {activeMockTab === "logs" && (
              <div className="space-y-4 text-left">
                <div>
                  <h4 className="font-bold text-white text-sm">Automated Virtual Instance Logs</h4>
                  <p className="text-[10px] text-slate-400">Read the active system logs of this dedicated Docker node.</p>
                </div>
                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 font-mono text-[11px] text-emerald-400 space-y-1.5 h-96 overflow-y-auto">
                  <span className="text-slate-500 block">=== STREAMING DOCKER CONTAINER DEPLOYMENT LOGS ===</span>
                  {systemLogs.map((log, i) => (
                    <p key={i} className="leading-relaxed">
                      <span className="text-slate-500">[{new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}]</span> {log}
                    </p>
                  ))}
                  <p className="text-indigo-400 animate-pulse">■ Listening for real-time cashier transactions...</p>
                </div>
              </div>
            )}

            {/* TAB: LIVE CORE SAAS SYSTEM INTERACTION */}
            {activeMockTab === "app-core" && (
              <div className="space-y-6">

                {/* ==============================================
                     1. PRODUCT: JUNUBPOS SYSTEM
                     ============================================== */}
                {productId === "junubpos" && (
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 text-left">
                    {/* POS Retail Grid - 7 Columns */}
                    <div className="lg:col-span-7 space-y-4">
                      <div className="flex justify-between items-center bg-slate-950 px-3 py-2 rounded-xl border border-slate-800">
                        <span className="text-xs font-black text-indigo-400 uppercase tracking-widest flex items-center gap-1.5">
                          <Receipt className="w-3.5 h-3.5" />
                          <span>Interactive Touch screen terminal</span>
                        </span>
                        
                        {/* Currency toggle */}
                        <div className="flex bg-slate-900 border border-slate-700 p-0.5 rounded-lg text-[10px] font-bold">
                          {["SSP", "UGX", "USD"].map((curr) => (
                            <button
                              key={curr}
                              onClick={() => {
                                setPosCurrency(curr as any);
                                setSystemLogs((prev) => [...prev, `[POS] Shifted billing currency to ${curr}.`]);
                              }}
                              className={`px-2 py-1 rounded cursor-pointer ${
                                posCurrency === curr ? "bg-indigo-600 text-white" : "text-slate-400 hover:text-white"
                              }`}
                            >
                              {curr}
                            </button>
                          ))}
                        </div>
                      </div>

                      {lowStockWarning && (
                        <div className="bg-amber-950/40 border border-amber-900/60 p-3 rounded-xl flex justify-between items-center text-xs">
                          <div className="flex items-center gap-2 text-amber-300">
                            <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0" />
                            <p className="text-[11px]">
                              <strong>Inventory Alert:</strong> Flour stock below threshold (12 bags remaining). SMS warnings dispatched!
                            </p>
                          </div>
                          <button
                            onClick={() => setLowStockWarning(false)}
                            className="text-slate-400 hover:text-white underline text-[10px] cursor-pointer"
                          >
                            Dismiss
                          </button>
                        </div>
                      )}

                      {/* Products Touch List */}
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                        {[
                          { id: "p1", name: "White Sugar 1kg", priceSSP: 1500, priceUGX: 4200 },
                          { id: "p2", name: "Maize Flour 2kg", priceSSP: 2500, priceUGX: 7000 },
                          { id: "p3", name: "Soap Bar Local", priceSSP: 800, priceUGX: 2200 },
                          { id: "p4", name: "Nile Special Beer", priceSSP: 1800, priceUGX: 5000 },
                          { id: "p5", name: "Airtel Voucher 1K", priceSSP: 500, priceUGX: 1500 },
                          { id: "p6", name: "Cooking Oil 1L", priceSSP: 3500, priceUGX: 9800 }
                        ].map((prod) => (
                          <button
                            key={prod.id}
                            onClick={() => addPosItem(prod)}
                            className="bg-slate-850 hover:bg-slate-800 border border-slate-800/80 p-3 rounded-xl transition text-left space-y-2 hover:border-indigo-500/40 group cursor-pointer"
                          >
                            <span className="font-extrabold text-white text-xs group-hover:text-indigo-400 transition block leading-tight">{prod.name}</span>
                            <div className="text-[10px] text-slate-400 font-mono font-bold">
                              {posCurrency === "SSP" && `SSP ${prod.priceSSP}`}
                              {posCurrency === "UGX" && `UGX ${prod.priceUGX}`}
                              {posCurrency === "USD" && `$${Math.round((prod.priceSSP / 130) * 10) / 10}`}
                            </div>
                          </button>
                        ))}
                      </div>

                      {/* Recent Sales Ledger */}
                      <div className="bg-slate-850 p-4 rounded-xl border border-slate-800/80 space-y-2">
                        <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest block">Reconciled Sales Transactions (Live)</span>
                        <div className="space-y-1.5 max-h-36 overflow-y-auto">
                          {posSalesHistory.map((tx) => (
                            <div key={tx.id} className="flex justify-between items-center text-xs p-2 rounded bg-slate-900/40 border border-slate-800">
                              <div>
                                <span className="font-mono text-indigo-400 font-bold">{tx.id}</span>
                                <span className="text-slate-400 ml-2">{tx.items}</span>
                              </div>
                              <div className="text-right">
                                <span className="font-bold text-white block">
                                  {posCurrency === "SSP" ? `SSP ${tx.totalSSP}` : `UGX ${tx.totalUGX}`}
                                </span>
                                <span className="text-[8.5px] text-slate-500 font-bold block uppercase">{tx.method}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Cart / Receipt Area - 5 Columns */}
                    <div className="lg:col-span-5 space-y-4">
                      <div className="bg-slate-850 rounded-2xl border border-slate-800 p-4 space-y-4">
                        <h4 className="text-xs font-black text-white uppercase tracking-wider">Current Bill Checklist</h4>
                        
                        {posCart.length === 0 ? (
                          <div className="py-12 text-center text-slate-500 text-xs">
                            Basket is empty. Tap items on the left to ring up sale.
                          </div>
                        ) : (
                          <div className="space-y-2.5 max-h-44 overflow-y-auto pr-1">
                            {posCart.map((item) => (
                              <div key={item.id} className="flex items-center justify-between text-xs bg-slate-900/60 p-2 rounded-lg border border-slate-800">
                                <div className="space-y-0.5">
                                  <span className="font-bold text-white">{item.name}</span>
                                  <div className="text-[9.5px] text-slate-400 font-mono">
                                    Qty: <span className="text-indigo-400 font-bold">{item.qty}</span> @ 
                                    {posCurrency === "SSP" && ` SSP ${item.priceSSP}`}
                                    {posCurrency === "UGX" && ` UGX ${item.priceUGX}`}
                                  </div>
                                </div>
                                <button
                                  onClick={() => removePosItem(item.id)}
                                  className="text-slate-500 hover:text-rose-400 p-1 transition cursor-pointer"
                                >
                                  <Trash className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            ))}
                          </div>
                        )}

                        {posCart.length > 0 && (
                          <div className="border-t border-slate-800/80 pt-3 space-y-2 text-xs">
                            <div className="flex justify-between text-slate-400 text-[11px]">
                              <span>Subtotal</span>
                              <span>
                                {posCurrency === "SSP" ? `SSP ${calculatePosTotal().subSSP}` : `UGX ${calculatePosTotal().subUGX}`}
                              </span>
                            </div>
                            <div className="flex justify-between text-slate-400 text-[11px]">
                              <span>VAT Tax (18%)</span>
                              <span>
                                {posCurrency === "SSP" ? `SSP ${calculatePosTotal().vatSSP}` : `UGX ${calculatePosTotal().vatUGX}`}
                              </span>
                            </div>
                            <div className="flex justify-between text-white font-extrabold text-sm pt-1 border-t border-dashed border-slate-800">
                              <span>Grand Total</span>
                              <span className="text-emerald-400">
                                {posCurrency === "SSP" && `SSP ${calculatePosTotal().totalSSP}`}
                                {posCurrency === "UGX" && `UGX ${calculatePosTotal().totalUGX}`}
                                {posCurrency === "USD" && `$${calculatePosTotal().totalUSD}`}
                              </span>
                            </div>

                            {/* Payment Method Selector */}
                            <div className="space-y-1.5 pt-2">
                              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Payment Channel</span>
                              <div className="grid grid-cols-2 gap-1.5 text-[10px] font-bold">
                                {["m-GURUSH", "MTN MoMo", "Airtel Money", "Cash"].map((method) => (
                                  <button
                                    key={method}
                                    type="button"
                                    onClick={() => setPosPaymentMethod(method)}
                                    className={`py-1.5 px-2 rounded-lg text-center cursor-pointer border ${
                                      posPaymentMethod === method
                                        ? "bg-indigo-600/15 border-indigo-500 text-indigo-400"
                                        : "bg-slate-900 border-slate-800 text-slate-400 hover:text-white"
                                    }`}
                                  >
                                    {method}
                                  </button>
                                ))}
                              </div>
                            </div>

                            <button
                              onClick={handlePOSCheckout}
                              className="w-full mt-3 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-xl shadow transition cursor-pointer"
                            >
                              Complete simulated Checkout Sale
                            </button>
                          </div>
                        )}
                      </div>

                      {/* THERMAL RECEIPT DISPLAY */}
                      {lastReceipt && (
                        <div className="bg-white text-slate-950 p-5 rounded-xl font-mono text-[10.5px] border border-slate-200 shadow-xl space-y-3 relative text-left">
                          <div className="absolute top-1 right-2 bg-indigo-100 text-indigo-800 px-1.5 py-0.5 rounded font-sans text-[8px] font-extrabold">
                            SIMULATED PRINT
                          </div>
                          <div className="text-center space-y-0.5 border-b border-dashed border-slate-300 pb-2">
                            <h5 className="font-extrabold text-xs uppercase tracking-wider">JUNUB POS STORES</h5>
                            <p className="text-[9px]">HAI THAWRA MAIN STREET, JUBA</p>
                            <p className="text-[8px] text-slate-500">MEMBER OF CHAMBER OF COMMERCE</p>
                            <p className="text-[9px] mt-1.5 font-bold">TX REF: {lastReceipt.id}</p>
                            <p className="text-[8px] text-slate-500">{lastReceipt.date}</p>
                          </div>
                          <div className="space-y-1.5">
                            {lastReceipt.items.map((it: any) => (
                              <div key={it.id} className="flex justify-between">
                                <span>{it.name} (x{it.qty})</span>
                                <span>SSP {it.priceSSP * it.qty}</span>
                              </div>
                            ))}
                          </div>
                          <div className="border-t border-dashed border-slate-300 pt-2 space-y-1 text-[11px] font-bold">
                            <div className="flex justify-between">
                              <span>SUBTOTAL:</span>
                              <span>SSP {lastReceipt.subSSP}</span>
                            </div>
                            <div className="flex justify-between text-slate-500 text-[10px]">
                              <span>VAT (18%):</span>
                              <span>SSP {lastReceipt.vatSSP}</span>
                            </div>
                            <div className="flex justify-between text-xs font-black pt-1 border-t border-slate-300">
                              <span>TOTAL DUE:</span>
                              <span>SSP {lastReceipt.totalSSP}</span>
                            </div>
                            <div className="flex justify-between text-slate-500 text-[9.5px]">
                              <span>UGX CONVERSION:</span>
                              <span>UGX {lastReceipt.totalUGX}</span>
                            </div>
                            <div className="flex justify-between text-slate-500 text-[9.5px]">
                              <span>USD CONVERSION:</span>
                              <span>USD {lastReceipt.totalUSD}</span>
                            </div>
                          </div>
                          <div className="text-center border-t border-dashed border-slate-300 pt-2 text-[8px] space-y-0.5 text-slate-500">
                            <p>PAID VIA: {lastReceipt.paymentMethod.toUpperCase()}</p>
                            <p>m-GURUSH RECONCILIATION ID SUCCESSFUL</p>
                            <p className="font-bold text-[9px] text-slate-900 mt-1">*** SHUKRAN / THANK YOU ***</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}


                {/* ==============================================
                     2. PRODUCT: NILESCHOOL PORTAL
                     ============================================== */}
                {productId === "nileschool" && (
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 text-left">
                    {/* Left 7 Cols: Student list & register payout */}
                    <div className="lg:col-span-7 space-y-4">
                      
                      {/* Fees payout recorder card */}
                      <div className="bg-slate-850 p-4 sm:p-5 rounded-2xl border border-slate-800 space-y-4">
                        <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
                          <BookOpen className="w-5 h-5 text-indigo-400" />
                          <div>
                            <h4 className="font-extrabold text-white text-xs">Record Student Fee Payout</h4>
                            <p className="text-[10px] text-slate-400">Record a tuition payment directly to the school ledger.</p>
                          </div>
                        </div>

                        <form onSubmit={handleSchoolPayment} className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                          <div>
                            <label className="block text-[10px] text-slate-400 mb-1">Target Pupil / Student</label>
                            <select
                              value={paymentStudentId}
                              onChange={(e) => setPaymentStudentId(e.target.value)}
                              className="w-full bg-slate-900 border border-slate-700 p-2 rounded-xl text-xs text-white outline-none"
                            >
                              {schoolStudents.map((stud) => (
                                <option key={stud.id} value={stud.id}>
                                  {stud.name} ({stud.class})
                                </option>
                              ))}
                            </select>
                          </div>

                          <div>
                            <label className="block text-[10px] text-slate-400 mb-1">Mobile Money Channel</label>
                            <select
                              value={schoolPayMethod}
                              onChange={(e) => setSchoolPayMethod(e.target.value)}
                              className="w-full bg-slate-900 border border-slate-700 p-2 rounded-xl text-xs text-white outline-none"
                            >
                              <option value="m-GURUSH">m-GURUSH MoMo (SSD)</option>
                              <option value="MTN MoMo">MTN Mobile Money (UGA)</option>
                              <option value="Airtel Money">Airtel Money (UGA)</option>
                              <option value="Bank Slip">Bank Teller Deposit Slip</option>
                            </select>
                          </div>

                          <div>
                            <label className="block text-[10px] text-slate-400 mb-1">Amount SSP</label>
                            <input
                              type="number"
                              value={paymentAmountSSP}
                              onChange={(e) => {
                                const val = parseInt(e.target.value) || 0;
                                setPaymentAmountSSP(val);
                                setPaymentAmountUSD(Math.round(val / 380));
                              }}
                              className="w-full bg-slate-900 border border-slate-700 p-2 rounded-xl text-xs text-white outline-none"
                            />
                          </div>

                          <div>
                            <label className="block text-[10px] text-slate-400 mb-1">Equivalent USD</label>
                            <input
                              type="number"
                              value={paymentAmountUSD}
                              onChange={(e) => {
                                const val = parseInt(e.target.value) || 0;
                                setPaymentAmountUSD(val);
                                setPaymentAmountSSP(val * 380);
                              }}
                              className="w-full bg-slate-900 border border-slate-700 p-2 rounded-xl text-xs text-white outline-none"
                            />
                          </div>

                          <div className="sm:col-span-2 pt-2">
                            <button
                              type="submit"
                              className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl transition cursor-pointer text-xs"
                            >
                              Post & Reconcile Mobile Money Payout
                            </button>
                          </div>
                        </form>
                      </div>

                      {/* school students current list */}
                      <div className="bg-slate-850 p-4 rounded-xl border border-slate-800 space-y-3">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Pupil / Student Outstanding Ledgers</span>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                          {schoolStudents.map((stud) => (
                            <div key={stud.id} className="bg-slate-900 border border-slate-800 p-3 rounded-xl flex flex-col justify-between">
                              <div>
                                <span className="text-[9px] text-indigo-400 font-bold font-mono block">{stud.id}</span>
                                <h5 className="text-white font-bold text-xs mt-1 leading-tight">{stud.name}</h5>
                                <p className="text-[9.5px] text-slate-500 mt-0.5">{stud.class}</p>
                              </div>
                              <div className="border-t border-slate-800/85 pt-2 mt-2 space-y-1">
                                <span className="text-[8px] text-slate-500 uppercase font-black block">Fees Balance</span>
                                <span className={`font-black text-xs block ${stud.balanceUSD > 0 ? "text-amber-400" : "text-emerald-400"}`}>
                                  ${stud.balanceUSD} <span className="text-[9px] text-slate-400">/ SSP {stud.balanceSSP.toLocaleString()}</span>
                                </span>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setActiveReportCardStudent(stud);
                                    setSystemLogs((prev) => [...prev, `[NileSchool] Generating Terminal Report Card preview for ${stud.name}`]);
                                  }}
                                  className="text-[9px] text-indigo-400 underline hover:text-white cursor-pointer mt-1 font-bold block"
                                >
                                  View Report Card
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Right 5 Cols: Fees Ledger log & Mock report card */}
                    <div className="lg:col-span-5 space-y-4">
                      {/* Fees Ledger */}
                      <div className="bg-slate-850 p-4 rounded-xl border border-slate-800 space-y-3">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Tuition collection Ledger (MTN / m-GURUSH)</span>
                        <div className="space-y-1.5 max-h-[160px] overflow-y-auto">
                          {schoolLedger.map((record) => (
                            <div key={record.id} className="p-2 bg-slate-900/60 rounded-lg border border-slate-800 text-[11px] flex justify-between items-center">
                              <div>
                                <p className="font-bold text-white leading-tight">{record.studentName}</p>
                                <span className="text-[9px] text-slate-400">{record.time} | <strong>{record.method}</strong></span>
                              </div>
                              <div className="text-right">
                                <span className="text-emerald-400 font-bold block">+${record.amountUSD}</span>
                                <span className="bg-emerald-500/10 text-emerald-400 text-[8px] font-bold px-1 rounded-md uppercase">reconciled</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* REPORT CARD VIEWER */}
                      {activeReportCardStudent && (
                        <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 text-xs font-serif relative">
                          <button
                            onClick={() => setActiveReportCardStudent(null)}
                            className="absolute top-2 right-2 p-1 bg-slate-900 text-slate-400 hover:text-white rounded-lg transition"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                          
                          <div className="text-center space-y-0.5 font-sans border-b border-slate-800 pb-2 mb-2">
                            <h5 className="font-extrabold text-indigo-400 uppercase tracking-wider text-[11px]">NILE VALLEY ACADEMY JŪBA</h5>
                            <p className="text-[9px] text-slate-400 font-serif">"Light of Knowledge on the River Nile"</p>
                            <p className="text-[9px] uppercase mt-1 font-bold text-white">Pupil: {activeReportCardStudent.name}</p>
                          </div>
                          <div className="space-y-1 font-sans text-[10px] text-slate-300">
                            <div className="flex justify-between border-b border-slate-900 py-1">
                              <span>Class Grade Level:</span>
                              <span className="font-bold">{activeReportCardStudent.class}</span>
                            </div>
                            <div className="flex justify-between border-b border-slate-900 py-1">
                              <span>Mathematics Score:</span>
                              <span className="font-extrabold text-emerald-400">92% (Excellent / Grade A)</span>
                            </div>
                            <div className="flex justify-between border-b border-slate-900 py-1">
                              <span>English Studies:</span>
                              <span className="font-extrabold text-emerald-400">88% (Excellent / Grade A)</span>
                            </div>
                            <div className="flex justify-between border-b border-slate-900 py-1">
                              <span>Social Sciences:</span>
                              <span className="font-extrabold text-amber-400">79% (Very Good / Grade B)</span>
                            </div>
                            <div className="flex justify-between py-1">
                              <span>Principal Remarks:</span>
                              <span className="font-serif italic text-indigo-300">"Highly diligent and disciplined pupil."</span>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}


                {/* ==============================================
                     3. PRODUCT: KAMPALABAR MANAGER
                     ============================================== */}
                {productId === "kampalabar" && (
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 text-left">
                    {/* Left 7 Columns: Pub Floor Grid Layout */}
                    <div className="lg:col-span-7 space-y-4">
                      <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                        <span className="text-xs font-black text-indigo-400 uppercase tracking-wider flex items-center gap-1.5">
                          <Wine className="w-4 h-4" />
                          <span>Interactive Pub Floor Plan layout (Kampala)</span>
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        {barTables.map((t) => (
                          <div
                            key={t.id}
                            onClick={() => handleSelectBarTable(t)}
                            className={`p-4 rounded-2xl border transition text-left cursor-pointer space-y-3 ${
                              selectedBarTable?.id === t.id
                                ? "bg-indigo-600/10 border-indigo-500"
                                : t.status === "occupied"
                                ? "bg-slate-850 border-amber-500/40 hover:bg-slate-800"
                                : "bg-slate-850 border-slate-800 hover:bg-slate-800"
                            }`}
                          >
                            <div className="flex justify-between items-center">
                              <h5 className="font-bold text-white text-xs">{t.name}</h5>
                              <span className={`inline-block w-2.5 h-2.5 rounded-full ${
                                t.status === "occupied" ? "bg-amber-400 animate-pulse" : "bg-slate-700"
                              }`}></span>
                            </div>
                            <div>
                              <span className="text-[10px] text-slate-500 uppercase font-black block">Table Tab Balance</span>
                              <span className="font-mono text-xs font-bold text-white">
                                {t.status === "occupied" ? `UGX ${t.billUGX.toLocaleString()}` : "UGX 0 (No active drink bills)"}
                              </span>
                            </div>
                            <span className="text-[9.5px] text-indigo-400 hover:underline block font-bold">Manage Beverages →</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Right 5 Columns: Current Table Active Tab Controls */}
                    <div className="lg:col-span-5 space-y-4">
                      {selectedBarTable ? (
                        <div className="bg-slate-850 border border-slate-800 p-5 rounded-2xl space-y-4">
                          <div className="border-b border-slate-800 pb-3">
                            <h4 className="font-extrabold text-white text-xs">{selectedBarTable.name}</h4>
                            <span className="text-[9.5px] bg-amber-500/10 text-amber-400 px-2 py-0.5 rounded-md font-bold uppercase mt-1 inline-block">Active guest tab</span>
                          </div>

                          <div className="space-y-2">
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Current Drink Check list</span>
                            {selectedBarTable.items.length === 0 ? (
                              <p className="text-xs text-slate-500 py-4">No drinks logged for this table. Tap beverages below to add.</p>
                            ) : (
                              <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                                {selectedBarTable.items.map((item: any, idx: number) => (
                                  <div key={idx} className="flex justify-between text-xs bg-slate-900/60 p-2 rounded-lg border border-slate-800 font-mono">
                                    <span className="text-white font-sans">{item.name} (x{item.qty})</span>
                                    <span className="text-slate-400">UGX {(item.price * item.qty).toLocaleString()}</span>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>

                          {/* Quick Add Beverage touch items */}
                          <div className="space-y-2">
                            <span className="text-[9.5px] font-black text-slate-500 uppercase block">Beverage Counter Rack (Tap to Add)</span>
                            <div className="grid grid-cols-2 gap-2 text-[10px] font-bold">
                              {[
                                { name: "Nile Special Beer", price: 5000 },
                                { name: "Club Premium Lager", price: 5000 },
                                { name: "Bell Lager Premium", price: 5000 },
                                { name: "Uganda Waragi 250ml", price: 12000 }
                              ].map((bev, i) => (
                                <button
                                  key={i}
                                  onClick={() => addDrinkToTable(bev.name, bev.price)}
                                  className="py-1.5 px-2 bg-slate-900 border border-slate-800 hover:border-indigo-500 text-slate-300 rounded-lg hover:text-white transition cursor-pointer text-left"
                                >
                                  {bev.name}
                                </button>
                              ))}
                            </div>
                          </div>

                          {selectedBarTable.billUGX > 0 && (
                            <div className="border-t border-slate-800 pt-3 space-y-3">
                              <div className="flex justify-between text-xs">
                                <span className="text-slate-400 font-bold uppercase">Total Table Bill:</span>
                                <span className="text-emerald-400 font-black text-sm font-mono">UGX {selectedBarTable.billUGX.toLocaleString()}</span>
                              </div>

                              {/* Split Bill section */}
                              <div className="bg-slate-900 border border-slate-800 p-2.5 rounded-xl space-y-2 text-xs text-left">
                                <div className="flex justify-between items-center">
                                  <span className="text-slate-400 text-[10px] font-bold uppercase">Split Bill Calculator</span>
                                  <div className="flex items-center gap-1">
                                    <button
                                      onClick={() => setSplitCount(Math.max(2, splitCount - 1))}
                                      className="px-1.5 py-0.5 bg-slate-800 text-slate-400 rounded hover:text-white"
                                    >
                                      -
                                    </button>
                                    <span className="font-bold text-white px-1.5">{splitCount}</span>
                                    <button
                                      onClick={() => setSplitCount(Math.min(6, splitCount + 1))}
                                      className="px-1.5 py-0.5 bg-slate-800 text-slate-400 rounded hover:text-white"
                                    >
                                      +
                                    </button>
                                  </div>
                                </div>
                                <div className="flex justify-between items-center text-[11px] border-t border-slate-800/80 pt-1.5 font-bold">
                                  <span className="text-slate-500">Each Pays:</span>
                                  <span className="text-indigo-400 font-mono">UGX {Math.round(selectedBarTable.billUGX / splitCount).toLocaleString()}</span>
                                </div>
                              </div>

                              <button
                                onClick={handleSettleBarTable}
                                className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-xl transition cursor-pointer"
                              >
                                Settle Bill via MTN/Airtel MoMo QR
                              </button>
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="bg-slate-850 border border-slate-800 p-8 text-center rounded-2xl h-full flex flex-col justify-center items-center text-slate-500 space-y-2">
                          <Wine className="w-10 h-10 text-slate-700" />
                          <p className="text-xs">Select any table layout on the floor map to manage beverage bills and split accounts.</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}


                {/* ==============================================
                     4. PRODUCT: SUDDHOTEL PMS
                     ============================================== */}
                {productId === "suddhotel" && (
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 text-left">
                    {/* Left 7 Columns: Reservation grid & Check-in form */}
                    <div className="lg:col-span-7 space-y-4">
                      
                      {/* Check-In form */}
                      <div className="bg-slate-850 p-4 rounded-2xl border border-slate-800 space-y-3">
                        <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
                          <Calendar className="w-4 h-4 text-indigo-400" />
                          <h4 className="font-extrabold text-white text-xs">New Guest Check-In Registry</h4>
                        </div>

                        <form onSubmit={handleHotelCheckIn} className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                          <div>
                            <label className="block text-[10px] text-slate-400 mb-1">Full Guest Name</label>
                            <input
                              type="text"
                              required
                              placeholder="e.g. John Deng"
                              value={checkInName}
                              onChange={(e) => setCheckInName(e.target.value)}
                              className="w-full bg-slate-900 border border-slate-700 p-2 rounded-xl text-white outline-none"
                            />
                          </div>

                          <div>
                            <label className="block text-[10px] text-slate-400 mb-1">Passport / National ID</label>
                            <input
                              type="text"
                              required
                              placeholder="Passport reference..."
                              value={checkInPassport}
                              onChange={(e) => setCheckInPassport(e.target.value)}
                              className="w-full bg-slate-900 border border-slate-700 p-2 rounded-xl text-white outline-none font-mono"
                            />
                          </div>

                          <div>
                            <label className="block text-[10px] text-slate-400 mb-1">Country of Origin</label>
                            <select
                              value={checkInCountry}
                              onChange={(e) => setCheckInCountry(e.target.value)}
                              className="w-full bg-slate-900 border border-slate-700 p-2 rounded-xl text-white outline-none"
                            >
                              <option value="South Sudan">South Sudan</option>
                              <option value="Uganda">Uganda</option>
                              <option value="Kenya">Kenya</option>
                              <option value="United Kingdom">United Kingdom</option>
                              <option value="United States">United States</option>
                            </select>
                          </div>

                          <div>
                            <label className="block text-[10px] text-slate-400 mb-1">Select Room Allocation</label>
                            <select
                              value={checkInRoomNum}
                              onChange={(e) => setCheckInRoomNum(e.target.value)}
                              className="w-full bg-slate-900 border border-slate-700 p-2 rounded-xl text-white outline-none"
                            >
                              {hotelRooms.map((r) => (
                                <option key={r.num} value={r.num}>
                                  Room {r.num} - {r.type} ({r.status})
                                </option>
                              ))}
                            </select>
                          </div>

                          <div className="sm:col-span-2 pt-1.5">
                            <button
                              type="submit"
                              className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl transition text-xs"
                            >
                              Check-In & Generate Alien Record
                            </button>
                          </div>
                        </form>
                      </div>

                      {/* Room occupancy grid */}
                      <div className="bg-slate-850 p-4 rounded-xl border border-slate-800 space-y-3">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Room Booking status grid</span>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                          {hotelRooms.map((room) => (
                            <div key={room.num} className="bg-slate-900 border border-slate-800 p-3 rounded-xl space-y-2">
                              <div className="flex justify-between">
                                <span className="text-white font-extrabold text-xs">Room {room.num}</span>
                                <span className={`text-[8.5px] font-bold px-1.5 py-0.5 rounded-md uppercase ${
                                  room.status === "occupied" ? "bg-amber-500/15 text-amber-400" : "bg-emerald-500/15 text-emerald-400"
                                }`}>
                                  {room.status}
                                </span>
                              </div>
                              <p className="text-[10px] text-slate-500 leading-none">{room.type}</p>
                              
                              {room.status === "occupied" && (
                                <div className="border-t border-slate-800/80 pt-2 mt-2 space-y-1">
                                  <span className="text-[9px] text-indigo-300 font-bold block truncate">{room.guestName}</span>
                                  <span className="text-[8.5px] text-slate-500 block">Nat: {room.country}</span>
                                  <button
                                    onClick={() => {
                                      setAlienReportMockup({
                                        guestName: room.guestName,
                                        passport: room.passport,
                                        country: room.country,
                                        roomNum: room.num,
                                        checkInDate: room.checkIn,
                                        refNumber: `SS-MOI-2026-${Math.floor(10000 + Math.random() * 90000)}`
                                      });
                                    }}
                                    className="text-[9px] text-indigo-400 hover:underline font-bold block text-left"
                                  >
                                    View Security declaration →
                                  </button>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Right 5 Columns: Official alien registration mock output */}
                    <div className="lg:col-span-5 space-y-4">
                      {alienReportMockup ? (
                        <div className="bg-white text-slate-950 p-5 rounded-xl text-left text-[10px] border border-slate-300 shadow-2xl relative space-y-3.5 font-serif">
                          <div className="absolute top-2 right-2 bg-slate-100 text-slate-800 px-2 py-0.5 rounded font-sans text-[8px] font-bold border border-slate-200">
                            OFFICIAL COMPLIANCE
                          </div>

                          <div className="text-center font-sans space-y-0.5 border-b border-double border-slate-400 pb-3">
                            <h5 className="font-extrabold text-[11px] tracking-wider uppercase">REPUBLIC OF SOUTH SUDAN</h5>
                            <h6 className="font-bold text-[9.5px] text-slate-700 uppercase">MINISTRY OF INTERIOR</h6>
                            <p className="text-[8px] text-slate-500 font-serif">DIRECTORATE OF NATIONALITY, PASSPORTS & IMMIGRATION</p>
                            <p className="font-bold font-mono text-[9px] text-slate-800 mt-2">REGISTRATION NO: {alienReportMockup.refNumber}</p>
                          </div>

                          <div className="space-y-2 text-slate-800 font-sans leading-relaxed">
                            <p className="italic font-serif text-[10.5px]">This form certifies registration of guest at guesthouse/hotel premises in accordance with the Security and Alien Registry Act:</p>
                            <div className="space-y-1 bg-slate-50 p-2 rounded border border-slate-200 font-mono text-[9px]">
                              <p><strong>GUEST FULL NAME :</strong> {alienReportMockup.guestName.toUpperCase()}</p>
                              <p><strong>PASSPORT REF NO :</strong> {alienReportMockup.passport.toUpperCase()}</p>
                              <p><strong>NATIONALITY    :</strong> {alienReportMockup.country.toUpperCase()}</p>
                              <p><strong>ALLOCATED ROOM  :</strong> ROOM {alienReportMockup.roomNum}</p>
                              <p><strong>CHECK-IN DATE   :</strong> {alienReportMockup.checkInDate}</p>
                            </div>
                            <p className="text-[8px] text-slate-500">
                              * Verification complete. This registry form has been securely transmitted to Juba Central Immigration Database servers.
                            </p>
                          </div>

                          <div className="border-t border-dashed border-slate-300 pt-3 flex justify-between items-center font-sans text-[9px]">
                            <span className="text-emerald-700 font-bold flex items-center gap-1">
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>Verified Compliance</span>
                            </span>
                            <button
                              onClick={() => {
                                setSystemLogs((prev) => [...prev, `[SuddHotel] Successfully simulated printing compliance slip ${alienReportMockup.refNumber}`]);
                                alert("Simulation: Compliance Registration form printed successfully!");
                              }}
                              className="px-3 py-1 bg-slate-900 text-white hover:bg-indigo-600 rounded cursor-pointer font-bold transition flex items-center gap-1"
                            >
                              <Printer className="w-3 h-3" />
                              <span>Print Slip</span>
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="bg-slate-850 border border-slate-800 p-8 text-center rounded-2xl h-full flex flex-col justify-center items-center text-slate-500 space-y-2">
                          <ShieldCheck className="w-10 h-10 text-slate-700" />
                          <p className="text-xs">Once guests are checked in, our SuddHotel Property software generates official nationality reports automatically.</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}


                {/* ==============================================
                     5. FALLBACK / OTHER APPLICATIONS
                     ============================================== */}
                {productId !== "junubpos" && productId !== "nileschool" && productId !== "kampalabar" && productId !== "suddhotel" && (
                  <div className="bg-slate-850 border border-slate-800 p-6 rounded-2xl text-left space-y-6">
                    <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
                      <Briefcase className="w-6 h-6 text-indigo-400" />
                      <div>
                        <h4 className="font-extrabold text-white text-sm">{productName} Active Environment</h4>
                        <p className="text-xs text-slate-400">Integrated sub-modules and custom calculations for East African operations.</p>
                      </div>
                    </div>

                    {/* DYNAMIC SUB-PORTAL DEMO PER PRODUCT */}
                    {productId === "supaclinic" && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Clinic Patients */}
                        <div className="space-y-4">
                          <span className="text-xs font-black text-slate-400 uppercase tracking-widest block">Patient Electronic Health Cards</span>
                          <form onSubmit={handleClinicRegister} className="space-y-3 bg-slate-900/60 p-4 rounded-xl border border-slate-800 text-xs">
                            <p className="font-bold text-white text-[11px]">Register Patient & Prescription</p>
                            <input
                              type="text"
                              required
                              placeholder="Patient Full Name..."
                              value={clinicNewName}
                              onChange={(e) => setClinicNewName(e.target.value)}
                              className="w-full bg-slate-950 border border-slate-700 p-2 rounded-lg text-white"
                            />
                            <div className="grid grid-cols-2 gap-2">
                              <input
                                type="text"
                                placeholder="Diagnosis (e.g. Malaria)..."
                                value={clinicNewDiagnosis}
                                onChange={(e) => setClinicNewDiagnosis(e.target.value)}
                                className="bg-slate-950 border border-slate-700 p-2 rounded-lg text-white"
                              />
                              <input
                                type="text"
                                placeholder="Prescribed Medication..."
                                value={clinicNewPrescription}
                                onChange={(e) => setClinicNewPrescription(e.target.value)}
                                className="bg-slate-950 border border-slate-700 p-2 rounded-lg text-white"
                              />
                            </div>
                            <button type="submit" className="w-full py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg transition cursor-pointer">
                              Record Medical Entry
                            </button>
                          </form>
                        </div>

                        {/* Patient history cards list */}
                        <div className="space-y-2">
                          <span className="text-xs font-black text-slate-400 uppercase tracking-widest block">Active Patient medical queues</span>
                          <div className="space-y-2 max-h-[220px] overflow-y-auto">
                            {clinicPatients.map((p) => (
                              <div key={p.id} className="p-3 bg-slate-900 border border-slate-800 rounded-xl space-y-1">
                                <div className="flex justify-between items-center">
                                  <span className="font-bold text-white text-xs">{p.name} ({p.age} yrs)</span>
                                  <span className="text-[9px] bg-indigo-500/10 text-indigo-400 px-1.5 rounded font-mono">{p.id}</span>
                                </div>
                                <p className="text-[10px] text-slate-300"><strong>Diagnosis:</strong> {p.diagnosis}</p>
                                <p className="text-[10px] text-indigo-300 font-mono"><strong>Prescription:</strong> {p.prescription}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}

                    {productId === "quickpharma" && (
                      <QuickPharmaManager domain={domain} licenseKey={licenseKey} />
                    )}

                    {productId === "equatorhrm" && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs text-left">
                        {/* Salary Calculator inputs */}
                        <div className="bg-slate-900 p-5 rounded-xl border border-slate-800 space-y-4">
                          <p className="font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                            <Calculator className="w-4 h-4 text-indigo-400" />
                            <span>PAYE & Pension Payroll Worksheet</span>
                          </p>
                          <div className="space-y-3">
                            <div>
                              <label className="text-[10px] text-slate-400 block mb-1">Gross Monthly Salary (USD)</label>
                              <input
                                type="number"
                                value={hrmSalaryInput}
                                onChange={(e) => setHrmSalaryInput(Number(e.target.value) || 0)}
                                className="w-full bg-slate-950 border border-slate-700 p-2.5 rounded-lg text-white font-bold"
                              />
                            </div>
                            <div className="p-3 bg-slate-950 rounded-lg space-y-2 font-mono text-[11px] text-slate-300 border border-slate-800">
                              <div className="flex justify-between">
                                <span>PAYE Income Tax (15%):</span>
                                <span className="text-rose-400 font-bold">-${(hrmSalaryInput * 0.15).toFixed(2)}</span>
                              </div>
                              <div className="flex justify-between">
                                <span>NSSF Pension (8%):</span>
                                <span className="text-amber-400 font-bold">-${(hrmSalaryInput * 0.08).toFixed(2)}</span>
                              </div>
                              <div className="flex justify-between border-t border-slate-800 pt-1 text-white font-bold text-xs">
                                <span>Net Take-Home Pay:</span>
                                <span className="text-emerald-400">${(hrmSalaryInput * 0.77).toFixed(2)}</span>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Staff Roster */}
                        <div className="space-y-2">
                          <span className="text-xs font-black text-slate-400 uppercase tracking-widest block">Deployed Corporate Staff</span>
                          <div className="space-y-2 max-h-[220px] overflow-y-auto">
                            {[
                              { name: "Reagan Kulyako", dept: "Executive", role: "General Manager", salary: "$3,500" },
                              { name: "Grace Deng", dept: "HR & Finance", role: "Payroll Admin", salary: "$1,800" },
                              { name: "Peter Lado", dept: "Logistics", role: "Fleet Coordinator", salary: "$1,200" }
                            ].map((s, idx) => (
                              <div key={idx} className="p-3 bg-slate-900 border border-slate-800 rounded-xl flex justify-between items-center">
                                <div>
                                  <p className="font-bold text-white text-xs">{s.name}</p>
                                  <p className="text-[10px] text-slate-400">{s.dept} • {s.role}</p>
                                </div>
                                <span className="font-mono text-emerald-400 text-xs font-bold">{s.salary}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* JUBA PRINT MANAGER (DEFAULT SaaS LIVE APP) */}
                    {(productId === "jubaprint" || productId.includes("jubaprint") || productName.toLowerCase().includes("jubaprint") || productName.toLowerCase().includes("print") || productId === "app" || (!["supaclinic", "quickpharma", "equatorhrm"].includes(productId))) && (
                      <div className="w-full min-h-[680px] bg-white rounded-2xl overflow-hidden shadow-2xl text-slate-900">
                        <ErrorBoundary fallbackTitle="Service Unavailable">
                          <JubaPrintManager domain={domain} licenseKey={licenseKey} />
                        </ErrorBoundary>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* BOTTOM STATUS BAR */}
        <div className="bg-slate-950 px-4 py-3 border-t border-slate-800/80 flex items-center justify-between text-[10px] text-slate-400">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            <span>Local Database Server Replicas Online</span>
          </div>
          <span>Environment: <strong className="text-indigo-400 font-mono">junub-pos-center</strong></span>
        </div>
      </div>
    </div>
  );
}
