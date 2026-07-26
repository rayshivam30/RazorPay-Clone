import React, { useEffect, useState } from 'react';
import { Activity, Play, RefreshCw, Layers, CheckCircle2, Eye, X, ChevronLeft, ChevronRight, Filter, ArrowUpDown } from 'lucide-react';
import { operationsApi } from '../services/api';
import type { WebhookEvent, Settlement } from '../types';

const ITEMS_PER_PAGE = 5;

export const Operations: React.FC = () => {
  const [webhooks, setWebhooks] = useState<WebhookEvent[]>([]);
  const [settlements, setSettlements] = useState<Settlement[]>([]);
  const [loading, setLoading] = useState(true);
  const [triggering, setTriggering] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [selectedWebhook, setSelectedWebhook] = useState<WebhookEvent | null>(null);
  const [selectedSettlement, setSelectedSettlement] = useState<Settlement | null>(null);

  // Settlement Sorting & Pagination
  const [settlementSort, setSettlementSort] = useState('LATEST_FIRST');
  const [settlementPage, setSettlementPage] = useState(1);

  // Webhook Filters & Pagination
  const [webhookStatusFilter, setWebhookStatusFilter] = useState('ALL');
  const [webhookPage, setWebhookPage] = useState(1);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [wRes, sRes] = await Promise.all([
        operationsApi.getWebhooks().catch(() => []),
        operationsApi.getSettlements().catch(() => []),
      ]);
      setWebhooks(wRes);
      setSettlements(sRes);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleTriggerSettlements = async () => {
    setTriggering(true);
    setMessage(null);
    try {
      const res = await operationsApi.triggerSettlement();
      setMessage(res || 'Daily settlements processing triggered successfully!');
      fetchData();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Trigger failed');
    } finally {
      setTriggering(false);
    }
  };

  // Settlement Sorting
  const sortedSettlements = [...settlements].sort((a, b) => {
    const dateA = new Date(a.processedAt || a.createdAt || Date.now()).getTime();
    const dateB = new Date(b.processedAt || b.createdAt || Date.now()).getTime();
    const amountA = a.netAmount?.amountUnits || a.grossAmount?.amountUnits || 0;
    const amountB = b.netAmount?.amountUnits || b.grossAmount?.amountUnits || 0;

    if (settlementSort === 'LATEST_FIRST') return dateB - dateA;
    if (settlementSort === 'EARLIEST_FIRST') return dateA - dateB;
    if (settlementSort === 'HIGHEST_AMOUNT') return amountB - amountA;
    if (settlementSort === 'LOWEST_AMOUNT') return amountA - amountB;
    return dateB - dateA;
  });

  const totalSettlementPages = Math.ceil(sortedSettlements.length / ITEMS_PER_PAGE) || 1;
  const paginatedSettlements = sortedSettlements.slice(
    (settlementPage - 1) * ITEMS_PER_PAGE,
    settlementPage * ITEMS_PER_PAGE
  );

  // Webhook Filtering
  const filteredWebhooks = webhooks.filter((w) => {
    return webhookStatusFilter === 'ALL' || w.status === webhookStatusFilter;
  });
  const totalWebhookPages = Math.ceil(filteredWebhooks.length / ITEMS_PER_PAGE) || 1;
  const paginatedWebhooks = filteredWebhooks.slice(
    (webhookPage - 1) * ITEMS_PER_PAGE,
    webhookPage * ITEMS_PER_PAGE
  );

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-[#121215] border border-zinc-800 rounded-2xl p-6 shadow-xl">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight">Operations & Settlements</h2>
          <p className="text-xs text-zinc-400 mt-0.5">
            Monitor merchant daily settlements and webhook event dispatches.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchData}
            className="p-2.5 rounded-xl bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={handleTriggerSettlements}
            disabled={triggering}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-lg shadow-emerald-600/30 transition-all disabled:opacity-50"
          >
            <Play className="w-4 h-4" />
            <span>{triggering ? 'Processing...' : 'Run Settlement Job'}</span>
          </button>
        </div>
      </div>

      {message && (
        <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl text-emerald-400 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4" />
          <span>{message}</span>
        </div>
      )}

      {/* Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Settlements Table */}
        <div className="bg-[#121215] border border-zinc-800 rounded-2xl p-6 shadow-xl space-y-4 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Layers className="w-5 h-5 text-emerald-400" />
                <h3 className="font-bold text-white text-base">Settlements</h3>
              </div>

              {/* Settlement Order Sort Filter */}
              <div className="relative">
                <select
                  value={settlementSort}
                  onChange={(e) => {
                    setSettlementSort(e.target.value);
                    setSettlementPage(1);
                  }}
                  className="bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-1.5 text-xs text-zinc-300 focus:outline-none appearance-none cursor-pointer pr-7"
                >
                  <option value="LATEST_FIRST">Latest First</option>
                  <option value="EARLIEST_FIRST">Earliest First</option>
                  <option value="HIGHEST_AMOUNT">Highest Payout</option>
                  <option value="LOWEST_AMOUNT">Lowest Payout</option>
                </select>
                <ArrowUpDown className="w-3 h-3 text-zinc-500 absolute right-2.5 top-2.5 pointer-events-none" />
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-zinc-300">
                <thead className="bg-zinc-900/80 text-zinc-400 font-semibold uppercase tracking-wider border-b border-zinc-800">
                  <tr>
                    <th className="py-3 px-3">Settlement ID</th>
                    <th className="py-3 px-3">Gross</th>
                    <th className="py-3 px-3">Refunds</th>
                    <th className="py-3 px-3">Net Settled</th>
                    <th className="py-3 px-3">Status</th>
                    <th className="py-3 px-3">Date</th>
                    <th className="py-3 px-3 text-right">Details</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/60 font-mono">
                  {paginatedSettlements.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-8 text-center text-zinc-500 font-sans">
                        No settlements generated yet. Click "Run Settlement Job" to process.
                      </td>
                    </tr>
                  ) : (
                    paginatedSettlements.map((s) => (
                      <tr key={s.id} className="hover:bg-zinc-900/40">
                        <td className="py-3 px-3 font-semibold text-white">{s.id.slice(0, 12)}...</td>
                        <td className="py-3 px-3 text-zinc-300 font-bold">
                          ₹{(s.grossAmount?.amountUnits || 0).toLocaleString()}
                        </td>
                        <td className="py-3 px-3 text-red-400 font-bold">
                          {(s.refundAmount?.amountUnits || 0) > 0 ? (
                            <>-₹{(s.refundAmount?.amountUnits || 0).toLocaleString()}</>
                          ) : (
                            <span className="text-zinc-500">₹0</span>
                          )}
                        </td>
                        <td className="py-3 px-3 text-emerald-400 font-bold">
                          ₹{(s.netAmount?.amountUnits || 0).toLocaleString()}
                        </td>
                        <td className="py-3 px-3 font-sans">
                          <span className="badge-settled px-2 py-0.5 rounded text-[10px] font-bold">
                            {s.status}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-zinc-500 font-sans text-[11px]">
                          {new Date(s.processedAt || s.createdAt || Date.now()).toLocaleDateString()}
                        </td>
                        <td className="py-3 px-3 text-right font-sans">
                          <button
                            onClick={() => setSelectedSettlement(s)}
                            className="p-1 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-300"
                            title="View Settlement Details"
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
          </div>

          {/* Settlements Pagination Controls */}
          {sortedSettlements.length > 0 && (
            <div className="flex items-center justify-between pt-3 border-t border-zinc-800 text-xs text-zinc-400 font-sans">
              <span>
                Page <strong className="text-white">{settlementPage}</strong> of{' '}
                <strong className="text-white">{totalSettlementPages}</strong> ({sortedSettlements.length} settlements)
              </span>
              <div className="flex items-center gap-1.5">
                <button
                  disabled={settlementPage === 1}
                  onClick={() => setSettlementPage((p) => Math.max(p - 1, 1))}
                  className="p-1.5 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-300 hover:bg-zinc-800 disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  disabled={settlementPage >= totalSettlementPages}
                  onClick={() => setSettlementPage((p) => Math.min(p + 1, totalSettlementPages))}
                  className="p-1.5 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-300 hover:bg-zinc-800 disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Webhooks Table */}
        <div className="bg-[#121215] border border-zinc-800 rounded-2xl p-6 shadow-xl space-y-4 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Activity className="w-5 h-5 text-blue-400" />
                <h3 className="font-bold text-white text-base">Webhook Dispatch Log</h3>
              </div>

              {/* Webhook Status Filter */}
              <div className="flex items-center gap-2">
                <div className="relative">
                  <select
                    value={webhookStatusFilter}
                    onChange={(e) => {
                      setWebhookStatusFilter(e.target.value);
                      setWebhookPage(1);
                    }}
                    className="bg-zinc-900 border border-zinc-800 rounded-lg px-2.5 py-1.5 text-xs text-zinc-300 focus:outline-none appearance-none cursor-pointer pr-6"
                  >
                    <option value="ALL">All Statuses</option>
                    <option value="DELIVERED">DELIVERED</option>
                    <option value="PENDING">PENDING</option>
                    <option value="FAILED">FAILED</option>
                    <option value="DEAD">DEAD</option>
                  </select>
                  <Filter className="w-3 h-3 text-zinc-500 absolute right-2 top-2.5 pointer-events-none" />
                </div>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-zinc-300">
                <thead className="bg-zinc-900/80 text-zinc-400 font-semibold uppercase tracking-wider border-b border-zinc-800">
                  <tr>
                    <th className="py-3 px-3">Event Type</th>
                    <th className="py-3 px-3">Status</th>
                    <th className="py-3 px-3">Time</th>
                    <th className="py-3 px-3 text-right">View</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/60 font-mono">
                  {paginatedWebhooks.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="py-8 text-center text-zinc-500 font-sans">
                        No webhook events matching the selected filters.
                      </td>
                    </tr>
                  ) : (
                    paginatedWebhooks.map((w) => (
                      <tr key={w.id} className="hover:bg-zinc-900/40">
                        <td className="py-3 px-3 font-semibold text-blue-400">{w.eventType}</td>
                        <td className="py-3 px-3 font-sans">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              w.status === 'DELIVERED'
                                ? 'badge-captured'
                                : w.status === 'FAILED' || w.status === 'DEAD'
                                ? 'badge-failed'
                                : 'badge-created'
                            }`}
                          >
                            {w.status}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-zinc-500 font-sans">
                          {new Date(w.createdAt || Date.now()).toLocaleTimeString()}
                        </td>
                        <td className="py-3 px-3 text-right font-sans">
                          <button
                            onClick={() => setSelectedWebhook(w)}
                            className="p-1 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-300"
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
          </div>

          {/* Webhooks Pagination Controls */}
          {filteredWebhooks.length > 0 && (
            <div className="flex items-center justify-between pt-3 border-t border-zinc-800 text-xs text-zinc-400 font-sans">
              <span>
                Page <strong className="text-white">{webhookPage}</strong> of{' '}
                <strong className="text-white">{totalWebhookPages}</strong>
              </span>
              <div className="flex items-center gap-1.5">
                <button
                  disabled={webhookPage === 1}
                  onClick={() => setWebhookPage((p) => Math.max(p - 1, 1))}
                  className="p-1.5 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-300 hover:bg-zinc-800 disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  disabled={webhookPage >= totalWebhookPages}
                  onClick={() => setWebhookPage((p) => Math.min(p + 1, totalWebhookPages))}
                  className="p-1.5 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-300 hover:bg-zinc-800 disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Settlement Details Modal */}
      {selectedSettlement && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-lg bg-[#121215] border border-zinc-700 rounded-2xl p-6 text-white relative">
            <button
              onClick={() => setSelectedSettlement(null)}
              className="absolute top-4 right-4 p-1 text-zinc-400 hover:text-white rounded-lg"
            >
              <X className="w-4 h-4" />
            </button>
            <h3 className="font-bold text-lg text-white mb-1">Settlement Breakdown</h3>
            <p className="text-xs text-emerald-400 font-mono mb-4">{selectedSettlement.id}</p>

            <div className="space-y-4">
              {/* Settlement Summary */}
              <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 space-y-3">
                <h4 className="font-semibold text-sm text-white border-b border-zinc-800 pb-2">Payment Summary</h4>
                
                <div className="flex justify-between text-xs">
                  <span className="text-zinc-400">Gross Payments:</span>
                  <span className="font-mono text-white">₹{(selectedSettlement.grossAmount?.amountUnits || 0).toLocaleString()}</span>
                </div>
                
                <div className="flex justify-between text-xs">
                  <span className="text-zinc-400">Total Refunds:</span>
                  <span className="font-mono text-red-400">-₹{(selectedSettlement.refundAmount?.amountUnits || 0).toLocaleString()}</span>
                </div>
                
                <div className="border-t border-zinc-800 pt-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-zinc-400">Net Revenue:</span>
                    <span className="font-mono text-zinc-300">₹{((selectedSettlement.grossAmount?.amountUnits || 0) - (selectedSettlement.refundAmount?.amountUnits || 0)).toLocaleString()}</span>
                  </div>
                </div>
              </div>

              {/* Fee Breakdown */}
              <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 space-y-3">
                <h4 className="font-semibold text-sm text-white border-b border-zinc-800 pb-2">Fee Deductions</h4>
                
                <div className="flex justify-between text-xs">
                  <span className="text-zinc-400">Gateway Fee (2%):</span>
                  <span className="font-mono text-yellow-400">-₹{(selectedSettlement.feeAmount?.amountUnits || 0).toLocaleString()}</span>
                </div>
                
                <div className="flex justify-between text-xs">
                  <span className="text-zinc-400">GST on Fee (18%):</span>
                  <span className="font-mono text-yellow-400">-₹{(selectedSettlement.gstAmount?.amountUnits || 0).toLocaleString()}</span>
                </div>
                
                <div className="border-t border-zinc-800 pt-2">
                  <div className="flex justify-between text-sm font-bold">
                    <span className="text-white">Net Settlement:</span>
                    <span className="font-mono text-emerald-400">₹{(selectedSettlement.netAmount?.amountUnits || 0).toLocaleString()}</span>
                  </div>
                </div>
              </div>

              {/* Settlement Info */}
              <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 space-y-2">
                <h4 className="font-semibold text-sm text-white border-b border-zinc-800 pb-2">Settlement Details</h4>
                
                <div className="flex justify-between text-xs">
                  <span className="text-zinc-400">Bank Reference:</span>
                  <span className="font-mono text-zinc-300">{selectedSettlement.bankReference || 'SETTL_AUTO_GEN'}</span>
                </div>
                
                <div className="flex justify-between text-xs">
                  <span className="text-zinc-400">Status:</span>
                  <span className="badge-settled px-2 py-0.5 rounded text-[10px] font-bold">{selectedSettlement.status}</span>
                </div>
                
                <div className="flex justify-between text-xs">
                  <span className="text-zinc-400">Processed At:</span>
                  <span className="font-mono text-zinc-300">{new Date(selectedSettlement.processedAt || selectedSettlement.createdAt || Date.now()).toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Webhook Details Modal */}
      {selectedWebhook && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-lg bg-[#121215] border border-zinc-700 rounded-2xl p-6 text-white relative">
            <button
              onClick={() => setSelectedWebhook(null)}
              className="absolute top-4 right-4 p-1 text-zinc-400 hover:text-white rounded-lg"
            >
              <X className="w-4 h-4" />
            </button>
            <h3 className="font-bold text-lg text-white mb-1">Webhook Dispatch Details</h3>
            <p className="text-xs text-blue-400 font-mono mb-4">{selectedWebhook.eventType}</p>

            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 font-mono text-xs space-y-2">
              <div className="flex justify-between"><span className="text-zinc-500">Event ID:</span><span>{selectedWebhook.id}</span></div>
              <div className="flex justify-between"><span className="text-zinc-500">Status:</span><span className="text-emerald-400 font-bold">{selectedWebhook.status}</span></div>
              <div className="flex justify-between"><span className="text-zinc-500">Target URL:</span><span className="truncate max-w-xs">{selectedWebhook.targetUrl}</span></div>
              
              <div className="pt-2 border-t border-zinc-800">
                <span className="text-zinc-500 block mb-1">Payload JSON:</span>
                <pre className="text-[11px] text-zinc-300 bg-zinc-950 p-3 rounded-lg overflow-x-auto border border-zinc-800">
                  {typeof selectedWebhook.payload === 'string'
                    ? selectedWebhook.payload
                    : JSON.stringify(selectedWebhook.payload, null, 2)}
                </pre>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
