'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { fetchProgrammeTypes, createSession } from '@/lib/api/attendance';
import { ApiError } from '@/lib/api-client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const schema = z.object({
  programmeTypeId: z.string().min(1, 'Select a programme'),
  sessionDate: z.string().min(1, 'Date is required'),
  name: z.string().optional(),
  location: z.string().optional(),
});
type FormValues = z.infer<typeof schema>;

export default function NewAttendanceSessionPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const programmeTypesQuery = useQuery({ queryKey: ['programme-types'], queryFn: fetchProgrammeTypes });

  const { register, control, handleSubmit, formState } = useForm<FormValues>({ resolver: zodResolver(schema) });

  const createMutation = useMutation({
    mutationFn: createSession,
    onSuccess: (session) => router.push(`/admin/attendance/${session.id}`),
    onError: (e) => setError(e instanceof ApiError ? e.message : 'Failed to create session'),
  });

  return (
    <div className="mx-auto max-w-lg space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Take attendance</h1>
        <p className="text-muted-foreground">Start a new session, then check members in on the next screen.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Session details</CardTitle>
          <CardDescription>Who was present is recorded on the next screen.</CardDescription>
        </CardHeader>
        <CardContent>
          <form
            onSubmit={handleSubmit((values) => {
              setError(null);
              createMutation.mutate(values);
            })}
            className="space-y-4"
            noValidate
          >
            <div className="space-y-2">
              <Label htmlFor="programmeTypeId">Programme</Label>
              <Controller
                control={control}
                name="programmeTypeId"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger id="programmeTypeId">
                      <SelectValue placeholder="Select a programme" />
                    </SelectTrigger>
                    <SelectContent>
                      {programmeTypesQuery.data?.map((t) => (
                        <SelectItem key={t.id} value={t.id}>
                          {t.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {formState.errors.programmeTypeId && (
                <p className="text-sm text-destructive">{formState.errors.programmeTypeId.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="sessionDate">Date</Label>
              <Input id="sessionDate" type="date" {...register('sessionDate')} />
              {formState.errors.sessionDate && (
                <p className="text-sm text-destructive">{formState.errors.sessionDate.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="name">Label (optional)</Label>
              <Input id="name" placeholder="e.g. Christmas Carol Service" {...register('name')} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="location">Location (optional)</Label>
              <Input id="location" placeholder="Main Auditorium" {...register('location')} />
            </div>

            {error && (
              <p role="alert" className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
                {error}
              </p>
            )}

            <Button type="submit" className="w-full" disabled={createMutation.isPending}>
              {createMutation.isPending ? 'Starting…' : 'Start session'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
