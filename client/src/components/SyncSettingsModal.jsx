import React, { useState } from 'react';
import { CheckCircle2, Database, RefreshCw, Server, Trash2, X } from 'lucide-react';
import { checkServerHealth, getSavedApiUrl, setSavedApiUrl } from '../db/apiSync';

export default function SyncSettingsModal({
  isOpen,
  onClose,
  onResetDemo,
  onClearAll,
  onSyncNow,
  customerCount
}) {
  const [apiUrl, setApiUrl] = useState(getSavedApiUrl());
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState(null);

  if (!isOpen) return null;

  async function handleTestAndSave(e) {
    e.preventDefault();
    const cleaned = setSavedApiUrl(apiUrl);
    setTesting(true);
    setTestResult(null);
    const res = await checkServerHealth(cleaned);
    setTesting(false);
    setTestResult(res.ok ? 'connected' : 'failed');
    if (res.ok) {
      onSyncNow?.();
    }
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div
        className="glass-panel-elevated modal-card"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        <div className="section-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div className="module-icon module-icon--emerald" style={{ width: '42px', height: '42px' }}>
              <Server size={20} />
            </div>
            <div>
              <h2 className="section-title">Storage &amp; Render Server Sync</h2>
              <p className="section-subtitle">
                Local IndexedDB stores {customerCount} records offline on this device
              </p>
            </div>
          </div>

          <button type="button" className="glass-pill" onClick={onClose}>
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handleTestAndSave} style={{ marginBottom: '20px' }}>
          <label className="field-label" htmlFor="render-api-url">
            Render Backend API URL (optional when hosted on Vercel)
          </label>
          <input
            id="render-api-url"
            type="url"
            className="glass-input"
            placeholder="https://two-wheeler-finance-api.onrender.com"
            value={apiUrl}
            onChange={(e) => setApiUrl(e.target.value)}
          />
          <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', margin: '6px 0 12px' }}>
            Leave blank to use same-origin /api (when served by Render or Vite proxy) or run 100% offline.
          </p>

          <div className="chips-row">
            <button type="submit" className="btn btn-primary btn-sm" disabled={testing}>
              <RefreshCw size={15} />
              <span>{testing ? 'Checking...' : 'Save & Test Connection'}</span>
            </button>

            {testResult === 'connected' && (
              <span style={{ color: 'var(--accent-emerald)', fontSize: '0.84rem', fontWeight: 600 }}>
                <CheckCircle2 size={15} style={{ verticalAlign: 'middle', marginRight: '4px' }} />
                Connected &amp; Synced!
              </span>
            )}
            {testResult === 'failed' && (
              <span style={{ color: 'var(--accent-amber)', fontSize: '0.84rem', fontWeight: 600 }}>
                Server unreachable — continuing safely in Offline Mode
              </span>
            )}
          </div>
        </form>

        <div
          className="glass-panel"
          style={{
            padding: '16px',
            borderRadius: '18px',
            background: 'var(--glass-bg-subtle)'
          }}
        >
          <div style={{ fontWeight: 700, fontSize: '0.92rem', marginBottom: '8px' }}>
            Local Database Tools
          </div>
          <div className="chips-row">
            <button type="button" className="btn btn-glass btn-sm" onClick={onResetDemo}>
              <Database size={15} style={{ color: 'var(--accent-cyan)' }} />
              <span>Load Sample TN 15 Data</span>
            </button>
            <button type="button" className="btn btn-danger btn-sm" onClick={onClearAll}>
              <Trash2 size={15} />
              <span>Clear Local Database</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
