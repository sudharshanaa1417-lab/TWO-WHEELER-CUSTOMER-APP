# 🏍️ TWO WHEELER FINANCE — Customer Management System

An ultra-modern, offline-first **Android-ready PWA & Full-Stack Web Application** built with an eye-catching **Glassmorphism (Aurora Obsidian & Frost Glass)** UI, **IndexedDB offline local database**, **Smart Search with live matching character highlight**, and **Excel (`.xlsx` / `.csv`) Import & Export**.

Designed specifically for Two-Wheeler Finance businesses to record customer loans, track vehicle details, search numbers like `TN 15` or Loan Number `A15 G27`, and manage accounts completely offline or backed up to cloud servers.

---

## 🌟 Key Features

### 1. Customer Database Columns (9 Core Fields)
1. **Customer Name** (வாடிக்கையாளர் பெயர்)
2. **Vehicle Number** (வாகன எண் — e.g. `TN 15 AB 1234`)
3. **Loan Number** (கடன் எண் — e.g. `A15 G27`)
4. **Mobile Number** (மொபைல் எண்)
5. **Address** (முகவரி)
6. **Vehicle Model** (வாகன மாதிரி — e.g. `Honda Activa 6G`)
7. **Finance Amount** (நிதி தொகை — ₹)
8. **Monthly Payment** (மாதாந்திர தவணை / EMI — ₹)
9. **Remarks** (குறிப்புகள் / Due Date / Status)

### 2. Smart Search (Live Highlight & Fast Lookup)
- **Search by Vehicle Number**: Type `TN 15` (or `tn15`) to list `TN 15 AB 1234`, `TN 15 AC 5678`, `TN 15 AD 9012`.
- **Search by Loan Number**: Type `A15 G27` (or `A15`) to immediately find that specific loan.
- **Search by Name, Mobile, Address, or Model**: Multi-field search across all fields.
- **Live Highlight**: The matching characters are dynamically highlighted with a glowing amber badge (`<mark>` highlight) inside the search results.
- **Full Customer Profile**: Tapping any search result opens the customer's full profile modal with:
  - Instant **WhatsApp EMI Reminder** link with pre-filled loan details
  - One-tap **Phone Call** button
  - **Copy Customer Summary** to clipboard
  - Edit or Delete profile

### 3. Excel Import & Export
- **100% Offline Excel processing** using SheetJS (`xlsx`).
- **Export**: One-click download as `.xlsx` (formatted with auto-width columns) or `.csv`.
- **Import**: Drag-and-drop or select `.xlsx` / `.xls` / `.csv` files.
- **Smart Column Auto-Mapping**: Automatically detects headers (`Vehicle No`, `Loan No`, `Reg No`, `EMI`, `Phone`, etc.).
- **Data Preview Table**: Verify customer rows and choose **Merge / Update** or **Clean Replace** before saving.
- **Download Sample Template**: Ready-made `.xlsx` template pre-filled with sample TN vehicle rows and loan numbers.

### 4. 100% Offline Database + Local Data Storage
- Uses **IndexedDB** in the browser with automatic fallback to **localStorage**.
- Works seamlessly without internet on mobile phones and laptops.
- Pre-loaded with demo TN 15 customer data and `A15 G27` loan numbers for immediate testing.

---

## 🚀 Quick Start (Local Development)

```bash
npm run install:all
npm run dev:client   # starts React + Vite on http://localhost:5173
npm run dev:server   # starts Express API on http://localhost:5000
```

---

## 📤 Push Changes to GitHub

```powershell
git add .
git commit -m "feat: add loan number field (A15 G27), update smart search & clean dashboard"
git push origin main
```
