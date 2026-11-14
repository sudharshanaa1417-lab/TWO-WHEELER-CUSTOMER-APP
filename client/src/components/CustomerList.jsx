import React, { useMemo, useState } from 'react';
import {
  Bike,
  FileText,
  LayoutGrid,
  MapPin,
  Phone,
  Plus,
  Search,
  Table as TableIcon
} from 'lucide-react';
import { formatINR } from '../utils/format';
import { smartSearchCustomers } from '../utils/search';
import { computePendingDues } from '../db/indexedDb';
import HighlightText from './HighlightText';

export default function CustomerList({
  customers,
  onSelectCustomer,
  onOpenAdd,
  t
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
      if (sortBy === 'loan') {
        return String(a.loanNumber || '').localeCompare(String(b.loanNumber || ''));
      }
      if (sortBy === 'amount') {
        return (Number(b.financeAmount) || 0) - (Number(a.financeAmount) || 0);
      }
      if (sortBy === 'pendingDue') {
        const pB = computePendingDues(b.totalDues, b.paidDues);
        const pA = computePendingDues(a.totalDues, a.paidDues);
        return pB - pA;
      }
      return new Date(b.updatedAt) - new Date(a.updatedAt);
    });
  }, [customers, quickFilter, sortBy]);

  return (
    <section className="glass-panel" style={{ padding: '20px' }}>
      <div className="section-header">
        <div>
          <h2 className="section-title">
            {t ? t('customerListTitle') : 'Customer List'} ({displayed.length})
          </h2>
          <p className="section-subtitle">
            {t
              ? t('customerListSubtitle')
              : 'All customer details, loan numbers, and due balances stored locally offline'}
          </p>
        </div>

        <div className="chips-row">
          <button type="button" className="btn btn-primary btn-sm" onClick={onOpenAdd}>
            <Plus size={16} />
            <span>{t ? t('addCustomerBtn') : 'Add Customer'}</span>
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
            placeholder={
              t
                ? t('quickFilterPlaceholder')
                : 'Quick filter (e.g. TN 15, A15 G27, name, mobile)...'
            }
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
          <option value="recent">{t ? t('sortRecent') : 'Sort: Recently Updated'}</option>
          <option value="vehicle">{t ? t('sortVehicle') : 'Sort: Vehicle Number'}</option>
          <option value="loan">{t ? t('sortLoan') : 'Sort: Loan Number'}</option>
          <option value="pendingDue">{t ? t('sortPendingDue') : 'Sort: Highest Pending Due'}</option>
          <option value="name">{t ? t('sortName') : 'Sort: Customer Name'}</option>
          <option value="amount">{t ? t('sortAmount') : 'Sort: Finance Amount'}</option>
        </select>

        <div className="chips-row">
          <button
            type="button"
            className={`glass-pill ${viewMode === 'cards' ? 'glass-pill--active' : ''}`}
            onClick={() => setViewMode('cards')}
          >
            <LayoutGrid size={14} />
            <span>{t ? t('cards') : 'Cards'}</span>
          </button>
          <button
            type="button"
            className={`glass-pill ${viewMode === 'table' ? 'glass-pill--active' : ''}`}
            onClick={() => setViewMode('table')}
          >
            <TableIcon size={14} />
            <span>{t ? t('table') : 'Table'}</span>
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
          <p style={{ margin: 0, fontWeight: 600 }}>{t ? t('noMatches') : 'No customers found'}</p>
          <p style={{ margin: '6px 0 0', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
            {t
              ? t('noMatchesSubtitle')
              : 'Try searching a different vehicle number, loan number (e.g. A15 G27), or clear the search.'}
          </p>
        </div>
      ) : viewMode === 'cards' ? (
        <div className="customer-cards-grid">
          {displayed.map((c) => {
            const totalDues = Number(c.totalDues) || 12;
            const paidDues = Number(c.paidDues) || 0;
            const pendingDues = computePendingDues(totalDues, paidDues);

            return (
              <button
                key={c.id}
                type="button"
                className="glass-panel glass-tile customer-card"
                onClick={() => onSelectCustomer(c)}
                style={{ background: 'var(--glass-bg-subtle)', textAlign: 'left' }}
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

                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '5px' }}>
                    <span className="vehicle-plate">
                      <HighlightText text={c.vehicleNumber} query={quickFilter} />
                    </span>
                    {c.loanNumber && (
                      <span
                        className="glass-pill"
                        style={{
                          fontFamily: 'var(--font-mono)',
                          fontSize: '0.74rem',
                          fontWeight: 700,
                          color: 'var(--accent-amber)',
                          padding: '2px 8px'
                        }}
                      >
                        Loan: <HighlightText text={c.loanNumber} query={quickFilter} />
                      </span>
                    )}
                  </div>
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

                {/* Finance Strip with Total Due & Pending Due (The 2 orange boxes requested in Image 2) */}
                <div className="finance-strip">
                  <div>
                    <div className="finance-stat-label">{t ? t('financeAmount') : 'Finance Amount'}</div>
                    <div className="finance-stat-value">{formatINR(c.financeAmount)}</div>
                  </div>

                  <div>
                    <div className="finance-stat-label">{t ? t('monthlyPayment') : 'Monthly Payment'}</div>
                    <div
                      className="finance-stat-value"
                      style={{ color: 'var(--accent-emerald)' }}
                    >
                      {formatINR(c.monthlyPayment)}
                    </div>
                  </div>

                  {/* Orange Box 1: Total Due */}
                  <div>
                    <div className="finance-stat-label">{t ? t('totalDue') : 'Total Due'}</div>
                    <div
                      className="finance-stat-value"
                      style={{ color: 'var(--accent-cyan)' }}
                    >
                      {totalDues} {t ? t('monthsShort') : 'mos'}
                    </div>
                  </div>

                  {/* Orange Box 2: Pending / Balance Due */}
                  <div>
                    <div className="finance-stat-label">{t ? t('pendingDue') : 'Pending Due'}</div>
                    <div
                      className="finance-stat-value"
                      style={{
                        color: pendingDues > 0 ? 'var(--accent-amber)' : 'var(--accent-emerald)',
                        fontWeight: 800
                      }}
                    >
                      {pendingDues} {t ? t('monthsShort') : 'mos'}
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
            );
          })}
        </div>
      ) : (
        <div className="table-scroll">
          <table className="glass-table">
            <thead>
              <tr>
                <th>{t ? t('customerName') : 'Customer Name'}</th>
                <th>{t ? t('vehicleNumber') : 'Vehicle Number'}</th>
                <th>{t ? t('loanNumber') : 'Loan Number'}</th>
                <th>{t ? t('mobileNumber') : 'Mobile Number'}</th>
                <th>{t ? t('vehicleModel') : 'Vehicle Model'}</th>
                <th>{t ? t('financeAmount') : 'Finance Amount'}</th>
                <th>{t ? t('monthlyPayment') : 'Monthly Payment'}</th>
                <th>{t ? t('totalDue') : 'Total Due'}</th>
                <th>{t ? t('pendingDue') : 'Pending Due'}</th>
                <th>{t ? t('address') : 'Address'}</th>
                <th>{t ? t('remarks') : 'Remarks'}</th>
              </tr>
            </thead>
            <tbody>
              {displayed.map((c) => {
                const totalDues = Number(c.totalDues) || 12;
                const paidDues = Number(c.paidDues) || 0;
                const pendingDues = computePendingDues(totalDues, paidDues);

                return (
                  <tr key={c.id} onClick={() => onSelectCustomer(c)}>
                    <td style={{ fontWeight: 700, color: 'var(--text-primary)' }}>
                      <HighlightText text={c.customerName} query={quickFilter} />
                    </td>
                    <td>
                      <span className="vehicle-plate" style={{ fontSize: '0.82rem' }}>
                        <HighlightText text={c.vehicleNumber} query={quickFilter} />
                      </span>
                    </td>
                    <td>
                      <span
                        className="glass-pill"
                        style={{
                          fontFamily: 'var(--font-mono)',
                          fontWeight: 700,
                          fontSize: '0.78rem',
                          color: 'var(--accent-amber)'
                        }}
                      >
                        <HighlightText text={c.loanNumber || '—'} query={quickFilter} />
                      </span>
                    </td>
                    <td style={{ fontFamily: 'var(--font-mono)' }}>
                      <HighlightText text={c.mobileNumber} query={quickFilter} />
                    </td>
                    <td>
                      <HighlightText text={c.vehicleModel || '—'} query={quickFilter} />
                    </td>
                    <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 600 }}>
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
                    <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 600, color: 'var(--accent-cyan)' }}>
                      {totalDues} {t ? t('monthsShort') : 'mos'}
                    </td>
                    <td>
                      <span className={pendingDues > 0 ? 'pending-badge' : 'total-due-badge'}>
                        {pendingDues} {t ? t('monthsShort') : 'mos'}
                      </span>
                    </td>
                    <td style={{ fontSize: '0.84rem', color: 'var(--text-secondary)' }}>
                      <HighlightText text={c.address || '—'} query={quickFilter} />
                    </td>
                    <td style={{ fontSize: '0.84rem', color: 'var(--text-muted)' }}>
                      <HighlightText text={c.remarks || '—'} query={quickFilter} />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
