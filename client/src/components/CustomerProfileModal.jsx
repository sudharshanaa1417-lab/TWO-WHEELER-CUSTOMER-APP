import React, { useState } from 'react';
import {
  Bike,
  Calendar,
  CheckCircle2,
  Clock,
  Copy,
  Edit3,
  FileText,
  IndianRupee,
  MapPin,
  MessageCircle,
  Phone,
  PlusCircle,
  RotateCcw,
  Trash2,
  User,
  X
} from 'lucide-react';
import {
  formatINR,
  formatShortDate
} from '../utils/format';
import { computePendingDues } from '../db/indexedDb';

export default function CustomerProfileModal({
  customer,
  onClose,
  onEdit,
  onDelete,
  onUpdatePayment,
  onNotify,
  t
}) {
  const [confirmDelete, setConfirmDelete] = useState(false);

  if (!customer) return null;

  const totalDues = Number(customer.totalDues) || 12;
  const paidDues = Number(customer.paidDues) || 0;
  const pendingDues = computePendingDues(totalDues, paidDues);
  const percentPaid = Math.min(100, Math.round((paidDues / Math.max(1, totalDues)) * 100));

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
      `Total Due: ${totalDues} ${t ? t('months') : 'months'}`,
      `Paid Due: ${paidDues} ${t ? t('months') : 'months'}`,
      `Pending / Balance Due: ${pendingDues} ${t ? t('months') : 'months'}`,
      `Remarks: ${customer.remarks || '-'}`
    ].join('\n');

    try {
      await navigator.clipboard.writeText(summary);
      onNotify?.('Customer profile copied to clipboard');
    } catch {
      onNotify?.('Could not access clipboard');
    }
  }

  function handleIncrementPaid() {
    if (paidDues >= totalDues) {
      onNotify?.('All dues are already fully paid!');
      return;
    }
    const nextPaid = paidDues + 1;
    onUpdatePayment?.(customer.id, {
      ...customer,
      paidDues: nextPaid,
      pendingDues: computePendingDues(totalDues, nextPaid)
    });
    onNotify?.(`Recorded EMI payment (${nextPaid}/${totalDues})`);
  }

  function handleDecrementPaid() {
    if (paidDues <= 0) return;
    const nextPaid = paidDues - 1;
    onUpdatePayment?.(customer.id, {
      ...customer,
      paidDues: nextPaid,
      pendingDues: computePendingDues(totalDues, nextPaid)
    });
    onNotify?.(`Reverted EMI payment (${nextPaid}/${totalDues})`);
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

        {/* Financial & Due Months Strip (Replaces old EST. SPAN with Total Due & Pending Due as requested) */}
        <div
          className="finance-strip"
          style={{
            gridTemplateColumns: 'repeat(auto-fit, minmax(110px, 1fr))',
            padding: '14px',
            marginBottom: '14px'
          }}
        >
          <div>
            <div className="finance-stat-label">{t ? t('financeAmount') : 'Finance Amount'}</div>
            <div className="finance-stat-value" style={{ fontSize: '1.05rem' }}>
              {formatINR(customer.financeAmount)}
            </div>
          </div>

          <div>
            <div className="finance-stat-label">{t ? t('monthlyPayment') : 'Monthly Payment'}</div>
            <div
              className="finance-stat-value"
              style={{ fontSize: '1.05rem', color: 'var(--accent-emerald)' }}
            >
              {formatINR(customer.monthlyPayment)}
            </div>
          </div>

          {/* User Requested: Total Due - (12month) */}
          <div>
            <div className="finance-stat-label">{t ? t('totalDue') : 'Total Due'}</div>
            <div
              className="finance-stat-value"
              style={{ fontSize: '1.05rem', color: 'var(--accent-cyan)' }}
            >
              {totalDues} {t ? t('monthsShort') : 'mos'}
            </div>
          </div>

          {/* User Requested: Pending / Balance Due - (3month) */}
          <div>
            <div className="finance-stat-label">{t ? t('pendingDue') : 'Pending Due'}</div>
            <div
              className="finance-stat-value"
              style={{
                fontSize: '1.05rem',
                color: pendingDues > 0 ? 'var(--accent-amber)' : 'var(--accent-emerald)',
                fontWeight: 800
              }}
            >
              {pendingDues} {t ? t('monthsShort') : 'mos'}
            </div>
          </div>
        </div>

        {/* Real-time Due Payment Tracker & Quick Increment Action */}
        <div
          className="glass-panel"
          style={{
            padding: '12px 14px',
            borderRadius: '14px',
            marginBottom: '16px',
            background: 'var(--glass-bg-subtle)',
            display: 'flex',
            flexDirection: 'column',
            gap: '8px'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.84rem' }}>
            <span style={{ color: 'var(--text-secondary)' }}>
              {t ? t('paidDue') : 'Paid'}: <strong style={{ color: 'var(--text-primary)' }}>{paidDues}</strong> / {totalDues} {t ? t('months') : 'months'}
            </span>
            <span className={pendingDues > 0 ? 'pending-badge' : 'total-due-badge'}>
              {pendingDues > 0 ? `${pendingDues} ${t ? t('months') : 'months'} remaining` : 'Fully Paid ✓'}
            </span>
          </div>

          {/* Visual Due Progress Bar */}
          <div
            style={{
              width: '100%',
              height: '8px',
              borderRadius: '999px',
              background: 'rgba(255, 255, 255, 0.08)',
              overflow: 'hidden'
            }}
          >
            <div
              style={{
                height: '100%',
                width: `${percentPaid}%`,
                background:
                  percentPaid === 100
                    ? 'var(--accent-emerald)'
                    : 'linear-gradient(90deg, var(--accent-cyan) 0%, var(--accent-emerald) 100%)',
                transition: 'width 0.3s ease'
              }}
            />
          </div>

          {/* Real-time Payment Action Buttons */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '2px' }}>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
              Real-time payment update:
            </span>
            <div style={{ display: 'flex', gap: '8px' }}>
              {paidDues > 0 && (
                <button
                  type="button"
                  className="btn btn-glass btn-sm"
                  onClick={handleDecrementPaid}
                  title="Undo 1 payment"
                  style={{ padding: '3px 8px', fontSize: '0.75rem' }}
                >
                  <RotateCcw size={12} />
                  <span>-1</span>
                </button>
              )}
              <button
                type="button"
                className="btn btn-primary btn-sm"
                onClick={handleIncrementPaid}
                style={{ padding: '4px 10px', fontSize: '0.78rem' }}
              >
                <PlusCircle size={13} />
                <span>{t ? t('recordPayment') : '+1 Due Paid'}</span>
              </button>
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
            <span>{t ? t('callCustomer') : 'Call Customer'}</span>
          </a>

          <a
            href={`https://wa.me/${whatsappNumber}?text=${encodeURIComponent(
              `Hello ${customer.customerName}, this is a reminder from Two Wheeler Finance regarding your vehicle ${customer.vehicleNumber} (Loan No: ${customer.loanNumber || '-'}). Total Due: ${totalDues} mos, Paid: ${paidDues} mos, Pending Due: ${pendingDues} mos. Monthly EMI: ${formatINR(customer.monthlyPayment)}. Thank you!`
            )}`}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-glass btn-sm"
            style={{ textDecoration: 'none', borderColor: 'rgba(52, 211, 153, 0.4)' }}
          >
            <MessageCircle size={15} style={{ color: 'var(--accent-emerald)' }} />
            <span>{t ? t('whatsappReminder') : 'WhatsApp Reminder'}</span>
          </a>

          <button type="button" className="btn btn-glass btn-sm" onClick={handleCopySummary}>
            <Copy size={15} />
            <span>{t ? t('copyProfile') : 'Copy Profile'}</span>
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
                <div className="finance-stat-label">{t ? t('loanNumber') : 'Loan Number'}</div>
                <div style={{ fontWeight: 700, fontFamily: 'var(--font-mono)' }}>
                  {customer.loanNumber || '—'}
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
              <Clock size={17} style={{ color: 'var(--accent-cyan)', marginTop: '2px' }} />
              <div>
                <div className="finance-stat-label">
                  {t ? t('totalDue') : 'Total Due'} &amp; {t ? t('pendingDue') : 'Pending Due'}
                </div>
                <div style={{ fontWeight: 600 }}>
                  {totalDues} {t ? t('months') : 'months'} total · {paidDues} paid ·{' '}
                  <span style={{ color: 'var(--accent-amber)', fontWeight: 700 }}>
                    {pendingDues} {t ? t('months') : 'months'} pending
                  </span>
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
              <Phone size={17} style={{ color: 'var(--accent-emerald)', marginTop: '2px' }} />
              <div>
                <div className="finance-stat-label">{t ? t('mobileNumber') : 'Mobile Number'}</div>
                <div style={{ fontWeight: 600 }}>{customer.mobileNumber || '—'}</div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
              <MapPin size={17} style={{ color: 'var(--accent-cyan)', marginTop: '2px' }} />
              <div>
                <div className="finance-stat-label">{t ? t('address') : 'Address'}</div>
                <div>{customer.address || '—'}</div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
              <Bike size={17} style={{ color: 'var(--accent-amber)', marginTop: '2px' }} />
              <div>
                <div className="finance-stat-label">{t ? t('vehicleModel') : 'Vehicle Model'}</div>
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
                <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{t ? t('remarks') : 'Remarks'}: </span>
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
                {t ? t('cancel') : 'Cancel'}
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
              <span>{t ? t('delete') : 'Delete'}</span>
            </button>
          )}

          <div style={{ display: 'flex', gap: '8px' }}>
            <button type="button" className="btn btn-glass" onClick={onClose}>
              {t ? t('close') : 'Close'}
            </button>
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => onEdit(customer)}
            >
              <Edit3 size={15} />
              <span>{t ? t('editCustomer') : 'Edit Customer'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
