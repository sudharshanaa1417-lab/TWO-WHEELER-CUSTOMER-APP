import React, { useState } from 'react';
import {
  Bike,
  Calendar,
  Copy,
  Edit3,
  FileText,
  IndianRupee,
  MapPin,
  MessageCircle,
  Phone,
  Trash2,
  User,
  X
} from 'lucide-react';
import {
  estimateTenureMonths,
  formatINR,
  formatShortDate
} from '../utils/format';

export default function CustomerProfileModal({
  customer,
  onClose,
  onEdit,
  onDelete,
  onNotify
}) {
  const [confirmDelete, setConfirmDelete] = useState(false);

  if (!customer) return null;

  const estMonths = estimateTenureMonths(customer.financeAmount, customer.monthlyPayment);
  const digitsOnly = String(customer.mobileNumber || '').replace(/\D/g, '');
  const whatsappNumber = digitsOnly.length === 10 ? `91${digitsOnly}` : digitsOnly;

  async function handleCopySummary() {
    const summary = [
      `TWO WHEELER FINANCE - CUSTOMER PROFILE`,
      `Customer Name: ${customer.customerName}`,
      `Vehicle Number: ${customer.vehicleNumber}`,
      `Loan Number: ${customer.loanNumber || '-'}`,
      `Vehicle Model: ${customer.vehicleModel || '-'}`,
      `Mobile Number: ${customer.mobileNumber}`,
      `Address: ${customer.address || '-'}`,
      `Finance Amount: ${formatINR(customer.financeAmount)}`,
      `Monthly Payment: ${formatINR(customer.monthlyPayment)}`,
      `Remarks: ${customer.remarks || '-'}`
    ].join('\n');

    try {
      await navigator.clipboard.writeText(summary);
      onNotify?.('Customer profile copied to clipboard');
    } catch {
      onNotify?.('Could not access clipboard');
    }
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div
        className="glass-panel-elevated modal-card"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="profile-modal-title"
      >
        {/* Top Banner */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            gap: '12px',
            marginBottom: '18px'
          }}
        >
          <div>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '8px', flexWrap: 'wrap' }}>
              <span className="vehicle-plate" style={{ fontSize: '0.98rem' }}>
                <Bike size={16} style={{ color: 'var(--accent-cyan)' }} />
                {customer.vehicleNumber || 'NO PLATE'}
              </span>
              {customer.loanNumber && (
                <span
                  className="glass-pill"
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontWeight: 700,
                    fontSize: '0.82rem',
                    color: 'var(--accent-amber)',
                    borderColor: 'rgba(251, 191, 36, 0.45)',
                    padding: '4px 10px'
                  }}
                >
                  Loan No: {customer.loanNumber}
                </span>
              )}
            </div>
            <h2
              id="profile-modal-title"
              className="section-title"
              style={{ fontSize: '1.45rem', marginTop: '6px' }}
            >
              {customer.customerName}
            </h2>
            <p className="section-subtitle">{customer.vehicleModel || 'Two Wheeler'}</p>
          </div>

          <button type="button" className="glass-pill" onClick={onClose} aria-label="Close">
            <X size={16} />
          </button>
        </div>

        {/* Financial Highlights */}
        <div
          className="finance-strip"
          style={{
            gridTemplateColumns: 'repeat(3, 1fr)',
            padding: '14px',
            marginBottom: '16px'
          }}
        >
          <div>
            <div className="finance-stat-label">Finance Amount</div>
            <div className="finance-stat-value" style={{ fontSize: '1.1rem' }}>
              {formatINR(customer.financeAmount)}
            </div>
          </div>
          <div>
            <div className="finance-stat-label">Monthly Payment</div>
            <div
              className="finance-stat-value"
              style={{ fontSize: '1.1rem', color: 'var(--accent-emerald)' }}
            >
              {formatINR(customer.monthlyPayment)}
            </div>
          </div>
          <div>
            <div className="finance-stat-label">Est. Tenure</div>
            <div className="finance-stat-value" style={{ fontSize: '1.1rem' }}>
              {estMonths ? `${estMonths} mo` : '—'}
            </div>
          </div>
        </div>

        {/* Quick Communication Actions (WhatsApp Reminder & Phone Dial) */}
        <div className="chips-row" style={{ marginBottom: '18px' }}>
          <a
            href={`tel:${customer.mobileNumber}`}
            className="btn btn-primary btn-sm"
            style={{ textDecoration: 'none' }}
          >
            <Phone size={15} />
            <span>Call Customer</span>
          </a>

          <a
            href={`https://wa.me/${whatsappNumber}?text=${encodeURIComponent(
              `Hello ${customer.customerName}, this is a reminder from Two Wheeler Finance regarding your vehicle ${customer.vehicleNumber} (Loan No: ${customer.loanNumber || '-'}). Monthly EMI: ${formatINR(customer.monthlyPayment)}. Thank you!`
            )}`}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-glass btn-sm"
            style={{ textDecoration: 'none', borderColor: 'rgba(52, 211, 153, 0.4)' }}
          >
            <MessageCircle size={15} style={{ color: 'var(--accent-emerald)' }} />
            <span>WhatsApp Reminder</span>
          </a>

          <button type="button" className="btn btn-glass btn-sm" onClick={handleCopySummary}>
            <Copy size={15} />
            <span>Copy Profile</span>
          </button>
        </div>

        {/* Details Table */}
        <div
          className="glass-panel"
          style={{
            padding: '16px',
            borderRadius: '18px',
            marginBottom: '18px',
            background: 'var(--glass-bg-subtle)'
          }}
        >
          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
              <FileText size={17} style={{ color: 'var(--accent-amber)', marginTop: '2px' }} />
              <div>
                <div className="finance-stat-label">Loan Number</div>
                <div style={{ fontWeight: 700, fontFamily: 'var(--font-mono)' }}>
                  {customer.loanNumber || '—'}
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
              <Phone size={17} style={{ color: 'var(--accent-emerald)', marginTop: '2px' }} />
              <div>
                <div className="finance-stat-label">Mobile Number</div>
                <div style={{ fontWeight: 600 }}>{customer.mobileNumber || '—'}</div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
              <MapPin size={17} style={{ color: 'var(--accent-cyan)', marginTop: '2px' }} />
              <div>
                <div className="finance-stat-label">Address</div>
                <div>{customer.address || '—'}</div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
              <Bike size={17} style={{ color: 'var(--accent-amber)', marginTop: '2px' }} />
              <div>
                <div className="finance-stat-label">Vehicle Model</div>
                <div>{customer.vehicleModel || '—'}</div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
              <Calendar size={17} style={{ color: 'var(--text-muted)', marginTop: '2px' }} />
              <div>
                <div className="finance-stat-label">Account Created / Updated</div>
                <div style={{ fontSize: '0.84rem', color: 'var(--text-secondary)' }}>
                  {formatShortDate(customer.createdAt)} (Updated: {formatShortDate(customer.updatedAt)})
                </div>
              </div>
            </div>

            {customer.remarks && (
              <div
                style={{
                  padding: '10px 12px',
                  borderRadius: '12px',
                  background: 'rgba(255, 255, 255, 0.04)',
                  fontSize: '0.86rem',
                  borderLeft: '3px solid var(--accent-amber)'
                }}
              >
                <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>Remarks: </span>
                <span style={{ color: 'var(--text-secondary)' }}>{customer.remarks}</span>
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: '10px',
            flexWrap: 'wrap'
          }}
        >
          {confirmDelete ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '0.84rem', color: 'var(--accent-rose)' }}>
                Delete this customer?
              </span>
              <button
                type="button"
                className="btn btn-sm"
                style={{ background: 'var(--accent-rose)', color: '#fff' }}
                onClick={() => onDelete(customer.id)}
              >
                Yes, Delete
              </button>
              <button
                type="button"
                className="btn btn-glass btn-sm"
                onClick={() => setConfirmDelete(false)}
              >
                Cancel
              </button>
            </div>
          ) : (
            <button
              type="button"
              className="btn btn-glass btn-sm"
              onClick={() => setConfirmDelete(true)}
              style={{ color: 'var(--accent-rose)', borderColor: 'rgba(251, 113, 133, 0.35)' }}
            >
              <Trash2 size={15} />
              <span>Delete</span>
            </button>
          )}

          <div style={{ display: 'flex', gap: '8px' }}>
            <button type="button" className="btn btn-glass" onClick={onClose}>
              Close
            </button>
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => onEdit(customer)}
            >
              <Edit3 size={15} />
              <span>Edit Customer</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
