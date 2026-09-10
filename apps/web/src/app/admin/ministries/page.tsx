'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Link from 'next/link';
import { HandHeart, Plus, Users, Search, Loader2, MapPin, Calendar, Pencil, Trash2 } from 'lucide-react';
import { fetchMinistries, createMinistry, updateMinistry, deleteMinistry, type MinistryListItem } from '@/lib/api/ministries';
import { ApiError } from '@/lib/api-client';
import { useAuth } from '@/lib/auth-context';
import { useToast } from '@/lib/toast-context';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetBody,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';

const createMinistrySchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  description: z.string().optional(),
  meetingSchedule: z.string().optional(),
  meetingVenue: z.string().optional(),
  contactPhone: z.string().optional(),
  contactEmail: z.string().email('Invalid email').or(z.literal('')).optional(),
});

type CreateMinistryValues = z.infer<typeof createMinistrySchema>;

export default function MinistriesPage() {
  const { hasPermission } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [open, setOpen] = useState(false);
  const [editingMinistry, setEditingMinistry] = useState<MinistryListItem | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  const canUpdate = hasPermission('ministry.update');
  const canDelete = hasPermission('ministry.delete');

  const { data: ministries = [], isLoading } = useQuery({
    queryKey: ['ministries'],
    queryFn: fetchMinistries,
  });

  const { register, handleSubmit, reset, formState: { errors } } = useForm<CreateMinistryValues>({
    resolver: zodResolver(createMinistrySchema),
  });

  const editForm = useForm<CreateMinistryValues>({
    resolver: zodResolver(createMinistrySchema),
  });

  const createMutation = useMutation({
    mutationFn: createMinistry,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ministries'] });
      setOpen(false);
      reset();
      setFormError(null);
      toast.success('Ministry created!');
    },
    onError: (err) => {
      const message = err instanceof ApiError ? err.message : 'Failed to create ministry';
      setFormError(message);
      toast.error('Failed to create ministry', message);
    },
  });

  const updateMutation = useMutation({
    mutationFn: (values: CreateMinistryValues) => updateMinistry(editingMinistry!.id, values),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ministries'] });
      setEditingMinistry(null);
      editForm.reset();
      setFormError(null);
      toast.success('Ministry updated!');
    },
    onError: (err) => {
      const message = err instanceof ApiError ? err.message : 'Failed to update ministry';
      setFormError(message);
      toast.error('Failed to update ministry', message);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteMinistry,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ministries'] });
      toast.success('Ministry deleted');
    },
    onError: (err) => {
      toast.error('Failed to delete ministry', err instanceof ApiError ? err.message : undefined);
    },
  });

  const openEdit = (m: MinistryListItem) => {
    setFormError(null);
    setEditingMinistry(m);
    editForm.reset({
      name: m.name,
      description: m.description ?? '',
      meetingSchedule: m.meetingSchedule ?? '',
      meetingVenue: m.meetingVenue ?? '',
      contactPhone: m.contactPhone ?? '',
      contactEmail: m.contactEmail ?? '',
    });
  };

  const filtered = ministries.filter((m) =>
    m.name.toLowerCase().includes(search.toLowerCase()) ||
    (m.description && m.description.toLowerCase().includes(search.toLowerCase())),
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <HandHeart className="h-6 w-6 text-primary" />
            Church Ministries
          </h1>
          <p className="text-sm text-muted-foreground">
            Manage church ministries, leadership assignments, meeting schedules, and member rosters.
          </p>
        </div>

        {hasPermission('ministry.create') && (
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button className="gap-2">
                <Plus className="h-4 w-4" /> Add Ministry
              </Button>
            </SheetTrigger>
            <SheetContent className="sm:max-w-[500px]">
              <form onSubmit={handleSubmit((values) => createMutation.mutate(values))} className="flex h-full flex-col">
                <SheetHeader>
                  <SheetTitle>Add New Ministry</SheetTitle>
                  <SheetDescription>
                    Create a new ministry or service unit in the church.
                  </SheetDescription>
                </SheetHeader>

                <SheetBody className="space-y-4">
                  {formError && (
                    <div className="rounded-md bg-destructive/15 p-3 text-sm text-destructive">
                      {formError}
                    </div>
                  )}

                  <div className="space-y-2">
                    <Label htmlFor="name">Ministry Name *</Label>
                    <Input id="name" placeholder="e.g. Men's Fellowship" {...register('name')} />
                    {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Input id="description" placeholder="Brief overview of purpose and vision" {...register('description')} />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="meetingSchedule">Meeting Schedule</Label>
                      <Input id="meetingSchedule" placeholder="e.g. Sundays @ 4:00 PM" {...register('meetingSchedule')} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="meetingVenue">Meeting Venue</Label>
                      <Input id="meetingVenue" placeholder="e.g. Lower Chapel" {...register('meetingVenue')} />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="contactPhone">Contact Phone</Label>
                      <Input id="contactPhone" placeholder="024XXXXXXX" {...register('contactPhone')} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="contactEmail">Contact Email</Label>
                      <Input id="contactEmail" placeholder="ministry@church.org" {...register('contactEmail')} />
                      {errors.contactEmail && <p className="text-xs text-destructive">{errors.contactEmail.message}</p>}
                    </div>
                  </div>
                </SheetBody>

                <SheetFooter>
                  <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={createMutation.isPending}>
                    {createMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Save Ministry
                  </Button>
                </SheetFooter>
              </form>
            </SheetContent>
          </Sheet>
        )}
      </div>

      <div className="flex items-center gap-2 max-w-sm">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search ministries..."
            className="pl-8"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {isLoading ? (
        <div className="flex h-48 items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex h-48 flex-col items-center justify-center text-center">
          <HandHeart className="h-10 w-10 text-muted-foreground/50 mb-2" />
          <p className="font-medium text-foreground">No ministries found</p>
          <p className="text-sm text-muted-foreground">Add a new ministry to begin managing rosters.</p>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((m) => (
            <Card key={m.id} className="flex flex-col justify-between hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg">{m.name}</CardTitle>
                    {m.description && (
                      <CardDescription className="line-clamp-2 mt-1">{m.description}</CardDescription>
                    )}
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Badge variant={m.isActive ? 'default' : 'secondary'}>
                      {m.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                    {canUpdate && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7"
                        title="Edit ministry"
                        onClick={() => openEdit(m)}
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                    )}
                    {canDelete && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-destructive hover:text-destructive"
                        title="Delete ministry"
                        onClick={() => {
                          if (confirm(`Are you sure you want to delete ${m.name}?`)) {
                            deleteMutation.mutate(m.id);
                          }
                        }}
                        disabled={deleteMutation.isPending}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    )}
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-3 text-sm flex-1">
                {m.leaderMember && (
                  <div className="text-xs text-muted-foreground">
                    <span className="font-medium text-foreground">Leader: </span>
                    {m.leaderMember.firstName} {m.leaderMember.lastName}
                  </div>
                )}

                {m.meetingSchedule && (
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Calendar className="h-3.5 w-3.5 text-primary shrink-0" />
                    <span>{m.meetingSchedule}</span>
                  </div>
                )}

                {m.meetingVenue && (
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <MapPin className="h-3.5 w-3.5 text-primary shrink-0" />
                    <span>{m.meetingVenue}</span>
                  </div>
                )}

                <div className="flex items-center justify-between border-t border-border pt-3 text-xs">
                  <span className="flex items-center gap-1 text-muted-foreground">
                    <Users className="h-3.5 w-3.5" />
                    {m._count?.members ?? 0} Members
                  </span>
                  <Link
                    href={`/admin/ministries/${m.id}`}
                    className="font-medium text-primary hover:underline"
                  >
                    View Roster &rarr;
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Edit Ministry Sheet */}
      <Sheet open={!!editingMinistry} onOpenChange={(o: boolean) => !o && setEditingMinistry(null)}>
        <SheetContent className="sm:max-w-[500px]">
          <form onSubmit={editForm.handleSubmit((values) => updateMutation.mutate(values))} className="flex h-full flex-col">
            <SheetHeader>
              <SheetTitle>Edit Ministry</SheetTitle>
              <SheetDescription>
                Update details for {editingMinistry?.name}.
              </SheetDescription>
            </SheetHeader>

            <SheetBody className="space-y-4">
              {formError && (
                <div className="rounded-md bg-destructive/15 p-3 text-sm text-destructive">
                  {formError}
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="em-name">Ministry Name *</Label>
                <Input id="em-name" {...editForm.register('name')} />
                {editForm.formState.errors.name && <p className="text-xs text-destructive">{editForm.formState.errors.name.message}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="em-description">Description</Label>
                <Input id="em-description" {...editForm.register('description')} />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="em-meetingSchedule">Meeting Schedule</Label>
                  <Input id="em-meetingSchedule" {...editForm.register('meetingSchedule')} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="em-meetingVenue">Meeting Venue</Label>
                  <Input id="em-meetingVenue" {...editForm.register('meetingVenue')} />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="em-contactPhone">Contact Phone</Label>
                  <Input id="em-contactPhone" {...editForm.register('contactPhone')} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="em-contactEmail">Contact Email</Label>
                  <Input id="em-contactEmail" {...editForm.register('contactEmail')} />
                </div>
              </div>
            </SheetBody>

            <SheetFooter>
              <Button type="button" variant="outline" onClick={() => setEditingMinistry(null)}>
                Cancel
              </Button>
              <Button type="submit" disabled={updateMutation.isPending}>
                {updateMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Save Changes
              </Button>
            </SheetFooter>
          </form>
        </SheetContent>
      </Sheet>
    </div>
  );
}
