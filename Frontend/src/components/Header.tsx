import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Key, ShieldAlert } from 'lucide-react';

interface HeaderProps {
  title: string;
}

export const Header: React.FC<HeaderProps> = ({ title }) => {
  const { apiKeyId } = useAuth();

  return (
    <header className="h-16 border-b border-zinc-800/80 bg-[#09090b]/80 backdrop-blur-md sticky top-0 z-20 flex items-center justify-between px-8">
      <div className="flex items-center gap-3">
        <h2 className="text-xl font-bold text-white tracking-tight">{title}</h2>
        <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-zinc-800/80 text-zinc-300 border border-zinc-700/60">
          v1 API
        </span>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-zinc-900 border border-zinc-800 text-xs">
          <Key className="w-3.5 h-3.5 text-zinc-400" />
          <span className="text-zinc-400 font-medium">Active Key:</span>
          {apiKeyId ? (
            <span className="font-mono text-zinc-200 font-medium">{apiKeyId}</span>
          ) : (
            <span className="text-amber-400 font-medium flex items-center gap-1">
              <ShieldAlert className="w-3 h-3" /> No API Key Active
            </span>
          )}
        </div>
      </div>
    </header>
  );
};
