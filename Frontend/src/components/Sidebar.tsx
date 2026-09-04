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
  X,
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
  isOpen: boolean;
  onClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab, isOpen, onClose }) => {
  const { merchant, logout } = useAuth();

  return (
    <>
      {isOpen && <button aria-label="Close navigation" onClick={onClose} className="fixed inset-0 z-30 bg-black/70 md:hidden" />}
      <aside className={`w-72 md:w-64 bg-[#0c0c0e] border-r border-zinc-800/80 flex flex-col h-dvh fixed left-0 top-0 z-40 select-none transition-transform duration-200 md:translate-x-0 ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
      {/* Brand Header */}
      <div className="p-5 md:p-6 border-b border-zinc-800/80 flex items-center gap-3">
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
        <button onClick={onClose} className="ml-auto p-2 text-zinc-400 hover:text-white md:hidden" aria-label="Close menu"><X className="w-5 h-5" /></button>
      </div>

      {/* Navigation List */}
      <nav className="flex-1 py-4 px-3 space-y-5 overflow-y-auto">
        {/* Core Gateway Section */}
        <div className="space-y-1">
          <div className="px-3 pb-1 text-[10px] font-bold tracking-wider text-zinc-500 uppercase">
            Core Gateway
          </div>
          {[
            { id: 'overview' as NavTab, label: 'Overview', icon: LayoutDashboard },
            { id: 'checkout' as NavTab, label: 'Checkout Simulator', icon: CreditCard, badge: 'DEMO' },
            { id: 'payments' as NavTab, label: 'Payments', icon: ArrowLeftRight },
            { id: 'refunds' as NavTab, label: 'Refunds', icon: RotateCcw },
          ].map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => { setActiveTab(item.id); onClose(); }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-medium transition-all duration-150 ${
                  isActive
                    ? 'bg-zinc-800 text-white shadow-sm border border-zinc-700/60'
                    : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/60'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-blue-400' : 'text-zinc-400'}`} />
                <span>{item.label}</span>
                {item.badge && (
                  <span className="ml-auto text-[9px] bg-blue-500/20 text-blue-400 border border-blue-500/30 px-1.5 py-0.5 rounded font-bold">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Developer & Tools Section */}
        <div className="space-y-1">
          <div className="px-3 pb-1 text-[10px] font-bold tracking-wider text-zinc-500 uppercase">
            Developer & Tools
          </div>
          {[
            { id: 'apikeys' as NavTab, label: 'API Keys', icon: KeyRound },
            { id: 'operations' as NavTab, label: 'Operations & Webhooks', icon: Activity },
            { id: 'vault' as NavTab, label: 'Saved Cards Vault', icon: ShieldCheck },
          ].map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => { setActiveTab(item.id); onClose(); }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-medium transition-all duration-150 ${
                  isActive
                    ? 'bg-zinc-800 text-white shadow-sm border border-zinc-700/60'
                    : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/60'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-blue-400' : 'text-zinc-400'}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
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
    </>
  );
};
