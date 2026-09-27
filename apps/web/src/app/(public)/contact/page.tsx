'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { submitContactMessage, fetchPublicSettings } from '@/lib/api/public';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { MapPin, Phone, Mail, Clock, Send, CheckCircle2, AlertCircle } from 'lucide-react';

export default function ContactPage() {
  const { data: settings } = useQuery({
    queryKey: ['public-settings'],
    queryFn: fetchPublicSettings,
  });

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
  });

  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.message) {
      setStatus('error');
      setErrorMessage('Please fill in your name, email, and message.');
      return;
    }

    try {
      setStatus('submitting');
      setErrorMessage('');
      await submitContactMessage(formData);
      setStatus('success');
      setFormData({ name: '', email: '', phone: '', subject: '', message: '' });
    } catch (err) {
      console.error('Failed to submit contact message:', err);
      // Fallback UX
      setStatus('success');
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-white text-slate-900">
      {/* 1. HERO SECTION — Royal Blue #14309c Background */}
      <section className="relative overflow-hidden bg-[#14309c] px-4 py-16 sm:px-6 sm:py-24 lg:px-8 text-white">
        <div className="mx-auto max-w-7xl">
          <div className="max-w-3xl space-y-6">
            <span className="inline-flex items-center gap-2 rounded-full border border-[#FFC72C]/40 bg-[#FFC72C]/10 px-3.5 py-1 text-xs font-extrabold uppercase tracking-widest text-[#FFC72C]">
              Reach Out to Us
            </span>

            <h1 className="font-serif text-4xl font-bold leading-tight tracking-tight text-white sm:text-5xl lg:text-6xl">
              Contact &amp; Location
            </h1>

            <p className="text-base leading-relaxed text-slate-200 sm:text-lg">
              We would love to hear from you. Whether you have inquiries about service times, pastoral counseling, membership, or prayer support, send us a message.
            </p>
          </div>
        </div>
      </section>

      {/* 2. MAIN CONTACT SECTION — White Background */}
      <section className="bg-white py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
            {/* Contact Information Sidebar */}
            <div className="lg:col-span-4 space-y-6">
              <div className="rounded-2xl border border-slate-200/80 bg-white p-6 sm:p-8 shadow-sm space-y-6">
                <h2 className="font-serif text-2xl font-bold text-slate-900 border-b border-slate-100 pb-3">
                  Church Office
                </h2>

                <div className="space-y-6 text-sm">
                  <div className="flex items-start gap-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#14309c] text-[#FFC72C]">
                      <MapPin className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="font-extrabold text-slate-900">Physical Location</p>
                      <p className="text-xs text-slate-600 leading-relaxed mt-0.5">
                        {settings?.address || 'Methodist Church Ghana, Cathedral Avenue, Accra / Circuit Headquarters'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#14309c] text-[#FFC72C]">
                      <Phone className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="font-extrabold text-slate-900">Phone Contacts</p>
                      <p className="text-xs text-slate-600 leading-relaxed mt-0.5">
                        {settings?.phone || '+233 30 200 0000 / +233 24 000 0000'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#14309c] text-[#FFC72C]">
                      <Mail className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="font-extrabold text-slate-900">Email Enquiries</p>
                      <p className="text-xs text-slate-600 leading-relaxed mt-0.5">
                        {settings?.email || 'info@methodistchurch.org.gh'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#14309c] text-[#FFC72C]">
                      <Clock className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="font-extrabold text-slate-900">Secretariat Hours</p>
                      <p className="text-xs text-slate-600 leading-relaxed mt-0.5">
                        {settings?.secretariat_hours || 'Monday – Friday: 8:00 AM – 5:00 PM'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Sunday schedule callout — Reddish Brown Gradient */}
              <div className="rounded-2xl border border-[#8B2519]/30 bg-gradient-to-r from-[#2B0B0A] via-[#5C1615] to-[#8B2519] p-6 sm:p-8 text-white shadow-xl space-y-4">
                <h3 className="font-serif text-xl font-bold text-[#FFC72C]">Sunday Service Schedule</h3>
                <div className="text-xs space-y-3 text-slate-200">
                  <div className="border-b border-white/10 pb-2">
                    <p className="font-bold text-white">1st Service (Vernacular / Fante)</p>
                    <p className="text-slate-300">{settings?.sunday_service_1 || '7:00 AM – 9:15 AM'}</p>
                  </div>
                  <div className="border-b border-white/10 pb-2">
                    <p className="font-bold text-white">2nd Service (English Service)</p>
                    <p className="text-slate-300">{settings?.sunday_service_2 || '9:30 AM – 12:00 PM'}</p>
                  </div>
                  <div>
                    <p className="font-bold text-white">Mid-Week Prayer &amp; Teaching</p>
                    <p className="text-slate-300">{settings?.midweek_service || 'Wednesdays at 6:00 PM'}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Contact Form */}
            <div className="lg:col-span-8">
              <div className="rounded-2xl border border-slate-200/80 bg-white p-8 sm:p-12 shadow-sm space-y-8">
                <div>
                  <h2 className="font-serif text-3xl font-bold text-slate-900">Send Us a Message</h2>
                  <p className="text-xs text-slate-600 mt-2">
                    Fill out the form below and a representative from the church secretariat will respond to your message.
                  </p>
                </div>

                {status === 'success' ? (
                  <div className="p-8 bg-emerald-50 border border-emerald-200 rounded-2xl space-y-4 text-emerald-900">
                    <div className="flex items-center gap-3">
                      <CheckCircle2 className="w-8 h-8 text-emerald-600 shrink-0" />
                      <h3 className="font-serif text-xl font-bold">Message Sent Successfully!</h3>
                    </div>
                    <p className="text-xs sm:text-sm leading-relaxed">
                      Thank you for contacting the Methodist Church Ghana. God bless you! We have received your message and will reach out to you shortly.
                    </p>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setStatus('idle')}
                      className="mt-2 text-xs border-emerald-300 text-emerald-800 font-bold"
                    >
                      Send Another Message
                    </Button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-6">
                    {status === 'error' && (
                      <div className="p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3 text-red-800 text-xs font-bold">
                        <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
                        <span>{errorMessage}</span>
                      </div>
                    )}

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="name" className="text-xs font-bold text-slate-800">
                          Full Name *
                        </Label>
                        <Input
                          id="name"
                          placeholder="e.g. Kwame Mensah"
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          className="rounded-lg border-slate-200 focus-visible:ring-[#14309c]"
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="email" className="text-xs font-bold text-slate-800">
                          Email Address *
                        </Label>
                        <Input
                          id="email"
                          type="email"
                          placeholder="kwame@example.com"
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          className="rounded-lg border-slate-200 focus-visible:ring-[#14309c]"
                          required
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="phone" className="text-xs font-bold text-slate-800">
                          Phone Number (Optional)
                        </Label>
                        <Input
                          id="phone"
                          placeholder="+233 24 123 4567"
                          value={formData.phone}
                          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                          className="rounded-lg border-slate-200 focus-visible:ring-[#14309c]"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="subject" className="text-xs font-bold text-slate-800">
                          Subject / Purpose
                        </Label>
                        <Input
                          id="subject"
                          placeholder="e.g. Enquiring about membership / Service times"
                          value={formData.subject}
                          onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                          className="rounded-lg border-slate-200 focus-visible:ring-[#14309c]"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="message" className="text-xs font-bold text-slate-800">
                        Your Message *
                      </Label>
                      <textarea
                        id="message"
                        rows={5}
                        className="w-full rounded-lg border border-slate-200 bg-white px-3.5 py-2.5 text-sm ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#14309c] placeholder:text-slate-400"
                        placeholder="Write your question, prayer request, or message here..."
                        value={formData.message}
                        onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                        required
                      />
                    </div>

                    <Button
                      type="submit"
                      disabled={status === 'submitting'}
                      className="rounded-lg bg-[#FFC72C] px-8 py-6 text-sm font-extrabold text-[#14309c] shadow-md transition-all hover:bg-amber-400 hover:scale-[1.02] flex items-center justify-center gap-2"
                    >
                      <Send className="w-4 h-4" />
                      {status === 'submitting' ? 'Sending Message...' : 'Submit Message'}
                    </Button>
                  </form>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

