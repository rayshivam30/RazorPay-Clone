import React, { useState } from 'react';
import {
  CreditCard,
  ShieldCheck,
  Zap,
  Activity,
  Layers,
  Lock,
  ArrowRight,
  CheckCircle2,
  Copy,
  Check,
  ChevronRight,
  Smartphone,
  Building2,
  Code,
  Terminal,
  Globe,
  Sparkles,
  Play,
  RotateCcw,
} from 'lucide-react';

interface LandingPageProps {
  onGoToAuth: () => void;
  onGoToDashboard: () => void;
  onOpenCheckoutDemo: () => void;
  isLoggedIn: boolean;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onGoToAuth,
  onGoToDashboard,
  onOpenCheckoutDemo,
  isLoggedIn,
}) => {
  const [activeCodeTab, setActiveCodeTab] = useState<'curl' | 'node' | 'java'>('curl');
  const [copiedCode, setCopiedCode] = useState(false);
  const [demoStep, setDemoStep] = useState<'idle' | 'authorizing' | 'success'>('idle');

  const codeSnippets = {
    curl: `curl -X POST https://api.razorpay.clone/v1/orders \\
  -u rzp_test_KeyId:KeySecret \\
  -H "Content-Type: application/json" \\
  -d '{
    "amount": { "amountUnits": 1500, "currency": "INR" },
    "receipt": "receipt_101",
    "notes": { "merchant_ref": "order_8839" }
  }'`,
    node: `const Razorpay = require('razorpay-node-sdk');

const rzp = new Razorpay({
  key_id: 'rzp_test_KeyId',
  key_secret: 'KeySecret'
});

const order = await rzp.orders.create({
  amount: 1500, // in INR
  currency: 'INR',
  receipt: 'receipt_101'
});`,
    java: `RazorpayClient client = new RazorpayClient("rzp_test_KeyId", "KeySecret");

OrderRequest orderRequest = OrderRequest.builder()
    .amount(Money.of(1500, "INR"))
    .receipt("receipt_101")
    .build();

Order order = client.orders().create(orderRequest);`,
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(codeSnippets[activeCodeTab]);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleRunDemoPayment = () => {
    setDemoStep('authorizing');
    setTimeout(() => {
      setDemoStep('success');
    }, 1800);
  };

  return (
    <div className="min-h-screen bg-[#09090b] text-white selection:bg-blue-600 selection:text-white font-sans overflow-x-hidden">
      {/* Header Navigation */}
      <header className="sticky top-0 z-40 bg-[#0c0c0e]/90 backdrop-blur-md border-b border-zinc-800/80">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center font-black text-white text-base shadow-md shadow-blue-600/30">
              R
            </div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-white text-base tracking-wide">Razorpay</span>
              <span className="text-[10px] font-bold uppercase tracking-wider bg-blue-500/10 text-blue-400 border border-blue-500/20 px-2 py-0.5 rounded">
                GATEWAY CLONE
              </span>
            </div>
          </div>

          <nav className="hidden md:flex items-center gap-6 text-xs font-medium text-zinc-400">
            <a href="#features" className="hover:text-white transition-colors">Features</a>
            <a href="#simulator" className="hover:text-white transition-colors">Widget Simulator</a>
            <a href="#api-docs" className="hover:text-white transition-colors">API Reference</a>
          </nav>

          <div className="flex items-center gap-3">
            {isLoggedIn ? (
              <button
                onClick={onGoToDashboard}
                className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs shadow-md shadow-blue-600/30 transition-all flex items-center gap-1.5"
              >
                <span>Go to Dashboard</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            ) : (
              <button
                onClick={onGoToAuth}
                className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs shadow-md shadow-blue-600/30 transition-all flex items-center gap-1.5"
              >
                <span>Merchant Access</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-16 md:py-20 px-6 max-w-7xl mx-auto border-b border-zinc-800/60">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Hero Content */}
          <div className="lg:col-span-7 space-y-5 text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5 text-blue-400" />
              <span>Production Spring Boot & React Payment Engine</span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight leading-tight">
              Enterprise Payment Infrastructure <br />
              <span className="text-blue-500">Built for Scale & Reliability</span>
            </h1>

            <p className="text-xs sm:text-sm text-zinc-400 font-normal leading-relaxed max-w-2xl">
              Complete Razorpay v1 REST API clone featuring multi-method payment authorization, Redis distributed idempotency locking, PCI-DSS card vault tokenization, and automated daily merchant settlements.
            </p>

            <div className="pt-2 flex flex-wrap items-center gap-3">
              <button
                onClick={isLoggedIn ? onGoToDashboard : onGoToAuth}
                className="px-5 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs shadow-md shadow-blue-600/30 inline-flex items-center gap-2 transition-all"
              >
                <span>{isLoggedIn ? 'Launch Merchant Portal' : 'Access Merchant Portal'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            {/* Quick Tech Badges */}
            <div className="pt-4 border-t border-zinc-800/60 flex flex-wrap items-center gap-5 text-xs text-zinc-400 font-medium">
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>Spring Boot 3.x REST API</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>PostgreSQL State Machine</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>Redis Distributed Locks</span>
              </div>
            </div>
          </div>

          {/* Right Interactive Mockup Widget */}
          <div id="simulator" className="lg:col-span-5">
            <div className="relative mx-auto max-w-sm rounded-2xl bg-[#121215] border border-zinc-800 shadow-xl p-5 overflow-hidden">
              <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded bg-blue-600 flex items-center justify-center font-bold text-white text-xs">
                    R
                  </div>
                  <span className="font-bold text-white text-xs">Razorpay Checkout</span>
                </div>
                <span className="text-xs font-bold text-emerald-400 font-mono">₹1,500.00</span>
              </div>

              {/* Demo Simulator Inside Card */}
              <div className="py-5 space-y-4">
                {demoStep === 'idle' && (
                  <>
                    <div className="space-y-2">
                      <div className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">
                        Select Payment Method
                      </div>
                      <div className="grid grid-cols-3 gap-2 text-xs">
                        <div className="p-2.5 rounded-lg bg-blue-600/20 border border-blue-500/40 text-white font-medium flex flex-col items-center gap-1">
                          <CreditCard className="w-4 h-4 text-blue-400" />
                          <span>Card</span>
                        </div>
                        <div className="p-2.5 rounded-lg bg-zinc-900/80 border border-zinc-800 text-zinc-400 flex flex-col items-center gap-1">
                          <Smartphone className="w-4 h-4 text-zinc-400" />
                          <span>UPI</span>
                        </div>
                        <div className="p-2.5 rounded-lg bg-zinc-900/80 border border-zinc-800 text-zinc-400 flex flex-col items-center gap-1">
                          <Building2 className="w-4 h-4 text-zinc-400" />
                          <span>NetBanking</span>
                        </div>
                      </div>
                    </div>

                    <div className="bg-[#0c0c0e] border border-zinc-800 rounded-xl p-3 space-y-1.5 text-xs font-mono text-zinc-300">
                      <div className="flex justify-between text-[11px]">
                        <span className="text-zinc-500">Card Number</span>
                        <span>4532 •••• •••• 6789</span>
                      </div>
                      <div className="flex justify-between text-[11px]">
                        <span className="text-zinc-500">Holder</span>
                        <span>Sarah Jenkins</span>
                      </div>
                    </div>

                    <button
                      onClick={handleRunDemoPayment}
                      className="w-full py-2.5 rounded-lg bg-blue-600 hover:bg-blue-500 font-bold text-xs text-white shadow-md shadow-blue-600/30 flex items-center justify-center gap-2 transition-all"
                    >
                      <Lock className="w-3.5 h-3.5" />
                      <span>Simulate Pay ₹1,500</span>
                    </button>
                  </>
                )}

                {demoStep === 'authorizing' && (
                  <div className="py-6 flex flex-col items-center justify-center space-y-2 text-center">
                    <div className="w-10 h-10 rounded-full border-2 border-blue-500/20 border-t-blue-500 animate-spin flex items-center justify-center">
                      <ShieldCheck className="w-4 h-4 text-blue-400" />
                    </div>
                    <p className="text-xs font-bold text-white">Authorizing with Bank...</p>
                    <p className="text-[10px] text-zinc-400">Spring Boot state machine verifying payload</p>
                  </div>
                )}

                {demoStep === 'success' && (
                  <div className="py-5 flex flex-col items-center justify-center space-y-2 text-center">
                    <div className="w-10 h-10 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
                      <CheckCircle2 className="w-6 h-6" />
                    </div>
                    <p className="text-xs font-bold text-white">Payment Captured!</p>
                    <p className="text-[10px] text-emerald-400 font-mono">Bank Ref: SIM_BANK_OK_8819</p>

                    <button
                      onClick={() => setDemoStep('idle')}
                      className="mt-1 text-xs font-semibold text-zinc-400 hover:text-white underline flex items-center gap-1"
                    >
                      <RotateCcw className="w-3 h-3" /> Reset Demo
                    </button>
                  </div>
                )}
              </div>

              <div className="pt-2.5 border-t border-zinc-800 text-center text-[10px] text-zinc-500 flex items-center justify-center gap-1">
                <Lock className="w-3 h-3 text-emerald-400" />
                <span>Simulated PCI-DSS Vault & Bank authorization engine</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Metrics Banner */}
      <section className="border-b border-zinc-800/80 bg-[#0c0c0e] py-10 px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          <div>
            <div className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight font-mono">99.99%</div>
            <p className="text-xs text-zinc-400 mt-1 font-medium">Bank Authorization Uptime</p>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-extrabold text-blue-400 tracking-tight font-mono">&lt; 150ms</div>
            <p className="text-xs text-zinc-400 mt-1 font-medium">Idempotency Lock Latency</p>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight font-mono">PCI-DSS</div>
            <p className="text-xs text-zinc-400 mt-1 font-medium">Tokenized Vault Storage</p>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-extrabold text-emerald-400 tracking-tight font-mono">Midnight</div>
            <p className="text-xs text-zinc-400 mt-1 font-medium">Automated Batch Settlement</p>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-16 px-6 max-w-7xl mx-auto space-y-10">
        <div className="space-y-2 text-left">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Built for Modern Gateway Performance
          </h2>
          <p className="text-xs sm:text-sm text-zinc-400 max-w-2xl">
            A standard implementation of core payment processing layers used by Razorpay, Stripe, and Adyen.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          <div className="bg-[#121215] border border-zinc-800/80 rounded-xl p-5 space-y-2.5">
            <div className="w-9 h-9 rounded-lg bg-blue-600/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
              <CreditCard className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-bold text-white">Payment Lifecycle Engine</h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Handles multi-method checkouts (Cards, UPI VPAs, NetBanking) with real-time Spring Boot state machine transitions.
            </p>
          </div>

          <div className="bg-[#121215] border border-zinc-800/80 rounded-xl p-5 space-y-2.5">
            <div className="w-9 h-9 rounded-lg bg-blue-600/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
              <Zap className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-bold text-white">Redis Idempotency Locks</h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Prevents double-charges during concurrent customer checkout attempts using Redis distributed locks and unique idempotency keys.
            </p>
          </div>

          <div className="bg-[#121215] border border-zinc-800/80 rounded-xl p-5 space-y-2.5">
            <div className="w-9 h-9 rounded-lg bg-blue-600/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-bold text-white">PCI-DSS Tokenized Card Vault</h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Safely tokenize credit cards into surrogate tokens (`token_vlt_xxx`) for seamless 1-click customer checkouts without raw PAN exposure.
            </p>
          </div>

          <div className="bg-[#121215] border border-zinc-800/80 rounded-xl p-5 space-y-2.5">
            <div className="w-9 h-9 rounded-lg bg-blue-600/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
              <Activity className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-bold text-white">Webhook Dispatch System</h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Asynchronous event notifications (`payment.captured`, `refund.processed`) sent to merchant webhooks with automated retries.
            </p>
          </div>

          <div className="bg-[#121215] border border-zinc-800/80 rounded-xl p-5 space-y-2.5">
            <div className="w-9 h-9 rounded-lg bg-blue-600/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
              <Layers className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-bold text-white">Automated Daily Settlements</h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Batch calculates gross payments, deducts 2% gateway fee + 18% GST, deducts processed refunds, and issues net payouts.
            </p>
          </div>

          <div className="bg-[#121215] border border-zinc-800/80 rounded-xl p-5 space-y-2.5">
            <div className="w-9 h-9 rounded-lg bg-blue-600/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
              <Lock className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-bold text-white">Dual Auth Architecture</h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              JWT authentication for merchant dashboard access paired with HTTP Basic Auth (`rzp_test_xxx`) for programmatic API key access.
            </p>
          </div>
        </div>
      </section>

      {/* Developer API Code Showcase */}
      <section id="api-docs" className="py-12 px-6 max-w-7xl mx-auto">
        <div className="bg-[#121215] border border-zinc-800 rounded-2xl p-6 sm:p-8 shadow-xl grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-5 space-y-3">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-semibold">
              <Code className="w-3.5 h-3.5" />
              <span>Developer Integration</span>
            </div>
            <h2 className="text-2xl font-extrabold text-white tracking-tight">
              Integrate Checkouts in Minutes
            </h2>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Our REST API mirrors the official Razorpay v1 REST API contract, allowing drop-in integration with standard SDKs.
            </p>

            <div className="space-y-2 pt-1 text-xs text-zinc-300">
              <div className="flex items-center gap-2">
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span>RESTful JSON payloads & status codes</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span>HTTP Basic Authentication (`KeyId:KeySecret`)</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span>Supports partial and full instant refunds</span>
              </div>
            </div>
          </div>

          <div className="lg:col-span-7">
            <div className="bg-[#0c0c0e] border border-zinc-800 rounded-xl overflow-hidden shadow-lg">
              <div className="flex items-center justify-between bg-zinc-900/90 px-4 py-2.5 border-b border-zinc-800">
                <div className="flex items-center gap-2">
                  <Terminal className="w-3.5 h-3.5 text-blue-400" />
                  <span className="text-xs font-mono font-bold text-zinc-300">Create Order Example</span>
                </div>

                <div className="flex items-center gap-2">
                  {(['curl', 'node', 'java'] as const).map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setActiveCodeTab(tab)}
                      className={`px-2.5 py-1 rounded text-xs font-mono font-semibold transition-all ${
                        activeCodeTab === tab
                          ? 'bg-blue-600 text-white'
                          : 'bg-zinc-800 text-zinc-400 hover:text-white'
                      }`}
                    >
                      {tab.toUpperCase()}
                    </button>
                  ))}
                  <button
                    onClick={handleCopyCode}
                    className="p-1 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white ml-1"
                    title="Copy Code"
                  >
                    {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              <pre className="p-4 font-mono text-xs text-zinc-300 overflow-x-auto bg-[#09090b] leading-relaxed">
                {codeSnippets[activeCodeTab]}
              </pre>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA Banner */}
      <section className="py-12 px-6 max-w-7xl mx-auto">
        <div className="bg-[#121215] border border-zinc-800 rounded-2xl p-8 sm:p-10 text-center space-y-4 shadow-xl">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight max-w-xl mx-auto">
            Ready to Test the Razorpay Gateway Pipeline?
          </h2>
          <p className="text-xs text-zinc-400 max-w-md mx-auto leading-relaxed">
            Create a merchant test account and test complete payment captures, API key generation, and settlement runs.
          </p>

          <div className="pt-2 flex justify-center">
            <button
              onClick={isLoggedIn ? onGoToDashboard : onGoToAuth}
              className="px-6 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-md shadow-blue-600/30 inline-flex items-center gap-1.5 transition-all"
            >
              <span>{isLoggedIn ? 'Go to Merchant Dashboard' : 'Access Merchant Portal'}</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-zinc-800/80 bg-[#0c0c0e] py-8 px-6 text-xs text-zinc-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded bg-blue-600 flex items-center justify-center font-bold text-white text-[10px]">
              R
            </div>
            <span className="font-bold text-zinc-300">Razorpay Gateway Clone</span>
            <span>— Open Source</span>
          </div>

          <div className="flex items-center gap-4">
            <a href="https://github.com/rayshivam30/razorpay-clone" target="_blank" rel="noreferrer" className="hover:text-zinc-300 flex items-center gap-1">
              <Globe className="w-3.5 h-3.5" /> GitHub Repository
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
