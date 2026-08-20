<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://ai.google.dev/static/site-assets/images/share-ais-513315318.png" />
</div>

# ARK Management (Ark Printing & Longun Tech)

This is a professional business administration and production pipeline application developed for **Ark Printers & Longun Tech**, built inside Google AI Studio, running React, Tailwind CSS, and Google Firebase Firestore for persistence.

## 🚀 How to Deploy on Vercel

If you want to host this application on Vercel and received a **"Repository cannot be found"** or similar error, follow these steps to connect and deploy.

### Step 1: Why Vercel says "Repository cannot be found"
This usually happens because Vercel does not have authorized access to your private GitHub repositories or the organization where the code resides.

**How to fix:**
1. Log in to your [Vercel Dashboard](https://vercel.com/dashboard).
2. Click on your profile picture in the top right, go to **Settings**, and select **Integrations**.
3. Locate **GitHub** and click **Configure**.
4. In the GitHub settings page, scroll down to **Repository access**.
5. Change from "Only select repositories" to **"All repositories"**, or manually add this specific repository, then click **Save**.
6. Go back to Vercel and import again—it will now show up!

---

### Step 2: Push Your Code to GitHub (If not done already)
1. Initialize a Git repository locally:
   ```bash
   git init
   git add .
   git commit -m "Initialize ARK Management"
   ```
2. Create a new repository on GitHub.
3. Link and push your commits:
   ```bash
   git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
   git branch -M main
   git push -u origin main
   ```

---

### Step 3: Configure the Vercel Import Settings
When importing your repository into Vercel, check these build options:

- **Framework Preset:** `Vite` (Vercel will detect this automatically)
- **Root Directory:** `./`
- **Build Command:** `npm run build`
- **Output Directory:** `dist`

### Step 4: SPA Routing Support
We have included a custom `vercel.json` file in the root folder of the project. This configures Vercel to route all deep links (e.g. `/dashboard`, `/orders`) back to `index.html` internally. This prevents Vercel from returning `404 Not Found` when refreshing the browser!

---

## 💻 Run Your App Locally

**Prerequisites:** Node.js (v18+)

1. Install dependencies:
   ```bash
   npm install
   ```
2. Run the development server:
   ```bash
   npm run dev
   ```
   The app will run locally on `http://localhost:3000`.
