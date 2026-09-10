'use client';

import { use, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useForm, Controller } from 'react-hook-form';
import { ArrowLeft, Loader2, Save, Trash2 } from 'lucide-react';
import { fetchEvent, updateEvent, deleteEvent, type EventInput } from '@/lib/api/events';
import { fetchMinistries } from '@/lib/api/ministries';
import { ApiError } from '@/lib/api-client';
import { useAuth } from '@/lib/auth-context';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface FormValues {
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  startTime: string;
  endTime: string;
  location: string;
  organizer: string;
  bannerImageUrl: string;
  ministryId: string;
  isRegistrationRequired: boolean;
  registrationLimit: string;
  contactPhone: string;
  contactEmail: string;
  isPublished: boolean;
}

function toDateInput(value: string | null) {
  return value ? value.slice(0, 10) : '';
}

export default function EventDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const { hasPermission } = useAuth();
  const queryClient = useQueryClient();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const eventQuery = useQuery({ queryKey: ['events-admin', id], queryFn: () => fetchEvent(id) });
  const ministriesQuery = useQuery({ queryKey: ['ministries'], queryFn: fetchMinistries });

  const { register, control, handleSubmit, reset } = useForm<FormValues>();

  useEffect(() => {
    if (eventQuery.data) {
      const e = eventQuery.data;
      reset({
        title: e.title,
        description: e.description ?? '',
        startDate: toDateInput(e.startDate),
        endDate: toDateInput(e.endDate),
        startTime: e.startTime ?? '',
        endTime: e.endTime ?? '',
        location: e.location ?? '',
        organizer: e.organizer ?? '',
        bannerImageUrl: e.bannerImageUrl ?? '',
        ministryId: e.ministryId ?? '',
        isRegistrationRequired: e.isRegistrationRequired,
        registrationLimit: e.registrationLimit?.toString() ?? '',
        contactPhone: e.contactPhone ?? '',
        contactEmail: e.contactEmail ?? '',
        isPublished: e.isPublished,
      });
    }
  }, [eventQuery.data, reset]);

  const updateMutation = useMutation({
    mutationFn: (values: FormValues) => {
      const input: Partial<EventInput> = {
        title: values.title,
        description: values.description || undefined,
        startDate: values.startDate,
        endDate: values.endDate || undefined,
        startTime: values.startTime || undefined,
        endTime: values.endTime || undefined,
        location: values.location || undefined,
        organizer: values.organizer || undefined,
        bannerImageUrl: values.bannerImageUrl || undefined,
        ministryId: values.ministryId || undefined,
        isRegistrationRequired: values.isRegistrationRequired,
        registrationLimit: values.registrationLimit ? Number(values.registrationLimit) : undefined,
        contactPhone: values.contactPhone || undefined,
        contactEmail: values.contactEmail || undefined,
        isPublished: values.isPublished,
      };
      return updateEvent(id, input);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events-admin'] });
      setSuccess(true);
      setError(null);
      setTimeout(() => setSuccess(false), 3000);
    },
    onError: (e) => setError(e instanceof ApiError ? e.message : 'Failed to save event'),
  });

  const deleteMutation = useMutation({
    mutationFn: () => deleteEvent(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events-admin'] });
      router.push('/admin/events');
    },
  });

  const canUpdate = hasPermission('event.update');
  const canDelete = hasPermission('event.delete');

  if (eventQuery.isLoading) {
    return (
      <div className="flex items-center justify-center py-24 text-muted-foreground">
        <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Loading event…
      </div>
    );
  }

  if (eventQuery.isError || !eventQuery.data) {
    return <p className="py-8 text-center text-sm text-destructive">Event not found.</p>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <Button variant="ghost" size="sm" asChild className="-ml-3 mb-2">
            <Link href="/admin/events">
              <ArrowLeft className="h-4 w-4" />
              Back to events
            </Link>
          </Button>
          <h1 className="text-2xl font-semibold tracking-tight">{eventQuery.data.title}</h1>
        </div>
        {canDelete && (
          <Button variant="outline" onClick={() => deleteMutation.mutate()} disabled={deleteMutation.isPending}>
            <Trash2 className="h-4 w-4" />
            Delete
          </Button>
        )}
      </div>

      <form
        onSubmit={handleSubmit((values) => {
          setError(null);
          updateMutation.mutate(values);
        })}
        className="space-y-6"
      >
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Event details</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="title">Title</Label>
              <Input id="title" disabled={!canUpdate} {...register('title')} />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="description">Description</Label>
              <Textarea id="description" rows={4} disabled={!canUpdate} {...register('description')} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="startDate">Start date</Label>
              <Input id="startDate" type="date" disabled={!canUpdate} {...register('startDate')} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="endDate">End date</Label>
              <Input id="endDate" type="date" disabled={!canUpdate} {...register('endDate')} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="startTime">Start time</Label>
              <Input id="startTime" placeholder="09:00" disabled={!canUpdate} {...register('startTime')} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="endTime">End time</Label>
              <Input id="endTime" placeholder="12:00" disabled={!canUpdate} {...register('endTime')} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              <Input id="location" disabled={!canUpdate} {...register('location')} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="organizer">Organizer</Label>
              <Input id="organizer" disabled={!canUpdate} {...register('organizer')} />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="ministryId">Ministry (optional)</Label>
              <Controller
                control={control}
                name="ministryId"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange} disabled={!canUpdate}>
                    <SelectTrigger id="ministryId">
                      <SelectValue placeholder="None" />
                    </SelectTrigger>
                    <SelectContent>
                      {ministriesQuery.data?.map((m) => (
                        <SelectItem key={m.id} value={m.id}>
                          {m.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="bannerImageUrl">Banner image URL</Label>
              <Input id="bannerImageUrl" disabled={!canUpdate} {...register('bannerImageUrl')} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Registration & contact</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <label className="flex items-center gap-2 text-sm sm:col-span-2">
              <input type="checkbox" disabled={!canUpdate} className="h-4 w-4 rounded border-input" {...register('isRegistrationRequired')} />
              Registration required
            </label>
            <div className="space-y-2">
              <Label htmlFor="registrationLimit">Registration limit</Label>
              <Input id="registrationLimit" type="number" min="0" disabled={!canUpdate} {...register('registrationLimit')} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="contactPhone">Contact phone</Label>
              <Input id="contactPhone" disabled={!canUpdate} {...register('contactPhone')} />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="contactEmail">Contact email</Label>
              <Input id="contactEmail" type="email" disabled={!canUpdate} {...register('contactEmail')} />
            </div>
            <label className="flex items-center gap-2 text-sm sm:col-span-2">
              <input type="checkbox" disabled={!canUpdate} className="h-4 w-4 rounded border-input" {...register('isPublished')} />
              Published (visible on the public website)
            </label>
          </CardContent>
        </Card>

        {canUpdate && (
          <div className="flex items-center gap-3">
            <Button type="submit" disabled={updateMutation.isPending}>
              <Save className="h-4 w-4" />
              {updateMutation.isPending ? 'Saving…' : 'Save changes'}
            </Button>
            {success && <p className="text-sm text-green-700 dark:text-green-400">Saved.</p>}
            {error && <p className="text-sm text-destructive">{error}</p>}
          </div>
        )}
      </form>
    </div>
  );
}
