import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Key, Menu, ShieldAlert } from 'lucide-react';

interface HeaderProps {
  title: string;
  onOpenNavigation: () => void;
}

export const Header: React.FC<HeaderProps> = ({ title, onOpenNavigation }) => {
  const { apiKeyId } = useAuth();

  return (
    <header className="h-16 border-b border-zinc-800/80 bg-[#09090b]/80 backdrop-blur-md sticky top-0 z-20 flex items-center justify-between gap-3 px-4 sm:px-6 lg:px-8">
      <div className="flex min-w-0 items-center gap-2 sm:gap-3">
        <button onClick={onOpenNavigation} className="rounded-lg p-2 text-zinc-300 hover:bg-zinc-800 md:hidden" aria-label="Open navigation"><Menu className="h-5 w-5" /></button>
        <h2 className="truncate text-base font-bold tracking-tight text-white sm:text-xl">{title}</h2>
        <span className="hidden sm:inline px-2 py-0.5 rounded text-[11px] font-medium bg-zinc-800/80 text-zinc-300 border border-zinc-700/60">
          v1 API
        </span>
      </div>

      <div className="flex shrink-0 items-center gap-4">
        <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-zinc-900 border border-zinc-800 text-xs">
          <Key className="w-3.5 h-3.5 text-zinc-400" />
          <span className="hidden lg:inline text-zinc-400 font-medium">Active Key:</span>
          {apiKeyId ? (
            <span className="hidden max-w-64 truncate font-mono font-medium text-zinc-200 lg:inline">{apiKeyId}</span>
          ) : (
            <span className="hidden text-amber-400 font-medium sm:flex items-center gap-1">
              <ShieldAlert className="w-3 h-3" /> No API Key Active
            </span>
          )}
        </div>
      </div>
    </header>
  );
};
