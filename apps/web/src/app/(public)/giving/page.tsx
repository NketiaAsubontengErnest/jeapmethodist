import { Metadata } from 'next';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Heart, Smartphone, Building2, ShieldCheck, Sparkles, CheckCircle2 } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Giving & Stewardship | Methodist Church Ghana',
  description: 'Support the work of God through Tithes, Offerings, Connexional Assessment, Harvest giving, and Mobile Money (MoMo) contributions.',
};

export default function GivingPage() {
  return (
    <div className="min-h-screen bg-white py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <Badge variant="outline" className="border-blue-200 bg-blue-50 font-bold text-primary">
            <Heart className="mr-1.5 h-3.5 w-3.5 fill-current" /> Faithful Stewardship &amp; Generosity
          </Badge>
          <h1 className="font-serif text-4xl font-bold text-foreground sm:text-5xl tracking-tight">
            Online &amp; Electronic Giving
          </h1>
          <p className="text-lg text-muted-foreground">
            &ldquo;Gain all you can, save all you can, give all you can.&rdquo; — John Wesley. Support the Gospel, church expansion, and community relief.
          </p>
        </div>

        {/* Giving Scripture Banner — deliberate dark accent block, mirrors homepage giving CTA */}
        <div className="bg-gradient-to-r from-blue-900 via-blue-800 to-red-700 text-white rounded-2xl p-8 sm:p-10 shadow-xl flex flex-col md:flex-row items-center justify-between gap-6 border border-gold-500/30">
          <div className="space-y-2 max-w-2xl">
            <h2 className="font-serif text-xl sm:text-2xl font-bold text-gold-300">2 Corinthians 9:7</h2>
            <p className="text-cream-200 text-sm sm:text-base italic">
              &ldquo;Each of you should give what you have decided in your heart to give, not reluctantly or under compulsion, for God loves a cheerful giver.&rdquo;
            </p>
          </div>
          <div className="shrink-0 bg-white/10 backdrop-blur-md p-4 rounded-xl border border-white/20 text-center">
            <Sparkles className="w-8 h-8 text-gold-300 mx-auto mb-1" />
            <p className="text-xs text-gold-200 font-semibold">Methodist Stewardship</p>
          </div>
        </div>

        {/* Giving Options Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Mobile Money Card */}
          <Card className="border-t-4 border-t-gold-500 shadow-md bg-white">
            <CardContent className="p-8 space-y-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-gold-50 border border-gold-200 flex items-center justify-center text-gold-700">
                  <Smartphone className="w-6 h-6" />
                </div>
                <div>
                  <Badge className="bg-gold-50 text-gold-800 border border-gold-200 mb-0.5 font-bold">
                    Fast &amp; Convenient
                  </Badge>
                  <h2 className="font-serif text-2xl font-bold text-foreground">Mobile Money (MoMo)</h2>
                </div>
              </div>

              <p className="text-sm text-muted-foreground">
                You can pay your Tithes, Monthly Class Dues, Harvest Pledges, or Welfare Contributions directly via Mobile Money on all networks (MTN, Telecel, AT).
              </p>

              <div className="bg-gold-50/60 border border-gold-200 rounded-xl p-6 space-y-4">
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">Official MoMo Number</p>
                  <p className="text-2xl font-extrabold text-gold-800 tracking-wider">024 000 0000</p>
                </div>

                <div className="space-y-1 pt-2 border-t border-gold-200/70">
                  <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">Account Merchant Name</p>
                  <p className="text-sm font-bold text-foreground">Methodist Church Ghana</p>
                </div>

                <div className="space-y-1 pt-2 border-t border-gold-200/70">
                  <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">Reference Format</p>
                  <p className="text-xs text-secondary-foreground font-medium">
                    State your <span className="font-bold text-primary">Full Name</span> &amp; <span className="font-bold text-primary">Purpose</span> (e.g. &ldquo;Kwame Mensah - Tithe&rdquo; or &ldquo;Ama Osei - Harvest&rdquo;)
                  </p>
                </div>
              </div>

              <div className="space-y-2 text-xs text-muted-foreground">
                <p className="font-semibold text-secondary-foreground">How to send via USSD:</p>
                <ol className="list-decimal list-inside space-y-1 text-muted-foreground">
                  <li>Dial *170# (MTN) or *110# (Telecel / AT).</li>
                  <li>Select Transfer Money or Pay Merchant.</li>
                  <li>Enter Number: <strong>0240000000</strong>.</li>
                  <li>Enter Amount and reference (e.g., Tithe/Harvest).</li>
                  <li>Confirm with your MoMo PIN.</li>
                </ol>
              </div>
            </CardContent>
          </Card>

          {/* Bank Wire / Account Card */}
          <Card className="border-t-4 border-t-primary shadow-md bg-white">
            <CardContent className="p-8 space-y-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-primary">
                  <Building2 className="w-6 h-6" />
                </div>
                <div>
                  <Badge className="bg-blue-50 text-primary border border-blue-200 mb-0.5 font-bold">
                    Direct Deposit
                  </Badge>
                  <h2 className="font-serif text-2xl font-bold text-foreground">Bank Transfer / Standing Orders</h2>
                </div>
              </div>

              <p className="text-sm text-muted-foreground">
                For larger offerings, monthly standing orders, and corporate or international wire transfers:
              </p>

              <div className="bg-cream-200/60 border border-border rounded-xl p-6 space-y-4">
                <div className="grid grid-cols-2 gap-4 text-xs">
                  <div>
                    <p className="text-muted-foreground font-medium">Bank Name</p>
                    <p className="font-bold text-foreground text-sm">GCB Bank PLC / Stanbic Bank</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground font-medium">Branch</p>
                    <p className="font-bold text-foreground text-sm">Main Branch, Accra</p>
                  </div>
                </div>

                <div className="space-y-1 pt-2 border-t border-border">
                  <p className="text-xs text-muted-foreground font-medium">Account Name</p>
                  <p className="font-bold text-foreground">Methodist Church Ghana - Main Account</p>
                </div>

                <div className="space-y-1 pt-2 border-t border-border">
                  <p className="text-xs text-muted-foreground font-medium">Account Number</p>
                  <p className="text-xl font-extrabold text-primary tracking-wider">1011180009990</p>
                </div>
              </div>

              <div className="space-y-3 pt-2">
                <h3 className="text-sm font-bold text-foreground">Categories of Giving:</h3>
                <ul className="grid grid-cols-2 gap-2 text-xs text-muted-foreground font-medium">
                  <li className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-primary shrink-0" />
                    <span>Tithe (10%)</span>
                  </li>
                  <li className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-primary shrink-0" />
                    <span>Sunday Offertory</span>
                  </li>
                  <li className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-primary shrink-0" />
                    <span>Annual Harvest Pledge</span>
                  </li>
                  <li className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-primary shrink-0" />
                    <span>Building &amp; Capital Fund</span>
                  </li>
                  <li className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-primary shrink-0" />
                    <span>Class Monthly Dues</span>
                  </li>
                  <li className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-primary shrink-0" />
                    <span>Welfare Relief Fund</span>
                  </li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Security & Accountability Note */}
        <div className="bg-cream-200/60 border border-border rounded-xl p-6 flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-blue-50 text-primary">
            <ShieldCheck className="w-7 h-7" />
          </div>
          <div className="space-y-1">
            <h3 className="text-md font-bold text-foreground">Financial Transparency &amp; Stewardship</h3>
            <p className="text-xs text-muted-foreground">
              All contributions are audited by the Society Finance Committee and Synod auditors according to the Financial Regulations of the Methodist Church Ghana. Receipts for digital payments can be requested at the church office.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
