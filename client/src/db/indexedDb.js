const DB_NAME = 'twf_offline_db';
const DB_VERSION = 2;
const STORE_NAME = 'customers';
const META_STORE = 'meta';
const FALLBACK_KEY = 'twf_customers_fallback_v2';
const SEEDED_KEY = 'twf_seeded_v2';

export const DEMO_CUSTOMERS = [
  {
    id: 'cust-tn15-001',
    customerName: 'Karthikeyan S',
    vehicleNumber: 'TN 15 AB 1234',
    loanNumber: 'A15 G27',
    mobileNumber: '9876543210',
    address: '14, Gandhi Road, Villupuram - 605602',
    vehicleModel: 'Honda Activa 6G',
    financeAmount: 78000,
    monthlyPayment: 3450,
    remarks: 'Regular payer · Due 5th of every month',
    createdAt: '2026-01-10T09:00:00.000Z',
    updatedAt: '2026-01-10T09:00:00.000Z'
  },
  {
    id: 'cust-tn15-002',
    customerName: 'Muruganandam R',
    vehicleNumber: 'TN 15 AC 5678',
    loanNumber: 'A15 G28',
    mobileNumber: '9443218765',
    address: '27, Bazaar Street, Ulundurpet - 606107',
    vehicleModel: 'TVS Apache RTR 160',
    financeAmount: 112000,
    monthlyPayment: 4950,
    remarks: '12/24 EMIs completed · RC copy verified',
    createdAt: '2026-02-14T10:30:00.000Z',
    updatedAt: '2026-02-14T10:30:00.000Z'
  },
  {
    id: 'cust-tn15-003',
    customerName: 'Priyadharshini V',
    vehicleNumber: 'TN 15 AD 9012',
    loanNumber: 'A15 G29',
    mobileNumber: '9080123456',
    address: '88, Nehru Nagar, Kallakurichi - 606202',
    vehicleModel: 'Suzuki Access 125',
    financeAmount: 84000,
    monthlyPayment: 3700,
    remarks: 'Auto-debit active · Insurance valid till Dec',
    createdAt: '2026-03-03T11:15:00.000Z',
    updatedAt: '2026-03-03T11:15:00.000Z'
  },
  {
    id: 'cust-tn09-004',
    customerName: 'Aravind Kumar M',
    vehicleNumber: 'TN 09 CK 4421',
    loanNumber: 'B09 K41',
    mobileNumber: '9789054321',
    address: '5, Anna Salai, Teynampet, Chennai - 600018',
    vehicleModel: 'Royal Enfield Classic 350',
    financeAmount: 185000,
    monthlyPayment: 7800,
    remarks: 'VIP Account · Zero overdue',
    createdAt: '2026-04-18T14:20:00.000Z',
    updatedAt: '2026-04-18T14:20:00.000Z'
  },
  {
    id: 'cust-tn38-005',
    customerName: 'Senthil Nathan K',
    vehicleNumber: 'TN 38 BQ 7789',
    loanNumber: 'C38 N12',
    mobileNumber: '9629876543',
    address: '102, Avinashi Road, Peelamedu, Coimbatore - 641004',
    vehicleModel: 'Bajaj Pulsar N160',
    financeAmount: 124000,
    monthlyPayment: 5200,
    remarks: 'Reminder sent for November EMI',
    createdAt: '2026-05-22T16:45:00.000Z',
    updatedAt: '2026-05-22T16:45:00.000Z'
  }
];

function openDb() {
  return new Promise((resolve, reject) => {
    if (typeof indexedDB === 'undefined') {
      reject(new Error('IndexedDB not supported'));
      return;
    }
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = () => {
      const db = req.result;
      let store;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        store = db.createObjectStore(STORE_NAME, { keyPath: 'id' });
        store.createIndex('vehicleNumber', 'vehicleNumber', { unique: false });
        store.createIndex('customerName', 'customerName', { unique: false });
      } else {
        store = req.transaction.objectStore(STORE_NAME);
      }
      if (!store.indexNames.contains('loanNumber')) {
        store.createIndex('loanNumber', 'loanNumber', { unique: false });
      }
      if (!db.objectStoreNames.contains(META_STORE)) {
        db.createObjectStore(META_STORE, { keyPath: 'key' });
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

function readLocalFallback() {
  try {
    const raw = localStorage.getItem(FALLBACK_KEY) || localStorage.getItem('twf_customers_fallback_v1');
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function writeLocalFallback(list) {
  try {
    localStorage.setItem(FALLBACK_KEY, JSON.stringify(list));
  } catch {
    // Ignore storage quota errors
  }
}

function ensureLoanNumber(customer, index = 0) {
  if (customer.loanNumber && String(customer.loanNumber).trim()) {
    return String(customer.loanNumber).trim().toUpperCase();
  }
  const demo = DEMO_CUSTOMERS.find(
    (d) => d.id === customer.id || d.vehicleNumber === customer.vehicleNumber
  );
  if (demo && demo.loanNumber) return demo.loanNumber;
  return `A15 G${String(27 + (index % 70)).padStart(2, '0')}`;
}

export async function getAllCustomers() {
  try {
    const db = await openDb();
    let list = await new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const req = store.getAll();
      req.onsuccess = () => resolve(req.result || []);
      req.onerror = () => reject(req.error);
    });

    if (list.length === 0 && !localStorage.getItem(SEEDED_KEY)) {
      await replaceAllCustomers(DEMO_CUSTOMERS);
      localStorage.setItem(SEEDED_KEY, '1');
      return [...DEMO_CUSTOMERS];
    }

    // Auto-backfill loanNumber for any already existing records
    let needsUpdate = false;
    list = list.map((c, idx) => {
      if (!c.loanNumber) {
        needsUpdate = true;
        return { ...c, loanNumber: ensureLoanNumber(c, idx) };
      }
      return c;
    });

    if (needsUpdate) {
      await replaceAllCustomers(list);
    }

    localStorage.setItem(SEEDED_KEY, '1');
    writeLocalFallback(list);
    return list.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
  } catch {
    let list = readLocalFallback();
    if (list.length === 0 && !localStorage.getItem(SEEDED_KEY)) {
      list = [...DEMO_CUSTOMERS];
      writeLocalFallback(list);
      localStorage.setItem(SEEDED_KEY, '1');
    } else {
      list = list.map((c, idx) => ({
        ...c,
        loanNumber: ensureLoanNumber(c, idx)
      }));
      writeLocalFallback(list);
    }
    return list.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
  }
}

export async function saveCustomer(customer) {
  const now = new Date().toISOString();
  const record = {
    ...customer,
    id: customer.id || `cust-${crypto.randomUUID().slice(0, 8)}`,
    vehicleNumber: String(customer.vehicleNumber || '')
      .trim()
      .toUpperCase()
      .replace(/\s+/g, ' '),
    loanNumber: String(customer.loanNumber || '')
      .trim()
      .toUpperCase()
      .replace(/\s+/g, ' '),
    financeAmount: Number(customer.financeAmount) || 0,
    monthlyPayment: Number(customer.monthlyPayment) || 0,
    createdAt: customer.createdAt || now,
    updatedAt: now
  };

  try {
    const db = await openDb();
    await new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      tx.objectStore(STORE_NAME).put(record);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  } catch {
    // Fallback handled below
  }

  const fallback = readLocalFallback();
  const idx = fallback.findIndex((c) => c.id === record.id);
  if (idx >= 0) fallback[idx] = record;
  else fallback.unshift(record);
  writeLocalFallback(fallback);
  return record;
}

export async function removeCustomer(id) {
  try {
    const db = await openDb();
    await new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      tx.objectStore(STORE_NAME).delete(id);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  } catch {
    // Fallback handled below
  }

  const fallback = readLocalFallback().filter((c) => c.id !== id);
  writeLocalFallback(fallback);
}

export async function replaceAllCustomers(records) {
  const normalized = (records || []).map((c, idx) => ({
    ...c,
    id: c.id || `cust-${crypto.randomUUID().slice(0, 8)}`,
    vehicleNumber: String(c.vehicleNumber || '')
      .trim()
      .toUpperCase()
      .replace(/\s+/g, ' '),
    loanNumber: ensureLoanNumber(c, idx),
    financeAmount: Number(c.financeAmount) || 0,
    monthlyPayment: Number(c.monthlyPayment) || 0,
    createdAt: c.createdAt || new Date().toISOString(),
    updatedAt: c.updatedAt || new Date().toISOString()
  }));

  try {
    const db = await openDb();
    await new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      store.clear();
      for (const item of normalized) {
        store.put(item);
      }
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  } catch {
    // Fallback handled below
  }

  writeLocalFallback(normalized);
  localStorage.setItem(SEEDED_KEY, '1');
  return normalized;
}
