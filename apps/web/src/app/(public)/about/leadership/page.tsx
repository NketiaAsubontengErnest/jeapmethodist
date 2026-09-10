import { Metadata } from 'next';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Mail, Phone, ChevronRight, UserCheck, ShieldCheck, HeartHandshake } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Pastoral & Lay Leadership | Methodist Church Ghana',
  description: 'Meet the pastoral leadership, ministers, society stewards, and lay leaders serving the Lord at the Methodist Church Ghana.',
};

interface Leader {
  name: string;
  role: string;
  category: 'Clergy' | 'Circuit Leadership' | 'Society Stewards' | 'Organizational Heads';
  bio: string;
  image?: string;
  email?: string;
  phone?: string;
}

const leaders: Leader[] = [
  {
    name: 'Very Rev. Dr. Emmanuel K. Asante',
    role: 'Superintendent Minister',
    category: 'Clergy',
    bio: 'Serving with dedication in pastoral care, spiritual direction, and theological teaching. Oversees the spiritual and administrative direction of the Circuit and Society.',
    email: 'superintendent@methodist.org.gh',
    phone: '+233 24 000 0001',
  },
  {
    name: 'Rev. Grace Mensah',
    role: 'Associate Minister',
    category: 'Clergy',
    bio: 'Passionate about youth evangelism, family counselling, and discipleship. Coordinates mid-week Bible study, prayer meetings, and women’s fellowship ministries.',
    email: 'grace.mensah@methodist.org.gh',
    phone: '+233 24 000 0002',
  },
  {
    name: 'Bro. Kwabena Osei-Tutu',
    role: 'Senior Society Steward',
    category: 'Society Stewards',
    bio: 'Assists the Minister in charge in the administration of the Society, oversight of temporal matters, financial accountability, and member welfare.',
    email: 'steward.brokwabena@methodist.org.gh',
  },
  {
    name: 'Sis. Abigail Addo-Kufuor',
    role: 'Society Steward (Welfare & Finance)',
    category: 'Society Stewards',
    bio: 'Manages member care, emergency relief distribution, stewardship accounting, and coordinate fellowship outreach programs across all classes.',
    email: 'steward.abigail@methodist.org.gh',
  },
  {
    name: 'Bro. Samuel Oppong-Wusu',
    role: 'Lay President / Circuit Vice President',
    category: 'Circuit Leadership',
    bio: 'Provides lay leadership at the Circuit level, working hand in hand with the Superintendent Minister to drive Circuit initiatives and synod policy implementation.',
  },
  {
    name: 'Sis. Elizabeth Poku',
    role: 'Women’s Fellowship President',
    category: 'Organizational Heads',
    bio: 'Leads the Women’s Fellowship organization in spiritual empowerment, community charity initiatives, and annual convention preparations.',
  },
  {
    name: 'Bro. Daniel K. Ampofo',
    role: 'Christ’s Little Band President',
    category: 'Organizational Heads',
    bio: 'Spearheads evangelistic visits to sick and elderly members, prayer vigils, and traditional Methodist hymnody preservation.',
  },
  {
    name: 'Sis. Priscilla Baah',
    role: 'Youth Fellowship (MYF) President',
    category: 'Organizational Heads',
    bio: 'Mobilizes young adults and teenagers for Bible quizzes, sports galas, university campus outreaches, and skill development workshops.',
  },
];

export default function LeadershipPage() {
  const clergy = leaders.filter((l) => l.category === 'Clergy');
  const stewards = leaders.filter((l) => l.category === 'Society Stewards');
  const orgHeads = leaders.filter((l) => l.category === 'Organizational Heads' || l.category === 'Circuit Leadership');

  return (
    <div className="min-h-screen bg-white py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Header Section */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <Badge variant="outline" className="rounded-full border-blue-200 bg-blue-50 font-bold text-primary">
            God’s Servants & Shepherds
          </Badge>
          <h1 className="font-serif text-4xl font-extrabold text-foreground tracking-tight sm:text-5xl">
            Church Leadership & Officers
          </h1>
          <p className="text-lg text-muted-foreground">
            The Methodist Church Ghana is governed through a connectional polity combining ordained clergy and committed lay leaders dedicated to servant leadership, prayer, and administrative stewardship.
          </p>
        </div>

        {/* Connexional Structure Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="rounded-2xl border-border border-t-4 border-t-primary shadow-sm">
            <CardContent className="pt-6 space-y-3">
              <div className="w-12 h-12 rounded-lg border border-blue-100 bg-blue-50 flex items-center justify-center text-primary">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="font-serif text-xl font-bold text-foreground">Ordained Clergy</h3>
              <p className="text-sm text-muted-foreground">
                Ministers of Word and Sacrament tasked with spiritual oversight, sound doctrine, pastoral care, and administration of the Sacraments.
              </p>
            </CardContent>
          </Card>

          <Card className="rounded-2xl border-border border-t-4 border-t-gold-500 shadow-sm">
            <CardContent className="pt-6 space-y-3">
              <div className="w-12 h-12 rounded-lg border border-gold-200 bg-gold-50 flex items-center justify-center text-gold-700">
                <UserCheck className="w-6 h-6" />
              </div>
              <h3 className="font-serif text-xl font-bold text-foreground">Society Stewards</h3>
              <p className="text-sm text-muted-foreground">
                Elected lay officers who manage local church properties, finances, class system administration, and support the Minister in charge.
              </p>
            </CardContent>
          </Card>

          <Card className="rounded-2xl border-border border-t-4 border-t-primary shadow-sm">
            <CardContent className="pt-6 space-y-3">
              <div className="w-12 h-12 rounded-lg border border-blue-100 bg-blue-50 flex items-center justify-center text-primary">
                <HeartHandshake className="w-6 h-6" />
              </div>
              <h3 className="font-serif text-xl font-bold text-foreground">Organizational Leaders</h3>
              <p className="text-sm text-muted-foreground">
                Presidents and executives of Connexional Organizations (Men’s, Women’s, Youth, Singing Band, Brigade) guiding specific demographics.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Pastoral Leadership Section */}
        <section className="space-y-6">
          <div className="border-b pb-4 border-border">
            <h2 className="font-serif text-2xl font-bold text-foreground flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-primary inline-block"></span> Pastoral Leadership (Ministers)
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {clergy.map((leader, i) => (
              <Card key={i} className="rounded-2xl overflow-hidden hover:shadow-md transition-shadow border-border border-t-4 border-t-gold-500">
                <CardContent className="p-6 sm:p-8 flex flex-col sm:flex-row gap-6 items-start">
                  <div className="w-24 h-24 rounded-full bg-primary flex-shrink-0 flex items-center justify-center text-gold-300 text-3xl font-bold border-4 border-gold-400">
                    {leader.name.split(' ').map((n) => n[0]).slice(-2).join('')}
                  </div>
                  <div className="space-y-3">
                    <div>
                      <Badge className="bg-blue-50 text-primary mb-1 font-bold">
                        {leader.role}
                      </Badge>
                      <h3 className="font-serif text-xl font-bold text-foreground">{leader.name}</h3>
                    </div>
                    <p className="text-sm text-muted-foreground leading-relaxed">{leader.bio}</p>
                    <div className="pt-2 text-xs text-muted-foreground space-y-1">
                      {leader.email && (
                        <div className="flex items-center gap-2">
                          <Mail className="w-3.5 h-3.5 text-primary" />
                          <span>{leader.email}</span>
                        </div>
                      )}
                      {leader.phone && (
                        <div className="flex items-center gap-2">
                          <Phone className="w-3.5 h-3.5 text-primary" />
                          <span>{leader.phone}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Society Stewards Section */}
        <section className="space-y-6">
          <div className="border-b pb-4 border-border">
            <h2 className="font-serif text-2xl font-bold text-foreground flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-gold-500 inline-block"></span> Society Stewards & Officers
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {stewards.map((leader, i) => (
              <Card key={i} className="rounded-2xl border-border hover:shadow-md transition-shadow">
                <CardContent className="p-6 space-y-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <Badge variant="outline" className="border-gold-300 text-gold-700 mb-1 font-semibold">
                        {leader.role}
                      </Badge>
                      <h3 className="font-serif text-lg font-bold text-foreground">{leader.name}</h3>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground">{leader.bio}</p>
                  {leader.email && (
                    <div className="pt-2 flex items-center gap-2 text-xs text-muted-foreground">
                      <Mail className="w-3.5 h-3.5 text-primary" />
                      <span>{leader.email}</span>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Organizational Leaders */}
        <section className="space-y-6">
          <div className="border-b pb-4 border-border">
            <h2 className="font-serif text-2xl font-bold text-foreground flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-primary inline-block"></span> Circuit & Organization Leaders
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {orgHeads.map((leader, i) => (
              <Card key={i} className="rounded-2xl flex flex-col justify-between border-border border-t-4 border-t-primary">
                <CardContent className="p-5 space-y-3">
                  <Badge variant="secondary" className="text-xs font-semibold">
                    {leader.role}
                  </Badge>
                  <h3 className="font-serif text-md font-bold text-foreground">{leader.name}</h3>
                  <p className="text-xs text-muted-foreground">{leader.bio}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Call to Action — the one deliberate dark accent block on this page */}
        <div className="bg-gradient-to-br from-blue-900 via-blue-800 to-red-700 text-white rounded-2xl p-8 sm:p-12 text-center space-y-4 shadow-xl border border-gold-500/30">
          <h2 className="font-serif text-2xl sm:text-3xl font-bold">Interested in Serving or Joining a Class?</h2>
          <p className="text-cream-200 max-w-2xl mx-auto text-sm sm:text-base">
            Every Methodist is assigned to a Class led by a Class Leader. Connect with our stewards and ministers to get planted in fellowship and service.
          </p>
          <div className="pt-4 flex justify-center gap-4">
            <Link
              href="/contact"
              className="px-6 py-3 bg-gold-400 hover:bg-gold-500 text-blue-950 font-bold rounded-lg shadow transition-colors inline-flex items-center gap-2 text-sm"
            >
              Contact Leaders <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
