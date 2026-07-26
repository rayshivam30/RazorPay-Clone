import React, { useState, useEffect } from 'react';
import { X, RotateCcw, Loader2 } from 'lucide-react';
import { refundsApi, getApiErrorMessage } from '../services/api';
import type { Payment, Refund } from '../types';

interface RefundModalProps {
  payment: Payment | null;
  isOpen: boolean;
  onClose: () => void;
  onRefundCreated: (refund: Refund) => void;
}

export const RefundModal: React.FC<RefundModalProps> = ({
  payment,
  isOpen,
  onClose,
  onRefundCreated,
}) => {
  const [amountRupees, setAmountRupees] = useState('');
  const [reason, setReason] = useState('Customer requested refund');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [alreadyRefunded, setAlreadyRefunded] = useState(0);
  const [loadingExisting, setLoadingExisting] = useState(false);

  // Fetch already-processed refunds to compute remaining refundable amount
  useEffect(() => {
    if (!isOpen || !payment) return;
    setAlreadyRefunded(0);
    setAmountRupees('');
    setError(null);

    if (payment.status === 'PARTIALLY_REFUNDED') {
      setLoadingExisting(true);
      refundsApi
        .listByPayment(payment.id)
        .then((refunds) => {
          const total = refunds
            .filter((r) => r.status === 'PROCESSED')
            .reduce((sum, r) => sum + (r.amount?.amountUnits || 0), 0);
          setAlreadyRefunded(total);
        })
        .catch(() => setAlreadyRefunded(0))
        .finally(() => setLoadingExisting(false));
    }
  }, [isOpen, payment]);

  if (!isOpen || !payment) return null;

  const originalAmount = payment.amount.amountUnits;
  const maxAmount = originalAmount - alreadyRefunded;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const val = parseFloat(amountRupees || String(maxAmount));
    if (isNaN(val) || val <= 0 || val > maxAmount) {
      setError(`Amount must be between ₹1 and ₹${maxAmount}`);
      setLoading(false);
      return;
    }

    try {
      const newRefund = await refundsApi.create(payment.id, {
        paymentId: payment.id,
        amount: {
          amountUnits: Math.round(val),
          currency: 'INR',
        },
        reason,
        notes: {
          processedBy: 'Merchant Dashboard',
        },
      });

      onRefundCreated(newRefund);
      onClose();
    } catch (err: any) {
      setError(getApiErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="w-full max-w-md bg-[#121215] border border-zinc-700/80 rounded-2xl p-6 shadow-2xl text-white relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
            <RotateCcw className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-lg text-white">Initiate Refund</h3>
            <p className="text-xs text-zinc-400">Payment ID: {payment.id.slice(0, 16)}...</p>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-xs text-red-400">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-3 text-xs space-y-1">
            <div className="flex justify-between text-zinc-400">
              <span>Original Payment:</span>
              <span className="font-mono text-white">₹{originalAmount.toLocaleString()}</span>
            </div>
            {alreadyRefunded > 0 && (
              <>
                <div className="flex justify-between text-zinc-400">
                  <span>Already Refunded:</span>
                  <span className="font-mono text-red-400">-₹{alreadyRefunded.toLocaleString()}</span>
                </div>
                <div className="flex justify-between border-t border-zinc-800 pt-1 font-semibold">
                  <span className="text-zinc-300">Remaining Refundable:</span>
                  <span className="font-mono text-emerald-400">₹{maxAmount.toLocaleString()}</span>
                </div>
              </>
            )}
            <div className="flex justify-between text-zinc-400">
              <span>Method:</span>
              <span className="text-zinc-200">{payment.method}</span>
            </div>
          </div>

          <div>
            <label className="text-xs text-zinc-400 block mb-1">
              Refund Amount (INR ₹) — Max ₹{maxAmount.toLocaleString()}
            </label>
            {loadingExisting ? (
              <div className="flex items-center gap-2 text-xs text-zinc-500 py-2">
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Calculating remaining refundable amount...</span>
              </div>
            ) : (
              <input
                type="number"
                min="1"
                max={maxAmount}
                value={amountRupees}
                onChange={(e) => setAmountRupees(e.target.value)}
                placeholder={String(maxAmount)}
                className="w-full bg-zinc-900 border border-zinc-700/80 rounded-lg px-3 py-2 text-sm text-white font-mono focus:border-blue-500 focus:outline-none"
              />
            )}
            <p className="text-[10px] text-zinc-500 mt-1">Leave empty to refund the full remaining amount.</p>
          </div>

          <div>
            <label className="text-xs text-zinc-400 block mb-1">Reason for Refund</label>
            <select
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full bg-zinc-900 border border-zinc-700/80 rounded-lg px-3 py-2 text-sm text-white focus:border-blue-500 focus:outline-none"
            >
              <option value="Customer requested refund">Customer requested refund</option>
              <option value="Duplicate payment">Duplicate payment</option>
              <option value="Fraudulent transaction">Fraudulent transaction</option>
              <option value="Order cancelled">Order cancelled</option>
            </select>
          </div>

          <div className="pt-4 flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-xs font-semibold text-zinc-300"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-xs font-semibold text-white shadow-lg shadow-indigo-600/20 flex items-center justify-center gap-2"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Process Refund'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
