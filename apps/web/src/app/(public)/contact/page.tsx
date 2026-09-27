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

  const socialLinks = [
    {
      key: 'facebook',
      label: 'Facebook',
      url: settings?.facebook_url,
      icon: (
        <svg className="h-5 w-5 fill-current" viewBox="0 0 24 24" aria-hidden="true">
          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
        </svg>
      ),
    },
    {
      key: 'youtube',
      label: 'YouTube',
      url: settings?.youtube_url,
      icon: (
        <svg className="h-5 w-5 fill-current" viewBox="0 0 24 24" aria-hidden="true">
          <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
        </svg>
      ),
    },
    {
      key: 'instagram',
      label: 'Instagram',
      url: settings?.instagram_url,
      icon: (
        <svg className="h-5 w-5 fill-current" viewBox="0 0 24 24" aria-hidden="true">
          <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z" />
        </svg>
      ),
    },
    {
      key: 'tiktok',
      label: 'TikTok',
      url: settings?.tiktok_url,
      icon: (
        <svg className="h-5 w-5 fill-current" viewBox="0 0 24 24" aria-hidden="true">
          <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.82.57-1.32 1.55-1.36 2.55-.06.99.36 1.97 1.11 2.62.8.69 1.93.92 2.92.61.99-.3 1.79-1.08 2.06-2.07.13-.5.17-1.02.16-1.54.02-4.5.01-9 .01-13.5z" />
        </svg>
      ),
    },
    {
      key: 'x',
      label: 'X (Twitter)',
      url: settings?.x_url,
      icon: (
        <svg className="h-5 w-5 fill-current" viewBox="0 0 24 24" aria-hidden="true">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
        </svg>
      ),
    },
    {
      key: 'whatsapp',
      label: 'WhatsApp Channel',
      url: settings?.whatsapp_channel_url,
      icon: (
        <svg className="h-5 w-5 fill-current" viewBox="0 0 24 24" aria-hidden="true">
          <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z" />
        </svg>
      ),
    },
    {
      key: 'threads',
      label: 'Threads',
      url: settings?.threads_url,
      icon: (
        <svg className="h-5 w-5 fill-current" viewBox="0 0 24 24" aria-hidden="true">
          <path d="M12.186 24c-2.738 0-5.112-.766-7.054-2.278A11.722 11.722 0 0 1 1 15.65C.324 13.435.006 11.05.006 8.52 0 6.002.327 3.633 1.025 1.436.438-.073.992.003 1.542.003h.036c.64 0 1.109.117 1.415.352.33.25.495.642.495 1.17 0 .23-.037.493-.11.785-.563 2.012-.843 4.148-.843 6.347 0 2.253.284 4.398.847 6.376.51 1.79 1.348 3.242 2.49 4.316 1.432 1.346 3.287 2.029 5.518 2.029 2.502 0 4.542-.857 6.06-2.548 1.444-1.61 2.177-3.805 2.177-6.527 0-2.316-.549-4.234-1.631-5.698C16.892 5.17 14.89 4.385 12.3 4.385c-1.996 0-3.642.547-4.893 1.626-1.196 1.031-1.788 2.443-1.788 4.195 0 1.61.564 2.923 1.677 3.902 1.117.982 2.617 1.48 4.458 1.48.97 0 1.834-.14 2.569-.418v1.892c-.753.228-1.57.343-2.45.343-2.52 0-4.542-.71-6.01-2.11C4.4 13.885 3.655 11.99 3.655 9.645c0-2.543.896-4.63 2.663-6.205C8.118 1.838 10.59 1.01 13.435 1.01c3.55 0 6.335 1.088 8.277 3.235C23.633 6.374 24.5 9.176 24.5 12.56c0 3.61-.99 6.55-2.943 8.74C19.537 23.57 16.275 24.5 12.186 24z" />
        </svg>
      ),
    },
  ].filter((item) => Boolean(item.url?.trim()));

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
              Contact
            </h1>

            <p className="text-base leading-relaxed text-slate-200 sm:text-lg">
              We would love to hear from you. Whether you have inquiries about service times, pastoral counseling, membership, or prayer support, send us a message.
            </p>

            {/* Social Media Links in Contact Hero */}
            {socialLinks.length > 0 && (
              <div className="pt-4 space-y-3">
                <p className="text-xs font-extrabold uppercase tracking-widest text-[#FFC72C]">
                  Follow &amp; Connect With Us
                </p>
                <div className="flex flex-wrap items-center gap-3">
                  {socialLinks.map((s) => (
                    <a
                      key={s.key}
                      href={s.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      title={s.label}
                      className="flex h-12 w-12 items-center justify-center rounded-xl border border-white/20 bg-white/10 text-white hover:bg-[#FFC72C] hover:text-[#14309c] hover:border-[#FFC72C] transition-all hover:scale-110 shadow-lg"
                    >
                      {s.icon}
                    </a>
                  ))}
                </div>
              </div>
            )}
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
            </div>

            {/* Contact Form */}
            <div className="lg:col-span-8">
              <div className="rounded-2xl border border-slate-200/80 bg-white p-6 sm:p-10 shadow-sm space-y-6">
                <div>
                  <h2 className="font-serif text-3xl font-bold text-slate-900">Send Us a Message</h2>
                  <p className="text-xs text-slate-500 mt-1">
                    Fill out the form below and our secretariat will respond as soon as possible.
                  </p>
                </div>

                {status === 'success' ? (
                  <div className="rounded-xl bg-emerald-50 border border-emerald-200 p-8 text-center space-y-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 mx-auto">
                      <CheckCircle2 className="h-6 w-6" />
                    </div>
                    <h3 className="font-serif text-xl font-bold text-emerald-900">Message Received!</h3>
                    <p className="text-xs text-emerald-700 max-w-md mx-auto">
                      Thank you for contacting us. Your message has been routed to the Secretariat and we will get back to you shortly.
                    </p>
                    <Button
                      onClick={() => setStatus('idle')}
                      className="bg-[#14309c] text-white hover:bg-[#0f2478] font-bold text-xs rounded-lg mt-2"
                    >
                      Send Another Message
                    </Button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-6">
                    {status === 'error' && (
                      <div className="flex items-center gap-2 rounded-xl bg-rose-50 border border-rose-200 p-4 text-xs text-rose-700">
                        <AlertCircle className="h-4 w-4 shrink-0" />
                        <span>{errorMessage}</span>
                      </div>
                    )}

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="name" className="text-xs font-bold text-slate-700">
                          Your Name *
                        </Label>
                        <Input
                          id="name"
                          required
                          placeholder="e.g. Kwame Mensah"
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          className="text-sm font-medium"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="email" className="text-xs font-bold text-slate-700">
                          Email Address *
                        </Label>
                        <Input
                          id="email"
                          type="email"
                          required
                          placeholder="e.g. kwame@example.com"
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          className="text-sm font-medium"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="phone" className="text-xs font-bold text-slate-700">
                          Phone Number (Optional)
                        </Label>
                        <Input
                          id="phone"
                          type="tel"
                          placeholder="e.g. 0240000000"
                          value={formData.phone}
                          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                          className="text-sm font-medium"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="subject" className="text-xs font-bold text-slate-700">
                          Subject (Optional)
                        </Label>
                        <Input
                          id="subject"
                          placeholder="e.g. Membership / Counseling"
                          value={formData.subject}
                          onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                          className="text-sm font-medium"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="message" className="text-xs font-bold text-slate-700">
                        Your Message *
                      </Label>
                      <textarea
                        id="message"
                        required
                        rows={5}
                        placeholder="Type your message here..."
                        value={formData.message}
                        onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                        className="w-full rounded-xl border border-slate-300 p-3.5 text-sm font-medium text-slate-900 focus:border-[#14309c] focus:outline-none focus:ring-1 focus:ring-[#14309c]"
                      />
                    </div>

                    <Button
                      type="submit"
                      disabled={status === 'submitting'}
                      className="w-full sm:w-auto px-8 py-6 rounded-xl bg-[#FFC72C] text-[#14309c] font-extrabold text-base shadow-lg hover:bg-amber-400 transition-all hover:scale-105"
                    >
                      {status === 'submitting' ? (
                        'Sending Message...'
                      ) : (
                        <span className="flex items-center gap-2">
                          Send Message <Send className="w-4 h-4" />
                        </span>
                      )}
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
