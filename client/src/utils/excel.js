import * as XLSX from 'xlsx';

export const EXCEL_COLUMNS = [
  { key: 'customerName', header: 'Customer Name' },
  { key: 'vehicleNumber', header: 'Vehicle Number' },
  { key: 'mobileNumber', header: 'Mobile Number' },
  { key: 'address', header: 'Address' },
  { key: 'vehicleModel', header: 'Vehicle Model' },
  { key: 'financeAmount', header: 'Finance Amount' },
  { key: 'monthlyPayment', header: 'Monthly Payment' },
  { key: 'remarks', header: 'Remarks' }
];

const HEADER_ALIASES = {
  customername: 'customerName',
  name: 'customerName',
  customer: 'customerName',
  fullname: 'customerName',

  vehiclenumber: 'vehicleNumber',
  vehicleno: 'vehicleNumber',
  vehno: 'vehicleNumber',
  regno: 'vehicleNumber',
  registrationnumber: 'vehicleNumber',
  platenumber: 'vehicleNumber',

  mobilenumber: 'mobileNumber',
  mobile: 'mobileNumber',
  phone: 'mobileNumber',
  phonenumber: 'mobileNumber',
  contact: 'mobileNumber',

  address: 'address',
  location: 'address',
  city: 'address',

  vehiclemodel: 'vehicleModel',
  model: 'vehicleModel',
  bike: 'vehicleModel',
  twowheeler: 'vehicleModel',
  vehicle: 'vehicleModel',

  financeamount: 'financeAmount',
  loanamount: 'financeAmount',
  amount: 'financeAmount',
  principal: 'financeAmount',

  monthlypayment: 'monthlyPayment',
  emi: 'monthlyPayment',
  monthlyemi: 'monthlyPayment',
  installment: 'monthlyPayment',

  remarks: 'remarks',
  notes: 'remarks',
  note: 'remarks',
  status: 'remarks'
};

function normalizeHeaderKey(header) {
  return String(header || '')
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '');
}

function parseNumeric(val) {
  if (typeof val === 'number') return Number.isFinite(val) ? val : 0;
  const cleaned = String(val || '').replace(/[^0-9.-]/g, '');
  const num = Number(cleaned);
  return Number.isFinite(num) ? num : 0;
}

export function exportCustomersToExcel(customers, format = 'xlsx') {
  const rows = customers.map((c) => ({
    'Customer Name': c.customerName || '',
    'Vehicle Number': c.vehicleNumber || '',
    'Mobile Number': c.mobileNumber || '',
    Address: c.address || '',
    'Vehicle Model': c.vehicleModel || '',
    'Finance Amount': Number(c.financeAmount) || 0,
    'Monthly Payment': Number(c.monthlyPayment) || 0,
    Remarks: c.remarks || ''
  }));

  const worksheet = XLSX.utils.json_to_sheet(rows);
  worksheet['!cols'] = [
    { wch: 24 },
    { wch: 18 },
    { wch: 16 },
    { wch: 36 },
    { wch: 24 },
    { wch: 16 },
    { wch: 16 },
    { wch: 34 }
  ];

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Customers');

  const dateStamp = new Date().toISOString().slice(0, 10);
  if (format === 'csv') {
    XLSX.writeFile(workbook, `TwoWheeler_Finance_Customers_${dateStamp}.csv`, {
      bookType: 'csv'
    });
  } else {
    XLSX.writeFile(workbook, `TwoWheeler_Finance_Customers_${dateStamp}.xlsx`);
  }
}

export function downloadExcelTemplate() {
  const sampleRows = [
    {
      'Customer Name': 'Karthikeyan S',
      'Vehicle Number': 'TN 15 AB 1234',
      'Mobile Number': '9876543210',
      Address: '14, Gandhi Road, Villupuram',
      'Vehicle Model': 'Honda Activa 6G',
      'Finance Amount': 78000,
      'Monthly Payment': 3450,
      Remarks: 'Regular payer'
    }
  ];
  const worksheet = XLSX.utils.json_to_sheet(sampleRows);
  worksheet['!cols'] = [
    { wch: 24 },
    { wch: 18 },
    { wch: 16 },
    { wch: 32 },
    { wch: 24 },
    { wch: 16 },
    { wch: 16 },
    { wch: 28 }
  ];
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Template');
  XLSX.writeFile(workbook, 'TwoWheeler_Finance_Import_Template.xlsx');
}

export async function parseExcelFile(file) {
  const buffer = await file.arrayBuffer();
  const workbook = XLSX.read(buffer, { type: 'array' });
  const firstSheetName = workbook.SheetNames[0];
  if (!firstSheetName) {
    throw new Error('The uploaded workbook has no sheets.');
  }

  const sheet = workbook.Sheets[firstSheetName];
  const rawRows = XLSX.utils.sheet_to_json(sheet, { defval: '' });
  if (!rawRows.length) {
    throw new Error('No customer rows were found in the uploaded file.');
  }

  const parsed = [];
  for (const row of rawRows) {
    const mapped = {
      customerName: '',
      vehicleNumber: '',
      mobileNumber: '',
      address: '',
      vehicleModel: '',
      financeAmount: 0,
      monthlyPayment: 0,
      remarks: ''
    };

    for (const [colKey, value] of Object.entries(row)) {
      const canonical = HEADER_ALIASES[normalizeHeaderKey(colKey)];
      if (!canonical) continue;

      if (canonical === 'financeAmount' || canonical === 'monthlyPayment') {
        mapped[canonical] = parseNumeric(value);
      } else if (canonical === 'vehicleNumber') {
        mapped[canonical] = String(value || '')
          .trim()
          .toUpperCase()
          .replace(/\s+/g, ' ');
      } else {
        mapped[canonical] = String(value ?? '').trim();
      }
    }

    if (mapped.customerName || mapped.vehicleNumber || mapped.mobileNumber) {
      parsed.push({
        ...mapped,
        id: `cust-${crypto.randomUUID().slice(0, 8)}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
    }
  }

  if (!parsed.length) {
    throw new Error(
      'Could not match columns. Expected headers: Customer Name, Vehicle Number, Mobile Number, Address, Vehicle Model, Finance Amount, Monthly Payment, Remarks.'
    );
  }

  return parsed;
}
