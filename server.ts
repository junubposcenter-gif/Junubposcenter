import express from "express";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";
import { initializeApp } from "firebase/app";
import { 
  getFirestore, 
  collection, 
  doc, 
  setDoc, 
  getDocs, 
  updateDoc, 
  getDoc,
  query,
  where,
  terminate
} from "firebase/firestore";

// Load environment variables
dotenv.config();

// Initialize Express
const app = express();
app.use(express.json());
const PORT = 3000;

// Read Firebase Config
let firebaseConfig: any = {};
try {
  const configPath = path.join(process.cwd(), "firebase-applet-config.json");
  if (fs.existsSync(configPath)) {
    firebaseConfig = JSON.parse(fs.readFileSync(configPath, "utf-8"));
  } else {
    console.warn("firebase-applet-config.json not found. Using empty config.");
  }
} catch (err) {
  console.error("Error reading firebase-applet-config.json:", err);
}

// Initialize Firebase App on the server
let db: any;
if (firebaseConfig.apiKey) {
  const firebaseApp = initializeApp({
    apiKey: firebaseConfig.apiKey,
    authDomain: firebaseConfig.authDomain,
    projectId: firebaseConfig.projectId,
    storageBucket: firebaseConfig.storageBucket,
    messagingSenderId: firebaseConfig.messagingSenderId,
    appId: firebaseConfig.appId,
  });
  // Use the specific firestoreDatabaseId if available
  db = getFirestore(firebaseApp, firebaseConfig.firestoreDatabaseId || undefined);
  console.log("Firebase initialized successfully on server. Database ID:", firebaseConfig.firestoreDatabaseId);
} else {
  console.error("Firebase config is missing API key. Database features will be simulated in memory!");
}

// Initialize Gemini Client
let ai: GoogleGenAI | null = null;
if (process.env.GEMINI_API_KEY) {
  ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      }
    }
  });
  console.log("Gemini client initialized on server.");
} else {
  console.warn("GEMINI_API_KEY is missing. AI Recommendation engine will fall back to smart static responses.");
}

// Default pre-seeded products targeted for Uganda & South Sudan
const DEFAULT_PRODUCTS = [
  {
    id: "junubpos",
    name: "JunubPOS System",
    tagline: "The absolute leader in offline-first retail billing & stock tracking.",
    description: "A specialized, high-performance retail and wholesale POS system tailored for South Sudanese and Ugandan business environments. Supports multi-currency (SSP, UGX, USD), inventory management with low-stock SMS alerts, automated VAT & South Sudan revenue tax calculations, m-GURUSH integration, and offline operations with auto-sync.",
    category: "POS & Retail",
    pricing: {
      monthly: 29,
      yearly: 290,
      lifetime: 599
    },
    screenshots: [
      "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1556740758-90de374c12ad?auto=format&fit=crop&w=800&q=80"
    ],
    rating: 4.8,
    reviewsCount: 34,
    status: "active"
  },
  {
    id: "supaclinic",
    name: "SupaClinic UGA",
    tagline: "Transforming clinic operations, patient histories & prescription tracking.",
    description: "An elegant, comprehensive Clinic Management System designed for medical facilities in Uganda. Simplifies patient registration, digital medical cards (histories), prescription workflow, drug inventory tracking, NHIF medical claims, and automated SMS appointment reminders.",
    category: "Healthcare",
    pricing: {
      monthly: 39,
      yearly: 390,
      lifetime: 799
    },
    screenshots: [
      "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?auto=format&fit=crop&w=800&q=80"
    ],
    rating: 4.9,
    reviewsCount: 28,
    status: "active"
  },
  {
    id: "quickpharma",
    name: "QuickPharma SSD",
    tagline: "Drug batch auditing, expiry warnings & regulatory compliance.",
    description: "A specialized Pharmacy Management System designed for compliance with South Sudanese Ministry of Health directives. Features automated drug expiry tracking, supplier logistics, batch number auditing, retail POS billing, and real-time dangerous drug registers.",
    category: "Healthcare",
    pricing: {
      monthly: 35,
      yearly: 350,
      lifetime: 699
    },
    screenshots: [
      "https://images.unsplash.com/photo-1586015555751-63bb77f4322a?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1607619056574-7b8d304d3b24?auto=format&fit=crop&w=800&q=80"
    ],
    rating: 4.7,
    reviewsCount: 19,
    status: "active"
  },
  {
    id: "nileschool",
    name: "NileSchool Portal",
    tagline: "The complete ledger for school fees, grading & parent engagement.",
    description: "An administrative school management portal for primary, secondary, and tertiary institutions in South Sudan and Uganda. Integrates student enrollment records, automated academic report cards, financial fees registers, Mobile Money (MTN, Airtel, m-GURUSH) fee collection, and parent notification center.",
    category: "Education",
    pricing: {
      monthly: 49,
      yearly: 490,
      lifetime: 999
    },
    screenshots: [
      "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1427504494785-3a9ca7044f45?auto=format&fit=crop&w=800&q=80"
    ],
    rating: 4.6,
    reviewsCount: 42,
    status: "active"
  },
  {
    id: "kampalabar",
    name: "KampalaBar Manager",
    tagline: "High-speed table layouts, bartender logs & split-billing audits.",
    description: "Tailored for bars, clubs, and lounges in Uganda. Offers intuitive table map arrangements, rapid touch-screen beverage order inputs, bartender shift reconciliation reports, custom drink recipe auditing, split billing, and automated mobile money tipping configurations.",
    category: "Hospitality",
    pricing: {
      monthly: 25,
      yearly: 250,
      lifetime: 499
    },
    screenshots: [
      "https://images.unsplash.com/photo-1514933651103-005eec06c04b?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1572116469696-31de0f17cc34?auto=format&fit=crop&w=800&q=80"
    ],
    rating: 4.8,
    reviewsCount: 51,
    status: "active"
  },
  {
    id: "suddhotel",
    name: "SuddHotel PMS",
    tagline: "Premium reservation calendars, laundry billing & compliance sheets.",
    description: "A complete Property Management System (PMS) for hotels and guesthouses. Features booking grid calendars, walk-in registration, laundry and restaurant billing integration, custom South Sudan tourist visa report forms, and automated invoice printing.",
    category: "Hospitality",
    pricing: {
      monthly: 45,
      yearly: 450,
      lifetime: 899
    },
    screenshots: [
      "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?auto=format&fit=crop&w=800&q=80"
    ],
    rating: 4.5,
    reviewsCount: 15,
    status: "active"
  },
  {
    id: "jubaprint",
    name: "JubaPrint Manager",
    tagline: "Smart paper-roll stocks, design approvals & job sheets.",
    description: "The perfect manager for modern printing and graphics shops. Features customizable quotation estimators (based on ink, paper weight, and dimensions), roll stock controls, interactive design proofing feedback pipelines, and real-time client billing dashboards.",
    category: "Printing & Logistics",
    pricing: {
      monthly: 20,
      yearly: 200,
      lifetime: 399
    },
    screenshots: [
      "https://images.unsplash.com/photo-1562654501-a0ccc0fc3fb1?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?auto=format&fit=crop&w=800&q=80"
    ],
    rating: 4.7,
    reviewsCount: 11,
    status: "active"
  },
  {
    id: "equatorhrm",
    name: "EquatorHRM Suite",
    tagline: "Localized PAYE calculations, NSSF templates & biometric hooks.",
    description: "A unified payroll and human resource suite preconfigured for East African laws. Supports automated Pay-As-You-Earn (PAYE) taxes for South Sudan and Uganda, NSSF compliance form downloads, leave scheduling workflows, and direct integrations with finger-print biometric clocks.",
    category: "Enterprise & HR",
    pricing: {
      monthly: 59,
      yearly: 590,
      lifetime: 1199
    },
    screenshots: [
      "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1521791136064-7986c2920216?auto=format&fit=crop&w=800&q=80"
    ],
    rating: 4.9,
    reviewsCount: 22,
    status: "active"
  }
];

// Zip Files Scanner & Sync Endpoint
app.get("/api/zip_files", async (req, res) => {
  const zipDir = path.join(process.cwd(), "zip_files");
  if (!fs.existsSync(zipDir)) {
    return res.json({ apps: [], message: "zip_files directory not found" });
  }

  try {
    const files = fs.readdirSync(zipDir);
    const detected: Array<{ id: string; name: string; path: string; isExtracted: boolean; type: string }> = [];

    for (const item of files) {
      if (item === "README.md" || item.startsWith(".")) continue;
      const fullPath = path.join(zipDir, item);
      const stat = fs.statSync(fullPath);

      if (stat.isDirectory()) {
        const cleanName = item.replace("_extracted", "").replace(/[-_]app$/, "");
        detected.push({
          id: cleanName.toLowerCase(),
          name: cleanName.charAt(0).toUpperCase() + cleanName.slice(1) + " Manager",
          path: `zip_files/${item}`,
          isExtracted: true,
          type: "folder"
        });
      } else if (item.endsWith(".zip")) {
        const cleanName = item.replace(/\.zip$/, "");
        detected.push({
          id: cleanName.toLowerCase(),
          name: cleanName.charAt(0).toUpperCase() + cleanName.slice(1) + " Manager",
          path: `zip_files/${item}`,
          isExtracted: false,
          type: "zip"
        });
      }
    }

    // Auto-sync detected applications into Firestore if connected
    if (db && detected.length > 0) {
      try {
        const productsRef = collection(db, "products");
        for (const appItem of detected) {
          const docRef = doc(productsRef, appItem.id);
          const snap = await getDoc(docRef);
          if (!snap.exists()) {
            await setDoc(docRef, {
              id: appItem.id,
              name: appItem.name,
              category: "SaaS Software",
              description: `Auto-registered system application from local storage package (${appItem.path}).`,
              priceUSD: 499,
              rating: 5.0,
              reviewsCount: 1,
              status: "active",
              sourcePath: appItem.path
            });
          }
        }
      } catch (dbErr) {
        console.warn("Firestore sync warning during zip_files scan:", dbErr);
      }
    }

    return res.json({ success: true, count: detected.length, apps: detected, timestamp: new Date().toISOString() });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

app.get("/api/seed", async (req, res) => {
  if (!db) {
    return res.json({ message: "Running in-memory simulation. Seed is automatic.", count: DEFAULT_PRODUCTS.length });
  }

  try {
    const productsRef = collection(db, "products");
    const snapshot = await getDocs(productsRef);
    
    if (snapshot.empty) {
      console.log("Seeding products into Firestore...");
      for (const prod of DEFAULT_PRODUCTS) {
        await setDoc(doc(db, "products", prod.id), prod);
      }
      return res.json({ message: "Seeded successfully!", seeded: DEFAULT_PRODUCTS.length });
    } else {
      return res.json({ message: "Products already exist in Firestore.", count: snapshot.size });
    }
  } catch (error: any) {
    console.error("Error seeding products, switching to in-memory simulation:", error);
    return res.json({ 
      message: "Seeded in-memory (Firestore API is unconfigured on custom project). To enable cloud storage, enable Cloud Firestore API in your Google Cloud Console.", 
      count: DEFAULT_PRODUCTS.length,
      simulated: true,
      error: error.message
    });
  }
});

// AI Recommendation Engine Endpoint
app.post("/api/recommendations", async (req, res) => {
  const { businessType, country, scale, budget } = req.body;

  if (!businessType) {
    return res.status(400).json({ error: "businessType is required." });
  }

  const prompt = `You are an expert SaaS solutions architect specializing in the East African tech market, primarily Uganda (UGA) and South Sudan (SSD).
Analyze the client's profile:
- Business Type/Niche: ${businessType}
- Target Country: ${country || "General East Africa"}
- Business Scale: ${scale || "Medium"}
- Estimated Budget Preference: ${budget || "Standard"}

We sell the following SaaS systems:
1. JunubPOS System ($29/mo - Retail/POS, multi-currency, m-GURUSH, offline)
2. SupaClinic UGA ($39/mo - Healthcare, clinical records, Uganda NHIF)
3. QuickPharma SSD ($35/mo - Pharmacy tracking, SSD Ministry of Health)
4. NileSchool Portal ($49/mo - Academic registers, mobile money school fees ledger)
5. KampalaBar Manager ($25/mo - Bar/Lounges, table maps, split bill audits)
6. SuddHotel PMS ($45/mo - Hospitality reservation, custom tourist entry compliance)
7. JubaPrint Manager ($20/mo - Printing shops, custom quote estimators)
8. EquatorHRM Suite ($59/mo - HR/Payroll, localized UGA/SSD tax compliance like PAYE/NSSF)

Please generate a highly professional and tailored recommendation.
You MUST respond with a valid JSON object. Do not include any markdown backticks in your final output, just pure parseable JSON.

The JSON structure MUST be exactly:
{
  "recommendedProductId": "junubpos" (or closest matching system ID),
  "matchScore": 95 (percentage number),
  "justification": "Clear architectural justification based on East African localization (currencies, local payment like m-GURUSH, or Uganda laws)",
  "bundleUpgrades": [
    {
      "productId": "equatorhrm",
      "reason": "Why adding this HR tool benefits their specific scale and country compliance rules."
    }
  ],
  "localPaymentAdvice": "Actionable instructions on how they can leverage Mobile Money (MTN, Airtel, m-GURUSH) or credit cards in South Sudan or Uganda."
}`;

  try {
    if (ai) {
      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
      });

      let textResult = response.text || "";
      // Strip out any markdown blocks if present
      textResult = textResult.replace(/```json/g, "").replace(/```/g, "").trim();

      try {
        const parsedData = JSON.parse(textResult);
        return res.json(parsedData);
      } catch (jsonErr) {
        console.error("Failed to parse Gemini response as JSON:", textResult, jsonErr);
        // Fallback standard parse
        return res.json(getStaticRecommendation(businessType, country, scale));
      }
    } else {
      // Fallback response if Gemini API key is not present
      const staticRecommendation = getStaticRecommendation(businessType, country, scale);
      return res.json(staticRecommendation);
    }
  } catch (error: any) {
    console.error("Gemini recommendation failed:", error);
    return res.json(getStaticRecommendation(businessType, country, scale));
  }
});

// Dynamic SaaS Provisioning Simulation API
app.post("/api/provision", async (req, res) => {
  const { subscriptionId, productName, domain, deploymentType, customerId } = req.body;

  if (!subscriptionId || !productName || !domain) {
    return res.status(400).json({ error: "Missing required fields for provisioning simulation." });
  }

  const logId = `prov-${Date.now()}`;
  const logDocData = {
    id: logId,
    subscriptionId,
    customerId: customerId || "anonymous",
    productName,
    domain,
    deploymentType: deploymentType || "Multi-Tenant SaaS",
    status: "provisioning",
    progress: 10,
    logs: [
      `[${new Date().toISOString()}] Initiating automated setup for ${productName}...`,
      `[${new Date().toISOString()}] Target Architecture: ${deploymentType || "Multi-Tenant SaaS"}`,
      `[${new Date().toISOString()}] Target Domain: ${domain}`
    ],
    createdAt: new Date().toISOString()
  };

  if (db) {
    try {
      await setDoc(doc(db, "provisioningLogs", logId), logDocData);
      
      // Execute the provisioning process asynchronously in the background so the request doesn't hang!
      simulateProvisioningProcess(logId, logDocData);
      
      return res.json({ success: true, logId, message: "Provisioning simulation started." });
    } catch (err: any) {
      console.error("Failed to create provisioning log doc:", err);
      return res.status(500).json({ error: err.message });
    }
  } else {
    // In-memory simulation if Firebase database is not ready yet
    return res.json({ success: true, logId, message: "Provisioning started (Simulated/No Database connection)." });
  }
});

// Verify License Simulation Endpoint
app.post("/api/license/verify", async (req, res) => {
  const { licenseKey, productId } = req.body;
  if (!licenseKey || !productId) {
    return res.status(400).json({ error: "licenseKey and productId are required." });
  }

  // Simulate verification checks
  // Format should be: [PRODUCT_CODE]-[COUNTRY_CODE]-[YEAR]-[ALPHANUMERIC]
  // Example: CMS-UGA-2026-AB1234
  const isValidFormat = /^[A-Z]{3,4}-[A-Z]{3}-\d{4}-[A-Z0-9]{6}$/.test(licenseKey);

  if (!isValidFormat) {
    return res.json({
      valid: false,
      message: "Invalid license key format. Expected format: PROD-CTR-YYYY-XXXXXX"
    });
  }

  if (db) {
    try {
      const docRef = doc(db, "licenses", licenseKey);
      const snapshot = await getDoc(docRef);
      if (snapshot.exists()) {
        const data = snapshot.data();
        if (data.status === "active") {
          // Increment device count up to limit
          const currentDevices = data.deviceCount || 0;
          const limit = data.deviceLimit || 5;
          if (currentDevices >= limit) {
            return res.json({
              valid: true,
              license: data,
              warning: "Device limit reached! Active devices: " + currentDevices + " / " + limit,
              message: "License is valid but device authorization limit is exhausted."
            });
          }
          
          await updateDoc(docRef, {
            deviceCount: currentDevices + 1
          });
          
          return res.json({
            valid: true,
            license: { ...data, deviceCount: currentDevices + 1 },
            message: `Successfully authenticated device. Active: ${currentDevices + 1}/${limit}`
          });
        } else {
          return res.json({
            valid: false,
            message: `License key status is '${data.status}'. Verification blocked.`
          });
        }
      }
    } catch (err) {
      console.error("License fetch error, falling back to pattern match:", err);
    }
  }

  // Fallback successful simulation if no DB matches
  return res.json({
    valid: true,
    license: {
      licenseKey,
      productId,
      productName: "Simulated software validation",
      status: "active",
      deviceLimit: 5,
      deviceCount: 1,
      createdAt: new Date().toISOString()
    },
    message: "Offline / Simulated match verification successful!"
  });
});

// Resolve username to Firebase email mapping for dual-identifier authorization
app.post("/api/resolve-username", async (req, res) => {
  const { username } = req.body;
  if (!username) {
    return res.status(400).json({ error: "Username is required" });
  }

  const cleanUsername = username.trim().toLowerCase();

  // Static pre-seeded staff username fallback mapping
  const staticMap: Record<string, { email: string; role: string; name: string }> = {
    "admin_regan": { email: "regan@jubaprint.com", role: "admin", name: "Regan Kenyi" },
    "receptionist_mary": { email: "mary@jubaprint.com", role: "receptionist", name: "Mary Tabu" },
    "designer_alex": { email: "alex@jubaprint.com", role: "designer", name: "Alex Lado" },
    "operator_john": { email: "john@jubaprint.com", role: "operator", name: "John Deng" },
    "supervisor_deng": { email: "deng@jubaprint.com", role: "supervisor", name: "Deng Chol" },
    "sales_grace": { email: "grace@jubaprint.com", role: "sales_marketing", name: "Grace Nakato" }
  };

  // Try Firestore username_map collection first
  if (db) {
    try {
      const mapDocRef = doc(db, "username_map", cleanUsername);
      const snap = await getDoc(mapDocRef);
      if (snap.exists()) {
        const data = snap.data();
        return res.json({
          email: data.email,
          username: cleanUsername,
          role: data.role || "customer",
          name: data.name || cleanUsername,
          found: true
        });
      }
    } catch (err) {
      console.error("Firestore username resolution failed, falling back to static map:", err);
    }
  }

  // Fallback to static mapping
  if (staticMap[cleanUsername]) {
    const fallback = staticMap[cleanUsername];
    return res.json({
      email: fallback.email,
      username: cleanUsername,
      role: fallback.role,
      name: fallback.name,
      found: true
    });
  }

  // Generate a dynamic fallback if not found in Firestore or static map
  const defaultRole = cleanUsername.includes("admin") ? "admin" :
                     cleanUsername.includes("reception") || cleanUsername.includes("receptionist") ? "receptionist" :
                     cleanUsername.includes("design") || cleanUsername.includes("designer") ? "designer" :
                     cleanUsername.includes("operator") ? "operator" :
                     cleanUsername.includes("super") || cleanUsername.includes("supervisor") ? "supervisor" :
                     cleanUsername.includes("sales") || cleanUsername.includes("marketing") ? "sales_marketing" : "customer";

  return res.json({
    email: `${cleanUsername}@jubaprint.com`,
    username: cleanUsername,
    role: defaultRole,
    name: cleanUsername.replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase()),
    found: false,
    message: "Dynamic staff mapping triggered (automatically generated credential map)"
  });
});

// Helper: static recommendation fallback engine
function getStaticRecommendation(businessType: string, country: string, scale: string) {
  const typeLower = businessType.toLowerCase();
  
  if (typeLower.includes("clinic") || typeLower.includes("hospital") || typeLower.includes("doctor")) {
    return {
      recommendedProductId: "supaclinic",
      matchScore: 98,
      justification: `SupaClinic UGA is specifically built for healthcare workflows in Uganda. It stores patient clinical records securely and fully integrates Uganda's National Health Insurance Scheme (NHIF) billing schemas. Perfect for a ${scale} clinic in this region.`,
      bundleUpgrades: [
        {
          productId: "equatorhrm",
          reason: "To handle doctor, nurse and staff attendance schedules, biometric logs, and PAYE/NSSF calculations for Uganda payroll compliance."
        }
      ],
      localPaymentAdvice: "You can collect deposits and invoice clients using Uganda's local MTN Mobile Money or Airtel Money APIs, directly supported in our checkout workflows."
    };
  }

  if (typeLower.includes("pharmacy") || typeLower.includes("drug") || typeLower.includes("chemist")) {
    return {
      recommendedProductId: "quickpharma",
      matchScore: 95,
      justification: "QuickPharma SSD includes automated South Sudanese Ministry of Health dangerous drug schedules, batches, and shelf expiry audits. This solves a major regulatory bottleneck for South Sudan pharmaceutical stores.",
      bundleUpgrades: [
        {
          productId: "junubpos",
          reason: "Add JunubPOS for bulk front-desk wholesale cashier checkouts if you run a combined retail-wholesale pharmacy outlet."
        }
      ],
      localPaymentAdvice: "We highly recommend setting up South Sudan's m-GURUSH API gateway. It handles SSP payouts instantly with zero currency friction."
    };
  }

  if (typeLower.includes("school") || typeLower.includes("college") || typeLower.includes("teach") || typeLower.includes("class")) {
    return {
      recommendedProductId: "nileschool",
      matchScore: 94,
      justification: "NileSchool Portal simplifies student fee collection ledger tracking. It directly integrates with East African mobile money channels so parents can make fee payments that reconcile instantly in the school accounts.",
      bundleUpgrades: [
        {
          productId: "equatorhrm",
          reason: "Essential for tracking teacher contracts, monthly lesson teaching payouts, and automated pay slips."
        }
      ],
      localPaymentAdvice: "School fees can be routed using MTN MoMo, Airtel Money, or m-GURUSH, allowing instant payment confirmation alerts sent to parent smartphones."
    };
  }

  if (typeLower.includes("bar") || typeLower.includes("pub") || typeLower.includes("club") || typeLower.includes("drink")) {
    return {
      recommendedProductId: "kampalabar",
      matchScore: 96,
      justification: "KampalaBar Manager is tailored to the active hospitality markets of Uganda. It provides critical split-bill configurations, bar tap card authorizations, and inventory calculations that prevent bartender theft.",
      bundleUpgrades: [
        {
          productId: "junubpos",
          reason: "To manage wholesale beverage deliveries and stock crates coming from regional distributors."
        }
      ],
      localPaymentAdvice: "Bars in Kampala can set up local QR-codes on tables for instant Airtel or MTN MoMo payments by customers right from their seats."
    };
  }

  if (typeLower.includes("hotel") || typeLower.includes("lodge") || typeLower.includes("stay") || typeLower.includes("room")) {
    return {
      recommendedProductId: "suddhotel",
      matchScore: 93,
      justification: "SuddHotel PMS provides booking grid calendars, walk-in management, and local South Sudan hotel guest reporting compliance forms. Ideal for lodging in Juba or Kampala.",
      bundleUpgrades: [
        {
          productId: "kampalabar",
          reason: "If your hotel has an in-house lounge or bar, KampalaBar Manager integrates directly into room tab balances."
        }
      ],
      localPaymentAdvice: "Cards (Visa/Mastercard) are standard for foreign travelers checking in, while local guests can use MTN Mobile Money or m-GURUSH."
    };
  }

  if (typeLower.includes("print") || typeLower.includes("design") || typeLower.includes("graphics")) {
    return {
      recommendedProductId: "jubaprint",
      matchScore: 92,
      justification: "JubaPrint Manager handles customizable quotation algorithms based on media size, printing styles, and quantities. Crucial for Juba and East African print shops.",
      bundleUpgrades: [
        {
          productId: "junubpos",
          reason: "For upfront counter checkout sales of stationary, cartridges, and standard pre-printed stationery."
        }
      ],
      localPaymentAdvice: "Enable South Sudanese m-GURUSH for quick localized printing job deposits and payments."
    };
  }

  // Default POS System recommendation
  return {
    recommendedProductId: "junubpos",
    matchScore: 95,
    justification: "JunubPOS System is our absolute best-selling offline-first POS system. It handles dual-currencies (SSP/UGX) seamlessly, making it highly suitable for any general trading, wholesale, or retail business in Uganda and South Sudan.",
    bundleUpgrades: [
      {
        productId: "equatorhrm",
        reason: "Adds comprehensive compliance for East African retail payroll tax tables and employee scheduling."
      }
    ],
    localPaymentAdvice: "Supports m-GURUSH for Juba transactions and MTN/Airtel Money for Uganda branches, allowing real-time cashier balance reconciliations."
  };
}

// Background simulation of SaaS dynamic provisioning progress
async function simulateProvisioningProcess(logId: string, logData: any) {
  const steps = [
    { progress: 25, message: "Configuring cloud resources..." },
    { progress: 40, message: "Creating secure dedicated relational PostgreSQL schemas..." },
    { progress: 60, message: "Provisioning isolated sub-domain routing..." },
    { progress: 75, message: "Setting up automated backup cron-jobs on server cluster..." },
    { progress: 90, message: "Generating secure software License Verification Key..." },
    { progress: 100, message: "Virtual Server Online! Tenant instance activated successfully!" }
  ];

  let currentLogs = [...logData.logs];
  let currentProgress = logData.progress;

  for (const step of steps) {
    // Wait between steps to simulate a real Cloud provisioning job
    await new Promise((resolve) => setTimeout(resolve, 2500));
    
    currentProgress = step.progress;
    currentLogs.push(`[${new Date().toISOString()}] ${step.message}`);
    
    if (db) {
      try {
        await updateDoc(doc(db, "provisioningLogs", logId), {
          progress: currentProgress,
          logs: currentLogs,
          status: currentProgress === 100 ? "active" : "provisioning"
        });
      } catch (err) {
        console.error("Error updating provisioning log:", err);
      }
    }
  }
}

async function startServer() {
  // Setup Vite & Static Handling
  if (process.env.NODE_ENV !== "production") {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);

    // Serve index.html for all non-API requests in dev mode
    app.get("*", async (req, res, next) => {
      const url = req.originalUrl;
      if (url.startsWith("/api/")) {
        return next();
      }
      try {
        let template = fs.readFileSync(
          path.resolve(process.cwd(), "index.html"),
          "utf-8"
        );
        template = await vite.transformIndexHtml(url, template);
        res.status(200).set({ "Content-Type": "text/html" }).end(template);
      } catch (e) {
        vite.ssrFixStacktrace(e as Error);
        next(e);
      }
    });
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  // Bind server to port 3000
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
    
    // Try to pre-seed products automatically on startup if Firestore is connected
    if (db) {
      console.log("Checking if products are seeded...");
      const productsRef = collection(db, "products");
      getDocs(productsRef).then((snapshot) => {
        if (snapshot.empty) {
          console.log("No products found in Firestore. Auto-seeding default East African SaaS collection...");
          for (const prod of DEFAULT_PRODUCTS) {
            setDoc(doc(db, "products", prod.id), prod).then(() => {
              console.log(`Auto-seeded: ${prod.name}`);
            }).catch((err) => {
              console.error(`Auto-seeded failed for product ${prod.name}:`, err);
            });
          }
        } else {
          console.log(`Firestore products already initialized (${snapshot.size} products).`);
        }
      }).catch(async (err: any) => {
        console.error("Auto-seeding check failed:", err);
        if (err?.message?.includes("PERMISSION_DENIED") || err?.code === "permission-denied") {
          console.warn("Firestore API is disabled or permission was denied on custom project. Terminating client to avoid stream retries...");
          try {
            await terminate(db);
          } catch (tErr) {
            console.error("Error during firebase client termination:", tErr);
          }
          db = null;
          console.log("Firebase connection bypassed. Server is now running in 100% stable offline-simulated database mode.");
        }
      });
    }
  });
}

startServer();
