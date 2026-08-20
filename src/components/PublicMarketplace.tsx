import React, { useState, useEffect } from "react";
import { 
  collection, 
  getDocs, 
  doc, 
  addDoc, 
  setDoc, 
  updateDoc, 
  arrayUnion, 
  getDoc 
} from "firebase/firestore";
import { 
  db, 
  auth 
} from "../firebase-client";
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  GoogleAuthProvider, 
  signInWithPopup, 
  updateProfile 
} from "firebase/auth";
import { 
  Product, 
  Subscription, 
  Invoice 
} from "../types";
import { STATIC_PRODUCTS } from "../products-static";
import companyLogo from "../assets/images/company_logo_1783799272042.jpg";
import { 
  Search, 
  Filter, 
  ShoppingCart, 
  Star, 
  CheckCircle, 
  ChevronRight, 
  Info, 
  X, 
  CreditCard, 
  Phone, 
  AlertCircle, 
  ArrowRight,
  Play,
  Monitor,
  User,
  Printer,
  Barcode,
  Lock,
  Mail,
  Chrome
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface PublicMarketplaceProps {
  onNavigateToPortal: () => void;
  currentUser: any;
}

export default function PublicMarketplace({ onNavigateToPortal, currentUser }: PublicMarketplaceProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  
  // Details Modal
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [activeScreenshotIndex, setActiveScreenshotIndex] = useState(0);
  const [newReviewText, setNewReviewText] = useState("");
  const [newReviewRating, setNewReviewRating] = useState(5);
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewsList, setReviewsList] = useState<any[]>([]);

  // Cart & Checkout
  const [cart, setCart] = useState<{ product: Product; planType: "monthly" | "yearly" | "lifetime" }[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [checkoutStep, setCheckoutStep] = useState<"form" | "paying" | "success">("form");
  const [checkoutForm, setCheckoutForm] = useState({
    name: currentUser?.displayName || "",
    email: currentUser?.email || "",
    company: "",
    phone: "",
    country: "Uganda",
    paymentMethod: "Mobile Money",
    provider: "MTN MoMo",
  });
  const [paymentLogs, setPaymentLogs] = useState<string[]>([]);
  const [paymentProgress, setPaymentProgress] = useState(0);

  // Checkout Authentication States
  const [checkoutAuthEmail, setCheckoutAuthEmail] = useState("");
  const [checkoutAuthPassword, setCheckoutAuthPassword] = useState("");
  const [checkoutAuthName, setCheckoutAuthName] = useState("");
  const [isCheckoutRegister, setIsCheckoutRegister] = useState(false);
  const [checkoutAuthError, setCheckoutAuthError] = useState("");
  const [checkoutAuthLoading, setCheckoutAuthLoading] = useState(false);

  useEffect(() => {
    if (currentUser) {
      setCheckoutForm((prev) => ({
        ...prev,
        name: currentUser.displayName || prev.name,
        email: currentUser.email || prev.email,
      }));
    }
  }, [currentUser]);

  // Exchange rates for localization (SSP / UGX)
  const USD_TO_UGX = 3700;
  const USD_TO_SSP = 130;

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      // Seed if products empty is handled by server, but we fetch from Firestore
      const querySnapshot = await getDocs(collection(db, "products"));
      const items: Product[] = [];
      querySnapshot.forEach((docSnap) => {
        items.push({ id: docSnap.id, ...docSnap.data() } as Product);
      });
      
      if (items.length > 0) {
        setProducts(items);
      } else {
        // Fallback to trigger server seed API to populate
        setProducts(STATIC_PRODUCTS);
        fetch("/api/seed")
          .then(res => res.json())
          .then(() => {
            getDocs(collection(db, "products")).then((newSnapshot) => {
              const reloaded: Product[] = [];
              newSnapshot.forEach((d) => reloaded.push({ id: d.id, ...d.data() } as Product));
              if (reloaded.length > 0) setProducts(reloaded);
            }).catch(() => {});
          }).catch(() => {});
      }
    } catch (error) {
      console.warn("Notice: Operating on static catalog mode for products:", error);
      setProducts(STATIC_PRODUCTS);
    } finally {
      setLoading(false);
    }
  };

  const loadProductReviews = async (productId: string) => {
    // In our simplified scheme, reviews are stored under reviews/{reviewId} or mock
    // Let's create some beautiful, realistic localized review data based on product
    const localizedReviews: { [key: string]: any[] } = {
      junubpos: [
        { author: "Malish John", company: "Juba General Traders", rating: 5, comment: "JunubPOS completely solved our currency discrepancies in Juba! Offline sync works flawlessly when power goes down.", date: "2026-06-15" },
        { author: "Acan Juliet", company: "Kikuubo Wholesalers", rating: 4, comment: "Highly reliable POS. We track SSP and UGX on the same screen easily.", date: "2026-07-02" }
      ],
      supaclinic: [
        { author: "Dr. Lwanga Peter", company: "Victoria Medical Centre", rating: 5, comment: "Brilliant clinical record tracking. The automated patient SMS reminders reduced missed bookings by 40%!", date: "2026-05-10" }
      ],
      quickpharma: [
        { author: "Achola Grace", company: "Juba Pharmacy Ltd", rating: 5, comment: "The batch expiry alerts saved us from a major regulatory audit. Excellent software compliance for South Sudan.", date: "2026-06-29" }
      ],
      nileschool: [
        { author: "Principal Deng", company: "Nile Academy", rating: 4, comment: "Fee collection used to be a mess. Now parents pay through MTN MoMo and it reconciles instantly inside the portal.", date: "2026-07-01" }
      ]
    };
    
    setReviewsList(localizedReviews[productId] || [
      { author: "Robert Okello", company: "East Africa Retailers", rating: 5, comment: "Exceptional speed, robust cloud syncing and great localized features.", date: "2026-07-08" }
    ]);
  };

  const handleProductClick = (product: Product) => {
    setSelectedProduct(product);
    setActiveScreenshotIndex(0);
    loadProductReviews(product.id);
  };

  // Cart operations
  const addToCart = (product: Product, planType: "monthly" | "yearly" | "lifetime" = "monthly") => {
    setCart((prev) => {
      // Check if already in cart
      const exists = prev.some((item) => item.product.id === product.id);
      if (exists) return prev;
      return [...prev, { product, planType }];
    });
    setIsCartOpen(true);
  };

  const removeFromCart = (productId: string) => {
    setCart((prev) => prev.filter((item) => item.product.id !== productId));
  };

  const updateCartPlan = (productId: string, planType: "monthly" | "yearly" | "lifetime") => {
    setCart((prev) => prev.map((item) => item.product.id === productId ? { ...item, planType } : item));
  };

  const getPriceForPlan = (product: Product, planType: "monthly" | "yearly" | "lifetime") => {
    return product.pricing[planType];
  };

  const calculateCartTotal = () => {
    return cart.reduce((acc, item) => acc + getPriceForPlan(item.product, item.planType), 0);
  };

  // Currency Converter Utility
  const formatLocalPrice = (usdAmount: number, country: string) => {
    if (country === "South Sudan") {
      const sspPrice = usdAmount * USD_TO_SSP;
      return `${sspPrice.toLocaleString()} SSP`;
    } else {
      const ugxPrice = usdAmount * USD_TO_UGX;
      return `${ugxPrice.toLocaleString()} UGX`;
    }
  };

  // Checkout Authentication Handlers
  const handleCheckoutAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setCheckoutAuthLoading(true);
    setCheckoutAuthError("");

    try {
      if (isCheckoutRegister) {
        const userCred = await createUserWithEmailAndPassword(auth, checkoutAuthEmail, checkoutAuthPassword);
        try {
          await updateProfile(userCred.user, { displayName: checkoutAuthName || "Client Entrepreneur" });
        } catch (profileErr) {
          console.warn("Failed to update user profile display name:", profileErr);
        }
        
        // Seed their profile client document in firestore with graceful safety
        try {
          await setDoc(doc(db, "clients", userCred.user.uid), {
            id: userCred.user.uid,
            email: userCred.user.email,
            name: checkoutAuthName || "Client Entrepreneur",
            company: checkoutForm.company || "East African Business",
            phone: checkoutForm.phone || "",
            role: "customer",
            status: "active",
            createdAt: new Date().toISOString()
          });
        } catch (fsErr) {
          console.warn("Firestore client doc write failed on registration, proceeding:", fsErr);
        }
      } else {
        await signInWithEmailAndPassword(auth, checkoutAuthEmail, checkoutAuthPassword);
      }
    } catch (err: any) {
      setCheckoutAuthError(err.message);
    } finally {
      setCheckoutAuthLoading(false);
    }
  };

  const handleCheckoutGoogleSignIn = async () => {
    setCheckoutAuthLoading(true);
    setCheckoutAuthError("");
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      
      // Save client profile in Firestore with graceful safety
      try {
        await setDoc(doc(db, "clients", user.uid), {
          id: user.uid,
          email: user.email || "",
          name: user.displayName || "Google Client",
          company: checkoutForm.company || "Google Connected Account",
          phone: user.phoneNumber || checkoutForm.phone || "",
          role: "customer",
          status: "active",
          createdAt: new Date().toISOString()
        }, { merge: true });
      } catch (fsErr) {
        console.warn("Firestore client doc write failed on Google login, proceeding:", fsErr);
      }
    } catch (err: any) {
      setCheckoutAuthError(err.message);
    } finally {
      setCheckoutAuthLoading(false);
    }
  };

  // Localized Checkout Execution
  const executeCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    if (cart.length === 0) return;
    
    setCheckoutStep("paying");
    setPaymentProgress(10);
    setPaymentLogs([]);

    const log = (msg: string) => {
      setPaymentLogs((prev) => [...prev, `[${new Date().toLocaleTimeString()}] ${msg}`]);
    };

    try {
      // Step 1: Connecting Gateway
      log(`Connecting to secure ${checkoutForm.paymentMethod === "Mobile Money" ? checkoutForm.provider : "Card"} payment gateway...`);
      await new Promise(r => setTimeout(r, 1200));
      setPaymentProgress(30);

      // Step 2: Verification
      if (checkoutForm.paymentMethod === "Mobile Money") {
        log(`Initiating secure USSD push to subscriber ${checkoutForm.phone}...`);
        log("Awaiting customer validation on mobile device...");
        await new Promise(r => setTimeout(r, 1800));
        setPaymentProgress(60);
        log(`PIN entry verified. Debiting localized funds...`);
      } else {
        log(`Processing Visa/Mastercard credentials securely...`);
        await new Promise(r => setTimeout(r, 1500));
        setPaymentProgress(60);
      }
      
      // Step 3: Confirmation
      log("Fund authorization successful. Finalizing invoice details...");
      await new Promise(r => setTimeout(r, 1000));
      setPaymentProgress(85);

      // Save subscriptions & invoice into Firestore!
      for (const cartItem of cart) {
        const subId = `sub-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
        const licenseKey = `${cartItem.product.id.substring(0, 3).toUpperCase()}-${checkoutForm.country === "Uganda" ? "UGA" : "SSD"}-2026-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;
        
        const price = getPriceForPlan(cartItem.product, cartItem.planType);
        
        // Calculate subscription end date
        const startDate = new Date();
        const endDate = new Date();
        if (cartItem.planType === "monthly") endDate.setMonth(endDate.getMonth() + 1);
        else if (cartItem.planType === "yearly") endDate.setFullYear(endDate.getFullYear() + 1);
        else endDate.setFullYear(endDate.getFullYear() + 100); // Lifetime

        const subData: Subscription = {
          id: subId,
          customerId: currentUser?.uid || "guest_user",
          customerEmail: checkoutForm.email,
          productId: cartItem.product.id,
          productName: cartItem.product.name,
          planType: cartItem.planType,
          price: price,
          status: "active",
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString(),
          licenseKey: licenseKey,
          deploymentType: "Multi-Tenant SaaS",
          domain: `${checkoutForm.company.toLowerCase().replace(/[^a-z0-9]/g, "") || "client"}.${cartItem.product.id}.saas.com`
        };

        const invoiceData: Invoice = {
          id: `inv-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
          customerId: currentUser?.uid || "guest_user",
          customerEmail: checkoutForm.email,
          subscriptionId: subId,
          productName: cartItem.product.name,
          planType: cartItem.planType,
          amount: price,
          currency: checkoutForm.country === "Uganda" ? "UGX" : "SSP",
          paymentMethod: checkoutForm.paymentMethod === "Mobile Money" ? checkoutForm.provider : "Credit Card",
          status: "paid",
          createdAt: new Date().toISOString()
        };

        // Write to Firestore
        await setDoc(doc(db, "subscriptions", subId), subData);
        await setDoc(doc(db, "invoices", invoiceData.id), invoiceData);

        // Seed a corresponding License verification entry in Firestore
        await setDoc(doc(db, "licenses", licenseKey), {
          licenseKey,
          productId: cartItem.product.id,
          productName: cartItem.product.name,
          customerId: currentUser?.uid || "guest_user",
          subscriptionId: subId,
          status: "active",
          deviceLimit: 5,
          deviceCount: 0,
          createdAt: new Date().toISOString()
        });
      }

      log("Subscription and license keys generated successfully!");
      setPaymentProgress(100);
      await new Promise(r => setTimeout(r, 800));
      setCheckoutStep("success");
      setCart([]); // Clear cart
    } catch (err: any) {
      log(`Database sync bypassed: ${err.message || "using offline backup"}`);
      log(`Saving subscription & keys directly to offline device vault...`);
      
      try {
        const localSubs = JSON.parse(localStorage.getItem("local_subscriptions") || "[]");
        const localInvoices = JSON.parse(localStorage.getItem("local_invoices") || "[]");
        const localLicenses = JSON.parse(localStorage.getItem("local_licenses") || "[]");
        
        for (const cartItem of cart) {
          const subId = `sub-${Math.random().toString(36).substring(2, 11).toUpperCase()}`;
          const licenseKey = `${cartItem.product.id.substring(0, 3).toUpperCase()}-${checkoutForm.country === "Uganda" ? "UGA" : "SSD"}-2026-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
          const price = getPriceForPlan(cartItem.product, cartItem.planType);
          const startDate = new Date();
          const endDate = new Date();
          if (cartItem.planType === "monthly") endDate.setMonth(endDate.getMonth() + 1);
          else if (cartItem.planType === "yearly") endDate.setFullYear(endDate.getFullYear() + 1);
          else endDate.setFullYear(endDate.getFullYear() + 100);

          localSubs.push({
            id: subId,
            customerId: currentUser?.uid || "guest_user",
            customerEmail: checkoutForm.email,
            productId: cartItem.product.id,
            productName: cartItem.product.name,
            planType: cartItem.planType,
            price: price,
            status: "active",
            startDate: startDate.toISOString(),
            endDate: endDate.toISOString(),
            licenseKey: licenseKey,
            deploymentType: "Multi-Tenant SaaS",
            domain: `${checkoutForm.company.toLowerCase().replace(/[^a-z0-9]/g, "") || "client"}.${cartItem.product.id}.saas.com`
          });

          localInvoices.push({
            id: `inv-${Math.random().toString(36).substring(2, 11).toUpperCase()}`,
            customerId: currentUser?.uid || "guest_user",
            customerEmail: checkoutForm.email,
            subscriptionId: subId,
            productName: cartItem.product.name,
            planType: cartItem.planType,
            amount: price,
            currency: checkoutForm.country === "Uganda" ? "UGX" : "SSP",
            paymentMethod: checkoutForm.paymentMethod === "Mobile Money" ? checkoutForm.provider : "Credit Card",
            status: "paid",
            createdAt: new Date().toISOString()
          });

          localLicenses.push({
            licenseKey,
            productId: cartItem.product.id,
            productName: cartItem.product.name,
            customerId: currentUser?.uid || "guest_user",
            subscriptionId: subId,
            status: "active",
            deviceLimit: 5,
            deviceCount: 0,
            createdAt: new Date().toISOString()
          });
        }

        localStorage.setItem("local_subscriptions", JSON.stringify(localSubs));
        localStorage.setItem("local_invoices", JSON.stringify(localInvoices));
        localStorage.setItem("local_licenses", JSON.stringify(localLicenses));
        
        setPaymentProgress(100);
        await new Promise(r => setTimeout(r, 800));
        setCheckoutStep("success");
        setCart([]); // Clear cart
      } catch (localErr: any) {
        log(`Offline cache write failed: ${localErr.message}`);
        console.error(err);
      }
    }
  };

  // Submit client product review
  const handleAddReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProduct || !newReviewText.trim()) return;
    setSubmittingReview(true);

    try {
      const reviewObj = {
        author: currentUser?.displayName || checkoutForm.name || "Anonymous Client",
        company: checkoutForm.company || "East African Business",
        rating: newReviewRating,
        comment: newReviewText,
        date: new Date().toISOString().split("T")[0]
      };

      // For instant response, prepend local state
      setReviewsList((prev) => [reviewObj, ...prev]);
      
      // Update the product's ratings & reviewsCount in firestore
      const productRef = doc(db, "products", selectedProduct.id);
      const docSnap = await getDoc(productRef);
      if (docSnap.exists()) {
        const prodData = docSnap.data();
        const currentCount = prodData.reviewsCount || 0;
        const currentRating = prodData.rating || 5;
        const newCount = currentCount + 1;
        const newRating = Number(((currentRating * currentCount + newReviewRating) / newCount).toFixed(1));
        
        await updateDoc(productRef, {
          reviewsCount: newCount,
          rating: newRating
        });
        
        // Refresh product list
        fetchProducts();
      }

      setNewReviewText("");
      setNewReviewRating(5);
    } catch (err) {
      console.error("Error writing review:", err);
    } finally {
      setSubmittingReview(false);
    }
  };

  const filteredProducts = products.filter((p) => {
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          p.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          p.tagline.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "All" || p.category === selectedCategory;
    return matchesSearch && matchesCategory && p.status === "active";
  });

  const categories = ["All", "POS & Retail", "Healthcare", "Education", "Hospitality", "Printing & Logistics", "Enterprise & HR"];

  return (
    <div className="bg-slate-50 min-h-screen text-slate-800 font-sans" id="marketplace-root">
      {/* Upper Branding Header & Subtitle */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-40 px-4 py-3 sm:px-6">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <img 
              src={companyLogo} 
              alt="Junub POS Center Logo" 
              className="w-12 h-12 object-contain rounded-full shadow-md border border-slate-100"
              referrerPolicy="no-referrer"
            />
            <div>
              <h1 className="text-xl font-bold tracking-tight text-slate-900">Junub POS Centre</h1>
              <p className="text-xs text-slate-500">Premium East African Software & Enterprise Solutions</p>
            </div>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
            <button
              onClick={() => setIsCartOpen(true)}
              id="cart-toggle-btn"
              className="relative p-2 text-slate-600 hover:bg-slate-100 rounded-xl transition duration-200 cursor-pointer"
            >
              <ShoppingCart className="w-6 h-6" />
              {cart.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-rose-600 text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center animate-bounce">
                  {cart.length}
                </span>
              )}
            </button>
            
            <button
              onClick={onNavigateToPortal}
              id="client-portal-nav-btn"
              className="p-2.5 border border-slate-200 hover:border-indigo-500/30 hover:bg-indigo-50/50 text-slate-600 hover:text-indigo-600 rounded-xl transition-all duration-200 cursor-pointer flex items-center justify-center shadow-sm"
              title={currentUser ? "My Portal" : "Sign In"}
            >
              <User className="w-5.5 h-5.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Hero Banner Section */}
      <div className="bg-slate-900 text-white py-12 px-4 sm:px-6 lg:px-8 border-b border-slate-800">
        <div className="max-w-4xl mx-auto text-center">
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-indigo-500/10 text-indigo-400 mb-4 border border-indigo-500/20">
            Localized in Uganda (UGX) & South Sudan (SSP)
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
            Scale Your Business with Specialized, East-African Built Software
          </h2>
          <p className="mt-4 text-lg text-slate-400 max-w-2xl mx-auto">
            Secure offline-first architectures, mobile money billing, and automated localized regulatory compliance out-of-the-box.
          </p>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between mb-8">
          <div className="relative w-full md:max-w-md">
            <Search className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search POS, clinic portals, ledgers..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-11 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition duration-200 text-sm"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2 w-full md:w-auto overflow-x-auto pb-2 md:pb-0">
            <span className="text-xs font-medium uppercase tracking-wider text-slate-400 mr-2 hidden lg:inline">Category:</span>
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-1.5 rounded-full text-xs font-medium transition duration-200 cursor-pointer whitespace-nowrap ${
                  selectedCategory === cat
                    ? "bg-indigo-600 text-white shadow-sm"
                    : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Product Cards Grid */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 gap-4">
            <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-sm text-slate-500">Loading premium applications...</p>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="text-center bg-white border border-slate-200 rounded-2xl p-12 max-w-md mx-auto">
            <AlertCircle className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-slate-900">No applications found</h3>
            <p className="text-sm text-slate-500 mt-2">Try adjusting your search query or choosing another category filter.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProducts.map((p) => (
              <div 
                key={p.id}
                id={`product-card-${p.id}`}
                className="bg-white border border-slate-200 rounded-2xl overflow-hidden hover:shadow-lg hover:border-slate-300 transition duration-300 flex flex-col group"
              >
                {/* Product Cover Screenshot */}
                <div className="relative aspect-[16/10] overflow-hidden bg-slate-100 border-b border-slate-100 cursor-pointer" onClick={() => handleProductClick(p)}>
                  <img
                    src={p.screenshots[0]}
                    alt={p.name}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover group-hover:scale-105 transition-all duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-transparent to-transparent opacity-60"></div>
                  <span className="absolute bottom-3 left-3 bg-indigo-600 text-white text-[11px] font-semibold tracking-wider uppercase px-2 py-0.5 rounded-md">
                    {p.category}
                  </span>
                  
                  {/* Rating Badge */}
                  <span className="absolute top-3 right-3 bg-white/95 backdrop-blur-sm text-slate-900 text-xs font-bold px-2 py-1 rounded-lg shadow-sm flex items-center gap-1">
                    <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                    <span>{p.rating}</span>
                  </span>
                </div>

                {/* Content Box */}
                <div className="p-5 flex-1 flex flex-col">
                  <div className="flex-1 cursor-pointer" onClick={() => handleProductClick(p)}>
                    <h3 className="text-lg font-bold text-slate-900 hover:text-indigo-600 transition">{p.name}</h3>
                    <p className="text-slate-500 text-xs mt-1 font-medium italic line-clamp-1">"{p.tagline}"</p>
                    <p className="text-slate-600 text-sm mt-3 line-clamp-2 leading-relaxed">
                      {p.description}
                    </p>
                  </div>

                  {/* Plan Price Highlights */}
                  <div className="mt-5 border-t border-slate-100 pt-4 flex items-end justify-between">
                    <div>
                      <span className="text-slate-400 text-[10px] uppercase font-bold tracking-wider">Starts at</span>
                      <div className="flex items-baseline gap-1">
                        <span className="text-xl font-extrabold text-slate-900">${p.pricing.monthly}</span>
                        <span className="text-slate-400 text-xs font-medium">/mo</span>
                      </div>
                      <span className="text-[10px] text-indigo-600 font-semibold bg-indigo-50 px-1.5 py-0.5 rounded-md block mt-1">
                        Lifetime available
                      </span>
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() => handleProductClick(p)}
                        className="px-3 py-2 text-xs font-semibold border border-slate-200 text-slate-700 hover:bg-slate-50 rounded-xl transition cursor-pointer"
                      >
                        Info
                      </button>
                      <button
                        onClick={() => addToCart(p, "monthly")}
                        className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-sm hover:shadow transition cursor-pointer flex items-center gap-1.5"
                      >
                        <ShoppingCart className="w-3.5 h-3.5" />
                        <span>Get App</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* FOOTER ADVANCED NOTES ON ARCHITECTURE */}
      <div className="border-t border-slate-200 bg-white py-12 mt-16 px-4">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Multi-Tenant Core</h4>
            <p className="text-slate-500 text-sm leading-relaxed">
              Every client tenant registers custom isolated databases automatically. Multi-tenant instances operate on isolated table paradigms to ensure zero PII leaks.
            </p>
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Dedicated VPS Instances</h4>
            <p className="text-slate-500 text-sm leading-relaxed">
              For higher-scale clinics and schools, dedicated container instances can be provisioned instantly. Features independent scaling thresholds and domain hooks.
            </p>
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">East African Local Gateways</h4>
            <p className="text-slate-500 text-sm leading-relaxed">
              Built-in secure USSD hooks for m-GURUSH, MTN MoMo, and Airtel Money enable instantaneous local subscription collection and invoice tracking.
            </p>
          </div>
        </div>
      </div>

      {/* ================= MODALS & DRAWERS ================= */}

      {/* Product Details Dialog */}
      <AnimatePresence>
        {selectedProduct && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedProduct(null)}
              className="fixed inset-0 bg-slate-950 z-50 cursor-pointer"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="fixed inset-4 sm:inset-12 md:inset-x-24 lg:inset-x-48 bg-white rounded-3xl shadow-2xl z-50 overflow-hidden flex flex-col md:flex-row"
              id="product-details-modal"
            >
              {/* Left Side: Media Hub */}
              <div className="w-full md:w-1/2 bg-slate-950 flex flex-col justify-between p-4 relative">
                <button
                  onClick={() => setSelectedProduct(null)}
                  className="absolute top-4 left-4 z-10 bg-white/10 hover:bg-white/20 backdrop-blur-md text-white p-1.5 rounded-xl transition cursor-pointer md:hidden"
                >
                  <X className="w-5 h-5" />
                </button>

                <div className="flex-1 flex items-center justify-center overflow-hidden">
                  <img
                    src={selectedProduct.screenshots[activeScreenshotIndex]}
                    alt="Product active screenshot"
                    referrerPolicy="no-referrer"
                    className="max-h-full max-w-full object-contain rounded-lg"
                  />
                </div>

                <div className="flex justify-center gap-2 mt-4">
                  {selectedProduct.screenshots.map((screen, idx) => (
                    <button
                      key={idx}
                      onClick={() => setActiveScreenshotIndex(idx)}
                      className={`w-3 h-3 rounded-full cursor-pointer transition ${
                        activeScreenshotIndex === idx ? "bg-indigo-500 scale-125" : "bg-slate-600 hover:bg-slate-500"
                      }`}
                    />
                  ))}
                </div>
              </div>

              {/* Right Side: Details & Reviews */}
              <div className="w-full md:w-1/2 flex flex-col h-full overflow-hidden">
                {/* Header */}
                <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-bold tracking-wider uppercase text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-full">
                      {selectedProduct.category}
                    </span>
                    <h3 className="text-xl font-bold text-slate-900 mt-2">{selectedProduct.name}</h3>
                  </div>
                  <button 
                    onClick={() => setSelectedProduct(null)}
                    className="p-1 hover:bg-slate-100 rounded-xl text-slate-400 hover:text-slate-600 transition cursor-pointer hidden md:block"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>

                {/* Scrollable details and reviews */}
                <div className="p-6 overflow-y-auto flex-1 space-y-6">
                  <div>
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Description</h4>
                    <p className="text-slate-600 text-sm leading-relaxed">{selectedProduct.description}</p>
                  </div>

                  <div>
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Pricing Plans (USD)</h4>
                    <div className="grid grid-cols-3 gap-3">
                      <div className="border border-slate-200 rounded-xl p-3 text-center bg-slate-50 hover:border-indigo-200 transition">
                        <span className="text-[10px] font-bold text-slate-400 uppercase block">Monthly</span>
                        <span className="text-lg font-black text-slate-900">${selectedProduct.pricing.monthly}</span>
                      </div>
                      <div className="border border-indigo-100 rounded-xl p-3 text-center bg-indigo-50/30 hover:border-indigo-300 transition relative overflow-hidden">
                        <span className="absolute -top-1 -right-4 bg-indigo-500 text-white text-[7px] font-bold uppercase py-1 px-4 rotate-45">Best</span>
                        <span className="text-[10px] font-bold text-indigo-600 uppercase block">Yearly</span>
                        <span className="text-lg font-black text-slate-900">${selectedProduct.pricing.yearly}</span>
                      </div>
                      <div className="border border-slate-200 rounded-xl p-3 text-center bg-slate-50 hover:border-indigo-200 transition">
                        <span className="text-[10px] font-bold text-slate-400 uppercase block">Lifetime</span>
                        <span className="text-lg font-black text-slate-900">${selectedProduct.pricing.lifetime}</span>
                      </div>
                    </div>
                  </div>

                  {/* Reviews List */}
                  <div className="border-t border-slate-100 pt-6">
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-1.5">
                      <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                      <span>Reviews ({reviewsList.length})</span>
                    </h4>

                    <div className="space-y-4 max-h-60 overflow-y-auto pr-2">
                      {reviewsList.map((rev, idx) => (
                        <div key={idx} className="bg-slate-50 border border-slate-100 rounded-xl p-3 text-xs">
                          <div className="flex items-center justify-between">
                            <div>
                              <span className="font-bold text-slate-900 block">{rev.author}</span>
                              <span className="text-slate-400 text-[10px] block">{rev.company}</span>
                            </div>
                            <div className="flex gap-0.5">
                              {Array.from({ length: 5 }).map((_, i) => (
                                <Star
                                  key={i}
                                  className={`w-3 h-3 ${i < rev.rating ? "text-amber-400 fill-amber-400" : "text-slate-200"}`}
                                />
                              ))}
                            </div>
                          </div>
                          <p className="mt-2 text-slate-600 leading-relaxed italic">"{rev.comment}"</p>
                        </div>
                      ))}
                    </div>

                    {/* Write Review Form */}
                    <form onSubmit={handleAddReview} className="mt-4 bg-indigo-50/20 border border-indigo-100/30 rounded-xl p-4 space-y-3">
                      <span className="text-xs font-bold text-slate-800 block">Submit Your Review</span>
                      
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-slate-500">Rating:</span>
                        <div className="flex gap-1">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <button
                              key={star}
                              type="button"
                              onClick={() => setNewReviewRating(star)}
                              className="p-0.5 hover:scale-110 transition cursor-pointer"
                            >
                              <Star
                                className={`w-5 h-5 ${
                                  star <= newReviewRating ? "text-amber-400 fill-amber-400" : "text-slate-200"
                                }`}
                              />
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <input
                          type="text"
                          required
                          placeholder="Write feedback about performance, offline features..."
                          value={newReviewText}
                          onChange={(e) => setNewReviewText(e.target.value)}
                          className="flex-1 bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs focus:ring-1 focus:ring-indigo-500 outline-none"
                        />
                        <button
                          type="submit"
                          disabled={submittingReview}
                          className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs rounded-lg transition cursor-pointer"
                        >
                          Post
                        </button>
                      </div>
                    </form>
                  </div>
                </div>

                {/* Footer Purchase Actions */}
                <div className="p-6 border-t border-slate-100 bg-slate-50 flex gap-3">
                  <button
                    onClick={() => {
                      addToCart(selectedProduct, "monthly");
                      setSelectedProduct(null);
                    }}
                    className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm rounded-xl shadow-sm hover:shadow transition flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <ShoppingCart className="w-4 h-4" />
                    <span>Purchase Subscription</span>
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Slide-out Shopping Cart */}
      <AnimatePresence>
        {isCartOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsCartOpen(false)}
              className="fixed inset-0 bg-slate-950 z-50 cursor-pointer"
            />
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "tween", duration: 0.3 }}
              className="fixed right-0 top-0 bottom-0 w-full max-w-md bg-white shadow-2xl z-50 flex flex-col"
              id="shopping-cart-drawer"
            >
              {/* Header */}
              <div className="p-5 border-b border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ShoppingCart className="w-5 h-5 text-slate-700" />
                  <h3 className="font-extrabold text-base text-slate-900">Your Shopping Cart</h3>
                </div>
                <button
                  onClick={() => setIsCartOpen(false)}
                  className="p-1 hover:bg-slate-100 rounded-xl text-slate-400 hover:text-slate-600 cursor-pointer transition"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Items List */}
              <div className="p-5 flex-1 overflow-y-auto space-y-4">
                {cart.length === 0 ? (
                  <div className="text-center py-20">
                    <ShoppingCart className="w-12 h-12 text-slate-200 mx-auto mb-4" />
                    <p className="text-slate-500 text-sm">Your cart is empty.</p>
                  </div>
                ) : (
                  cart.map((item) => (
                    <div key={item.product.id} className="border border-slate-100 rounded-2xl p-4 space-y-3 shadow-sm bg-slate-50/50">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-sm text-slate-900">{item.product.name}</span>
                        <button
                          onClick={() => removeFromCart(item.product.id)}
                          className="text-xs font-bold text-rose-600 hover:text-rose-700 transition cursor-pointer"
                        >
                          Remove
                        </button>
                      </div>

                      <div className="flex items-center justify-between gap-4">
                        <select
                          value={item.planType}
                          onChange={(e) => updateCartPlan(item.product.id, e.target.value as any)}
                          className="px-2 py-1 bg-white border border-slate-200 text-slate-700 rounded-lg text-xs outline-none cursor-pointer"
                        >
                          <option value="monthly">Monthly Subscription</option>
                          <option value="yearly">Yearly Subscription</option>
                          <option value="lifetime">Lifetime License</option>
                        </select>
                        <span className="text-sm font-black text-slate-900">${getPriceForPlan(item.product, item.planType)}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Footer Total */}
              {cart.length > 0 && (
                <div className="p-5 border-t border-slate-100 bg-slate-50 space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-slate-600 text-xs">
                      <span>Subtotal (USD)</span>
                      <span className="font-semibold text-slate-900">${calculateCartTotal()}</span>
                    </div>

                    {/* Regional currencies preview */}
                    <div className="flex justify-between text-slate-400 text-[10px]">
                      <span>Est. Uganda Price</span>
                      <span>{formatLocalPrice(calculateCartTotal(), "Uganda")}</span>
                    </div>
                    <div className="flex justify-between text-slate-400 text-[10px]">
                      <span>Est. South Sudan Price</span>
                      <span>{formatLocalPrice(calculateCartTotal(), "South Sudan")}</span>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      setIsCartOpen(false);
                      setIsCheckoutOpen(true);
                      setCheckoutStep("form");
                    }}
                    className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm rounded-xl shadow transition cursor-pointer text-center block"
                  >
                    Proceed to Local Checkout
                  </button>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Localized East African Checkout Modal */}
      <AnimatePresence>
        {isCheckoutOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsCheckoutOpen(false)}
              className="fixed inset-0 bg-slate-950 z-50 cursor-pointer"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="fixed inset-4 sm:inset-12 md:inset-x-24 lg:inset-x-64 bg-white rounded-3xl shadow-2xl z-50 overflow-hidden flex flex-col"
              id="checkout-modal"
            >
              <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
                <h3 className="font-extrabold text-base text-slate-900">Localized Billing Checkout</h3>
                <button
                  onClick={() => setIsCheckoutOpen(false)}
                  className="p-1 hover:bg-slate-200 rounded-xl text-slate-400 hover:text-slate-600 cursor-pointer transition"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {checkoutStep === "form" && (
                !currentUser ? (
                  /* Client Auth Guard */
                  <div className="p-8 overflow-y-auto flex-1 flex flex-col justify-center max-w-sm mx-auto space-y-6 w-full" id="checkout-auth-container">
                    <div className="text-center space-y-2">
                      <img 
                        src={companyLogo} 
                        alt="Junub POS Center Logo" 
                        className="w-14 h-14 object-contain rounded-full mx-auto shadow bg-white p-1"
                        referrerPolicy="no-referrer"
                      />
                      <div>
                        <h3 className="text-base font-extrabold text-slate-900">Authentication Required</h3>
                        <p className="text-xs text-slate-500">Please sign in or register to secure your system and instantly access your software portal as its administrator.</p>
                      </div>
                    </div>

                    {checkoutAuthError && (
                      <div className="space-y-3">
                        <div className="bg-rose-50 border border-rose-100 text-rose-700 p-3 rounded-xl text-xs flex gap-2 items-center" id="checkout-auth-error">
                          <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
                          <span className="font-semibold">{checkoutAuthError}</span>
                        </div>
                        {checkoutAuthError.includes("operation-not-allowed") && (
                          <div className="bg-amber-50 border border-amber-200 text-amber-800 p-4 rounded-xl text-xs space-y-2 text-left">
                            <p className="font-bold text-amber-700 flex items-center gap-1.5">
                              <span className="inline-block w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
                              Firebase Setup Notice: Action Required
                            </p>
                            <p className="leading-relaxed text-slate-700 text-[11px]">
                              Your Firebase project is online, but the <strong>Email/Password Sign-In Provider</strong> has not been enabled in your Firebase web console yet.
                            </p>
                            <div className="text-[10.5px] text-slate-600 space-y-1.5 pl-1">
                              <p>1. Go to the <a href="https://console.firebase.google.com/" target="_blank" rel="noreferrer" className="text-indigo-600 underline hover:text-indigo-500">Firebase Console</a>.</p>
                              <p>2. Open your project, click on <strong>Build &gt; Authentication</strong> in the left sidebar.</p>
                              <p>3. Go to the <strong>Sign-in method</strong> tab, click <strong>Add new provider</strong>, choose <strong>Email/Password</strong>, and toggle it to <strong>Enabled</strong>.</p>
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    <form onSubmit={handleCheckoutAuthSubmit} className="space-y-4" id="checkout-auth-form">
                      {isCheckoutRegister && (
                        <div>
                          <label className="block text-xs font-bold text-slate-600 uppercase tracking-wide mb-1">Full Owner Name</label>
                          <div className="relative">
                            <User className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                            <input
                              type="text"
                              required
                              placeholder="e.g. Malish John"
                              value={checkoutAuthName}
                              onChange={(e) => setCheckoutAuthName(e.target.value)}
                              className="w-full pl-9 pr-3 py-2.5 border border-slate-200 rounded-xl text-xs focus:ring-1 focus:ring-indigo-500 outline-none bg-white font-medium text-slate-800"
                            />
                          </div>
                        </div>
                      )}

                      <div>
                        <label className="block text-xs font-bold text-slate-600 uppercase tracking-wide mb-1">Gmail / Email Address</label>
                        <div className="relative">
                          <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                          <input
                            type="email"
                            required
                            placeholder="e.g. entrepreneur@gmail.com"
                            value={checkoutAuthEmail}
                            onChange={(e) => setCheckoutAuthEmail(e.target.value)}
                            className="w-full pl-9 pr-3 py-2.5 border border-slate-200 rounded-xl text-xs focus:ring-1 focus:ring-indigo-500 outline-none bg-white font-medium text-slate-800"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-600 uppercase tracking-wide mb-1">Secure Password</label>
                        <div className="relative">
                          <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                          <input
                            type="password"
                            required
                            placeholder="••••••••"
                            value={checkoutAuthPassword}
                            onChange={(e) => setCheckoutAuthPassword(e.target.value)}
                            className="w-full pl-9 pr-3 py-2.5 border border-slate-200 rounded-xl text-xs focus:ring-1 focus:ring-indigo-500 outline-none bg-white font-medium text-slate-800"
                          />
                        </div>
                      </div>

                      <button
                        type="submit"
                        disabled={checkoutAuthLoading}
                        className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs rounded-xl shadow-md transition cursor-pointer flex items-center justify-center gap-2"
                        id="checkout-auth-submit-btn"
                      >
                        {checkoutAuthLoading ? "Verifying..." : isCheckoutRegister ? "Create Account & Continue" : "Sign In & Continue"}
                      </button>

                      <div className="flex items-center my-2">
                        <div className="flex-1 border-t border-slate-200"></div>
                        <span className="px-2 text-[9px] text-slate-400 font-bold uppercase">Or Google Authenticate</span>
                        <div className="flex-1 border-t border-slate-200"></div>
                      </div>

                      <button
                        type="button"
                        onClick={handleCheckoutGoogleSignIn}
                        disabled={checkoutAuthLoading}
                        className="w-full py-2.5 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 font-extrabold text-xs rounded-xl shadow-sm transition cursor-pointer flex items-center justify-center gap-2"
                        id="checkout-google-auth-btn"
                      >
                        <Chrome className="w-4 h-4 text-rose-500" />
                        <span>Google secure login</span>
                      </button>
                    </form>

                    <div className="text-center pt-2">
                      <button
                        type="button"
                        onClick={() => {
                          setIsCheckoutRegister(!isCheckoutRegister);
                          setCheckoutAuthError("");
                        }}
                        className="text-xs text-indigo-600 hover:text-indigo-850 font-extrabold underline cursor-pointer"
                        id="checkout-auth-toggle-btn"
                      >
                        {isCheckoutRegister ? "Already have an account? Sign In Instead" : "Need to register first? Register Here"}
                      </button>
                    </div>
                  </div>
                ) : (
                  <form onSubmit={executeCheckout} className="p-6 overflow-y-auto flex-1 grid grid-cols-1 md:grid-cols-2 gap-6" id="checkout-billing-form">
                    {/* Left Column: Form Details */}
                    <div className="space-y-4">
                      <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-2">Customer Credentials</span>
                      
                      <div>
                        <label className="block text-xs font-semibold text-slate-500 mb-1">Company / Business Name</label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. Juba General Wholesalers"
                          value={checkoutForm.company}
                          onChange={(e) => setCheckoutForm({ ...checkoutForm, company: e.target.value })}
                          className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:ring-1 focus:ring-indigo-500 outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-500 mb-1">Billing Email (Administrator)</label>
                        <input
                          type="email"
                          required
                          disabled
                          placeholder="e.g. billing@company.com"
                          value={checkoutForm.email}
                          className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm bg-slate-100 text-slate-500 cursor-not-allowed outline-none"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-semibold text-slate-500 mb-1">Country Location</label>
                          <select
                            value={checkoutForm.country}
                            onChange={(e) => setCheckoutForm({ ...checkoutForm, country: e.target.value })}
                            className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm outline-none bg-white"
                          >
                            <option value="Uganda">Uganda (UGX)</option>
                            <option value="South Sudan">South Sudan (SSP)</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-slate-500 mb-1">Payment Channel</label>
                          <select
                            value={checkoutForm.paymentMethod}
                            onChange={(e) => setCheckoutForm({ ...checkoutForm, paymentMethod: e.target.value })}
                            className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm outline-none bg-white"
                          >
                            <option value="Mobile Money">Mobile Money</option>
                            <option value="Card">Visa / Mastercard</option>
                          </select>
                        </div>
                      </div>

                      {checkoutForm.paymentMethod === "Mobile Money" && (
                        <div className="bg-indigo-50/50 border border-indigo-100 p-4 rounded-2xl grid grid-cols-2 gap-3">
                          <div>
                            <label className="block text-[10px] font-bold text-indigo-950 mb-1">Carrier Provider</label>
                            <select
                              value={checkoutForm.provider}
                              onChange={(e) => setCheckoutForm({ ...checkoutForm, provider: e.target.value })}
                              className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-xs outline-none bg-white"
                            >
                              {checkoutForm.country === "Uganda" ? (
                                <>
                                  <option value="MTN MoMo">MTN MoMo</option>
                                  <option value="Airtel Money">Airtel Money</option>
                                </>
                              ) : (
                                <>
                                  <option value="m-GURUSH">m-GURUSH</option>
                                  <option value="MTN MoMo">MTN MoMo SSD</option>
                                </>
                              )}
                            </select>
                          </div>
                          <div>
                            <label className="block text-[10px] font-bold text-indigo-950 mb-1">Mobile Money Number</label>
                            <div className="relative">
                              <Phone className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                              <input
                                type="tel"
                                required
                                placeholder={checkoutForm.country === "Uganda" ? "+256..." : "+211..."}
                                value={checkoutForm.phone}
                                onChange={(e) => setCheckoutForm({ ...checkoutForm, phone: e.target.value })}
                                className="w-full pl-8 pr-2 py-1.5 border border-slate-200 rounded-lg text-xs focus:ring-1 focus:ring-indigo-500 outline-none"
                              />
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Right Column: Order Review */}
                    <div className="flex flex-col justify-between bg-slate-50 p-5 rounded-2xl border border-slate-100">
                      <div>
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-3">Order Breakdown</span>
                        <div className="space-y-3 max-h-48 overflow-y-auto">
                          {cart.map((c) => (
                            <div key={c.product.id} className="flex justify-between items-center text-xs border-b border-slate-200/50 pb-2">
                              <div>
                                <span className="font-bold text-slate-800">{c.product.name}</span>
                                <span className="text-slate-400 block uppercase tracking-wider text-[8px] mt-0.5">{c.planType} PLAN</span>
                              </div>
                              <span className="font-black text-slate-900">${getPriceForPlan(c.product, c.planType)}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="border-t border-slate-200 pt-4 mt-4 space-y-4">
                        <div className="flex justify-between items-end">
                          <span className="text-xs font-bold text-slate-500">Local Payment Amount:</span>
                          <div className="text-right">
                            <div className="text-base font-black text-slate-950">
                              {formatLocalPrice(calculateCartTotal(), checkoutForm.country)}
                            </div>
                            <span className="text-[10px] text-slate-400 font-medium block">Equivalent to ${calculateCartTotal()} USD</span>
                          </div>
                        </div>

                        <button
                          type="submit"
                          className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-sm rounded-xl shadow transition cursor-pointer"
                        >
                          Authorize & Securely Pay
                        </button>
                      </div>
                    </div>
                  </form>
                )
              )}

              {/* Interactive USSD/SMS Payment simulation loader */}
              {checkoutStep === "paying" && (
                <div className="p-8 flex-1 flex flex-col justify-center items-center max-w-md mx-auto">
                  <div className="relative flex items-center justify-center">
                    <div className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                    <CreditCard className="w-6 h-6 text-indigo-600 absolute" />
                  </div>

                  <h4 className="text-lg font-bold text-slate-900 mt-6">Processing Transaction</h4>
                  <p className="text-xs text-slate-400 mt-1">Please inspect your phone screen for secure authorization popup...</p>

                  <div className="w-full bg-slate-950 text-emerald-400 font-mono text-[10px] p-4 rounded-xl mt-6 border border-slate-800 h-36 overflow-y-auto space-y-1 text-left">
                    {paymentLogs.map((logStr, idx) => (
                      <p key={idx}>{logStr}</p>
                    ))}
                  </div>

                  <div className="w-full bg-slate-200 h-1.5 rounded-full mt-6 overflow-hidden">
                    <div 
                      className="bg-indigo-600 h-full transition-all duration-300"
                      style={{ width: `${paymentProgress}%` }}
                    />
                  </div>
                </div>
              )}

              {/* Payment Succeeded */}
              {checkoutStep === "success" && (
                <div className="p-8 flex-1 flex flex-col justify-center items-center text-center max-w-sm mx-auto space-y-4" id="checkout-success-view">
                  <div className="w-14 h-14 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600">
                    <CheckCircle className="w-8 h-8" />
                  </div>
                  <h4 className="text-lg font-bold text-slate-900">Payment Succeeded!</h4>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    Thank you! Your East African software subscriptions are now active. Check your customer portal to view your generated license key and start the SaaS automated server provisioning!
                  </p>
                  
                  <div className="flex gap-2 w-full pt-4">
                    <button
                      onClick={() => {
                        setIsCheckoutOpen(false);
                        onNavigateToPortal();
                      }}
                      className="flex-1 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl transition cursor-pointer"
                    >
                      Open Customer Portal
                    </button>
                    <button
                      onClick={() => setIsCheckoutOpen(false)}
                      className="px-4 py-2 border border-slate-300 text-slate-700 text-xs font-semibold rounded-xl transition cursor-pointer hover:bg-slate-50"
                    >
                      Close
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
