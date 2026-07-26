import React, { useState, useEffect } from 'react';
import {
  X,
  CreditCard,
  Smartphone,
  Building2,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  Loader2,
  Lock,
} from 'lucide-react';
import type { Payment, PaymentMethod, TokenizeResponse } from '../types';
import { paymentsApi, vaultApi, getApiErrorMessage } from '../services/api';
import { getSavedVaultCards, addSavedVaultCard } from '../services/vaultStore';

interface CheckoutModalProps {
  orderId: string;
  amountInRupees: number;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (payment: Payment) => void;
}

type CheckoutStep = 'METHOD_SELECT' | 'AUTHORIZING' | 'SUCCESS' | 'FAILED';

export const CheckoutModal: React.FC<CheckoutModalProps> = ({
  orderId,
  amountInRupees,
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod>('CARD');
  const [step, setStep] = useState<CheckoutStep>('METHOD_SELECT');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [currentPayment, setCurrentPayment] = useState<Payment | null>(null);

  // Vault Saved Cards State
  const [savedCards, setSavedCards] = useState<TokenizeResponse[]>([]);
  const [useSavedCard, setUseSavedCard] = useState(false);
  const [selectedToken, setSelectedToken] = useState('');

  // Card Form State
  const [cardNumber, setCardNumber] = useState('4532 8901 2345 6789');
  const [expiry, setExpiry] = useState('11/28');
  const [cvv, setCvv] = useState('123');
  const [cardHolder, setCardHolder] = useState('Sarah Jenkins');
  const [saveCard, setSaveCard] = useState(true);

  // UPI State
  const [vpa, setVpa] = useState('success@razorpay');

  // Netbanking State
  const [selectedBank, setSelectedBank] = useState('HDFC');

  useEffect(() => {
    if (isOpen) {
      const cards = getSavedVaultCards();
      setSavedCards(cards);
      if (cards.length > 0) {
        setUseSavedCard(true);
        setSelectedToken(cards[0].token);
      } else {
        setUseSavedCard(false);
      }
      setStep('METHOD_SELECT');
      setLoading(false);
      setErrorMessage(null);
      setCurrentPayment(null);
    }
  }, [isOpen]);

  useEffect(() => {
    let interval: any;
    if (step === 'AUTHORIZING' && currentPayment) {
      interval = setInterval(async () => {
        try {
          const updated = await paymentsApi.getById(currentPayment.id);
          setCurrentPayment(updated);
          if (updated.status === 'CAPTURED') {
            setStep('SUCCESS');
            clearInterval(interval);
            if (onSuccess) onSuccess(updated);
          } else if (updated.status === 'FAILED') {
            setStep('FAILED');
            setErrorMessage(updated.errorMessage || 'Payment was declined by bank simulator');
            clearInterval(interval);
          }
        } catch (err: any) {
          console.error('Polling error', err);
        }
      }, 2000);
    }
    return () => clearInterval(interval);
  }, [step, currentPayment, onSuccess]);

  if (!isOpen) return null;

  const handlePay = async () => {
    setLoading(true);
    setErrorMessage(null);

    let methodDetails: Record<string, any> = {};

    if (selectedMethod === 'CARD') {
      if (useSavedCard && selectedToken) {
        methodDetails = {
          token: selectedToken,
          cvv,
        };
      } else {
        const cleanCard = cardNumber.replace(/\s+/g, '');
        const [mm, yy] = expiry.split('/');
        methodDetails = {
          cardNumber: cleanCard,
          expiryMonth: mm || '11',
          expiryYear: yy ? `20${yy}` : '2028',
          cardHolderName: cardHolder,
          cvv,
          saveCard,
        };

        // If user wants to save card, tokenize it and save to vaultStore
        if (saveCard) {
          vaultApi
            .tokenize({
              pan: cleanCard,
              cvv,
              expiryMonth: parseInt(mm || '11', 10),
              expiryYear: parseInt(yy ? `20${yy}` : '2028', 10),
              cardHolderName: cardHolder,
            })
            .then((res) => addSavedVaultCard(res))
            .catch(() => {});
        }
      }
    } else if (selectedMethod === 'UPI') {
      methodDetails = { vpa };
    } else if (selectedMethod === 'NETBANKING') {
      methodDetails = { bankCode: selectedBank, bank: selectedBank };
    }

    try {
      const payment = await paymentsApi.initiate({
        orderId,
        method: selectedMethod,
        methodDetails,
      });

      setCurrentPayment(payment);

      if (payment.status === 'CAPTURED') {
        setStep('SUCCESS');
        if (onSuccess) onSuccess(payment);
      } else if (payment.status === 'AUTHORIZING' || payment.status === 'INITIATED') {
        setStep('AUTHORIZING');
      } else {
        setStep('FAILED');
        setErrorMessage(payment.errorMessage || 'Payment initialization failed');
      }
    } catch (err: any) {
      setErrorMessage(getApiErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="w-full max-w-md bg-[#121215] border border-zinc-700/80 rounded-2xl shadow-2xl overflow-hidden text-white flex flex-col">
        <div className="bg-[#0b1329] p-5 border-b border-zinc-800 flex items-center justify-between relative">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center font-bold text-white text-xl shadow-md">
              R
            </div>
            <div>
              <h3 className="font-bold text-white text-base leading-tight">Razorpay Gateway</h3>
              <p className="text-xs text-blue-300 font-mono">Order: {orderId.slice(0, 8)}...</p>
            </div>
          </div>

          <div className="text-right">
            <span className="text-[10px] text-zinc-400 block uppercase font-medium">Payable Amount</span>
            <span className="text-lg font-extrabold text-white">₹{amountInRupees.toLocaleString('en-IN')}</span>
          </div>

          <button
            onClick={onClose}
            className="absolute top-3 right-3 p-1 rounded-full text-zinc-400 hover:text-white hover:bg-zinc-800/60 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6 flex-1 min-h-[340px] flex flex-col justify-between">
          {step === 'METHOD_SELECT' && (
            <>
              <div className="space-y-4">
                <p className="text-xs font-semibold uppercase text-zinc-400 tracking-wider">
                  Select Payment Method
                </p>

                <div className="grid grid-cols-3 gap-2">
                  <button
                    onClick={() => setSelectedMethod('CARD')}
                    className={`flex flex-col items-center justify-center p-3 rounded-xl border text-xs font-medium transition-all ${
                      selectedMethod === 'CARD'
                        ? 'bg-blue-600/20 border-blue-500 text-white shadow-sm'
                        : 'bg-zinc-900/60 border-zinc-800 text-zinc-400 hover:border-zinc-700'
                    }`}
                  >
                    <CreditCard className="w-5 h-5 mb-1.5" />
                    <span>Card</span>
                  </button>

                  <button
                    onClick={() => setSelectedMethod('UPI')}
                    className={`flex flex-col items-center justify-center p-3 rounded-xl border text-xs font-medium transition-all ${
                      selectedMethod === 'UPI'
                        ? 'bg-blue-600/20 border-blue-500 text-white shadow-sm'
                        : 'bg-zinc-900/60 border-zinc-800 text-zinc-400 hover:border-zinc-700'
                    }`}
                  >
                    <Smartphone className="w-5 h-5 mb-1.5" />
                    <span>UPI / QR</span>
                  </button>

                  <button
                    onClick={() => setSelectedMethod('NETBANKING')}
                    className={`flex flex-col items-center justify-center p-3 rounded-xl border text-xs font-medium transition-all ${
                      selectedMethod === 'NETBANKING'
                        ? 'bg-blue-600/20 border-blue-500 text-white shadow-sm'
                        : 'bg-zinc-900/60 border-zinc-800 text-zinc-400 hover:border-zinc-700'
                    }`}
                  >
                    <Building2 className="w-5 h-5 mb-1.5" />
                    <span>NetBanking</span>
                  </button>
                </div>

                <div className="mt-4 pt-4 border-t border-zinc-800/80 space-y-3">
                  {selectedMethod === 'CARD' && (
                    <>
                      {/* Saved Cards Vault Toggle */}
                      {savedCards.length > 0 && (
                        <div className="flex bg-zinc-900 p-1 rounded-xl border border-zinc-800 text-xs mb-3">
                          <button
                            type="button"
                            onClick={() => setUseSavedCard(true)}
                            className={`flex-1 py-1.5 rounded-lg font-medium transition-all ${
                              useSavedCard ? 'bg-blue-600 text-white shadow-sm' : 'text-zinc-400 hover:text-white'
                            }`}
                          >
                            Saved Vault Cards ({savedCards.length})
                          </button>
                          <button
                            type="button"
                            onClick={() => setUseSavedCard(false)}
                            className={`flex-1 py-1.5 rounded-lg font-medium transition-all ${
                              !useSavedCard ? 'bg-blue-600 text-white shadow-sm' : 'text-zinc-400 hover:text-white'
                            }`}
                          >
                            New Card
                          </button>
                        </div>
                      )}

                      {/* Saved Card Selector */}
                      {useSavedCard && savedCards.length > 0 ? (
                        <div className="space-y-3">
                          <label className="text-[11px] text-zinc-400 block mb-1">Select Vault Saved Card</label>
                          <div className="space-y-2">
                            {savedCards.map((card) => (
                              <label
                                key={card.token}
                                onClick={() => setSelectedToken(card.token)}
                                className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-all ${
                                  selectedToken === card.token
                                    ? 'bg-blue-600/15 border-blue-500 text-white'
                                    : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:border-zinc-700'
                                }`}
                              >
                                <div className="flex items-center gap-3 font-mono text-xs">
                                  <div className="w-8 h-6 rounded bg-zinc-800 border border-zinc-700 flex items-center justify-center font-bold text-[10px] text-blue-400">
                                    {card.brand || 'VISA'}
                                  </div>
                                  <div>
                                    <div className="font-bold text-white">•••• •••• •••• {card.lastFour}</div>
                                    <div className="text-[10px] text-zinc-500">Exp {card.expiryMonth}/{card.expiryYear}</div>
                                  </div>
                                </div>
                                <span className="text-[10px] font-mono text-blue-400 truncate max-w-[90px]">{card.token}</span>
                              </label>
                            ))}
                          </div>

                          <div>
                            <label className="text-[11px] text-zinc-400 block mb-1">CVV Security Code</label>
                            <input
                              type="password"
                              maxLength={4}
                              value={cvv}
                              onChange={(e) => setCvv(e.target.value)}
                              placeholder="123"
                              className="w-full bg-zinc-900 border border-zinc-700/80 rounded-lg px-3 py-2 text-sm text-white font-mono focus:border-blue-500 focus:outline-none"
                            />
                          </div>
                        </div>
                      ) : (
                        /* New Card Form */
                        <>
                          <div>
                            <label className="text-[11px] text-zinc-400 block mb-1">Card Number</label>
                            <input
                              type="text"
                              value={cardNumber}
                              onChange={(e) => setCardNumber(e.target.value)}
                              placeholder="4532 8901 2345 6789"
                              className="w-full bg-zinc-900 border border-zinc-700/80 rounded-lg px-3 py-2 text-sm text-white font-mono focus:border-blue-500 focus:outline-none"
                            />
                          </div>
                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <label className="text-[11px] text-zinc-400 block mb-1">Expiry (MM/YY)</label>
                              <input
                                type="text"
                                value={expiry}
                                onChange={(e) => setExpiry(e.target.value)}
                                placeholder="11/28"
                                className="w-full bg-zinc-900 border border-zinc-700/80 rounded-lg px-3 py-2 text-sm text-white font-mono focus:border-blue-500 focus:outline-none"
                              />
                            </div>
                            <div>
                              <label className="text-[11px] text-zinc-400 block mb-1">CVV</label>
                              <input
                                type="password"
                                maxLength={4}
                                value={cvv}
                                onChange={(e) => setCvv(e.target.value)}
                                placeholder="123"
                                className="w-full bg-zinc-900 border border-zinc-700/80 rounded-lg px-3 py-2 text-sm text-white font-mono focus:border-blue-500 focus:outline-none"
                              />
                            </div>
                          </div>
                          <div>
                            <label className="text-[11px] text-zinc-400 block mb-1">Cardholder Name</label>
                            <input
                              type="text"
                              value={cardHolder}
                              onChange={(e) => setCardHolder(e.target.value)}
                              placeholder="Sarah Jenkins"
                              className="w-full bg-zinc-900 border border-zinc-700/80 rounded-lg px-3 py-2 text-sm text-white focus:border-blue-500 focus:outline-none"
                            />
                          </div>
                          <div className="flex items-center gap-2 pt-1">
                            <input
                              type="checkbox"
                              id="saveCard"
                              checked={saveCard}
                              onChange={(e) => setSaveCard(e.target.checked)}
                              className="rounded bg-zinc-900 border-zinc-700 text-blue-600 focus:ring-0"
                            />
                            <label htmlFor="saveCard" className="text-xs text-zinc-400 select-none">
                              Save card in PCI-DSS Vault for 1-click checkout
                            </label>
                          </div>
                        </>
                      )}
                    </>
                  )}

                  {selectedMethod === 'UPI' && (
                    <div>
                      <label className="text-[11px] text-zinc-400 block mb-1">Virtual Payment Address (VPA)</label>
                      <input
                        type="text"
                        value={vpa}
                        onChange={(e) => setVpa(e.target.value)}
                        placeholder="username@upi or success@razorpay"
                        className="w-full bg-zinc-900 border border-zinc-700/80 rounded-lg px-3 py-2 text-sm text-white font-mono focus:border-blue-500 focus:outline-none"
                      />
                      <p className="text-[10px] text-zinc-500 mt-1">
                        Use <code className="text-blue-400">success@razorpay</code> for test instant approval.
                      </p>
                    </div>
                  )}

                  {selectedMethod === 'NETBANKING' && (
                    <div>
                      <label className="text-[11px] text-zinc-400 block mb-1">Select Bank</label>
                      <select
                        value={selectedBank}
                        onChange={(e) => setSelectedBank(e.target.value)}
                        className="w-full bg-zinc-900 border border-zinc-700/80 rounded-lg px-3 py-2 text-sm text-white focus:border-blue-500 focus:outline-none"
                      >
                        <option value="HDFC">HDFC Bank</option>
                        <option value="ICICI">ICICI Bank</option>
                        <option value="SBI">State Bank of India</option>
                        <option value="AXIS">Axis Bank</option>
                        <option value="KOTAK">Kotak Mahindra</option>
                      </select>
                    </div>
                  )}
                </div>
              </div>

              {errorMessage && (
                <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-xs mt-3 flex items-center gap-2 font-mono">
                  <XCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              <button
                disabled={loading}
                onClick={handlePay}
                className="w-full mt-6 py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-50 font-semibold text-sm text-white flex items-center justify-center gap-2 shadow-lg shadow-blue-600/30 transition-all active:scale-[0.98]"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Processing Payment...</span>
                  </>
                ) : (
                  <>
                    <Lock className="w-4 h-4" />
                    <span>Pay ₹{amountInRupees.toLocaleString('en-IN')}</span>
                  </>
                )}
              </button>
            </>
          )}

          {step === 'AUTHORIZING' && (
            <div className="flex flex-col items-center justify-center py-8 text-center space-y-4">
              <div className="relative">
                <div className="w-16 h-16 rounded-full border-4 border-blue-500/20 border-t-blue-500 animate-spin flex items-center justify-center"></div>
                <ShieldCheck className="w-7 h-7 text-blue-400 absolute inset-0 m-auto" />
              </div>
              <div>
                <h4 className="font-bold text-white text-lg">Authorizing with Bank...</h4>
                <p className="text-xs text-zinc-400 mt-1 max-w-xs">
                  Simulated Bank Callback engine is processing your payment. Please do not close or refresh.
                </p>
              </div>
              <div className="p-3 bg-zinc-900 border border-zinc-800 rounded-lg text-left text-xs font-mono w-full text-zinc-300">
                <p>Status: AUTHORIZING</p>
                <p className="truncate">Payment ID: {currentPayment?.id}</p>
              </div>
            </div>
          )}

          {step === 'SUCCESS' && (
            <div className="flex flex-col items-center justify-center py-6 text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 animate-bounce">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <div>
                <h4 className="font-extrabold text-white text-xl">Payment Successful!</h4>
                <p className="text-xs text-zinc-400 mt-1">₹{amountInRupees.toLocaleString('en-IN')} captured successfully.</p>
              </div>

              <div className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-4 text-xs font-mono text-left space-y-1.5 text-zinc-300">
                <div className="flex justify-between">
                  <span className="text-zinc-500">Payment ID:</span>
                  <span className="text-zinc-200">{currentPayment?.id.slice(0, 18)}...</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-500">Bank Ref:</span>
                  <span className="text-emerald-400">{currentPayment?.bankReference || 'SIM_BANK_REF_OK'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-500">Method:</span>
                  <span className="text-zinc-200">{currentPayment?.method}</span>
                </div>
              </div>

              <button
                onClick={onClose}
                className="w-full py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 font-semibold text-sm text-white shadow-lg shadow-emerald-600/20"
              >
                Close & Return
              </button>
            </div>
          )}

          {step === 'FAILED' && (
            <div className="flex flex-col items-center justify-center py-6 text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-red-500/20 border border-red-500/40 flex items-center justify-center text-red-400">
                <XCircle className="w-10 h-10" />
              </div>
              <div>
                <h4 className="font-extrabold text-white text-xl">Payment Failed</h4>
                <p className="text-xs text-red-400 mt-1 font-mono">{errorMessage}</p>
              </div>

              <button
                onClick={() => setStep('METHOD_SELECT')}
                className="w-full py-3 px-4 rounded-xl bg-zinc-800 hover:bg-zinc-700 font-semibold text-sm text-white border border-zinc-700"
              >
                Try Again
              </button>
            </div>
          )}
        </div>

        <div className="bg-zinc-950 p-3 border-t border-zinc-800 text-center text-[10px] text-zinc-400 flex items-center justify-center gap-1.5">
          <Lock className="w-3 h-3 text-emerald-400" />
          <span>Secured by 256-bit SSL & Simulated Bank Vault</span>
        </div>
      </div>
    </div>
  );
};
