import React, { useMemo, useState } from 'react';
import {
  Bike,
  LayoutGrid,
  MapPin,
  Phone,
  Plus,
  Search,
  Table as TableIcon
} from 'lucide-react';
import { formatINR } from '../utils/format';
import { smartSearchCustomers } from '../utils/search';
import HighlightText from './HighlightText';

export default function CustomerList({
  customers,
  onSelectCustomer,
  onOpenAdd
}) {
  const [viewMode, setViewMode] = useState('cards'); // 'cards' | 'table'
  const [sortBy, setSortBy] = useState('recent');
  const [quickFilter, setQuickFilter] = useState('');

  const displayed = useMemo(() => {
    const filtered = quickFilter.trim()
      ? smartSearchCustomers(customers, quickFilter, 'all').map((r) => r.customer)
      : [...customers];

    return filtered.sort((a, b) => {
      if (sortBy === 'name') {
        return String(a.customerName).localeCompare(String(b.customerName));
      }
      if (sortBy === 'vehicle') {
        return String(a.vehicleNumber).localeCompare(String(b.vehicleNumber));
      }
      if (sortBy === 'amount') {
        return (Number(b.financeAmount) || 0) - (Number(a.financeAmount) || 0);
      }
      return new Date(b.updatedAt) - new Date(a.updatedAt);
    });
  }, [customers, quickFilter, sortBy]);

  return (
    <section className="glass-panel" style={{ padding: '20px' }}>
      <div className="section-header">
        <div>
          <h2 className="section-title">Customer List ({displayed.length})</h2>
          <p className="section-subtitle">
            All 8 database columns stored locally offline — tap any customer for full profile
          </p>
        </div>

        <div className="chips-row">
          <button type="button" className="btn btn-primary btn-sm" onClick={onOpenAdd}>
            <Plus size={16} />
            <span>Add Customer</span>
          </button>
        </div>
      </div>

      {/* Filter & View Controls */}
      <div
        style={{
          display: 'flex',
          gap: '10px',
          flexWrap: 'wrap',
          alignItems: 'center',
          marginBottom: '16px'
        }}
      >
        <div style={{ position: 'relative', flex: '1 1 240px' }}>
          <Search
            size={16}
            style={{
              position: 'absolute',
              left: '13px',
              top: '50%',
              transform: 'translateY(-50%)',
              color: 'var(--text-muted)'
            }}
          />
          <input
            type="text"
            className="glass-input"
            style={{ paddingLeft: '38px' }}
            placeholder="Quick filter (e.g. TN 15, name, mobile, model)..."
            value={quickFilter}
            onChange={(e) => setQuickFilter(e.target.value)}
          />
        </div>

        <select
          className="glass-select"
          style={{ width: 'auto', minWidth: '160px' }}
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          aria-label="Sort customers"
        >
          <option value="recent">Sort: Recently Updated</option>
          <option value="vehicle">Sort: Vehicle Number</option>
          <option value="name">Sort: Customer Name</option>
          <option value="amount">Sort: Finance Amount</option>
        </select>

        <div className="chips-row">
          <button
            type="button"
            className={`glass-pill ${viewMode === 'cards' ? 'glass-pill--active' : ''}`}
            onClick={() => setViewMode('cards')}
          >
            <LayoutGrid size={14} />
            <span>Cards</span>
          </button>
          <button
            type="button"
            className={`glass-pill ${viewMode === 'table' ? 'glass-pill--active' : ''}`}
            onClick={() => setViewMode('table')}
          >
            <TableIcon size={14} />
            <span>Table</span>
          </button>
        </div>
      </div>

      {displayed.length === 0 ? (
        <div
          className="glass-panel"
          style={{
            padding: '36px 20px',
            textAlign: 'center',
            background: 'var(--glass-bg-subtle)'
          }}
        >
          <p style={{ margin: 0, fontWeight: 600 }}>No customers found</p>
          <p style={{ margin: '6px 0 16px', color: 'var(--text-secondary)', fontSize: '0.88rem' }}>
            {quickFilter
              ? 'Try clearing your filter or add a new entry.'
              : 'Add your first two-wheeler finance customer or import from Excel.'}
          </p>
          <button type="button" className="btn btn-primary btn-sm" onClick={onOpenAdd}>
            <Plus size={15} />
            <span>New Entry</span>
          </button>
        </div>
      ) : viewMode === 'cards' ? (
        <div className="customer-cards-grid">
          {displayed.map((c) => (
            <button
              key={c.id}
              type="button"
              className="glass-panel glass-tile customer-card"
              onClick={() => onSelectCustomer(c)}
              style={{ background: 'var(--glass-bg-subtle)' }}
            >
              <div className="customer-card-top">
                <div>
                  <h3 className="customer-name">
                    <HighlightText text={c.customerName} query={quickFilter} />
                  </h3>
                  <div
                    className="customer-meta-item"
                    style={{ marginTop: '4px', fontSize: '0.82rem', color: 'var(--text-secondary)' }}
                  >
                    <Bike size={14} style={{ color: 'var(--accent-cyan)' }} />
                    <span>
                      <HighlightText text={c.vehicleModel || 'Not specified'} query={quickFilter} />
                    </span>
                  </div>
                </div>
                <span className="vehicle-plate">
                  <HighlightText text={c.vehicleNumber} query={quickFilter} />
                </span>
              </div>

              <div className="customer-meta">
                <span className="customer-meta-item">
                  <Phone size={13} style={{ color: 'var(--accent-emerald)' }} />
                  <HighlightText text={c.mobileNumber} query={quickFilter} />
                </span>
                {c.address && (
                  <span className="customer-meta-item">
                    <MapPin size={13} style={{ color: 'var(--accent-amber)' }} />
                    <span
                      style={{
                        maxWidth: '250px',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap'
                      }}
                    >
                      <HighlightText text={c.address} query={quickFilter} />
                    </span>
                  </span>
                )}
              </div>

              <div className="finance-strip">
                <div>
                  <div className="finance-stat-label">Finance Amount</div>
                  <div className="finance-stat-value">{formatINR(c.financeAmount)}</div>
                </div>
                <div>
                  <div className="finance-stat-label">Monthly Payment</div>
                  <div
                    className="finance-stat-value"
                    style={{ color: 'var(--accent-emerald)' }}
                  >
                    {formatINR(c.monthlyPayment)}
                  </div>
                </div>
              </div>

              {c.remarks && (
                <div
                  style={{
                    fontSize: '0.78rem',
                    color: 'var(--text-muted)',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap'
                  }}
                >
                  Note: <HighlightText text={c.remarks} query={quickFilter} />
                </div>
              )}
            </button>
          ))}
        </div>
      ) : (
        <div className="table-scroll">
          <table className="glass-table">
            <thead>
              <tr>
                <th>Customer Name</th>
                <th>Vehicle Number</th>
                <th>Mobile Number</th>
                <th>Vehicle Model</th>
                <th>Finance Amount</th>
                <th>Monthly Payment</th>
                <th>Address</th>
                <th>Remarks</th>
              </tr>
            </thead>
            <tbody>
              {displayed.map((c) => (
                <tr key={c.id} onClick={() => onSelectCustomer(c)}>
                  <td style={{ fontWeight: 700, color: 'var(--text-primary)' }}>
                    <HighlightText text={c.customerName} query={quickFilter} />
                  </td>
                  <td>
                    <span className="vehicle-plate">
                      <HighlightText text={c.vehicleNumber} query={quickFilter} />
                    </span>
                  </td>
                  <td style={{ fontFamily: 'var(--font-mono)' }}>
                    <HighlightText text={c.mobileNumber} query={quickFilter} />
                  </td>
                  <td>
                    <HighlightText text={c.vehicleModel} query={quickFilter} />
                  </td>
                  <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 700 }}>
                    {formatINR(c.financeAmount)}
                  </td>
                  <td
                    style={{
                      fontFamily: 'var(--font-mono)',
                      fontWeight: 700,
                      color: 'var(--accent-emerald)'
                    }}
                  >
                    {formatINR(c.monthlyPayment)}
                  </td>
                  <td style={{ maxWidth: '200px' }}>
                    <HighlightText text={c.address} query={quickFilter} />
                  </td>
                  <td style={{ maxWidth: '180px' }}>
                    <HighlightText text={c.remarks} query={quickFilter} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
