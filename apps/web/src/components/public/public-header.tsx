'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Cross, Menu, X, Phone, Heart, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn, formatMediaUrl } from '@/lib/utils';

const NAV_LINKS = [
  { label: 'Home', href: '/' },
  { label: 'About', href: '/about' },
  { label: 'Ministries', href: '/ministries' },
  { label: 'Sermons', href: '/sermons' },
  { label: 'Events', href: '/events' },
  { label: 'News', href: '/news' },
  { label: 'Gallery', href: '/gallery' },
  { label: 'Contact', href: '/contact' },
];

interface PublicHeaderProps {
  churchName?: string;
  societyName?: string;
  phone?: string;
  sundayServiceTimes?: string;
  logoUrl?: string;
}

export function PublicHeader({
  churchName = 'Methodist Church Ghana',
  societyName,
  phone,
  sundayServiceTimes,
  logoUrl,
}: PublicHeaderProps) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const logoSrc = formatMediaUrl(logoUrl);

  return (
    <header className="sticky top-0 z-50 w-full shadow-md">
      {/* Top utility bar */}
      <div className="bg-[#0f2478] px-4 py-1.5 text-xs font-medium text-slate-300 sm:px-6">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <div className="flex items-center gap-4">
            {phone && (
              <span className="hidden items-center gap-1 sm:inline-flex">
                <Phone className="h-3 w-3 text-[#FFC72C]" /> {phone}
              </span>
            )}
            {sundayServiceTimes && (
              <span className="font-semibold text-[#FFC72C]">{sundayServiceTimes}</span>
            )}
          </div>
          <div className="flex items-center gap-3">
            <Link href="/visit-us" className="font-semibold text-slate-200 hover:text-[#FFC72C] transition-colors">
              Plan Your Visit &rarr;
            </Link>
            <span className="text-white/30">|</span>
            <Link href="/login" className="flex items-center gap-1 text-slate-300 hover:text-white transition-colors">
              <Lock className="h-3 w-3 text-[#FFC72C]" /> Staff Portal
            </Link>
          </div>
        </div>
      </div>

      {/* Main navbar — royal blue #14309c */}
      <div className="bg-[#14309c] border-b border-white/10">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
          <Link href="/" className="group flex items-center gap-3">
            {logoSrc ? (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img
                src={logoSrc}
                alt={churchName}
                className="h-10 w-10 rounded-full border border-[#FFC72C]/80 bg-white object-contain p-0.5 shadow-sm transition-transform group-hover:scale-105"
              />
            ) : (
              <div className="flex h-10 w-10 items-center justify-center rounded-full border border-[#FFC72C]/80 bg-white text-[#14309c] shadow-sm transition-transform group-hover:scale-105">
                <Cross className="h-5 w-5 text-[#14309c]" strokeWidth={2.5} />
              </div>
            )}
            <div className="text-left">
              <span className="block font-serif text-lg font-bold leading-tight tracking-tight text-white">
                {churchName}
              </span>
              <span className="block text-[10px] font-extrabold uppercase tracking-widest text-[#FFC72C]">
                {societyName}
              </span>
            </div>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden items-center gap-1 md:flex">
            {NAV_LINKS.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    'rounded-md px-3.5 py-1.5 text-xs font-semibold tracking-wide transition-all',
                    isActive
                      ? 'bg-[#FFC72C] text-[#14309c] font-bold shadow-sm'
                      : 'text-slate-200 hover:bg-white/10 hover:text-white',
                  )}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>

          <div className="hidden items-center gap-3 md:flex">
            <Button asChild className="rounded-lg bg-[#FFC72C] px-5 py-2 text-xs font-bold text-[#14309c] shadow hover:bg-amber-400 transition-colors">
              <Link href="/visit-us">Join Us</Link>
            </Button>
            <Button asChild variant="outline" className="rounded-lg border-white/30 bg-white/5 text-xs font-semibold text-white hover:bg-white/15 hover:text-white">
              <Link href="/login">Login</Link>
            </Button>
          </div>

          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="rounded-md p-2 text-white hover:bg-white/10 md:hidden"
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {mobileOpen && (
          <div className="space-y-2 border-t border-white/15 px-4 pb-4 pt-2 md:hidden">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className={cn(
                  'block rounded-md px-3 py-2 text-sm font-semibold',
                  pathname === link.href ? 'bg-[#FFC72C] text-[#14309c]' : 'text-slate-200 hover:bg-white/10 hover:text-white',
                )}
              >
                {link.label}
              </Link>
            ))}
            <div className="flex flex-col gap-2 border-t border-white/15 pt-3">
              <Button asChild className="w-full justify-center bg-[#FFC72C] font-bold text-[#14309c]">
                <Link href="/visit-us" onClick={() => setMobileOpen(false)}>
                  Join Us
                </Link>
              </Button>
              <Button asChild variant="outline" className="w-full justify-center border-white/40 text-white hover:bg-white/10">
                <Link href="/login" onClick={() => setMobileOpen(false)}>
                  Login
                </Link>
              </Button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
