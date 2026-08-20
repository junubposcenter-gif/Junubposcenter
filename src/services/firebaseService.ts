import { 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  getDocs, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  addDoc, 
  serverTimestamp,
  increment,
  arrayUnion,
  collectionGroup,
  writeBatch,
  runTransaction,
  Timestamp,
  onSnapshot,
  limit,
  or,
  and
} from "firebase/firestore";
import { initializeApp, getApp, getApps } from "firebase/app";
import { 
  getAuth, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  setPersistence,
  browserLocalPersistence,
  inMemoryPersistence,
  updatePassword,
  updateEmail
} from "firebase/auth";
import { db, auth as fbAuth } from "../firebase-client";

// Multi-tenant variables & helpers
let activeTenantId: string | null = localStorage.getItem('active_tenant_id') || 'default_tenant';
let activeTenantName: string | null = localStorage.getItem('active_tenant_name') || 'Junub Printing';
let activeTenantCode: string | null = localStorage.getItem('active_tenant_code') || 'junub';

export function isMasterUser(email?: string | null): boolean {
  if (!email) return false;
  const lower = email.toLowerCase().trim();
  return lower === "tekkisandereagan@gmail.com" || 
         lower === "kulyakosukusandereagan@gmail.com" ||
         lower === "junubposcenter@gmail.com";
}

export function withTenant(data: any) {
  if (!activeTenantId) return data;
  return {
    ...data,
    tenant_id: activeTenantId,
    tenant_name: activeTenantName
  };
}

// Secondary app for admin tasks
const secondaryApp = getApps().find(a => a.name === 'secondary') || initializeApp(db.app.options, 'secondary');
const secondaryAuth = getAuth(secondaryApp);
secondaryAuth.setPersistence(inMemoryPersistence);

import { Order, Customer, Service, Asset, DashboardStats, User, AppNotification, ChatMessage, Quotation, Task } from "../types";

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
  }
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null): never {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: fbAuth.currentUser?.uid,
      email: fbAuth.currentUser?.email,
      emailVerified: fbAuth.currentUser?.emailVerified,
      isAnonymous: fbAuth.currentUser?.isAnonymous,
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

export const firebaseService = {
  setTenant(tenantId: string | null, name?: string, code?: string) {
    activeTenantId = tenantId;
    activeTenantName = name || null;
    activeTenantCode = code || null;
    if (tenantId) {
      localStorage.setItem('active_tenant_id', tenantId);
      if (name) localStorage.setItem('active_tenant_name', name);
      if (code) localStorage.setItem('active_tenant_code', code);
    } else {
      localStorage.removeItem('active_tenant_id');
      localStorage.removeItem('active_tenant_name');
      localStorage.removeItem('active_tenant_code');
    }
    console.log(`[Tenant Selected] activeTenantId: ${activeTenantId}, activeTenantName: ${activeTenantName}, activeTenantCode: ${activeTenantCode}`);
  },

  getTenantInfo() {
    return {
      id: activeTenantId,
      name: activeTenantName,
      code: activeTenantCode
    };
  },

  async getTenants(): Promise<any[]> {
    try {
      const snap = await getDocs(collection(db, "tenants"));
      return snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      console.error("Failed to list tenants:", error);
      return [];
    }
  },

  async createTenant(name: string, code: string, creatorId: string) {
    try {
      const normalizedCode = code.trim().toLowerCase();
      const tenantRef = doc(db, "tenants", normalizedCode);
      const tenantSnap = await getDoc(tenantRef);
      if (tenantSnap.exists()) {
        throw new Error("A business with this shortcode already exists!");
      }

      await setDoc(tenantRef, {
        id: normalizedCode,
        name: name.trim(),
        code: normalizedCode,
        created_by: creatorId,
        created_at: serverTimestamp()
      });
      return normalizedCode;
    } catch (error) {
      console.error("Failed to create tenant:", error);
      throw error;
    }
  },

  async registerTenantBusiness(businessName: string, businessCode: string, adminData: any) {
    try {
      const normalizedCode = businessCode.trim().toLowerCase();
      // 1. Create the tenant
      await this.createTenant(businessName, normalizedCode, 'SYSTEM');

      // 2. Normalize admin user
      const normalizedUsername = (adminData.username || "").trim().toLowerCase();
      const normalizedEmail = (adminData.email || "").trim().toLowerCase();
      
      const emailToUse = normalizedEmail || `${normalizedUsername}@${normalizedCode}.com`;
      
      // 3. Create Auth user
      let uid = "";
      try {
        const userCredential = await createUserWithEmailAndPassword(secondaryAuth, emailToUse, adminData.password);
        uid = userCredential.user.uid;
      } catch (authError: any) {
        if (authError.code === 'auth/email-already-in-use') {
          // If already in auth, sign in to get their UID
          const loginCred = await signInWithEmailAndPassword(secondaryAuth, emailToUse, adminData.password);
          uid = loginCred.user.uid;
        } else {
          throw authError;
        }
      }

      // 4. Save profile in users
      const profileData: any = {
        username: normalizedUsername,
        email: emailToUse,
        password: adminData.password,
        role: "admin",
        full_name: adminData.full_name,
        staff_id: "ADMIN-001",
        tenant_id: normalizedCode,
        tenant_name: businessName,
        created_at: serverTimestamp(),
        commission_balance: 0
      };

      await setDoc(doc(db, "users", uid), profileData);
      
      // Save to username mapping (both plain username and scoped username to prevent conflicts!)
      await this.saveToUsernameMap(normalizedUsername, emailToUse, adminData.password);
      await this.saveToUsernameMap(`${normalizedUsername}@${normalizedCode}`, emailToUse, adminData.password);

      return { uid, tenantId: normalizedCode };
    } catch (err) {
      console.error("Error registering tenant business:", err);
      throw err;
    }
  },

  async saveToUsernameMap(username: string, email: string, password?: string, previousPassword?: string) {
    try {
      const data = {
        email: email.trim().toLowerCase(),
        storedPassword: password || null,
        previousPassword: previousPassword || null,
        updated_at: serverTimestamp()
      };
      if (username) {
        await setDoc(doc(db, "username_map", username.trim().toLowerCase()), data);
      }
      if (email) {
        await setDoc(doc(db, "username_map", email.trim().toLowerCase()), data);
      }
    } catch (err) {
      console.error("[Username Map] Error writing mapping:", err);
    }
  },

  async syncAllUsersToUsernameMap() {
    try {
      const snapshot = await getDocs(collection(db, "users"));
      for (const userDoc of snapshot.docs) {
        const data = userDoc.data() as any;
        const username = (data.username || "").trim().toLowerCase();
        const email = (data.email || "").trim().toLowerCase();
        const password = data.password;
        const previousPassword = data.previous_password;
        
        if (username && email) {
          await this.saveToUsernameMap(username, email, password, previousPassword);
        }
      }
      console.log(`[Username Map Sync] Successfully synced all users to username_map.`);
    } catch (err) {
      console.error("[Username Map Sync] Failed to sync users:", err);
    }
  },

  // Staff / Users
  async login(credentials: any): Promise<User> {
    const auth = getAuth();
    await setPersistence(auth, browserLocalPersistence);

    const isMasterEmail = (emailStr: string | null | undefined): boolean => {
      if (!emailStr) return false;
      const lower = emailStr.toLowerCase().trim();
      return lower === "tekkisandereagan@gmail.com" || 
             lower === "kulyakosukusandereagan@gmail.com" ||
             lower === "junubposcenter@gmail.com" ||
             lower === "tekkisandereagan" ||
             lower === "kulyakosukusandereagan" ||
             lower === "junubposcenter" ||
             lower === "reagan";
    };

    let email = credentials.username.trim().toLowerCase();
    let storedPasswordFromFirestore: string | null = null;
    let previousPasswordFromFirestore: string | null = null;

    // Resolve via business code (tenant) if provided
    if (credentials.businessCode) {
      const code = credentials.businessCode.trim().toLowerCase();
      try {
        const qUser = query(collection(db, "users"), where("username", "==", credentials.username.trim().toLowerCase()), where("tenant_id", "==", code));
        const qSnap = await getDocs(qUser);
        if (!qSnap.empty) {
          const profile = qSnap.docs[0].data() as User;
          if (profile.email) {
            email = profile.email;
          }
        }
      } catch (err) {
        console.warn("Failed to resolve user by businessCode:", err);
      }
    }

    // Resolve master usernames to Gmail
    if (email === "tekkisandereagan" || email === "reagan") {
      email = "tekkisandereagan@gmail.com";
    } else if (email === "kulyakosukusandereagan") {
      email = "kulyakosukusandereagan@gmail.com";
    } else if (email === "junubposcenter") {
      email = "junubposcenter@gmail.com";
    }

    // Always fetch resolver details to check if they exist in Firestore and get their storedPassword
    try {
      const res = await fetch(`/api/resolve-username?username=${encodeURIComponent(email)}`);
      if (res.ok) {
        const data = await res.json();
        if (data) {
          if (data.email) {
            email = data.email;
          }
          if (data.storedPassword) {
            storedPasswordFromFirestore = data.storedPassword;
          }
          if (data.previousPassword) {
            previousPasswordFromFirestore = data.previousPassword;
          }
        }
      }
    } catch (err) {
      console.error("Failed to fetch username resolver details:", err);
    }

    // If still not containing @, default to activeTenantCode or 'arkprinters.com'
    if (!email.includes('@')) {
      const suffix = activeTenantCode ? `${activeTenantCode}.com` : 'arkprinters.com';
      email = `${email}@${suffix}`;
    }

    try {
      let userCredential;
      try {
        // Real Firebase Authentication
        userCredential = await signInWithEmailAndPassword(auth, email, credentials.password);
      } catch (error: any) {
        console.warn(`[Login Auth Error] Code: ${error.code}, Message: ${error.message}`);
        
        // Let's do self-healing!
        // 1. If entered password matches the stored password in Firestore, let's sync Auth!
        if (storedPasswordFromFirestore && credentials.password === storedPasswordFromFirestore) {
          console.log(`[Self-Healing Login] Entered password matches Firestore stored password. Attempting Auth reconciliation...`);
          
          if (error.code === 'auth/user-not-found' || error.code === 'auth/invalid-credential') {
            const fallbacks: string[] = [];
            if (previousPasswordFromFirestore) {
              fallbacks.push(previousPasswordFromFirestore);
            }
            fallbacks.push('password123');

            let reconciled = false;
            for (const fallback of fallbacks) {
              try {
                console.log(`[Self-Healing Login] Trying fallback password '${fallback}'...`);
                const fallbackCred = await signInWithEmailAndPassword(auth, email, fallback);
                await updatePassword(fallbackCred.user, credentials.password);
                console.log(`[Self-Healing Login] Updated password from '${fallback}' to stored password.`);
                userCredential = await signInWithEmailAndPassword(auth, email, credentials.password);
                reconciled = true;
                break;
              } catch (fallbackErr) {
                console.warn(`[Self-Healing Login] Fallback password '${fallback}' failed:`, fallbackErr);
              }
            }

            if (!reconciled) {
              // If that fails, maybe the user doesn't exist in Auth at all? Let's check or try to create!
              try {
                console.log(`[Self-Healing Login] Creating missing Auth user for ${email}...`);
                userCredential = await createUserWithEmailAndPassword(auth, email, credentials.password);
                console.log(`[Self-Healing Login] Successfully created missing Auth user.`);
              } catch (createErr: any) {
                console.error(`[Self-Healing Login] Failed to create Auth user:`, createErr);
                throw error;
              }
            }
          } else {
            throw error;
          }
        } else {
          // If the entered password DOES NOT match the stored password, or we didn't have storedPassword:
          // Try 'password123' check as a generic legacy fallback
          if (error.code === 'auth/invalid-credential' || error.code === 'auth/user-not-found') {
            try {
              console.log(`[Self-Healing Login] No Firestore password match. Trying legacy fallback password 'password123'...`);
              const fallbackCred = await signInWithEmailAndPassword(auth, email, 'password123');
              await updatePassword(fallbackCred.user, credentials.password);
              console.log(`[Self-Healing Login] Successfully updated legacy password 'password123' to entered password.`);
              userCredential = await signInWithEmailAndPassword(auth, email, credentials.password);
            } catch (fallbackError) {
              console.warn(`[Self-Healing Login] Legacy fallback failed:`, fallbackError);
              throw error;
            }
          } else {
            throw error;
          }
        }
      }
      const fbUser = userCredential.user;

      const finishLogin = async (profile: User, uid: string) => {
        // Self-healing: if entered password was the old password, but Firestore has a newer password,
        // sync the Auth password to match the Firestore password!
        if (profile.password && credentials.password !== profile.password) {
          try {
            console.log(`[Self-Healing Login] Entered password was old password. Syncing Auth password to Firestore newer password...`);
            await updatePassword(fbUser, profile.password);
            console.log(`[Self-Healing Login] Successfully synced Auth password to matches Firestore.`);
          } catch (syncErr) {
            console.warn(`[Self-Healing Login] Failed to sync Auth password inside session:`, syncErr);
          }
        }
        
        // Ensure username_map is up to date
        if (profile.username && profile.email) {
          await this.saveToUsernameMap(profile.username, profile.email, profile.password || credentials.password);
        }

        // Set active tenant ID for session
        if (profile.tenant_id) {
          this.setTenant(profile.tenant_id, profile.tenant_name || 'My Business', profile.tenant_id);
        } else {
          // Backward compatibility: set to default_tenant
          const defaultTenantId = 'default_tenant';
          const defaultTenantName = 'Junub Printing';
          this.setTenant(defaultTenantId, defaultTenantName, 'junub');
          profile.tenant_id = defaultTenantId;
          profile.tenant_name = defaultTenantName;
          try {
            await updateDoc(doc(db, "users", uid), {
              tenant_id: defaultTenantId,
              tenant_name: defaultTenantName
            });
          } catch (e) {
            console.error("Failed to migrate existing user to default_tenant:", e);
          }
        }
        
        return { id: uid, ...profile } as User;
      };

      // Now fetch the profile from Firestore
      let userDoc = await getDoc(doc(db, "users", fbUser.uid));
      
      if (userDoc.exists()) {
        return await finishLogin(userDoc.data() as User, userDoc.id);
      }

      // Try direct getDoc by email first (to avoid listing/query permission checks which can fail under security rules for non-staff)
      if (fbUser.email) {
        const lowerEmail = fbUser.email.toLowerCase().trim();
        let emailDoc = await getDoc(doc(db, "users", lowerEmail));
        if (!emailDoc.exists() && fbUser.email !== lowerEmail) {
          emailDoc = await getDoc(doc(db, "users", fbUser.email));
        }
        if (emailDoc.exists()) {
          const profile = emailDoc.data() as User;
          const profileId = emailDoc.id;
          
          // Migrate to correct UID document for faster lookups in future
          const profileData = { ...profile, updated_at: serverTimestamp() };
          await setDoc(doc(db, "users", fbUser.uid), profileData);
          
          // Optionally delete the old document
          if (profileId !== fbUser.uid) {
            try { await deleteDoc(doc(db, "users", profileId)); } catch (e) { console.error("Migration cleanup error:", e); }
          }
          
          return await finishLogin(profileData as User, fbUser.uid);
        }
      }

      // If missing, search by email (might be due to UID mismatch during registration)
      const q = query(collection(db, "users"), where("email", "==", fbUser.email));
      const querySnapshot = await getDocs(q);
      if (!querySnapshot.empty) {
        const profile = querySnapshot.docs[0].data() as User;
        const profileId = querySnapshot.docs[0].id;
        
        // Migrate to correct UID document for faster lookups in future
        const profileData = { ...profile, updated_at: serverTimestamp() };
        await setDoc(doc(db, "users", fbUser.uid), profileData);
        
        // Optionally delete the old document if it was an auto-id
        if (profileId !== fbUser.uid) {
          try { await deleteDoc(doc(db, "users", profileId)); } catch (e) { console.error("Migration cleanup error:", e); }
        }
        
        return await finishLogin(profileData as User, fbUser.uid);
      }

      // If user exists in Auth but not in Firestore (Master fallback)
      if (isMasterEmail(fbUser.email)) {
        const masterProfile: any = {
          username: fbUser.email,
          role: "admin",
          full_name: "REAGAN (MASTER)",
          staff_id: "MASTER",
          email: fbUser.email,
          created_at: serverTimestamp(),
        };
        await setDoc(doc(db, "users", fbUser.uid), masterProfile);
        return { id: fbUser.uid, ...masterProfile } as User;
      }

      throw new Error("User profile not found");
    } catch (error: any) {
      // Special handling for Master first-time sign-up or alternate password setup
      if (isMasterEmail(email) && (error.code === 'auth/user-not-found' || error.code === 'auth/invalid-credential')) {
         try {
           const resolvedMasterEmail = email.includes('@') ? email : (email === 'kulyakosukusandereagan' ? 'kulyakosukusandereagan@gmail.com' : (email === 'junubposcenter' ? 'junubposcenter@gmail.com' : 'tekkisandereagan@gmail.com'));
           const newUser = await createUserWithEmailAndPassword(auth, resolvedMasterEmail, credentials.password);
           const masterProfile: any = {
             username: resolvedMasterEmail,
             role: "admin",
             full_name: resolvedMasterEmail.toLowerCase() === 'tekkisandereagan@gmail.com' ? "REAGAN (MASTER)" : (resolvedMasterEmail.toLowerCase() === 'junubposcenter@gmail.com' ? "JUNUB (MASTER)" : "KULYAKOSUKU (MASTER)"),
             staff_id: "MASTER",
             email: resolvedMasterEmail,
             created_at: serverTimestamp(),
           };
           await setDoc(doc(db, "users", newUser.user.uid), masterProfile);
           return {
             id: newUser.user.uid,
             ...masterProfile
           } as User;
         } catch (createError: any) {
           if (createError.code === 'auth/email-already-in-use') {
             // User exists in auth but password was incorrect, propagate original login error
             throw error;
           }
           throw createError;
         }
      }
      throw error;
    }
  },

  async getUsers(): Promise<User[]> {
    try {
      const q = activeTenantId 
        ? query(collection(db, "users"), where("tenant_id", "==", activeTenantId))
        : query(collection(db, "users"));
      const snapshot = await getDocs(q);
      return snapshot.docs
        .map(doc => ({ id: doc.id, ...doc.data() } as User))
        .filter(u => u.staff_id !== 'MASTER' && u.username !== 'MASTER');
    } catch (error) {
      return handleFirestoreError(error, OperationType.LIST, "users");
    }
  },

  async registerStaff(staff: Omit<User, "id" | "created_at"> & { password?: string }) {
    try {
      // Normalize username and email
      const normalizedUsername = (staff.username || "").trim().toLowerCase();
      const normalizedEmail = (staff.email || "").trim().toLowerCase();
      
      // 1. Determine UID
      let uid = "";
      const domain = activeTenantCode ? `${activeTenantCode}.com` : 'arkprinters.com';
      const emailToUse = normalizedEmail || `${normalizedUsername}@${domain}`;
      
      // If the email matches current user, use main app auth
      const mainAuth = getAuth();
      if (mainAuth.currentUser && mainAuth.currentUser.email === emailToUse) {
        uid = mainAuth.currentUser.uid;
      } else if (staff.password) {
        try {
          // Use secondaryAuth to prevent signing out the current admin
          const userCredential = await createUserWithEmailAndPassword(secondaryAuth, emailToUse, staff.password);
          uid = userCredential.user.uid;
        } catch (authError: any) {
          if (authError.code === 'auth/email-already-in-use') {
             // If already in auth, try to sign in with specified password to get their UID
             try {
               const loginCred = await signInWithEmailAndPassword(secondaryAuth, emailToUse, staff.password);
               uid = loginCred.user.uid;
               console.log(`[Register Staff Sync] User already in Auth, matched specified password. UID: ${uid}`);
             } catch (signInErr) {
               // Try fallback password 'password123'
               try {
                 const loginCred = await signInWithEmailAndPassword(secondaryAuth, emailToUse, 'password123');
                 await updatePassword(loginCred.user, staff.password);
                 uid = loginCred.user.uid;
                 console.log(`[Register Staff Sync] User already in Auth under 'password123'. Reset to specified password. UID: ${uid}`);
               } catch (fallbackErr) {
                 console.warn(`[Register Staff Sync] Email in use but password mismatch:`, fallbackErr);
                 // We don't have the UID, but we'll fall back to saving under email and auto-migrating on successful login
               }
             }
          } else {
            throw authError;
          }
        }
      }

      // 2. Create profile in Firestore
      const profileData: any = withTenant({
        ...staff,
        username: normalizedUsername,
        email: emailToUse,
        created_at: serverTimestamp(),
        commission_balance: 0
      });
      // Keep password readable for Admin
      // delete profileData.password; 

      if (uid) {
        await setDoc(doc(db, "users", uid), profileData);
        await this.saveToUsernameMap(normalizedUsername, emailToUse, staff.password);
        if (activeTenantCode) {
          await this.saveToUsernameMap(`${normalizedUsername}@${activeTenantCode}`, emailToUse, staff.password);
        }
        return { uid, email: emailToUse };
      } else {
        // Use raw email as doc ID if no UID yet
        await setDoc(doc(db, "users", emailToUse), profileData);
        await this.saveToUsernameMap(normalizedUsername, emailToUse, staff.password);
        if (activeTenantCode) {
          await this.saveToUsernameMap(`${normalizedUsername}@${activeTenantCode}`, emailToUse, staff.password);
        }
        return { uid: emailToUse, email: emailToUse };
      }
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, "users");
    }
  },

  async updateUser(userId: string, data: Partial<User>) {
    try {
      // 1. Self-healing email sync for Admin email edits
      if (data.email) {
        try {
          const userDoc = await getDoc(doc(db, "users", userId));
          if (userDoc.exists()) {
            const userData = userDoc.data();
            const oldEmail = userData.email;
            const newEmail = data.email.trim().toLowerCase();
            
            if (oldEmail && oldEmail.trim().toLowerCase() !== newEmail) {
              console.log(`[Admin Email Sync] Detected email change from ${oldEmail} to ${newEmail}. Syncing Firebase Auth...`);
              const password = userData.password || "password123";
              try {
                const credential = await signInWithEmailAndPassword(secondaryAuth, oldEmail, password);
                await updateEmail(credential.user, newEmail);
                console.log(`[Admin Email Sync] Successfully updated Firebase Auth email to ${newEmail}`);
              } catch (authErr) {
                console.warn(`[Admin Email Sync] Direct email update failed, trying fallback creation...`, authErr);
                try {
                  await createUserWithEmailAndPassword(secondaryAuth, newEmail, password);
                  console.log(`[Admin Email Sync] Created missing Auth user with new email: ${newEmail}`);
                } catch (createErr) {
                  console.warn(`[Admin Email Sync] Fallback creation failed (likely already exists):`, createErr);
                }
              }
            }
          }
        } catch (syncErr) {
          console.error("[Admin Email Sync] General sync failure:", syncErr);
        }
      }

      // 2. Self-healing password sync for Admin password resets
      if (data.password) {
        try {
          const userDoc = await getDoc(doc(db, "users", userId));
          if (userDoc.exists()) {
            const userData = userDoc.data();
            const email = userData.email;
            
            // Capture previous password to allow multi-device self-healing logins
            if (userData.password && userData.password !== data.password) {
              (data as any).previous_password = userData.password;
            }
            
            if (email) {
              const candidates: string[] = [];
              if (userData.password) {
                candidates.push(userData.password);
              }
              if (!candidates.includes("password123")) {
                candidates.push("password123");
              }
              if (!candidates.includes(data.password)) {
                candidates.push(data.password);
              }
              
              let synced = false;
              for (const candidate of candidates) {
                try {
                  const credential = await signInWithEmailAndPassword(secondaryAuth, email, candidate);
                  if (candidate !== data.password) {
                    await updatePassword(credential.user, data.password);
                    console.log(`[Admin Password Sync] Updated Firebase Auth password for ${email} from candidate '${candidate}' to new password.`);
                  } else {
                    console.log(`[Admin Password Sync] Firebase Auth password already matches the new password for ${email}`);
                  }
                  synced = true;
                  break;
                } catch (authErr: any) {
                  console.warn(`[Admin Password Sync] Candidate '${candidate}' failed for ${email}:`, authErr.code || authErr.message);
                }
              }
              
              if (!synced) {
                try {
                  await createUserWithEmailAndPassword(secondaryAuth, email, data.password);
                  console.log(`[Admin Password Sync] Created missing Firebase Auth user for ${email}`);
                } catch (createErr: any) {
                  console.error(`[Admin Password Sync] Failed to create Auth user as fallback:`, createErr);
                }
              }
            }
          }
        } catch (syncErr) {
          console.error("[Admin Password Sync] General sync failure:", syncErr);
        }
      }

      await updateDoc(doc(db, "users", userId), { ...data, updated_at: serverTimestamp() });
      
      // Update username map
      try {
        const userDoc = await getDoc(doc(db, "users", userId));
        if (userDoc.exists()) {
          const uData = userDoc.data();
          if (uData.username && uData.email) {
            await this.saveToUsernameMap(uData.username, uData.email, uData.password, uData.previous_password);
          }
        }
      } catch (mapErr) {
        console.warn("[Username Map Update] Warning updating username_map in updateUser:", mapErr);
      }
    } catch (error) {
      return handleFirestoreError(error, OperationType.UPDATE, `users/${userId}`);
    }
  },

  async changePassword(userId: string, password: string) {
    // 1. Update in Firestore users doc
    await this.updateUser(userId, { password } as any);

    // 2. Also update in current Auth session if the logged-in user's UID matches the userId
    try {
      const auth = getAuth();
      if (auth.currentUser && auth.currentUser.uid === userId) {
        await updatePassword(auth.currentUser, password);
      }
    } catch (authError) {
      console.warn("Auth session password update warning (resolved via self-healing):", authError);
    }
  },

  async getStaffWorkReport(staffId: string): Promise<Order[]> {
    try {
      const q = query(collection(db, "orders"), where("assigned_staff_id", "==", staffId));
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Order));
    } catch (error) {
      return handleFirestoreError(error, OperationType.LIST, "orders");
    }
  },

  async getAllStaffReports(): Promise<any[]> {
    try {
      const users = await this.getUsers();
      // Only get orders from the last 30 days for reports to save quota
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      const orders = await this.getOrders({ start: thirtyDaysAgo, end: new Date() }, 'admin', 'MASTER');
      
      return users.map(user => {
        let workCount = 0;
        let totalValue = 0;
        const involvedOrders: Order[] = [];

        orders.forEach(o => {
          const isDesigner = o.designer_id === user.id;
          const isOperator = o.operator_id === user.id;
          const isAssigned = o.assigned_staff_id === user.id;
          
          if (isDesigner || isOperator || (isAssigned && !o.designer_id && !o.operator_id)) {
            involvedOrders.push(o);
            
            const hasSharedDifferent = o.designer_id && o.operator_id && o.designer_id !== o.operator_id;
            
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
          ...user,
          work_count: workCount,
          total_value: totalValue,
          orders: involvedOrders
        };
      });
    } catch (error) {
      throw error;
    }
  },

  // Customers
  async getCustomers(): Promise<Customer[]> {
    try {
      const q = activeTenantId
        ? query(collection(db, "customers"), where("tenant_id", "==", activeTenantId), orderBy("created_at", "desc"))
        : query(collection(db, "customers"), orderBy("created_at", "desc"));
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Customer));
    } catch (error) {
      return handleFirestoreError(error, OperationType.LIST, "customers");
    }
  },

  async addCustomer(customer: Omit<Customer, "id" | "created_at">) {
    try {
      const docRef = await addDoc(collection(db, "customers"), withTenant({
        ...customer,
        created_at: serverTimestamp()
      }));
      return docRef.id;
    } catch (error) {
      return handleFirestoreError(error, OperationType.CREATE, "customers");
    }
  },

  // Quotations
  async getQuotations(): Promise<Quotation[]> {
    try {
      const q = activeTenantId
        ? query(collection(db, "quotations"), where("tenant_id", "==", activeTenantId), orderBy("created_at", "desc"))
        : query(collection(db, "quotations"), orderBy("created_at", "desc"));
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Quotation));
    } catch (error) {
      return handleFirestoreError(error, OperationType.LIST, "quotations");
    }
  },

  async createQuotation(quotation: Omit<Quotation, "id" | "created_at">) {
    try {
      const docRef = await addDoc(collection(db, "quotations"), withTenant({
        ...quotation,
        created_at: serverTimestamp()
      }));
      return docRef.id;
    } catch (error) {
      return handleFirestoreError(error, OperationType.CREATE, "quotations");
    }
  },

  async updateQuotationStatus(id: string, status: Quotation["status"], convertedOrderId?: string, usd_rate?: number) {
    try {
      const docRef = doc(db, "quotations", id);
      const updateData: any = { status };
      if (convertedOrderId) {
        updateData.converted_order_id = convertedOrderId;
      }
      if (usd_rate !== undefined) {
        updateData.usd_rate = usd_rate;
      }
      await updateDoc(docRef, updateData);
    } catch (error) {
      return handleFirestoreError(error, OperationType.UPDATE, "quotations");
    }
  },

  async updateQuotation(id: string, quotation: Partial<Quotation>) {
    try {
      const docRef = doc(db, "quotations", id);
      await updateDoc(docRef, quotation);
    } catch (error) {
      return handleFirestoreError(error, OperationType.UPDATE, "quotations");
    }
  },

  async deleteQuotation(id: string) {
    try {
      await deleteDoc(doc(db, "quotations", id));
    } catch (error) {
      return handleFirestoreError(error, OperationType.DELETE, "quotations");
    }
  },

  // Services
  async getServices(): Promise<Service[]> {
    try {
      const q = activeTenantId
        ? query(collection(db, "services"), where("tenant_id", "==", activeTenantId))
        : query(collection(db, "services"));
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Service));
    } catch (error) {
      return handleFirestoreError(error, OperationType.LIST, "services");
    }
  },

  async addService(service: Omit<Service, "id">) {
    try {
      const docRef = await addDoc(collection(db, "services"), withTenant(service));
      return docRef.id;
    } catch (error) {
      return handleFirestoreError(error, OperationType.CREATE, "services");
    }
  },

  async getAssets(): Promise<Asset[]> {
    try {
      const q = activeTenantId
        ? query(collection(db, "assets"), where("tenant_id", "==", activeTenantId))
        : query(collection(db, "assets"));
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Asset));
    } catch (error) {
      return handleFirestoreError(error, OperationType.LIST, "assets");
    }
  },

  async addAsset(asset: Omit<Asset, "id">) {
    try {
      const docRef = await addDoc(collection(db, "assets"), withTenant(asset));
      return docRef.id;
    } catch (error) {
      return handleFirestoreError(error, OperationType.CREATE, "assets");
    }
  },

  async requestAssetUsage(assetId: string, assetName: string, userId: string, userName: string) {
    try {
      await addDoc(collection(db, "asset_requests"), withTenant({
        asset_id: assetId,
        asset_name: assetName,
        requested_by_id: userId,
        requested_by_name: userName,
        status: 'pending',
        created_at: serverTimestamp()
      }));
    } catch (error) {
      return handleFirestoreError(error, OperationType.CREATE, "asset_requests");
    }
  },

  async updateAsset(id: string, data: Partial<Asset>) {
    try {
      const assetRef = doc(db, "assets", id);
      await updateDoc(assetRef, data);
      return true;
    } catch (error) {
      return handleFirestoreError(error, OperationType.UPDATE, "assets");
    }
  },

  async requestAssetReduction(assetId: string, request: any) {
    try {
      const assetRef = doc(db, "assets", assetId);
      await updateDoc(assetRef, {
        reduction_requests: arrayUnion({
          id: Math.random().toString(36).substr(2, 9),
          ...request,
          status: 'pending',
          created_at: new Date().toISOString()
        })
      });
      return true;
    } catch (error) {
      return handleFirestoreError(error, OperationType.UPDATE, `assets/${assetId}`);
    }
  },

  async processAssetReduction(assetId: string, requestId: string, decision: 'approved' | 'rejected', currentRequests: any[], quantityToReduce?: number) {
    try {
      const assetRef = doc(db, "assets", assetId);
      const updatedRequests = currentRequests.map(r => r.id === requestId ? { ...r, status: decision } : r);
      
      const updates: any = { reduction_requests: updatedRequests };
      if (decision === 'approved' && quantityToReduce !== undefined) {
        updates.quantity = increment(-quantityToReduce);
      }
      
      await updateDoc(assetRef, updates);
      return true;
    } catch (error) {
      return handleFirestoreError(error, OperationType.UPDATE, `assets/${assetId}`);
    }
  },

  async deleteAsset(id: string) {
    try {
      await deleteDoc(doc(db, "assets", id));
      return true;
    } catch (error) {
      return handleFirestoreError(error, OperationType.DELETE, "assets");
    }
  },

  // Inventory
  async getSettings() {
    try {
      const tenantPrefix = activeTenantId ? `${activeTenantId}_` : 'default_tenant_';
      const snapshot = await getDocs(collection(db, "settings"));
      const settings: any = {};
      snapshot.docs.forEach(doc => {
        if (doc.id.startsWith(tenantPrefix)) {
          const keyWithoutPrefix = doc.id.substring(tenantPrefix.length);
          settings[keyWithoutPrefix] = doc.data().value;
        } else if (!doc.id.includes('_')) {
          // Backward compatibility for unscoped settings
          if (settings[doc.id] === undefined) {
            settings[doc.id] = doc.data().value;
          }
        }
      });
      return settings;
    } catch (error) {
      return handleFirestoreError(error, OperationType.LIST, "settings");
    }
  },

  async updateSetting(key: string, value: any) {
    try {
      const docId = activeTenantId ? `${activeTenantId}_${key}` : `default_tenant_${key}`;
      await setDoc(doc(db, "settings", docId), { 
        value,
        key,
        tenant_id: activeTenantId || 'default_tenant',
        updated_at: serverTimestamp() 
      });
    } catch (error) {
      return handleFirestoreError(error, OperationType.WRITE, `settings/${key}`);
    }
  },

  async deleteCustomer(id: string) {
    try {
      await deleteDoc(doc(db, "customers", id));
    } catch (error) {
      return handleFirestoreError(error, OperationType.DELETE, `customers/${id}`);
    }
  },

  async deleteUser(id: string) {
    try {
      await deleteDoc(doc(db, "users", id));
    } catch (error) {
      return handleFirestoreError(error, OperationType.DELETE, `users/${id}`);
    }
  },

  async updateStaffRole(userId: string, role: string) {
    try {
      await updateDoc(doc(db, "users", userId), { role });
    } catch (error) {
      return handleFirestoreError(error, OperationType.UPDATE, `users/${userId}`);
    }
  },

  async deleteService(serviceId: string) {
    try {
      await deleteDoc(doc(db, "services", serviceId));
    } catch (error) {
      return handleFirestoreError(error, OperationType.DELETE, `services/${serviceId}`);
    }
  },

  async updateStock(itemId: string, newStock: number) {
    try {
      await updateDoc(doc(db, "services", itemId), { stock: newStock });
    } catch (error) {
      return handleFirestoreError(error, OperationType.UPDATE, `services/${itemId}`);
    }
  },

  async restock(itemId: string, amount: number, staffId: string, staffName: string) {
    try {
      await runTransaction(db, async (transaction) => {
        const serviceRef = doc(db, "services", itemId);
        const serviceSnap = await transaction.get(serviceRef);
        if (!serviceSnap.exists()) throw new Error("Service not found");
        
        transaction.update(serviceRef, { 
          stock: increment(amount),
          last_restock: new Date().toISOString()
        });

        const logRef = doc(collection(db, "inventory_logs"));
        transaction.set(logRef, {
          service_id: itemId,
          service_name: serviceSnap.data().name,
          amount,
          type: 'restock',
          staff_id: staffId,
          staff_name: staffName,
          created_at: serverTimestamp()
        });
      });
    } catch (error) {
      return handleFirestoreError(error, OperationType.UPDATE, `services/${itemId}`);
    }
  },

  // Orders
  async getOrders(dateRange?: { start: Date, end: Date }, userRole?: string, userId?: string): Promise<Order[]> {
    if (!userId) return [];
    try {
      let q;
      if (activeTenantId) {
        if (userRole === 'designer' || userRole === 'operator') {
          q = query(collection(db, "orders"), where("tenant_id", "==", activeTenantId), where("assigned_staff_id", "==", userId));
        } else if (userRole === 'sales_marketing') {
          q = query(collection(db, "orders"), where("tenant_id", "==", activeTenantId), where("referrer_id", "==", userId));
        } else if (userRole !== 'admin' && userRole !== 'supervisor' && userRole !== 'receptionist' && userId !== 'MASTER') {
          q = query(collection(db, "orders"), where("tenant_id", "==", activeTenantId), where("assigned_staff_id", "==", userId));
        } else {
          q = query(collection(db, "orders"), where("tenant_id", "==", activeTenantId));
        }
      } else {
        if (userRole === 'designer' || userRole === 'operator') {
          q = query(collection(db, "orders"), where("assigned_staff_id", "==", userId));
        } else if (userRole === 'sales_marketing') {
          q = query(collection(db, "orders"), where("referrer_id", "==", userId));
        } else if (userRole !== 'admin' && userRole !== 'supervisor' && userRole !== 'receptionist' && userId !== 'MASTER') {
          q = query(collection(db, "orders"), where("assigned_staff_id", "==", userId));
        } else {
          q = query(collection(db, "orders"));
        }
      }

      // SERVER-SIDE Date Range Filter
      const snapshot = await getDocs(q);
      const isHistoryAllowed = userRole === 'admin' || userRole === 'supervisor' || userId === 'MASTER';
      const startT = dateRange?.start ? dateRange.start.getTime() : 0;
      const endT = dateRange?.end ? dateRange.end.getTime() : Infinity;
      
      // Post-fetch filtering and sorting
      return snapshot.docs
        .map(doc => ({ id: doc.id, ...(doc.data() as any) } as Order))
        .filter(order => {
          // Date Filter
          const orderTime = (order.created_at as any)?.toMillis?.() || 0;
          if (dateRange && (orderTime < startT || orderTime > endT)) return false;
          
          // Staff Visibility Filter
          if (userRole === 'designer' || userRole === 'operator') {
            // See assigned work OR unassigned work in relevant status
            const isAssignedToMe = order.assigned_staff_id === userId;
            const isUnassignedRelevant = !order.assigned_staff_id && (
              (userRole === 'designer' && order.status === 'at_designer') ||
              (userRole === 'operator' && order.status === 'production')
            );
            if (!isAssignedToMe && !isUnassignedRelevant) return false;
          }
          
          // History Filter
          return isHistoryAllowed || (order.status !== 'completed' && order.payment_status !== 'paid');
        })
        .sort((a, b) => {
          const t1 = (a.created_at as any)?.seconds || 0;
          const t2 = (b.created_at as any)?.seconds || 0;
          return t2 - t1; // Descending
        });
    } catch (error) {
      return handleFirestoreError(error, OperationType.LIST, "orders");
    }
  },

  async getOrderItems(orderId: string): Promise<any[]> {
    try {
      const itemsSnapshot = await getDocs(collection(db, "orders", orderId, "items"));
      return itemsSnapshot.docs.map(d => ({ id: d.id, ...d.data() }));
    } catch (error) {
      return handleFirestoreError(error, OperationType.LIST, `orders/${orderId}/items`);
    }
  },

  // Helper for consistent notifications
  async notifyStaff(transaction: any, data: { user_id?: string | null, role?: string | null, message: string, systemMessage?: string }) {
    const sysId = activeTenantId ? `system@${activeTenantCode || 'default'}.com` : "system@arkprinters.com";
    const sysName = activeTenantName ? `${activeTenantName.toUpperCase()} SYSTEM` : "ARK SYSTEM";
    
    // Replace any hardcoded ARK SYSTEM prefixes dynamically with the active tenant system name
    let finalSystemMessage = data.systemMessage || data.message;
    if (finalSystemMessage) {
      finalSystemMessage = finalSystemMessage.replace(/\[ARK SYSTEM\]/g, `[${sysName}]`);
    }

    const stageInfo = withTenant({
      user_id: data.user_id || null,
      role: data.role || null,
      message: data.message,
      is_read: false,
      created_at: serverTimestamp(),
      sender_id: 'SYSTEM',
      sender_name: sysName
    });
    
    // 1. Create Bell Notification
    const noteRef = doc(collection(db, "notifications"));
    transaction.set(noteRef, stageInfo);

    // 2. Create System Message if it's for a specific user
    if (data.user_id) {
      const msgRef = doc(collection(db, "messages"));
      transaction.set(msgRef, withTenant({
        sender_id: "SYSTEM",
        sender_email: sysId,
        sender_name: sysName,
        receiver_id: data.user_id,
        message: finalSystemMessage,
        chat_id: this.getChatId("SYSTEM", data.user_id),
        participants: ["SYSTEM", sysId, data.user_id],
        created_at: serverTimestamp()
      }));
    }
    
    // If it's role-based, we'd need to notify all users with that role. 
    // For now, most assignments are individual.
  },

  async createOrder(order: Omit<Order, "id" | "created_at">) {
    try {
      return await runTransaction(db, async (transaction) => {
        const now = new Date();
        const monthStr = String(now.getMonth() + 1).padStart(2, '0');
        const yearStr = now.getFullYear().toString();
        const currentMonthYear = `${monthStr}/${yearStr}`;

        const seqRef = doc(db, "settings", `${activeTenantId || "default"}_order_sequence`);
        const seqSnap = await transaction.get(seqRef);
        let newCount = 1;
        if (seqSnap.exists()) {
          const data = seqSnap.data();
          if (data.month === currentMonthYear) {
            newCount = (data.count || 0) + 1;
          }
        }
        transaction.set(seqRef, { month: currentMonthYear, count: newCount });

        const jobOrderId = `JO ${String(newCount).padStart(3, '0')}/${currentMonthYear}`;
        const orderRef = doc(collection(db, "orders"));
        const itemsSummary = order.items ? order.items.map((i: any) => `${i.service_name || 'Service'} x${i.quantity}`).join(', ') : '';
        // Ensure status is present
        const orderData: any = {
          ...order,
          job_order_id: jobOrderId,
          status: order.status || 'pending',
          items_summary: itemsSummary,
          created_at: serverTimestamp(),
          payment_status: 'unpaid',
          paid_amount: 0,
          commission_amount: (order.referrer_id && order.total_profit && order.total_profit > 0) ? (order.total_profit * 0.05) : 0,
          stage_history: {}
        };

        const initialStageInfo = {
          staff_id: order.assigned_staff_id || 'RECEPTION',
          staff_name: order.assigned_staff_name || order.assigned_staff_username || 'Receptionist',
          timestamp: Timestamp.now()
        };

        if (orderData.status === 'at_designer') {
          orderData.stage_history.at_designer = initialStageInfo;
          if (order.assigned_staff_id) {
            orderData.designer_id = order.assigned_staff_id;
            orderData.designer_name = order.assigned_staff_name || order.assigned_staff_username;
          }
        }
        if (orderData.status === 'production') {
          orderData.stage_history.production = initialStageInfo;
          if (order.assigned_staff_id) {
            orderData.operator_id = order.assigned_staff_id;
            orderData.operator_name = order.assigned_staff_name || order.assigned_staff_username;
          }
        }
        
        const { items, ...orderHeader } = orderData;
        
        // Comprehensive undefined/null cleaning and type forcing
        const cleanHeader: any = {};
        Object.entries(orderHeader).forEach(([k, v]) => {
          if (v !== undefined && v !== null) {
            if (['total_amount', 'commission_amount', 'discount'].includes(k)) {
              cleanHeader[k] = Number(v);
            } else {
              cleanHeader[k] = v;
            }
          }
        });
        
        transaction.set(orderRef, withTenant(cleanHeader));

        if (items) {
          for (const item of items) {
            const itemRef = doc(collection(db, "orders", orderRef.id, "items"));
            const cleanItem: any = {};
            Object.entries(item).forEach(([k, v]) => {
              if (v !== undefined && v !== null) {
                if (['price', 'price_at_time', 'quantity'].includes(k)) {
                  cleanItem[k] = Number(v);
                } else {
                  cleanItem[k] = v;
                }
              }
            });
            transaction.set(itemRef, cleanItem);

            // Deduct stock from the service (only if it's not a manual item)
            if (!item.service_id.startsWith('manual-')) {
              const serviceRef = doc(db, "services", item.service_id);
              transaction.update(serviceRef, { 
                stock: increment(-item.quantity) 
              });
            }
          }
        }

        if (order.assigned_staff_id) {
          await this.notifyStaff(transaction, {
            user_id: order.assigned_staff_id,
            message: `New order assigned: #${orderRef.id}`,
            systemMessage: `[ARK SYSTEM] New Task Assigned! 
Order: #${orderRef.id}
Customer: ${order.customer_name || 'N/A'}
Details: ${order.description || 'N/A'}
Items: ${itemsSummary || 'No items'}
Logged at ${new Date().toLocaleTimeString()}`
          });
        }

        return orderRef.id;
      });
    } catch (error) {
      return handleFirestoreError(error, OperationType.CREATE, "orders");
    }
  },

  async updateOrderStatus(orderId: string, status: string, staffId?: string, staffName?: string) {
    try {
      await runTransaction(db, async (transaction) => {
        const orderRef = doc(db, "orders", orderId);
        const orderSnap = await transaction.get(orderRef);
        if (!orderSnap.exists()) throw new Error("Order not found");
        const orderData = orderSnap.data();
        const currentStatus = orderData.status;

        // Validation of transitions
        const allowed: Record<string, string[]> = {
          'pending': ['at_designer', 'production', 'cancelled'],
          'at_designer': ['production', 'pending_client_approval', 'cancelled'],
          'production': ['done_awaiting_invoice', 'cancelled'],
          'pending_client_approval': ['production', 'at_designer', 'cancelled'],
          'done_awaiting_invoice': ['ready_for_payment', 'completed', 'paid', 'cancelled'],
          'ready_for_payment': ['paid', 'completed', 'cancelled'],
          'paid': ['completed', 'cancelled'],
          'completed': ['paid']
        };

        if (currentStatus !== status && allowed[currentStatus] && !allowed[currentStatus].includes(status)) {
          throw new Error(`Invalid status transition from ${currentStatus} to ${status}`);
        }

        // Update status AND make this staff member the one currently assigned if passed
        const updates: any = { status, updated_at: serverTimestamp() };
        
        const stageInfo = {
          staff_id: staffId || orderData.assigned_staff_id || 'UNKNOWN',
          staff_name: staffName || orderData.assigned_staff_username || 'Staff',
          timestamp: Timestamp.now()
        };

        // Track stage history and assign specialists
        if (status === 'at_designer') {
          updates['stage_history.at_designer'] = stageInfo;
          if (staffId) {
            updates.designer_id = staffId;
            updates.designer_name = staffName;
          }
        }
        if (status === 'production') {
          updates['stage_history.production'] = stageInfo;
          if (staffId) {
            updates.operator_id = staffId;
            updates.operator_name = staffName;
          }
        }
        if (status === 'completed' || status === 'done_awaiting_invoice') {
          updates['stage_history.completed'] = stageInfo;
          // Unassign from specialized staff so it leaves their active queue
          updates.assigned_staff_id = null;
          updates.assigned_staff_username = null;
        }

        if (staffId && status !== 'completed' && status !== 'done_awaiting_invoice') {
          updates.staff_id = staffId;
          updates.staff_name = staffName;
          updates.assigned_staff_id = staffId; // Update assigned staff so it shows in their queue
          updates.assigned_staff_username = staffName;
        }

        // Clean updates
        const cleanUpdates: any = {};
        Object.entries(updates).forEach(([k, v]) => {
          if (v !== undefined) cleanUpdates[k] = v;
        });
        transaction.update(orderRef, cleanUpdates);

        // Logic for notifications
        if (status === 'done_awaiting_invoice' || status === 'completed') {
          const notifyId = orderData.staff_id;
          await this.notifyStaff(transaction, {
            user_id: notifyId || null,
            role: notifyId ? null : 'receptionist',
            message: `Order #${orderId} marked as ${status.replace('_', ' ')} by ${staffName}.`,
            systemMessage: `[ARK SYSTEM] Work Update
Order: #${orderId}
Customer: ${orderData.customer_name}
Status: ${status.replace('_', ' ')}
Handled By: ${staffName}
${status === 'done_awaiting_invoice' ? 'Action: Please prepare invoice and confirm payment.' : 'The job is now finalized.'}`
          });
        }

        if (status === 'at_designer' || status === 'production') {
          const targetUid = staffId || orderData.assigned_staff_id;
          const orderDesc = orderData.description || 'N/A';
          const itemsSum = orderData.items_summary || 'N/A';
          const custName = orderData.customer_name || 'N/A';

          await this.notifyStaff(transaction, {
            user_id: targetUid || null,
            role: staffId ? null : (status === 'at_designer' ? 'designer' : 'operator'),
            message: `New assignment for Order #${orderId}`,
            systemMessage: targetUid ? `[ARK SYSTEM] New Task Assignment! 
Order: #${orderId}
Customer: ${custName}
Stage: ${status.replace('_', ' ')}
Work Details: ${orderDesc}
Items: ${itemsSum}
Logged at ${new Date().toLocaleTimeString()}` : undefined
          });
        }

        if ((status === 'done_awaiting_invoice' || status === 'ready_for_payment') && 
            orderData.status !== 'done_awaiting_invoice' && orderData.status !== 'ready_for_payment') {
          
          if (orderData.referrer_id && orderData.commission_amount > 0) {
            const referrerRef = doc(db, "users", orderData.referrer_id);
            transaction.update(referrerRef, { commission_balance: increment(orderData.commission_amount) });
          }
        }
      });
    } catch (error) {
      return handleFirestoreError(error, OperationType.UPDATE, `orders/${orderId}`);
    }
  },

  async approveOrder(orderId: string, staffId: string, staffName: string) {
    try {
      await runTransaction(db, async (transaction) => {
        const orderRef = doc(db, "orders", orderId);
        const orderSnap = await transaction.get(orderRef);
        if (!orderSnap.exists()) throw new Error("Order not found");
        const orderData = orderSnap.data();

        transaction.update(orderRef, {
          status: 'processing',
          approval: {
            approved_by_id: staffId,
            approved_by_name: staffName,
            approved_at: serverTimestamp()
          },
          updated_at: serverTimestamp()
        });

        // Notify the reporter/creator or assigned staff
        const notifyId = orderData.assigned_staff_id || orderData.reported_by_id;
        if (notifyId) {
          await this.notifyStaff(transaction, {
            user_id: notifyId,
            message: `Order #${orderId} has been APPROVED by ${staffName}.`,
            systemMessage: `[ARK SYSTEM] Order Approval Notification
Order: #${orderId}
Customer: ${orderData.customer_name}
Status: Processing
Approved By: ${staffName}
Time: ${new Date().toLocaleTimeString()}
The team is now working on your request.`
          });
        }
      });
    } catch (error) {
      return handleFirestoreError(error, OperationType.UPDATE, `orders/${orderId}`);
    }
  },

  async requestDiscount(orderId: string, amount: number, reason: string, staff: { id: string, name: string }) {
    try {
      if (amount > 10) throw new Error("Discount cannot exceed 10%");
      
      await updateDoc(doc(db, "orders", orderId), {
        discount_request: {
          amount,
          reason,
          status: 'pending',
          requested_by_id: staff.id,
          requested_by_name: staff.name,
          requested_at: serverTimestamp()
        },
        updated_at: serverTimestamp()
      });
      
      // Notify admins
      const orderSnap = await getDoc(doc(db, "orders", orderId));
      if (orderSnap.exists()) {
        const orderData = orderSnap.data();
        await runTransaction(db, async (transaction) => {
          await this.notifyStaff(transaction, {
            role: 'admin',
            message: `Discount request for Order #${orderId}: ${amount}% requested by ${staff.name}.`,
            systemMessage: `[ARK SYSTEM] Discount Request Approval Needed
Order: #${orderId}
Customer: ${orderData.customer_name}
Requested Discount: ${amount}%
Reason: ${reason}
Requested By: ${staff.name}
Time: ${new Date().toLocaleTimeString()}`
          });
        });
      }
    } catch (error) {
      return handleFirestoreError(error, OperationType.UPDATE, `orders/${orderId}`);
    }
  },

  async decideDiscount(orderId: string, status: 'approved' | 'rejected', admin: { id: string, name: string }) {
    try {
      await runTransaction(db, async (transaction) => {
        const orderRef = doc(db, "orders", orderId);
        const orderSnap = await transaction.get(orderRef);
        if (!orderSnap.exists()) throw new Error("Order not found");
        const orderData = orderSnap.data();
        
        const request = orderData.discount_request;
        if (!request) throw new Error("No discount request found");

        const updates: any = {
           'discount_request.status': status,
           'discount_request.approved_by_id': admin.id,
           'discount_request.approved_by_name': admin.name,
           'discount_request.approved_at': serverTimestamp(),
           updated_at: serverTimestamp()
        };

        if (status === 'approved') {
          updates.discount = request.amount;
        } else {
          updates.discount = 0;
        }

        transaction.update(orderRef, updates);
        
        // Notify the requester
        if (request.requested_by_id) {
           await this.notifyStaff(transaction, {
             user_id: request.requested_by_id,
             message: `Discount request for Order #${orderId} was ${status.toUpperCase()}.`,
             systemMessage: `[ARK SYSTEM] Discount Request Update
Order: #${orderId}
Result: ${status.toUpperCase()}
Amount: ${request.amount}%
Approved By: ${admin.name}
Time: ${new Date().toLocaleTimeString()}
${status === 'approved' ? 'The discount has been applied to the invoice.' : 'The original price remains.'}`
           });
        }
      });
    } catch (error) {
      return handleFirestoreError(error, OperationType.UPDATE, `orders/${orderId}`);
    }
  },

  async updateOrderPaymentStatus(orderId: string, paymentStatus: 'paid' | 'unpaid') {
    try {
      await runTransaction(db, async (transaction) => {
        const orderRef = doc(db, "orders", orderId);
        const orderSnap = await transaction.get(orderRef);
        if (!orderSnap.exists()) throw new Error("Order not found");
        const orderData = orderSnap.data();

        transaction.update(orderRef, { 
          payment_status: paymentStatus, 
          status: paymentStatus === 'paid' ? 'paid' : 'ready_for_payment',
          updated_at: serverTimestamp()
        });

        const notifyId = orderData.assigned_staff_id || orderData.reported_by_id;
        if (notifyId && paymentStatus === 'paid') {
          await this.notifyStaff(transaction, {
            user_id: notifyId,
            message: `Payment confirmed for Order #${orderId}.`,
            systemMessage: `[ARK SYSTEM] Payment Receipt Confirmation
Order: #${orderId}
Customer: ${orderData.customer_name}
Total: UGX ${orderData.total_amount?.toLocaleString()}
Payment Status: FULLY PAID
Thank you for your business.`
          });
        }
      });
    } catch (error) {
      return handleFirestoreError(error, OperationType.UPDATE, `orders/${orderId}`);
    }
  },

  async processPayment(order_id: string, amount: number, method: string, recorded_by: string) {
    try {
      return await runTransaction(db, async (transaction) => {
        const orderRef = doc(db, "orders", order_id);
        const orderSnap = await transaction.get(orderRef);
        if (!orderSnap.exists()) throw new Error("Order not found");
        
        const orderData = orderSnap.data();
        const currentPaid = Number(orderData.paid_amount || 0);
        const newTotalPaid = currentPaid + amount;
        const totalAmount = Number(orderData.total_amount || 0);
        const discountPct = Number(orderData.discount || 0);
        const payableAmount = totalAmount * (1 - discountPct / 100);

        let newPaymentStatus: 'unpaid' | 'partially_paid' | 'paid' = 'unpaid';
        if (newTotalPaid >= (payableAmount - 0.01)) { // Allow sub-cent float margin
          newPaymentStatus = 'paid';
        } else if (newTotalPaid > 0) {
          newPaymentStatus = 'partially_paid';
        }

        const paymentRef = doc(collection(db, "payments"));
        transaction.set(paymentRef, {
          order_id,
          amount,
          method,
          recorded_by,
          created_at: serverTimestamp()
        });

        transaction.update(orderRef, { 
          paid_amount: newTotalPaid,
          payment_status: newPaymentStatus,
          status: newPaymentStatus === 'paid' ? 'paid' : orderData.status,
          updated_at: serverTimestamp(),
          payment_method: method // Keep trace of last used method
        });

        const notifyId = orderData.assigned_staff_id || orderData.reported_by_id;
        if (notifyId) {
          await this.notifyStaff(transaction, {
            user_id: notifyId,
            message: `New payment of UGX ${amount.toLocaleString()} received for Order #${order_id}.`,
            systemMessage: `[ARK SYSTEM] Payment Received
Order: #${order_id}
Customer: ${orderData.customer_name}
Amount: UGX ${amount.toLocaleString()}
Method: ${method}
Balance Remaining: UGX ${(totalAmount - newTotalPaid).toLocaleString()}
Status: ${newPaymentStatus.replace('_', ' ').toUpperCase()}
Recorded by: ${recorded_by}`
          });
        }
        
        return { newPaidAmount: newTotalPaid, isFullyPaid: newPaymentStatus === 'paid' };
      });
    } catch (error) {
      return handleFirestoreError(error, OperationType.WRITE, "payments");
    }
  },

  async getOrderPayments(orderId: string): Promise<any[]> {
    try {
      const q = query(collection(db, "payments"), where("order_id", "==", orderId), orderBy("created_at", "desc"));
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      return handleFirestoreError(error, OperationType.LIST, `payments?order_id=${orderId}`);
    }
  },

  // Notifications Subscription
  subscribeNotifications(userId: string, userRole: string, callback: (notes: any[]) => void) {
    if (!userId) return () => {};
    // Simplify query to avoid index issues in preview environment
    const q = query(
      collection(db, "notifications"),
      orderBy("created_at", "desc"),
      limit(100)
    );

    return onSnapshot(q, (snapshot) => {
      const notes = snapshot.docs
        .map(doc => ({ id: doc.id, ...(doc.data() as any) }))
        .filter((note: any) => {
          // Filter client-side for reliability
          const isForMe = note.user_id === userId;
          const isForMyRole = note.role === userRole;
          const isForAll = note.user_id === 'all' || note.role === 'all';
          return (isForMe || isForMyRole || isForAll);
        })
        .sort((a: any, b: any) => (b.created_at?.toMillis?.() || 0) - (a.created_at?.toMillis?.() || 0));
      callback(notes);
    });
  },

  async markNotificationRead(id: string) {
    try {
      await updateDoc(doc(db, "notifications", id), { is_read: true });
    } catch (error) {
      return handleFirestoreError(error, OperationType.UPDATE, `notifications/${id}`);
    }
  },

  // Finances
  async getFinances(dateRange?: { start: Date, end: Date }): Promise<any> {
    try {
      let expensesQuery = activeTenantId 
        ? query(collection(db, "expenses"), where("tenant_id", "==", activeTenantId), orderBy("created_at", "desc"))
        : query(collection(db, "expenses"), orderBy("created_at", "desc"));
      let fundingQuery = activeTenantId
        ? query(collection(db, "funding"), where("tenant_id", "==", activeTenantId), orderBy("created_at", "desc"))
        : query(collection(db, "funding"), orderBy("created_at", "desc"));

      if (dateRange) {
        if (activeTenantId) {
          expensesQuery = query(
            collection(db, "expenses"),
            where("tenant_id", "==", activeTenantId),
            where("created_at", ">=", Timestamp.fromDate(dateRange.start)),
            where("created_at", "<=", Timestamp.fromDate(dateRange.end)),
            orderBy("created_at", "desc")
          );
          fundingQuery = query(
            collection(db, "funding"),
            where("tenant_id", "==", activeTenantId),
            where("created_at", ">=", Timestamp.fromDate(dateRange.start)),
            where("created_at", "<=", Timestamp.fromDate(dateRange.end)),
            orderBy("created_at", "desc")
          );
        } else {
          expensesQuery = query(
            collection(db, "expenses"),
            where("created_at", ">=", Timestamp.fromDate(dateRange.start)),
            where("created_at", "<=", Timestamp.fromDate(dateRange.end)),
            orderBy("created_at", "desc")
          );
          fundingQuery = query(
            collection(db, "funding"),
            where("created_at", ">=", Timestamp.fromDate(dateRange.start)),
            where("created_at", "<=", Timestamp.fromDate(dateRange.end)),
            orderBy("created_at", "desc")
          );
        }
      }

      const expensesSnap = await getDocs(expensesQuery);
      const fundingSnap = await getDocs(fundingQuery);
      
      return {
        expenses: expensesSnap.docs.map(d => ({ id: d.id, ...d.data() })),
        funding: fundingSnap.docs.map(d => ({ id: d.id, ...d.data() }))
      };
    } catch (error) {
      return handleFirestoreError(error, OperationType.LIST, "finances");
    }
  },

  async recordExpense(expense: any) {
    try {
      return await runTransaction(db, async (transaction) => {
        const docRef = doc(collection(db, "expenses"));
        transaction.set(docRef, withTenant({
          ...expense,
          status: 'pending',
          created_at: serverTimestamp()
        }));

        // Send system message and notification to approver
        if (expense.approver_id) {
          await this.notifyStaff(transaction, {
            user_id: expense.approver_id,
            message: `Expense approval needed: ${expense.item}`,
            systemMessage: `[LONGUN SYSTEM] Expense Approval Required!
Item: ${expense.item}
Amount: ${expense.amount} ${expense.currency || 'SSP'}
Category: ${expense.category || 'N/A'}
Requested at: ${new Date().toLocaleTimeString()}`
          });
        }
        return docRef.id;
      });
    } catch (error) {
      return handleFirestoreError(error, OperationType.CREATE, "expenses");
    }
  },
  
  async approveExpense(expenseId: string, approverId: string, approverName: string, status: 'approved' | 'rejected') {
    try {
      const docRef = doc(db, "expenses", expenseId);
      await updateDoc(docRef, {
        status,
        approver_id: approverId,
        approver_name: approverName,
        updated_at: serverTimestamp(),
        approved_at: serverTimestamp()
      });
      return true;
    } catch (error) {
      return handleFirestoreError(error, OperationType.UPDATE, `expenses/${expenseId}`);
    }
  },

  async deleteExpense(expenseId: string) {
    try {
      const docRef = doc(db, "expenses", expenseId);
      await deleteDoc(docRef);
      return true;
    } catch (error) {
      return handleFirestoreError(error, OperationType.DELETE, `expenses/${expenseId}`);
    }
  },

  async recordFunding(funding: any) {
    try {
      return await runTransaction(db, async (transaction) => {
        const docRef = doc(collection(db, "funding"));
        transaction.set(docRef, withTenant({
          ...funding,
          created_at: serverTimestamp()
        }));

        // Notify admins about new funding
        await this.notifyStaff(transaction, {
          role: 'admin',
          message: `Internal funding recorded: ${funding.amount} ${funding.currency || 'SSP'}`,
        });

        return docRef.id;
      });
    } catch (error) {
      return handleFirestoreError(error, OperationType.CREATE, "funding");
    }
  },

  async deleteOrder(id: string) {
    try {
      const itemsSnapshot = await getDocs(collection(db, "orders", id, "items"));
      for (const docSnap of itemsSnapshot.docs) {
        await deleteDoc(doc(db, "orders", id, "items", docSnap.id));
      }
      
      const paymentsSnapshot = await getDocs(query(collection(db, "payments"), where("order_id", "==", id)));
      for (const docSnap of paymentsSnapshot.docs) {
        await deleteDoc(doc(db, "payments", docSnap.id));
      }
      
      await deleteDoc(doc(db, "orders", id));
    } catch (error) {
      return handleFirestoreError(error, OperationType.DELETE, `orders/${id}`);
    }
  },

  async getAllOrderItems() {
    try {
      const snapshot = await getDocs(collectionGroup(db, 'items'));
      return snapshot.docs.map(doc => ({
        id: doc.id,
        order_id: doc.ref.parent.parent?.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error("Error fetching all order items:", error);
      return [];
    }
  },

  async getDashboardStats(currentUser: User): Promise<DashboardStats> {
    try {
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      
      // Filter by reasonable date range to save quota
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const orders = await this.getOrders({ start: startOfMonth, end: now }, currentUser.role, currentUser.id);
      const svcs = await this.getServices();

      const dailySales = orders
        .filter(o => o.payment_status === 'paid' && o.created_at?.toDate() >= today)
        .reduce((sum, o) => sum + (o.total_amount || 0), 0);

      const thisMonth = now.getMonth();
      const monthlyRevenue = orders
        .filter(o => o.payment_status === 'paid' && o.created_at?.toDate()?.getMonth() === thisMonth)
        .reduce((sum, o) => sum + (o.total_amount || 0), 0);

      return {
        todaySales: dailySales,
        dailySales,
        monthlyRevenue,
        pendingOrders: orders.filter(o => o.status !== 'paid').length,
        lowStockAlerts: svcs.filter(s => s.stock <= s.minimum_stock).length
      };
    } catch (error) {
      throw error;
    }
  },

  // Helper for consistent chat IDs
  getChatId(userId1: string, userId2: string): string {
    return [userId1, userId2].sort().join('_');
  },

  // Real-time Chat Listener
  subscribeMessages(userId: string, userEmail: string, otherId: string, otherEmail: string, callback: (msgs: ChatMessage[]) => void) {
    const chatId = this.getChatId(userId, otherId);
    
    // Optimized: filter by chatId directly to avoid fetching all user's messages
    const q = query(
      collection(db, "messages"),
      where("chat_id", "==", chatId),
      where("participants", "array-contains", userId)
    );

    return onSnapshot(q, (snapshot) => {
      const msgs = snapshot.docs
        .map(doc => ({ id: doc.id, ...doc.data() } as ChatMessage))
        .sort((a, b) => (a.created_at?.toMillis?.() || 0) - (b.created_at?.toMillis?.() || 0));
      callback(msgs);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, "messages");
    });
  },

  // Real-time Calls Listener (Disabled)
  subscribeCalls(_userId: string, _callback: (call: any) => void) {
    return () => {};
  },

  async sendMessage(data: { sender_id: string, sender_email: string, receiver_id: string | null, receiver_email: string | null, message: string }) {
    try {
      await runTransaction(db, async (transaction) => {
        const msgRef = doc(collection(db, "messages"));
        
        const sId = data.sender_id;
        const rId = data.receiver_id;
        
        const messageData: any = {
          sender_id: data.sender_id,
          sender_email: data.sender_email,
          message: data.message,
          created_at: serverTimestamp()
        };

        if (rId) {
          messageData.chat_id = this.getChatId(sId, rId);
          messageData.participants = [data.sender_id, data.sender_email, rId, data.receiver_email].filter(Boolean);
          messageData.receiver_id = rId;
        } else {
          messageData.participants = [data.sender_id, data.sender_email].filter(Boolean);
        }

        transaction.set(msgRef, messageData);

        if (data.receiver_id || data.receiver_email) {
          const noteRef = doc(collection(db, "notifications"));
          transaction.set(noteRef, {
            user_id: data.receiver_id,
            email: data.receiver_email,
            sender_id: data.sender_id, // Include sender_id for navigation
            message: `New message: ${data.message.substring(0, 30)}...`,
            is_read: false,
            created_at: serverTimestamp()
          });
        }
      });
    } catch (error) {
      return handleFirestoreError(error, OperationType.CREATE, "messages");
    }
  },

  async setLogoBase64(base64: string) {
    try {
      await this.updateSetting('logo_base64', base64);
      return true;
    } catch (error) {
      return handleFirestoreError(error, OperationType.UPDATE, "settings/logo_base64");
    }
  },

  async toggleAppLock(locked: boolean) {
    try {
      await setDoc(doc(db, "settings", "app_lock"), { 
        locked, 
        updated_at: serverTimestamp() 
      });
      return true;
    } catch (error) {
      return handleFirestoreError(error, OperationType.UPDATE, "settings/app_lock");
    }
  },

  async isAppLocked() {
    try {
      const snap = await getDoc(doc(db, "settings", "app_lock"));
      return snap.exists() ? (snap.data() as any).locked : false;
    } catch (error) {
      return false;
    }
  },

  async purgeAllData() {
    try {
      const collections = ["orders", "customers", "services", "expenses", "payments", "funding", "notifications", "messages", "inventory_logs"];
      for (const colName of collections) {
        const snap = await getDocs(collection(db, colName));
        if (snap.empty) continue;
        
        // Handle max batch size of 500
        const chunks = [];
        for (let i = 0; i < snap.docs.length; i += 500) {
          chunks.push(snap.docs.slice(i, i + 500));
        }

        for (const chunk of chunks) {
          const batch = writeBatch(db);
          for (const d of chunk) {
            batch.delete(d.ref);
            // Also attempt to delete subcollections if it's an order
            if (colName === 'orders') {
              const itemsSnap = await getDocs(collection(db, "orders", d.id, "items"));
              itemsSnap.docs.forEach(itemDoc => batch.delete(itemDoc.ref));
            }
          }
          await batch.commit();
        }
      }
      return true;
    } catch (error) {
      return handleFirestoreError(error, OperationType.DELETE, "all_collections");
    }
  },

  async acceptTerms(userId: string) {
    try {
      await updateDoc(doc(db, "users", userId), {
        terms_accepted: true,
        terms_accepted_at: serverTimestamp()
      });
      return true;
    } catch (error) {
      return handleFirestoreError(error, OperationType.UPDATE, `users/${userId}`);
    }
  },

  async updateOrder(orderId: string, data: Partial<Order>) {
    try {
      const orderRef = doc(db, "orders", orderId);
      const cleanData: any = {};
      Object.entries(data).forEach(([k, v]) => {
        if (v !== undefined && v !== null) {
          if (['total_amount', 'commission_amount', 'discount'].includes(k)) {
            cleanData[k] = Number(v);
          } else {
            cleanData[k] = v;
          }
        }
      });
      await updateDoc(orderRef, cleanData);
      return true;
    } catch (error) {
      return handleFirestoreError(error, OperationType.UPDATE, `orders/${orderId}`);
    }
  },

  async createCommissionRequest(amount: number, notes: string, currentUser: any) {
    try {
      const docRef = doc(collection(db, "commission_requests"));
      await setDoc(docRef, {
        referrer_id: currentUser.id,
        referrer_name: currentUser.full_name || currentUser.username,
        referrer_email: currentUser.email || '',
        amount: Number(amount),
        notes: notes || '',
        status: 'pending',
        created_at: serverTimestamp(),
        updated_at: serverTimestamp()
      });
      return docRef.id;
    } catch (error) {
      return handleFirestoreError(error, OperationType.CREATE, "commission_requests");
    }
  },

  async getCommissionRequests(): Promise<any[]> {
    try {
      const ref = collection(db, "commission_requests");
      const snap = await getDocs(ref);
      return snap.docs.map(d => ({ id: d.id, ...d.data() }));
    } catch (error) {
      return handleFirestoreError(error, OperationType.LIST, "commission_requests");
    }
  },

  async decideCommissionRequest(requestId: string, status: 'approved' | 'rejected', admin: { id: string, name: string }) {
    try {
      return await runTransaction(db, async (transaction) => {
        const reqRef = doc(db, "commission_requests", requestId);
        const reqSnap = await transaction.get(reqRef);
        if (!reqSnap.exists()) throw new Error("Commission request not found");
        const reqData = reqSnap.data();

        if (reqData.status !== 'pending') {
          throw new Error("This request is already resolved");
        }

        // Update request status
        transaction.update(reqRef, {
          status: status,
          approved_by_id: admin.id,
          approved_by_name: admin.name,
          approved_at: serverTimestamp(),
          updated_at: serverTimestamp()
        });

        if (status === 'approved') {
          // Decrement user's commission_balance
          const userRef = doc(db, "users", reqData.referrer_id);
          const userSnap = await transaction.get(userRef);
          if (!userSnap.exists()) throw new Error("Marketer user profile not found");
          const userData = userSnap.data();
          const currentBalance = userData.commission_balance || 0;

          if (currentBalance < reqData.amount) {
            throw new Error(`Insufficient commission balance. Current balance is UGX ${currentBalance.toLocaleString()}`);
          }

          transaction.update(userRef, {
            commission_balance: increment(-reqData.amount)
          });

          // Create an approved expense for reception (which decreases reception and lets receptionist see it as commission payout)
          const expenseRef = doc(collection(db, "expenses"));
          transaction.set(expenseRef, {
            item: `Commission Payout to ${reqData.referrer_name}`,
            amount: reqData.amount,
            category: 'Commissions',
            status: 'approved',
            recorded_by: admin.name,
            created_at: serverTimestamp(),
            updated_at: serverTimestamp(),
            approver_id: admin.id,
            approver_name: admin.name,
            approved_at: serverTimestamp()
          });

          // Notify the marketer
          await this.notifyStaff(transaction, {
            user_id: reqData.referrer_id,
            message: `Your commission request of UGX ${reqData.amount.toLocaleString()} has been APPROVED!`,
            systemMessage: `[ARK SYSTEM] Commission payout request approved.
Amount: UGX ${reqData.amount.toLocaleString()}
Approved by: ${admin.name}
Details: Cash disbursement recorded. Please request receptionist / administrator to collect your cash.`
          });
        } else {
          // Notify the marketer about rejection
          await this.notifyStaff(transaction, {
            user_id: reqData.referrer_id,
            message: `Your commission request of UGX ${reqData.amount.toLocaleString()} was REJECTED.`,
            systemMessage: `[ARK SYSTEM] Commission payout request rejected.
Amount: UGX ${reqData.amount.toLocaleString()}
Rejected by: ${admin.name}
Please consult your administrator for further details.`
          });
        }
        return true;
      });
    } catch (error) {
      return handleFirestoreError(error, OperationType.UPDATE, `commission_requests/${requestId}`);
    }
  },

  // Task Management
  async getTasks(): Promise<Task[]> {
    try {
      const q = activeTenantId 
        ? query(collection(db, "tasks"), where("tenant_id", "==", activeTenantId), orderBy("created_at", "desc"))
        : query(collection(db, "tasks"), orderBy("created_at", "desc"));
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Task[];
    } catch (error) {
      console.error("Error fetching tasks:", error);
      return [];
    }
  },

  async createTask(task: Omit<Task, 'id' | 'created_at'>): Promise<string> {
    try {
      const docRef = await addDoc(collection(db, "tasks"), withTenant({
        ...task,
        created_at: serverTimestamp()
      }));
      return docRef.id;
    } catch (error) {
      console.error("Error creating task:", error);
      throw error;
    }
  },

  async updateTask(taskId: string, taskData: Partial<Task>): Promise<boolean> {
    try {
      const docRef = doc(db, "tasks", taskId);
      await updateDoc(docRef, {
        ...taskData,
        updated_at: serverTimestamp()
      });
      return true;
    } catch (error) {
      console.error("Error updating task:", error);
      throw error;
    }
  },

  async deleteTask(taskId: string): Promise<boolean> {
    try {
      const docRef = doc(db, "tasks", taskId);
      await deleteDoc(docRef);
      return true;
    } catch (error) {
      console.error("Error deleting task:", error);
      throw error;
    }
  },

  async seedInitialData() {
    // Initial data seeding can be done manually or via a one-time script
    return Promise.resolve();
  }
};
