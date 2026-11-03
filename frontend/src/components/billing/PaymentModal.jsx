import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import api from '../../services/api';
import { CreditCard, Banknote, Smartphone, Landmark } from 'lucide-react';

export const PaymentModal = ({ isOpen, onClose, bill, onPaymentRecorded }) => {
  if (!bill) return null;

  const [amount, setAmount] = useState(bill.balanceAmount || 0);
  const [paymentMethod, setPaymentMethod] = useState('Card');
  const [transactionReference, setTransactionReference] = useState('');
  const [remarks, setRemarks] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const methods = [
    { id: 'Card', label: 'Credit / Debit Card', icon: CreditCard },
    { id: 'UPI', label: 'UPI / QR', icon: Smartphone },
    { id: 'Cash', label: 'Cash', icon: Banknote },
    { id: 'Bank Transfer', label: 'Bank Transfer', icon: Landmark },
  ];

  const handlePayFull = () => {
    setAmount(bill.balanceAmount || 0);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (Number(amount) <= 0) {
      setError('Please specify a positive payment amount');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      const res = await api.post(`/bills/${bill._id}/payments`, {
        amount: Number(amount),
        paymentMethod,
        transactionReference,
        remarks,
      });

      if (res.data.success) {
        onPaymentRecorded(res.data.data);
        onClose();
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Error recording payment');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Record Payment"
      subtitle={`Invoice #${bill.invoiceNumber} — Guest: ${bill.customer?.name || 'Guest'}`}
      maxWidth="max-w-lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl">
            {error}
          </div>
        )}

        {/* Balance Overview Card */}
        <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 flex items-center justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Outstanding Balance
            </p>
            <h4 className="text-2xl font-extrabold text-slate-900 mt-0.5">
              ${Number(bill.balanceAmount || 0).toFixed(2)}
            </h4>
          </div>

          <button
            type="button"
            onClick={handlePayFull}
            className="text-xs font-bold text-brand-600 bg-brand-50 hover:bg-brand-100 border border-brand-200 px-3 py-1.5 rounded-xl transition-colors"
          >
            Pay Full Balance
          </button>
        </div>

        {/* Payment Amount */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
            Payment Amount ($) *
          </label>
          <input
            type="number"
            step="any"
            min="0.01"
            max={bill.balanceAmount > 0 ? bill.balanceAmount : undefined}
            required
            value={amount}
            onChange={(e) => setAmount(Number(e.target.value))}
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-base focus:ring-2 focus:ring-brand-500 font-extrabold text-slate-900"
          />
        </div>

        {/* Payment Methods */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
            Payment Method *
          </label>
          <div className="grid grid-cols-2 gap-2.5">
            {methods.map((m) => {
              const Icon = m.icon;
              const isSelected = paymentMethod === m.id;
              return (
                <button
                  type="button"
                  key={m.id}
                  onClick={() => setPaymentMethod(m.id)}
                  className={`flex items-center gap-2.5 p-3 rounded-xl border text-xs font-bold transition-all text-left ${
                    isSelected
                      ? 'border-brand-600 bg-brand-50 text-brand-700 ring-2 ring-brand-500/20'
                      : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isSelected ? 'text-brand-600' : 'text-slate-500'}`} />
                  <span>{m.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Transaction Reference & Remarks */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
              Transaction / Ref #
            </label>
            <input
              type="text"
              placeholder="e.g. TXN-89312 / UPI-903"
              value={transactionReference}
              onChange={(e) => setTransactionReference(e.target.value)}
              className="w-full px-3 py-1.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-brand-500 font-medium"
            />
          </div>
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
              Remarks / Notes
            </label>
            <input
              type="text"
              placeholder="Front desk note"
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              className="w-full px-3 py-1.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-brand-500 font-medium"
            />
          </div>
        </div>

        {/* Submit */}
        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="px-5 py-2 text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-300 rounded-xl shadow-md transition-colors"
          >
            {submitting ? 'Recording...' : `Confirm Payment of $${Number(amount || 0).toFixed(2)}`}
          </button>
        </div>
      </form>
    </Modal>
  );
};
