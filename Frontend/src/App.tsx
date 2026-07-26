import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { AuthPage } from './pages/Auth';
import { Sidebar } from './components/Sidebar';
import type { NavTab } from './components/Sidebar';
import { Header } from './components/Header';
import { DashboardOverview } from './pages/DashboardOverview';
import { Payments } from './pages/Payments';
import { Refunds } from './pages/Refunds';
import { ApiKeys } from './pages/ApiKeys';
import { Operations } from './pages/Operations';
import { Vault } from './pages/Vault';
import { CheckoutModal } from './components/CheckoutModal';
import { CreditCard, ArrowRight } from 'lucide-react';
import { ordersApi } from './services/api';

const DashboardContent: React.FC = () => {
  const { token, apiKeyId, apiKeySecret } = useAuth();
  const [activeTab, setActiveTab] = useState<NavTab>('overview');

  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [checkoutOrderId, setCheckoutOrderId] = useState('order_demo_101');
  const [checkoutAmount, setCheckoutAmount] = useState(1500);

  if (!token) {
    return <AuthPage />;
  }

  const handleOpenCheckout = (orderId: string, amount: number) => {
    setCheckoutOrderId(orderId);
    setCheckoutAmount(amount);
    setIsCheckoutOpen(true);
  };

  const getTitle = () => {
    switch (activeTab) {
      case 'overview':
        return 'Dashboard Overview';
      case 'checkout':
        return 'Checkout Widget Simulator';
      case 'payments':
        return 'Payments Lifecycle';
      case 'refunds':
        return 'Refunds Manager';
      case 'apikeys':
        return 'API Key Management';
      case 'operations':
        return 'Operations & Webhooks';
      case 'vault':
        return 'Saved Cards Vault';
      default:
        return 'Dashboard';
    }
  };

  return (
    <div className="min-h-screen bg-[#09090b] text-white flex">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

      <div className="flex-1 ml-64 flex flex-col min-h-screen">
        <Header title={getTitle()} />

        <main className="flex-1 p-8 overflow-y-auto">
          {activeTab === 'overview' && (
            <DashboardOverview
              onOpenCheckout={handleOpenCheckout}
              onNavigateTab={setActiveTab}
            />
          )}

          {activeTab === 'checkout' && (
            <div className="space-y-6 animate-fadeIn">
              {!apiKeyId || !apiKeySecret ? (
                <div className="bg-[#121215] border border-amber-500/30 rounded-2xl p-8 shadow-xl text-center space-y-4 max-w-xl mx-auto my-12">
                  <div className="w-16 h-16 rounded-2xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400 mx-auto">
                    <CreditCard className="w-8 h-8" />
                  </div>
                  <h3 className="text-xl font-bold text-white">API Key Required</h3>
                  <p className="text-xs text-amber-400 max-w-md mx-auto">
                    The checkout simulator requires active API keys to process payments. JWT authentication is not sufficient for payment operations.
                  </p>
                  <div className="pt-4">
                    <button
                      onClick={() => setActiveTab('apikeys')}
                      className="px-6 py-3 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-semibold text-sm shadow-xl shadow-amber-600/30 inline-flex items-center gap-2"
                    >
                      <span>Set Up API Keys</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ) : (
                <div className="bg-[#121215] border border-zinc-800 rounded-2xl p-8 shadow-xl text-center space-y-4 max-w-xl mx-auto my-12">
                  <div className="w-16 h-16 rounded-2xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400 mx-auto">
                    <CreditCard className="w-8 h-8" />
                  </div>
                  <h3 className="text-xl font-bold text-white">Razorpay Checkout Widget Simulator</h3>
                  <p className="text-xs text-zinc-400 max-w-md mx-auto">
                    Test customer payment checkouts (Card, UPI VPA, NetBanking) with real-time Spring Boot bank authorization simulation.
                  </p>

                  <div className="pt-4">
                    <button
                      onClick={async () => {
                        try {
                          const newOrder = await ordersApi.create({
                            amount: { amountUnits: 1500, currency: 'INR' },
                            receipt: `rcpt_${Math.floor(Math.random() * 10000)}`,
                            notes: { demo: 'Checkout Simulator' },
                          });
                          handleOpenCheckout(newOrder.id, newOrder.amount.amountUnits);
                        } catch (err: any) {
                          if (err.message?.includes('API key required')) {
                            alert('⚠️ API Key Required\n\nThe checkout simulator requires active API keys to function. Please:\n\n1. Go to API Keys section\n2. Create a new API key for TEST environment\n3. The key will be automatically activated\n4. Return here to test checkout\n\nCurrently using JWT authentication which is not sufficient for payment operations.');
                          } else {
                            alert(err.response?.data?.message || err.message || 'Failed to create order for checkout');
                          }
                        }
                      }}
                      className="px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-sm shadow-xl shadow-blue-600/30 inline-flex items-center gap-2"
                    >
                      <span>Launch Checkout Modal (₹1,500)</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'payments' && <Payments />}

          {activeTab === 'refunds' && <Refunds />}

          {activeTab === 'apikeys' && <ApiKeys />}

          {activeTab === 'operations' && <Operations />}

          {activeTab === 'vault' && <Vault />}
        </main>
      </div>

      <CheckoutModal
        orderId={checkoutOrderId}
        amountInRupees={checkoutAmount}
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
      />
    </div>
  );
};

export function App() {
  return (
    <AuthProvider>
      <DashboardContent />
    </AuthProvider>
  );
}

export default App;
