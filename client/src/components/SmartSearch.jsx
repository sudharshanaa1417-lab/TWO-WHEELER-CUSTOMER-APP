import React, { useMemo, useState } from 'react';
import {
  Bike,
  FileText,
  MapPin,
  Phone,
  Search,
  Sparkles,
  User,
  X
} from 'lucide-react';
import { formatINR } from '../utils/format';
import {
  SEARCH_FIELDS,
  extractTopPrefixes,
  smartSearchCustomers
} from '../utils/search';
import HighlightText from './HighlightText';

const FIELD_LABELS = {
  vehicleNumber: 'Vehicle Number',
  loanNumber: 'Loan Number',
  customerName: 'Customer Name',
  mobileNumber: 'Mobile Number',
  address: 'Address',
  vehicleModel: 'Vehicle Model',
  remarks: 'Remarks'
};

export default function SmartSearch({ customers, onSelectCustomer }) {
  const [query, setQuery] = useState('TN 15');
  const [fieldFilter, setFieldFilter] = useState('all');

  const topPrefixes = useMemo(() => extractTopPrefixes(customers, 5), [customers]);
  const results = useMemo(
    () => smartSearchCustomers(customers, query, fieldFilter),
    [customers, query, fieldFilter]
  );

  return (
    <section className="glass-panel" style={{ padding: '22px' }}>
      <div className="section-header">
        <div>
          <h2 className="section-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Sparkles size={20} style={{ color: 'var(--accent-amber)' }} />
            <span>Smart Search · Find Customer</span>
          </h2>
          <p className="section-subtitle">
            Search by Vehicle Number (e.g. TN 15), Loan Number (e.g. A15 G27), Customer Name, Mobile, Address, or Model
          </p>
        </div>
      </div>

      {/* Spotlight Search Box */}
      <div style={{ position: 'relative', marginBottom: '12px' }}>
        <Search
          size={20}
          style={{
            position: 'absolute',
            left: '16px',
            top: '50%',
            transform: 'translateY(-50%)',
            color: 'var(--accent-cyan)'
          }}
        />
        <input
          type="text"
          className="glass-input"
          style={{
            paddingLeft: '46px',
            paddingRight: '44px',
            fontSize: '1.05rem',
            fontWeight: 600,
            borderRadius: '18px'
          }}
          placeholder="Type TN 15, A15 G27, Karthik, 98765, Activa, Villupuram..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          autoFocus
        />
        {query && (
          <button
            type="button"
            onClick={() => setQuery('')}
            aria-label="Clear search"
            style={{
              position: 'absolute',
              right: '12px',
              top: '50%',
              transform: 'translateY(-50%)',
              background: 'var(--glass-bg-subtle)',
              border: '1px solid var(--glass-border)',
              borderRadius: '999px',
              width: '28px',
              height: '28px',
              display: 'grid',
              placeItems: 'center',
              color: 'var(--text-secondary)',
              cursor: 'pointer'
            }}
          >
            <X size={14} />
          </button>
        )}
      </div>

      {/* Field Scope Filter Chips */}
      <div className="chips-row" style={{ marginBottom: '12px' }}>
        {SEARCH_FIELDS.map((f) => (
          <button
            key={f.key}
            type="button"
            className={`glass-pill ${fieldFilter === f.key ? 'glass-pill--active' : ''}`}
            onClick={() => setFieldFilter(f.key)}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Quick RTO Prefix Chips */}
      {topPrefixes.length > 0 && (
        <div
          className="chips-row"
          style={{
            marginBottom: '18px',
            paddingBottom: '14px',
            borderBottom: '1px solid rgba(255,255,255,0.08)'
          }}
        >
          <span style={{ fontSize: '0.76rem', color: 'var(--text-muted)', fontWeight: 700 }}>
            QUICK RTO:
          </span>
          {topPrefixes.map((p) => (
            <button
              key={p.prefix}
              type="button"
              className={`glass-pill ${
                query.trim().toUpperCase() === p.prefix ? 'glass-pill--active' : ''
              }`}
              onClick={() => {
                setFieldFilter('all');
                setQuery(p.prefix);
              }}
            >
              <span style={{ fontFamily: 'var(--font-mono)' }}>{p.prefix}</span>
              <span style={{ opacity: 0.7 }}>({p.count})</span>
            </button>
          ))}
          <button
            type="button"
            className={`glass-pill ${
              query.trim().toUpperCase() === 'A15' ? 'glass-pill--active' : ''
            }`}
            onClick={() => {
              setFieldFilter('all');
              setQuery('A15');
            }}
          >
            <span style={{ fontFamily: 'var(--font-mono)' }}>LOAN: A15</span>
          </button>
        </div>
      )}

      {/* Search Results */}
      {!query.trim() ? (
        <div
          className="glass-panel"
          style={{
            padding: '28px 20px',
            textAlign: 'center',
            background: 'var(--glass-bg-subtle)'
          }}
        >
          <p style={{ margin: 0, fontWeight: 600 }}>Start typing to find any customer</p>
          <p style={{ margin: '6px 0 0', fontSize: '0.86rem', color: 'var(--text-secondary)' }}>
            Example: Searching <strong>TN 15</strong> or <strong>A15 G27</strong> immediately lists all matching records with live highlighted text.
          </p>
        </div>
      ) : (
        <>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '12px',
              fontSize: '0.84rem',
              color: 'var(--text-secondary)'
            }}
          >
            <span>
              Found <strong style={{ color: 'var(--text-primary)' }}>{results.length}</strong>{' '}
              matching {results.length === 1 ? 'customer' : 'customers'} for &quot;{query.trim()}&quot;
            </span>
            <span>Tap a result to open full profile</span>
          </div>

          {results.length === 0 ? (
            <div
              className="glass-panel"
              style={{
                padding: '28px 20px',
                textAlign: 'center',
                background: 'var(--glass-bg-subtle)'
              }}
            >
              <p style={{ margin: 0, fontWeight: 600 }}>No matching customer found</p>
              <p style={{ margin: '6px 0 0', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                Try switching filter to &quot;All Fields&quot; or searching another part of Vehicle No, Loan No (e.g. A15), Name, or Phone.
              </p>
            </div>
          ) : (
            <div className="customer-cards-grid">
              {results.map(({ customer: c, matchedFields }) => (
                <button
                  key={c.id}
                  type="button"
                  className="glass-panel glass-tile customer-card"
                  onClick={() => onSelectCustomer(c)}
                  style={{ background: 'var(--glass-bg-subtle)', textAlign: 'left' }}
                >
                  <div className="customer-card-top">
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '7px' }}>
                        <User size={15} style={{ color: 'var(--accent-emerald)' }} />
                        <h3 className="customer-name">
                          <HighlightText text={c.customerName} query={query} />
                        </h3>
                      </div>
                      <div
                        className="customer-meta-item"
                        style={{ marginTop: '5px', fontSize: '0.84rem', color: 'var(--text-secondary)' }}
                      >
                        <Bike size={14} style={{ color: 'var(--accent-cyan)' }} />
                        <span>
                          <HighlightText text={c.vehicleModel || 'Two Wheeler'} query={query} />
                        </span>
                      </div>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '5px' }}>
                      <span className="vehicle-plate">
                        <HighlightText text={c.vehicleNumber} query={query} />
                      </span>
                      {c.loanNumber && (
                        <span
                          className="glass-pill"
                          style={{
                            fontFamily: 'var(--font-mono)',
                            fontSize: '0.76rem',
                            fontWeight: 700,
                            color: 'var(--accent-amber)',
                            borderColor: 'rgba(251, 191, 36, 0.45)',
                            padding: '2px 8px'
                          }}
                        >
                          Loan: <HighlightText text={c.loanNumber} query={query} />
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="customer-meta">
                    <span className="customer-meta-item">
                      <Phone size={13} style={{ color: 'var(--accent-emerald)' }} />
                      <HighlightText text={c.mobileNumber} query={query} />
                    </span>
                    {c.address && (
                      <span className="customer-meta-item">
                        <MapPin size={13} style={{ color: 'var(--accent-amber)' }} />
                        <span>
                          <HighlightText text={c.address} query={query} />
                        </span>
                      </span>
                    )}
                  </div>

                  {c.remarks && (
                    <div style={{ fontSize: '0.79rem', color: 'var(--text-muted)' }}>
                      Remarks: <HighlightText text={c.remarks} query={query} />
                    </div>
                  )}

                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: '8px',
                      paddingTop: '8px',
                      borderTop: '1px solid rgba(255,255,255,0.08)',
                      flexWrap: 'wrap'
                    }}
                  >
                    <div className="chips-row">
                      {matchedFields.map((mf) => (
                        <span
                          key={mf}
                          className="glass-pill"
                          style={{ padding: '3px 8px', fontSize: '0.7rem' }}
                        >
                          Matched: {FIELD_LABELS[mf] || mf}
                        </span>
                      ))}
                    </div>
                    <span
                      style={{
                        fontFamily: 'var(--font-mono)',
                        fontSize: '0.82rem',
                        fontWeight: 700,
                        color: 'var(--accent-emerald)'
                      }}
                    >
                      {formatINR(c.monthlyPayment)}/mo
                    </span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </>
      )}
    </section>
  );
}
