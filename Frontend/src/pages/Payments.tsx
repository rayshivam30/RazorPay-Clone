import React, { useEffect, useState } from 'react';
import { RefreshCw, Search, Eye, X, ChevronLeft, ChevronRight, Filter, CreditCard, Calendar, DollarSign, RotateCcw } from 'lucide-react';
import { paymentsApi, refundsApi } from '../services/api';
import type { Payment, Refund } from '../types';
import { RefundModal } from '../components/RefundModal';
import { useAuth } from '../context/AuthContext';

const ITEMS_PER_PAGE = 8;

export const Payments: React.FC = () => {
  const { apiKeyId, apiKeySecret } = useAuth();
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [methodFilter, setMethodFilter] = useState('ALL');
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const [paymentRefunds, setPaymentRefunds] = useState<Refund[]>([]);
  const [loadingRefunds, setLoadingRefunds] = useState(false);
  const [refundTarget, setRefundTarget] = useState<Payment | null>(null);
  const [page, setPage] = useState(1);

  const fetchPayments = async () => {
    setLoading(true);
    try {
      const data = await paymentsApi.list();
      setPayments(data);
    } catch (err: any) {
      if (err.message?.includes('API key required')) {
        console.error('API key required for payments operations');
        setPayments([]);
      } else {
        console.error(err);
        setPayments([]);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, []);

  const handleCapture = async (paymentId: string) => {
    try {
      await paymentsApi.capture(paymentId);
      fetchPayments();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to capture payment');
    }
  };

  const handleViewPaymentDetails = async (payment: Payment) => {
    setSelectedPayment(payment);
    setLoadingRefunds(true);
    try {
      const refunds = await refundsApi.listByPayment(payment.id);
      setPaymentRefunds(refunds);
    } catch (err) {
      console.error('Failed to fetch refunds:', err);
      setPaymentRefunds([]);
    } finally {
      setLoadingRefunds(false);
    }
  };

  const filteredPayments = payments.filter((p) => {
    const matchesSearch =
      p.id.toLowerCase().includes(search.toLowerCase()) ||
      p.orderId.toLowerCase().includes(search.toLowerCase()) ||
      p.method.toLowerCase().includes(search.toLowerCase());

    const matchesStatus = statusFilter === 'ALL' || p.status === statusFilter;
    const matchesMethod = methodFilter === 'ALL' || p.method === methodFilter;

    return matchesSearch && matchesStatus && matchesMethod;
  });

  const totalPages = Math.ceil(filteredPayments.length / ITEMS_PER_PAGE) || 1;
  const paginatedPayments = filteredPayments.slice(
    (page - 1) * ITEMS_PER_PAGE,
    page * ITEMS_PER_PAGE
  );

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-[#121215] border border-zinc-800 rounded-2xl p-6 shadow-xl">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight">Payments Lifecycle</h2>
          <p className="text-xs text-zinc-400 mt-0.5">
            Monitor, capture, and process refunds for customer payments.
          </p>
        </div>

        <button
          onClick={fetchPayments}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 text-xs font-semibold text-zinc-300 transition-colors"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh List</span>
        </button>
      </div>

      {/* Search & Filters */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="relative">
          <Search className="w-4 h-4 text-zinc-500 absolute left-4 top-3.5" />
          <input
            type="text"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="Filter by Payment ID or Order ID..."
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
            <option value="ALL">All Payment Statuses</option>
            <option value="CAPTURED">CAPTURED</option>
            <option value="SETTLED">SETTLED</option>
            <option value="AUTHORIZING">AUTHORIZING</option>
            <option value="REFUNDED">REFUNDED</option>
            <option value="PARTIALLY_REFUNDED">PARTIALLY_REFUNDED</option>
            <option value="FAILED">FAILED</option>
          </select>
          <Filter className="w-3.5 h-3.5 text-zinc-500 absolute right-4 top-3.5 pointer-events-none" />
        </div>

        <div className="relative">
          <select
            value={methodFilter}
            onChange={(e) => {
              setMethodFilter(e.target.value);
              setPage(1);
            }}
            className="w-full bg-[#121215] border border-zinc-800 rounded-xl px-4 py-3 text-xs text-white focus:border-blue-500 focus:outline-none appearance-none cursor-pointer"
          >
            <option value="ALL">All Payment Methods</option>
            <option value="CARD">CARD</option>
            <option value="UPI">UPI</option>
            <option value="NETBANKING">NETBANKING</option>
          </select>
          <Filter className="w-3.5 h-3.5 text-zinc-500 absolute right-4 top-3.5 pointer-events-none" />
        </div>
      </div>

      {/* Table */}
      <div className="bg-[#121215] border border-zinc-800 rounded-2xl overflow-hidden shadow-xl flex flex-col justify-between">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-zinc-300">
            <thead className="bg-zinc-900/80 text-zinc-400 font-semibold uppercase tracking-wider border-b border-zinc-800">
              <tr>
                <th className="py-3.5 px-4">Payment ID</th>
                <th className="py-3.5 px-4">Order ID</th>
                <th className="py-3.5 px-4">Method</th>
                <th className="py-3.5 px-4">Amount</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4">Created</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/60 font-mono">
              {!apiKeyId || !apiKeySecret ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center font-sans">
                    <div className="space-y-3">
                      <div className="text-amber-400 text-sm font-semibold">⚠️ API Key Required</div>
                      <div className="text-zinc-500 text-xs max-w-md mx-auto">
                        Payment operations require active API keys. Please set up API keys in the API Keys section to view and manage payments.
                      </div>
                    </div>
                  </td>
                </tr>
              ) : paginatedPayments.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-zinc-500 font-sans">
                    No payment records matching the selected filters.
                  </td>
                </tr>
              ) : (
                paginatedPayments.map((payment) => (
                  <tr key={payment.id} className="hover:bg-zinc-900/40 transition-colors">
                    <td className="py-3.5 px-4 font-semibold text-white">{payment.id.slice(0, 16)}...</td>
                    <td className="py-3.5 px-4 text-zinc-400">{payment.orderId.slice(0, 12)}...</td>
                    <td className="py-3.5 px-4 font-sans text-zinc-300">{payment.method}</td>
                    <td className="py-3.5 px-4 text-emerald-400 font-bold">
                      ₹{payment.amount?.amountUnits?.toLocaleString()}
                    </td>
                    <td className="py-3.5 px-4 font-sans">
                      <span
                        className={`px-2.5 py-1 rounded-md text-[10px] font-bold ${
                          payment.status === 'SETTLED'
                            ? 'badge-settled'
                            : payment.status === 'CAPTURED'
                            ? 'badge-captured'
                            : payment.status === 'AUTHORIZING'
                            ? 'badge-authorizing'
                            : payment.status === 'REFUNDED'
                            ? 'badge-refunded'
                            : payment.status === 'PARTIALLY_REFUNDED'
                            ? 'badge-partially-refunded'
                            : 'badge-failed'
                        }`}
                      >
                        {payment.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-zinc-500 font-sans">
                      {new Date(payment.createdAt || Date.now()).toLocaleTimeString()}
                    </td>
                    <td className="py-3.5 px-4 text-right font-sans space-x-2">
                      <button
                        onClick={() => handleViewPaymentDetails(payment)}
                        className="p-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300"
                        title="View Details"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>

                      {payment.status === 'AUTHORIZING' && (
                        <button
                          onClick={() => handleCapture(payment.id)}
                          className="px-2.5 py-1 rounded-lg bg-emerald-600/20 hover:bg-emerald-600/40 text-emerald-400 border border-emerald-500/30 text-xs font-semibold"
                        >
                          Capture
                        </button>
                      )}

                      {(payment.status === 'CAPTURED' || payment.status === 'SETTLED' || payment.status === 'PARTIALLY_REFUNDED') && (
                        <button
                          onClick={() => setRefundTarget(payment)}
                          className="px-2.5 py-1 rounded-lg bg-indigo-600/20 hover:bg-indigo-600/40 text-indigo-400 border border-indigo-500/30 text-xs font-semibold"
                        >
                          Refund
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        {filteredPayments.length > 0 && (
          <div className="flex items-center justify-between p-4 border-t border-zinc-800 text-xs text-zinc-400 font-sans">
            <span>
              Page <strong className="text-white">{page}</strong> of{' '}
              <strong className="text-white">{totalPages}</strong> ({filteredPayments.length} matching payments)
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

      {/* Enhanced Payment Details Modal */}
      {selectedPayment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-2xl bg-[#121215] border border-zinc-700 rounded-2xl p-6 text-white relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setSelectedPayment(null)}
              className="absolute top-4 right-4 p-1 text-zinc-400 hover:text-white rounded-lg z-10"
            >
              <X className="w-4 h-4" />
            </button>
            
            <h3 className="font-bold text-lg text-white mb-1">Payment Lifecycle Details</h3>
            <p className="text-xs text-blue-400 font-mono mb-6">{selectedPayment.id}</p>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Payment Overview */}
              <div className="space-y-4">
                <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 space-y-3">
                  <div className="flex items-center gap-2 border-b border-zinc-800 pb-2">
                    <CreditCard className="w-4 h-4 text-blue-400" />
                    <h4 className="font-semibold text-sm text-white">Payment Overview</h4>
                  </div>
                  
                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between">
                      <span className="text-zinc-400">Payment Amount:</span>
                      <span className="font-mono text-emerald-400 font-bold">₹{selectedPayment.amount?.amountUnits?.toLocaleString()}</span>
                    </div>
                    
                    <div className="flex justify-between">
                      <span className="text-zinc-400">Order ID:</span>
                      <span className="font-mono text-zinc-300">{selectedPayment.orderId}</span>
                    </div>
                    
                    <div className="flex justify-between">
                      <span className="text-zinc-400">Payment Method:</span>
                      <span className="text-zinc-300">{selectedPayment.method}</span>
                    </div>
                    
                    <div className="flex justify-between">
                      <span className="text-zinc-400">Status:</span>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        selectedPayment.status === 'SETTLED' ? 'badge-settled' :
                        selectedPayment.status === 'CAPTURED' ? 'badge-captured' :
                        selectedPayment.status === 'PARTIALLY_REFUNDED' ? 'badge-partially-refunded' :
                        selectedPayment.status === 'REFUNDED' ? 'badge-refunded' : 'badge-failed'
                      }`}>
                        {selectedPayment.status}
                      </span>
                    </div>
                    
                    <div className="flex justify-between">
                      <span className="text-zinc-400">Bank Reference:</span>
                      <span className="font-mono text-zinc-300 text-[10px]">{selectedPayment.bankReference || 'N/A'}</span>
                    </div>
                  </div>
                </div>

                {/* Timeline */}
                <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 space-y-3">
                  <div className="flex items-center gap-2 border-b border-zinc-800 pb-2">
                    <Calendar className="w-4 h-4 text-green-400" />
                    <h4 className="font-semibold text-sm text-white">Payment Timeline</h4>
                  </div>
                  
                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between">
                      <span className="text-zinc-400">Created At:</span>
                      <span className="font-mono text-zinc-300">{new Date(selectedPayment.createdAt || Date.now()).toLocaleString()}</span>
                    </div>
                    
                    {selectedPayment.capturedAt && (
                      <div className="flex justify-between">
                        <span className="text-zinc-400">Captured At:</span>
                        <span className="font-mono text-emerald-400">{new Date(selectedPayment.capturedAt).toLocaleString()}</span>
                      </div>
                    )}
                    
                    {selectedPayment.refundedAt && (
                      <div className="flex justify-between">
                        <span className="text-zinc-400">First Refund At:</span>
                        <span className="font-mono text-red-400">{new Date(selectedPayment.refundedAt).toLocaleString()}</span>
                      </div>
                    )}
                    
                    {selectedPayment.settledAt && (
                      <div className="flex justify-between">
                        <span className="text-zinc-400">Settled At:</span>
                        <span className="font-mono text-green-400">{new Date(selectedPayment.settledAt).toLocaleString()}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Refund Information */}
              <div className="space-y-4">
                <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 space-y-3">
                  <div className="flex items-center gap-2 border-b border-zinc-800 pb-2">
                    <RotateCcw className="w-4 h-4 text-purple-400" />
                    <h4 className="font-semibold text-sm text-white">Refund Summary</h4>
                  </div>
                  
                  {loadingRefunds ? (
                    <div className="text-center py-4">
                      <RefreshCw className="w-4 h-4 animate-spin text-zinc-500 mx-auto" />
                      <p className="text-xs text-zinc-500 mt-2">Loading refunds...</p>
                    </div>
                  ) : paymentRefunds.length === 0 ? (
                    <div className="text-center py-4">
                      <p className="text-xs text-zinc-500">No refunds processed for this payment</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {/* Refund Summary */}
                      <div className="bg-zinc-800 rounded-lg p-3 space-y-2">
                        <div className="flex justify-between text-xs">
                          <span className="text-zinc-400">Total Refunded:</span>
                          <span className="font-mono text-red-400 font-bold">
                            -₹{paymentRefunds.reduce((sum, r) => sum + (r.amount?.amountUnits || 0), 0).toLocaleString()}
                          </span>
                        </div>
                        
                        <div className="flex justify-between text-xs">
                          <span className="text-zinc-400">Remaining Amount:</span>
                          <span className="font-mono text-emerald-400 font-bold">
                            ₹{((selectedPayment.amount?.amountUnits || 0) - paymentRefunds.reduce((sum, r) => sum + (r.amount?.amountUnits || 0), 0)).toLocaleString()}
                          </span>
                        </div>
                      </div>

                      {/* Individual Refunds */}
                      <div className="space-y-1 max-h-40 overflow-y-auto">
                        {paymentRefunds.map((refund, index) => (
                          <div key={refund.id} className="flex justify-between items-center p-2 bg-zinc-800/50 rounded text-xs">
                            <div>
                              <div className="font-mono text-white">Refund #{index + 1}</div>
                              <div className="text-zinc-500 text-[10px]">{new Date(refund.createdAt || Date.now()).toLocaleString()}</div>
                            </div>
                            <div className="text-right">
                              <div className="font-mono text-red-400 font-bold">-₹{refund.amount?.amountUnits?.toLocaleString()}</div>
                              <div className="text-zinc-500 text-[10px]">{refund.reason || 'No reason'}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Financial Summary */}
                <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 space-y-3">
                  <div className="flex items-center gap-2 border-b border-zinc-800 pb-2">
                    <DollarSign className="w-4 h-4 text-yellow-400" />
                    <h4 className="font-semibold text-sm text-white">Financial Summary</h4>
                  </div>
                  
                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between">
                      <span className="text-zinc-400">Original Amount:</span>
                      <span className="font-mono text-zinc-300">₹{selectedPayment.amount?.amountUnits?.toLocaleString()}</span>
                    </div>
                    
                    <div className="flex justify-between">
                      <span className="text-zinc-400">Total Refunds:</span>
                      <span className="font-mono text-red-400">
                        -₹{paymentRefunds.reduce((sum, r) => sum + (r.amount?.amountUnits || 0), 0).toLocaleString()}
                      </span>
                    </div>
                    
                    <div className="border-t border-zinc-800 pt-2">
                      <div className="flex justify-between font-bold">
                        <span className="text-white">Net Amount:</span>
                        <span className="font-mono text-emerald-400">
                          ₹{((selectedPayment.amount?.amountUnits || 0) - paymentRefunds.reduce((sum, r) => sum + (r.amount?.amountUnits || 0), 0)).toLocaleString()}
                        </span>
                      </div>
                      
                      {selectedPayment.status === 'SETTLED' && (
                        <div className="text-green-400 text-[10px] mt-1">
                          ✓ This amount has been settled to your account
                        </div>
                      )}
                      
                      {selectedPayment.status === 'PARTIALLY_REFUNDED' && (
                        <div className="text-purple-400 text-[10px] mt-1">
                          ⚡ Available for additional refunds or settlement
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Method Details */}
            {selectedPayment.methodDetails && (
              <div className="mt-6 bg-zinc-900 border border-zinc-800 rounded-xl p-4 space-y-2">
                <h4 className="font-semibold text-sm text-white border-b border-zinc-800 pb-2">Payment Method Details</h4>
                <pre className="text-[11px] text-zinc-300 bg-zinc-950 p-3 rounded-lg overflow-x-auto border border-zinc-800">
                  {JSON.stringify(selectedPayment.methodDetails, null, 2)}
                </pre>
              </div>
            )}
          </div>
        </div>
      )}

      <RefundModal
        payment={refundTarget}
        isOpen={!!refundTarget}
        onClose={() => setRefundTarget(null)}
        onRefundCreated={() => fetchPayments()}
      />
    </div>
  );
};
