import React, { useRef, useState } from 'react';
import {
  CheckCircle2,
  Download,
  FileSpreadsheet,
  Upload,
  X
} from 'lucide-react';
import { formatINR } from '../utils/format';
import {
  downloadExcelTemplate,
  exportCustomersToExcel,
  parseExcelFile
} from '../utils/excel';

export default function ExcelManager({ customers, onImportCustomers, onNotify }) {
  const fileInputRef = useRef(null);
  const [dragging, setDragging] = useState(false);
  const [previewRows, setPreviewRows] = useState([]);
  const [fileName, setFileName] = useState('');
  const [importMode, setImportMode] = useState('merge'); // 'merge' | 'replace'
  const [parseError, setParseError] = useState('');

  async function handleFile(file) {
    if (!file) return;
    setParseError('');
    try {
      const rows = await parseExcelFile(file);
      setPreviewRows(rows);
      setFileName(file.name);
      onNotify?.(`Parsed ${rows.length} customer rows from ${file.name}`);
    } catch (err) {
      setPreviewRows([]);
      setParseError(err.message || 'Unable to read Excel file.');
    }
  }

  function handleConfirmImport() {
    if (!previewRows.length) return;
    onImportCustomers(previewRows, importMode);
    setPreviewRows([]);
    setFileName('');
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {/* Export Section */}
      <section className="glass-panel" style={{ padding: '22px' }}>
        <div className="section-header">
          <div>
            <h2 className="section-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <FileSpreadsheet size={20} style={{ color: 'var(--accent-emerald)' }} />
              <span>Excel · Import / Export</span>
            </h2>
            <p className="section-subtitle">
              Works 100% offline in your browser — export all {customers.length} records or bulk import spreadsheets
            </p>
          </div>
        </div>

        <div className="chips-row">
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => {
              exportCustomersToExcel(customers, 'xlsx');
              onNotify?.('Exported Excel (.xlsx) file');
            }}
          >
            <Download size={16} />
            <span>Export Excel (.xlsx)</span>
          </button>

          <button
            type="button"
            className="btn btn-glass"
            onClick={() => {
              exportCustomersToExcel(customers, 'csv');
              onNotify?.('Exported CSV file');
            }}
          >
            <Download size={16} />
            <span>Export CSV (.csv)</span>
          </button>

          <button
            type="button"
            className="btn btn-glass"
            onClick={() => {
              downloadExcelTemplate();
              onNotify?.('Downloaded sample import template');
            }}
          >
            <FileSpreadsheet size={16} style={{ color: 'var(--accent-cyan)' }} />
            <span>Sample Template</span>
          </button>
        </div>
      </section>

      {/* Import Section */}
      <section className="glass-panel" style={{ padding: '22px' }}>
        <h3 className="section-title" style={{ fontSize: '1.08rem', marginBottom: '6px' }}>
          Import Customers from Excel / CSV
        </h3>
        <p className="section-subtitle" style={{ marginBottom: '14px' }}>
          Supported columns: Customer Name, Vehicle Number, Mobile Number, Address, Vehicle Model,
          Finance Amount, Monthly Payment, Remarks
        </p>

        <input
          ref={fileInputRef}
          type="file"
          accept=".xlsx,.xls,.csv"
          style={{ display: 'none' }}
          onChange={(e) => {
            handleFile(e.target.files?.[0]);
            e.target.value = '';
          }}
        />

        <div
          className={`excel-dropzone ${dragging ? 'excel-dropzone--drag' : ''}`}
          onClick={() => fileInputRef.current?.click()}
          onDragOver={(e) => {
            e.preventDefault();
            setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragging(false);
            handleFile(e.dataTransfer.files?.[0]);
          }}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => e.key === 'Enter' && fileInputRef.current?.click()}
        >
          <Upload size={28} style={{ color: 'var(--accent-cyan)', marginBottom: '8px' }} />
          <div style={{ fontWeight: 700, fontSize: '0.98rem' }}>
            Tap to choose an Excel (.xlsx / .xls / .csv) file or drag & drop here
          </div>
          <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
            Preview rows before saving to your offline database
          </div>
        </div>

        {parseError && (
          <div
            style={{
              marginTop: '14px',
              padding: '12px 14px',
              borderRadius: '14px',
              background: 'rgba(251, 113, 133, 0.16)',
              border: '1px solid rgba(251, 113, 133, 0.45)',
              color: 'var(--accent-rose)',
              fontSize: '0.86rem'
            }}
          >
            {parseError}
          </div>
        )}

        {previewRows.length > 0 && (
          <div style={{ marginTop: '18px' }}>
            <div className="section-header" style={{ marginBottom: '12px' }}>
              <div>
                <h4 style={{ margin: 0, fontSize: '0.98rem' }}>
                  Preview: {previewRows.length} rows from {fileName}
                </h4>
              </div>

              <div className="chips-row">
                <button
                  type="button"
                  className={`glass-pill ${importMode === 'merge' ? 'glass-pill--active' : ''}`}
                  onClick={() => setImportMode('merge')}
                >
                  Append / Merge
                </button>
                <button
                  type="button"
                  className={`glass-pill ${importMode === 'replace' ? 'glass-pill--active' : ''}`}
                  onClick={() => setImportMode('replace')}
                >
                  Replace Existing
                </button>
                <button
                  type="button"
                  className="glass-pill"
                  onClick={() => setPreviewRows([])}
                >
                  <X size={14} />
                  <span>Clear</span>
                </button>
              </div>
            </div>

            <div className="table-scroll" style={{ maxHeight: '300px', overflowY: 'auto' }}>
              <table className="glass-table">
                <thead>
                  <tr>
                    <th>Customer Name</th>
                    <th>Vehicle Number</th>
                    <th>Mobile</th>
                    <th>Vehicle Model</th>
                    <th>Finance</th>
                    <th>Monthly</th>
                  </tr>
                </thead>
                <tbody>
                  {previewRows.slice(0, 50).map((r, idx) => (
                    <tr key={idx}>
                      <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                        {r.customerName}
                      </td>
                      <td>
                        <span className="vehicle-plate">{r.vehicleNumber}</span>
                      </td>
                      <td style={{ fontFamily: 'var(--font-mono)' }}>{r.mobileNumber}</td>
                      <td>{r.vehicleModel}</td>
                      <td style={{ fontFamily: 'var(--font-mono)' }}>{formatINR(r.financeAmount)}</td>
                      <td style={{ fontFamily: 'var(--font-mono)', color: 'var(--accent-emerald)' }}>
                        {formatINR(r.monthlyPayment)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '14px' }}>
              <button
                type="button"
                className="btn btn-primary"
                onClick={handleConfirmImport}
              >
                <CheckCircle2 size={16} />
                <span>
                  Confirm Import ({previewRows.length}{' '}
                  {previewRows.length === 1 ? 'Row' : 'Rows'})
                </span>
              </button>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
