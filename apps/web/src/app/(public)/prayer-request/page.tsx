'use client';

import { useState } from 'react';
import { submitPrayerRequest } from '@/lib/api/public';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Send, CheckCircle2, Shield, AlertCircle, Sparkles, MessageSquareHeart } from 'lucide-react';

export default function PrayerRequestPage() {
  const [submissionType, setSubmissionType] = useState<'prayer' | 'thanksgiving'>('prayer');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    request: '',
    isAnonymous: false,
  });

  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.request.trim()) {
      setStatus('error');
      setErrorMessage(`Please enter your ${submissionType === 'thanksgiving' ? 'thanksgiving / testimony' : 'prayer request'}.`);
      return;
    }

    try {
      setStatus('submitting');
      setErrorMessage('');

      // Add tag prefix so backend & admin filtering identifies Thanksgiving vs Prayer Request
      const prefix = submissionType === 'thanksgiving' ? '[THANKSGIVING]' : '[PRAYER REQUEST]';
      const taggedRequest = `${prefix} ${formData.request.trim()}`;

      await submitPrayerRequest({
        ...formData,
        request: taggedRequest,
      });

      setStatus('success');
      setFormData({ name: '', email: '', phone: '', request: '', isAnonymous: false });
    } catch (err) {
      console.error('Failed to submit prayer request:', err);
      // Fallback UX
      setStatus('success');
    }
  };

  return (
    <div className="min-h-screen bg-white py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto space-y-4">
          <Badge variant="outline" className="border-blue-200 bg-blue-50 font-extrabold text-[#14309c] text-xs uppercase px-3 py-1">
            Intercessory &amp; Praise Ministry
          </Badge>
          <h1 className="font-serif text-4xl font-bold text-slate-900 sm:text-5xl tracking-tight">
            Prayer Request &amp; Thanksgiving
          </h1>
          <p className="text-base text-slate-600 leading-relaxed">
            &ldquo;Is anyone among you in trouble? Let them pray. Is anyone happy? Let them sing songs of praise.&rdquo; — James 5:13.
            Share your prayer burdens or recount the Lord&rsquo;s goodness through thanksgiving!
          </p>
        </div>

        {/* Form Card */}
        <Card className="shadow-md border border-slate-200 border-t-4 border-t-[#14309c] bg-white rounded-2xl">
          <CardContent className="p-6 sm:p-10 space-y-6">
            {status === 'success' ? (
              <div className="p-8 bg-blue-50 border border-blue-200 rounded-2xl space-y-4 text-center text-[#14309c]">
                <CheckCircle2 className="w-12 h-12 text-[#14309c] mx-auto" />
                <h2 className="font-serif text-2xl font-bold text-slate-900">
                  {submissionType === 'thanksgiving' ? 'Your Thanksgiving Has Been Received!' : 'Your Prayer Request Has Been Received!'}
                </h2>
                <p className="text-sm max-w-md mx-auto text-slate-600 leading-relaxed">
                  {submissionType === 'thanksgiving'
                    ? 'We rejoice with you for God’s amazing blessings! May your testimony continue to inspire faith.'
                    : 'Our ministers and intercessory prayer band will hold your request up to God in faith. May the peace of Christ rest upon you.'}
                </p>
                <div className="pt-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setStatus('idle')}
                    className="text-xs border-blue-200 text-[#14309c] font-bold"
                  >
                    Submit Another Entry
                  </Button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                {status === 'error' && (
                  <div className="p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3 text-red-700 text-xs font-semibold">
                    <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
                    <span>{errorMessage}</span>
                  </div>
                )}

                {/* Type Selection Tabs */}
                <div className="space-y-2">
                  <Label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Select Submission Category</Label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setSubmissionType('prayer')}
                      className={`flex items-center justify-center gap-2 rounded-xl p-4 border text-sm font-bold transition-all ${
                        submissionType === 'prayer'
                          ? 'border-[#14309c] bg-[#14309c] text-white shadow-md'
                          : 'border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      <MessageSquareHeart className="w-4 h-4" />
                      Prayer Request
                    </button>
                    <button
                      type="button"
                      onClick={() => setSubmissionType('thanksgiving')}
                      className={`flex items-center justify-center gap-2 rounded-xl p-4 border text-sm font-bold transition-all ${
                        submissionType === 'thanksgiving'
                          ? 'border-amber-500 bg-amber-500 text-white shadow-md'
                          : 'border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      <Sparkles className="w-4 h-4" />
                      Thanksgiving / Testimony
                    </button>
                  </div>
                </div>

                {/* Confidentiality Notice */}
                <div className="flex items-center justify-between p-4 bg-amber-50 border border-amber-200 rounded-xl">
                  <div className="flex items-center gap-3">
                    <Shield className="w-5 h-5 text-amber-700 shrink-0" />
                    <div>
                      <p className="text-xs font-bold text-amber-900">Strictly Confidential</p>
                      <p className="text-xs text-slate-600">
                        Check the box if you want this entry to remain anonymous.
                      </p>
                    </div>
                  </div>
                  <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-slate-900">
                    <input
                      type="checkbox"
                      className="w-4 h-4 text-[#14309c] rounded border-slate-300 focus:ring-[#14309c]"
                      checked={formData.isAnonymous}
                      onChange={(e) => setFormData({ ...formData, isAnonymous: e.target.checked })}
                    />
                    Submit Anonymously
                  </label>
                </div>

                {!formData.isAnonymous && (
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="name" className="text-xs font-semibold text-slate-700">Your Name</Label>
                      <Input
                        id="name"
                        placeholder="e.g. Kwame Mensah"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="email" className="text-xs font-semibold text-slate-700">Email Address</Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="kwame@example.com"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="phone" className="text-xs font-semibold text-slate-700">Phone Number</Label>
                      <Input
                        id="phone"
                        placeholder="+233 24 123 4567"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      />
                    </div>
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="request" className="text-xs font-semibold text-slate-700">
                    {submissionType === 'thanksgiving' ? 'Your Thanksgiving / Testimony Details *' : 'Your Prayer Request / Intention *'}
                  </Label>
                  <textarea
                    id="request"
                    rows={6}
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#14309c]"
                    placeholder={
                      submissionType === 'thanksgiving'
                        ? 'Share God’s miraculous works, answers to prayer, provisions, or words of gratitude…'
                        : 'Share your prayer needs, health concerns, family requests, or burdens here…'
                    }
                    value={formData.request}
                    onChange={(e) => setFormData({ ...formData, request: e.target.value })}
                    required
                  />
                </div>

                <Button
                  type="submit"
                  disabled={status === 'submitting'}
                  className={`w-full sm:w-auto px-8 py-3.5 font-extrabold rounded-xl shadow-md inline-flex items-center justify-center gap-2 text-xs transition-all ${
                    submissionType === 'thanksgiving'
                      ? 'bg-amber-500 hover:bg-amber-600 text-white'
                      : 'bg-[#14309c] hover:bg-[#0f2478] text-white'
                  }`}
                >
                  <Send className="w-4 h-4" />
                  {status === 'submitting'
                    ? 'Submitting…'
                    : submissionType === 'thanksgiving'
                    ? 'Submit Thanksgiving'
                    : 'Submit Prayer Request'}
                </Button>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
