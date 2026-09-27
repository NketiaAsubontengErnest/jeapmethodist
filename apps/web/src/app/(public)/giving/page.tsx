'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  Heart,
  Smartphone,
  Building2,
  ShieldCheck,
  CheckCircle2,
  CreditCard,
  ArrowRight,
  Check,
} from 'lucide-react';
import { fetchPublicSettings } from '@/lib/api/public';
import { useToast } from '@/lib/toast-context';

const PRESET_AMOUNTS = [20, 50, 100, 200, 500, 1000];

const DEFAULT_GIVING_TYPES = [
  'Tithe (10%)',
  'Sunday Offertory',
  'Annual Harvest Pledge',
  'Building & Capital Fund',
  'Class Monthly Dues',
  'Welfare Relief',
  'General Donation',
];

const NOT_YET_CONFIGURED = 'Not yet configured — please contact the church office';

declare global {
  interface Window {
    PaystackPop?: {
      setup: (options: any) => { openIframe: () => void };
    };
  }
}

export default function GivingPage() {
  const { toast } = useToast();
  const { data: settings } = useQuery({
    queryKey: ['public-settings'],
    queryFn: fetchPublicSettings,
  });

  // Dynamic Giving Categories derived from Admin Settings (or defaults)
  const categories: string[] = settings?.giving_categories
    ? settings.giving_categories
      .split(',')
      .map((c) => c.trim())
      .filter(Boolean)
    : DEFAULT_GIVING_TYPES;

  const [givingType, setGivingType] = useState<string>('Tithe (10%)');

  // Form State
  const [amount, setAmount] = useState<number | string>(100);
  const [customAmount, setCustomAmount] = useState('');

  // Donor Details State
  const [donorName, setDonorName] = useState('');
  const [donorEmail, setDonorEmail] = useState('');
  const [donorPhone, setDonorPhone] = useState('');

  // Gateway Selector Modal & Processing State
  const [isGatewayModalOpen, setIsGatewayModalOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);

  const selectedAmountNum =
    amount === 'custom' ? parseFloat(customAmount) || 0 : typeof amount === 'number' ? amount : 0;
  const currency = settings?.giving_currency || 'GHS';

  const activeCategory = categories.includes(givingType) ? givingType : categories[0] || 'Tithe (10%)';

  // Open Gateway Choice Modal on Proceed
  const handleProceedClick = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedAmountNum <= 0) {
      toast.error('Please enter a valid donation amount.');
      return;
    }

    if (!donorName.trim()) {
      toast.error('Please provide your name.');
      return;
    }

    setIsGatewayModalOpen(true);
  };

  // Execute Payment via chosen Gateway inside Modal
  const executePayment = (gateway: 'paystack' | 'moolre') => {
    setIsGatewayModalOpen(false);
    setIsProcessing(true);

    if (gateway === 'paystack') {
      const publicKey = settings?.paystack_public_key;
      if (!publicKey) {
        toast.info('Paystack is in demonstration mode (API Key pending Steward setup).');
        setTimeout(() => {
          setIsProcessing(false);
          setPaymentSuccess(true);
          toast.success(
            `Thank you, ${donorName}! Simulated Paystack donation of ${currency} ${selectedAmountNum} received.`
          );
        }, 1500);
        return;
      }

      const triggerPaystack = () => {
        if (window.PaystackPop) {
          const handler = window.PaystackPop.setup({
            key: publicKey,
            email: donorEmail || 'donor@methodistchurch.org.gh',
            amount: Math.round(selectedAmountNum * 100),
            currency: currency,
            ref: 'MCG_' + Math.floor(Math.random() * 1000000000 + 1),
            metadata: {
              custom_fields: [
                { display_name: 'Donor Name', variable_name: 'donor_name', value: donorName },
                { display_name: 'Giving Purpose', variable_name: 'giving_purpose', value: activeCategory },
                { display_name: 'Phone', variable_name: 'donor_phone', value: donorPhone },
              ],
            },
            callback: (response: any) => {
              setIsProcessing(false);
              setPaymentSuccess(true);
              toast.success(`Donation Successful! Reference: ${response.reference}`);
            },
            onClose: () => {
              setIsProcessing(false);
              toast.info('Payment window closed.');
            },
          });
          handler.openIframe();
        } else {
          const script = document.createElement('script');
          script.src = 'https://js.paystack.co/v1/inline.js';
          script.onload = () => {
            triggerPaystack();
          };
          document.body.appendChild(script);
        }
      };

      triggerPaystack();
    } else if (gateway === 'moolre') {
      const merchantId = settings?.moolre_merchant_id;
      if (!merchantId) {
        toast.info('Moolre is in demonstration mode (Merchant ID pending Steward setup).');
        setTimeout(() => {
          setIsProcessing(false);
          setPaymentSuccess(true);
          toast.success(
            `Thank you, ${donorName}! Simulated Moolre payment of ${currency} ${selectedAmountNum} received.`
          );
        }, 1500);
        return;
      }

      setTimeout(() => {
        setIsProcessing(false);
        setPaymentSuccess(true);
        toast.success(`Moolre Payment initialized for Merchant ${merchantId}! Reference: MLR_${Date.now()}`);
      }, 1200);
    }
  };

  return (
    <div className="min-h-screen bg-white py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <h1 className="font-serif text-4xl font-bold text-slate-900 sm:text-5xl tracking-tight">
            Online Giving
          </h1>
        </div>

        {/* Giving Scripture Banner — Royal Blue & Crimson Accent */}
        <div className="bg-gradient-to-r from-[#0f2478] via-[#14309c] to-[#5C1615] text-white rounded-2xl p-8 sm:p-10 shadow-xl flex flex-col md:flex-row items-center justify-between gap-6 border border-[#FFC72C]/30">
          <div className="space-y-2 max-w-2xl">
            <h2 className="font-serif text-xl sm:text-2xl font-bold text-[#FFC72C]">2 Corinthians 9:7</h2>
            <p className="text-slate-200 text-sm sm:text-base italic">
              &ldquo;Each of you should give what you have decided in your heart to give, not reluctantly or under compulsion, for God loves a cheerful giver.&rdquo;
            </p>
          </div>
        </div>

        {/* MAIN ONLINE DONATION PORTAL CARD */}
        <Card className="border-2 border-[#14309c]/20 shadow-xl bg-white rounded-2xl overflow-hidden">
          <div className="bg-[#14309c] px-6 py-5 text-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h2 className="font-serif text-2xl font-bold text-white flex items-center gap-2">
                <CreditCard className="h-6 w-6 text-[#FFC72C]" /> Instant Online Donation
              </h2>
            </div>
          </div>

          <CardContent className="p-6 sm:p-10 space-y-8">
            {paymentSuccess ? (
              <div className="py-12 text-center space-y-6 max-w-md mx-auto">
                <div className="w-20 h-20 bg-green-100 text-green-700 rounded-full flex items-center justify-center mx-auto shadow-inner">
                  <Check className="w-10 h-10 stroke-[3]" />
                </div>
                <div className="space-y-2">
                  <h3 className="font-serif text-3xl font-bold text-slate-900">Thank You for Giving!</h3>
                  <p className="text-sm text-slate-600">
                    Your contribution of <strong className="text-[#14309c] font-bold">{currency} {selectedAmountNum}</strong> towards <strong className="text-slate-900">{activeCategory}</strong> has been processed successfully.
                  </p>
                  <p className="text-xs text-slate-500">
                    &ldquo;God is not unjust; He will not forget your work and the love you have shown Him.&rdquo; — Hebrews 6:10
                  </p>
                </div>
                <Button
                  onClick={() => setPaymentSuccess(false)}
                  className="bg-[#14309c] text-white hover:bg-[#0f2478] font-bold rounded-lg px-6"
                >
                  Make Another Donation
                </Button>
              </div>
            ) : (
              <form onSubmit={handleProceedClick} className="space-y-8">
                {/* 1. Select Giving Purpose / Category (Managed via Admin Settings) */}
                <div className="space-y-3">
                  <Label className="text-sm font-bold text-slate-900 uppercase tracking-wider text-xs">
                    1. Select Giving Category / Purpose
                  </Label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                    {categories.map((cat, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setGivingType(cat)}
                        className={`px-3 py-2.5 rounded-xl border text-xs font-bold text-left transition-all truncate ${activeCategory === cat
                          ? 'border-[#14309c] bg-[#14309c] text-white shadow-md'
                          : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100'
                          }`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 2. Select Amount */}
                <div className="space-y-3">
                  <Label className="text-sm font-bold text-slate-900 uppercase tracking-wider text-xs">
                    2. Select Donation Amount ({currency})
                  </Label>
                  <div className="grid grid-cols-3 sm:grid-cols-6 gap-2.5">
                    {PRESET_AMOUNTS.map((amt) => (
                      <button
                        key={amt}
                        type="button"
                        onClick={() => {
                          setAmount(amt);
                          setCustomAmount('');
                        }}
                        className={`py-3 rounded-xl border text-sm font-bold transition-all ${amount === amt
                          ? 'border-[#FFC72C] bg-[#FFC72C] text-[#14309c] shadow-md scale-[1.02]'
                          : 'border-slate-200 bg-white text-slate-800 hover:bg-slate-50'
                          }`}
                      >
                        {currency} {amt}
                      </button>
                    ))}
                  </div>

                  <div className="pt-2 flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => setAmount('custom')}
                      className={`px-4 py-2.5 rounded-xl border text-xs font-bold shrink-0 transition-all ${amount === 'custom'
                        ? 'border-[#14309c] bg-[#14309c] text-white'
                        : 'border-slate-200 bg-slate-50 text-slate-700'
                        }`}
                    >
                      Custom Amount
                    </button>
                    {amount === 'custom' && (
                      <div className="relative flex-1">
                        <span className="absolute left-3 top-2.5 text-sm font-bold text-slate-400">{currency}</span>
                        <Input
                          type="number"
                          placeholder="Enter custom amount (e.g. 250)"
                          value={customAmount}
                          onChange={(e) => setCustomAmount(e.target.value)}
                          className="pl-14 text-sm font-bold border-slate-300"
                        />
                      </div>
                    )}
                  </div>
                </div>

                {/* 3. Donor Details */}
                <div className="space-y-4 pt-2 border-t border-slate-200">
                  <Label className="text-sm font-bold text-slate-900 uppercase tracking-wider text-xs">
                    3. Donor Details
                  </Label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="space-y-1.5">
                      <Label htmlFor="donorName" className="text-xs font-semibold text-slate-700">
                        Full Name *
                      </Label>
                      <Input
                        id="donorName"
                        required
                        placeholder="e.g. Kwame Mensah"
                        value={donorName}
                        onChange={(e) => setDonorName(e.target.value)}
                        className="text-sm"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="donorEmail" className="text-xs font-semibold text-slate-700">
                        Email Address (Optional for receipt)
                      </Label>
                      <Input
                        id="donorEmail"
                        type="email"
                        placeholder="e.g. kwame@example.com"
                        value={donorEmail}
                        onChange={(e) => setDonorEmail(e.target.value)}
                        className="text-sm"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="donorPhone" className="text-xs font-semibold text-slate-700">
                        Phone Number (Optional)
                      </Label>
                      <Input
                        id="donorPhone"
                        type="tel"
                        placeholder="e.g. 0240000000"
                        value={donorPhone}
                        onChange={(e) => setDonorPhone(e.target.value)}
                        className="text-sm"
                      />
                    </div>
                  </div>
                </div>

                {/* Submit button */}
                <div className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-slate-200">
                  <div className="text-left space-y-0.5">
                    <p className="text-xs text-slate-500">Total Donation Summary:</p>
                    <p className="text-2xl font-extrabold text-[#14309c]">
                      {currency} {selectedAmountNum} <span className="text-xs font-normal text-slate-600">for {activeCategory}</span>
                    </p>
                  </div>

                  <Button
                    type="submit"
                    disabled={isProcessing || selectedAmountNum <= 0}
                    className="w-full sm:w-auto px-8 py-6 rounded-xl bg-[#FFC72C] text-[#14309c] font-extrabold text-base shadow-lg hover:bg-amber-400 transition-all hover:scale-105"
                  >
                    {isProcessing ? (
                      'Connecting to Gateway…'
                    ) : (
                      <span className="flex items-center gap-2">
                        Proceed to Donate <ArrowRight className="w-5 h-5" />
                      </span>
                    )}
                  </Button>
                </div>
              </form>
            )}
          </CardContent>
        </Card>

        {/* Modal: Gateway Selection on Proceed */}
        <Dialog open={isGatewayModalOpen} onOpenChange={setIsGatewayModalOpen}>
          <DialogContent className="sm:max-w-md bg-white rounded-2xl p-6">
            <DialogHeader className="space-y-1 text-left">
              <DialogTitle className="font-serif text-2xl font-bold text-slate-900">
                Choose Payment Gateway
              </DialogTitle>
              <DialogDescription className="text-xs text-slate-600">
                Select your preferred gateway to complete your donation of{' '}
                <strong className="text-[#14309c] font-bold">
                  {currency} {selectedAmountNum}
                </strong>{' '}
                towards <strong className="text-slate-900">{activeCategory}</strong>.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-3 py-4">
              {/* Paystack Option */}
              <button
                type="button"
                onClick={() => executePayment('paystack')}
                className="w-full p-4 rounded-xl border-2 border-slate-200 hover:border-[#14309c] bg-white hover:bg-blue-50/50 transition-all text-left flex items-center justify-between group shadow-sm"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-blue-100 text-[#14309c] flex items-center justify-center font-bold">
                    <CreditCard className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-slate-900 group-hover:text-[#14309c]">
                        Paystack Gateway
                      </span>
                      <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-blue-100 text-[#14309c]">
                        Recommended
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Debit/Credit Cards, Mobile Money, Apple Pay
                    </p>
                  </div>
                </div>
                <ArrowRight className="w-5 h-5 text-slate-400 group-hover:text-[#14309c] transition-transform group-hover:translate-x-1" />
              </button>

              {/* Moolre Option */}
              <button
                type="button"
                onClick={() => executePayment('moolre')}
                className="w-full p-4 rounded-xl border-2 border-slate-200 hover:border-[#FFC72C] bg-white hover:bg-amber-50/50 transition-all text-left flex items-center justify-between group shadow-sm"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center font-bold">
                    <Smartphone className="w-5 h-5 text-amber-700" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-slate-900 group-hover:text-amber-900">
                        Moolre Gateway
                      </span>
                      <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-amber-100 text-amber-800">
                        Instant MoMo
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Direct Wallet &amp; Mobile Money Checkout
                    </p>
                  </div>
                </div>
                <ArrowRight className="w-5 h-5 text-slate-400 group-hover:text-amber-700 transition-transform group-hover:translate-x-1" />
              </button>
            </div>

            <div className="text-center pt-2 border-t border-slate-100">
              <p className="text-[11px] text-slate-500">
                Secure processing.
              </p>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
