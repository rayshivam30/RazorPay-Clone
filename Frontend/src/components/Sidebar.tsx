import React from 'react';
import {
  LayoutDashboard,
  CreditCard,
  ArrowLeftRight,
  RotateCcw,
  KeyRound,
  Activity,
  ShieldCheck,
  LogOut,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export type NavTab =
  | 'overview'
  | 'checkout'
  | 'payments'
  | 'refunds'
  | 'apikeys'
  | 'operations'
  | 'vault';

interface SidebarProps {
  activeTab: NavTab;
  setActiveTab: (tab: NavTab) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab }) => {
  const { merchant, logout } = useAuth();

  const navItems: { id: NavTab; label: string; icon: React.FC<{ className?: string }> }[] = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'checkout', label: 'Checkout Simulator', icon: CreditCard },
    { id: 'payments', label: 'Payments', icon: ArrowLeftRight },
    { id: 'refunds', label: 'Refunds', icon: RotateCcw },
    { id: 'apikeys', label: 'API Keys', icon: KeyRound },
    { id: 'operations', label: 'Operations & Webhooks', icon: Activity },
    { id: 'vault', label: 'Saved Cards Vault', icon: ShieldCheck },
  ];

  return (
    <aside className="w-64 bg-[#0c0c0e] border-r border-zinc-800/80 flex flex-col h-screen fixed left-0 top-0 z-30 select-none">
      {/* Brand Header */}
      <div className="p-6 border-b border-zinc-800/80 flex items-center gap-3">
        <div className="w-9 h-9 rounded-lg bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-600/30">
          <span className="font-extrabold text-white text-xl tracking-tighter">R</span>
        </div>
        <div>
          <div className="flex items-center gap-1.5">
            <h1 className="font-bold text-white tracking-wide text-lg">Razorpay</h1>
            <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span>
          </div>
          <p className="text-xs text-zinc-400 font-medium">Merchant Dashboard</p>
        </div>
      </div>

      {/* Navigation List */}
      <nav className="flex-1 py-6 px-3 space-y-1 overflow-y-auto">
        <div className="px-3 pb-2 text-[11px] font-semibold tracking-wider text-zinc-400 uppercase">
          Core Gateway
        </div>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 ${
                isActive
                  ? 'bg-zinc-800 text-white shadow-sm border border-zinc-700/60'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/60'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-blue-400' : 'text-zinc-400'}`} />
              <span>{item.label}</span>
              {item.id === 'checkout' && (
                <span className="ml-auto text-[10px] bg-blue-500/20 text-blue-400 border border-blue-500/30 px-1.5 py-0.5 rounded font-semibold">
                  LIVE
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Merchant Footer Profile */}
      <div className="p-4 border-t border-zinc-800/80 bg-zinc-950/50">
        <div className="flex items-center justify-between">
          <div className="min-w-0 pr-2">
            <p className="text-xs font-semibold text-zinc-200 truncate">
              {merchant?.businessName || merchant?.name || 'Merchant'}
            </p>
            <p className="text-[11px] text-zinc-400 truncate">{merchant?.email || 'merchant@razorpay.com'}</p>
          </div>
          <button
            onClick={logout}
            title="Logout"
            className="p-2 rounded-lg text-zinc-400 hover:text-red-400 hover:bg-red-500/10 transition-colors"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
};
