import Link from 'next/link';
import { Cross, MapPin, Phone, Mail, Clock, Facebook, Youtube, Heart } from 'lucide-react';
import { formatMediaUrl } from '@/lib/utils';

interface PublicFooterProps {
  churchName?: string;
  societyName?: string;
  slogan?: string;
  heroSubtitle?: string;
  address?: string;
  phone?: string;
  email?: string;
  secretariatHours?: string;
  sundayServiceTimes?: string;
  midweekServiceTimes?: string;
  logoUrl?: string;
}

export function PublicFooter({
  churchName = 'Methodist Church Ghana',
  societyName = 'Trinity Society',
  slogan = 'Sure and Steadfast!',
  heroSubtitle = 'A vibrant, spirit-filled family worshipping Christ, building lives, and transforming communities in Ghana.',
  address = 'Methodist Church Ghana, Cathedral Avenue, Accra / Circuit Headquarters',
  phone = '+233 30 200 0000 / +233 24 000 0000',
  email = 'info@methodistchurch.org.gh',
  secretariatHours = 'Monday – Friday: 8:00 AM – 5:00 PM',
  sundayServiceTimes = 'First Service: 7:00 AM | Second Service: 9:30 AM',
  midweekServiceTimes = 'Wednesday Bible Study: 6:00 PM',
  logoUrl,
}: PublicFooterProps) {
  const logoSrc = formatMediaUrl(logoUrl);

  return (
    <footer className="bg-[#0f2478] border-t border-white/10 text-slate-300">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          {/* Column 1: Org details & tagline */}
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              {logoSrc && (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img src={logoSrc} alt={societyName} className="h-9 w-9 rounded-full border border-[#FFC72C]/80 bg-white object-contain p-0.5" />
              )}
              <span className="block text-[11px] font-extrabold uppercase tracking-widest text-[#FFC72C]">
                {churchName}
              </span>
            </div>
            <h3 className="font-serif text-xl font-bold leading-tight text-white">{societyName}</h3>
            <p className="text-xs leading-relaxed text-slate-400">
              {heroSubtitle}
            </p>
            <p className="text-xs font-semibold italic text-[#FFC72C] pt-1">
              &quot;{slogan.replace(/^["']|["']$/g, '')}&quot;
            </p>
          </div>

          {/* Column 2: Explore */}
          <div className="space-y-3">
            <h4 className="text-[11px] font-extrabold uppercase tracking-widest text-[#FFC72C]">EXPLORE</h4>
            <ul className="space-y-2 text-xs font-medium text-slate-300">
              <li><Link href="/about" className="transition-colors hover:text-[#FFC72C]">About Us</Link></li>
              <li><Link href="/ministries" className="transition-colors hover:text-[#FFC72C]">Activities &amp; Fellowships</Link></li>
              <li><Link href="/events" className="transition-colors hover:text-[#FFC72C]">Events</Link></li>
              <li><Link href="/news" className="transition-colors hover:text-[#FFC72C]">News</Link></li>
              <li><Link href="/gallery" className="transition-colors hover:text-[#FFC72C]">Gallery</Link></li>
            </ul>
          </div>

          {/* Column 3: Contact */}
          <div className="space-y-3">
            <h4 className="text-[11px] font-extrabold uppercase tracking-widest text-[#FFC72C]">CONTACT</h4>
            <div className="space-y-1.5 text-xs text-slate-300">
              <p className="flex items-start gap-1.5">
                <MapPin className="h-3.5 w-3.5 text-[#FFC72C] shrink-0 mt-0.5" />
                <span className="line-clamp-2">{address}</span>
              </p>
              <p className="flex items-center gap-1.5">
                <Phone className="h-3.5 w-3.5 text-[#FFC72C] shrink-0" />
                <span>{phone}</span>
              </p>
              <p className="flex items-center gap-1.5">
                <Mail className="h-3.5 w-3.5 text-[#FFC72C] shrink-0" />
                <span>{email}</span>
              </p>
              <p className="flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5 text-[#FFC72C] shrink-0" />
                <span>{secretariatHours}</span>
              </p>
            </div>
            <Link href="/contact" className="inline-flex items-center text-xs font-bold text-[#FFC72C] hover:underline pt-1">
              Full Contact Page &rarr;
            </Link>
          </div>

          {/* Column 4: Join us CTA */}
          <div className="space-y-3">
            <h4 className="text-[11px] font-extrabold uppercase tracking-widest text-[#FFC72C]">JOIN US</h4>
            <p className="text-xs leading-relaxed text-slate-400">
              Enrolment is handled by our team. Reach out and we will guide you through the next steps.
            </p>
            <div className="pt-2">
              <Link
                href="/visit-us"
                className="inline-block rounded-lg bg-[#FFC72C] px-5 py-2.5 text-xs font-extrabold text-[#14309c] shadow hover:bg-amber-400 transition-colors"
              >
                Get in Touch
              </Link>
            </div>
          </div>
        </div>

        {/* Bottom copyright line */}
        <div className="mt-14 border-t border-slate-800 pt-8 text-center text-xs text-slate-500">
          <p>&copy; {new Date().getFullYear()} {churchName}. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
