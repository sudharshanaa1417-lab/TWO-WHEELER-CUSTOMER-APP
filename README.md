# 🏍️ TWO WHEELER FINANCE — Customer Management System

An ultra-modern, offline-first **Android-ready PWA & Full-Stack Web Application** built with an eye-catching **Glassmorphism (Aurora Obsidian & Frost Glass)** UI, **IndexedDB offline local database**, **Smart Search with live matching character highlight**, and **Excel (`.xlsx` / `.csv`) Import & Export**.

Designed specifically for Two-Wheeler Finance businesses to record customer loans, track vehicle details, search numbers like `TN 15`, and manage accounts completely offline or backed up to cloud servers.

---

## 📸 App Preview & Final Architecture

```
TWO WHEELER FINANCE
Customer Management System

┌────────────────────────────────────────────────────────┐
│  [ Customers ]        [ Add Customer ]                 │
│  Customer List        New Entry                        │
│                                                        │
│  [ Smart Search ]     [ Excel ]                        │
│  Find Customer        Import / Export                  │
└────────────────────────────────────────────────────────┘
```

---

## 🌟 Key Features

### 1. Customer Database Columns (8 Core Fields)
Every customer record is saved with complete financial and vehicle details:
1. **Customer Name** (வாடிக்கையாளர் பெயர்)
2. **Vehicle Number** (வாகன எண் — e.g. `TN 15 AB 1234`)
3. **Mobile Number** (மொபைல் எண்)
4. **Address** (முகவரி)
5. **Vehicle Model** (வாகன மாதிரி — e.g. `Honda Activa 6G`)
6. **Finance Amount** (நிதி தொகை — ₹)
7. **Monthly Payment** (மாதாந்திர தவணை / EMI — ₹)
8. **Remarks** (குறிப்புகள் / Due Date / Status)

### 2. Smart Search (புத்திசாலி தேடல் & Highlight)
- **Substring & Space-Tolerant Search**: Type `TN 15` (or `tn15`) to immediately list all matching vehicles:
  - `TN 15 AB 1234`
  - `TN 15 AC 5678`
  - `TN 15 AD 9012`
- **Multi-field Search**: Search by **Customer Name**, **Mobile Number**, **Address**, or **Vehicle Model**.
- **Live Highlight**: The matching characters are dynamically highlighted with a glowing amber badge (`<mark>` highlight) inside the search results.
- **Full Customer Profile**: Tapping any search result opens the customer's full profile modal with:
  - Instant **WhatsApp EMI Reminder** link
  - One-tap **Phone Call** button
  - **Copy Customer Summary** to clipboard
  - Edit or Delete profile

### 3. Excel Import & Export (எக்செல் மேலாளர்)
- **100% Offline Excel processing** using SheetJS (`xlsx`).
- **Export**: One-click download as `.xlsx` (formatted with auto-width columns) or `.csv`.
- **Import**: Drag-and-drop or select `.xlsx` / `.xls` / `.csv` files.
- **Smart Column Auto-Mapping**: Automatically detects headers (`Vehicle No`, `Reg No`, `EMI`, `Phone`, etc.).
- **Data Preview Table**: Verify customer rows and choose **Merge / Update** or **Clean Replace** before saving.
- **Download Sample Template**: Ready-made `.xlsx` template pre-filled with sample TN vehicle rows.

### 4. 100% Offline Database + Local Data Storage
- Uses **IndexedDB** in the browser with automatic fallback to **localStorage**.
- Works seamlessly without internet on mobile phones and laptops.
- Pre-loaded with demo TN 15 customer data for immediate testing.

### 5. Eye-Catching Glassmorphism Design
- Differing completely from ordinary plain dashboards.
- **Aurora Obsidian Theme** (Dark neon frosted glass with glowing emerald & cyan highlights).
- **Frost Glass Theme** (Clean daylight translucent glass).
- Liquid prism animated background mesh.
- Mobile-first responsive Android floating dock navigation.

---

## 🚀 Quick Start (Local Development)

### Prerequisites
- Node.js (v18 or higher)
- npm or pnpm

### Run Locally

1. **Clone the repository**:
   ```bash
   git clone https://github.com/sudharshanaa1417-lab/TWO-WHEELER-CUSTOMER-APP.git
   cd "TWO WHEELER CUSTOMER APP"
   ```

2. **Install dependencies**:
   ```bash
   npm run install:all
   ```

3. **Start local servers**:
   ```bash
   # Terminal 1: Start Express API (port 5000)
   npm run dev:server

   # Terminal 2: Start Vite React Frontend (port 5173)
   npm run dev:client
   ```
   Open `http://localhost:5173` in your browser.

---

## 📲 How to Install as an Android App

### Method 1: Progressive Web App (PWA) — Instant & No APK Needed
1. Deploy to **Vercel** (or Render) with HTTPS.
2. Open the URL in **Google Chrome** on your Android smartphone.
3. Tap the **3 dots (menu)** in Chrome and select **"Add to Home screen"** or **"Install App"**.
4. The app icon will appear on your Android launcher like a native app with full offline capabilities!

### Method 2: Build Native Android APK with Capacitor (Optional)
```bash
cd client
npm install @capacitor/core @capacitor/cli @capacitor/android
npx cap init "Two Wheeler Finance" "com.twowheeler.finance" --web-dir dist
npm run build
npx cap add android
npx cap open android
```
Then click **Build > Build Bundle(s) / APK(s) > Build APK(s)** in Android Studio.

---

## 🌐 Deploy to Vercel (Frontend Hosting)

1. Go to [vercel.com](https://vercel.com) and log in with your GitHub account.
2. Click **"Add New..." > "Project"**.
3. Select your repository: **`sudharshanaa1417-lab/TWO-WHEELER-CUSTOMER-APP`**.
4. Configure the project:
   - **Framework Preset**: `Vite`
   - **Root Directory**: Leave as `./` (or select `client`)
   - **Build Command**: `npm run build --prefix client`
   - **Output Directory**: `client/dist`
   - **Install Command**: `npm install --prefix client`
5. (Optional) Under **Environment Variables**, add:
   - `VITE_API_URL` = Your Render backend URL (e.g. `https://two-wheeler-finance-api.onrender.com`)
6. Click **Deploy**. Vercel will build and give you a fast global HTTPS URL (e.g. `https://two-wheeler-customer-app.vercel.app`).

> **Note**: Even without a backend, the Vercel frontend is 100% functional with local offline IndexedDB and Excel import/export!

---

## ☁️ Deploy to Render (Backend API & Fullstack)

1. Go to [render.com](https://render.com) and sign in.
2. Click **"New +" > "Web Service"** (or use **"Blueprint"** with `render.yaml`).
3. Connect your GitHub repository: **`sudharshanaa1417-lab/TWO-WHEELER-CUSTOMER-APP`**.
4. Fill in settings:
   - **Name**: `two-wheeler-finance-api`
   - **Region**: Singapore or closest to you
   - **Branch**: `main`
   - **Runtime**: `Node`
   - **Build Command**:
     ```bash
     npm install --prefix server && npm install --prefix client && npm run build --prefix client
     ```
   - **Start Command**:
     ```bash
     npm run start --prefix server
     ```
5. Under **Environment Variables**, add:
   - `NODE_ENV` = `production`
   - `PORT` = `10000`
   - `CORS_ORIGIN` = `*` (or your Vercel URL)
6. Click **Create Web Service**.
7. Once deployed, Render will provide a live URL like `https://two-wheeler-finance-api.onrender.com`.

---

## 📤 How to Push to GitHub

To push all your code and updates to your GitHub repository:

```bash
# 1. Check git status
git status

# 2. Stage all files
git add .

# 3. Commit the changes
git commit -m "feat: complete two wheeler finance app with smart search, glassmorphism UI, offline storage, and excel manager"

# 4. Set main branch
git branch -M main

# 5. Push to GitHub
git push -u origin main
```

If GitHub prompts for authentication, use a **GitHub Personal Access Token (PAT)** or authenticate via GitHub CLI (`gh auth login`).

---

## 📂 Project Structure

```
TWO WHEELER CUSTOMER APP/
├── client/                     # Frontend React + Vite PWA
│   ├── public/
│   │   ├── icon.svg            # App Icon (Bike motif)
│   │   ├── manifest.webmanifest# Android PWA install configuration
│   │   └── sw.js               # Service Worker for 100% offline usage
│   ├── src/
│   │   ├── components/
│   │   │   ├── CustomerFormModal.jsx     # Add / Edit Customer
│   │   │   ├── CustomerList.jsx          # Customer List (Cards / Table)
│   │   │   ├── CustomerProfileModal.jsx  # Full Customer Profile + WhatsApp
│   │   │   ├── DashboardHome.jsx         # 2x2 Glass Grid Dashboard
│   │   │   ├── ExcelManager.jsx          # Excel Import / Export (.xlsx / .csv)
│   │   │   ├── Header.jsx                # Glass Header + Status + Theme
│   │   │   ├── HighlightText.jsx         # Live Matching Character Highlight
│   │   │   ├── SmartSearch.jsx           # Smart Search (TN 15, name, mobile...)
│   │   │   └── SyncSettingsModal.jsx     # Storage & Server Config
│   │   ├── db/
│   │   │   ├── indexedDb.js              # Offline IndexedDB + fallback
│   │   │   └── apiSync.js                # Sync with Render Backend
│   │   ├── utils/
│   │   │   ├── excel.js                  # SheetJS parser, template, exporter
│   │   │   ├── format.js                 # INR currency & vehicle plate formatter
│   │   │   └── search.js                 # Multi-token & space-tolerant search
│   │   ├── App.jsx                       # Root shell & navigation
│   │   ├── index.css                     # Aurora & Frost Glassmorphism CSS
│   │   └── main.jsx
│   ├── package.json
│   ├── vercel.json                       # Vercel SPA routing
│   └── vite.config.js
├── server/                     # Backend Express REST API
│   ├── data/                   # Persistent JSON storage
│   ├── index.js                # API server & static client server
│   ├── store.js                # Server storage logic
│   └── package.json
├── package.json                # Monorepo root scripts
├── render.yaml                 # Render Blueprint configuration
├── vercel.json                 # Vercel Root configuration
└── README.md
```

---

## 📄 License
MIT License. Built for Two Wheeler Finance Management.
