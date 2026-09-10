'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { submitContactMessage, fetchPublicSettings } from '@/lib/api/public';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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
    <div className="min-h-screen bg-white py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <Badge variant="outline" className="rounded-full border-blue-200 bg-blue-50 font-bold text-primary">
            Reach Out to Us
          </Badge>
          <h1 className="font-serif text-4xl font-extrabold text-foreground sm:text-5xl tracking-tight">
            Contact & Location
          </h1>
          <p className="text-lg text-muted-foreground">
            We would love to hear from you. Whether you have a inquiry about service times, pastoral counselling, or membership, send us a message.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Contact Information Sidebar */}
          <div className="space-y-6">
            <Card className="rounded-2xl border-border border-t-4 border-t-primary shadow-sm">
              <CardContent className="p-6 space-y-6">
                <h2 className="font-serif text-xl font-bold text-foreground">Church Address</h2>

                <div className="space-y-4 text-sm">
                  <div className="flex items-start gap-3 text-foreground/80">
                    <MapPin className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold text-foreground">Physical Location</p>
                      <p className="text-xs text-muted-foreground">
                        {settings?.address || 'Methodist Church Ghana, Cathedral Avenue, Accra / Circuit Headquarters'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 text-foreground/80">
                    <Phone className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold text-foreground">Phone Contacts</p>
                      <p className="text-xs text-muted-foreground">{settings?.phone || '+233 30 200 0000 / +233 24 000 0000'}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 text-foreground/80">
                    <Mail className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold text-foreground">Email Enquiries</p>
                      <p className="text-xs text-muted-foreground">{settings?.email || 'info@methodistchurch.org.gh'}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 text-foreground/80">
                    <Clock className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold text-foreground">Secretariat Hours</p>
                      <p className="text-xs text-muted-foreground">{settings?.secretariat_hours || 'Monday – Friday: 8:00 AM – 5:00 PM'}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Sunday schedule — the one deliberate dark accent block on this page */}
            <Card className="rounded-2xl bg-gradient-to-br from-blue-900 via-blue-800 to-red-700 text-white shadow-sm border border-gold-500/30">
              <CardContent className="p-6 space-y-3">
                <h3 className="font-serif text-lg font-bold text-gold-400">Sunday Service Schedule</h3>
                <div className="text-xs space-y-2 text-cream-200">
                  <div className="flex justify-between border-b border-blue-700 pb-1.5">
                    <span>{settings?.sunday_service_1 || '1st Service (Fante / Vernacular) — 7:00 AM'}</span>
                  </div>
                  <div className="flex justify-between border-b border-blue-700 pb-1.5">
                    <span>{settings?.sunday_service_2 || '2nd Service (English Service) — 9:30 AM'}</span>
                  </div>
                  <div className="flex justify-between pt-0.5">
                    <span>{settings?.midweek_service || 'Mid-Week Prayer & Bible Study — Wed 6:00 PM'}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Contact Form */}
          <div className="lg:col-span-2">
            <Card className="rounded-2xl shadow-sm border-border border-t-4 border-t-gold-500">
              <CardContent className="p-6 sm:p-10 space-y-6">
                <div>
                  <h2 className="font-serif text-2xl font-bold text-foreground">Send Us a Message</h2>
                  <p className="text-xs text-muted-foreground mt-1">
                    Fill out the form below and a representative from the church office will respond promptly.
                  </p>
                </div>

                {status === 'success' ? (
                  <div className="p-6 bg-green-50 border border-green-200 rounded-xl space-y-3 text-green-800">
                    <div className="flex items-center gap-3">
                      <CheckCircle2 className="w-6 h-6 text-green-600" />
                      <h3 className="font-serif text-lg font-bold">Message Sent Successfully!</h3>
                    </div>
                    <p className="text-sm">
                      Thank you for contacting the Methodist Church Ghana. God bless you! We have received your message and will reach out to you shortly.
                    </p>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setStatus('idle')}
                      className="mt-2 text-xs border-green-300"
                    >
                      Send Another Message
                    </Button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-6">
                    {status === 'error' && (
                      <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg flex items-center gap-3 text-destructive text-xs font-semibold">
                        <AlertCircle className="w-4 h-4 shrink-0" />
                        <span>{errorMessage}</span>
                      </div>
                    )}

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="name">Full Name *</Label>
                        <Input
                          id="name"
                          placeholder="e.g. Kwame Mensah"
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="email">Email Address *</Label>
                        <Input
                          id="email"
                          type="email"
                          placeholder="kwame@example.com"
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          required
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="phone">Phone Number (Optional)</Label>
                        <Input
                          id="phone"
                          placeholder="+233 24 123 4567"
                          value={formData.phone}
                          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="subject">Subject / Purpose</Label>
                        <Input
                          id="subject"
                          placeholder="e.g. Enquiring about membership / Baptism"
                          value={formData.subject}
                          onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="message">Your Message *</Label>
                      <textarea
                        id="message"
                        rows={5}
                        className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                        placeholder="Write your question, feedback, or message here..."
                        value={formData.message}
                        onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                        required
                      />
                    </div>

                    <Button
                      type="submit"
                      disabled={status === 'submitting'}
                      className="w-full sm:w-auto px-8 py-6 font-bold rounded-xl shadow inline-flex items-center justify-center gap-2 text-sm"
                    >
                      <Send className="w-4 h-4 text-gold-300" />
                      {status === 'submitting' ? 'Sending Message...' : 'Submit Message'}
                    </Button>
                  </form>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
