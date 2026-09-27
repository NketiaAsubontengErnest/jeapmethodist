import Link from 'next/link';
import { MapPin, Phone, Mail, Clock } from 'lucide-react';
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
  facebookUrl?: string;
  youtubeUrl?: string;
  instagramUrl?: string;
  tiktokUrl?: string;
  xUrl?: string;
  whatsappChannelUrl?: string;
  threadsUrl?: string;
}

export function PublicFooter({
  churchName = 'Methodist Church Ghana',
  societyName,
  slogan,
  heroSubtitle,
  address,
  phone,
  email,
  secretariatHours,
  logoUrl,
  facebookUrl,
  youtubeUrl,
  instagramUrl,
  tiktokUrl,
  xUrl,
  whatsappChannelUrl,
  threadsUrl,
}: PublicFooterProps) {
  const logoSrc = formatMediaUrl(logoUrl);

  const socialLinks = [
    {
      key: 'facebook',
      label: 'Facebook',
      url: facebookUrl,
      icon: (
        <svg className="h-4 w-4 fill-current" viewBox="0 0 24 24" aria-hidden="true">
          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
        </svg>
      ),
    },
    {
      key: 'youtube',
      label: 'YouTube',
      url: youtubeUrl,
      icon: (
        <svg className="h-4 w-4 fill-current" viewBox="0 0 24 24" aria-hidden="true">
          <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
        </svg>
      ),
    },
    {
      key: 'instagram',
      label: 'Instagram',
      url: instagramUrl,
      icon: (
        <svg className="h-4 w-4 fill-current" viewBox="0 0 24 24" aria-hidden="true">
          <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z" />
        </svg>
      ),
    },
    {
      key: 'tiktok',
      label: 'TikTok',
      url: tiktokUrl,
      icon: (
        <svg className="h-4 w-4 fill-current" viewBox="0 0 24 24" aria-hidden="true">
          <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.82.57-1.32 1.55-1.36 2.55-.06.99.36 1.97 1.11 2.62.8.69 1.93.92 2.92.61.99-.3 1.79-1.08 2.06-2.07.13-.5.17-1.02.16-1.54.02-4.5.01-9 .01-13.5z" />
        </svg>
      ),
    },
    {
      key: 'x',
      label: 'X (Twitter)',
      url: xUrl,
      icon: (
        <svg className="h-4 w-4 fill-current" viewBox="0 0 24 24" aria-hidden="true">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
        </svg>
      ),
    },
    {
      key: 'whatsapp',
      label: 'WhatsApp Channel',
      url: whatsappChannelUrl,
      icon: (
        <svg className="h-4 w-4 fill-current" viewBox="0 0 24 24" aria-hidden="true">
          <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z" />
        </svg>
      ),
    },
    {
      key: 'threads',
      label: 'Threads',
      url: threadsUrl,
      icon: (
        <svg className="h-4 w-4 fill-current" viewBox="0 0 24 24" aria-hidden="true">
          <path d="M12.186 24c-2.738 0-5.112-.766-7.054-2.278A11.722 11.722 0 0 1 1 15.65C.324 13.435.006 11.05.006 8.52 0 6.002.327 3.633 1.025 1.436.438-.073.992.003 1.542.003h.036c.64 0 1.109.117 1.415.352.33.25.495.642.495 1.17 0 .23-.037.493-.11.785-.563 2.012-.843 4.148-.843 6.347 0 2.253.284 4.398.847 6.376.51 1.79 1.348 3.242 2.49 4.316 1.432 1.346 3.287 2.029 5.518 2.029 2.502 0 4.542-.857 6.06-2.548 1.444-1.61 2.177-3.805 2.177-6.527 0-2.316-.549-4.234-1.631-5.698C16.892 5.17 14.89 4.385 12.3 4.385c-1.996 0-3.642.547-4.893 1.626-1.196 1.031-1.788 2.443-1.788 4.195 0 1.61.564 2.923 1.677 3.902 1.117.982 2.617 1.48 4.458 1.48.97 0 1.834-.14 2.569-.418v1.892c-.753.228-1.57.343-2.45.343-2.52 0-4.542-.71-6.01-2.11C4.4 13.885 3.655 11.99 3.655 9.645c0-2.543.896-4.63 2.663-6.205C8.118 1.838 10.59 1.01 13.435 1.01c3.55 0 6.335 1.088 8.277 3.235C23.633 6.374 24.5 9.176 24.5 12.56c0 3.61-.99 6.55-2.943 8.74C19.537 23.57 16.275 24.5 12.186 24z" />
        </svg>
      ),
    },
  ].filter((item) => Boolean(item.url?.trim()));

  return (
    <footer className="bg-[#0f2478] border-t border-white/10 text-slate-300">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 space-y-12">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          {/* Column 1: Org details & tagline */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              {logoSrc && (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img
                  src={logoSrc}
                  alt={societyName || churchName}
                  className="h-9 w-9 rounded-full border border-[#FFC72C]/80 bg-white object-contain p-0.5"
                />
              )}
              <span className="block text-[11px] font-extrabold uppercase tracking-widest text-[#FFC72C]">
                {churchName}
              </span>
            </div>
            {societyName && (
              <h3 className="font-serif text-xl font-bold leading-tight text-white">{societyName}</h3>
            )}
            {heroSubtitle && <p className="text-xs leading-relaxed text-slate-400">{heroSubtitle}</p>}
            {slogan && (
              <p className="text-xs font-semibold italic text-[#FFC72C]">
                &quot;{slogan.replace(/^["']|["']$/g, '')}&quot;
              </p>
            )}

            {/* Dynamic Social Links below Column 1 */}
            {socialLinks.length > 0 && (
              <div className="pt-2 space-y-2">
                <p className="text-[10px] font-extrabold uppercase tracking-widest text-[#FFC72C]">
                  Follow &amp; Connect
                </p>
                <div className="flex flex-wrap items-center gap-2">
                  {socialLinks.map((s) => (
                    <a
                      key={s.key}
                      href={s.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      title={s.label}
                      className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/10 text-slate-200 hover:bg-[#FFC72C] hover:text-[#14309c] transition-all"
                    >
                      {s.icon}
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Column 2: Explore */}
          <div className="space-y-3">
            <h4 className="text-[11px] font-extrabold uppercase tracking-widest text-[#FFC72C]">EXPLORE</h4>
            <ul className="space-y-2 text-xs font-medium text-slate-300">
              <li>
                <Link href="/about" className="transition-colors hover:text-[#FFC72C]">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/ministries" className="transition-colors hover:text-[#FFC72C]">
                  Activities &amp; Fellowships
                </Link>
              </li>
              <li>
                <Link href="/events" className="transition-colors hover:text-[#FFC72C]">
                  Events
                </Link>
              </li>
              <li>
                <Link href="/news" className="transition-colors hover:text-[#FFC72C]">
                  News
                </Link>
              </li>
              <li>
                <Link href="/gallery" className="transition-colors hover:text-[#FFC72C]">
                  Gallery
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Contact */}
          <div className="space-y-3">
            <h4 className="text-[11px] font-extrabold uppercase tracking-widest text-[#FFC72C]">CONTACT</h4>
            <div className="space-y-1.5 text-xs text-slate-300">
              {address && (
                <p className="flex items-start gap-1.5">
                  <MapPin className="h-3.5 w-3.5 text-[#FFC72C] shrink-0 mt-0.5" />
                  <span className="line-clamp-2">{address}</span>
                </p>
              )}
              {phone && (
                <p className="flex items-center gap-1.5">
                  <Phone className="h-3.5 w-3.5 text-[#FFC72C] shrink-0" />
                  <span>{phone}</span>
                </p>
              )}
              {email && (
                <p className="flex items-center gap-1.5">
                  <Mail className="h-3.5 w-3.5 text-[#FFC72C] shrink-0" />
                  <span>{email}</span>
                </p>
              )}
              {secretariatHours && (
                <p className="flex items-center gap-1.5">
                  <Clock className="h-3.5 w-3.5 text-[#FFC72C] shrink-0" />
                  <span>{secretariatHours}</span>
                </p>
              )}
            </div>
            <Link
              href="/contact"
              className="inline-flex items-center text-xs font-bold text-[#FFC72C] hover:underline pt-1"
            >
              Full Contact Page &rarr;
            </Link>
          </div>

          {/* Column 4: Join us CTA & Social Media Links */}
          <div className="space-y-4">
            <h4 className="text-[11px] font-extrabold uppercase tracking-widest text-[#FFC72C]">JOIN US</h4>
            <p className="text-xs leading-relaxed text-slate-400">
              Enrolment is handled by our team. Reach out and we will guide you through the next steps.
            </p>
            <div>
              <Link
                href="/visit-us"
                className="inline-block rounded-lg bg-[#FFC72C] px-5 py-2.5 text-xs font-extrabold text-[#14309c] shadow hover:bg-amber-400 transition-colors"
              >
                Get in Touch
              </Link>
            </div>
          </div>
        </div>

        {/* Bottom copyright line with Social Links */}
        <div className="border-t border-slate-800 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>
            &copy; {new Date().getFullYear()} {churchName}. All rights reserved.
          </p>

          {socialLinks.length > 0 && (
            <div className="flex items-center gap-3">
              <span className="text-[11px] font-semibold text-slate-400">Connect:</span>
              <div className="flex items-center gap-2">
                {socialLinks.map((s) => (
                  <a
                    key={s.key}
                    href={s.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    title={s.label}
                    className="text-slate-400 hover:text-[#FFC72C] transition-colors p-1"
                  >
                    {s.icon}
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </footer>
  );
}
