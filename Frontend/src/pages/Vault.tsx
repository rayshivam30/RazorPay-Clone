import React, { useEffect, useState } from 'react';
import { ShieldCheck, Loader2 } from 'lucide-react';
import { vaultApi, getApiErrorMessage } from '../services/api';
import { getSavedVaultCards, addSavedVaultCard } from '../services/vaultStore';
import type { TokenizeResponse } from '../types';

export const Vault: React.FC = () => {
  const [tokens, setTokens] = useState<TokenizeResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [cardNumber, setCardNumber] = useState('4532890123456789');
  const [expiryMonth, setExpiryMonth] = useState('11');
  const [expiryYear, setExpiryYear] = useState('2028');
  const [cardHolderName, setCardHolderName] = useState('Sarah Jenkins');
  const [cvv, setCvv] = useState('456');

  useEffect(() => {
    setTokens(getSavedVaultCards());
  }, []);

  const handleTokenize = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const cleanPan = cardNumber.replace(/\s+/g, '');
    const monthInt = parseInt(expiryMonth, 10);
    const yearInt = parseInt(expiryYear, 10);

    if (isNaN(monthInt) || monthInt < 1 || monthInt > 12) {
      setError('Expiry month must be between 1 and 12');
      setLoading(false);
      return;
    }
    if (isNaN(yearInt) || yearInt < 2025) {
      setError('Expiry year must be a valid future year');
      setLoading(false);
      return;
    }

    try {
      const res = await vaultApi.tokenize({
        pan: cleanPan,
        cvv: cvv.trim(),
        expiryMonth: monthInt,
        expiryYear: yearInt,
        cardHolderName: cardHolderName.trim(),
      });

      const updated = addSavedVaultCard(res);
      setTokens(updated);
    } catch (err: any) {
      setError(getApiErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      <div className="bg-[#121215] border border-zinc-800 rounded-2xl p-6 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white tracking-tight">Saved Cards Vault</h2>
            <p className="text-xs text-zinc-400 mt-0.5">
              PCI-DSS Compliant Card Tokenization engine for instant 1-click customer checkouts.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-[#121215] border border-zinc-800 rounded-2xl p-6 shadow-xl space-y-4">
          <h3 className="font-bold text-white text-base">Tokenize Customer Card</h3>

          {error && (
            <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-xs text-red-400 font-mono">
              {error}
            </div>
          )}

          <form onSubmit={handleTokenize} className="space-y-4">
            <div>
              <label className="text-xs text-zinc-400 block mb-1">Card Number (PAN - Passes Luhn Check)</label>
              <input
                type="text"
                value={cardNumber}
                onChange={(e) => setCardNumber(e.target.value)}
                placeholder="4532 8901 2345 6789"
                className="w-full bg-zinc-900 border border-zinc-700/80 rounded-xl px-3 py-2.5 text-sm text-white font-mono focus:border-blue-500 focus:outline-none"
                required
              />
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="text-xs text-zinc-400 block mb-1">Exp Month</label>
                <input
                  type="number"
                  min="1"
                  max="12"
                  value={expiryMonth}
                  onChange={(e) => setExpiryMonth(e.target.value)}
                  placeholder="11"
                  className="w-full bg-zinc-900 border border-zinc-700/80 rounded-xl px-3 py-2.5 text-sm text-white font-mono focus:border-blue-500 focus:outline-none"
                  required
                />
              </div>
              <div>
                <label className="text-xs text-zinc-400 block mb-1">Exp Year</label>
                <input
                  type="number"
                  min="2025"
                  max="2035"
                  value={expiryYear}
                  onChange={(e) => setExpiryYear(e.target.value)}
                  placeholder="2028"
                  className="w-full bg-zinc-900 border border-zinc-700/80 rounded-xl px-3 py-2.5 text-sm text-white font-mono focus:border-blue-500 focus:outline-none"
                  required
                />
              </div>
              <div>
                <label className="text-xs text-zinc-400 block mb-1">CVV</label>
                <input
                  type="password"
                  maxLength={4}
                  value={cvv}
                  onChange={(e) => setCvv(e.target.value)}
                  placeholder="456"
                  className="w-full bg-zinc-900 border border-zinc-700/80 rounded-xl px-3 py-2.5 text-sm text-white font-mono focus:border-blue-500 focus:outline-none"
                  required
                />
              </div>
            </div>

            <div>
              <label className="text-xs text-zinc-400 block mb-1">Cardholder Name</label>
              <input
                type="text"
                value={cardHolderName}
                onChange={(e) => setCardHolderName(e.target.value)}
                placeholder="Sarah Jenkins"
                className="w-full bg-zinc-900 border border-zinc-700/80 rounded-xl px-3 py-2.5 text-sm text-white focus:border-blue-500 focus:outline-none"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-xs font-semibold text-white shadow-lg shadow-blue-600/30 flex items-center justify-center gap-2"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Tokenize & Secure Card'}
            </button>
          </form>
        </div>

        <div className="bg-[#121215] border border-zinc-800 rounded-2xl p-6 shadow-xl space-y-4">
          <h3 className="font-bold text-white text-base">Tokenized Vault Cards</h3>

          <div className="space-y-3">
            {tokens.length === 0 ? (
              <div className="py-12 text-center text-zinc-500 text-xs">
                No cards tokenized yet in this session. Submit the form to generate a PCI-DSS vault token.
              </div>
            ) : (
              tokens.map((token, idx) => (
                <div
                  key={idx}
                  className="bg-gradient-to-r from-zinc-900 to-zinc-950 border border-zinc-800 rounded-xl p-4 space-y-2 relative"
                >
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-bold text-blue-400 uppercase">{token.brand || 'VISA'}</span>
                    <span className="text-[10px] text-zinc-500 font-mono">Token: {token.token}</span>
                  </div>

                  <div className="font-mono text-base font-bold text-white tracking-widest">
                    •••• •••• •••• {token.lastFour || '6789'}
                  </div>

                  <div className="flex justify-between text-xs text-zinc-400 pt-1">
                    <span>{token.cardHolderName || '—'}</span>
                    <span>Expires {token.expiryMonth}/{token.expiryYear}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
