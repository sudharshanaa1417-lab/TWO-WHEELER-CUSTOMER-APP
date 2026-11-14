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

export default function ExcelManager({ customers, onImportCustomers, onNotify, t }) {
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
              <span>{t ? t('excelTitle') : 'Excel · Import / Export'}</span>
            </h2>
            <p className="section-subtitle">
              {t
                ? t('excelSub')
                : `Works 100% offline in your browser — export all ${customers.length} records or bulk import spreadsheets`}
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
            <span>{t ? t('exportXlsx') : 'Export Excel (.xlsx)'}</span>
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
            <span>{t ? t('exportCsv') : 'Export CSV (.csv)'}</span>
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
            <span>{t ? t('sampleTemplate') : 'Sample Template'}</span>
          </button>
        </div>
      </section>

      {/* Import Section */}
      <section className="glass-panel" style={{ padding: '22px' }}>
        <div className="section-header">
          <div>
            <h3 className="section-title" style={{ fontSize: '1.1rem' }}>
              Import Spreadsheet (Excel / CSV)
            </h3>
            <p className="section-subtitle">
              Supports .xlsx, .xls, and .csv with auto-detection of Vehicle No, Loan No, Name, Dues, etc.
            </p>
          </div>
        </div>

        {/* Drop Zone */}
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragging(false);
            if (e.dataTransfer.files?.[0]) {
              handleFile(e.dataTransfer.files[0]);
            }
          }}
          onClick={() => fileInputRef.current?.click()}
          style={{
            border: `2px dashed ${dragging ? 'var(--accent-cyan)' : 'var(--glass-border)'}`,
            borderRadius: '20px',
            padding: '36px 20px',
            textAlign: 'center',
            cursor: 'pointer',
            background: dragging ? 'rgba(34, 211, 238, 0.08)' : 'var(--glass-bg-subtle)',
            transition: 'all 0.2s ease'
          }}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".xlsx, .xls, .csv"
            style={{ display: 'none' }}
            onChange={(e) => {
              if (e.target.files?.[0]) handleFile(e.target.files[0]);
            }}
          />
          <Upload
            size={34}
            style={{
              color: dragging ? 'var(--accent-cyan)' : 'var(--text-muted)',
              marginBottom: '10px'
            }}
          />
          <div style={{ fontWeight: 700, fontSize: '1.02rem', marginBottom: '4px' }}>
            {fileName ? `Selected: ${fileName}` : t ? t('dropFiles') : 'Drop your Excel (.xlsx, .xls) or .csv file here'}
          </div>
          <p style={{ margin: 0, fontSize: '0.84rem', color: 'var(--text-secondary)' }}>
            or click to browse from device · 100% offline parsing
          </p>
        </div>

        {parseError && (
          <div
            style={{
              marginTop: '12px',
              padding: '10px 14px',
              borderRadius: '12px',
              background: 'rgba(251, 113, 133, 0.16)',
              border: '1px solid rgba(251, 113, 133, 0.45)',
              color: 'var(--accent-rose)',
              fontSize: '0.86rem'
            }}
          >
            {parseError}
          </div>
        )}

        {/* Preview & Import Options */}
        {previewRows.length > 0 && (
          <div style={{ marginTop: '20px' }}>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '12px',
                marginBottom: '14px'
              }}
            >
              <div>
                <span style={{ fontWeight: 700, color: 'var(--accent-emerald)' }}>
                  ✓ {previewRows.length} valid customer rows found in {fileName}
                </span>
                <p style={{ margin: '3px 0 0', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                  Review parsed rows below before importing to your offline database.
                </p>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <select
                  className="glass-select"
                  style={{ width: 'auto', minWidth: '150px' }}
                  value={importMode}
                  onChange={(e) => setImportMode(e.target.value)}
                >
                  <option value="merge">Merge &amp; Update (Recommended)</option>
                  <option value="replace">Clean Replace All</option>
                </select>

                <button type="button" className="btn btn-primary" onClick={handleConfirmImport}>
                  <CheckCircle2 size={16} />
                  <span>{t ? t('confirmImport') : 'Confirm & Import Customers'}</span>
                </button>

                <button
                  type="button"
                  className="glass-pill"
                  onClick={() => {
                    setPreviewRows([]);
                    setFileName('');
                  }}
                  title="Cancel import"
                >
                  <X size={15} />
                </button>
              </div>
            </div>

            <div className="table-scroll" style={{ maxHeight: '280px' }}>
              <table className="glass-table">
                <thead>
                  <tr>
                    <th>Customer Name</th>
                    <th>Vehicle Number</th>
                    <th>Loan Number</th>
                    <th>Mobile</th>
                    <th>Model</th>
                    <th>Finance (₹)</th>
                    <th>Monthly (₹)</th>
                    <th>Total Due</th>
                    <th>Paid Due</th>
                    <th>Address</th>
                    <th>Remarks</th>
                  </tr>
                </thead>
                <tbody>
                  {previewRows.slice(0, 15).map((row, idx) => (
                    <tr key={idx}>
                      <td style={{ fontWeight: 600 }}>{row.customerName || '—'}</td>
                      <td>
                        <span className="vehicle-plate" style={{ fontSize: '0.78rem' }}>
                          {row.vehicleNumber || '—'}
                        </span>
                      </td>
                      <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--accent-amber)' }}>
                        {row.loanNumber || '—'}
                      </td>
                      <td style={{ fontFamily: 'var(--font-mono)' }}>{row.mobileNumber || '—'}</td>
                      <td>{row.vehicleModel || '—'}</td>
                      <td>{formatINR(row.financeAmount)}</td>
                      <td style={{ color: 'var(--accent-emerald)', fontWeight: 700 }}>
                        {formatINR(row.monthlyPayment)}
                      </td>
                      <td style={{ color: 'var(--accent-cyan)' }}>{row.totalDues || 12} mos</td>
                      <td>{row.paidDues || 0} mos</td>
                      <td style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                        {row.address || '—'}
                      </td>
                      <td style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                        {row.remarks || '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {previewRows.length > 15 && (
              <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '8px' }}>
                Showing first 15 of {previewRows.length} rows...
              </p>
            )}
          </div>
        )}
      </section>
    </div>
  );
}
