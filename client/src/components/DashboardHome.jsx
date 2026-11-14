import React from 'react';
import {
  ArrowUpRight,
  FileSpreadsheet,
  IndianRupee,
  Search,
  UserPlus,
  Users,
  Wallet
} from 'lucide-react';
import { formatINR } from '../utils/format';

export default function DashboardHome({
  customers,
  onNavigate,
  onOpenAdd,
  onSelectCustomer
}) {
  const totalFinanced = customers.reduce((sum, c) => sum + (Number(c.financeAmount) || 0), 0);
  const totalMonthly = customers.reduce((sum, c) => sum + (Number(c.monthlyPayment) || 0), 0);
  const recentCustomers = customers.slice(0, 3);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
      {/* Live Portfolio Glass Ribbon */}
      <section className="kpi-ribbon" aria-label="Portfolio Summary">
        <div className="glass-panel kpi-card">
          <div>
            <div className="kpi-label">Total Customers</div>
            <div className="kpi-value">{customers.length}</div>
          </div>
          <div className="kpi-icon-wrap" style={{ color: 'var(--accent-emerald)' }}>
            <Users size={19} />
          </div>
        </div>

        <div className="glass-panel kpi-card">
          <div>
            <div className="kpi-label">Finance Portfolio</div>
            <div className="kpi-value">{formatINR(totalFinanced)}</div>
          </div>
          <div className="kpi-icon-wrap" style={{ color: 'var(--accent-cyan)' }}>
            <IndianRupee size={19} />
          </div>
        </div>

        <div className="glass-panel kpi-card">
          <div>
            <div className="kpi-label">Monthly EMI Target</div>
            <div className="kpi-value">{formatINR(totalMonthly)}</div>
          </div>
          <div className="kpi-icon-wrap" style={{ color: 'var(--accent-amber)' }}>
            <Wallet size={19} />
          </div>
        </div>
      </section>

      {/* Core 2x2 App Architecture Grid (matches requested mockup) */}
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
            <span className="module-badge">{customers.length} Records</span>
          </div>
          <div>
            <h2 className="module-title">Customers</h2>
            <p className="module-subtitle">Customer List</p>
          </div>
          <div className="module-footer">
            <span>View all profiles & EMI terms</span>
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
            <span className="module-badge">8 Fields</span>
          </div>
          <div>
            <h2 className="module-title">Add Customer</h2>
            <p className="module-subtitle">New Entry</p>
          </div>
          <div className="module-footer">
            <span>Instant offline save to device</span>
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
            <h2 className="module-title">Smart Search</h2>
            <p className="module-subtitle">Find Customer</p>
          </div>
          <div className="module-footer">
            <span>Try &quot;TN 15&quot;, name, mobile or model</span>
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
            <h2 className="module-title">Excel</h2>
            <p className="module-subtitle">Import / Export</p>
          </div>
          <div className="module-footer">
            <span>Bulk upload & backup sheets</span>
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
                Recent Customer Entries
              </h3>
              <p className="section-subtitle">Tap any card to open full customer profile</p>
            </div>
            <button
              type="button"
              className="glass-pill"
              onClick={() => onNavigate('customers')}
            >
              View All
            </button>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
              gap: '10px'
            }}
          >
            {recentCustomers.map((c) => (
              <button
                key={c.id}
                type="button"
                className="glass-panel glass-tile"
                onClick={() => onSelectCustomer(c)}
                style={{
                  padding: '14px',
                  borderRadius: '18px',
                  background: 'var(--glass-bg-subtle)'
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
              </button>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
