import React, { useState } from 'react';
import { authApi } from '../services/api';
import { useAuth } from '../context/AuthContext';
import type { BusinessType } from '../types';
import { ShieldCheck, Lock, Mail, Building, User, ArrowRight, Loader2, ArrowLeft } from 'lucide-react';

interface AuthPageProps {
  onBackToLanding?: () => void;
}

export const AuthPage: React.FC<AuthPageProps> = ({ onBackToLanding }) => {
  const { login } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [email, setEmail] = useState('merchant@razorpay.com');
  const [password, setPassword] = useState('Password@123');
  const [name, setName] = useState('Jane Merchant');
  const [businessName, setBusinessName] = useState('Acme Tech Store');
  const [businessType, setBusinessType] = useState<BusinessType>('PRIVATE_LIMITED');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (isLogin) {
        const res = await authApi.login({ email, password });
        // Store token first so the /me call can authenticate
        login(res.accessToken);
        // Then fetch real merchant profile from backend
        const merchantInfo = await authApi.me();
        login(res.accessToken, merchantInfo);
      } else {
        const merchantRes = await authApi.signup({
          name,
          email,
          password,
          businessName,
          businessType,
        });
        const loginRes = await authApi.login({ email, password });
        login(loginRes.accessToken, merchantRes);
      }
    } catch (err: any) {
      setError(
        err.response?.data?.message ||
          err.response?.data?.error ||
          err.message ||
          'Authentication failed. Please check credentials.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#09090b] text-white flex items-center justify-center p-6 relative select-none">
      {onBackToLanding && (
        <button
          onClick={onBackToLanding}
          className="absolute top-6 left-6 z-20 px-3.5 py-2 rounded-lg bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 text-xs font-semibold text-zinc-400 hover:text-white transition-all flex items-center gap-1.5"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Landing Page</span>
        </button>
      )}

      <div className="w-full max-w-md relative z-10">
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-blue-600 shadow-lg shadow-blue-600/30 mb-3">
            <span className="font-extrabold text-white text-2xl">R</span>
          </div>
          <h1 className="text-xl font-bold tracking-tight text-white">Razorpay Merchant Access</h1>
          <p className="text-xs text-zinc-400 mt-1">Enterprise Payment Gateway Portal</p>
        </div>

        <div className="bg-[#121215] border border-zinc-800 rounded-2xl p-6 sm:p-8 shadow-xl">
          <div className="grid grid-cols-2 gap-1 p-1 bg-[#0c0c0e] border border-zinc-800 rounded-xl mb-6 text-xs font-semibold">
            <button
              onClick={() => {
                setIsLogin(true);
                setError(null);
              }}
              className={`py-2 rounded-lg transition-all ${
                isLogin ? 'bg-zinc-800 text-white shadow-sm' : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              Merchant Login
            </button>
            <button
              onClick={() => {
                setIsLogin(false);
                setError(null);
              }}
              className={`py-2 rounded-lg transition-all ${
                !isLogin ? 'bg-zinc-800 text-white shadow-sm' : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              Sign Up
            </button>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-xs text-red-400 font-medium">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <>
                <div>
                  <label className="text-xs font-medium text-zinc-400 block mb-1">Full Name</label>
                  <div className="relative">
                    <User className="w-4 h-4 text-zinc-500 absolute left-3 top-2.5" />
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Jane Merchant"
                      className="w-full bg-[#0c0c0e] border border-zinc-800 rounded-lg pl-9 pr-4 py-2 text-xs text-white placeholder-zinc-500 focus:border-blue-500 focus:outline-none transition-colors"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-medium text-zinc-400 block mb-1">Business Name</label>
                  <div className="relative">
                    <Building className="w-4 h-4 text-zinc-500 absolute left-3 top-2.5" />
                    <input
                      type="text"
                      value={businessName}
                      onChange={(e) => setBusinessName(e.target.value)}
                      placeholder="Acme Tech Store"
                      className="w-full bg-[#0c0c0e] border border-zinc-800 rounded-lg pl-9 pr-4 py-2 text-xs text-white placeholder-zinc-500 focus:border-blue-500 focus:outline-none transition-colors"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-medium text-zinc-400 block mb-1">Business Type</label>
                  <select
                    value={businessType}
                    onChange={(e) => setBusinessType(e.target.value as BusinessType)}
                    className="w-full bg-[#0c0c0e] border border-zinc-800 rounded-lg px-3 py-2 text-xs text-white focus:border-blue-500 focus:outline-none transition-colors"
                  >
                    <option value="INDIVIDUAL">Individual</option>
                    <option value="PROPRIETORSHIP">Proprietorship</option>
                    <option value="PARTNERSHIP">Partnership</option>
                    <option value="PRIVATE_LIMITED">Private Limited</option>
                    <option value="LLP">LLP</option>
                  </select>
                </div>
              </>
            )}

            <div>
              <label className="text-xs font-medium text-zinc-400 block mb-1">Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-zinc-500 absolute left-3 top-2.5" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="merchant@razorpay.com"
                  className="w-full bg-[#0c0c0e] border border-zinc-800 rounded-lg pl-9 pr-4 py-2 text-xs text-white placeholder-zinc-500 focus:border-blue-500 focus:outline-none transition-colors"
                  required
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-medium text-zinc-400 block mb-1">Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-zinc-500 absolute left-3 top-2.5" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-[#0c0c0e] border border-zinc-800 rounded-lg pl-9 pr-4 py-2 text-xs text-white placeholder-zinc-500 focus:border-blue-500 focus:outline-none transition-colors"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-4 py-2.5 px-4 rounded-lg bg-blue-600 hover:bg-blue-500 text-xs font-bold text-white shadow-md shadow-blue-600/30 flex items-center justify-center gap-2 transition-all"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <span>{isLogin ? 'Sign In to Dashboard' : 'Create Merchant Account'}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </form>
        </div>

        <div className="text-center mt-5 text-[11px] text-zinc-500 flex items-center justify-center gap-1.5">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          <span>Encrypted JWT Merchant Session & PCI-DSS Compliant Gateway</span>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
