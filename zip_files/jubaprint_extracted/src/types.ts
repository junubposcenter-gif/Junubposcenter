export type Role = 'admin' | 'receptionist' | 'operator' | 'designer' | 'supervisor' | 'system' | 'sales_marketing';
export type Status = 'pending' | 'at_designer' | 'production' | 'pending_client_approval' | 'done_awaiting_invoice' | 'ready_for_payment' | 'completed' | 'paid' | 'cancelled';

export interface User {
  id: string;
  username: string;
  password?: string;
  role: Role;
  full_name: string;
  staff_id: string;
  email?: string;
  position?: string;
  suspended?: boolean;
  locked?: boolean;
  commission_balance?: number;
  terms_accepted?: boolean;
  terms_accepted_at?: any;
  created_at?: any;
  current_device_id?: string;
  otp_code?: string;
  otp_expiry?: any;
  phone?: string; // backup WhatsApp or phone
  tenant_id?: string;
  tenant_name?: string;
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
  address: string;
  created_at: any;
}

export interface AssetReductionRequest {
  id: string;
  amount: number;
  requested_by: string;
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
  created_at?: string;
}

export interface Asset {
  id: string;
  name: string;
  type: 'usable' | 'fixed';
  quantity: number;
  value: number;
  description?: string;
  reduction_requests?: AssetReductionRequest[];
}

export interface Service {
  id: string;
  name: string;
  price: number;
  unit_cost: number;
  cost_material?: number;
  cost_labor?: number;
  cost_transportation?: number;
  cost_power?: number;
  cost_taxes?: number;
  cost_others?: number;
  category: string;
  description?: string;
  stock: number;
  opening_stock?: number;
  minimum_stock: number;
  unit: string;
  last_restock?: any;
  item_name?: string;
  is_service?: boolean;
}

export interface Order {
  id: string;
  job_order_id?: string;
  customer_id: string;
  customer_name?: string;
  total_amount: number;
  total_profit?: number;
  status?: Status;
  payment_status?: 'unpaid' | 'partially_paid' | 'paid';
  paid_amount?: number;
  payment_method?: string;
  description?: string; // Client's service needed description
  created_at: any;
  staff_id?: string; // ID of the staff currently working on it
  staff_name?: string;
  referrer_id?: string;
  commission_amount?: number;
  discount?: number;
  discount_request?: {
    amount: number;
    reason: string;
    status: 'pending' | 'approved' | 'rejected';
    requested_by_id: string;
    requested_by_name: string;
    requested_at: any;
    approved_by_id?: string;
    approved_by_name?: string;
    approved_at?: any;
  };
  items?: OrderItem[];
  items_summary?: string;
  assigned_staff_id?: string;
  assigned_staff_name?: string;
  assigned_staff_username?: string;
  designer_id?: string;
  designer_name?: string;
  operator_id?: string;
  operator_name?: string;
  updated_at?: any;
  stage_history?: {
    at_designer?: any;
    production?: any;
    completed?: any;
  };
  approval?: {
    approved_by_id: string;
    approved_by_name: string;
    approved_at: any;
  };
  usd_rate?: number;
}

export interface OrderItem {
  id?: string;
  order_id?: string;
  service_id: string;
  service_name?: string;
  quantity: number;
  price_at_time: number;
  price?: number;
}

export interface Expense {
  id: string;
  item: string;
  amount: number;
  category: string;
  transport_from?: string;
  transport_to?: string;
  recorded_by: string;
  approver_id?: string;
  approver_name?: string;
  recorder_name?: string;
  created_at: any;
  status: 'pending' | 'approved' | 'rejected';
  staff_id?: string;
  staff_name?: string;
}

export interface Funding {
  id: string;
  source: string;
  amount: number;
  recorded_by: string;
  recorder_name?: string;
  created_at: any;
}

export interface Payment {
  id: string;
  order_id: string;
  amount: number;
  method: string;
  recorded_by: string;
  created_at: any;
}

export interface AppNotification {
  id: string;
  user_id: string;
  role: string | null;
  message: string;
  is_read: boolean;
  sender_id?: string;
  created_at: any;
}

export interface ChatMessage {
  id: string;
  sender_id: string;
  sender_name?: string;
  sender_email?: string;
  receiver_id: string | null;
  receiver_email?: string | null;
  message: string;
  chat_id: string;
  participants: string[];
  created_at: any;
}

export interface PeriodSummary {
  sales: number;
  fundings: number;
  expenses: number;
  arrears: number;
  cash: number;
  jobsRegistered: number;
  jobsPending: number;
  jobsDoneAndPaid: number;
  jobsDoneAndUnpaid: number;
  jobsDoneAndPartiallyPaid: number;
  recoveredDebts?: number;
  directSales?: number;
}

export interface DashboardStats {
  todaySummary?: PeriodSummary;
  thisMonthSummary?: PeriodSummary;
  lastMonthSummary?: PeriodSummary;
  todaySales: number;
  dailySales: number;
  monthlyRevenue: number;
  pendingOrders: number;
  lowStockAlerts: number;
  totalExpenses?: number;
  totalFunding?: number;
  totalArrears?: number;
  totalCash?: number;
  trueBalance?: number;
  periodDebts?: number;
  pendingInvoices?: number;
  jobsRegistered?: number;
  jobsDoneAndPaid?: number;
  jobsDoneAndUnpaid?: number;
  pendingApprovals?: number;
  allTimeSales?: number;
  periodRecoveredDebts?: number;
  periodDirectSales?: number;
}

export interface PhysicsLetter {
  id: string;
  char: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  angle: number;
  vangle: number;
  size: number;
  color: string;
  glowColor: string;
  opacity: number;
  life: number;
  maxLife: number;
}

export interface GroundLine {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
}

export interface Quotation {
  id: string;
  quotNo: string;
  name: string;
  address: string;
  phone?: string;
  email?: string;
  attn?: string;
  date: string;
  validityDays: number;
  paymentTerms: string;
  turnaroundDelivery?: string;
  discountVal: number;
  discountType: 'flat' | 'percent';
  taxRate: number;
  notes: string;
  items: any[];
  status: 'draft' | 'sent' | 'accepted' | 'declined' | 'converted';
  created_at?: any;
  created_by?: string;
  created_by_name?: string;
  converted_order_id?: string;
  deposit?: number;
  usd_rate?: number;
}

export interface Purchase {
  id: string;
  item: string;
  country: string;
  unit_price: number; // in USD
  quantity: number;
  date: string; // YYYY-MM-DD
  created_at?: any;
  recorded_by?: string;
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  order_id?: string;       // Link to associated order if any
  order_number?: string;
  assigned_to?: string;    // user_id
  assigned_name?: string;
  due_date?: string;       // YYYY-MM-DD
  priority: 'low' | 'medium' | 'high';
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  created_at: any;
  created_by: string;
  created_by_name?: string;
  tenant_id?: string;
}


