import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import crypto from 'node:crypto';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_DIR = path.join(__dirname, 'data');
const DATA_FILE = path.join(DATA_DIR, 'customers.json');

const SEED_CUSTOMERS = [
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

function normalizeVehicleNumber(raw = '') {
  return String(raw).trim().toUpperCase().replace(/\s+/g, ' ');
}

function normalizeLoanNumber(raw = '') {
  return String(raw).trim().toUpperCase().replace(/\s+/g, ' ');
}

export function sanitizeCustomer(input, existing = null) {
  const now = new Date().toISOString();
  return {
    id: existing?.id || input.id || `cust-${crypto.randomUUID().slice(0, 8)}`,
    customerName: String(input.customerName ?? existing?.customerName ?? '').trim(),
    vehicleNumber: normalizeVehicleNumber(input.vehicleNumber ?? existing?.vehicleNumber ?? ''),
    loanNumber: normalizeLoanNumber(input.loanNumber ?? existing?.loanNumber ?? ''),
    mobileNumber: String(input.mobileNumber ?? existing?.mobileNumber ?? '').trim(),
    address: String(input.address ?? existing?.address ?? '').trim(),
    vehicleModel: String(input.vehicleModel ?? existing?.vehicleModel ?? '').trim(),
    financeAmount: Number(input.financeAmount ?? existing?.financeAmount ?? 0) || 0,
    monthlyPayment: Number(input.monthlyPayment ?? existing?.monthlyPayment ?? 0) || 0,
    remarks: String(input.remarks ?? existing?.remarks ?? '').trim(),
    createdAt: existing?.createdAt || input.createdAt || now,
    updatedAt: now
  };
}

let writeLock = Promise.resolve();

async function ensureStore() {
  await fs.mkdir(DATA_DIR, { recursive: true });
  try {
    await fs.access(DATA_FILE);
  } catch {
    await fs.writeFile(DATA_FILE, JSON.stringify(SEED_CUSTOMERS, null, 2), 'utf8');
  }
}

export async function readCustomers() {
  await ensureStore();
  const raw = await fs.readFile(DATA_FILE, 'utf8');
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

async function writeCustomers(customers) {
  await ensureStore();
  writeLock = writeLock.then(async () => {
    const tmpFile = `${DATA_FILE}.tmp`;
    await fs.writeFile(tmpFile, JSON.stringify(customers, null, 2), 'utf8');
    await fs.rename(tmpFile, DATA_FILE);
  });
  return writeLock;
}

export async function createCustomer(payload) {
  const customers = await readCustomers();
  const record = sanitizeCustomer(payload);
  customers.unshift(record);
  await writeCustomers(customers);
  return record;
}

export async function updateCustomer(id, payload) {
  const customers = await readCustomers();
  const index = customers.findIndex((c) => c.id === id);
  if (index === -1) return null;
  const updated = sanitizeCustomer(payload, customers[index]);
  customers[index] = updated;
  await writeCustomers(customers);
  return updated;
}

export async function deleteCustomer(id) {
  const customers = await readCustomers();
  const filtered = customers.filter((c) => c.id !== id);
  if (filtered.length === customers.length) return false;
  await writeCustomers(filtered);
  return true;
}

export async function bulkUpsertCustomers(records, mode = 'merge') {
  const incoming = Array.isArray(records) ? records : [];
  if (mode === 'replace') {
    const sanitized = incoming.map((r) => sanitizeCustomer(r));
    await writeCustomers(sanitized);
    return sanitized;
  }

  const existing = await readCustomers();
  const byId = new Map(existing.map((c) => [c.id, c]));

  for (const item of incoming) {
    const prev = item.id ? byId.get(item.id) : null;
    const sanitized = sanitizeCustomer(item, prev);
    byId.set(sanitized.id, sanitized);
  }

  const merged = Array.from(byId.values()).sort(
    (a, b) => new Date(b.updatedAt) - new Date(a.updatedAt)
  );
  await writeCustomers(merged);
  return merged;
}
