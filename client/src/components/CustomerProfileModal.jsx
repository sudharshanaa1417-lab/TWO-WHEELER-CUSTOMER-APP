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
            <span className="vehicle-plate" style={{ fontSize: '0.98rem', marginBottom: '10px' }}>
              <Bike size={16} style={{ color: 'var(--accent-cyan)' }} />
              {customer.vehicleNumber || 'NO PLATE'}
            </span>
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
            <div className="finance-stat-label">Est. Span</div>
            <div
              className="finance-stat-value"
              style={{ fontSize: '1.1rem', color: 'var(--accent-cyan)' }}
            >
              {estMonths ? `~${estMonths} mos` : '—'}
            </div>
          </div>
        </div>

        {/* Contact Quick Actions */}
        <div className="chips-row" style={{ marginBottom: '18px' }}>
          {digitsOnly && (
            <>
              <a href={`tel:${digitsOnly}`} className="btn btn-primary btn-sm">
                <Phone size={15} />
                <span>Call {customer.mobileNumber}</span>
              </a>
              <a
                href={`https://wa.me/${whatsappNumber}?text=${encodeURIComponent(
                  `Hello ${customer.customerName}, regarding your Two Wheeler Finance account (${customer.vehicleNumber}) — Monthly Payment: ${formatINR(customer.monthlyPayment)}.`
                )}`}
                target="_blank"
                rel="noreferrer"
                className="btn btn-glass btn-sm"
              >
                <MessageCircle size={15} style={{ color: 'var(--accent-emerald)' }} />
                <span>WhatsApp</span>
              </a>
            </>
          )}
          <button type="button" className="btn btn-glass btn-sm" onClick={handleCopySummary}>
            <Copy size={15} />
            <span>Copy Summary</span>
          </button>
        </div>

        {/* Full 8-Column Details */}
        <div
          className="glass-panel"
          style={{
            padding: '16px',
            borderRadius: '18px',
            background: 'var(--glass-bg-subtle)',
            display: 'grid',
            gap: '12px'
          }}
        >
          <DetailRow icon={<User size={15} />} label="Customer Name" value={customer.customerName} />
          <DetailRow icon={<Bike size={15} />} label="Vehicle Number" value={customer.vehicleNumber} mono />
          <DetailRow icon={<Phone size={15} />} label="Mobile Number" value={customer.mobileNumber} mono />
          <DetailRow icon={<Bike size={15} />} label="Vehicle Model" value={customer.vehicleModel || '—'} />
          <DetailRow icon={<MapPin size={15} />} label="Address" value={customer.address || '—'} />
          <DetailRow icon={<IndianRupee size={15} />} label="Finance Amount" value={formatINR(customer.financeAmount)} mono />
          <DetailRow icon={<IndianRupee size={15} />} label="Monthly Payment" value={formatINR(customer.monthlyPayment)} mono />
          <DetailRow icon={<FileText size={15} />} label="Remarks" value={customer.remarks || '—'} />
          <DetailRow
            icon={<Calendar size={15} />}
            label="Last Updated"
            value={formatShortDate(customer.updatedAt)}
          />
        </div>

        {/* Footer Actions */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: '10px',
            flexWrap: 'wrap',
            marginTop: '18px'
          }}
        >
          {!confirmDelete ? (
            <button
              type="button"
              className="btn btn-danger btn-sm"
              onClick={() => setConfirmDelete(true)}
            >
              <Trash2 size={15} />
              <span>Delete</span>
            </button>
          ) : (
            <div className="chips-row">
              <button
                type="button"
                className="btn btn-danger btn-sm"
                onClick={() => onDelete(customer.id)}
              >
                Confirm Delete
              </button>
              <button
                type="button"
                className="btn btn-glass btn-sm"
                onClick={() => setConfirmDelete(false)}
              >
                Cancel
              </button>
            </div>
          )}

          <div className="chips-row">
            <button type="button" className="btn btn-glass btn-sm" onClick={onClose}>
              Close
            </button>
            <button
              type="button"
              className="btn btn-primary btn-sm"
              onClick={() => onEdit(customer)}
            >
              <Edit3 size={15} />
              <span>Edit Profile</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function DetailRow({ icon, label, value, mono = false }) {
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: '150px 1fr',
        gap: '10px',
        alignItems: 'start',
        fontSize: '0.88rem'
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '7px',
          color: 'var(--text-muted)',
          fontWeight: 600
        }}
      >
        {icon}
        <span>{label}</span>
      </div>
      <div
        style={{
          color: 'var(--text-primary)',
          fontWeight: 600,
          fontFamily: mono ? 'var(--font-mono)' : 'inherit',
          wordBreak: 'break-word'
        }}
      >
        {value}
      </div>
    </div>
  );
}
