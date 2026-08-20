import { Product } from "./types";

export const STATIC_PRODUCTS: Product[] = [
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
