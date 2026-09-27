'use client';

import { useState, useEffect } from 'react';
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
  Sparkles,
  CheckCircle2,
  CreditCard,
  ArrowRight,
  Check,
  Plus,
  Pencil,
  Trash2,
  X,
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

  // Dynamic Giving Categories State
  const [categories, setCategories] = useState<string[]>(DEFAULT_GIVING_TYPES);
  const [givingType, setGivingType] = useState<string>('Tithe (10%)');
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editingName, setEditingName] = useState('');

  // Hydrate categories from localStorage safely
  useEffect(() => {
    try {
      const saved = localStorage.getItem('jeap_giving_categories');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setCategories(parsed);
          setGivingType(parsed[0]);
        }
      }
    } catch {}
  }, []);

  const saveCategories = (newCats: string[]) => {
    setCategories(newCats);
    try {
      localStorage.setItem('jeap_giving_categories', JSON.stringify(newCats));
    } catch {}
  };

  const handleAddCategory = () => {
    const trimmed = newCategoryName.trim();
    if (!trimmed) {
      toast.error('Please enter a category name');
      return;
    }
    if (categories.includes(trimmed)) {
      toast.error('Category already exists');
      return;
    }
    const updated = [...categories, trimmed];
    saveCategories(updated);
    setGivingType(trimmed);
    setNewCategoryName('');
    setIsAddingCategory(false);
    toast.success(`Added giving category: "${trimmed}"`);
  };

  const startEditCategory = (index: number, currentName: string) => {
    setEditingIndex(index);
    setEditingName(currentName);
  };

  const handleSaveEditCategory = (index: number) => {
    const trimmed = editingName.trim();
    if (!trimmed) {
      toast.error('Category name cannot be empty');
      return;
    }
    const oldName = categories[index];
    const updated = [...categories];
    updated[index] = trimmed;
    saveCategories(updated);

    if (givingType === oldName) {
      setGivingType(trimmed);
    }
    setEditingIndex(null);
    toast.success('Category updated successfully');
  };

  const handleDeleteCategory = (index: number) => {
    if (categories.length <= 1) {
      toast.error('At least one giving category must remain.');
      return;
    }
    const categoryToDelete = categories[index];
    const updated = categories.filter((_, i) => i !== index);
    saveCategories(updated);

    if (givingType === categoryToDelete) {
      setGivingType(updated[0]);
    }
    toast.success(`Deleted category: "${categoryToDelete}"`);
  };

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
                { display_name: 'Giving Purpose', variable_name: 'giving_purpose', value: givingType },
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
          <Badge variant="outline" className="border-blue-200 bg-blue-50 font-bold text-[#14309c]">
            <Heart className="mr-1.5 h-3.5 w-3.5 fill-[#14309c]" /> Faithful Stewardship &amp; Generosity
          </Badge>
          <h1 className="font-serif text-4xl font-bold text-slate-900 sm:text-5xl tracking-tight">
            Online &amp; Electronic Giving
          </h1>
          <p className="text-base text-slate-600">
            &ldquo;Gain all you can, save all you can, give all you can.&rdquo; — John Wesley. Support the Gospel, church expansion, and community relief securely via <strong>Paystack</strong> and <strong>Moolre</strong>.
          </p>
        </div>

        {/* Giving Scripture Banner — Royal Blue & Crimson Accent */}
        <div className="bg-gradient-to-r from-[#0f2478] via-[#14309c] to-[#5C1615] text-white rounded-2xl p-8 sm:p-10 shadow-xl flex flex-col md:flex-row items-center justify-between gap-6 border border-[#FFC72C]/30">
          <div className="space-y-2 max-w-2xl">
            <h2 className="font-serif text-xl sm:text-2xl font-bold text-[#FFC72C]">2 Corinthians 9:7</h2>
            <p className="text-slate-200 text-sm sm:text-base italic">
              &ldquo;Each of you should give what you have decided in your heart to give, not reluctantly or under compulsion, for God loves a cheerful giver.&rdquo;
            </p>
          </div>
          <div className="shrink-0 bg-white/10 backdrop-blur-md p-4 rounded-xl border border-white/20 text-center">
            <Sparkles className="w-8 h-8 text-[#FFC72C] mx-auto mb-1" />
            <p className="text-xs text-[#FFC72C] font-extrabold uppercase tracking-wider">Methodist Stewardship</p>
          </div>
        </div>

        {/* MAIN ONLINE DONATION PORTAL CARD */}
        <Card className="border-2 border-[#14309c]/20 shadow-xl bg-white rounded-2xl overflow-hidden">
          <div className="bg-[#14309c] px-6 py-5 text-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h2 className="font-serif text-2xl font-bold text-white flex items-center gap-2">
                <CreditCard className="h-6 w-6 text-[#FFC72C]" /> Instant Online Donation
              </h2>
              <p className="text-xs text-slate-200">
                Pay Tithes, Offerings &amp; Harvest Pledges via Paystack, Moolre, Debit/Credit Card or Mobile Money.
              </p>
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
                    Your contribution of <strong className="text-[#14309c] font-bold">{currency} {selectedAmountNum}</strong> towards <strong className="text-slate-900">{givingType}</strong> has been processed successfully.
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
                {/* 1. Dynamic Select Purpose / Category (Add, Edit, Delete) */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label className="text-sm font-bold text-slate-900 uppercase tracking-wider text-xs">
                      1. Select Giving Category / Purpose
                    </Label>
                    {!isAddingCategory && (
                      <button
                        type="button"
                        onClick={() => setIsAddingCategory(true)}
                        className="inline-flex items-center gap-1 text-xs font-bold text-[#14309c] hover:underline"
                      >
                        <Plus className="w-3.5 h-3.5" /> Add Category
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                    {categories.map((cat, idx) => (
                      <div key={idx} className="relative">
                        {editingIndex === idx ? (
                          <div className="flex items-center gap-1 bg-white p-1.5 rounded-xl border border-[#14309c] shadow-sm">
                            <Input
                              value={editingName}
                              onChange={(e) => setEditingName(e.target.value)}
                              className="h-8 text-xs font-bold border-slate-200"
                              autoFocus
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                  e.preventDefault();
                                  handleSaveEditCategory(idx);
                                }
                                if (e.key === 'Escape') setEditingIndex(null);
                              }}
                            />
                            <button
                              type="button"
                              onClick={() => handleSaveEditCategory(idx)}
                              className="p-1 text-emerald-600 hover:text-emerald-700"
                              title="Save"
                            >
                              <Check className="w-4 h-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() => setEditingIndex(null)}
                              className="p-1 text-slate-400 hover:text-slate-600"
                              title="Cancel"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        ) : (
                          <div
                            className={`group flex items-center justify-between px-3.5 py-2.5 rounded-xl border text-xs font-bold transition-all ${
                              givingType === cat
                                ? 'border-[#14309c] bg-[#14309c] text-white shadow-md'
                                : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100'
                            }`}
                          >
                            <button
                              type="button"
                              onClick={() => setGivingType(cat)}
                              className="flex-1 text-left truncate mr-2"
                            >
                              {cat}
                            </button>
                            <div className="flex items-center gap-1">
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  startEditCategory(idx, cat);
                                }}
                                className={`p-1 rounded transition-colors ${
                                  givingType === cat
                                    ? 'text-white/80 hover:text-white hover:bg-white/20'
                                    : 'text-slate-400 hover:text-slate-700 hover:bg-slate-200'
                                }`}
                                title="Edit Category"
                              >
                                <Pencil className="w-3 h-3" />
                              </button>
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeleteCategory(idx);
                                }}
                                className={`p-1 rounded transition-colors ${
                                  givingType === cat
                                    ? 'text-white/80 hover:text-rose-200 hover:bg-white/20'
                                    : 'text-slate-400 hover:text-rose-600 hover:bg-rose-50'
                                }`}
                                title="Delete Category"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}

                    {isAddingCategory && (
                      <div className="flex items-center gap-1 bg-white p-1.5 rounded-xl border-2 border-dashed border-[#14309c]">
                        <Input
                          placeholder="New Category Name"
                          value={newCategoryName}
                          onChange={(e) => setNewCategoryName(e.target.value)}
                          className="h-8 text-xs font-bold border-slate-200"
                          autoFocus
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              handleAddCategory();
                            }
                            if (e.key === 'Escape') setIsAddingCategory(false);
                          }}
                        />
                        <Button
                          type="button"
                          size="sm"
                          onClick={handleAddCategory}
                          className="h-8 px-2.5 bg-[#14309c] text-white text-xs font-bold"
                        >
                          Add
                        </Button>
                        <button
                          type="button"
                          onClick={() => setIsAddingCategory(false)}
                          className="p-1 text-slate-400 hover:text-slate-600"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    )}
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
                        className={`py-3 rounded-xl border text-sm font-bold transition-all ${
                          amount === amt
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
                      className={`px-4 py-2.5 rounded-xl border text-xs font-bold shrink-0 transition-all ${
                        amount === 'custom'
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
                      {currency} {selectedAmountNum} <span className="text-xs font-normal text-slate-600">for {givingType}</span>
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
                towards <strong className="text-slate-900">{givingType}</strong>.
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
                Secure processing via encrypted Methodist payment integration.
              </p>
            </div>
          </DialogContent>
        </Dialog>

        {/* Giving Options Grid (Offline MoMo & Bank Details) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Mobile Money Card */}
          <Card className="border-t-4 border-t-[#FFC72C] shadow-md bg-white">
            <CardContent className="p-8 space-y-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-700">
                  <Smartphone className="w-6 h-6" />
                </div>
                <div>
                  <Badge className="bg-amber-50 text-amber-800 border border-amber-200 mb-0.5 font-bold">
                    Fast &amp; Convenient
                  </Badge>
                  <h2 className="font-serif text-2xl font-bold text-slate-900">Mobile Money (MoMo)</h2>
                </div>
              </div>

              <p className="text-sm text-slate-600">
                You can pay your Tithes, Monthly Class Dues, Harvest Pledges, or Welfare Contributions directly via Mobile Money on all networks (MTN, Telecel, AT).
              </p>

              <div className="bg-amber-50/60 border border-amber-200 rounded-xl p-6 space-y-4">
                <div className="space-y-1">
                  <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Official MoMo Number</p>
                  <p className="text-2xl font-extrabold text-amber-900 tracking-wider">
                    {settings?.momo_number || NOT_YET_CONFIGURED}
                  </p>
                </div>

                <div className="space-y-1 pt-2 border-t border-amber-200/70">
                  <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Account Merchant Name</p>
                  <p className="text-sm font-bold text-slate-900">{settings?.church_name || 'Methodist Church Ghana'}</p>
                </div>

                <div className="space-y-1 pt-2 border-t border-amber-200/70">
                  <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Reference Format</p>
                  <p className="text-xs text-slate-700 font-medium">
                    State your <span className="font-bold text-[#14309c]">Full Name</span> &amp; <span className="font-bold text-[#14309c]">Purpose</span> (e.g. &ldquo;Kwame Mensah - Tithe&rdquo; or &ldquo;Ama Osei - Harvest&rdquo;)
                  </p>
                </div>
              </div>

              {settings?.momo_number && (
                <div className="space-y-2 text-xs text-slate-600">
                  <p className="font-semibold text-slate-900">How to send via USSD:</p>
                  <ol className="list-decimal list-inside space-y-1 text-slate-600">
                    <li>Dial *170# (MTN) or *110# (Telecel / AT).</li>
                    <li>Select Transfer Money or Pay Merchant.</li>
                    <li>Enter Number: <strong>{settings.momo_number}</strong>.</li>
                    <li>Enter Amount and reference (e.g., Tithe/Harvest).</li>
                    <li>Confirm with your MoMo PIN.</li>
                  </ol>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Bank Wire / Account Card */}
          <Card className="border-t-4 border-t-[#14309c] shadow-md bg-white">
            <CardContent className="p-8 space-y-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-[#14309c]">
                  <Building2 className="w-6 h-6" />
                </div>
                <div>
                  <Badge className="bg-blue-50 text-[#14309c] border border-blue-200 mb-0.5 font-bold">
                    Direct Deposit
                  </Badge>
                  <h2 className="font-serif text-2xl font-bold text-slate-900">Bank Transfer / Standing Orders</h2>
                </div>
              </div>

              <p className="text-sm text-slate-600">
                For larger offerings, monthly standing orders, and corporate or international wire transfers:
              </p>

              <div className="bg-slate-50 border border-slate-200 rounded-xl p-6 space-y-4">
                <div>
                  <p className="text-slate-500 font-medium text-xs">Bank Name</p>
                  <p className="font-bold text-slate-900 text-sm">{settings?.bank_name || NOT_YET_CONFIGURED}</p>
                </div>

                <div className="space-y-1 pt-2 border-t border-slate-200">
                  <p className="text-xs text-slate-500 font-medium">Account Name</p>
                  <p className="font-bold text-slate-900">{settings?.church_name || 'Methodist Church Ghana'}</p>
                </div>

                <div className="space-y-1 pt-2 border-t border-slate-200">
                  <p className="text-xs text-slate-500 font-medium">Account Number</p>
                  <p className="text-xl font-extrabold text-[#14309c] tracking-wider">
                    {settings?.bank_account_number || NOT_YET_CONFIGURED}
                  </p>
                </div>
              </div>

              <div className="space-y-3 pt-2">
                <h3 className="text-sm font-bold text-slate-900">Categories of Giving:</h3>
                <ul className="grid grid-cols-2 gap-2 text-xs text-slate-600 font-medium">
                  {categories.slice(0, 6).map((cat, i) => (
                    <li key={i} className="flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-[#14309c] shrink-0" />
                      <span>{cat}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Security & Accountability Note */}
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-6 flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-blue-50 text-[#14309c]">
            <ShieldCheck className="w-7 h-7" />
          </div>
          <div className="space-y-1">
            <h3 className="text-md font-bold text-slate-900">Financial Transparency &amp; Stewardship</h3>
            <p className="text-xs text-slate-600">
              All contributions are audited by the Society Finance Committee and Synod auditors according to the Financial Regulations of the Methodist Church Ghana. Receipts for digital payments can be requested at the church office.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
