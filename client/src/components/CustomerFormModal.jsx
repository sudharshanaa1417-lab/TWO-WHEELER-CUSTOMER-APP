import React, { useEffect, useState } from 'react';
import { Save, UserPlus, X } from 'lucide-react';
import {
  estimateTenureMonths,
  formatINR,
  normalizeLoanNumber,
  normalizeVehicleNumber
} from '../utils/format';

const EMPTY_FORM = {
  customerName: '',
  vehicleNumber: '',
  loanNumber: '',
  mobileNumber: '',
  address: '',
  vehicleModel: '',
  financeAmount: '',
  monthlyPayment: '',
  remarks: ''
};

export default function CustomerFormModal({
  isOpen,
  initialCustomer,
  onClose,
  onSave
}) {
  const [form, setForm] = useState(EMPTY_FORM);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isOpen) return;
    if (initialCustomer) {
      setForm({
        customerName: initialCustomer.customerName || '',
        vehicleNumber: initialCustomer.vehicleNumber || '',
        loanNumber: initialCustomer.loanNumber || '',
        mobileNumber: initialCustomer.mobileNumber || '',
        address: initialCustomer.address || '',
        vehicleModel: initialCustomer.vehicleModel || '',
        financeAmount: initialCustomer.financeAmount ?? '',
        monthlyPayment: initialCustomer.monthlyPayment ?? '',
        remarks: initialCustomer.remarks || ''
      });
    } else {
      setForm(EMPTY_FORM);
    }
    setError('');
  }, [isOpen, initialCustomer]);

  if (!isOpen) return null;

  const estMonths = estimateTenureMonths(form.financeAmount, form.monthlyPayment);

  function handleChange(field, value) {
    setForm((prev) => ({
      ...prev,
      [field]:
        field === 'vehicleNumber' || field === 'loanNumber'
          ? value.toUpperCase()
          : value
    }));
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
                {initialCustomer ? 'Edit Customer Profile' : 'Add Customer · New Entry'}
              </h2>
              <p className="section-subtitle">
                Saves immediately to offline local storage
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
                Customer Name *
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
                Vehicle Number *
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
                Loan Number (கடன் எண்)
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
                Mobile Number *
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
                Vehicle Model
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
                Finance Amount (₹)
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
                Monthly Payment / EMI (₹)
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

            <div style={{ gridColumn: '1 / -1' }}>
              <label className="field-label" htmlFor="f-address">
                Customer Address
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
                Remarks / Notes / Due Date
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

          {estMonths && (
            <div
              className="glass-panel"
              style={{
                marginTop: '16px',
                padding: '12px 16px',
                background: 'var(--glass-bg-subtle)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                fontSize: '0.86rem'
              }}
            >
              <span style={{ color: 'var(--text-secondary)' }}>Calculated Tenure:</span>
              <span style={{ fontWeight: 700, color: 'var(--accent-emerald)' }}>
                ~{estMonths} Months ({formatINR(form.monthlyPayment)} / month)
              </span>
            </div>
          )}

          <div
            style={{
              display: 'flex',
              gap: '10px',
              justifyContent: 'flex-end',
              marginTop: '22px'
            }}
          >
            <button type="button" className="btn btn-glass" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              <Save size={16} />
              <span>{initialCustomer ? 'Update Profile' : 'Save Customer'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
