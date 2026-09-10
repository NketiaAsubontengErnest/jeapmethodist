'use client';

import { useEffect, useState, type ReactNode } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { Cross, LogOut, Loader2, User, ChevronDown } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { fetchPublicSettings } from '@/lib/api/public';
import { NAV_ITEMS } from '@/lib/nav-items';
import { cn, formatMediaUrl } from '@/lib/utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export default function AdminLayout({ children }: { children: ReactNode }) {
  const { user, isLoading, logout, hasPermission } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const { data: settings } = useQuery({
    queryKey: ['public-settings'],
    queryFn: fetchPublicSettings,
  });

  const logoSrc = formatMediaUrl(settings?.logo_url);

  useEffect(() => {
    if (!isLoading && !user) {
      router.replace('/login');
    }
  }, [isLoading, user, router]);

  if (isLoading || !user) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-secondary">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" aria-label="Loading" />
      </div>
    );
  }

  const visibleItems = NAV_ITEMS.filter((item) => !item.permission || hasPermission(item.permission));

  return (
    // `fixed inset-0` (not h-screen/min-h-screen) so this shell never becomes
    // part of the document's scrollable height — that's what was causing the
    // "two scrollbars" bug: the outer page and the inner `main` region both
    // scrolling at once. Being fixed removes the outer page as a scroll
    // candidate entirely; only `nav` (sidebar) and `main` below scroll,
    // independently, while the header and sidebar chrome never move.
    <div className="fixed inset-0 flex overflow-hidden bg-secondary print:static print:block print:h-auto print:overflow-visible">
      <aside className="hidden w-64 shrink-0 flex-col border-r border-border bg-card md:flex print:hidden">
        <div className="flex h-16 shrink-0 items-center gap-3 border-b border-border px-5">
          {logoSrc ? (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img
              src={logoSrc}
              alt={settings?.church_name || 'Church Logo'}
              className="h-9 w-9 rounded-full border border-amber-500/60 bg-white object-contain p-0.5 shadow-sm shrink-0"
            />
          ) : (
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border-2 border-amber-500 bg-white text-red-600 shadow-sm">
              <Cross className="h-4.5 w-4.5" strokeWidth={2.5} />
            </div>
          )}
          <div className="flex flex-col min-w-0">
            <span className="truncate font-serif text-sm font-bold text-foreground">
              {settings?.church_name || 'Methodist Church'}
            </span>
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-muted-foreground">
              Church Portal
            </span>
          </div>
        </div>
        {/* Independent scroll region — the sidebar nav scrolls on its own, separately from the main content and from the logo/logout chrome around it */}
        <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
          {visibleItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            if (item.comingSoon) {
              return (
                <span
                  key={item.href}
                  title="Coming soon"
                  className="flex cursor-not-allowed items-center gap-3 rounded-md px-3 py-2 text-sm text-muted-foreground/50"
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                  <span className="ml-auto rounded-full bg-muted px-2 py-0.5 text-[10px] uppercase">Soon</span>
                </span>
              );
            }
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-primary text-primary-foreground'
                    : 'text-foreground hover:bg-muted',
                )}
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </aside>

      <div className="flex h-full min-w-0 flex-1 flex-col overflow-hidden print:block print:h-auto print:overflow-visible">
        {/* Fixed — never scrolls with the page content */}
        <header className="flex h-16 shrink-0 items-center justify-between border-b border-border bg-card px-4 md:px-6 print:hidden">
          <div className="flex items-center gap-3">
            {/* Mobile Logo & Brand Header */}
            <div className="flex items-center gap-2.5 md:hidden">
              {logoSrc ? (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img
                  src={logoSrc}
                  alt={settings?.church_name || 'Church Logo'}
                  className="h-8 w-8 rounded-full border border-amber-500/60 bg-white object-contain p-0.5 shadow-sm"
                />
              ) : (
                <div className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-amber-500 bg-white text-red-600">
                  <Cross className="h-4 w-4" strokeWidth={2.5} />
                </div>
              )}
              <span className="font-serif text-sm font-bold text-foreground truncate max-w-[140px]">
                {settings?.church_name || 'Church Portal'}
              </span>
            </div>

            {/* Desktop Role Badge */}
            <p className="hidden text-sm text-muted-foreground md:block font-medium">
              {user.role?.replace('_', ' ') ?? ''}
            </p>
          </div>

          {/* User Dropdown Menu at Top Right */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                className="flex items-center gap-2.5 rounded-xl p-1.5 hover:bg-muted transition-colors cursor-pointer outline-none group"
              >
                <div className="text-right hidden sm:block">
                  <p className="text-sm font-semibold leading-tight text-foreground">
                    {user.firstName} {user.lastName}
                  </p>
                  <p className="text-xs text-muted-foreground leading-tight">{user.email}</p>
                </div>
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground shadow-sm">
                  {user.firstName[0]}
                  {user.lastName[0]}
                </div>
                <ChevronDown className="h-4 w-4 text-muted-foreground transition-transform group-data-[state=open]:rotate-180" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 space-y-1">
              <DropdownMenuLabel className="space-y-0.5">
                <p className="text-xs font-bold text-foreground truncate">
                  {user.firstName} {user.lastName}
                </p>
                <p className="text-[11px] font-normal text-muted-foreground truncate">{user.email}</p>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/admin/profile" className="flex w-full items-center gap-2 font-semibold">
                  <User className="h-4 w-4 text-amber-500" />
                  My Profile
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => logout().then(() => router.replace('/login'))}
                className="text-rose-600 focus:bg-rose-50 focus:text-rose-700 dark:focus:bg-rose-950 dark:focus:text-rose-400 font-semibold"
              >
                <LogOut className="h-4 w-4" />
                Log out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </header>
        {/* Independent scroll region — the main content scrolls on its own, separately from the sidebar */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6 print:h-auto print:overflow-visible print:p-0">{children}</main>
      </div>
    </div>
  );
}
