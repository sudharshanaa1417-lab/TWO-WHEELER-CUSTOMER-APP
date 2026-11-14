# TWO WHEELER FINANCE — Customer Management System

An offline-first **Android-ready PWA & Full-Stack Web App** built with a distinctive **Aurora / Crystal Glassmorphism** UI, **IndexedDB local offline storage**, **Smart Search with live character highlighting**, and **Excel (`.xlsx` / `.csv`) Import & Export**.

## Features

- **4-Module Dashboard**:
  - **Customers** (`Customer List`): Card & Table views, sorting, quick filtering, and full profile drawer.
  - **Add Customer** (`New Entry`): Stores all 8 required columns offline immediately.
  - **Smart Search** (`Find Customer`): Type `TN 15` (or `tn15`) to find all matching vehicle numbers (`TN 15 AB 1234`, `TN 15 AC 5678`, `TN 15 AD 9012`), or search by Customer Name, Mobile Number, Address, Vehicle Model, and Remarks — with **live yellow/amber character highlighting**. Clicking any result opens the **Full Customer Profile** with one-tap Call & WhatsApp actions.
  - **Excel** (`Import / Export`): Export `.xlsx` / `.csv`, download a sample import template, and drag-and-drop `.xlsx` / `.xls` / `.csv` files with a preview table before importing.
- **Customer Database Columns**:
  - `Customer Name`
  - `Vehicle Number`
  - `Mobile Number`
  - `Address`
  - `Vehicle Model`
  - `Finance Amount`
  - `Monthly Payment`
  - `Remarks`
- **Offline Database + Local Storage + Cloud Sync**:
  - Uses browser **IndexedDB** (with `localStorage` fallback) and a **PWA Service Worker** so you can install it directly onto Android ("Add to Home Screen") and run 100% offline.
  - Includes an **Express.js REST API (`server/`)** for optional cloud backup/sync on **Render**.

## Local Development

```bash
npm run install:all
npm run dev:server   # starts API on http://localhost:5000
npm run dev:client   # starts React + Vite on http://localhost:5173
```

## Deploy Frontend to Vercel

1. Import this GitHub repository in [Vercel](https://vercel.com).
2. Vercel automatically detects `vercel.json` (`client/dist` output).
3. Optional: Set environment variable `VITE_API_URL` to your Render backend URL (e.g. `https://two-wheeler-finance-api.onrender.com`), or configure it inside the app via the **Server** button.

## Deploy Backend (or Fullstack) to Render

1. Create a new **Web Service** or **Blueprint** on [Render](https://render.com) connected to this GitHub repository.
2. Render automatically uses `render.yaml`:
   - Build Command: `npm install --prefix server && npm install --prefix client && npm run build --prefix client`
   - Start Command: `npm run start --prefix server`
   - Health Check Path: `/api/health`
