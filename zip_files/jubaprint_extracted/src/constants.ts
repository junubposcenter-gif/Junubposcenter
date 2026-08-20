export const ROLE_DEFINITIONS = {
  admin: {
    title: 'Administrator',
    description: 'Full system control. Manages staff, system settings, financial overrides, and database purging.',
    duties: [
      'User & Staff Management',
      'System-wide financial reporting',
      'Discount & Expense final approval',
      'Master data purging & backups',
      'SaaS Subscription management'
    ]
  },
  supervisor: {
    title: 'Operations Supervisor',
    description: 'Bridge between Reception and Production. Ensures workflow compliance and design quality.',
    duties: [
      'Full Order Queue oversight',
      'Design phase status approval',
      'Discount request approval (up to 10%)',
      'Service & Price list management',
      'Inventory & Stock tracking',
      'Business performance analytics access',
      'Employee commission oversight'
    ]
  },
  receptionist: {
    title: 'Receptionist / Accounts',
    description: 'Primary customer handling and financial recording agent.',
    duties: [
      'Customer registration & management',
      'New Order entry & Quotations',
      'Payment processing & Receipt issuance',
      'Invoice generation',
      'Discount requesting for clients',
      'Expense recording'
    ]
  },
  operator: {
    title: 'Production Operator',
    description: 'Executes physical production of orders and manages workflow stages.',
    duties: [
      'Accessing active production tasks',
      'Updating job progress (Design -> Production -> Done)',
      'Direct order assignment fulfillment',
      'View personal commission logs'
    ]
  },
  designer: {
    title: 'Graphics Designer',
    description: 'Responsible for creative artwork and design approvals.',
    duties: [
      'Accessing Design-stage tasks',
      'Uploading and marking designs for approval',
      'Moving orders from Design to Production',
      'Collaboration via staff chat'
    ]
  },
  sales_marketing: {
    title: 'Sales & Marketing',
    description: 'Responsible for client acquisition, pricing quotations, and recording lead-generated orders.',
    duties: [
      'Customer profile creation & management',
      'Creating professional price quotations',
      'Registering sales leads & new orders',
      'Collaborating with design & accounts using Staff Chat',
      'Monitoring personal referral commission balances'
    ]
  }
};

export const TERMS_AND_CONDITIONS = `
# ARK PRINTING MANAGEMENT - RULES AND REGULATIONS & SaaS TERMS

**Provider:** LONGUN TECH AND AI AGENCY  
**Revision:** v2.5.0-ARK  
**Effective Date:** May 8, 2026

### 1. OPERATIONAL WORKFLOW COMPLIANCE
To ensure zero-error operations and strict financial accountability, all staff must adhere to the following workflow sequence. Bypassing stages is strictly prohibited:
*   **PENDING:** All new orders enter the system as pending.
*   **DESIGN STAGE:** Assigned Designers must complete artwork and send the order to Production. Designers are **FORBIDDEN** from marking work as "Done" or "Completed" bypassing Production.
*   **PRODUCTION STAGE:** Operators must execute the physical production. Once finished, they must move the order to the **ACCOUNTS TABLE** (Done/Awaiting Invoice).
*   **ACCOUNTS STAGE:** Only the Receptionist or Admin can finalize orders from the Accounts table upon confirming payment or delivery.

### 2. DISCOUNT AND PRICING POLICY
*   **Standard Pricing:** Rates are fixed as per the system service list.
*   **Discount Requests:** Receptionists may request a discount for a client. 
*   **Maximum Limit:** No discount request shall exceed **10%** of the total order value.
*   **Mandatory Approval:** Discounts are only active once approved by an **ADMIN**. No staff member is authorized to apply a discount without digital approval via the system.

### 3. FINANCIAL ACCOUNTABILITY
*   **Period Reporting:** All debts, arrears, and expenses are tracked strictly by the selected filter period. 
*   **Debt Responsibility:** Staff moving orders to "Completed" without full payment recorded will be held personally accountable for the balance unless specifically authorized by the Admin.

### 4. SaaS TERMS & CONDITIONS
This Software as a Service Agreement (the "Agreement") is a legal contract between LONGUN TECH AND AI AGENCY ("Provider") and the entity or individual ("Licensee") accessing the proprietary ARK ERP/POS system.

*   **Access:** Granted for internal business operations only.
*   **Subscriptions:** Enterprise-level admin access is $70/mo. Annual commitment is $600/year.
*   **Uptime:** Target uptime is 98.5%. Maintenance occurs Sundays 02:00-05:00 UTC.
*   **Data Rights:** Provider may use anonymized aggregate data for performance benchmarking and fraud detection.

### 5. SYSTEM CLOCK & LOGGING
The system utilizes a Global System Time. All actions (Assignments, Forwarding, Payments) are timestamped and logged. Any attempt to manipulate system logs or backdate entries is a violation of these terms and may result in administrative lockout.

### 6. INTELLECTUAL PROPERTY
All rights, title, and interest in and to the Software are the property of LONGUN TECH AND AI AGENCY. Reverse engineering or unauthorized distribution is strictly prohibited.

---
**Acknowledgment:** By clicking "I Accept", I confirm that I have read, understood, and agree to the ARK Operational Workflow and the SaaS pricing structure.
`;
