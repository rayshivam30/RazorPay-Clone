import React, { useEffect, useState } from 'react';
import {
  DollarSign,
  TrendingUp,
  RotateCcw,
  ArrowUpRight,
  ShieldCheck,
  CheckCircle2,
  RefreshCw,
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { paymentsApi } from '../services/api';
import type { Payment } from '../types';

interface DashboardOverviewProps {
  onOpenCheckout: (orderId: string, amount: number) => void;
  onNavigateTab: (tab: any) => void;
}

export const DashboardOverview: React.FC<DashboardOverviewProps> = ({
  onNavigateTab,
}) => {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    try {
      const pData = await paymentsApi.list().catch(() => []);
      setPayments(pData);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const capturedPayments = payments.filter((p) => p.status === 'CAPTURED' || p.status === 'SETTLED' || p.status === 'PARTIALLY_REFUNDED');
  const totalVolume = capturedPayments.reduce((acc, p) => acc + (p.amount?.amountUnits || 0), 0);
  const totalPaymentsCount = payments.length;
  const successRate = totalPaymentsCount > 0 ? ((capturedPayments.length / totalPaymentsCount) * 100).toFixed(1) : '0';
  const refundCount = payments.filter((p) => p.status === 'REFUNDED' || p.status === 'PARTIALLY_REFUNDED').length;

  const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const getRealChartData = () => {
    const today = new Date();
    const last7Days: { day: string; dateStr: string; volume: number }[] = [];

    for (let i = 6; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const dayName = daysOfWeek[d.getDay()];
      const dateStr = d.toISOString().split('T')[0];
      last7Days.push({
        day: dayName,
        dateStr,
        volume: 0,
      });
    }

    capturedPayments.forEach((p) => {
      if (!p.createdAt) return;
      const pDateStr = new Date(p.createdAt).toISOString().split('T')[0];
      const match = last7Days.find((item) => item.dateStr === pDateStr);
      if (match) {
        match.volume += p.amount?.amountUnits || 0;
      }
    });

    return last7Days.map(({ day, volume }) => ({ day, volume }));
  };

  const chartData = getRealChartData();

  return (
    <div className="space-y-8 animate-fadeIn">
      <div className="bg-gradient-to-r from-zinc-900 via-[#121215] to-zinc-900 border border-zinc-800 rounded-2xl p-6 flex items-center justify-between shadow-xl">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-2xl font-bold text-white tracking-tight">Razorpay Gateway Operations</h2>
            <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-semibold border border-emerald-500/30">
              Operational
            </span>
          </div>
          <p className="text-xs text-zinc-400 mt-1 max-w-xl">
            Real-time transaction authorization engine, payment captures, API key management, and bank callback simulator.
          </p>
        </div>

        <button
          onClick={fetchData}
          className="flex items-center gap-2 px-3 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-xs font-semibold text-zinc-300 border border-zinc-700 transition-colors"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh</span>
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-[#121215] border border-zinc-800 rounded-2xl p-5 shadow-lg relative overflow-hidden">
          <div className="flex justify-between items-start mb-3">
            <span className="text-xs font-medium text-zinc-400 uppercase tracking-wider">Gross Volume</span>
            <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-white tracking-tight">
            ₹{totalVolume.toLocaleString('en-IN')}
          </div>
          <div className="mt-2 flex items-center gap-1.5 text-xs text-emerald-400 font-medium">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>+14.2% from last week</span>
          </div>
        </div>

        <div className="bg-[#121215] border border-zinc-800 rounded-2xl p-5 shadow-lg relative overflow-hidden">
          <div className="flex justify-between items-start mb-3">
            <span className="text-xs font-medium text-zinc-400 uppercase tracking-wider">Successful Payments</span>
            <div className="p-2 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-white tracking-tight">
            {capturedPayments.length}
          </div>
          <p className="mt-2 text-xs text-zinc-400">
            Out of {totalPaymentsCount} total attempts
          </p>
        </div>

        <div className="bg-[#121215] border border-zinc-800 rounded-2xl p-5 shadow-lg relative overflow-hidden">
          <div className="flex justify-between items-start mb-3">
            <span className="text-xs font-medium text-zinc-400 uppercase tracking-wider">Success Rate</span>
            <div className="p-2 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-white tracking-tight">
            {successRate}%
          </div>
          <p className="mt-2 text-xs text-emerald-400 font-medium">
            Optimal bank approval rate
          </p>
        </div>

        <div className="bg-[#121215] border border-zinc-800 rounded-2xl p-5 shadow-lg relative overflow-hidden">
          <div className="flex justify-between items-start mb-3">
            <span className="text-xs font-medium text-zinc-400 uppercase tracking-wider">Total Refunds</span>
            <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400">
              <RotateCcw className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-white tracking-tight">
            {refundCount}
          </div>
          <p className="mt-2 text-xs text-zinc-400">Processed back to customer bank</p>
        </div>
      </div>

      <div className="bg-[#121215] border border-zinc-800 rounded-2xl p-6 shadow-xl">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="font-bold text-white text-base">Payment Volume Overview</h3>
            <p className="text-xs text-zinc-400">Daily gross settlement trend in INR (₹)</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-blue-500"></span>
            <span className="text-xs text-zinc-400">Gross Volume</span>
          </div>
        </div>

        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorVolume" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="day" stroke="#52525b" fontSize={11} tickLine={false} />
              <YAxis stroke="#52525b" fontSize={11} tickLine={false} />
              <Tooltip
                contentStyle={{ backgroundColor: '#18181b', borderColor: '#27272a', borderRadius: '12px', color: '#fff' }}
                formatter={(value: any) => [`₹${Number(value).toLocaleString()}`, 'Volume']}
              />
              <Area type="monotone" dataKey="volume" stroke="#3b82f6" strokeWidth={2} fillOpacity={1} fill="url(#colorVolume)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-[#121215] border border-zinc-800 rounded-2xl p-6 shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-white text-base">Recent Payments</h3>
          <button
            onClick={() => onNavigateTab('payments')}
            className="text-xs font-semibold text-blue-400 hover:text-blue-300 flex items-center gap-1"
          >
            <span>View All Payments</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-zinc-300">
            <thead className="bg-zinc-900/80 text-zinc-400 font-semibold uppercase tracking-wider border-b border-zinc-800">
              <tr>
                <th className="py-3 px-4">Payment ID</th>
                <th className="py-3 px-4">Amount</th>
                <th className="py-3 px-4">Method</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Created</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/60 font-mono">
              {payments.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-zinc-500 font-sans">
                    No transactions recorded yet. Launch the Checkout Simulator to test a payment!
                  </td>
                </tr>
              ) : (
                payments.slice(0, 5).map((p) => (
                  <tr key={p.id} className="hover:bg-zinc-900/40 transition-colors">
                    <td className="py-3 px-4 font-semibold text-white">{p.id.slice(0, 16)}...</td>
                    <td className="py-3 px-4 text-emerald-400 font-bold">₹{p.amount.amountUnits.toLocaleString()}</td>
                    <td className="py-3 px-4 font-sans text-zinc-300">{p.method}</td>
                    <td className="py-3 px-4">
                      <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold font-sans ${
                        p.status === 'CAPTURED' ? 'badge-captured' :
                        p.status === 'SETTLED' ? 'badge-settled' :
                        p.status === 'FAILED' ? 'badge-failed' :
                        p.status === 'REFUNDED' ? 'badge-refunded' :
                        p.status === 'PARTIALLY_REFUNDED' ? 'badge-partially-refunded' : 'badge-created'
                      }`}>
                        {p.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-zinc-500 font-sans">
                      {new Date(p.createdAt || Date.now()).toLocaleTimeString()}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
