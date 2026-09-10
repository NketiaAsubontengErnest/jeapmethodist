'use client';

import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { useAuth } from '@/lib/auth-context';
import { useToast } from '@/lib/toast-context';
import { updateUserProfile, changeUserPassword } from '@/lib/api/users';
import { ApiError } from '@/lib/api-client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { User, Shield, KeyRound, Save, Loader2, CheckCircle2, Lock } from 'lucide-react';

interface ProfileFormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
}

interface PasswordFormData {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export default function ProfilePage() {
  const { user } = useAuth();
  const { toast } = useToast();

  const [profileSuccess, setProfileSuccess] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState(false);

  const {
    register: registerProfile,
    handleSubmit: handleProfileSubmit,
    formState: { isSubmitting: isSubmittingProfile },
  } = useForm<ProfileFormData>({
    defaultValues: {
      firstName: user?.firstName || '',
      lastName: user?.lastName || '',
      email: user?.email || '',
      phone: '',
    },
  });

  const {
    register: registerPassword,
    handleSubmit: handlePasswordSubmit,
    reset: resetPasswordForm,
    formState: { isSubmitting: isSubmittingPassword },
  } = useForm<PasswordFormData>();

  const profileMutation = useMutation({
    mutationFn: updateUserProfile,
    onSuccess: (data) => {
      setProfileSuccess(true);
      toast.success('Profile Updated', 'Your personal details have been saved successfully.');
      setTimeout(() => setProfileSuccess(false), 4000);
    },
    onError: (err) => {
      const msg = err instanceof ApiError ? err.message : 'Failed to update profile details.';
      toast.error('Profile Update Failed', msg);
    },
  });

  const passwordMutation = useMutation({
    mutationFn: changeUserPassword,
    onSuccess: () => {
      setPasswordSuccess(true);
      resetPasswordForm();
      toast.success('Password Changed', 'Your account password has been updated securely.');
      setTimeout(() => setPasswordSuccess(false), 4000);
    },
    onError: (err) => {
      const msg = err instanceof ApiError ? err.message : 'Failed to change password. Check your current password.';
      toast.error('Password Change Failed', msg);
    },
  });

  if (!user) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Top Profile Header Card */}
      <div className="relative overflow-hidden rounded-3xl bg-[#14309c] p-8 text-white shadow-2xl border border-blue-800">
        <div className="absolute right-0 top-0 -mr-16 -mt-16 h-64 w-64 rounded-full bg-amber-500/10 blur-3xl" />
        <div className="relative z-10 flex flex-col sm:flex-row items-center gap-6 text-center sm:text-left">
          <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full border-2 border-amber-500 bg-amber-500/20 text-3xl font-serif font-extrabold text-amber-400 shadow-xl">
            {user.firstName[0]}
            {user.lastName[0]}
          </div>

          <div className="space-y-1.5 flex-1 min-w-0">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
              <h1 className="font-serif text-3xl font-bold tracking-tight text-white">
                {user.firstName} {user.lastName}
              </h1>
              <Badge className="bg-amber-500 text-slate-950 font-bold text-xs">
                {user.role?.replace('_', ' ') || 'User'}
              </Badge>
            </div>
            <p className="text-sm text-slate-300 font-mono truncate">{user.email}</p>
            <p className="text-xs text-slate-400 flex items-center justify-center sm:justify-start gap-1">
              <Shield className="h-3.5 w-3.5 text-amber-400" /> Account ID: {user.id.slice(0, 18)}…
            </p>
          </div>
        </div>
      </div>

      <div className="grid gap-8 md:grid-cols-2">
        {/* Card 1: Account Information (Read-only Name & Email) */}
        <Card className="shadow-lg border-slate-200 dark:border-slate-800">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg font-serif">
              <User className="h-5 w-5 text-amber-500" /> Account Information
            </CardTitle>
            <CardDescription>
              Your official account credentials. Name and email are managed by your System Administrator.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form
              onSubmit={handleProfileSubmit((data) => {
                profileMutation.mutate({ phone: data.phone });
              })}
              className="space-y-4"
            >
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName" className="flex items-center gap-1.5">
                    First Name <Lock className="h-3 w-3 text-muted-foreground" />
                  </Label>
                  <Input
                    id="firstName"
                    value={user.firstName}
                    disabled
                    readOnly
                    className="bg-muted/50 cursor-not-allowed font-medium text-foreground"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName" className="flex items-center gap-1.5">
                    Last Name <Lock className="h-3 w-3 text-muted-foreground" />
                  </Label>
                  <Input
                    id="lastName"
                    value={user.lastName}
                    disabled
                    readOnly
                    className="bg-muted/50 cursor-not-allowed font-medium text-foreground"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="flex items-center gap-1.5">
                  Email Address <Lock className="h-3 w-3 text-muted-foreground" />
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={user.email}
                  disabled
                  readOnly
                  className="bg-muted/50 cursor-not-allowed font-mono text-xs text-foreground"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input id="phone" placeholder="+233 24 123 4567" {...registerProfile('phone')} />
              </div>

              <div className="rounded-xl border border-amber-500/20 bg-amber-50/50 p-3 text-xs text-amber-900 dark:bg-amber-950/20 dark:text-amber-300 flex items-center gap-2">
                <Lock className="h-4 w-4 text-amber-600 shrink-0" />
                <span>Name and email changes must be requested through your System Administrator.</span>
              </div>

              {profileSuccess && (
                <div className="flex items-center gap-2 rounded-lg bg-emerald-50 text-emerald-700 p-3 text-xs font-semibold dark:bg-emerald-950/40 dark:text-emerald-400">
                  <CheckCircle2 className="h-4 w-4 shrink-0" />
                  Contact details updated successfully!
                </div>
              )}

              <Button
                type="submit"
                disabled={profileMutation.isPending || isSubmittingProfile}
                className="w-full bg-[#14309c] hover:bg-[#1c37ae] text-white font-bold"
              >
                {profileMutation.isPending ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Save className="mr-2 h-4 w-4" />
                )}
                Save Contact Details
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Card 2: Security & Password */}
        <Card className="shadow-lg border-slate-200 dark:border-slate-800">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg font-serif">
              <KeyRound className="h-5 w-5 text-amber-500" /> Security &amp; Password
            </CardTitle>
            <CardDescription>Change your account password for security compliance.</CardDescription>
          </CardHeader>
          <CardContent>
            <form
              onSubmit={handlePasswordSubmit((data) => {
                if (data.newPassword !== data.confirmPassword) {
                  toast.error('Password Mismatch', 'New password and confirm password do not match.');
                  return;
                }
                passwordMutation.mutate({
                  currentPassword: data.currentPassword,
                  newPassword: data.newPassword,
                });
              })}
              className="space-y-4"
            >
              <div className="space-y-2">
                <Label htmlFor="currentPassword">Current Password</Label>
                <Input
                  id="currentPassword"
                  type="password"
                  placeholder="••••••••"
                  {...registerPassword('currentPassword', { required: true })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="newPassword">New Password (min. 8 characters)</Label>
                <Input
                  id="newPassword"
                  type="password"
                  placeholder="••••••••"
                  {...registerPassword('newPassword', { required: true, minLength: 8 })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm New Password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="••••••••"
                  {...registerPassword('confirmPassword', { required: true })}
                />
              </div>

              {passwordSuccess && (
                <div className="flex items-center gap-2 rounded-lg bg-emerald-50 text-emerald-700 p-3 text-xs font-semibold dark:bg-emerald-950/40 dark:text-emerald-400">
                  <CheckCircle2 className="h-4 w-4 shrink-0" />
                  Your password has been changed successfully!
                </div>
              )}

              <Button
                type="submit"
                disabled={passwordMutation.isPending || isSubmittingPassword}
                variant="outline"
                className="w-full border-[#14309c] text-[#14309c] hover:bg-[#14309c] hover:text-white font-bold dark:border-white dark:text-white"
              >
                {passwordMutation.isPending ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Lock className="mr-2 h-4 w-4" />
                )}
                Update Password
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
