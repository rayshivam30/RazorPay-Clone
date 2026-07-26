import React, { useEffect, useState } from 'react';
import { KeyRound, Plus, Copy, Check, Trash2, AlertTriangle, ShieldCheck } from 'lucide-react';
import { apiKeyApi } from '../services/api';
import type { ApiKey, ApiKeyCreateResponse } from '../types';
import { useAuth } from '../context/AuthContext';

export const ApiKeys: React.FC = () => {
  const { setActiveApiKey, clearActiveApiKey, apiKeyId: activeKeyId } = useAuth();
  const [keys, setKeys] = useState<ApiKey[]>([]);
  const [newKeyData, setNewKeyData] = useState<ApiKeyCreateResponse | null>(null);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [showRevoked, setShowRevoked] = useState(false);
  const [newKeyEnv, setNewKeyEnv] = useState<'TEST' | 'LIVE'>('TEST');

  const fetchKeys = async () => {
    try {
      const data = await apiKeyApi.list();
      setKeys(data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchKeys();
  }, []);

  const visibleKeys = showRevoked ? keys : keys.filter((k) => k.enabled !== false);

  const handleGenerateKey = async () => {
    try {
      const res = await apiKeyApi.create({ environment: newKeyEnv });
      setNewKeyData(res);
      setActiveApiKey(res.keyId, res.keySecret);
      fetchKeys();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to generate API Key');
    }
  };

  const handleRevoke = async (id: string, keyIdString?: string) => {
    if (!confirm('Are you sure you want to revoke this API key? Applications using it will lose access.')) return;
    try {
      await apiKeyApi.revoke(id);
      if (activeKeyId === keyIdString) {
        clearActiveApiKey();
      }
      fetchKeys();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to revoke API key');
    }
  };

  const handleRotate = async (keyId: string) => {
    try {
      const res = await apiKeyApi.rotate(keyId);
      setNewKeyData(res);
      setActiveApiKey(res.keyId, res.keySecret);
      fetchKeys();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to rotate API key');
    }
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(label);
    setTimeout(() => setCopiedField(null), 2000);
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-[#121215] border border-zinc-800 rounded-2xl p-6 shadow-xl">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight">API Key Management</h2>
          <p className="text-xs text-zinc-400 mt-0.5">
            Generate and manage HTTP Basic Auth API Key pairs for integration.
          </p>
        </div>

        <div className="flex items-center gap-4">
          <label className="flex items-center gap-2 text-xs text-zinc-400 select-none cursor-pointer">
            <input
              type="checkbox"
              checked={showRevoked}
              onChange={(e) => setShowRevoked(e.target.checked)}
              className="rounded bg-zinc-900 border-zinc-700 text-blue-600 focus:ring-0"
            />
            <span>Show Revoked Keys</span>
          </label>

          <select
            value={newKeyEnv}
            onChange={(e) => setNewKeyEnv(e.target.value as 'TEST' | 'LIVE')}
            className="bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-zinc-300 focus:outline-none cursor-pointer"
          >
            <option value="TEST">TEST</option>
            <option value="LIVE">LIVE</option>
          </select>

          <button
            onClick={handleGenerateKey}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-lg shadow-blue-600/30 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Generate New API Key</span>
          </button>
        </div>
      </div>

      <div className="bg-[#121215] border border-zinc-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-zinc-300">
            <thead className="bg-zinc-900/80 text-zinc-400 font-semibold uppercase tracking-wider border-b border-zinc-800">
              <tr>
                <th className="py-3.5 px-4">Key ID</th>
                <th className="py-3.5 px-4">Environment</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4">Active Selection</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/60 font-mono">
              {visibleKeys.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-zinc-500 font-sans">
                    No active API Keys. Click "Generate New API Key" to create one.
                  </td>
                </tr>
              ) : (
                visibleKeys.map((key) => {
                  const isActive = activeKeyId === key.keyId;
                  return (
                    <tr key={key.id} className="hover:bg-zinc-900/40 transition-colors">
                      <td className="py-3.5 px-4 font-semibold text-white">
                        <div className="flex items-center gap-2">
                          <KeyRound className="w-4 h-4 text-zinc-500" />
                          <span>{key.keyId}</span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 font-sans">
                        <span className="px-2 py-0.5 rounded bg-zinc-800 text-zinc-300 font-medium">
                          {key.environment}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-sans">
                        {key.enabled !== false ? (
                          <span className="badge-captured px-2.5 py-1 rounded-md text-[10px] font-bold">
                            ENABLED
                          </span>
                        ) : (
                          <span className="badge-failed px-2.5 py-1 rounded-md text-[10px] font-bold">
                            REVOKED
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 font-sans">
                        {isActive && key.enabled !== false ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-blue-500/20 text-blue-400 border border-blue-500/30 text-[10px] font-bold">
                            <ShieldCheck className="w-3 h-3" /> ACTIVE IN SESSION
                          </span>
                        ) : (
                          <span className="text-zinc-500 text-[11px]">Inactive</span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-right font-sans space-x-2">
                        {key.enabled !== false ? (
                          <>
                            <button
                              onClick={() => handleRotate(key.id)}
                              className="px-2.5 py-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-semibold"
                            >
                              Rotate
                            </button>
                            <button
                              onClick={() => handleRevoke(key.id, key.keyId)}
                              className="p-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20"
                              title="Revoke Key"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </>
                        ) : (
                          <span className="text-zinc-600 text-xs italic">Disabled</span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {newKeyData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-md bg-[#121215] border border-blue-500/40 rounded-2xl p-6 shadow-2xl text-white space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400">
                <KeyRound className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-lg text-white">API Key Pair Generated</h3>
                <p className="text-xs text-amber-400 flex items-center gap-1 mt-0.5">
                  <AlertTriangle className="w-3 h-3" /> Save your Key Secret now. It won't be shown again!
                </p>
              </div>
            </div>

            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 space-y-3 font-mono text-xs">
              <div>
                <span className="text-zinc-500 text-[10px] uppercase block mb-1">Key ID</span>
                <div className="flex items-center justify-between bg-zinc-950 p-2.5 rounded-lg border border-zinc-800 text-white">
                  <span>{newKeyData.keyId}</span>
                  <button
                    onClick={() => copyToClipboard(newKeyData.keyId, 'keyId')}
                    className="text-zinc-400 hover:text-white"
                  >
                    {copiedField === 'keyId' ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <span className="text-zinc-500 text-[10px] uppercase block mb-1">Key Secret</span>
                <div className="flex items-center justify-between bg-zinc-950 p-2.5 rounded-lg border border-zinc-800 text-emerald-400 font-bold">
                  <span>{newKeyData.keySecret}</span>
                  <button
                    onClick={() => copyToClipboard(newKeyData.keySecret, 'keySecret')}
                    className="text-zinc-400 hover:text-white"
                  >
                    {copiedField === 'keySecret' ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </div>

            <button
              onClick={() => setNewKeyData(null)}
              className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-xs font-semibold text-white shadow-lg shadow-blue-600/30"
            >
              Done & Active in Session
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
