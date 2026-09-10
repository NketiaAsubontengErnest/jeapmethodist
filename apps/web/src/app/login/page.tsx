'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Cross, Mail, Lock, LogIn, ArrowLeft, Loader2, Sparkles } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { fetchPublicSettings } from '@/lib/api/public';
import { ApiError } from '@/lib/api-client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { formatMediaUrl } from '@/lib/utils';

const loginSchema = z.object({
  email: z.string().email('Enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [serverError, setServerError] = useState<string | null>(null);

  const { data: settings, isLoading } = useQuery({
    queryKey: ['public-settings'],
    queryFn: fetchPublicSettings,
  });

  const logoSrc = formatMediaUrl(settings?.logo_url);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({ resolver: zodResolver(loginSchema) });

  const onSubmit = async (values: LoginFormValues) => {
    setServerError(null);
    try {
      await login(values.email, values.password);
      router.push('/admin/dashboard');
    } catch (error) {
      setServerError(error instanceof Error ? error.message : 'Something went wrong. Please try again.');
    }
  };

  return (
    <main className="min-h-screen w-full grid lg:grid-cols-2 bg-[#FAF8F5]">
      {/* Left Column: Hero Panel — Royal Blue & Crimson Gradient */}
      <div className="hidden lg:flex flex-col justify-center items-center relative overflow-hidden bg-gradient-to-b from-[#14309c] via-[#1c37ae] to-[#0f2478] p-12 text-white text-center">
        {/* Soft Background Orbs */}
        <div className="absolute -left-20 -top-20 h-80 w-80 rounded-full bg-amber-500/10 blur-3xl" />
        <div className="absolute -right-20 -bottom-20 h-80 w-80 rounded-full bg-red-500/10 blur-3xl" />

        <div className="relative z-10 space-y-6 max-w-md flex flex-col items-center w-full">
          {/* Uploaded Logo or Loading Skeleton */}
          {isLoading ? (
            <div className="h-28 w-28 rounded-full border-4 border-[#FFC72C]/40 bg-white/10 animate-pulse shadow-2xl" />
          ) : logoSrc ? (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img
              src={logoSrc}
              alt={settings?.church_name || 'Church Logo'}
              className="h-28 w-28 rounded-full border-4 border-[#FFC72C] bg-white object-contain p-1.5 shadow-2xl transition-transform hover:scale-105"
            />
          ) : (
            <div className="flex h-24 w-24 items-center justify-center rounded-full border-4 border-[#FFC72C] bg-white text-[#14309c] shadow-2xl">
              <Cross className="h-12 w-12 text-[#14309c]" strokeWidth={2.5} />
            </div>
          )}

          {/* Church Name & System Subtitle */}
          <div className="space-y-1 w-full flex flex-col items-center">
            {isLoading ? (
              <div className="h-9 w-64 rounded-lg bg-white/15 animate-pulse my-1" />
            ) : settings?.church_name ? (
              <h1 className="font-serif text-3xl font-extrabold leading-tight tracking-tight text-white sm:text-4xl">
                {settings.church_name}
              </h1>
            ) : null}
            <p className="text-xs font-mono font-extrabold uppercase tracking-widest text-[#FFC72C]">
              MANAGEMENT SYSTEM
            </p>
          </div>

          <div className="h-0.5 w-12 bg-[#FFC72C] rounded-full mx-auto" />

          {isLoading ? (
            <div className="space-y-2 w-full max-w-sm flex flex-col items-center">
              <div className="h-3 w-5/6 rounded bg-white/10 animate-pulse" />
              <div className="h-3 w-4/6 rounded bg-white/10 animate-pulse" />
            </div>
          ) : settings?.tagline ? (
            <p className="text-xs text-slate-300 leading-relaxed max-w-sm">
              {settings.tagline}
            </p>
          ) : null}
        </div>
      </div>

      {/* Right Column: Clean Form Panel — Soft Cream #FAF8F5 */}
      <div className="flex flex-col justify-center items-center px-6 py-12 lg:px-16 bg-[#FAF8F5] min-h-screen">
        <div className="w-full max-w-md space-y-8">
          {/* Mobile Logo Header (Visible on small screens) */}
          <div className="flex flex-col items-center text-center space-y-2 lg:hidden">
            {isLoading ? (
              <>
                <div className="h-16 w-16 rounded-full border-2 border-[#FFC72C]/40 bg-slate-200 animate-pulse" />
                <div className="h-6 w-48 rounded bg-slate-200 animate-pulse" />
              </>
            ) : (
              <>
                {logoSrc ? (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img
                    src={logoSrc}
                    alt={settings?.church_name || 'Church Logo'}
                    className="h-16 w-16 rounded-full border-2 border-[#FFC72C] bg-white object-contain p-1 shadow-md"
                  />
                ) : (
                  <div className="flex h-14 w-14 items-center justify-center rounded-full border-2 border-[#FFC72C] bg-white text-[#14309c] shadow-md">
                    <Cross className="h-7 w-7 text-[#14309c]" strokeWidth={2.5} />
                  </div>
                )}
                <div>
                  <h2 className="font-serif text-xl font-bold text-slate-900">
                    {settings?.church_name || 'Church Portal'}
                  </h2>
                  <p className="text-xs font-mono font-bold uppercase tracking-wider text-[#FFC72C]">
                    MANAGEMENT SYSTEM
                  </p>
                </div>
              </>
            )}
          </div>

          {/* Welcome Heading */}
          <div className="text-center lg:text-left space-y-1">
            <h2 className="font-serif text-3xl font-extrabold tracking-tight text-slate-900">
              Welcome Back
            </h2>
            <p className="text-xs text-slate-500">Sign in to your account to continue</p>
          </div>

          {/* Login Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
            {/* Email Field */}
            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-[10px] font-extrabold tracking-wider uppercase text-slate-600">
                EMAIL ADDRESS
              </Label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  autoComplete="email"
                  aria-invalid={!!errors.email}
                  className="pl-10 h-11 rounded-xl border-slate-200 bg-white text-sm text-slate-900 placeholder:text-slate-400 ring-offset-white focus-visible:ring-[#14309c] shadow-sm"
                  {...register('email')}
                />
              </div>
              {errors.email && <p className="text-xs text-destructive font-medium">{errors.email.message}</p>}
            </div>

            {/* Password Field */}
            <div className="space-y-1.5">
              <Label htmlFor="password" className="text-[10px] font-extrabold tracking-wider uppercase text-slate-600">
                PASSWORD
              </Label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  autoComplete="current-password"
                  aria-invalid={!!errors.password}
                  className="pl-10 h-11 rounded-xl border-slate-200 bg-white text-sm text-slate-900 placeholder:text-slate-400 ring-offset-white focus-visible:ring-[#14309c] shadow-sm"
                  {...register('password')}
                />
              </div>
              {errors.password && <p className="text-xs text-destructive font-medium">{errors.password.message}</p>}
            </div>

            {/* Server Error Alert */}
            {serverError && (
              <p role="alert" className="rounded-xl bg-rose-50 border border-rose-200 p-3 text-xs font-semibold text-rose-600">
                {serverError}
              </p>
            )}

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full h-11 rounded-xl bg-[#14309c] hover:bg-[#1c37ae] text-white font-extrabold text-sm transition-all shadow-md"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin text-[#FFC72C]" /> Signing in…
                </>
              ) : (
                <>
                  <LogIn className="mr-2 h-4 w-4 text-[#FFC72C]" /> Sign In
                </>
              )}
            </Button>
          </form>

          {/* Footer Actions */}
          <div className="space-y-4 pt-2 text-center">
            <p className="text-xs text-slate-500">
              Forgot your password? Contact your administrator for password resets.
            </p>

            <div className="border-t border-slate-200/80 pt-4">
              <Link
                href="/"
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors"
              >
                <ArrowLeft className="h-3.5 w-3.5" /> Back to Website
              </Link>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
