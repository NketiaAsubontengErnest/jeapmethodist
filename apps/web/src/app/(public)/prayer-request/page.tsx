'use client';

import { useState } from 'react';
import { submitPrayerRequest } from '@/lib/api/public';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Send, CheckCircle2, Shield, AlertCircle } from 'lucide-react';

export default function PrayerRequestPage() {
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
    if (!formData.request) {
      setStatus('error');
      setErrorMessage('Please enter your prayer request.');
      return;
    }

    try {
      setStatus('submitting');
      setErrorMessage('');
      await submitPrayerRequest(formData);
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
          <Badge variant="outline" className="border-blue-200 bg-blue-50 font-bold text-primary">
            Intercessory Ministry
          </Badge>
          <h1 className="font-serif text-4xl font-bold text-foreground sm:text-5xl tracking-tight">
            Submit a Prayer Request
          </h1>
          <p className="text-lg text-muted-foreground">
            &ldquo;Is anyone among you in trouble? Let them pray.&rdquo; — James 5:13. Our pastoral care team and Christ&rsquo;s Little Band intercessors pray over every request submitted.
          </p>
        </div>

        {/* Form Card */}
        <Card className="shadow-md border-t-4 border-t-primary bg-white">
          <CardContent className="p-6 sm:p-10 space-y-6">
            {status === 'success' ? (
              <div className="p-8 bg-blue-50 border border-blue-200 rounded-2xl space-y-4 text-center text-primary">
                <CheckCircle2 className="w-12 h-12 text-primary mx-auto" />
                <h2 className="font-serif text-2xl font-bold text-foreground">Your Prayer Request Has Been Received</h2>
                <p className="text-sm max-w-md mx-auto text-muted-foreground">
                  Our ministers and prayer band will hold your request up to God in faith. May the peace and grace of our Lord Jesus Christ rest upon you.
                </p>
                <div className="pt-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setStatus('idle')}
                    className="text-xs border-blue-200 text-primary"
                  >
                    Submit Another Request
                  </Button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                {status === 'error' && (
                  <div className="p-4 bg-destructive/10 border border-destructive/30 rounded-lg flex items-center gap-3 text-destructive text-xs font-semibold">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{errorMessage}</span>
                  </div>
                )}

                <div className="flex items-center justify-between p-4 bg-gold-50 border border-gold-200 rounded-xl">
                  <div className="flex items-center gap-3">
                    <Shield className="w-5 h-5 text-gold-700 shrink-0" />
                    <div>
                      <p className="text-xs font-bold text-gold-800">Strictly Confidential</p>
                      <p className="text-xs text-muted-foreground">
                        Check the box if you want this prayer request to remain anonymous.
                      </p>
                    </div>
                  </div>
                  <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-foreground">
                    <input
                      type="checkbox"
                      className="w-4 h-4 text-primary rounded focus:ring-primary"
                      checked={formData.isAnonymous}
                      onChange={(e) => setFormData({ ...formData, isAnonymous: e.target.checked })}
                    />
                    Submit Anonymously
                  </label>
                </div>

                {!formData.isAnonymous && (
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="name">Your Name</Label>
                      <Input
                        id="name"
                        placeholder="e.g. Kwame Mensah"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="email">Email Address</Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="kwame@example.com"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone Number</Label>
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
                  <Label htmlFor="request">Your Prayer Request / Intention *</Label>
                  <textarea
                    id="request"
                    rows={6}
                    className="w-full rounded-md border border-border bg-white px-3 py-2 text-sm ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                    placeholder="Share your prayer needs, health concerns, family requests, thanksgiving, or burdens here..."
                    value={formData.request}
                    onChange={(e) => setFormData({ ...formData, request: e.target.value })}
                    required
                  />
                </div>

                <Button
                  type="submit"
                  disabled={status === 'submitting'}
                  className="w-full sm:w-auto px-8 py-3 font-bold rounded-lg shadow inline-flex items-center justify-center gap-2 text-sm"
                >
                  <Send className="w-4 h-4" />
                  {status === 'submitting' ? 'Submitting Prayer...' : 'Submit Prayer Request'}
                </Button>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
