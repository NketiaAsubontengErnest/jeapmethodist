'use client';

import { useQuery } from '@tanstack/react-query';
import { fetchPublicSettings } from '@/lib/api/public';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { ShieldCheck } from 'lucide-react';

export default function PrivacyPage() {
  const { data: settings } = useQuery({
    queryKey: ['public-settings'],
    queryFn: fetchPublicSettings,
  });

  const churchName = settings?.church_name || 'Methodist Church Ghana';
  const email = settings?.email || 'info@methodistchurch.org.gh';

  return (
    <div className="min-h-screen bg-white py-12">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="space-y-4">
          <Badge variant="outline" className="border-blue-200 bg-blue-50 font-bold text-primary">
            Legal &amp; Data Compliance
          </Badge>
          <h1 className="heading-rule font-serif text-4xl font-bold text-foreground tracking-tight">
            Privacy Policy
          </h1>
          <p className="text-sm text-muted-foreground">Last updated: September 2026</p>
        </div>

        <Card className="bg-white">
          <CardContent className="p-8 sm:p-10 space-y-6 text-secondary-foreground text-base leading-relaxed">
            <div className="flex items-center gap-3 p-4 bg-blue-50 border border-blue-200 rounded-xl text-primary">
              <ShieldCheck className="w-6 h-6 shrink-0" />
              <p className="text-xs font-semibold">
                The {churchName} is committed to safeguarding the personal data of all church members, visitors, and donors in compliance with the Ghana Data Protection Act 2012 (Act 843).
              </p>
            </div>

            <h2 className="font-serif text-lg font-bold text-foreground pt-2">1. Information We Collect</h2>
            <p>
              We collect personal details provided during member registration, prayer request submissions, contact forms, or online giving. This includes names, phone numbers, email addresses, residential locations, class membership details, and contribution records.
            </p>

            <h2 className="font-serif text-lg font-bold text-foreground pt-2">2. How We Use Your Data</h2>
            <ul className="list-disc list-inside space-y-1 pl-2">
              <li>Pastoral care, class leader visitation, and emergency welfare assistance.</li>
              <li>Issuing receipts for tithes, harvest pledges, and assessment payments.</li>
              <li>Sending church announcements via SMS or email broadcasts.</li>
              <li>Managing registration for synod conventions, youth retreats, and baptismal classes.</li>
            </ul>

            <h2 className="font-serif text-lg font-bold text-foreground pt-2">3. Data Confidentiality &amp; Access</h2>
            <p>
              Your personal data is accessible only to authorized ministers, society stewards, and administrative officers with role-based permissions. Prayer requests marked anonymous are kept strictly within pastoral confidentiality.
            </p>

            <h2 className="font-serif text-lg font-bold text-foreground pt-2">4. Third-Party Sharing</h2>
            <p>
              We do not sell, rent, or trade member data with commercial third parties. Payment processors (Mobile Money, Banks) receive only transaction metadata necessary to process giving.
            </p>

            <h2 className="font-serif text-lg font-bold text-foreground pt-2">5. Contact Data Officer</h2>
            <p>
              If you wish to update your member record, request deletion of data, or inquire about our privacy practices, contact the Church Secretariat at <span className="font-semibold text-primary">{email}</span>.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
