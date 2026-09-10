import { Metadata } from 'next';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Mail, Phone, ChevronRight, UserCheck, ShieldCheck, HeartHandshake } from 'lucide-react';
import { fetchPublicLeadership, LeadershipPublicItem } from '@/lib/api/public';

export const revalidate = 60;

export const metadata: Metadata = {
  title: 'Pastoral & Lay Leadership | Methodist Church Ghana',
  description: 'Meet the pastoral leadership, ministers, society stewards, and lay leaders serving the Lord at the Methodist Church Ghana.',
};

function displayName(leader: LeadershipPublicItem): string {
  if (leader.name) return leader.name;
  if (leader.member) return `${leader.member.firstName} ${leader.member.lastName}`;
  return leader.position.title;
}

function initials(name: string): string {
  return name.split(' ').map((n) => n[0]).filter(Boolean).slice(-2).join('');
}

export default async function LeadershipPage() {
  let leadership: LeadershipPublicItem[] = [];
  try {
    leadership = await fetchPublicLeadership();
  } catch (err) {
    console.error('Failed to fetch public leadership:', err);
  }

  const groups = new Map<string, LeadershipPublicItem[]>();
  for (const leader of leadership) {
    const category = leader.position.category || 'Lay Leadership';
    if (!groups.has(category)) groups.set(category, []);
    groups.get(category)!.push(leader);
  }

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

        {groups.size === 0 && (
          <div className="rounded-2xl border border-dashed border-border p-12 text-center text-sm text-muted-foreground">
            No leadership profiles have been published yet. Check back soon, or visit the admin dashboard to add one.
          </div>
        )}

        {Array.from(groups.entries()).map(([category, leaders]) => (
          <section key={category} className="space-y-6">
            <div className="border-b pb-4 border-border">
              <h2 className="font-serif text-2xl font-bold text-foreground flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-primary inline-block"></span> {category}
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {leaders.map((leader) => {
                const name = displayName(leader);
                const photo = leader.photoUrl || leader.member?.profilePhotoUrl;
                return (
                  <Card key={leader.id} className="rounded-2xl overflow-hidden hover:shadow-md transition-shadow border-border border-t-4 border-t-gold-500">
                    <CardContent className="p-6 sm:p-8 flex flex-col sm:flex-row gap-6 items-start">
                      <div className="w-24 h-24 rounded-full bg-primary flex-shrink-0 flex items-center justify-center text-gold-300 text-3xl font-bold border-4 border-gold-400 overflow-hidden">
                        {photo ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={photo} alt={name} className="h-full w-full object-cover" />
                        ) : (
                          initials(name)
                        )}
                      </div>
                      <div className="space-y-3">
                        <div>
                          <Badge className="bg-blue-50 text-primary mb-1 font-bold">
                            {leader.position.title}
                          </Badge>
                          <h3 className="font-serif text-xl font-bold text-foreground">{name}</h3>
                        </div>
                        {leader.bio && (
                          <p className="text-sm text-muted-foreground leading-relaxed">{leader.bio}</p>
                        )}
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
                );
              })}
            </div>
          </section>
        ))}

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
