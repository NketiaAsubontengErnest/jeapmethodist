import { Metadata } from 'next';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';

export const metadata: Metadata = {
  title: 'Terms of Service | Methodist Church Ghana',
  description: 'Terms of service and usage conditions for the Methodist Church Ghana public website and management portal.',
};

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-white py-12">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="space-y-4">
          <Badge variant="outline" className="border-blue-200 bg-blue-50 font-bold text-primary">
            Terms of Use
          </Badge>
          <h1 className="heading-rule font-serif text-4xl font-bold text-foreground tracking-tight">
            Terms of Service
          </h1>
          <p className="text-sm text-muted-foreground">Last updated: September 2026</p>
        </div>

        <Card className="bg-white">
          <CardContent className="p-8 sm:p-10 space-y-6 text-secondary-foreground text-base leading-relaxed">
            <p>
              Welcome to the official website and digital management platform of the Methodist Church Ghana. By using this website, member portal, or submitting giving, you agree to comply with the following terms.
            </p>

            <h2 className="font-serif text-lg font-bold text-foreground pt-2">1. Christian Integrity &amp; Conduct</h2>
            <p>
              Users interacting with contact forms, prayer request submissions, or member portals agree to provide accurate information and refrain from submitting profane, abusive, or fraudulent content.
            </p>

            <h2 className="font-serif text-lg font-bold text-foreground pt-2">2. Intellectual Property &amp; Media</h2>
            <p>
              All sermon recordings, logos, photos, church documents, and published resources remain the intellectual property of the Methodist Church Ghana. Media may be streamed or downloaded for personal devotion and non-commercial edification only.
            </p>

            <h2 className="font-serif text-lg font-bold text-foreground pt-2">3. Electronic Giving &amp; Contributions</h2>
            <p>
              Giving submitted via Mobile Money or Bank Wire represents voluntary Christian tithes, offerings, and donations. Receipts are issued for record-keeping. If a transaction error occurs, please contact the Church Accountant or Secretariat.
            </p>

            <h2 className="font-serif text-lg font-bold text-foreground pt-2">4. Platform Availability</h2>
            <p>
              While we strive to maintain uninterrupted digital services, the church does not guarantee zero downtime due to internet service provider maintenance or system upgrades.
            </p>

            <h2 className="font-serif text-lg font-bold text-foreground pt-2">5. Governing Polity</h2>
            <p>
              These terms are governed by the laws of the Republic of Ghana and the Standing Orders of the Methodist Church Ghana.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
