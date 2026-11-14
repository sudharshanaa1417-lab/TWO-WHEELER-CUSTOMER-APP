import React, { useEffect, useState } from 'react';
import { Save, UserPlus, X } from 'lucide-react';
import {
  formatINR,
  normalizeLoanNumber,
  normalizeVehicleNumber
} from '../utils/format';
import { computePendingDues } from '../db/indexedDb';

const EMPTY_FORM = {
  customerName: '',
  vehicleNumber: '',
  loanNumber: '',
  mobileNumber: '',
  address: '',
  vehicleModel: '',
  financeAmount: '',
  monthlyPayment: '',
  totalDues: 12,
  paidDues: 0,
  remarks: ''
};

export default function CustomerFormModal({
  isOpen,
  initialCustomer,
  onClose,
  onSave,
  t
}) {
  const [form, setForm] = useState(EMPTY_FORM);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isOpen) return;
    if (initialCustomer) {
      const f = Number(initialCustomer.financeAmount) || 0;
      const m = Number(initialCustomer.monthlyPayment) || 0;
      const fallbackTenure = f > 0 && m > 0 ? Math.max(1, Math.round(f / m)) : 12;

      setForm({
        customerName: initialCustomer.customerName || '',
        vehicleNumber: initialCustomer.vehicleNumber || '',
        loanNumber: initialCustomer.loanNumber || '',
        mobileNumber: initialCustomer.mobileNumber || '',
        address: initialCustomer.address || '',
        vehicleModel: initialCustomer.vehicleModel || '',
        financeAmount: initialCustomer.financeAmount ?? '',
        monthlyPayment: initialCustomer.monthlyPayment ?? '',
        totalDues: initialCustomer.totalDues ?? fallbackTenure,
        paidDues: initialCustomer.paidDues ?? 0,
        remarks: initialCustomer.remarks || ''
      });
    } else {
      setForm(EMPTY_FORM);
    }
    setError('');
  }, [isOpen, initialCustomer]);

  if (!isOpen) return null;

  const currentPending = computePendingDues(form.totalDues, form.paidDues);

  function handleChange(field, value) {
    setForm((prev) => {
      const next = {
        ...prev,
        [field]:
          field === 'vehicleNumber' || field === 'loanNumber'
            ? value.toUpperCase()
            : value
      };

      // Auto-suggest total dues if finance amount and monthly EMI are entered and totalDues wasn't manually changed
      if ((field === 'financeAmount' || field === 'monthlyPayment') && !initialCustomer) {
        const fa = Number(field === 'financeAmount' ? value : prev.financeAmount) || 0;
        const mp = Number(field === 'monthlyPayment' ? value : prev.monthlyPayment) || 0;
        if (fa > 0 && mp > 0) {
          next.totalDues = Math.max(1, Math.round(fa / mp));
        }
      }

      return next;
    });
  }

  function handleSubmit(e) {
    e.preventDefault();
    const cleaned = {
      ...initialCustomer,
      customerName: form.customerName.trim(),
      vehicleNumber: normalizeVehicleNumber(form.vehicleNumber),
      loanNumber: normalizeLoanNumber(form.loanNumber),
      mobileNumber: form.mobileNumber.trim(),
      address: form.address.trim(),
      vehicleModel: form.vehicleModel.trim(),
      financeAmount: Number(form.financeAmount) || 0,
      monthlyPayment: Number(form.monthlyPayment) || 0,
      totalDues: Math.max(1, Number(form.totalDues) || 1),
      paidDues: Math.max(0, Number(form.paidDues) || 0),
      pendingDues: currentPending,
      remarks: form.remarks.trim()
    };

    if (!cleaned.customerName || !cleaned.vehicleNumber || !cleaned.mobileNumber) {
      setError('Please enter Customer Name, Vehicle Number, and Mobile Number.');
      return;
    }

    onSave(cleaned);
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div
        className="glass-panel-elevated modal-card"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="customer-form-title"
      >
        <div className="section-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div className="module-icon module-icon--cyan" style={{ width: '42px', height: '42px' }}>
              <UserPlus size={20} />
            </div>
            <div>
              <h2 id="customer-form-title" className="section-title">
                {initialCustomer
                  ? t
                    ? t('updateProfile')
                    : 'Edit Customer Profile'
                  : t
                  ? t('newEntry')
                  : 'Add Customer · New Entry'}
              </h2>
              <p className="section-subtitle">
                {t ? t('saveOffline') : 'Saves immediately to offline local storage'}
              </p>
            </div>
          </div>

          <button type="button" className="glass-pill" onClick={onClose} aria-label="Close">
            <X size={16} />
          </button>
        </div>

        {error && (
          <div
            style={{
              padding: '10px 14px',
              borderRadius: '12px',
              background: 'rgba(251, 113, 133, 0.16)',
              border: '1px solid rgba(251, 113, 133, 0.45)',
              color: 'var(--accent-rose)',
              fontSize: '0.86rem',
              marginBottom: '14px'
            }}
          >
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-grid">
            <div>
              <label className="field-label" htmlFor="f-name">
                {t ? t('customerName') : 'Customer Name'} *
              </label>
              <input
                id="f-name"
                type="text"
                className="glass-input"
                placeholder="e.g. Karthikeyan S"
                value={form.customerName}
                onChange={(e) => handleChange('customerName', e.target.value)}
                required
              />
            </div>

            <div>
              <label className="field-label" htmlFor="f-veh">
                {t ? t('vehicleNumber') : 'Vehicle Number'} *
              </label>
              <input
                id="f-veh"
                type="text"
                className="glass-input"
                style={{ fontFamily: 'var(--font-mono)', letterSpacing: '0.05em' }}
                placeholder="e.g. TN 15 AB 1234"
                value={form.vehicleNumber}
                onChange={(e) => handleChange('vehicleNumber', e.target.value)}
                required
              />
            </div>

            {/* Loan Number right below Vehicle Number as requested */}
            <div>
              <label className="field-label" htmlFor="f-loan">
                {t ? t('loanNumber') : 'Loan Number'}
              </label>
              <input
                id="f-loan"
                type="text"
                className="glass-input"
                style={{ fontFamily: 'var(--font-mono)', letterSpacing: '0.05em' }}
                placeholder="e.g. A15 G27"
                value={form.loanNumber}
                onChange={(e) => handleChange('loanNumber', e.target.value)}
              />
            </div>

            <div>
              <label className="field-label" htmlFor="f-mobile">
                {t ? t('mobileNumber') : 'Mobile Number'} *
              </label>
              <input
                id="f-mobile"
                type="tel"
                className="glass-input"
                style={{ fontFamily: 'var(--font-mono)' }}
                placeholder="e.g. 9876543210"
                value={form.mobileNumber}
                onChange={(e) => handleChange('mobileNumber', e.target.value)}
                required
              />
            </div>

            <div>
              <label className="field-label" htmlFor="f-model">
                {t ? t('vehicleModel') : 'Vehicle Model'}
              </label>
              <input
                id="f-model"
                type="text"
                className="glass-input"
                placeholder="e.g. Honda Activa 6G / Pulsar 150"
                value={form.vehicleModel}
                onChange={(e) => handleChange('vehicleModel', e.target.value)}
              />
            </div>

            <div>
              <label className="field-label" htmlFor="f-amount">
                {t ? t('financeAmount') : 'Finance Amount'} (₹)
              </label>
              <input
                id="f-amount"
                type="number"
                min="0"
                step="500"
                className="glass-input"
                placeholder="e.g. 75000"
                value={form.financeAmount}
                onChange={(e) => handleChange('financeAmount', e.target.value)}
              />
            </div>

            <div>
              <label className="field-label" htmlFor="f-emi">
                {t ? t('monthlyPayment') : 'Monthly Payment / EMI'} (₹)
              </label>
              <input
                id="f-emi"
                type="number"
                min="0"
                step="100"
                className="glass-input"
                placeholder="e.g. 3500"
                value={form.monthlyPayment}
                onChange={(e) => handleChange('monthlyPayment', e.target.value)}
              />
            </div>

            {/* Total Due Months */}
            <div>
              <label className="field-label" htmlFor="f-total-dues">
                {t ? t('totalDue') : 'Total Due (Months)'}
              </label>
              <input
                id="f-total-dues"
                type="number"
                min="1"
                max="120"
                className="glass-input"
                placeholder="e.g. 12 or 24"
                value={form.totalDues}
                onChange={(e) => handleChange('totalDues', e.target.value)}
              />
            </div>

            {/* Paid Due Months */}
            <div>
              <label className="field-label" htmlFor="f-paid-dues">
                {t ? t('paidDue') : 'Paid Dues (Months)'}
              </label>
              <input
                id="f-paid-dues"
                type="number"
                min="0"
                max={Number(form.totalDues) || 120}
                className="glass-input"
                placeholder="e.g. 9"
                value={form.paidDues}
                onChange={(e) => handleChange('paidDues', e.target.value)}
              />
            </div>

            <div style={{ gridColumn: '1 / -1' }}>
              <label className="field-label" htmlFor="f-address">
                {t ? t('address') : 'Customer Address'}
              </label>
              <textarea
                id="f-address"
                rows={2}
                className="glass-input"
                placeholder="e.g. 14, Gandhi Road, Villupuram - 605602"
                value={form.address}
                onChange={(e) => handleChange('address', e.target.value)}
              />
            </div>

            <div style={{ gridColumn: '1 / -1' }}>
              <label className="field-label" htmlFor="f-remarks">
                {t ? t('remarks') : 'Remarks / Notes / Due Date'}
              </label>
              <input
                id="f-remarks"
                type="text"
                className="glass-input"
                placeholder="e.g. Due 5th of every month · Guarantor signed"
                value={form.remarks}
                onChange={(e) => handleChange('remarks', e.target.value)}
              />
            </div>
          </div>

          {/* Real-time Due Balance Display */}
          <div
            className="glass-panel"
            style={{
              marginTop: '16px',
              padding: '12px 16px',
              background: 'var(--glass-bg-subtle)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              fontSize: '0.86rem',
              flexWrap: 'wrap',
              gap: '8px'
            }}
          >
            <span style={{ color: 'var(--text-secondary)' }}>
              {t ? t('totalDue') : 'Total Due'}: <strong>{form.totalDues || 0} mos</strong> ·{' '}
              {t ? t('paidDue') : 'Paid'}: <strong>{form.paidDues || 0} mos</strong>
            </span>
            <span className="pending-badge" style={{ fontSize: '0.84rem' }}>
              {t ? t('pendingDue') : 'Pending / Balance'}: {currentPending} {t ? t('monthsShort') : 'mos'}
            </span>
          </div>

          <div
            style={{
              display: 'flex',
              gap: '10px',
              justifyContent: 'flex-end',
              marginTop: '22px'
            }}
          >
            <button type="button" className="btn btn-glass" onClick={onClose}>
              {t ? t('cancel') : 'Cancel'}
            </button>
            <button type="submit" className="btn btn-primary">
              <Save size={16} />
              <span>
                {initialCustomer
                  ? t
                    ? t('updateProfile')
                    : 'Update Profile'
                  : t
                  ? t('save')
                  : 'Save Customer'}
              </span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
