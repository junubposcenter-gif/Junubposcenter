# Software Update Dropzone (zip_files)

Place your software update packages (ZIP files or unzipped app directories) into this folder when you want to update specific SaaS modules or components in the platform.

---

## 📁 Directory Structure & Naming Conventions

To update a specific app or service, place its ZIP file or folder here using the standard naming format:

| App / Software Module | Target Component File in `src/components/` | Expected ZIP / Folder Name |
| :--- | :--- | :--- |
| **QuickPharma (Pharmacy & Clinic)** | `src/components/QuickPharmaManager.tsx` | `quickpharma.zip` or `quickpharma/` |
| **JubaPrint (Printing & Branding)** | `src/components/JubaPrintManager.tsx` | `jubaprint.zip` or `jubaprint/` |
| **Junub POS (Retail & Supermarket)** | `src/components/SaaSSimulators.tsx` | `junubpos.zip` or `junubpos/` |
| **School Management System** | `src/components/SaaSSimulators.tsx` | `schoolmanager.zip` or `schoolmanager/` |
| **Hotel & Hospitality Hub** | `src/components/SaaSSimulators.tsx` | `hotelmanager.zip` or `hotelmanager/` |
| **Microfinance & SACCO** | `src/components/SaaSSimulators.tsx` | `microfinance.zip` or `microfinance/` |
| **Logistics & Fleet Tracker** | `src/components/SaaSSimulators.tsx` | `logistics.zip` or `logistics/` |

---

## 🚀 How Updates Work

1. **Upload / Drop:** Drag & drop your app's ZIP file or unzipped directory into this `zip_files/` folder (or upload via the code editor file tree).
2. **Tell the AI:** Send a message like:
   > *"I have dropped `quickpharma.zip` in `zip_files`. Please verify the files and update the QuickPharma module."*
3. **Automated Verification & Integration:**
   - I will inspect the code inside `zip_files/`.
   - I will extract/map the new UI, logic, state, and features into the corresponding target component in `src/components/`.
   - The platform dev server will compile and verify that the module runs without breaking any other app in the system.
