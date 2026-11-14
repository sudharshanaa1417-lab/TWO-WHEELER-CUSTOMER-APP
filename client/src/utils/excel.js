import * as XLSX from 'xlsx';

export const EXCEL_COLUMNS = [
  { key: 'customerName', header: 'Customer Name' },
  { key: 'vehicleNumber', header: 'Vehicle Number' },
  { key: 'loanNumber', header: 'Loan Number' },
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

  loannumber: 'loanNumber',
  loanno: 'loanNumber',
  loan: 'loanNumber',
  loanid: 'loanNumber',
  accountnumber: 'loanNumber',
  accno: 'loanNumber',

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
    'Loan Number': c.loanNumber || '',
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
    XLSX.writeFile(workbook, `Two_Wheeler_Finance_Customers_${dateStamp}.csv`, {
      bookType: 'csv'
    });
  } else {
    XLSX.writeFile(workbook, `Two_Wheeler_Finance_Customers_${dateStamp}.xlsx`, {
      bookType: 'xlsx'
    });
  }
}

export function downloadExcelTemplate() {
  const sampleRows = [
    {
      'Customer Name': 'Karthikeyan S',
      'Vehicle Number': 'TN 15 AB 1234',
      'Loan Number': 'A15 G27',
      'Mobile Number': '9876543210',
      Address: '14, Gandhi Road, Villupuram - 605602',
      'Vehicle Model': 'Honda Activa 6G',
      'Finance Amount': 78000,
      'Monthly Payment': 3450,
      Remarks: 'Regular payer · Due 5th'
    },
    {
      'Customer Name': 'Muruganandam R',
      'Vehicle Number': 'TN 15 AC 5678',
      'Loan Number': 'A15 G28',
      'Mobile Number': '9443218765',
      Address: '27, Bazaar Street, Ulundurpet',
      'Vehicle Model': 'TVS Apache RTR 160',
      'Finance Amount': 112000,
      'Monthly Payment': 4950,
      Remarks: '12 EMIs remaining'
    }
  ];

  const worksheet = XLSX.utils.json_to_sheet(sampleRows);
  worksheet['!cols'] = [
    { wch: 24 },
    { wch: 18 },
    { wch: 16 },
    { wch: 16 },
    { wch: 36 },
    { wch: 24 },
    { wch: 16 },
    { wch: 16 },
    { wch: 30 }
  ];

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Customer_Template');
  XLSX.writeFile(workbook, 'Two_Wheeler_Customer_Template.xlsx');
}

export function parseExcelFile(file) {
  return new Promise((resolve, reject) => {
    if (!file) {
      reject(new Error('No file provided'));
      return;
    }

    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const firstSheetName = workbook.SheetNames[0];
        if (!firstSheetName) {
          reject(new Error('Uploaded workbook has no sheets'));
          return;
        }

        const worksheet = workbook.Sheets[firstSheetName];
        const rawJson = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
        if (!rawJson || rawJson.length < 2) {
          reject(new Error('Sheet is empty or has no data rows below the header.'));
          return;
        }

        const headerRow = rawJson[0] || [];
        const indexMap = new Map();

        headerRow.forEach((rawColName, colIdx) => {
          const normalized = normalizeHeaderKey(rawColName);
          const canonical = HEADER_ALIASES[normalized];
          if (canonical) {
            indexMap.set(colIdx, canonical);
          }
        });

        if (indexMap.size === 0) {
          reject(
            new Error(
              'Could not recognize any valid column headers (Customer Name, Vehicle Number, Loan Number, Mobile Number, etc.).'
            )
          );
          return;
        }

        const now = new Date().toISOString();
        const records = [];

        for (let r = 1; r < rawJson.length; r++) {
          const row = rawJson[r];
          if (!row || row.length === 0) continue;

          const record = {
            id: `cust-imp-${crypto.randomUUID().slice(0, 8)}`,
            customerName: '',
            vehicleNumber: '',
            loanNumber: '',
            mobileNumber: '',
            address: '',
            vehicleModel: '',
            financeAmount: 0,
            monthlyPayment: 0,
            remarks: '',
            createdAt: now,
            updatedAt: now
          };

          let hasAnyData = false;

          row.forEach((cellVal, colIdx) => {
            const canonicalKey = indexMap.get(colIdx);
            if (!canonicalKey) return;

            const strVal = String(cellVal ?? '').trim();
            if (strVal) hasAnyData = true;

            if (canonicalKey === 'financeAmount' || canonicalKey === 'monthlyPayment') {
              record[canonicalKey] = parseNumeric(cellVal);
            } else if (canonicalKey === 'vehicleNumber' || canonicalKey === 'loanNumber') {
              record[canonicalKey] = strVal.toUpperCase();
            } else {
              record[canonicalKey] = strVal;
            }
          });

          // Require at least a name, vehicle number, or mobile number
          if (hasAnyData && (record.customerName || record.vehicleNumber || record.mobileNumber)) {
            records.push(record);
          }
        }

        resolve(records);
      } catch (err) {
        reject(new Error(`Failed to parse spreadsheet: ${err.message}`));
      }
    };

    reader.onerror = () => reject(new Error('Could not read the uploaded file.'));
    reader.readAsArrayBuffer(file);
  });
}
