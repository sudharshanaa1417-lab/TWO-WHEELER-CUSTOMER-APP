import React from 'react';
import {
  ArrowUpRight,
  FileSpreadsheet,
  Search,
  UserPlus,
  Users
} from 'lucide-react';
import { formatINR } from '../utils/format';
import { computePendingDues } from '../db/indexedDb';

export default function DashboardHome({
  customers,
  onNavigate,
  onOpenAdd,
  onSelectCustomer,
  t
}) {
  const recentCustomers = customers.slice(0, 3);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
      {/* Total Customers Ribbon (Financial portfolio and monthly EMI target removed per request) */}
      <section className="kpi-ribbon" aria-label="Customer Summary">
        <div className="glass-panel kpi-card" style={{ flex: '1 1 auto' }}>
          <div>
            <div className="kpi-label">{t ? t('totalCustomers') : 'Total Customers'}</div>
            <div className="kpi-value">{customers.length}</div>
          </div>
          <div className="kpi-icon-wrap" style={{ color: 'var(--accent-emerald)' }}>
            <Users size={22} />
          </div>
        </div>
      </section>

      {/* Core 2x2 App Architecture Grid */}
      <section className="dashboard-grid" aria-label="Main Navigation Modules">
        <button
          type="button"
          className="glass-panel glass-tile module-card"
          onClick={() => onNavigate('customers')}
        >
          <div className="module-header">
            <div className="module-icon module-icon--emerald">
              <Users size={25} />
            </div>
            <span className="module-badge">
              {customers.length} {t ? t('records') : 'Records'}
            </span>
          </div>
          <div>
            <h2 className="module-title">{t ? t('customersModule') : 'Customers'}</h2>
            <p className="module-subtitle">{t ? t('customersSubtitle') : 'Customer List'}</p>
          </div>
          <div className="module-footer">
            <span>{t ? t('customersFooter') : 'View all profiles, loan numbers & vehicle details'}</span>
            <ArrowUpRight size={16} />
          </div>
        </button>

        <button
          type="button"
          className="glass-panel glass-tile module-card"
          onClick={onOpenAdd}
        >
          <div className="module-header">
            <div className="module-icon module-icon--cyan">
              <UserPlus size={25} />
            </div>
            <span className="module-badge">{t ? t('newEntry') : 'New Entry'}</span>
          </div>
          <div>
            <h2 className="module-title">{t ? t('addModule') : 'Add Customer'}</h2>
            <p className="module-subtitle">{t ? t('addSubtitle') : 'New Entry'}</p>
          </div>
          <div className="module-footer">
            <span>{t ? t('addFooter') : 'Add Vehicle, Loan No (e.g. A15 G27) & Save offline'}</span>
            <ArrowUpRight size={16} />
          </div>
        </button>

        <button
          type="button"
          className="glass-panel glass-tile module-card"
          onClick={() => onNavigate('search')}
        >
          <div className="module-header">
            <div className="module-icon module-icon--amber">
              <Search size={25} />
            </div>
            <span className="module-badge">Live Highlight</span>
          </div>
          <div>
            <h2 className="module-title">{t ? t('searchModule') : 'Smart Search'}</h2>
            <p className="module-subtitle">{t ? t('searchSubtitle') : 'Find Customer'}</p>
          </div>
          <div className="module-footer">
            <span>{t ? t('searchFooter') : 'Search by Vehicle No (TN 15), Loan No (A15 G27), or Name'}</span>
            <ArrowUpRight size={16} />
          </div>
        </button>

        <button
          type="button"
          className="glass-panel glass-tile module-card"
          onClick={() => onNavigate('excel')}
        >
          <div className="module-header">
            <div className="module-icon module-icon--violet">
              <FileSpreadsheet size={25} />
            </div>
            <span className="module-badge">.XLSX / .CSV</span>
          </div>
          <div>
            <h2 className="module-title">{t ? t('excelModule') : 'Excel'}</h2>
            <p className="module-subtitle">{t ? t('excelSubtitle') : 'Import / Export'}</p>
          </div>
          <div className="module-footer">
            <span>{t ? t('excelFooter') : 'Bulk upload & backup sheets offline'}</span>
            <ArrowUpRight size={16} />
          </div>
        </button>
      </section>

      {/* Recent Accounts Quick Strip */}
      {recentCustomers.length > 0 && (
        <section className="glass-panel" style={{ padding: '18px 20px' }}>
          <div className="section-header" style={{ marginBottom: '12px' }}>
            <div>
              <h3 className="section-title" style={{ fontSize: '1.02rem' }}>
                {t ? t('recentEntries') : 'Recent Customer Entries'}
              </h3>
              <p className="section-subtitle">
                {t ? t('recentEntriesSubtitle') : 'Tap any card to open full customer profile'}
              </p>
            </div>
            <button
              type="button"
              className="glass-pill"
              onClick={() => onNavigate('customers')}
            >
              {t ? t('viewAll') : 'View All'}
            </button>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
              gap: '10px'
            }}
          >
            {recentCustomers.map((c) => {
              const totalDues = Number(c.totalDues) || 12;
              const paidDues = Number(c.paidDues) || 0;
              const pendingDues = computePendingDues(totalDues, paidDues);

              return (
                <button
                  key={c.id}
                  type="button"
                  className="glass-panel glass-tile"
                  onClick={() => onSelectCustomer(c)}
                  style={{
                    padding: '14px',
                    borderRadius: '18px',
                    background: 'var(--glass-bg-subtle)',
                    textAlign: 'left'
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      gap: '8px',
                      marginBottom: '8px'
                    }}
                  >
                    <span className="vehicle-plate">{c.vehicleNumber || 'NO PLATE'}</span>
                    {c.loanNumber && (
                      <span
                        className="glass-pill"
                        style={{
                          fontFamily: 'var(--font-mono)',
                          fontSize: '0.74rem',
                          fontWeight: 700,
                          color: 'var(--accent-amber)',
                          padding: '2px 7px'
                        }}
                      >
                        {c.loanNumber}
                      </span>
                    )}
                  </div>
                  <div style={{ fontWeight: 700, fontSize: '0.96rem' }}>{c.customerName}</div>
                  <div
                    style={{
                      fontSize: '0.8rem',
                      color: 'var(--text-secondary)',
                      marginTop: '2px'
                    }}
                  >
                    {c.vehicleModel || 'Two Wheeler'} · {c.mobileNumber}
                  </div>

                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      marginTop: '8px',
                      paddingTop: '6px',
                      borderTop: '1px solid rgba(255,255,255,0.06)',
                      fontSize: '0.76rem'
                    }}
                  >
                    <span style={{ color: 'var(--accent-cyan)', fontFamily: 'var(--font-mono)' }}>
                      Total: {totalDues}m
                    </span>
                    <span className="pending-badge" style={{ fontSize: '0.74rem', padding: '1px 6px' }}>
                      Pending: {pendingDues}m
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </section>
      )}
    </div>
  );
}
