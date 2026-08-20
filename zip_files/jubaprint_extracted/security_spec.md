# Security Specification - ARK PRINTERS ERP

## Data Invariants
1. **Zero-Anonymous Access**: All operations (read/write) require a valid, verified Firebase Authentication token.
2. **Role-Based Hierarchy**:
   - `MASTER`: (Hardcoded email/UID) Full system control including purge and lock.
   - `ADMIN`: User management, price management, deletion of core records.
   - `SUPERVISOR`: Production oversight, expense and discount approvals.
   - `RECEPTIONIST`: Order creation, customer management, payment recording.
   - `DESIGNER/OPERATOR`: Task picking and status updates for assigned work.
3. **Identity Integrity**: No user can modify their own `role` or `commission_balance`.
4. **Relational Consistency**: Sub-resources (like `order items`) cannot be created without a parent `order`.
5. **State Locking**: Paid or Completed orders cannot be modified except by Admins.

## The "Dirty Dozen" Payloads (Attacks)
1. **Self-Promotion**: User tries to update their own role from 'operator' to 'admin'.
2. **Shadow Purge**: Non-master user tries to delete a document in `orders`.
3. **Ghost Discount**: Receptionist tries to apply a 50% discount without approval.
4. **Budget Hijack**: Designer tries to approve their own expense request.
5. **PII Scraping**: Operator tries to list all user profiles with emails.
6. **Double Stocking**: Negative stock injection via manual update.
7. **Orphaned Writes**: Creating an order item for a non-existent order.
8. **Time Travel**: Spoofing `created_at` in the past.
9. **Debt Wipe**: Updating an order's `payment_status` to 'paid' without a payment record.
10. **System Bypass**: Accessing `settings/app_lock` as a receptionist.
11. **Chat Eavesdropping**: Regular user tries to read a private chat document they are not part of.
12. **Locked Action**: Trying to create an order while `app_lock` is active.

## Test Runner (Draft)
A `firestore.rules.test.ts` will verify these denials.
