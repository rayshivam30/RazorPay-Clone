import React, { useEffect, useState } from 'react';
import { RotateCcw, RefreshCw, Search, Eye, Plus, DollarSign, X, CheckCircle2, Filter, ChevronLeft, ChevronRight } from 'lucide-react';
import { refundsApi, getApiErrorMessage } from '../services/api';
import type { Refund } from '../types';
import { useAuth } from '../context/AuthContext';

const ITEMS_PER_PAGE = 8;

export const Refunds: React.FC = () => {
  const { apiKeyId, apiKeySecret } = useAuth();
  const [refunds, setRefunds] = useState<Refund[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [selectedRefund, setSelectedRefund] = useState<Refund | null>(null);
  const [page, setPage] = useState(1);

  // Manual Refund Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [inputPaymentId, setInputPaymentId] = useState('');
  const [refundAmount, setRefundAmount] = useState('');
  const [refundReason, setRefundReason] = useState('Customer requested refund');
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchRefunds = async () => {
    setLoading(true);
    try {
      const data = await refundsApi.listAll();
      setRefunds(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRefunds();
  }, []);

  const handleManualRefund = async (e: React.FormEvent) => {
    e.preventDefault();
    setProcessing(true);
    setError(null);

    const val = parseFloat(refundAmount);
    if (!inputPaymentId.trim()) {
      setError('Payment ID is required');
      setProcessing(false);
      return;
    }
    if (isNaN(val) || val <= 0) {
      setError('Please enter a valid refund amount');
      setProcessing(false);
      return;
    }

    try {
      const newRefund = await refundsApi.create(inputPaymentId.trim(), {
        paymentId: inputPaymentId.trim(),
        amount: {
          amountUnits: Math.round(val),
          currency: 'INR',
        },
        reason: refundReason,
        notes: { channel: 'Refunds Manager' },
      });

      setRefunds((prev) => [newRefund, ...prev]);
      setIsModalOpen(false);
      setInputPaymentId('');
      setRefundAmount('');
    } catch (err: any) {
      setError(getApiErrorMessage(err));
    } finally {
      setProcessing(false);
    }
  };

  // Metrics
  const totalRefundedUnits = refunds.reduce((acc, r) => acc + (r.amount?.amountUnits || 0), 0);
  const avgRefundUnits = refunds.length > 0 ? Math.round(totalRefundedUnits / refunds.length) : 0;

  const filteredRefunds = refunds.filter((r) => {
    const matchesSearch =
      r.id.toLowerCase().includes(search.toLowerCase()) ||
      r.paymentId.toLowerCase().includes(search.toLowerCase()) ||
      (r.reason && r.reason.toLowerCase().includes(search.toLowerCase()));

    const matchesStatus = statusFilter === 'ALL' || (r.status || 'PROCESSED') === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const totalPages = Math.ceil(filteredRefunds.length / ITEMS_PER_PAGE) || 1;
  const paginatedRefunds = filteredRefunds.slice(
    (page - 1) * ITEMS_PER_PAGE,
    page * ITEMS_PER_PAGE
  );

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-[#121215] border border-zinc-800 rounded-2xl p-6 shadow-xl">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight">Refunds Management & Audit</h2>
          <p className="text-xs text-zinc-400 mt-0.5">
            Process direct customer refunds, track chargeback reconciliations, and audit refund history.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchRefunds}
            className="p-2.5 rounded-xl bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-lg shadow-indigo-600/30 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Issue Direct Refund</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-[#121215] border border-zinc-800 rounded-2xl p-5 shadow-lg">
          <div className="flex justify-between items-start mb-2">
            <span className="text-xs font-medium text-zinc-400 uppercase tracking-wider">Total Refund Volume</span>
            <div className="p-2 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
              <RotateCcw className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-white">
            ₹{totalRefundedUnits.toLocaleString('en-IN')}
          </div>
          <p className="text-[11px] text-zinc-500 mt-1">Gross funds returned to customers</p>
        </div>

        <div className="bg-[#121215] border border-zinc-800 rounded-2xl p-5 shadow-lg">
          <div className="flex justify-between items-start mb-2">
            <span className="text-xs font-medium text-zinc-400 uppercase tracking-wider">Total Refunds Count</span>
            <div className="p-2 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-white">
            {refunds.length}
          </div>
          <p className="text-[11px] text-zinc-500 mt-1">Full & partial refund requests</p>
        </div>

        <div className="bg-[#121215] border border-zinc-800 rounded-2xl p-5 shadow-lg">
          <div className="flex justify-between items-start mb-2">
            <span className="text-xs font-medium text-zinc-400 uppercase tracking-wider">Average Refund Size</span>
            <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-white">
            ₹{avgRefundUnits.toLocaleString('en-IN')}
          </div>
          <p className="text-[11px] text-zinc-500 mt-1">Average per-refund ticket size</p>
        </div>
      </div>

      {/* Search & Status Filter */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="relative">
          <Search className="w-4 h-4 text-zinc-500 absolute left-4 top-3.5" />
          <input
            type="text"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="Search by Refund ID, Payment ID or Reason..."
            className="w-full bg-[#121215] border border-zinc-800 rounded-xl pl-11 pr-4 py-3 text-xs text-white focus:border-blue-500 focus:outline-none"
          />
        </div>

        <div className="relative">
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
            className="w-full bg-[#121215] border border-zinc-800 rounded-xl px-4 py-3 text-xs text-white focus:border-blue-500 focus:outline-none appearance-none cursor-pointer"
          >
            <option value="ALL">All Refund Statuses</option>
            <option value="PROCESSED">PROCESSED</option>
            <option value="PENDING">PENDING</option>
            <option value="FAILED">FAILED</option>
          </select>
          <Filter className="w-3.5 h-3.5 text-zinc-500 absolute right-4 top-3.5 pointer-events-none" />
        </div>
      </div>

      {/* Refunds Table */}
      <div className="bg-[#121215] border border-zinc-800 rounded-2xl overflow-hidden shadow-xl flex flex-col justify-between">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-zinc-300">
            <thead className="bg-zinc-900/80 text-zinc-400 font-semibold uppercase tracking-wider border-b border-zinc-800">
              <tr>
                <th className="py-3.5 px-4">Refund ID</th>
                <th className="py-3.5 px-4">Payment ID</th>
                <th className="py-3.5 px-4">Amount</th>
                <th className="py-3.5 px-4">Reason</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4">Created</th>
                <th className="py-3.5 px-4 text-right">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/60 font-mono">
              {!apiKeyId || !apiKeySecret ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center font-sans">
                    <div className="space-y-3">
                      <div className="text-amber-400 text-sm font-semibold">⚠️ API Key Required</div>
                      <div className="text-zinc-500 text-xs max-w-md mx-auto">
                        Refund operations require active API keys. Please set up API keys in the API Keys section to view and manage refunds.
                      </div>
                    </div>
                  </td>
                </tr>
              ) : paginatedRefunds.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-zinc-500 font-sans">
                    No refunds found matching the selected filters.
                  </td>
                </tr>
              ) : (
                paginatedRefunds.map((refund) => (
                  <tr key={refund.id} className="hover:bg-zinc-900/40 transition-colors">
                    <td className="py-3.5 px-4 font-semibold text-white">{refund.id.slice(0, 16)}...</td>
                    <td className="py-3.5 px-4 text-zinc-400">{refund.paymentId.slice(0, 16)}...</td>
                    <td className="py-3.5 px-4 text-indigo-400 font-bold">
                      ₹{refund.amount?.amountUnits?.toLocaleString()}
                    </td>
                    <td className="py-3.5 px-4 font-sans text-zinc-300">{refund.reason || 'N/A'}</td>
                    <td className="py-3.5 px-4 font-sans">
                      <span className="badge-refunded px-2.5 py-1 rounded-md text-[10px] font-bold">
                        {refund.status || 'PROCESSED'}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-zinc-500 font-sans">
                      {new Date(refund.createdAt || Date.now()).toLocaleString()}
                    </td>
                    <td className="py-3.5 px-4 text-right font-sans">
                      <button
                        onClick={() => setSelectedRefund(refund)}
                        className="p-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300"
                        title="View Details"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        {filteredRefunds.length > 0 && (
          <div className="flex items-center justify-between p-4 border-t border-zinc-800 text-xs text-zinc-400 font-sans">
            <span>
              Page <strong className="text-white">{page}</strong> of{' '}
              <strong className="text-white">{totalPages}</strong> ({filteredRefunds.length} total refunds)
            </span>
            <div className="flex items-center gap-2">
              <button
                disabled={page === 1}
                onClick={() => setPage((p) => Math.max(p - 1, 1))}
                className="px-3 py-1.5 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-300 hover:bg-zinc-800 disabled:opacity-30 disabled:cursor-not-allowed flex items-center gap-1"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Previous</span>
              </button>
              <button
                disabled={page >= totalPages}
                onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
                className="px-3 py-1.5 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-300 hover:bg-zinc-800 disabled:opacity-30 disabled:cursor-not-allowed flex items-center gap-1"
              >
                <span>Next</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Refund Details Modal Drawer */}
      {selectedRefund && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-lg bg-[#121215] border border-zinc-700 rounded-2xl p-6 text-white relative space-y-4">
            <button
              onClick={() => setSelectedRefund(null)}
              className="absolute top-4 right-4 p-1 text-zinc-400 hover:text-white rounded-lg"
            >
              <X className="w-4 h-4" />
            </button>
            <h3 className="font-bold text-lg text-white">Refund Audit Inspector</h3>

            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 font-mono text-xs space-y-2">
              <div className="flex justify-between"><span className="text-zinc-500">Refund ID:</span><span>{selectedRefund.id}</span></div>
              <div className="flex justify-between"><span className="text-zinc-500">Payment ID:</span><span>{selectedRefund.paymentId}</span></div>
              <div className="flex justify-between"><span className="text-zinc-500">Amount:</span><span className="text-indigo-400 font-bold">₹{selectedRefund.amount?.amountUnits}</span></div>
              <div className="flex justify-between"><span className="text-zinc-500">Status:</span><span className="text-emerald-400 font-bold">{selectedRefund.status || 'PROCESSED'}</span></div>
              <div className="flex justify-between"><span className="text-zinc-500">Reason:</span><span className="font-sans text-zinc-300">{selectedRefund.reason || 'N/A'}</span></div>
              <div className="flex justify-between"><span className="text-zinc-500">Processed At:</span><span className="font-sans text-zinc-300">{new Date(selectedRefund.createdAt || Date.now()).toLocaleString()}</span></div>
            </div>
          </div>
        </div>
      )}

      {/* Issue Direct Refund Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-md bg-[#121215] border border-zinc-700 rounded-2xl p-6 text-white relative">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 p-1 text-zinc-400 hover:text-white rounded-lg"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
                <RotateCcw className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-lg text-white">Issue Direct Refund</h3>
                <p className="text-xs text-zinc-400">Refund a payment using its Payment ID</p>
              </div>
            </div>

            {error && (
              <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-xs text-red-400 font-mono">
                {error}
              </div>
            )}

            <form onSubmit={handleManualRefund} className="space-y-4">
              <div>
                <label className="text-xs text-zinc-400 block mb-1">Payment ID (UUID)</label>
                <input
                  type="text"
                  value={inputPaymentId}
                  onChange={(e) => setInputPaymentId(e.target.value)}
                  placeholder="e.g. 550e8400-e29b-41d4-a716-446655440000"
                  className="w-full bg-zinc-900 border border-zinc-700/80 rounded-lg px-3 py-2 text-sm text-white font-mono focus:border-blue-500 focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="text-xs text-zinc-400 block mb-1">Refund Amount (INR ₹)</label>
                <input
                  type="number"
                  min="1"
                  value={refundAmount}
                  onChange={(e) => setRefundAmount(e.target.value)}
                  placeholder="1500"
                  className="w-full bg-zinc-900 border border-zinc-700/80 rounded-lg px-3 py-2 text-sm text-white font-mono focus:border-blue-500 focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="text-xs text-zinc-400 block mb-1">Reason for Refund</label>
                <select
                  value={refundReason}
                  onChange={(e) => setRefundReason(e.target.value)}
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
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-xs font-semibold text-zinc-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={processing}
                  className="flex-1 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-xs font-semibold text-white shadow-lg shadow-indigo-600/20"
                >
                  {processing ? 'Processing...' : 'Process Refund'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
