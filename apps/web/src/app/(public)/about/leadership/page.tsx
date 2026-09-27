import { Metadata } from 'next';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Mail, Phone, ChevronRight, UserCheck, ShieldCheck, HeartHandshake } from 'lucide-react';
import { fetchPublicLeadership, LeadershipPublicItem } from '@/lib/api/public';

export const revalidate = 60;

export const metadata: Metadata = {
  title: 'Pastoral & Lay Leadership | Methodist Church Ghana',
  description:
    'Meet the pastoral leadership, ministers, society stewards, and lay leaders serving the Lord at the Methodist Church Ghana.',
};

function displayName(leader: LeadershipPublicItem): string {
  if (leader.name) return leader.name;
  if (leader.member) return `${leader.member.firstName} ${leader.member.lastName}`;
  return leader.position.title;
}

function initials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .filter(Boolean)
    .slice(-2)
    .join('');
}

const LEADERSHIP_ROLES = [
  {
    icon: ShieldCheck,
    title: 'Ordained Clergy',
    description:
      'Ministers of Word and Sacrament tasked with spiritual oversight, sound doctrine, pastoral care, and administration of the Sacraments.',
    color: 'bg-[#14309c]',
  },
  {
    icon: UserCheck,
    title: 'Society Stewards',
    description:
      'Elected lay officers who manage local church properties, finances, class system administration, and support the Minister in charge.',
    color: 'bg-[#FFC72C]',
    iconText: 'text-[#14309c]',
  },
  {
    icon: HeartHandshake,
    title: 'Organizational Leaders',
    description:
      "Presidents and executives of Connexional Organizations (Men's, Women's, Youth, Singing Band, Brigade) guiding specific demographics.",
    color: 'bg-[#14309c]',
  },
];

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
    <div className="min-h-screen bg-white text-slate-900">
      {/* ── HERO BANNER ── */}
      <section className="bg-[#14309c] px-4 py-16 sm:py-24 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl text-center space-y-5">
          <Badge className="bg-[#FFC72C]/20 border border-[#FFC72C]/40 text-[#FFC72C] font-bold text-xs uppercase tracking-widest hover:bg-[#FFC72C]/20">
            God&apos;s Servants &amp; Shepherds
          </Badge>
          <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white leading-tight tracking-tight">
            Church Leadership &amp; Officers
          </h1>
          <p className="text-base sm:text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed">
            The Methodist Church Ghana is governed through a connectional polity combining ordained
            clergy and committed lay leaders dedicated to servant leadership, prayer, and
            administrative stewardship.
          </p>
        </div>
      </section>

      {/* ── GOVERNANCE OVERVIEW CARDS ── */}
      <section className="bg-[#FAF8F5] py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-10">
          <div className="text-center space-y-2">
            <span className="block text-xs font-extrabold uppercase tracking-widest text-[#FFC72C]">
              Connexional Polity
            </span>
            <h2 className="font-serif text-3xl font-bold text-slate-900">Our Leadership Structure</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {LEADERSHIP_ROLES.map((role) => (
              <div
                key={role.title}
                className="rounded-2xl border border-slate-200/80 bg-white p-8 shadow-sm flex flex-col gap-5 hover:shadow-md transition-shadow"
              >
                <div
                  className={`w-12 h-12 rounded-xl ${role.color} flex items-center justify-center text-white flex-shrink-0`}
                >
                  <role.icon className={`w-6 h-6 ${role.iconText || 'text-white'}`} />
                </div>
                <div className="space-y-2">
                  <h3 className="font-serif text-xl font-bold text-slate-900">{role.title}</h3>
                  <p className="text-sm text-slate-600 leading-relaxed">{role.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── LEADERS GRID ── */}
      <section className="bg-white py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-14">
          {groups.size === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-200 p-12 text-center text-sm text-slate-500">
              No leadership profiles have been published yet. Check back soon, or visit the admin
              dashboard to add one.
            </div>
          ) : (
            Array.from(groups.entries()).map(([category, leaders]) => (
              <section key={category} className="space-y-8">
                {/* Category heading */}
                <div className="flex items-center gap-4">
                  <h2 className="font-serif text-2xl font-bold text-slate-900 flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-[#14309c] inline-block" />
                    {category}
                  </h2>
                  <div className="flex-1 h-[2px] bg-[#FFC72C]/50 rounded" />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {leaders.map((leader) => {
                    const name = displayName(leader);
                    const photo = leader.photoUrl || leader.member?.profilePhotoUrl;
                    return (
                      <div
                        key={leader.id}
                        className="rounded-2xl border border-slate-200/80 bg-white shadow-sm hover:shadow-md transition-shadow overflow-hidden"
                      >
                        {/* Gold top accent line */}
                        <div className="h-1 w-full bg-[#FFC72C]" />
                        <div className="p-6 sm:p-8 flex flex-col sm:flex-row gap-6 items-start">
                          {/* Avatar */}
                          <div className="w-20 h-20 rounded-full bg-[#14309c] flex-shrink-0 flex items-center justify-center text-[#FFC72C] text-2xl font-extrabold border-4 border-[#FFC72C]/60 overflow-hidden shadow-md">
                            {photo ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img src={photo} alt={name} className="h-full w-full object-cover" />
                            ) : (
                              initials(name)
                            )}
                          </div>
                          {/* Details */}
                          <div className="space-y-3 flex-1">
                            <div>
                              <Badge className="bg-[#14309c]/10 text-[#14309c] border border-[#14309c]/20 mb-1.5 font-bold text-xs">
                                {leader.position.title}
                              </Badge>
                              <h3 className="font-serif text-xl font-bold text-slate-900">{name}</h3>
                            </div>
                            {leader.bio && (
                              <p className="text-sm text-slate-600 leading-relaxed">{leader.bio}</p>
                            )}
                            <div className="pt-1 text-xs text-slate-500 space-y-1.5">
                              {leader.email && (
                                <div className="flex items-center gap-2">
                                  <Mail className="w-3.5 h-3.5 text-[#14309c]" />
                                  <span>{leader.email}</span>
                                </div>
                              )}
                              {leader.phone && (
                                <div className="flex items-center gap-2">
                                  <Phone className="w-3.5 h-3.5 text-[#14309c]" />
                                  <span>{leader.phone}</span>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>
            ))
          )}
        </div>
      </section>

      {/* ── CTA BANNER ── */}
      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center justify-between gap-6 rounded-2xl bg-gradient-to-r from-[#14309c] via-[#1c37ae] to-[#0f2478] border border-[#FFC72C]/20 p-8 shadow-xl text-center sm:p-12 md:flex-row md:text-left">
          <div className="space-y-2 max-w-xl">
            <h2 className="font-serif text-2xl font-bold text-white sm:text-3xl">
              Interested in Serving or Joining a Class?
            </h2>
            <p className="text-slate-300 text-sm leading-relaxed">
              Every Methodist is assigned to a Class led by a Class Leader. Connect with our
              stewards and ministers to get planted in fellowship and service.
            </p>
          </div>
          <Link
            href="/contact"
            className="shrink-0 inline-flex items-center gap-2 rounded-lg bg-[#FFC72C] px-8 py-4 text-sm font-extrabold text-[#14309c] shadow-md transition-all hover:bg-amber-400 hover:scale-[1.02]"
          >
            Contact Leaders <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
      </section>
    </div>
  );
}
